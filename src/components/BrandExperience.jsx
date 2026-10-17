import React, { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowRight, BookOpen, CalendarDays, ChevronRight, Compass, ExternalLink, FileText, HeartHandshake, MapPin, Search, ShieldCheck, Sparkles, Trophy, Users, Zap } from 'lucide-react';
import { Link, navigate } from '../lib/router.jsx';
import { HeroStage, HeroLogo, Reveal } from './MenwaUI.jsx';
import PortalIcon from './PortalIcon.jsx';
import { resolvePortalPath } from '../lib/portalSearch.js';
import { PROGRAMS, SITE } from '../data/siteData.js';
import { usePublishedAction } from '../command/PublicActions.jsx';
import './BrandExperience.css';

const primaryGuides = [
  { title: 'Ksatria Cendekia VIII', category: 'Program unggulan', description: 'Kompetisi nasional, juknis, jersey, pendaftaran, dan jadwal.', to: '/kc', icon: Trophy },
  { title: 'Youth Spark National', category: 'Seminar & pembinaan', description: 'Pembinaan Aktivitas Pemuda, narasumber, rundown, dan pendaftaran.', to: '/youth-spark/seminar-webinar', icon: Sparkles },
  { title: 'Garis Komando', category: 'Tentang organisasi', description: 'Kenali struktur, personel, dan unsur kepemimpinan satuan.', to: '/garis-komando', icon: Users },
  { title: 'Pendidikan & Pelatihan', category: 'Pembinaan anggota', description: 'Jalur pembinaan dan kegiatan pendidikan Menwa UNJ.', to: '/pendidikan', icon: BookOpen },
  { title: 'Markas Komando', category: 'Lokasi & kontak', description: 'Temukan markas, nomor kontak, dan cara menghubungi satuan.', to: '/mako', icon: MapPin },
  { title: 'Administrasi Umum', category: 'Layanan', description: 'Informasi prosedur administrasi, surat, dan layanan satuan.', to: '/administrasi', icon: FileText },
];

export const informationIndex = [
  ...primaryGuides,
  { actionId: 'kc-jersey-peserta', title: 'Jersey Peserta KC VIII', category: 'Formulir kegiatan', description: 'Pendataan jersey ATHLETE untuk peserta KC VIII.', href: 'https://forms.gle/voyPEgvxvhS8VrKf8', icon: ExternalLink },
  { actionId: 'kc-jersey-official', title: 'Jersey Official KC VIII', category: 'Formulir kegiatan', description: 'Pre-order jersey OFFICIAL, harga Rp150.000.', href: 'https://forms.gle/RHoXRFTEVKWHQfFx9', icon: ExternalLink },
  { actionId: 'kc-registration', title: 'Pendaftaran KC VIII', category: 'Pendaftaran kegiatan', description: 'Pendaftaran tim KC VIII melalui formulir panitia.', href: 'https://bit.ly/PendaftaranKCVIII', icon: ExternalLink },
  { actionId: 'youth-spark-registration', title: 'Daftar Seminar Youth Spark', category: 'Pendaftaran kegiatan', description: 'Pendaftaran seminar nasional Youth Spark.', href: 'https://forms.gle/Xc3QsBLNueoXYLfDA', icon: ExternalLink },
  { title: 'Rundown Youth Spark (PDF)', category: 'Dokumen publik', description: 'Rundown resmi seminar pukul 08.00–12.00 WIB.', href: '/dokumen/youth-spark-rundown.pdf', icon: FileText },
];

const actionFallbacks = Object.fromEntries(informationIndex.filter((item) => item.actionId).map((item) => [item.actionId, item.href]));

export function usePublishedInformationIndex() {
  const kc = usePublishedAction('kc-registration', actionFallbacks['kc-registration']);
  const youth = usePublishedAction('youth-spark-registration', actionFallbacks['youth-spark-registration']);
  const peserta = usePublishedAction('kc-jersey-peserta', actionFallbacks['kc-jersey-peserta']);
  const official = usePublishedAction('kc-jersey-official', actionFallbacks['kc-jersey-official']);
  return useMemo(() => {
    const urls = { 'kc-registration': kc, 'youth-spark-registration': youth, 'kc-jersey-peserta': peserta, 'kc-jersey-official': official };
    return informationIndex.map((item) => item.actionId ? { ...item, href: urls[item.actionId] } : item);
  }, [kc, youth, peserta, official]);
}

const EventStoryCard = ({ to, image, eyebrow, title, meta, description, variant = '' }) => (
  <Link to={to} className={`brand-event-card ${variant}`}>
    <div className="brand-event-image"><img loading="lazy" src={image} alt="" /></div>
    <span className="brand-event-cover" />
    <div className="brand-event-content">
      <span className="brand-event-kicker"><span className="brand-event-dot" />{eyebrow}</span>
      <h3>{title}</h3>
      <p className="brand-event-meta">{meta}</p>
      <p className="brand-event-desc">{description}</p>
      <span className="brand-event-action">Lihat kegiatan <ArrowRight size={17} /></span>
    </div>
  </Link>
);

export function BrandHome({ onOpenSearch }) {
  return (
    <div className="brand-home">
      {/* Hero asli dari ZIP pertama: HeroStage memiliki parallax kursor, Ken Burns, dan ambient light. */}
      <HeroStage className="brand-legacy-hero py-24 md:py-36" photo="/foto-kampus-unj.jpg" blur={3} dim={0.55}>
        <Reveal className="brand-legacy-inner relative z-20 mx-auto flex max-w-6xl flex-col items-center px-4 text-center">
          <div className="mb-8"><HeroLogo alt="Lambang Resimen Mahasiswa Jayakarta Satuan UNJ" /></div>
          <h1 id="brand-home-title" className="brand-legacy-title mb-2 font-black leading-tight tracking-tight text-white drop-shadow-md"><span>KOMANDO RESIMEN MAHASISWA</span><span>JAYAKARTA</span></h1>
          <div className="my-2 text-xl font-extrabold uppercase tracking-widest text-[#FFDD00] drop-shadow-lg sm:text-2xl md:text-4xl">SATUAN UNIVERSITAS NEGERI JAKARTA</div>
          <div className="my-6 h-1.5 w-40 rounded-full bg-gradient-to-r from-[#006569] via-[#FFDD00] to-[#006569] shadow-[0_0_20px_rgba(255,221,0,0.8)]" />
          <p className="brand-legacy-motto rounded-2xl border border-white/10 bg-black/40 px-5 py-3 font-semibold italic leading-relaxed text-slate-100 shadow-lg backdrop-blur-sm">“Penyempurnaan Pengabdian dengan Ilmu Pengetahuan dan Ilmu Olah Keprajuritan.”</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#FFDD00]/60 bg-gradient-to-r from-[#006569]/50 to-[#00383b]/60 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-[#FFDD00] shadow-md md:text-sm"><ShieldCheck size={16} className="animate-pulse" /> WIDYA CASTRENA DHARMA SIDDHA</div>
          <div className="brand-hero-actions mt-9 flex flex-wrap justify-center gap-3">
            <Link to="/informasi" className="brand-btn brand-btn--gold">Jelajahi Pusat Informasi <ArrowRight size={19} /></Link>
            <Link to="/garis-komando" className="brand-btn brand-btn--outline">Kenali Organisasi <ChevronRight size={19} /></Link>
          </div>
          <a className="brand-legacy-scroll" href="#sorotan-giat">Lihat sorotan kegiatan <ArrowDownRight size={18} /></a>
        </Reveal>
      </HeroStage>

      <section className="brand-access" id="akses-cepat" aria-labelledby="akses-cepat-title">
        <div className="brand-container">
          <div className="brand-section-heading">
            <div><span className="brand-section-overline">ORIENTASI PENGUNJUNG</span><h2 id="akses-cepat-title">Apa yang ingin kamu <em>temukan?</em></h2><p>Pilih tujuanmu dan langsung menuju informasi yang dibutuhkan.</p></div>
            <button type="button" className="brand-text-action" onClick={onOpenSearch}><Search size={18} /> Cari semua informasi <ArrowRight size={16} /></button>
          </div>
          <div className="brand-access-grid">
            {primaryGuides.slice(0,4).map((guide, i) => {
              const Icon = guide.icon;
              return <Link key={guide.to} to={guide.to} className="brand-access-item"><span className="brand-access-index">0{i+1}</span><span className="brand-access-icon"><PortalIcon kind={guide.to} size={26} /></span><strong>{guide.title}</strong><span className="brand-access-description">{guide.description}</span><span className="brand-access-arrow"><ArrowRight size={17} /></span></Link>;
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
          <div className="brand-values-intro"><span className="brand-section-overline">WIDYA CASTRENA DHARMA SIDDHA</span><h2 id="nilai-menwa-title">Bukan sekadar organisasi. <em>Ruang untuk bertumbuh.</em></h2><p>Melalui pembinaan, kerja sama, dan pengabdian, Menwa UNJ menghadirkan ruang bagi mahasiswa untuk mengembangkan disiplin, pengetahuan, dan tanggung jawab sosial.</p><Link to="/pendidikan" className="brand-btn brand-btn--dark">Pelajari Pembinaan <ArrowRight size={18} /></Link></div>
          <div className="brand-values-list">
            <div><span><BookOpen size={22} /></span><div><strong>Ilmu & Pembinaan</strong><p>Belajar menjadi pribadi terampil, kritis, dan siap berkembang.</p></div></div>
            <div><span><HeartHandshake size={22} /></span><div><strong>Pengabdian Nyata</strong><p>Menghubungkan semangat mahasiswa dengan kebutuhan masyarakat.</p></div></div>
            <div><span><Compass size={22} /></span><div><strong>Kepemimpinan & Kebersamaan</strong><p>Menumbuhkan tanggung jawab, kolaborasi, dan solidaritas satuan.</p></div></div>
          </div>
        </div>
      </section>
  </div>
);

const FILTERS = ['Semua', 'Program unggulan', 'Seminar & pembinaan', 'Tentang organisasi', 'Pembinaan anggota', 'Lokasi & kontak', 'Layanan', 'Formulir kegiatan', 'Pendaftaran kegiatan', 'Dokumen publik'];

export function InformationHub({ onOpenSearch }) {
  const publishedInformationIndex = usePublishedInformationIndex();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('Semua');
  const [searching, setSearching] = useState(false);
  const [noMatch, setNoMatch] = useState(false);
  const runAiSearch = async (event) => {
    event.preventDefault();
    if (!q.trim() || searching) return;
    setNoMatch(false); setSearching(true);
    try {
      const path = await resolvePortalPath(q);
      if (path) navigate(path);
      else setNoMatch(true);
    } finally { setSearching(false); }
  };
  const items = useMemo(() => publishedInformationIndex.filter((item) => {
    if (filter !== 'Semua' && item.category !== filter) return false;
    const s = `${item.title} ${item.description} ${item.category}`.toLowerCase();
    return s.includes(q.toLowerCase().trim());
  }), [q, filter, publishedInformationIndex]);

  return <div className="brand-hub">
    <header className="brand-hub-head">
      <div className="brand-container">
        <span className="brand-eyebrow"><Zap size={14} /> PUSAT SUMBER INFORMASI</span>
        <h1>Semua akses, <em>di satu tempat.</em></h1>
        <p>Temukan halaman, informasi kegiatan, formulir, dan layanan penting Menwa UNJ. Cari dengan bahasa sehari-hari. AI akan memilih halaman yang sesuai dan mengarahkanmu ke sana tanpa membuat balasan chat.</p>
        <form className="brand-hub-searchbox" onSubmit={runAiSearch}><Search size={20} /><input value={q} onChange={e => {setQ(e.target.value);setNoMatch(false);}} placeholder="Contoh: saya mau lihat pendaftaran jersey peserta..." type="search" aria-label="Cari informasi dengan AI" /><button type="submit" disabled={searching || !q.trim()}>{searching ? "Mencari…" : "Cari dengan AI →"}</button></form>{noMatch && <p className="brand-hub-ai-status" role="status">Belum ada halaman yang cocok. Coba kata kunci lain.</p>}
      </div>
    </header>
    <section className="brand-hub-results brand-container" aria-labelledby="brand-hub-directory-title">
      <div className="brand-section-heading"><div><span className="brand-section-overline">DIREKTORI PORTAL</span><h2 id="brand-hub-directory-title">Jelajahi informasi</h2><p>{items.length} hasil untuk pilihanmu.</p></div></div>
      <div className="brand-hub-filters" role="group" aria-label="Filter kategori informasi">{FILTERS.map(cat => <button type="button" key={cat} className={filter===cat?'is-active':''} aria-pressed={filter===cat} onClick={() => setFilter(cat)}>{cat}</button>)}</div>
      <div className="brand-hub-grid">{items.map((item)=> {
        const Icon=item.icon;
        const content=<><span className="brand-hub-card-icon"><PortalIcon kind={item.to || item.category} size={24} /></span><span className="brand-hub-card-tag">{item.category}</span><strong>{item.title}</strong><p>{item.description}</p><span className="brand-hub-card-arrow">Buka informasi <ArrowRight size={17} /></span></>;
        return item.to ? <Link key={item.title} to={item.to} className="brand-hub-card">{content}</Link> : <a key={item.title} className="brand-hub-card" href={item.href} target="_blank" rel="noopener noreferrer">{content}</a>;
      })}</div>
      {items.length===0 && <div className="brand-hub-empty"><Search size={26}/><h3>Belum ada hasil yang sesuai.</h3><p>Coba kata kunci lain atau kembali ke semua kategori.</p><button type="button" onClick={() => {setQ('');setFilter('Semua');}}>Tampilkan semua</button></div>}
      <div className="brand-hub-help"><ShieldCheck size={22}/><div><strong>Masih membutuhkan bantuan?</strong><p>Untuk pertanyaan mengenai keanggotaan dan administrasi, hubungi satuan melalui kontak resmi.</p></div><a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">Hubungi Menwa UNJ <ExternalLink size={16}/></a></div>
    </section>
  </div>;
}
