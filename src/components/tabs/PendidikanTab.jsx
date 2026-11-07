import React, { useState } from 'react';
import {
  BookOpen,
  Activity,
  Shield,
  Award,
  Target,
  Clock,
  CheckCircle,
  ChevronRight,
  ChevronsUpDown,
} from 'lucide-react';
import { Reveal, HeroStage } from '../MenwaUI.jsx';
import { MenwaDoctrines } from '../MenwaDoctrines.jsx';
import { playTactileClick } from '../../lib/tactileAudio.js';
import { HERO_PHOTO } from '../../data/siteData.js';

const PENDIDIKAN_BERTINGKAT = [
  {
    id: 1,
    title: 'Pendidikan Dasar Satuan',
    level: 'Bertingkat',
    duration: '5 Hari',
    category: 'Bertingkat',
    desc: 'Pembentukan mental, disiplin, wawasan kebangsaan, dan dasar keprajuritan calon anggota Menwa UNJ.',
    curriculum: [
      'Kemenwaan: Dasar Organisasi, Sejarah Menwa Satuan, PDRM',
      'Permildas: CMI, PBB, PUDD, PPM, TUM',
      'Pembinaan Jasmani: BDM, Orientasi Medan',
      'Latihan Berganda: Caraka (Pengiriman Pesan Rahasia Pos-to-Pos)',
      'Latihan Teknik/Taktik: Pembuatan Bivak',
      'Pelajaran Pelengkap: Loyalitas, Etika & Moral',
      'Pelajaran Tambahan: Upacara, Jam Komandan, Jam Cadangan',
    ],
  },
  {
    id: 2,
    title: 'Latihan Pemantapan Komando',
    level: 'Bertingkat',
    duration: '5 Hari',
    category: 'Bertingkat',
    desc: 'Pemantapan fisik, mental, dan tradisi komando di Sukamakmur–Curug Benjol sebelum pengukuhan Baret Ungu.',
    curriculum: [
      'Long March 14 KM (Sukamakmur - Curug Benjol)',
      'Wawasan Kebangsaan & Kemenwaan',
      'Makna Baret & Tradisi Komando',
      'Bivak & Pembuatan Perlindungan',
      'Permildas (TUM & PBB)',
      'Micro Teaching Lapangan & Bakti Sosial',
      'Caraka Malam & Tradisi Pembaretan Curug Benjol',
    ],
  },
  {
    id: 3,
    title: 'Kursus Dinas Staf',
    level: 'Bertingkat',
    duration: '4 Hari',
    category: 'Bertingkat',
    desc: 'Pelatihan manajerial, tata naskah dinas, perencanaan operasi, dan koordinasi staf markas komando.',
    curriculum: [
      'Materi Staf PAM (Pengamanan & Kontra-Intel)',
      'Materi Staf OPS (Operasi & Perencanaan Latihan)',
      'Materi Staf PERS (Personalia & Administrasi)',
      'Materi Staf LOG (Logistik & Perbekalan)',
      'Materi Staf TER (Teritorial & Bakti Masyarakat)',
      'Materi Staf TRIAN, MARKAS, SET, & PROVOST',
      'Materi DANPOKPAS & Jam Komandan',
    ],
  },
  {
    id: 4,
    title: 'Pendidikan Provos Satuan',
    level: 'Bertingkat',
    duration: '3 Hari',
    category: 'Bertingkat',
    desc: 'Spesialisasi penegakan disiplin, tata tertib, pengawasan etika, dan pengamanan internal Mako UNJ.',
    curriculum: [
      'Tupoksi & Wewenang Provos Satuan',
      'Pengendalian Lalu Lintas (Dalalin)',
      'Parade & Penegakan Disiplin',
      'HARTIB (Pemeliharaan Ketertiban)',
      'Intelijen & Taktik Penyelidikan',
      'Pengawalan & Keprotokolan VVIP',
      'PDRM (Peraturan Disiplin Resimen Mahasiswa)',
      'Interogasi, Pengamanan Instalasi, & Loyalitas',
    ],
  },
];

const PENDIDIKAN_BERJENJANG = [
  {
    id: 5,
    title: 'Pendidikan Dasar Militer',
    level: 'Berjenjang',
    duration: '10 Hari',
    category: 'Berjenjang',
    desc: 'Pendidikan dasar keprajuritan bersama Rindam Jaya untuk membentuk karakter prajurit mahasiswa.',
    curriculum: [
      'Doktrin Pertahanan Negara & Militer Dasar',
      'PBB, Perpang, & Tata Upacara Militer',
      'Navigasi Darat & Kompas Malam',
      'Bela Diri Militer & Ketahanan Fisik Lapangan',
      'Pengetahuan Taktik & Survival',
    ],
  },
  {
    id: 6,
    title: 'Kursus Kader Pelaksana',
    level: 'Berjenjang',
    duration: '20 Hari',
    category: 'Berjenjang',
    desc: 'Kaderisasi pimpinan operasional dan komandan pasukan tingkat Skomen Jayakarta & Nasional.',
    curriculum: [
      'Kepemimpinan Taktis Lapangan (Field Leadership)',
      'Manajemen Operasi Satuan & Teritorial',
      'Analisis Keputusan Krisis & Intelpam',
      'Taktik Pasukan & Pengendalian Massa',
    ],
  },
  {
    id: 7,
    title: 'Kursus Dinas Staf',
    level: 'Berjenjang',
    duration: '6 Hari',
    category: 'Berjenjang',
    desc: 'Pendalaman manajemen staf komando tingkat provinsi/Skomen Jayakarta.',
    curriculum: [
      'Manajemen Staf Komando Gabungan',
      'Penyusunan Produk Operasional & Logistik Skomen',
      'Interoperabilitas Organisasi Kedinasan',
      'Simulasi Posko Latihan & Komando Ops',
    ],
  },
  {
    id: 8,
    title: 'Kursus Pelatih Nasional',
    level: 'Berjenjang',
    duration: '10 Hari',
    category: 'Berjenjang',
    desc: 'Sertifikasi instruktur nasional dalam metodologi kepelatihan dan kurikulum keprajuritan Menwa.',
    curriculum: [
      'Metodologi Pelatihan (Andragogi & CMI)',
      'Psikologi Massa & Teknik Instruksi Lapangan',
      'Penyusunan Kurikulum Latihan Nasional',
      'Standardisasi Evaluasi & Kepelatihan Satuan',
    ],
  },
  {
    id: 9,
    title: 'Kursus Kader Pimpinan',
    level: 'Berjenjang',
    duration: '20 Hari',
    category: 'Berjenjang',
    desc: 'Kualifikasi pimpinan tertinggi Menwa tingkat nasional untuk mencetak Komandan Satuan & Menwa.',
    curriculum: [
      'Strategi Pertahanan Nasional & Kebijakan Publik',
      'Kepemimpinan Strategis & Geopolitik',
      'Manajemen Organisasi Tingkat Nasional',
      'Pengambilan Keputusan Strategis & Keamanan Nasional',
    ],
  },
];

const PENDIDIKAN_LANJUTAN = [
  {
    id: 10,
    title: 'Kursus Kader Bintal Nasional',
    level: 'Berlanjut',
    duration: '8 Hari',
    category: 'Berlanjut',
    desc: 'Pembinaan mental, spiritual, dan ideologi kebangsaan untuk ketahanan rohani personel.',
    curriculum: [
      'Pembinaan Ideologi Pancasila & Keetikaan',
      'Psikologi Ketahanan Mental Prajurit',
      'Teknik Konseling & Bimsuh Lapangan',
      'Penguatan Moral & Jiwa Korsa Nasional',
    ],
  },
  {
    id: 11,
    title: 'Kursus Protokoler',
    level: 'Berlanjut',
    duration: '3 Hari',
    category: 'Berlanjut',
    desc: 'Spesialisasi keprotokolan resmi negara/universitas, pengawalan VVIP, dan manajemen acara.',
    curriculum: [
      'Keprotokolan Resmi Negara & Perguruan Tinggi',
      'Pengawalan VVIP & Jajaran Kehormatan',
      'Public Relations & Master of Ceremony (MC)',
      'Etika Diplomasi & Tata Tempat Kedinasan',
    ],
  },
  {
    id: 12,
    title: 'Kursus Intelijen & Pengamanan',
    level: 'Berlanjut',
    duration: '3 Hari',
    category: 'Berlanjut',
    desc: 'Analisis informasi, kontra-intelijen, pengamanan objek vital kampus, dan deteksi dini.',
    curriculum: [
      'Teknik Penyelidikan, Pengamatan, & Penggalangan',
      'Analisis Informasi & Kontra-Intelijen',
      'Pengamanan Teritorial Kampus & Objek Vital',
      'Siber & Kriptografi Dasar Komando',
    ],
  },
];

const ALL_COURSE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const CourseDetail = ({ course, open, dark }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateRows: open ? '1fr' : '0fr',
      transition: 'gridTemplateRows 400ms cubic-bezier(.16,1,.3,1)',
    }}
    aria-hidden={!open}
  >
    <div className="overflow-hidden">
      <div
        className={`mt-4 rounded-xl border p-4 ${
          dark ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h5
          className={`mb-3 flex items-center text-[11px] font-black uppercase tracking-wider ${
            dark ? 'text-[#FFDD00]' : 'text-slate-900'
          }`}
        >
          <Target size={14} className={`mr-2 ${dark ? 'text-[#FFDD00]' : 'text-[#006569]'}`} /> Materi Utama (Renlat)
        </h5>
        <ul className="space-y-2">
          {course.curriculum.map((item, idx) => (
            <li
              key={idx}
              className={`flex items-start rounded-lg border p-3 text-xs font-bold ${
                dark
                  ? 'border-white/10 bg-white/5 text-slate-200'
                  : 'border-[#006569]/20 bg-[#006569]/5 text-slate-700'
              }`}
            >
              <CheckCircle
                size={16}
                className={`mr-2 mt-px shrink-0 ${dark ? 'text-[#FFDD00]' : 'text-[#006569]'}`}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

export function PendidikanTab({ onOpenSamapta = null, onOpenKTA = null }) {
  const [openCourseIds, setOpenCourseIds] = useState(() => new Set([1]));

  const toggleCourse = (c) => {
    setOpenCourseIds((prev) => {
      const next = new Set(prev);
      if (next.has(c.id)) next.delete(c.id);
      else next.add(c.id);
      return next;
    });
  };

  const expandAll = () => setOpenCourseIds(new Set(ALL_COURSE_IDS));
  const collapseAll = () => setOpenCourseIds(new Set());

  return (
    <div className="bg-[#051419] min-h-screen pb-32 font-sans flex-grow text-slate-100">
      <HeroStage className="min-h-[400px] py-20 md:py-28" photo={HERO_PHOTO} blur={2.5} dim={0.62}>
        <Reveal className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#FFDD00]/40 bg-black/40 px-5 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#FFDD00] backdrop-blur-md">
            <BookOpen size={15} /> Kurikulum Komando Menwa UNJ
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white drop-shadow-2xl md:text-6xl">
            Pendidikan &amp; Pelatihan Satuan
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg font-bold leading-relaxed text-[#FFDD00] drop-shadow-lg md:text-xl">
            Membentuk Karakter Intelektual, Bermental Baja, &amp; Berjiwa Ksatria
          </p>
        </Reveal>
      </HeroStage>

      <div className="max-w-7xl mx-auto px-4 pt-10 md:pt-14 relative z-10 space-y-10">
        {onOpenSamapta && (
          <Reveal className="rounded-[2.5rem] neu-card p-6 sm:p-8 bg-gradient-to-r from-[#006569] to-[#092D32] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FFDD00] text-slate-950 flex items-center justify-center font-black shadow-lg shrink-0">
                <Activity size={28} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FFDD00] px-3 py-1 rounded-full bg-black/30 border border-[#FFDD00]/30">
                  UJI KESEGARAN JASMANI
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                  Kalkulator &amp; Rapor Samapta Resmi
                </h3>
                <p className="text-xs text-slate-200 mt-0.5 max-w-xl">
                  Hitung skor lari 12 menit, pull-up, push-up, sit-up, &amp; shuttle run sesuai standar Jasmani Militer.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                playTactileClick('press');
                onOpenSamapta();
              }}
              className="neu-btn-gold px-5 py-3 rounded-full text-xs font-black shrink-0 flex items-center gap-2 shadow-lg cursor-pointer text-slate-950"
            >
              <Activity size={15} />
              <span>Buka Samapta</span>
            </button>
          </Reveal>
        )}

        <Reveal delay={120}>
          <MenwaDoctrines onOpenKTA={onOpenKTA} />
        </Reveal>

        {/* Toolbar Buka / Ringkas Semua Renlat */}
        <div className="bg-[#071c22]/90 backdrop-blur-xl rounded-3xl p-4 sm:p-5 shadow-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#FFDD00]">
              12 Modul Kurikulum Keprajuritan
            </span>
            <p className="text-xs text-slate-300">
              Pilih kartu kursus untuk melihat rincian materi latihan (Renlat).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={expandAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#006569]/40 hover:bg-[#006569] text-[#FFDD00] text-xs font-black transition border border-[#006569]/60 cursor-pointer"
            >
              <ChevronsUpDown size={14} />
              <span>Buka Semua</span>
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition border border-white/10 cursor-pointer"
            >
              <span>Ringkas</span>
            </button>
          </div>
        </div>

        {/* SUBJUDUL 1: Pendidikan Bertingkat */}
        <Reveal delay={100} className="bg-[#071c22]/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-6 sm:p-8 md:p-12 border border-white/12">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-black text-white inline-flex items-center tracking-tight border-b-4 border-[#006569] pb-3">
              <Shield className="mr-3 text-[#00A8AF]" size={28} /> Pendidikan Bertingkat
            </h3>
            <p className="text-slate-300 mt-3 font-medium text-sm">
              Jenjang pembinaan internal anggota Menwa Satuan UNJ.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {PENDIDIKAN_BERTINGKAT.map((course) => {
              const isOpen = openCourseIds.has(course.id);
              return (
                <div
                  key={course.id}
                  onClick={() => toggleCourse(course)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleCourse(course);
                    }
                  }}
                  className="bg-[#09252e] rounded-2xl p-6 border border-white/10 hover:border-[#00A8AF]/60 hover:bg-[#0d2f3a] hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-[#006569]/40 border border-[#006569]/60 text-[#FFDD00] font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                        {course.level}
                      </span>
                      <span className="text-xs font-bold text-slate-300 flex items-center">
                        <Clock size={12} className="mr-1 text-[#00A8AF]" /> {course.duration}
                      </span>
                    </div>
                    <h4 className="font-black text-white text-lg mb-2 group-hover:text-[#FFDD00] transition-colors">
                      {course.title}
                    </h4>
                    <p className={`text-slate-300 text-xs font-medium leading-relaxed ${isOpen ? '' : 'line-clamp-2'}`}>
                      {course.desc}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-[#FFDD00]">
                    <span>{isOpen ? 'Tutup' : 'Detail Modul'}</span>
                    <ChevronRight
                      size={16}
                      className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : 'group-hover:translate-x-1'}`}
                    />
                  </div>
                  <CourseDetail course={course} open={isOpen} dark />
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* SUBJUDUL 2: Pendidikan Berjenjang */}
        <Reveal delay={200} className="bg-[#071c22]/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-6 sm:p-8 md:p-12 border border-white/12">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-black text-white inline-flex items-center tracking-tight border-b-4 border-[#FFDD00] pb-3">
              <Award className="mr-3 text-[#FFDD00]" size={28} /> Pendidikan Berjenjang
            </h3>
            <p className="text-slate-300 mt-3 font-medium text-sm">
              Kualifikasi komando tingkat provinsi dan nasional.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PENDIDIKAN_BERJENJANG.map((course) => {
              const isOpen = openCourseIds.has(course.id);
              return (
                <div
                  key={course.id}
                  onClick={() => toggleCourse(course)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleCourse(course);
                    }
                  }}
                  className="bg-[#09252e] rounded-2xl p-6 border border-white/10 hover:border-[#00A8AF]/60 hover:bg-[#0d2f3a] hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-[#FFDD00] text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                        {course.level}
                      </span>
                      <span className="text-xs font-bold text-slate-300 flex items-center">
                        <Clock size={12} className="mr-1 text-[#00A8AF]" /> {course.duration}
                      </span>
                    </div>
                    <h4 className="font-black text-white text-base mb-2 group-hover:text-[#FFDD00] transition-colors">
                      {course.title}
                    </h4>
                    <p className={`text-slate-300 text-xs font-medium leading-relaxed ${isOpen ? '' : 'line-clamp-2'}`}>
                      {course.desc}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-[#FFDD00]">
                    <span>{isOpen ? 'Tutup' : 'Detail Modul'}</span>
                    <ChevronRight
                      size={16}
                      className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : 'group-hover:translate-x-1'}`}
                    />
                  </div>
                  <CourseDetail course={course} open={isOpen} dark />
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* SUBJUDUL 3: Pendidikan Berlanjut */}
        <Reveal delay={300} className="bg-slate-900 text-white rounded-[2.5rem] shadow-2xl p-6 sm:p-8 md:p-12 border border-slate-800">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-black text-white inline-flex items-center tracking-tight border-b-4 border-[#006569] pb-3">
              <Target className="mr-3 text-[#FFDD00]" size={28} /> Pendidikan Berlanjut
            </h3>
            <p className="text-slate-400 mt-3 font-medium text-sm">
              Spesialisasi pembinaan mental, keprotokolan, &amp; intelijen pengamanan.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PENDIDIKAN_LANJUTAN.map((course) => {
              const isOpen = openCourseIds.has(course.id);
              return (
                <div
                  key={course.id}
                  onClick={() => toggleCourse(course)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleCourse(course);
                    }
                  }}
                  className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 hover:border-[#FFDD00] hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-[#006569] text-[#FFDD00] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-[#FFDD00]/30">
                        {course.level}
                      </span>
                      <span className="text-xs font-bold text-slate-400 flex items-center">
                        <Clock size={12} className="mr-1 text-[#FFDD00]" /> {course.duration}
                      </span>
                    </div>
                    <h4 className="font-black text-white text-base mb-2 group-hover:text-[#FFDD00] transition-colors">
                      {course.title}
                    </h4>
                    <p className={`text-slate-300 text-xs font-medium leading-relaxed ${isOpen ? '' : 'line-clamp-2'}`}>
                      {course.desc}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-700 flex items-center justify-between text-xs font-bold text-[#FFDD00]">
                    <span>{isOpen ? 'Tutup' : 'Spesialisasi'}</span>
                    <ChevronRight
                      size={16}
                      className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : 'group-hover:translate-x-1'}`}
                    />
                  </div>
                  <CourseDetail course={course} open={isOpen} dark />
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
