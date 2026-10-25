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
  Unlock,
  AlertTriangle,
  RotateCw,
  Heart,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Send,
  Trash2,
  Share2,
  Calendar,
  Layers,
  Check
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { 
  getGeranatTeams, 
  saveGeranatTeam, 
  deleteGeranatTeam,
  submitGeranatVote,
  subscribeToGeranatTeams,
  subscribeToRecentVotes,
  subscribeToCharityVotingConfig,
  setCharityVotingConfig,
  resetCharityVotingData,
  resetGamificationLeaderboard
} from '../firebase.js';
import { DynamicQRISModal } from './DynamicQRISModal.jsx';
import { TacticalConfetti } from './TacticalConfetti.jsx';
import { formatRupiah } from '../lib/qris.js';
import { navigate } from '../lib/router.jsx';

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
  const isSuperAdmin = !!(user && (userEmail === 'unjmenwa@gmail.com' || userEmail === 'rafflysyahpoetra@gmail.com'));

  // Konfigurasi Charity Voting dari Firestore
  const [votingConfig, setVotingConfig] = useState({
    isVotingOpen: false, // Default Mode Siaga
    programName: 'Charity Vote: Beasiswa Menwa & Bantuan Kemanusiaan',
    headline: 'Pintu Donasi Charity Vote Sedang Disiapkan',
    subheadline: 'Dukungan untuk Beasiswa Taruna Menwa, Bantuan Logistik Bencana Kemanusiaan, & Aksi Cepat Karhutla',
    scheduledOpenAt: '2026-11-01T08:00:00+07:00',
    targetGoalAmount: 25000000,
    pricePerVote: 1000
  });

  const [teams, setTeams] = useState([]);
  const [recentVotes, setRecentVotes] = useState([]);
  const [flippedCards, setFlippedCards] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Auto-refresh countdown (15 detik)
  const AUTO_REFRESH_SECONDS = 15;
  const [countdown, setCountdown] = useState(AUTO_REFRESH_SECONDS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Standby Countdown Timer
  const [standbyTimeLeft, setStandbyTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Modal & Form States
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({
    teamName: '',
    institution: '',
    category: 'Beasiswa Menwa',
    dantonName: '',
    motto: '',
    photoUrl: '',
    targetDonation: 5000000
  });

  // Voting & QRIS Payment Modal States
  const [confettiActive, setConfettiActive] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [voteCount, setVoteCount] = useState(1);
  const [isQRISModalOpen, setIsQRISModalOpen] = useState(false);
  const [successModalData, setSuccessModalData] = useState(null);
  const [failedModalData, setFailedModalData] = useState(null);
  const [bannerMessage, setBannerMessage] = useState(null);

  // Interactive Standby Mode "Ingatkan Saya"
  const [reminderEmail, setReminderEmail] = useState('');
  const [reminderSent, setReminderSent] = useState(false);

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

  // Muat data tim dari Firestore (tanpa auto-seed dummy jika kosong)
  const fetchTeams = async () => {
    try {
      setIsRefreshing(true);
      const data = await getGeranatTeams();
      setTeams(data || []);
    } catch (err) {
      console.warn('Gagal memuat tim/penerima charity:', err);
      setTeams([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Subscribe ke konfigurasi charity voting & data tim
  useEffect(() => {
    fetchTeams();

    const unsubConfig = subscribeToCharityVotingConfig((liveConfig) => {
      if (liveConfig) {
        setVotingConfig(liveConfig);
      }
    });

    const unsubTeams = subscribeToGeranatTeams((liveTeams) => {
      setTeams(liveTeams || []);
      setLoading(false);
    });

    const unsubVotes = subscribeToRecentVotes((liveVotes) => {
      setRecentVotes(liveVotes || []);
    }, 10);

    return () => {
      unsubConfig();
      unsubTeams();
      unsubVotes();
    };
  }, []);

  // Countdown timer untuk Standby Mode
  useEffect(() => {
    const targetMs = new Date(votingConfig.scheduledOpenAt || '2026-11-01T08:00:00+07:00').getTime();
    const updateCountdown = () => {
      const diff = Math.max(0, targetMs - Date.now());
      setStandbyTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [votingConfig.scheduledOpenAt]);

  // Interval auto-refresh 15 detik untuk leaderboard live
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

  // Toggle Pintu Voting oleh Super Admin
  const handleToggleVotingStatus = async () => {
    if (!isSuperAdmin) return;
    const newStatus = !votingConfig.isVotingOpen;
    try {
      await setCharityVotingConfig({ isVotingOpen: newStatus });
      setBannerMessage(newStatus 
        ? 'Pintu Charity Vote BERHASIL DIBUKA untuk umum! Publik sekarang dapat berdonasi.' 
        : 'Pintu Charity Vote BERHASIL DITUTUP (Kembali ke Mode Siaga).');
      setTimeout(() => setBannerMessage(null), 5000);
    } catch (err) {
      console.warn('Gagal toggle status voting:', err);
    }
  };

  // Reset Bersih Data Tim & Suara oleh Super Admin
  const handleResetVotingData = async () => {
    if (!isSuperAdmin) return;
    const confirmed = window.confirm('Peringatan Komando: Apakah Anda yakin ingin MENGHAPUS SEMUA DATA TIM/PENERIMA di Charity Vote? Tindakan ini tidak dapat dibatalkan.');
    if (!confirmed) return;
    try {
      await resetCharityVotingData();
      setTeams([]);
      setBannerMessage('Semua data tim & perolehan suara di Charity Vote telah BERHASIL DIHAPUS.');
      setTimeout(() => setBannerMessage(null), 5000);
    } catch (err) {
      alert('Gagal membersihkan data tim: ' + (err?.message || err));
    }
  };

  // Reset Bersih Gamifikasi Skor oleh Super Admin
  const handleResetGamification = async () => {
    if (!isSuperAdmin) return;
    const confirmed = window.confirm('Peringatan Komando: Apakah Anda yakin ingin MERESET SEMUA SKOR GAMIFIKASI (EXP Taktis & Streak) seluruh pengguna menjadi 0?');
    if (!confirmed) return;
    try {
      await resetGamificationLeaderboard();
      setBannerMessage('Seluruh skor gamifikasi pengguna telah BERHASIL DIRESET ke 0.');
      setTimeout(() => setBannerMessage(null), 5000);
    } catch (err) {
      alert('Gagal mereset skor gamifikasi: ' + (err?.message || err));
    }
  };

  // Hapus satu tim oleh Super Admin
  const handleDeleteTeam = async (teamId, teamName) => {
    if (!isSuperAdmin) return;
    const confirmed = window.confirm(`Hapus penerima "${teamName}"?`);
    if (!confirmed) return;
    try {
      await deleteGeranatTeam(teamId);
      setTeams(prev => prev.filter(t => t.teamId !== teamId && t.id !== teamId));
    } catch (err) {
      console.warn('Gagal menghapus tim:', err);
    }
  };

  // Filter & Urutkan Tim
  const sortedTeams = useMemo(() => {
    let list = [...teams];

    if (categoryFilter !== 'all') {
      list = list.filter(t => (t.category || '').toLowerCase().includes(categoryFilter.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        (t.teamName || '').toLowerCase().includes(q) ||
        (t.institution || '').toLowerCase().includes(q) ||
        (t.dantonName && t.dantonName.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0));
  }, [teams, categoryFilter, searchQuery]);

  const totalAllVotes = teams.reduce((acc, t) => acc + (t.votesCount || 0), 0);
  const totalDanaTerkumpul = totalAllVotes * 1000;

  // Buka Modal Pembayaran QRIS Statis
  const handleInitiateVote = (team, count = 1) => {
    if (!votingConfig.isVotingOpen) {
      alert('Charity Vote saat ini berada dalam Mode Siaga (tertutup sementara). Tunggu pengumuman resmi pembukaan!');
      return;
    }
    setSelectedTeam(team);
    setVoteCount(count);
    setIsQRISModalOpen(true);
  };

  // Callback saat pembayaran QRIS berhasil
  const handlePaymentSuccess = async (receipt) => {
    if (!selectedTeam) return;

    const prevVotes = selectedTeam.votesCount || 0;
    const newTotalVotes = prevVotes + voteCount;

    try {
      await submitGeranatVote(
        selectedTeam.teamId || selectedTeam.id,
        user?.uid || 'guest-donor',
        profile?.displayName || user?.displayName || 'Donatur Kemanusiaan',
        voteCount,
        voteCount * 1000,
        receipt?.txId || `VOTE-${Date.now()}`
      );

      setTeams(prev => prev.map(t => {
        if (t.teamId === selectedTeam.teamId || t.id === selectedTeam.teamId) {
          return { ...t, votesCount: newTotalVotes };
        }
        return t;
      }));

      playCheerSound();
      setConfettiActive(true);
      
      setSuccessModalData({
        teamName: selectedTeam.teamName,
        institution: selectedTeam.institution,
        votesCount: voteCount,
        previousTotal: prevVotes,
        newTotal: newTotalVotes,
        amount: voteCount * 1000,
        txId: receipt?.txId || `TX-${Date.now().toString(36).toUpperCase()}`
      });

      setBannerMessage(`Terima kasih! Donasi sebesar ${formatRupiah(voteCount * 1000)} (${voteCount} suara) berhasil dialokasikan untuk ${selectedTeam.teamName}!`);
      setTimeout(() => setBannerMessage(null), 6000);
    } catch (err) {
      console.warn('Gagal rekam suara:', err);
    }
  };

  // Tambah Tim / Penerima Baru oleh Admin
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeam.teamName || !newTeam.institution) return;

    try {
      const payload = {
        ...newTeam,
        teamId: `TEAM-${Date.now().toString(36).toUpperCase()}`,
        votesCount: 0,
        totalAmountReceived: 0,
        createdAt: new Date().toISOString()
      };
      await saveGeranatTeam(payload);
      setTeams(prev => [...prev, payload]);
      setAdminModalOpen(false);
      setNewTeam({
        teamName: '',
        institution: '',
        category: 'Beasiswa Menwa',
        dantonName: '',
        motto: '',
        photoUrl: '',
        targetDonation: 5000000
      });
      setBannerMessage(`Berhasil menambahkan penerima baru "${payload.teamName}".`);
      setTimeout(() => setBannerMessage(null), 4000);
    } catch (err) {
      console.warn('Gagal menambah tim:', err);
    }
  };

  const toggleFlipCard = (teamId) => {
    setFlippedCards(prev => ({ ...prev, [teamId]: !prev[teamId] }));
  };

  const progressPercent = Math.round(((AUTO_REFRESH_SECONDS - countdown) / AUTO_REFRESH_SECONDS) * 100);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans pb-36 relative selection:bg-[#006569] selection:text-[#FFDD00]">
      
      {/* Particle Effect Triggered on Donation Success */}
      <TacticalConfetti trigger={confettiActive} onComplete={() => setConfettiActive(false)} />

      {/* Floating Exit Button to Podium */}
      <button
        type="button"
        onClick={() => navigate('/geranat')}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs sm:text-sm px-5 py-3 rounded-full shadow-[0_10px_30px_rgba(0,101,105,0.4)] border-2 border-[#FFDD00]/50 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
        title="Kembali ke Podium Charity"
      >
        <Trophy size={16} />
        <span>Podium Donasi Terbanyak</span>
      </button>

      {/* SUPER ADMIN COMMAND CONTROL BAR */}
      {isSuperAdmin && (
        <aside aria-label="Panel Komando Super Admin" className="bg-gradient-to-r from-slate-900 via-[#004d50] to-slate-900 text-white px-4 py-3 border-b-2 border-[#FFDD00] sticky top-0 z-40 shadow-lg">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFDD00] animate-ping" />
              <span className="font-mono uppercase font-black tracking-widest text-[#FFDD00]">
                KOMANDO SUPER ADMIN
              </span>
              <span className="hidden sm:inline text-slate-300">({userEmail})</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${votingConfig.isVotingOpen ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>
                {votingConfig.isVotingOpen ? 'STATUS: DIBUKA' : 'STATUS: MODE SIAGA (TERTUTUP)'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleToggleVotingStatus}
                className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
                  votingConfig.isVotingOpen 
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950' 
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                {votingConfig.isVotingOpen ? <Lock size={13} /> : <Unlock size={13} />}
                <span>{votingConfig.isVotingOpen ? 'Tutup ke Mode Siaga' : 'Buka Charity Vote Sekarang'}</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-[#006569] hover:bg-[#005255] text-[#FFDD00] border border-[#FFDD00]/30 font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Plus size={13} />
                <span>+ Penerima Baru</span>
              </button>

              <button
                type="button"
                onClick={handleResetVotingData}
                className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-500/40 font-bold flex items-center gap-1 transition cursor-pointer"
                title="Hapus semua tim & data voting"
              >
                <Trash2 size={13} />
                <span>Bersihkan Data Tim</span>
              </button>

              <button
                type="button"
                onClick={handleResetGamification}
                className="px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/40 font-bold flex items-center gap-1 transition cursor-pointer"
                title="Reset semua skor gamifikasi pengguna ke 0"
              >
                <Flame size={13} />
                <span>Reset Skor Gamifikasi</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* BANNER NOTIFIKASI SEMENTARA */}
      {bannerMessage && (
        <aside aria-label="Notifikasi Sistem" className="bg-emerald-600 text-white px-4 py-3 text-center text-xs font-bold shadow-md animate-fade-in flex items-center justify-center gap-2">
          <CheckCircle2 size={16} />
          <span>{bannerMessage}</span>
          <button type="button" onClick={() => setBannerMessage(null)} className="ml-2 hover:opacity-80">
            <X size={14} />
          </button>
        </aside>
      )}

      {/* HEADER HERO (Palet Ceria Desain Google + Hijau Menwa) */}
      <header className="relative overflow-hidden bg-gradient-to-b from-[#e8f5f1] via-sky-50/40 to-slate-50 border-b border-slate-200/80 pt-10 pb-12 px-4 sm:px-6">
        {/* Dekorasi Aksen Lingkaran Warna Google */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#4285F4]/10 blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-0 w-80 h-80 rounded-full bg-[#34A853]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 rounded-full bg-[#FBBC05]/15 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Top Bar: Navigasi + Status Refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <button
              type="button"
              onClick={() => navigate('/geranat')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition border border-slate-200 shadow-sm w-fit cursor-pointer"
            >
              <ArrowLeft size={16} className="text-[#006569]" />
              <span>🏆 Lihat Klasemen Podium Charity</span>
            </button>

            {/* Indikator Auto-Refresh 15 Detik */}
            <div className="flex items-center gap-3">
              <div className="bg-white border border-slate-200 px-3.5 py-1.5 rounded-full flex items-center gap-2.5 shadow-sm">
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <svg className="w-5 h-5 transform -rotate-90">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" className="text-slate-200" fill="transparent" />
                    <circle 
                      cx="10" 
                      cy="10" 
                      r="8" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      className="text-[#34A853]" 
                      fill="transparent" 
                      strokeDasharray={50} 
                      strokeDashoffset={50 - (50 * progressPercent) / 100}
                    />
                  </svg>
                  <span className="absolute text-[8px] font-mono font-bold text-slate-700">
                    {countdown}
                  </span>
                </div>
                <span className="text-xs text-slate-600 font-medium">
                  {isRefreshing ? 'Memperbarui...' : `Live Sync: ${countdown}s`}
                </span>
                <button
                  onClick={fetchTeams}
                  disabled={isRefreshing}
                  className="text-slate-400 hover:text-[#006569] transition cursor-pointer"
                  title="Segarkan Sekarang"
                >
                  <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-[#006569]' : ''} />
                </button>
              </div>

              {/* Status Badge */}
              <div className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border shadow-sm ${
                votingConfig.isVotingOpen 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${votingConfig.isVotingOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>{votingConfig.isVotingOpen ? 'Sesi Dibuka' : 'Mode Siaga'}</span>
              </div>
            </div>
          </div>

          {/* Judul & Hero Utama */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            
            {/* Tagline Badge dengan 4 Aksen Google */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
              <span className="text-[#006569]">Charity Vote Resimen Mahasiswa UNJ</span>
              <span className="text-slate-300">•</span>
              <span className="text-[#EA4335] flex items-center gap-1">
                <Heart size={12} className="fill-[#EA4335]" /> Berbagi Harapan
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Charity Vote: <span className="bg-gradient-to-r from-[#006569] via-[#4285F4] to-[#34A853] bg-clip-text text-transparent">Beasiswa Menwa & Bantuan Kemanusiaan</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              Wujud nyata pengabdian Widya Castrena Dharma Siddha. Setiap 1 suara bernilai donasi Rp1.000 (QRIS Tanpa Potongan) untuk beasiswa kader bangsa, logistik pengungsian bencana, dan dukungan lapangan penanganan karhutla.
            </p>

            {/* Ringkasan Dana & Target */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-2xl mx-auto">
              <div className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-sm text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#4285F4]">Total Suara</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5">
                  <AnimatedVoteCounter value={totalAllVotes} />
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-sm text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#34A853]">Dana Terkumpul</div>
                <div className="text-xl sm:text-2xl font-black text-[#006569] font-mono mt-0.5">
                  {formatRupiah(totalDanaTerkumpul)}
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-amber-100 shadow-sm text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#FBBC05]">Target Dana</div>
                <div className="text-xl sm:text-2xl font-black text-slate-800 font-mono mt-0.5">
                  Rp25 Juta
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-sm text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#EA4335]">Nominal / Suara</div>
                <div className="text-xl sm:text-2xl font-black text-[#EA4335] font-mono mt-0.5">
                  Rp1.000
                </div>
              </div>
            </div>

          </div>

        </div>
      </header>

      {/* ========================================================
          TAMPILAN MODE SIAGA INTERAKTIF (KETIKA VOTING DITUTUP)
          ======================================================== */}
      {!votingConfig.isVotingOpen ? (
        <section aria-label="Mode Siaga Interaktif" className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-16 space-y-8 animate-fade-in">
          
          {/* Card Pengumuman Mode Siaga dengan Countdown */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border-2 border-dashed border-[#006569]/30 shadow-xl relative overflow-hidden text-center space-y-6">
            
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-[#006569] border border-amber-200 flex items-center justify-center mx-auto shadow-inner">
              <Clock size={32} className="text-[#006569]" />
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-amber-100 text-amber-900 border border-amber-300">
                Pintu Donasi Sedang Disiapkan
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Pintu Charity Vote Segera Dibuka
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Saat ini panitia dan pengurus Mako Menwa UNJ sedang melakukan finalisasi verifikasi data calon penerima beasiswa dan posko logistik kemanusiaan.
              </p>
            </div>

            {/* Countdown Box dengan 4 Warna Google */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg mx-auto pt-2">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/60 border border-blue-200 rounded-2xl p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-4xl font-black text-[#4285F4] font-mono">
                  {standbyTimeLeft.days}
                </div>
                <div className="text-[10px] sm:text-xs font-bold uppercase text-slate-600 mt-1">Hari</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100/60 border border-red-200 rounded-2xl p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-4xl font-black text-[#EA4335] font-mono">
                  {String(standbyTimeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs font-bold uppercase text-slate-600 mt-1">Jam</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/60 border border-amber-200 rounded-2xl p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-4xl font-black text-[#FBBC05] font-mono">
                  {String(standbyTimeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs font-bold uppercase text-slate-600 mt-1">Menit</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/60 border border-emerald-200 rounded-2xl p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-4xl font-black text-[#34A853] font-mono">
                  {String(standbyTimeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs font-bold uppercase text-slate-600 mt-1">Detik</div>
              </div>
            </div>

            {/* Form Pengingat Pembukaan */}
            <div className="max-w-md mx-auto pt-4">
              {reminderSent ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Terima kasih! Notifikasi pembukaan akan dikirimkan ke email Anda.</span>
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (reminderEmail.trim()) {
                      setReminderSent(true);
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="email"
                    required
                    placeholder="Masukkan email Anda untuk diingatkan..."
                    value={reminderEmail}
                    onChange={(e) => setReminderEmail(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#006569]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] text-xs font-black uppercase rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Send size={13} />
                    <span>Ingatkan Saya</span>
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* 3 PILAR MISI CHARITY VOTE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pilar 1: Beasiswa Menwa (Google Blue) */}
            <div className="bg-white rounded-3xl p-6 border-t-4 border-t-[#4285F4] border-x border-b border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#4285F4] flex items-center justify-center mb-4">
                <GraduationCap size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#4285F4] bg-blue-50 px-2.5 py-0.5 rounded-full">
                Pendidikan Bangsa
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2 mb-2">
                Menwa Scholarship
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Beasiswa pembinaan dan keringanan biaya SPP/UKT untuk mahasiswa aktif dan kader Menwa UNJ berprestasi dari latar belakang prasejahtera.
              </p>
            </div>

            {/* Pilar 2: Bantuan Logistik (Google Red) */}
            <div className="bg-white rounded-3xl p-6 border-t-4 border-t-[#EA4335] border-x border-b border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#EA4335] flex items-center justify-center mb-4">
                <Heart size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#EA4335] bg-red-50 px-2.5 py-0.5 rounded-full">
                Tanggap Darurat
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2 mb-2">
                Bantuan Logistik Bencana
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Penyediaan paket sembako, selimut, obat-obatan, dan air bersih untuk disalurkan langsung oleh personel Menwa ke titik bencana alam.
              </p>
            </div>

            {/* Pilar 3: Aksi Karhutla (Google Green) */}
            <div className="bg-white rounded-3xl p-6 border-t-4 border-t-[#34A853] border-x border-b border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#34A853] flex items-center justify-center mb-4">
                <Flame size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#34A853] bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Pelestarian Lingkungan
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2 mb-2">
                Aksi Cepat Karhutla
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dukungan peralatan respirator perlindungan kabut asap, pompa apung pemadam, dan suplai tim gabungan penanganan kebakaran hutan dan lahan.
              </p>
            </div>

          </div>

          {/* Banner Ajakan Buka untuk Super Admin */}
          {isSuperAdmin && (
            <div className="bg-gradient-to-r from-[#006569] to-[#004d50] text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-black text-base text-[#FFDD00]">
                  Siap Membuka Sesi Donasi untuk Publik?
                </h4>
                <p className="text-xs text-teal-100 mt-1">
                  Klik tombol di samping untuk mengaktifkan pemungutan suara/donasi secara real-time.
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleVotingStatus}
                className="px-6 py-3 rounded-2xl bg-[#FFDD00] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Unlock size={16} />
                <span>Buka Charity Vote Sekarang</span>
              </button>
            </div>
          )}

        </section>
      ) : (
        /* ========================================================
            TAMPILAN LIVE VOTING (KETIKA DIBUKA OLEH SUPER ADMIN)
            ======================================================== */
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8 animate-fade-in">
          
          {/* Filter & Toolbar Pencarian */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Filter Kategori */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {[
                { id: 'all', label: 'Semua Inisiatif' },
                { id: 'beasiswa', label: '🎓 Beasiswa Menwa' },
                { id: 'logistik', label: '📦 Logistik Bencana' },
                { id: 'karhutla', label: '🔥 Aksi Karhutla' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-[#006569] text-[#FFDD00] shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Input Pencarian */}
            <div className="relative w-full md:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari penerima / inisiatif..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#006569]"
              />
            </div>

          </div>

          {/* Grid Daftar Tim / Penerima Donasi */}
          {loading ? (
            <div className="text-center py-20 space-y-3">
              <RefreshCw size={28} className="animate-spin text-[#006569] mx-auto" />
              <p className="text-xs text-slate-500 font-bold">Memuat daftar penerima charity...</p>
            </div>
          ) : sortedTeams.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-200 max-w-2xl mx-auto space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Belum Ada Penerima / Tim Terdaftar
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Data lama telah dibersihkan sesuai arahan. Admin Mako dapat menambahkan calon penerima beasiswa atau posko logistik melalui tombol di bawah.
              </p>
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase rounded-xl transition shadow-md cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Tambah Penerima Baru Sekarang</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTeams.map((team, idx) => {
                const teamId = team.teamId || team.id;
                const isFlipped = flippedCards[teamId];
                const votesCount = team.votesCount || 0;
                const danaTerkumpul = votesCount * 1000;
                const targetDana = team.targetDonation || 5000000;
                const percentAchieved = Math.min(100, Math.round((danaTerkumpul / targetDana) * 100));

                return (
                  <div 
                    key={teamId}
                    className="bg-white rounded-3xl border border-slate-200 hover:border-[#4285F4]/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      {/* Foto Penerima / Inisiatif */}
                      <div className="relative h-48 bg-slate-100 overflow-hidden">
                        {team.photoUrl ? (
                          <img 
                            src={team.photoUrl} 
                            alt={team.teamName} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#006569]/10 to-[#4285F4]/10 text-slate-400">
                            <GraduationCap size={48} className="text-[#006569]/40" />
                          </div>
                        )}

                        {/* Rank Badge */}
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 font-black text-xs shadow-sm flex items-center gap-1.5 border border-slate-200">
                          <span className="text-[#FBBC05]">#{idx + 1}</span>
                          <span className="text-[10px] text-slate-500 uppercase font-mono">Peringkat</span>
                        </div>

                        {/* Category Pill */}
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#006569] text-[#FFDD00] font-black text-[10px] uppercase shadow-sm">
                          {team.category || 'Beasiswa Menwa'}
                        </div>

                        {/* Delete Button for Super Admin */}
                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTeam(teamId, team.teamName)}
                            className="absolute bottom-3 right-3 p-2 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white shadow-md transition cursor-pointer"
                            title="Hapus penerima ini"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      {/* Konten Card */}
                      <div className="p-5 space-y-3">
                        <div>
                          <h4 className="text-base font-black text-slate-900 group-hover:text-[#006569] transition leading-snug">
                            {team.teamName}
                          </h4>
                          <p className="text-xs font-semibold text-slate-500">
                            {team.institution}
                          </p>
                        </div>

                        {team.motto && (
                          <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            "{team.motto}"
                          </p>
                        )}

                        {/* Progress Bar Donasi */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-600">{formatRupiah(danaTerkumpul)}</span>
                            <span className="text-[#34A853]">{percentAchieved}% Target</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#4285F4] to-[#34A853] transition-all duration-500"
                              style={{ width: `${percentAchieved}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-400 text-right">
                            Target: {formatRupiah(targetDana)}
                          </div>
                        </div>

                        {/* Akumulasi Suara Masuk */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-xs font-bold text-slate-500">Dukungan:</span>
                          <span className="text-sm font-black font-mono text-[#006569] flex items-center gap-1">
                            <Vote size={15} />
                            <AnimatedVoteCounter value={votesCount} /> Suara
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tombol Donasi / Vote Cepat */}
                    <div className="p-5 pt-0 space-y-2">
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleInitiateVote(team, 1)}
                          className="py-2 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 hover:text-emerald-800 transition cursor-pointer"
                        >
                          +1 (Rp1rb)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInitiateVote(team, 5)}
                          className="py-2 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 hover:text-emerald-800 transition cursor-pointer"
                        >
                          +5 (Rp5rb)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInitiateVote(team, 10)}
                          className="py-2 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 hover:text-emerald-800 transition cursor-pointer"
                        >
                          +10 (Rp10rb)
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleInitiateVote(team, 25)}
                        className="w-full py-3 bg-gradient-to-r from-[#006569] via-[#004d50] to-[#006569] hover:opacity-95 text-[#FFDD00] font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Heart size={15} className="fill-[#FFDD00]" />
                        <span>Beri Donasi Charity (QRIS)</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </main>
      )}

      {/* MODAL PEMBAYARAN QRIS DINAMIS DENGAN COUNTDOWN 15 MENIT */}
      {isQRISModalOpen && selectedTeam && (
        <DynamicQRISModal
          isOpen={isQRISModalOpen}
          onClose={() => setIsQRISModalOpen(false)}
          teamId={selectedTeam.teamId || selectedTeam.id}
          teamName={selectedTeam.teamName}
          votes={voteCount}
          amount={voteCount * 1000}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* POPUP NOTIFIKASI SUKSES PEMBAYARAN */}
      {successModalData && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 border border-emerald-200 text-center">
            
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3.5 shadow-sm scale-110 transition-transform">
              <CheckCircle2 size={38} />
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block mb-2">
              Terverifikasi Otomatis • {successModalData.txId}
            </span>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Donasi Berhasil! 🎉
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Donasi sebesar <strong className="text-emerald-700 font-bold">{formatRupiah(successModalData.amount)}</strong> terdeteksi lunas. Sebanyak <strong className="text-[#006569] font-black">+{successModalData.votesCount} Suara</strong> langsung ditambahkan secara real-time!
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

            <button
              type="button"
              onClick={() => setSuccessModalData(null)}
              className="w-full py-3.5 px-4 bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer"
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL ADMIN MAKO: TAMBAH TIM / PENERIMA BARU */}
      {adminModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in font-sans">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#006569] text-[#FFDD00] flex items-center justify-center font-bold">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Tambah Penerima / Posko Charity
                  </h3>
                  <span className="text-[10px] text-teal-700 font-mono">
                    Khusus Admin: {userEmail}
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setAdminModalOpen(false)} 
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Inisiatif / Penerima *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beasiswa Taruna Menwa - Farhan / Posko Sembako Karhutla"
                  value={newTeam.teamName}
                  onChange={(e) => setNewTeam({ ...newTeam, teamName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#006569]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Asal Lembaga / Lokasi Posko *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Batalyon Jayakarta / Posko Lapangan Riau"
                  value={newTeam.institution}
                  onChange={(e) => setNewTeam({ ...newTeam, institution: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#006569]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Kategori Inisiatif</label>
                <select
                  value={newTeam.category}
                  onChange={(e) => setNewTeam({ ...newTeam, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#006569]"
                >
                  <option value="Beasiswa Menwa">🎓 Beasiswa Menwa (Menwa Scholarship)</option>
                  <option value="Logistik Bencana">📦 Bantuan Logistik Kemanusiaan</option>
                  <option value="Aksi Karhutla">🔥 Aksi Cepat Tanggap Karhutla</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Penanggung Jawab / Kontak</label>
                <input
                  type="text"
                  placeholder="Nama Penanggung Jawab"
                  value={newTeam.dantonName}
                  onChange={(e) => setNewTeam({ ...newTeam, dantonName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#006569]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Donasi (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 5000000"
                  value={newTeam.targetDonation}
                  onChange={(e) => setNewTeam({ ...newTeam, targetDonation: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#006569]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Deskripsi / Motto Inisiatif</label>
                <input
                  type="text"
                  placeholder="Keterangan singkat penyaluran donasi"
                  value={newTeam.motto}
                  onChange={(e) => setNewTeam({ ...newTeam, motto: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#006569]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">URL Foto (Opsional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newTeam.photoUrl}
                  onChange={(e) => setNewTeam({ ...newTeam, photoUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#006569]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black rounded-xl uppercase tracking-wider transition shadow-md cursor-pointer"
                >
                  Simpan Inisiatif
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
