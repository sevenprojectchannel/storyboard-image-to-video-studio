import { ImageToVideoOutput, ValidationIssue, ValidationResult, Scene } from '../types/storyboard';
import { DEFAULT_GLOBAL_RULES, DEFAULT_NEGATIVE_PROMPT } from '../constants/defaults';

export class JsonValidator {
  /**
   * Validate raw JSON string and structural schema compliance
   */
  public static validate(rawJson: string): ValidationResult {
    const issues: ValidationIssue[] = [];
    let parsed: any = null;

    // 1. Syntax check
    try {
      parsed = JSON.parse(rawJson);
    } catch (syntaxErr: any) {
      // Attempt syntax auto-clean (e.g. trailing commas or unmatched brackets)
      const cleaned = this.attemptSyntaxFix(rawJson);
      try {
        parsed = JSON.parse(cleaned);
        issues.push({
          field: 'syntax',
          message: `JSON memiliki syntax error ringan: ${syntaxErr.message}. Dapat diperbaiki secara otomatis.`,
          severity: 'warning'
        });
      } catch (cleanErr: any) {
        return {
          isValid: false,
          issues: [
            {
              field: 'syntax',
              message: `Syntax JSON tidak valid: ${syntaxErr.message}`,
              severity: 'error'
            }
          ]
        };
      }
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {
        isValid: false,
        issues: [{ field: 'root', message: 'Root JSON harus berupa object.', severity: 'error' }]
      };
    }

    // 2. Check title
    if (!parsed.title || typeof parsed.title !== 'string') {
      issues.push({ field: 'title', message: 'Field "title" wajib ada dan berupa string.', severity: 'error' });
    }

    // 3. Check duration
    if (!parsed.duration || typeof parsed.duration !== 'string') {
      issues.push({ field: 'duration', message: 'Field "duration" wajib ada (contoh: "10 seconds").', severity: 'error' });
    }

    // 4. Check aspect_ratio
    const validAspects = ['16:9', '9:16', '1:1', '4:3', '3:4', '3:2', '2:3'];
    if (!parsed.aspect_ratio || typeof parsed.aspect_ratio !== 'string') {
      issues.push({ field: 'aspect_ratio', message: 'Field "aspect_ratio" wajib ada.', severity: 'error' });
    } else if (!validAspects.includes(parsed.aspect_ratio) && !parsed.aspect_ratio.includes(':')) {
      issues.push({ field: 'aspect_ratio', message: `Format aspect ratio tidak lazim: "${parsed.aspect_ratio}".`, severity: 'warning' });
    }

    // 5. Check scenes array
    if (!Array.isArray(parsed.scenes)) {
      issues.push({ field: 'scenes', message: 'Field "scenes" harus berupa array.', severity: 'error' });
    } else if (parsed.scenes.length === 0) {
      issues.push({ field: 'scenes', message: 'Array "scenes" tidak boleh kosong.', severity: 'error' });
    } else {
      const sceneNumbers = new Set<number>();

      parsed.scenes.forEach((sc: any, index: number) => {
        const expectedNum = index + 1;
        
        // Scene number check
        if (typeof sc.scene !== 'number') {
          issues.push({ field: `scenes[${index}].scene`, message: `Nomor scene harus berupa angka (ditemukan: ${sc.scene}).`, severity: 'error' });
        } else {
          if (sceneNumbers.has(sc.scene)) {
            issues.push({ field: `scenes[${index}].scene`, message: `Duplikat nomor scene ditemukan: Scene ${sc.scene}.`, severity: 'error' });
          }
          sceneNumbers.add(sc.scene);

          if (sc.scene !== expectedNum) {
            issues.push({ field: `scenes[${index}].scene`, message: `Urutan scene tidak berurutan: diharapkan ${expectedNum}, tapi tertulis ${sc.scene}.`, severity: 'warning' });
          }
        }

        // Time timing check
        if (!sc.time || typeof sc.time !== 'string') {
          issues.push({ field: `scenes[${index}].time`, message: `Scene ${sc.scene || index + 1} tidak memiliki field time valid.`, severity: 'error' });
        }

        // Visual check
        if (!sc.visual || typeof sc.visual !== 'string' || sc.visual.trim().length === 0) {
          issues.push({ field: `scenes[${index}].visual`, message: `Scene ${sc.scene || index + 1} memerlukan deskripsi visual.`, severity: 'warning' });
        }

        // Action check
        if (!sc.action || typeof sc.action !== 'string' || sc.action.trim().length === 0) {
          issues.push({ field: `scenes[${index}].action`, message: `Scene ${sc.scene || index + 1} memerlukan deskripsi action.`, severity: 'warning' });
        }
      });
    }

    // 6. Check reference_instruction
    if (!parsed.reference_instruction || typeof parsed.reference_instruction !== 'object') {
      issues.push({ field: 'reference_instruction', message: 'Field "reference_instruction" wajib ada.', severity: 'warning' });
    }

    // 7. Check global_motion_rules
    if (!Array.isArray(parsed.global_motion_rules)) {
      issues.push({ field: 'global_motion_rules', message: 'Field "global_motion_rules" harus berupa array string.', severity: 'warning' });
    }

    const hasErrors = issues.some(i => i.severity === 'error');

    return {
      isValid: !hasErrors,
      issues,
      fixedJson: issues.length > 0 ? this.autoFixObject(parsed) : undefined
    };
  }

  /**
   * Automatically repairs a malformed or slightly invalid schema
   */
  public static autoFixObject(obj: any): string {
    if (!obj || typeof obj !== 'object') {
      obj = {};
    }

    const fixed: Partial<ImageToVideoOutput> = {
      title: obj.title || 'Cinematic Storyboard Sequence',
      duration: obj.duration || '10 seconds',
      aspect_ratio: obj.aspect_ratio || '16:9',
      style: obj.style || 'Photorealistic Cinematic',
      reference_instruction: {
        use_uploaded_storyboard_as_master_reference: true,
        preserve_character_identity: true,
        preserve_costume_design: true,
        preserve_hair_style: true,
        preserve_environment: true,
        preserve_lighting_and_color_palette: true,
        preserve_spatial_relationship_between_characters: true,
        ...(obj.reference_instruction || {})
      },
      global_motion_rules: Array.isArray(obj.global_motion_rules) && obj.global_motion_rules.length > 0
        ? obj.global_motion_rules
        : DEFAULT_GLOBAL_RULES,
      scenes: Array.isArray(obj.scenes) && obj.scenes.length > 0
        ? obj.scenes.map((sc: any, idx: number) => ({
            scene: idx + 1,
            time: sc.time || `${idx * 2}-${(idx + 1) * 2} seconds`,
            title: sc.title || `Scene ${idx + 1}`,
            visual: sc.visual || 'Preserved visual from storyboard master',
            action: sc.action || 'Dynamic fluid kinetic action',
            camera: sc.camera || 'Cinematic tracking shot',
            effects: sc.effects || 'Natural optical atmosphere',
            audio: sc.audio || 'Foley impact and score'
          }))
        : [],
      transitions: typeof obj.transitions === 'object' && obj.transitions !== null
        ? obj.transitions
        : {
            'scene_1_to_2': 'Continuous kinetic acceleration',
            'scene_2_to_3': 'Dynamic impact snap cut',
            'scene_3_to_4': 'Momentum transfer recoil',
            'scene_4_to_5': 'Spatial reset into dramatic closing frame'
          },
      negative_prompt: Array.isArray(obj.negative_prompt) && obj.negative_prompt.length > 0
        ? obj.negative_prompt
        : DEFAULT_NEGATIVE_PROMPT
    };

    return JSON.stringify(fixed, null, 2);
  }

  /**
   * Fixes common syntax mistakes in raw text like trailing commas
   */
  private static attemptSyntaxFix(raw: string): string {
    let clean = raw.trim();
    // Remove trailing commas before closing braces or brackets
    clean = clean.replace(/,\s*([}\]])/g, '$1');
    return clean;
  }
}
