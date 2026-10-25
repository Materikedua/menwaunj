import React, { useState } from 'react';
import { Shield, Lock, X, CheckCircle, AlertTriangle, Key, Terminal } from 'lucide-react';
import { useCanvasStore, AUTHORIZED_EMAIL } from '../lib/canvasStore.jsx';

export function CommandCenterLoginModal() {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginWithGoogle,
    loginWithPasscode,
  } = useCanvasStore();

  const [activeTab, setActiveTab] = useState('google'); // 'google' | 'terminal'
  const [googleEmailInput, setGoogleEmailInput] = useState(AUTHORIZED_EMAIL);
  const [username, setUsername] = useState('mako_admin');
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleGoogleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    setTimeout(() => {
      const res = loginWithGoogle(googleEmailInput.trim());
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    }, 400);
  };

  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    setTimeout(() => {
      const res = loginWithPasscode(username.trim(), passcode.trim());
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    }, 350);
  };

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[250] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={() => setIsLoginModalOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-center-auth-title"
        className="w-full max-w-lg bg-[#030f14] border border-[#006569]/80 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#006569]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FFDD00]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
          aria-label="Tutup gerbang login"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#006569] to-[#00383b] text-[#FFDD00] flex items-center justify-center border border-[#FFDD00]/40 shadow-lg shrink-0">
            <Lock size={22} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFDD00] block">
              SISTEM OTORISASI MAKO
            </span>
            <h3 id="command-center-auth-title" className="text-xl font-black text-white leading-tight">
              Command Center & AI Studio
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Akses terbatas khusus staf piket & administrator berwenang.
            </p>
          </div>
        </div>

        {/* Security Warning Notice */}
        <div className="mb-6 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <Shield size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
            Fitur Live Layout & Media Architect dapat memodifikasi struktur portal publik secara langsung.
            Harap verifikasi identitas Anda untuk mengaktifkan sesi komando.
          </p>
        </div>

        {/* Tabs: Google Auth vs Terminal Passcode */}
        <div className="flex border-b border-white/10 mb-6 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('google');
              setErrorMsg('');
            }}
            className={`pb-2.5 text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'google'
                ? 'border-[#FFDD00] text-[#FFDD00]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Google Account</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('terminal');
              setErrorMsg('');
            }}
            className={`pb-2.5 text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'terminal'
                ? 'border-[#FFDD00] text-[#FFDD00]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal size={14} />
            <span>Kredensial Terminal</span>
          </button>
        </div>

        {/* Error message if any */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: GOOGLE AUTH */}
        {activeTab === 'google' && (
          <form onSubmit={handleGoogleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Alamat Email Google Terotorisasi:
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="unjmenwa@gmail.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFDD00]"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Akun resmi: <strong className="text-[#FFDD00]">{AUTHORIZED_EMAIL}</strong>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || !googleEmailInput.trim()}
              className="w-full py-3 px-4 rounded-xl bg-[#006569] hover:bg-[#004d50] text-white font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {loading ? (
                <span>Memverifikasi Sesi...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.54 0 2.9.56 3.96 1.48l2.96-2.96C17.12 1.83 14.73 1 12 1 7.48 1 3.65 3.56 1.76 7.28l3.66 2.84C6.3 7.42 8.9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.7 2.87c2.16-2 3.72-4.94 3.72-8.69z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.42 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12L1.76 7.04C.64 9.27 0 11.55 0 14s.64 4.73 1.76 6.96l3.66-2.84z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.7-2.87c-1.07.72-2.45 1.16-4.23 1.16-3.1 0-5.7-2.42-6.58-5.12L1.76 16.1C3.65 19.82 7.48 23 12 23z"
                    />
                  </svg>
                  <span>Masuk dengan Google (unjmenwa@gmail.com)</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: TERMINAL LOCALHOST CREDENTIALS */}
        {activeTab === 'terminal' && (
          <form onSubmit={handleTerminalSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Username Staf:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="mako_admin"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FFDD00]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Passcode Otorisasi:</label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Masukkan passcode terminal..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FFDD00]"
              />
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                Localhost default passcode: <code>MENWA-MAKO-2026</code>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || !passcode}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#006569] to-[#00383b] hover:from-[#004d50] hover:to-[#002729] text-white font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Key size={15} />
              <span>{loading ? 'Mengotentikasi...' : 'Otorisasi Kredensial Mako'}</span>
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500">
          <span>Resimen Mahasiswa UNJ</span>
          <span className="text-[#FFDD00] font-mono">Widya Castrena Dharma Siddha</span>
        </div>
      </div>
    </div>
  );
}
