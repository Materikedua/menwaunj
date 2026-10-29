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
  Sparkles,
  Users,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { normalizeWaNumber, getOfficialPortalByWhatsApp } from '../firebase.js';
import { navigate } from '../lib/router.jsx';
import BorderBeam from './ui/BorderBeam.jsx';

export function OfficialPortalQuickAccess({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  showTriggerBanner = true,
  className = '',
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const setIsOpen =
    controlledOnClose !== undefined
      ? (val) => {
          if (!val) controlledOnClose();
        }
      : setInternalOpen;

  const [waInput, setWaInput] = useState('');
  const [searchingWa, setSearchingWa] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

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
        setLoginError(
          'Nomor WhatsApp Anda tidak terdaftar sebagai Official Kontingen di event GERANAT.'
        );
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
      {showTriggerBanner && (
        <section id="portal-official" className={`w-full font-sans scroll-mt-24 ${className}`}>
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <div className="text-[11px] font-black uppercase tracking-widest text-[#006569] mb-2">
              PORTAL OFFICIAL EKSKLUSIF
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#092D32] tracking-tight">
              Manajemen <span className="text-[#006569]">Peserta &amp; Nilai</span>
            </h2>

            <p className="mt-3.5 text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Akses khusus bagi official untuk mendaftarkan peserta, mengunggah dokumen administrasi, memantau riwayat evaluasi, dan melacak perkembangan performa tim di seluruh event yang terdaftar.
            </p>
          </div>

          <div className="relative rounded-[2.75rem] neu-card p-8 sm:p-12 lg:p-14 overflow-hidden text-[#092D32]">
            <BorderBeam
              duration={5.5}
              borderWidth={2.5}
              borderRadius={44}
              colorFrom="#006569"
              colorTo="#FFDD00"
            />

            <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 neu-extruded-ring opacity-70" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 neu-extruded-ring opacity-60" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                <div className="w-16 h-16 rounded-3xl neu-logo-tile text-[#006569] flex items-center justify-center mb-6">
                  <div className="relative">
                    <Users size={26} className="stroke-[2.5] text-[#006569]" />
                    <Shield
                      size={14}
                      className="absolute -bottom-1 -right-1 text-[#092D32] fill-[#FFDD00]"
                    />
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#092D32] leading-tight tracking-tight">
                  Semua Kebutuhan Official dalam{' '}
                  <span className="text-[#006569]">Satu Konsol 3D</span>
                </h3>

                <p className="mt-4 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed max-w-lg">
                  Mulai dari pendaftaran biodata 20 personel (Danton, Pasukan, Official), unggah berkas juknis, cetak Buku Pasukan A4, hingga pantau rekap nilai dewan juri secara real-time.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-between gap-4 pl-7 pr-4 py-3.5 rounded-full neu-btn-primary text-white font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
                  >
                    <span>Masuk Portal Official</span>
                    <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-[#FFDD00]">
                      <ArrowRight size={16} />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/official')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full neu-btn text-[#092D32] font-black text-xs uppercase tracking-wider cursor-pointer"
                  >
                    <span>Buka Halaman Penuh</span>
                    <ExternalLink size={14} className="text-[#006569]" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="w-full max-w-sm rounded-[2.5rem] neu-inset p-8 sm:p-10 flex flex-col items-center justify-center min-h-[250px] relative group">
                  <div className="relative z-10 w-24 h-24 rounded-3xl neu-logo-tile p-3.5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <img
                      src="/logo-menwa-unj.png"
                      alt="Menwa UNJ"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-xs font-black text-[#092D32] uppercase tracking-wider">
                      Floating Tablet Console
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      Dilindungi 6-Digit PIN &amp; Mode Tamu
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================================
          DRAWER SLIDE-OVER LOGIN WHATSAPP OFFICIAL (3D NEUMORPHIC AUTH)
          ====================================================================== */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end font-sans">
          <div
            onClick={() => setIsOpen(false)}
            aria-label="Tutup popup portal official"
            className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm transition-opacity animate-fade-in"
          />

          <div
            className="relative z-10 w-full max-w-md h-full bg-gradient-to-br from-[#EEF5F6] via-[#F5F8F6] to-[#F9FBFA] border-l-2 border-white/85 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300"
            role="dialog"
            aria-modal="true"
            aria-labelledby="portal-official-title"
          >
            {/* Ornamen Lingkaran 3D Timbul */}
            <div className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 neu-extruded-ring opacity-75" />
            <div className="pointer-events-none absolute -bottom-20 -right-16 w-56 h-56 neu-extruded-ring opacity-70" />

            {/* Top Bar Drawer */}
            <div className="sticky top-0 z-20 bg-[#F5F8F6]/90 backdrop-blur-md border-b border-white/80 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl neu-logo-tile text-[#006569] flex items-center justify-center font-bold">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h4 id="portal-official-title" className="text-xs font-black uppercase tracking-wider text-[#092D32]">
                    Portal Official Kontingen
                  </h4>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    GERANAT Satuan Menwa UNJ
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-xl neu-btn text-[#092D32] hover:text-rose-600 flex items-center justify-center cursor-pointer"
                title="Tutup (Escape)"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body Kartu 3D Login */}
            <div className="relative z-10 p-6 sm:p-8 flex-1 flex flex-col justify-center">
              <div className="rounded-[2.5rem] neu-card p-6 sm:p-8 text-center space-y-5">
                {/* Tile Logo 3D Elevated */}
                <div className="mx-auto w-20 h-20 rounded-3xl neu-logo-tile p-3 flex items-center justify-center relative overflow-hidden">
                  <img
                    src="/logo-menwa-unj.png"
                    alt="Menwa UNJ"
                    className="w-full h-full object-contain relative z-10"
                  />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-[#092D32] tracking-tight">
                    Selamat Datang
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 font-semibold leading-relaxed">
                    Masukkan nomor WhatsApp official kontingen untuk melanjutkan
                  </p>
                </div>

                {loginError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-rose-700 text-xs flex items-start gap-2.5 text-left animate-fade-in">
                    <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                    <span className="font-bold leading-snug">{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleWhatsAppLogin} className="space-y-4 text-left">
                  <div className="neu-inset rounded-2xl px-4 py-3.5 flex items-center gap-2.5">
                    <Phone size={18} className="text-[#006569] shrink-0" />
                    <span className="text-[#006569] font-black text-sm select-none">+62</span>
                    <input
                      type="tel"
                      value={waInput}
                      onChange={(e) => {
                        setWaInput(e.target.value);
                        if (loginError) setLoginError('');
                      }}
                      placeholder="812xxxxxxxx"
                      autoFocus
                      style={{ color: '#020617' }}
                      className="w-full bg-transparent text-slate-950 placeholder:text-slate-400 font-black text-sm sm:text-base focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={searchingWa}
                    className="w-full py-3.5 pl-6 pr-3.5 rounded-full neu-btn-primary text-white font-black text-sm tracking-wide flex items-center justify-between cursor-pointer disabled:opacity-60"
                  >
                    <span className="mx-auto pl-6 flex items-center gap-2">
                      {searchingWa ? (
                        <>
                          <Loader2 size={16} className="animate-spin text-[#FFDD00]" />
                          <span>Memeriksa...</span>
                        </>
                      ) : (
                        <span>Login Official</span>
                      )}
                    </span>
                    <span className="w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-[#FFDD00] shrink-0">
                      <ArrowRight size={17} />
                    </span>
                  </button>
                </form>

                {/* Pemisah "ATAU MASUK MELALUI" */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-slate-300/80 to-slate-300/80" />
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    ATAU MASUK MELALUI
                  </span>
                  <div className="h-[1.5px] flex-1 bg-gradient-to-l from-transparent via-slate-300/80 to-slate-300/80" />
                </div>

                {/* Deretan Tombol Sosial 3D */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/official');
                    }}
                    title="Buka Konsol Penuh /official"
                    className="neu-social-btn cursor-pointer text-[#006569]"
                  >
                    <ExternalLink size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/geranat');
                    }}
                    title="Halaman Utama GERANAT"
                    className="neu-social-btn cursor-pointer text-[#092D32]"
                  >
                    <ShieldCheck size={22} />
                  </button>
                </div>
              </div>
            </div>

            <div className="relative z-20 bg-[#F5F8F6]/90 backdrop-blur-md border-t border-white/80 p-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-3 rounded-2xl neu-btn text-[#092D32] font-black text-xs uppercase tracking-wider cursor-pointer text-center"
              >
                Tutup Panel Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default OfficialPortalQuickAccess;