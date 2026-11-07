import React from 'react';
import {
  Sparkles,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileCheck,
  Users,
  CheckCircle2,
  AlertCircle,
  Download,
  Calendar,
  Lock,
} from 'lucide-react';
import { playTactileClick } from '../../lib/tactileAudio.js';

export function ParticipantModuleBeranda({
  detectedSchoolName,
  activeSlug,
  completionProgress,
  portalData,
  setActiveModule,
  totalPasukan,
  totalOfficial,
  openKtaViewer,
  exportOfficialZipArchive,
  isExportingZip,
  printNomorUrutPdf,
  printTeamRosterPdf,
  printPaktaIntegritasPdf,
  TIMELINE_EVENTS,
  selectedTimelineId,
  setSelectedTimelineId,
  isGuestMode,
}) {
  return (
              <div className="space-y-8 animate-fade-in">
                {/* DUA KARTU SOROTAN UTAMA (TOP HIGHLIGHT CARDS) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  {/* KARTU SOROTAN 1: KELENGKAPAN ADMINISTRASI & BERKAS */}
                  <div className="relative rounded-[2.25rem] neu-card p-6 flex flex-col justify-between overflow-hidden">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-14 h-14 rounded-2xl neu-logo-tile flex items-center justify-center text-[#006569] shrink-0">
                            <FolderOpen size={26} />
                          </div>
                          <div>
                            <span className="text-[11px] font-black uppercase tracking-wider text-[#006569]">
                              SOROTAN ADMINISTRASI
                            </span>
                            <h3 className="text-lg font-black text-[#092D32] leading-snug">
                              Kelengkapan Berkas &amp; Juknis
                            </h3>
                            <p className="text-xs text-[#64748B] mt-0.5">
                              {completedMilestonesCount} dari 7 persyaratan utama terverifikasi
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono text-2xl font-black text-[#006569] tabular-nums">
                            {adminOverviewPct}%
                          </span>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">
                            Tuntas
                          </span>
                        </div>
                      </div>

                      {/* Step Milestones Bulatan Angka (1 s.d 7) */}
                      <div className="mt-6">
                        <div className="flex items-center justify-between gap-1">
                          {ADMIN_MILESTONES.map((ms) => (
                            <div
                              key={ms.id}
                              className="flex flex-col items-center flex-1 text-center"
                            >
                              <div
                                className={`w-7 h-7 rounded-full font-mono text-[11px] font-black flex items-center justify-center transition ${
                                  ms.done
                                    ? 'bg-[#006569] text-[#FFDD00] shadow-xs'
                                    : 'neu-inset text-slate-400'
                                }`}
                              >
                                {ms.done ? <Check size={13} /> : ms.step}
                              </div>
                              <span className="mt-1.5 text-[10px] font-bold text-slate-600 line-clamp-1">
                                {ms.label}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 w-full h-2.5 rounded-full neu-inset overflow-hidden p-0.5">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(6, adminOverviewPct)}%`,
                              background: 'linear-gradient(90deg, #006569 0%, #059669 100%)',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200/70 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-500">
                        Berkas wajib: <strong className="font-mono text-[#092D32]">{progress.berkasCount}/5</strong> terunggah
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveModule('pemberkasan')}
                        className="px-4 py-2.5 rounded-2xl neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg transition-all"
                      >
                        <span>Kelola Berkas</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* KARTU SOROTAN 2: STATUS PASUKAN & PENILAIAN EVALUASI */}
                  <div className="relative rounded-[2.25rem] neu-card p-6 flex flex-col justify-between overflow-hidden">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 shrink-0">
                            <Users size={26} />
                          </div>
                          <div>
                            <span className="text-[11px] font-black uppercase tracking-wider text-amber-700">
                              SOROTAN PASUKAN &amp; EVALUASI
                            </span>
                            <h3 className="text-lg font-black text-[#092D32] leading-snug">
                              Kuota Personel &amp; Rekap Juri
                            </h3>
                            <p className="text-xs text-[#64748B] mt-0.5">
                              16 Pasukan Inti + 2 Cadangan + 2 Official Pendamping
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono text-2xl font-black text-[#092D32] tabular-nums">
                            {progress.biodataCount}<span className="text-sm text-slate-400">/20</span>
                          </span>
                          <span className="block text-[10px] font-bold text-amber-700 uppercase">
                            Personel
                          </span>
                        </div>
                      </div>

                      {/* Rincian Kuota & Status Evaluasi Dewan Juri */}
                      <div className="mt-5 grid grid-cols-3 gap-2.5">
                        <div className="rounded-xl bg-[#F5F8F6] border border-slate-200/80 p-3">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">
                            Pasukan Peleton
                          </span>
                          <strong className="font-mono text-base font-black text-[#092D32] tabular-nums">
                            {progress.pasukanCount} / 18
                          </strong>
                        </div>
                        <div className="rounded-xl bg-[#F5F8F6] border border-slate-200/80 p-3">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">
                            Official Tim
                          </span>
                          <strong className="font-mono text-base font-black text-[#006569] tabular-nums">
                            {progress.officialCount} / 2
                          </strong>
                        </div>
                        <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3">
                          <span className="text-[10px] font-bold text-amber-800 uppercase block">
                            Skor Evaluasi
                          </span>
                          <strong className="font-mono text-base font-black text-amber-900 tabular-nums">
                            {progress.scoredAspectsCount > 0
                              ? `${scoringSummary.finalScore} Poin`
                              : 'Tertutup'}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      {/* Avatar Stack */}
                      <div className="flex items-center gap-2">
                        {allTeamMembers.length > 0 ? (
                          <div className="flex -space-x-2 overflow-hidden">
                            {allTeamMembers.slice(0, 5).map((m, i) => (
                              <div
                                key={m.id || i}
                                className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-slate-200 overflow-hidden"
                                title={m.fullName}
                              >
                                {m.photoDataUrl ? (
                                  <img
                                    src={m.photoDataUrl}
                                    alt={m.fullName}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-slate-700">
                                    {(m.fullName || 'P')[0]}
                                  </span>
                                )}
                              </div>
                            ))}
                            {allTeamMembers.length > 5 && (
                              <span className="inline-flex h-7 px-2 items-center justify-center rounded-full bg-[#092D32] text-[#FFDD00] ring-2 ring-white font-mono text-[10px] font-black">
                                +{allTeamMembers.length - 5} lainnya
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            Belum ada personel diinput
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveModule('biodata')}
                          className="px-4 py-2.5 rounded-2xl neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg transition-all"
                        >
                          <span>Biodata Tim</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GRID KARTU MODULAR BAWAH ("ALL MODULES GRID" — 3D NEUMORPHIC CUSHIONS) */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-[#092D32]">
                        Semua Modul Manajemen Kontingen
                      </h3>
                      <p className="text-xs text-[#64748B]">
                        Pilih modul untuk melengkapi data sekolah, berkas, biodata 20 anggota, jadwal teknis, atau melihat lembar nilai juri.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {MODULE_CARDS.map((card) => {
                      const IconComp = card.icon;
                      return (
                        <div
                          key={card.id}
                          onClick={() => setActiveModule(card.id)}
                          className="group cursor-pointer rounded-3xl neu-card p-5 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                        >
                          <div>
                            {/* Header Aksen Lembut */}
                            <div
                              className={`rounded-2xl bg-gradient-to-r ${card.accentBg} p-4 flex items-center justify-between mb-4`}
                            >
                              <div className="w-11 h-11 rounded-2xl neu-logo-tile flex items-center justify-center text-[#092D32]">
                                <IconComp size={22} className="text-[#006569]" />
                              </div>
                              <span
                                className={`font-mono text-xs font-black ${card.accentText} tabular-nums`}
                              >
                                {card.statusText}
                              </span>
                            </div>

                            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                              MODUL {card.number}
                            </div>
                            <h4 className="text-base font-black text-[#092D32] group-hover:text-[#006569] transition mt-0.5">
                              {card.title}
                            </h4>
                            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                              {card.subtitle}
                            </p>
                          </div>

                          <div className="mt-5 pt-3.5 border-t border-slate-200/60 space-y-2.5">
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="text-slate-500">Progres Modul</span>
                              <span className="font-mono font-black text-[#092D32] tabular-nums">
                                {card.progress}%
                              </span>
                            </div>
                            <div className="w-full h-2.5 rounded-full neu-inset overflow-hidden p-0.5">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.max(6, card.progress)}%`,
                                  backgroundColor: card.barColor,
                                }}
                              />
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              {card.showAvatars && allTeamMembers.length > 0 ? (
                                <div className="flex items-center -space-x-1.5">
                                  {allTeamMembers.slice(0, 4).map((m, idx) => (
                                    <div
                                      key={m.id || idx}
                                      className="h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 overflow-hidden"
                                    >
                                      {m.photoDataUrl ? (
                                        <img
                                          src={m.photoDataUrl}
                                          alt=""
                                          className="h-full w-full object-cover"
                                        />
                                      ) : null}
                                    </div>
                                  ))}
                                  {allTeamMembers.length > 4 && (
                                    <span className="pl-2.5 font-mono text-[10px] font-bold text-slate-500">
                                      +{allTeamMembers.length - 4} lainnya
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[11px] font-bold text-slate-400">
                                  Klik untuk membuka
                                </span>
                              )}

                              <span className="inline-flex items-center gap-1 text-xs font-black px-3.5 py-1.5 rounded-xl bg-slate-100 group-hover:bg-[#006569] text-[#092D32] group-hover:text-[#FFDD00] transition-all shadow-xs">
                                <span>Buka</span>
                                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================
                MODULE 1: PROFIL SEKOLAH
  );
}
