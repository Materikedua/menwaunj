import React from 'react';
import { Users } from 'lucide-react';

export function TeamIdCardPreview({
  person,
  schoolName,
  schoolLogo,
  type = 'PASUKAN',
  indexNumber = 1,
}) {
  const isOfficial = type === 'OFFICIAL';
  return (
    <div className="w-full max-w-[285px] rounded-3xl bg-white border border-slate-200 shadow-[0_18px_40px_-15px_rgba(9,45,50,0.18)] overflow-hidden font-sans select-none transition-transform duration-300 hover:-translate-y-1">
      <div
        className="px-4 py-3 text-white flex items-center justify-between relative overflow-hidden"
        style={{
          background: isOfficial
            ? 'linear-gradient(135deg, #092D32 0%, #1e3a8a 100%)'
            : 'linear-gradient(135deg, #092D32 0%, #006569 100%)',
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
            {schoolLogo ? (
              <img
                src={schoolLogo}
                alt="Logo Sekolah"
                onError={(e) => {
                  e.currentTarget.src = '/logo-menwa-unj.png';
                }}
                className="w-full h-full object-contain"
              />
            ) : (
              <img src="/logo-menwa-unj.png" alt="Menwa UNJ" className="w-full h-full object-contain" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#FFDD00] block">
              GERANAT · MENWA UNJ
            </span>
            <h5 className="text-xs font-black text-white truncate">
              {schoolName || 'Kontingen Sekolah'}
            </h5>
          </div>
        </div>
        <span className="relative z-10 px-2 py-0.5 rounded-lg bg-[#FFDD00] text-[#092D32] text-[10px] font-mono font-black">
          #{String(indexNumber).padStart(2, '0')}
        </span>
      </div>

      <div className="p-5 flex flex-col items-center text-center bg-gradient-to-b from-[#F5F8F6] to-white">
        <div className="w-24 h-28 rounded-2xl bg-white border-2 border-[#006569]/25 shadow-inner overflow-hidden flex items-center justify-center mb-3">
          {person?.photoDataUrl ? (
            <img
              src={person.photoDataUrl}
              alt={person.fullName || 'Foto Profil'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-[#64748B] flex flex-col items-center gap-1 p-2">
              <Users size={26} className="text-[#006569]/40" />
              <span className="text-[9px] font-bold uppercase">Foto 3x4</span>
            </div>
          )}
        </div>

        <span className="text-[10px] font-black uppercase tracking-wider text-[#006569] mb-1">
          {person?.position || (isOfficial ? 'Official 1' : 'Pasukan Inti')}
        </span>

        <h4 className="text-sm font-black text-[#092D32] leading-snug line-clamp-1">
          {person?.fullName || 'Nama Lengkap Peserta'}
        </h4>
        <p className="text-[11px] font-bold text-[#64748B] mt-0.5 line-clamp-1">
          {schoolName || person?.schoolName || 'Nama Sekolah'}
        </p>

        {!isOfficial ? (
          <div className="mt-3 w-full rounded-xl bg-[#F5F8F6] border border-slate-200 px-3 py-1.5 flex items-center justify-between text-[11px]">
            <span className="font-bold text-[#64748B] uppercase">NISN</span>
            <span className="font-mono font-black text-[#092D32] tabular-nums">
              {person?.nisn || '—'}
            </span>
          </div>
        ) : (
          <div className="mt-3 w-full rounded-xl bg-[#F5F8F6] border border-slate-200 px-3 py-1.5 flex items-center justify-between text-[11px]">
            <span className="font-bold text-[#64748B] uppercase">STATUS</span>
            <span className="font-mono font-black text-[#006569]">OFFICIAL TIM</span>
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-[#092D32] text-white flex items-center justify-between text-[9px] font-mono">
        <span className="text-[#FFDD00] font-bold uppercase">
          {isOfficial ? 'ID OFFICIAL RESMI' : 'ID PASUKAN RESMI'}
        </span>
        <span className="text-emerald-400 font-bold">TERVERIFIKASI</span>
      </div>
    </div>
  );
}

