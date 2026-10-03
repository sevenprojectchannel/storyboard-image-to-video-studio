export type AspectRatioType = 'Auto Detect' | '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '3:2' | '2:3';

export type StylePresetType = 
  | 'Photorealistic Cinematic'
  | 'Live Action'
  | 'Wuxia Cinematic'
  | 'Action Film'
  | 'Epic Fantasy'
  | 'Realistic Documentary'
  | 'Commercial'
  | 'Anime Cinematic'
  | 'Custom';

export type PromptModeType = 'AUTO' | 'CINEMATIC' | 'REALISTIC' | 'CUSTOM';

export type ConfidenceLevel = 'High' | 'Medium' | 'Needs Review';

export type AppViewMode = 'STORYBOARD' | 'TIMELINE' | 'JSON' | 'PROMPT';

export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTED' | 'ERROR' | 'TESTING';

export interface Scene {
  scene: number;
  time: string; // e.g. "0-2 seconds"
  title: string;
  visual: string;
  action: string;
  camera: string;
  effects: string;
  audio: string;
  confidence?: ConfidenceLevel;
  needsReview?: boolean;
  manualOverride?: boolean;
  notes?: string;
  vectorDirection?: string; // Movement direction e.g. "Lunging left to right", "Upward recoil"
}

export interface ReferenceInstruction {
  use_uploaded_storyboard_as_master_reference: boolean;
  preserve_character_identity: boolean;
  preserve_costume_design: boolean;
  preserve_hair_style: boolean;
  preserve_environment: boolean;
  preserve_lighting_and_color_palette: boolean;
  preserve_spatial_relationship_between_characters: boolean;
}

export interface ImageToVideoOutput {
  title: string;
  duration: string;
  aspect_ratio: string;
  style: string;
  reference_instruction: ReferenceInstruction;
  global_motion_rules: string[];
  scenes: Scene[];
  transitions: Record<string, string>;
  negative_prompt: string[];
}

export interface StoryboardImageMeta {
  file: File | null;
  dataUrl: string;
  fileName: string;
  fileSize: number;
  fileSizeBytes: string;
  aspectRatio: string;
  detectedRatio: AspectRatioType;
  width: number;
  height: number;
}

export interface ContinuityMap {
  characters: string;
  environment: string;
  lighting: string;
  momentumFlow: string[];
  spatialRelationships: string;
}

export interface ConflictItem {
  id: string;
  sceneNumber?: number;
  type: 'motion' | 'camera' | 'physics' | 'character';
  description: string;
  conflictA: string;
  conflictB: string;
  suggestedFix: string;
}

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  fixedJson?: string;
}

export interface StudioProject {
  id: string;
  title: string;
  updatedAt: string;
  duration: number; // in seconds, e.g. 10
  selectedDurationLabel: string;
  aspectRatio: AspectRatioType;
  style: StylePresetType;
  customStylePrompt?: string;
  promptMode: PromptModeType;
  customUserPrompt?: string;
  autoAnalyze: boolean;
  scenes: Scene[];
  continuity: ContinuityMap;
  storyboardImageMeta?: Partial<StoryboardImageMeta>;
  masterPrompt: string;
  outputJson: ImageToVideoOutput;
}
