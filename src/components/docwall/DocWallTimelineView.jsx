import React from 'react';
import { MapPin, Images, Heart, MessageSquare } from 'lucide-react';
import { cleanCaptionText } from './docwallUtils.js';

export function DocWallTimelineView({
  postsByYear,
  openLightbox,
  handleToggleLike,
}) {
  return (
          <div className="space-y-10 py-4 max-w-4xl mx-auto">
            {postsByYear.map(({ year, items }) => (
              <div key={year} className="space-y-6">
                {/* Header Tahun Anggaran */}
                <div className="flex items-center gap-3">
                  <div className="px-4 py-1.5 rounded-2xl neu-btn-primary text-[#FFDD00] font-black text-sm tracking-wider">
                    TAHUN ANGGARAN {year}
                  </div>
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-[#006569]/40 to-transparent" />
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {items.length} Agenda Selesai
                  </span>
                </div>

                {/* Timeline Spine */}
                <div className="relative border-l-2 border-[#006569]/30 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-6">
                  {items.map((post) => {
                    const coverPhoto = post.photos?.[0]?.url || '/foto-kampus-unj.jpg';
                    return (
                      <div key={post.id} className="relative group">
                        {/* Node Badge on the timeline */}
                        <div className="absolute -left-[31px] sm:-left-[39px] top-4 w-5 h-5 rounded-full bg-[#006569] border-4 border-[#F5F8F6] shadow-md group-hover:scale-125 transition-transform" />

                        {/* Card */}
                        <div className="rounded-3xl neu-card p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black text-[#006569] px-2 py-0.5 rounded-lg bg-teal-50 border border-teal-200">
                                {post.monthName} {post.year}
                              </span>
                              <span className="text-xs font-bold text-slate-500">· {post.category}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                              <MapPin size={12} className="text-[#006569]" />
                              <span>{post.location}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                            <div
                              onClick={() => openLightbox(post, 0, false)}
                              className="sm:col-span-4 aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 cursor-pointer select-none relative group/thumb"
                            >
                              <img
                                src={coverPhoto}
                                alt={post.prokerName}
                                onError={(e) => {
                                  e.currentTarget.src = '/foto-kampus-unj.jpg';
                                }}
                                className="w-full h-full object-cover transition duration-300 group-hover/thumb:scale-105"
                              />
                              <div className="absolute bottom-1.5 right-1.5 bg-black/70 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold text-white">
                                {post.photos?.length || 1} Foto
                              </div>
                            </div>

                            <div className="sm:col-span-8 space-y-2">
                              <h3 className="text-base font-black text-[#092D32]">
                                {post.prokerName}
                              </h3>
                              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                {cleanCaptionText(post.caption)}
                              </p>
                              <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-3 text-xs font-bold text-[#092D32]">
                                  <span className="flex items-center gap-1">
                                    <Heart size={14} className="fill-[#E11D48] text-[#E11D48]" />
                                    <span className="font-mono">{post.likes}</span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MessageCircle size={14} />
                                    <span className="font-mono">{post.comments?.length || 0}</span>
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => openLightbox(post, 0, false)}
                                  className="inline-flex items-center gap-1 text-xs font-black text-[#006569] hover:underline cursor-pointer"
                                >
                                  <span>Lihat Foto Lengkap</span>
                                  <ArrowRight size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
  );
}