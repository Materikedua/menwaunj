import React, { useState, useEffect } from 'react';
import {
  IdCard,
  ShieldCheck,
  Phone,
  AlertCircle,
  X,
  ArrowRight,
  Loader2,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { normalizeWaNumber, getOfficialPortalByWhatsApp } from '../firebase.js';
import { navigate } from '../lib/router.jsx';

/**
 * Banner Akses Cepat + Drawer Pop-up Portal Official Kontingen GERANAT
 * Dirancang non-intrusif (slide-over drawer dari samping/bawah, bukan pop-up tengah layar)
 * dengan exit gate yang sangat jelas dan mudah ditemukan.
 */
export function OfficialPortalQuickAccess({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  showTriggerBanner = true,
  className = ''
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const setIsOpen = controlledOnClose !== undefined ? (val) => { if (!val) controlledOnClose(); } : setInternalOpen;

  const [waInput, setWaInput] = useState('');
  const [searchingWa, setSearchingWa] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Exit gate listener: tombol Escape untuk keluar cepat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Handler Login Nomor WhatsApp Official
  const handleWhatsAppLogin = async (e) => {
    e?.preventDefault();
    setLoginError('');
    const cleaned = normalizeWaNumber(waInput);
    if (!cleaned || cleaned.length < 8) {
      setLoginError('Nomor WhatsApp tidak valid. Masukkan minimal 8 digit angka.');
      return;
    }

    setSearchingWa(true);
    try {
      const matched = await getOfficialPortalByWhatsApp(cleaned);
      if (!matched || !matched.schoolSlug) {
        setLoginError('Nomor WhatsApp Anda tidak terdaftar sebagai Official Kontingen di event GERANAT.');
      } else {
        setLoginError('');
        setIsOpen(false);
        navigate(`/official/${matched.schoolSlug}`);
      }
    } catch (err) {
      console.warn('Gagal login portal official:', err);
      setLoginError('Terjadi gangguan saat memeriksa nomor WhatsApp. Silakan coba lagi.');
    } finally {
      setSearchingWa(false);
    }
  };

  return (
    <>
      {/* 1. Trigger Banner di Tab GERANAT */}
      {showTriggerBanner && (
        <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 backdrop-blur-xl bg-gradient-to-r from-[#006569]/90 via-[#004d50]/90 to-slate-900/90 text-white border border-white/20 shadow-2xl ${className}`}>
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 w-56 h-56 bg-[#4285F4]/25 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 w-56 h-56 bg-[#FFDD00]/15 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4285F4] to-[#364fc7] text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
                <IdCard size={28} />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[10px] font-black uppercase tracking-wider">
                    <ShieldCheck size={12} /> Portal Khusus Official
                  </span>
                  <span className="text-[10px] text-emerald-300 font-mono font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Akses Cepat WhatsApp
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Portal Official Kontingen GERANAT
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
                  Bagi Guru Pembina, Pelatih, & Official Kontingen: Akses kartu pasukan (ID Card), verifikasi berkas administrasi, dan unduh lembar rekap penilaian juri secara langsung.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#4285F4] to-[#364fc7] hover:from-[#3b77db] hover:to-[#2f44ad] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
              >
                <Phone size={15} />
                <span>Masuk Pakai WhatsApp</span>
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => navigate('/official')}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white border border-white/20 font-bold text-xs transition cursor-pointer"
              >
                <span>Halaman Portal</span>
                <ExternalLink size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Drawer Pop-up Slide-Over Non-Intrusif (Exit Gate Jelas & Mudah Ditemukan) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end font-sans">
          {/* Backdrop gelap transparan (klik untuk menutup / exit gate 1) */}
          <div
            onClick={() => setIsOpen(false)}
            aria-label="Tutup popup portal official"
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-fade-in"
          />

          {/* Panel Drawer Slide-Over dari Samping Kanan (Bukan pop up tengah layar!) */}
          <div
            className="relative z-10 w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300"
            role="dialog"
            aria-modal="true"
            aria-labelledby="portal-official-title"
          >
            {/* Header Drawer dengan EXIT GATE UTAMA */}
            <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#4285F4]/10 text-[#4285F4] flex items-center justify-center font-bold">
                  <IdCard size={20} />
                </div>
                <div>
                  <h4 id="portal-official-title" className="text-sm font-black text-slate-900 dark:text-white">
                    Login Portal Official
                  </h4>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Kontingen GERANAT Menwa UNJ
                  </span>
                </div>
              </div>

              {/* Tombol EXIT GATE yang sangat jelas dan mudah ditekan */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 text-xs font-black transition cursor-pointer border border-slate-200 dark:border-slate-700"
                title="Tutup (Tombol Escape)"
              >
                <X size={15} />
                <span>Tutup</span>
              </button>
            </div>

            {/* Isi Form Login Nomor WhatsApp */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center">
              {/* Badge Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4285F4] to-[#364fc7] text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25 mb-4">
                <Phone size={30} />
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Akses Cepat Official
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Masukkan nomor WhatsApp yang didaftarkan oleh official sekolah untuk membuka data kontingen.
                </p>
              </div>

              {/* Alert Error Box */}
              {loginError && (
                <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-800 p-4 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3 animate-fade-in">
                  <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />
                  <div className="space-y-1">
                    <p className="font-bold">{loginError}</p>
                    <p className="text-[11px] text-rose-600/80">
                      Pastikan nomor sesuai format tanpa angka 0 di depan atau hubungi panitia Mako jika belum didaftarkan.
                    </p>
                  </div>
                </div>
              )}

              {/* Form Input WhatsApp */}
              <form onSubmit={handleWhatsAppLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                    NOMOR WHATSAPP OFFICIAL
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3.5 focus-within:bg-white focus-within:border-[#4285F4] focus-within:ring-4 focus-within:ring-[#4285F4]/15 transition">
                    <span className="text-[#34A853] font-black text-sm select-none">
                      +62
                    </span>
                    <input
                      type="tel"
                      value={waInput}
                      onChange={(e) => {
                        setWaInput(e.target.value);
                        if (loginError) setLoginError('');
                      }}
                      placeholder="81234567890"
                      autoFocus
                      className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 font-bold text-sm sm:text-base focus:outline-none"
                    />
                  </div>
                  <span className="mt-1.5 block text-[11px] text-slate-500">
                    Tanpa angka 0 di depan. Contoh: <strong>81234567890</strong>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={searchingWa}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#364fc7] via-[#4285F4] to-[#5f3dc4] hover:opacity-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-60"
                >
                  {searchingWa ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Memeriksa Nomor...</span>
                    </>
                  ) : (
                    <>
                      <span>Buka Portal Kontingen</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Info Box */}
              <div className="mt-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 p-4 text-[11px] text-slate-600 dark:text-slate-400 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#FBBC05]" />
                  <span>Fitur yang Didapatkan Official:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                  <li>Unduh Lembar Rekap Nilai Juri Resmi GERANAT</li>
                  <li>Cetak ID Card Pasukan & Official Siap Pakai</li>
                  <li>Upload & Verifikasi Berkas Administrasi</li>
                  <li>Perbarui Profil Sekolah & Nomor Urut Tampil</li>
                </ul>
              </div>
            </div>

            {/* Footer Drawer dengan EXIT GATE KEDUA */}
            <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer text-center"
              >
                Batal & Kembali ke Halaman GERANAT
              </button>
              <div className="text-center">
                <span className="text-[10px] text-slate-400">
                  Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[9px]">Esc</kbd> atau klik di luar untuk menutup.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default OfficialPortalQuickAccess;
