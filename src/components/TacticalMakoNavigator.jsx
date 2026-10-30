import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  Building,
  Phone,
  Shield,
  Clock,
  Navigation,
  CheckCircle2,
  Users,
  Radio,
  Coffee,
  FileText,
  Package,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { playTactileClick } from '../lib/tactileAudio.js';

const MAKO_ZONES = [
  {
    id: 'piket',
    name: 'Meja Piket & Jaga Mako',
    code: 'POS-01',
    icon: Radio,
    color: 'emerald',
    desc: 'Pusat jaga kesiapsiagaan 24 jam, pengisian buku tamu kedinasan, radio komunikasi HT, dan koordinasi pengamanan Mako.',
    facilities: ['Buku Mutasi Harian', 'Radio Komando VHF/UHF', 'Telepon Piket Mako', 'P3K Satuan'],
    pic: 'Petugas Piket Jaga Satuan',
  },
  {
    id: 'pimpinan',
    name: 'Ruang Komandan & Wadan',
    code: 'RUANG-KOMANDO',
    icon: Shield,
    color: 'gold',
    desc: 'Ruang kerja kehormatan Komandan dan Wakil Komandan Satuan, koordinasi kebijakan strategis bersama Rektorat UNJ dan Skomen Jayakarta.',
    facilities: ['Peta Dislokasi Pasukan', 'Bendera Tunggul Satuan', 'Dokumen SKEP Komando', 'Buku Direktif Latihan'],
    pic: 'Dansat & Wadansat UNJ',
  },
  {
    id: 'staf',
    name: 'Ruang Rapat & Staf Markas',
    code: 'STAF-G107',
    icon: Users,
    color: 'blue',
    desc: 'Ruang operasional para Kepala Urusan (Pam, Ops, Pers, Log, Ter, Putri, Provost, dan Kesekretariatan) menyusun rencana giat.',
    facilities: ['Meja Rapat Pleno', 'Terminal Komputer Adminu', 'Arsip Surat Masuk/Keluar', 'Papan Matriks Proker'],
    pic: 'Kaur Staf Komando',
  },
  {
    id: 'logistik',
    name: 'Gudang Logistik & Alpal Taktis',
    code: 'LOG-KASAT',
    icon: Package,
    color: 'purple',
    desc: 'Tempat penyimpanan inventaris perlengkapan lapangan, tenda komando pleton, velbed, kompas bidik, dan ransel tempur.',
    facilities: ['Tenda Regu Lapangan', 'Perlengkapan Halang Rintang', 'Alat Bivak & Survival', 'Seragam Upacara PDH/PDL'],
    pic: 'Kaur Logistik Satuan',
  },
  {
    id: 'istirahat',
    name: 'Area Transit & Co-Working',
    code: 'TRANSIT-01',
    icon: Coffee,
    color: 'amber',
    desc: 'Fasilitas rehat prajurit setelah latihan fisik, dispenser air minum, studi mandiri mahasiswa anggota, dan diskusi santai.',
    facilities: ['Dispenser Air Higienis', 'Loker Anggota', 'WiFi Kampus UNJ', 'Charging Station'],
    pic: 'Kepala Markas (Kamarkas)',
  },
];

const TRAVEL_ROUTES = [
  {
    title: 'Via Bus TransJakarta (BRT)',
    stop: 'Halte UNJ (Koridor 4 / 4D)',
    steps: 'Turun di Halte UNJ → Masuk melalui Gerbang Pintu Utama Kampus A Jl. Pemuda → Berjalan ke arah Lapangan Tennis / Gedung G → Masuk Ruang 107 di Lantai Dasar.',
    badge: 'Paling Cepat',
  },
  {
    title: 'Via LRT Jakarta',
    stop: 'Stasiun Velodrome Rawamangun',
    steps: 'Turun di Velodrome → Naik Mikrotrans JakLingko JAK-17 / JAK-26 ke Jl. Rawamangun Muka → Masuk Gerbang Timur Kampus A UNJ → Gedung G R.107.',
    badge: 'Bebas Macet',
  },
  {
    title: 'Via Kendaraan Pribadi / Ojek Online',
    stop: 'Gerbang R. Mangun Muka Raya',
    steps: 'Navigasikan peta ke "Mako Menwa UNJ Gedung G" → Parkir kendaraan di Lapangan Parkir Gedung G / Sertifikasi Guru → Akses pintu barat lantai 1.',
    badge: 'Titik Drop-off Tepat',
  },
];

export function TacticalMakoNavigator() {
  const [activeZoneId, setActiveZoneId] = useState('piket');
  const activeZone = MAKO_ZONES.find((z) => z.id === activeZoneId) || MAKO_ZONES[0];

  return (
    <div className="space-y-8">
      {/* 1. Header Taktis */}
      <div className="rounded-3xl neu-card p-6 sm:p-8 bg-white border border-slate-200 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#006569] text-[#FFDD00] flex items-center justify-center font-black shadow-md shrink-0">
              <Building size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-[#006569] border border-teal-200">
                  DENAH RUANG OPERASIONAL
                </span>
                <span className="text-xs font-mono text-emerald-600 font-black flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  STATUS: MAKO SIAGA
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#092D32] mt-1">
                Blueprint &amp; Navigasi Markas Komando (Gedung G R.107)
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 font-mono">
            <span>Koordinat:</span>
            <strong className="text-[#006569] bg-slate-100 px-2 py-1 rounded-lg">
              -6.1953° S, 106.8798° E
            </strong>
          </div>
        </div>

        {/* 2. Blueprint Interactive Zone Selector */}
        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {MAKO_ZONES.map((zone) => {
              const Icon = zone.icon;
              const isActive = zone.id === activeZoneId;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => {
                    playTactileClick('pill');
                    setActiveZoneId(zone.id);
                  }}
                  className={`neu-pill-tab shrink-0 ${
                    isActive ? 'neu-pill-tab-dark' : ''
                  }`}
                >
                  <Icon
                    size={14}
                    className={
                      isActive
                        ? 'text-[#FFDD00]'
                        : zone.color === 'emerald'
                        ? 'text-emerald-600'
                        : zone.color === 'gold'
                        ? 'text-amber-500'
                        : zone.color === 'blue'
                        ? 'text-blue-600'
                        : zone.color === 'purple'
                        ? 'text-purple-600'
                        : 'text-amber-600'
                    }
                  />
                  <span>{zone.name}</span>
                </button>
              );
            })}
          </div>

          {/* Kartu Detail Zona Mako Terpilih */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center rounded-2xl neu-inset p-5 sm:p-6">
            <div className="md:col-span-8 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-[#006569] text-[#FFDD00] font-mono text-[10px] font-black">
                  {activeZone.code}
                </span>
                <h4 className="text-lg font-black text-[#092D32]">{activeZone.name}</h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {activeZone.desc}
              </p>

              {/* Fasilitas Terdata */}
              <div className="pt-2 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#006569]">
                  Inventaris &amp; Sarana Operasional:
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeZone.facilities.map((fac, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-xl bg-white border border-slate-200 px-3 py-1 text-xs font-bold text-slate-800 shadow-xs"
                    >
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      <span>{fac}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-4 rounded-2xl bg-white p-4 border border-slate-200 text-center space-y-2 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Penanggung Jawab Wilayah:
              </span>
              <div className="font-black text-sm text-[#006569]">{activeZone.pic}</div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1 text-[11px] font-bold text-slate-500">
                <Clock size={12} className="text-[#006569]" />
                <span>08.00 - 22.00 WIB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Panduan Rute Transportasi Menuju Kampus UNJ */}
      <div className="rounded-3xl neu-card p-6 sm:p-8 bg-white border border-slate-200 space-y-4 shadow-md">
        <div className="flex items-center gap-2 text-[#006569]">
          <Navigation size={20} />
          <h4 className="text-base font-black text-[#092D32]">
            Panduan Rute Menuju Mako Satuan UNJ (Rawamangun, Jakarta Timur)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TRAVEL_ROUTES.map((route, rIdx) => (
            <div
              key={rIdx}
              className="rounded-2xl p-4 bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between hover:border-[#006569] transition shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-[#092D32]">{route.title}</span>
                  <span className="px-2 py-0.5 rounded-md bg-teal-100 text-[#006569] font-mono text-[9px] font-black">
                    {route.badge}
                  </span>
                </div>
                <div className="text-[11px] font-bold text-[#006569] flex items-center gap-1 mb-2">
                  <MapPin size={11} />
                  <span>{route.stop}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {route.steps}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 text-[10px] text-slate-400 font-mono">
                Gedung G Kampus A UNJ
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TacticalMakoNavigator;
