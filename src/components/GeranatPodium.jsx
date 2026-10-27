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
  GraduationCap
} from 'lucide-react';
import {
  getGeranatTeams,
  subscribeToGeranatTeams,
  subscribeToRecentVotes
} from '../firebase.js';
import { navigate } from '../lib/router.jsx';
import { formatRupiah } from '../lib/qris.js';

// Default kosong setelah dibersihkan
const DEFAULT_PODIUM_TEAMS = [];
const FALLBACK_TICKER = [];

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
      setTeams(liveTeams || []);
    });

    const unsubTicker = subscribeToRecentVotes((liveVotes) => {
      setRecentVotes(liveVotes || []);
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
    const found = teams.find((t) => t.teamId === teamId || t.id === teamId);
    return found ? found.teamName : 'Penerima Charity Menwa';
  };

  return (
    <section id="podium-geranat" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="rounded-[2.5rem] bg-gradient-to-b from-white via-emerald-50/20 to-sky-50/30 border-2 border-emerald-100 shadow-xl overflow-hidden text-slate-900 p-6 sm:p-10 relative">
        {/* Ambient Google Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[260px] bg-[#4285F4]/10 rounded-full blur-[110px]" />

        {/* Live Voting Ticker */}
        {recentVotes.length > 0 && (
          <div className="relative z-10 mb-8 rounded-2xl bg-white border border-slate-200 px-4 py-2.5 flex items-center gap-3 overflow-hidden shadow-sm">
            <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#EA4335] text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider">
              <Heart size={12} className="fill-white" /> DONASI TERKINI
            </span>
            <div className="flex-1 overflow-x-auto no-scrollbar whitespace-nowrap text-xs text-slate-700 font-medium flex items-center gap-6">
              {recentVotes.map((v, idx) => (
                <span key={v.id || idx} className="inline-flex items-center gap-1.5">
                  <span className="text-[#34A853] font-bold">❤️ Terima kasih:</span>
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

        {/* Header Podium */}
        <div className="relative z-10 text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-emerald-200 text-[#006569] text-xs font-black uppercase tracking-widest shadow-sm">
            <Trophy size={14} className="text-[#FBBC05]" /> Podium Donasi Terbanyak
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            Klasemen Charity & Beasiswa
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Perolehan suara donasi beasiswa dan logistik kemanusiaan terverifikasi otomatis. Total donasi terkumpul:{' '}
            <strong className="text-[#006569] font-mono font-black">{totalVotes.toLocaleString('id-ID')} Suara</strong> ({formatRupiah(totalVotes * 1000)}).
          </p>
        </div>

        {/* 3D-Style Podium (Jika ada data 3 besar) */}
        {topThree.length >= 3 ? (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-5xl mx-auto pt-4">
            
            {/* PERINGKAT #2 (Perak) */}
            <div className="order-2 md:order-1 flex flex-col items-center">
              <div className="w-full rounded-t-3xl bg-white border-2 border-slate-300 p-6 text-center shadow-lg relative flex flex-col items-center">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 text-slate-800 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider mb-3">
                  <Medal size={12} /> PERINGKAT #2
                </span>
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-slate-300 shadow-md mb-3 bg-slate-100">
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
                <div className="mt-3 inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl font-mono text-base font-black text-[#006569]">
                  <Vote size={15} />
                  <span>{(topThree[1].votesCount || 0).toLocaleString('id-ID')}</span>
                  <span className="text-[10px] font-sans font-normal text-slate-500">Suara</span>
                </div>
              </div>
              <div className="w-full h-16 bg-gradient-to-b from-slate-200 to-slate-300 border-x-2 border-b-2 border-slate-300 rounded-b-2xl flex items-center justify-center font-mono text-2xl font-black text-slate-600">
                II
              </div>
            </div>

            {/* PERINGKAT #1 (Emas) */}
            <div className="order-1 md:order-2 flex flex-col items-center md:-translate-y-4">
              <div className="w-full rounded-t-3xl bg-white border-2 border-amber-300 p-7 text-center shadow-[0_10px_40px_rgba(251,188,5,0.2)] relative flex flex-col items-center">
                <div className="bg-[#FBBC05] text-slate-950 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow mb-3">
                  <Crown size={15} className="fill-slate-950" /> PERINGKAT #1 TERTINGGI
                </div>
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-[#FBBC05] shadow-lg mb-3 bg-amber-50">
                  <img
                    src={topThree[0].photoUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80'}
                    alt={topThree[0].teamName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-black text-slate-900 text-lg sm:text-xl line-clamp-1">
                  {topThree[0].teamName}
                </h3>
                <p className="text-xs text-slate-500 font-semibold line-clamp-1 mt-0.5">
                  {topThree[0].institution}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-xl font-mono text-lg font-black text-[#006569]">
                  <Vote size={17} className="text-[#FBBC05]" />
                  <span>{(topThree[0].votesCount || 0).toLocaleString('id-ID')}</span>
                  <span className="text-[10px] font-sans font-bold text-emerald-600">Suara Terbanyak</span>
                </div>
              </div>
              <div className="w-full h-24 bg-gradient-to-b from-amber-200 to-amber-300 border-x-2 border-b-2 border-amber-300 rounded-b-2xl flex items-center justify-center font-mono text-3xl font-black text-amber-800">
                I
              </div>
            </div>

            {/* PERINGKAT #3 (Perunggu) */}
            <div className="order-3 flex flex-col items-center">
              <div className="w-full rounded-t-3xl bg-white border-2 border-orange-200 p-6 text-center shadow-lg relative flex flex-col items-center">
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-900 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider mb-3">
                  <Medal size={12} /> PERINGKAT #3
                </span>
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-orange-200 shadow-md mb-3 bg-slate-100">
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
                <div className="mt-3 inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl font-mono text-base font-black text-[#006569]">
                  <Vote size={15} />
                  <span>{(topThree[2].votesCount || 0).toLocaleString('id-ID')}</span>
                  <span className="text-[10px] font-sans font-normal text-slate-500">Suara</span>
                </div>
              </div>
              <div className="w-full h-12 bg-gradient-to-b from-orange-200 to-orange-300 border-x-2 border-b-2 border-orange-300 rounded-b-2xl flex items-center justify-center font-mono text-xl font-black text-orange-800">
                III
              </div>
            </div>

          </div>
        ) : (
          /* Empty State Saat Data Tim Belum Ada / Sedang Direset */
          <div className="relative z-10 bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 max-w-2xl mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#006569] flex items-center justify-center mx-auto border border-emerald-200">
              <GraduationCap size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Papan Podium Bersiap untuk Charity Vote
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Data kontingen lama telah dibersihkan. Halaman Charity Vote siap memfasilitasi program Beasiswa Mahasiswa Menwa, Logistik Kemanusiaan, dan Aksi Cepat Karhutla.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/geranat/voting')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
              >
                <span>Buka Halaman Charity Vote</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* 2 Tombol Aksi Utama di Bawah Podium */}
        <div className="relative z-10 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {sortedTeams.length > 0 && (
            <button
              type="button"
              onClick={() => setShowFullRanking((prev) => !prev)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 font-black text-xs sm:text-sm uppercase tracking-wider transition flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
            >
              <Trophy size={17} className="text-[#FBBC05]" />
              <span>🏆 Lihat Peringkat Lengkap ({sortedTeams.length} Penerima)</span>
              {showFullRanking ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('/geranat/voting')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs sm:text-sm uppercase tracking-wider transition flex items-center justify-center gap-2.5 cursor-pointer shadow-lg hover:scale-105"
          >
            <Heart size={18} className="fill-[#FFDD00]" />
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
                  <span>Tabel Klasemen Lengkap Penerima Charity Vote</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Perolehan suara dan persentase dukungan untuk setiap inisiatif kebaikan.
                </p>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari penerima atau instansi..."
                  className="pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#006569] w-full sm:w-64"
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
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#4285F4]/60 shadow-sm transition flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={`w-9 h-9 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                          rank === 1
                            ? 'bg-[#FBBC05] text-slate-950'
                            : rank === 2
                            ? 'bg-slate-300 text-slate-900'
                            : rank === 3
                            ? 'bg-orange-300 text-orange-950'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        #{rank}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-black text-sm text-slate-900 truncate">{team.teamName}</h4>
                        <p className="text-xs text-slate-500 truncate">
                          {team.institution} • <span className="text-[#006569] font-bold">{team.category || 'Beasiswa Menwa'}</span>
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
                        onClick={() => navigate('/geranat/voting')}
                        className="px-3.5 py-2 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider transition cursor-pointer"
                      >
                        Donasi
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
