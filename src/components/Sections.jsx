// Sections.jsx — section beranda, footer, dan halaman subtab program.
// Semua konten dibaca dari ../data/siteData.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy, Flag, HeartHandshake, Mic, ShieldCheck, GraduationCap,
  ArrowRight, ArrowLeft, Clock, MapPin, Mail, Phone, Zap, Lock,
  CalendarDays, Check, Download, ExternalLink, FileText,
} from 'lucide-react';
import { Reveal, Stagger, HoverCard, HeroStage, ParallaxLayer, MagneticButton } from './MenwaUI';
import { FireMotion, CardStackMotion, TrophyMotion, LaptopMotion } from './MotionAssets';
import { Link, navigate } from '../lib/router.jsx';
import { SITE, PROGRAMS, KEGIATAN, FEED_URL, STEP_DESC, IMG, HERO_PHOTO, HEADER_DIR } from '../data/siteData';

/* ---------- util ---------- */
export const ICONS = {
  trophy: Trophy, flag: Flag, heart: HeartHandshake, mic: Mic, shield: ShieldCheck, graduation: GraduationCap,
};

const imgSrc = (v) => (/^(https?:)?\/\//.test(v) || v.startsWith('/') ? v : IMG(v));

/** Daftar kegiatan: dari FEED_URL (JSON) kalau diisi, kalau tidak dari siteData.js */
export function useKegiatan() {
  const [items, setItems] = useState(KEGIATAN);
  useEffect(() => {
    if (!FEED_URL) return;
    let off = false;
    fetch(FEED_URL, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { if (!off && Array.isArray(d) && d.length) setItems(d); })
      .catch(() => {});
    return () => { off = true; };
  }, []);
  return items;
}

/** <img> ringan + fallback gradien berlogo (tanpa memanggil situs luar) bila file belum ada */
const SmartImg = ({ src, alt, className = '', fallback }) => {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [src]);
  if (bad) {
    return (
      <div className={`grid place-items-center overflow-hidden bg-gradient-to-br from-[#00383b] via-[#006569] to-slate-900 ${className}`}>
        <div className="flex flex-col items-center gap-3 px-4 text-center">
          <img
            src="/logo-menwa-unj.png" alt="" aria-hidden draggable={false}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            className="h-16 w-auto opacity-30"
          />
          {fallback && <span className="text-sm font-black uppercase tracking-wider text-[#FFDD00]">{fallback}</span>}
        </div>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" decoding="async" draggable={false} onError={() => setBad(true)} className={className} />;
};

/** Gambar header .svg: public/header/header-<nama>.svg  (nama = slug program, atau gariskomando / pendidikan / mako / administrasi).
 *  Bila filenya belum ada, tidak tampil apa pun. Letakkan di dalam elemen header yang `relative`. */
export const HeaderArt = ({ name, fit = 'cover', position = 'center' }) => {
  const [bad, setBad] = useState(false);
  if (bad) return null;
  return (
    <img
      src={`${HEADER_DIR}header-${name}.svg`} alt="" aria-hidden draggable={false}
      onError={() => setBad(true)}
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full select-none"
      style={{ objectFit: fit, objectPosition: position }}
    />
  );
};

/** Logo dengan beberapa kemungkinan lokasi file: dicoba berurutan sampai ada yang berhasil dimuat */
const LogoImg = ({ srcs, alt, className }) => {
  const list = [].concat(srcs).filter(Boolean);
  const [i, setI] = useState(0);
  if (i >= list.length) return null;
  return <img src={list[i]} alt={alt} draggable={false} onError={() => setI((x) => x + 1)} className={className} />;
};

const itemTarget = (item, preferExternal) =>
  (preferExternal && item.url) || (item.program ? `/${item.program}` : item.url);

const ItemLink = ({ item, preferExternal, className, children, ...rest }) => {
  const to = itemTarget(item, preferExternal);
  if (!to) return <div className={className}>{children}</div>;
  return <Link to={to} className={className} {...rest}>{children}</Link>;
};

const Heading = ({ eyebrow, title, desc, dark, action }) => (
  <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
    <div>
      <span className={`text-xs font-black uppercase tracking-[0.25em] ${dark ? 'text-[#FFDD00]' : 'text-[#006569]'}`}>{eyebrow}</span>
      <h2 className={`mt-2 text-3xl font-black tracking-tight md:text-4xl ${dark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
      {desc && <p className={`mt-3 max-w-2xl ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>}
    </div>
    {action}
  </div>
);

/* ---------- ikon sosial (inline, tidak bergantung versi lucide) ---------- */
const Svg = ({ size = 20, children }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {children}
  </svg>
);
const SOCIAL_ICON = {
  instagram: (s) => (<Svg size={s}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></Svg>),
  youtube: (s) => (<Svg size={s}><rect x="2" y="5" width="20" height="14" rx="4" /><path d="M10 9l5 3-5 3z" fill="currentColor" /></Svg>),
  facebook: (s) => (<Svg size={s}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></Svg>),
  tiktok: (s) => (<Svg size={s}><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 3c.4 2.4 2 4 4.5 4.2" /></Svg>),
};

/* ============================================================
   1. PROGRAM UNGGULAN  (format kartu putih + ikon + SELENGKAPNYA)
   ============================================================ */
export const ProgramUnggulan = () => (
  <section id="program-unggulan" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
    <Reveal>
      <Heading
        eyebrow="Program Unggulan"
        title="Program Unggulan Menwa UNJ"
        desc="Pilih program untuk melihat penjelasan, alur kegiatan, dan cara bergabung."
      />
    </Reveal>
    <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" itemClassName="h-full" step={80}>
      {PROGRAMS.map((p) => {
        const Icon = ICONS[p.icon] || Trophy;
        return (
          <Link key={p.slug} to={`/${p.slug}`} className="block h-full">
            <HoverCard className="luxury-card h-full rounded-[2rem] border border-slate-100 bg-white shadow-sm" inner="flex h-full flex-col p-8">
              {p.tag && (
                <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  {['kc', 'youth-spark'].includes(p.slug) && (
                    <FireMotion />
                  )}
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  {p.tag}
                </span>
              )}
              <span className="luxury-card-icon grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#006569] to-[#00383b] text-[#FFDD00] shadow-lg transition-transform duration-500 group-hover/spot:-rotate-6 group-hover/spot:scale-110">
                <Icon size={28} />
              </span>
              <h3 className="mt-8 text-2xl font-black leading-tight text-slate-900">{p.title}</h3>
              {p.fullName && <p className="mt-1 text-sm font-bold text-[#006569]">{p.fullName}</p>}
              <p className="mt-3 leading-relaxed text-slate-500">{p.short}</p>
              <div className="mt-auto flex items-center justify-between pt-8">
                <span className="card-kicker text-xs font-black uppercase tracking-[0.2em] text-[#006569]">Selengkapnya</span>
                <span className="luxury-card-arrow grid h-11 w-11 place-items-center rounded-full bg-[#006569]/10 text-[#006569] transition-all duration-300 group-hover/spot:translate-x-1 group-hover/spot:bg-[#006569] group-hover/spot:text-[#FFDD00]">
                  <ArrowRight size={18} />
                </span>
              </div>
            </HoverCard>
          </Link>
        );
      })}
    </Stagger>
  </section>
);

/* ============================================================
   2. KARTU KEGIATAN  (dipakai di halaman subtab program)
   ============================================================ */
export const KegiatanCard = ({ item, preferExternal = false }) => (
  <ItemLink item={item} preferExternal={preferExternal} className="block h-full">
    <HoverCard className="luxury-card h-full rounded-[1.75rem] border border-slate-100 bg-white shadow-sm" inner="flex h-full flex-col">
      <div className="h-52 overflow-hidden bg-slate-200">
        <SmartImg
          src={imgSrc(item.image)} alt={item.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover/spot:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="text-[11px] font-black uppercase tracking-widest text-[#006569]">{item.category}</span>
        <h3 className="mt-3 line-clamp-4 text-xl font-black leading-snug text-slate-900">{item.title}</h3>
        {item.excerpt && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">{item.excerpt}</p>}
        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">{item.date && (<><Clock size={13} />{item.date}</>)}</span>
            <span className="flex items-center gap-1 transition-colors group-hover/spot:text-[#006569] luxury-card-arrow">
              {item.program ? 'Selengkapnya' : 'Lihat postingan'} <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </HoverCard>
  </ItemLink>
);

/* ============================================================
   3. SOROTAN GIAT — coverflow sinematik
      • Latar buram mengikuti poster aktif, kartu aktif bercahaya + kilau, kartu samping gelap & miring.
      • Panel info besar di bawah kartu (judul, tanggal, lokasi, tombol) berganti dengan animasi.
      • Drag / swipe menggeser langsung (kartu mengikuti kursor). Klik kartu samping memajukannya,
        klik kartu utama atau tombol membuka detail.
      • Berganti otomatis tiap 5 detik (garis progres emas); berhenti saat kursor di atasnya atau di-drag.
   ============================================================ */
const useMedia = (query) => {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return m;
};

const mod = (a, n) => ((a % n) + n) % n;

export const DokumentasiKegiatan = () => {
  const docs = [
    { title: 'Ksatria Cendekia VII', year: 'KC VII', image: '/dokumentasi/kcvii.svg', path: '/kc' },
    { title: 'Gerakan Paskibra Semangat VI', year: 'GERANAT VI', image: '/dokumentasi/geranatvi.svg', path: '/geranat' },
    { title: 'Pengabdian Masyarakat 2026', year: 'PENGABDIAN 2026', image: '/dokumentasi/pengabdian26.svg', path: '/pengabdian' },
    { title: 'Pengabdian Masyarakat 2025', year: 'PENGABDIAN 2025', image: '/dokumentasi/pengabdian25.svg', path: '/pengabdian' },
    { title: 'Rapat Komando Satuan 2025', year: 'RAKOMSAT 2025', image: '/dokumentasi/rakomsat25.svg', path: '/garis-komando' },
  ];
  return (
    <section id="dokumentasi-kegiatan" className="relative overflow-hidden bg-slate-50 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_220px]">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#006569]">Dokumentasi</span>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-5xl">Dokumentasi Kegiatan</h2>
              <p className="mt-4 max-w-2xl text-slate-500">Jejak kegiatan Menwa UNJ dari kompetisi, pengabdian, sampai agenda komando.</p>
            </div>
            <div className="mx-auto h-40 w-44 lg:mx-0"><CardStackMotion /></div>
          </div>
        </Reveal>
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5" itemClassName="h-full" step={70}>
          {docs.map((d) => (
            <Link key={d.image} to={d.path} className="block h-full">
              <HoverCard className="doc-motion-card h-full overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm" inner="flex h-full flex-col">
                <div className="aspect-[4/5] overflow-hidden bg-slate-900">
                  <img src={d.image} alt={d.title} className="h-full w-full object-cover transition duration-700 group-hover/spot:scale-105" loading="lazy" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="card-kicker text-[10px] font-black uppercase tracking-[0.2em] text-[#006569]">{d.year}</span>
                  <h3 className="mt-2 text-lg font-black leading-tight text-slate-900">{d.title}</h3>
                  <span className="mt-auto pt-5 text-xs font-black uppercase tracking-wider text-[#006569]">Lihat kegiatan <ArrowRight size={13} className="luxury-card-arrow ml-1 inline" /></span>
                </div>
              </HoverCard>
            </Link>
          ))}
        </Stagger>
      </div>
    </section>
  );
};

export const HighlightCoverflow = () => {
  const all = useKegiatan();
  const picked = all.filter((k) => k.highlight);
  const list = picked.length >= 3 ? picked : all;
  const n = list.length;
  const small = useMedia('(max-width: 767px)');
  const reduce = useMedia('(prefers-reduced-motion: reduce)');

  const [active, setActive] = useState(0);
  const [drag, setDrag] = useState(0);          // geseran saat di-drag, dalam satuan "kartu"
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);
  const stageRef = useRef(null);
  const down = useRef(null);
  const justDragged = useRef(false);

  const W = small ? 220 : 330;
  const H = small ? 310 : 460;
  const STEP = W * 0.7;                         // jarak piksel = 1 kartu
  const reach = small ? 1 : 2;
  const pos = active - drag;                    // posisi (pecahan) kartu yang sedang di tengah
  const autoplay = !reduce && n > 1;

  useEffect(() => { if (n && active >= n) setActive(0); }, [n, active]);

  const go = (dir) => setActive((a) => mod(a + dir, n));
  const offset = (i) => {
    const d = i - pos;
    return d - n * Math.round(d / n);           // jarak melingkar terpendek
  };
  const centerIdx = mod(Math.round(pos), n);
  const cur = list[centerIdx];

  const openItem = (it) => {
    const to = itemTarget(it, false);
    if (!to) return;
    if (/^https?:\/\//.test(to)) window.open(to, '_blank', 'noopener,noreferrer');
    else navigate(to);
  };

  // ----- drag -----
  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    down.current = { x: e.clientX, id: e.pointerId, moved: false, lastX: e.clientX, lastT: performance.now(), v: 0 };
  };
  const onPointerMove = (e) => {
    const d = down.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!d.moved) {
      if (Math.abs(dx) < 6) return;
      d.moved = true;
      try { stageRef.current.setPointerCapture(e.pointerId); } catch { /* tidak didukung */ }
      setDragging(true);
    }
    const now = performance.now();
    d.v = (e.clientX - d.lastX) / Math.max(now - d.lastT, 1);   // px per ms
    d.lastX = e.clientX; d.lastT = now;
    setDrag(dx / STEP);
  };
  const endDrag = (e) => {
    const d = down.current;
    if (!d || d.id !== e.pointerId) return;
    down.current = null;
    if (!d.moved) return;
    justDragged.current = true;
    setTimeout(() => { justDragged.current = false; }, 0);
    let target = Math.round(active - drag);
    if (target === active && Math.abs(d.v) > 0.5) target = active - Math.sign(d.v);   // swipe cepat = minimal 1 kartu
    try { stageRef.current.releasePointerCapture(e.pointerId); } catch { /* abaikan */ }
    setDragging(false);
    setDrag(0);
    setActive(mod(target, n));
  };

  const cardStyle = (d) => {
    const a = Math.abs(d);
    const sg = Math.sign(d);
    const x = sg * (a <= 1 ? STEP * a : STEP + (a - 1) * W * 0.4);
    const rot = -sg * Math.min(a, 1) * 42;
    const fade = Math.min(1, Math.max(0, (reach + 0.6 - a) / 0.6));
    const op = Math.max(0, 1 - Math.max(0, a - 1) * 0.35) * fade;
    return {
      width: W, height: H, marginLeft: -W / 2,
      transform: `translateX(${x}px) translateZ(${-a * 140}px) rotateY(${rot}deg) scale(${1 - Math.min(a, 1) * 0.08})`,
      opacity: op,
      zIndex: Math.round(100 - a * 10),
      pointerEvents: a > reach + 0.3 ? 'none' : 'auto',
      transition: dragging ? 'none' : 'transform 650ms cubic-bezier(.22,1,.36,1), opacity 450ms ease',
    };
  };

  const meta = (it) => (
    <>
      {it.date && (
        <span className="inline-flex items-center gap-2"><CalendarDays size={16} className="text-[#FFDD00]" /> {it.date}</span>
      )}
      {it.location && (
        <span className="inline-flex items-center gap-2"><MapPin size={16} className="text-[#FFDD00]" /> {it.location}</span>
      )}
    </>
  );

  return (
    <section id="sorotan-giat" data-ui="coverflow-v6" className="relative overflow-hidden bg-white py-20 md:py-24">
      <style>{`
        @keyframes mu-sheen { from { transform: translateX(-80%) skewX(-14deg); } to { transform: translateX(420%) skewX(-14deg); } }
        @keyframes mu-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @keyframes mu-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @media (prefers-reduced-motion: reduce) { .mu-cf-anim { animation: none !important; } }
      `}</style>

      {/* latar: poster aktif yang diburamkan + cahaya */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {list.map((it, i) => {
          const d = Math.abs(offset(i));
          if (d > 1.5) return null;
          return (
            <div key={it.id} className="absolute inset-0 will-change-[opacity]" style={{ opacity: d < 0.5 ? 0.5 : 0, transition: 'opacity 900ms ease' }}>
              <img
                src={imgSrc(it.image)} alt="" draggable={false}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className="h-full w-full scale-125 object-cover blur-3xl"
              />
            </div>
          );
        })}
        <div className="absolute inset-0 bg-white/70" />
        <div className="absolute left-1/2 top-[44%] h-[420px] w-[720px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#006569]/10 blur-[120px]" />
      </div>

      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-[#FFDD00]">Jejak Kegiatan</span>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
                Sorotan <span className="text-[#FFDD00]">Giat</span>
              </h2>
              <p className="mt-4 text-slate-500">Seret kartu untuk menjelajah. Klik kartu utama untuk membuka detail kegiatan.</p>
            </div>
          </Reveal>
        </div>

        <div
          ref={stageRef}
          className="relative mx-auto max-w-6xl outline-none"
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Sorotan giat Menwa UNJ"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onKeyDown={(e) => { if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDragStart={(e) => e.preventDefault()}
          onClickCapture={(e) => { if (justDragged.current) { e.preventDefault(); e.stopPropagation(); } }}
          style={{ perspective: '1500px', height: H + 30, touchAction: 'pan-y', userSelect: 'none', WebkitUserSelect: 'none', cursor: dragging ? 'grabbing' : 'grab' }}
        >
          {/* pointer-events:none -> kontainer 3D (bidang z=0) tidak menutupi kartu samping yang berada di belakangnya */}
          <div className="relative h-full w-full" style={{ transformStyle: 'preserve-3d', pointerEvents: 'none' }}>
            {list.map((it, i) => {
              const d = offset(i);
              const isCenter = Math.abs(d) < 0.5;
              return (
                <div key={it.id} className="absolute left-1/2 top-0 will-change-transform" style={cardStyle(d)}>
                  <div
                    role={isCenter ? 'link' : 'button'}
                    tabIndex={Math.abs(d) <= reach ? 0 : -1}
                    aria-label={isCenter ? `Buka: ${it.title}` : `Tampilkan: ${it.title}`}
                    onClick={() => (isCenter ? openItem(it) : setActive(i))}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (isCenter) openItem(it); else setActive(i); } }}
                    className="relative h-full w-full overflow-hidden rounded-[1.6rem] border bg-slate-900"
                    style={{
                      borderColor: isCenter ? 'rgba(255,221,0,.75)' : 'rgba(255,255,255,.12)',
                      boxShadow: isCenter
                        ? '0 40px 90px -25px rgba(255,221,0,.4), 0 30px 60px -20px rgba(0,0,0,.9)'
                        : '0 30px 60px -25px rgba(0,0,0,.9)',
                      transition: 'box-shadow 500ms ease, border-color 500ms ease',
                    }}
                  >
                    <SmartImg src={imgSrc(it.image)} alt={it.title} fallback={it.title} className="h-full w-full object-cover" />
                    <div className="pointer-events-none absolute inset-0 bg-slate-950" style={{ opacity: Math.min(Math.abs(d), 1) * 0.6 }} />
                    <span className="absolute left-3 top-3 rounded-full bg-slate-950/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#FFDD00] backdrop-blur">
                      {it.category}
                    </span>
                    {isCenter && !dragging && (
                      <span
                        key={`sheen-${it.id}`}
                        className="mu-cf-anim pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                        style={{ animation: 'mu-sheen 1.3s ease-out .15s 1 both' }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* bayangan lantai kartu aktif */}
          <div className="pointer-events-none absolute bottom-2 left-1/2 h-8 w-[min(70%,520px)] -translate-x-1/2 rounded-full bg-[#FFDD00]/20 blur-2xl" aria-hidden />

          <button
            type="button" onClick={() => go(-1)} aria-label="Sebelumnya"
            className="absolute left-2 top-1/2 z-[120] hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur transition hover:bg-[#FFDD00] hover:text-slate-950 md:grid"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            type="button" onClick={() => go(1)} aria-label="Berikutnya"
            className="absolute right-2 top-1/2 z-[120] hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur transition hover:bg-[#FFDD00] hover:text-slate-950 md:grid"
          >
            <ArrowRight size={20} />
          </button>
        </div>

        {/* panel info kegiatan aktif */}
        <div className="mx-auto mt-8 max-w-3xl px-4 text-center" aria-live="polite">
          {cur && (
            <div key={cur.id} className="mu-cf-anim" style={{ animation: 'mu-rise 600ms cubic-bezier(.22,1,.36,1) both' }}>
              <span className="inline-flex rounded-full bg-[#FFDD00] px-3.5 py-1.5 text-[11px] font-black uppercase tracking-widest text-slate-950">{cur.category}</span>
              <h3 className="mt-4 text-2xl font-black leading-tight text-slate-900 md:text-4xl">{cur.title}</h3>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-slate-600">{meta(cur)}</div>
              {cur.excerpt && <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-500">{cur.excerpt}</p>}
              {itemTarget(cur, false) && (
                <button
                  type="button" onClick={() => openItem(cur)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#FFDD00] px-7 py-3.5 text-xs font-black uppercase tracking-widest text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-yellow-300"
                >
                  {cur.program ? 'Selengkapnya' : 'Lihat postingan'} <ArrowRight size={15} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* penghitung + garis progres (juga pemicu pergantian otomatis) */}
        <div className="mt-8 flex items-center justify-center gap-5">
          <span className="font-mono text-sm font-black tabular-nums text-slate-900">
            {String(centerIdx + 1).padStart(2, '0')} <span className="text-slate-400">/ {String(n).padStart(2, '0')}</span>
          </span>
          <span className="relative h-[3px] w-40 overflow-hidden rounded-full bg-slate-200 md:w-64" aria-hidden>
            <span
              key={active}
              onAnimationEnd={() => setActive((a) => mod(a + 1, n))}
              className="absolute inset-y-0 left-0 w-full origin-left bg-[#FFDD00]"
              style={{
                transform: 'scaleX(0)',
                animation: autoplay ? 'mu-progress 5s linear forwards' : 'none',
                animationPlayState: hover || dragging ? 'paused' : 'running',
              }}
            />
          </span>
        </div>
        <div className="mt-5 flex justify-center gap-2" role="tablist" aria-label="Pilih kegiatan">
          {list.map((it, i) => (
            <button
              key={it.id} type="button" role="tab" aria-selected={i === centerIdx} aria-label={`Kegiatan ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === centerIdx ? 'w-7 bg-[#FFDD00]' : 'w-1.5 bg-slate-300 hover:bg-slate-400'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

/** Paket untuk beranda: ganti blok highlight KC + slider + 6 kartu dengan satu baris ini */
export const HomeSections = () => (
  <>
    <ProgramUnggulan />
    <HighlightCoverflow />
    <DokumentasiKegiatan />
  </>
);

/* ============================================================
   4. FOOTER  (pill "Didukung oleh" + 4 kolom)
   ============================================================ */
const PartnerLogo = ({ p }) => {
  const [bad, setBad] = useState(false);
  if (bad) return <span className="text-sm font-black uppercase tracking-wider text-slate-500">{p.name}</span>;
  return (
    <img
      src={p.logo} alt={p.name} title={p.name} loading="lazy" onError={() => setBad(true)}
      className="h-12 w-auto object-contain transition duration-300 hover:scale-110 md:h-14"
    />
  );
};

const FooterLink = ({ to, children }) => (
  <li><Link to={to} className="text-slate-400 transition-colors hover:text-white">{children}</Link></li>
);

export const SiteFooter = ({ onOpenLogin }) => (
  <footer id="footer-kontak" className="relative mt-auto overflow-hidden border-t-4 border-[#006569] bg-slate-950 pb-10 pt-16 font-sans text-slate-300">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Reveal>
        <div className="mx-auto mb-16 flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-5 rounded-[3rem] bg-white px-8 py-6 shadow-[0_24px_60px_-28px_rgba(0,0,0,.9)]">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Didukung oleh:</span>
          {SITE.partners.map((p) => <PartnerLogo key={p.name} p={p} />)}
        </div>
      </Reveal>

      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1.4fr_1fr]">
        <div>
          <h3 className="text-xl font-black uppercase leading-tight text-white">{SITE.name}</h3>
          <p className="mt-1 text-xs font-black uppercase tracking-widest text-[#FFDD00]">{SITE.unit}</p>
          <img
            src="/logo-menwa-unj.png" alt="Logo Menwa UNJ" loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            className="mt-6 h-20 w-20 object-contain drop-shadow-lg"
          />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Copyright © 2026 | Menwa UNJ</p>
        </div>

        <div>
          <h4 className="text-lg font-black text-white">Tentang Kami</h4>
          <ul className="mt-6 space-y-4 text-sm">
            <FooterLink to="/garis-komando">Garis Komando</FooterLink>
            <FooterLink to="/pendidikan">Pendidikan dan Pelatihan</FooterLink>
            <FooterLink to="/mako">Markas Komando</FooterLink>
            <FooterLink to="/administrasi">Administrasi Umum</FooterLink>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-black text-white">Kontak</h4>
          <ul className="mt-6 space-y-4 text-sm text-slate-400">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-slate-500" />
              <a href={SITE.maps} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">{SITE.address}</a>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="shrink-0 text-slate-500" />
              <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">{SITE.phone} ({SITE.phoneLabel})</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="shrink-0 text-slate-500" />
              <a href={`mailto:${SITE.email}`} className="transition-colors hover:text-white">{SITE.email}</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-black text-white">Sosial Media</h4>
          <ul className="mt-6 space-y-4 text-sm text-slate-400">
            {SITE.social.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 transition-colors hover:text-white">
                  <span className="text-slate-500">{(SOCIAL_ICON[s.type] || SOCIAL_ICON.instagram)(18)}</span>{s.label}
                </a>
              </li>
            ))}
            <li>
              <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 transition-colors hover:text-white">
                <Phone size={18} className="text-slate-500" /> WhatsApp Piket Mako
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs font-semibold text-slate-500 md:flex-row">
        <p>{SITE.copyright} <span className="text-slate-400">“{SITE.motto}”</span></p>
        {onOpenLogin && (
          <button onClick={onOpenLogin} className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-slate-300 transition-colors hover:text-[#FFDD00]">
            <Lock size={14} /> Akses Anggota Mako
          </button>
        )}
      </div>
    </div>
  </footer>
);

/* ============================================================
   5. HEADER SUBTAB  (foto hero + pill + judul besar + 2 tombol)
   ============================================================ */
export const SubHero = ({ program }) => (
  <HeroStage
    className="min-h-[540px] py-24 md:py-32" photo={HERO_PHOTO} blur={2.5} dim={0.62}
  >
    <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
        <ParallaxLayer depth={5} className="max-w-4xl">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/90 backdrop-blur">
                <Zap size={14} className="text-[#FFDD00]" /> {program.badge}
              </span>
              {program.status && (
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.15em] text-emerald-200 backdrop-blur">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  {program.status}
                </span>
              )}
            </div>
            <h1 className="mt-6 text-5xl font-black uppercase leading-[1.02] tracking-tight text-white drop-shadow-lg md:text-7xl">
              {program.heroLead} <span className="text-[#FFDD00]">{program.heroAccent}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-100/90">{program.heroSub}</p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <MagneticButton as="div" className="inline-block">
                <Link
                  to={program.cta.url}
                  className="inline-flex items-center gap-3 bg-[#FFDD00] py-4 pl-7 pr-10 text-xs font-black uppercase tracking-wider text-[#00383b] shadow-xl transition hover:bg-yellow-300 md:text-sm"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 94% 100%, 0 100%)' }}
                >
                  {program.cta.label} <ArrowRight size={18} />
                </Link>
              </MagneticButton>
              <a
                href="#alur"
                onClick={(e) => { e.preventDefault(); document.getElementById('alur')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="inline-flex items-center rounded-xl border border-white/40 px-5 py-4 text-xs font-black uppercase tracking-wider text-white backdrop-blur transition hover:border-[#FFDD00] hover:text-[#FFDD00] md:text-sm"
              >
                Lihat Alur Kegiatan
              </a>
              {program.docs?.length > 0 && (
                <a
                  href="#dokumen"
                  onClick={(e) => { e.preventDefault(); document.getElementById('dokumen')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 py-4 text-xs font-black uppercase tracking-wider text-white backdrop-blur transition hover:border-[#FFDD00] hover:text-[#FFDD00] md:text-sm"
                >
                  <FileText size={16} /> {program.docsButton || 'Lihat Dokumen'}
                </a>
              )}
            </div>
          </Reveal>
        </ParallaxLayer>

        {program.logo && (
          <ParallaxLayer depth={16} className="mx-auto shrink-0 lg:mx-0">
            <div className="relative w-56 sm:w-64 lg:w-72">
              <div className="absolute inset-4 rounded-full bg-[#FFDD00]/20 blur-3xl" />
              <LogoImg
                srcs={program.logo} alt={`Logo ${program.title}`}
                className="mu-float relative h-auto w-full object-contain drop-shadow-[0_18px_40px_rgba(255,221,0,.35)]"
              />
            </div>
          </ParallaxLayer>
        )}
      </div>
    </div>
  </HeroStage>
);

/* ============================================================
   6. TIMELINE — horizontal di desktop, vertikal di HP; garis terisi saat terlihat
   ============================================================ */
const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, on];
};

export const Timeline = ({ steps, info = {} }) => {
  const [ref, on] = useInView();
  const items = steps.map((x) => (typeof x === 'string' ? { label: x } : x));
  const n = items.length;
  return (
    <ol ref={ref} className="grid gap-8 lg:gap-0 lg:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]" style={{ '--n': n }}>
      {items.map((st, i) => (
        <li
          key={st.label}
          className="group relative flex gap-5 lg:flex-col lg:items-center lg:px-3 lg:text-center"
          style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(16px)', transition: 'opacity 600ms ease, transform 600ms ease', transitionDelay: `${i * 120}ms` }}
        >
          {i < n - 1 && (
            <>
              <span className="absolute -bottom-8 left-6 top-12 w-0.5 -translate-x-1/2 bg-slate-200 lg:hidden" />
              <span className="absolute left-1/2 top-6 hidden h-0.5 w-full -translate-y-1/2 bg-slate-200 lg:block">
                <span
                  className="block h-full origin-left bg-gradient-to-r from-[#006569] to-[#FFDD00]"
                  style={{ transform: on ? 'scaleX(1)' : 'scaleX(0)', transition: 'transform 700ms ease', transitionDelay: `${i * 120 + 250}ms` }}
                />
              </span>
            </>
          )}
          <span className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-[#006569] bg-white font-black text-[#006569] shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-[#006569] group-hover:text-[#FFDD00]">
            {i + 1}
          </span>
          <div className="lg:mt-5">
            <h4 className="font-black leading-snug text-slate-900">{st.label}</h4>
            {st.date && (
              <span className="mt-2 inline-block rounded-full bg-[#006569]/10 px-3 py-1 text-[11px] font-black tracking-wide text-[#006569]">{st.date}</span>
            )}
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{st.desc || info[st.label] || STEP_DESC[st.label]}</p>
          </div>
        </li>
      ))}
    </ol>
  );
};

/* ============================================================
   7. HALAMAN SUBTAB PROGRAM  (/kc/, /geranat/, /pengabdian/, ...)
   ============================================================ */
/** true bila file benar-benar ada (bukan halaman HTML hasil fallback SPA); bila tidak, tombol Unduh disembunyikan */
const useFileOk = (url) => {
  const [ok, setOk] = useState(!!url);
  useEffect(() => {
    if (!url) { setOk(false); return undefined; }
    let off = false;
    fetch(url, { method: 'HEAD' })
      .then((r) => { if (!off) setOk(r.ok && !/text\/html/i.test(r.headers.get('content-type') || '')); })
      .catch(() => { if (!off) setOk(false); });
    return () => { off = true; };
  }, [url]);
  return ok;
};

const DocRow = ({ d }) => {
  const fileOk = useFileOk(d.file);
  if (!fileOk && !d.drive) return null;
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#006569]/10 text-[#006569]"><FileText size={22} /></span>
      <div className="min-w-0 flex-1 basis-48">
        <div className="font-black text-slate-900">{d.label}</div>
        <div className="text-sm text-slate-500">{d.desc}</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {fileOk && (
          <a href={d.file} download className="inline-flex items-center gap-2 rounded-xl bg-[#006569] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#00383b]">
            <Download size={15} /> Unduh PDF
          </a>
        )}
        {d.drive && (
          <a href={d.drive} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-700 transition hover:border-[#006569] hover:text-[#006569]">
            <ExternalLink size={15} /> {fileOk ? 'Google Drive' : 'Buka di Drive'}
          </a>
        )}
      </div>
    </div>
  );
};

const DocList = ({ docs }) => (
  <div id="dokumen" className="mt-10 scroll-mt-28">
    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Dokumen Resmi</h3>
    <div className="mt-4 space-y-3">
      {docs.map((d) => <DocRow key={d.label} d={d} />)}
    </div>
  </div>
);

const KcIntro = () => {
  const [show, setShow] = useState(true);
  useEffect(() => { const t = setTimeout(() => setShow(false), 1500); return () => clearTimeout(t); }, []);
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#00383b] text-center text-white">
      <div>
        <div className="mx-auto h-56 w-56"><TrophyMotion /></div>
        <p className="mt-2 text-xs font-black uppercase tracking-[0.35em] text-[#FFDD00]">Selamat Datang</p>
        <h2 className="mt-3 text-3xl font-black md:text-5xl">Ksatria Cendekia VIII</h2>
        <p className="mt-2 text-sm text-white/70">Latihan Integrasi Pemuda Nusantara</p>
      </div>
    </div>
  );
};

const YouthSparkCards = () => {
  const items = [
    { title: 'Seminar & Webinar', desc: 'Ruang belajar dan berbagi wawasan bagi pemuda Indonesia.', icon: Mic, path: '/youth-spark/seminar-webinar' },
    { title: 'Kompetisi', desc: 'Wadah kompetitif untuk menyalurkan kreativitas, kemampuan, dan prestasi.', icon: Trophy, path: '/youth-spark/kompetisi' },
    { title: 'Pelatihan Pelatih', desc: 'Penguatan kapasitas pelatih agar mampu membina dan mengembangkan potensi pemuda.', icon: GraduationCap, path: '/youth-spark/pelatihan-pelatih' },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal><Heading eyebrow="Youth Spark National" title="Pilihan Kegiatan" desc="Pilih bentuk kegiatan yang sesuai dengan minat dan kebutuhan pengembanganmu." /></Reveal>
      <Stagger className="mt-10 grid gap-6 md:grid-cols-3" itemClassName="h-full" step={90}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path} className="block h-full">
              <HoverCard className="luxury-card h-full rounded-[2rem] border border-slate-100 bg-white shadow-sm" inner="flex h-full flex-col p-8">
                <span className="luxury-card-icon grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#006569] to-[#00383b] text-[#FFDD00] shadow-lg"><Icon size={28} /></span>
                <h3 className="mt-7 text-2xl font-black text-slate-900">{item.title}</h3>
                <p className="mt-3 flex-1 leading-relaxed text-slate-500">{item.desc}</p>
                <span className="card-kicker mt-7 text-xs font-black uppercase tracking-[0.2em] text-[#006569]">Buka kegiatan <ArrowRight size={14} className="luxury-card-arrow ml-1 inline" /></span>
              </HoverCard>
            </Link>
          );
        })}
      </Stagger>
    </section>
  );
};

const YouthSparkBrand = ({ seminar = false }) => (
  <div className="mt-8 flex flex-col items-center">
    {seminar ? (
      <>
        <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">Berkolaborasi dengan</span>
        <img src="/mitra/dispora.png" alt="Dispora DKI Jakarta" className="mt-5 h-24 w-auto object-contain drop-shadow-sm md:h-28" />
      </>
    ) : (
      <>
        <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">Kolaborasi Program</span>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-6 md:gap-9">
          <img src="/mitra/unj.png" alt="Universitas Negeri Jakarta" className="h-20 w-20 object-contain drop-shadow-sm md:h-24 md:w-24" />
          <img src="/logo-menwa-unj.png" alt="Menwa UNJ" className="h-20 w-20 object-contain drop-shadow-sm md:h-24 md:w-24" />
          <span className="text-2xl font-black text-slate-300 md:text-3xl">×</span>
          <img src="/mitra/dispora.png" alt="Dispora DKI Jakarta" className="h-20 w-auto object-contain drop-shadow-sm md:h-24" />
        </div>
      </>
    )}
  </div>
);

const YouthSparkHero = ({ subSlug }) => {
  const isSeminar = subSlug === 'seminar-webinar';
  const title = isSeminar ? 'Youth Spark National: Seminar & Webinar' : 'Youth Spark National';
  const sub = isSeminar ? 'Empowering Youth, Elevating UMKM — ruang belajar, jejaring, dan aksi bagi pemuda Indonesia.' : 'Program untuk mewadahi pengetahuan dan minat bakat para pemuda melalui berbagai kegiatan.';
  return (
    <HeroStage className="min-h-[520px] py-24 md:py-32" photo={HERO_PHOTO} blur={3} dim={0.62}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_.85fr]">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/90 backdrop-blur"><Zap size={14} className="text-[#FFDD00]" /> Youth Spark National</span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.03] tracking-tight text-white drop-shadow-lg md:text-6xl">{isSeminar ? <>Youth Spark National: <span className="text-[#FFDD00]">Seminar & Webinar</span></> : <>Youth Spark <span className="text-[#FFDD00]">National</span></>}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-100/90">{sub}</p>
            {isSeminar ? (
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="https://forms.gle/pxnBS5D8JD8j5i9AA" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#FFDD00] px-6 py-4 text-xs font-black uppercase tracking-wider text-[#00383b]">Daftar Sekarang <ArrowRight size={17} /></a>
                <a href="/dokumen/youth-spark-rundown.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 py-4 text-xs font-black uppercase tracking-wider text-white backdrop-blur hover:border-[#FFDD00] hover:text-[#FFDD00]">Lihat Rundown <FileText size={16} /></a>
                <a href="#benefit-youth-spark" className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-4 text-xs font-black uppercase tracking-wider text-white hover:border-[#FFDD00] hover:text-[#FFDD00]">Benefit <ArrowRight size={16} /></a>
              </div>
            ) : null}
          </Reveal>
          <Reveal from="zoom" delay={120} className="mx-auto w-full max-w-md">
            <div className="overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur">
              <img src="/kegiatan/poster-youthspark.png" alt="Poster Youth Spark National" className="w-full rounded-[1.5rem] object-cover" />
            </div>
          </Reveal>
        </div>
      </div>
    </HeroStage>
  );
};

const YouthSparkLandingPage = () => (
  <div className="bg-slate-50">
    <YouthSparkHero />
    <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <Reveal>
        <YouthSparkBrand />
        <h2 className="mx-auto mt-10 max-w-3xl text-3xl font-black tracking-tight text-slate-900 md:text-5xl">Youth Spark National</h2>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">Program ini untuk mewadahi pengetahuan dan minat bakat para pemuda melalui berbagai kegiatan.</p>
      </Reveal>
    </section>
    <YouthSparkCards />
  </div>
);

const YouthSparkComingSoon = ({ title, subSlug }) => (
  <div className="bg-slate-50">
    <YouthSparkHero subSlug={subSlug} />
    <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
      <Reveal>
        <div className="mx-auto h-44 w-56"><LaptopMotion /></div>
        <span className="mt-5 inline-block rounded-full bg-[#006569]/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#006569]">Segera Hadir</span>
        <h2 className="mt-5 text-3xl font-black text-slate-900">{title}</h2>
        <p className="mt-4 text-slate-500">Informasi lengkap kegiatan ini sedang dipersiapkan. Silakan kembali lagi untuk pembaruan berikutnya.</p>
        <Link to="/youth-spark" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#006569] px-6 py-3 text-sm font-black text-[#FFDD00]">Kembali ke Youth Spark <ArrowRight size={16} /></Link>
      </Reveal>
    </section>
  </div>
);

const YouthSparkSeminarPage = () => {
  const benefits = ['E-certificate', 'Souvenir', 'Knowledge Sharing', 'Door Prize', 'Networking & Relation'];
  return (
    <div className="bg-slate-50">
      <YouthSparkHero subSlug="seminar-webinar" />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <Reveal>
            <YouthSparkBrand seminar />
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tanggal</span><div className="mt-1 text-xl font-black text-slate-900">18 Oktober 2026</div></div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tempat</span><div className="mt-1 text-xl font-black text-slate-900">Auditorium KH. Hajar Dewantara, UNJ</div></div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target</span><div className="mt-1 text-xl font-black text-slate-900">200 pemuda se-Indonesia</div></div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Biaya</span><div className="mt-1 text-xl font-black text-slate-900">Gratis</div></div>
            </div>
          </Reveal>
          <Reveal from="zoom" delay={120}>
            <img src="/kegiatan/poster-youthspark.png" alt="Poster Youth Spark National Seminar" className="w-full rounded-[2rem] border border-slate-200 bg-white p-2 shadow-xl" />
          </Reveal>
        </div>
      </section>
      <section id="benefit-youth-spark" className="border-y border-slate-100 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal><Heading eyebrow="Benefit" title="Benefit Peserta" /></Reveal>
          <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" itemClassName="h-full">
            {benefits.map((b) => <div key={b} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center font-black text-slate-800"><Check className="mx-auto mb-3 text-[#006569]" size={22} />{b}</div>)}
          </Stagger>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal><Heading eyebrow="Rangkaian Seminar" title="Youth Spark National Seminar" desc="Keynote dan tiga materi utama yang membawa peserta dari pengembangan diri menuju aksi dan pengembangan UMKM di era digital dan AI." /></Reveal>
        <Timeline steps={[
          { label: 'Registrasi', date: '07.00–08.00 WIB', desc: 'Registrasi peserta dan persiapan acara.' },
          { label: 'Keynote Speech', date: '09.40–09.55 WIB', desc: 'Rektor UNJ: Pemuda sebagai Penggerak Masa Depan Bangsa dan Ekonomi Indonesia.' },
          { label: 'Materi 1', date: '09.55–10.40 WIB', desc: 'Pemuda Berdaya, Wirausaha Berkarya.' },
          { label: 'Materi 2', date: '10.40–11.25 WIB', desc: 'Bela Negara melalui Kemandirian Ekonomi.' },
          { label: 'Materi 3', date: '11.25–12.10 WIB', desc: 'Dari Ide ke Pasar: Strategi Pemuda Membangun UMKM Naik Kelas di Era Digital dan AI.' },
        ]} />
      </section>
    </div>
  );
};

export const YouthSparkPage = ({ subSlug }) => {
  if (!subSlug) return <YouthSparkLandingPage />;
  if (subSlug === 'seminar-webinar') return <YouthSparkSeminarPage />;
  if (subSlug === 'kompetisi') return <YouthSparkComingSoon title="Youth Spark National: Kompetisi" subSlug="kompetisi" />;
  if (subSlug === 'pelatihan-pelatih') return <YouthSparkComingSoon title="Youth Spark National: Pelatihan Pelatih" subSlug="pelatihan-pelatih" />;
  return <YouthSparkLandingPage />;
};

export const ProgramPage = ({ slug }) => {
  const program = PROGRAMS.find((p) => p.slug === slug);
  const related = useKegiatan().filter((k) => k.program === slug).slice(0, 3);
  if (!program) return null;
  const others = PROGRAMS.filter((p) => p.slug !== slug);
  const showTimeline = Array.isArray(program.timeline) && program.timeline.length > 0;

  return (
    <div className="flex-grow bg-slate-50 font-sans">
      {slug === 'kc' && <KcIntro />}
      <SubHero program={program} />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#006569]">Tentang Program</span>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{program.title}</h2>
            {program.fullName && <p className="mt-1 text-lg font-bold text-[#006569]">{program.fullName}</p>}
            <div className="mt-6 space-y-4 leading-relaxed text-slate-600">
              {program.about.map((t, i) => <p key={i}>{t}</p>)}
            </div>
            {program.facts?.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                {program.facts.map((f) => (
                  <div key={f.label} className="rounded-2xl border border-slate-200 bg-white px-5 py-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{f.label}</div>
                    <div className="font-black text-slate-900">{f.value}</div>
                  </div>
                ))}
              </div>
            )}
            {program.docs?.length > 0 && <DocList docs={program.docs} />}
            <div className="mt-10 rounded-3xl bg-gradient-to-br from-[#00383b] via-[#006569] to-slate-950 p-8 text-white shadow-xl">
              <h3 className="text-lg font-black text-[#FFDD00]">Ingin ikut atau bertanya?</h3>
              <p className="mt-2 text-sm text-slate-200">Gunakan tautan resmi di bawah ini agar informasi yang kamu terima akurat.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={program.cta.url} className="inline-flex items-center gap-2 rounded-xl bg-[#FFDD00] px-6 py-3 text-sm font-black uppercase tracking-wider text-[#00383b] transition hover:-translate-y-0.5 hover:bg-yellow-300">
                  {program.cta.label} <ArrowRight size={16} />
                </Link>
                {program.ig && (
                  <Link to={program.ig} className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:border-[#FFDD00] hover:text-[#FFDD00]">
                    {SOCIAL_ICON.instagram(16)} Instagram
                  </Link>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-5" from="zoom" delay={120}>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-2xl">
              <SmartImg src={program.image} alt={program.title} fallback={program.title} className="min-h-[280px] w-full" />
            </div>
          </Reveal>
        </div>
      </section>

      {showTimeline && (
        <section id="alur" className="border-y border-slate-100 bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal><Heading eyebrow="Alur Kegiatan" title="Tahapan dari Awal sampai Akhir" /></Reveal>
            <Timeline steps={program.timeline} info={program.timelineInfo} />
          </div>
        </section>
      )}

      {program.details?.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal><Heading eyebrow="Informasi Lengkap" title="Yang Perlu Kamu Ketahui" /></Reveal>
          <Stagger className="grid gap-6 md:grid-cols-2" itemClassName="h-full" step={80}>
            {program.details.map((d) => (
              <div key={d.title} className="h-full rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                <h3 className="text-lg font-black text-slate-900">{d.title}</h3>
                <ul className="mt-5 space-y-3">
                  {d.items.map((t) => (
                    <li key={t} className="flex items-start gap-3 text-slate-600">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#006569]/10 text-[#006569]"><Check size={13} /></span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                {d.note && <p className="mt-4 text-xs text-slate-400">{d.note}</p>}
              </div>
            ))}
          </Stagger>
        </section>
      )}

      {related.length > 0 && (
        <section className="bg-[#eef2fb] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal><Heading eyebrow="Kegiatan Terkait" title="Dokumentasi dan Informasi" /></Reveal>
            <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" itemClassName="h-full">
              {related.map((it) => <KegiatanCard key={it.id} item={it} preferExternal />)}
            </Stagger>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal><Heading eyebrow="Program Lainnya" title="Jelajahi Program Unggulan Lain" /></Reveal>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" itemClassName="h-full" step={60}>
          {others.map((p) => {
            const Icon = ICONS[p.icon] || Trophy;
            return (
              <Link key={p.slug} to={`/${p.slug}`} className="block h-full">
                <HoverCard className="h-full rounded-2xl border border-slate-100 bg-white" inner="flex h-full items-center gap-3 p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#006569] text-[#FFDD00]"><Icon size={18} /></span>
                  <span className="text-sm font-black leading-tight text-slate-900">{p.title}</span>
                </HoverCard>
              </Link>
            );
          })}
        </Stagger>
      </section>
    </div>
  );
};
