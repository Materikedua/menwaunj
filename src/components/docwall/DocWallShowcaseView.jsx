import React from 'react';
import { Images, ArrowUpRight } from 'lucide-react';
import { playTactileClick } from '../../lib/tactileAudio.js';
import { cleanCaptionText } from './docwallUtils.js';

export function DocWallShowcaseView({
  filteredPosts,
  openLightbox,
}) {
  return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPosts.map((post) => {
                const photosCount = post.photos?.length || 1;
                const coverUrl = post.photos?.[0]?.url || '/foto-kampus-unj.jpg';
                const dateBadge = `${post.monthCode || ''} ${post.year || ''}`.trim() || 'OKT 2026';

                return (
                  <article
                    key={post.id}
                    onClick={() => {
                      playTactileClick('pop');
                      openLightbox(post, 0, false);
                    }}
                    className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* Container Foto Cover dengan Badges */}
                      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-sm mb-4">
                        <img
                          src={coverUrl}
                          alt={post.prokerName}
                          onError={(e) => {
                            e.currentTarget.src = '/foto-kampus-unj.jpg';
                          }}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        {/* Badge Jumlah Foto (Kiri Bawah) */}
                        <div className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white text-[11px] font-black tracking-wider shadow-sm">
                          <Camera size={13} className="text-[#FFDD00]" />
                          <span>{photosCount} FOTO</span>
                        </div>
                        {/* Badge Bulan/Tahun (Kanan Atas) */}
                        <div className="absolute top-2.5 right-2.5 inline-flex items-center px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[#FFDD00] text-[11px] font-mono font-black tracking-wider shadow-sm">
                          <span>{dateBadge}</span>
                        </div>
                      </div>

                      {/* Info Konten Album */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-black uppercase tracking-wider text-[#006569]">
                          {post.category || 'PROGRAM KERJA'}
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug line-clamp-1 group-hover:text-[#006569] transition-colors">
                          {post.prokerName}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 pt-0.5">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{post.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tombol Footer Buka Album */}
                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playTactileClick('pop');
                          openLightbox(post, 0, false);
                        }}
                        className="inline-flex items-center gap-1 text-xs sm:text-sm font-black text-slate-800 group-hover:text-[#006569] transition-colors cursor-pointer py-1"
                      >
                        <span>Buka Album</span>
                        <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredPosts.length === 0 && (
              <div className="neu-card rounded-3xl p-12 text-center text-slate-500 space-y-2">
                <FolderOpen size={36} className="mx-auto text-slate-400 opacity-60" />
                <p className="font-bold text-sm">Tidak ada album dokumentasi yang cocok dengan pencarian.</p>
              </div>
            )}
          </div>
  );
}