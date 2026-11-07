import React, { useState } from 'react';
import {
  Shirt,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Ruler,
  Layers,
  Flame,
  Info,
} from 'lucide-react';
import { SITE } from '../../data/siteData.js';

export function PoloPreOrderSection() {
  const [activeView, setActiveView] = useState('mockup'); // 'mockup' | 'poster' | 'sizechart'
  const [activeAngle, setActiveAngle] = useState('front'); // 'front' | 'back' | 'both'
  const [selectedSize, setSelectedSize] = useState('L');

  const SIZE_DATA = [
    { size: 'S', lebar: '48 cm', panjang: '70 cm', extra: '' },
    { size: 'M', lebar: '50 cm', panjang: '72 cm', extra: '' },
    { size: 'L', lebar: '52 cm', panjang: '74 cm', extra: 'Paling Populer' },
    { size: 'XL', lebar: '54 cm', panjang: '76 cm', extra: '' },
    { size: 'XXL', lebar: '57 cm', panjang: '78 cm', extra: '+5k' },
    { size: 'XXXL', lebar: '58 cm', panjang: '80 cm', extra: '+10k' },
    { size: '4XL', lebar: '60 cm', panjang: '82 cm', extra: '+15k' },
    { size: '5XL', lebar: '62 cm', panjang: '84 cm', extra: '+20k' },
  ];

  const FORM_URL = 'https://forms.gle/PfxbiZmmKs3vhH566';

  return (
    <section
      id="pre-order-polo"
      aria-labelledby="polo-section-title"
      className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans"
    >
      {/* Container Kaca Taktis Gelap */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#071c22]/90 border border-white/12 backdrop-blur-2xl p-6 sm:p-10 lg:p-12 shadow-2xl">
        {/* Subtle Dark Gradient Overlay */}
        <div
          className="pointer-events-none absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#006569]/15 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#FFDD00]/05 blur-3xl"
          aria-hidden="true"
        />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#004e53]/60 border border-[#00A8AF]/30 text-[#FFDD00] text-xs font-black uppercase tracking-wider">
              <Sparkles size={14} className="text-[#FFDD00]" />
              <span>OFFICIAL MERCHANDISE RESMI • TAHUN 2026</span>
            </div>
            <h2
              id="polo-section-title"
              className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight"
            >
              Pre Order Polo Shirt Menwa UNJ Tahun 2026
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-medium">
              Edisi terbatas seragam polo eksklusif Korps Resimen Mahasiswa Satuan UNJ. Didesain dengan material <strong className="text-white">Motif Waffle Dry-fit</strong> premium bertekstur, berkerah sporty elegan, dan ornamen grafis korsa bernuansa kebanggaan kampus.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-start md:items-end gap-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
              Harga Pre-Order Spesial
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-[#FFDD00] font-mono tracking-tight">
                Rp150.000
              </span>
              <span className="text-xs text-slate-400 font-bold uppercase">/ pcs</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid: Visual Mockup / Poster & Detail Form */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kolom Kiri (Lg: 6/12): Interactive Visual Showroom */}
          <div className="lg:col-span-6 space-y-4">
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#041217]/80 border border-white/10 w-fit">
              <button
                type="button"
                onClick={() => setActiveView('mockup')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeView === 'mockup'
                    ? 'bg-[#006569] text-[#FFDD00] shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                Mockup Jersey
              </button>
              <button
                type="button"
                onClick={() => setActiveView('poster')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeView === 'poster'
                    ? 'bg-[#006569] text-[#FFDD00] shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                Poster Edisi Resmi
              </button>
              <button
                type="button"
                onClick={() => setActiveView('sizechart')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeView === 'sizechart'
                    ? 'bg-[#006569] text-[#FFDD00] shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                Size Chart
              </button>
            </div>

            {/* Display Canvas Box */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[#06171d] to-[#020b0e] border border-white/10 p-4 sm:p-6 min-h-[460px] flex flex-col items-center justify-center overflow-hidden shadow-inner group">
              {activeView === 'mockup' && (
                <div className="w-full flex flex-col items-center space-y-4">
                  {/* Angle Switcher */}
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <span className="text-[11px] text-slate-400 uppercase font-mono mr-1">Tampak:</span>
                    <button
                      type="button"
                      onClick={() => setActiveAngle('front')}
                      className={`px-3 py-1 rounded-lg border text-xs transition cursor-pointer ${activeAngle === 'front'
                          ? 'bg-white/15 border-teal-400 text-[#FFDD00]'
                          : 'border-white/10 text-slate-400 hover:text-white'
                        }`}
                    >
                      Depan
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveAngle('back')}
                      className={`px-3 py-1 rounded-lg border text-xs transition cursor-pointer ${activeAngle === 'back'
                          ? 'bg-white/15 border-teal-400 text-[#FFDD00]'
                          : 'border-white/10 text-slate-400 hover:text-white'
                        }`}
                    >
                      Belakang
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveAngle('both')}
                      className={`px-3 py-1 rounded-lg border text-xs transition cursor-pointer ${activeAngle === 'both'
                          ? 'bg-white/15 border-teal-400 text-[#FFDD00]'
                          : 'border-white/10 text-slate-400 hover:text-white'
                        }`}
                    >
                      Keduanya
                    </button>
                  </div>

                  {/* Mockup Images Container */}
                  <div className="relative w-full max-w-md h-[380px] sm:h-[420px] flex items-center justify-center">
                    {activeAngle === 'front' && (
                      <img
                        src="/merchandise/polo-front.png"
                        alt="Polo Menwa UNJ 2026 Tampak Depan"
                        className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] transition-transform duration-500 hover:scale-105"
                      />
                    )}
                    {activeAngle === 'back' && (
                      <img
                        src="/merchandise/polo-back.png"
                        alt="Polo Menwa UNJ 2026 Tampak Belakang"
                        className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] transition-transform duration-500 hover:scale-105"
                      />
                    )}
                    {activeAngle === 'both' && (
                      <div className="grid grid-cols-2 gap-2 h-full w-full items-center">
                        <img
                          src="/merchandise/polo-front.png"
                          alt="Polo Menwa UNJ Tampak Depan"
                          className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                        />
                        <img
                          src="/merchandise/polo-back.png"
                          alt="Polo Menwa UNJ Tampak Belakang"
                          className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeView === 'poster' && (
                <div className="w-full flex items-center justify-center p-2">
                  <img
                    src="/merchandise/polo-poster-main.jpg"
                    alt="Poster Resmi Pre-Order Polo Menwa UNJ 2026"
                    className="max-h-[440px] rounded-2xl object-contain shadow-2xl border border-white/10 transition-transform duration-300 hover:scale-102"
                  />
                </div>
              )}

              {activeView === 'sizechart' && (
                <div className="w-full flex items-center justify-center p-2">
                  <img
                    src="/merchandise/polo-size-chart.jpg"
                    alt="Size Chart Panduan Ukuran Polo Menwa UNJ"
                    className="max-h-[440px] rounded-2xl object-contain shadow-2xl border border-white/10"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Kolom Kanan (Lg: 6/12): Fitur Bahan, Panduan Ukuran & CTA Form */}
          <div className="lg:col-span-6 space-y-6">
            {/* 3 Keunggulan Bahan / Spesifikasi */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-[#092229]/80 border border-white/10 space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-[#00A8AF] flex items-center justify-center font-bold">
                  <Shirt size={16} />
                </div>
                <h4 className="text-xs font-black text-white">Motif Waffle Dry-fit</h4>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Tekstur wafel berpori mikro, sejuk, menyerap keringat dan nyaman dipakai harian.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#092229]/80 border border-white/10 space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-[#FFDD00] flex items-center justify-center font-bold">
                  <Layers size={16} />
                </div>
                <h4 className="text-xs font-black text-white">Kerah Polo Sporty</h4>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Kerah biru navy berkancing rapi dengan lis putih formal untuk suasana kampus &amp; dinas.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#092229]/80 border border-white/10 space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 size={16} />
                </div>
                <h4 className="text-xs font-black text-white">Sublimasi Presisi</h4>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Warna geometris tajam tahan cuci, jahitan rapi kuat berstandar seragam satuan.
                </p>
              </div>
            </div>

            {/* Panduan Ukuran & Estimasi */}
            <div className="p-5 rounded-3xl bg-[#05181e]/85 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#FFDD00] flex items-center gap-1.5">
                  <Ruler size={15} />
                  <span>Panduan Ukuran (Standar Lokal UNJ)</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Lebar × Panjang</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {SIZE_DATA.map((item) => (
                  <button
                    key={item.size}
                    type="button"
                    onClick={() => setSelectedSize(item.size)}
                    className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${selectedSize === item.size
                        ? 'bg-[#006569] border-[#FFDD00]/70 text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                  >
                    <div className="text-xs font-black font-mono">{item.size}</div>
                    <div className="text-[9px] text-slate-400 leading-none mt-0.5">{item.lebar}</div>
                  </button>
                ))}
              </div>

              {/* Detail ukuran yang dipilih */}
              {selectedSize && (
                <div className="p-3 rounded-xl bg-black/30 border border-white/05 flex items-center justify-between text-xs text-slate-300">
                  <span>
                    Ukuran Terpilih: <strong className="text-white font-mono text-sm">{selectedSize}</strong>{' '}
                    ({SIZE_DATA.find((s) => s.size === selectedSize)?.lebar} ×{' '}
                    {SIZE_DATA.find((s) => s.size === selectedSize)?.panjang})
                  </span>
                  {SIZE_DATA.find((s) => s.size === selectedSize)?.extra && (
                    <span className="px-2 py-0.5 rounded bg-amber-400/20 text-[#FFDD00] text-[10px] font-black uppercase font-mono">
                      {SIZE_DATA.find((s) => s.size === selectedSize)?.extra}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Tombol Utama Call To Action Form Pre-Order */}
            <div className="space-y-3 pt-2">
              <a
                href={FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#006569] via-[#005154] to-[#092D32] hover:from-[#007b80] hover:to-[#004e52] text-[#FFDD00] hover:text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl border border-[#FFDD00]/50 flex items-center justify-center gap-3 cursor-pointer group active:scale-98"
              >
                <span>Pre-Order Sekarang via Google Form</span>
                <ExternalLink size={18} className="transition-transform group-hover:translate-x-1" />
              </a>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 px-1">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Bisa COD Kampus A UNJ / Kirim Ekspedisi</span>
                </span>
                <a
                  href={`https://wa.me/6281525823503?text=${encodeURIComponent(
                    'Halo Panitia Polo Menwa UNJ 2026, saya ingin bertanya terkait Pre-Order seragam Polo Shirt.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00A8AF] hover:text-[#FFDD00] underline font-semibold transition"
                >
                  Tanya Hotline Panitia (WhatsApp)
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PoloPreOrderSection;

