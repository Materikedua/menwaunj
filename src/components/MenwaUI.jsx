// MenwaUI.jsx — v2 (ringan, tanpa tilt 3D)
// Semua animasi kursor memakai CSS variable + requestAnimationFrame (tanpa re-render React),
// otomatis nonaktif di layar sentuh dan saat pengguna memilih "reduce motion".
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NavBar } from './NavBar.jsx';
export { NavBar };

export const BRAND = { teal: '#006569', tealDark: '#00383b', gold: '#FFDD00' };

const canHover = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const interactive = () => canHover() && !reduced();

/* ============================================================
   1. MotionStyles — keyframes (render sekali di App)
   ============================================================ */
export const MotionStyles = () => (
  <>
    <svg className="pointer-events-none fixed -left-96 -top-96 h-0 w-0 opacity-0" aria-hidden="true">
      <defs>
        {/* Filter Distorsi Kelengkungan Lensa Cembung/Cekung & Refraksi Kaca Realistis */}
        <filter id="menwa-liquid-glass-filter" x="-5%" y="-10%" width="110%" height="130%" colorInterpolationFilters="sRGB">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.003 0.015"
            numOctaves="1"
            seed="8"
            result="lensBulge"
          />
          <feGaussianBlur in="lensBulge" stdDeviation="3.5" result="smoothLens" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="smoothLens"
            scale="20"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
    <style>{`
      @keyframes mu-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      @keyframes mu-blob { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(40px,-30px) scale(1.12); } 66% { transform: translate(-30px,25px) scale(.92); } }
      @keyframes mu-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      @keyframes mu-shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
      @keyframes mu-pulse-ring { 0% { transform: scale(.85); opacity: .6; } 100% { transform: scale(1.8); opacity: 0; } }
      @keyframes mu-kenburns { 0%,100% { transform: scale(1.05); } 50% { transform: scale(1.14) translate(-1.2%, -.8%); } }
      @keyframes mu-cinema-shot-1 {
        0%, 28% { opacity: 1; transform: scale(1.04) translate3d(0, 0, 0); }
        34%, 92% { opacity: 0; transform: scale(1.14) translate3d(-1.5%, -1%, 0); }
        100% { opacity: 1; transform: scale(1.04) translate3d(0, 0, 0); }
      }
      @keyframes mu-cinema-shot-2 {
        0%, 28% { opacity: 0; transform: scale(1.12) translate3d(1.5%, 0, 0); }
        34%, 62% { opacity: 1; transform: scale(1.04) translate3d(-0.5%, -0.5%, 0); }
        68%, 100% { opacity: 0; transform: scale(1.15) translate3d(-1.5%, 0.8%, 0); }
      }
      @keyframes mu-cinema-shot-3 {
        0%, 62% { opacity: 0; transform: scale(1.12) translate3d(-1%, 1%, 0); }
        68%, 94% { opacity: 1; transform: scale(1.05) translate3d(0.8%, -0.4%, 0); }
        100% { opacity: 0; transform: scale(1.14) translate3d(0, 0, 0); }
      }
      @keyframes mu-anamorphic-flare {
        0% { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
        25% { opacity: 0.55; }
        50% { transform: translateX(140%) skewX(-18deg); opacity: 0; }
        100% { transform: translateX(140%) skewX(-18deg); opacity: 0; }
      }

      .mu-float { animation: mu-float 6s ease-in-out infinite; }
      .mu-blob { animation: mu-blob 18s ease-in-out infinite; }
      .mu-kenburns { animation: mu-kenburns 26s ease-in-out infinite; }
      .mu-cinema-1 { animation: mu-cinema-shot-1 21s cubic-bezier(.22,1,.36,1) infinite; }
      .mu-cinema-2 { animation: mu-cinema-shot-2 21s cubic-bezier(.22,1,.36,1) infinite; }
      .mu-cinema-3 { animation: mu-cinema-shot-3 21s cubic-bezier(.22,1,.36,1) infinite; }
      .mu-anamorphic { animation: mu-anamorphic-flare 9s ease-in-out infinite; }
      .mu-shimmer {
        background: linear-gradient(110deg, #FFDD00 20%, #fff 45%, #FFDD00 70%);
        background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent;
        animation: mu-shimmer 5s linear infinite;
      }
      .mu-delay-1 { animation-delay: 2s; } .mu-delay-2 { animation-delay: 4s; }
      @media (prefers-reduced-motion: reduce) {
        .mu-float,.mu-blob,.mu-kenburns,.mu-shimmer,.mu-cinema-1,.mu-cinema-2,.mu-cinema-3,.mu-anamorphic { animation: none !important; }
      }
    `}</style>
  </>
);

/* ============================================================
   2. Reveal / Stagger — muncul saat scroll (2D, tanpa perspective)
   ============================================================ */
export const Reveal = ({ children, className = '', delay = 0, from = 'up', once = true }) => {
  const [shown, setShown] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setShown(true); if (once) io.unobserve(el); }
        else if (!once) setShown(false);
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  const hidden = {
    up: 'translate-y-10', down: '-translate-y-10',
    left: 'translate-x-14', right: '-translate-x-14', zoom: 'scale-95'
  }[from] || 'translate-y-10';

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-[800ms] ease-[cubic-bezier(.16,1,.3,1)] ${shown ? 'opacity-100 translate-x-0 translate-y-0 scale-100' : `opacity-0 ${hidden}`
        } ${className}`}
    >
      {children}
    </div>
  );
};

export const Stagger = ({ children, step = 90, from = 'up', className = '', itemClassName = '' }) => {
  const validChildren = React.Children.toArray(children).filter(
    (c) => c !== null && c !== undefined && c !== false && (typeof c !== 'string' || c.trim().length > 0)
  );
  return (
    <div className={className}>
      {validChildren.map((child, i) => (
        <Reveal key={child.key || i} delay={i * step} from={from} className={itemClassName}>
          {child}
        </Reveal>
      ))}
    </div>
  );
};

/* ============================================================
   3. CursorGlow — cahaya lembut global yang mengikuti kursor
   ============================================================ */
export const CursorGlow = ({ size = 560, color = 'rgba(0,168,175,.03)' }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!interactive()) return;
    const el = ref.current;
    let x = window.innerWidth / 2, y = window.innerHeight / 2, cx = x, cy = y, raf = 0, run = false;
    const loop = () => {
      cx += (x - cx) * 0.1; cy += (y - cy) * 0.1;
      el.style.transform = `translate3d(${cx - size / 2}px, ${cy - size / 2}px, 0)`;
      if (Math.abs(x - cx) > 0.3 || Math.abs(y - cy) > 0.3) raf = requestAnimationFrame(loop);
      else run = false;
    };
    const move = (e) => {
      const inModal = e.target?.closest?.('[role="dialog"], .portal-search-overlay, div.fixed.inset-0');
      x = e.clientX; y = e.clientY;
      el.style.opacity = inModal ? 0 : 1;
      if (!run) { run = true; raf = requestAnimationFrame(loop); }
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf); };
  }, [size]);

  if (typeof window !== 'undefined' && !interactive()) return null;
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[5] rounded-full transition-opacity duration-500"
      style={{ width: size, height: size, opacity: 0, background: `radial-gradient(circle, ${color}, transparent 65%)` }}
    />
  );
};

/* ============================================================
   4. CursorFollower — titik + cincin adaptif mengikuti warna tombol
      & nonaktif di dalam pop-up window
   ============================================================ */
const resolveButtonGlowColors = (el) => {
  if (!el) return { border: 'rgba(0,168,175,0.65)', fill: 'rgba(0,168,175,0.14)', dot: '#00A8AF' };
  const cls = typeof el.className === 'string' ? el.className : '';
  if (cls.includes('neu-btn-gold') || cls.includes('bg-[#FFDD00]') || cls.includes('bg-amber') || cls.includes('bg-yellow')) {
    return { border: 'rgba(255,221,0,0.8)', fill: 'rgba(255,221,0,0.16)', dot: '#FFDD00' };
  }
  if (cls.includes('neu-btn-strong-blue') || cls.includes('bg-blue') || cls.includes('bg-indigo')) {
    return { border: 'rgba(59,130,246,0.8)', fill: 'rgba(59,130,246,0.16)', dot: '#3B82F6' };
  }
  if (cls.includes('neu-btn-strong-green') || cls.includes('bg-emerald') || cls.includes('bg-green')) {
    return { border: 'rgba(16,185,129,0.8)', fill: 'rgba(16,185,129,0.16)', dot: '#10B981' };
  }
  if (cls.includes('neu-btn-strong-red') || cls.includes('bg-rose') || cls.includes('bg-red')) {
    return { border: 'rgba(239,68,68,0.8)', fill: 'rgba(239,68,68,0.16)', dot: '#EF4444' };
  }
  if (cls.includes('neu-btn-strong-orange') || cls.includes('bg-orange')) {
    return { border: 'rgba(249,115,22,0.8)', fill: 'rgba(249,115,22,0.16)', dot: '#F97316' };
  }
  if (cls.includes('neu-btn-primary') || cls.includes('bg-[#006569]') || cls.includes('bg-teal')) {
    return { border: 'rgba(0,168,175,0.85)', fill: 'rgba(0,168,175,0.18)', dot: '#00A8AF' };
  }
  if (cls.includes('neu-btn') || cls.includes('bg-white') || cls.includes('bg-slate-50') || cls.includes('bg-slate-100') || cls.includes('neu-pill-tab')) {
    return { border: 'rgba(148,163,184,0.85)', fill: 'rgba(226,232,240,0.22)', dot: '#94A3B8' };
  }
  return { border: 'rgba(0,168,175,0.7)', fill: 'rgba(0,168,175,0.14)', dot: '#00A8AF' };
};

export const CursorFollower = () => {
  const dot = useRef(null), dotInner = useRef(null), ring = useRef(null), inner = useRef(null);
  const [enabled, setEnabled] = useState(false);
  useEffect(() => { setEnabled(interactive()); }, []);

  useEffect(() => {
    if (!enabled) return;
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0, run = false;
    const loop = () => {
      rx += (x - rx) * 0.2; ry += (y - ry) * 0.2;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      if (Math.abs(x - rx) > 0.3 || Math.abs(y - ry) > 0.3) raf = requestAnimationFrame(loop);
      else run = false;
    };
    const move = (e) => {
      x = e.clientX; y = e.clientY;
      const inModal = e.target?.closest?.('[role="dialog"], .portal-search-overlay, div.fixed.inset-0');
      if (dot.current) {
        dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        dot.current.style.opacity = inModal ? 0 : 1;
      }
      if (ring.current) {
        ring.current.style.opacity = inModal ? 0 : 1;
      }
      if (!run) { run = true; raf = requestAnimationFrame(loop); }
    };
    const over = (e) => {
      if (!inner.current) return;
      const inModal = e.target?.closest?.('[role="dialog"], .portal-search-overlay, div.fixed.inset-0');
      if (inModal) {
        inner.current.style.transform = 'scale(1)';
        inner.current.style.background = 'transparent';
        return;
      }
      const hot = e.target.closest && e.target.closest('a,button,[data-cursor]');
      const palette = resolveButtonGlowColors(hot);
      inner.current.style.transform = hot ? 'scale(1.85)' : 'scale(1)';
      inner.current.style.borderColor = palette.border;
      inner.current.style.background = hot ? palette.fill : 'transparent';
      if (dotInner.current) dotInner.current.style.backgroundColor = palette.dot;
    };
    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseover', over, { passive: true });
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div ref={ring} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[9999] opacity-0 transition-opacity duration-300">
        <div
          ref={inner}
          className="-ml-4 -mt-4 h-8 w-8 rounded-full border border-[#00A8AF]/70"
          style={{ transition: 'transform 220ms cubic-bezier(.16,1,.3,1), background 220ms, border-color 220ms' }}
        />
      </div>
      <div ref={dot} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[9999] opacity-0">
        <div ref={dotInner} className="-ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-[#00A8AF] transition-colors duration-200" />
      </div>
    </>
  );
};

/* ============================================================
   5. Spotlight / HoverCard — cahaya mengikuti kursor di dalam kartu
      (tanpa memiringkan kartu; hanya terangkat sedikit)
   ============================================================ */
export const Spotlight = ({ children, className = '', color = 'rgba(0,168,175,.14)', size = 420, inner = '' }) => {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--sx', `${e.clientX - r.left}px`);
    el.style.setProperty('--sy', `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} onMouseMove={onMove} className={`group/spot relative overflow-hidden ${className}`}>
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-0 group-hover/spot:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(${size}px circle at var(--sx, 50%) var(--sy, 50%), ${color}, transparent 65%)` }}
      />
      <div className={`relative ${inner}`}>{children}</div>
    </div>
  );
};

export const HoverCard = ({ children, className = '', color, inner = '' }) => (
  <Spotlight
    color={color}
    inner={inner}
    className={`luxury-card transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_28px_70px_-24px_rgba(0,101,105,.48)] ${className}`}
  >
    {children}
  </Spotlight>
);

/* ============================================================
   6. MagneticButton — tombol sedikit "tertarik" ke kursor (2D, ringan)
   ============================================================ */
export const MagneticButton = ({ as: Tag = 'button', children, className = '', strength = 0.22, ...rest }) => {
  const ref = useRef(null);
  const onMove = (e) => {
    if (!interactive()) return;
    const el = ref.current; const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = 'translate3d(0,0,0)'; };
  return (
    <Tag
      ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ transition: 'transform 300ms cubic-bezier(.16,1,.3,1)' }}
      className={className} {...rest}
    >
      {children}
    </Tag>
  );
};

/* ============================================================
   7. HeroStage — Live Web Short-Video Cinematic Hero Stage
      Menampilkan sekuens bak video pendek sinematik yang menyorot
      Markas & aktivitas Komando Menwa UNJ dengan parallax halus.
   ============================================================ */
export const HeroStage = ({
  children,
  className = '',
  photo = '/foto-kampus-unj.jpg',
  blur = 2.5,
  dim = 0.55,
  art = null,
  liveCinema = false,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!interactive()) return;
    const el = ref.current;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, run = false;
    const loop = () => {
      cx += (tx - cx) * 0.07; cy += (ty - cy) * 0.07;
      el.style.setProperty('--mx', cx.toFixed(3));
      el.style.setProperty('--my', cy.toFixed(3));
      if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) raf = requestAnimationFrame(loop);
      else run = false;
    };
    const kick = () => { if (!run) { run = true; raf = requestAnimationFrame(loop); } };
    const move = (e) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      kick();
    };
    const leave = () => { tx = 0; ty = 0; kick(); };
    el.addEventListener('mousemove', move, { passive: true });
    el.addEventListener('mouseleave', leave);
    return () => {
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  const d = Math.min(Math.max(dim, 0), 1);
  const overlay = `linear-gradient(180deg, rgba(2,8,18,${Math.min(d + 0.16, 0.92)}) 0%, rgba(0,48,52,${Math.max(d - 0.06, 0.35)}) 48%, rgba(2,6,23,${Math.min(d + 0.28, 0.96)}) 100%)`;

  return (
    <section
      ref={ref}
      className={`relative w-full overflow-hidden bg-slate-950 flex flex-col items-center justify-center ${className}`}
    >
      {/* Multi-Shot Live Web Cinematic Reel (Video-style camera sequence) */}
      <ParallaxLayer depth={-12} className="absolute -inset-8 z-0">
        {liveCinema ? (
          <div className="relative h-full w-full">
            <img
              src={photo}
              alt=""
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              className="absolute inset-0 h-full w-full object-cover mu-cinema-1"
              style={{ filter: `blur(${Math.max(blur - 1, 1)}px) saturate(1.18) contrast(1.06)` }}
            />
            <img
              src="/kegiatan/kc-menwa-unj.jpg"
              alt=""
              onError={(e) => { e.currentTarget.src = photo; }}
              className="absolute inset-0 h-full w-full object-cover mu-cinema-2"
              style={{ filter: `blur(${Math.max(blur - 0.5, 1.5)}px) saturate(1.15) contrast(1.08)` }}
            />
            <img
              src="/kegiatan/youth-spark-2026.webp"
              alt=""
              onError={(e) => { e.currentTarget.src = photo; }}
              className="absolute inset-0 h-full w-full object-cover mu-cinema-3"
              style={{ filter: `blur(${Math.max(blur - 0.5, 1.5)}px) saturate(1.15) contrast(1.06)` }}
            />
          </div>
        ) : (
          <img
            src={photo}
            alt=""
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            className="h-full w-full object-cover mu-kenburns"
            style={{ filter: `blur(${blur}px) saturate(1.1)` }}
          />
        )}
      </ParallaxLayer>

      {/* Cinema Vignette & Color Grading Overlay */}
      <div className="absolute inset-0 z-0" style={{ background: overlay }} />
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 32%, rgba(2,6,23,.72) 100%)' }}
      />

      {/* Anamorphic Cinema Light Flare Sweep */}
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        <div
          className="mu-anamorphic absolute -inset-y-12 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#FFDD00]/12 to-transparent"
        />
      </div>

      {/* Subtle Tactical Grid & Cinema Letterbox Rim */}
      {liveCinema && (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-[1] opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.22) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          {/* Corner HUD Brackets */}
          <div className="pointer-events-none absolute left-4 top-5 z-[3] hidden sm:block h-7 w-7 border-l-2 border-t-2 border-[#FFDD00]/45 rounded-tl-md" />
          <div className="pointer-events-none absolute right-4 top-5 z-[3] hidden sm:block h-7 w-7 border-r-2 border-t-2 border-[#FFDD00]/45 rounded-tr-md" />
          <div className="pointer-events-none absolute left-4 bottom-5 z-[3] hidden sm:block h-7 w-7 border-l-2 border-b-2 border-[#FFDD00]/45 rounded-bl-md" />
          <div className="pointer-events-none absolute right-4 bottom-5 z-[3] hidden sm:block h-7 w-7 border-r-2 border-b-2 border-[#FFDD00]/45 rounded-br-md" />
        </>
      )}

      {/* Aksen warna lembut (subtle, non-glare) */}
      <div className="pointer-events-none absolute -left-10 top-0 z-0 h-96 w-96 rounded-full bg-[#006569] opacity-10 blur-[120px] mu-blob" />
      <div className="pointer-events-none absolute -right-10 top-10 z-0 h-96 w-96 rounded-full bg-[#FFDD00] opacity-[0.04] blur-[120px] mu-blob mu-delay-1" />

      {art && <div className="pointer-events-none absolute inset-0 z-[5]">{art}</div>}

      <div className="relative z-10 w-full flex flex-col items-center">{children}</div>
    </section>
  );
};

/* Layer yang bergeser mengikuti --mx / --my milik HeroStage.
   depth positif = ikut arah kursor, negatif = berlawanan. (px maksimum) */
export const ParallaxLayer = ({ children, depth = 10, className = '' }) => (
  <div
    className={`will-change-transform ${className}`}
    style={{ transform: `translate3d(calc(var(--mx, 0) * ${depth}px), calc(var(--my, 0) * ${depth}px), 0)` }}
  >
    {children}
  </div>
);

/* ============================================================
   8. HeroLogo — logo diam (tidak berputar): melayang halus,
      pulse ring, glow emas yang bergeser mengikuti kursor,
      dan kilau yang menyapu saat di-hover.
   ============================================================ */
export const HeroLogo = ({
  src = '/logo-menwa-unj.png', alt = 'Logo Menwa UNJ',
  size = 'w-40 h-40 md:w-48 md:h-48', onError
}) => (
  <div className={`group relative ${size}`}>
    {/* glow bergeser mengikuti kursor */}
    <ParallaxLayer depth={26} className="absolute inset-0">
      <div className="h-full w-full rounded-full bg-[#FFDD00]/25 blur-3xl" />
    </ParallaxLayer>

    <span className="absolute inset-0 rounded-full border border-[#FFDD00]/40" style={{ animation: 'mu-pulse-ring 3.4s ease-out infinite' }} />
    <span className="absolute inset-0 rounded-full border border-white/25" style={{ animation: 'mu-pulse-ring 3.4s ease-out infinite 1.7s' }} />

    <ParallaxLayer depth={14} className="relative h-full w-full">
      <div className="mu-float relative h-full w-full transition-transform duration-500 group-hover:scale-105">
        <img
          src={src} alt={alt} onError={onError}
          className="h-full w-full object-contain drop-shadow-[0_12px_36px_rgba(255,221,0,.4)]"
        />
        {/* kilau menyapu saat hover */}
        <span
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
          style={{ WebkitMaskImage: 'radial-gradient(circle, #000 60%, transparent 72%)', maskImage: 'radial-gradient(circle, #000 60%, transparent 72%)' }}
        >
          <span className="absolute -inset-y-4 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[420%] transition-all duration-[900ms] ease-out" />
        </span>
      </div>
    </ParallaxLayer>
  </div>
);

/* ============================================================
   9. ScrollProgress — bar progres scroll
   ============================================================ */
export const ScrollProgress = () => {
  const ref = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (ref.current) ref.current.style.transform = `scaleX(${h > 0 ? window.scrollY / h : 0})`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[3px]">
      <div
        ref={ref}
        className="h-full origin-left bg-gradient-to-r from-[#006569] via-[#FFDD00] to-[#006569] shadow-[0_0_12px_rgba(255,221,0,.8)]"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
};

/* ============================================================
   10. Marquee & Counter
   ============================================================ */
export const Marquee = ({ items = [], speed = 28, className = '' }) => (
  <div className={`relative overflow-hidden ${className}`}>
    <div className="flex w-max" style={{ animation: `mu-marquee ${speed}s linear infinite` }}>
      {[...items, ...items].map((t, i) => (
        <span key={i} className="mx-8 whitespace-nowrap text-xs md:text-sm font-black uppercase tracking-[0.25em] text-[#FFDD00]/80">
          {t} <span className="text-white/30 ml-8">◆</span>
        </span>
      ))}
    </div>
  </div>
);

export const Counter = ({ to = 100, duration = 1600, suffix = '', className = '' }) => {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.unobserve(el);
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / duration, 1);
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref} className={className}>{v}{suffix}</span>;
};

/* ============================================================
   11. NavBar — Ultra-Premium Glassmorphism Navigation Bar
   (Pemisahan komponen khusus di src/components/NavBar.jsx)
   ============================================================ */

/* ============================================================
   12. TabSwitch — transisi antar tab (fade + slide)
   ============================================================ */
export const TabSwitch = ({ tabKey, children }) => {
  const [render, setRender] = useState(children);
  const [state, setState] = useState('in');
  const keyRef = useRef(tabKey);

  useEffect(() => {
    if (keyRef.current === tabKey) { setRender(children); return; }
    setState('out');
    const t = setTimeout(() => {
      keyRef.current = tabKey;
      setRender(children);
      setState('in');
    }, 220);
    return () => clearTimeout(t);
  }, [tabKey, children]);

  return (
    <div
      className={`transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${state === 'in' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
    >
      {render}
    </div>
  );
};

/* ============================================================
   Alias kompatibilitas dengan versi 1 (kode lama tidak error)
   ============================================================ */
export const NavBar3D = NavBar;
export const Logo3D = HeroLogo;
export const Orbit3D = () => null;                // sudah dihapus
export const TiltCard = ({ children, className = '' }) => (   // tidak lagi memiringkan
  <div className={`transition-transform duration-300 hover:-translate-y-1.5 ${className}`}>{children}</div>
);
