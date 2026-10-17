import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ExternalLink, Maximize2, Shirt, X } from 'lucide-react';
import { KC_JERSEYS } from '../data/siteData';
import { usePublishedAction } from '../command/PublicActions.jsx';
import './JerseyShowcase.css';

export default function JerseyShowcase() {
  const [kind, setKind] = useState('peserta');
  const [enlarged, setEnlarged] = useState(null);
  const returnFocus = useRef(null);
  const closeButtonRef = useRef(null);
  const current = KC_JERSEYS.find((x) => x.id === kind) || KC_JERSEYS[0];
  const registrationUrl = usePublishedAction(`kc-jersey-${current.id}`, current.form);

  const openImage = (item) => {
    returnFocus.current = document.activeElement;
    setEnlarged(item);
  };

  const closeImage = () => setEnlarged(null);

  useEffect(() => {
    if (!enlarged) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') closeImage();
      if (e.key === 'Tab') {
        e.preventDefault();
        closeButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener('keydown', onKey);
      returnFocus.current?.focus?.();
    };
  }, [enlarged]);

  const lightboxItems = [
    { label: `Mockup ${current.label}`, kind: 'mockup' },
    { label: 'Detail Depan', image: current.front, kind: 'image' },
    { label: `Detail Belakang ${current.type}`, image: current.back, kind: 'image' },
  ];

  return (
    <section id="jersey-kc" aria-labelledby="jersey-kc-title" className="jersey-section scroll-mt-24 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="jersey-kicker">Merchandise Resmi • KC VIII 2026</span>
            <h2 id="jersey-kc-title" className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">Jersey <span className="text-[#FFDD00]">Ksatria Cendekia VIII</span></h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70 md:text-base">Lihat mockup jersey resmi dari dua sisi, lengkap dengan detail bahan dan pilihan pendaftaran sesuai peranmu.</p>
          </div>
          <div className="inline-flex w-fit rounded-2xl border border-white/15 bg-white/10 p-1.5" role="group" aria-label="Jenis jersey">
            {KC_JERSEYS.map((j) => (
              <button key={j.id} type="button" aria-pressed={kind === j.id} onClick={() => setKind(j.id)} className={`rounded-xl px-4 py-3 text-xs font-extrabold transition sm:text-sm ${kind === j.id ? 'bg-[#FFDD00] text-[#00383b] shadow-lg' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                {j.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br from-[#124e67] via-[#0a263d] to-[#031522] shadow-2xl lg:grid-cols-[minmax(0,1.12fr)_minmax(320px,.88fr)]">
          <div className="relative isolate overflow-hidden border-b border-white/10 px-4 py-7 sm:px-8 lg:border-b-0 lg:border-r">
            <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3b91b3]/20 blur-3xl" />
            <div className="flex items-center justify-between gap-3 px-1 sm:px-2">
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[.18em] text-white">Mockup Statis</span>
              <button type="button" className="rounded-full border border-white/15 bg-white/8 px-3 py-2 text-xs font-bold text-white/75 transition hover:bg-white/14 hover:text-white" onClick={() => openImage({ label: `Mockup ${current.label}`, kind: 'mockup' })}>
                Lihat besar
              </button>
            </div>
            <div className="jersey-mockup-stage jersey-mockup-stage--supplied mt-5" aria-label={`Mockup manekin jersey ${current.label} tampak depan dan belakang`}>
              <img className="jersey-supplied-image" loading="lazy" src={current.mockup} alt={`Mockup asli manekin depan dan belakang untuk ${current.label}`} />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="jersey-mini-pill">Motif Waffle yang vintage</span>
              <span className="jersey-mini-pill">Punggung edisi {current.type}</span>
              <span className="jersey-mini-pill">Bahan Premium dan Tahan Lama</span>
            </div>
          </div>

          <div className="flex flex-col justify-between p-6 text-white sm:p-9">
            <div>
              <span className="inline-flex rounded-full bg-[#FFDD00]/15 px-4 py-2 text-xs font-black uppercase tracking-wide text-[#FFDD00]">{current.badge}</span>
              <h3 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">{current.label}</h3>
              <div className="mt-2 text-3xl font-black text-[#FFDD00] sm:text-4xl">{current.priceLabel}</div>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/75">{current.description}</p>
              <ul className="mt-7 space-y-3 text-sm font-medium text-white/85">
                <li className="flex items-center gap-3"><Check size={18} className="shrink-0 text-[#FFDD00]" /> Motif waffle dry-fit yang nyaman dan adem</li>
                <li className="flex items-center gap-3"><Check size={18} className="shrink-0 text-[#FFDD00]" /> Kerah polo biru formal dengan komposisi warna khas KC VIII</li>
                <li className="flex items-center gap-3"><Check size={18} className="shrink-0 text-[#FFDD00]" /> Motif geometris dengan hasil akhir premium dan tahan lama</li>
              </ul>
            </div>
            <div className="mt-9 space-y-3">
              <a href={registrationUrl} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#FFDD00] px-5 py-4 text-center text-sm font-black text-[#00383b] shadow-lg transition hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFDD00]">{current.button} <ExternalLink size={18} /></a>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {lightboxItems.map((item) => (
            <button type="button" key={item.label} className="jersey-preview-tile group" onClick={() => openImage(item)} aria-label={`Perbesar ${item.label}`}>
              <span className="jersey-preview-image">
                {item.kind === 'mockup' ? (
                  <img loading="lazy" src={current.mockup} alt={`Mockup manekin ${current.label}`} />
                ) : (
                  <img loading="lazy" src={item.image} alt={item.label} />
                )}
              </span>
              <span className="flex items-center justify-between gap-2 p-4 text-left text-sm font-extrabold text-white">{item.label} <Maximize2 size={17} className="shrink-0 text-[#FFDD00] transition group-hover:scale-110" /></span>
            </button>
          ))}
        </div>
      </div>

      {enlarged && createPortal(
        <div className="jersey-lightbox" role="dialog" aria-modal="true" aria-label={`Perbesar ${enlarged.label}`} onMouseDown={(e) => { if (e.target === e.currentTarget) closeImage(); }}>
          <button ref={closeButtonRef} type="button" aria-label="Tutup tampilan detail" onClick={closeImage} className="jersey-lightbox-close jersey-lightbox-close--floating">
            <X size={22} />
            <span>Tutup</span>
          </button>
          <div className="jersey-lightbox-panel">
            <div className="jersey-lightbox-topbar"><span>{enlarged.label}</span></div>
            <div className="jersey-lightbox-inner">
              {enlarged.kind === 'mockup' ? (
                <img src={current.mockup} alt={`Mockup manekin depan dan belakang ${current.label}`} />
              ) : (
                <img src={enlarged.image} alt={enlarged.label} />
              )}
            </div>
            <p className="jersey-lightbox-hint">Tekan Esc, klik di luar area, atau tekan tombol Tutup.</p>
          </div>
        </div>, document.body)
      }
    </section>
  );
}
