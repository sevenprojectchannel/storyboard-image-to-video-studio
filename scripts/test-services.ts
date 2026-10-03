import { StoryboardAnalyzer } from '../src/services/storyboardAnalyzer';
import { ContinuityAnalyzer } from '../src/services/continuityAnalyzer';
import { PromptConflictAnalyzer } from '../src/services/conflictAnalyzer';
import { JsonValidator } from '../src/services/jsonValidator';
import { ImageToVideoPromptGenerator } from '../src/services/promptGenerator';
import { DEFAULT_FIGHT_SCENES, DEFAULT_CONTINUITY, DEFAULT_GLOBAL_RULES } from '../src/constants/defaults';
import { Scene } from '../src/types/storyboard';

console.log('--- STARTING UNIT & INTEGRATION TESTS FOR STORYBOARD STUDIO ---');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`✓ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`✗ [FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

// 1. Aspect Ratio Calculation
const ratio169 = StoryboardAnalyzer.calculateAspectRatio(1920, 1080);
assert(ratio169.matchedPreset === '16:9', 'Calculates 1920x1080 as 16:9');

const ratio916 = StoryboardAnalyzer.calculateAspectRatio(1080, 1920);
assert(ratio916.matchedPreset === '9:16', 'Calculates 1080x1920 as 9:16');

const ratio11 = StoryboardAnalyzer.calculateAspectRatio(1000, 1000);
assert(ratio11.matchedPreset === '1:1', 'Calculates 1000x1000 as 1:1');

// 2. Scene Timing Recalculation
const timed10s = StoryboardAnalyzer.recalculateSceneTimings(DEFAULT_FIGHT_SCENES, 10);
assert(timed10s.length === 5, 'Retains 5 scenes count');
assert(timed10s[0].time === '0-2 seconds', 'Scene 1 is 0-2 seconds for 10s');
assert(timed10s[1].time === '2-4 seconds', 'Scene 2 is 2-4 seconds for 10s');
assert(timed10s[2].time === '4-6 seconds', 'Scene 3 is 4-6 seconds for 10s');
assert(timed10s[3].time === '6-8 seconds', 'Scene 4 is 6-8 seconds for 10s');
assert(timed10s[4].time === '8-10 seconds', 'Scene 5 is 8-10 seconds for 10s');

const timed5s = StoryboardAnalyzer.recalculateSceneTimings(DEFAULT_FIGHT_SCENES, 5);
assert(timed5s[0].time === '0-1 seconds', 'Scene 1 is 0-1 seconds for 5s');
assert(timed5s[4].time === '4-5 seconds', 'Scene 5 is 4-5 seconds for 5s');

// 3. Continuity Verification
const continuityReport = ContinuityAnalyzer.verifyContinuity(DEFAULT_FIGHT_SCENES);
assert(continuityReport.isCohesive === true, 'Default 5-scene duel is cohesive');
assert(continuityReport.score >= 80, `Continuity score is high (Got: ${continuityReport.score})`);

// 4. Conflict Detection & Auto-Fixing
const conflictingScenes: Scene[] = [
  {
    scene: 1,
    time: '0-2 seconds',
    title: 'Fast & Slow Conflict',
    visual: 'A single character standing still and alone in frame',
    action: 'Standing still while rapidly running forward and sprinting in slow motion',
    camera: 'Fixed camera tripod while camera rapidly tracks subject',
    effects: 'Motion blur and slow-mo bullet time',
    audio: 'Drone'
  }
];

const detectedConflicts = PromptConflictAnalyzer.detectConflicts(conflictingScenes);
assert(detectedConflicts.length >= 2, `Detected prompt conflicts (Found: ${detectedConflicts.length})`);

const resolvedScenes = PromptConflictAnalyzer.autoFixConflicts(conflictingScenes, detectedConflicts);
const recheckedConflicts = PromptConflictAnalyzer.detectConflicts(resolvedScenes);
assert(recheckedConflicts.length < detectedConflicts.length, 'Auto-fix resolved contradictory instructions');

// 5. JSON Validation & Auto-Fix
const validJsonObj = ImageToVideoPromptGenerator.generateStructuredJson({
  title: 'Test Battle Sequence',
  durationSeconds: 10,
  durationLabel: '10 seconds',
  aspectRatio: '16:9',
  style: 'Photorealistic Cinematic',
  scenes: DEFAULT_FIGHT_SCENES,
  continuity: DEFAULT_CONTINUITY
});
const validJsonStr = JSON.stringify(validJsonObj, null, 2);
const valResult = JsonValidator.validate(validJsonStr);
assert(valResult.isValid === true, 'Generated structured JSON is strictly valid');
assert(valResult.issues.length === 0, 'No validation issues in default generation');

// Check that all 22 global motion rules are in place
assert(validJsonObj.global_motion_rules.length === 22, 'All 22 default global motion rules included');
assert(validJsonObj.global_motion_rules[0] === DEFAULT_GLOBAL_RULES[0], 'Rule 1 matches master visual reference');
assert(validJsonObj.global_motion_rules[21] === DEFAULT_GLOBAL_RULES[21], 'Rule 22 matches unnatural floating');

// Test auto-fix with malformed JSON
const malformedJson = `{
  "title": "Broken Json",
  "scenes": [
    { "scene": 2, "time": "0-2s", "visual": "...", "action": "..." },
  ]
}`;
const autoFixed = JsonValidator.autoFixObject(JSON.parse(malformedJson.replace(/,\s*([}\]])/g, '$1')));
const autoFixedCheck = JsonValidator.validate(autoFixed);
assert(autoFixedCheck.isValid === true, 'Auto-fix created valid schema from incomplete input');

// 6. Human-Readable Prompt Generation
const humanPrompt = ImageToVideoPromptGenerator.generateHumanReadablePrompt({
  title: 'Test Battle Sequence',
  durationSeconds: 10,
  aspectRatio: '16:9',
  style: 'Photorealistic Cinematic',
  promptMode: 'CINEMATIC',
  scenes: DEFAULT_FIGHT_SCENES,
  continuity: DEFAULT_CONTINUITY
});
assert(humanPrompt.includes('IMAGE-TO-VIDEO CINEMATIC MASTER DIRECTIVE'), 'Prompt includes master header');
assert(humanPrompt.includes('SCENE 1 (0-2 seconds)'), 'Prompt includes Scene 1 slice');
assert(humanPrompt.includes('SCENE 5 (8-10 seconds)'), 'Prompt includes Scene 5 slice');
assert(humanPrompt.includes('NEGATIVE PROMPT'), 'Prompt includes negative prompt');

console.log(`\nTEST RESULTS: ${passedTests} / ${totalTests} passed!`);
