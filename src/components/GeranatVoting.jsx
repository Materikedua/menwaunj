import { GeranatVotingFilterBar } from './voting/GeranatVotingFilterBar.jsx';
import { GeranatVotingHero } from './voting/GeranatVotingHero.jsx';

import { GeranatVotingStandbySection } from './voting/GeranatVotingStandbySection.jsx';
import { GeranatVotingTeamCard } from './voting/GeranatVotingTeamCard.jsx';
import { GeranatVotingSuccessModal } from './voting/GeranatVotingSuccessModal.jsx';
import { GeranatVotingAdminModal } from './voting/GeranatVotingAdminModal.jsx';

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
  Check,
  Upload,
  Image as ImageIcon
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
  resetGamificationLeaderboard,
  compressImageFile
} from '../firebase.js';
import { DynamicQRISModal } from './DynamicQRISModal.jsx';
import { TacticalConfetti } from './TacticalConfetti.jsx';
import { formatRupiah } from '../lib/qris.js';
import { navigate } from '../lib/router.jsx';

/** Inisiatif Donasi Bawaan Satuan jika Firestore belum memiliki data */
export const DEFAULT_CHARITY_TEAMS = [
  {
    teamId: 'TEAM-BEASISWA-KADER',
    teamName: 'Beasiswa Taruna Menwa UNJ (Kader Berprestasi & Prasejahtera)',
    institution: 'Batalyon Jayakarta Satuan UNJ',
    category: 'Beasiswa Menwa',
    dantonName: 'Kaur Personalia & Staf Diklat',
    motto: 'Mendukung keberlanjutan studi prajurit intelektual berprestasi',
    targetDonation: 10000000,
    votesCount: 450,
    photoUrl: '/foto-kampus-unj.jpg'
  },
  {
    teamId: 'TEAM-LOGISTIK-BENCANA',
    teamName: 'Posko Logistik & Medis Cepat Tanggap Bencana Kemanusiaan',
    institution: 'Satgas Tanggap Darurat Bencana Menwa UNJ',
    category: 'Logistik Bencana',
    dantonName: 'Kaur Operasi & Tim Teritorial',
    motto: 'Penyaluran sembako, selimut, air bersih & pertolongan pertama lapangan',
    targetDonation: 8000000,
    votesCount: 320,
    photoUrl: '/dokumentasi/pengabdian25.svg'
  },
  {
    teamId: 'TEAM-AKSI-KARHUTLA',
    teamName: 'Aksi Tanggap Karhutla & Perlindungan Ekosistem',
    institution: 'Satgas Operasi Karhutla & SAR Satuan UNJ',
    category: 'Aksi Karhutla',
    dantonName: 'Kaur Pengamanan & Tim Rescue',
    motto: 'Penyediaan respirator kabut asap, pompa apung & logistik regu pemadam',
    targetDonation: 7000000,
    votesCount: 280,
    photoUrl: '/kegiatan/kc-menwa-unj.jpg'
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

  /* Hak Akses Super Admin & Perwira Komando (Dansat, Wadansat, Staf Adminu, Superadmin, Command Auth) */
  const isSuperAdmin = useMemo(() => {
    const userEmail = user?.email?.toLowerCase();
    if (userEmail === 'unjmenwa@gmail.com' || userEmail === 'rafflysyahpoetra@gmail.com') return true;
    if (profile?.role && ['superadmin', 'dansat', 'wadansat', 'staf_adminu', 'admin'].includes(profile.role)) return true;
    try {
      const ccAuth = localStorage.getItem('menwa_command_auth_v1');
      if (ccAuth && JSON.parse(ccAuth)?.isAuthenticated) return true;
    } catch { /* ignore */ }
    return false;
  }, [user, profile]);

  /* Konfigurasi Charity Voting dari Firestore */
  const [votingConfig, setVotingConfig] = useState({
    isVotingOpen: false, /* Default Mode Siaga */
    programName: 'Charity Vote: Beasiswa Menwa & Bantuan Kemanusiaan',
    headline: 'Pintu Donasi Charity Vote Sedang Disiapkan',
    subheadline: 'Dukungan untuk Beasiswa Taruna Menwa, Bantuan Logistik Bencana Kemanusiaan, & Aksi Cepat Karhutla',
    scheduledOpenAt: '2026-11-01T08:00:00+07:00',
    targetGoalAmount: 25000000,
    pricePerVote: 1000
  });

  const [teams, setTeams] = useState(DEFAULT_CHARITY_TEAMS);
  const [recentVotes, setRecentVotes] = useState([]);
  const [flippedCards, setFlippedCards] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  /* Auto-refresh countdown (15 detik) */
  const AUTO_REFRESH_SECONDS = 15;
  const [countdown, setCountdown] = useState(AUTO_REFRESH_SECONDS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* Standby Countdown Timer */
  const [standbyTimeLeft, setStandbyTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  /* Modal & Form States */
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState('');
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [isAdminPinUnlocked, setIsAdminPinUnlocked] = useState(false);
  const [newTeam, setNewTeam] = useState({
    teamName: '',
    institution: '',
    category: 'Beasiswa Menwa',
    dantonName: '',
    motto: '',
    photoUrl: '',
    targetDonation: 5000000
  });

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingPhoto(true);
    try {
      const res = await compressImageFile(file, { maxWidth: 1000, maxHeight: 1000, quality: 0.85 });
      if (res?.dataUrl) {
        setPreviewPhoto(res.dataUrl);
        setNewTeam(prev => ({ ...prev, photoUrl: res.dataUrl }));
      }
    } catch (err) {
      console.warn('Gagal kompres foto penerima:', err);
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  /* Voting & QRIS Payment Modal States */
  const [confettiActive, setConfettiActive] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [voteCount, setVoteCount] = useState(1);
  const [isQRISModalOpen, setIsQRISModalOpen] = useState(false);
  const [successModalData, setSuccessModalData] = useState(null);
  const [failedModalData, setFailedModalData] = useState(null);
  const [bannerMessage, setBannerMessage] = useState(null);

  /* Interactive Standby Mode "Ingatkan Saya" */
  const [reminderEmail, setReminderEmail] = useState('');
  const [reminderSent, setReminderSent] = useState(false);

  /* Muat data tim dari Firestore & gabungkan dengan LocalStorage */
  const fetchTeams = async () => {
    try {
      setIsRefreshing(true);
      const data = await getGeranatTeams();
      let customLocals = [];
      try {
        customLocals = JSON.parse(localStorage.getItem('menwa_custom_teams_v1') || '[]');
      } catch { /* ignore */ }

      let merged = Array.isArray(data) && data.length > 0 ? [...data] : [];
      if (customLocals.length > 0) {
        customLocals.forEach(ct => {
          if (!merged.some(m => (m.teamId || m.id) === (ct.teamId || ct.id))) {
            merged.push(ct);
          }
        });
      }

      if (merged.length === 0) {
        merged = DEFAULT_CHARITY_TEAMS;
      }
      setTeams(merged);
    } catch (err) {
      console.warn('Gagal memuat tim/penerima charity:', err);
      let customLocals = [];
      try {
        customLocals = JSON.parse(localStorage.getItem('menwa_custom_teams_v1') || '[]');
      } catch { /* ignore */ }
      setTeams(customLocals.length > 0 ? customLocals : DEFAULT_CHARITY_TEAMS);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  /* Subscribe ke konfigurasi charity voting & data tim */
  useEffect(() => {
    fetchTeams();

    const unsubConfig = subscribeToCharityVotingConfig((liveConfig) => {
      if (liveConfig) {
        setVotingConfig(liveConfig);
      }
    });

    const unsubTeams = subscribeToGeranatTeams((liveTeams) => {
      if (liveTeams && liveTeams.length > 0) {
        let customLocals = [];
        try {
          customLocals = JSON.parse(localStorage.getItem('menwa_custom_teams_v1') || '[]');
        } catch { /* ignore */ }
        let merged = [...liveTeams];
        customLocals.forEach(ct => {
          if (!merged.some(m => (m.teamId || m.id) === (ct.teamId || ct.id))) {
            merged.push(ct);
          }
        });
        setTeams(merged);
        setLoading(false);
      }
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

  /* Countdown timer untuk Standby Mode */
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

  /* Interval auto-refresh 15 detik untuk leaderboard live */
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

  /* Toggle Pintu Voting oleh Super Admin / Perwira */
  const handleToggleVotingStatus = async () => {
    if (!isSuperAdmin) return;
    const newStatus = !votingConfig.isVotingOpen;
    try {
      await setCharityVotingConfig({ isVotingOpen: newStatus });
      setBannerMessage(newStatus ? 'Pintu Charity Vote BERHASIL DIBUKA untuk umum! Donasi sekarang dapat disalurkan secara langsung.' : 'Pintu Charity Vote BERHASIL DITUTUP (Kembali ke Mode Siaga).');
      setTimeout(() => setBannerMessage(null), 5000);
    } catch (err) {
      console.warn('Gagal toggle status voting:', err);
      setVotingConfig(prev => ({ ...prev, isVotingOpen: newStatus }));
    }
  };

  /* Reset Bersih Data Tim & Suara oleh Super Admin */
  const handleResetVotingData = async () => {
    if (!isSuperAdmin) return;
    const confirmed = window.confirm('Peringatan Komando: Apakah Anda yakin ingin MENGHAPUS SEMUA DATA TIM/PENERIMA di Charity Vote?');
    if (!confirmed) return;
    try {
      await resetCharityVotingData();
    } catch { /* ignore */ }
    try {
      localStorage.removeItem('menwa_custom_teams_v1');
    } catch { /* ignore */ }
    setTeams(DEFAULT_CHARITY_TEAMS);
    setBannerMessage('Data inisiatif donasi telah dikembalikan ke standar awal.');
    setTimeout(() => setBannerMessage(null), 5000);
  };

  /* Reset Bersih Gamifikasi Skor oleh Super Admin */
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

  /* Hapus satu tim oleh Super Admin */
  const handleDeleteTeam = async (teamId, teamName) => {
    if (!isSuperAdmin) return;
    const confirmed = window.confirm(`Hapus penerima "${teamName}"?`);
    if (!confirmed) return;
    try {
      await deleteGeranatTeam(teamId);
    } catch { /* ignore */ }
    try {
      const customLocals = JSON.parse(localStorage.getItem('menwa_custom_teams_v1') || '[]');
      const filtered = customLocals.filter(t => (t.teamId || t.id) !== teamId);
      localStorage.setItem('menwa_custom_teams_v1', JSON.stringify(filtered));
    } catch { /* ignore */ }
    setTeams(prev => prev.filter(t => (t.teamId || t.id) !== teamId));
  };

  /* Filter & Urutkan Tim */
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

  /* Buka Modal Pembayaran QRIS Statis */
  const handleInitiateVote = (team, count = 1) => {
    if (!votingConfig.isVotingOpen && !isSuperAdmin) {
      alert('Charity Vote saat ini berada dalam Mode Siaga (tertutup sementara). Tunggu pengumuman resmi pembukaan!');
      return;
    }
    setSelectedTeam(team);
    setVoteCount(count);
    setIsQRISModalOpen(true);
  };

  /* Callback saat pembayaran QRIS berhasil */
  const handlePaymentSuccess = async (receipt) => {
    if (!selectedTeam) return;
    const prevVotes = selectedTeam.votesCount || 0;
    const newTotalVotes = prevVotes + voteCount;
    const teamKey = selectedTeam.teamId || selectedTeam.id;

    if (!receipt?.alreadyRecorded) {
      try {
        await submitGeranatVote(
          teamKey,
          user?.uid || 'guest-donor',
          profile?.displayName || user?.displayName || 'Donatur Kemanusiaan',
          voteCount,
          voteCount * 1000,
          receipt?.txId || `VOTE-${Date.now()}`
        );
      } catch (err) {
        console.warn('Gagal merekam suara ke Firestore:', err);
      }
    }

    setTeams(prev => prev.map(t => {
      if ((t.teamId || t.id) === teamKey) {
        return {
          ...t,
          votesCount: newTotalVotes,
          totalAmountReceived: (t.totalAmountReceived || 0) + (voteCount * 1000)
        };
      }
      return t;
    }));

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
  };

  /* Tambah Tim / Penerima Baru oleh Admin */
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeam.teamName.trim() || !newTeam.institution.trim()) {
      alert('Nama Inisiatif/Penerima dan Asal Lembaga wajib diisi.');
      return;
    }

    const payload = {
      ...newTeam,
      teamId: `TEAM-${Date.now().toString(36).toUpperCase()}`,
      targetDonation: Number(newTeam.targetDonation) || 5000000,
      votesCount: 0,
      totalAmountReceived: 0,
      photoUrl: newTeam.photoUrl || '/foto-kampus-unj.jpg',
      createdAt: new Date().toISOString()
    };

    try {
      await saveGeranatTeam(payload);
    } catch (err) {
      console.warn('Gagal menyimpan ke Firestore geranat_teams:', err);
    }

    // Selalu simpan ke local storage dan perbarui state
    try {
      const customLocals = JSON.parse(localStorage.getItem('menwa_custom_teams_v1') || '[]');
      localStorage.setItem('menwa_custom_teams_v1', JSON.stringify([...customLocals, payload]));
    } catch { /* ignore */ }

    setTeams(prev => [payload, ...prev]);
    setAdminModalOpen(false);
    setPreviewPhoto('');
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

      {/* SUPER ADMIN & COMMAND CENTER CONTROL BAR */}
      {isSuperAdmin && (
        <aside
          aria-label="Panel Komando Super Admin"
          className="bg-gradient-to-r from-slate-900 via-[#004d50] to-slate-900 text-white px-4 py-3 border-b-2 border-[#FFDD00] sticky top-0 z-40 shadow-lg"
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFDD00] animate-ping" />
              <span className="font-mono uppercase font-black tracking-widest text-[#FFDD00]">
                KOMANDO CHARITY VOTE
              </span>
              <span className="hidden sm:inline text-slate-300">({user?.email || 'Perwira Mako'})</span>
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
                title="Reset daftar tim ke inisiatif bawaan"
              >
                <Trash2 size={13} />
                <span>Reset Inisiatif</span>
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
        <aside
          aria-label="Notifikasi Sistem"
          className="bg-emerald-600 text-white px-4 py-3 text-center text-xs font-bold shadow-md animate-fade-in flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={16} />
          <span>{bannerMessage}</span>
          <button type="button" onClick={() => setBannerMessage(null)} className="ml-2 hover:opacity-80">
            <X size={14} />
          </button>
        </aside>
      )}

      <GeranatVotingHero
        progressPercent={progressPercent}
        countdown={countdown}
        isRefreshing={isRefreshing}
        fetchTeams={fetchTeams}
        votingConfig={votingConfig}
        totalVotesAll={totalVotesAll}
        totalDonationRupiah={totalDonationRupiah}
        targetGoalAmount={targetGoalAmount}
      />
      {!votingConfig.isVotingOpen ? (
        <GeranatVotingStandbySection
          standbyTimeLeft={standbyTimeLeft}
          reminderSent={reminderSent}
          setReminderSent={setReminderSent}
          reminderEmail={reminderEmail}
          setReminderEmail={setReminderEmail}
          isSuperAdmin={isSuperAdmin}
          isAdminPinUnlocked={isAdminPinUnlocked}
          adminPinInput={adminPinInput}
          setAdminPinInput={setAdminPinInput}
          handleAdminPinSubmit={handleAdminPinSubmit}
          handleToggleVotingStatus={handleToggleVotingStatus}
          setAdminModalOpen={setAdminModalOpen}
        />
      ) : (
        /* ========================================================
            TAMPILAN LIVE VOTING (KETIKA DIBUKA OLEH ADMIN/PERWIRA)
            ======================================================== */
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8 animate-fade-in">
          <GeranatVotingFilterBar
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setAdminModalOpen={setAdminModalOpen}
          />

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
                Admin Mako dapat menambahkan calon penerima beasiswa atau posko logistik melalui tombol di bawah.
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
              {sortedTeams.map((team, idx) => (
                <GeranatVotingTeamCard
                  key={team.teamId || team.id}
                  team={team}
                  idx={idx}
                  flippedCards={flippedCards}
                  toggleFlipCard={toggleFlipCard}
                  handleInitiateVote={handleInitiateVote}
                  AnimatedVoteCounter={AnimatedVoteCounter}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {/* MODAL PEMBAYARAN QRIS DINAMIS DENGAN COUNTDOWN 15 MENIT & MANUAL CONFIRM */}
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

      <GeranatVotingSuccessModal
        successModalData={successModalData}
        setSuccessModalData={setSuccessModalData}
        AnimatedVoteCounter={AnimatedVoteCounter}
      />

      <GeranatVotingAdminModal
        adminModalOpen={adminModalOpen}
        setAdminModalOpen={setAdminModalOpen}
        isSuperAdmin={isSuperAdmin}
        isAdminPinUnlocked={isAdminPinUnlocked}
        handleCreateTeam={handleCreateTeam}
        newTeam={newTeam}
        setNewTeam={setNewTeam}
        handlePhotoSelect={handlePhotoSelect}
        isCompressingPhoto={isCompressingPhoto}
        previewPhoto={previewPhoto}
      />
    </div>
  );
}

export default GeranatVoting;
