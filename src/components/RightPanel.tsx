import React, { useState } from 'react';
import {
  Code2,
  FileText,
  Copy,
  Download,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  Wrench,
  Check,
  Layers,
  CheckCheck
} from 'lucide-react';
import { ValidationResult } from '../types/storyboard';

interface RightPanelProps {
  masterPrompt: string;
  onMasterPromptChange: (val: string) => void;
  rawJsonString: string;
  onRawJsonChange: (val: string) => void;
  validationResult: ValidationResult;
  onAutoFixJson: () => void;
  onOptimizePrompt: () => void;
  isOptimizingPrompt: boolean;
  onCopyPrompt: () => void;
  onCopyJson: () => void;
  onCopyAllScenes: () => void;
  onDownloadJson: () => void;
  onDownloadPrompt: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  masterPrompt,
  onMasterPromptChange,
  rawJsonString,
  onRawJsonChange,
  validationResult,
  onAutoFixJson,
  onOptimizePrompt,
  isOptimizingPrompt,
  onCopyPrompt,
  onCopyJson,
  onCopyAllScenes,
  onDownloadJson,
  onDownloadPrompt
}) => {
  const [activeTab, setActiveTab] = useState<'PROMPT' | 'JSON'>('PROMPT');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const triggerCopy = (type: string, fn: () => void) => {
    fn();
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <aside className="w-full lg:w-[420px] xl:w-[480px] flex-shrink-0 bg-studio-panel border-l border-studio-border p-4 flex flex-col h-full overflow-hidden space-y-3.5">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-studio-border pb-2.5">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            PROMPT OUTPUT
          </h2>
          <p className="text-[11px] text-slate-400">
            Image-to-Video Master Prompt & Structured Schema
          </p>
        </div>

        {/* JSON Validator Badge */}
        <div className="flex items-center gap-1.5">
          {validationResult.isValid ? (
            <span className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              JSON VALID
            </span>
          ) : (
            <div className="flex items-center gap-1">
              <span className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertOctagon className="w-3 h-3" />
                JSON ERROR
              </span>
              <button
                onClick={onAutoFixJson}
                className="flex items-center gap-1 text-[10px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded transition-colors"
                title="Perbaiki format JSON secara otomatis"
              >
                <Wrench className="w-2.5 h-2.5" />
                Auto-Fix
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Switcher: [ PROMPT ] vs [ JSON ] */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex rounded-lg bg-studio-card p-1 border border-studio-border text-xs w-full">
          <button
            onClick={() => setActiveTab('PROMPT')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'PROMPT'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            [ PROMPT ]
          </button>
          <button
            onClick={() => setActiveTab('JSON')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'JSON'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            [ JSON ]
          </button>
        </div>

        {/* Section 23: Prompt Optimizer Button */}
        {activeTab === 'PROMPT' && (
          <button
            onClick={onOptimizePrompt}
            disabled={isOptimizingPrompt}
            className="flex-shrink-0 flex items-center gap-1 px-2.5 py-2 rounded-lg text-[11px] font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white border border-cyan-400/40 shadow-glow-cyan transition-all disabled:opacity-50"
            title="Optimalkan kejelasan prompt untuk image-to-video generator tanpa mengubah arti storyboard"
          >
            <Sparkles className="w-3 h-3 text-cyan-200" />
            <span>{isOptimizingPrompt ? 'OPTIMALKAN...' : 'OPTIMALKAN PROMPT'}</span>
          </button>
        )}
      </div>

      {/* Content Area: Editor */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {activeTab === 'PROMPT' ? (
          <div className="flex-1 flex flex-col min-h-0">
            <textarea
              value={masterPrompt}
              onChange={(e) => onMasterPromptChange(e.target.value)}
              placeholder="Hasil generate prompt image-to-video..."
              className="flex-1 w-full bg-studio-card border border-studio-border hover:border-slate-700 rounded-xl p-3 text-xs text-slate-100 font-mono leading-relaxed placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none overflow-y-auto"
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <textarea
              value={rawJsonString}
              onChange={(e) => onRawJsonChange(e.target.value)}
              placeholder="Structured JSON schema..."
              className="flex-1 w-full bg-studio-card border border-studio-border hover:border-slate-700 rounded-xl p-3 text-xs text-cyan-200 font-mono leading-relaxed placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none overflow-y-auto"
              spellCheck={false}
            />

            {/* Validation issues list */}
            {validationResult.issues.length > 0 && (
              <div className="mt-2 max-h-24 overflow-y-auto bg-black/40 rounded-lg p-2 border border-studio-border text-[11px] font-mono space-y-1">
                {validationResult.issues.map((iss, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-1.5 ${
                      iss.severity === 'error' ? 'text-rose-400' : 'text-amber-400'
                    }`}
                  >
                    <span>•</span>
                    <span>
                      <strong className="text-slate-300">[{iss.field}]</strong> {iss.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 17: COPY ACTIONS */}
      <div className="space-y-2 pt-2 border-t border-studio-border">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Clipboard Actions
        </div>
        <div className="grid grid-cols-3 gap-2">
          {/* COPY PROMPT */}
          <button
            onClick={() => triggerCopy('prompt', onCopyPrompt)}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold bg-studio-card hover:bg-studio-cardHover border border-studio-border text-slate-200 hover:text-white transition-all shadow-sm"
          >
            {copiedType === 'prompt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
            <span className="truncate">COPY PROMPT</span>
          </button>

          {/* COPY JSON */}
          <button
            onClick={() => triggerCopy('json', onCopyJson)}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold bg-studio-card hover:bg-studio-cardHover border border-studio-border text-slate-200 hover:text-white transition-all shadow-sm"
          >
            {copiedType === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="truncate">COPY JSON</span>
          </button>

          {/* COPY ALL SCENES */}
          <button
            onClick={() => triggerCopy('all-scenes', onCopyAllScenes)}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold bg-studio-card hover:bg-studio-cardHover border border-studio-border text-slate-200 hover:text-white transition-all shadow-sm"
          >
            {copiedType === 'all-scenes' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Layers className="w-3.5 h-3.5 text-amber-400" />}
            <span className="truncate">ALL SCENES</span>
          </button>
        </div>
      </div>

      {/* SECTION 18: DOWNLOAD ACTIONS */}
      <div className="grid grid-cols-2 gap-2">
        {/* DOWNLOAD JSON */}
        <button
          onClick={onDownloadJson}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold bg-studio-card hover:bg-studio-cardHover border border-studio-border text-cyan-300 hover:text-cyan-200 transition-all shadow-sm"
          title="Download schema image-to-video-storyboard-10s.json"
        >
          <Download className="w-3.5 h-3.5" />
          <span>DOWNLOAD JSON</span>
        </button>

        {/* DOWNLOAD PROMPT */}
        <button
          onClick={onDownloadPrompt}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold bg-studio-card hover:bg-studio-cardHover border border-studio-border text-indigo-300 hover:text-indigo-200 transition-all shadow-sm"
          title="Download prompt .txt"
        >
          <Download className="w-3.5 h-3.5" />
          <span>DOWNLOAD PROMPT</span>
        </button>
      </div>
    </aside>
  );
};
