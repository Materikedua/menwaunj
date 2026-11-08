import React from 'react';
import {
  Phone,
  AlertCircle,
  ArrowRight,
  Shield,
  Loader2,
} from 'lucide-react';
import { playTactileClick } from '../../lib/tactileAudio.js';
import { navigate } from '../../lib/router.jsx';

export function ParticipantWhatsAppLogin({
  loginError,
  handleWaLoginSubmit,
  waInput,
  setWaInput,
  setLoginError,
  searchingWa,
  allPortals = [],
  isPrivilegedOfficer = false,
}) {
  return (
    <div className="relative min-h-[85vh] w-full py-10 sm:py-14 px-3 sm:px-6 font-sans flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#EEF5F6] via-[#F5F8F6] to-[#F9FBFA] rounded-[2.75rem] border border-slate-200/90 shadow-xl">
      {/* Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full bg-teal-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-[#FFDD00]/25 blur-3xl" />

      {loginError && (
        <div className="relative z-10 mb-6 w-full max-w-md rounded-2xl border border-rose-300 bg-rose-50 px-5 py-4 text-rose-800 shadow-sm flex items-start gap-3 animate-fade-in">
          <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="text-left text-xs sm:text-sm font-bold leading-snug">
            <p>{loginError}</p>
          </div>
        </div>
      )}

      {/* Kartu Kontainer Login (Floating Crisp Light Card) */}
      <div className="relative z-10 w-full max-w-md rounded-[2.75rem] bg-white border border-slate-200/90 p-8 sm:p-10 text-center overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,101,105,0.12)]">
        {/* Tile Logo 3D Elevated di Bagian Atas */}
        <div className="mx-auto mb-5 w-24 h-24 rounded-3xl bg-gradient-to-b from-white via-teal-50/40 to-slate-50 border border-[#006569]/20 p-3.5 flex items-center justify-center relative overflow-hidden shadow-md">
          <div className="pointer-events-none absolute -top-6 -left-6 w-16 h-16 bg-[#006569]/10 rounded-full blur-md" />
          <img
            src="/logo-menwa-unj.png"
            alt="Logo Menwa UNJ"
            className="w-full h-full object-contain relative z-10 drop-shadow-sm"
          />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Selamat Datang
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 font-semibold leading-relaxed max-w-xs mx-auto">
          Masukkan nomor WhatsApp official kontingen untuk melanjutkan
        </p>

        <form onSubmit={handleWaLoginSubmit} className="mt-7 text-left space-y-4">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-[0.14em] text-[#006569] mb-2">
              NOMOR WHATSAPP OFFICIAL
            </label>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 border-2 border-slate-200 focus-within:border-[#006569] focus-within:ring-2 focus-within:ring-[#006569]/15 px-4 py-3.5 shadow-inner transition-all">
              <Phone size={18} className="text-[#006569] shrink-0" />
              <span className="text-[#006569] font-black text-sm sm:text-base select-none">
                +62
              </span>
              <input
                type="tel"
                value={waInput}
                onChange={(e) => {
                  setWaInput(e.target.value);
                  if (loginError) setLoginError('');
                }}
                placeholder="812xxxxxxxx"
                className="w-full bg-transparent text-slate-900 font-mono placeholder:text-slate-400 font-bold text-base sm:text-lg focus:outline-none"
              />
            </div>
            <span className="mt-2 block text-[11px] font-semibold text-slate-500">
              Masukkan nomor tanpa angka 0 di depan.
            </span>
          </div>

          <button
            type="submit"
            disabled={searchingWa}
            onClick={() => playTactileClick('press')}
            className="w-full py-3.5 pl-6 pr-3.5 rounded-full bg-gradient-to-r from-[#006569] to-[#008f95] hover:from-[#005256] hover:to-[#007a7f] text-white font-black text-sm sm:text-base tracking-wide flex items-center justify-between cursor-pointer disabled:opacity-60 shadow-lg shadow-[#006569]/20 transition"
          >
            <span className="mx-auto pl-6 flex items-center gap-2">
              {searchingWa ? (
                <>
                  <Loader2 size={16} className="animate-spin text-[#FFDD00]" />
                  <span>Memeriksa Kontingen...</span>
                </>
              ) : (
                <span>Login Official</span>
              )}
            </span>
            <span className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-[#FFDD00] shrink-0 shadow-inner">
              <ArrowRight size={17} />
            </span>
          </button>
        </form>

        {/* Khusus Admin / Superadmin: Mako Command Center */}
        {isPrivilegedOfficer && (
          <div className="mt-6 pt-4 border-t border-slate-200 space-y-3 text-left animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-[#006569] uppercase">
                OTORISASI KOMANDO MAKO
              </span>
            </div>

            {allPortals.length > 0 && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Akses Cepat Kontingen Terdaftar (Admin)
                </label>
                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-3.5 py-2.5">
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) navigate(`/official/${e.target.value}`);
                    }}
                    className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled className="text-slate-500">
                      -- Pilih Subdomain Sekolah ({allPortals.length} Terdaftar) --
                    </option>
                    {allPortals.map((p) => (
                      <option key={p.schoolSlug} value={p.schoolSlug} className="text-slate-900">
                        {p.schoolName} (/official/{p.schoolSlug})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate('/mako-ops')}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <Shield size={14} className="text-amber-700" />
              <span>Buka Mako Command Center</span>
            </button>
          </div>
        )}

        <div className="mt-6 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
          PORTAL OFFICIAL TERVERIFIKASI · MENWA UNJ
        </div>
      </div>
    </div>
  );
}

export default ParticipantWhatsAppLogin;
