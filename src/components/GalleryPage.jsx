import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Home,
  ChevronRight,
  Camera,
  Calendar,
  MapPin,
  Search,
  ArrowRight,
  ExternalLink,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { Link } from '../lib/router.jsx';
import { useSiteContent } from '../data/siteConfig';
import { useCanvasStore } from '../lib/canvasStore.jsx';
import { mergeGalleryAlbumsWithRegistry } from '../lib/contentRegistryBridge';

export function GalleryPage() {
  const { content } = useSiteContent();
  let registry = [];
  try {
    const store = useCanvasStore();
    registry = store?.contentRegistry || [];
  } catch {
    registry = [];
  }
  const [selectedTag, setSelectedTag] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAlbum, setActiveAlbum] = useState(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (activeAlbum) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [activeAlbum]);

  const mergedAlbums = useMemo(
    () => mergeGalleryAlbumsWithRegistry(content.galleryAlbums || [], registry),
    [content.galleryAlbums, registry]
  );

  const categories = useMemo(() => {
    const unique = Array.from(new Set(mergedAlbums.map((a) => a.tag).filter(Boolean)));
    return ['Semua', ...unique];
  }, [mergedAlbums]);

  const filteredAlbums = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return mergedAlbums.filter((album) => {
      if (selectedTag !== 'Semua' && album.tag !== selectedTag) return false;
      if (!q) return true;
      return (
        album.title.toLowerCase().includes(q) ||
        album.description.toLowerCase().includes(q) ||
        album.location.toLowerCase().includes(q) ||
        album.tag.toLowerCase().includes(q)
      );
    });
  }, [mergedAlbums, selectedTag, searchQuery]);

  const openAlbumModal = (album) => {
    setActiveAlbum(album);
    setActiveSlideIdx(0);
  };

  const modalPhotos = useMemo(() => {
    if (!activeAlbum) return [];
    if (Array.isArray(activeAlbum.photos) && activeAlbum.photos.length > 0) {
      return activeAlbum.photos;
    }
    return [
      {
        url: activeAlbum.image || '/foto-kampus-unj.jpg',
        caption: activeAlbum.description || activeAlbum.title,
      },
    ];
  }, [activeAlbum]);

  const currentSlide = modalPhotos[activeSlideIdx] || modalPhotos[0] || {
    url: '/foto-kampus-unj.jpg',
    caption: '',
  };

  return (
    <div className="min-h-screen bg-[#F5F8F6] dark:bg-slate-950 font-sans selection:bg-[#006569] selection:text-[#FFDD00] flex flex-col">
      {/* HEADER GALERI DOKUMENTASI */}
      <section className="relative overflow-hidden bg-[#092D32] py-5 md:py-14 text-white border-b border-[#006569]/40">
        <div className="absolute inset-0 z-0 select-none pointer-events-none opacity-20">
          <img
            src="/foto-kampus-unj.jpg"
            alt=""
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            className="h-full w-full object-cover object-center filter blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#021B25] via-[#092D32]/95 to-[#021B25]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-2.5 md:space-y-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] md:text-xs font-bold text-slate-300">
            <Link to="/" className="inline-flex items-center gap-1 transition hover:text-[#FFDD00]">
              <Home size={12} className="md:w-[13px] md:h-[13px]" />
              <span>Beranda</span>
            </Link>
            <ChevronRight size={12} className="text-slate-500 md:w-[13px] md:h-[13px]" />
            <span className="text-[#FFDD00]">Dinding Galeri Lensa</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2.5 md:gap-4">
            <div className="space-y-1.5 md:space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-0.5 md:px-3 md:py-1 rounded-md bg-white/10 border border-white/20 text-[10px] md:text-[11px] font-mono font-bold uppercase tracking-wider text-[#FFDD00]">
                <Camera size={12} className="md:w-[14px] md:h-[14px]" />
                <span>ARSIP VISUAL &amp; DOKUMENTASI RESMI SATUAN</span>
              </div>
              <h1 className="text-xl md:text-4xl font-black tracking-tight text-white">
                Dinding Galeri Lensa Menwa UNJ
              </h1>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed line-clamp-2 md:line-clamp-none">
                Rekaman dokumentasi giat pendidikan militer, kompetisi nasional Ksatria Cendekia VIII &amp; GERANAT VII, seminar kepemudaan Youth Spark, serta ekspedisi pengabdian masyarakat.
              </p>
            </div>

            <a
              href="https://www.instagram.com/menwa.unjakarta/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] md:text-xs font-black uppercase tracking-wider text-white transition shrink-0 self-start md:self-auto"
            >
              <ImageIcon size={13} className="text-[#FFDD00] md:w-[15px] md:h-[15px]" />
              <span>Instagram Resmi @menwa.unjakarta</span>
              <ExternalLink size={12} className="md:w-[13px] md:h-[13px]" />
            </a>
          </div>
        </div>
      </section>

      {/* FILTER & GRID ALBUM */}
      <main className="flex-grow mx-auto max-w-7xl w-full px-3 sm:px-6 lg:px-8 py-4 md:py-10 space-y-4 md:space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-4 bg-white dark:bg-slate-900 p-2.5 md:p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex overflow-x-auto no-scrollbar md:flex-wrap items-center gap-1.5 md:gap-2 pb-0.5 md:pb-0" role="tablist" aria-label="Filter kategori galeri">
            {categories.map((cat) => {
              const active = selectedTag === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedTag(cat)}
                  className={`shrink-0 px-3 py-1.5 md:px-3.5 md:py-2 rounded-xl text-[11px] md:text-xs font-black transition cursor-pointer ${
                    active
                      ? 'bg-[#006569] text-[#FFDD00] shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="search"
              aria-label="Cari dokumentasi kegiatan"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul, lokasi, kategori..."
              className="w-full pl-8 pr-3 py-1.5 md:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#006569]"
            />
          </div>
        </div>

        {filteredAlbums.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-10 text-center space-y-3">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Tidak ditemukan dokumentasi yang sesuai dengan kata kunci pencarian.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedTag('Semua');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-[#006569] text-[#FFDD00] text-xs font-black uppercase cursor-pointer"
            >
              Tampilkan Semua Album
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-6">
            {filteredAlbums.map((album) => (
              <article
                key={album.id}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-[#006569] rounded-xl md:rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl transition"
              >
                <div>
                  <div className="relative aspect-[4/3] md:aspect-[16/10] bg-slate-900 overflow-hidden">
                    <img
                      src={album.image || '/foto-kampus-unj.jpg'}
                      alt={album.title}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = '/foto-kampus-unj.jpg';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-1.5 left-1.5 md:top-3 md:left-3 px-1.5 py-0.5 md:px-2.5 md:py-1 rounded bg-slate-950/85 text-[#FFDD00] text-[8.5px] md:text-[10px] font-black uppercase tracking-wider">
                      {album.tag}
                    </span>
                    {album.photos && album.photos.length > 1 && (
                      <span className="absolute top-1.5 right-1.5 md:top-3 md:right-3 px-1.5 py-0.5 md:px-2.5 md:py-1 rounded bg-slate-950/85 text-white text-[8.5px] md:text-[10px] font-mono font-bold">
                        {album.photos.length} Foto
                      </span>
                    )}
                    <span className="absolute bottom-1.5 right-1.5 md:bottom-2.5 md:right-2.5 px-1.5 py-0.5 md:px-2.5 md:py-1 rounded bg-[#006569]/95 text-white text-[8.5px] md:text-[10px] font-bold">
                      {album.status}
                    </span>
                  </div>

                  <div className="p-2.5 md:p-5 space-y-1 md:space-y-2.5">
                    <h2 className="text-xs md:text-lg font-black text-slate-900 dark:text-white leading-snug line-clamp-2 md:line-clamp-none">
                      {album.title}
                    </h2>
                    <p className="text-[10.5px] md:text-xs text-slate-600 dark:text-slate-300 leading-snug md:leading-relaxed line-clamp-2 md:line-clamp-3">
                      {album.description}
                    </p>
                    <div className="pt-1.5 md:pt-2 border-t border-slate-100 dark:border-white/10 space-y-0.5 md:space-y-1 text-[10px] md:text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1 md:gap-1.5">
                        <Calendar size={11} className="text-[#006569] shrink-0 md:w-[13px] md:h-[13px]" />
                        <span className="truncate">{album.date}</span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-1.5">
                        <MapPin size={11} className="text-[#006569] shrink-0 md:w-[13px] md:h-[13px]" />
                        <span className="truncate">{album.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-2.5 py-2 md:px-5 md:py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-white/10 flex flex-col items-start md:flex-row md:items-center justify-between gap-1 md:gap-2">
                  <button
                    type="button"
                    onClick={() => openAlbumModal(album)}
                    className="text-[10.5px] md:text-xs font-black text-[#006569] dark:text-[#FFDD00] hover:underline cursor-pointer text-left"
                  >
                    <span className="md:hidden">Lihat Album</span>
                    <span className="hidden md:inline">Lihat Detail Dokumentasi</span>
                  </button>
                  <Link
                    to={album.route || '/'}
                    className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#006569]"
                  >
                    <span>Halaman Giat</span>
                    <ArrowRight size={11} className="md:w-[13px] md:h-[13px]" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* MODAL DETAIL DOKUMENTASI + MULTI-SLIDE (PORTAL KE BODY AGAR VIEWPORT FIXED & SCROLL AMAN) */}
      {activeAlbum &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-modal-title"
            className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in font-sans"
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveAlbum(null);
            }}
          >
            <div
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video max-h-[44vh] bg-slate-950 shrink-0">
                <img
                  src={currentSlide.url || activeAlbum.image || '/foto-kampus-unj.jpg'}
                  alt={currentSlide.caption || activeAlbum.title}
                  onError={(e) => {
                    e.currentTarget.src = '/foto-kampus-unj.jpg';
                  }}
                  className="w-full h-full object-contain bg-slate-950"
                />
                <button
                  type="button"
                  aria-label="Tutup pratinjau dokumentasi"
                  onClick={() => setActiveAlbum(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 text-white hover:bg-slate-900 cursor-pointer z-10"
                >
                  <X size={18} />
                </button>
                {modalPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Foto sebelumnya"
                      onClick={() =>
                        setActiveSlideIdx((idx) => (idx - 1 + modalPhotos.length) % modalPhotos.length)
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 px-3 py-2 rounded-full bg-slate-950/80 text-white hover:bg-[#FFDD00] hover:text-slate-950 text-xs font-black cursor-pointer z-10"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      aria-label="Foto berikutnya"
                      onClick={() =>
                        setActiveSlideIdx((idx) => (idx + 1) % modalPhotos.length)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-2 rounded-full bg-slate-950/80 text-white hover:bg-[#FFDD00] hover:text-slate-950 text-xs font-black cursor-pointer z-10"
                    >
                      ›
                    </button>
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/85 text-[#FFDD00] font-mono text-[11px] font-bold z-10">
                      Slide {activeSlideIdx + 1} / {modalPhotos.length}
                    </span>
                  </>
                )}
              </div>
              {modalPhotos.length > 1 && (
                <div className="px-6 pt-2 pb-2 flex items-center gap-2 overflow-x-auto bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-white/10 shrink-0">
                  {modalPhotos.map((ph, idx) => (
                    <button
                      key={`${ph.contentId || idx}-${ph.url}`}
                      type="button"
                      aria-label={`Pilih foto ke-${idx + 1}`}
                      onClick={() => setActiveSlideIdx(idx)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition ${
                        idx === activeSlideIdx
                          ? 'border-[#006569] ring-2 ring-[#FFDD00]'
                          : 'border-transparent opacity-65 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={ph.url}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.src = '/foto-kampus-unj.jpg';
                        }}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              <div className="p-5 sm:p-6 space-y-3 overflow-y-auto flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-[#006569] text-[#FFDD00] text-[10px] font-black uppercase">
                    {activeAlbum.tag}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                    {activeAlbum.status}
                  </span>
                </div>
                <h3 id="gallery-modal-title" className="text-xl font-black text-slate-900 dark:text-white">
                  {activeAlbum.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentSlide.caption || activeAlbum.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#006569]" />
                    {activeAlbum.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#006569]" />
                    {activeAlbum.location}
                  </span>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveAlbum(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    Tutup
                  </button>
                  <Link
                    to={activeAlbum.route || '/'}
                    onClick={() => setActiveAlbum(null)}
                    className="px-5 py-2 rounded-xl bg-[#006569] hover:bg-[#005154] text-[#FFDD00] text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 transition"
                  >
                    <span>Buka Halaman Terkait</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default GalleryPage;

