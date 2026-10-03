import React from 'react';
import { Scene, StoryboardImageMeta } from '../types/storyboard';
import { Layers, ArrowRight, Eye, ShieldCheck, Film } from 'lucide-react';

interface StoryboardGridViewProps {
  scenes: Scene[];
  imageMeta: StoryboardImageMeta | null;
  onSelectScene: (index: number) => void;
}

export const StoryboardGridView: React.FC<StoryboardGridViewProps> = ({
  scenes,
  imageMeta,
  onSelectScene
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-studio-border pb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold uppercase text-white tracking-wider">
            STORYBOARD MULTI-PANEL VIEW
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          {scenes.length} Panel Scenes Terdeteksi
        </span>
      </div>

      {/* Main Master Storyboard Preview Banner if available */}
      {imageMeta && (
        <div className="bg-studio-panel border border-studio-border rounded-xl p-3 flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:w-64 h-36 rounded-lg overflow-hidden bg-black/60 border border-studio-border flex-shrink-0">
            <img
              src={imageMeta.dataUrl}
              alt="Master Storyboard"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-indigo-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              MASTER VISUAL REFERENCE
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Semua scene di bawah ini terhubung secara ketat dengan panel storyboard master di samping. Karakter, pencahayaan, dan momentum berkesinambungan 10 detik penuh.
            </p>
            <div className="font-mono text-[10px] text-cyan-300">
              Format: {imageMeta.detectedRatio} ({imageMeta.width}x{imageMeta.height} px)
            </div>
          </div>
        </div>
      )}

      {/* Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {scenes.map((scene, idx) => (
          <div
            key={scene.scene}
            onClick={() => onSelectScene(idx)}
            className="bg-studio-panel border border-studio-border hover:border-indigo-500/80 rounded-xl p-3.5 space-y-2.5 cursor-pointer transition-all hover:shadow-glow-accent group"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-indigo-600 font-mono text-xs font-bold text-white">
                PANEL {scene.scene}
              </span>
              <span className="font-mono text-xs font-bold text-cyan-300">
                {scene.time}
              </span>
            </div>

            {/* Simulated Panel Thumbnail Frame with Vector Graphic */}
            <div className="relative aspect-video rounded-lg bg-studio-card border border-studio-border flex flex-col items-center justify-center p-3 text-center overflow-hidden">
              <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-mono text-slate-400">
                <Film className="w-3 h-3 text-indigo-400" />
                <span>Scene {scene.scene}</span>
              </div>

              {/* Title & Movement representation */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                  {scene.title}
                </div>
                {scene.vectorDirection && (
                  <div className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <ArrowRight className="w-3 h-3 text-amber-400" />
                    <span>{scene.vectorDirection}</span>
                  </div>
                )}
              </div>

              <div className="absolute bottom-2 right-2 text-[10px] text-slate-500 group-hover:text-slate-300 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>Klik untuk edit</span>
              </div>
            </div>

            {/* Visual excerpt */}
            <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
              <strong className="text-slate-400">Visual:</strong> {scene.visual}
            </p>

            {/* Action excerpt */}
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              <strong className="text-slate-300">Action:</strong> {scene.action}
            </p>

            {/* Camera badge */}
            <div className="pt-1 border-t border-studio-border/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="truncate mr-2">Cam: {scene.camera}</span>
              <span className={`px-1.5 py-0.2 rounded font-sans uppercase font-bold ${
                scene.needsReview ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {scene.confidence || 'High'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
