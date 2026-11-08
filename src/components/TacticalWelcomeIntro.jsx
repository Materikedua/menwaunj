import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { playTactileClick } from '../lib/tactileAudio.js';

/**
 * TacticalWelcomeIntro — Ultra-Classy Cinematic Welcome Animation
 * Triggered on fresh refresh / first page mount of menwaunj.or.id.
 * Aesthetic: Tactical Academic (Gold, Deep Cyan, Obsidian Navy, Precision HUD)
 */
export function TacticalWelcomeIntro({ onFinish }) {
  const [stage, setStage] = useState(0); // 0: init, 1: crest reveal, 2: motto glow, 3: exit
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Stage 1: Crest reveal
    const t1 = setTimeout(() => {
      setStage(1);
      try {
        playTactileClick('hover');
      } catch {}
    }, 250);

    // Stage 2: Semboyan & motto glow
    const t2 = setTimeout(() => {
      setStage(2);
      try {
        playTactileClick('click');
      } catch {}
    }, 1100);

    // Stage 3: Smooth dissolve exit
    const t3 = setTimeout(() => {
      setStage(3);
    }, 2400);

    // Final unmount
    const t4 = setTimeout(() => {
      setDismissed(true);
      onFinish?.();
    }, 2850);

    // Support ESC key to skip anytime
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setStage(3);
        setTimeout(() => {
          setDismissed(true);
          onFinish?.();
        }, 300);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onFinish]);

  const handleSkip = () => {
    try {
      playTactileClick('click');
    } catch {}
    setStage(3);
    setTimeout(() => {
      setDismissed(true);
      onFinish?.();
    }, 300);
  };

  if (dismissed) return null;

  return (
    <div
      role="dialog"
      aria-label="Penyambutan Resmi Menwa UNJ"
      aria-modal="true"
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-[#020617] select-none transition-all duration-700 ease-out ${
        stage === 3 ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at center, #092D32 0%, #031317 45%, #020617 100%)',
      }}
    >
      {/* 1. Tactical Precision Grid & Scanning Lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 168, 175, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 168, 175, 0.25) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* 2. Sweeping Light Laser Flare (Curtain / Progressive Paint Beam) */}
      <div
        className={`absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-1000 ${
          stage >= 1 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className="absolute -inset-full w-[300%] h-[300%] bg-gradient-to-r from-transparent via-teal-400/10 to-transparent transform -rotate-45"
          style={{
            animation: 'mu-marquee 4.5s cubic-bezier(0.2, 0.8, 0.2, 1) infinite',
          }}
        />
      </div>

      {/* 3. Glowing Corner HUD Markers */}
      <div className="absolute top-6 left-6 flex items-center gap-2 font-mono text-[10px] tracking-widest text-teal-400/80">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>SYS.INITIALIZE // MENWA-UNJ.OR.ID</span>
      </div>
      <div className="absolute bottom-6 left-6 font-mono text-[9px] tracking-wider text-slate-500 hidden sm:block">
        BATALYON IX • 106.8837°E 6.1950°S
      </div>

      {/* 4. Skip Button */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-6 right-6 z-20 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md shadow-lg"
      >
        <span>Lewati Sambutan</span>
        <span className="text-[10px] opacity-60 ml-0.5">[ESC]</span>
        <ChevronRight size={14} className="text-[#FFDD00]" />
      </button>

      {/* 5. Center Presentation Core */}
      <div className="relative z-10 max-w-xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Emblem Halo & Laser Radar Circles */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Outer Pulsing Radar Rings */}
          <div
            className={`absolute -inset-8 rounded-full border border-teal-500/30 transition-all duration-1000 ${
              stage >= 1 ? 'scale-100 opacity-80' : 'scale-50 opacity-0'
            }`}
          />
          <div
            className={`absolute -inset-14 rounded-full border border-dashed border-[#FFDD00]/30 transition-all duration-1000 ${
              stage >= 2 ? 'scale-100 opacity-60 animate-spin' : 'scale-75 opacity-0'
            }`}
            style={{ animationDuration: '24s' }}
          />

          {/* Ambient Golden Core Glow */}
          <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-[#006569] via-teal-400/40 to-[#FFDD00]/40 blur-2xl opacity-60 animate-pulse" />

          {/* Menwa UNJ Official Logo */}
          <div
            className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-slate-950/80 border-2 border-[#FFDD00]/80 p-3.5 shadow-2xl flex items-center justify-center transition-all duration-1000 ease-out transform ${
              stage >= 1
                ? 'scale-100 opacity-100 rotate-0'
                : 'scale-75 opacity-0 -rotate-12'
            }`}
            style={{
              boxShadow: '0 0 50px rgba(0, 168, 175, 0.35), 0 0 30px rgba(255, 221, 0, 0.25)',
            }}
          >
            <img
              src="/logo-menwa-unj.png"
              alt="Logo Menwa UNJ"
              className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Tactical Welcome Header */}
        <div
          className={`transition-all duration-700 delay-100 transform ${
            stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 font-mono text-[10px] font-black uppercase tracking-[0.25em] mb-3">
            <Zap size={11} className="text-[#FFDD00]" />
            SELAMAT DATANG DI PORTAL RESMI
          </div>

          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
            RESIMEN MAHASISWA BATALYON IX
          </h1>
          <p className="font-mono text-xs sm:text-sm font-bold text-teal-300 tracking-[0.3em] uppercase mt-1">
            UNIVERSITAS NEGERI JAKARTA
          </p>
        </div>

        {/* Semboyan Satuan: Widya Castrena Dharma Siddha */}
        <div
          className={`mt-6 pt-5 border-t border-teal-500/20 max-w-md transition-all duration-1000 delay-300 transform ${
            stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="relative inline-block">
            <span className="text-sm sm:text-base font-black tracking-widest text-[#FFDD00] uppercase drop-shadow-md">
              “ Widya Castrena Dharma Siddha ”
            </span>
            <div className="absolute -inset-x-2 -bottom-1 h-[2px] bg-gradient-to-r from-transparent via-[#FFDD00] to-transparent" />
          </div>

          <p className="text-[11px] sm:text-xs text-slate-300/80 leading-relaxed mt-2.5 font-medium">
            Penyempurnaan Pengabdian dengan Ilmu Pengetahuan dan Olah Keprajuritan
          </p>
        </div>

        {/* Loading / Progress Indicator bar */}
        <div className="mt-8 w-44 sm:w-56 h-1 rounded-full bg-slate-800/80 overflow-hidden relative border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#006569] via-teal-400 to-[#FFDD00] transition-all duration-[2400ms] ease-out"
            style={{ width: stage >= 2 ? '100%' : stage >= 1 ? '60%' : '15%' }}
          />
        </div>
      </div>
    </div>
  );
}

export default TacticalWelcomeIntro;
