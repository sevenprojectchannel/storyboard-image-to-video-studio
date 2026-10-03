import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileImage,
  Sparkles,
  Sliders,
  ShieldCheck,
  Maximize2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import {
  AspectRatioType,
  StylePresetType,
  PromptModeType,
  StoryboardImageMeta
} from '../types/storyboard';
import {
  DURATION_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  STYLE_PRESETS,
  PROMPT_MODES
} from '../constants/defaults';

interface LeftPanelProps {
  imageMeta: StoryboardImageMeta | null;
  onImageSelected: (meta: StoryboardImageMeta) => void;
  onClearImage: () => void;
  durationSeconds: number;
  onDurationChange: (sec: number) => void;
  aspectRatio: AspectRatioType;
  onAspectRatioChange: (aspect: AspectRatioType) => void;
  stylePreset: StylePresetType;
  onStylePresetChange: (style: StylePresetType) => void;
  customStylePrompt?: string;
  onCustomStylePromptChange: (val: string) => void;
  promptMode: PromptModeType;
  onPromptModeChange: (mode: PromptModeType) => void;
  customInstructions: string;
  onCustomInstructionsChange: (val: string) => void;
  onAnalyzeStoryboard: () => void;
  isAnalyzing: boolean;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  imageMeta,
  onImageSelected,
  onClearImage,
  durationSeconds,
  onDurationChange,
  aspectRatio,
  onAspectRatioChange,
  stylePreset,
  onStylePresetChange,
  customStylePrompt,
  onCustomStylePromptChange,
  promptMode,
  onPromptModeChange,
  customInstructions,
  onCustomInstructionsChange,
  onAnalyzeStoryboard,
  isAnalyzing
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomPreview, setZoomPreview] = useState(false);
  const [customDurationInput, setCustomDurationInput] = useState(durationSeconds.toString());

  const handleFile = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert('Format file tidak didukung. Harap unggah file PNG, JPG, JPEG, atau WEBP.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        const ratio = (width / height).toFixed(2);
        
        let detectedPreset: AspectRatioType = '16:9';
        const numRatio = width / height;
        if (Math.abs(numRatio - 1.777) < 0.15) detectedPreset = '16:9';
        else if (Math.abs(numRatio - 0.562) < 0.15) detectedPreset = '9:16';
        else if (Math.abs(numRatio - 1.0) < 0.1) detectedPreset = '1:1';
        else if (Math.abs(numRatio - 1.333) < 0.15) detectedPreset = '4:3';
        else if (Math.abs(numRatio - 0.75) < 0.15) detectedPreset = '3:4';
        else if (Math.abs(numRatio - 1.5) < 0.15) detectedPreset = '3:2';
        else if (Math.abs(numRatio - 0.667) < 0.15) detectedPreset = '2:3';

        const sizeKb = (file.size / 1024).toFixed(1);
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        const sizeStr = file.size > 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`;

        onImageSelected({
          file,
          dataUrl,
          fileName: file.name,
          fileSize: file.size,
          fileSizeBytes: sizeStr,
          aspectRatio: `${width}:${height} (${ratio}:1)`,
          detectedRatio: detectedPreset,
          width,
          height
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <aside className="w-full lg:w-[360px] xl:w-[400px] flex-shrink-0 bg-studio-panel border-r border-studio-border p-4 overflow-y-auto space-y-4">
      {/* SECTION: Upload Storyboard */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <FileImage className="w-4 h-4 text-indigo-400" />
            Upload Storyboard
          </label>
          {imageMeta && (
            <button
              onClick={onClearImage}
              className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
              title="Hapus gambar storyboard"
            >
              <Trash2 className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>

        {/* Dropzone or Preview */}
        {!imageMeta ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-indigo-400 bg-indigo-500/10 scale-[0.99]'
                : 'border-studio-border hover:border-indigo-500/60 bg-studio-card/60 hover:bg-studio-card'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <UploadCloud className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-200">
                Drag & drop storyboard image di sini
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Mendukung <span className="text-indigo-300 font-mono">PNG, JPG, JPEG, WEBP</span>
              </p>
            </div>
            <span className="text-[11px] px-3 py-1 rounded-md bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 mt-1 font-medium">
              Pilih File
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFile(e.target.files[0]);
              }}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-2">
            {/* Storyboard Original Banner */}
            <div className="bg-indigo-950/60 border border-indigo-500/40 rounded-t-lg px-2.5 py-1 flex items-center justify-between text-[11px] font-mono text-indigo-300">
              <span className="flex items-center gap-1.5 font-bold tracking-tight">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                STORYBOARD ORIGINAL — SOURCE OF TRUTH
              </span>
              <button
                onClick={() => setZoomPreview(true)}
                className="hover:text-white p-0.5"
                title="Perbesar Preview"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Image Preview Box */}
            <div
              onClick={() => setZoomPreview(true)}
              className="relative aspect-video rounded-b-lg overflow-hidden border border-t-0 border-studio-border bg-black/60 group cursor-pointer"
            >
              <img
                src={imageMeta.dataUrl}
                alt="Storyboard Original"
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-medium gap-1.5">
                <Maximize2 className="w-4 h-4" />
                Klik untuk memperbesar
              </div>
            </div>

            {/* Metadata Card */}
            <div className="bg-studio-card rounded-lg p-2.5 border border-studio-border text-[11px] space-y-1 font-mono text-slate-300">
              <div className="flex justify-between truncate">
                <span className="text-slate-400">Nama File:</span>
                <span className="font-semibold text-slate-200 truncate ml-2" title={imageMeta.fileName}>
                  {imageMeta.fileName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ukuran:</span>
                <span className="text-slate-200">{imageMeta.fileSizeBytes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Resolusi:</span>
                <span className="text-slate-200">{imageMeta.width} × {imageMeta.height} px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Aspect Ratio:</span>
                <span className="text-indigo-300 font-bold">{imageMeta.detectedRatio} ({imageMeta.aspectRatio})</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECTION: Controls & Configurations */}
      <section className="bg-studio-card/70 border border-studio-border rounded-xl p-3.5 space-y-3.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 border-b border-studio-border/70 pb-2">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          Konfigurasi Video
        </div>

        {/* Scene Detection */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Scene Detection:
          </label>
          <div className="px-3 py-1.5 rounded-lg bg-studio-panel border border-studio-border text-xs text-indigo-300 font-semibold flex items-center justify-between">
            <span>[ Automatic Panel Detection ]</span>
            <span className="text-[10px] bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-400">
              Sequenced
            </span>
          </div>
        </div>

        {/* Video Duration */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-300">
              Video Duration:
            </label>
            <span className="text-xs font-bold text-amber-400 font-mono">
              {durationSeconds} seconds
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  if (opt.value === -1) {
                    const customVal = parseInt(customDurationInput) || 12;
                    onDurationChange(customVal);
                  } else {
                    onDurationChange(opt.value);
                  }
                }}
                className={`py-1.5 px-2 rounded-md text-xs font-medium border transition-all ${
                  (opt.value === -1 && ![5, 10, 15, 20, 30].includes(durationSeconds)) || durationSeconds === opt.value
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                    : 'bg-studio-panel border-studio-border text-slate-300 hover:border-slate-600'
                }`}
              >
                {opt.value === -1 ? 'Custom' : `${opt.value}s`}
              </button>
            ))}
          </div>

          {/* Custom Duration Input when selected */}
          {![5, 10, 15, 20, 30].includes(durationSeconds) && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="120"
                value={customDurationInput}
                onChange={(e) => {
                  setCustomDurationInput(e.target.value);
                  const parsed = parseInt(e.target.value);
                  if (parsed > 0) onDurationChange(parsed);
                }}
                placeholder="Detik..."
                className="w-full bg-studio-panel border border-indigo-500 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none"
              />
              <span className="text-xs text-slate-400">detik</span>
            </div>
          )}
        </div>

        {/* Aspect Ratio */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-300">
              Aspect Ratio:
            </label>
            {imageMeta && (
              <span className="text-[10px] text-cyan-400">
                Detected: {imageMeta.detectedRatio}
              </span>
            )}
          </div>
          <select
            value={aspectRatio}
            onChange={(e) => onAspectRatioChange(e.target.value as AspectRatioType)}
            className="w-full bg-studio-panel border border-studio-border hover:border-slate-600 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
          >
            {ASPECT_RATIO_OPTIONS.map((ratio) => (
              <option key={ratio} value={ratio}>
                {ratio === 'Auto Detect' && imageMeta
                  ? `Auto Detect (${imageMeta.detectedRatio})`
                  : ratio}
              </option>
            ))}
          </select>
        </div>

        {/* Style Presets */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Style:
          </label>
          <select
            value={stylePreset}
            onChange={(e) => onStylePresetChange(e.target.value as StylePresetType)}
            className="w-full bg-studio-panel border border-studio-border hover:border-slate-600 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
          >
            {STYLE_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-400 mt-1 italic">
            {STYLE_PRESETS.find(p => p.id === stylePreset)?.description}
          </p>

          {stylePreset === 'Custom' && (
            <input
              type="text"
              value={customStylePrompt || ''}
              onChange={(e) => onCustomStylePromptChange(e.target.value)}
              placeholder="Jelaskan custom style spesifik..."
              className="mt-2 w-full bg-studio-panel border border-studio-border rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          )}
        </div>

        {/* Prompt Mode */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Prompt Mode:
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {PROMPT_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => onPromptModeChange(mode.id)}
                className={`py-1.5 px-2 rounded-md text-xs font-semibold border transition-all text-center ${
                  promptMode === mode.id
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 border-indigo-500 text-white shadow-sm'
                    : 'bg-studio-panel border-studio-border text-slate-300 hover:border-slate-600'
                }`}
                title={mode.desc}
              >
                [ {mode.label} ]
              </button>
            ))}
          </div>
        </div>

        {/* Custom Instructions / Direction textarea */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Instruksi Sutradara (Opsional):
          </label>
          <textarea
            value={customInstructions}
            onChange={(e) => onCustomInstructionsChange(e.target.value)}
            rows={2}
            placeholder="Contoh: Tekankan debu tebal saat benturan; pertahankan framing sinematik 35mm..."
            className="w-full bg-studio-panel border border-studio-border rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-sans"
          />
        </div>

        {/* Primary CTA: [ Analisis Storyboard ] */}
        <button
          onClick={onAnalyzeStoryboard}
          disabled={isAnalyzing}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 shadow-glow-accent border border-indigo-400/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>MENGANALISIS STORYBOARD...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>ANALISIS STORYBOARD</span>
            </>
          )}
        </button>
      </section>

      {/* Modal Zoom Preview */}
      {zoomPreview && imageMeta && (
        <div
          onClick={() => setZoomPreview(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="max-w-6xl max-h-[90vh] bg-studio-panel border border-studio-border rounded-2xl overflow-hidden p-2 flex flex-col items-center">
            <div className="w-full flex justify-between items-center px-4 py-2 text-xs font-mono text-slate-300">
              <span className="font-bold text-indigo-400">STORYBOARD ORIGINAL — SOURCE OF TRUTH</span>
              <span>{imageMeta.width} × {imageMeta.height} px | {imageMeta.aspectRatio}</span>
            </div>
            <img
              src={imageMeta.dataUrl}
              alt="Zoomed Storyboard"
              className="max-h-[80vh] object-contain rounded-lg"
            />
            <p className="text-[11px] text-slate-400 mt-2">Klik di mana saja untuk menutup</p>
          </div>
        </div>
      )}
    </aside>
  );
};
