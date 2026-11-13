import React, { useState, useEffect, useRef } from 'react';
import { Users, CalendarDays, Trophy, HeartHandshake } from 'lucide-react';
import { UNIT_METRICS } from '../data/siteConfig';

const ICON_MAP = {
  users: Users,
  calendar: CalendarDays,
  trophy: Trophy,
  heart: HeartHandshake,
};

const ROTATING_PHRASES = [
  'Pencapaian & Pengabdian',
  'Prestasi & Dedikasi',
  'Pembinaan Bela Negara',
  'Pengabdian Masyarakat',
];

export const PrideText = () => {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const phrase = ROTATING_PHRASES[index];

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
            setIndex((i) => (i + 1) % ROTATING_PHRASES.length);
          }
        } else {
          setTyped(phrase.slice(0, typed.length + 1));
        }
      },
      pause ? 1800 : deleting ? 50 : 85
    );
    return () => clearTimeout(timer);
  }, [typed, deleting, phrase]);

  return (
    <span className="pride-line">
      <span className="pride-prefix">Menwa UNJ dalam </span>
      <span className="pride-typing text-[#FFDD00]">
        <span className="pride-typing__text">{typed}</span>
        <span className="pride-typing__caret inline-block w-[3px] h-[0.9em] bg-[#FFDD00] ml-1.5 align-baseline animate-pulse" aria-hidden />
      </span>
    </span>
  );
};

export const V3_STATS = UNIT_METRICS;

export const PrideStat = ({ item }) => {
  const ref = useRef(null);
  const [count, setCount] = useState(item.number);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(item.number);
      return;
    }
    let frame = 0;
    let running = false;
    const run = () => {
      if (running) return;
      running = true;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / 1600);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * item.number));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setCount(0);
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [item.number]);

  const Icon = ICON_MAP[item.iconKey] || Trophy;
  return (
    <article className={`brand-pride-stat brand-pride-stat--${item.color}`} ref={ref}>
      <span className="brand-pride-icon">
        <Icon size={24} />
      </span>
      <strong>
        {count.toLocaleString('id-ID')}
        {item.suffix ? <i>{item.suffix}</i> : null}
      </strong>
      <span className="font-bold">{item.label}</span>
    </article>
  );
};

export const PrideSection = () => (
  <section className="brand-pride" aria-labelledby="brand-pride-title">
    <div className="brand-container">
      <span className="brand-pride-eyebrow">REKAM JEJAK &amp; KAPASITAS SATUAN</span>
      <h2 id="brand-pride-title">
        <PrideText />
      </h2>
      <div className="brand-pride-grid">
        {UNIT_METRICS.map((item) => (
          <PrideStat key={item.id} item={item} />
        ))}
      </div>
    </div>
  </section>
);

export default PrideSection;

