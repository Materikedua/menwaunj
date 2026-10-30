import React, { useState } from 'react';
import {
  Gamepad2, Trophy, Gift, Sparkles, X, ArrowLeft, Flame, ShieldCheck,
  Calendar, Lock, ChevronRight, Info, Activity, CreditCard
} from 'lucide-react';
import { navigate } from '../lib/router.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { MiniGames } from './MiniGames.jsx';
import { Leaderboard } from './Leaderboard.jsx';
import { StreakMilestones } from './StreakMilestones.jsx';
import { SamaptaCalculatorModal } from './SamaptaCalculatorModal.jsx';
import { TacticalKTACardModal } from './TacticalKTACardModal.jsx';
import { playTactileSound } from '../lib/tactileAudio.js';

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
  const [activeTab, setActiveTab] = useState('game'); /* 'game' | 'leaderboard' | 'rewards' */
  const [isSamaptaOpen, setIsSamaptaOpen] = useState(false);
  const [isKtaOpen, setIsKtaOpen] = useState(false);

  const handleExit = () => {
    playTactileSound('press');
    navigate('/');
  };

  const handleTabChange = (tab) => {
    playTactileSound('pill');
    setActiveTab(tab);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans pb-36 relative">
      {/* Floating Exit Button with Tactile 3.5D Styling */}
      <aside aria-label="Navigasi Cepat Keluar">
        <button
          type="button"
          onClick={handleExit}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 neu-btn-primary px-5 py-3 rounded-full flex items-center gap-2.5 transition-all duration-200 cursor-pointer shadow-xl text-white font-black text-xs sm:text-sm tracking-wide"
          title="Tutup arena taktis dan kembali ke beranda portal"
        >
          <div className="w-6 h-6 rounded-full bg-[#FFDD00] text-slate-950 flex items-center justify-center font-bold">
            <X size={15} />
          </div>
          <span>Tutup / Keluar Game</span>
        </button>
      </aside>

      {/* Hero Header Subtab /games */}
      <header className="relative overflow-hidden bg-gradient-to-r from-[#003d40] via-[#006569] to-[#00474c] border-b border-teal-700/30 pt-10 pb-14 px-4 sm:px-6 text-white shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Bar Atas: Tombol Kembali + Poin Pengguna */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <button
              type="button"
              onClick={handleExit}
              className="neu-pill-tab inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer"
              title="Kembali ke Beranda"
            >
              <ArrowLeft size={16} className="text-[#006569]" />
              <span className="text-slate-800">Kembali ke Beranda</span>
            </button>

            {/* EXP dan Status Pengguna */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-black/30 border border-amber-300/40 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-xs">
                <Flame size={16} className="text-[#FFDD00] fill-[#FFDD00]" />
                <span className="text-[#FFDD00] font-mono text-sm">{profile?.tacticalPoints || 0}</span>
                <span className="text-white/80 text-[10px] uppercase">EXP</span>
              </div>

              {user ? (
                <div className="hidden sm:flex items-center gap-2 bg-black/25 border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-medium text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="truncate max-w-[120px] font-bold text-white">
                    {profile?.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                  </span>
                  {profile?.isVerifiedMenwa && (
                    <ShieldCheck size={14} className="text-sky-300 shrink-0" title="Anggota Menwa Terverifikasi" />
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    playTactileSound('press');
                    onOpenAuth();
                  }}
                  className="neu-btn-gold px-3.5 py-1.5 rounded-full text-slate-950 text-xs font-black transition cursor-pointer"
                >
                  <span>Masuk untuk Simpan Poin</span>
                </button>
              )}
            </div>
          </div>

          {/* Judul Subtab */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFDD00] text-slate-950 text-xs font-black uppercase tracking-wider shadow">
              <Gamepad2 size={15} />
              <span>Subtab Taktik Menwa & Gamifikasi</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Arena Taktis & Papan Peringkat
            </h1>
            <p className="text-teal-50 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Mainkan tantangan harian 7 tema terstruktur (Senin–Minggu bergilir), kumpulkan EXP, raih Gelar Kehormatan Militer, dan uji kebugaran jasmani komando.
            </p>
          </div>

          {/* Subtab Navigation: Tactile 3.5D Pill Bar (Ref: Image 1) */}
          <nav aria-label="Menu Subtab Games" className="mt-8 flex justify-center">
            <div className="neu-pill-bar max-w-full overflow-x-auto shadow-lg">
              <button
                type="button"
                onClick={() => handleTabChange('game')}
                className={activeTab === 'game' ? 'neu-pill-tab-dark' : 'neu-pill-tab'}
              >
                <Gamepad2 size={16} className={activeTab === 'game' ? 'text-emerald-400' : 'text-teal-600'} />
                <span>1. Permainan & Tantangan</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('leaderboard')}
                className={activeTab === 'leaderboard' ? 'neu-pill-tab-dark' : 'neu-pill-tab'}
              >
                <Trophy size={16} className={activeTab === 'leaderboard' ? 'text-amber-400' : 'text-amber-500'} />
                <span>2. Papan Peringkat</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('rewards')}
                className={activeTab === 'rewards' ? 'neu-pill-tab-dark' : 'neu-pill-tab'}
              >
                <Gift size={16} className={activeTab === 'rewards' ? 'text-pink-400' : 'text-purple-500'} />
                <span>3. Penukaran Hadiah</span>
                <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full ml-1">
                  Soon
                </span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 space-y-10">
        {/* Fitur Unggulan Taktis: Simulator Samapta & E-KTA Virtual 3D */}
        <section aria-label="Fitur Taktis Pendukung" className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Kalkulator Samapta */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-teal-500/40 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                  <Activity size={12} className="text-teal-600" />
                  Kebugaran Jasmani TNI/Menwa
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  SK Standar Garjas
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Kalkulator Samapta & Kebugaran Komando
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Uji kesiapan fisik lapangan Anda secara ilmiah: lari 12 menit (Samapta A), pull-up/chinning, push-up, sit-up, dan shuttle run 6×10m (Samapta B). Predikat langsung keluar lengkap dengan lembar dossier.
              </p>
            </div>
            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">
                Nilai Akhir 0–100 & Cetak PDF
              </span>
              <button
                type="button"
                onClick={() => {
                  playTactileSound('press');
                  setIsSamaptaOpen(true);
                }}
                className="neu-btn-strong-blue px-4 py-2.5 rounded-full text-xs font-black inline-flex items-center gap-2 cursor-pointer"
              >
                <Activity size={14} />
                <span>Buka Simulator</span>
              </button>
            </div>
          </div>

          {/* Card 2: E-KTA 3D Virtual Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-amber-500/40 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                  <CreditCard size={12} className="text-amber-600" />
                  Identitas Korps Digital
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Holographic 3D Tilt
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Kartu Tanda Anggota Virtual 3D (E-KTA)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspeksi kartu tanda anggota resmi dalam sudut pandang 3D interaktif. Dilengkapi pita hologram bercahaya, QR Code verifikasi keabsahan, dan teks Panca Dharma Satya di sisi belakang.
              </p>
            </div>
            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">
                Bolak-balik 360° & Cetak ID Card
              </span>
              <button
                type="button"
                onClick={() => {
                  playTactileSound('press');
                  setIsKtaOpen(true);
                }}
                className="neu-btn-gold px-4 py-2.5 rounded-full text-xs font-black inline-flex items-center gap-2 cursor-pointer text-slate-950"
              >
                <CreditCard size={14} />
                <span>Buka E-KTA 3D</span>
              </button>
            </div>
          </div>
        </section>

        {/* Pelacak Login Streak & Lencana Milestone 7-Hari */}
        <StreakMilestones onOpenAuth={onOpenAuth} />

        {/* Tab 1: Permainan */}
        {activeTab === 'game' && (
          <div className="space-y-10">
            <MiniGames
              onOpenAuth={onOpenAuth}
              onOpenLeaderboard={() => handleTabChange('leaderboard')}
            />
          </div>
        )}

        {/* Tab 2: Papan Peringkat */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-10">
            <Leaderboard
              onOpenQuiz={() => handleTabChange('game')}
              onOpenAuth={onOpenAuth}
            />
          </div>
        )}

        {/* Tab 3: Penukaran Hadiah */}
        {activeTab === 'rewards' && (
          <div className="space-y-8 animate-fade-in">
            {/* Banner Coming Soon */}
            <div className="bg-gradient-to-r from-teal-50 via-white to-amber-50 border border-teal-200/80 rounded-3xl p-8 text-center max-w-3xl mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-xs">
                <Gift size={32} />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 inline-block mb-3">
                Fitur Segera Hadir
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Penukaran Poin & Merchandise Eksklusif
              </h2>
              <p className="text-slate-600 text-sm mt-2 max-w-xl mx-auto leading-relaxed">
                Poin EXP yang Anda kumpulkan dari kuis taktis harian dan latihan komando nantinya dapat ditukarkan dengan merchandise resmi dan atribut khas Satuan Menwa UNJ.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                <Flame size={14} className="fill-amber-500 text-amber-500" />
                <span>
                  Poin Anda saat ini: <strong className="text-[#006569]">{profile?.tacticalPoints || 0} EXP</strong> — Terus kumpulkan setiap hari!
                </span>
              </div>
            </div>

            {/* Preview Hadiah Merchandise */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
              {REWARDS_CATALOG.map((rew) => (
                <div
                  key={rew.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:border-teal-500/50 hover:shadow-md transition group shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                        {rew.category}
                      </span>
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                        {rew.tag}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-[#006569] transition-colors">
                      {rew.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      {rew.desc}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 font-mono text-amber-600 font-black text-sm">
                      <Flame size={14} className="fill-amber-500 text-amber-500" />
                      <span>{rew.points}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-sans">EXP</span>
                    </div>
                    <button
                      type="button"
                      disabled
                      className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed flex items-center gap-1"
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
        <div className="mt-16 pt-8 border-t border-slate-200 text-center">
          <button
            type="button"
            onClick={handleExit}
            className="neu-pill-tab inline-flex items-center gap-2 px-6 py-3 rounded-full text-slate-800 font-bold text-sm transition cursor-pointer"
          >
            <ArrowLeft size={16} className="text-[#006569]" />
            <span>Kembali ke Beranda Utama Portal Menwa UNJ</span>
          </button>
        </div>
      </main>

      {/* Modals */}
      <SamaptaCalculatorModal
        isOpen={isSamaptaOpen}
        onClose={() => setIsSamaptaOpen(false)}
      />

      <TacticalKTACardModal
        isOpen={isKtaOpen}
        onClose={() => setIsKtaOpen(false)}
      />
    </div>
  );
}
