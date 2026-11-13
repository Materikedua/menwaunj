import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  Calendar,
  MapPin,
  Search,
  GraduationCap,
  Trophy,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Link } from '../lib/router.jsx';
import {
  ROLE_NAVIGATION_MATRIX,
  useSiteContent,
  type RoleNavigationTrack,
} from '../data/siteConfig';
import { playTactileClick } from '../lib/tactileAudio.js';

const ROLE_ICONS: Record<RoleNavigationTrack['id'], React.ComponentType<{ size?: number; className?: string }>> = {
  'mahasiswa-unj': GraduationCap,
  'peserta-nasional': Trophy,
  'mitra-ormawa': ShieldCheck,
};

export const HomeRoleMatrix: React.FC = () => {
  const { content } = useSiteContent();
  const [activeRoleId, setActiveRoleId] = useState<RoleNavigationTrack['id']>('mahasiswa-unj');

  const activeRole = useMemo(
    () =>
      ROLE_NAVIGATION_MATRIX.find((r) => r.id === activeRoleId) ||
      ROLE_NAVIGATION_MATRIX[0],
    [activeRoleId]
  );

  const matchedPrograms = useMemo(() => {
    const byId = new Map(content.programs.map((p) => [p.id, p]));
    const picked = activeRole.programIds
      .map((id) => byId.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
    if (picked.length > 0) return picked;
    return content.programs.slice(0, 2);
  }, [content.programs, activeRole]);

  return (
    <section
      id="akses-cepat"
      aria-labelledby="matriks-peran-title"
      className="py-7 md:py-20 bg-white border-b border-slate-200/80"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-4 md:space-y-8">
        {/* Heading Terpadu */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2.5 md:gap-4">
          <div className="space-y-1 md:space-y-2 max-w-2xl">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.22em] text-[#006569] block">
              ORIENTASI &amp; PROGRAM SATUAN TERPADU
            </span>
            <h2
              id="matriks-peran-title"
              className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900"
            >
              Navigasi Layanan Sesuai <span className="text-[#006569]">Peran Anda</span>
            </h2>
            <p className="text-xs md:text-base text-slate-600 leading-relaxed line-clamp-2 md:line-clamp-none">
              Pilih jalur kunjungan Anda untuk mengakses program unggulan, jadwal resmi terbaru, verifikasi sertifikat, maupun permohonan pengamanan dalam satu tampilan bebas duplikasi.
            </p>
          </div>

          <Link
            to="/informasi"
            className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] md:text-xs font-black text-[#006569] transition shrink-0 self-start md:self-auto"
          >
            <Search size={13} className="md:w-[14px] md:h-[14px]" />
            <span>Direktori Semua Informasi</span>
            <ArrowRight size={13} className="md:w-[14px] md:h-[14px]" />
          </Link>
        </div>

        {/* Pemilih 3 Peran Utama */}
        <div
          role="tablist"
          aria-label="Pilih peran pengunjung portal"
          className="grid grid-cols-3 gap-1.5 md:gap-2.5 p-1.5 md:p-2 rounded-2xl bg-slate-100 border border-slate-200"
        >
          {ROLE_NAVIGATION_MATRIX.map((track) => {
            const Icon = ROLE_ICONS[track.id];
            const isSelected = track.id === activeRole.id;
            return (
              <button
                key={track.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  playTactileClick('pill');
                  setActiveRoleId(track.id);
                }}
                className={`p-2 md:p-4 rounded-xl text-center md:text-left transition flex flex-col md:flex-row items-center gap-1.5 md:gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-[#006569] text-white shadow-md'
                    : 'bg-white/80 hover:bg-white text-slate-800 border border-slate-200/70'
                }`}
              >
                <span
                  className={`w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-white/15 text-[#FFDD00]'
                      : 'bg-teal-50 text-[#006569]'
                  }`}
                >
                  <Icon size={16} className="md:w-5 md:h-5" />
                </span>
                <span className="min-w-0">
                  <strong className="block text-[11px] md:text-sm font-black leading-tight line-clamp-2 md:truncate">
                    {track.roleLabel}
                  </strong>
                  <span
                    className={`hidden md:block text-[11px] font-medium truncate ${
                      isSelected ? 'text-teal-100' : 'text-slate-500'
                    }`}
                  >
                    {track.badge}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Panel Konten Peran Aktif: Ringkasan + Tautan Cepat + Kartu Program Tersinkronisasi */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 md:gap-6 items-stretch">
          {/* Kolom Kiri: Orientasi & Tautan Layanan Cepat */}
          <div className="lg:col-span-5 bg-slate-950 text-white rounded-2xl p-4 md:p-7 border border-[#006569]/50 flex flex-col justify-between space-y-3 md:space-y-6 shadow-xl">
            <div className="space-y-1.5 md:space-y-3">
              <span className="inline-block px-2 py-0.5 md:px-2.5 md:py-1 rounded-md bg-[#006569]/50 border border-[#FFDD00]/40 text-[9px] md:text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFDD00]">
                {activeRole.badge}
              </span>
              <h3 className="text-base md:text-2xl font-black leading-snug text-white">
                {activeRole.headline}
              </h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed line-clamp-2 md:line-clamp-none">
                {activeRole.summary}
              </p>
            </div>

            <div className="space-y-1.5 md:space-y-2.5">
              <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-teal-300 block">
                Akses Cepat Layanan Terkait:
              </span>
              {activeRole.quickLinks.map((qLink) => (
                <Link
                  key={qLink.title}
                  to={qLink.to}
                  className="group flex items-center justify-between gap-2 md:gap-3 p-2 md:p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FFDD00]/50 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <strong className="text-xs md:text-sm font-bold text-white group-hover:text-[#FFDD00] transition-colors truncate">
                        {qLink.title}
                      </strong>
                      <span className="px-1.5 py-0.5 md:px-2 rounded bg-[#006569]/70 text-[9px] md:text-[10px] font-bold text-teal-100 shrink-0">
                        {qLink.tag}
                      </span>
                    </div>
                    <p className="text-[10.5px] md:text-[11px] text-slate-400 truncate mt-0.5">
                      {qLink.subtitle}
                    </p>
                  </div>
                  <ChevronRight
                    size={15}
                    className="text-slate-400 group-hover:text-[#FFDD00] group-hover:translate-x-0.5 transition shrink-0"
                  />
                </Link>
              ))}
            </div>

            <div className="pt-1 md:pt-2">
              <Link
                to={activeRole.primaryCta.to}
                className="w-full py-2.5 md:py-3 px-4 md:px-5 rounded-xl bg-[#FFDD00] hover:bg-amber-300 text-slate-950 font-black text-[11px] md:text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition"
              >
                <span>{activeRole.primaryCta.label}</span>
                <ArrowRight size={14} className="md:w-[15px] md:h-[15px]" />
              </Link>
            </div>
          </div>

          {/* Kolom Kanan: Program Unggulan Sesuai Peran (Langsung dari siteConfig.ts) */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-2 gap-2.5 md:gap-5">
            {matchedPrograms.map((prog) => (
              <Link
                key={prog.id}
                to={prog.route || '/'}
                className="group bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#006569] rounded-xl md:rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div>
                  <div className="relative aspect-[4/3] md:aspect-[16/10] bg-slate-900 overflow-hidden">
                    <img
                      src={prog.image || '/foto-kampus-unj.jpg'}
                      alt={prog.title}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = '/foto-kampus-unj.jpg';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-1.5 left-1.5 md:top-3 md:left-3 px-1.5 py-0.5 md:px-2.5 md:py-1 rounded bg-slate-950/85 text-[#FFDD00] text-[8.5px] md:text-[10px] font-black uppercase tracking-wider">
                      {prog.tag}
                    </span>
                    <span className="absolute bottom-1.5 right-1.5 md:bottom-2.5 md:right-2.5 max-w-[calc(100%-12px)] truncate md:max-w-none md:overflow-visible px-1.5 py-0.5 md:px-2.5 md:py-1 rounded bg-[#006569]/95 text-white text-[8.5px] md:text-[10px] font-bold shadow">
                      {prog.status}
                    </span>
                  </div>

                  <div className="p-2.5 md:p-5 space-y-1 md:space-y-2.5">
                    <h4 className="text-xs md:text-lg font-black text-slate-900 group-hover:text-[#006569] transition-colors leading-snug line-clamp-2 md:line-clamp-none">
                      {prog.title}
                    </h4>
                    <p className="text-[10.5px] md:text-xs text-slate-600 leading-snug md:leading-relaxed line-clamp-2 md:line-clamp-3">
                      {prog.description}
                    </p>
                    <div className="pt-1.5 md:pt-2 space-y-0.5 md:space-y-1.5 text-[10px] md:text-xs text-slate-500 font-medium border-t border-slate-200/70">
                      <div className="flex items-center gap-1 md:gap-1.5">
                        <Calendar size={11} className="text-[#006569] shrink-0 md:w-[13px] md:h-[13px]" />
                        <span className="truncate">{prog.date}</span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-1.5">
                        <MapPin size={11} className="text-[#006569] shrink-0 md:w-[13px] md:h-[13px]" />
                        <span className="truncate">{prog.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-2.5 py-2 md:px-5 md:py-3.5 bg-white border-t border-slate-200/80 flex items-center justify-between text-[10px] md:text-xs font-black text-[#006569]">
                  <span className="uppercase tracking-wider md:hidden">Buka</span>
                  <span className="hidden md:inline uppercase tracking-wider">Buka Informasi Program</span>
                  <ArrowRight
                    size={13}
                    className="md:w-[15px] md:h-[15px] group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeRoleMatrix;
