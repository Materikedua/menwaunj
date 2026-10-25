import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Flame, 
  Vote, 
  RefreshCw, 
  Users, 
  Search, 
  Plus, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  X,
  Lock,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { 
  getGeranatTeams, 
  saveGeranatTeam, 
  submitGeranatVote,
  subscribeToGeranatTeams,
  subscribeToRecentVotes
} from '../firebase.js';
import { DynamicQRISModal } from './DynamicQRISModal.jsx';
import { TacticalConfetti } from './TacticalConfetti.jsx';
import { formatRupiah } from '../lib/qris.js';
import { navigate } from '../lib/router.jsx';

// Data bibit tim paskibra resmi GERANAT 2026
const INITIAL_SEED_TEAMS = [
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

/** Komponen Odometer / Count-Up Angka Suara */
function AnimatedVoteCounter({ value }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = Number(value) || 0;
    if (start === end) return undefined;
    const diff = end - start;
    const steps = 16;
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep += 1;
      if (currentStep >= steps) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(start + (diff * currentStep) / steps));
      }
    }, 30);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue.toLocaleString('id-ID')}</span>;
}

export function GeranatVoting() {
  const { user, profile } = useAuth();
  const userEmail = user?.email?.toLowerCase();
  const isAdmin = !!(user && (userEmail === 'unjmenwa@gmail.com' || userEmail === 'rafflysyahpoetra@gmail.com'));

  const [teams, setTeams] = useState(INITIAL_SEED_TEAMS);
  const [recentVotes, setRecentVotes] = useState([]);
  const [flippedCards, setFlippedCards] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'wira' | 'madya'

  // Auto-refresh countdown (15 detik)
  const AUTO_REFRESH_SECONDS = 15;
  const [countdown, setCountdown] = useState(AUTO_REFRESH_SECONDS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Batas Waktu Resmi Voting GERANAT 2026: 08 November 2026 18:00 WIB
  const VOTING_DEADLINE_MS = new Date('2026-11-08T18:00:00+07:00').getTime();
  const [adminManualClose, setAdminManualClose] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = Math.max(0, VOTING_DEADLINE_MS - Date.now());
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      isExpired: diff <= 0
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.max(0, VOTING_DEADLINE_MS - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        isExpired: diff <= 0
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isVotingClosed = timeLeft.isExpired || adminManualClose;

  // Admin Modal State
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({
    teamName: '',
    institution: '',
    category: 'Wira Utama (SMA/SMK)',
    dantonName: '',
    motto: '',
    photoUrl: ''
  });

  // Voting & QRIS Payment Modal States
  const [confettiActive, setConfettiActive] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [voteCount, setVoteCount] = useState(1);
  const [isQRISModalOpen, setIsQRISModalOpen] = useState(false);
  const [successModalData, setSuccessModalData] = useState(null);
  const [failedModalData, setFailedModalData] = useState(null);
  const [voteSuccessBanner, setVoteSuccessBanner] = useState(null);

  // Sound Synthesizer via Web Audio API
  const playCheerSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio fallback
    }
  };

  // Muat data tim dari Firestore
  const fetchTeams = async () => {
    try {
      setIsRefreshing(true);
      const data = await getGeranatTeams();
      if (data && data.length > 0) {
        setTeams(data);
      } else {
        if (isAdmin) {
          INITIAL_SEED_TEAMS.forEach(seed => saveGeranatTeam(seed).catch(() => {}));
        }
        setTeams(INITIAL_SEED_TEAMS);
      }
    } catch (err) {
      console.warn('Gagal memuat tim:', err);
      setTeams(INITIAL_SEED_TEAMS);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Real-time onSnapshot listener untuk tim dan ticker suara masuk
  useEffect(() => {
    fetchTeams();
    const unsubTeams = subscribeToGeranatTeams((liveTeams) => {
      if (liveTeams && liveTeams.length > 0) {
        setTeams(liveTeams);
        setLoading(false);
      }
    });
    const unsubVotes = subscribeToRecentVotes((liveVotes) => {
      if (liveVotes && liveVotes.length > 0) {
        setRecentVotes(liveVotes);
      }
    }, 10);

    return () => {
      unsubTeams();
      unsubVotes();
    };
  }, [isAdmin]);

  // Timer interval 15 detik auto-refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchTeams();
          return AUTO_REFRESH_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filter & Urutkan Tim berdasarkan perolehan suara terbanyak
  const sortedTeams = useMemo(() => {
    let list = [...teams];

    if (categoryFilter === 'wira') {
      list = list.filter(t => t.category?.toLowerCase().includes('wira'));
    } else if (categoryFilter === 'madya') {
      list = list.filter(t => t.category?.toLowerCase().includes('madya'));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        t.teamName.toLowerCase().includes(q) ||
        t.institution.toLowerCase().includes(q) ||
        (t.dantonName && t.dantonName.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0));
  }, [teams, categoryFilter, searchQuery]);

  const totalAllVotes = teams.reduce((acc, t) => acc + (t.votesCount || 0), 0);

  // Buka Modal Pembayaran QRIS Statis
  const handleInitiateVote = (team, count = 1) => {
    if (isVotingClosed) return;
    setSelectedTeam(team);
    setVoteCount(count);
    setIsQRISModalOpen(true);
  };

  // Callback saat pembayaran QRIS berhasil (Stage 1 -> Stage 4)
  const handlePaymentSuccess = async (receipt) => {
    if (!selectedTeam) return;

    const prevVotes = selectedTeam.votesCount || 0;
    const newTotalVotes = prevVotes + voteCount;

    try {
      await submitGeranatVote(
        selectedTeam.teamId,
        user?.uid || 'guest-voter',
        profile?.displayName || user?.displayName || 'Pendukung Setia',
        voteCount,
        voteCount * 1000,
        receipt?.txId || `VOTE-${Date.now()}`
      );

      // Perbarui state lokal secara instan
      setTeams(prev => prev.map(t => {
        if (t.teamId === selectedTeam.teamId) {
          return { ...t, votesCount: newTotalVotes };
        }
        return t;
      }));

      playCheerSound();
      setConfettiActive(true);
      
      // Buka popup notifikasi "Pembayaran Berhasil! 🎉" dengan animasi count-up
      setSuccessModalData({
        teamName: selectedTeam.teamName,
        institution: selectedTeam.institution,
        votesCount: voteCount,
        previousTotal: prevVotes,
        newTotal: newTotalVotes,
        amount: voteCount * 1000,
        txId: receipt?.txId || `TX-${Date.now().toString(36).toUpperCase()}`
      });

      setVoteSuccessBanner(`Terima kasih! ${voteCount} suara (${formatRupiah(voteCount * 1000)}) berhasil ditambahkan untuk ${selectedTeam.teamName}!`);
      setTimeout(() => setVoteSuccessBanner(null), 6000);
    } catch (err) {
      console.warn('Gagal rekam suara:', err);
    }
  };

  // Callback saat countdown 15 menit habis (Timeout — TIDAK menambah suara)
  const handlePaymentFailed = (failInfo) => {
    setFailedModalData({
      teamName: selectedTeam?.teamName || 'Tim Kontingen',
      txId: failInfo?.txId || '',
      message: failInfo?.message || 'Pembayaran Gagal — Waktu habis. Silakan ulangi voting.'
    });
  };

  // Tambah Tim Baru oleh Admin
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeam.teamName || !newTeam.institution) return;

    try {
      const payload = {
        ...newTeam,
        teamId: `TEAM-${Date.now().toString(36).toUpperCase()}`,
        votesCount: 0
      };
      await saveGeranatTeam(payload);
      setTeams(prev => [...prev, payload]);
      setAdminModalOpen(false);
      setNewTeam({
        teamName: '',
        institution: '',
        category: 'Wira Utama (SMA/SMK)',
        dantonName: '',
        motto: '',
        photoUrl: ''
      });
    } catch (err) {
      console.warn('Gagal menambah tim:', err);
    }
  };

  const toggleFlipCard = (teamId) => {
    setFlippedCards(prev => ({ ...prev, [teamId]: !prev[teamId] }));
  };

  const progressPercent = Math.round(((AUTO_REFRESH_SECONDS - countdown) / AUTO_REFRESH_SECONDS) * 100);

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 font-sans pb-36 relative selection:bg-[#006569] selection:text-[#FFDD00]">
      
      {/* Particle Effect Triggered on Vote Success */}
      <TacticalConfetti trigger={confettiActive} onComplete={() => setConfettiActive(false)} />

      {/* Floating Exit Button to Podium GERANAT */}
      <button
        type="button"
        onClick={() => navigate('/geranat')}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs sm:text-sm px-5 py-3 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.6)] border-2 border-[#FFDD00]/40 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
        title="Kembali ke Podium Utama GERANAT"
      >
        <ArrowLeft size={16} />
        <span>Kembali ke Podium GERANAT</span>
      </button>

      {/* Hero Header E-Voting */}
      <header className="relative overflow-hidden bg-gradient-to-b from-[#00383b] via-slate-900 to-slate-950 border-b border-white/10 pt-10 pb-12 px-4 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Top Bar: Navigasi + Status Refresh 15 Detik */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <button
              type="button"
              onClick={() => navigate('/geranat')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/10 w-fit cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>🏆 Lihat Podium 3 Besar GERANAT</span>
            </button>

            {/* Countdown Auto-Refresh 15 Detik */}
            <div className="flex items-center gap-3">
              <div className="bg-slate-900/90 border border-teal-500/30 px-3.5 py-1.5 rounded-full flex items-center gap-2.5 shadow-md">
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <svg className="w-5 h-5 transform -rotate-90">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" className="text-slate-700" fill="transparent" />
                    <circle 
                      cx="10" 
                      cy="10" 
                      r="8" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      className="text-[#FFDD00]" 
                      fill="transparent" 
                      strokeDasharray={50} 
                      strokeDashoffset={50 - (50 * progressPercent) / 100}
                    />
                  </svg>
                  <span className="absolute text-[8px] font-mono font-bold text-white">
                    {countdown}
                  </span>
                </div>
                <span className="text-xs text-slate-300 font-medium">
                  {isRefreshing ? 'Memperbarui...' : `Auto-refresh: ${countdown}s`}
                </span>
                <button
                  onClick={fetchTeams}
                  disabled={isRefreshing}
                  className="text-slate-400 hover:text-white transition"
                  title="Segarkan Sekarang"
                >
                  <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-[#FFDD00]' : ''} />
                </button>
              </div>

              {/* Tombol Admin Tambah Tim & Toggle Kunci Voting */}
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdminManualClose(prev => !prev)}
                    className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition border border-slate-700 flex items-center gap-1.5"
                    title="Simulasikan Penutupan Voting"
                  >
                    {isVotingClosed ? <Lock size={12} className="text-red-400" /> : <Clock size={12} className="text-emerald-400" />}
                    <span>Admin: {isVotingClosed ? 'Buka Kunci' : 'Kunci Voting'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-full bg-[#FFDD00] text-slate-950 font-black text-xs uppercase tracking-wider transition hover:bg-amber-400 shadow-md flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Tambah Tim
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Live Voting Ticker */}
          {recentVotes.length > 0 && (
            <div className="mb-6 rounded-2xl bg-slate-900/80 border border-teal-500/30 px-4 py-2.5 flex items-center gap-3 overflow-hidden">
              <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#FFDD00] text-slate-950 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                <Flame size={11} className="fill-slate-950" /> LIVE
              </span>
              <div className="flex-1 overflow-x-auto no-scrollbar whitespace-nowrap text-xs text-slate-300 flex items-center gap-6">
                {recentVotes.map((v, i) => {
                  const tName = teams.find(t => t.teamId === v.teamId)?.teamName || v.teamName || 'Tim Kontingen';
                  return (
                    <span key={v.id || i} className="inline-flex items-center gap-1.5">
                      <span className="text-[#FFDD00] font-bold">🔥 Baru saja:</span>
                      <strong className="text-white">{v.voterName || 'Pendukung'}</strong>
                      <span>mendukung</span>
                      <strong className="text-teal-300">{tName}</strong>
                      <span className="text-emerald-400 font-mono font-bold">(+{v.votes || 1} suara)</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Judul E-Voting GERANAT */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFDD00] text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg">
              <Vote size={15} />
              <span>Pilih & Dukung Kontingen • QRIS Statis (Batas 15 Menit)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Daftar Kontingen E-Voting GERANAT
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Pilih tim paskibra favoritmu di bawah ini! Setiap <strong>1 dukungan suara = Rp1.000</strong> via QRIS Statis Resmi Mako dengan deteksi pembayaran otomatis.
            </p>

            {/* Total Suara Masuk */}
            <div className="pt-2 flex items-center justify-center gap-6 text-xs text-slate-400 font-mono">
              <span>Total Suara Terhimpun: <strong className="text-[#FFDD00] text-sm"><AnimatedVoteCounter value={totalAllVotes} /> Suara</strong></span>
              <span>•</span>
              <span>Total Dana: <strong className="text-emerald-400 text-sm">{formatRupiah(totalAllVotes * 1000)}</strong></span>
            </div>

            {/* Countdown Batas Waktu Voting Otomatis */}
            {isVotingClosed ? (
              <div className="mt-4 p-4 bg-amber-500/10 border-2 border-[#FFDD00] rounded-2xl max-w-xl mx-auto flex items-center justify-center gap-3 text-[#FFDD00] font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl animate-fade-in">
                <Lock size={18} className="shrink-0" />
                <span>Voting Resmi Ditutup • Podium Juara Terfavorit Terkunci</span>
              </div>
            ) : (
              <div className="mt-4 max-w-md mx-auto bg-slate-900/90 border border-teal-500/40 rounded-2xl p-3 sm:p-4 shadow-lg">
                <div className="text-[10px] uppercase font-black tracking-widest text-[#FFDD00] mb-2 flex items-center justify-center gap-1.5">
                  <Clock size={13} /> Penutupan Voting GERANAT 2026 Dalam
                </div>
                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <span className="text-lg sm:text-2xl font-black text-white block">{timeLeft.days}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-sans">Hari</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <span className="text-lg sm:text-2xl font-black text-white block">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-sans">Jam</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <span className="text-lg sm:text-2xl font-black text-white block">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-sans">Menit</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <span className="text-lg sm:text-2xl font-black text-[#FFDD00] block">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-sans">Detik</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Banner Notifikasi Vote Berhasil */}
          {voteSuccessBanner && (
            <div className="mt-6 max-w-2xl mx-auto p-4 bg-emerald-950/90 border-2 border-emerald-500 rounded-2xl text-emerald-200 text-sm font-bold flex items-center gap-3 shadow-2xl animate-fade-in">
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
              <span>{voteSuccessBanner}</span>
            </div>
          )}
        </div>
      </header>

      {/* Konten Utama: Daftar Kartu Tim dengan 3D Flip & Odometer Count-Up */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {/* Filter & Kontrol Pencarian */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-white/10">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                categoryFilter === 'all' ? 'bg-[#006569] text-[#FFDD00]' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua Kategori ({teams.length})
            </button>
            <button
              onClick={() => setCategoryFilter('wira')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                categoryFilter === 'wira' ? 'bg-[#006569] text-[#FFDD00]' : 'text-slate-400 hover:text-white'
              }`}
            >
              Wira Utama (SMA/SMK)
            </button>
            <button
              onClick={() => setCategoryFilter('madya')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                categoryFilter === 'madya' ? 'bg-[#006569] text-[#FFDD00]' : 'text-slate-400 hover:text-white'
              }`}
            >
              Madya (SMP/MTs)
            </button>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama tim atau sekolah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 text-xs bg-slate-950 border border-white/15 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#FFDD00] w-64"
            />
          </div>
        </div>

        {/* Daftar Seluruh Tim Kontingen GERANAT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedTeams.map((team, idx) => {
            const rank = idx + 1;
            const voteShare = totalAllVotes > 0 ? Math.round((team.votesCount / totalAllVotes) * 100) : 0;
            const isFlipped = !!flippedCards[team.teamId];

            return (
              <div 
                key={team.teamId}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-teal-500/50 transition-all shadow-xl group"
              >
                {!isFlipped ? (
                  <div>
                    {/* Sisi Depan Kartu: Foto Pasukan + Odometer Suara */}
                    <div className="w-full h-52 sm:h-60 rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/80 mb-4 group-hover:border-[#FFDD00]/60 transition shadow-inner relative">
                      <img 
                        src={team.photoUrl || 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80'} 
                        alt={`Foto Pasukan Paskibra ${team.teamName}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      
                      {/* Badge Kategori & Peringkat di Atas Foto */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#00383b] bg-[#FFDD00] px-3 py-1 rounded-full shadow-md font-sans">
                          {team.category}
                        </span>
                      </div>

                      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full font-mono font-black text-xs shadow-lg flex items-center gap-1 ${
                        rank === 1 ? 'bg-[#FFDD00] text-slate-950' : rank === 2 ? 'bg-[#C0C0C0] text-slate-950' : rank === 3 ? 'bg-[#CD7F32] text-white' : 'bg-slate-900/90 text-slate-300 border border-slate-700'
                      }`}>
                        <span>#{rank}</span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl flex items-center justify-between border border-white/10">
                        <button
                          type="button"
                          onClick={() => toggleFlipCard(team.teamId)}
                          className="text-[11px] text-teal-300 hover:text-[#FFDD00] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCw size={12} /> Detail Pasukan
                        </button>
                        <span className="text-xs font-mono font-black text-[#FFDD00]">
                          <AnimatedVoteCounter value={team.votesCount || 0} /> Suara
                        </span>
                      </div>
                    </div>

                    {/* Header & Identitas Tim */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h4 className="font-black text-white text-lg group-hover:text-[#FFDD00] transition-colors leading-tight">
                          {team.teamName}
                        </h4>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                          {team.institution}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs text-teal-400 font-mono font-bold block">
                          {voteShare}%
                        </span>
                        <span className="text-[9px] text-slate-500 uppercase block">
                          pangsa suara
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Persentase Suara */}
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden mb-4">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-500 via-[#006569] to-[#FFDD00] rounded-full transition-all duration-500" 
                        style={{ width: `${voteShare}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  /* Sisi Belakang Kartu (Interactive 3D Flip Info) */
                  <div className="bg-slate-950 border border-teal-500/40 rounded-2xl p-5 mb-4 space-y-4 min-h-[260px] flex flex-col justify-between animate-fade-in">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFDD00] font-bold">
                          Profil Resmi Kontingen #{rank}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleFlipCard(team.teamId)}
                          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
                        >
                          <RotateCw size={12} /> Kembali ke Foto
                        </button>
                      </div>
                      <h4 className="font-black text-lg text-white">{team.teamName}</h4>
                      <p className="text-xs text-teal-400 font-bold">{team.institution}</p>

                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex justify-between py-1.5 border-b border-slate-900">
                          <span className="text-slate-400">Komandan Pleton (Danton):</span>
                          <strong className="text-white">{team.dantonName || 'Terdaftar di Mako'}</strong>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-900">
                          <span className="text-slate-400">Kategori Lomba:</span>
                          <strong className="text-amber-300">{team.category}</strong>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-900">
                          <span className="text-slate-400">Total Suara Masuk:</span>
                          <strong className="text-[#FFDD00] font-mono">{(team.votesCount || 0).toLocaleString('id-ID')} Suara</strong>
                        </div>
                      </div>
                      {team.motto && (
                        <p className="mt-3 text-xs italic text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                          "{team.motto}"
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Tombol Beri Suara */}
                {isVotingClosed ? (
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 px-3 bg-slate-900 border border-slate-800 text-slate-500 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed"
                    >
                      <Lock size={12} className="text-slate-500" />
                      <span>Voting Resmi Ditutup</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => handleInitiateVote(team, 1)}
                      className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition text-center cursor-pointer"
                    >
                      1 Suara (1k)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInitiateVote(team, 5)}
                      className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition text-center cursor-pointer"
                    >
                      5 Suara (5k)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInitiateVote(team, 10)}
                      className="py-2.5 px-2 bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider rounded-xl transition text-center shadow-md flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Vote size={13} /> 10 Suara
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal QRIS Statis + Countdown 15 Menit + Deteksi Pembayaran Otomatis */}
      {selectedTeam && (
        <DynamicQRISModal
          isOpen={isQRISModalOpen}
          onClose={() => setIsQRISModalOpen(false)}
          amount={voteCount * 1000}
          votes={voteCount}
          teamId={selectedTeam.teamId}
          teamName={selectedTeam.teamName}
          voterUid={user?.uid || 'anonymous'}
          voterName={profile?.displayName || user?.displayName || 'Pendukung Setia'}
          title={`E-Voting: ${selectedTeam.teamName}`}
          description={`${voteCount} Suara Dukungan Kontingen GERANAT 2026`}
          invoiceId={`VOTE-${selectedTeam.teamId}-${Date.now().toString(36).toUpperCase()}`}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailed={handlePaymentFailed}
        />
      )}

      {/* Popup "Pembayaran Berhasil! 🎉" dengan Animasi Count-Up Real-Time (Bagian 1.C) */}
      {successModalData && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 border border-slate-200 text-center">
            
            <button
              type="button"
              onClick={() => setSuccessModalData(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Tutup Notifikasi"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3.5 shadow-sm scale-110 transition-transform">
              <CheckCircle2 size={38} />
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block mb-2">
              Terverifikasi Otomatis • {successModalData.txId}
            </span>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Pembayaran Berhasil! 🎉
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Transfer sebesar <strong className="text-emerald-700 font-bold">{formatRupiah(successModalData.amount)}</strong> terdeteksi. Sebanyak <strong className="text-[#006569] font-black">+{successModalData.votesCount} Suara</strong> langsung ditambahkan secara real-time!
            </p>

            <div className="my-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
              <div className="font-black text-slate-900 text-base">
                {successModalData.teamName}
              </div>
              <div className="text-xs text-slate-500 font-semibold">
                {successModalData.institution}
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-center gap-2 font-mono text-lg font-black text-[#006569]">
                <Vote size={18} />
                <AnimatedVoteCounter value={successModalData.newTotal} />
                <span className="text-xs font-sans font-bold text-emerald-600">
                  (+{successModalData.votesCount} Suara)
                </span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSuccessModalData(null);
                  navigate('/geranat');
                }}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                🏆 Lihat Podium
              </button>
              <button
                type="button"
                onClick={() => setSuccessModalData(null)}
                className="flex-1 py-3 px-4 bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup "Pembayaran Gagal — Waktu habis" saat Countdown 15 Menit Mencapai 0:00 (Bagian 1.B) */}
      {failedModalData && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 border border-rose-200 text-center">
            <button
              type="button"
              onClick={() => setFailedModalData(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3.5">
              <AlertTriangle size={36} />
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full inline-block mb-2">
              Timeout 15:00 Menit • Status: Batal
            </span>

            <h3 className="text-xl font-black text-slate-900">
              {failedModalData.message}
            </h3>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Batas waktu pembayaran 15 menit untuk <strong>{failedModalData.teamName}</strong> telah berakhir dan transaksi otomatis dibatalkan tanpa penambahan suara.
            </p>

            <button
              type="button"
              onClick={() => setFailedModalData(null)}
              className="mt-5 w-full py-3.5 px-5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer"
            >
              Tutup & Ulangi Voting
            </button>
          </div>
        </div>
      )}

      {/* Modal Admin Mako: Tambah Tim Baru */}
      {adminModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in font-sans">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FFDD00] text-slate-950 flex items-center justify-center font-bold">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Tambah Tim Kontingen GERANAT
                  </h3>
                  <span className="text-[10px] text-teal-400 font-mono">
                    Khusus Admin: {userEmail}
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setAdminModalOpen(false)} 
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nama Tim / Pasukan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pasukan Satria Jayakarta"
                  value={newTeam.teamName}
                  onChange={(e) => setNewTeam({ ...newTeam, teamName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#FFDD00]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Asal Sekolah / Instansi *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SMA Negeri 1 Jakarta"
                  value={newTeam.institution}
                  onChange={(e) => setNewTeam({ ...newTeam, institution: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#FFDD00]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Kategori Perlombaan</label>
                <select
                  value={newTeam.category}
                  onChange={(e) => setNewTeam({ ...newTeam, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#FFDD00]"
                >
                  <option value="Wira Utama (SMA/SMK)">Wira Utama (SMA/SMK/MA)</option>
                  <option value="Madya (SMP/MTs)">Madya (SMP/MTs)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Nama Komandan Pleton (Danton)</label>
                <input
                  type="text"
                  placeholder="Nama Danton"
                  value={newTeam.dantonName}
                  onChange={(e) => setNewTeam({ ...newTeam, dantonName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#FFDD00]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Motto Pasukan</label>
                <input
                  type="text"
                  placeholder="Motto tim"
                  value={newTeam.motto}
                  onChange={(e) => setNewTeam({ ...newTeam, motto: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#FFDD00]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">URL Foto Pasukan Paskibra</label>
                <input
                  type="url"
                  placeholder="URL Foto Pasukan Paskibra (https://...)"
                  value={newTeam.photoUrl}
                  onChange={(e) => setNewTeam({ ...newTeam, photoUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#FFDD00]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#FFDD00] hover:bg-amber-400 text-slate-950 font-black rounded-xl uppercase tracking-wider transition shadow-md"
                >
                  Simpan Tim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
export default GeranatVoting;
