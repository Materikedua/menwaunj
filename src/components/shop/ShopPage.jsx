import React, { useState } from 'react';
import {
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Ruler,
  HelpCircle,
  Share2,
  Clock,
  Truck,
  MessageCircle,
  ChevronDown,
  Info,
  Layers,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { playTactileClick } from '../../lib/tactileAudio.js';
import { Link } from '../../lib/router.jsx';

const PRE_ORDER_FORM_URL = 'https://forms.gle/PfxbiZmmKs3vhH566';
const WA_ADMIN_URL = 'https://wa.me/6281525823503?text=Halo%20Admin%20Mako%2C%20saya%20ingin%20tanya%20seputar%20Pre%20Order%20Polo%20Shirt%20Menwa%20UNJ%202026';

const PRODUCT_VIEWS = [
  {
    id: 'front',
    label: 'Tampak Depan',
    src: '/merchandise/polo-front.png',
    tag: 'Mockup Depan',
    desc: 'Kerah polo biru elektrik, striping geometris, logo bordir/print Menwa UNJ di dada.',
  },
  {
    id: 'back',
    label: 'Tampak Belakang',
    src: '/merchandise/polo-back.png',
    tag: 'Mockup Belakang',
    desc: 'Punggung berwibawa bertuliskan MENWA UNIVERSITAS NEGERI JAKARTA, logo Dispora & UNJ.',
  },
  {
    id: 'poster',
    label: 'Poster Lengkap',
    src: '/merchandise/polo-poster-main.jpg',
    tag: 'Edisi Resmi 2026',
    desc: 'Tampilan poster publikasi resmi dengan rincian material dan harga resmi.',
  },
  {
    id: 'size-chart',
    label: 'Size Chart',
    src: '/merchandise/polo-size-chart.jpg',
    tag: 'Panduan Ukuran',
    desc: 'Tabel ukuran standar nasional dari S hingga 5XL.',
  },
];

const SIZE_CHART_DATA = [
  { size: 'S', width: 48, length: 70, extra: 'Harga Normal' },
  { size: 'M', width: 50, length: 72, extra: 'Harga Normal' },
  { size: 'L', width: 52, length: 74, extra: 'Harga Normal' },
  { size: 'XL', width: 54, length: 76, extra: 'Harga Normal' },
  { size: 'XXL', width: 57, length: 78, extra: '+ Rp 5.000' },
  { size: 'XXXL', width: 58, length: 80, extra: '+ Rp 10.000' },
  { size: '4XL', width: 60, length: 82, extra: '+ Rp 15.000' },
  { size: '5XL', width: 62, length: 84, extra: '+ Rp 20.000' },
];

const FAQS = [
  {
    q: 'Siapa saja yang boleh memesan Polo Shirt Menwa UNJ 2026?',
    a: 'Polo Shirt ini terbuka untuk seluruh anggota aktif, calon anggota (Camen), purna/alumni Resimen Mahasiswa Satuan UNJ, sivitas akademika UNJ, serta simpatisan/masyarakat umum yang ingin memiliki seragam resmi kebanggaan satuan.',
  },
  {
    q: 'Bagaimana alur pemesanan dan pembayarannya?',
    a: 'Klik tombol "Pre-Order Sekarang (Google Form)", isi data diri, pilih ukuran, dan lakukan transfer ke rekening resmi atau QRIS satuan yang tertera di form. Setelah transfer, unggah bukti bayar di formulir tersebut.',
  },
  {
    q: 'Apakah bisa diambil langsung di Markas Komando (Mako)?',
    a: 'Ya! Anda dapat memilih opsi "Ambil di Mako Gedung G R.107 Kampus A UNJ" bebas biaya kirim, atau opsi kirim ekspedisi (JNE / J&T / SiCepat) ke seluruh alamat di Indonesia.',
  },
  {
    q: 'Berapa lama estimasi proses produksi?',
    a: 'Setelah periode batch pre-order ditutup, produksi memakan waktu sekitar 14 hingga 21 hari kerja untuk memastikan standar jahitan dan sublimasi berkualitas prima.',
  },
];

export function ShopPage() {
  const [activeView, setActiveView] = useState('front');
  const [heightInput, setHeightInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [calculatedSize, setCalculatedSize] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const currentViewObj = PRODUCT_VIEWS.find((v) => v.id === activeView) || PRODUCT_VIEWS[0];

  const handleCalculateSize = (e) => {
    e.preventDefault();
    const h = parseFloat(heightInput);
    const w = parseFloat(weightInput);
    if (!h || !w || h < 100 || w < 30) return;

    let recommended = 'L';
    let detail = 'Cocok untuk postur proporsional harian & lapangan.';

    if (w < 55) {
      recommended = 'S';
      detail = 'Fit ramping dan proporsional untuk postur langsing.';
    } else if (w < 65) {
      recommended = 'M';
      detail = 'Nyaman bergerak dengan siluet atletis.';
    } else if (w < 75) {
      recommended = 'L';
      detail = 'Pilihan paling populer, pas di bahu dan leluasa beraktivitas.';
    } else if (w < 85) {
      recommended = 'XL';
      detail = 'Memberikan kenyamanan ekstra di dada dan bahu.';
    } else if (w < 95) {
      recommended = 'XXL';
      detail = 'Ruang gerak ekstra leluasa (+ Rp 5.000).';
    } else if (w < 105) {
      recommended = 'XXXL';
      detail = 'Ukuran besar dengan panjang proporsional (+ Rp 10.000).';
    } else {
      recommended = '4XL / 5XL';
      detail = 'Ukuran jumbo dengan kenyamanan maksimal (+ Rp 15.000 - Rp 20.000).';
    }

    setCalculatedSize({ size: recommended, detail });
    playTactileClick('press');
  };

  const handleShare = () => {
    playTactileClick('press');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-28 pt-24 sm:pt-28">
      {/* Ambient Subtle Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-10 left-1/4 w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-[130px]" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] rounded-full bg-[#FFDD00]/5 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Header Breadcrumb & Overline */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-[#006569] text-[11px] font-black uppercase tracking-[0.22em] shadow-sm">
            <Flame size={14} className="text-amber-500 animate-pulse" />
            <span>OFFICIAL STORE RESMI • MENWA UNJ 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Polo Shirt Menwa UNJ <span className="text-[#006569] underline decoration-amber-400 decoration-wavy">2026</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            Seragam polo eksklusif Korps Resimen Mahasiswa Jayakarta Satuan Universitas Negeri Jakarta.
            Didesain berwibawa, modern, dan tangguh dengan material Motif Waffle Dry-Fit berstandar tinggi.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-[#006569] text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 size={14} className="text-emerald-600" /> Motif Waffle Dry-Fit
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-[#006569] text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 size={14} className="text-emerald-600" /> Kerah Polo Sporty
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-[#006569] text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 size={14} className="text-emerald-600" /> Sublimasi Ultra-HD Tahan Lama
            </span>
          </div>
        </div>

        {/* Main Product Showcase Section (Grid 2 Kolom) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Kolom Kiri: Multi-View Previewer (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Kartu Display Preview Utama */}
            <div className="relative rounded-[2.5rem] bg-white border border-slate-200 p-6 sm:p-10 shadow-xl overflow-hidden flex flex-col items-center justify-center group min-h-[460px] sm:min-h-[560px]">
              {/* Badge Status & Tag */}
              <div className="absolute top-5 left-5 z-20 flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#FFDD00] text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                  {currentViewObj.tag}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-bold">
                  Batch 01 Pre-Order
                </span>
              </div>

              {/* Tombol Share */}
              <button
                type="button"
                onClick={handleShare}
                className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer shadow-xs"
                title="Bagikan Tautan Produk"
              >
                <Share2 size={16} />
              </button>
              {copiedLink && (
                <div className="absolute top-16 right-5 z-20 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg animate-fade-in">
                  Tautan berhasil disalin!
                </div>
              )}

              {/* Gambar Produk */}
              <div className="relative z-10 w-full max-w-[420px] aspect-[4/5] flex items-center justify-center py-4">
                <img
                  key={currentViewObj.id}
                  src={currentViewObj.src}
                  alt={currentViewObj.label}
                  className="max-h-full max-w-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.15)] transition-all duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Keterangan Tampilan Aktif */}
              <div className="relative z-10 w-full mt-4 text-center bg-slate-50 rounded-2xl p-3 border border-slate-200">
                <p className="text-xs text-slate-700 font-medium">
                  {currentViewObj.desc}
                </p>
              </div>
            </div>

            {/* Thumbnail View Switcher Buttons */}
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {PRODUCT_VIEWS.map((view) => {
                const isActive = activeView === view.id;
                return (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => {
                      playTactileClick('pill');
                      setActiveView(view.id);
                    }}
                    className={`rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center gap-2 border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-teal-50 border-2 border-[#006569] shadow-md scale-[1.02]'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center p-1 border border-slate-200">
                      <img src={view.src} alt={view.label} className="w-full h-full object-contain" />
                    </div>
                    <span className={`text-[10px] sm:text-xs font-black tracking-tight text-center ${
                      isActive ? 'text-[#006569]' : 'text-slate-700'
                    }`}>
                      {view.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kolom Kanan: Rincian Harga, Spesifikasi, & Action Order (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Box Harga & Order Utama */}
            <div className="rounded-[2.5rem] bg-white border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#006569] block mb-1">
                  HARGA PRE-ORDER BATCH 01
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                    150.000 <span className="text-xl sm:text-2xl text-[#006569]">IDR</span>
                  </span>
                  <span className="text-sm font-bold text-slate-400 line-through">
                    175.000 IDR
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 font-medium">
                  Harga khusus masa pre-order untuk ukuran standar S, M, L, dan XL.
                </p>
              </div>

              {/* Status Box */}
              <div className="rounded-2xl bg-teal-50 border border-teal-200 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#006569] text-[#FFDD00] flex items-center justify-center shrink-0 font-black shadow-sm">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Edisi Terbatas Mahasiswa &amp; Alumni
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Diproduksi eksklusif sesuai jumlah pemesanan batch aktif.
                  </p>
                </div>
              </div>

              {/* Call to Action Utama */}
              <div className="space-y-3 pt-2">
                <a
                  href={PRE_ORDER_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playTactileClick('press')}
                  className="w-full py-4 px-6 rounded-2xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer"
                >
                  <ShoppingBag size={18} />
                  <span>Pre-Order Sekarang (Google Form)</span>
                  <ExternalLink size={16} />
                </a>

                <a
                  href={WA_ADMIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playTactileClick('click')}
                  className="w-full py-3 px-6 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition cursor-pointer"
                >
                  <MessageCircle size={16} className="text-emerald-700" />
                  <span>Tanya Admin / CS WhatsApp</span>
                </a>
              </div>

              {/* Rincian Fitur Cepat */}
              <div className="pt-4 border-t border-slate-200 space-y-3 text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <Truck size={15} className="text-[#006569] shrink-0" />
                  <span>Bisa ambil langsung di Mako Gedung G R.107 UNJ atau kirim via ekspedisi.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={15} className="text-[#006569] shrink-0" />
                  <span>Official Merchandise legal berlisensi Satuan Menwa UNJ.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock size={15} className="text-amber-600 shrink-0" />
                  <span>Estimasi produksi 14–21 hari kerja pasca penutupan batch.</span>
                </div>
              </div>
            </div>

            {/* Quick Size Calculator Widget */}
            <div className="rounded-[2.25rem] bg-white border border-slate-200 p-6 shadow-md space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#006569] flex items-center justify-center font-black border border-teal-200">
                  <Ruler size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Kalkulator Rekomendasi Ukuran</h4>
                  <p className="text-[11px] text-slate-500">Masukkan tinggi &amp; berat untuk rekomendasi size</p>
                </div>
              </div>

              <form onSubmit={handleCalculateSize} className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Tinggi Badan (cm)
                  </label>
                  <input
                    type="number"
                    value={heightInput}
                    onChange={(e) => setHeightInput(e.target.value)}
                    placeholder="Contoh: 170"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#006569]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Berat Badan (kg)
                  </label>
                  <input
                    type="number"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    placeholder="Contoh: 65"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#006569]"
                  />
                </div>
                <div className="col-span-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-sm"
                  >
                    Hitung Ukuran Saya
                  </button>
                </div>
              </form>

              {calculatedSize && (
                <div className="rounded-xl bg-teal-50 border border-teal-200 p-3.5 flex items-center justify-between gap-3 animate-fade-in">
                  <div>
                    <span className="text-[10px] uppercase font-black text-[#006569] tracking-wider">
                      REKOMENDASI UKURAN:
                    </span>
                    <h5 className="text-lg font-black text-slate-900">
                      Size {calculatedSize.size}
                    </h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">{calculatedSize.detail}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#006569] text-[#FFDD00] flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                    {calculatedSize.size.split(' ')[0]}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabel Size Chart Lengkap Standar Nasional */}
        <div className="rounded-[2.5rem] bg-white border border-slate-200 p-6 sm:p-10 shadow-xl space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#006569]">
              PANDUAN DETAIL UKURAN (SIZE CHART)
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Tabel Ukuran Resmi Standar UNJ
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Pastikan Anda mengukur lebar dada dan panjang baju untuk kenyamanan maksimal saat berkegiatan.
            </p>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider text-[11px] bg-slate-50">
                  <th className="py-3 px-4 rounded-l-xl">Size</th>
                  <th className="py-3 px-4">Lebar Dada</th>
                  <th className="py-3 px-4">Panjang Badan</th>
                  <th className="py-3 px-4 rounded-r-xl">Keterangan Biaya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {SIZE_CHART_DATA.map((row) => (
                  <tr key={row.size} className="hover:bg-teal-50/40 transition">
                    <td className="py-3.5 px-4 font-black text-slate-900 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-teal-50 text-[#006569] border border-teal-200 flex items-center justify-center font-mono font-bold text-xs">
                        {row.size}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{row.width} cm</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{row.length} cm</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        row.extra === 'Harga Normal'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {row.extra}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alur & Tahapan Pre-Order */}
        <div className="rounded-[2.5rem] bg-white border border-slate-200 p-6 sm:p-10 shadow-xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#006569]">
              ALUR &amp; PROSEDUR
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Tahapan Pemesanan Pre-Order
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="w-10 h-10 rounded-2xl bg-[#006569] text-[#FFDD00] flex items-center justify-center font-black text-sm shadow-sm">
                01
              </span>
              <h4 className="text-base font-black text-slate-900">Isi Formulir</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pilih ukuran polo shirt dan isi data diri pemesan secara lengkap di Google Form resmi.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="w-10 h-10 rounded-2xl bg-[#006569] text-[#FFDD00] flex items-center justify-center font-black text-sm shadow-sm">
                02
              </span>
              <h4 className="text-base font-black text-slate-900">Transfer &amp; Konfirmasi</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lakukan pembayaran via QRIS atau transfer bank resmi Mako UNJ, lalu upload bukti transaksi.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="w-10 h-10 rounded-2xl bg-[#006569] text-[#FFDD00] flex items-center justify-center font-black text-sm shadow-sm">
                03
              </span>
              <h4 className="text-base font-black text-slate-900">Produksi Batch</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vendor konveksi memproses seragam dengan standar jahit, pola, dan sublimasi presisi tinggi.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="w-10 h-10 rounded-2xl bg-[#006569] text-[#FFDD00] flex items-center justify-center font-black text-sm shadow-sm">
                04
              </span>
              <h4 className="text-base font-black text-slate-900">Pengambilan / Kirim</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ambil seragam Anda di Mako Gedung G R.107 UNJ atau tunggu paket tiba di rumah melalui ekspedisi.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-6 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#006569]">
              PERTANYAAN UMUM
            </span>
            <h3 className="text-2xl font-black text-slate-900">FAQ Pre-Order Polo Shirt</h3>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl bg-white border border-slate-200 overflow-hidden transition shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick('click');
                      setOpenFaq(isOpen ? null : idx);
                    }}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-[#006569] transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-[#006569]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Final Bottom Call-To-Action Banner */}
        <div className="rounded-[2.75rem] bg-[#006569] border border-teal-700 p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden space-y-6">
          <div className="pointer-events-none absolute -right-10 -bottom-10 w-64 h-64 bg-[#FFDD00]/10 rounded-full blur-2xl" />
          <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-white max-w-2xl mx-auto leading-tight">
            Amankan Ukuran Anda Sekarang Sebelum Kuota Batch 01 Terpenuhi!
          </h3>
          <p className="text-xs sm:text-sm text-teal-100 max-w-xl mx-auto leading-relaxed">
            Polo Shirt Menwa UNJ 2026 merupakan merchandise resmi dengan stok terbatas per batch.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href={PRE_ORDER_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playTactileClick('press')}
              className="px-8 py-4 rounded-full bg-[#FFDD00] hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-md transition hover:scale-105 cursor-pointer flex items-center gap-2"
            >
              <span>Isi Google Form Sekarang</span>
              <ArrowRight size={17} />
            </a>
            <a
              href={WA_ADMIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 rounded-full bg-black/20 hover:bg-black/30 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Konsultasi WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopPage;

