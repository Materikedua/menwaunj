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
  Eye,
  EyeOff,
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
import BorderBeam from './ui/BorderBeam.jsx';
import { playTactileSound } from '../lib/tactileAudio.js';

// Data simulasi pratinjau podium interaktif (Kuning, Hijau, Merah)
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

  const isVotingOpen = Boolean(votingConfig?.isVotingOpen);

  // Sumber data podium: jika preview aktif, tampilkan tim preview; jika belum buka, kosong
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* 1. Section Portal Official Sesuai Referensi Visual (Putih, Kuning, BorderBeam) */}
      <OfficialPortalQuickAccess showTriggerBanner={true} />

      {/* 2. SECTION PODIUM JUARA (Tanpa background gelap, warna dasar halaman / putih bersih) */}
      <section id="podium-geranat" className="relative w-full text-slate-900 scroll-mt-24">
        
        {/* Live Ticker Donasi Terkini (Jika ada) */}
        {recentVotes.length > 0 && isVotingOpen && (
          <div className="relative z-10 mb-8 rounded-2xl bg-white border border-slate-200 px-4 py-2.5 flex items-center gap-3 overflow-hidden shadow-sm">
            <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#EA4335] text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider">
              <Heart size={12} className="fill-white" /> DUKUNGAN TERKINI
            </span>
            <div className="flex-1 overflow-x-auto no-scrollbar whitespace-nowrap text-xs text-slate-700 font-medium flex items-center gap-6">
              {recentVotes.map((v, idx) => (
                <span key={v.id || idx} className="inline-flex items-center gap-1.5">
                  <span className="text-[#34A853] font-bold">❤️ Dukungan:</span>
                  <strong className="text-slate-900">{v.voterName || 'Donatur'}</strong>
                  <span className="text-slate-500">untuk</span>
                  <strong className="text-[#006569]">{v.teamName || getTeamNameById(v.teamId)}</strong>
                  <span className="rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 px-2 py-0.5 font-mono text-[10px] font-bold">
                    +{v.votes || 1} Suara ({formatRupiah((v.votes || 1) * 1000)})
                  </span>
                </span>
              ))}
            </div>
            <div className="shrink-0 hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-500 border-l border-slate-200 pl-3">
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-[#006569]' : ''} />
              <span>{countdown}s</span>
            </div>
          </div>
        )}

        {/* Header Podium Sesuai Permintaan (Latar Terang Bersih) */}
        <div className="relative z-10 text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-widest shadow-xs">
            <Trophy size={14} className="text-[#FBBC05]" />
            <span>Podium Charity Vote</span>
          </div>

          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            Klasemen Pasukan Terfavorit
          </h2>

          <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
            Perolehan suara popularitas untuk donasi pendidikan dan logistik kemanusiaan terverifikasi otomatis. Total donasi terkumpul:{' '}
            <strong className="text-[#006569] font-mono font-black">
              {totalVotes.toLocaleString('id-ID')} Suara
            </strong>{' '}
            ({formatRupiah(totalVotes * 1000)}).
          </p>

          {/* Baris Status & Tombol Uji Pratinjau Desain */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] ${
                isVotingOpen
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isVotingOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {isVotingOpen ? 'Voting Dibuka • Live' : 'Pintu Voting Belum Dibuka • Mode Standby'}
            </span>

            {!isVotingOpen && (
              <button
                type="button"
                onClick={() => {
                  playTactileSound('pill');
                  setPreviewMode((prev) => !prev);
                }}
                className="neu-pill-tab inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-slate-800 font-bold text-[11px] transition cursor-pointer"
                title="Aktifkan simulasi interaktif animasi podium dan ombang-ambing"
              >
                {previewMode ? <EyeOff size={13} className="text-amber-600" /> : <Eye size={13} className="text-amber-600" />}
                <span>{previewMode ? 'Kembali ke Mode Standby Kosong' : '✨ Uji Pratinjau Podium Juara (3 Warna)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. TAMPILAN PODIUM INTERAKTIF (Kuning, Hijau, Merah + Ombang-Ambing + Hover Menyala) */}
        {topThree.length >= 3 ? (
          <div className="relative z-10 max-w-5xl mx-auto pt-6 pb-2">
            
            {/* Banner Mode Simulasi */}
            {previewMode && (
              <div className="mb-8 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2.5 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-xs animate-fade-in">
                <Sparkles size={15} className="text-[#FBBC05] shrink-0" />
                <span>
                  Pratinjau Desain Podium: Juara 1 (Kuning), Juara 2 (Hijau), Juara 3 (Merah). Kartu tim mengambang ombang-ambing dan menyala saat dihover.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
              
              {/* ========================================================= */}
              {/* PERINGKAT #2: WARNA HIJAU (Tingkat Sedang h-24) */}
              {/* ========================================================= */}
              <div className="order-2 md:order-1 flex flex-col items-center">
                
                {/* Kartu Tim Mengambang & Ombang-Ambing Halus */}
                <div className="w-full animate-float-bob-2 group">
                  <div className="relative rounded-[2rem] bg-white p-6 text-center border-2 border-emerald-300 shadow-lg transition-all duration-300 group-hover:-translate-y-4 group-hover:scale-[1.03] group-hover:shadow-[0_0_40px_rgba(16,185,129,0.55)] group-hover:border-emerald-500 overflow-hidden">
                    
                    {/* BorderBeam Sinar Hijau Berputar */}
                    <BorderBeam
                      duration={5}
                      borderWidth={2}
                      borderRadius={32}
                      colorFrom="#34D399"
                      colorTo="#006569"
                    />

                    {/* Badge Peringkat 2 Hijau */}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#006569] text-white px-3.5 py-1 text-[11px] font-black uppercase tracking-wider mb-3 shadow-xs">
                      <Medal size={13} className="text-emerald-200" /> PERINGKAT #2
                    </span>

                    {/* Foto Tim dengan Border Hijau */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-emerald-400 shadow-md mb-3 bg-emerald-50 mx-auto transition-transform duration-300 group-hover:scale-105">
                      <img
                        src={topThree[1].photoUrl || 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=600&q=80'}
                        alt={topThree[1].teamName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <h3 className="font-black text-slate-900 text-base sm:text-lg line-clamp-1">
                      {topThree[1].teamName}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold line-clamp-1 mt-0.5">
                      {topThree[1].institution}
                    </p>

                    <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl font-mono text-base font-black text-[#006569]">
                      <Vote size={15} className="text-emerald-600" />
                      <span>{(topThree[1].votesCount || 0).toLocaleString('id-ID')}</span>
                      <span className="text-[10px] font-sans font-normal text-slate-500">Suara</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playTactileSound('pill');
                        triggerCheer(1, topThree[1].teamName);
                      }}
                      className="mt-3.5 neu-btn-strong-green inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white text-[11px] font-bold cursor-pointer"
                    >
                      <span>🌿 Semangati</span>
                    </button>
                  </div>
                </div>

                {/* Pedestal Peringkat #2 Hijau (Tinggi Sedang: h-24) */}
                <div className="w-full h-24 rounded-b-2xl bg-gradient-to-b from-emerald-400 via-teal-600 to-[#006569] border-x-2 border-b-2 border-emerald-600 flex items-center justify-center font-mono text-3xl font-black text-white shadow-md">
                  II
                </div>
              </div>

              {/* ========================================================= */}
              {/* PERINGKAT #1: WARNA KUNING / EMAS (Tingkat Tertinggi h-36) */}
              {/* ========================================================= */}
              <div className="order-1 md:order-2 flex flex-col items-center md:-translate-y-4">
                
                {/* Kartu Tim Mengambang & Ombang-Ambing Halus */}
                <div className="w-full animate-float-bob-1 group">
                  <div className="relative rounded-[2.25rem] bg-white p-7 text-center border-2 border-amber-300 shadow-xl transition-all duration-300 group-hover:-translate-y-5 group-hover:scale-[1.03] group-hover:shadow-[0_0_45px_rgba(251,188,5,0.7)] group-hover:border-amber-400 overflow-hidden">
                    
                    {/* BorderBeam Sinar Kuning Emas Berputar */}
                    <BorderBeam
                      duration={4.2}
                      borderWidth={2.5}
                      borderRadius={36}
                      colorFrom="#FFDD00"
                      colorTo="#EAB308"
                    />

                    {/* Badge Peringkat 1 Kuning Emas */}
                    <div className="bg-gradient-to-r from-amber-400 via-[#FBBC05] to-yellow-400 text-slate-950 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/30 mb-3.5 mx-auto">
                      <Flame size={15} className="fill-orange-950 text-orange-950 animate-pulse" />
                      <span>PERINGKAT #1 TERTINGGI</span>
                      <Crown size={15} className="fill-slate-950 text-slate-950 animate-bounce" />
                    </div>

                    {/* Foto Tim dengan Border Emas */}
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-[#FBBC05] shadow-xl mb-3.5 bg-amber-50 mx-auto transition-transform duration-300 group-hover:scale-105">
                      <img
                        src={topThree[0].photoUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80'}
                        alt={topThree[0].teamName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <h3 className="font-black text-slate-900 text-lg sm:text-xl line-clamp-1">
                      {topThree[0].teamName}
                    </h3>
                    <p className="text-xs text-slate-600 font-semibold line-clamp-1 mt-0.5">
                      {topThree[0].institution}
                    </p>

                    <div className="mt-3.5 inline-flex items-center gap-2 bg-amber-50 border border-amber-300 px-4 py-2 rounded-xl font-mono text-lg font-black text-[#006569] shadow-xs">
                      <Vote size={18} className="text-amber-500" />
                      <span>{(topThree[0].votesCount || 0).toLocaleString('id-ID')}</span>
                      <span className="text-[10px] font-sans font-bold text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-md">
                        Terbanyak
                      </span>
                    </div>

                    <div className="mt-3.5">
                      <button
                        type="button"
                        onClick={() => {
                          playTactileSound('press');
                          triggerCheer(0, topThree[0].teamName);
                        }}
                        className="neu-btn-gold inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-slate-950 font-black text-xs cursor-pointer shadow-md"
                      >
                        <Flame size={13} className="fill-slate-950" />
                        <span>Beri Api Semangat! 🔥</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pedestal Peringkat #1 Emas (Tingkat Tertinggi: h-36) */}
                <div className="w-full h-36 rounded-b-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 border-x-2 border-b-2 border-amber-400 flex items-center justify-center font-mono text-4xl font-black text-amber-950 shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-[shimmer_2.5s_infinite]" />
                  <span className="relative z-10 drop-shadow-sm">I</span>
                </div>
              </div>

              {/* ========================================================= */}
              {/* PERINGKAT #3: WARNA MERAH (Tingkat Terendah h-16) */}
              {/* ========================================================= */}
              <div className="order-3 flex flex-col items-center">
                
                {/* Kartu Tim Mengambang & Ombang-Ambing Halus */}
                <div className="w-full animate-float-bob-3 group">
                  <div className="relative rounded-[2rem] bg-white p-6 text-center border-2 border-rose-300 shadow-lg transition-all duration-300 group-hover:-translate-y-4 group-hover:scale-[1.03] group-hover:shadow-[0_0_40px_rgba(239,68,68,0.55)] group-hover:border-rose-500 overflow-hidden">
                    
                    {/* BorderBeam Sinar Merah Berputar */}
                    <BorderBeam
                      duration={5}
                      borderWidth={2}
                      borderRadius={32}
                      colorFrom="#F87171"
                      colorTo="#DC2626"
                    />

                    {/* Badge Peringkat 3 Merah */}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 text-white px-3.5 py-1 text-[11px] font-black uppercase tracking-wider mb-3 shadow-xs">
                      <Medal size={13} className="text-rose-200" /> PERINGKAT #3
                    </span>

                    {/* Foto Tim dengan Border Merah */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-rose-400 shadow-md mb-3 bg-rose-50 mx-auto transition-transform duration-300 group-hover:scale-105">
                      <img
                        src={topThree[2].photoUrl || 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80'}
                        alt={topThree[2].teamName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <h3 className="font-black text-slate-900 text-base sm:text-lg line-clamp-1">
                      {topThree[2].teamName}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold line-clamp-1 mt-0.5">
                      {topThree[2].institution}
                    </p>

                    <div className="mt-3 inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-3.5 py-1.5 rounded-xl font-mono text-base font-black text-rose-700">
                      <Vote size={15} className="text-rose-600" />
                      <span>{(topThree[2].votesCount || 0).toLocaleString('id-ID')}</span>
                      <span className="text-[10px] font-sans font-normal text-slate-500">Suara</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playTactileSound('pill');
                        triggerCheer(2, topThree[2].teamName);
                      }}
                      className="mt-3.5 neu-btn-strong-red inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white text-[11px] font-bold cursor-pointer"
                    >
                      <span>🔥 Semangati</span>
                    </button>
                  </div>
                </div>

                {/* Pedestal Peringkat #3 Merah (Tinggi Terendah: h-16) */}
                <div className="w-full h-16 rounded-b-2xl bg-gradient-to-b from-rose-400 via-red-500 to-rose-700 border-x-2 border-b-2 border-rose-600 flex items-center justify-center font-mono text-2xl font-black text-white shadow-md">
                  III
                </div>
              </div>

            </div>

            {/* Container Floating Reactions */}
            <div className="pointer-events-none fixed bottom-12 right-12 z-50 flex flex-col gap-2 items-end">
              {reactions.map((r) => (
                <div
                  key={r.id}
                  className="rounded-full bg-slate-900 text-[#FFDD00] px-4 py-2 font-black text-xs shadow-2xl border border-white/20 animate-[cheerFloat_1.2s_ease-out_forwards]"
                  style={{ transform: `translateX(${r.xOffset}px)` }}
                >
                  {r.text}
                </div>
              ))}
            </div>

          </div>
        ) : (
          /* ========================================================= */
          /* 4. EMPTY STATE / KLASEMEN DIKOSONGKAN (Latar Bersih) */
          /* ========================================================= */
          <div className="relative z-10 max-w-2xl mx-auto my-6">
            <div className="relative rounded-[2rem] bg-white border border-slate-200/90 shadow-xl p-8 sm:p-12 text-center space-y-5 overflow-hidden">
              <div className="w-18 h-18 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                <Clock size={34} className="animate-pulse" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-black uppercase tracking-wider">
                  <Clock size={12} /> Pintu Voting Belum Dibuka • Mode Standby
                </span>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Klasemen Pasukan Terfavorit Sedang Disiapkan
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Sistem perolehan suara popularitas untuk donasi pendidikan dan logistik kemanusiaan terverifikasi otomatis. Klasemen live akan aktif begitu gerbang voting dibuka oleh panitia Mako Menwa UNJ.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playTactileSound('press');
                    navigate('/geranat/voting');
                  }}
                  className="w-full sm:w-auto neu-btn-primary inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  <span>Kunjungi Halaman Charity Vote</span>
                  <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playTactileSound('pill');
                    setPreviewMode(true);
                  }}
                  className="w-full sm:w-auto neu-pill-tab inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-slate-800 font-bold text-xs transition cursor-pointer"
                >
                  <Sparkles size={14} className="text-[#FBBC05]" />
                  <span>Lihat Pratinjau Podium Juara (3 Warna)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2 Tombol Aksi Utama di Bawah Podium */}
        <div className="relative z-10 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {sortedTeams.length > 0 && (
            <button
              type="button"
              onClick={() => {
                playTactileSound('pill');
                setShowFullRanking((prev) => !prev);
              }}
              className="w-full sm:w-auto neu-pill-tab px-6 py-3 rounded-2xl text-slate-800 font-black text-xs sm:text-sm uppercase tracking-wider transition flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
            >
              <Trophy size={17} className="text-[#FBBC05]" />
              <span>🏆 Lihat Peringkat Lengkap Pasukan ({sortedTeams.length})</span>
              {showFullRanking ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              playTactileSound('press');
              navigate('/geranat/voting');
            }}
            className="w-full sm:w-auto neu-btn-gold px-8 py-3.5 rounded-2xl text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition flex items-center justify-center gap-2.5 cursor-pointer shadow-lg"
          >
            <Heart size={18} className="fill-[#006569] text-[#006569]" />
            <span>🗳️ Kunjungi Charity Vote</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Collapsible Peringkat Lengkap */}
        {showFullRanking && sortedTeams.length > 0 && (
          <div className="relative z-10 mt-8 pt-8 border-t border-slate-200 space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Users size={18} className="text-[#006569]" />
                  <span>Tabel Klasemen Pasukan Terfavorit</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Perolehan suara dan persentase dukungan untuk setiap kontingen pasukan.
                </p>
              </div>
              <div className="neu-search-capsule px-4 py-1.5 w-full sm:w-72">
                <Search size={15} className="text-amber-500 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kontingen atau instansi..."
                  className="bg-transparent border-none text-xs text-black font-semibold placeholder:text-slate-500 focus:outline-none w-full"
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
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 shadow-xs transition flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={`w-9 h-9 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                          rank === 1
                            ? 'bg-[#FBBC05] text-slate-950 shadow-md'
                            : rank === 2
                            ? 'bg-[#006569] text-white'
                            : rank === 3
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        #{rank}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-black text-sm text-slate-900 truncate">{team.teamName}</h4>
                        <p className="text-xs text-slate-500 truncate">
                          {team.institution} • <span className="text-[#006569] font-bold">{team.category || 'Pasukan Terfavorit'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                      <div className="text-right">
                        <div className="font-mono font-black text-sm text-[#006569]">
                          {(team.votesCount || 0).toLocaleString('id-ID')} Suara
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">{pct}% dukungan</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          playTactileSound('press');
                          navigate('/geranat/voting');
                        }}
                        className="neu-btn-primary px-4 py-2 rounded-xl text-white font-black text-xs uppercase tracking-wider cursor-pointer"
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
      </section>
    </div>
  );
}

export default GeranatPodium;
