import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Phone,
  Mail,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  FileText,
  Clock,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { setLockdownState } from '../firebase.js';

export function EmergencyLockdownScreen({ lockdownConfig, onAdminUnlockSuccess }) {
  const { user, isStaffAdmin, signInWithGoogle, signInWithEmail } = useAuth();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const headline = lockdownConfig?.headline || 'SISTEM SIAGA 1 — MODE PEMELIHARAAN & INTEGRITAS KEAMANAN SIBER RESMI';
  const message =
    lockdownConfig?.message ||
    'Komando Resimen Mahasiswa Jayakarta Satuan UNJ sedang melakukan audit integritas sistem dan pemeliharaan keamanan berkala. Seluruh akses publik dinonaktifkan sementara demi menjamin keaslian informasi resmi satuan.';

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const loggedUser = await signInWithEmail(email.trim(), password);
      if (loggedUser) {
        setShowAdminModal(false);
        if (onAdminUnlockSuccess) onAdminUnlockSuccess();
      }
    } catch (err) {
      setErrorMsg('Autentikasi gagal. Akun tidak memiliki hak akses Komando atau kata sandi tidak valid.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const loggedUser = await signInWithGoogle();
      if (loggedUser) {
        setShowAdminModal(false);
        if (onAdminUnlockSuccess) onAdminUnlockSuccess();
      }
    } catch (err) {
      setErrorMsg('Gagal masuk via Google OAuth. Pastikan email terdaftar di jajaran staf komando.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b0e] text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden select-none">
      {/* Background Matrix / Radar Grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#006569_1px,transparent_1px)] [background-size:28px_28px] opacity-25 pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#006569]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Banner Status */}
      <header className="relative z-10 w-full border-b border-amber-500/30 bg-[#0c141a]/90 backdrop-blur-md px-4 py-3 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-300 font-mono font-bold tracking-wider">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
            <span>PROTOKOL TANGGAP DARURAT SIBER SATUAN (SIAGA 1)</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>REF: KORPS-MENWA-UNJ/SEC-OPS</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">ISO/IEC 27037 FORENSIC SHIELD</span>
          </div>
        </div>
      </header>

      {/* Center Tactical Card */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-3xl bg-[#0f171d] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-10 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] space-y-8">
          {/* Header Seal */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#00383b] via-[#006569] to-[#0a2024] p-3 border-2 border-[#FFDD00]/60 shadow-[0_0_35px_rgba(255,221,0,0.25)] flex items-center justify-center">
                <img
                  src="/logo-menwa-unj.png"
                  alt="Insignia Menwa UNJ"
                  className="w-full h-full object-contain filter drop-shadow-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 p-1.5 rounded-full shadow">
                <ShieldAlert size={16} />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-black uppercase tracking-[0.3em] text-[#FFDD00] block">
                MARKAS KOMANDO RESIMEN MAHASISWA JAYAKARTA
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                SATUAN UNIVERSITAS NEGERI JAKARTA
              </h1>
            </div>
          </div>

          {/* Alert Message Box */}
          <div className="rounded-2xl bg-amber-950/40 border border-amber-500/40 p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2.5 text-amber-300 text-sm font-black uppercase tracking-wider">
              <AlertTriangle size={18} className="shrink-0 text-amber-400" />
              <span>{headline}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              {message}
            </p>
          </div>

          {/* Legal Protection Statement (UU ITE Defense) */}
          <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-4 sm:p-5 text-[11px] text-slate-400 leading-relaxed space-y-2">
            <div className="flex items-center gap-2 text-teal-300 font-bold uppercase tracking-wider text-[10px]">
              <FileText size={14} />
              <span>Pemberitahuan Hukum & Perlindungan Integritas Informasi</span>
            </div>
            <p>
              Segala bentuk modifikasi tidak sah, klaim palsu, atau transmisi konten ilegal oleh pihak ketiga yang
              mencoba merusak kehormatan nama baik institusi sedang dalam proses penelusuran forensik digital dan
              berada dalam perlindungan hukum berdasarkan <strong>Pasal 30, 32, dan 46 UU RI No. 1 Tahun 2024 (UU ITE)</strong>.
              Tidak ada pernyataan di luar saluran resmi berstempel Komando yang memiliki kekuatan hukum mengikat.
            </p>
          </div>

          {/* Actions & Verified Hotline */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <a
              href="https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20verifikasi%20informasi%20resmi"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-2xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2"
            >
              <Phone size={15} />
              <span>Verifikasi Piket Mako 24 Jam</span>
            </a>

            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound size={15} />
              <span>Akses Khusus Perwira Mako</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/10 bg-[#070b0e] py-4 px-4 text-center text-[11px] text-slate-500 font-mono">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>WIDYA CASTRENA DHARMA SIDDHA</span>
          <span>© 2026 Resimen Mahasiswa Satuan UNJ. Hak Cipta Dilindungi.</span>
        </div>
      </footer>

      {/* Emergency Admin Login Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#162026] border border-amber-500/60 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Lock size={16} />
                <span>Otorisasi Perwira Komando</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Tutup
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Email Perwira / Staf:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="unjmenwa@gmail.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1">Kata Sandi:</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black uppercase tracking-wider transition shadow-lg cursor-pointer"
              >
                {loading ? 'Memverifikasi...' : 'Masuk Command Center'}
              </button>
            </form>

            <div className="pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleAdminGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Masuk dengan Google OAuth Perwira
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
