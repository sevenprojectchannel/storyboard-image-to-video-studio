import React from 'react';
import {
  Film,
  KeyRound,
  Sparkles,
  Save,
  Download,
  Upload,
  Layers,
  Clock,
  Code2,
  FileText,
  CheckCircle2,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { AppViewMode } from '../types/storyboard';

interface HeaderProps {
  status: 'READY' | 'ANALYZING' | 'VALIDATING' | 'ERROR';
  autoAnalyze: boolean;
  onToggleAutoAnalyze: (value: boolean) => void;
  activeView: AppViewMode;
  onViewChange: (view: AppViewMode) => void;
  onOpenSettings: () => void;
  onSaveProject: () => void;
  onExportProject: () => void;
  onLoadSample: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  autoAnalyze,
  onToggleAutoAnalyze,
  activeView,
  onViewChange,
  onOpenSettings,
  onSaveProject,
  onExportProject,
  onLoadSample,
  hasApiKey
}) => {
  return (
    <header className="bg-studio-panel border-b border-studio-border sticky top-0 z-40 px-4 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3 max-w-[1920px] mx-auto">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-glow-accent text-white">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                STORYBOARD IMAGE TO VIDEO STUDIO
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO v1.0
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Status:</span>
              {status === 'READY' && (
                <span className="flex items-center gap-1 font-semibold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  READY
                </span>
              )}
              {status === 'ANALYZING' && (
                <span className="flex items-center gap-1 font-semibold text-amber-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  ANALYZING STORYBOARD...
                </span>
              )}
              {status === 'VALIDATING' && (
                <span className="flex items-center gap-1 font-semibold text-cyan-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  VALIDATING JSON...
                </span>
              )}
              {status === 'ERROR' && (
                <span className="flex items-center gap-1 font-semibold text-rose-400">
                  <AlertTriangle className="w-3 h-3" />
                  ANALISIS AI GAGAL
                </span>
              )}
            </div>
          </div>
        </div>

        {/* View Switcher: [ STORYBOARD ] [ TIMELINE ] [ JSON ] [ PROMPT ] */}
        <nav className="flex items-center bg-studio-card/80 p-1 rounded-lg border border-studio-border text-xs" aria-label="View Modes">
          <button
            onClick={() => onViewChange('STORYBOARD')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeView === 'STORYBOARD'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-studio-panel'
            }`}
            aria-label="Tampilan Storyboard"
          >
            <Layers className="w-3.5 h-3.5" />
            STORYBOARD
          </button>
          <button
            onClick={() => onViewChange('TIMELINE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeView === 'TIMELINE'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-studio-panel'
            }`}
            aria-label="Tampilan Timeline"
          >
            <Clock className="w-3.5 h-3.5" />
            TIMELINE
          </button>
          <button
            onClick={() => onViewChange('PROMPT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeView === 'PROMPT'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-studio-panel'
            }`}
            aria-label="Tampilan Master Prompt"
          >
            <FileText className="w-3.5 h-3.5" />
            PROMPT
          </button>
          <button
            onClick={() => onViewChange('JSON')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeView === 'JSON'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-studio-panel'
            }`}
            aria-label="Tampilan JSON Output"
          >
            <Code2 className="w-3.5 h-3.5" />
            JSON
          </button>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Sample Button */}
          <button
            onClick={onLoadSample}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
            title="Muat storyboard contoh duel pertarungan 5-scene 10-detik"
            aria-label="Muat Contoh Storyboard"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Load Sample (5 Scenes)</span>
          </button>

          {/* AI Auto Analysis Toggle */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-studio-card border border-studio-border text-xs">
            <span className="text-slate-400 font-medium hidden md:inline">Analisis Otomatis AI:</span>
            <button
              onClick={() => onToggleAutoAnalyze(!autoAnalyze)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-indigo-400 ${
                autoAnalyze ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
              role="switch"
              aria-checked={autoAnalyze}
              aria-label="Toggle Analisis Otomatis AI"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  autoAnalyze ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`font-mono text-[11px] font-bold ${autoAnalyze ? 'text-indigo-400' : 'text-slate-500'}`}>
              {autoAnalyze ? 'ON' : 'OFF'}
            </span>
          </div>

          {/* Local Save Project */}
          <button
            onClick={onSaveProject}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-200 bg-studio-card hover:bg-studio-cardHover border border-studio-border transition-colors"
            title="Simpan project ke LocalStorage browser"
            aria-label="Simpan Project"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Save</span>
          </button>

          {/* Export Project */}
          <button
            onClick={onExportProject}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-200 bg-studio-card hover:bg-studio-cardHover border border-studio-border transition-colors"
            title="Ekspor project ke file JSON"
            aria-label="Export Project"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Export</span>
          </button>

          {/* API & Pengaturan with BYOK Badge */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-glow-accent border border-indigo-400/30 transition-all cursor-pointer"
            aria-label="Buka API dan Pengaturan"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>API & PENGATURAN</span>
            <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded font-extrabold tracking-wide">
              BYOK
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
