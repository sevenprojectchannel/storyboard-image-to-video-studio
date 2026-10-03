import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { LeftPanel } from './components/LeftPanel';
import { MiddlePanel } from './components/MiddlePanel';
import { RightPanel } from './components/RightPanel';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { StoryboardGridView } from './components/StoryboardGridView';
import {
  Scene,
  AspectRatioType,
  StylePresetType,
  PromptModeType,
  AppViewMode,
  StoryboardImageMeta,
  ConnectionStatus,
  ConflictItem,
  ValidationResult,
  StudioProject,
  ContinuityMap,
  ImageToVideoOutput
} from './types/storyboard';
import {
  DEFAULT_FIGHT_SCENES,
  DEFAULT_CONTINUITY,
  DEFAULT_PROJECT_OUTPUT
} from './constants/defaults';
import { StoryboardAnalyzer } from './services/storyboardAnalyzer';
import { ContinuityAnalyzer } from './services/continuityAnalyzer';
import { ImageToVideoPromptGenerator } from './services/promptGenerator';
import { PromptConflictAnalyzer } from './services/conflictAnalyzer';
import { JsonValidator } from './services/jsonValidator';
import { GeminiService } from './services/geminiService';
import { StorageService } from './services/storageService';
import { generateSampleStoryboardDataUrl } from './utils/sampleStoryboardGenerator';

export function App() {
  // App Lifecycle & View State
  const [status, setStatus] = useState<'READY' | 'ANALYZING' | 'VALIDATING' | 'ERROR'>('READY');
  const [activeView, setActiveView] = useState<AppViewMode>('TIMELINE');
  const [autoAnalyze, setAutoAnalyze] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const [connectionMessage, setConnectionMessage] = useState<string>('');

  // Project Configurations
  const [projectTitle, setProjectTitle] = useState<string>('Cinematic Martial Arts Duel — 10 Second Sequence');
  const [durationSeconds, setDurationSeconds] = useState<number>(10);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('Auto Detect');
  const [stylePreset, setStylePreset] = useState<StylePresetType>('Photorealistic Cinematic');
  const [customStylePrompt, setCustomStylePrompt] = useState<string>('');
  const [promptMode, setPromptMode] = useState<PromptModeType>('AUTO');
  const [customInstructions, setCustomInstructions] = useState<string>('');

  // Storyboard Master Image State
  const [imageMeta, setImageMeta] = useState<StoryboardImageMeta | null>(null);

  // Scenes & Continuity State (Section 32 Default: 5 scenes, 10s, 2s per scene)
  const [scenes, setScenes] = useState<Scene[]>(DEFAULT_FIGHT_SCENES);
  const [continuity, setContinuity] = useState<ContinuityMap>(DEFAULT_CONTINUITY);
  const [transitions, setTransitions] = useState<Record<string, string>>(DEFAULT_PROJECT_OUTPUT.transitions);

  // Outputs
  const [masterPrompt, setMasterPrompt] = useState<string>('');
  const [rawJsonString, setRawJsonString] = useState<string>('');
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [isOptimizingPrompt, setIsOptimizingPrompt] = useState<boolean>(false);

  // Helper to add toast
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync / Rebuild Master Prompt & JSON output
  const regenerateOutputs = useCallback((
    currentScenes: Scene[],
    currentDuration: number,
    currentAspect: AspectRatioType,
    currentStyle: StylePresetType,
    currentMode: PromptModeType,
    currentContinuity: ContinuityMap,
    currentTransitions: Record<string, string>,
    userCustomPrompt?: string
  ) => {
    // 1. Generate Structured JSON
    const jsonOutput: ImageToVideoOutput = ImageToVideoPromptGenerator.generateStructuredJson({
      title: projectTitle,
      durationSeconds: currentDuration,
      durationLabel: `${currentDuration} seconds`,
      aspectRatio: currentAspect,
      style: currentStyle,
      scenes: currentScenes,
      continuity: currentContinuity,
      transitions: currentTransitions
    });

    const jsonStr = JSON.stringify(jsonOutput, null, 2);
    setRawJsonString(jsonStr);

    // 2. Generate Master Human Readable Prompt
    const humanPrompt = ImageToVideoPromptGenerator.generateHumanReadablePrompt({
      title: projectTitle,
      durationSeconds: currentDuration,
      aspectRatio: currentAspect,
      style: currentStyle,
      promptMode: currentMode,
      scenes: currentScenes,
      continuity: currentContinuity,
      customUserPrompt: userCustomPrompt || customInstructions
    });
    setMasterPrompt(humanPrompt);

    // 3. Scan for conflicts
    const detectedConflicts = PromptConflictAnalyzer.detectConflicts(currentScenes);
    setConflicts(detectedConflicts);
  }, [projectTitle, customInstructions]);

  // Initial load: check API key and initialize outputs
  useEffect(() => {
    GeminiService.loadFromStorage();
    if (GeminiService.hasApiKey()) {
      setConnectionStatus('CONNECTED');
    }

    // Try loading saved project if present
    const saved = StorageService.loadProjectLocally();
    if (saved && saved.scenes && saved.scenes.length > 0) {
      setProjectTitle(saved.title || projectTitle);
      setDurationSeconds(saved.duration || 10);
      setAspectRatio(saved.aspectRatio || 'Auto Detect');
      setStylePreset(saved.style || 'Photorealistic Cinematic');
      setPromptMode(saved.promptMode || 'AUTO');
      setScenes(saved.scenes);
      if (saved.continuity) setContinuity(saved.continuity);
      if (saved.storyboardImageMeta?.dataUrl) {
        setImageMeta(saved.storyboardImageMeta as StoryboardImageMeta);
      }
      regenerateOutputs(
        saved.scenes,
        saved.duration || 10,
        saved.aspectRatio || 'Auto Detect',
        saved.style || 'Photorealistic Cinematic',
        saved.promptMode || 'AUTO',
        saved.continuity || DEFAULT_CONTINUITY,
        saved.outputJson?.transitions || DEFAULT_PROJECT_OUTPUT.transitions,
        saved.customUserPrompt
      );
    } else {
      // Initialize with default fight scenes
      regenerateOutputs(
        DEFAULT_FIGHT_SCENES,
        10,
        'Auto Detect',
        'Photorealistic Cinematic',
        'AUTO',
        DEFAULT_CONTINUITY,
        DEFAULT_PROJECT_OUTPUT.transitions
      );
    }
  }, []);

  // Validation Result on rawJsonString
  const validationResult: ValidationResult = useMemo(() => {
    if (!rawJsonString) return { isValid: true, issues: [] };
    return JsonValidator.validate(rawJsonString);
  }, [rawJsonString]);

  // Handle Duration Change
  const handleDurationChange = (newSec: number) => {
    setDurationSeconds(newSec);
    const retimedScenes = StoryboardAnalyzer.recalculateSceneTimings(scenes, newSec);
    setScenes(retimedScenes);
    regenerateOutputs(
      retimedScenes,
      newSec,
      aspectRatio,
      stylePreset,
      promptMode,
      continuity,
      transitions
    );
    addToast(`Durasi diubah menjadi ${newSec} detik. Timeline dihitung ulang.`, 'info');
  };

  // Handle Aspect Ratio Change
  const handleAspectRatioChange = (newAspect: AspectRatioType) => {
    setAspectRatio(newAspect);
    regenerateOutputs(
      scenes,
      durationSeconds,
      newAspect,
      stylePreset,
      promptMode,
      continuity,
      transitions
    );
  };

  // Handle Style Preset Change
  const handleStylePresetChange = (newStyle: StylePresetType) => {
    setStylePreset(newStyle);
    regenerateOutputs(
      scenes,
      durationSeconds,
      aspectRatio,
      newStyle,
      promptMode,
      continuity,
      transitions
    );
  };

  // Handle Prompt Mode Change
  const handlePromptModeChange = (newMode: PromptModeType) => {
    setPromptMode(newMode);
    regenerateOutputs(
      scenes,
      durationSeconds,
      aspectRatio,
      stylePreset,
      newMode,
      continuity,
      transitions
    );
  };

  // Handle Image Selection
  const handleImageSelected = (meta: StoryboardImageMeta) => {
    setImageMeta(meta);
    if (aspectRatio === 'Auto Detect') {
      setAspectRatio(meta.detectedRatio);
    }

    addToast(`Storyboard "${meta.fileName}" berhasil dimuat.`, 'success');

    // Section 21: AI Analysis Mode
    // If autoAnalyze is ON, trigger analysis automatically
    if (autoAnalyze) {
      handleAnalyzeStoryboard(meta);
    }
  };

  // Handle Clear Image
  const handleClearImage = () => {
    setImageMeta(null);
    addToast('Gambar storyboard di-reset.', 'info');
  };

  // Handle Load Sample Storyboard (Section 32 martial arts battle)
  const handleLoadSample = () => {
    const sample = generateSampleStoryboardDataUrl();
    const sampleMeta: StoryboardImageMeta = {
      file: null,
      dataUrl: sample.dataUrl,
      fileName: 'cinematic_duel_storyboard_sample.jpg',
      fileSize: 485000,
      fileSizeBytes: '473 KB',
      aspectRatio: '1920:1080 (1.78:1)',
      detectedRatio: '16:9',
      width: sample.width,
      height: sample.height
    };

    setImageMeta(sampleMeta);
    setAspectRatio('16:9');
    setDurationSeconds(10);
    setScenes(DEFAULT_FIGHT_SCENES);
    setContinuity(DEFAULT_CONTINUITY);
    setTransitions(DEFAULT_PROJECT_OUTPUT.transitions);

    regenerateOutputs(
      DEFAULT_FIGHT_SCENES,
      10,
      '16:9',
      stylePreset,
      promptMode,
      DEFAULT_CONTINUITY,
      DEFAULT_PROJECT_OUTPUT.transitions
    );

    addToast('Sample Storyboard Duel 5-Scene (10 detik) berhasil dimuat!', 'success');
  };

  // Trigger Storyboard Analysis (Section 4)
  const handleAnalyzeStoryboard = async (metaToUse?: StoryboardImageMeta) => {
    const targetMeta = metaToUse || imageMeta;
    if (!targetMeta) {
      alert('Silakan upload gambar storyboard terlebih dahulu atau klik "Load Sample".');
      return;
    }

    setStatus('ANALYZING');

    try {
      const result = await StoryboardAnalyzer.analyze(
        targetMeta.dataUrl,
        targetMeta.file?.type || 'image/jpeg',
        {
          durationSeconds,
          aspectRatio,
          stylePreset,
          promptMode,
          customInstructions,
          useAi: Boolean(GeminiService.hasApiKey())
        }
      );

      setProjectTitle(result.title);
      setScenes(result.scenes);
      setContinuity(result.continuity);
      setTransitions(result.transitions);

      regenerateOutputs(
        result.scenes,
        durationSeconds,
        aspectRatio,
        stylePreset,
        promptMode,
        result.continuity,
        result.transitions
      );

      setStatus('READY');

      if (result.source === 'AI') {
        addToast(`Analisis AI berhasil! Terdeteksi ${result.detectedSceneCount} scene.`, 'success');
      } else {
        addToast(`Analisis Storyboard selesai (${result.detectedSceneCount} scene berkesinambungan).`, 'success');
      }
    } catch (err: any) {
      setStatus('ERROR');
      addToast(`Analisis AI gagal: ${err.message}`, 'error');
    }
  };

  // Scene CRUD & Reorder
  const handleUpdateScene = (updated: Scene) => {
    setScenes((prev) => {
      const idx = prev.findIndex((s) => s.scene === updated.scene);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = updated;

      // Sync continuity and outputs
      const verified = ContinuityAnalyzer.generateContinuityMap(next, continuity);
      setContinuity(verified);
      regenerateOutputs(
        next,
        durationSeconds,
        aspectRatio,
        stylePreset,
        promptMode,
        verified,
        transitions
      );

      return next;
    });
  };

  const handleSaveScene = (sceneNum: number) => {
    addToast(`Scene ${sceneNum} tersimpan sebagai Source of Truth.`, 'success');
  };

  // Section 11: Drag & Reorder Scene
  const handleReorderScene = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || fromIndex >= scenes.length || toIndex < 0 || toIndex >= scenes.length) return;

    const reordered = [...scenes];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    // Automatically recalculate numbering and timing (0-2s, 2-4s, etc.)
    const retimed = StoryboardAnalyzer.recalculateSceneTimings(reordered, durationSeconds);
    setScenes(retimed);

    // Recheck continuity
    const verified = ContinuityAnalyzer.generateContinuityMap(retimed);
    setContinuity(verified);

    regenerateOutputs(
      retimed,
      durationSeconds,
      aspectRatio,
      stylePreset,
      promptMode,
      verified,
      transitions
    );

    addToast(`Urutan scene dipindahkan. Nomor dan timing otomatis dihitung ulang.`, 'info');
  };

  const handleAddScene = () => {
    const nextNum = scenes.length + 1;
    const newScene: Scene = {
      scene: nextNum,
      time: '0-2 seconds',
      title: `Scene ${nextNum}: New Action Continuation`,
      visual: 'Consistent protagonist from master storyboard continuing dynamic motion.',
      action: 'Fluid kinetic movement transitioning seamlessly.',
      camera: 'Cinematic tracking shot.',
      effects: 'Subtle atmospheric lighting particles.',
      audio: 'Foley sound and musical riser.',
      confidence: 'High'
    };

    const updated = [...scenes, newScene];
    const retimed = StoryboardAnalyzer.recalculateSceneTimings(updated, durationSeconds);
    setScenes(retimed);

    regenerateOutputs(
      retimed,
      durationSeconds,
      aspectRatio,
      stylePreset,
      promptMode,
      continuity,
      transitions
    );

    addToast(`Scene ${nextNum} berhasil ditambahkan. Timeline disesuaikan.`, 'success');
  };

  const handleDeleteScene = (sceneNum: number) => {
    if (scenes.length <= 1) {
      alert('Minimal harus ada 1 scene dalam storyboard.');
      return;
    }

    const filtered = scenes.filter((s) => s.scene !== sceneNum);
    const retimed = StoryboardAnalyzer.recalculateSceneTimings(filtered, durationSeconds);
    setScenes(retimed);

    regenerateOutputs(
      retimed,
      durationSeconds,
      aspectRatio,
      stylePreset,
      promptMode,
      continuity,
      transitions
    );

    addToast(`Scene ${sceneNum} dihapus. Timeline dihitung ulang.`, 'info');
  };

  // Section 24: Fix Conflicts Automatically
  const handleFixConflicts = () => {
    const resolvedScenes = PromptConflictAnalyzer.autoFixConflicts(scenes, conflicts);
    setScenes(resolvedScenes);
    setConflicts([]);
    regenerateOutputs(
      resolvedScenes,
      durationSeconds,
      aspectRatio,
      stylePreset,
      promptMode,
      continuity,
      transitions
    );
    addToast('Konflik prompt berhasil diselesaikan secara otomatis.', 'success');
  };

  const handleDismissConflicts = () => {
    setConflicts([]);
    addToast('Peringatan konflik diabaikan (instruksi dipertahankan).', 'info');
  };

  // Section 23: Prompt Optimizer
  const handleOptimizePrompt = async () => {
    setIsOptimizingPrompt(true);
    try {
      if (GeminiService.hasApiKey()) {
        const optimized = await GeminiService.optimizePromptWithAI(masterPrompt, stylePreset);
        setMasterPrompt(optimized);
        addToast('Prompt berhasil dioptimalkan via Google Gemini AI!', 'success');
      } else {
        // Local heuristic optimization
        const refined = masterPrompt.replace(/\s+/g, ' ').replace(/\n\s*\n/g, '\n\n').trim();
        setMasterPrompt(refined);
        addToast('Prompt dioptimalkan dengan formatter struktur sinematik lokal.', 'success');
      }
    } catch (err: any) {
      addToast(`Gagal mengoptimalkan: ${err.message}`, 'error');
    } finally {
      setIsOptimizingPrompt(false);
    }
  };

  // Auto-Fix JSON
  const handleAutoFixJson = () => {
    try {
      const fixed = JsonValidator.autoFixObject(JSON.parse(rawJsonString));
      setRawJsonString(fixed);
      addToast('JSON berhasil diperbaiki secara otomatis.', 'success');
    } catch {
      // If full syntax parse fails, regenerate from current scenes
      regenerateOutputs(
        scenes,
        durationSeconds,
        aspectRatio,
        stylePreset,
        promptMode,
        continuity,
        transitions
      );
      addToast('Struktur JSON di-regenerate ulang dari data scene.', 'success');
    }
  };

  // Copy Actions (Section 17)
  const handleCopyPrompt = async () => {
    const ok = await StorageService.copyToClipboard(masterPrompt);
    if (ok) addToast('Prompt berhasil disalin', 'success');
  };

  const handleCopyJson = async () => {
    const ok = await StorageService.copyToClipboard(rawJsonString);
    if (ok) addToast('JSON berhasil disalin', 'success');
  };

  const handleCopyScene = async (scene: Scene) => {
    const text = `SCENE ${scene.scene} (${scene.time}) : ${scene.title}\nVisual: ${scene.visual}\nAction: ${scene.action}\nCamera: ${scene.camera}\nEffects: ${scene.effects}\nAudio: ${scene.audio}`;
    const ok = await StorageService.copyToClipboard(text);
    if (ok) addToast(`Deskripsi Scene ${scene.scene} berhasil disalin`, 'success');
  };

  const handleCopyAllScenes = async () => {
    const all = scenes.map((s) => `[SCENE ${s.scene} - ${s.time} : ${s.title}]\nVISUAL: ${s.visual}\nACTION: ${s.action}\nCAMERA: ${s.camera}\nEFFECTS: ${s.effects}\nAUDIO: ${s.audio}\n`).join('\n');
    const ok = await StorageService.copyToClipboard(all);
    if (ok) addToast('Semua scene berhasil disalin ke clipboard', 'success');
  };

  // Download Actions (Section 18)
  const handleDownloadJson = () => {
    StorageService.downloadJson(rawJsonString, `image-to-video-storyboard-${durationSeconds}s.json`);
    addToast(`File JSON berhasil didownload: image-to-video-storyboard-${durationSeconds}s.json`, 'success');
  };

  const handleDownloadPrompt = () => {
    StorageService.downloadPromptTxt(masterPrompt, `image-to-video-storyboard-${durationSeconds}s.txt`);
    addToast(`File Prompt berhasil didownload: image-to-video-storyboard-${durationSeconds}s.txt`, 'success');
  };

  // Save Project Locally (Section 19)
  const handleSaveProject = () => {
    const project: StudioProject = {
      id: 'current_studio_project',
      title: projectTitle,
      updatedAt: new Date().toISOString(),
      duration: durationSeconds,
      selectedDurationLabel: `${durationSeconds} seconds`,
      aspectRatio,
      style: stylePreset,
      customStylePrompt,
      promptMode,
      customUserPrompt: customInstructions,
      autoAnalyze,
      scenes,
      continuity,
      storyboardImageMeta: imageMeta || undefined,
      masterPrompt,
      outputJson: JSON.parse(rawJsonString || '{}')
    };

    const saved = StorageService.saveProjectLocally(project);
    if (saved) {
      addToast('Project berhasil disimpan ke LocalStorage browser.', 'success');
    } else {
      addToast('Gagal menyimpan ke LocalStorage.', 'error');
    }
  };

  // Export Project File
  const handleExportProject = () => {
    const project: StudioProject = {
      id: `project_${Date.now()}`,
      title: projectTitle,
      updatedAt: new Date().toISOString(),
      duration: durationSeconds,
      selectedDurationLabel: `${durationSeconds} seconds`,
      aspectRatio,
      style: stylePreset,
      customStylePrompt,
      promptMode,
      customUserPrompt: customInstructions,
      autoAnalyze,
      scenes,
      continuity,
      storyboardImageMeta: imageMeta || undefined,
      masterPrompt,
      outputJson: JSON.parse(rawJsonString || '{}')
    };

    StorageService.exportProjectToFile(project);
    addToast('File project (.json) berhasil diekspor.', 'success');
  };

  return (
    <div className="min-h-screen bg-studio-bg text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header */}
      <Header
        status={status}
        autoAnalyze={autoAnalyze}
        onToggleAutoAnalyze={setAutoAnalyze}
        activeView={activeView}
        onViewChange={setActiveView}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSaveProject={handleSaveProject}
        onExportProject={handleExportProject}
        onLoadSample={handleLoadSample}
        hasApiKey={GeminiService.hasApiKey()}
      />

      {/* Main 3-Panel Desktop Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[calc(100vh-57px)]">
        {/* Left Panel: Upload, Preview, Configurations */}
        <LeftPanel
          imageMeta={imageMeta}
          onImageSelected={handleImageSelected}
          onClearImage={handleClearImage}
          durationSeconds={durationSeconds}
          onDurationChange={handleDurationChange}
          aspectRatio={aspectRatio}
          onAspectRatioChange={handleAspectRatioChange}
          stylePreset={stylePreset}
          onStylePresetChange={handleStylePresetChange}
          customStylePrompt={customStylePrompt}
          onCustomStylePromptChange={setCustomStylePrompt}
          promptMode={promptMode}
          onPromptModeChange={handlePromptModeChange}
          customInstructions={customInstructions}
          onCustomInstructionsChange={(val) => {
            setCustomInstructions(val);
            regenerateOutputs(
              scenes,
              durationSeconds,
              aspectRatio,
              stylePreset,
              promptMode,
              continuity,
              transitions,
              val
            );
          }}
          onAnalyzeStoryboard={() => handleAnalyzeStoryboard()}
          isAnalyzing={status === 'ANALYZING'}
        />

        {/* Middle Panel: Storyboard Analysis & Timeline */}
        {activeView === 'STORYBOARD' ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-studio-bg">
            <StoryboardGridView
              scenes={scenes}
              imageMeta={imageMeta}
              onSelectScene={(idx) => {
                setActiveView('TIMELINE');
                setTimeout(() => {
                  const el = document.getElementById(`scene-card-${idx}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
              }}
            />
          </div>
        ) : (
          <MiddlePanel
            scenes={scenes}
            onUpdateScene={handleUpdateScene}
            onSaveScene={handleSaveScene}
            onReorderScene={handleReorderScene}
            onAddScene={handleAddScene}
            onDeleteScene={handleDeleteScene}
            onCopyScene={handleCopyScene}
            conflicts={conflicts}
            onFixConflicts={handleFixConflicts}
            onDismissConflicts={handleDismissConflicts}
            totalDurationSeconds={durationSeconds}
          />
        )}

        {/* Right Panel: Master Prompt & Structured JSON Editor */}
        <RightPanel
          masterPrompt={masterPrompt}
          onMasterPromptChange={setMasterPrompt}
          rawJsonString={rawJsonString}
          onRawJsonChange={setRawJsonString}
          validationResult={validationResult}
          onAutoFixJson={handleAutoFixJson}
          onOptimizePrompt={handleOptimizePrompt}
          isOptimizingPrompt={isOptimizingPrompt}
          onCopyPrompt={handleCopyPrompt}
          onCopyJson={handleCopyJson}
          onCopyAllScenes={handleCopyAllScenes}
          onDownloadJson={handleDownloadJson}
          onDownloadPrompt={handleDownloadPrompt}
        />
      </div>

      {/* Centralized API & Pengaturan Modal (BYOK) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConnectionStatusChange={setConnectionStatus}
        connectionStatus={connectionStatus}
        connectionMessage={connectionMessage}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
export default App;
