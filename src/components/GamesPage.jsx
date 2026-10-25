import React, { useState } from 'react';
import { 
  Gamepad2, 
  Trophy, 
  Gift, 
  Sparkles, 
  X, 
  ArrowLeft, 
  Flame, 
  ShieldCheck, 
  Calendar,
  Lock,
  ChevronRight,
  Info
} from 'lucide-react';
import { navigate } from '../lib/router.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { MiniGames } from './MiniGames.jsx';
import { Leaderboard } from './Leaderboard.jsx';
import { StreakMilestones } from './StreakMilestones.jsx';

const REWARDS_CATALOG = [
  {
    id: 'rew-1',
    title: 'Pin Korps Logam Menwa UNJ Emas',
    points: 350,
    category: 'Merchandise Resmi',
    desc: 'Lencana pin logam edisi resmi dengan lapisan enamel emas tahan karat dan pengait ganda.',
    tag: 'Segera Hadir'
  },
  {
    id: 'rew-2',
    title: 'Baret Menwa Koleksi Satuan',
    points: 750,
    category: 'Atribut Resmi',
    desc: 'Baret ungu kualitas wol standar dinas dengan emblem logam lambang Jayakarta.',
    tag: 'Segera Hadir'
  },
  {
    id: 'rew-3',
    title: 'Tumbler Taktis Stainless Steel',
    points: 500,
    category: 'Aksesoris Lapangan',
    desc: 'Botol vakum tahan suhu panas/dingin 24 jam dengan grafir laser nama dan logo Menwa UNJ.',
    tag: 'Segera Hadir'
  },
  {
    id: 'rew-4',
    title: 'Rompi Taktis Lapangan Menwa UNJ',
    points: 1200,
    category: 'Perlengkapan Satuan',
    desc: 'Rompi multi-saku berbahan Cordura tahan gesekan untuk kegiatan lapangan dan diklat.',
    tag: 'Segera Hadir'
  }
];

export function GamesPage({ onOpenAuth }) {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('game'); // 'game' | 'leaderboard' | 'rewards'

  const handleExit = () => {
    navigate('/');
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 font-sans pb-36 relative">
      {/* Tombol Melayang Cepat Keluar / Tutup Game (Floating Exit Button) */}
      {/* Pengguna dapat menutup tab game kapan saja tanpa harus scroll ke atas! */}
      <aside aria-label="Navigasi Cepat Keluar">
        <button
          type="button"
          onClick={handleExit}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs sm:text-sm px-5 py-3 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.6)] border-2 border-[#FFDD00]/40 flex items-center gap-2.5 transition-all duration-300 hover:scale-105 active:scale-95 group backdrop-blur-md cursor-pointer"
          title="Tutup tab game dan kembali ke beranda portal (tanpa perlu scroll ke atas)"
        >
          <div className="w-6 h-6 rounded-full bg-[#FFDD00] text-slate-950 flex items-center justify-center font-bold">
            <X size={15} className="group-hover:rotate-90 transition-transform duration-300" />
          </div>
          <span className="tracking-wide">Tutup / Keluar Game</span>
        </button>
      </aside>

      {/* Hero Header Subtab /games */}
      <header className="relative overflow-hidden bg-gradient-to-b from-[#00383b] via-slate-900 to-slate-950 border-b border-white/10 pt-10 pb-16 px-4 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Bar Atas: Tombol Kembali + Poin Pengguna */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <button
              type="button"
              onClick={handleExit}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/10 hover:border-white/20"
              title="Kembali ke Beranda"
            >
              <ArrowLeft size={16} />
              <span>Kembali ke Beranda</span>
            </button>

            {/* EXP dan Status Pengguna */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
                <Flame size={16} className="text-amber-400 fill-amber-400" />
                <span className="text-amber-300 font-mono text-sm">{profile?.tacticalPoints || 0}</span>
                <span className="text-slate-400 text-[10px] uppercase">EXP</span>
              </div>

              {user ? (
                <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-teal-500/30 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="truncate max-w-[120px] font-bold text-white">
                    {profile?.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                  </span>
                  {profile?.isVerifiedMenwa && (
                    <ShieldCheck size={14} className="text-blue-400 shrink-0" title="Anggota Menwa Terverifikasi" />
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition"
                >
                  <span>Masuk untuk Simpan Poin</span>
                </button>
              )}
            </div>
          </div>

          {/* Judul Subtab */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFDD00] text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg">
              <Gamepad2 size={15} />
              <span>Subtab Taktik Menwa & Gamifikasi</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Arena Taktis & Papan Peringkat
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Mainkan tantangan harian 7 tema terstruktur (Senin–Minggu bergilir), kumpulkan EXP, raih Gelar Kehormatan Militer, dan pantau posisi Anda di klasemen mingguan & bulanan.
            </p>
          </div>

          {/* Subtab Navigation Pills */}
          <nav aria-label="Menu Subtab Games" className="mt-8 flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl max-w-full overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('game')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === 'game'
                    ? 'bg-[#006569] text-[#FFDD00] shadow-md scale-102 border border-[#FFDD00]/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Gamepad2 size={16} />
                <span>1. Permainan & Tantangan Harian</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('leaderboard')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === 'leaderboard'
                    ? 'bg-[#006569] text-[#FFDD00] shadow-md scale-102 border border-[#FFDD00]/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Trophy size={16} />
                <span>2. Papan Peringkat & Gelar</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rewards')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === 'rewards'
                    ? 'bg-[#006569] text-[#FFDD00] shadow-md scale-102 border border-[#FFDD00]/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Gift size={16} />
                <span>3. Penukaran Hadiah</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-500/40 font-mono">
                  Coming Soon
                </span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Konten Tab Aktif */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 space-y-10">
        
        {/* Pelacak Login Streak & Lencana Milestone 7-Hari */}
        <StreakMilestones onOpenAuth={onOpenAuth} />

        {activeTab === 'game' && (
          <div className="space-y-10">
            <MiniGames 
              onOpenAuth={onOpenAuth} 
              onOpenLeaderboard={() => setActiveTab('leaderboard')} 
            />
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-10">
            <Leaderboard 
              onOpenQuiz={() => setActiveTab('game')} 
              onOpenAuth={onOpenAuth} 
            />
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-8 animate-fade-in">
            {/* Banner Coming Soon */}
            <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border border-amber-500/40 rounded-3xl p-8 text-center max-w-3xl mx-auto shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-400/30">
                <Gift size={32} />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FFDD00] text-slate-950 inline-block mb-3">
                Fitur Segera Hadir
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Penukaran Poin & Merchandise Eksklusif
              </h2>
              <p className="text-slate-300 text-sm mt-2 max-w-xl mx-auto leading-relaxed">
                Poin EXP yang Anda kumpulkan dari kuis taktis harian dan latihan komando nantinya dapat ditukarkan dengan merchandise resmi dan atribut khas Satuan Menwa UNJ.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-amber-300 bg-slate-950/60 px-4 py-2 rounded-xl border border-white/10">
                <Flame size={14} className="fill-amber-400" />
                <span>Poin Anda saat ini: <strong>{profile?.tacticalPoints || 0} EXP</strong> — Terus kumpulkan setiap hari!</span>
              </div>
            </div>

            {/* Preview Hadiah Merchandise */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
              {REWARDS_CATALOG.map((rew) => (
                <div 
                  key={rew.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-teal-500/50 transition group shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-800">
                        {rew.category}
                      </span>
                      <span className="text-[10px] font-bold bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                        {rew.tag}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-base mb-2 group-hover:text-[#FFDD00] transition-colors">
                      {rew.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {rew.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1 font-mono text-amber-400 font-black text-sm">
                      <Flame size={14} className="fill-amber-400" />
                      <span>{rew.points}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-sans">EXP</span>
                    </div>
                    <button
                      type="button"
                      disabled
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-500 text-xs font-bold cursor-not-allowed flex items-center gap-1"
                    >
                      <Lock size={12} />
                      <span>Tukar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tombol Footer Bawah: Tutup Game & Kembali */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={handleExit}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition border border-white/10"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Beranda Utama Portal Menwa UNJ</span>
          </button>
        </div>
      </main>
    </div>
  );
}
