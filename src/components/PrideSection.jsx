import React, { useState, useEffect, useRef } from 'react';
import { Users, Award, Compass, Trophy } from 'lucide-react';

const rotatingPhrases = ['Prestasi Satuan', 'Pengabdian Nyata', 'Pembinaan Karakter', 'Penyelenggaraan Nasional'];

export const PrideText = () => {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const phrase = rotatingPhrases[index];

  useEffect(() => {
    const pause = !deleting && typed === phrase;
    const timer = setTimeout(
      () => {
        if (pause) {
          setDeleting(true);
          return;
        }
        if (deleting) {
          const next = typed.slice(0, -1);
          setTyped(next);
          if (!next) {
            setDeleting(false);
            setIndex((i) => (i + 1) % rotatingPhrases.length);
          }
        } else {
          setTyped(phrase.slice(0, typed.length + 1));
        }
      },
      pause ? 1600 : deleting ? 50 : 80
    );
    return () => clearTimeout(timer);
  }, [typed, deleting, phrase]);

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2">
      <span className="text-white">Menwa UNJ dalam</span>
      <span className="text-[#FFDD00] relative inline-block underline decoration-cyan-400/50 decoration-wavy">
        {typed}
        <span className="inline-block w-0.5 h-6 ml-1 bg-[#FFDD00] animate-pulse align-middle" />
      </span>
    </span>
  );
};

export const V3_STATS = [
  { label: 'Anggota Aktif', number: 50, icon: Users, color: 'text-cyan-400' },
  { label: 'Prestasi Terdata', number: 150, icon: Award, color: 'text-[#FFDD00]' },
  { label: 'Giat Pengabdian', number: 100, icon: Compass, color: 'text-emerald-400' },
  { label: 'Penyelenggaraan Lomba', number: 30, icon: Trophy, color: 'text-amber-400' },
];

export const PrideStat = ({ item }) => {
  const ref = useRef(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    let running = false;
    const run = () => {
      if (running) return;
      running = true;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setCount(item.number);
        return;
      }
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / 2500);
        const eased = 1 - Math.pow(1 - progress, 2);
        setCount(Math.round(eased * item.number));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [item.number]);

  const Icon = item.icon;
  return (
    <article
      ref={ref}
      className="relative rounded-3xl bg-gradient-to-b from-[#08222b]/90 to-[#041217]/95 backdrop-blur-xl border border-white/12 p-6 sm:p-8 flex flex-col items-center text-center shadow-xl hover:border-[#FFDD00]/50 hover:bg-[#0a2c37]/90 hover:-translate-y-1.5 transition-all duration-300 group"
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#006569] to-[#022a30] border border-cyan-400/30 flex items-center justify-center text-[#FFDD00] mb-4 shadow-lg group-hover:scale-110 transition-transform">
        <Icon size={24} className={item.color} />
      </div>
      <strong className="text-4xl sm:text-5xl font-black text-white tracking-tight">
        {count}
        <i className="not-italic text-[#FFDD00] ml-1">+</i>
      </strong>
      <span className="text-xs sm:text-sm font-bold text-slate-300 mt-2">{item.label}</span>
    </article>
  );
};

export const PrideSection = () => (
  <section className="bg-gradient-to-b from-[#061820] via-[#051419] to-[#030d11] py-20 px-4 sm:px-6 lg:px-8 border-t border-white/10 relative overflow-hidden" aria-labelledby="brand-pride-title">
    <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#FFDD00]/5 blur-3xl" />

    <div className="max-w-7xl mx-auto relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/15 border border-teal-400/30 text-cyan-300 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
          JEJAK &amp; KEBANGGAAN SATUAN
        </span>
        <h2 id="brand-pride-title" className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
          <PrideText />
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-3 font-medium">
          Langkah, karya, dan dedikasi pengabdian yang menjadi kebanggaan Korps Resimen Mahasiswa Satuan UNJ.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {V3_STATS.map((item) => (
          <PrideStat key={item.label} item={item} />
        ))}
      </div>
    </div>
  </section>
);

export default PrideSection;
