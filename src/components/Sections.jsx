// Sections.jsx — section beranda, footer, dan halaman subtab program.
// Semua konten dibaca dari ../data/siteData.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy, Flag, HeartHandshake, Mic, ShieldCheck, GraduationCap,
  ArrowRight, Clock, MapPin, Mail, Phone, Zap, Lock,
} from 'lucide-react';
import { Reveal, Stagger, HoverCard, HeroStage, ParallaxLayer, MagneticButton } from './MenwaUI';
import { Link } from '../lib/router';
import { SITE, PROGRAMS, KEGIATAN, FEED_URL, STEP_DESC, IMG } from '../data/siteData';

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

/** <img> ringan + fallback gradien (tanpa memanggil situs luar) bila file belum ada */
const SmartImg = ({ src, alt, className = '', fallback }) => {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [src]);
  if (bad) {
    return (
      <div className={`grid place-items-center bg-gradient-to-br from-[#00383b] via-[#006569] to-slate-900 p-4 text-center text-sm font-black uppercase tracking-wider text-[#FFDD00] ${className}`}>
        {fallback || alt}
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setBad(true)} className={className} />;
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
        title="Enam Program Utama Menwa UNJ"
        desc="Pilih program untuk melihat penjelasan, alur kegiatan, dan cara bergabung."
      />
    </Reveal>
    <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" itemClassName="h-full" step={80}>
      {PROGRAMS.map((p) => {
        const Icon = ICONS[p.icon] || Trophy;
        return (
          <Link key={p.slug} to={`/${p.slug}`} className="block h-full">
            <HoverCard className="h-full rounded-[2rem] border border-slate-100 bg-white shadow-sm" inner="flex h-full flex-col p-8">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#006569] to-[#00383b] text-[#FFDD00] shadow-lg transition-transform duration-500 group-hover/spot:-rotate-6 group-hover/spot:scale-110">
                <Icon size={28} />
              </span>
              <h3 className="mt-8 text-2xl font-black leading-tight text-slate-900">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-slate-500">{p.short}</p>
              <div className="mt-auto flex items-center justify-between pt-8">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#006569]">Selengkapnya</span>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#006569]/10 text-[#006569] transition-all duration-300 group-hover/spot:translate-x-1 group-hover/spot:bg-[#006569] group-hover/spot:text-[#FFDD00]">
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
   2. KEGIATAN TERBARU  (format 4 kartu: gambar, label, judul, tanggal)
   ============================================================ */
export const KegiatanCard = ({ item, preferExternal = false }) => (
  <ItemLink item={item} preferExternal={preferExternal} className="block h-full">
    <HoverCard className="h-full rounded-[1.75rem] border border-slate-100 bg-white shadow-sm" inner="flex h-full flex-col">
      <div className="h-52 overflow-hidden bg-slate-200">
        <SmartImg
          src={imgSrc(item.image)} alt={item.title} fallback={item.category}
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
            <span className="flex items-center gap-1 transition-colors group-hover/spot:text-[#006569]">
              {item.program ? 'Selengkapnya' : 'Lihat postingan'} <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </HoverCard>
  </ItemLink>
);

export const KegiatanTerbaru = ({ limit = 4 }) => {
  const items = useKegiatan().slice(0, limit);
  const ig = SITE.social.find((s) => s.type === 'instagram');
  return (
    <section id="kegiatan-terbaru" className="bg-[#eef2fb] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <Heading
            eyebrow="Kegiatan Terbaru"
            title="Giat Terbaru Menwa UNJ"
            action={ig && (
              <Link to={ig.url} className="inline-flex items-center gap-2 rounded-full border border-[#006569]/30 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#006569] transition hover:bg-[#006569] hover:text-[#FFDD00]">
                {SOCIAL_ICON.instagram(16)} Ikuti Instagram
              </Link>
            )}
          />
        </Reveal>
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" itemClassName="h-full" step={90}>
          {items.map((it) => <KegiatanCard key={it.id} item={it} />)}
        </Stagger>
      </div>
    </section>
  );
};

/* ============================================================
   3. SOROTAN GIAT — carousel yang bergeser looping (berhenti saat di-hover)
   ============================================================ */
export const HighlightMarquee = () => {
  const all = useKegiatan();
  const picked = all.filter((k) => k.highlight);
  const list = picked.length >= 4 ? picked : all;
  const loop = [...list, ...list];
  const mask = 'linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)';

  return (
    <section id="sorotan-giat" className="relative overflow-hidden bg-slate-950 py-20">
      <style>{`
        .mu-track{animation:mu-marquee var(--dur,60s) linear infinite;will-change:transform}
        .mu-pause:hover .mu-track{animation-play-state:paused}
        @media (prefers-reduced-motion:reduce){.mu-track{animation:none}}
      `}</style>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <Heading dark eyebrow="Sorotan Giat" title="Jejak Kegiatan Kami" desc="Geser otomatis. Arahkan kursor untuk berhenti, klik untuk melihat detail." />
        </Reveal>
      </div>
      <div className="mu-pause relative" style={{ WebkitMaskImage: mask, maskImage: mask }}>
        <div className="mu-track flex w-max" style={{ '--dur': `${Math.max(list.length, 4) * 8}s` }}>
          {loop.map((it, i) => {
            const dup = i >= list.length;
            return (
              <ItemLink
                key={`${it.id}-${i}`} item={it}
                aria-hidden={dup || undefined} tabIndex={dup ? -1 : undefined}
                className="group relative mr-6 block h-[420px] w-[280px] shrink-0 overflow-hidden rounded-[2rem] border border-white/10 md:h-[480px] md:w-[340px]"
              >
                <SmartImg
                  src={imgSrc(it.image)} alt={dup ? '' : it.title} fallback={it.category}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <span className="inline-block rounded-full bg-[#FFDD00] px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#00383b]">{it.category}</span>
                  <h3 className="mt-3 line-clamp-3 text-xl font-black leading-snug text-white md:text-2xl">{it.title}</h3>
                  <p className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FFDD00]" />
                    {it.location || it.date || 'Menwa UNJ'}
                  </p>
                </div>
              </ItemLink>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/** Paket untuk beranda: ganti blok highlight KC + slider + 6 kartu dengan satu baris ini */
export const HomeSections = () => (
  <>
    <ProgramUnggulan />
    <KegiatanTerbaru />
    <HighlightMarquee />
  </>
);

/* ============================================================
   4. FOOTER  (pill "Didukung oleh" + 4 kolom)
   ============================================================ */
const PartnerLogo = ({ p }) => {
  const [bad, setBad] = useState(false);
  if (bad) return <span className="text-sm font-black uppercase tracking-wider text-slate-400">{p.name}</span>;
  return (
    <img
      src={p.logo} alt={p.name} title={p.name} loading="lazy" onError={() => setBad(true)}
      className="h-12 w-auto object-contain opacity-60 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
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
        <div className="mx-auto mb-16 flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-5 rounded-[3rem] border border-white/10 bg-white/5 px-8 py-6 backdrop-blur">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Didukung oleh:</span>
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
  <HeroStage className="min-h-[540px] py-24 md:py-32" photo={program.hero ? imgSrc(program.hero) : program.image} blur={6} dim={0.7}>
    <div className="w-full max-w-7xl px-4 text-left sm:px-6 lg:px-8">
      <ParallaxLayer depth={5}>
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/90 backdrop-blur">
            <Zap size={14} className="text-[#FFDD00]" /> {program.badge}
          </span>
          <h1 className="mt-6 max-w-4xl text-5xl font-black uppercase leading-[1.02] tracking-tight text-white drop-shadow-lg md:text-7xl">
            {program.heroLead} <span className="text-[#FFDD00]">{program.heroAccent}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-100/90">{program.heroSub}</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticButton as="div" className="inline-block">
              <Link
                to={program.cta.url}
                className="inline-flex items-center gap-3 bg-[#FFDD00] py-4 pl-9 pr-14 text-sm font-black uppercase tracking-wider text-[#00383b] shadow-xl transition hover:bg-yellow-300"
                style={{ clipPath: 'polygon(0 0, 100% 0, 94% 100%, 0 100%)' }}
              >
                {program.cta.label} <ArrowRight size={18} />
              </Link>
            </MagneticButton>
            <a
              href="#alur"
              onClick={(e) => { e.preventDefault(); document.getElementById('alur')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="inline-flex items-center rounded-xl border border-white/40 px-8 py-4 text-sm font-black uppercase tracking-wider text-white backdrop-blur transition hover:border-[#FFDD00] hover:text-[#FFDD00]"
            >
              Lihat Alur Kegiatan
            </a>
          </div>
        </Reveal>
      </ParallaxLayer>
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
  const n = steps.length;
  return (
    <ol ref={ref} className="grid gap-8 md:gap-0 md:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]" style={{ '--n': n }}>
      {steps.map((label, i) => (
        <li
          key={label}
          className="group relative flex gap-5 md:flex-col md:items-center md:px-3 md:text-center"
          style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(16px)', transition: 'opacity 600ms ease, transform 600ms ease', transitionDelay: `${i * 120}ms` }}
        >
          {i < n - 1 && (
            <>
              <span className="absolute -bottom-8 left-6 top-12 w-0.5 -translate-x-1/2 bg-slate-200 md:hidden" />
              <span className="absolute left-1/2 top-6 hidden h-0.5 w-full -translate-y-1/2 bg-slate-200 md:block">
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
          <div className="md:mt-5">
            <h4 className="font-black text-slate-900">{label}</h4>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{info[label] || STEP_DESC[label]}</p>
          </div>
        </li>
      ))}
    </ol>
  );
};

/* ============================================================
   7. HALAMAN SUBTAB PROGRAM  (/kc/, /geranat/, /pengabdian/, ...)
   ============================================================ */
export const ProgramPage = ({ slug }) => {
  const program = PROGRAMS.find((p) => p.slug === slug);
  const related = useKegiatan().filter((k) => k.program === slug).slice(0, 3);
  if (!program) return null;
  const others = PROGRAMS.filter((p) => p.slug !== slug);

  return (
    <div className="flex-grow bg-slate-50 font-sans">
      <SubHero program={program} />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#006569]">Tentang Program</span>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{program.title}</h2>
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

      <section id="alur" className="border-y border-slate-100 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal><Heading eyebrow="Alur Kegiatan" title="Tahapan dari Awal sampai Akhir" /></Reveal>
          <Timeline steps={program.timeline} info={program.timelineInfo} />
        </div>
      </section>

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
