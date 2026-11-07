import React from 'react';
import { CheckCircle2, Vote } from 'lucide-react';
import { formatRupiah, AnimatedVoteCounter as LocalVoteCounter } from './votingUtils.jsx';

export function GeranatVotingSuccessModal({
  successModalData,
  setSuccessModalData,
  AnimatedVoteCounter: PropVoteCounter,
}) {
  const VoteCounter = PropVoteCounter || LocalVoteCounter;
  if (!successModalData) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 border border-emerald-200 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3.5 shadow-sm scale-110 transition-transform">
          <CheckCircle2 size={38} />
        </div>

        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block mb-2">
          Terverifikasi • {successModalData.txId}
        </span>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
          Donasi Berhasil! 🎉
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          Donasi sebesar <strong className="text-emerald-700 font-bold">{formatRupiah(successModalData.amount)}</strong> berhasil dialokasikan. Sebanyak <strong className="text-[#006569] font-black">+{successModalData.votesCount} Suara</strong> langsung ditambahkan secara real-time!
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
            <VoteCounter value={successModalData.newTotal} />
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
          Selesai &amp; Tutup
        </button>
      </div>
    </div>
  );
}
