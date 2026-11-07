import React from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Star,
  Users,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';

export function ParticipantModulePenilaian({
  totalNilaiAkhir,
  scoreProgressPercentage,
  activeScoreGroup,
  setActiveScoreGroup,
  CRITERIA_CATEGORIES,
  portalData,
  hasAdminAccess,
  handleAdminScoreChange,
  juryNameInput,
  setJuryNameInput,
  nomorUrutInput,
  setNomorUrutInput,
  handleSaveJuryVerification,
  handleDownloadScoringCsv,
  handleDownloadScoringRecapPdf,
}) {
  return (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#006569] block">
                        MODUL 05 · BLANKO RESMI PENILAIAN PESERTA LOMBA GERANAT
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-[#092D32]">
                        Rekapitulasi Penilaian Dewan Juri
                      </h2>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Transparansi skor aspek baris-berbaris, pengibaran bendera, komandan, serta pengurangan/bonus poin.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleDownloadScoringCsv}
                        className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                      >
                        <FileSpreadsheet size={15} />
                        <span>Unduh Excel (.CSV)</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadScoringPdf}
                        className="px-4 py-2.5 rounded-xl bg-[#092D32] hover:bg-[#006569] text-[#FFDD00] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                      >
                        <Printer size={15} />
                        <span>Cetak Lembar Nilai (PDF)</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl bg-[#F5F8F6] border border-slate-200 p-4">
                      <span className="text-[10px] font-black uppercase text-[#64748B] block">
                        Total Nilai Aspek (A–J)
                      </span>
                      <div className="text-xl sm:text-2xl font-mono font-black text-[#092D32] mt-1 tabular-nums">
                        {scoringSummary.totalGross}{' '}
                        <span className="text-xs font-normal text-[#64748B]">
                          / {scoringSummary.totalMax}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-rose-50/70 border border-[#EA4335]/30 p-4">
                      <span className="text-[10px] font-black uppercase text-[#EA4335] block">
                        Pengurangan Poin (-)
                      </span>
                      <div className="text-xl sm:text-2xl font-mono font-black text-[#EA4335] mt-1 tabular-nums">
                        -{scoringSummary.totalPenalty}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-blue-50/70 border border-[#4285F4]/30 p-4">
                      <span className="text-[10px] font-black uppercase text-[#4285F4] block">
                        Penambahan Poin (+)
                      </span>
                      <div className="text-xl sm:text-2xl font-mono font-black text-[#4285F4] mt-1 tabular-nums">
                        +{scoringSummary.totalBonus}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-[#006569] to-[#092D32] text-white p-4 shadow-md">
                      <span className="text-[10px] font-black uppercase text-[#FFDD00] block">
                        Total Nilai Akhir
                      </span>
                      <div className="text-xl sm:text-2xl font-mono font-black text-white mt-1 tabular-nums">
                        {scoringSummary.finalScore}{' '}
                        <span className="text-xs font-normal text-teal-200">
                          / {scoringSummary.totalMax}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveScoreGroup('ALL')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                        activeScoreGroup === 'ALL'
                          ? 'bg-[#006569] text-[#FFDD00]'
                          : 'bg-[#F5F8F6] text-[#64748B] hover:bg-slate-200'
                      }`}
                    >
                      Semua Kategori (A–J)
                    </button>
                    {GERANAT_SCORING_GROUPS.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setActiveScoreGroup(g.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer font-mono tabular-nums ${
                          activeScoreGroup === g.id
                            ? 'bg-[#006569] text-[#FFDD00]'
                            : 'bg-[#F5F8F6] text-[#64748B] hover:bg-slate-200'
                        }`}
                      >
                        {g.code}. ({scoringSummary.groupTotals[g.id]?.sum || 0}/{g.maxTotal})
                      </button>
                    ))}
                  </div>
                </div>

                {GERANAT_SCORING_GROUPS.filter(
                  (g) => activeScoreGroup === 'ALL' || g.id === activeScoreGroup
                ).map((group) => {
                  const gStat = scoringSummary.groupTotals[group.id];
                  return (
                    <div
                      key={group.id}
                      className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs"
                    >
                      <div className="bg-[#092D32] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm sm:text-base font-black text-white">
                            {group.title}
                          </h3>
                          <span className="text-[11px] text-slate-300">
                            Nilai Maksimal Kelompok {group.code}: {group.maxTotal} Poin
                          </span>
                        </div>
                        <div className="px-4 py-1.5 rounded-xl bg-white/10 font-mono text-xs sm:text-sm font-black text-[#FFDD00] tabular-nums">
                          Total {group.code}: {gStat?.sum || 0} / {group.maxTotal}
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 bg-[#F5F8F6] text-[11px] font-black uppercase text-[#092D32]">
                              <th className="py-3 px-4 w-12 text-center">No.</th>
                              <th className="py-3 px-4">Aspek Penilaian</th>
                              <th className="py-3 px-3 text-center text-white bg-[#EA4335]">
                                K (Kurang)
                              </th>
                              <th className="py-3 px-3 text-center text-[#092D32] bg-[#FBBC05]">
                                C (Cukup)
                              </th>
                              <th className="py-3 px-3 text-center text-white bg-[#34A853]">
                                B (Baik)
                              </th>
                              <th className="py-3 px-3 text-center text-white bg-[#4285F4]">
                                SB (Sangat Baik)
                              </th>
                              <th className="py-3 px-4 text-right w-44">
                                Nilai (Skor / Maks)
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {group.aspects.map((asp) => {
                              const currentVal = portalData?.scores?.[asp.id];
                              const hasScore =
                                currentVal !== undefined &&
                                currentVal !== null &&
                                currentVal !== '';
                              return (
                                <tr key={asp.id} className="hover:bg-[#F5F8F6] transition">
                                  <td className="py-3 px-4 text-center font-mono font-bold text-[#64748B]">
                                    {asp.no}
                                  </td>
                                  <td className="py-3 px-4 font-bold text-[#092D32]">
                                    {asp.name}
                                  </td>
                                  {['K', 'C', 'B', 'SB'].map((tierKey) => (
                                    <td key={tierKey} className="py-2.5 px-2 text-center">
                                      <div className="flex flex-wrap items-center justify-center gap-1">
                                        {(asp.tiers[tierKey] || []).map((num) => {
                                          const isSelected =
                                            hasScore && Number(currentVal) === num;
                                          return (
                                            <button
                                              key={num}
                                              type="button"
                                              disabled={!hasAdminAccess}
                                              onClick={() =>
                                                handleSetAspectScore(
                                                  asp.id,
                                                  isSelected ? null : num,
                                                  asp.maxScore
                                                )
                                              }
                                              className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold transition tabular-nums ${
                                                isSelected
                                                  ? 'bg-[#006569] text-[#FFDD00] shadow-xs scale-105'
                                                  : hasAdminAccess
                                                  ? 'bg-slate-100 hover:bg-teal-100 text-[#092D32] cursor-pointer'
                                                  : 'bg-slate-100 text-[#64748B] cursor-default'
                                              }`}
                                            >
                                              {num}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </td>
                                  ))}
                                  <td className="py-3 px-4 text-right">
                                    <div className="inline-flex items-center justify-end gap-1.5 font-mono font-black text-sm tabular-nums">
                                      {hasAdminAccess ? (
                                        <input
                                          type="number"
                                          min="0"
                                          max={asp.maxScore}
                                          value={hasScore ? currentVal : ''}
                                          onChange={(e) =>
                                            handleSetAspectScore(
                                              asp.id,
                                              e.target.value,
                                              asp.maxScore
                                            )
                                          }
                                          placeholder="-"
                                          className="w-14 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-xs font-black text-slate-950 focus:border-[#006569] focus:outline-none"
                                        />
                                      ) : (
                                        <span
                                          className={
                                            hasScore ? 'text-[#006569]' : 'text-slate-400'
                                          }
                                        >
                                          {hasScore ? currentVal : '-'}
                                        </span>
                                      )}
                                      <span className="text-slate-400">/</span>
                                      <span className="text-[#092D32]">{asp.maxScore}</span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}

                {/* Pengurangan & Bonus */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EA4335]/30 overflow-hidden shadow-xs">
                    <div className="text-white px-6 py-4 flex items-center justify-between bg-[#EA4335]">
                      <h3 className="text-sm font-black uppercase tracking-wider">
                        Pengurangan Poin ( - )
                      </h3>
                      <span className="font-mono text-xs font-black tabular-nums">
                        Total: -{scoringSummary.totalPenalty} Poin
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                      {GERANAT_PENALTY_ITEMS.map((item) => {
                        const activeVal = portalData?.penalties?.[item.id];
                        const isChecked = activeVal !== undefined;
                        return (
                          <div
                            key={item.id}
                            className={`px-5 py-3 flex items-center justify-between gap-3 text-xs ${
                              isChecked ? 'bg-rose-50/80' : 'hover:bg-[#F5F8F6]'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="font-mono font-bold text-[#64748B] w-5">
                                {item.no}.
                              </span>
                              <span className="font-semibold text-[#092D32]">
                                {item.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono font-black text-[#EA4335] tabular-nums">
                                -{isChecked ? activeVal : item.pointsLabel}
                              </span>
                              {hasAdminAccess && (
                                <button
                                  type="button"
                                  onClick={() => handleTogglePenalty(item)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase cursor-pointer ${
                                    isChecked
                                      ? 'bg-[#EA4335] text-white'
                                      : 'bg-slate-100 text-[#64748B] hover:bg-rose-100'
                                  }`}
                                >
                                  {isChecked ? 'Aktif' : 'Tandai'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-white rounded-3xl border border-[#4285F4]/30 overflow-hidden shadow-xs h-fit">
                    <div className="text-white px-6 py-4 flex items-center justify-between bg-[#4285F4]">
                      <h3 className="text-sm font-black uppercase tracking-wider">
                        Penambahan Poin ( + )
                      </h3>
                      <span className="font-mono text-xs font-black tabular-nums">
                        Total: +{scoringSummary.totalBonus} Poin
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {GERANAT_BONUS_ITEMS.map((item) => {
                        const activeVal = portalData?.bonuses?.[item.id];
                        const isChecked = activeVal !== undefined;
                        return (
                          <div
                            key={item.id}
                            className={`px-5 py-3.5 flex items-center justify-between gap-3 text-xs ${
                              isChecked ? 'bg-blue-50/80' : 'hover:bg-[#F5F8F6]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-[#64748B] w-5">
                                {item.no}.
                              </span>
                              <span className="font-semibold text-[#092D32]">
                                {item.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono font-black text-[#4285F4] tabular-nums">
                                +{item.pointsLabel}
                              </span>
                              {hasAdminAccess && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleBonus(item)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase cursor-pointer ${
                                    isChecked
                                      ? 'bg-[#4285F4] text-white'
                                      : 'bg-slate-100 text-[#64748B] hover:bg-blue-100'
                                  }`}
                                >
                                  {isChecked ? 'Aktif' : 'Tandai'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
  );
}
