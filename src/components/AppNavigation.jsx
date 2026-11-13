import React from 'react';
import {
  Compass,
  Images,
  Search as SearchIcon,
  Trophy,
  Sparkles,
  Award,
  Shield,
  FileText,
  Menu,
  X,
  Volume2,
  VolumeX,
  Flame,
  User,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { NavBar } from './NavBar.jsx';
import { MusicPlayer } from './MusicPlayer.jsx';
import { setTactileAudioMuted } from '../lib/tactileAudio.js';

export const NAV_ITEMS = [
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
    id: 'toko',
    label: 'Toko',
    icon: <ShoppingBag size={20} />,
    desc: 'Official Merchandise & Polo Shirt 2026.',
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

export const AppNavigation = (props) => (
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
          className="hidden sm:inline-flex p-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white transition hover:scale-105 shrink-0 cursor-pointer"
          title={
            props.tactileAudioMuted
              ? 'Aktifkan Efek Suara Haptic Tombol'
              : 'Senyapkan Efek Suara Tombol'
          }
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
            onClick={props.onOpenAccount}
            className="portal-account-trigger inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-black transition border border-[#006569]/30 bg-white/95 hover:bg-white text-slate-900 shadow-sm cursor-pointer"
            aria-label={
              props.user
                ? `Portal Anggota: ${props.profile?.displayName || props.user.email}`
                : 'Buka Portal Anggota'
            }
            title={
              props.user
                ? `Portal Anggota: ${props.profile?.displayName || props.user.email}`
                : 'Masuk ke Portal Anggota Menwa UNJ'
            }
          >
            <User size={15} className="text-[#006569] shrink-0" />
            <span className="hidden sm:inline max-w-[130px] truncate">
              {props.user
                ? props.profile?.displayName?.split(' ')[0] || props.user.email?.split('@')[0]
                : 'Portal Anggota'}
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
    onLogoError={props.onLogoError}
  />
);

export default AppNavigation;

