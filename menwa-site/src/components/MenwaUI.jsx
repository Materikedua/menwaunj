// MenwaUI.jsx — v2 (ringan, tanpa tilt 3D)
// Semua animasi kursor memakai CSS variable + requestAnimationFrame (tanpa re-render React),
// otomatis nonaktif di layar sentuh dan saat pengguna memilih "reduce motion".
import React, { useState, useEffect, useRef } from 'react';

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
  <style>{`
    @keyframes mu-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
    @keyframes mu-blob { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(40px,-30px) scale(1.12); } 66% { transform: translate(-30px,25px) scale(.92); } }
    @keyframes mu-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    @keyframes mu-shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
    @keyframes mu-pulse-ring { 0% { transform: scale(.85); opacity: .6; } 100% { transform: scale(1.8); opacity: 0; } }
    @keyframes mu-kenburns { 0%,100% { transform: scale(1.04); } 50% { transform: scale(1.1) translate(-.8%, -.6%); } }

    .mu-float { animation: mu-float 6s ease-in-out infinite; }
    .mu-blob { animation: mu-blob 18s ease-in-out infinite; }
    .mu-kenburns { animation: mu-kenburns 30s ease-in-out infinite; }
    .mu-shimmer {
      background: linear-gradient(110deg, #FFDD00 20%, #fff 45%, #FFDD00 70%);
      background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent;
      animation: mu-shimmer 5s linear infinite;
    }
    .mu-delay-1 { animation-delay: 2s; } .mu-delay-2 { animation-delay: 4s; }
    @media (prefers-reduced-motion: reduce) {
      .mu-float,.mu-blob,.mu-kenburns,.mu-shimmer { animation: none !important; }
    }
  `}</style>
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
      className={`transition-all duration-[800ms] ease-[cubic-bezier(.16,1,.3,1)] ${
        shown ? 'opacity-100 translate-x-0 translate-y-0 scale-100' : `opacity-0 ${hidden}`
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const Stagger = ({ children, step = 90, from = 'up', className = '', itemClassName = '' }) => (
  <div className={className}>
    {React.Children.map(children, (child, i) => (
      <Reveal delay={i * step} from={from} className={itemClassName}>{child}</Reveal>
    ))}
  </div>
);

/* ============================================================
   3. CursorGlow — cahaya lembut global yang mengikuti kursor
   ============================================================ */
export const CursorGlow = ({ size = 560, color = 'rgba(255,221,0,.10)' }) => {
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
      x = e.clientX; y = e.clientY; el.style.opacity = 1;
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
   4. CursorFollower — titik + cincin kecil, membesar di atas tombol/link
   ============================================================ */
export const CursorFollower = () => {
  const dot = useRef(null), ring = useRef(null), inner = useRef(null);
  const [enabled, setEnabled] = useState(false);
  useEffect(() => { setEnabled(interactive()); }, []);

  useEffect(() => {
    if (!enabled) return;
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0, run = false;
    const loop = () => {
      rx += (x - rx) * 0.2; ry += (y - ry) * 0.2;
      ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      if (Math.abs(x - rx) > 0.3 || Math.abs(y - ry) > 0.3) raf = requestAnimationFrame(loop);
      else run = false;
    };
    const move = (e) => {
      x = e.clientX; y = e.clientY;
      dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      dot.current.style.opacity = 1; ring.current.style.opacity = 1;
      if (!run) { run = true; raf = requestAnimationFrame(loop); }
    };
    const over = (e) => {
      const hot = e.target.closest && e.target.closest('a,button,[data-cursor]');
      inner.current.style.transform = hot ? 'scale(1.9)' : 'scale(1)';
      inner.current.style.background = hot ? 'rgba(255,221,0,.12)' : 'transparent';
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
          className="-ml-4 -mt-4 h-8 w-8 rounded-full border border-[#FFDD00]/70"
          style={{ transition: 'transform 250ms cubic-bezier(.16,1,.3,1), background 250ms' }}
        />
      </div>
      <div ref={dot} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[9999] opacity-0">
        <div className="-ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-[#FFDD00]" />
      </div>
    </>
  );
};

/* ============================================================
   5. Spotlight / HoverCard — cahaya mengikuti kursor di dalam kartu
      (tanpa memiringkan kartu; hanya terangkat sedikit)
   ============================================================ */
export const Spotlight = ({ children, className = '', color = 'rgba(255,221,0,.14)', size = 420, inner = '' }) => {
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
    className={`transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_50px_-18px_rgba(0,101,105,.6)] ${className}`}
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
   7. HeroStage — hero dengan foto kampus + parallax kursor halus
      Menyetel CSS variable --mx / --my (−1..1) dengan easing.
   ============================================================ */
export const HeroStage = ({
  children,
  className = '',
  photo = '/foto-kampus-unj.jpg',   // taruh file di folder public/
  blur = 3,                        // px — "sedikit blur"
  dim = 0.55,                      // 0–1 — makin besar makin gelap/samar
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
  const overlay = `linear-gradient(to bottom, rgba(2,6,23,${Math.min(d + 0.1, 1)}), rgba(0,56,59,${d}), rgba(2,6,23,${Math.min(d + 0.2, 1)}))`;

  return (
    <section
      ref={ref}
      className={`relative w-full overflow-hidden bg-slate-950 flex flex-col items-center justify-center ${className}`}
    >
      {/* Foto kampus: sedikit blur + bergeser berlawanan arah kursor */}
      <ParallaxLayer depth={-10} className="absolute -inset-8 z-0">
        <img
          src={photo}
          alt=""
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          className="h-full w-full object-cover mu-kenburns"
          style={{ filter: `blur(${blur}px) saturate(1.08)` }}
        />
      </ParallaxLayer>

      {/* Overlay agar teks tetap terbaca (atur lewat prop dim) */}
      <div className="absolute inset-0 z-0" style={{ background: overlay }} />
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(2,6,23,.55) 100%)' }}
      />

      {/* Aksen warna lembut */}
      <div className="pointer-events-none absolute -left-10 top-0 z-0 h-96 w-96 rounded-full bg-[#006569] opacity-30 blur-[110px] mu-blob" />
      <div className="pointer-events-none absolute -right-10 top-10 z-0 h-96 w-96 rounded-full bg-[#FFDD00] opacity-15 blur-[120px] mu-blob mu-delay-1" />

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
  size = 'w-44 h-44 md:w-56 md:h-56', onError
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
   11. NavBar — pill indikator mengikuti kursor + panel preview (gaya Notion)
   ============================================================ */
export const NavBar = ({ activeTab, onNavigate, isMobileMenuOpen, setIsMobileMenuOpen, navItems, MenuIcon, CloseIcon, rightSlot, logoSrc = '/logo-menwa-unj.png', onLogoError }) => {
  const listRef = useRef(null);
  const [pill, setPill] = useState({ left: 0, width: 0, opacity: 0 });
  const [hovered, setHovered] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const movePill = (el) => {
    if (!el || !listRef.current) return;
    const p = listRef.current.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setPill({ left: r.left - p.left, width: r.width, opacity: 1 });
  };
  const resetPill = () => {
    const el = listRef.current?.querySelector(`[data-tab="${activeTab}"]`);
    if (el) movePill(el); else setPill((s) => ({ ...s, opacity: 0 }));
  };
  useEffect(() => { resetPill(); }, [activeTab]);

  return (
    <nav
      onMouseLeave={() => { setHovered(null); resetPill(); }}
      className={`sticky top-0 z-50 font-sans transition-all duration-500 border-b ${
        scrolled
          ? 'bg-slate-950/80 backdrop-blur-2xl border-[#006569]/60 shadow-[0_8px_40px_-12px_rgba(0,101,105,.6)]'
          : 'bg-slate-950/50 backdrop-blur-xl border-white/5'
      }`}
    >
      <div className="h-[3px] w-full bg-gradient-to-r from-[#006569] via-[#FFDD00] to-[#006569] opacity-80" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-all duration-500 ${scrolled ? 'h-16' : 'h-20'}`}>
          <MagneticButton
            onClick={() => onNavigate('beranda')}
            strength={0.15}
            className="flex items-center cursor-pointer group bg-transparent"
          >
            <img
              src={logoSrc} onError={onLogoError} alt="Logo Menwa UNJ"
              className="w-11 h-11 object-contain mr-3 drop-shadow-md transition-transform duration-500 group-hover:scale-110"
            />
            <div className="text-left">
              <h1 className="text-sm md:text-base font-black text-white leading-tight tracking-tight">RESIMEN MAHASISWA</h1>
              <p className="text-[10px] font-black text-[#FFDD00] tracking-[0.25em] uppercase">Satuan UNJ</p>
            </div>
          </MagneticButton>

          <div ref={listRef} className="hidden lg:flex relative items-center gap-1">
            <div
              className="absolute top-1/2 -translate-y-1/2 h-10 rounded-full bg-white/10 border border-[#FFDD00]/30 backdrop-blur-sm"
              style={{
                left: pill.left, width: pill.width, opacity: pill.opacity,
                transition: 'left 380ms cubic-bezier(.16,1,.3,1), width 380ms cubic-bezier(.16,1,.3,1), opacity 250ms'
              }}
            />
            {navItems.map((item) => (
              <button
                key={item.id}
                data-tab={item.id}
                onMouseEnter={(e) => { setHovered(item.id); movePill(e.currentTarget); }}
                onFocus={(e) => movePill(e.currentTarget)}
                onClick={() => onNavigate(item.id)}
                className={`relative z-10 px-4 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-colors duration-300 ${
                  activeTab === item.id ? 'text-[#FFDD00]' : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {rightSlot}
            <div className="lg:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-200 hover:text-[#FFDD00]">
                {isMobileMenuOpen ? CloseIcon : MenuIcon}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`hidden lg:block absolute left-0 right-0 top-full origin-top transition-all duration-300 ${
          hovered ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-3 pointer-events-none'
        }`}
      >
        <div className="max-w-3xl mx-auto px-4">
          <div className="mt-3 rounded-3xl border border-[#FFDD00]/25 bg-slate-950/95 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,.9)] p-5">
            {navItems.filter((i) => i.id === hovered).map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="w-full text-left flex items-start gap-4 p-3 rounded-2xl hover:bg-white/5 transition"
              >
                <span className="shrink-0 w-11 h-11 rounded-xl bg-[#006569] text-[#FFDD00] grid place-items-center shadow-lg">
                  {item.icon}
                </span>
                <span>
                  <span className="block text-sm font-black text-white uppercase tracking-wide">{item.label}</span>
                  <span className="block text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`lg:hidden overflow-hidden bg-slate-950 border-t border-slate-800 absolute w-full transition-[max-height] duration-500 ${isMobileMenuOpen ? 'max-h-[60vh]' : 'max-h-0'}`}>
        <div className="px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setIsMobileMenuOpen(false); }}
              className={`block w-full text-left px-5 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
                activeTab === item.id ? 'bg-[#006569] text-[#FFDD00]' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              {item.label}
              <span className="block text-[11px] font-medium normal-case tracking-normal text-slate-500 mt-0.5">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

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
      className={`transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
        state === 'in' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
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
