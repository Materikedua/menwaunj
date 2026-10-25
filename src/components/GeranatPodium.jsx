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
  Users
} from 'lucide-react';
import {
  getGeranatTeams,
  subscribeToGeranatTeams,
  subscribeToRecentVotes
} from '../firebase.js';
import { navigate } from '../lib/router.jsx';
import { formatRupiah } from '../lib/qris.js';

const DEFAULT_PODIUM_TEAMS = [
  {
    teamId: 'team-1',
    teamName: 'Pasukan Satria Pandawa',
    institution: 'SMA Negeri 1 Jakarta',
    category: 'Wira Utama (SMA/SMK)',
    dantonName: 'Muhammad Aditya Pratama',
    motto: 'Disiplin, Berani, & Berjiwa Ksatria',
    votesCount: 2480,
    photoUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=600&q=80'
  },
  {
    teamId: 'team-2',
    teamName: 'Paskibra Garda Mandiri',
    institution: 'SMKN 26 Jakarta',
    category: 'Wira Utama (SMA/SMK)',
    dantonName: 'Reza Firmansyah',
    motto: 'Satu Komando, Pantang Pulang Sebelum Menang',
    votesCount: 2150,
    photoUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80'
  },
  {
    teamId: 'team-3',
    teamName: 'Pasukan Rajawali Emas',
    institution: 'SMA Negeri 8 Jakarta',
    category: 'Wira Utama (SMA/SMK)',
    dantonName: 'Farhan Naufal',
    motto: 'Menembus Batas, Menjaga Wibawa',
    votesCount: 1890,
    photoUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80'
  },
  {
    teamId: 'team-4',
    teamName: 'Laskar Taruna Jayakarta',
    institution: 'SMA Negeri 39 Jakarta',
    category: 'Wira Utama (SMA/SMK)',
    dantonName: 'Dinda Ayu Maharani',
    motto: 'Kompak, Tangguh, & Berakhlak Mulia',
    votesCount: 1420,
    photoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80'
  },
  {
    teamId: 'team-5',
    teamName: 'Paskibra Satya Bhakti',
    institution: 'SMP Negeri 115 Jakarta',
    category: 'Madya (SMP/MTs)',
    dantonName: 'Kevin Anugrah Putra',
    motto: 'Muda, Berkarya, Harumkan Bangsa',
    votesCount: 1180,
    photoUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80'
  }
];

const FALLBACK_TICKER = [
  { id: 't1', voterName: 'Alumni SMAN 1', teamId: 'team-1', votes: 10, createdAt: new Date(Date.now() - 120000).toISOString() },
  { id: 't2', voterName: 'Keluarga Besar SMKN 26', teamId: 'team-2', votes: 5, createdAt: new Date(Date.now() - 240000).toISOString() },
  { id: 't3', voterName: 'Pendukung Setia SMAN 8', teamId: 'team-3', votes: 5, createdAt: new Date(Date.now() - 360000).toISOString() },
];

export function GeranatPodium() {
  const [teams, setTeams] = useState(DEFAULT_PODIUM_TEAMS);
  const [recentVotes, setRecentVotes] = useState(FALLBACK_TICKER);
  const [showFullRanking, setShowFullRanking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [countdown, setCountdown] = useState(15);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real-time listener onSnapshot + 15-detik auto-refresh
  useEffect(() => {
    const unsubTeams = subscribeToGeranatTeams((liveTeams) => {
      if (liveTeams && liveTeams.length > 0) {
        setTeams(liveTeams);
      }
    });

    const unsubTicker = subscribeToRecentVotes((liveVotes) => {
      if (liveVotes && liveVotes.length > 0) {
        setRecentVotes(liveVotes);
      }
    }, 10);

    return () => {
      unsubTeams();
      unsubTicker();
    };
  }, []);

  const manualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await getGeranatTeams();
      if (data && data.length > 0) setTeams(data);
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

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0));
  }, [teams]);

  const topThree = sortedTeams.slice(0, 3);
  const totalVotes = useMemo(() => teams.reduce((acc, t) => acc + (t.votesCount || 0), 0), [teams]);

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
    const found = teams.find((t) => t.teamId === teamId);
    return found ? found.teamName : 'Tim Favorit GERANAT';
  };

  return (
    <section id="podium-geranat" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="rounded-[2.5rem] bg-gradient-to-b from-slate-950 via-[#03191b] to-slate-950 border-2 border-[#006569]/60 shadow-2xl overflow-hidden text-white p-6 sm:p-10 relative">
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[260px] bg-[#FFDD00]/15 rounded-full blur-[110px]" />

        {/* Live Voting Ticker (Bagian 5.D) */}
        <div className="relative z-10 mb-8 rounded-2xl bg-slate-900/90 border border-teal-500/30 px-4 py-2.5 flex items-center gap-3 overflow-hidden">
          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#FFDD00] text-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
            <Flame size={12} className="fill-slate-950" /> LIVE VOTE
          </span>
          <div className="flex-1 overflow-x-auto no-scrollbar whitespace-nowrap text-xs text-slate-200 font-medium flex items-center gap-6">
            {recentVotes.map((v, idx) => (
              <span key={v.id || idx} className="inline-flex items-center gap-1.5">
                <span className="text-[#FFDD00] font-bold">🔥 Baru saja:</span>
                <strong className="text-white">{v.voterName || 'Pendukung'}</strong>
                <span className="text-slate-400">mendukung</span>
                <strong className="text-teal-300">{v.teamName || getTeamNameById(v.teamId)}</strong>
                <span className="rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-1.5 py-0.5 font-mono text-[10px] font-bold">
                  +{v.votes || 1} suara
                </span>
              </span>
            ))}
          </div>
          <div className="shrink-0 hidden sm:flex items-center gap-2 text-[11px] font-mono text-teal-300 border-l border-white/10 pl-3">
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-[#FFDD00]' : ''} />
            <span>{countdown}s</span>
          </div>
        </div>

        {/* Header Podium */}
        <div className="relative z-10 text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#006569]/50 border border-[#FFDD00]/40 text-[#FFDD00] text-xs font-black uppercase tracking-widest">
            <Trophy size={14} /> Podium Real-Time • GERANAT 2026
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Podium 3 Besar Juara Terfavorit
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-300">
            Klasemen perolehan suara terfavorit kontingen Paskibra diperbarui otomatis secara real-time. Total suara terkumpul:{' '}
            <strong className="text-[#FFDD00] font-mono">{totalVotes.toLocaleString('id-ID')} Suara</strong> ({formatRupiah(totalVotes * 1000)}).
          </p>
        </div>

        {/* 3D-Style Podium: Rank 2 (Kiri - Perak) | Rank 1 (Tengah - Emas Tertinggi) | Rank 3 (Kanan - Perunggu) */}
        {topThree.length >= 3 && (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-5xl mx-auto pt-4">
            
            {/* PERINGKAT #2 (Kiri - Silver #C0C0C0) */}
            <div className="order-2 md:order-1 flex flex-col items-center">
              <div className="w-full rounded-t-3xl bg-gradient-to-b from-slate-800/90 to-slate-900 border-2 border-[#C0C0C0]/60 p-6 text-center shadow-xl relative flex flex-col items-center">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#C0C0C0] text-slate-950 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider mb-3 shadow">
                  <Medal size={12} /> PERINGKAT #2
                </span>
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-[#C0C0C0] shadow-lg mb-3 bg-slate-800">
                  <img
                    src={topThree[1].photoUrl}
                    alt={topThree[1].teamName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-black text-white text-base sm:text-lg line-clamp-1">
                  {topThree[1].teamName}
                </h3>
                <p className="text-xs text-slate-400 font-semibold line-clamp-1 mt-0.5">
                  {topThree[1].institution}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 bg-slate-950/80 border border-[#C0C0C0]/40 px-3.5 py-1.5 rounded-xl font-mono text-base font-black text-slate-100">
                  <Vote size={15} className="text-[#C0C0C0]" />
                  <span>{(topThree[1].votesCount || 0).toLocaleString('id-ID')}</span>
                  <span className="text-[10px] font-sans font-normal text-slate-400">Suara</span>
                </div>
              </div>
              {/* 3D Pedestal Base #2 */}
              <div className="w-full h-16 bg-gradient-to-b from-[#C0C0C0]/30 to-slate-900 border-x-2 border-b-2 border-[#C0C0C0]/50 rounded-b-2xl flex items-center justify-center font-mono text-2xl font-black text-[#C0C0C0]">
                II
              </div>
            </div>

            {/* PERINGKAT #1 (Tengah - Gold #FFDD00 - Paling Tinggi + Crown) */}
            <div className="order-1 md:order-2 flex flex-col items-center md:-translate-y-4">
              <div className="w-full rounded-t-3xl bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-900 border-2 border-[#FFDD00] p-7 text-center shadow-[0_0_50px_rgba(255,221,0,0.2)] relative flex flex-col items-center">
                <div className=" -top-5 bg-[#FFDD00] text-slate-950 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg mb-3">
                  <Crown size={15} className="fill-slate-950" /> JUARA #1 TERFAVORIT
                </div>
                <div className="relative mb-3">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-4 border-[#FFDD00] shadow-2xl bg-slate-800">
                    <img
                      src={topThree[0].photoUrl}
                      alt={topThree[0].teamName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute -bottom-2 -right-2 bg-[#FFDD00] text-slate-950 p-2 rounded-full shadow-lg border-2 border-slate-950">
                    <Crown size={16} className="fill-slate-950" />
                  </span>
                </div>
                <h3 className="font-black text-white text-lg sm:text-xl line-clamp-1">
                  {topThree[0].teamName}
                </h3>
                <p className="text-xs text-amber-200/90 font-semibold line-clamp-1 mt-0.5">
                  {topThree[0].institution}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 bg-slate-950 border border-[#FFDD00]/60 px-4 py-2 rounded-xl font-mono text-xl font-black text-[#FFDD00] shadow-inner">
                  <Flame size={18} className="fill-[#FFDD00] text-[#FFDD00] animate-bounce" />
                  <span>{(topThree[0].votesCount || 0).toLocaleString('id-ID')}</span>
                  <span className="text-xs font-sans font-normal text-amber-200">Suara</span>
                </div>
              </div>
              {/* 3D Pedestal Base #1 */}
              <div className="w-full h-24 bg-gradient-to-b from-[#FFDD00]/35 to-amber-950/50 border-x-2 border-b-2 border-[#FFDD00] rounded-b-2xl flex items-center justify-center font-mono text-3xl font-black text-[#FFDD00] shadow-lg">
                I
              </div>
            </div>

            {/* PERINGKAT #3 (Kanan - Bronze #CD7F32) */}
            <div className="order-3 flex flex-col items-center">
              <div className="w-full rounded-t-3xl bg-gradient-to-b from-slate-800/90 to-slate-900 border-2 border-[#CD7F32]/70 p-6 text-center shadow-xl relative flex flex-col items-center">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#CD7F32] text-white px-3 py-0.5 text-[10px] font-black uppercase tracking-wider mb-3 shadow">
                  <Medal size={12} /> PERINGKAT #3
                </span>
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-[#CD7F32] shadow-lg mb-3 bg-slate-800">
                  <img
                    src={topThree[2].photoUrl}
                    alt={topThree[2].teamName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-black text-white text-base sm:text-lg line-clamp-1">
                  {topThree[2].teamName}
                </h3>
                <p className="text-xs text-slate-400 font-semibold line-clamp-1 mt-0.5">
                  {topThree[2].institution}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 bg-slate-950/80 border border-[#CD7F32]/50 px-3.5 py-1.5 rounded-xl font-mono text-base font-black text-amber-300">
                  <Vote size={15} className="text-[#CD7F32]" />
                  <span>{(topThree[2].votesCount || 0).toLocaleString('id-ID')}</span>
                  <span className="text-[10px] font-sans font-normal text-slate-400">Suara</span>
                </div>
              </div>
              {/* 3D Pedestal Base #3 */}
              <div className="w-full h-12 bg-gradient-to-b from-[#CD7F32]/35 to-slate-900 border-x-2 border-b-2 border-[#CD7F32]/60 rounded-b-2xl flex items-center justify-center font-mono text-xl font-black text-[#CD7F32]">
                III
              </div>
            </div>

          </div>
        )}

        {/* 2 Tombol Aksi Utama di Bawah Podium (Spesifikasi Bagian 1.D) */}
        <div className="relative z-10 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setShowFullRanking((prev) => !prev)}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border-2 border-white/20 hover:border-[#FFDD00] text-white font-black text-xs sm:text-sm uppercase tracking-wider transition flex items-center justify-center gap-2.5 cursor-pointer shadow-lg"
          >
            <Trophy size={17} className="text-[#FFDD00]" />
            <span>🏆 Lihat Peringkat Lengkap ({sortedTeams.length} Tim)</span>
            {showFullRanking ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <button
            type="button"
            onClick={() => navigate('/geranat/voting')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#FFDD00] hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_10px_30px_rgba(255,221,0,0.3)] hover:scale-105"
          >
            <Vote size={18} />
            <span>🗳️ Dukung Tim Favoritmu!</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Collapsible Peringkat Lengkap (Peringkat 1 s.d. Seluruh Kontingen) */}
        {showFullRanking && (
          <div className="relative z-10 mt-8 pt-8 border-t border-white/15 space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Users size={18} className="text-[#FFDD00]" />
                  <span>Tabel Klasemen Lengkap Kontingen GERANAT 2026</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Menampilkan peringkat 1 hingga seluruh peserta beserta persentase dukungan suara.
                </p>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari sekolah atau tim..."
                  className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FFDD00] w-full sm:w-64"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredAllTeams.map((team) => {
                const rank = sortedTeams.findIndex((t) => t.teamId === team.teamId) + 1;
                const pct = totalVotes > 0 ? Math.round(((team.votesCount || 0) / totalVotes) * 100) : 0;
                return (
                  <div
                    key={team.teamId}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-teal-500/50 transition flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={`w-9 h-9 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                          rank === 1
                            ? 'bg-[#FFDD00] text-slate-950'
                            : rank === 2
                            ? 'bg-[#C0C0C0] text-slate-950'
                            : rank === 3
                            ? 'bg-[#CD7F32] text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        #{rank}
                      </span>
                      <img
                        src={team.photoUrl}
                        alt={team.teamName}
                        className="w-11 h-11 rounded-xl object-cover border border-white/15 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-black text-sm text-white truncate">{team.teamName}</h4>
                        <p className="text-xs text-slate-400 truncate">
                          {team.institution} • <span className="text-teal-300">{team.category}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                      <div className="text-right">
                        <div className="font-mono font-black text-sm text-[#FFDD00]">
                          {(team.votesCount || 0).toLocaleString('id-ID')} Suara
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{pct}% pangsa suara</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/geranat/voting')}
                        className="px-3.5 py-2 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider transition cursor-pointer"
                      >
                        Vote
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
