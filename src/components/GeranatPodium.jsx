import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Vote,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  ArrowRight,
  Users,
  Heart,
  GraduationCap,
  Eye,
  EyeOff,
  Zap,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  getGeranatTeams,
  subscribeToGeranatTeams,
  subscribeToRecentVotes,
  subscribeToCharityVotingConfig
} from '../firebase.js';
import { navigate } from '../lib/router.jsx';
import { formatRupiah } from '../lib/qris.js';
import { OfficialPortalQuickAccess } from './OfficialPortalQuickAccess.jsx';

// Data simulasi pratinjau podium interaktif (dapat dicoba sebelum voting dibuka resmi)
const PREVIEW_PODIUM_TEAMS = [
  {
    id: 'prev-1',
    teamId: 'PREV-1',
    teamName: 'Kontingen SMAN 1 Jakarta',
    institution: 'Paskibra SMA Negeri 1 Jakarta',
    votesCount: 3450,
    category: 'Pasukan Terfavorit',
    photoUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'prev-2',
    teamId: 'PREV-2',
    teamName: 'Kontingen SMKN 26 Jakarta',
    institution: 'Paskibra SMK Negeri 26 Jakarta',
    votesCount: 2820,
    category: 'Pasukan Terfavorit',
    photoUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'prev-3',
    teamId: 'PREV-3',
    teamName: 'Kontingen SMA Labschool Jakarta',
    institution: 'Paskibra SMA Labschool Rawamangun',
    votesCount: 2190,
    category: 'Pasukan Terfavorit',
    photoUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80'
  }
];

export function GeranatPodium() {
  const [teams, setTeams] = useState([]);
  const [recentVotes, setRecentVotes] = useState([]);
  const [votingConfig, setVotingConfig] = useState({ isVotingOpen: false });
  const [previewMode, setPreviewMode] = useState(false);
  const [showFullRanking, setShowFullRanking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [countdown, setCountdown] = useState(15);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reactions, setReactions] = useState([]);

  // Real-time listener onSnapshot data tim, suara terkini, & status buka voting
  useEffect(() => {
    const unsubTeams = subscribeToGeranatTeams((liveTeams) => {
      setTeams(liveTeams || []);
    });

    const unsubTicker = subscribeToRecentVotes((liveVotes) => {
      setRecentVotes(liveVotes || []);
    }, 10);

    const unsubConfig = subscribeToCharityVotingConfig((config) => {
      if (config) setVotingConfig(config);
    });

    return () => {
      unsubTeams();
      unsubTicker();
      unsubConfig();
    };
  }, []);

  const manualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await getGeranatTeams();
      setTeams(data || []);
    } finally {
      setIsRefreshing(false);
      setCountdown(15);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          manualRefresh();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mode voting aktif jika votingConfig.isVotingOpen true atau ada suara live
  const isVotingOpen = Boolean(votingConfig?.isVotingOpen);

  // Sumber data: jika preview aktif, gunakan tim pratinjau; jika tidak, gunakan live data
  const activeTeams = useMemo(() => {
    if (previewMode) return PREVIEW_PODIUM_TEAMS;
    if (!isVotingOpen) return [];
    return teams;
  }, [previewMode, isVotingOpen, teams]);

  const sortedTeams = useMemo(() => {
    return [...activeTeams].sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0));
  }, [activeTeams]);

  const topThree = sortedTeams.slice(0, 3);
  const totalVotes = useMemo(
    () => activeTeams.reduce((acc, t) => acc + (t.votesCount || 0), 0),
    [activeTeams]
  );

  const filteredAllTeams = useMemo(() => {
    if (!searchQuery.trim()) return sortedTeams;
    const q = searchQuery.toLowerCase();
    return sortedTeams.filter(
      (t) =>
        t.teamName?.toLowerCase().includes(q) ||
        t.institution?.toLowerCase().includes(q)
    );
  }, [sortedTeams, searchQuery]);

  const getTeamNameById = (teamId) => {
    const found = activeTeams.find((t) => t.teamId === teamId || t.id === teamId);
    return found ? found.teamName : 'Pasukan GERANAT Menwa';
  };

  // Micro-interaction: Beri Semangat / Cheer Floating Feedback
  const triggerCheer = (rankIndex, label) => {
    const emojis = ['❤️', '🔥', '👏', '⭐', '⚡'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const newReaction = {
      id: `${Date.now()}-${Math.random()}`,
      rankIndex,
      text: `${randomEmoji} +1 Semangat untuk ${label}!`,
      xOffset: Math.floor(Math.random() * 40) - 20
    };
    setReactions((prev) => [...prev, newReaction]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 1200);
  };

  return (
    <section id="podium-geranat" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* 1. Banner Akses Cepat Portal Official (Non-intrusif WhatsApp Login Drawer) */}
      <OfficialPortalQuickAccess showTriggerBanner={true} />

      {/* 2. Kartu Frame Glassmorphism Utama Podium */}
      <div className="relative rounded-[2.5rem] backdrop-blur-2xl bg-white/75 dark:bg-slate-900/80 border border-white/40 dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,101,105,0.12)] overflow-hidden text-slate-900 dark:text-white p-6 sm:p-10">
        
        {/* Subtle Ambient Light Orbs */}
        <div className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-[550px] h-[280px] bg-gradient-to-r from-[#006569]/15 via-[#4285F4]/15 to-[#FFDD00]/15 rounded-full blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 right-10 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[120px]" />

        {/* Live Ticker Donasi Terkini (Hanya tampil jika ada riwayat suara) */}
        {recentVotes.length > 0 && isVotingOpen && (
          <div className="relative z-10 mb-8 rounded-2xl backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 flex items-center gap-3 overflow-hidden shadow-sm">
            <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#EA4335] text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider">
              <Heart size={12} className="fill-white" /> DUKUNGAN TERKINI
            </span>
            <div className="flex-1 overflow-x-auto no-scrollbar whitespace-nowrap text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-6">
              {recentVotes.map((v, idx) => (
                <span key={v.id || idx} className="inline-flex items-center gap-1.5">
                  <span className="text-[#34A853] font-bold">❤️ Dukungan:</span>
                  <strong className="text-slate-900 dark:text-white">{v.voterName || 'Donatur'}</strong>
                  <span className="text-slate-500">untuk</span>
                  <strong className="text-[#006569] dark:text-emerald-400">{v.teamName || getTeamNameById(v.teamId)}</strong>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 font-mono text-[10px] font-bold">
                    +{v.votes || 1} Suara ({formatRupiah((v.votes || 1) * 1000)})
                  </span>
                </span>
              ))}
            </div>
            <div className="shrink-0 hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-500 border-l border-slate-200 dark:border-slate-700 pl-3">
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-[#006569]' : ''} />
              <span>{countdown}s</span>
            </div>
          </div>
        )}

        {/* Header Podium Sesuai Permintaan */}
        <div className="relative z-10 text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md bg-white/90 dark:bg-slate-800/90 border border-emerald-200 dark:border-emerald-800/60 text-[#006569] dark:text-emerald-400 text-xs font-black uppercase tracking-widest shadow-sm">
            <Trophy size={14} className="text-[#FBBC05]" />
            <span>Podium Charity Vote</span>
          </div>

          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Klasemen Pasukan Terfavorit
          </h2>

          <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Perolehan suara popularitas untuk donasi pendidikan dan logistik kemanusiaan terverifikasi otomatis. Total donasi terkumpul:{' '}
            <strong className="text-[#006569] dark:text-emerald-400 font-mono font-black">
              {totalVotes.toLocaleString('id-ID')} Suara
            </strong>{' '}
            ({formatRupiah(totalVotes * 1000)}).
          </p>

          {/* Baris Status & Tombol Pratinjau Desain Interaktif */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] ${
                isVotingOpen
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isVotingOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {isVotingOpen ? 'Voting Dibuka • Live' : 'Pintu Voting Belum Dibuka • Mode Standby'}
            </span>

            {/* Tombol Toggle Pratinjau Interaktif */}
            {!isVotingOpen && (
              <button
                type="button"
                onClick={() => setPreviewMode((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 font-bold text-[11px] transition cursor-pointer"
                title="Aktifkan simulasi interaktif animasi podium dan border loop"
              >
                {previewMode ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{previewMode ? 'Kembali ke Mode Standby Kosong' : '✨ Uji Pratinjau Podium Interaktif'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. TAMPILAN PODIUM INTERAKTIF (Bila Voting Dibuka ATAU dalam Mode Pratinjau) */}
        {topThree.length >= 3 ? (
          <div className="relative z-10 max-w-5xl mx-auto pt-6 pb-2">
            
            {/* Indikator Banner jika sedang mode pratinjau interaktif */}
            {previewMode && (
              <div className="mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 px-4 py-2.5 text-center text-xs font-bold flex items-center justify-center gap-2 animate-fade-in">
                <Sparkles size={15} className="text-[#FBBC05] shrink-0" />
                <span>
                  Mode Simulasi Interaktif Aktif: Menampilkan efek border loop dinamis, glassmorphism, dan efek bara juara #1.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              
              {/* ========================================================= */}
              {/* PERINGKAT #2 (Perak - Perak Mengkilap Glassmorphism) */}
              {/* ========================================================= */}
              <div className="order-2 md:order-1 flex flex-col items-center group transition-all duration-300 hover:-translate-y-2">
                
                {/* Pembungkus Border Loop Berputar (Animated Loop Border) */}
                <div className="relative p-[2px] rounded-3xl overflow-hidden w-full shadow-lg">
                  {/* Conic Gradient Loop Beam */}
                  <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_260deg,#94a3b8_300deg,#cbd5e1_330deg,#f1f5f9_360deg)] animate-border-spin-slow opacity-80 group-hover:opacity-100 transition-opacity" />

                  {/* Kartu Kaca (Glassmorphic Surface) */}
                  <div className="relative z-10 w-full rounded-[calc(1.5rem-2px)] backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 p-6 text-center border border-white/50 dark:border-white/10 flex flex-col items-center">
                    
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/90 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider mb-3 shadow-xs">
                      <Medal size={13} className="text-slate-500" /> PERINGKAT #2
                    </span>

                    {/* Foto Tim */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-slate-300/80 dark:border-slate-600 shadow-md mb-3 bg-slate-100 dark:bg-slate-800 relative group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={topThree[1].photoUrl || 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=600&q=80'}
                        alt={topThree[1].teamName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg line-clamp-1">
                      {topThree[1].teamName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold line-clamp-1 mt-0.5">
                      {topThree[1].institution}
                    </p>

                    <div className="mt-3 inline-flex items-center gap-1.5 backdrop-blur-sm bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-xl font-mono text-base font-black text-[#006569] dark:text-emerald-400">
                      <Vote size={15} />
                      <span>{(topThree[1].votesCount || 0).toLocaleString('id-ID')}</span>
                      <span className="text-[10px] font-sans font-normal text-slate-500 dark:text-slate-400">Suara</span>
                    </div>

                    {/* Tombol Interaktif Cheer */}
                    <button
                      type="button"
                      onClick={() => triggerCheer(1, topThree[1].teamName)}
                      className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition active:scale-95 cursor-pointer"
                    >
                      <span>👏 Semangati</span>
                    </button>
                  </div>
                </div>

                {/* Podium Pedestal II */}
                <div className="w-full h-16 rounded-b-2xl backdrop-blur-md bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 border-x-2 border-b-2 border-slate-300 dark:border-slate-600 flex items-center justify-center font-mono text-2xl font-black text-slate-600 dark:text-slate-200 shadow-md">
                  II
                </div>
              </div>

              {/* ========================================================= */}
              {/* PERINGKAT #1 (EMAS JUARA - EFEK BARA MENYALA & BORDER LOOP) */}
              {/* ========================================================= */}
              <div className="order-1 md:order-2 flex flex-col items-center md:-translate-y-5 group transition-all duration-300 hover:-translate-y-7 relative">
                
                {/* Floating Micro-Embers (Partikel Bara Halus Melayang untuk Pemenang) */}
                <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 w-40 h-20 flex justify-around">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 blur-[0.5px] animate-[emberFloat_2.4s_infinite]" />
                  <span className="w-2 h-2 rounded-full bg-orange-500 blur-[0.5px] animate-[emberFloat_2.8s_infinite_400ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 blur-[0.5px] animate-[emberFloat_2.2s_infinite_800ms]" />
                </div>

                {/* Pembungkus Border Loop Berputar Emas-Api (Animated Loop Border) */}
                <div className="relative p-[2.5px] rounded-[1.75rem] overflow-hidden w-full animate-flame-pulse shadow-[0_0_40px_rgba(245,158,11,0.45)]">
                  
                  {/* Conic Gradient Loop Beam (Emas & Api Menyala Elegan) */}
                  <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_240deg,#f59e0b_280deg,#ef4444_320deg,#fbbf24_360deg)] animate-border-spin-fast" />

                  {/* Kartu Kaca Juara (Glassmorphic Surface dengan Glare Emas Halus) */}
                  <div className="relative z-10 w-full rounded-[calc(1.75rem-2.5px)] backdrop-blur-2xl bg-white/90 dark:bg-slate-900/90 p-7 text-center border border-amber-300/80 dark:border-amber-500/40 flex flex-col items-center">
                    
                    {/* Badge Juara 1 dengan Aksen Api & Mahkota */}
                    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/30 mb-3.5">
                      <Flame size={15} className="fill-orange-950 text-orange-950 animate-pulse" />
                      <span>PERINGKAT #1 TERFAVORIT</span>
                      <Crown size={15} className="fill-slate-950 text-slate-950 animate-bounce" />
                    </div>

                    {/* Foto Tim Juara 1 dengan Bingkai Api Emas */}
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-amber-400 shadow-xl mb-3.5 bg-amber-50 dark:bg-amber-950/40 relative group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={topThree[0].photoUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80'}
                        alt={topThree[0].teamName}
                        className="w-full h-full object-cover"
                      />
                      {/* Inner gold glow frame */}
                      <div className="absolute inset-0 rounded-2xl ring-2 ring-amber-300/60 ring-inset pointer-events-none" />
                    </div>

                    <h3 className="font-black text-slate-900 dark:text-white text-lg sm:text-xl line-clamp-1">
                      {topThree[0].teamName}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold line-clamp-1 mt-0.5">
                      {topThree[0].institution}
                    </p>

                    {/* Counter Suara Juara 1 */}
                    <div className="mt-3.5 inline-flex items-center gap-2 backdrop-blur-md bg-amber-50/90 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 px-4 py-2 rounded-xl font-mono text-lg font-black text-[#006569] dark:text-emerald-300 shadow-xs">
                      <Vote size={18} className="text-amber-500" />
                      <span>{(topThree[0].votesCount || 0).toLocaleString('id-ID')}</span>
                      <span className="text-[10px] font-sans font-bold text-amber-700 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-800/80 px-2 py-0.5 rounded-md">
                        Terbanyak
                      </span>
                    </div>

                    {/* Tombol Interaktif Cheer Khusus Juara 1 */}
                    <button
                      type="button"
                      onClick={() => triggerCheer(0, topThree[0].teamName)}
                      className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
                    >
                      <Flame size={13} className="fill-slate-950" />
                      <span>Beri Api Semangat! 🔥</span>
                    </button>
                  </div>
                </div>

                {/* Podium Pedestal I (Emas Terang Menyala) */}
                <div className="w-full h-24 rounded-b-2xl backdrop-blur-md bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 border-x-2 border-b-2 border-amber-400 flex items-center justify-center font-mono text-3xl font-black text-amber-950 shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-[shimmer_2.5s_infinite]" />
                  <span className="relative z-10 drop-shadow-sm">I</span>
                </div>
              </div>

              {/* ========================================================= */}
              {/* PERINGKAT #3 (Perunggu - Warm Bronze Glassmorphism) */}
              {/* ========================================================= */}
              <div className="order-3 flex flex-col items-center group transition-all duration-300 hover:-translate-y-2">
                
                {/* Pembungkus Border Loop Berputar (Animated Loop Border) */}
                <div className="relative p-[2px] rounded-3xl overflow-hidden w-full shadow-lg">
                  {/* Conic Gradient Loop Beam Bronze */}
                  <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_260deg,#ea580c_300deg,#f97316_330deg,#fdba74_360deg)] animate-border-spin-slow opacity-80 group-hover:opacity-100 transition-opacity" />

                  {/* Kartu Kaca (Glassmorphic Surface) */}
                  <div className="relative z-10 w-full rounded-[calc(1.5rem-2px)] backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 p-6 text-center border border-white/50 dark:border-white/10 flex flex-col items-center">
                    
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-900 dark:text-orange-200 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider mb-3 shadow-xs">
                      <Medal size={13} className="text-orange-600" /> PERINGKAT #3
                    </span>

                    {/* Foto Tim */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-orange-200 dark:border-orange-800 shadow-md mb-3 bg-slate-100 dark:bg-slate-800 relative group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={topThree[2].photoUrl || 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80'}
                        alt={topThree[2].teamName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg line-clamp-1">
                      {topThree[2].teamName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold line-clamp-1 mt-0.5">
                      {topThree[2].institution}
                    </p>

                    <div className="mt-3 inline-flex items-center gap-1.5 backdrop-blur-sm bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-xl font-mono text-base font-black text-[#006569] dark:text-emerald-400">
                      <Vote size={15} />
                      <span>{(topThree[2].votesCount || 0).toLocaleString('id-ID')}</span>
                      <span className="text-[10px] font-sans font-normal text-slate-500 dark:text-slate-400">Suara</span>
                    </div>

                    {/* Tombol Interaktif Cheer */}
                    <button
                      type="button"
                      onClick={() => triggerCheer(2, topThree[2].teamName)}
                      className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition active:scale-95 cursor-pointer"
                    >
                      <span>⭐ Semangati</span>
                    </button>
                  </div>
                </div>

                {/* Podium Pedestal III */}
                <div className="w-full h-12 rounded-b-2xl backdrop-blur-md bg-gradient-to-b from-orange-200 to-orange-300 dark:from-orange-800 dark:to-orange-900 border-x-2 border-b-2 border-orange-300 dark:border-orange-700 flex items-center justify-center font-mono text-xl font-black text-orange-900 dark:text-orange-200 shadow-md">
                  III
                </div>
              </div>

            </div>

            {/* Container Floating Reactions */}
            <div className="pointer-events-none fixed bottom-12 right-12 z-50 flex flex-col gap-2 items-end">
              {reactions.map((r) => (
                <div
                  key={r.id}
                  className="rounded-full bg-slate-900/90 text-[#FFDD00] px-4 py-2 font-black text-xs shadow-2xl border border-white/20 animate-[cheerFloat_1.2s_ease-out_forwards]"
                  style={{ transform: `translateX(${r.xOffset}px)` }}
                >
                  {r.text}
                </div>
              ))}
            </div>

          </div>
        ) : (
          /* ========================================================= */
          /* 4. EMPTY STATE / KLASEMEN DIKOSONGKAN KARENA BELUM DIBUKA */
          /* ========================================================= */
          <div className="relative z-10 max-w-2xl mx-auto my-6">
            
            {/* Card Standby dengan Animated Looping Border Beam */}
            <div className="relative p-[2px] rounded-[2rem] overflow-hidden shadow-xl">
              {/* Conic Gradient Loop Beam Berputar Halus */}
              <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,#006569_310deg,#FFDD00_340deg,#34A853_360deg)] animate-border-spin opacity-70" />

              {/* Konten Kaca Frosted Glassmorphic */}
              <div className="relative z-10 rounded-[calc(2rem-2px)] backdrop-blur-2xl bg-white/90 dark:bg-slate-900/90 p-8 sm:p-12 text-center border border-white/40 dark:border-white/10 space-y-5">
                
                <div className="w-18 h-18 rounded-3xl bg-gradient-to-br from-[#006569] to-[#004d50] text-[#FFDD00] flex items-center justify-center mx-auto shadow-lg shadow-[#006569]/30">
                  <Clock size={34} className="animate-pulse" />
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider">
                    <Clock size={12} /> Pintu Voting Belum Dibuka • Mode Standby
                  </span>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Klasemen Pasukan Terfavorit Sedang Disiapkan
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                    Sistem perolehan suara popularitas untuk donasi pendidikan dan logistik kemanusiaan terverifikasi otomatis. Klasemen live akan aktif begitu gerbang voting dibuka oleh panitia Mako Menwa UNJ.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/geranat/voting')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider shadow-lg shadow-[#006569]/25 transition hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>Kunjungi Halaman Charity Vote</span>
                    <ArrowRight size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 font-bold text-xs transition cursor-pointer"
                  >
                    <Sparkles size={14} className="text-[#FBBC05]" />
                    <span>Lihat Pratinjau Desain Podium Juara</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2 Tombol Aksi Utama di Bawah Podium */}
        <div className="relative z-10 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {sortedTeams.length > 0 && (
            <button
              type="button"
              onClick={() => setShowFullRanking((prev) => !prev)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl backdrop-blur-md bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs sm:text-sm uppercase tracking-wider transition flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
            >
              <Trophy size={17} className="text-[#FBBC05]" />
              <span>🏆 Lihat Peringkat Lengkap Pasukan ({sortedTeams.length})</span>
              {showFullRanking ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('/geranat/voting')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs sm:text-sm uppercase tracking-wider transition flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-[#006569]/30 hover:scale-105"
          >
            <Heart size={18} className="fill-[#FFDD00]" />
            <span>🗳️ Kunjungi Charity Vote</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Collapsible Peringkat Lengkap */}
        {showFullRanking && sortedTeams.length > 0 && (
          <div className="relative z-10 mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Users size={18} className="text-[#006569] dark:text-emerald-400" />
                  <span>Tabel Klasemen Pasukan Terfavorit</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Perolehan suara dan persentase dukungan untuk setiap kontingen pasukan.
                </p>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kontingen atau instansi..."
                  className="pl-9 pr-4 py-2 rounded-xl backdrop-blur-md bg-white/90 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#006569] w-full sm:w-64"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredAllTeams.map((team) => {
                const rank = sortedTeams.findIndex((t) => (t.teamId || t.id) === (team.teamId || team.id)) + 1;
                const pct = totalVotes > 0 ? Math.round(((team.votesCount || 0) / totalVotes) * 100) : 0;
                return (
                  <div
                    key={team.teamId || team.id}
                    className="p-4 rounded-2xl backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-[#4285F4]/60 shadow-sm transition flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={`w-9 h-9 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                          rank === 1
                            ? 'bg-[#FBBC05] text-slate-950 shadow-md'
                            : rank === 2
                            ? 'bg-slate-300 text-slate-900'
                            : rank === 3
                            ? 'bg-orange-300 text-orange-950'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        #{rank}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">{team.teamName}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {team.institution} • <span className="text-[#006569] dark:text-emerald-400 font-bold">{team.category || 'Pasukan Terfavorit'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                      <div className="text-right">
                        <div className="font-mono font-black text-sm text-[#006569] dark:text-emerald-400">
                          {(team.votesCount || 0).toLocaleString('id-ID')} Suara
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{pct}% dukungan</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/geranat/voting')}
                        className="px-3.5 py-2 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider transition cursor-pointer"
                      >
                        Dukung
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default GeranatPodium;
