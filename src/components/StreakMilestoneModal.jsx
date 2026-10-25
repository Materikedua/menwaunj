import React from 'react';
import { 
  Flame, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Gift, 
  X, 
  ChevronRight,
  ShieldAlert,
  Snowflake
} from 'lucide-react';
import { TacticalConfetti } from './TacticalConfetti.jsx';

export function StreakMilestoneModal({ 
  isOpen, 
  onClose, 
  milestone, 
  onClaim, 
  claiming = false 
}) {
  if (!isOpen || !milestone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Particle Effect Burst */}
      <TacticalConfetti trigger={true} />

      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 text-center text-white shadow-2xl shadow-amber-950/60 overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-44 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-700 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 border border-amber-500/40 text-amber-300 mb-4">
          <Sparkles size={14} className="text-amber-400 animate-spin" />
          <span>Pencapaian Milestone 7-Hari Tercapai!</span>
        </div>

        {/* Animated 3D-effect Badge Icon */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-700 p-1 shadow-xl shadow-amber-500/30 animate-pulse">
            <div className="w-full h-full rounded-[22px] bg-slate-950 flex flex-col items-center justify-center border border-amber-400/40">
              <Award size={48} className="text-[#FFDD00] drop-shadow-md animate-bounce" />
              <span className="text-[10px] font-mono font-black text-amber-300 tracking-wider mt-1 uppercase">
                {milestone.tier}
              </span>
            </div>
          </div>
          <div className="absolute -bottom-2 bg-red-600 text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md border border-red-400 flex items-center gap-1">
            <Flame size={12} className="fill-white" />
            <span>{milestone.days} Hari Streak</span>
          </div>
        </div>

        {/* Title & Honor Description */}
        <h3 className="text-2xl sm:text-3xl font-black text-white mt-4 tracking-tight">
          {milestone.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto mt-2 leading-relaxed">
          {milestone.desc || `Dedikasi luar biasa! Anda telah mempertahankan kedisiplinan dan loyalitas komando selama ${milestone.days} hari berturut-turut.`}
        </p>

        {/* Rewards Box */}
        <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 my-6 text-left space-y-2.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Hadiah Kehormatan yang Diperoleh:
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
            <span className="text-slate-200 font-medium flex items-center gap-2">
              <Gift size={16} className="text-amber-400" />
              <span>Bonus Poin EXP Taktis</span>
            </span>
            <span className="font-mono font-black text-amber-400 text-base">
              +{milestone.expReward} EXP
            </span>
          </div>

          {(milestone.days === 7 || milestone.days === 21) && (
            <div className="flex items-center justify-between text-xs sm:text-sm bg-teal-950/60 px-3 py-2 rounded-xl border border-teal-500/40">
              <span className="text-teal-200 font-medium flex items-center gap-2">
                <Snowflake size={16} className="text-teal-400" />
                <span>Item Perlindungan Streak Freeze</span>
              </span>
              <span className="font-mono font-black text-teal-300 text-sm">
                +1 Freeze
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
            <span className="text-slate-300 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Lencana Resmi Profil</span>
            </span>
            <span className="text-emerald-400 font-bold">
              Permanen
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => onClaim(milestone)}
            disabled={claiming}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-[#FFDD00] to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Gift size={16} />
            <span>{claiming ? 'Mengklaim Penghargaan...' : 'Klaim Bonus EXP & Lencana'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Tutup & Simpan untuk Nanti
          </button>
        </div>
      </div>
    </div>
  );
}
