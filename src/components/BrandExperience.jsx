import React, { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Compass,
  ExternalLink,
  FileText,
  HeartHandshake,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap,
  Activity,
  CreditCard,
  Building,
} from 'lucide-react';
import { Link, navigate } from '../lib/router.jsx';
import { HeroStage, HeroLogo, Reveal } from './MenwaUI.jsx';
import PortalIcon from './PortalIcon.jsx';
import { resolvePortalPath } from '../lib/portalSearch.js';
import { DynamicCanvasZone } from './DynamicCanvasZone.jsx';
import { MakoCommandCenter } from './MakoCommandCenter.jsx';
import { SITE } from '../data/siteData.js';
import { playTactileClick } from '../lib/tactileAudio.js';
import './BrandExperience.css';

const primaryGuides = [
  {
    title: 'Ksatria Cendekia VIII',
    category: 'Program unggulan',
    description: 'Kompetisi nasional, juknis, jersey & jadwal.',
    to: '/kc',
    icon: Trophy,
  },
  {
    title: 'Youth Spark National',
    category: 'Seminar & pembinaan',
    description: 'Seminar nasional, narasumber & rundown.',
    to: '/youth-spark',
    icon: Sparkles,
  },
  {
    title: 'Gerakan Paskibra Semangat VII',
    category: 'Lomba Paskibra Nasional',
    description: 'LFPB nasional, juknis & e-voting terfavorit.',
    to: '/geranat',
    icon: Trophy,
  },
  {
    title: 'Galeri & Dokumentasi',
    category: 'Arsip Lensa',
    description: 'Arsip foto kegiatan resmi 2023–2026.',
    to: '/gallery',
    icon: Sparkles,
  },
  {
    title: 'Garis Komando',
    category: 'Tentang organisasi',
    description: 'Struktur komando & jajaran personel satuan.',
    to: '/garis-komando',
    icon: Users,
  },
  {
    title: 'Markas Komando & Rute',
    category: 'Lokasi & kontak',
    description: 'Mako Gedung G R.107, piket & rute.',
    to: '/mako',
    icon: MapPin,
  },
  {
    title: 'Administrasi Umum',
    category: 'Layanan',
    description: 'Pengajuan surat, permohonan & kemitraan.',
    to: '/administrasi',
    icon: FileText,
  },
];

export const informationIndex = [
  ...primaryGuides,
  {
    title: 'E-Voting & Charity GERANAT VII',
    category: 'Voting & Donasi',
    description: 'Dukung kontingen favorit via QRIS resmi satuan.',
    to: '/geranat/voting',
    icon: Trophy,
  },
  {
    title: 'Portal Official Kontingen',
    category: 'Layanan Kontingen',
    description: 'Login official tim: buku pasukan & rekap nilai.',
    to: '/portal-peserta',
    icon: Users,
  },
  {
    title: 'Verifikasi E-Dispensasi',
    category: 'Layanan Administrasi',
    description: 'Cek keaslian surat komando & barcode dispensasi.',
    to: '/verifikasi-surat',
    icon: ShieldCheck,
  },
  {
    title: 'Lacak Surat Masuk',
    category: 'Layanan administrasi',
    description: 'Pantau disposisi surat & status berkas dinas.',
    to: '/administrasi',
    icon: FileText,
  },
  {
    title: 'Pendidikan & Latihan',
    category: 'Kurikulum militer',
    description: 'Kurikulum Diksar, KDS, Provos & Diklat.',
    to: '/pendidikan',
    icon: BookOpen,
  },
  {
    title: 'Taktik Menwa & Games',
    category: 'Simulasi kuis & poin',
    description: 'Kuis taktis, mini games, EXP & leaderboard.',
    to: '/games',
    icon: Activity,
  },
  {
    title: 'Jersey Peserta KC VIII',
    category: 'Formulir kegiatan',
    description: 'Pendataan ukuran jersey ATHLETE KC VIII.',
    href: 'https://forms.gle/voyPEgvxvhS8VrKf8',
    icon: ExternalLink,
  },
  {
    title: 'Jersey Official KC VIII',
    category: 'Formulir kegiatan',
    description: 'Pre-order jersey OFFICIAL (Rp150.000).',
    href: 'https://forms.gle/RHoXRFTEVKWHQfFx9',
    icon: ExternalLink,
  },
  {
    title: 'Pendaftaran KC VIII',
    category: 'Pendaftaran kegiatan',
    description: 'Formulir pendaftaran tim KC VIII.',
    href: 'https://bit.ly/PendaftaranKCVIII',
    icon: ExternalLink,
  },
  {
    title: 'Daftar Youth Spark',
    category: 'Pendaftaran kegiatan',
    description: 'Formulir peserta seminar Youth Spark.',
    href: 'https://forms.gle/Xc3QsBLNueoXYLfDA',
    icon: ExternalLink,
  },
  {
    title: 'Rundown Youth Spark (PDF)',
    category: 'Dokumen publik',
    description: 'Susunan acara seminar (08.00–12.00 WIB).',
    href: '/dokumen/youth-spark-rundown.pdf',
    icon: FileText,
  },
];

const EventStoryCard = ({ to, image, eyebrow, title, meta, description, variant = '' }) => (
  <Link to={to} className={`brand-event-card ${variant}`}>
    <div className="brand-event-image">
      <img
        loading="lazy"
        src={image}
        alt=""
        onError={(e) => {
          e.currentTarget.src = '/foto-kampus-unj.jpg';
        }}
      />
    </div>
    <span className="brand-event-cover" />
    <div className="brand-event-content">
      <span className="brand-event-kicker">
        <span className="brand-event-dot" />
        {eyebrow}
      </span>
      <h3>{title}</h3>
      <p className="brand-event-meta">{meta}</p>
      <p className="brand-event-desc">{description}</p>
      <span className="brand-event-action">
        Buka <ArrowRight size={17} />
      </span>
    </div>
  </Link>
);

const LIVE_HERO_SCENES = [
  {
    code: 'SCENE 01 // MARKAS KOMANDO',
    headline: 'Anda Memasuki Portal Komando Resimen Mahasiswa UNJ',
    sub: 'Pusat Kendali Informasi, Diklat Keprajuritan & Pengabdian Sivitas Akademika',
  },
  {
    code: 'SCENE 02 // KSATRIA CENDEKIA',
    headline: 'Kawah Candradimuka Mahasiswa Intelektual & Berjiwa Ksatria',
    sub: 'Menempa Disiplin, Kepemimpinan Lapangan, dan Prestasi Nasional',
  },
  {
    code: 'SCENE 03 // PENGABDIAN BANGSA',
    headline: 'Widya Castrena Dharma Siddha — Satuan Universitas Negeri Jakarta',
    sub: 'Menyatukan Ilmu Pengetahuan dan Ilmu Olah Keprajuritan untuk Negeri',
  },
];

export function BrandHome({ onOpenSearch }) {
  const [sceneIdx, setSceneIdx] = useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setSceneIdx((prev) => (prev + 1) % LIVE_HERO_SCENES.length);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  const activeScene = LIVE_HERO_SCENES[sceneIdx];

  return (
    <div className="brand-home">
      {/* Live Web Short-Video Cinematic Hero Stage */}
      <HeroStage
        className="brand-legacy-hero py-20 md:py-28"
        photo="/foto-kampus-unj.jpg"
        blur={2.2}
        dim={0.56}
        liveCinema={true}
      >
        <Reveal className="brand-legacy-inner relative z-20 mx-auto flex max-w-5xl flex-col items-center px-4 text-center">
          {/* Live Web Cinema Pill Banner */}
          <div className="mb-5 inline-flex flex-wrap items-center justify-center gap-2.5 rounded-full border border-[#FFDD00]/45 bg-slate-950/75 px-4 py-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-md shadow-lg">
            <span className="inline-flex items-center gap-1.5 text-[#FFDD00]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE WEB CINEMA</span>
            </span>
            <span className="text-white/30">|</span>
            <span className="text-slate-200 font-mono">{activeScene.code}</span>
          </div>

          <div className="mb-6">
            <HeroLogo alt="Lambang Resimen Mahasiswa Jayakarta Satuan UNJ" />
          </div>

          <h1
            id="brand-home-title"
            className="brand-legacy-title mb-1.5 font-black leading-tight tracking-tight text-white drop-shadow-md"
          >
            <span>KOMANDO RESIMEN MAHASISWA</span>
            <span>JAYAKARTA</span>
          </h1>
          <div className="my-1.5 text-lg font-extrabold uppercase tracking-widest text-[#FFDD00] drop-shadow-lg sm:text-2xl md:text-3xl">
            SATUAN UNIVERSITAS NEGERI JAKARTA
          </div>

          {/* Pesan Kuat Sekuens Sinematik Live Web */}
          <div
            key={activeScene.code}
            className="mt-4 max-w-2xl rounded-2xl border border-[#FFDD00]/35 bg-gradient-to-r from-slate-950/85 via-[#00383b]/80 to-slate-950/85 px-5 py-3 text-center backdrop-blur-md shadow-xl transition-all duration-500"
          >
            <p className="text-xs sm:text-sm md:text-base font-black tracking-wide text-[#FFDD00]">
              {activeScene.headline}
            </p>
            <p className="mt-0.5 text-[11px] sm:text-xs font-medium text-slate-200">
              {activeScene.sub}
            </p>
          </div>

          <div className="my-4 h-1 w-32 rounded-full bg-gradient-to-r from-[#006569] via-[#FFDD00] to-[#006569]" />

          <p className="brand-legacy-motto rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 font-semibold italic leading-relaxed text-slate-100 shadow-lg backdrop-blur-sm">
            “Penyempurnaan Pengabdian dengan Ilmu Pengetahuan dan Ilmu Olah Keprajuritan.”
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#FFDD00]/55 bg-gradient-to-r from-[#006569]/55 to-[#00383b]/65 px-5 py-2 text-[11px] font-black uppercase tracking-widest text-[#FFDD00] shadow-md">
            <ShieldCheck size={15} /> WIDYA CASTRENA DHARMA SIDDHA
          </div>

          {/* Indikator Scene Video Pendek */}
          <div className="mt-4 flex items-center gap-2" role="tablist" aria-label="Sekuens Sinematik Hero">
            {LIVE_HERO_SCENES.map((sc, i) => (
              <button
                key={sc.code}
                type="button"
                onClick={() => setSceneIdx(i)}
                aria-label={sc.code}
                className={`no-neu h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === sceneIdx ? 'w-8 bg-[#FFDD00]' : 'w-2 bg-white/35 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          <div className="brand-hero-actions mt-7 flex flex-wrap justify-center gap-2.5">
            <Link to="/informasi" className="neu-btn-gold px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg">
              <span>Pusat Informasi</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/gallery" className="neu-btn-primary px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg text-[#FFDD00]">
              <span>Galeri Kegiatan</span>
              <Sparkles size={16} />
            </Link>
            <Link to="/garis-komando" className="neu-btn px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 text-slate-800">
              <span>Struktur Satuan</span>
              <ChevronRight size={16} />
            </Link>
          </div>
          <DynamicCanvasZone containerId="hero_cta_slot" className="mt-3 max-w-md w-full" />
          <a className="brand-legacy-scroll" href="#akses-cepat">
            Akses cepat <ArrowDownRight size={16} />
          </a>
        </Reveal>
      </HeroStage>

      {/* Profil Satuan & Status Operasional Markas Komando (Ringkas & Padat) */}
      <section className="relative z-20 -mt-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#006569] text-[#FFDD00] flex items-center justify-center shrink-0 shadow-md border border-[#FFDD00]/30">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Mako Gd. G R.107 Siaga
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  SKEP 2026 • Satuan UNJ
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 mt-1">
                Kawah Candradimuka Mahasiswa Intelektual &amp; Berjiwa Ksatria
              </h2>
              <p className="text-xs text-slate-600 leading-snug mt-0.5">
                Pusat pembinaan bela negara, kepemimpinan taktis, pengabdian masyarakat, dan kompetisi nasional UNJ.
              </p>
            </div>
          </div>
          <div className="lg:col-span-4 flex flex-wrap sm:flex-nowrap items-center justify-start lg:justify-end gap-2 border-t lg:border-t-0 lg:border-l border-slate-200/80 pt-3 lg:pt-0 lg:pl-5">
            <Link
              to="/pendidikan"
              className="neu-btn flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-black transition"
            >
              <BookOpen size={14} />
              <span>Diklat</span>
            </Link>
            <Link
              to="/administrasi"
              className="neu-btn-primary flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black transition"
            >
              <FileText size={14} />
              <span>Layanan Adminu</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Akses Cepat Orientasi Pengunjung */}
      <section className="brand-access" id="akses-cepat" aria-labelledby="akses-cepat-title">
        <div className="brand-container">
          <div className="brand-section-heading">
            <div>
              <span className="brand-section-overline">ORIENTASI CEPAT</span>
              <h2 id="akses-cepat-title">
                Apa yang ingin kamu <em>tuju?</em>
              </h2>
              <p>Pilih layanan, kegiatan nasional, atau informasi satuan secara instan.</p>
            </div>
            <button
              type="button"
              className="neu-pill-tab text-xs font-black text-[#006569] flex items-center gap-2 cursor-pointer shadow-sm"
              onClick={() => {
                playTactileClick('press');
                onOpenSearch();
              }}
            >
              <Search size={14} />
              <span>Cari Cepat</span>
              <ArrowRight size={13} />
            </button>
          </div>
          <div className="brand-access-grid">
            {primaryGuides.slice(0, 6).map((guide, i) => {
              return (
                <Link
                  key={guide.to}
                  to={guide.to}
                  className="brand-access-item neu-card hover:-translate-y-2 transition-all duration-300"
                >
                  <span className="brand-access-index">0{i + 1}</span>
                  <span className="brand-access-icon">
                    <PortalIcon kind={guide.to} size={24} />
                  </span>
                  <strong>{guide.title}</strong>
                  <span className="brand-access-description">{guide.description}</span>
                  <span className="brand-access-arrow">
                    <ArrowRight size={16} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export const BrandValues = () => (
  <div className="brand-home">
    <section className="brand-values" aria-labelledby="nilai-menwa-title">
      <div className="brand-container brand-values-layout">
        <div className="brand-values-intro">
          <span className="brand-section-overline">WIDYA CASTRENA DHARMA SIDDHA</span>
          <h2 id="nilai-menwa-title">
            Bukan sekadar organisasi. <em>Ruang bertumbuh.</em>
          </h2>
          <p>
            Menempa disiplin, ketangkasan intelektual, dan pengabdian sosial sivitas UNJ.
          </p>
          <Link to="/pendidikan" className="neu-btn-primary px-5 py-3 rounded-2xl text-xs font-black inline-flex items-center gap-2 text-[#FFDD00] shadow-md">
            <span>Kurikulum Diklat</span>
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="brand-values-list">
          <div>
            <span>
              <BookOpen size={20} />
            </span>
            <div>
              <strong>Ilmu &amp; Pembinaan</strong>
              <p>Terampil, kritis, dan siap memimpin.</p>
            </div>
          </div>
          <div>
            <span>
              <HeartHandshake size={20} />
            </span>
            <div>
              <strong>Pengabdian Nyata</strong>
              <p>Hadir menjawab kebutuhan masyarakat.</p>
            </div>
          </div>
          <div>
            <span>
              <Compass size={20} />
            </span>
            <div>
              <strong>Solidaritas Komando</strong>
              <p>Tanggung jawab, disiplin, dan jiwa korsa.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);

const FILTERS = [
  'Semua',
  'Program unggulan',
  'Seminar & pembinaan',
  'Tentang organisasi',
  'Kurikulum militer',
  'Lokasi & kontak',
  'Layanan',
  'Formulir kegiatan',
  'Pendaftaran kegiatan',
  'Dokumen publik',
];

export function InformationHub({ onOpenSearch }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('Semua');
  const [searching, setSearching] = useState(false);
  const [noMatch, setNoMatch] = useState(false);

  const runAiSearch = async (event) => {
    event.preventDefault();
    if (!q.trim() || searching) return;
    setNoMatch(false);
    setSearching(true);
    playTactileClick('press');
    try {
      const path = await resolvePortalPath(q);
      if (path) navigate(path);
      else setNoMatch(true);
    } finally {
      setSearching(false);
    }
  };

  const items = useMemo(
    () =>
      informationIndex.filter((item) => {
        if (filter !== 'Semua' && item.category !== filter) return false;
        const s = `${item.title} ${item.description} ${item.category}`.toLowerCase();
        return s.includes(q.toLowerCase().trim());
      }),
    [q, filter]
  );

  return (
    <div className="brand-hub font-sans">
      <header className="brand-hub-head">
        <div className="brand-container space-y-3">
          <span className="brand-eyebrow">
            <Zap size={14} /> PUSAT INFORMASI TERPADU
          </span>
          <h1>
            Semua akses, <em>di satu tempat.</em>
          </h1>
          <p>
            Temukan layanan administrasi, juknis lomba, formulir, dan panduan Menwa UNJ secara instan.
          </p>

          <form
            onSubmit={runAiSearch}
            className="neu-search-capsule max-w-2xl w-full p-2 sm:p-2.5 mt-5 flex items-center gap-2.5 shadow-2xl"
          >
            <Search size={18} className="text-[#006569] shrink-0 ml-2" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setNoMatch(false);
              }}
              placeholder="Ketik: pendaftaran, jadwal latihan, mako, surat..."
              type="search"
              aria-label="Cari informasi"
              style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
              className="flex-1 min-w-0 bg-transparent text-slate-950 text-xs sm:text-sm font-bold outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={searching || !q.trim()}
              className="neu-btn-primary px-4 py-2 rounded-full text-xs font-black text-[#FFDD00] shrink-0 disabled:opacity-40 shadow-sm cursor-pointer"
            >
              {searching ? 'Mencari…' : 'Cari →'}
            </button>
          </form>

          {noMatch && (
            <p className="brand-hub-ai-status text-amber-300 text-xs font-bold pt-2" role="status">
              Belum ditemukan. Coba kata kunci lain atau pilih kategori di bawah.
            </p>
          )}
        </div>
      </header>

      <section
        className="brand-hub-results brand-container space-y-5"
        aria-labelledby="brand-hub-directory-title"
      >
        <div className="brand-section-heading">
          <div>
            <span className="brand-section-overline">DIREKTORI PORTAL</span>
            <h2 id="brand-hub-directory-title">Informasi &amp; Layanan</h2>
            <p>{items.length} akses tersedia.</p>
          </div>
        </div>

        {/* Tab Pill Filter Kategorikal */}
        <div
          className="neu-pill-bar overflow-x-auto max-w-full pb-2 no-scrollbar"
          role="group"
          aria-label="Filter kategori informasi"
        >
          {FILTERS.map((cat) => {
            const isActive = filter === cat;
            return (
              <button
                type="button"
                key={cat}
                className={isActive ? 'neu-pill-tab-dark' : 'neu-pill-tab'}
                aria-pressed={isActive}
                onClick={() => {
                  playTactileClick('pill');
                  setFilter(cat);
                }}
              >
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Grid Kartu Hasil Direktori */}
        <div className="brand-hub-grid">
          {items.map((item) => {
            const content = (
              <>
                <span className="brand-hub-card-icon">
                  <PortalIcon kind={item.to || item.category} size={22} />
                </span>
                <span className="brand-hub-card-tag font-bold text-[10px] uppercase text-[#006569] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  {item.category}
                </span>
                <strong className="text-sm sm:text-base text-slate-900 font-black">{item.title}</strong>
                <p className="text-xs text-slate-600 leading-snug font-medium">{item.description}</p>
                <span className="brand-hub-card-arrow text-xs font-black text-[#006569] flex items-center gap-1 mt-auto pt-2">
                  <span>Buka</span>
                  <ArrowRight size={13} />
                </span>
              </>
            );
            return item.to ? (
              <Link key={item.title} to={item.to} className="brand-hub-card neu-card p-4 sm:p-5 hover:-translate-y-1.5 transition">
                {content}
              </Link>
            ) : (
              <a
                key={item.title}
                className="brand-hub-card neu-card p-4 sm:p-5 hover:-translate-y-1.5 transition"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {content}
              </a>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="brand-hub-empty rounded-3xl neu-card p-8 text-center space-y-2.5">
            <Search size={28} className="mx-auto text-slate-400" />
            <h3 className="text-base font-black text-slate-800">Tidak ada hasil.</h3>
            <p className="text-xs text-slate-500">Reset filter untuk melihat seluruh direktori.</p>
            <button
              type="button"
              onClick={() => {
                playTactileClick('release');
                setQ('');
                setFilter('Semua');
              }}
              className="neu-btn-primary px-4 py-2 rounded-xl text-xs font-black text-[#FFDD00]"
            >
              Reset Filter
            </button>
          </div>
        )}

        <div className="brand-hub-help rounded-3xl neu-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-[#006569] flex items-center justify-center font-black shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <strong className="text-sm font-black text-slate-900">Butuh bantuan langsung?</strong>
              <p className="text-xs text-slate-500">
                Hubungi WhatsApp resmi Piket Mako Satuan UNJ.
              </p>
            </div>
          </div>
          <a
            href={SITE.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="neu-btn-strong-green px-4 py-2.5 rounded-full text-xs font-black text-white flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <span>Chat Piket Mako</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </section>
    </div>
  );
}
