import React, { useState } from 'react';
import {
  X,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Radio,
  ExternalLink,
  ShieldCheck,
  Server
} from 'lucide-react';
import { ConnectionStatus } from '../types/storyboard';
import { GeminiService } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionStatusChange: (status: ConnectionStatus) => void;
  connectionStatus: ConnectionStatus;
  connectionMessage: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onConnectionStatusChange,
  connectionStatus,
  connectionMessage
}) => {
  const [apiKey, setApiKey] = useState<string>(GeminiService.getApiKey());
  const [model, setModel] = useState<string>(GeminiService.getModel());
  const [showKey, setShowKey] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    GeminiService.saveConfig(apiKey, model);
    if (!apiKey.trim()) {
      onConnectionStatusChange('DISCONNECTED');
    }
    onClose();
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    onConnectionStatusChange('TESTING');

    GeminiService.saveConfig(apiKey, model);
    const result = await GeminiService.testConnection(apiKey);

    setIsTesting(false);
    setTestResult(result);
    onConnectionStatusChange(result.success ? 'CONNECTED' : 'ERROR');
  };

  const handleClear = () => {
    if (confirm('Hapus API Key yang tersimpan di browser ini?')) {
      setApiKey('');
      GeminiService.clearKey();
      onConnectionStatusChange('DISCONNECTED');
      setTestResult(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-studio-panel border border-studio-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-studio-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="modal-title" className="text-base font-bold text-white">
                  API & PENGATURAN
                </h3>
                <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.5 rounded font-extrabold tracking-wide">
                  BYOK
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Konfigurasi Google Gemini Vision & AI Video Prompt Generator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-studio-card transition-colors"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connection Status Badge */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-studio-card border border-studio-border">
          <span className="text-xs font-semibold text-slate-300">Status Koneksi API:</span>
          {connectionStatus === 'CONNECTED' && (
            <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              CONNECTED
            </span>
          )}
          {connectionStatus === 'DISCONNECTED' && (
            <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
              <Radio className="w-4 h-4 text-slate-500" />
              DISCONNECTED
            </span>
          )}
          {connectionStatus === 'ERROR' && (
            <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/30">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              ERROR
            </span>
          )}
          {connectionStatus === 'TESTING' && (
            <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              TESTING...
            </span>
          )}
        </div>

        {/* API Key Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200">
              Google Gemini API Key:
            </label>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Dapatkan API Key gratis di Google AI Studio
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Masukkan AI Studio API Key (AIzaSy...)"
              className="w-full bg-studio-card border border-studio-border hover:border-slate-600 rounded-xl px-3.5 py-2.5 pr-20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono tracking-wider"
              autoComplete="off"
              spellCheck={false}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200 rounded font-medium flex items-center gap-1"
                title={showKey ? 'Sembunyikan Key' : 'Tampilkan Key'}
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showKey ? 'HIDE' : 'SHOW'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Model Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            Pilih Model Gemini:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'gemini-3.8-flash', label: 'gemini-3.8-flash (Recommended)', desc: '1M tokens, cepat & akurat untuk visual storyboard' },
              { id: 'gemini-2.5-flash', label: 'gemini-2.5-flash', desc: 'Standar multimodal vision' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setModel(m.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  model === m.id
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-glow-accent'
                    : 'bg-studio-card border-studio-border text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="font-mono text-xs font-bold text-indigo-300">{m.id}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Test Result Message Box */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs ${
              testResult.success
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="font-semibold flex items-center gap-1.5">
              {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
              {testResult.success ? 'Koneksi Berhasil' : 'Koneksi Gagal'}
            </div>
            <p className="mt-1 text-[11px] leading-relaxed">{testResult.message}</p>
          </div>
        )}

        {/* Security & Privacy Notice */}
        <div className="bg-black/30 border border-studio-border/70 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Privasi & Keamanan Terjamin (BYOK):</strong> API Key Anda hanya disimpan di penyimpanan lokal browser Anda (LocalStorage) dan dikirim langsung ke endpoint resmi Google Gemini. Kunci tidak pernah di-log ke console ataupun disimpan ke server perantara.
          </p>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-studio-border">
          {apiKey ? (
            <button
              onClick={handleClear}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium"
            >
              Hapus Key
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={handleTest}
              disabled={isTesting || !apiKey.trim()}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-studio-card hover:bg-studio-cardHover border border-studio-border text-slate-200 hover:text-white disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>TEST CONNECTION</span>
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-accent transition-colors"
            >
              Simpan & Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
