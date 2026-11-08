import React, { useState } from 'react';
import {
  Shield,
  Phone,
  AlertCircle,
  ArrowRight,
  Loader2,
  ExternalLink,
  Users,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
} from 'lucide-react';
import { normalizeWaNumber, checkOfficialPortalWhatsAppAccess } from '../firebase.js';
import { navigate } from '../lib/router.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

export function OfficialPortalQuickAccess({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  showTriggerBanner = true,
  className = '',
}) {
  const { user, isSuperAdmin } = useAuth();
  const isSuperUser = Boolean(
    isSuperAdmin ||
    user?.email === 'unjmenwa@gmail.com' ||
    user?.email === 'rafflysyahpoetra@gmail.com'
  );

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
  const [loginSuccess, setLoginSuccess] = useState('');

  const handleWhatsAppLogin = async (e) => {
    e?.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    const cleaned = normalizeWaNumber(waInput);
    if (!cleaned || cleaned.length < 8) {
      setLoginError('Nomor WhatsApp tidak valid. Masukkan minimal 8 digit angka.');
      return;
    }

    setSearchingWa(true);
    try {
      const res = await checkOfficialPortalWhatsAppAccess(cleaned);
      if (res.status === 'VERIFIED' && res.portal?.schoolSlug) {
        setLoginSuccess(`Akses terverifikasi untuk kontingen ${res.portal.schoolName || ''}. Membuka konsol...`);
        setTimeout(() => {
          setIsOpen(false);
          navigate(`/official/${res.portal.schoolSlug}`);
        }, 600);
      } else {
        setLoginError(res.message);
      }
    } catch (err) {
      console.warn('Gagal login portal official:', err);
      setLoginError('Terjadi gangguan saat memeriksa nomor WhatsApp. Silakan coba lagi.');
    } finally {
      setSearchingWa(false);
    }
  };

  const renderInlineLoginForm = () => (
    <div className="max-w-xl mx-auto rounded-[2.5rem] bg-white/95 backdrop-blur-md border border-slate-200/90 p-6 sm:p-8 shadow-xl text-center space-y-4">
      {/* Tile Logo 3D Elevated */}
      <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-3xl neu-logo-tile p-3 flex items-center justify-center relative overflow-hidden shadow-md">
        <img
          src="/logo-menwa-unj.png"
          alt="Menwa UNJ"
          className="w-full h-full object-contain relative z-10"
        />
      </div>

      <div>
        <h3 className="text-xl sm:text-2xl font-black text-[#092D32] tracking-tight">
          Selamat Datang
        </h3>
        <p className="mt-1 text-xs text-slate-500 font-semibold leading-relaxed max-w-sm mx-auto">
          Masukkan nomor WhatsApp official kontingen untuk membuka konsol peserta
        </p>
      </div>

      {loginError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-rose-700 text-xs flex items-start gap-2.5 text-left animate-fade-in shadow-xs">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
          <span className="font-bold leading-snug">{loginError}</span>
        </div>
      )}

      {loginSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-emerald-800 text-xs flex items-center gap-2.5 text-left animate-fade-in shadow-xs">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          <span className="font-bold leading-snug">{loginSuccess}</span>
        </div>
      )}

      <form onSubmit={handleWhatsAppLogin} className="space-y-3.5 text-left pt-1">
        <div className="bg-white border-2 border-slate-300 focus-within:border-[#006569] focus-within:ring-2 focus-within:ring-[#006569]/20 rounded-2xl px-4 py-3 flex items-center gap-2.5 shadow-inner transition-all">
          <Phone size={18} className="text-[#006569] shrink-0" />
          <span className="text-[#006569] font-black text-sm select-none">+62</span>
          <input
            type="tel"
            value={waInput}
            onChange={(e) => {
              setWaInput(e.target.value);
              if (loginError) setLoginError('');
              if (loginSuccess) setLoginSuccess('');
            }}
            placeholder="812xxxxxxxx"
            style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
            className="w-full bg-white text-black font-mono placeholder:text-slate-400 font-black text-sm sm:text-base focus:outline-none"
          />
        </div>

        <div className="space-y-2 pt-1">
          <button
            type="submit"
            disabled={searchingWa}
            className="w-full py-3.5 pl-6 pr-3.5 rounded-full neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white font-black text-sm tracking-wide flex items-center justify-between cursor-pointer disabled:opacity-60 shadow-lg hover:shadow-xl transition-all"
          >
            <span className="mx-auto pl-6 flex items-center gap-2">
              {searchingWa ? (
                <>
                  <Loader2 size={16} className="animate-spin text-[#FFDD00]" />
                  <span>Memeriksa Nomor...</span>
                </>
              ) : (
                <span>Login Official</span>
              )}
            </span>
            <span className="w-8 h-8 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-[#FFDD00] shrink-0">
              <ArrowRight size={16} />
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full py-2.5 rounded-full neu-btn text-slate-600 hover:text-rose-600 font-black text-xs uppercase tracking-wider cursor-pointer text-center transition"
          >
            Batal / Tutup
          </button>
        </div>
      </form>

      {/* Akses Khusus Command Center (Hanya Muncul jika Akun Google Superadmin) */}
      {isSuperUser && (
        <div className="pt-3 border-t border-slate-200 space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-slate-200" />
            <span className="text-[10px] font-black tracking-widest text-[#006569] uppercase">
              OTORISASI KOMANDO AKTIF
            </span>
            <div className="h-[1px] flex-1 bg-slate-200" />
          </div>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              navigate('/mako-ops');
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Shield size={15} className="text-amber-700" />
            <span>Masuk ke Mako Command Center</span>
          </button>
        </div>
      )}
    </div>
  );

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
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />

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
                  <span className="text-[#006569]">Satu Layanan Terpadu</span>
                </h3>

                <p className="mt-4 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed max-w-lg">
                  Mulai dari pendaftaran biodata 20 personel (Danton, Pasukan, Official), unggah berkas juknis, cetak Buku Pasukan A4, hingga pantau rekap nilai dewan juri secara real-time.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full sm:w-auto inline-flex items-center justify-between gap-4 pl-7 pr-4 py-3.5 rounded-full neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer shadow-lg hover:shadow-xl transition-all"
                  >
                    <span>{isOpen ? 'Tutup Formulir Login' : 'Masuk Portal Official'}</span>
                    <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-[#FFDD00]">
                      {isOpen ? <ChevronUp size={16} /> : <ArrowRight size={16} />}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/official')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full neu-btn bg-white hover:bg-slate-50 text-[#092D32] border border-slate-200/90 font-black text-xs uppercase tracking-wider cursor-pointer shadow-sm hover:shadow transition-all"
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

            {/* Expands Downward Inline When Clicked */}
            {isOpen && (
              <div className="mt-10 pt-8 border-t border-slate-200/80 w-full animate-fade-in">
                {renderInlineLoginForm()}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Standalone Display if showTriggerBanner is false and isOpen is true */}
      {!showTriggerBanner && isOpen && (
        <div className={`w-full py-6 font-sans ${className}`}>
          {renderInlineLoginForm()}
        </div>
      )}
    </>
  );
}

export default OfficialPortalQuickAccess;
