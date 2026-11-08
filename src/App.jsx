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
  ShoppingBag,
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
const ShopPage = lazy(() =>
  import('./components/shop/ShopPage.jsx').then((m) => ({ default: m.ShopPage }))
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

import { AppNavigation } from './components/AppNavigation.jsx';
import { PrideSection } from './components/PrideSection.jsx';
import { MakoTab, TabHero } from './components/tabs/MakoTab.jsx';

const handleImgError = (e, text, bgColor = '006569', textColor = 'FFDD00') => {
  e.target.onerror = null;
  e.target.src = `https://placehold.co/600x400/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`;
};

const RevealOnScroll = Reveal;

const BerandaShopBanner = () => (
  <section className="bg-white py-7 px-4 sm:px-6 lg:px-8 border-y border-slate-200 relative overflow-hidden">
    <div className="pointer-events-none absolute -right-20 -top-20 w-80 h-80 rounded-full bg-teal-500/5 blur-3xl" />
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#006569] flex items-center justify-center font-black shrink-0 shadow-sm border border-teal-200">
          <ShoppingBag size={26} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#FFDD00] text-slate-950 px-2.5 py-0.5 rounded-full shadow-sm">
              OFFICIAL STORE 2026
            </span>
            <span className="text-xs font-bold text-[#006569]">Batch 01 Pre-Order Aktif</span>
          </div>
          <h4 className="text-base sm:text-lg font-black text-slate-900 mt-1">
            Polo Shirt Menwa UNJ Tahun 2026 Tersedia di Subtab Toko
          </h4>
          <p className="text-xs text-slate-600 max-w-xl">
            Material Motif Waffle Dry-Fit resmi Rp 150.000 IDR. Jelajahi mockup depan/belakang, tabel ukuran, dan kalkulator size di subtab /toko/.
          </p>
        </div>
      </div>
      <Link
        to="/toko"
        className="px-6 py-3.5 rounded-2xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 transition flex items-center gap-2 shrink-0 cursor-pointer"
      >
        <span>Kunjungi Subtab Toko</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  </section>
);

const BerandaTab = ({ onOpenSearch }) => (
  <div className="flex-grow bg-slate-50 font-sans text-slate-900">
    <BrandHome onOpenSearch={onOpenSearch} />
    <HomeSections />
    <BrandValues />
    <PrideSection />
  </div>
);

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
      const saved = localStorage.getItem('menwa_dark_mode');
      return saved === 'true';
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
    path === '/toko' || path === '/toko/' || path === '/shop' || path === '/shop/'
      ? 'toko'
      : path === '/informasi'
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
        toko: '/toko',
        shop: '/toko',
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
    if (path === '/toko' || path === '/toko/' || path === '/shop' || path === '/shop/') {
      customTitle = 'Official Store & Pre-Order Polo Shirt 2026 | Menwa UNJ';
    } else if (path.startsWith('/verifikasi-surat')) {
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
            <AppNavigation
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
              onLogoError={(e) => handleImgError(e, 'MENWA UNJ', '006569', 'FFDD00')}
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
                <div className="bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-100 min-h-screen py-10 px-4 max-w-6xl mx-auto w-full text-slate-900">
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
              ) : path === '/toko' || path === '/toko/' || path === '/shop' || path === '/shop/' ? (
                <Suspense fallback={<PageLoadingFallback />}>
                  <ShopPage />
                </Suspense>
              ) : (
                <>
                  {activeTab === 'beranda' && <BerandaTab onOpenSearch={() => setSearchOpen(true)} />}
                  {(activeTab === 'toko' || activeTab === 'shop') && (
                    <Suspense fallback={<PageLoadingFallback />}>
                      <ShopPage />
                    </Suspense>
                  )}
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
              <div className="relative w-full max-w-4xl bg-[#071c22]/95 border border-white/12 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 text-slate-100">
                <div className="flex justify-end mb-2">
                  <button
                    onClick={() => setGamificationModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
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