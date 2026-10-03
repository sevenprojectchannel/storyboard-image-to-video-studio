/**
 * Centralized Gemini API Service for STORYBOARD IMAGE TO VIDEO STUDIO
 * Architecture: Bring Your Own Key (BYOK)
 * Security: Keys are stored exclusively on client-side storage, never exposed or logged.
 */

export interface GeminiConfig {
  apiKey: string;
  model: string;
}

export interface StoryboardAiAnalysisResult {
  title: string;
  detectedAspect: string;
  scenes: Array<{
    scene: number;
    time: string;
    title: string;
    visual: string;
    action: string;
    camera: string;
    effects: string;
    audio: string;
    confidence: 'High' | 'Medium' | 'Needs Review';
    vectorDirection?: string;
  }>;
  continuity: {
    characters: string;
    environment: string;
    lighting: string;
    momentumFlow: string[];
    spatialRelationships: string;
  };
  transitions: Record<string, string>;
  rawResponse?: string;
}

const STORAGE_KEY = 'byok_gemini_api_key';
const STORAGE_MODEL = 'byok_gemini_model';
const DEFAULT_MODEL = 'gemini-3.8-flash';

class GeminiServiceClass {
  private apiKey: string = '';
  private model: string = DEFAULT_MODEL;

  constructor() {
    this.loadFromStorage();
  }

  public loadFromStorage(): void {
    try {
      const savedKey = localStorage.getItem(STORAGE_KEY);
      if (savedKey) {
        this.apiKey = savedKey.trim();
      }
      const savedModel = localStorage.getItem(STORAGE_MODEL);
      if (savedModel) {
        this.model = savedModel;
      }
    } catch {
      // LocalStorage might be disabled in sandboxed environments
    }
  }

  public saveConfig(apiKey: string, model?: string): void {
    this.apiKey = apiKey.trim();
    if (model) {
      this.model = model;
    }
    try {
      localStorage.setItem(STORAGE_KEY, this.apiKey);
      localStorage.setItem(STORAGE_MODEL, this.model);
    } catch {
      // Ignore storage errors
    }
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 10);
  }

  public getModel(): string {
    return this.model;
  }

  public setModel(model: string): void {
    this.model = model;
    try {
      localStorage.setItem(STORAGE_MODEL, this.model);
    } catch {
      // Ignore
    }
  }

  public clearKey(): void {
    this.apiKey = '';
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  /**
   * Test connection with Gemini API using a lightweight ping prompt
   */
  public async testConnection(customKey?: string): Promise<{ success: boolean; message: string; modelUsed: string }> {
    const keyToUse = (customKey || this.apiKey).trim();
    if (!keyToUse) {
      return {
        success: false,
        message: 'API Key belum diisi. Silakan masukkan Google Gemini API Key Anda.',
        modelUsed: this.model
      };
    }

    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${encodeURIComponent(keyToUse)}`;

    try {
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: 'Respond strictly with the word: READY' }]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errDetail = errorData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
        return {
          success: false,
          message: `Koneksi gagal: ${errDetail}`,
          modelUsed: this.model
        };
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return {
        success: true,
        message: `Terhubung dengan Google Gemini (${this.model}). Respons: ${text.trim()}`,
        modelUsed: this.model
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Gagal menghubungi server Gemini: ${err?.message || 'Network error'}`,
        modelUsed: this.model
      };
    }
  }

  /**
   * Multimodal analysis of a storyboard image
   */
  public async analyzeStoryboard(
    base64Data: string,
    mimeType: string,
    options: {
      durationSeconds: number;
      targetSceneCount: number;
      stylePreset: string;
      aspectRatio: string;
      promptMode: string;
      customInstructions?: string;
    }
  ): Promise<StoryboardAiAnalysisResult> {
    if (!this.hasApiKey()) {
      throw new Error('API Key Google Gemini belum dikonfigurasi. Buka menu API & PENGATURAN.');
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

    // Strip data URL header if present
    const cleanBase64 = base64Data.replace(/^data:[a-zA-Z0-9\/\-\.]+;base64,/, '');

    const systemPrompt = `You are a world-class cinematic storyboard analyst and AI video generation director.
Analyze the provided multi-panel or cinematic action storyboard image.

TASK:
1. Detect each panel/scene sequentially. Determine the logical narrative flow.
2. The total video duration target is ${options.durationSeconds} seconds.
3. Divide the video into ${options.targetSceneCount} distinct chronological scenes.
4. For each scene, extract:
   - "scene": integer (1 to ${options.targetSceneCount})
   - "time": exact time range string, e.g. "0-2 seconds", "2-4 seconds", etc.
   - "title": concise descriptive scene title
   - "visual": vivid physical description of subjects, costumes, poses, environment, and lighting
   - "action": precise dynamic kinetic movement occurring during this 2-second slice
   - "camera": camera movement (e.g., "dolly-in", "rapid tracking left-to-right", "low angle push", "static medium close-up")
   - "effects": visual effects, dust, spark particles, motion blur, lighting flare
   - "audio": foley, atmospheric audio, impact thuds, whooshes, musical tension
   - "confidence": "High", "Medium", or "Needs Review" (use "Needs Review" if text or panel is blurry)
   - "vectorDirection": physical direction of momentum (e.g. "linear forward charge left to right", "recoil backward")
5. Preserve character identity, costume, and spatial continuity across all scenes.
6. Provide a continuity map connecting the characters, lighting, momentum flow, and spatial positions.
7. Style guidance: "${options.stylePreset}".
8. Prompt mode: "${options.promptMode}".
${options.customInstructions ? `User custom instructions: "${options.customInstructions}".` : ''}

CRITICAL RULES:
- Output MUST be strictly valid JSON, no markdown formatting outside JSON.
- Never invent characters or locations that contradict the storyboard.
- If text is illegible, mark confidence as "Needs Review" and infer from the visual drawings.

RETURN JSON SCHEMA EXACTLY:
{
  "title": "Title of the sequence",
  "detectedAspect": "16:9",
  "scenes": [
    {
      "scene": 1,
      "time": "0-2 seconds",
      "title": "...",
      "visual": "...",
      "action": "...",
      "camera": "...",
      "effects": "...",
      "audio": "...",
      "confidence": "High",
      "vectorDirection": "..."
    }
  ],
  "continuity": {
    "characters": "...",
    "environment": "...",
    "lighting": "...",
    "momentumFlow": [
      "Scene 1 to Scene 2 momentum description",
      "Scene 2 to Scene 3 momentum description"
    ],
    "spatialRelationships": "..."
  },
  "transitions": {
    "scene_1_to_2": "...",
    "scene_2_to_3": "..."
  }
}`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: cleanBase64
              }
            },
            {
              text: systemPrompt
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 4096
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const msg = errorJson?.error?.message || `HTTP ${response.status} ${response.statusText}`;
      throw new Error(`Analisis AI gagal: ${msg}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (!candidate || !candidate.content?.parts?.[0]?.text) {
      throw new Error('Gemini API tidak mengembalikan konten visual yang valid.');
    }

    const rawText = candidate.content.parts[0].text;
    
    // Clean potential markdown backticks if returned despite json mimeType
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
    }

    try {
      const parsed: StoryboardAiAnalysisResult = JSON.parse(cleaned);
      parsed.rawResponse = rawText;
      return parsed;
    } catch (parseErr: any) {
      throw new Error(`Gagal memparsing JSON dari respons Gemini: ${parseErr.message}`);
    }
  }

  /**
   * Refine and optimize prompt using AI
   */
  public async optimizePromptWithAI(rawPrompt: string, style: string): Promise<string> {
    if (!this.hasApiKey()) {
      throw new Error('API Key belum diatur. Menggunakan optimasi heuristik lokal.');
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

    const prompt = `You are a prompt engineering expert for generative AI video models (Runway Gen-3, Sora, Luma Dream Machine, Kling, Haiper).
Optimize the following image-to-video master prompt without changing the core actions, characters, or semantic meaning.

CRITICAL RULES:
- Do NOT add new characters or unrequested objects.
- Retain the exact style (${style}).
- Emphasize temporal coherence, camera trajectory clarity, and physical weight/momentum.
- Keep the result clean, highly structured, and human readable.

ORIGINAL PROMPT:
${rawPrompt}

OUTPUT FORMAT: Return ONLY the optimized prompt text without conversational preamble.`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2500
        }
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || 'Gagal mengoptimalkan prompt via Gemini.');
    }

    const resData = await response.json();
    return resData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || rawPrompt;
  }
}

export const GeminiService = new GeminiServiceClass();
