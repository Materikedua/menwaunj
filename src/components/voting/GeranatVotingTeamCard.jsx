import React from 'react';
import { MapPin, Users, Heart, Share2, Info, Check, Vote, GraduationCap, Trash2 } from 'lucide-react';
import { formatRupiah, AnimatedVoteCounter as LocalVoteCounter } from './votingUtils.jsx';

export function GeranatVotingTeamCard({
  team,
  idx,
  flippedCards,
  toggleFlipCard,
  handleInitiateVote,
  AnimatedVoteCounter: PropVoteCounter,
  isSuperAdmin,
  handleDeleteTeam,
}) {
  const VoteCounter = PropVoteCounter || LocalVoteCounter;
  const teamId = team.teamId || team.id;
  const votesCount = team.votesCount || 0;
  const danaTerkumpul = votesCount * 1000;
  const targetDana = team.targetDonation || 5000000;
  const percentAchieved = Math.min(100, Math.round((danaTerkumpul / targetDana) * 100));

  return (
    <div
      key={teamId}
      className="bg-white rounded-3xl border border-slate-200 hover:border-teal-500/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
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
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/foto-kampus-unj.jpg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#006569]/10 to-teal-500/10 text-slate-400">
              <GraduationCap size={48} className="text-[#006569]/40" />
            </div>
          )}

          {/* Rank Badge */}
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 font-black text-xs shadow-sm flex items-center gap-1.5 border border-slate-200">
            <span className="text-[#006569]">#{idx + 1}</span>
            <span className="text-[10px] text-slate-500 uppercase font-mono">Peringkat</span>
          </div>

          {/* Category Pill */}
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#006569] text-[#FFDD00] font-black text-[10px] uppercase shadow-sm">
            {team.category || 'Beasiswa Menwa'}
          </div>

          {/* Delete Button for Super Admin */}
          {isSuperAdmin && handleDeleteTeam && (
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
              <span className="text-emerald-600">{percentAchieved}% Target</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#006569] to-emerald-500 transition-all duration-500"
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
              <VoteCounter value={votesCount} /> Suara
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
          className="w-full py-3 bg-gradient-to-r from-[#006569] via-[#004d50] to-[#006569] hover:opacity-95 text-[#FFDD00] font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <Heart size={15} className="fill-[#FFDD00]" />
          <span>Beri Donasi Charity (QRIS)</span>
        </button>
      </div>
    </div>
  );
}
