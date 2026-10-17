import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowUp, BookOpen, CalendarDays, CheckCircle2, ChevronDown, Command, ExternalLink, FileText, HelpCircle, Search, Sparkles, Trophy, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Link, navigate } from '../lib/router.jsx';
import { usePublishedInformationIndex } from './BrandExperience.jsx';
import { resolvePortalPath } from '../lib/portalSearch.js';
import './PortalUtilities.css';

export function CommandPalette({ open, onClose }) {
  const publishedInformationIndex = usePublishedInformationIndex();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [routeMissing, setRouteMissing] = useState(false);
  const inputRef = useRef(null);
  const returnFocus = useRef(null);
  const matches = useMemo(() => publishedInformationIndex.filter((item) => `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 10), [query, publishedInformationIndex]);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement;
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setQuery('');
    setActive(0);
    setRouteMissing(false);
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => { document.body.style.overflow = before; returnFocus.current?.focus?.(); };
  }, [open]);

  useEffect(() => { setActive(0); }, [query]);
  if (!open) return null;
  const go = (item) => {
    onClose();
    if (item.to) navigate(item.to);
    else if (item.href) window.open(item.href, '_blank', 'noopener,noreferrer');
  };
  const goAI = async () => {
    if (thinking || !query.trim()) return;
    setThinking(true); setRouteMissing(false);
    try {
      const route = await resolvePortalPath(query);
      if (route) {onClose();navigate(route);} else setRouteMissing(true);
    } finally {setThinking(false);}
  };
  const onKeyDown = (event) => {
    if (event.key === 'Escape') { event.preventDefault(); onClose(); }
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((n) => Math.min(n + 1, Math.max(0, matches.length - 1))); }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActive((n) => Math.max(0, n - 1)); }
    if (event.key === 'Enter' && query.trim()) { event.preventDefault(); goAI(); }
    if (event.key === 'Tab') {
      event.preventDefault();
      inputRef.current?.focus();
    }
  };
  return createPortal(
    <div className="portal-search-overlay" role="presentation" onMouseDown={(e) => { if (e.currentTarget === e.target) onClose(); }}>
      <section className="portal-search-dialog" role="dialog" aria-modal="true" aria-label="Cari cepat seluruh portal" onKeyDown={onKeyDown}>
        <div className="portal-search-input-row"><Search size={22} /><input ref={inputRef} value={query} onChange={(e) => {setQuery(e.target.value);setRouteMissing(false);}} type="search" placeholder="Tulis kebutuhanmu, AI akan memilih tab..." aria-label="Cari informasi dengan AI" /><button type="button" onClick={goAI} disabled={!query.trim() || thinking} aria-label="Cari halaman dengan AI" className="portal-search-ai-button">{thinking ? "Mencari…" : "Cari AI"}</button><button type="button" onClick={onClose} aria-label="Tutup pencarian"><X size={20} /></button></div>
        <div className="portal-search-head"><span>{query ? `${matches.length} hasil pencarian` : 'AKSES INFORMASI TERCEPAT'}</span><span>Enter cari dengan AI • Esc tutup</span></div>
        <div className="portal-search-list" role="listbox" aria-label="Hasil pencarian">
          {matches.map((item, index) => {
            const Icon = item.icon;
            return <button key={item.title} type="button" role="option" aria-selected={active === index} className={`portal-search-item ${active===index?'is-active':''}`} onMouseEnter={() => setActive(index)} onClick={() => go(item)}>
              <span className="portal-search-item-icon"><Icon size={18}/></span>
              <span className="portal-search-item-text"><strong>{item.title}</strong><small>{item.description}</small></span>
              <span className="portal-search-item-meta">{item.category}</span><ArrowRight size={17}/>
            </button>;
          })}
          {matches.length===0 && <div className="portal-search-empty"><Sparkles size={24}/><strong>Gunakan Cari AI</strong><p>Ketik kebutuhanmu seperti biasa lalu tekan Enter untuk memilih halaman tujuan.</p></div>}
          {routeMissing && <div className="portal-search-empty" role="status"><HelpCircle size={20}/><strong>Belum ada halaman yang sesuai.</strong></div>}
        </div>
        <div className="portal-search-bottom"><span><Command size={14}/> Pusat Informasi • Menwa UNJ</span><button type="button" onClick={() => {onClose();navigate('/informasi');}}>Lihat direktori lengkap <ArrowRight size={15}/></button></div>
      </section>
    </div>, document.body
  );
}

const KC_SECTIONS = [
  { id:'tentang-program', label:'Tentang', icon:BookOpen },
  { id:'jersey-kc', label:'Jersey', icon:Sparkles },
  { id:'alur', label:'Jadwal', icon:CalendarDays },
  { id:'ketentuan-program', label:'Ketentuan', icon:FileText },
  { id:'faq-program', label:'FAQ', icon:HelpCircle },
];
const YOUTH_SECTIONS = [
  { id:'narasumber-youth-spark', label:'Narasumber', icon:Sparkles },
  { id:'benefit-youth-spark', label:'Benefit', icon:CheckCircle2 },
  { id:'rundown-youth-spark', label:'Rundown', icon:CalendarDays },
  { id:'faq-youth-spark', label:'FAQ', icon:HelpCircle },
];

export function PageWayfinder({ path }) {
  const sections = path === '/kc' ? KC_SECTIONS : path.startsWith('/youth-spark') && !path.endsWith('/kompetisi') && !path.endsWith('/pelatihan-pelatih') && path.includes('/seminar-webinar') ? YOUTH_SECTIONS : null;
  const [active, setActive] = useState('');
  useEffect(() => {
    if (!sections) return;
    setActive('');
    const scroll = () => {
      let selected = '';
      for (const item of sections) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top < 220) selected = item.id;
      }
      setActive(selected);
    };
    window.addEventListener('scroll', scroll, { passive:true });
    scroll();
    return () => window.removeEventListener('scroll', scroll);
  }, [path]);
  if (!sections) return null;
  return <nav className="portal-wayfinder" aria-label="Navigasi cepat bagian halaman">
    <div className="portal-wayfinder-inner"><span className="portal-wayfinder-title"><span /> Jelajahi halaman</span>
    <div className="portal-wayfinder-links">{sections.map((section) => {
      const Icon=section.icon;
      return <a href={`#${section.id}`} key={section.id} className={active===section.id?'is-active':''} onClick={(e) => {e.preventDefault();document.getElementById(section.id)?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}}><Icon size={14}/>{section.label}</a>;
    })}</div></div>
  </nav>;
}

export function FAQSection({ id, type='kc' }) {
  const data = type === 'kc' ? [
    ['Kapan Ksatria Cendekia VIII dilaksanakan?', 'Kegiatan dijadwalkan pada 05–08 November 2026 dengan beberapa lokasi, termasuk Kampus A UNJ, GOR Otista, Batalyon Intai Tempur Cikarang, dan Ragunan.'],
    ['Siapa yang dapat mendaftar sebagai peserta?', 'Peserta merupakan mahasiswa aktif dan anggota aktif Resimen Mahasiswa Indonesia. Setiap tim berisi dua peserta, dengan satu official opsional.'],
    ['Berapa biaya pendaftaran tim?', 'Biaya pendaftaran sebesar Rp2.000.000 per tim. Cek syarat administrasi dan tata cara pembayaran di informasi kegiatan resmi.'],
    ['Apakah jersey peserta berbayar?', 'Jersey peserta bertuliskan ATHLETE termasuk benefit pendaftaran. Pendataan jersey peserta menggunakan formulir khusus yang berbeda dari pre-order official.'],
    ['Berapa harga jersey official?', 'Jersey official ditawarkan melalui pre-order terpisah seharga Rp150.000.'],
    ['Kapan batas pengumpulan karya?', 'Dalam juknis yang dilampirkan, batas pengumpulan esai dan video kreatif adalah 30 Oktober 2026 pukul 22.00 WIB.'],
  ] : [
    ['Kapan Youth Spark National Seminar dilaksanakan?', 'Acara dijadwalkan pada 24 Oktober 2026 di Aula Latief Hendraningrat, Universitas Negeri Jakarta.'],
    ['Apa tema utamanya?', 'Seminar bertema “Empowering Youth, Elevating UMKM” dengan highlight “Pembinaan Aktivitas Pemuda”.'],
    ['Apa saja pembahasan seminar?', 'Tiga materi meliputi Pemuda Berdaya, Wirausaha Berkarya; Dari Literasi ke Industri Kreatif; dan UMKM Naik Kelas di Era Digital dan AI.'],
    ['Pukul berapa acara dimulai dan selesai?', 'Berdasarkan rundown terbaru panitia, susunan acara berlangsung pukul 08.00–12.00 WIB.'],
    ['Apa benefit yang disediakan?', 'Benefit pada poster terbaru meliputi E-certificate, knowledge sharing, door prize, dan networking & relation.'],
    ['Di mana saya bisa mendaftar?', 'Gunakan tombol “Take Your Seat Now!” pada halaman seminar untuk membuka formulir pendaftaran resmi panitia.'],
  ];
  return <section id={id} className="portal-faq" aria-labelledby={`${id}-title`}><div className="portal-faq-inner">
    <div className="portal-faq-heading"><span>INFORMASI & BANTUAN</span><h2 id={`${id}-title`}>Pertanyaan yang sering <em>ditanyakan.</em></h2><p>Jawaban cepat berdasarkan informasi kegiatan yang tersedia pada portal.</p></div>
    <div className="portal-faq-list">{data.map(([question,answer],index) => <details key={question} className="portal-faq-item"><summary><span className="portal-faq-number">{String(index+1).padStart(2,'0')}</span><span>{question}</span><ChevronDown size={18}/></summary><p>{answer}</p></details>)}</div>
  </div></section>;
}

export function BackToTop() {
  const [shown, setShown] = useState(false);
  useEffect(() => { const sync=()=>setShown(window.scrollY>850);window.addEventListener('scroll',sync,{passive:true});sync();return()=>window.removeEventListener('scroll',sync); }, []);
  return <button type="button" onClick={()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})} className={`portal-backtop ${shown?'is-visible':''}`} aria-label="Kembali ke atas halaman" tabIndex={shown?0:-1}><ArrowUp size={19}/></button>;
}
