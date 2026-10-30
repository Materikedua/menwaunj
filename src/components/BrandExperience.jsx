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
    description: 'Kompetisi nasional, juknis, jersey, pendaftaran, dan jadwal.',
    to: '/kc',
    icon: Trophy,
  },
  {
    title: 'Youth Spark National',
    category: 'Seminar & pembinaan',
    description: 'Pembinaan Aktivitas Pemuda, narasumber, rundown, dan informasi kegiatan.',
    to: '/youth-spark',
    icon: Sparkles,
  },
  {
    title: 'Gerakan Paskibra Semangat VII',
    category: 'Lomba Paskibra Nasional',
    description: 'Kompetisi formasi pengibaran bendera, juknis GERANAT VII, dan e-voting juara terfavorit.',
    to: '/geranat',
    icon: Trophy,
  },
  {
    title: 'Galeri & Dokumentasi',
    category: 'Arsip Lensa',
    description: 'Dokumentasi dan arsip foto kegiatan resmi Menwa UNJ 2023–2026.',
    to: '/gallery',
    icon: Sparkles,
  },
  {
    title: 'Garis Komando',
    category: 'Tentang organisasi',
    description: 'Kenali struktur, personel, dan unsur kepemimpinan satuan.',
    to: '/garis-komando',
    icon: Users,
  },
  {
    title: 'Markas Komando & Denah',
    category: 'Lokasi & kontak',
    description: 'Blueprint Mako Gedung G R.107, nomor piket, dan panduan rute transportasi.',
    to: '/mako',
    icon: MapPin,
  },
  {
    title: 'Administrasi Umum',
    category: 'Layanan',
    description: 'Informasi prosedur administrasi, surat, permohonan, dan layanan satuan.',
    to: '/administrasi',
    icon: FileText,
  },
];

export const informationIndex = [
  ...primaryGuides,
  {
    title: 'Cari Progres Surat Masuk',
    category: 'Layanan administrasi',
    description: 'Lacak status disposisi surat, verifikasi berkas, dan nomor registrasi permohonan dinas.',
    to: '/administrasi',
    icon: FileText,
  },
  {
    title: 'Pendidikan & Latihan Satuan',
    category: 'Kurikulum militer',
    description: 'Kurikulum Diksar, Kursus Dinas Staf, Provos, dan Diksar Militer Kodam.',
    to: '/pendidikan',
    icon: BookOpen,
  },
  {
    title: 'Taktik Menwa & Games Interaktif',
    category: 'Simulasi kuis & poin',
    description: 'Kuis taktis keprajuritan, mini games, EXP harian, dan papan peringkat.',
    to: '/games',
    icon: Activity,
  },
  {
    title: 'Jersey Peserta KC VIII',
    category: 'Formulir kegiatan',
    description: 'Pendataan jersey ATHLETE untuk peserta KC VIII.',
    href: 'https://forms.gle/voyPEgvxvhS8VrKf8',
    icon: ExternalLink,
  },
  {
    title: 'Jersey Official KC VIII',
    category: 'Formulir kegiatan',
    description: 'Pre-order jersey OFFICIAL, harga Rp150.000.',
    href: 'https://forms.gle/RHoXRFTEVKWHQfFx9',
    icon: ExternalLink,
  },
  {
    title: 'Pendaftaran KC VIII',
    category: 'Pendaftaran kegiatan',
    description: 'Pendaftaran tim KC VIII melalui formulir panitia.',
    href: 'https://bit.ly/PendaftaranKCVIII',
    icon: ExternalLink,
  },
  {
    title: 'Daftar Seminar Youth Spark',
    category: 'Pendaftaran kegiatan',
    description: 'Pendaftaran seminar nasional Youth Spark.',
    href: 'https://forms.gle/Xc3QsBLNueoXYLfDA',
    icon: ExternalLink,
  },
  {
    title: 'Rundown Youth Spark (PDF)',
    category: 'Dokumen publik',
    description: 'Rundown resmi seminar pukul 08.00–12.00 WIB.',
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
        Lihat kegiatan <ArrowRight size={17} />
      </span>
    </div>
  </Link>
);

export function BrandHome({ onOpenSearch }) {
  return (
    <div className="brand-home">
      {/* Hero: HeroStage dengan parallax kursor, Ken Burns, dan ambient light */}
      <HeroStage
        className="brand-legacy-hero py-24 md:py-36"
        photo="/foto-kampus-unj.jpg"
        blur={3}
        dim={0.55}
      >
        <Reveal className="brand-legacy-inner relative z-20 mx-auto flex max-w-6xl flex-col items-center px-4 text-center">
          <div className="mb-8">
            <HeroLogo alt="Lambang Resimen Mahasiswa Jayakarta Satuan UNJ" />
          </div>
          <h1
            id="brand-home-title"
            className="brand-legacy-title mb-2 font-black leading-tight tracking-tight text-white drop-shadow-md"
          >
            <span>KOMANDO RESIMEN MAHASISWA</span>
            <span>JAYAKARTA</span>
          </h1>
          <div className="my-2 text-xl font-extrabold uppercase tracking-widest text-[#FFDD00] drop-shadow-lg sm:text-2xl md:text-4xl">
            SATUAN UNIVERSITAS NEGERI JAKARTA
          </div>
          <div className="my-6 h-1.5 w-40 rounded-full bg-gradient-to-r from-[#006569] via-[#FFDD00] to-[#006569] shadow-[0_0_20px_rgba(255,221,0,0.8)]" />
          <p className="brand-legacy-motto rounded-2xl border border-white/10 bg-black/40 px-5 py-3 font-semibold italic leading-relaxed text-slate-100 shadow-lg backdrop-blur-sm">
            “Penyempurnaan Pengabdian dengan Ilmu Pengetahuan dan Ilmu Olah Keprajuritan.”
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#FFDD00]/60 bg-gradient-to-r from-[#006569]/50 to-[#00383b]/60 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-[#FFDD00] shadow-md md:text-sm">
            <ShieldCheck size={16} className="animate-pulse" /> WIDYA CASTRENA DHARMA SIDDHA
          </div>
          <div className="brand-hero-actions mt-9 flex flex-wrap justify-center gap-3">
            <Link to="/informasi" className="neu-btn-gold px-6 py-3.5 rounded-2xl text-xs md:text-sm font-black flex items-center gap-2 shadow-lg">
              <span>Jelajahi Pusat Informasi</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/gallery" className="neu-btn-primary px-6 py-3.5 rounded-2xl text-xs md:text-sm font-black flex items-center gap-2 shadow-lg text-[#FFDD00]">
              <span>Galeri &amp; Dokumentasi Kegiatan</span>
              <Sparkles size={18} />
            </Link>
            <Link to="/garis-komando" className="neu-btn px-6 py-3.5 rounded-2xl text-xs md:text-sm font-bold flex items-center gap-2 text-slate-800">
              <span>Kenali Organisasi</span>
              <ChevronRight size={18} />
            </Link>
          </div>
          <DynamicCanvasZone containerId="hero_cta_slot" className="mt-4 max-w-md w-full" />
          <a className="brand-legacy-scroll" href="#akses-cepat">
            Lihat akses cepat &amp; sorotan <ArrowDownRight size={18} />
          </a>
        </Reveal>
      </HeroStage>

      {/* Akses Cepat Orientasi Pengunjung */}
      <section className="brand-access" id="akses-cepat" aria-labelledby="akses-cepat-title">
        <div className="brand-container">
          <div className="brand-section-heading">
            <div>
              <span className="brand-section-overline">ORIENTASI PENGUNJUNG</span>
              <h2 id="akses-cepat-title">
                Apa yang ingin kamu <em>temukan?</em>
              </h2>
              <p>Pilih tujuanmu dan langsung menuju informasi yang dibutuhkan.</p>
            </div>
            <button
              type="button"
              className="neu-pill-tab text-xs font-black text-[#006569] flex items-center gap-2 cursor-pointer shadow-sm"
              onClick={() => {
                playTactileClick('press');
                onOpenSearch();
              }}
            >
              <Search size={15} />
              <span>Cari semua informasi</span>
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="brand-access-grid">
            {primaryGuides.slice(0, 4).map((guide, i) => {
              const Icon = guide.icon;
              return (
                <Link
                  key={guide.to}
                  to={guide.to}
                  className="brand-access-item neu-card hover:-translate-y-2 transition-all duration-300"
                >
                  <span className="brand-access-index">0{i + 1}</span>
                  <span className="brand-access-icon">
                    <PortalIcon kind={guide.to} size={26} />
                  </span>
                  <strong>{guide.title}</strong>
                  <span className="brand-access-description">{guide.description}</span>
                  <span className="brand-access-arrow">
                    <ArrowRight size={17} />
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
            Bukan sekadar organisasi. <em>Ruang untuk bertumbuh.</em>
          </h2>
          <p>
            Melalui pembinaan, kerja sama, dan pengabdian, Menwa UNJ menghadirkan ruang bagi mahasiswa
            untuk mengembangkan disiplin, pengetahuan, dan tanggung jawab sosial.
          </p>
          <Link to="/pendidikan" className="neu-btn-primary px-6 py-3.5 rounded-2xl text-xs font-black inline-flex items-center gap-2 text-[#FFDD00] shadow-md">
            <span>Pelajari Pembinaan</span>
            <ArrowRight size={18} />
          </Link>
        </div>
        <div className="brand-values-list">
          <div>
            <span>
              <BookOpen size={22} />
            </span>
            <div>
              <strong>Ilmu &amp; Pembinaan</strong>
              <p>Belajar menjadi pribadi terampil, kritis, dan siap berkembang.</p>
            </div>
          </div>
          <div>
            <span>
              <HeartHandshake size={22} />
            </span>
            <div>
              <strong>Pengabdian Nyata</strong>
              <p>Menghubungkan semangat mahasiswa dengan kebutuhan masyarakat.</p>
            </div>
          </div>
          <div>
            <span>
              <Compass size={22} />
            </span>
            <div>
              <strong>Kepemimpinan &amp; Kebersamaan</strong>
              <p>Menumbuhkan tanggung jawab, kolaborasi, dan solidaritas satuan.</p>
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
        <div className="brand-container space-y-4">
          <span className="brand-eyebrow">
            <Zap size={14} /> PUSAT SUMBER INFORMASI TERPADU
          </span>
          <h1>
            Semua akses, <em>di satu tempat.</em>
          </h1>
          <p>
            Temukan halaman, informasi kegiatan, formulir pendaftaran, simulasi kebugaran jasmani, dan
            layanan penting Menwa UNJ. Cari dengan bahasa sehari-hari.
          </p>

          {/* Form Pencarian Backlit Warm Ambient Glow (Ref: Image 4) */}
          <form
            onSubmit={runAiSearch}
            className="neu-search-capsule max-w-2xl w-full p-2.5 sm:p-3 mt-6 flex items-center gap-3 shadow-2xl"
          >
            <Search size={20} className="text-[#006569] shrink-0 ml-2" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setNoMatch(false);
              }}
              placeholder="Contoh: pendaftaran anggota baru, jadwal latihan, lokasi mako..."
              type="search"
              aria-label="Cari informasi dengan AI"
              style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
              className="flex-1 min-w-0 bg-transparent text-slate-950 text-xs sm:text-sm font-bold outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={searching || !q.trim()}
              className="neu-btn-primary px-5 py-2.5 rounded-full text-xs font-black text-[#FFDD00] shrink-0 disabled:opacity-40 shadow-sm cursor-pointer"
            >
              {searching ? 'Mencari…' : 'Cari Cepat →'}
            </button>
          </form>

          {noMatch && (
            <p className="brand-hub-ai-status text-amber-300 text-xs font-bold pt-2" role="status">
              Belum ada halaman yang cocok. Coba kata kunci lain atau pilih direktori kategori di bawah.
            </p>
          )}
        </div>
      </header>

      <section
        className="brand-hub-results brand-container space-y-6"
        aria-labelledby="brand-hub-directory-title"
      >
        <div className="brand-section-heading">
          <div>
            <span className="brand-section-overline">DIREKTORI PORTAL LENGKAP</span>
            <h2 id="brand-hub-directory-title">Jelajahi Informasi &amp; Layanan</h2>
            <p>{items.length} hasil siap diakses.</p>
          </div>
        </div>

        {/* Tab Pill Filter Kategorikal (Ref: Image 1) */}
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
            const Icon = item.icon;
            const content = (
              <>
                <span className="brand-hub-card-icon">
                  <PortalIcon kind={item.to || item.category} size={24} />
                </span>
                <span className="brand-hub-card-tag font-bold text-[10px] uppercase text-[#006569] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  {item.category}
                </span>
                <strong className="text-base text-slate-900 font-black">{item.title}</strong>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.description}</p>
                <span className="brand-hub-card-arrow text-xs font-black text-[#006569] flex items-center gap-1 mt-auto pt-2">
                  <span>Buka Informasi</span>
                  <ArrowRight size={14} />
                </span>
              </>
            );
            return item.to ? (
              <Link key={item.title} to={item.to} className="brand-hub-card neu-card p-5 hover:-translate-y-1.5 transition">
                {content}
              </Link>
            ) : (
              <a
                key={item.title}
                className="brand-hub-card neu-card p-5 hover:-translate-y-1.5 transition"
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
          <div className="brand-hub-empty rounded-3xl neu-card p-10 text-center space-y-3">
            <Search size={32} className="mx-auto text-slate-400" />
            <h3 className="text-lg font-black text-slate-800">Belum ada hasil yang sesuai.</h3>
            <p className="text-xs text-slate-500">Coba kata kunci lain atau kembali ke semua kategori.</p>
            <button
              type="button"
              onClick={() => {
                playTactileClick('release');
                setQ('');
                setFilter('Semua');
              }}
              className="neu-btn-primary px-5 py-2 rounded-xl text-xs font-black text-[#FFDD00]"
            >
              Tampilkan Semua
            </button>
          </div>
        )}

        <div className="brand-hub-help rounded-3xl neu-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-[#006569] flex items-center justify-center font-black">
              <ShieldCheck size={22} />
            </div>
            <div>
              <strong className="text-sm font-black text-slate-900">Masih membutuhkan bantuan?</strong>
              <p className="text-xs text-slate-500">
                Hubungi Mako Komando Satuan UNJ melalui kontak WhatsApp resmi piket jaga.
              </p>
            </div>
          </div>
          <a
            href={SITE.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="neu-btn-strong-green px-5 py-2.5 rounded-full text-xs font-black text-white flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <span>Hubungi Menwa UNJ</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </section>
    </div>
  );
}
