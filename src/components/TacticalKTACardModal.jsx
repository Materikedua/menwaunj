import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  CreditCard,
  Printer,
  ShieldCheck,
  QrCode,
  User,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../lib/authContext.jsx';
import { playTactileClick } from '../lib/tactileAudio.js';
import { PANCA_DHARMA_SATYA, TEKAD_DAN_PENDIRIAN } from '../data/siteData.js';

/**
 * Latar Belakang Pola Geometris Lingkaran Berpotongan (Sacred Intersecting Circles)
 * Mengikuti referensi estetika lanyard badge resmi:
 * - Warna dasar: Royal Deep Blue Gradient (#0262d2 -> #0050bc -> #00388e)
 * - Pola lingkaran berpotongan (Flower of Life / Rosetta Grid) dengan garis halus
 * - Radial soft light di tengah
 */
function SacredGeometryBackground() {
  return (
    <>
      {/* Gradien Dasar Biru Royal */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0262d2] via-[#0050bc] to-[#00388e] -z-20" />

      {/* Radial Glow Halus di Bagian Tengah */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(56,189,248,0.25)_0%,transparent_70%)] pointer-events-none -z-10" />

      {/* SVG Pola Geometris Lingkaran Berpotongan */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none -z-10 opacity-35 mix-blend-screen"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="ktaSacredCircles" width="56" height="56" patternUnits="userSpaceOnUse">
            <circle cx="28" cy="28" r="28" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.32" />
            <circle cx="0" cy="0" r="28" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.32" />
            <circle cx="56" cy="0" r="28" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.32" />
            <circle cx="0" cy="56" r="28" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.32" />
            <circle cx="56" cy="56" r="28" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.32" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ktaSacredCircles)" />
      </svg>
    </>
  );
}

/**
 * Lubang Pengait Tali Lanyard di Atas Kartu (Portrait Lanyard Slot)
 */
function LanyardSlot() {
  return (
    <div className="w-16 h-3 mx-auto rounded-full bg-slate-950/80 border border-white/25 shadow-inner flex items-center justify-center mb-3 shrink-0">
      <div className="w-9 h-1 rounded-full bg-black/60" />
    </div>
  );
}

/**
 * Aksen Geometris Sudut (Busur Konsentris Cyan & Dot Merah di Kiri Bawah, Busur Oranye di Kanan Atas)
 */
function CornerAccents() {
  return (
    <>
      {/* Sudut Kiri Bawah: Concentric Cyan Arcs & Coral Dot */}
      <div className="absolute -bottom-8 -left-8 w-24 h-24 pointer-events-none overflow-hidden select-none">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="15" cy="85" r="48" fill="none" stroke="#00E5FF" strokeWidth="3" opacity="0.85" />
          <circle cx="15" cy="85" r="28" fill="none" stroke="#38BDF8" strokeWidth="2" opacity="0.65" />
          <circle cx="15" cy="85" r="14" fill="#FF4757" />
        </svg>
      </div>

      {/* Sudut Kanan Atas: Orange Quarter Arc */}
      <div className="absolute -top-7 -right-7 w-20 h-20 pointer-events-none overflow-hidden select-none">
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <path d="M 80,0 A 60,60 0 0,0 20,80 L 80,80 Z" fill="#F97316" opacity="0.9" />
        </svg>
      </div>
    </>
  );
}

export function TacticalKTACardModal({ isOpen, onClose }) {
  const { user, profile } = useAuth();

  // Tab Tampilan Statis: 'both' (Berdampingan) | 'front' (Depan) | 'back' (Belakang)
  const [activeSideTab, setActiveSideTab] = useState('both');
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Data Anggota untuk Isi KTA
  const [cardName, setCardName] = useState(() => {
    return profile?.displayName || user?.displayName || 'KSATRIA MENWA UNJ';
  });
  const [cardNbp, setCardNbp] = useState(() => {
    return profile?.nbp || 'NBP.22020742263';
  });
  const [cardRole, setCardRole] = useState(() => {
    return profile?.role || 'Prajurit Satuan Menwa UNJ';
  });
  const [cardFaculty, setCardFaculty] = useState(() => {
    return profile?.institution || 'Universitas Negeri Jakarta';
  });

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  // Generate QR Code Statis untuk Sisi Belakang KTA
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(
      `https://www.menwaunj.or.id/mako?nbp=${encodeURIComponent(cardNbp)}&kta=verified`,
      {
        width: 160,
        margin: 1,
        color: {
          dark: '#021B25',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      }
    )
      .then((url) => {
        if (isMounted) setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.warn('QR Code generation notice:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [cardNbp]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  const handlePrint = () => {
    playTactileClick('press');
    const printEl = document.getElementById('kta-print-area');
    if (!printEl) {
      window.print();
      return;
    }
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const headHtml = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((node) => node.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8"/>
        <title>KTA Menwa UNJ - ${cardName}</title>
        ${headHtml}
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 10mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding: 0;
          }
          .kta-sheet-container {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: flex-start;
            gap: 10mm;
            page-break-inside: avoid;
          }
          .kta-sheet-container > div {
            width: 82mm !important;
            max-width: 82mm !important;
            height: 133mm !important;
            border-radius: 6mm !important;
            page-break-inside: avoid !important;
            box-shadow: none !important;
          }
          .official-sheet-title {
            text-align: center;
            margin-bottom: 6mm;
            width: 100%;
            max-width: 180mm;
            border-bottom: 1.5pt solid #000;
            padding-bottom: 2mm;
          }
          .official-sheet-title h2 {
            font-size: 11pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #000;
          }
          .official-sheet-title p {
            font-size: 8pt;
            color: #444;
            margin-top: 1mm;
          }
        </style>
      </head>
      <body>
        <div class="official-sheet-title">
          <h2>KARTU TANDA ANGGOTA (KTA) RESMI SATUAN</h2>
          <p>Komando Resimen Mahasiswa Jayakarta Satuan Universitas Negeri Jakarta</p>
        </div>
        <div class="kta-sheet-container">
          ${printEl.innerHTML}
        </div>
      </body>
      </html>
    `);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch {}
      }, 1500);
    }, 350);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-hidden animate-fade-in font-sans"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-[2.5rem] neu-card bg-[#F5F8F6] p-5 sm:p-8 text-[#092D32] shadow-2xl max-h-[92vh] overflow-y-auto space-y-6 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup */}
        <button
          type="button"
          onClick={() => {
            playTactileClick('release');
            onClose();
          }}
          aria-label="Tutup modal KTA"
          className="absolute top-5 right-5 p-2 rounded-full neu-btn text-slate-600 hover:text-rose-600 transition cursor-pointer shadow-sm z-20"
        >
          <X size={20} />
        </button>

        {/* Header Modal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 pr-12">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#006569] to-[#092D32] text-[#FFDD00] flex items-center justify-center font-black shadow-md shrink-0">
              <CreditCard size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0050bc] border border-blue-200">
                  PORTRAIT ID CARD
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-bold hidden sm:inline">
                  KARTU TANDA ANGGOTA (KTA) STATIS
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#092D32] mt-0.5">
                Kartu Tanda Anggota (KTA) Digital
              </h2>
            </div>
          </div>

          {/* Pengalih Tampilan Tab Statis */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-2xl shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                playTactileClick('pill');
                setActiveSideTab('front');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                activeSideTab === 'front'
                  ? 'bg-white text-[#0050bc] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sisi Depan
            </button>
            <button
              type="button"
              onClick={() => {
                playTactileClick('pill');
                setActiveSideTab('back');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                activeSideTab === 'back'
                  ? 'bg-white text-[#0050bc] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sisi Belakang
            </button>
            <button
              type="button"
              onClick={() => {
                playTactileClick('pill');
                setActiveSideTab('both');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer hidden md:inline-flex ${
                activeSideTab === 'both'
                  ? 'bg-[#0050bc] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Berdampingan
            </button>
          </div>
        </div>

        {/* Bar Penyesuaian Data KTA */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold">
          <div className="flex items-center gap-2 text-slate-700">
            <ShieldCheck size={16} className="text-[#006569]" />
            <span>Format: <strong>Portrait Lanyard Badge</strong> (Referensi Visual Royal Blue &amp; Intersecting Circles)</span>
          </div>

          <button
            type="button"
            onClick={() => {
              playTactileClick('click');
              setShowCustomizer((prev) => !prev);
            }}
            className="inline-flex items-center gap-1.5 text-slate-700 hover:text-[#006569] text-xs font-bold cursor-pointer"
          >
            <Sliders size={14} />
            <span>{showCustomizer ? 'Sembunyikan Pengaturan Biodata' : 'Sesuaikan Biodata Anggota'}</span>
            <ChevronDown size={14} className={`transition-transform ${showCustomizer ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Input Edit Data Kartu (Bila Diperlukan) */}
        {showCustomizer && (
          <div className="rounded-2xl p-4 bg-white border border-slate-200 space-y-3 animate-fade-in text-xs font-bold">
            <span className="text-xs font-black uppercase tracking-wider text-[#006569] block">
              Sesuaikan Biodata Prajurit pada KTA:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-slate-600 block mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
                  className="w-full rounded-xl border border-slate-300 p-2 text-black outline-none focus:border-[#006569]"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Nomor Induk / NBP:</label>
                <input
                  type="text"
                  value={cardNbp}
                  onChange={(e) => setCardNbp(e.target.value)}
                  style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
                  className="w-full rounded-xl border border-slate-300 p-2 text-black outline-none focus:border-[#006569]"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Jabatan / Satuan:</label>
                <input
                  type="text"
                  value={cardRole}
                  onChange={(e) => setCardRole(e.target.value)}
                  style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
                  className="w-full rounded-xl border border-slate-300 p-2 text-black outline-none focus:border-[#006569]"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Fakultas / Kampus:</label>
                <input
                  type="text"
                  value={cardFaculty}
                  onChange={(e) => setCardFaculty(e.target.value)}
                  style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
                  className="w-full rounded-xl border border-slate-300 p-2 text-black outline-none focus:border-[#006569]"
                />
              </div>
            </div>
          </div>
        )}

        {/* CONTAINER KTA PORTRAIT STATIS (DEPAN & BELAKANG) */}
        <div className="py-2 flex justify-center items-center">
          <div
            id="kta-print-area"
            className={`w-full flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 ${
              activeSideTab === 'front' ? 'md:justify-center' : ''
            }`}
          >
            {/* ════════════════════════════════════════════════════════════════
                KARTU 1: SISI DEPAN (FRONT - PORTRAIT KTA)
            ════════════════════════════════════════════════════════════════ */}
            {(activeSideTab === 'front' || activeSideTab === 'both') && (
              <div className="relative w-full max-w-[360px] aspect-[1/1.62] rounded-[28px] overflow-hidden shadow-2xl border-2 border-white/40 p-5 flex flex-col justify-between text-white select-none shrink-0 transition-transform hover:shadow-[0_20px_50px_rgba(2,98,210,0.35)]">
                {/* Latar Belakang Pola Geometris Biru Royal */}
                <SacredGeometryBackground />
                <CornerAccents />

                {/* Bagian Atas: Lanyard Slot, Pills & KOP Satuan Menwa UNJ */}
                <div className="relative z-10">
                  <LanyardSlot />

                  {/* Badges / Pills */}
                  <div className="flex items-center justify-center gap-2.5 pt-0.5 mb-3">
                    <span className="px-3.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-white/15 border border-white/40 text-white backdrop-blur-sm shadow-sm">
                      MENWA UNJ
                    </span>
                    <span className="px-3.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 shadow-md">
                      KARTU TANDA ANGGOTA
                    </span>
                  </div>

                  {/* KOP Satuan Resmi Menwa UNJ */}
                  <div className="flex items-center gap-2.5 bg-slate-950/45 backdrop-blur-md rounded-2xl p-2 border border-white/20 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/30 p-1 flex items-center justify-center shrink-0">
                      <img
                        src="/logo-menwa-unj.png"
                        alt="Logo Menwa UNJ"
                        className="w-full h-full object-contain drop-shadow"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[8.5px] font-black tracking-widest text-[#FFDD00] uppercase truncate">
                        RESIMEN MAHASISWA JAYAKARTA
                      </div>
                      <div className="text-[11px] font-black tracking-tight text-white leading-tight truncate">
                        SATUAN UNIVERSITAS NEGERI JAKARTA
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[#FFDD00] shrink-0">
                      <ShieldCheck size={16} />
                    </div>
                  </div>
                </div>

                {/* Bagian Tengah: Foto Resmi Prajurit & Biodata KTA */}
                <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center px-1 py-1">
                  {/* Bingkai Foto Resmi Portrait Bergaris Emas */}
                  <div className="w-24 h-32 sm:w-28 sm:h-36 rounded-2xl border-2 border-amber-400 bg-slate-950/80 overflow-hidden shrink-0 shadow-xl flex items-center justify-center mb-3 relative group">
                    {profile?.photoURL || user?.photoURL ? (
                      <img
                        src={profile.photoURL || user.photoURL}
                        alt={cardName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-amber-300 p-2 text-center">
                        <User size={34} />
                        <span className="text-[8px] font-mono font-bold mt-1 tracking-wider">FOTO RESMI</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent py-1">
                      <span className="text-[7.5px] font-mono font-black text-amber-300 uppercase tracking-widest">
                        TERVERIFIKASI
                      </span>
                    </div>
                  </div>

                  {/* Biodata Anggota */}
                  <div className="w-full space-y-1 bg-slate-950/45 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-inner">
                    <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-cyan-300 font-bold block">
                      KARTU TANDA ANGGOTA RESMI
                    </span>
                    <h3 className="text-sm sm:text-base font-black truncate text-white leading-tight">
                      {cardName}
                    </h3>
                    <div className="font-mono text-xs font-black text-[#FFDD00] tracking-wider">
                      {cardNbp}
                    </div>
                    <div className="text-[10.5px] font-bold text-slate-200 truncate">
                      {cardRole}
                    </div>
                    <div className="text-[9.5px] text-slate-300 truncate">
                      {cardFaculty}
                    </div>
                  </div>
                </div>

                {/* Bagian Bawah: Semboyan & Footer Satuan */}
                <div className="relative z-10 pt-2 border-t border-white/20 text-center space-y-1">
                  <div className="flex items-center justify-between text-[8px] font-mono">
                    <span className="text-slate-300">KODE KEHORMATAN</span>
                    <span className="text-slate-300">BERLAKU: <strong className="text-white">2026 – 2028</strong></span>
                  </div>
                  <div className="text-[10px] font-black tracking-widest text-[#FFDD00] uppercase">
                    WIDYA CASTRENA DHARMA SIDDHA
                  </div>
                  <p className="text-[10px] font-bold text-blue-100 tracking-[0.25em] uppercase">
                    State Univ. of Jakarta
                  </p>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                KARTU 2: SISI BELAKANG (BACK - DOKTRIN & KETENTUAN KTA)
            ════════════════════════════════════════════════════════════════ */}
            {(activeSideTab === 'back' || activeSideTab === 'both') && (
              <div className="relative w-full max-w-[360px] aspect-[1/1.62] rounded-[28px] overflow-hidden shadow-2xl border-2 border-white/40 p-4 sm:p-5 flex flex-col justify-between text-white select-none shrink-0 transition-transform hover:shadow-[0_20px_50px_rgba(2,98,210,0.35)]">
                {/* Latar Belakang Pola Geometris Biru Royal */}
                <SacredGeometryBackground />
                <CornerAccents />

                {/* Watermark Logo Menwa UNJ Tipis di Belakang Konten */}
                <img
                  src="/logo-menwa-unj.png"
                  alt=""
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 object-contain opacity-[0.09] pointer-events-none -z-10"
                />

                {/* Bagian Atas: Lanyard Slot, Pill & Header Resmi */}
                <div className="relative z-10 text-center">
                  <LanyardSlot />

                  <div className="inline-block px-3.5 py-0.5 rounded-full text-[9px] font-black tracking-[0.18em] uppercase border border-amber-400/60 bg-amber-400/10 text-amber-300 shadow-sm mb-1.5">
                    KODE KEHORMATAN &amp; TATA TERTIB
                  </div>

                  <h3 className="text-xs sm:text-[13px] font-black tracking-[0.15em] text-white uppercase">
                    KARTU TANDA ANGGOTA RESMI
                  </h3>
                  <p className="text-[10px] text-blue-100 font-semibold mt-0.5">
                    Resimen Mahasiswa Jayakarta Satuan UNJ
                  </p>
                </div>

                {/* Bagian Tengah: PANCA DHARMA SATYA & TEKAD DAN PENDIRIAN */}
                <div className="relative z-10 space-y-2 my-auto overflow-y-auto max-h-[350px] pr-0.5">
                  {/* Blok 1: Panca Dharma Satya Resimen Mahasiswa Indonesia */}
                  <div className="rounded-xl p-2.5 bg-slate-950/45 backdrop-blur-sm border border-white/15 space-y-1">
                    <div className="flex items-center justify-between border-b border-white/15 pb-1">
                      <span className="text-[8.5px] font-black tracking-wider text-[#FFDD00] uppercase">
                        PANCA DHARMA SATYA MENWA INDONESIA
                      </span>
                      <span className="text-[8px] font-mono text-slate-300 font-bold">01 - 05</span>
                    </div>
                    <ol className="space-y-1 text-[7.5px] sm:text-[8px] leading-tight text-slate-100">
                      {PANCA_DHARMA_SATYA.map((dharma, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="font-mono font-bold text-[#FFDD00] shrink-0">{i + 1}.</span>
                          <span className="text-slate-100">{dharma}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Blok 2: Tekad dan Pendirian Resimen Mahasiswa Indonesia */}
                  <div className="rounded-xl p-2.5 bg-slate-950/45 backdrop-blur-sm border border-white/15 space-y-1">
                    <div className="flex items-center justify-between border-b border-white/15 pb-1">
                      <span className="text-[8.5px] font-black tracking-wider text-cyan-300 uppercase">
                        TEKAD DAN PENDIRIAN MENWA INDONESIA
                      </span>
                      <span className="text-[8px] font-mono text-slate-300 font-bold">01 - 05</span>
                    </div>
                    <ol className="space-y-1 text-[7.5px] sm:text-[8px] leading-tight text-slate-100">
                      {TEKAD_DAN_PENDIRIAN.map((tekad, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="font-mono font-bold text-cyan-300 shrink-0">{i + 1}.</span>
                          <span className="text-slate-100">{tekad}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Bagian Bawah: QR Code Keabsahan & Alamat Mako Satuan */}
                <div className="relative z-10 pt-2 border-t border-white/20 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    {qrCodeDataUrl ? (
                      <div className="w-10 h-10 rounded-lg bg-white p-0.5 shrink-0 shadow-sm">
                        <img src={qrCodeDataUrl} alt="QR Code Keabsahan" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white text-slate-900 flex items-center justify-center shrink-0">
                        <QrCode size={22} />
                      </div>
                    )}
                    <div className="text-[7.5px] text-slate-200 leading-tight">
                      <span className="font-bold text-[#FFDD00] block">MAKO MENWA SATUAN UNJ</span>
                      <span>Gedung G R.107 Kampus A UNJ Rawamangun Jakarta</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[9px] sm:text-[10px] font-bold text-white tracking-[0.22em] uppercase">
                      State Univ. of Jakarta
                    </p>
                    <span className="text-[7px] font-mono text-cyan-300 block">KORPS RESMI MENWA UNJ</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Petunjuk Penggunaan & Tombol Cetak */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
            💡 <em>Kartu Tanda Anggota (KTA) resmi format Portrait berstandar lanyard badge. Siap dicetak langsung pada material PVC ID Card atau kertas tebal A4.</em>
          </p>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="neu-btn-strong-blue rounded-full py-2.5 px-6 text-xs font-black flex items-center gap-2 shadow-md cursor-pointer hover:scale-105 transition"
            >
              <Printer size={16} />
              <span>Cetak KTA Fisik (PVC / A4)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="neu-btn rounded-full py-2.5 px-5 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-200 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TacticalKTACardModal;
