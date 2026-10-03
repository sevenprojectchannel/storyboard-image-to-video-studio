import React, { useState } from 'react';
import {
  Film,
  Clock,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Save,
  Copy,
  Plus,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Info,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Scene, ConflictItem, ConfidenceLevel } from '../types/storyboard';

interface MiddlePanelProps {
  scenes: Scene[];
  onUpdateScene: (updated: Scene) => void;
  onSaveScene: (sceneNum: number) => void;
  onReorderScene: (fromIndex: number, toIndex: number) => void;
  onAddScene: () => void;
  onDeleteScene: (sceneNum: number) => void;
  onCopyScene: (scene: Scene) => void;
  conflicts: ConflictItem[];
  onFixConflicts: () => void;
  onDismissConflicts: () => void;
  totalDurationSeconds: number;
}

export const MiddlePanel: React.FC<MiddlePanelProps> = ({
  scenes,
  onUpdateScene,
  onSaveScene,
  onReorderScene,
  onAddScene,
  onDeleteScene,
  onCopyScene,
  conflicts,
  onFixConflicts,
  onDismissConflicts,
  totalDurationSeconds
}) => {
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [savedScenes, setSavedScenes] = useState<Record<number, boolean>>({});

  const handleFieldChange = (sceneIndex: number, field: keyof Scene, value: any) => {
    const current = scenes[sceneIndex];
    if (!current) return;

    const updated: Scene = {
      ...current,
      [field]: value,
      manualOverride: true // Section 22: Manual edits become SOURCE OF TRUTH
    };

    onUpdateScene(updated);
  };

  const handleManualSave = (sceneNum: number) => {
    onSaveScene(sceneNum);
    setSavedScenes(prev => ({ ...prev, [sceneNum]: true }));
    setTimeout(() => {
      setSavedScenes(prev => ({ ...prev, [sceneNum]: false }));
    }, 2000);
  };

  const scrollToScene = (index: number) => {
    setActiveSceneIndex(index);
    const element = document.getElementById(`scene-card-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <main className="flex-1 bg-studio-bg overflow-y-auto p-4 md:p-6 space-y-6 min-w-0">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-studio-border pb-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-indigo-400" />
            STORYBOARD ANALYSIS
          </h2>
          <p className="text-xs text-slate-400">
            Daftar scene terstruktur ({scenes.length} Scene) — Total Durasi: {totalDurationSeconds} detik
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddScene}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-studio-card hover:bg-studio-cardHover border border-studio-border text-slate-200 hover:text-white transition-all shadow-sm"
            aria-label="Tambah Scene Baru"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            Tambah Scene
          </button>
        </div>
      </div>

      {/* SECTION 25: VISUAL TIMELINE */}
      <section className="bg-studio-panel border border-studio-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>TIMELINE VISUAL SEQUENCER</span>
          </div>
          <span className="font-mono text-slate-400 text-[11px]">
            0s ➔ {totalDurationSeconds}s ({scenes.length} slices)
          </span>
        </div>

        {/* Visual Timeline Bar with Segments */}
        <div className="relative pt-2 pb-6">
          {/* Timeline Bar Track */}
          <div className="grid grid-cols-5 gap-1.5 h-3 bg-studio-card rounded-full overflow-hidden border border-studio-border/70 p-0.5">
            {scenes.map((sc, idx) => (
              <div
                key={sc.scene}
                onClick={() => scrollToScene(idx)}
                className={`h-full rounded cursor-pointer transition-all ${
                  activeSceneIndex === idx
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-glow-cyan'
                    : 'bg-indigo-900/60 hover:bg-indigo-700/80'
                }`}
                title={`Scene ${sc.scene}: ${sc.time}`}
              />
            ))}
          </div>

          {/* Time markers and clickable scene badges */}
          <div className="grid grid-cols-5 gap-1.5 mt-2">
            {scenes.map((sc, idx) => (
              <button
                key={sc.scene}
                onClick={() => scrollToScene(idx)}
                className={`text-center py-1.5 px-1 rounded-lg border transition-all ${
                  activeSceneIndex === idx
                    ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-glow-accent'
                    : 'bg-studio-card border-studio-border text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-[11px] font-bold">SCENE {sc.scene}</div>
                <div className="text-[10px] font-mono text-cyan-300">{sc.time}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 24: PROMPT CONFLICT ALERT BANNER */}
      {conflicts.length > 0 && (
        <section
          className="bg-amber-950/40 border border-amber-500/50 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top duration-300"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                WARNING: Potential prompt conflict detected ({conflicts.length} konflik)
              </h3>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Ditemukan kontradiksi fisik, arah kamera, atau karakter antar-instruksi.
              </p>

              <div className="mt-2 space-y-1.5 text-xs">
                {conflicts.map((c) => (
                  <div key={c.id} className="bg-black/30 rounded-lg p-2 border border-amber-500/20 text-amber-100">
                    <div className="font-semibold text-amber-300">{c.description}</div>
                    <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-2 font-mono">
                      <span className="text-rose-400 line-through">{c.conflictA}</span>
                      <span>vs</span>
                      <span className="text-amber-400">{c.conflictB}</span>
                    </div>
                    <div className="text-[11px] text-emerald-300 mt-1">
                      💡 Saran Solusi: {c.suggestedFix}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons as specified in Section 24 */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={onFixConflicts}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm cursor-pointer"
                >
                  [ FIX AUTOMATICALLY ]
                </button>
                <button
                  onClick={onDismissConflicts}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-studio-card hover:bg-studio-cardHover text-slate-300 border border-studio-border transition-colors cursor-pointer"
                >
                  [ KEEP ]
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 10: SCENE CARDS LIST */}
      <div className="space-y-4">
        {scenes.map((scene, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === scenes.length - 1;
          const isSaved = Boolean(savedScenes[scene.scene]);

          return (
            <div
              key={scene.scene}
              id={`scene-card-${idx}`}
              onClick={() => setActiveSceneIndex(idx)}
              className={`bg-studio-panel border rounded-xl p-4 transition-all duration-200 ${
                activeSceneIndex === idx
                  ? 'border-indigo-500/80 shadow-glow-accent ring-1 ring-indigo-500/30'
                  : 'border-studio-border hover:border-slate-700'
              }`}
            >
              {/* Scene Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-studio-border/70 pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-mono text-xs font-bold">
                    SCENE {scene.scene}
                  </span>
                  <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                    {scene.time}
                  </span>

                  {/* Confidence / Review Indicator */}
                  {scene.needsReview ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Needs Review
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Confidence: {scene.confidence || 'High'}
                    </span>
                  )}

                  {/* Manual Override Indicator */}
                  {scene.manualOverride && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-purple-400" />
                      SOURCE OF TRUTH (Manual)
                    </span>
                  )}
                </div>

                {/* Reorder and Card Actions */}
                <div className="flex items-center gap-1.5">
                  {/* Reorder Up */}
                  <button
                    disabled={isFirst}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorderScene(idx, idx - 1);
                    }}
                    className="p-1.5 rounded bg-studio-card hover:bg-studio-cardHover border border-studio-border text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Pindahkan Scene ke Atas"
                    aria-label="Pindahkan Scene ke Atas"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Reorder Down */}
                  <button
                    disabled={isLast}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorderScene(idx, idx + 1);
                    }}
                    className="p-1.5 rounded bg-studio-card hover:bg-studio-cardHover border border-studio-border text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Pindahkan Scene ke Bawah"
                    aria-label="Pindahkan Scene ke Bawah"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Copy Scene */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopyScene(scene);
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-studio-card hover:bg-studio-cardHover border border-studio-border text-xs text-slate-300 transition-colors"
                    title={`Salin deskripsi Scene ${scene.scene}`}
                    aria-label={`Copy Scene ${scene.scene}`}
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>

                  {/* Save Scene */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleManualSave(scene.scene);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold border transition-all ${
                      isSaved
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-indigo-600/80 hover:bg-indigo-600 border-indigo-500 text-white'
                    }`}
                    title="Simpan scene ini"
                    aria-label="Simpan Scene"
                  >
                    {isSaved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                    <span>{isSaved ? 'TERSIMPAN' : 'SAVE SCENE'}</span>
                  </button>

                  {/* Delete Scene */}
                  {scenes.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Hapus Scene ${scene.scene}?`)) {
                          onDeleteScene(scene.scene);
                        }
                      }}
                      className="p-1.5 rounded bg-studio-card hover:bg-rose-950/40 border border-studio-border text-rose-400 hover:text-rose-300 transition-colors"
                      title="Hapus Scene ini"
                      aria-label="Hapus Scene"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Timing Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Title:
                  </label>
                  <input
                    type="text"
                    value={scene.title}
                    onChange={(e) => handleFieldChange(idx, 'title', e.target.value)}
                    placeholder="Judul scene..."
                    className="w-full bg-studio-card border border-studio-border rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duration:
                  </label>
                  <input
                    type="text"
                    value={scene.time}
                    onChange={(e) => handleFieldChange(idx, 'time', e.target.value)}
                    placeholder="contoh: 0-2 seconds"
                    className="w-full bg-studio-card border border-studio-border rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Visual Field */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Visual:
                </label>
                <textarea
                  value={scene.visual}
                  onChange={(e) => handleFieldChange(idx, 'visual', e.target.value)}
                  rows={2}
                  placeholder="Deskripsi fisik subjek, pose, pencahayaan, lingkungan..."
                  className="w-full bg-studio-card border border-studio-border rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-sans"
                />
              </div>

              {/* Action Field */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Action:
                </label>
                <textarea
                  value={scene.action}
                  onChange={(e) => handleFieldChange(idx, 'action', e.target.value)}
                  rows={2}
                  placeholder="Aksi dinamis kinetik yang terjadi dalam durasi ini..."
                  className="w-full bg-studio-card border border-studio-border rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-sans"
                />
              </div>

              {/* Camera & Vector Direction */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Camera Movement:
                  </label>
                  <input
                    type="text"
                    value={scene.camera}
                    onChange={(e) => handleFieldChange(idx, 'camera', e.target.value)}
                    placeholder="Gerakan kamera (pan, tracking, zoom, push-in)..."
                    className="w-full bg-studio-card border border-studio-border rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Movement Vector / Arrow:
                  </label>
                  <input
                    type="text"
                    value={scene.vectorDirection || ''}
                    onChange={(e) => handleFieldChange(idx, 'vectorDirection', e.target.value)}
                    placeholder="Arah momentum (e.g. Lunging left-to-right)..."
                    className="w-full bg-studio-card border border-studio-border rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Effects & Audio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Effects:
                  </label>
                  <input
                    type="text"
                    value={scene.effects}
                    onChange={(e) => handleFieldChange(idx, 'effects', e.target.value)}
                    placeholder="Partikel debu, lentera, motion blur, shockwave..."
                    className="w-full bg-studio-card border border-studio-border rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Audio / Foley:
                  </label>
                  <input
                    type="text"
                    value={scene.audio}
                    onChange={(e) => handleFieldChange(idx, 'audio', e.target.value)}
                    placeholder="Efek suara, foley pukulan, ambient wind, musik..."
                    className="w-full bg-studio-card border border-studio-border rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};
