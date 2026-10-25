import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Award, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Gift, 
  ChevronRight, 
  Lock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { Snowflake } from 'lucide-react';
import { recordUserStreak, claimStreakMilestoneBonus } from '../firebase.js';
import { StreakMilestoneModal } from './StreakMilestoneModal.jsx';

// Definisi Milestone Lencana setiap 7 Hari
export const STREAK_MILESTONES = [
  {
    days: 7,
    title: 'Prajurit Disiplin',
    tier: 'Bronze',
    expReward: 100,
    color: 'from-amber-700 to-amber-900 border-amber-600',
    badgeBg: 'bg-amber-800 text-amber-100',
    desc: 'Mempertahankan disiplin latihan selama 7 hari berturut-turut.'
  },
  {
    days: 14,
    title: 'Ksatria Tangguh',
    tier: 'Silver',
    expReward: 250,
    color: 'from-slate-300 to-slate-500 border-slate-300',
    badgeBg: 'bg-slate-300 text-slate-900',
    desc: 'Dua pekan konsisten mengasah taktik dan ketangguhan mental.'
  },
  {
    days: 21,
    title: 'Perwira Loyal',
    tier: 'Gold',
    expReward: 500,
    color: 'from-amber-400 to-yellow-600 border-amber-300',
    badgeBg: 'bg-amber-400 text-slate-950',
    desc: 'Tiga pekan tanpa putus, loyalitas prajurit sejati terbukti.'
  },
  {
    days: 28,
    title: 'Panji Kehormatan',
    tier: 'Platinum Diamond',
    expReward: 1000,
    color: 'from-cyan-400 to-teal-600 border-cyan-300',
    badgeBg: 'bg-cyan-400 text-slate-950 font-black',
    desc: 'Satu bulan penuh keteladanan tertinggi Korps Resimen Mahasiswa.'
  },
  {
    days: 35,
    title: 'Legenda Resimen Mahasiswa',
    tier: 'Garuda Mythic',
    expReward: 2000,
    color: 'from-amber-400 via-yellow-200 to-amber-500 border-amber-300',
    badgeBg: 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black',
    desc: 'Puncak keteladanan tertinggi Korps Komando Batalyon Resimen Mahasiswa.'
  }
];

export function StreakMilestones({ onOpenAuth, onClaimBonus }) {
  const { user, profile } = useAuth();
  const [claiming, setClaiming] = useState(false);
  const [claimedNotice, setClaimedNotice] = useState(null);
  const [freezeNotice, setFreezeNotice] = useState(null);
  const [activeModalMilestone, setActiveModalMilestone] = useState(null);

  // Ambil data streak dari profil, atau inisialisasi default
  const currentStreak = profile?.currentStreak || (user ? 3 : 1);
  const longestStreak = Math.max(profile?.longestStreak || 0, currentStreak);
  const streakFreezesCount = profile?.streakFreezesCount ?? (user ? 1 : 0);
  const claimedMilestones = profile?.streakMilestonesClaimed || [];

  // Hitung progres siklus 7 hari berjalan
  const cycleDay = ((currentStreak - 1) % 7) + 1; // 1 s.d. 7
  const nextMilestone = STREAK_MILESTONES.find(m => currentStreak < m.days) || STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
  const daysUntilNext = nextMilestone.days - currentStreak;
  const progressPercent = Math.min(100, Math.round((cycleDay / 7) * 100));

  // Rekam streak otomatis saat komponen dipasang jika user login
  useEffect(() => {
    if (user && user.uid) {
      recordUserStreak(user.uid)
        .then(res => {
          if (!res) return;
          if (res.freezeUsed) {
            setFreezeNotice('Perlindungan Streak Freeze aktif! Streak login Anda berhasil diselamatkan.');
            setTimeout(() => setFreezeNotice(null), 6000);
          }
          if (res.milestoneReached) {
            const m = STREAK_MILESTONES.find(item => item.days === res.milestoneReached);
            if (m) setActiveModalMilestone(m);
          }
        })
        .catch(err => console.warn('Streak record notice:', err));
    }
  }, [user]);

  const handleClaim = async (milestone) => {
    if (!user) {
      onOpenAuth?.();
      return;
    }
    try {
      setClaiming(true);
      await claimStreakMilestoneBonus(user.uid, milestone.days, milestone.expReward);
      setClaimedNotice(`Selamat! Bonus ${milestone.expReward} EXP berhasil diklaim untuk Milestone ${milestone.days} Hari!`);
      onClaimBonus?.(milestone.expReward);
      setActiveModalMilestone(null);
      setTimeout(() => setClaimedNotice(null), 4000);
    } catch (err) {
      console.warn('Gagal klaim:', err);
    } finally {
      setClaiming(false);
    }
  };

  const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden text-white">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Freeze Notice Banner */}
      {freezeNotice && (
        <div className="mb-6 p-4 bg-teal-950/90 border border-teal-500/50 rounded-2xl flex items-center justify-between gap-3 text-teal-200 text-xs sm:text-sm animate-fade-in shadow-xl">
          <div className="flex items-center gap-2.5">
            <Snowflake className="w-5 h-5 text-teal-400 shrink-0 animate-spin" />
            <div>
              <strong className="text-white block font-bold">Streak Freeze Aktif!</strong>
              <span>{freezeNotice}</span>
            </div>
          </div>
          <span className="bg-teal-500/20 text-teal-300 px-2.5 py-1 rounded-lg text-xs font-mono font-bold shrink-0">
            Sisa: {streakFreezesCount}x
          </span>
        </div>
      )}

      {/* Header Streak */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shrink-0">
            <Flame size={32} className="animate-pulse fill-amber-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Login Streak Aktif
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Rekor: {longestStreak} Hari
              </span>
              <span className="text-[10px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                <Snowflake size={11} className="text-teal-400" />
                <span>Streak Freeze: {streakFreezesCount}x</span>
              </span>
            </div>
            <h3 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
              {currentStreak} Hari Berturut-turut
            </h3>
          </div>
        </div>

        {/* Milestone Selanjutnya */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-2.5 text-right shrink-0">
          <div className="text-[10px] uppercase font-bold text-slate-400">Milestone Terdekat</div>
          <div className="text-sm font-black text-[#FFDD00] flex items-center justify-end gap-1.5 mt-0.5">
            <Award size={15} />
            <span>{nextMilestone.title} ({nextMilestone.days} Hari)</span>
          </div>
        </div>
      </div>

      {/* 7-Day Dot Tracker (Visual Siklus Mingguan) */}
      <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 sm:p-5 mb-6 relative z-10">
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Calendar size={14} className="text-teal-400" />
            <span>Siklus 7 Hari (Hari ke-{cycleDay} dari 7)</span>
          </span>
          <span className="font-mono text-amber-400 font-black">
            {daysUntilNext > 0 ? `${daysUntilNext} hari lagi menuju badge!` : 'Badge siap diklaim!'}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {dayNames.map((dName, idx) => {
            const dayNum = idx + 1;
            const isCompleted = dayNum < cycleDay;
            const isToday = dayNum === cycleDay;
            return (
              <div 
                key={idx}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                  isCompleted 
                    ? 'bg-teal-950/80 border-teal-500/60 text-teal-200' 
                    : isToday 
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-lg scale-105 ring-2 ring-amber-400/30'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <span className="text-[10px] font-bold uppercase block mb-1">{dName}</span>
                <div className="w-6 h-6 rounded-full flex items-center justify-center">
                  {isCompleted ? (
                    <CheckCircle2 size={16} className="text-teal-400" />
                  ) : isToday ? (
                    <Flame size={18} className="fill-amber-400 text-amber-400 animate-bounce" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-700" />
                  )}
                </div>
                <span className="text-[9px] font-mono mt-1 font-bold">
                  H-{dayNum}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-3">
          <div className="flex-grow h-2 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="font-mono text-xs font-bold text-slate-400 shrink-0">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Daftar Lencana Milestone Setiap 7 Hari */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" />
            <span>Lencana Milestone 7-Hari & Bonus EXP</span>
          </h4>
          <span className="text-[10px] text-slate-400">
            Klik kartu untuk rincian & perayaan
          </span>
        </div>

        {claimedNotice && (
          <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{claimedNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {STREAK_MILESTONES.map((milestone) => {
            const isUnlocked = currentStreak >= milestone.days;
            const isClaimed = claimedMilestones.includes(milestone.days);
            const canClaim = isUnlocked && !isClaimed;

            return (
              <div 
                key={milestone.days}
                onClick={() => {
                  if (canClaim) {
                    setActiveModalMilestone(milestone);
                  }
                }}
                className={`rounded-2xl p-4 border transition-all flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-amber-400/60 ${
                  isUnlocked 
                    ? 'bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-amber-500/40 shadow-lg hover:scale-[1.02]' 
                    : 'bg-slate-950/50 border-slate-800/80 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${milestone.badgeBg}`}>
                      {milestone.tier}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-400">
                      +{milestone.expReward} EXP
                    </span>
                  </div>

                  <h5 className="font-black text-white text-sm mb-1 flex items-center gap-1.5">
                    {milestone.title}
                    {isUnlocked && <ShieldCheck size={14} className="text-emerald-400" />}
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3 line-clamp-2">
                    {milestone.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    Target: {milestone.days} Hari
                  </span>

                  {isClaimed ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Terklaim
                    </span>
                  ) : canClaim ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveModalMilestone(milestone);
                      }}
                      disabled={claiming}
                      className="px-2.5 py-1 bg-[#FFDD00] hover:bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-lg shadow-md transition flex items-center gap-1 cursor-pointer hover:scale-105"
                    >
                      <Gift size={11} /> Rayakan
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                      <Lock size={10} /> Terkunci
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Perayaan Milestone */}
      <StreakMilestoneModal
        isOpen={Boolean(activeModalMilestone)}
        onClose={() => setActiveModalMilestone(null)}
        milestone={activeModalMilestone}
        onClaim={handleClaim}
        claiming={claiming}
      />
    </div>
  );
}
