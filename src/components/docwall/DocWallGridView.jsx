import React from 'react';
import { MapPin, Images, Heart, MessageSquare, Share2, Bookmark } from 'lucide-react';
import { cleanCaptionText } from './docwallUtils.js';

export function DocWallGridView({
  filteredPosts,
  selectedYear,
  selectedCategoryGroup,
  handleToggleLike,
  openLightbox,
  handleSharePost,
  handleToggleBookmark,
}) {
  return (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500">
              <span>Menampilkan <strong className="text-[#092D32]">{filteredPosts.length}</strong> Album Dokumentasi</span>
              <span className="font-mono text-[11px] text-[#006569]">{selectedYear} · {selectedCategoryGroup}</span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPosts.map((post) => {
                const coverPhoto = post.photos?.[0]?.url || '/foto-kampus-unj.jpg';
                const photoCount = post.photos?.length || 1;
                return (
                  <article
                    key={post.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl neu-card transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                  >
                    <div>
                      {/* Kartu Header Info */}
                      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#006569] to-[#092D32] p-0.5 shrink-0 shadow-xs">
                            <div className="w-full h-full rounded-[10px] bg-white p-0.5 flex items-center justify-center">
                              <img
                                src="/logo-menwa-unj.png"
                                alt="Menwa UNJ"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-xs font-black text-[#006569]">
                              {post.prokerName}
                            </h3>
                            <div className="flex items-center gap-1 truncate text-[11px] text-[#64748B]">
                              <MapPin size={11} className="shrink-0 text-[#006569]" />
                              <span className="truncate">{post.location}</span>
                            </div>
                          </div>
                        </div>

                        <span className="shrink-0 font-mono text-[11px] font-black text-[#092D32] px-2 py-0.5 rounded-lg bg-slate-100">
                          {post.monthCode} {post.year}
                        </span>
                      </div>

                      {/* Cover Photo Stage */}
                      <div
                        className="relative aspect-[16/10] w-full cursor-pointer overflow-hidden bg-slate-950 select-none group"
                        onDoubleClick={() => handleToggleLike(post, true)}
                        onClick={() => openLightbox(post, 0, false)}
                      >
                        <img
                          src={coverPhoto}
                          alt={`${post.prokerName} (${post.year})`}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = '/foto-kampus-unj.jpg';
                          }}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        {/* Badges Overlay */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-black/65 backdrop-blur-md px-2 py-0.5 text-[10px] font-black text-[#FFDD00] uppercase tracking-wider">
                            {post.category || 'DOKUMENTASI'}
                          </span>
                        </div>

                        <div className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-lg bg-black/65 backdrop-blur-md px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                          <Images size={11} className="text-[#FFDD00]" />
                          <span>{photoCount} Foto</span>
                        </div>

                        {/* Double-Click Heart Burst */}
                        {heartBurstPostId === post.id && (
                          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/20">
                            <Heart size={68} className="animate-ping fill-[#E11D48] text-[#E11D48]" />
                          </div>
                        )}
                      </div>

                      {/* Baris Aksi Interaktif */}
                      <div className="flex items-center justify-between px-4 pt-3">
                        <div className="flex items-center gap-3">
                          {/* Tombol Suka */}
                          <button
                            type="button"
                            onClick={() => handleToggleLike(post, false)}
                            aria-label="Sukai postingan"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#092D32] hover:text-[#E11D48] transition cursor-pointer"
                          >
                            <Heart
                              size={18}
                              className={
                                post.isLiked
                                  ? 'fill-[#E11D48] text-[#E11D48]'
                                  : 'text-[#092D32] hover:text-[#E11D48]'
                              }
                            />
                            <span className="font-mono tabular-nums font-bold">{post.likes}</span>
                          </button>

                          {/* Tombol Komentar */}
                          <button
                            type="button"
                            onClick={() => openLightbox(post, 0, true)}
                            aria-label="Komentar postingan"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#092D32] hover:text-[#006569] transition cursor-pointer"
                          >
                            <MessageCircle size={18} />
                            <span className="font-mono tabular-nums font-bold">
                              {post.comments?.length || 0}
                            </span>
                          </button>

                          {/* Tombol Bagikan */}
                          <button
                            type="button"
                            onClick={() => handleSharePost(post)}
                            aria-label="Bagikan tautan"
                            className="text-[#092D32] hover:text-[#006569] transition cursor-pointer"
                            title="Salin Tautan Album"
                          >
                            <Share2 size={17} />
                          </button>
                        </div>

                        {/* Tombol Simpan / Bookmark */}
                        <button
                          type="button"
                          onClick={() => handleToggleBookmark(post.id)}
                          aria-label="Simpan album"
                          className="text-[#092D32] hover:text-[#006569] transition cursor-pointer p-1"
                          title={post.isBookmarked ? 'Tersimpan' : 'Simpan Album'}
                        >
                          <Bookmark
                            size={17}
                            className={
                              post.isBookmarked
                                ? 'fill-[#006569] text-[#006569]'
                                : 'text-[#092D32]'
                            }
                          />
                        </button>
                      </div>

                      {/* Cuplikan Narasi Bersih */}
                      <div className="px-4 pb-4 pt-2 space-y-2">
                        <p className="line-clamp-2 text-xs leading-relaxed text-slate-700 font-medium">
                          {cleanCaptionText(post.caption)}
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            const targetIdx = filteredPosts.findIndex((p) => p.id === post.id);
                            if (targetIdx >= 0) {
                              setShowcaseAlbumIndex(targetIdx);
                              setShowcaseSlideIndex(0);
                              setViewMode('showcase');
                            }
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-black text-[#006569] hover:text-[#092D32] cursor-pointer"
                        >
                          <span>Buka di Showcase</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
  );
}
