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
  Users,
  IdCard,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { normalizeWaNumber, getOfficialPortalByWhatsApp } from '../firebase.js';
import { navigate } from '../lib/router.jsx';
import BorderBeam from './ui/BorderBeam.jsx';

/**
 * Section Portal Official Kontingen GERANAT
 * Sesuai arahan:
 * - Kata "Pelatih" diganti menjadi "Official"
 * - Aksen warna biru diganti menjadi Kuning / Emas Menwa UNJ (#FBBC05 / #FFDD00)
 * - Background div berwarna putih murni (bg-white)
 * - Border dianimasikan menggunakan komponen BorderBeam.jsx
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
      {/* 1. SECTION REFERENSI RESMI: Manajemen Peserta & Nilai (Official) */}
      {showTriggerBanner && (
        <section id="portal-official" className={`w-full font-sans scroll-mt-24 ${className}`}>
          
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            {/* Pill Atas (Kuning Emas) */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-black uppercase tracking-wider mb-4 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>PORTAL OFFICIAL EKSKLUSIF</span>
            </div>

            {/* Judul Besar Dua Warna: Hitam & Kuning Emas */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Manajemen <span className="text-amber-500">Peserta & Nilai</span>
            </h2>

            {/* Deskripsi Subtitle */}
            <p className="mt-3.5 text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Akses khusus bagi official untuk mendaftarkan peserta, mengunggah dokumen administrasi, memantau riwayat evaluasi, dan melacak perkembangan performa tim di seluruh event yang terdaftar.
            </p>
          </div>

          {/* Kartu Putih Utama dengan BorderBeam Kuning Emas */}
          <div className="relative rounded-[2.5rem] bg-white border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(251,188,5,0.12)] p-8 sm:p-12 lg:p-14 overflow-hidden text-slate-900">
            
            {/* Animasi Berkas Sinar Laser BorderBeam (Kuning Emas) */}
            <BorderBeam
              duration={5.5}
              borderWidth={2.5}
              borderRadius={40}
              colorFrom="#FFDD00"
              colorTo="#F59E0B"
            />

            {/* Subtle Ambient Light Orbs Kuning */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Kolom Kiri: Teks & Tombol Masuk */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                
                {/* Badge Ikon Official (Users + Shield Kuning) */}
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-6 shadow-xs">
                  <div className="relative">
                    <Users size={24} className="stroke-[2.5] text-amber-600" />
                    <Shield size={13} className="absolute -bottom-1 -right-1 text-amber-700 fill-amber-400" />
                  </div>
                </div>

                {/* Headline: Semua Kebutuhan Official dalam Satu Pintu */}
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                  Semua Kebutuhan Official dalam <span className="text-amber-500">Satu Pintu</span>
                </h3>

                {/* Deskripsi Body */}
                <p className="mt-4 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed max-w-lg">
                  Mulai dari pendaftaran biodata peserta (Danton, Pasukan, dll), unggah dokumen persyaratan, hingga pantau riwayat evaluasi dan nilai tim Anda dari seluruh kompetisi.
                </p>

                {/* Tombol Aksi Kuning Emas: Masuk ke Portal Official */}
                <div className="mt-8 flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#FBBC05] hover:bg-[#eab308] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                  >
                    <LogIn size={18} className="stroke-[2.5]" />
                    <span>Masuk ke Portal Official</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/official')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer border border-slate-200"
                  >
                    <span>Jelajahi Portal</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>

              {/* Kolom Kanan: Ilustrasi Kartu 3D File Icon Kuning Emas + Skeleton Lines */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="w-full max-w-sm rounded-[2rem] border border-amber-100 bg-gradient-to-b from-amber-50/60 to-white p-8 sm:p-12 flex flex-col items-center justify-center min-h-[260px] shadow-inner relative group transition-all duration-300 hover:shadow-md">
                  
                  {/* Subtle Glowing Orb Kuning di Belakang Ikon */}
                  <div className="absolute w-28 h-28 bg-amber-400/25 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />

                  {/* Tile Ikon File Dokumen Kuning Emas Elevated */}
                  <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FBBC05] via-[#F59E0B] to-[#D97706] text-slate-950 flex items-center justify-center shadow-[0_16px_36px_-6px_rgba(245,158,11,0.5)] group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300">
                    <FileText size={38} className="stroke-[2.2] text-slate-950" />
                  </div>

                  {/* Soft Under-glow Shadow Bar Kuning */}
                  <div className="w-16 h-3 bg-amber-500/30 blur-sm rounded-full mt-2" />

                  {/* Skeleton Preview Indicator Lines */}
                  <div className="w-32 h-2.5 rounded-full bg-slate-200 mt-5 transition-all group-hover:bg-amber-200" />
                  <div className="w-24 h-2.5 rounded-full bg-slate-200/70 mt-2.5 transition-all group-hover:bg-amber-100" />
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
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h4 id="portal-official-title" className="text-sm font-black text-slate-900 dark:text-white">
                    Login Portal Official
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
              {/* Badge Icon Kuning Emas */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FBBC05] to-[#F59E0B] text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30 mb-4">
                <Phone size={28} />
              </div>

              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-2.5">
                  <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Dilindungi 6-Digit PIN Keamanan</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Akses Cepat WhatsApp
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Masukkan nomor WhatsApp official kontingen yang terdaftar untuk membuka data kontingen Anda.
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
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3.5 focus-within:bg-white focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/15 transition">
                    <span className="text-amber-600 font-black text-sm select-none">
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
                  className="w-full py-4 px-6 rounded-2xl bg-[#FBBC05] hover:bg-[#eab308] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-60 active:scale-95"
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
              <div className="mt-6 rounded-2xl bg-amber-50/60 dark:bg-slate-800/40 border border-amber-200/80 dark:border-slate-700 p-4 text-[11px] text-slate-700 dark:text-slate-300 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-500" />
                  <span>Fitur Baru Portal Official Terverifikasi:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                  <li><strong>Proteksi PIN Rahasia:</strong> Mencegah manipulasi data kontingen dari pihak lain</li>
                  <li><strong>Mode Tamu (Read-Only):</strong> Bagikan tautan ke suporter dengan aman tanpa izin edit</li>
                  <li><strong>Cetak Buku Pasukan A4:</strong> Format rekap juknis resmi lengkap foto &amp; NISN</li>
                  <li><strong>Undo &amp; Snapshot Cadangan:</strong> Pulihkan data jika terjadi salah hapus</li>
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
