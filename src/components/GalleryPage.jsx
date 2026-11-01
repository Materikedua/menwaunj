import React, { useEffect } from 'react';
import {
  Home,
  ChevronRight,
  Camera,
  Clock,
  Sparkles,
  Shield,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Layers,
  CheckCircle2,
  Image as ImageIcon,
  MessageCircle,
} from 'lucide-react';
import { Link } from '../lib/router.jsx';
import { PersonPhoto } from './PersonPhoto.jsx';

export function GalleryPage({ onOpenAuth = null }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F8F6] dark:bg-slate-950 font-sans selection:bg-[#006569] selection:text-[#FFDD00] flex flex-col">
      {/* COMPACT BREADCRUMB HEADER BAR */}
      <section className="relative overflow-hidden bg-[#092D32] py-4 sm:py-5 text-white border-b border-[#006569]/40">
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

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
              <Camera size={18} className="text-[#FFDD00]" />
              <span>Arsip Lensa &amp; Dokumentasi Satuan</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              PROSES KURASI RESMI
            </span>
          </div>
        </div>
      </section>

      {/* PANGGUNG PEMBERITAHUAN: DOKUMENTASI SEDANG DIPERSIAPKAN OLEH ADMIN RAFFLI */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl mx-auto">
          {/* Kartu Utama Beraksen Militer & Elegan */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-10 md:p-12 text-center">
            {/* Background Glow */}
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#006569]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#FFDD00]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Badge Status Komando */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#006569]/10 dark:bg-[#006569]/30 border border-[#006569]/30 text-[#006569] dark:text-teal-300 text-xs font-black uppercase tracking-widest mb-6">
              <Clock size={14} className="text-[#006569] dark:text-[#FFDD00] animate-spin" style={{ animationDuration: '6s' }} />
              <span>Markas Komando Menwa UNJ • Status Pembaruan Media</span>
            </div>

            {/* Profil Admin Raffli Avatar Card */}
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-[#006569] via-[#FFDD00] to-[#00383b] shadow-xl">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-slate-900 bg-slate-900 flex items-center justify-center text-white">
                    <PersonPhoto name="Raffli Syahputra" fallback="RS" />
                  </div>
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 bg-[#006569] text-[#FFDD00] p-1.5 rounded-full border-2 border-white dark:border-slate-900 shadow-md" title="Admin Mako Terverifikasi">
                  <ShieldCheck size={16} />
                </div>
              </div>
            </div>

            {/* Identitas Penanggung Jawab */}
            <div className="mb-6 space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Kurator &amp; Penanggung Jawab Media
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Raffli Syahputra
              </h3>
              <p className="text-xs sm:text-sm font-bold text-[#006569] dark:text-[#FFDD00]">
                Wakil Komandan Satuan / Administrator Komando
              </p>
            </div>

            {/* Heading Utama */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight max-w-2xl mx-auto leading-snug mb-4">
              Dokumentasi Resmi Sedang Dipersiapkan
            </h2>

            {/* Deskripsi Penjelasan Transparan & Menghargai Pengunjung */}
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-8">
              Arsip foto dan rekaman visual kegiatan satuan (Pendidikan Dasar, Kursus Dinas Staf, Ksatria Cendekia VIII, GERANAT VII, Bakti Masyarakat, dan Upacara Kehormatan) saat ini sedang dalam proses kurasi kualitas tinggi, katalogisasi proker, dan penataan narasi oleh <strong className="text-[#006569] dark:text-teal-300">Admin Raffli</strong> bersama Biro Multimedia Komando Menwa UNJ.
            </p>

            {/* 3 Langkah Alur Progres Persiapan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 max-w-3xl mx-auto mb-10 text-left">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-[#006569] dark:text-[#FFDD00]">01</span>
                  <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Pengumpulan Arsip
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Penghimpunan seluruh dokumentasi mentah dari fotografer satuan dan panitia kegiatan.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#006569]/5 dark:bg-[#006569]/20 border border-[#006569]/30 space-y-2 ring-1 ring-[#006569]/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-[#006569] dark:text-[#FFDD00]">02</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                </div>
                <h4 className="text-xs font-black text-[#006569] dark:text-teal-300 uppercase tracking-wider">
                  Kurasi HD &amp; Narasi
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Sedang diproses oleh Admin Raffli: seleksi momen terbaik, grading visual, dan takarir resmi.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 space-y-2 opacity-80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-slate-400">03</span>
                  <Layers size={16} className="text-slate-400" />
                </div>
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Publikasi Bertahap
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Album foto interaktif dan dinding dokumentasi akan dibuka secara bertahap di laman ini.
                </p>
              </div>
            </div>

            {/* Tombol Tindakan & Tautan Alternatif */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/menwa.unjakarta/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:opacity-95 text-white text-xs font-black uppercase tracking-wider shadow-lg hover:scale-105 transition"
              >
                <ImageIcon size={16} />
                <span>Dokumentasi Terkini di Instagram</span>
                <ExternalLink size={13} className="opacity-80" />
              </a>

              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-black uppercase tracking-wider shadow hover:scale-105 transition"
              >
                <Home size={15} />
                <span>Kembali ke Beranda</span>
              </Link>

              <Link
                to="/administrasi"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
              >
                <Shield size={15} className="text-[#006569]" />
                <span>Layanan Markas Komando</span>
              </Link>
            </div>

            {/* Catatan Kaki Taktis */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              <span>Satuan Resimen Mahasiswa Jayakarta UNJ</span>
              <span aria-hidden="true">•</span>
              <span>Ref: MEMO-DOK-OPS/2026</span>
              <span aria-hidden="true">•</span>
              <span>Widya Castrena Dharma Siddha</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GalleryPage;
