import {
  AspectRatioType,
  Scene,
  StylePresetType,
  PromptModeType,
  ImageToVideoOutput,
  ContinuityMap,
} from '../types/storyboard';

export const DEFAULT_GLOBAL_RULES: string[] = [
  "Use the uploaded storyboard as the master visual reference.",
  "Preserve character identity.",
  "Preserve costume design.",
  "Preserve facial structure.",
  "Preserve hair style.",
  "Preserve body proportions.",
  "Preserve environment.",
  "Preserve lighting direction.",
  "Maintain spatial continuity.",
  "Maintain realistic physical motion.",
  "No teleportation.",
  "No character morphing.",
  "No costume change.",
  "No face change.",
  "No extra characters.",
  "No duplicated limbs.",
  "No anatomical deformation.",
  "No environment replacement.",
  "No aspect ratio distortion.",
  "No unnecessary slow motion.",
  "No excessive camera shake.",
  "No unnatural floating."
];

export const DEFAULT_NEGATIVE_PROMPT: string[] = [
  "morphing, teleportation, flicking artifacts, character appearance change, disappearing props",
  "duplicate limbs, extra hands, missing fingers, malformed facial features, mutated anatomy",
  "inconsistent costume colors, sudden costume swaps, unnatural floaty physics, abrupt camera angle jump cuts without continuity",
  "overexposed flash, blurry low-resolution textures, cartoon rendering in live action, subtitle watermark, logo text"
];

export const STYLE_PRESETS: { id: StylePresetType; label: string; description: string }[] = [
  {
    id: 'Photorealistic Cinematic',
    label: 'Photorealistic Cinematic',
    description: '35mm anamorphic film look, cinematic dynamic range, rich optical depth, realistic film grain.'
  },
  {
    id: 'Live Action',
    label: 'Live Action',
    description: 'Natural high-definition camera sensor rendering, lifelike skin textures, authentic ambient lighting.'
  },
  {
    id: 'Wuxia Cinematic',
    label: 'Wuxia Cinematic',
    description: 'Dynamic martial arts choreography, flowing garments, atmospheric bamboo/mist lighting, graceful wire-action physics.'
  },
  {
    id: 'Action Film',
    label: 'Action Film',
    description: 'High shutter speed clarity, intense kinetic momentum, micro-impact shockwaves, punchy contrast.'
  },
  {
    id: 'Epic Fantasy',
    label: 'Epic Fantasy',
    description: 'Mythical atmosphere, volumetric god-rays, majestic textural grit, dramatic orchestral undertone.'
  },
  {
    id: 'Realistic Documentary',
    label: 'Realistic Documentary',
    description: 'Grounded handheld realism, observational angle, organic lighting, un-stylized physical authenticity.'
  },
  {
    id: 'Commercial',
    label: 'Commercial',
    description: 'High-key polished studio illumination, ultra-clean edges, premium product aesthetics, smooth motion.'
  },
  {
    id: 'Anime Cinematic',
    label: 'Anime Cinematic',
    description: 'Makoto Shinkai/Ufotable inspired cel-shaded realism, expressive key-frames, dynamic light flares.'
  },
  {
    id: 'Custom',
    label: 'Custom User Style',
    description: 'Use custom artistic style guidance specified directly in user prompt.'
  }
];

export const DURATION_OPTIONS = [
  { value: 5, label: '5 seconds', scenesDefault: 5 },
  { value: 10, label: '10 seconds (Standard)', scenesDefault: 5 },
  { value: 15, label: '15 seconds', scenesDefault: 5 },
  { value: 20, label: '20 seconds', scenesDefault: 5 },
  { value: 30, label: '30 seconds', scenesDefault: 6 },
  { value: -1, label: 'Custom Duration', scenesDefault: 5 }
];

export const ASPECT_RATIO_OPTIONS: AspectRatioType[] = [
  'Auto Detect',
  '16:9',
  '9:16',
  '1:1',
  '4:3',
  '3:4',
  '3:2',
  '2:3'
];

export const PROMPT_MODES: { id: PromptModeType; label: string; desc: string }[] = [
  { id: 'AUTO', label: 'AUTO', desc: 'Generator determines style based on storyboard composition' },
  { id: 'CINEMATIC', label: 'CINEMATIC', desc: 'Adds cinematic camera lenses, lighting ratios, and motion language' },
  { id: 'REALISTIC', label: 'REALISTIC', desc: 'Prioritizes real-world biomechanics, weight, friction, and physics' },
  { id: 'CUSTOM', label: 'CUSTOM', desc: 'Follows custom user instructions and override directives' }
];

/**
 * Standard 5-Scene Martial Arts Battle Storyboard Data (Source of Truth Default)
 * Fulfills Section 32:
 * 5 scenes, 10 seconds total, 2 seconds per scene
 * Scene 1: berhadapan
 * Scene 2: serangan cepat
 * Scene 3: pukulan mengenai target
 * Scene 4: lawan terpental
 * Scene 5: closing / siap bertarung kembali
 */
export const DEFAULT_FIGHT_SCENES: Scene[] = [
  {
    scene: 1,
    time: "0-2 seconds",
    title: "Standoff: Tense Stance & Stare-down",
    visual: "Two martial artists stand facing each other across an ancient dusty stone courtyard at golden hour. Fighter A on the left in dark tailored martial attire with focused intense glare; Fighter B on the right in white wrap uniform, balanced in defensive cat stance. Wind blows autumn leaves across the gravel between them.",
    action: "Fighter A slowly sinks his center of gravity, tightening his fists as tension peaks. Fighter B adjusts his lead hand forward in anticipation. Neither blinks as ambient dust drifts.",
    camera: "Wide eye-level two-shot with subtle slow push-in, shallow depth of field focusing on their intense gaze.",
    effects: "Subtle atmospheric dust motes floating in golden backlight; soft wind motion blur on robes.",
    audio: "Low ominous bass drone, dry autumn wind howling softly, slight rustle of cloth.",
    confidence: "High",
    vectorDirection: "Stationary tension, subtle downward weight settling"
  },
  {
    scene: 2,
    time: "2-4 seconds",
    title: "Rapid Advance: Exploding Forward Rush",
    visual: "Fighter A suddenly breaks stance and explodes forward across the courtyard with fierce kinetic momentum. Dust erupts beneath his boots as he closes the gap within milliseconds, right fist cocked back with coiled kinetic energy.",
    action: "Fighter A charges at blinding speed, executing a low-profile forward dash directly toward Fighter B. Fighter B raises his left forearm to deflect while bracing his rear leg.",
    camera: "Low-angle rapid tracking dolly shot following Fighter A's forward sprint from left-to-right, high kinetic energy.",
    effects: "Violent burst of gravel particles kicking up behind boots; dynamic forward motion streaks.",
    audio: "Sudden explosive footstep thud, rapid swish of air displacement, intensifying cinematic riser.",
    confidence: "High",
    vectorDirection: "Violent left-to-right forward linear acceleration"
  },
  {
    scene: 3,
    time: "4-6 seconds",
    title: "Impact: Heavy Fist Strikes Target",
    visual: "Fighter A's right thrust punch shatters through Fighter B's guard and connects cleanly against Fighter B's solar plexus with crushing force. Micro-shockwave ripples through Fighter B's chest fabric.",
    action: "Moment of clean impact: Fighter A completes full extension of the punch with hip rotation. Fighter B's eyes widen as his breath is knocked out, his torso buckling backward from the instantaneous transfer of momentum.",
    camera: "Tight medium close-up focused on the point of impact, slight snap zoom with a micro freeze-frame deceleration.",
    effects: "Concussive shockwave air distortion ring, sweat and fabric dust exploding outwards from the impact point.",
    audio: "Bone-deep heavy impact crunch, hollow thud of air forced from lungs, high-frequency reverb ring.",
    confidence: "High",
    vectorDirection: "Rightward direct force vector into chest"
  },
  {
    scene: 4,
    time: "6-8 seconds",
    title: "Recoil: Opponent Blown Back Across Ground",
    visual: "Carrying the residual momentum of the heavy blow, Fighter B is propelled backward through the air, skidding hard across the courtyard gravel in a cloud of dust before digging his heel in to decelerate.",
    action: "Fighter B flies back roughly two meters, touches down and skids backward on one knee and trailing foot, using friction to stop his flight. Fighter A retains his follow-through forward stance.",
    camera: "Side-profile medium tracking shot tracking Fighter B's backward trajectory from center to right edge of frame.",
    effects: "Gravel and thick dust plowing up along the slide furrow; billowing dust curtain enveloping Fighter B.",
    audio: "Rough scraping of boots tearing through stone gravel, lingering sonic boom decay.",
    confidence: "High",
    vectorDirection: "Backward rightward trajectory deceleration"
  },
  {
    scene: 5,
    time: "8-10 seconds",
    title: "Closing: Reset & Ready for Next Clash",
    visual: "Dust clears slowly around Fighter B as he rises back up into a guarded stance, blood wiped from lip. In foreground, Fighter A steps forward calmly, hands re-aligning into an offensive strike formation, eyes locked.",
    action: "Fighter B straightens his posture and nods with grim resolve. Fighter A circles slightly with poised predatory grace, both combatants locked in mortal focus ready for round two.",
    camera: "Cinematic over-the-shoulder closing shot from behind Fighter A toward standing Fighter B, slowly pulling back into wide tableau.",
    effects: "Golden rim lighting piercing through dispersing dust fog; subtle anamorphic lens flare on edge.",
    audio: "Heavy rhythmic breathing, crisp fabric snapping into guard position, dramatic orchestral resolve chord.",
    confidence: "High",
    vectorDirection: "Slow rotational circling stance reset"
  }
];

export const DEFAULT_CONTINUITY: ContinuityMap = {
  characters: "Fighter A (Dark tailored martial robes, black hair tied back, aggressive forward momentum) and Fighter B (White traditional wrap uniform, athletic build, defensive agility). Physical features, hair, and clothing remain 100% consistent across all scenes.",
  environment: "Ancient sun-drenched stone courtyard surrounded by worn temple walls, dry gravel ground with autumn leaves.",
  lighting: "Golden hour sunset lighting from camera left with warm orange highlights and long dramatic cast shadows.",
  momentumFlow: [
    "Scene 1 -> Scene 2: Tension breaks into explosive forward charge.",
    "Scene 2 -> Scene 3: Dash momentum concentrates into high-velocity right punch.",
    "Scene 3 -> Scene 4: Punch impact transfers directly into Fighter B's backward aerial skid.",
    "Scene 4 -> Scene 5: Friction deceleration leads to stance reset and renewed standoff."
  ],
  spatialRelationships: "Fighter A remains predominantly positioned on the left moving right; Fighter B is on the right receiving the strike and being pushed further right."
};

export const DEFAULT_PROJECT_OUTPUT: ImageToVideoOutput = {
  title: "Cinematic Martial Arts Duel — 10 Second Sequence",
  duration: "10 seconds",
  aspect_ratio: "16:9",
  style: "Photorealistic Cinematic",
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
  scenes: DEFAULT_FIGHT_SCENES,
  transitions: {
    "scene_1_to_2": "Smooth kinetic acceleration, transitioning from static tension to sudden sprint.",
    "scene_2_to_3": "High-speed tracking into an instantaneous snap-impact with seamless momentum continuity.",
    "scene_3_to_4": "Energy release carries Fighter B through the air directly from the point of fist contact.",
    "scene_4_to_5": "Slide deceleration settles into a dramatic dust-clearing ready stance."
  },
  negative_prompt: DEFAULT_NEGATIVE_PROMPT
};
