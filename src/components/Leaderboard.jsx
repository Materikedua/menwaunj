import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Flame, 
  ShieldCheck, 
  Search, 
  Filter, 
  Sparkles, 
  ArrowUpRight, 
  Users, 
  Calendar, 
  RefreshCw,
  Star,
  Zap,
  Award,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { getLeaderboardUsers } from '../firebase.js';

// Gelar Kehormatan Taktis berdasarkan Peringkat dan Prestasi
export const HONORARY_TITLES = {
  RANK_1: {
    title: 'Panglima Taktis Tertinggi',
    desc: 'Juara 1 Pengumpul EXP Taktis Terbanyak',
    color: 'from-amber-400 to-yellow-500 text-slate-950 border-amber-300',
    badgeBg: 'bg-amber-400 text-slate-950 font-black',
    icon: Crown
  },
  RANK_2: {
    title: 'Komandan Tempur Utama',
    desc: 'Peringkat 2 Taktisi Andal Satuan',
    color: 'from-slate-200 to-slate-400 text-slate-900 border-slate-300',
    badgeBg: 'bg-slate-200 text-slate-900 font-bold',
    icon: Medal
  },
  RANK_3: {
    title: 'Perwira Operasi Strategis',
    desc: 'Peringkat 3 Penguasaan Doktrin & Taktik',
    color: 'from-amber-600 to-orange-700 text-white border-amber-600',
    badgeBg: 'bg-amber-700 text-amber-100 font-bold',
    icon: Medal
  },
  TOP_MENWA: {
    title: 'Ksatria Teladan Jayakarta',
    desc: 'Anggota Menwa UNJ Terverifikasi Terbaik',
    color: 'from-teal-600 to-emerald-700 text-white border-teal-400',
    badgeBg: 'bg-teal-600 text-emerald-100 font-black',
    icon: ShieldCheck
  },
  TOP_GLOBAL: {
    title: 'Pejuang Cendekia Terbaik',
    desc: 'Peringkat Tertinggi Kategori Umum/Siswa/Mahasiswa Luar',
    color: 'from-blue-600 to-indigo-700 text-white border-blue-400',
    badgeBg: 'bg-blue-600 text-blue-100 font-black',
    icon: Award
  },
  TOP_TEN: {
    title: 'Sersan Kepala Taktis',
    desc: 'Jajaran Elit 10 Besar Taktis',
    badgeBg: 'bg-slate-700 text-slate-200 font-semibold',
    icon: Star
  }
};

// Data simulasi kohort untuk melengkapi papan peringkat agar selalu kompetitif dan hidup
const SEED_COMPETITORS = [
  {
    id: 'seed-1',
    displayName: 'Letda M. Farhan Wicaksono',
    institution: 'Menwa UNJ (Batalyon Jayakarta)',
    occupation: 'Mahasiswa / Menwa UNJ',
    isVerifiedMenwa: true,
    menwaIdNumber: 'NBP.22010742250',
    tacticalPoints: 1240,
    weeklyPoints: 480,
    monthlyPoints: 920,
    avatarSeed: 'Farhan'
  },
  {
    id: 'seed-2',
    displayName: 'Siti Rahma Nurfadilah',
    institution: 'Universitas Indonesia',
    occupation: 'Mahasiswa Psikologi',
    isVerifiedMenwa: false,
    tacticalPoints: 1080,
    weeklyPoints: 420,
    monthlyPoints: 850,
    avatarSeed: 'Rahma'
  },
  {
    id: 'seed-3',
    displayName: 'Sersan Dwi Satria Utama',
    institution: 'Menwa UNJ (Kaur Ops)',
    occupation: 'Mahasiswa / Menwa UNJ',
    isVerifiedMenwa: true,
    menwaIdNumber: 'NBP.22020742289',
    tacticalPoints: 960,
    weeklyPoints: 370,
    monthlyPoints: 780,
    avatarSeed: 'Dwi'
  },
  {
    id: 'seed-4',
    displayName: 'Bagus Pratama Kusuma',
    institution: 'SMKN 1 Jakarta (Paskibra)',
    occupation: 'Pelajar / Paskibra Sekolah',
    isVerifiedMenwa: false,
    tacticalPoints: 840,
    weeklyPoints: 310,
    monthlyPoints: 690,
    avatarSeed: 'Bagus'
  },
  {
    id: 'seed-5',
    displayName: 'Kopral Anisa Putri Cahyani',
    institution: 'Menwa UNJ (Kaur Humas)',
    occupation: 'Mahasiswa / Menwa UNJ',
    isVerifiedMenwa: true,
    menwaIdNumber: 'NBP.22030742301',
    tacticalPoints: 790,
    weeklyPoints: 290,
    monthlyPoints: 610,
    avatarSeed: 'Anisa'
  },
  {
    id: 'seed-6',
    displayName: 'Kevin Aldiansyah',
    institution: 'Institut Pertanian Bogor',
    occupation: 'Mahasiswa Kehutanan',
    isVerifiedMenwa: false,
    tacticalPoints: 670,
    weeklyPoints: 250,
    monthlyPoints: 530,
    avatarSeed: 'Kevin'
  },
  {
    id: 'seed-7',
    displayName: 'Praka Ilham Ramadhan',
    institution: 'Menwa UNJ (Provos Satuan)',
    occupation: 'Mahasiswa / Menwa UNJ',
    isVerifiedMenwa: true,
    menwaIdNumber: 'NBP.22010742277',
    tacticalPoints: 580,
    weeklyPoints: 210,
    monthlyPoints: 440,
    avatarSeed: 'Ilham'
  }
];

export function Leaderboard({ onOpenQuiz, onOpenAuth }) {
  const { user, profile } = useAuth();
  const [period, setPeriod] = useState('weekly'); // 'weekly' | 'monthly' | 'all'
  const [filterScope, setFilterScope] = useState('all'); // 'all' | 'menwa'
  const [searchQuery, setSearchQuery] = useState('');
  const [rawUsers, setRawUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Ambil data users dari Firestore
  const fetchUsers = async () => {
    try {
      setRefreshing(true);
      const data = await getLeaderboardUsers();
      setRawUsers(data || []);
    } catch (err) {
      console.warn('Gagal memuat papan peringkat:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Gabungkan user Firestore nyata dan seed kohort tanpa duplikasi
  const combinedUsers = useMemo(() => {
    const list = [...rawUsers];

    // Jika pengguna login ada di profile namun belum ada di Firestore list, sisipkan
    if (user && profile && !list.some(u => u.id === user.uid || u.uid === user.uid)) {
      list.push({
        id: user.uid,
        uid: user.uid,
        displayName: profile.displayName || user.displayName || user.email?.split('@')[0] || 'Anda',
        institution: profile.institution || 'Universitas Negeri Jakarta',
        occupation: profile.occupation || 'Pengguna Terdaftar',
        isVerifiedMenwa: !!profile.isVerifiedMenwa,
        menwaIdNumber: profile.menwaIdNumber || '',
        tacticalPoints: profile.tacticalPoints || 0,
        weeklyPoints: profile.weeklyPoints || 0,
        monthlyPoints: profile.monthlyPoints || 0,
        email: user.email,
        isCurrentUser: true
      });
    }

    // Selalu pastikan ada minimal 7 peserta kompetitif
    SEED_COMPETITORS.forEach(seed => {
      if (!list.some(u => u.displayName?.toLowerCase() === seed.displayName.toLowerCase())) {
        list.push(seed);
      }
    });

    return list;
  }, [rawUsers, user, profile]);

  // Urutkan dan filter berdasarkan periode & kategori anggota
  const rankedUsers = useMemo(() => {
    let filtered = [...combinedUsers];

    // Filter status anggota
    if (filterScope === 'menwa') {
      filtered = filtered.filter(u => u.isVerifiedMenwa);
    }

    // Pencarian nama atau instansi
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        (u.displayName && u.displayName.toLowerCase().includes(q)) ||
        (u.institution && u.institution.toLowerCase().includes(q)) ||
        (u.menwaIdNumber && u.menwaIdNumber.toLowerCase().includes(q))
      );
    }

    // Hitung poin sesuai periode
    const getPoints = (u) => {
      if (period === 'weekly') {
        return u.weeklyPoints ?? Math.round((u.tacticalPoints || 0) * 0.4);
      }
      if (period === 'monthly') {
        return u.monthlyPoints ?? Math.round((u.tacticalPoints || 0) * 0.75);
      }
      return u.tacticalPoints || 0;
    };

    // Sort descending
    filtered.sort((a, b) => getPoints(b) - getPoints(a));

    // Tetapkan Title dan Rank
    let firstMenwaAssigned = false;
    let firstGlobalAssigned = false;

    return filtered.map((u, index) => {
      const rank = index + 1;
      const pts = getPoints(u);
      const isMe = (user && (u.id === user.uid || u.uid === user.uid || u.email === user.email)) || !!u.isCurrentUser;

      let titleBadge = null;
      if (rank === 1) {
        titleBadge = HONORARY_TITLES.RANK_1;
      } else if (rank === 2) {
        titleBadge = HONORARY_TITLES.RANK_2;
      } else if (rank === 3) {
        titleBadge = HONORARY_TITLES.RANK_3;
      } else if (u.isVerifiedMenwa && !firstMenwaAssigned && rank <= 5) {
        titleBadge = HONORARY_TITLES.TOP_MENWA;
        firstMenwaAssigned = true;
      } else if (!u.isVerifiedMenwa && !firstGlobalAssigned && rank <= 5) {
        titleBadge = HONORARY_TITLES.TOP_GLOBAL;
        firstGlobalAssigned = true;
      } else if (rank <= 10) {
        titleBadge = HONORARY_TITLES.TOP_TEN;
      }

      return {
        ...u,
        rank,
        currentPeriodPoints: pts,
        isMe,
        titleBadge
      };
    });
  }, [combinedUsers, period, filterScope, searchQuery, user]);

  // Dapatkan posisi user saat ini
  const currentUserStanding = useMemo(() => {
    return rankedUsers.find(u => u.isMe);
  }, [rankedUsers]);

  // 3 Besar untuk Podium
  const topThree = rankedUsers.slice(0, 3);
  const remainingRanks = rankedUsers.slice(3);

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Banner Pengenalan Gelar & Periode */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#004d50] to-slate-950 rounded-3xl p-6 sm:p-8 border border-teal-500/30 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#FFDD00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FFDD00] text-slate-950 shadow-md">
              <Trophy size={14} className="fill-slate-950" />
              <span>Klasemen & Gelar Kehormatan Taktis</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Papan Peringkat Prestasi Satuan
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Kumpulkan EXP dari kuis harian 7 tema taktis. Pemenang dan pengumpul EXP terbanyak dianugerahi gelar kehormatan militer resmi Menwa UNJ.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchUsers}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2 border border-white/10"
              title="Perbarui Klasemen"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>Segarkan</span>
            </button>
            {onOpenQuiz && (
              <button
                onClick={onOpenQuiz}
                className="px-5 py-2.5 rounded-xl bg-[#FFDD00] hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition shadow-lg flex items-center gap-2 hover:scale-105"
              >
                <Zap size={14} className="fill-slate-950" />
                <span>Main Kuis Harian</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Kontrol Periode */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          {/* Tab Periode: Mingguan / Bulanan / Semua Masa */}
          <div className="inline-flex p-1 rounded-2xl bg-slate-950/60 border border-white/10">
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center gap-2 ${
                period === 'weekly' 
                  ? 'bg-[#FFDD00] text-slate-950 shadow-md' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Flame size={14} />
              <span>Mingguan</span>
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center gap-2 ${
                period === 'monthly' 
                  ? 'bg-[#FFDD00] text-slate-950 shadow-md' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Calendar size={14} />
              <span>Bulanan</span>
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center gap-2 ${
                period === 'all' 
                  ? 'bg-[#FFDD00] text-slate-950 shadow-md' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Award size={14} />
              <span>Semua Masa</span>
            </button>
          </div>

          {/* Filter Status Anggota & Pencarian */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex p-1 rounded-2xl bg-slate-950/60 border border-white/10">
              <button
                onClick={() => setFilterScope('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterScope === 'all'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Global / Semua
              </button>
              <button
                onClick={() => setFilterScope('menwa')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  filterScope === 'menwa'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Khusus Anggota Menwa UNJ Terverifikasi Centang Biru"
              >
                <ShieldCheck size={13} className="text-blue-200" />
                <span>Anggota Menwa UNJ</span>
              </button>
            </div>

            {/* Kotak Cari Nama */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau instansi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-950/70 border border-white/15 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#FFDD00] w-44 sm:w-56"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Podium Top 3 */}
      {topThree.length >= 3 && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-4 items-end">
          {/* Peringkat 2: Kiri di desktop */}
          <div className="order-2 md:order-1 bg-gradient-to-t from-slate-900 via-slate-800 to-slate-800/90 rounded-3xl p-6 border-2 border-slate-400/40 text-center shadow-xl relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-3 left-3 bg-slate-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Medal size={12} />
              <span>PERINGKAT #2</span>
            </div>
            <div className="w-20 h-20 rounded-full bg-slate-700 border-4 border-slate-300 flex items-center justify-center font-black text-2xl text-white shadow-lg mt-4 mb-3">
              {topThree[1].displayName.charAt(0)}
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <h3 className="font-black text-white text-base truncate max-w-[200px]">
                {topThree[1].displayName}
              </h3>
              {topThree[1].isVerifiedMenwa && (
                <ShieldCheck size={16} className="text-blue-400 shrink-0" title="Terverifikasi Anggota Menwa UNJ" />
              )}
            </div>
            <p className="text-slate-400 text-xs mt-0.5 truncate max-w-[220px]">
              {topThree[1].institution || 'Universitas Negeri Jakarta'}
            </p>
            {topThree[1].titleBadge && (
              <span className={`mt-2.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider ${topThree[1].titleBadge.badgeBg}`}>
                {topThree[1].titleBadge.title}
              </span>
            )}
            <div className="mt-4 pt-4 border-t border-slate-700/60 w-full flex items-center justify-center gap-1.5 text-amber-300 font-black text-lg">
              <Flame size={18} className="fill-amber-400 text-amber-400" />
              <span>{topThree[1].currentPeriodPoints}</span>
              <span className="text-xs text-slate-400 font-mono">EXP</span>
            </div>
          </div>

          {/* Peringkat 1: Tengah (Paling Tinggi) */}
          <div className="order-1 md:order-2 bg-gradient-to-t from-slate-900 via-amber-950/40 to-slate-800 rounded-3xl p-8 border-2 border-[#FFDD00] text-center shadow-2xl relative overflow-hidden flex flex-col items-center scale-100 md:-translate-y-4">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#FFDD00] text-slate-950 text-xs font-black px-4 py-1 rounded-full flex items-center gap-1.5 shadow-lg tracking-wider">
              <Crown size={14} className="fill-slate-950 text-slate-950" />
              <span>JUARA #1 • PANGLIMA</span>
            </div>
            <div className="relative mt-6 mb-3">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-4 border-[#FFDD00] flex items-center justify-center font-black text-3xl text-slate-950 shadow-2xl">
                {topThree[0].displayName.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-1 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-lg border-2 border-slate-900">
                <Crown size={16} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <h3 className="font-black text-white text-lg truncate max-w-[220px]">
                {topThree[0].displayName}
              </h3>
              {topThree[0].isVerifiedMenwa && (
                <ShieldCheck size={18} className="text-blue-400 shrink-0" title="Terverifikasi Anggota Menwa UNJ" />
              )}
            </div>
            <p className="text-amber-200/80 text-xs mt-0.5 truncate max-w-[240px]">
              {topThree[0].institution || 'Universitas Negeri Jakarta'}
            </p>
            {topThree[0].titleBadge && (
              <span className={`mt-2.5 px-3.5 py-1 rounded-full text-[11px] uppercase tracking-wider ${topThree[0].titleBadge.badgeBg} shadow-md`}>
                👑 {topThree[0].titleBadge.title}
              </span>
            )}
            <div className="mt-5 pt-4 border-t border-amber-500/30 w-full flex items-center justify-center gap-2 text-[#FFDD00] font-black text-2xl">
              <Flame size={22} className="fill-amber-400 text-amber-400" />
              <span>{topThree[0].currentPeriodPoints}</span>
              <span className="text-sm text-amber-300/80 font-mono">EXP</span>
            </div>
          </div>

          {/* Peringkat 3: Kanan di desktop */}
          <div className="order-3 bg-gradient-to-t from-slate-900 via-slate-800 to-slate-800/90 rounded-3xl p-6 border-2 border-amber-700/50 text-center shadow-xl relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-3 left-3 bg-amber-700 text-amber-100 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Medal size={12} />
              <span>PERINGKAT #3</span>
            </div>
            <div className="w-20 h-20 rounded-full bg-amber-900/60 border-4 border-amber-600 flex items-center justify-center font-black text-2xl text-amber-200 shadow-lg mt-4 mb-3">
              {topThree[2].displayName.charAt(0)}
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <h3 className="font-black text-white text-base truncate max-w-[200px]">
                {topThree[2].displayName}
              </h3>
              {topThree[2].isVerifiedMenwa && (
                <ShieldCheck size={16} className="text-blue-400 shrink-0" title="Terverifikasi Anggota Menwa UNJ" />
              )}
            </div>
            <p className="text-slate-400 text-xs mt-0.5 truncate max-w-[220px]">
              {topThree[2].institution || 'Universitas Negeri Jakarta'}
            </p>
            {topThree[2].titleBadge && (
              <span className={`mt-2.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider ${topThree[2].titleBadge.badgeBg}`}>
                {topThree[2].titleBadge.title}
              </span>
            )}
            <div className="mt-4 pt-4 border-t border-slate-700/60 w-full flex items-center justify-center gap-1.5 text-amber-300 font-black text-lg">
              <Flame size={18} className="fill-amber-400 text-amber-400" />
              <span>{topThree[2].currentPeriodPoints}</span>
              <span className="text-xs text-slate-400 font-mono">EXP</span>
            </div>
          </div>
        </div>
      )}

      {/* Banner Posisi Pengguna Saat Ini (Jika Login) */}
      {user && currentUserStanding && (
        <div className="bg-gradient-to-r from-teal-900/90 via-slate-900 to-teal-950 border-2 border-teal-500/40 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-xl shadow-lg border border-teal-300/30">
              #{currentUserStanding.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-400/30">
                  Posisi Anda
                </span>
                {currentUserStanding.titleBadge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${currentUserStanding.titleBadge.badgeBg}`}>
                    {currentUserStanding.titleBadge.title}
                  </span>
                )}
              </div>
              <h4 className="text-base font-black text-white mt-0.5 flex items-center gap-1.5">
                {currentUserStanding.displayName} (Anda)
                {currentUserStanding.isVerifiedMenwa && (
                  <ShieldCheck size={15} className="text-blue-400" title="Anggota Menwa Terverifikasi" />
                )}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Poin Periode Ini</div>
              <div className="text-xl font-black text-[#FFDD00] flex items-center gap-1">
                <Flame size={16} className="fill-amber-400" />
                <span>{currentUserStanding.currentPeriodPoints}</span>
                <span className="text-xs text-slate-400 font-normal">EXP</span>
              </div>
            </div>
            {onOpenQuiz && (
              <button
                onClick={onOpenQuiz}
                className="px-4 py-2 rounded-xl bg-[#FFDD00] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-md flex items-center gap-1.5"
              >
                <span>Tingkatkan Rank</span>
                <ArrowUpRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Daftar Peringkat Tabel / Kartu */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
            <Users size={15} className="text-teal-400" />
            <span>Peringkat 4 dan Seterusnya ({remainingRanks.length} Peserta)</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Periode: {period === 'weekly' ? 'Mingguan' : period === 'monthly' ? 'Bulanan' : 'Sepanjang Masa'}
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {remainingRanks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Tidak ada peserta yang cocok dengan filter pencarian ini.
            </div>
          ) : (
            remainingRanks.map((entry) => (
              <div 
                key={entry.id || entry.uid}
                className={`p-4 sm:px-6 flex items-center justify-between gap-4 transition hover:bg-slate-800/50 ${
                  entry.isMe ? 'bg-teal-950/40 border-l-4 border-teal-400' : ''
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-8 sm:w-10 text-center font-mono font-black text-slate-400 text-sm sm:text-base shrink-0">
                    #{entry.rank}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-slate-200 shrink-0">
                    {entry.displayName?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm sm:text-base truncate">
                        {entry.displayName} {entry.isMe ? '(Anda)' : ''}
                      </span>
                      {entry.isVerifiedMenwa && (
                        <span title="Anggota Menwa Terverifikasi Resmi">
                          <ShieldCheck size={15} className="text-blue-400 shrink-0" />
                        </span>
                      )}
                      {entry.titleBadge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${entry.titleBadge.badgeBg}`}>
                          {entry.titleBadge.title}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 truncate flex items-center gap-2">
                      <span>{entry.institution || 'Universitas Negeri Jakarta'}</span>
                      {entry.menwaIdNumber && (
                        <span className="text-[10px] font-mono text-teal-400 bg-teal-950/60 px-1.5 py-0.2 rounded border border-teal-800">
                          {entry.menwaIdNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1 font-mono font-black text-[#FFDD00] text-sm sm:text-base">
                    <Flame size={15} className="fill-amber-400 text-amber-400" />
                    <span>{entry.currentPeriodPoints}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-sans">EXP</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {period === 'weekly' ? 'pekan ini' : period === 'monthly' ? 'bulan ini' : 'total'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Aturan Poin & Gelar Kehormatan */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-slate-300 text-xs leading-relaxed space-y-3">
        <h4 className="font-black text-white text-sm flex items-center gap-2 uppercase tracking-wider text-teal-300">
          <Sparkles size={16} /> Ketentuan Peringkat & Gelar Kehormatan Satuan
        </h4>
        <ul className="list-disc list-inside space-y-1.5 text-slate-400">
          <li><strong>Poin Mingguan:</strong> Diakumulasikan dari kuis yang diselesaikan selama pekan aktif berjalan (Senin s.d. Minggu).</li>
          <li><strong>Poin Bulanan:</strong> Akumulasi seluruh tantangan harian dalam satu siklus bulan kalender.</li>
          <li><strong>Gelar Kehormatan:</strong> Gelar militer <em>Panglima Taktis Tertinggi</em> (#1), <em>Komandan Tempur Utama</em> (#2), dan <em>Perwira Operasi Strategis</em> (#3) disematkan otomatis pada profil penerima.</li>
          <li><strong>Verifikasi Anggota Menwa:</strong> Anggota aktif dapat mengajukan verifikasi NBP di profil untuk mendapatkan lencana centang biru dan bersaing di kategori khusus Satuan Menwa UNJ.</li>
        </ul>
      </div>
    </div>
  );
}
