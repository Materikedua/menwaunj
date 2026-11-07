import React, { useState, useEffect, useRef } from 'react';
import { Users, Award, Compass, Trophy } from 'lucide-react';

const rotatingPhrases = ['Prestasi', 'Pengabdian', 'Anggota', 'Penyelenggaraan'];

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
      pause ? 1500 : deleting ? 55 : 85
    );
    return () => clearTimeout(timer);
  }, [typed, deleting, phrase]);

  return (
    <span className="pride-line">
      <span className="pride-prefix">Menwa UNJ dalam </span>
      <span className="pride-typing">
        <span className="pride-typing__text">{typed}</span>
        <span className="pride-typing__caret" aria-hidden />
      </span>
    </span>
  );
};

export const V3_STATS = [
  { label: 'Anggota Aktif', number: 50, icon: Users, color: 'teal' },
  { label: 'Prestasi Terdata', number: 150, icon: Award, color: 'gold' },
  { label: 'Giat Pengabdian Masyarakat', number: 100, icon: Compass, color: 'violet' },
  { label: 'Penyelenggaraan Lomba', number: 30, icon: Trophy, color: 'coral' },
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
        const progress = Math.min(1, (now - start) / 4700);
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
      { threshold: 0.58 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [item.number]);

  const Icon = item.icon;
  return (
    <article className={`brand-pride-stat brand-pride-stat--${item.color}`} ref={ref}>
      <span className="brand-pride-icon">
        <Icon size={24} />
      </span>
      <strong>
        {count}
        <i>+</i>
      </strong>
      <span>{item.label}</span>
    </article>
  );
};

export const PrideSection = () => (
  <section className="brand-pride" aria-labelledby="brand-pride-title">
    <div className="brand-container">
      <span className="brand-pride-eyebrow">JEJAK &amp; KEBANGGAAN SATUAN</span>
      <h2 id="brand-pride-title">
        <PrideText />
      </h2>
      <p className="brand-pride-lead">Langkah, karya, dan pengabdian yang menjadi kebanggaan Menwa UNJ.</p>
      <div className="brand-pride-grid">
        {V3_STATS.map((item) => (
          <PrideStat key={item.label} item={item} />
        ))}
      </div>
    </div>
  </section>
);

export default PrideSection;

