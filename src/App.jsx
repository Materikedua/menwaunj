import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import {
  X,
  Menu,
  Shield,
  ShieldCheck,
  User,
  Award,
  Compass,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  Trophy,
  Sparkles,
  Flame, ArrowRight, Search as SearchIcon,
  Users,
  Images,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from './lib/authContext.jsx';
import { UserAccountModal } from './components/UserAccountModal.jsx';
import { TacticalMakoNavigator } from './components/TacticalMakoNavigator.jsx';
import { SamaptaCalculatorModal } from './components/SamaptaCalculatorModal.jsx';
import { TacticalKTACardModal } from './components/TacticalKTACardModal.jsx';
import { isTactileAudioMuted, setTactileAudioMuted } from './lib/tactileAudio.js';
import { TacticalConfetti } from './components/TacticalConfetti.jsx';
import {
  MotionStyles,
  Reveal,
  ScrollProgress,
  CursorGlow,
  CursorFollower,
  HeroStage,
  NavBar,
  TabSwitch,
} from './components/MenwaUI.jsx';
import { HomeSections, SiteFooter, ProgramPage, YouthSparkPage } from './components/Sections.jsx';
import { useRoute, navigate, Link, TAB_PATHS, PATH_TABS } from './lib/router.jsx';
import { syncDocumentMetadata } from './lib/seo.js';
import { MusicPlayer } from './components/MusicPlayer.jsx';
import { LaptopMotion } from './components/MotionAssets.jsx';
import { BrandHome, BrandValues, InformationHub } from './components/BrandExperience.jsx';
import { CommandPalette, PageWayfinder, BackToTop } from './components/PortalUtilities.jsx';
import { CanvasProvider } from './lib/canvasStore.jsx';
import { DynamicCanvasZone } from './components/DynamicCanvasZone.jsx';
import { PWAInstallBanner } from './components/PWAInstallBanner.jsx';
import { PROGRAMS, HERO_PHOTO } from './data/siteData.js';
import { subscribeToLockdownState, DEFAULT_LOCKDOWN_STATE } from './firebase.js';
import { EmergencyLockdownScreen } from './components/EmergencyLockdownScreen.jsx';
import { LiveChatWidget } from './components/LiveChatWidget.jsx';
import { StrukturOrganisasiTab } from './components/tabs/StrukturOrganisasiTab.jsx';
import { PendidikanTab } from './components/tabs/PendidikanTab.jsx';
import { AdministrasiUmumTab } from './components/tabs/AdministrasiUmumTab.jsx';

/* ─── Code-split Komponen Berat ─── */
const AdministrationFormModal = lazy(() =>
  import('./components/AdministrationFormModal.jsx').then((m) => ({ default: m.AdministrationFormModal }))
);
const GamificationHub = lazy(() =>
  import('./components/GamificationHub.jsx').then((m) => ({ default: m.GamificationHub }))
);
const GamesPage = lazy(() =>
  import('./components/GamesPage.jsx').then((m) => ({ default: m.GamesPage }))
);
const GeranatVoting = lazy(() =>
  import('./components/GeranatVoting.jsx').then((m) => ({ default: m.GeranatVoting }))
);
const ParticipantPortal = lazy(() =>
  import('./components/ParticipantPortal.jsx').then((m) => ({ default: m.ParticipantPortal }))
);
const GalleryPage = lazy(() =>
  import('./components/GalleryPage.jsx').then((m) => ({ default: m.GalleryPage }))
);
const BankApprovalBanner = lazy(() =>
  import('./components/BankApprovalBanner.jsx').then((m) => ({ default: m.BankApprovalBanner }))
);
const CommandCenterPage = lazy(() =>
  import('./components/CommandCenterPage.jsx').then((m) => ({ default: m.CommandCenterPage }))
);
const EDispensasiVerifyPage = lazy(() =>
  import('./components/EDispensasiVerifyPage.jsx').then((m) => ({ default: m.EDispensasiVerifyPage }))
);
const PrivacyPolicyPage = lazy(() =>
  import('./components/LegalPages.jsx').then((m) => ({ default: m.PrivacyPolicyPage }))
);
const TermsOfServicePage = lazy(() =>
  import('./components/LegalPages.jsx').then((m) => ({ default: m.TermsOfServicePage }))
);

const PageLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-slate-400">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-4 border-[#006569]/20" />
      <div className="absolute inset-0 rounded-full border-4 border-t-[#006569] border-r-[#FFDD00]/60 animate-spin" />
    </div>
    <span className="text-sm font-medium tracking-wide uppercase opacity-70">Memuat halaman…</span>
  </div>
);

const handleImgError = (e, text, bgColor = '006569', textColor = 'FFDD00') => {
  e.target.onerror = null;
  e.target.src = `https://placehold.co/600x400/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`;
};

const RevealOnScroll = Reveal;

const NAV_ITEMS = [
  {
    id: 'beranda',
    label: 'Beranda',
    icon: <Compass size={20} />,
    desc: 'Identitas, program, & informasi satuan.',
  },
  {
    id: 'gallery',
    label: 'Galeri',
    icon: <Images size={20} />,
    desc: 'Dokumentasi giat & arsip visual satuan.',
  },
  {
    id: 'informasi',
    label: 'Pusat Informasi',
    icon: <SearchIcon size={20} />,
    desc: 'Direktori terpadu layanan & panduan.',
  },
  {
    id: 'kegiatan',
    label: 'Kegiatan & Lomba',
    icon: <Trophy size={20} />,
    desc: 'Ajang nasional & pembinaan pemuda.',
    children: [
      {
        id: 'kc',
        label: 'KC VIII',
        badge: 'Lomba Nasional',
        icon: <Trophy size={16} className="text-[#FFDD00]" />,
        desc: 'Kompetisi Pemuda Nusantara & jersey.',
      },
      {
        id: 'youth-spark',
        label: 'Youth Spark',
        badge: 'Seminar Nasional',
        icon: <Sparkles size={16} className="text-amber-400" />,
        desc: 'Seminar nasional, pelatihan & lomba.',
      },
      {
        id: 'geranat',
        label: 'Geranat VII',
        badge: 'LFPB & Paskibra',
        icon: <Award size={16} className="text-emerald-400" />,
        desc: 'Lomba formasi paskibra & e-voting.',
      },
    ],
  },
  {
    id: 'struktur',
    label: 'Organisasi',
    icon: <Shield size={20} />,
    desc: 'Garis Komando & struktur organisasi.',
  },
  {
    id: 'administrasi',
    label: 'Adminu',
    icon: <FileText size={20} />,
    desc: 'Pendaftaran, layanan dinas, & Mako.',
  },
];

const Navigation = (props) => (
  <NavBar
    {...props}
    onNavigate={props.handleQuickSearch}
    navItems={NAV_ITEMS}
    MenuIcon={<Menu size={28} />}
    CloseIcon={<X size={28} />}
    rightSlot={
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={props.onOpenSearch}
          className="portal-search-trigger shrink-0"
          aria-label="Cari informasi portal, tekan Ctrl K atau Command K"
          title="Cari cepat • Ctrl/⌘ K"
        >
          <SearchIcon size={17} />
          <span className="hidden sm:inline">Cari</span>
          <kbd className="hidden xl:inline">⌘ K</kbd>
        </button>
        <MusicPlayer />
        <button
          type="button"
          onClick={() => {
            const next = !props.tactileAudioMuted;
            setTactileAudioMuted(next);
            props.onToggleAudio?.(next);
          }}
          className="hidden sm:inline-flex p-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white transition hover:scale-105 shrink-0"
          title={props.tactileAudioMuted ? 'Aktifkan Efek Suara Haptic Tombol 3D' : 'Senyapkan Efek Suara Tombol'}
        >
          {props.tactileAudioMuted ? (
            <VolumeX size={15} className="text-slate-400" />
          ) : (
            <Volume2 size={15} className="text-amber-400" />
          )}
        </button>
        <div className="flex items-center gap-1 sm:gap-2 pl-1 border-l border-slate-200/60 dark:border-white/10">
          <button
            type="button"
            onClick={props.onOpenGamification}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-black transition border border-amber-500/40 bg-slate-900/90 hover:bg-slate-800 text-amber-300 shadow-sm hover:scale-105"
            title="Buka Subtab Games, Kuis Taktis & Papan Peringkat"
          >
            <Flame size={14} className="text-amber-400 fill-amber-400" />
            <span className="font-mono text-amber-400">{props.profile?.tacticalPoints || 0}</span>
            <span className="hidden md:inline text-[10px] text-slate-400 uppercase">EXP</span>
          </button>
          <button
            type="button"
            onClick={props.onOpenAccount}
            className="portal-account-trigger inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-black transition border border-[#006569]/25 bg-white/90 hover:bg-white text-slate-800 shadow-sm hover:scale-105"
            title={
              props.user
                ? `Akun: ${props.profile?.displayName || props.user.email}`
                : 'Masuk atau Kelola Akun Portal'
            }
          >
            <User size={15} className={props.user ? 'text-[#006569]' : 'text-slate-500'} />
            <span className="hidden sm:inline max-w-[100px] truncate">
              {props.user
                ? props.profile?.displayName?.split(' ')[0] || props.user.email?.split('@')[0]
                : 'Akun'}
            </span>
            {props.profile?.isVerifiedMenwa ? (
              <span title="Anggota Menwa Terverifikasi Resmi">
                <ShieldCheck size={13} className="text-blue-500 shrink-0" />
              </span>
            ) : props.user ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            ) : null}
          </button>
        </div>
      </div>
    }
    onLogoError={(e) => handleImgError(e, 'MENWA UNJ', '006569', 'FFDD00')}
  />
);

const rotatingPhrases = ['Prestasi', 'Pengabdian', 'Anggota', 'Penyelenggaraan'];

const PrideText = () => {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const phrase = rotatingPhrases[index];

  useEffect(() => {
    const pause = !deleting && typed === phrase;
    const timer = setTimeout(
      () => {
        if (pause) {
          setDeleting(true);
          return;
        }
        if (deleting) {
          const next = typed.slice(0, -1);
          setTyped(next);
          if (!next) {
            setDeleting(false);
            setIndex((i) => (i + 1) % rotatingPhrases.length);
          }
        } else {
          setTyped(phrase.slice(0, typed.length + 1));
        }
      },
      pause ? 1500 : deleting ? 55 : 85
    );
    return () => clearTimeout(timer);
  }, [typed, deleting, phrase]);

  return (
    <span className="pride-line">
      <span className="pride-prefix">Menwa UNJ dalam </span>
      <span className="pride-typing">
        <span className="pride-typing__text">{typed}</span>
        <span className="pride-typing__caret" aria-hidden />
      </span>
    </span>
  );
};

const V3_STATS = [
  { label: 'Anggota Aktif', number: 50, icon: Users, color: 'teal' },
  { label: 'Prestasi Terdata', number: 150, icon: Award, color: 'gold' },
  { label: 'Giat Pengabdian Masyarakat', number: 100, icon: Compass, color: 'violet' },
  { label: 'Penyelenggaraan Lomba', number: 30, icon: Trophy, color: 'coral' },
];

const PrideStat = ({ item }) => {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    let running = false;
    const run = () => {
      if (running) return;
      running = true;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setCount(item.number);
        return;
      }
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now-start)/4700);
        const eased = 1 - Math.pow(1 - progress, 2);
        setCount(Math.round(eased * item.number));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          run();
          observer.disconnect();
        }
      },
      { threshold:.58 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [item.number]);
  const Icon = item.icon;
  return (
    <article className={`brand-pride-stat brand-pride-stat--${item.color}`} ref={ref}>
      <span className="brand-pride-icon">
        <Icon size={24} />
      </span>
      <strong>
        {count}
        <i>+</i>
      </strong>
      <span>{item.label}</span>
    </article>
  );
};

const PrideSection = () => (
  <section className="brand-pride" aria-labelledby="brand-pride-title">
    <div className="brand-container">
      <span className="brand-pride-eyebrow">JEJAK &amp; KEBANGGAAN SATUAN</span>
      <h2 id="brand-pride-title">
        <PrideText />
      </h2>
      <p className="brand-pride-lead">Langkah, karya, dan pengabdian yang menjadi kebanggaan Menwa UNJ.</p>
      <div className="brand-pride-grid">
        {V3_STATS.map((item) => (
          <PrideStat key={item.label} item={item} />
        ))}
      </div>
    </div>
  </section>
);

const TabHero = ({ eyebrow, title, subtitle, icon }) => (
  <HeroStage className="min-h-[430px] py-24 md:py-32" photo={HERO_PHOTO} blur={2.5} dim={0.62}>
    <RevealOnScroll className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
      {eyebrow && (
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#FFDD00]/40 bg-black/25 px-5 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#FFDD00] backdrop-blur-sm">
          {icon}
          {eyebrow}
        </div>
      )}
      <h2 className="text-4xl font-black tracking-tight text-white drop-shadow-2xl md:text-6xl">{title}</h2>
      {subtitle && (
        <p className="mx-auto mt-5 max-w-3xl text-lg font-bold leading-relaxed text-[#FFDD00] drop-shadow-lg md:text-xl">
          {subtitle}
        </p>
      )}
    </RevealOnScroll>
  </HeroStage>
);

const BerandaTab = ({ onOpenSearch }) => (
  <div className="flex-grow bg-slate-50 font-sans">
    <BrandHome onOpenSearch={onOpenSearch} />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <DynamicCanvasZone containerId="beranda_showcase_slot" title="Canvas Showcases & Galeri Dokumentasi" />
    </div>
    <HomeSections />
    <BrandValues />
    <PrideSection />
  </div>
);

const MakoTab = () => {
  return (
    <div className="bg-slate-100 min-h-screen pb-32 font-sans flex-grow">
      <TabHero
        title="Markas Komando (MAKO)"
        subtitle="Pusat Komando & Pelayanan Administrasi Satuan UNJ"
        icon={<MapPin size={15} />}
        eyebrow="Markas Komando"
      />
      <div className="max-w-7xl mx-auto px-4 pt-12 md:pt-16 relative z-10 space-y-12">
        <RevealOnScroll delay={200} className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#006569]/10 text-[#006569] rounded-full font-black text-xs uppercase tracking-widest mb-4">
                <MapPin size={16} /> Lokasi Markas Komando
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4">Mako Resimen Mahasiswa UNJ</h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-6">
                Jl. R.Mangun Muka Kampus A UNJ Gedung G R.107, RT.11/RW.14, Rawamangun, Kec. Pulo Gadung, Kota Jakarta
                Timur, Daerah Khusus Ibukota Jakarta 13220
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-700 font-bold text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <Phone className="text-[#006569] shrink-0" size={20} />
                  <span>
                    WhatsApp (Wakil Komandan):{' '}
                    <a
                      href="https://wa.me/6281525823503"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#006569] underline font-black"
                    >
                      +62 815-2582-3503
                    </a>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 font-bold text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <Mail className="text-[#006569] shrink-0" size={20} />
                  <span>
                    Email Satuan:{' '}
                    <a href="mailto:unjmenwa@gmail.com" className="text-[#006569] underline font-black">
                      unjmenwa@gmail.com
                    </a>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 font-bold text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <Clock className="text-[#006569] shrink-0" size={20} />
                  <span>Jam Operasional Piket: Senin - Minggu (08.00 - 22.00 WIB)</span>
                </div>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white h-80 bg-slate-200 relative">
              <iframe
                title="Google Maps Mako Menwa UNJ"
                src="https://maps.google.com/maps?q=Mako%20Menwa%20UNJ%20Universitas%20Negeri%20Jakarta&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                allowFullScreen=""
                loading="lazy"
              />
            </div>
          </div>
        </RevealOnScroll>
        <RevealOnScroll className="mt-12">
          <div className="mako-admin-entry flex flex-col items-start justify-between gap-5 rounded-[2rem] border border-[#006569]/15 bg-gradient-to-r from-white to-[#e8f5f1] p-6 shadow-sm sm:flex-row sm:items-center md:p-8">
            <div className="max-w-xl">
              <span className="text-xs font-black uppercase tracking-[.18em] text-[#006569]">Layanan Satuan</span>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Butuh pengurusan administrasi?</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Pengajuan surat, permohonan personel, peminjaman sarpras, dan kemitraan satuan.
              </p>
            </div>
            <Link to="/administrasi" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#006569] px-6 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#00474c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#006569]">
              Buka Administrasi <ArrowRight size={18} />
            </Link>
          </div>
        </RevealOnScroll>
        <RevealOnScroll>
          <TacticalMakoNavigator />
        </RevealOnScroll>
        <DynamicCanvasZone containerId="mako_slot" title="Layanan & Kontak Tambahan" />
      </div>
    </div>
  );
};

const Footer = SiteFooter;

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error) {
    console.error('Menwa UNJ UI error:', error);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-16 text-center font-sans">
        <div className="max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
          <div className="mx-auto h-40 w-56">
            <LaptopMotion />
          </div>
          <h1 className="mt-4 text-2xl font-black text-slate-900">Halaman tidak dapat ditampilkan</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Ada kendala sementara ketika memuat komponen halaman ini.
          </p>
          {this.state.error?.message && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-left text-xs font-mono text-red-700 break-words">
              {this.state.error.message}
            </div>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                this.setState({ error: null });
                window.location.href = '/';
              }}
              className="rounded-xl border border-slate-300 hover:border-[#006569] px-5 py-2.5 text-xs font-black text-slate-700 transition"
            >
              Ke Beranda
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-[#006569] hover:bg-[#004d50] px-5 py-2.5 text-xs font-black text-[#FFDD00] transition shadow-md"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default function App() {
  const path = useRoute();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [gamificationModalOpen, setGamificationModalOpen] = useState(false);
  const [adminFormModalOpen, setAdminFormModalOpen] = useState(false);
  const [selectedAdminItem, setSelectedAdminItem] = useState(null);
  const [samaptaModalOpen, setSamaptaModalOpen] = useState(false);
  const [ktaModalOpen, setKtaModalOpen] = useState(false);
  const [tactileAudioMuted, setTactileAudioMutedState] = useState(() => isTactileAudioMuted());
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('menwa_dark_mode') === 'true';
    } catch {
      return false;
    }
  });
  const [konamiUnlocked, setKonamiUnlocked] = useState(false);
  const [kioskMode, setKioskMode] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('kiosk') === 'true';
    } catch {
      return false;
    }
  });

  const { user, profile } = useAuth();
  const [lockdownState, setLockdownState] = useState(() => {
    try {
      const saved = localStorage.getItem('menwa_lockdown_state_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_LOCKDOWN_STATE;
  });

  useEffect(() => {
    const unsub = subscribeToLockdownState((state) => {
      if (state) setLockdownState(state);
    });
    return () => unsub();
  }, []);

  const isPrivilegedOfficer = Boolean(
    user &&
      (profile?.role === 'dansat' ||
        profile?.role === 'wadansat' ||
        profile?.role === 'staf_adminu' ||
        profile?.role === 'superadmin' ||
        user.email === 'unjmenwa@gmail.com' ||
        user.email === 'rafflysyahpoetra@gmail.com')
  );

  /* Listener Mode Kiosk */
  useEffect(() => {
    const handleToggle = () => setKioskMode((prev) => !prev);
    const handleKey = (e) => {
      if ((e.ctrlKey && e.shiftKey && (e.key === 'K' || e.key === 'k')) || (e.altKey && (e.key === 'k' || e.key === 'K'))) {
        e.preventDefault();
        setKioskMode((prev) => !prev);
      }
    };
    window.addEventListener('toggle-kiosk-mode', handleToggle);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('toggle-kiosk-mode', handleToggle);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('menwa_dark_mode', String(darkMode));
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      /* ignore */
    }
  }, [darkMode]);

  /* Konami Code Easter Egg */
  useEffect(() => {
    const konamiSequence = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];
    let index = 0;
    const onKeyDown = (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === konamiSequence[index]) {
        index += 1;
        if (index === konamiSequence.length) {
          setKonamiUnlocked(true);
          index = 0;
        }
      } else {
        index = 0;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  /* Program sub routing */
  const youthSub = path.startsWith('/youth-spark/') ? path.split('/')[2] : null;
  const youthRoute = path === '/youth-spark' || !!youthSub;
  const program = youthRoute
    ? PROGRAMS.find((p) => p.slug === 'youth-spark')
    : PROGRAMS.find((p) => `/${p.slug}` === path);

  const activeTab =
    path === '/informasi'
      ? 'informasi'
      : path === '/gallery'
      ? 'gallery'
      : path === '/kc'
      ? 'kc'
      : path === '/geranat' || path === '/geranat/voting' || path === '/charity/voting'
      ? 'geranat'
      : path === '/games'
      ? 'games'
      : path === '/administrasi' || path === '/mako'
      ? 'administrasi'
      : youthRoute
      ? 'youth-spark'
      : program
      ? 'beranda'
      : PATH_TABS[path] || 'beranda';

  const handleQuickSearch = (tabId) => {
    setIsMobileMenuOpen(false);
    navigate(
      {
        gallery: '/gallery',
        informasi: '/informasi',
        kegiatan: '/kc',
        kc: '/kc',
        geranat: '/geranat',
        'youth-spark': '/youth-spark',
        administrasi: '/administrasi',
        mako: '/administrasi',
        games: '/games',
      }[tabId] ||
        TAB_PATHS[tabId] ||
        '/'
    );
  };

  useEffect(() => {
    let customTitle = null;
    if (path.startsWith('/verifikasi-surat')) {
      customTitle = 'Verifikasi E-Dispensasi Resmi | Menwa UNJ';
    } else if (path.startsWith('/official/')) {
      const slugPart = path.split('/')[2] || '';
      customTitle = `Portal Official (${slugPart.toUpperCase()}) | Menwa UNJ`;
    } else if (program) {
      customTitle = `${program.title}${youthSub ? ' — ' + youthSub.replaceAll('-', ' ') : ''} | Menwa UNJ`;
    }
    syncDocumentMetadata(path, customTitle ? { title: customTitle, ogTitle: customTitle } : {});
  }, [path, program, youthSub]);

  useEffect(() => {
    const keyboard = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
      if (event.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', keyboard);
    return () => document.removeEventListener('keydown', keyboard);
  }, []);

  if (path === '/mako-ops') {
    return (
      <CanvasProvider>
        <AppErrorBoundary>
          <div className="min-h-screen bg-[#02080c] font-sans selection:bg-[#006569] selection:text-[#FFDD00]">
            <MotionStyles />
            <ScrollProgress />
            <CursorGlow />
            <CursorFollower />
            <Suspense fallback={<PageLoadingFallback />}>
              <CommandCenterPage />
            </Suspense>
          </div>
        </AppErrorBoundary>
      </CanvasProvider>
    );
  }

  if (lockdownState?.isLockdown && !isPrivilegedOfficer) {
    return (
      <EmergencyLockdownScreen
        lockdownConfig={lockdownState}
        onAdminUnlockSuccess={() => setAccountModalOpen(true)}
      />
    );
  }

  return (
    <CanvasProvider>
      <AppErrorBoundary>
        <div
          className={`min-h-screen flex flex-col font-sans selection:bg-[#006569] selection:text-[#FFDD00] transition-colors duration-300 ${
            darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
          }`}
        >
          <a href="#main-content" className="portal-skip-link">
            Langsung ke konten utama
          </a>
          <MotionStyles />
          <ScrollProgress />
          <CursorGlow />
          <CursorFollower />

          {/* Konami Code Easter Egg Confetti & Banner */}
          <TacticalConfetti trigger={konamiUnlocked} onComplete={() => {}} />
          {konamiUnlocked && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
              <div
                role="dialog"
                aria-modal="true"
                className="menwa-modal relative max-w-md w-full bg-gradient-to-b from-[#00383b] to-slate-950 border-2 border-[#FFDD00] rounded-3xl p-8 text-center text-white shadow-2xl space-y-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#FFDD00] text-slate-950 flex items-center justify-center mx-auto font-black shadow-lg">
                  <Trophy size={32} />
                </div>
                <span className="inline-block rounded-full bg-amber-400/20 border border-[#FFDD00]/50 px-3 py-1 text-[10px] font-mono font-black uppercase tracking-widest text-[#FFDD00]">
                  KONAMI CODE UNLOCKED
                </span>
                <h3 className="text-xl font-black text-white leading-snug">
                  Widya Castrena Dharma Siddha 🎖️ — Kamu menemukan rahasia Mako!
                </h3>
                <p className="text-xs text-slate-300">
                  Kode kehormatan ksatria berhasil diaktifkan. Semangat pengabdian ilmu pengetahuan dan olah
                  keprajuritan Satuan Menwa UNJ!
                </p>
                <button
                  type="button"
                  onClick={() => setKonamiUnlocked(false)}
                  className="w-full py-3 rounded-xl bg-[#FFDD00] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Tutup Pesan
                </button>
              </div>
            </div>
          )}

          {kioskMode && (
            <div className="fixed top-4 right-4 z-50 bg-[#006569] text-[#FFDD00] text-xs font-black px-4 py-2 rounded-full shadow-2xl border border-[#FFDD00]/40 flex items-center gap-2 backdrop-blur-md animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Mode Kiosk / Monitor Mako Aktif</span>
              <button
                type="button"
                onClick={() => setKioskMode(false)}
                className="ml-2 bg-black/20 hover:bg-black/40 text-white rounded-full p-1 transition cursor-pointer"
                title="Keluar dari Mode Kiosk"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {!kioskMode && (
            <Navigation
              onOpenSearch={() => setSearchOpen(true)}
              onOpenAccount={() => setAccountModalOpen(true)}
              onOpenGamification={() => navigate('/games')}
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode((d) => !d)}
              user={user}
              profile={profile}
              activeTab={activeTab}
              handleQuickSearch={handleQuickSearch}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              tactileAudioMuted={tactileAudioMuted}
              onToggleAudio={(val) => setTactileAudioMutedState(val)}
            />
          )}

          {/* Sticky In-App 2-Verification Alert Banner for Mako Admins */}
          <Suspense fallback={null}>
            <BankApprovalBanner />
          </Suspense>

          <PageWayfinder path={path} />

          <main className="flex-grow flex flex-col" id="main-content">
            <TabSwitch tabKey={path}>
              {path.startsWith('/verifikasi-surat') ? (
                <Suspense fallback={<PageLoadingFallback />}>
                  <EDispensasiVerifyPage path={path} />
                </Suspense>
              ) : path === '/privacy' || path === '/kebijakan-privasi' ? (
                <Suspense fallback={<PageLoadingFallback />}>
                  <PrivacyPolicyPage />
                </Suspense>
              ) : path === '/terms' || path === '/persyaratan-layanan' ? (
                <Suspense fallback={<PageLoadingFallback />}>
                  <TermsOfServicePage />
                </Suspense>
              ) : path === '/games' ? (
                <Suspense fallback={<PageLoadingFallback />}>
                  <GamesPage onOpenAuth={() => setAccountModalOpen(true)} />
                </Suspense>
              ) : path === '/gallery' ? (
                <Suspense fallback={<PageLoadingFallback />}>
                  <GalleryPage />
                </Suspense>
              ) : path === '/geranat/voting' || path === '/charity/voting' ? (
                <Suspense fallback={<PageLoadingFallback />}>
                  <GeranatVoting onOpenAuth={() => setAccountModalOpen(true)} />
                </Suspense>
              ) : path.startsWith('/official/') ? (
                <Suspense fallback={<PageLoadingFallback />}>
                  <ParticipantPortal schoolSlugProp={decodeURIComponent(path.split('/')[2] || '')} />
                </Suspense>
              ) : path === '/portal-peserta' || path === '/official' ? (
                <div className="bg-slate-50 min-h-screen py-10 px-4 max-w-6xl mx-auto w-full">
                  <Suspense fallback={<PageLoadingFallback />}>
                    <ParticipantPortal />
                  </Suspense>
                </div>
              ) : program ? (
                youthRoute ? (
                  <YouthSparkPage subSlug={youthSub} />
                ) : (
                  <ProgramPage slug={program.slug} />
                )
              ) : path === '/informasi' ? (
                <InformationHub onOpenSearch={() => setSearchOpen(true)} />
              ) : (
                <>
                  {activeTab === 'beranda' && <BerandaTab onOpenSearch={() => setSearchOpen(true)} />}
                  {activeTab === 'struktur' && <StrukturOrganisasiTab onNavigate={handleQuickSearch} />}
                  {activeTab === 'pendidikan' && (
                    <PendidikanTab
                      onOpenSamapta={() => setSamaptaModalOpen(true)}
                      onOpenKTA={() => setKtaModalOpen(true)}
                    />
                  )}
                  {(activeTab === 'administrasi' || activeTab === 'mako') && (
                    <AdministrasiUmumTab
                      onOpenAdminForm={(item) => {
                        setSelectedAdminItem(item);
                        setAdminFormModalOpen(true);
                      }}
                      onOpenAccountModal={() => setAccountModalOpen(true)}
                    />
                  )}
                </>
              )}
            </TabSwitch>
          </main>

          {!kioskMode && <Footer />}
          {!kioskMode && <LiveChatWidget onOpenAccount={() => setAccountModalOpen(true)} />}
          <PWAInstallBanner />
          <BackToTop />
          <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
          <UserAccountModal
            isOpen={accountModalOpen}
            onClose={() => setAccountModalOpen(false)}
            onOpenKTA={() => setKtaModalOpen(true)}
          />
          <SamaptaCalculatorModal isOpen={samaptaModalOpen} onClose={() => setSamaptaModalOpen(false)} />
          <TacticalKTACardModal isOpen={ktaModalOpen} onClose={() => setKtaModalOpen(false)} />

          {gamificationModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-fade-in">
              <div className="relative w-full max-w-4xl bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 text-slate-900">
                <div className="flex justify-end mb-2">
                  <button
                    onClick={() => setGamificationModalOpen(false)}
                    className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-200 transition"
                  >
                    <X size={20} />
                  </button>
                </div>
                <Suspense fallback={<PageLoadingFallback />}>
                  <GamificationHub onOpenAuth={() => setAccountModalOpen(true)} />
                </Suspense>
              </div>
            </div>
          )}

          <Suspense fallback={null}>
            <AdministrationFormModal
              isOpen={adminFormModalOpen}
              onClose={() => setAdminFormModalOpen(false)}
              item={selectedAdminItem}
              onOpenAccountModal={() => setAccountModalOpen(true)}
            />
          </Suspense>
        </div>
      </AppErrorBoundary>
    </CanvasProvider>
  );
}