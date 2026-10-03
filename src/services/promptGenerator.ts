import {
  ImageToVideoOutput,
  Scene,
  StudioProject,
  ContinuityMap,
  StylePresetType,
  PromptModeType,
  AspectRatioType
} from '../types/storyboard';
import { DEFAULT_GLOBAL_RULES, DEFAULT_NEGATIVE_PROMPT } from '../constants/defaults';

export class ImageToVideoPromptGenerator {
  /**
   * Generates a fully compliant Section 9 structured JSON object
   */
  public static generateStructuredJson(params: {
    title: string;
    durationSeconds: number;
    durationLabel: string;
    aspectRatio: AspectRatioType;
    style: StylePresetType;
    scenes: Scene[];
    continuity: ContinuityMap;
    transitions?: Record<string, string>;
    customNegativePrompt?: string[];
  }): ImageToVideoOutput {
    const totalDurationStr = `${params.durationSeconds} seconds`;

    // Ensure scenes have formatted timings
    const formattedScenes = params.scenes.map((s, idx) => ({
      scene: s.scene || idx + 1,
      time: s.time || `${idx * 2}-${(idx + 1) * 2} seconds`,
      title: s.title || `Scene ${idx + 1}`,
      visual: s.visual,
      action: s.action,
      camera: s.camera,
      effects: s.effects,
      audio: s.audio,
      vectorDirection: s.vectorDirection
    }));

    // Build transitions map if not present
    const transitions: Record<string, string> = params.transitions || {};
    if (Object.keys(transitions).length === 0) {
      for (let i = 0; i < formattedScenes.length - 1; i++) {
        const key = `scene_${i + 1}_to_${i + 2}`;
        transitions[key] = `Continuous kinetic momentum flow from Scene ${i + 1} (${params.scenes[i]?.vectorDirection || 'action'}) into Scene ${i + 2} (${params.scenes[i + 1]?.vectorDirection || 'reaction'}), strictly maintaining spatial positioning.`;
      }
    }

    return {
      title: params.title || 'Cinematic Storyboard Sequence',
      duration: totalDurationStr,
      aspect_ratio: params.aspectRatio === 'Auto Detect' ? '16:9' : params.aspectRatio,
      style: params.style,
      reference_instruction: {
        use_uploaded_storyboard_as_master_reference: true,
        preserve_character_identity: true,
        preserve_costume_design: true,
        preserve_hair_style: true,
        preserve_environment: true,
        preserve_lighting_and_color_palette: true,
        preserve_spatial_relationship_between_characters: true
      },
      global_motion_rules: DEFAULT_GLOBAL_RULES,
      scenes: formattedScenes,
      transitions,
      negative_prompt: params.customNegativePrompt || DEFAULT_NEGATIVE_PROMPT
    };
  }

  /**
   * Generates human-readable, comprehensive master prompt for video AI tools
   */
  public static generateHumanReadablePrompt(params: {
    title: string;
    durationSeconds: number;
    aspectRatio: AspectRatioType;
    style: StylePresetType;
    promptMode: PromptModeType;
    scenes: Scene[];
    continuity: ContinuityMap;
    customUserPrompt?: string;
  }): string {
    const aspect = params.aspectRatio === 'Auto Detect' ? '16:9' : params.aspectRatio;
    const mode = params.promptMode;

    let prompt = `==================================================\n`;
    prompt += `IMAGE-TO-VIDEO CINEMATIC MASTER DIRECTIVE\n`;
    prompt += `==================================================\n\n`;

    prompt += `[PROJECT SPECIFICATION]\n`;
    prompt += `Title: ${params.title || 'Cinematic Storyboard Sequence'}\n`;
    prompt += `Target Duration: ${params.durationSeconds} seconds (Seamless sequence)\n`;
    prompt += `Aspect Ratio: ${aspect}\n`;
    prompt += `Visual Style: ${params.style}\n`;
    prompt += `Prompt Mode: ${mode}\n`;
    prompt += `Reference Source: Uploaded master storyboard panels (100% visual fidelity locked)\n\n`;

    if (params.customUserPrompt && params.customUserPrompt.trim().length > 0) {
      prompt += `[USER CUSTOM DIRECTIVES]\n`;
      prompt += `${params.customUserPrompt.trim()}\n\n`;
    }

    prompt += `[MASTER CONTINUITY & PHYSICAL RULES]\n`;
    DEFAULT_GLOBAL_RULES.forEach((rule, idx) => {
      prompt += `${idx + 1}. ${rule}\n`;
    });
    prompt += `\n`;

    prompt += `[CONTINUITY MAP]\n`;
    prompt += `• Characters: ${params.continuity.characters}\n`;
    prompt += `• Environment: ${params.continuity.environment}\n`;
    prompt += `• Lighting: ${params.continuity.lighting}\n`;
    prompt += `• Spatial Consistency: ${params.continuity.spatialRelationships}\n\n`;

    prompt += `==================================================\n`;
    prompt += `SCENE-BY-SCENE ACTION BREAKDOWN (${params.scenes.length} Consecutive Scenes)\n`;
    prompt += `==================================================\n\n`;

    params.scenes.forEach((sc, idx) => {
      prompt += `--- SCENE ${sc.scene || idx + 1} (${sc.time}) : ${sc.title.toUpperCase()} ---\n`;
      prompt += `VISUAL: ${sc.visual}\n`;
      prompt += `ACTION: ${sc.action}\n`;
      prompt += `CAMERA: ${sc.camera}\n`;
      prompt += `EFFECTS: ${sc.effects}\n`;
      prompt += `AUDIO / SOUND DESIGN: ${sc.audio}\n`;
      if (sc.vectorDirection) {
        prompt += `MOMENTUM VECTOR: ${sc.vectorDirection}\n`;
      }
      prompt += `\n`;
    });

    prompt += `==================================================\n`;
    prompt += `INTER-SCENE TRANSITIONS & MOMENTUM FLOW\n`;
    prompt += `==================================================\n`;
    for (let i = 0; i < params.scenes.length - 1; i++) {
      const cur = params.scenes[i];
      const nxt = params.scenes[i + 1];
      prompt += `Scene ${cur.scene} -> Scene ${nxt.scene}: Continuous kinetic momentum transfer without cut jumps. Camera trajectory maintains momentum.\n`;
    }
    prompt += `\n`;

    prompt += `==================================================\n`;
    prompt += `NEGATIVE PROMPT (MANDATORY EXCLUSIONS)\n`;
    prompt += `==================================================\n`;
    prompt += DEFAULT_NEGATIVE_PROMPT.join(', ') + `\n`;

    return prompt;
  }
}
