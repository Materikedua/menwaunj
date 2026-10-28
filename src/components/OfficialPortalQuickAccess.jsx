import React, { useState, useEffect } from 'react';
import {
  FileText,
  UserCheck,
  Shield,
  Phone,
  AlertCircle,
  X,
  ArrowRight,
  LogIn,
  Loader2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Users
} from 'lucide-react';
import { normalizeWaNumber, getOfficialPortalByWhatsApp } from '../firebase.js';
import { navigate } from '../lib/router.jsx';

/**
 * Section Portal Pelatih & Official Kontingen GERANAT
 * Sesuai referensi visual resmi:
 * - Badge Pill: PORTAL PELATIH EKSKLUSIF
 * - Judul: Manajemen Peserta & Nilai
 * - Card: Semua Kebutuhan Pelatih dalam Satu Pintu
 * - Ilustrasi 3D Document Squircle dengan Skeleton Bars
 * - Tombol: Masuk ke Portal Pelatih (membuka Slide-Over Drawer WhatsApp dengan Exit Gate Jelas)
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

  // Exit gate keyboard listener: Escape menutup drawer
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
        setLoginError('Nomor WhatsApp Anda tidak terdaftar sebagai Pelatih/Official Kontingen di event GERANAT.');
      } else {
        setLoginError('');
        setIsOpen(false);
        navigate(`/official/${matched.schoolSlug}`);
      }
    } catch (err) {
      console.warn('Gagal login portal pelatih/official:', err);
      setLoginError('Terjadi gangguan saat memeriksa nomor WhatsApp. Silakan coba lagi.');
    } finally {
      setSearchingWa(false);
    }
  };

  return (
    <>
      {/* 1. SECTION REFERENSI RESMI: Manajemen Peserta & Nilai */}
      {showTriggerBanner && (
        <section className={`w-full font-sans ${className}`}>
          
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            {/* Pill Atas */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[#3b82f6] text-[11px] font-black uppercase tracking-wider mb-4 shadow-xs">
              <span>PORTAL PELATIH EKSKLUSIF</span>
            </div>

            {/* Judul Besar Dua Warna */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Manajemen <span className="text-[#3b82f6]">Peserta & Nilai</span>
            </h2>

            {/* Deskripsi Subtitle */}
            <p className="mt-3.5 text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Akses khusus bagi pelatih untuk mendaftarkan peserta, mengunggah dokumen administrasi, memantau riwayat evaluasi, dan melacak perkembangan performa tim di seluruh event yang terdaftar.
            </p>
          </div>

          {/* Kartu Putih Utama (Bentuk Rounded Modern Sesuai Referensi) */}
          <div className="relative rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.08)] p-8 sm:p-12 lg:p-14 overflow-hidden">
            
            {/* Subtle Ambient Glow di background */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Kolom Kiri: Teks & Tombol Masuk */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                
                {/* Badge Ikon Pelatih (User + Shield) */}
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 text-[#3b82f6] flex items-center justify-center mb-6 shadow-xs">
                  <div className="relative">
                    <Users size={22} className="stroke-[2.5]" />
                    <Shield size={13} className="absolute -bottom-1 -right-1 text-[#2563eb] fill-[#3b82f6]" />
                  </div>
                </div>

                {/* Headline: Semua Kebutuhan Pelatih dalam Satu Pintu */}
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                  Semua Kebutuhan Pelatih dalam <span className="text-[#3b82f6]">Satu Pintu</span>
                </h3>

                {/* Deskripsi Body */}
                <p className="mt-4 text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
                  Mulai dari pendaftaran biodata peserta (Danton, Pasukan, dll), unggah dokumen persyaratan, hingga pantau riwayat evaluasi dan nilai tim Anda dari seluruh kompetisi.
                </p>

                {/* Tombol Aksi: Masuk ke Portal Pelatih */}
                <div className="mt-8 flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                  >
                    <LogIn size={18} className="stroke-[2.5]" />
                    <span>Masuk ke Portal Pelatih</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/official')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
                  >
                    <span>Jelajahi Portal</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>

              {/* Kolom Kanan: Ilustrasi Kartu 3D File Icon + Skeleton Lines Sesuai Referensi */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="w-full max-w-sm rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-gradient-to-b from-slate-50/90 to-slate-100/40 dark:from-slate-800/40 dark:to-slate-900/40 p-8 sm:p-12 flex flex-col items-center justify-center min-h-[260px] shadow-inner relative group transition-all duration-300 hover:shadow-md">
                  
                  {/* Subtle Glowing Orb di Belakang Ikon */}
                  <div className="absolute w-28 h-28 bg-blue-500/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />

                  {/* Tile Ikon File Dokumen Biru Mengkilap Elevated */}
                  <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] text-white flex items-center justify-center shadow-[0_16px_36px_-6px_rgba(37,99,235,0.5)] group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300">
                    <FileText size={38} className="stroke-[2.2]" />
                  </div>

                  {/* Soft Under-glow Shadow Bar */}
                  <div className="w-16 h-3 bg-blue-500/25 blur-sm rounded-full mt-2" />

                  {/* Skeleton Preview Indicator Lines */}
                  <div className="w-32 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-5 transition-all group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50" />
                  <div className="w-24 h-2.5 rounded-full bg-slate-200/70 dark:bg-slate-700/60 mt-2.5 transition-all group-hover:bg-blue-100 dark:group-hover:bg-blue-950/60" />
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* 2. DRAWER POP-UP SLIDE-OVER NON-INTRUSIF (EXIT GATE SANGAT JELAS) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end font-sans">
          {/* Backdrop transparan (klik luar untuk tutup) */}
          <div
            onClick={() => setIsOpen(false)}
            aria-label="Tutup popup portal pelatih"
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-fade-in"
          />

          {/* Panel Drawer Slide-Over dari Samping Kanan (Bukan pop up tengah layar!) */}
          <div
            className="relative z-10 w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300"
            role="dialog"
            aria-modal="true"
            aria-labelledby="portal-pelatih-title"
          >
            {/* Header Drawer dengan EXIT GATE UTAMA */}
            <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#3b82f6] flex items-center justify-center font-bold">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h4 id="portal-pelatih-title" className="text-sm font-black text-slate-900 dark:text-white">
                    Login Portal Pelatih & Official
                  </h4>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    GERANAT Satuan Menwa UNJ
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30 mb-4">
                <Phone size={28} />
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Akses Cepat WhatsApp
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Masukkan nomor WhatsApp pelatih/official yang telah terdaftar untuk membuka data kontingen Anda.
                </p>
              </div>

              {/* Alert Error Box */}
              {loginError && (
                <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-800 p-4 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3 animate-fade-in">
                  <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />
                  <div className="space-y-1">
                    <p className="font-bold">{loginError}</p>
                    <p className="text-[11px] text-rose-600/80">
                      Pastikan nomor sesuai format tanpa angka 0 di depan atau hubungi panitia Mako jika belum terdaftar.
                    </p>
                  </div>
                </div>
              )}

              {/* Form Input WhatsApp */}
              <form onSubmit={handleWhatsAppLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                    NOMOR WHATSAPP TERDAFTAR
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3.5 focus-within:bg-white focus-within:border-[#3b82f6] focus-within:ring-4 focus-within:ring-blue-500/15 transition">
                    <span className="text-[#3b82f6] font-black text-sm select-none">
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
                  className="w-full py-4 px-6 rounded-2xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-60 active:scale-95"
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
                  <Sparkles size={13} className="text-[#3b82f6]" />
                  <span>Kebutuhan Pelatih dalam Satu Pintu:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                  <li>Unduh Lembar Rekap Nilai Juri Resmi GERANAT</li>
                  <li>Cetak ID Card Pasukan & Official Siap Pakai</li>
                  <li>Upload & Verifikasi Berkas Administrasi</li>
                  <li>Pantau Riwayat Evaluasi & Nomor Urut Tampil</li>
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
