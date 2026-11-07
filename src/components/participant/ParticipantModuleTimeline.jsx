import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export function ParticipantModuleTimeline({
  TIMELINE_EVENTS = [],
  selectedTimelineId,
  setSelectedTimelineId,
}) {
  const stages = TIMELINE_EVENTS || [];
  const selectedTimelineObj =
    stages.find((s) => s.id === selectedTimelineId) || stages[0];
  return (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#006569] block">
                    MODUL 04 · JADWAL &amp; RANGKAIAN PELAKSANAAN
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#092D32]">
                    Timeline Teknis Kegiatan
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Pilih tahapan kegiatan di kiri untuk membaca rincian teknis, waktu, dan target capaian.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-5 space-y-2.5">
                    {stages.map((stage) => {
                      const isSelected = stage.id === selectedTimelineId;
                      return (
                        <button
                          key={stage.id}
                          type="button"
                          onClick={() => setSelectedTimelineId(stage.id)}
                          className={`w-full text-left p-4 rounded-2xl border transition flex items-start gap-3.5 cursor-pointer ${
                            isSelected
                              ? 'bg-[#092D32] text-white border-[#006569] shadow-md'
                              : 'bg-[#F5F8F6] hover:bg-white text-[#092D32] border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-9 h-9 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-[#FFDD00] text-[#092D32]'
                                : 'bg-white text-[#006569] border border-slate-200'
                            }`}
                          >
                            {stage.step}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span
                              className={`text-[10px] font-bold uppercase block ${
                                isSelected ? 'text-[#FFDD00]' : 'text-[#006569]'
                              }`}
                            >
                              {stage.date}
                            </span>
                            <h4 className="font-black text-xs sm:text-sm leading-snug mt-0.5">
                              {stage.title}
                            </h4>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedTimelineObj && (
                    <div
                      className="lg:col-span-7 rounded-3xl text-white p-6 sm:p-8 shadow-xl space-y-5"
                      style={{
                        background:
                          'linear-gradient(135deg, #092D32 0%, #00474A 60%, #006569 100%)',
                      }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs font-black uppercase text-[#FFDD00]">
                          TAHAP {selectedTimelineObj.step} · {selectedTimelineObj.status}
                        </span>
                        <span className="text-xs font-mono text-teal-200 flex items-center gap-1.5">
                          <Clock size={14} /> {selectedTimelineObj.time}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-white">
                          {selectedTimelineObj.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-teal-100/90 mt-2 leading-relaxed">
                          {selectedTimelineObj.summary}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="rounded-2xl bg-white/10 p-3.5 flex items-center gap-2.5">
                          <Calendar size={16} className="text-[#FFDD00] shrink-0" />
                          <div>
                            <span className="text-[10px] text-teal-200 block">Tanggal</span>
                            <strong className="text-white">{selectedTimelineObj.date}</strong>
                          </div>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-3.5 flex items-center gap-2.5">
                          <MapPin size={16} className="text-[#FFDD00] shrink-0" />
                          <div>
                            <span className="text-[10px] text-teal-200 block">Lokasi</span>
                            <strong className="text-white">{selectedTimelineObj.location}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2.5 pt-2 border-t border-white/10">
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#FFDD00]">
                          Rincian Ketentuan &amp; Aktivitas:
                        </h4>
                        {selectedTimelineObj.details.map((det, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-slate-100">
                            <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{det}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
  );
}
