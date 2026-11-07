import React from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, MapPin, Heart, Share2, Bookmark, Send } from 'lucide-react';
import { cleanCaptionText, formatCommentTime } from './docwallUtils.js';

export function DocWallLightbox({
  activeModalPost,
  activeSlideIndex,
  setActiveSlideIndex,
  onClose,
  handleToggleLike,
  handleSharePost,
  handleToggleBookmark,
  isLoggedIn,
  submitPostComment,
  commentText,
  setCommentText,
  commentInputRef,
  onOpenAuth,
}) {
  if (!activeModalPost) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col lg:flex-row max-h-[95vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-[#F5F8F6] text-[#092D32] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup Modal */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup modal"
          className="absolute top-4 right-4 z-40 p-2 rounded-full neu-btn text-slate-600 hover:text-rose-600 transition cursor-pointer shadow-md"
        >
          <X size={18} />
        </button>

        {/* Sisi Kiri: Carousel Foto Layar Lebar */}
        <div className="relative flex lg:flex-1 aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto items-center justify-center overflow-hidden bg-black">
          <img
            src={
              activeModalPost.photos?.[activeSlideIndex]?.url ||
              activeModalPost.photos?.[0]?.url ||
              '/foto-kampus-unj.jpg'
            }
            alt={
              activeModalPost.photos?.[activeSlideIndex]?.caption ||
              activeModalPost.prokerName
            }
            onError={(e) => {
              e.currentTarget.src = '/foto-kampus-unj.jpg';
            }}
            className="max-h-full max-w-full object-contain select-none"
          />

          {/* Tombol Slide Sebelumnya / Berikutnya */}
          {(activeModalPost.photos?.length || 0) > 1 && (
            <>
              <button
                type="button"
                onClick={() => {
                  const len = activeModalPost.photos.length;
                  setActiveSlideIndex((prev) => (prev - 1 + len) % len);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-[#FFDD00] text-white hover:text-[#092D32] flex items-center justify-center transition cursor-pointer shadow-md z-20"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={() => {
                  const len = activeModalPost.photos.length;
                  setActiveSlideIndex((prev) => (prev + 1) % len);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-[#FFDD00] text-white hover:text-[#092D32] flex items-center justify-center transition cursor-pointer shadow-md z-20"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* Indikator Posisi Foto */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white font-mono text-xs font-black z-20">
            {activeSlideIndex + 1} / {activeModalPost.photos?.length || 1}
          </div>
        </div>

        {/* Sisi Kanan: Panel Info, Narasi & Komentar */}
        <div className="flex flex-col justify-between p-6 sm:p-7 lg:w-[420px] max-h-[85vh] lg:max-h-[92vh] overflow-y-auto space-y-4">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#006569] bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-lg">
                  {activeModalPost.category || 'PROGRAM KERJA'}
                </span>
                <span className="font-mono text-xs font-bold text-slate-500">
                  {activeModalPost.monthCode} {activeModalPost.year}
                </span>
              </div>

              <h2 className="mt-2 text-xl font-black text-[#092D32]">
                {activeModalPost.prokerName}
              </h2>

              <div className="mt-1 flex items-center gap-1.5 text-xs text-[#64748B] font-semibold">
                <MapPin size={13} className="text-[#006569] shrink-0" />
                <span>{activeModalPost.location}</span>
              </div>
            </div>

            <div className="rounded-2xl neu-inset p-3.5 space-y-1.5">
              <p className="text-xs leading-relaxed text-slate-800 font-medium">
                {cleanCaptionText(activeModalPost.caption)}
              </p>
              {activeModalPost.narrativeReport && (
                <p className="text-xs leading-relaxed text-slate-500 pt-1.5 border-t border-slate-200/70">
                  {activeModalPost.narrativeReport}
                </p>
              )}
            </div>

            {/* Tombol Interaksi */}
            <div className="flex items-center gap-2 pt-1 border-b border-slate-200 pb-3">
              <button
                type="button"
                onClick={() => handleToggleLike(activeModalPost, false)}
                className="inline-flex items-center gap-1.5 rounded-2xl neu-btn px-4 py-2 text-xs font-black text-[#092D32] cursor-pointer"
              >
                <Heart
                  size={17}
                  className={
                    activeModalPost.isLiked
                      ? 'fill-[#E11D48] text-[#E11D48]'
                      : 'text-[#092D32]'
                  }
                />
                <span className="font-mono tabular-nums">{activeModalPost.likes}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSharePost(activeModalPost)}
                className="inline-flex items-center gap-1.5 rounded-2xl neu-btn px-3.5 py-2 text-xs font-black text-[#092D32] cursor-pointer"
              >
                <Share2 size={15} />
                <span>Bagikan</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleBookmark(activeModalPost.id)}
                className="p-2 rounded-2xl neu-btn text-[#092D32] cursor-pointer"
              >
                <Bookmark
                  size={16}
                  className={
                    activeModalPost.isBookmarked
                      ? 'fill-[#006569] text-[#006569]'
                      : 'text-[#092D32]'
                  }
                />
              </button>
            </div>

            {/* Daftar Komentar */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#006569]">
                Apresiasi &amp; Komentar ({activeModalPost.comments?.length || 0})
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(activeModalPost.comments || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Belum ada komentar pada album ini.
                  </p>
                ) : (
                  activeModalPost.comments.map((cmt) => (
                    <div key={cmt.id} className="rounded-2xl bg-white border border-slate-200/80 p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-black text-[#006569]">@{cmt.author}</span>
                        <span className="font-mono text-slate-400 text-[10px]">
                          {formatCommentTime(cmt)}
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium">{cmt.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Formulir Tulis Komentar */}
          <div className="pt-2 border-t border-slate-200">
            {isLoggedIn ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitPostComment(activeModalPost, commentText, setCommentText);
                }}
                className="flex items-center gap-2"
              >
                <div className="flex-1 rounded-2xl bg-white border-2 border-slate-300 focus-within:border-[#006569] px-3.5 py-2 shadow-inner">
                  <input
                    ref={commentInputRef}
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
                    placeholder="Tulis apresiasi kegiatan..."
                    className="w-full bg-white text-black text-xs font-bold placeholder:text-slate-400 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="inline-flex items-center gap-1 rounded-2xl neu-btn-primary px-3.5 py-2.5 text-xs font-black text-[#FFDD00] shadow-sm cursor-pointer disabled:opacity-40"
                >
                  <Send size={14} />
                </button>
              </form>
            ) : (
              <div className="rounded-2xl neu-inset p-3 text-center space-y-1.5">
                <p className="text-xs text-slate-600 font-semibold">
                  Masuk akun untuk memberikan komentar pada dokumentasi ini.
                </p>
                {onOpenAuth && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="neu-btn-strong-blue px-5 py-2 rounded-full text-xs font-black text-white cursor-pointer shadow-sm"
                  >
                    Login Akun
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

