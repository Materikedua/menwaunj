import React, { useEffect } from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { Link } from '../lib/router.jsx';
import { DocumentationWall } from './DocumentationWall.jsx';

export function GalleryPage({ onOpenAuth = null }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F8F6] font-sans selection:bg-[#006569] selection:text-[#FFDD00]">
      {/* COMPACT HEADER BAR — Dirancang ringkas dan elegan untuk kenyamanan visual */}
      <section className="relative overflow-hidden bg-[#092D32] py-4 sm:py-5 text-white border-b border-[#006569]/40">
        <div className="absolute inset-0 z-0 select-none pointer-events-none opacity-25">
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

        <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Link to="/" className="inline-flex items-center gap-1 transition hover:text-[#FFDD00]">
                <Home size={13} />
                <span>Beranda</span>
              </Link>
              <ChevronRight size={13} className="text-slate-500" />
              <span className="text-[#FFDD00]">Galeri Dokumentasi</span>
            </nav>
            <span className="hidden sm:inline text-white/20">|</span>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Arsip Lensa &amp; <span className="text-[#FFDD00]">Dokumentasi Giat Menwa UNJ</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-300 font-mono tabular-nums shrink-0">
            <span><strong className="text-[#FFDD00]">12</strong> Proker Tahunan</span>
            <span aria-hidden="true">·</span>
            <span><strong className="text-white">24+</strong> Album Dokumentasi</span>
            <span aria-hidden="true">·</span>
            <span><strong className="text-emerald-400">2023–2026</strong></span>
          </div>
        </div>
      </section>

      {/* PANGGUNG UTAMA DOKUMENTASI: GRID KLASIK, DOSSIER SHOWCASE & GARIS WAKTU */}
      <DocumentationWall onOpenAuth={onOpenAuth} />
    </div>
  );
}

export default GalleryPage;