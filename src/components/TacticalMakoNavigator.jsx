import React from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Building,
  Phone,
  ShieldCheck,
  Clock,
  ExternalLink,
  Bus,
  Train,
  Car,
  CheckCircle2,
} from 'lucide-react';
import { playTactileClick } from '../lib/tactileAudio.js';
import { SITE } from '../data/siteData.js';

const TRAVEL_ROUTES = [
  {
    title: 'Via Bus TransJakarta (BRT)',
    icon: Bus,
    stop: 'Halte UNJ (Koridor 4 / 4D)',
    steps: 'Turun di Halte UNJ Rawamangun • Melintasi jembatan penyeberangan langsung ke Pintu Gerbang Utama Kampus A UNJ Jl. Pemuda • Berjalan lurus ke arah Lapangan Tenis / Gedung G • Akses Ruang 107 di Lantai Dasar.',
    badge: 'Akses Tercepat',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    title: 'Via LRT Jakarta',
    icon: Train,
    stop: 'Stasiun LRT Velodrome Rawamangun',
    steps: 'Turun di Stasiun Velodrome • Naik Mikrotrans JakLingko JAK-17 / JAK-26 menuju Jl. Rawamangun Muka (atau jalan kaki santai 8 menit) • Masuk melalui Pintu Gerbang Rawamangun Muka Raya • Langsung menuju Gedung G R.107.',
    badge: 'Bebas Macet',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
  },
  {
    title: 'Via Ojek Online / Kendaraan Pribadi',
    icon: Car,
    stop: 'Titik Drop-Off: Pintu Gerbang Gedung G UNJ',
    steps: 'Ketik tujuan "Mako Menwa UNJ Gedung G" di navigasi peta • Parkir kendaraan roda dua/empat di Area Parkir Barat Gedung G Kampus A • Masuk melalui selasar barat lantai 1 menuju R.107.',
    badge: 'Titik Presisi',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
  },
];

export function TacticalMakoNavigator() {
  return (
    <div className="space-y-6 font-sans">
      {/* Kartu Panduan Rute Transportasi (Blueprint Denah Dinonaktifkan Sementara) */}
      <div className="rounded-3xl neu-card p-6 sm:p-8 bg-white border border-slate-200 shadow-md">
        {/* Header Rute */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#006569] text-[#FFDD00] flex items-center justify-center font-black shadow-md shrink-0">
              <Navigation size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 text-[#006569] border border-teal-200">
                  PANDUAN AKSES TRANSPORTASI KAMPUS
                </span>
                <span className="text-xs font-mono text-emerald-600 font-black flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  PIKET SIAGA 24 JAM
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#092D32] mt-1">
                Panduan Rute Menuju Mako Satuan UNJ
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Kampus A Universitas Negeri Jakarta, Gedung G Ruang 107 (Jl. Rawamangun Muka Raya, Jakarta Timur).
              </p>
            </div>
          </div>

          {/* Quick CTA Maps & WA */}
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={SITE.maps}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playTactileClick('press')}
              className="neu-btn-primary px-4 py-2.5 rounded-2xl text-xs font-black text-white flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Compass size={14} className="text-[#FFDD00]" />
              <span>Buka Google Maps</span>
              <ExternalLink size={12} />
            </a>

            <a
              href={SITE.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playTactileClick('press')}
              className="neu-btn-strong-green px-4 py-2.5 rounded-2xl text-xs font-black text-white flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Phone size={14} />
              <span>Kontak Piket Jaga</span>
            </a>
          </div>
        </div>

        {/* 3 Kartu Rute Transportasi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TRAVEL_ROUTES.map((route, rIdx) => {
            const Icon = route.icon;
            return (
              <div
                key={rIdx}
                className="rounded-3xl p-5 bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between hover:border-[#006569] hover:bg-teal-50/20 transition-all duration-200 shadow-xs group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-9 h-9 rounded-xl bg-[#006569] text-[#FFDD00] flex items-center justify-center font-black shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <Icon size={18} />
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-black border ${route.badgeColor}`}
                    >
                      {route.badge}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-[#092D32] group-hover:text-[#006569] transition-colors">
                    {route.title}
                  </h4>

                  <div className="text-xs font-bold text-[#006569] flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs w-fit">
                    <MapPin size={12} />
                    <span>{route.stop}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium pt-1">
                    {route.steps}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 size={13} />
                    <span>Terhubung ke Kampus A</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">Gedung G R.107</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Tambahan Akses Mako */}
        <div className="mt-6 rounded-2xl bg-teal-50/60 border border-teal-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-[#006569] shrink-0" />
            <span className="font-medium">
              Tamu resmi diwajibkan melapor ke <strong>Meja Piket POS-01 (Lantai Dasar Gedung G)</strong> dan mengisi buku mutasi kunjungan.
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-[#006569] shrink-0">
            <Clock size={13} />
            <span>Piket Terbuka 24 Jam</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TacticalMakoNavigator;
