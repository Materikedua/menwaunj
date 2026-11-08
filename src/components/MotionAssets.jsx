import React from 'react';
import { Plane, Laptop, Trophy, Play, Pause } from 'lucide-react';

/**
 * Lightweight CSS/SVG motion assets.
 * The supplied .lottie files remain in /public/lottie as visual references only;
 * the production UI does not load the Lottie runtime.
 */
export const PlayPauseMotion = ({ playing = false }) => (
  <span className={`motion-playpause ${playing ? 'is-playing' : ''}`} aria-hidden="true">
    <span className="motion-playpause__halo" />
    <span className="motion-playpause__glyph motion-playpause__glyph--play"><Play size={20} fill="currentColor" /></span>
    <span className="motion-playpause__glyph motion-playpause__glyph--pause"><Pause size={20} fill="currentColor" /></span>
    <span className={`motion-playpause__bar ${playing ? 'is-playing' : ''}`} />
  </span>
);

export const FireMotion = ({ active = true }) => (
  <span className={`motion-fire ${active ? 'is-active' : ''}`} aria-hidden="true">
    <span className="motion-fire__outer" />
    <span className="motion-fire__inner" />
    <span className="motion-fire__core" />
  </span>
);

export const CardStackMotion = ({ compact = false }) => (
  <span className={`motion-cardstack ${compact ? 'is-compact' : ''}`} aria-hidden="true">
    <span className="motion-cardstack__card motion-cardstack__card--back" />
    <span className="motion-cardstack__card motion-cardstack__card--mid" />
    <span className="motion-cardstack__card motion-cardstack__card--front">
      <span className="motion-cardstack__line" />
      <span className="motion-cardstack__line motion-cardstack__line--short" />
    </span>
  </span>
);

export const PlaneMotion = () => (
  <span className="motion-plane" aria-hidden="true">
    <span className="motion-plane__trail motion-plane__trail--one" />
    <span className="motion-plane__trail motion-plane__trail--two" />
    <Plane className="motion-plane__icon" size={64} strokeWidth={1.8} />
  </span>
);

export const LaptopMotion = () => (
  <div className="relative w-full max-w-[280px] sm:max-w-[320px] mx-auto select-none" aria-hidden="true">
    {/* Ambient Tactical Glow */}
    <div className="absolute -inset-4 bg-gradient-to-r from-[#006569]/30 via-teal-500/20 to-[#FFDD00]/25 rounded-3xl blur-2xl opacity-70 animate-pulse pointer-events-none" />

    {/* Monitor Frame */}
    <div className="relative rounded-2xl bg-gradient-to-b from-[#132c30] to-[#041a1c] p-2.5 shadow-2xl border border-teal-500/30">
      {/* Screen Glass Bezel */}
      <div className="relative rounded-xl bg-[#021315] border border-teal-500/20 p-3 overflow-hidden aspect-[16/10] flex flex-col justify-between">
        {/* Subtle Scanlines & HUD Grid Overlay */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,168,175,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,168,175,0.2) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Top Terminal Bar */}
        <div className="relative z-10 flex items-center justify-between border-b border-teal-500/20 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500/80" />
            <span className="w-2 h-2 rounded-full bg-amber-400/80" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="font-mono text-[9px] font-black tracking-widest text-[#00A8AF] uppercase">
            MENWA UNJ // SYS-MONITOR
          </span>
          <span className="w-2 h-2 rounded-full bg-teal-400/40" />
        </div>

        {/* Center Animated Radar / Frequency Signal */}
        <div className="relative z-10 flex flex-col items-center justify-center py-2 space-y-2">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-teal-400/30 animate-ping opacity-60" />
            <span
              className="absolute inset-1.5 rounded-full border border-dashed border-[#FFDD00]/40 animate-spin"
              style={{ animationDuration: '8s' }}
            />
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#006569] to-teal-400 flex items-center justify-center shadow-lg text-slate-950 font-black">
              <Laptop size={14} className="text-white" />
            </div>
          </div>

          <div className="text-center space-y-0.5">
            <div className="font-mono text-[10px] font-black text-[#FFDD00] tracking-widest uppercase">
              SEGERA HADIR
            </div>
            <div className="font-mono text-[8px] text-teal-300/70 tracking-wider">
              [ STANDBY // PREPARING MODULE ]
            </div>
          </div>
        </div>

        {/* Bottom Status / Blinking Prompt */}
        <div className="relative z-10 flex items-center justify-between font-mono text-[8px] text-slate-400 border-t border-teal-500/15 pt-1.5">
          <span className="text-teal-400/90 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            READY
          </span>
          <span className="text-slate-400 animate-pulse font-mono tracking-widest">
            _ _ _
          </span>
        </div>
      </div>

      {/* Screen Glare Reflection */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-20"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
        }}
      />
    </div>

    {/* Laptop / Monitor Base Stand */}
    <div className="relative mx-auto -mt-0.5 h-2 w-28 bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 rounded-b-md shadow-md" />
    <div className="relative mx-auto h-1 w-36 bg-gradient-to-r from-transparent via-teal-400/30 to-transparent blur-xs" />
  </div>
);

export const TrophyMotion = () => (
  <span className="motion-trophy" aria-hidden="true">
    <span className="motion-trophy__ring motion-trophy__ring--one" />
    <span className="motion-trophy__ring motion-trophy__ring--two" />
    <Trophy className="motion-trophy__icon" size={110} strokeWidth={1.5} />
    <span className="motion-trophy__spark motion-trophy__spark--one" />
    <span className="motion-trophy__spark motion-trophy__spark--two" />
  </span>
);

export default {
  PlayPauseMotion,
  FireMotion,
  CardStackMotion,
  PlaneMotion,
  LaptopMotion,
  TrophyMotion,
};
