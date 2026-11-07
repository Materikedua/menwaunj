import React from 'react';
import { ArrowLeft, RefreshCw, Sparkles, Heart } from 'lucide-react';
import { navigate } from '../../lib/router.jsx';
import { formatRupiah, AnimatedVoteCounter } from './votingUtils.jsx';

export function GeranatVotingHero({
  progressPercent,
  countdown,
  isRefreshing,
  fetchTeams,
  votingConfig,
  totalVotesAll,
  totalDonationRupiah,
  targetGoalAmount,
}) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-b from-[#e8f5f1] via-sky-50/40 to-slate-50 border-b border-slate-200/80 pt-10 pb-12 px-4 sm:px-6">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#006569]/10 blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-0 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
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
                      className="text-[#006569]"
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-[#006569]" />
              <span className="text-[#006569]">Charity Vote Resimen Mahasiswa UNJ</span>
              <span className="text-slate-300">•</span>
              <span className="text-rose-600 flex items-center gap-1">
                <Heart size={12} className="fill-rose-600" /> Berbagi Harapan
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Charity Vote: <span className="bg-gradient-to-r from-[#006569] via-teal-700 to-emerald-600 bg-clip-text text-transparent">Beasiswa Menwa &amp; Bantuan Kemanusiaan</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              Wujud nyata pengabdian Widya Castrena Dharma Siddha. Setiap 1 suara bernilai donasi Rp1.000 (QRIS Tanpa Potongan) untuk beasiswa kader bangsa, logistik pengungsian bencana, dan dukungan lapangan penanganan karhutla.
            </p>

            {/* Ringkasan Dana & Target */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-2xl mx-auto">
              <div className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-sm text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Total Suara</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5">
                  <AnimatedVoteCounter value={totalVotesAll || 0} />
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-sm text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Dana Terkumpul</div>
                <div className="text-xl sm:text-2xl font-black text-[#006569] font-mono mt-0.5">
                  {formatRupiah(totalDonationRupiah || 0)}
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-amber-100 shadow-sm text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Target Dana</div>
                <div className="text-xl sm:text-2xl font-black text-slate-800 font-mono mt-0.5">
                  Rp25 Juta
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-sm text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Nominal / Suara</div>
                <div className="text-xl sm:text-2xl font-black text-rose-600 font-mono mt-0.5">
                  Rp1.000
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

  );
}
