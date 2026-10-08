import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Menu, 
  Activity, 
  Send, 
  MessageCircle, 
  Shield, 
  User, 
  Lock, 
  LogIn, 
  AlertCircle, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Star, 
  Quote, 
  Users, 
  Award, 
  Compass, 
  Target, 
  Briefcase, 
  Wrench, 
  Crosshair, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  MapPin, 
  Phone, 
  Mail, 
  FileText,
  Trophy,
  Sparkles,
  Flame
} from 'lucide-react';
import {
  MotionStyles, Reveal, ScrollProgress, CursorGlow, CursorFollower,
  HeroStage, HeroLogo, NavBar, TabSwitch
} from './components/MenwaUI';
import { HomeSections, SiteFooter, ProgramPage, YouthSparkPage, HeaderArt } from './components/Sections';
import { PersonPhoto } from './components/PersonPhoto';
import { useRoute, navigate, Link, TAB_PATHS, PATH_TABS } from './lib/router.jsx';
import { MusicPlayer } from './components/MusicPlayer';
import { PlaneMotion, LaptopMotion } from './components/MotionAssets';
import { PROGRAMS, HERO_PHOTO } from './data/siteData';

const handleImgError = (e, text, bgColor = '006569', textColor = 'FFDD00') => {
  e.target.onerror = null;
  e.target.src = `https://placehold.co/600x400/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`;
};

const RevealOnScroll = Reveal;
const NAV_ITEMS = [

  { id: 'beranda', label: 'Beranda', icon: <Compass size={20} />, desc: 'Program unggulan, kegiatan terbaru, dan sorotan giat Satuan UNJ.' },
  { id: 'struktur', label: 'Garis Komando', icon: <Shield size={20} />, desc: 'Struktur organisasi: pimpinan, perencana, pelayanan, dan pelaksana.' },
  { id: 'pendidikan', label: 'Pendidikan dan Pelatihan', icon: <BookOpen size={20} />, desc: 'Pendidikan bertingkat, berjenjang, dan berlanjut.' },
  { id: 'mako', label: 'Markas Komando', icon: <MapPin size={20} />, desc: 'Lokasi Mako, kontak piket, dan layanan permohonan.' },
  { id: 'administrasi', label: 'Administrasi Umum', icon: <FileText size={20} />, desc: 'Layanan administrasi dan prosedur satuan.' }
];

const Navigation = (props) => (
  <NavBar
    {...props}
    onNavigate={props.handleQuickSearch}
    navItems={NAV_ITEMS}
    MenuIcon={<Menu size={28} />}
    CloseIcon={<X size={28} />}
    rightSlot={<MusicPlayer />}
    onLogoError={(e) => handleImgError(e, 'MENWA UNJ', '006569', 'FFDD00')}
  />
);

const CHAT_DESTINATIONS = [
  { label: 'Beranda', path: '/', keywords: ['beranda', 'home', 'program', 'kegiatan', 'sorotan'] },
  { label: 'Garis Komando', path: '/garis-komando', keywords: ['struktur', 'komando', 'pimpinan', 'organisasi', 'staf'] },
  { label: 'Pendidikan & Pelatihan', path: '/pendidikan', keywords: ['pendidikan', 'latihan', 'diklat', 'provos', 'dasar satuan'] },
  { label: 'Markas Komando', path: '/mako', keywords: ['mako', 'alamat', 'lokasi', 'kontak', 'piket'] },
  { label: 'Administrasi Umum', path: '/administrasi', keywords: ['administrasi', 'surat', 'permohonan', 'layanan'] },
  { label: 'Ksatria Cendekia VIII', path: '/kc', keywords: ['ksatria', 'cendekia', 'kc', 'lomba', 'pendaftaran kc'] },
  { label: 'Youth Spark National', path: '/youth-spark', keywords: ['youth spark', 'youth spark national', 'dispora', 'umkm', 'seminar'] },
  { label: 'Seminar & Webinar Youth Spark', path: '/youth-spark/seminar-webinar', keywords: ['seminar webinar', 'seminar youth spark', 'webinar'] },
  { label: 'Kompetisi Youth Spark', path: '/youth-spark/kompetisi', keywords: ['kompetisi youth spark', 'kompetisi'] },
  { label: 'Pelatihan Pelatih Youth Spark', path: '/youth-spark/pelatihan-pelatih', keywords: ['pelatihan pelatih', 'pelatih'] },
];

const localChatAnswer = (text) => {
  const q = text.toLowerCase();
  const hit = CHAT_DESTINATIONS.find((d) => d.keywords.some((k) => q.includes(k)));
  if (q.includes('daftar') && q.includes('kc')) return {
    text: 'Untuk pendaftaran Ksatria Cendekia VIII, saya arahkan ke subtab Ksatria Cendekia agar informasi dan pendaftaran dapat dilihat dari satu halaman.',
    suggestions: [{ label: 'Buka Ksatria Cendekia VIII', path: '/kc' }]
  };
  if (q.includes('youth spark')) return {
    text: 'Youth Spark National adalah program yang mewadahi pengetahuan dan minat bakat pemuda melalui Seminar & Webinar, Kompetisi, dan Pelatihan Pelatih. Saya bisa mengarahkan kamu ke program atau salah satu kegiatannya.',
    suggestions: [{ label: 'Buka Youth Spark National', path: '/youth-spark' }, { label: 'Buka Seminar & Webinar', path: '/youth-spark/seminar-webinar' }]
  };
  if (hit) return { text: `Saya bisa mengarahkan kamu ke ${hit.label}.`, suggestions: [{ label: `Buka ${hit.label}`, path: hit.path }] };
  return {
    text: 'Saya bisa membantu mencari informasi Menwa UNJ dan mengarahkan kamu langsung ke tab yang sesuai. Coba tanyakan misalnya “Bagaimana daftar KC?”, “Ada seminar apa?”, “Di mana Mako?”, atau “Bagaimana pendidikan Menwa?”.',
    suggestions: CHAT_DESTINATIONS.slice(0, 5).map((d) => ({ label: d.label, path: d.path }))
  };
};

const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Komando! Saya Asisten Menwa UNJ. Tanyakan kegiatan, pendidikan, struktur, Mako, administrasi, atau pendaftaran.', sender: 'admin', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isOpen]);

  const ask = async (text) => {
    const q = text.trim();
    if (!q || loading) return;
    setMessages((prev) => [...prev, { id: Date.now(), text: q, sender: 'user', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setInputMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: q }) });
      if (!res.ok) throw new Error('AI unavailable');
      const data = await res.json();
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: data.text || localChatAnswer(q).text, sender: 'admin', suggestions: data.suggestions || localChatAnswer(q).suggestions, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    } catch {
      const fallback = localChatAnswer(q);
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: fallback.text, sender: 'admin', suggestions: fallback.suggestions, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end font-sans">
      <div className={`mb-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all duration-500 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 w-[min(380px,calc(100vw-2rem))] h-[560px]' : 'scale-0 opacity-0 w-0 h-0'}`}>
        <div className="bg-gradient-to-r from-[#006569] via-[#004d50] to-[#00383b] p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-white rounded-full p-1"><img src="/logo-menwa-unj.png" className="w-full h-full object-contain" alt="Menwa UNJ" /></div><div><h4 className="font-black text-sm">Asisten Menwa UNJ</h4><p className="text-[10px] text-[#FFDD00] font-bold">AI Navigation Assistant</p></div></div>
          <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-white/20"><X size={20} /></button>
        </div>
        <div className="h-[395px] bg-slate-50 p-4 overflow-y-auto flex flex-col gap-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col max-w-[90%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
              <div className={`p-3 rounded-2xl shadow-sm text-sm ${msg.sender === 'user' ? 'bg-[#006569] text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none font-medium'}`}>{msg.text}</div>
              {msg.sender === 'admin' && msg.suggestions?.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{msg.suggestions.map((s) => <button key={s.path} type="button" onClick={() => navigate(s.path)} className="rounded-full border border-[#006569]/20 bg-[#006569]/5 px-3 py-1.5 text-[11px] font-black text-[#006569] hover:bg-[#006569] hover:text-white transition">{s.label}</button>)}</div>}
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
            </div>
          ))}
          {loading && <div className="self-start rounded-2xl rounded-bl-none border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-500">Asisten sedang mencari arah yang tepat…</div>}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={(e) => { e.preventDefault(); ask(inputMessage); }} className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center">
          <input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Tanya Menwa UNJ…" className="flex-grow bg-slate-100 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#006569] focus:outline-none" />
          <button type="submit" disabled={!inputMessage.trim() || loading} className="w-10 h-10 bg-[#006569] disabled:bg-slate-300 rounded-full flex items-center justify-center text-white"><Send size={18} className="ml-1" /></button>
        </form>
      </div>
      <button onClick={() => setIsOpen(!isOpen)} className={`w-16 h-16 rounded-full shadow-[0_10px_30px_rgba(0,101,105,0.4)] flex items-center justify-center transition-all duration-300 hover:scale-110 group ${isOpen ? 'bg-slate-900' : 'bg-gradient-to-r from-[#006569] to-[#004d50]'}`} aria-label="Buka Asisten Menwa UNJ">
        {isOpen ? <X size={28} className="text-white" /> : <MessageCircle size={32} className="text-[#FFDD00]" />}
      </button>
    </div>
  );
};

const LoginModal = ({ onClose }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus('loading');

    setTimeout(() => {
      if (userId === 'menwa' || userId === 'menwa@unj.ac.id' || userId === 'admin') {
        setStatus('success');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setStatus('error');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative border border-slate-200" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-[#006569] transition-all hover:rotate-90 bg-slate-100 p-2 rounded-full"><X size={20} /></button>
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#006569] to-[#004d50] text-[#FFDD00] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#006569]/30 transform rotate-3 hover:rotate-12 transition-transform duration-300">
            <Shield size={36} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Portal Anggota Menwa UNJ</h2>
          <p className="text-slate-500 text-sm mt-2">Khusus Anggota Aktif & Pengurus Mako Satuan UNJ</p>
        </div>

        {status === 'error' && (
          <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm font-bold mb-5 flex items-center border border-red-100">
            <AlertCircle size={16} className="mr-2 shrink-0" /> Nomor Anggota / Password salah!
          </div>
        )}

        {status === 'success' && (
          <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-sm font-bold mb-5 flex items-center border border-emerald-200">
            <CheckCircle size={16} className="mr-2 shrink-0" /> Otorisasi Berhasil! Mengarahkan ke Portal Internal...
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">NPA / Email Staf Menwa</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#006569]"><User size={18} className="text-inherit" /></div>
              <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006569] focus:bg-white font-medium transition-all" placeholder="NPA Menwa UNJ / menwa@unj.ac.id" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password Enkripsi</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#006569]"><Lock size={18} className="text-inherit" /></div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006569] focus:bg-white font-medium transition-all" placeholder="Masukkan Password" required />
            </div>
          </div>
          <button type="submit" disabled={status === 'loading'} className="w-full bg-gradient-to-r from-[#006569] via-[#004d50] to-[#00383b] hover:from-[#004d50] hover:to-[#002b2d] text-[#FFDD00] font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#006569]/30 flex justify-center items-center mt-2 hover:-translate-y-1">
            {status === 'loading' ? <span className="animate-pulse">Memverifikasi NPA...</span> : <><LogIn size={18} className="mr-2" /> Otorisasi Masuk Mako</>}
          </button>
        </form>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, endValue, color, borderGlow }) => {
  const [count, setCount] = useState(0);
  const cardRef = useRef(null);
  // Angka baru mulai naik saat kartu terlihat di layar, perlahan selama ±5,5 detik dengan awal dan akhir yang halus.
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setCount(endValue); return undefined; }
    let raf = 0;
    let delay = 0;
    let started = false;
    const DURATION = 5500;
    const run = () => {
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / DURATION, 1);
        setCount(Math.round(endValue * (0.5 - Math.cos(Math.PI * p) / 2)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !started) { started = true; io.disconnect(); delay = setTimeout(run, 400); }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); clearTimeout(delay); cancelAnimationFrame(raf); };
  }, [endValue]);

  return (
    <div ref={cardRef} className={`group bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:-translate-y-3 ${borderGlow} transition-all duration-500 relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className={`mx-auto w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6 shadow-inner border border-white/10 ${color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>{icon}</div>
      <div className={`text-4xl lg:text-6xl font-black mb-3 ${color} drop-shadow-lg`}>{count}+</div>
      <div className="text-slate-300 font-extrabold text-xs tracking-[0.25em] uppercase group-hover:text-white transition-colors">{label}</div>
    </div>
  );
};

const rotatingPhrases = ['Prestasi', 'Pengabdian', 'Anggota', 'Penyelenggaraan'];

const PrideText = () => {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const phrase = rotatingPhrases[index];

  useEffect(() => {
    const pause = !deleting && typed === phrase;
    const timer = setTimeout(() => {
      if (pause) { setDeleting(true); return; }
      if (deleting) {
        const next = typed.slice(0, -1);
        setTyped(next);
        if (!next) { setDeleting(false); setIndex((i) => (i + 1) % rotatingPhrases.length); }
      } else {
        setTyped(phrase.slice(0, typed.length + 1));
      }
    }, pause ? 1500 : (deleting ? 55 : 85));
    return () => clearTimeout(timer);
  }, [typed, deleting, phrase]);

  return (
    <span className="pride-line" aria-live="polite">
      <span className="pride-prefix">Menwa UNJ dalam </span>
      <span className="pride-typing">
        <span className="pride-typing__text">{typed}</span>
        <span className="pride-typing__caret" aria-hidden />
      </span>
    </span>
  );
};

const TabHero = ({ eyebrow, title, subtitle, icon }) => (
  <HeroStage className="min-h-[430px] py-24 md:py-32" photo={HERO_PHOTO} blur={2.5} dim={0.62}>
    <RevealOnScroll className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
      {eyebrow && (
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#FFDD00]/40 bg-black/25 px-5 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#FFDD00] backdrop-blur-sm">
          {icon}{eyebrow}
        </div>
      )}
      <h2 className="text-4xl font-black tracking-tight text-white drop-shadow-2xl md:text-6xl">{title}</h2>
      {subtitle && <p className="mx-auto mt-5 max-w-3xl text-lg font-bold leading-relaxed text-[#FFDD00] drop-shadow-lg md:text-xl">{subtitle}</p>}
    </RevealOnScroll>
  </HeroStage>
);

const BerandaTab = () => {

  return (
    <div className="bg-slate-50 flex-grow font-sans">
      {/* HERO SECTION */}
      <HeroStage className="py-28 md:py-40" photo={HERO_PHOTO} blur={3} dim={0.55}>

        <RevealOnScroll className="relative z-20 flex flex-col items-center px-4 max-w-6xl text-center">
          <div className="mb-8">
            <HeroLogo onError={(e) => handleImgError(e, 'MENWA UNJ', '006569', 'FFDD00')} />
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-2 drop-shadow-md">
            KOMANDO RESIMEN MAHASISWA JAYAKARTA
          </h1>
          
          <div className="text-[#FFDD00] font-extrabold text-2xl md:text-4xl tracking-widest uppercase my-2 drop-shadow-lg">
            SATUAN UNIVERSITAS NEGERI JAKARTA
          </div>

          <div className="h-1.5 w-40 bg-gradient-to-r from-[#006569] via-[#FFDD00] to-[#006569] rounded-full my-6 shadow-[0_0_20px_rgba(255,221,0,0.8)]"></div>

          <p className="text-slate-100 text-lg md:text-2xl font-semibold max-w-4xl italic leading-relaxed drop-shadow-md bg-black/40 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-sm">
            "Penyempurnaan Pengabdian dengan Ilmu Pengetahuan dan Ilmu Olah Keprajuritan."
          </p>

          <div className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#006569]/50 to-[#00383b]/60 border border-[#FFDD00]/60 rounded-full text-[#FFDD00] font-black text-xs md:text-sm tracking-widest uppercase shadow-md">
            <Shield size={16} className="text-[#FFDD00] animate-pulse" /> WIDYA CASTRENA DHARMA SIDDHA
          </div>
        </RevealOnScroll>
      </HeroStage>

      {/* PROGRAM UNGGULAN + KEGIATAN TERBARU + SOROTAN GIAT (data: src/data/siteData.js) */}
      <HomeSections />

      {/* TESTIMONIAL & SUARA SENIOR */}
      <section className="py-24 bg-gradient-to-b from-slate-200 to-slate-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealOnScroll className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h3 className="text-3xl md:text-5xl font-black text-slate-900 flex items-center tracking-tight">
                <Quote className="text-[#006569] mr-4 shrink-0" size={44} /> Apa Kata Mereka tentang Menwa UNJ
              </h3>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <RevealOnScroll delay={100} className="bg-white rounded-[2rem] p-10 md:p-12 shadow-xl border border-slate-200 hover:-translate-y-3 hover:shadow-2xl hover:shadow-[#006569]/20 transition-all duration-500 relative group flex flex-col justify-between">
              <p className="text-slate-800 text-lg md:text-xl leading-relaxed mb-10 italic font-medium">"Menwa UNJ adalah kawah candradimuka pembentukan karakter mahasiswa. Di sini kalian tidak hanya belajar disiplin, tapi juga nasionalisme, kepemimpinan, dan loyalitas pada bangsa.”</p>
              <div className="flex items-center gap-5 pt-8 border-t border-slate-200">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-full bg-[#006569] text-[#FFDD00] flex items-center justify-center font-black text-lg border-2 border-[#FFDD00] shadow-md">
                    EE
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg leading-tight">Letkol Marinir Edy Effendi, SH., MH.</h4>
                  <p className="text-[#006569] font-bold text-xs mt-1">Kasubdis Multimedia Kesatuan Dinas Penerangan Koarmada RI</p>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={300} className="bg-gradient-to-br from-slate-900 via-[#00383b] to-[#006569] rounded-[2rem] p-10 md:p-12 shadow-2xl border border-slate-700/50 hover:-translate-y-3 hover:shadow-[#006569]/30 transition-all duration-500 text-white group flex flex-col justify-between">
              <p className="text-slate-100 text-lg md:text-xl leading-relaxed mb-10 italic font-medium">“Menwa UNJ tidak hanya melatih fisik, tetapi juga membentuk pola pikir kritis, mental tangguh, dan kemampuan bekerja sama yang kelak sangat dibutuhkan dalam dunia kerja maupun pengabdian masyarakat sehingga melahirkan generasi muda yang siap menghadapi tantangan zaman.”</p>
              <div className="flex items-center gap-5 pt-8 border-t border-slate-700">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-full bg-[#FFDD00] text-[#00383b] flex items-center justify-center font-black text-lg border-2 border-white shadow-md">
                    AS
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-white text-lg leading-tight">Drs. Agus Setiaji, M.Si, AAIJ, RFA, RIFA, CHRP.</h4>
                  <p className="text-[#FFDD00] font-bold text-xs mt-1">Ketua IARMI UNJ | Tenaga Ahli BUMN Bidang Process Improvement</p>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* STATISTIK KEANGGOTAAN */}
      <section className="py-28 bg-slate-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealOnScroll className="text-center mb-20">
            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-2xl"><PrideText /></h3>
            <div className="h-1.5 w-32 bg-[#006569] mx-auto rounded-full shadow-[0_0_15px_rgba(0,101,105,0.8)]"></div>
          </RevealOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            <RevealOnScroll delay={100}>
              <StatCard icon={<Users size={36}/>} label="Anggota Aktif" endValue={50} color="text-[#FFDD00]" borderGlow="group-hover:border-[#FFDD00]/50" />
            </RevealOnScroll>
            <RevealOnScroll delay={200}>
              <StatCard icon={<Award size={36}/>} label="Prestasi Terdata" endValue={150} color="text-emerald-400" borderGlow="group-hover:border-emerald-400/50" />
            </RevealOnScroll>
            <RevealOnScroll delay={300}>
              <StatCard icon={<Compass size={36}/>} label="Giat Pengabdian Masyarakat" endValue={100} color="text-teal-300" borderGlow="group-hover:border-teal-300/50" />
            </RevealOnScroll>
            <RevealOnScroll delay={400}>
              <StatCard icon={<Shield size={36}/>} label="Penyelenggara Lomba Prov & Nas" endValue={30} color="text-yellow-300" borderGlow="group-hover:border-yellow-300/50" />
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </div>
  );
};

const StrukturOrganisasiTab = ({ onNavigate }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (id) => {
    setExpandedSection(prev => prev === id ? null : id);
  };

  const unsurPerencana = [
    {
      id: "pam",
      title: "Pengamanan",
      desc: "Perencanaan intelijen, pengamanan mako, serta pengawasan operasional.",
      members: [
        { role: "Kaur Pengamanan", name: "Mario Bagaskara", detail: "FEB / Manajemen (NBP: 21020741495)" },
        { role: "Wa Kaur Pengamanan", name: "Ghifari Ghufron", detail: "FT / Rekayasa Keselamatan Kebakaran" },
        { role: "Staf Pengamanan", name: "Amiliudin Lesmana", detail: "FEB / Administrasi Perkantoran Digital" }
      ]
    },
    {
      id: "ops",
      title: "Operasi",
      desc: "Perencanaan & pelaksanaan giat keprajuritan, latihan komando, dan taktis.",
      members: [
        { role: "Kaur Operasi", name: "Ichsan Ridwan Hafizh", detail: "FEB / Akuntansi Sektor Publik (NBP: 22020742263)" },
        { role: "Wa Kaur Operasi", name: "Alea Afiyanti", detail: "FIKK / Pendidikan Jasmani" }
      ]
    },
    {
      id: "pers",
      title: "Personalia",
      desc: "Pengelolaan keanggotaan, pendaftaran, administrasi, & pembinaan kader.",
      members: [
        { role: "Kaur Personalia", name: "Nadia Windra Zahara", detail: "FISH / Pendidikan Geografi (NBP: 2240742269)" },
        { role: "Wa Kaur Personalia", name: "Anggie Palentrina", detail: "FMIPA / Kimia" },
        { role: "Staf Personalia", name: "Gyan Muhammad Irhamir Subiyantoro", detail: "FT / Rekayasa Keselamatan Kebakaran" }
      ]
    },
    {
      id: "log",
      title: "Logistik",
      desc: "Pengelolaan perlengkapan lapangan, inventaris mako & sarana prasarana.",
      members: [
        { role: "Kaur Logistik", name: "Wanda Putri Amalia", detail: "FPSI / Psikologi (NBP: 22030742265)" },
        { role: "Wa Kaur Logistik", name: "Muhammad Afdhal Abdillah", detail: "FEB / Akuntansi" }
      ]
    },
    {
      id: "ter",
      title: "Teritorial",
      desc: "Bakti masyarakat, kemanunggalan, serta hubungan antar-lembaga/masyarakat.",
      members: [
        { role: "Kaur Teritorial", name: "Aulia Asharany Jasmine", detail: "FIP / Pendidikan Guru Sekolah Dasar" },
        { role: "Wa Kaur Teritorial", name: "Julia Rizqi Rahmawati", detail: "FISH / Pendidikan IPS" },
        { role: "Staf Teritorial", name: "Laras Veby Damayanti", detail: "FISH / PPKn" }
      ]
    },
    {
      id: "putri",
      title: "Keputrian",
      desc: "Pembinaan & pemberdayaan anggota Srikandi Resimen Mahasiswa.",
      members: [
        { role: "Kaur Keputrian", name: "Siti Jaojah", detail: "FIP / Manajemen Pendidikan" },
        { role: "Wa Kaur Keputrian", name: "Hilmi Suciasih", detail: "FIP / Manajemen Pendidikan (NBP: 22030742270)" }
      ]
    }
  ];

  const unsurPelayanan = [
    {
      id: "set",
      title: "Kesekretariatan",
      desc: "Pengelolaan kearsipan resmi, tata persuratan, & administrasi satuan.",
      members: [
        { role: "Kepala Kesekretariatan", name: "Belli Vio Saputra", detail: "FEB / Akuntansi" },
        { role: "Wa Kepala Kesekretariatan", name: "Riza Rahmandawanti", detail: "FBS / Pendidikan Bahasa Mandarin" }
      ]
    },
    {
      id: "mako",
      title: "Markas",
      desc: "Pengelolaan kelancaran operasional, kebersihan, & tata tertib Mako Gedung G.",
      members: [
        { role: "Kepala Markas", name: "Alip Rohman Gunawan", detail: "FT / Rekayasa Keselamatan Kebakaran" },
        { role: "Wa Kepala Markas", name: "Ronis Satia", detail: "FIKK / Ilmu Keolahragaan" },
        { role: "Staf Markas", name: "Muhammad Tendison Iha Tabuni", detail: "FIKK / Pendidikan Jasmani (NBP: 22010742261)" }
      ]
    },
    {
      id: "prov",
      title: "Provos",
      desc: "Penegakan tata tertib, kedisiplinan prajurit, & pengawasan etika satuan.",
      members: [
        { role: "Kepala Provost", name: "Adam Ramadhana", detail: "FBS / Pendidikan Bahasa Inggris" },
        { role: "Wa Kepala Provost", name: "Muhammad Alfonso Hermawan", detail: "FISH / Ilmu Komunikasi" }
      ]
    }
  ];

  const unsurPelaksana = [
    {
      id: "pokpas",
      title: "Komandan Pokok Pasukan",
      desc: "Pimpinan taktis pasukan latihan dan operasional lapangan.",
      members: [
        { role: "Komandan Pokok Pasukan", name: "Ghibthah Maulidya Azzahra", detail: "FIP / Perpustakaan & Sains Informasi" },
        { role: "Wakil Komandan Pokok Pasukan", name: "Gisela Rori", detail: "FPSI / Psikologi" }
      ]
    },
    {
      id: "anggota",
      title: "Jajaran Anggota Satuan",
      desc: "Prajurit jajaran Satuan Menwa UNJ penegak Tri Dharma & bela negara.",
      members: [
        { role: "Anggota Satuan", name: "Romy Nirwana", detail: "FISH / Pendidikan IPS" },
        { role: "Anggota Satuan", name: "Khansa Asma Itsar", detail: "FIKK / Olahraga Rekreasi" },
        { role: "Anggota Satuan", name: "Ibnu Bintang Satriawan", detail: "FMIPA / Kimia" },
        { role: "Anggota Satuan", name: "Revalia Febriani", detail: "FPSI / Psikologi" },
        { role: "Anggota Satuan", name: "Tiara Cendy Julianti", detail: "FPSI / Psikologi" },
        { role: "Anggota Satuan", name: "Lia Bertha Yadohamang", detail: "FT / Pendidikan Teknik Informatika & Komputer" },
        { role: "Anggota Satuan", name: "Ahza Rusyaidi Zaman", detail: "FIKK / Pendidikan Jasmani" },
        { role: "Anggota Satuan", name: "Santi Bapaimu", detail: "FT / Pendidikan Teknik Informatika & Komputer" },
        { role: "Anggota Satuan", name: "Medis Siburian", detail: "FIKK / Pendidikan Jasmani" },
        { role: "Anggota Satuan", name: "Hermina Simanagae", detail: "FT / Pendidikan Teknik Informatika & Komputer" },
        { role: "Anggota Satuan", name: "Paskalina Sami", detail: "FT / Pendidikan Teknik Informatika & Komputer" },
        { role: "Anggota Satuan", name: "Natalia Erma Ive", detail: "FT / Pendidikan Teknik Informatika & Komputer" },
        { role: "Anggota Satuan", name: "Margaretha Fridolin", detail: "FT / Pendidikan Teknik Informatika & Komputer" },
        { role: "Anggota Satuan", name: "Lisa Kriswinda Korwa", detail: "FT / Pendidikan Teknik Informatika & Komputer" },
        { role: "Anggota Satuan", name: "Agustina Lusia", detail: "FT / Pendidikan Teknik Informatika & Komputer" },
        { role: "Anggota Satuan", name: "Muhammad Zickry Iswandi", detail: "FMIPA / Kimia" },
        { role: "Anggota Satuan", name: "Theofila Yakanaimu", detail: "FT / Pendidikan Teknik Informatika & Komputer" },
        { role: "Anggota Satuan", name: "Serlina Sompika", detail: "FIP / Pendidikan Guru Sekolah Dasar" }
      ]
    }
  ];

  return (
    <div className="bg-slate-100 min-h-screen pb-32 font-sans flex-grow">
      <TabHero title="Garis Komando Satuan" subtitle="Resimen Mahasiswa Satuan Universitas Negeri Jakarta (SKEP 2026)" icon={<Shield size={15} />} eyebrow="Garis Komando" />

      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-20 space-y-12">
        {/* Pimpinan Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <RevealOnScroll delay={100} className="flex justify-center">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 text-center w-full shadow-2xl relative group hover:border-[#006569] transition-all">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#006569] text-[#FFDD00] text-xs font-black px-5 py-1.5 rounded-full shadow-lg uppercase tracking-widest border border-[#FFDD00]/30">Pimpinan</div>
              <div className="w-28 h-28 mx-auto rounded-full bg-[#00383b] text-[#FFDD00] flex items-center justify-center font-black text-2xl border-4 border-[#006569] shadow-xl mb-4 group-hover:scale-105 transition-transform overflow-hidden">
                <PersonPhoto name="Eben Haezer Sitorus" fallback="EHS" />
              </div>
<h3 className="font-black text-xl text-slate-900 leading-tight mb-1">Eben Haezer Sitorus</h3>
              <p className="text-[#006569] font-extrabold text-xs uppercase tracking-widest bg-[#006569]/10 py-2 rounded-xl border border-[#006569]/20">Komandan Satuan (FISH / Geografi)</p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={200} className="flex justify-center">
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 border border-slate-700 text-center w-full shadow-xl relative group hover:border-[#FFDD00] transition-all">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#FFDD00] text-slate-950 text-xs font-black px-5 py-1.5 rounded-full shadow-lg uppercase tracking-widest">Wakil Pimpinan</div>
              <div className="w-28 h-28 mx-auto rounded-full bg-[#FFDD00] text-slate-950 flex items-center justify-center font-black text-2xl border-4 border-white shadow-lg mb-4 group-hover:scale-105 transition-transform overflow-hidden">
                <PersonPhoto name="Raffli Syahputra" fallback="RS" />
              </div>
<h3 className="font-black text-xl text-white leading-tight mb-1">Raffli Syahputra</h3>
              <p className="text-[#FFDD00] font-extrabold text-xs uppercase tracking-widest bg-white/10 py-2 rounded-xl border border-white/10">Wakil Komandan Satuan (FEB / Manajemen)</p>
            </div>
          </RevealOnScroll>
        </div>

        {/* Unsur Perencana */}
        <RevealOnScroll delay={300} className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-200">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-black text-slate-900 inline-flex items-center tracking-tight border-b-4 border-[#006569] pb-3">
              <Target className="mr-3 text-[#006569]" size={28}/> Unsur Perencana
            </h3>
            <p className="text-slate-500 mt-3 font-medium text-sm">Klik kartu di bawah untuk membuka daftar pejabat staf perencana.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {unsurPerencana.map((staf) => {
              const isExpanded = expandedSection === staf.id;
              return (
                <div 
                  key={staf.id} 
                  onClick={() => toggleSection(staf.id)}
                  className={`rounded-2xl p-6 border transition-all duration-300 cursor-pointer ${
                    isExpanded 
                      ? 'bg-[#006569]/5 border-[#006569] shadow-xl ring-2 ring-[#006569]/30' 
                      : 'bg-slate-50 border-slate-200 hover:shadow-lg hover:border-[#006569]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#006569]/10 text-[#006569] flex items-center justify-center font-black">
                      <Shield size={20} />
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${isExpanded ? 'bg-[#006569] text-[#FFDD00]' : 'bg-slate-200 text-slate-700'}`}>
                      {isExpanded ? 'Tutup Profil ▲' : 'Buka Profil ▼'}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-base mb-1">{staf.title}</h4>
                  <p className="text-slate-600 text-xs font-medium leading-relaxed">{staf.desc}</p>

                  {isExpanded && (
                    <div className="mt-5 pt-4 border-t border-[#006569]/20 space-y-3">
                      <h5 className="text-[11px] font-black uppercase text-[#006569] tracking-wider flex items-center gap-1">
                        <User size={12} /> Pejabat Staf Terdaftar:
                      </h5>
                      {staf.members.map((m, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 text-xs font-black border-[#006569]/30 bg-slate-100 text-[#006569]">
                            <PersonPhoto name={m.name} />
                          </span>
                          <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#006569] block">{m.role}</span>
                            <span className="font-bold text-slate-900 text-sm block">{m.name}</span>
                            <span className="text-[11px] text-slate-500 font-medium block">{m.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </RevealOnScroll>

        {/* Unsur Pelayanan */}
        <RevealOnScroll delay={400} className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-200">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-black text-slate-900 inline-flex items-center tracking-tight border-b-4 border-[#FFDD00] pb-3">
              <Briefcase className="mr-3 text-[#006569]" size={28}/> Unsur Pelayanan
            </h3>
            <p className="text-slate-500 mt-3 font-medium text-sm">Klik kartu untuk membuka pejabat staf kesekretariatan, markas, & provos.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {unsurPelayanan.map((staf) => {
              const isExpanded = expandedSection === staf.id;
              return (
                <div 
                  key={staf.id}
                  onClick={() => toggleSection(staf.id)}
                  className={`rounded-2xl p-6 border transition-all duration-300 cursor-pointer ${
                    isExpanded 
                      ? 'bg-[#FFDD00]/10 border-[#006569] shadow-xl ring-2 ring-[#006569]/30' 
                      : 'bg-slate-50 border-slate-200 hover:shadow-lg hover:border-[#006569]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                      <Wrench size={20} />
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${isExpanded ? 'bg-[#006569] text-[#FFDD00]' : 'bg-slate-200 text-slate-700'}`}>
                      {isExpanded ? 'Tutup Profil ▲' : 'Buka Profil ▼'}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-base mb-1">{staf.title}</h4>
                  <p className="text-slate-600 text-xs font-medium leading-relaxed">{staf.desc}</p>

                  {isExpanded && (
                    <div className="mt-5 pt-4 border-t border-slate-300 space-y-3">
                      <h5 className="text-[11px] font-black uppercase text-[#006569] tracking-wider flex items-center gap-1">
                        <User size={12} /> Pejabat Staf Terdaftar:
                      </h5>
                      {staf.members.map((m, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 text-xs font-black border-[#006569]/30 bg-slate-100 text-[#006569]">
                            <PersonPhoto name={m.name} />
                          </span>
                          <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#006569] block">{m.role}</span>
                            <span className="font-bold text-slate-900 text-sm block">{m.name}</span>
                            <span className="text-[11px] text-slate-500 font-medium block">{m.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </RevealOnScroll>

        {/* Unsur Pelaksana */}
        <RevealOnScroll delay={500} className="bg-slate-900 text-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-800">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-black text-white inline-flex items-center tracking-tight border-b-4 border-[#006569] pb-3">
              <Users className="mr-3 text-[#FFDD00]" size={28}/> Unsur Pelaksana
            </h3>
            <p className="text-slate-400 mt-3 font-medium text-sm">Klik kartu untuk melihat jajaran Komandan Pokpas dan Anggota Satuan.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {unsurPelaksana.map((staf) => {
              const isExpanded = expandedSection === staf.id;
              return (
                <div 
                  key={staf.id}
                  onClick={() => toggleSection(staf.id)}
                  className={`rounded-2xl p-6 border transition-all duration-300 cursor-pointer ${
                    isExpanded 
                      ? 'bg-[#006569]/40 border-[#FFDD00] shadow-xl ring-2 ring-[#FFDD00]/50' 
                      : 'bg-slate-800/80 border-slate-700 hover:border-[#006569]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#006569] text-[#FFDD00] flex items-center justify-center font-black">
                      <Crosshair size={20} />
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${isExpanded ? 'bg-[#FFDD00] text-slate-950' : 'bg-slate-700 text-slate-300'}`}>
                      {isExpanded ? 'Tutup Profil ▲' : 'Buka Profil ▼'}
                    </span>
                  </div>
                  <h4 className="font-black text-white text-base mb-1">{staf.title}</h4>
                  <p className="text-slate-300 text-xs font-medium leading-relaxed">{staf.desc}</p>

                  {isExpanded && (
                    <div className="mt-5 pt-4 border-t border-slate-700 space-y-3 max-h-96 overflow-y-auto pr-2">
                      <h5 className="text-[11px] font-black uppercase text-[#FFDD00] tracking-wider flex items-center gap-1">
                        <User size={12} /> Daftar Prajurit & Pejabat:
                      </h5>
                      {staf.members.map((m, idx) => (
                        <div key={idx} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center gap-3">
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 text-xs font-black border-[#FFDD00]/40 bg-slate-700 text-[#FFDD00]">
                            <PersonPhoto name={m.name} />
                          </span>
                          <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#FFDD00] block">{m.role}</span>
                            <span className="font-bold text-white text-sm block">{m.name}</span>
                            <span className="text-[11px] text-slate-400 font-medium block">{m.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
};

const CourseDetail = ({ course, open, dark }) => (
  <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 450ms cubic-bezier(.16,1,.3,1)' }} aria-hidden={!open}>
    <div className="overflow-hidden">
      <div
        className={`mt-4 rounded-xl border p-4 ${dark ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-white'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h5 className={`mb-3 flex items-center text-[11px] font-black uppercase tracking-wider ${dark ? 'text-[#FFDD00]' : 'text-slate-900'}`}>
          <Target size={14} className={`mr-2 ${dark ? 'text-[#FFDD00]' : 'text-[#006569]'}`} /> Acara Pendidikan & Materi Utama (Renlat)
        </h5>
        <ul className="space-y-2">
          {course.curriculum.map((item, idx) => (
            <li
              key={idx}
              className={`flex items-start rounded-lg border p-3 text-xs font-bold ${dark ? 'border-white/10 bg-white/5 text-slate-200' : 'border-[#006569]/20 bg-[#006569]/5 text-slate-700'}`}
            >
              <CheckCircle size={16} className={`mr-2 mt-px shrink-0 ${dark ? 'text-[#FFDD00]' : 'text-[#006569]'}`} /> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const PendidikanTab = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const toggleCourse = (c) => setSelectedCourse((cur) => (cur && cur.id === c.id ? null : c));

  const pendidikanBertingkat = [
    {
      id: 1,
      title: "Pendidikan Dasar Satuan",
      level: "Pendidikan Bertingkat",
      duration: "5 Hari",
      category: "Bertingkat",
      desc: "Pendidikan tingkat dasar satuan untuk membentuk mental, disiplin, wawasan kebangsaan, dan dasar olah keprajuritan bagi calon anggota Resimen Mahasiswa Jayakarta Satuan UNJ.",
      curriculum: [
        "Kemenwaan: Dasar Organisasi, Sejarah Menwa Satuan, PDRM",
        "Permildas: CMI, PBB, PUDD, PPM, TUM",
        "Pembinaan Jasmani: BDM, Orientasi Medan",
        "Latihan Berganda: Caraka (Pengiriman Pesan Rahasia Pos-to-Pos)",
        "Latihan Teknik/Taktik: Pembuatan Bivak",
        "Pelajaran Pelengkap: Loyalitas, Etika & Moral",
        "Pelajaran Tambahan: Upacara, Jam Komandan, Jam Cadangan"
      ]
    },
    {
      id: 2,
      title: "Latihan Pemantapan Komando",
      level: "Pendidikan Bertingkat",
      duration: "5 Hari",
      category: "Bertingkat",
      desc: "Ujian pemantapan fisik, mental, dan tradisi komando di daerah latihan Koramil Sukamakmur - Curug Benjol Bogor sebelum pengukuhan resmi penyematan Baret Ungu Menwa UNJ.",
      curriculum: [
        "Long March 14 KM (Sukamakmur - Curug Benjol)",
        "Wawasan Kebangsaan & Kemenwaan",
        "Makna Baret & Tradisi Komando",
        "Bivak & Pembuatan Perlindungan",
        "Permildas (TUM & PBB)",
        "Micro Teaching Lapangan & Bakti Sosial",
        "Caraka Malam & Tradisi Pembaretan Curug Benjol"
      ]
    },
    {
      id: 3,
      title: "Kursus Dinas Staf",
      level: "Pendidikan Bertingkat",
      duration: "4 Hari",
      category: "Bertingkat",
      desc: "Menempa kemampuan manajerial, pembuatan naskah dinas staf, perencanaan operasional, serta interoperabilitas antar-seksi staf markas komando.",
      curriculum: [
        "Materi Staf PAM (Pengamanan & Kontra-Intel)",
        "Materi Staf OPS (Operasi & Perencanaan Latihan)",
        "Materi Staf PERS (Personalia & Administrasi)",
        "Materi Staf LOG (Logistik & Perbekalan)",
        "Materi Staf TER (Teritorial & Bakti Masyarakat)",
        "Materi Staf TRIAN, MARKAS, SET, & PROVOST",
        "Materi DANPOKPAS & Jam Komandan"
      ]
    },
    {
      id: 4,
      title: "Pendidikan Provos Satuan",
      level: "Pendidikan Bertingkat",
      duration: "3 Hari",
      category: "Bertingkat",
      desc: "Spesialisasi penegakan disiplin, tata tertib, pengawasan etika keprajuritan, serta pengamanan internal Mako Satuan UNJ.",
      curriculum: [
        "Tupoksi & Wewenang Provos Satuan",
        "Pengendalian Lalu Lintas (Dalalin)",
        "Parade & Penegakan Disiplin",
        "HARTIB (Pemeliharaan Ketertiban)",
        "Intelijen & Taktik Penyelidikan",
        "Pengawalan & Keprotokolan VVIP",
        "PDRM (Peraturan Disiplin Resimen Mahasiswa)",
        "Interogasi, Pengamanan Instalasi, & Loyalitas"
      ]
    }
  ];

  const pendidikanBerjenjang = [
    {
      id: 5,
      title: "Pendidikan Dasar Militer",
      level: "Pendidikan Berjenjang",
      duration: "10 Hari",
      category: "Berjenjang",
      desc: "Pendidikan dasar keprajuritan tingkat utama yang diselenggarakan oleh Kodam/Rindam Jaya untuk membentuk karakter prajurit mahasiswa.",
      curriculum: [
        "Doktrin Pertahanan Negara & Militer Dasar",
        "PBB, Perpang, & Tata Upacara Militer",
        "Navigasi Darat & Kompas Malam",
        "Bela Diri Militer & Ketahanan Fisik Lapangan",
        "Pengetahuan Taktik & Survival"
      ]
    },
    {
      id: 6,
      title: "Kursus Kader Pelaksana",
      level: "Pendidikan Berjenjang",
      duration: "20 Hari",
      category: "Berjenjang",
      desc: "Penggemblengan calon pimpinan operasional dan komandan poko pasukan di tingkat Skomen Jayakarta maupun Nasional.",
      curriculum: [
        "Kepemimpinan Taktis Lapangan (Field Leadership)",
        "Manajemen Operasi Satuan & Teritorial",
        "Analisis Keputusan Krisis & Intelpam",
        "Taktik Pasukan & Pengendalian Massa"
      ]
    },
    {
      id: 7,
      title: "Kursus Dinas Staf",
      level: "Pendidikan Berjenjang",
      duration: "6 Hari",
      category: "Berjenjang",
      desc: "Pendalaman tata kelola dinas staf markas komando tingkat provinsi/Jayakarta.",
      curriculum: [
        "Manajemen Staf Komando Gabungan",
        "Penyusunan Produk Operasional & Logistik Skomen",
        "Interoperabilitas Organisasi Kedinasan",
        "Simulasi Posko Latihan & Komando Ops"
      ]
    },
    {
      id: 8,
      title: "Kursus Pelatih Nasional",
      level: "Pendidikan Berjenjang",
      duration: "10 Hari",
      category: "Berjenjang",
      desc: "Mencetak instruktur dan pelatih bertaraf nasional yang handal dalam mentransfer ilmu olah keprajuritan dan kurikulum Diksar Menwa.",
      curriculum: [
        "Metodologi Pelatihan (Andragogi & CMI)",
        "Psikologi Massa & Teknik Instruksi Lapangan",
        "Penyusunan Kurikulum Latihan Nasional",
        "Standardisasi Evaluasi & Kepelatihan Satuan"
      ]
    },
    {
      id: 9,
      title: "Kursus Kader Pimpinan",
      level: "Pendidikan Berjenjang",
      duration: "20 Hari",
      category: "Berjenjang",
      desc: "Pendidikan kualifikasi pimpinan tertinggi Resimen Mahasiswa tingkat nasional untuk mencetak Komandan Satuan dan Komandan Kompleks.",
      curriculum: [
        "Strategi Pertahanan Nasional & Kebijakan Publik",
        "Kepemimpinan Strategis & Geopolitik",
        "Manajemen Organisasi Tingkat Nasional",
        "Pengambilan Keputusan Strategis & Keamanan Nasional"
      ]
    }
  ];

  const pendidikanLanjutan = [
    {
      id: 10,
      title: "Kursus Kader Pembinaan Mental Nasional",
      level: "Pendidikan Berlanjut",
      duration: "8 Hari",
      category: "Berlanjut",
      desc: "Kursus pembinaan mental, spiritual, dan ideologi kebangsaan untuk menguatkan ketahanan rohani prajurit Menwa.",
      curriculum: [
        "Pembinaan Ideologi Pancasila & Keetikaan",
        "Psikologi Ketahanan Mental Prajurit",
        "Teknik Konseling & Bimsuh Lapangan",
        "Penguatan Moral & Jiwa Korsa Nasional"
      ]
    },
    {
      id: 11,
      title: "Kursus Protokoler",
      level: "Pendidikan Berlanjut",
      duration: "3 Hari",
      category: "Berlanjut",
      desc: "Spesialisasi tata krama keprotokolan negara/universitas, pengawalan jajaran rektorat, dan event management.",
      curriculum: [
        "Keprotokolan Resmi Negara & Perguruan Tinggi",
        "Pengawalan VVIP & Jajaran Kehormatan",
        "Public Relations & Master of Ceremony (MC)",
        "Etika Diplomasi & Tata Tempat Kedinasan"
      ]
    },
    {
      id: 12,
      title: "Kursus Intelijen dan Pengamanan",
      level: "Pendidikan Berlanjut",
      duration: "3 Hari",
      category: "Berlanjut",
      desc: "Pelatihan analisis informasi, kontraintelijen, pengamanan aset vital kampus, dan deteksi dini ancaman kebangsaan.",
      curriculum: [
        "Teknik Penyelidikan, Pengamatan, & Penggalangan",
        "Analisis Informasi & Kontra-Intelijen",
        "Pengamanan Teritorial Kampus & Objek Vital",
        "Siber & Kriptografi Dasar Komando"
      ]
    }
  ];

  return (
    <div className="bg-slate-100 min-h-screen pb-32 font-sans flex-grow">
      {/* Header Banner */}
      <TabHero title="Pendidikan & Pelatihan Satuan" subtitle="Membentuk Karakter yang Intelektual, Bermental Baja, dan Berjiwa Ksatria" icon={<BookOpen size={15} />} eyebrow="Kurikulum Komando Resimen Mahasiswa UNJ" />

      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-20 space-y-12">
        {/* SUBJUDUL 1: Pendidikan Bertingkat */}
        <RevealOnScroll delay={100} className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-200">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-black text-slate-900 inline-flex items-center tracking-tight border-b-4 border-[#006569] pb-3">
              <Shield className="mr-3 text-[#006569]" size={28}/> Pendidikan Bertingkat
            </h3>
            <p className="text-slate-500 mt-3 font-medium text-sm">Jenjang pembinaan internal utama anggota Resimen Mahasiswa Satuan UNJ.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {pendidikanBertingkat.map((course) => (
              <div 
                key={course.id}
                onClick={() => toggleCourse(course)}
                role="button"
                tabIndex={0}
                aria-expanded={!!selectedCourse && selectedCourse.id === course.id}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCourse(course); } }}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-[#006569] hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-[#006569]/10 text-[#006569] font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                      {course.level}
                    </span>
                    <span className="text-xs font-bold text-slate-500 flex items-center">
                      <Clock size={12} className="mr-1 text-[#006569]" /> {course.duration}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-lg mb-2 group-hover:text-[#006569] transition-colors">
                    {course.title} - {course.duration}
                  </h4>
                  <p className={`text-slate-600 text-xs font-medium leading-relaxed ${selectedCourse && selectedCourse.id === course.id ? '' : 'line-clamp-3'}`}>
                    {course.desc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-[#006569]">
                  <span>{selectedCourse && selectedCourse.id === course.id ? 'Tutup Detail' : 'Lihat Renlat & Detail Modul'}</span>
                  <ChevronRight size={16} className={`transition-transform duration-300 ${selectedCourse && selectedCourse.id === course.id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                </div>
                <CourseDetail course={course} open={!!selectedCourse && selectedCourse.id === course.id} />
              </div>
            ))}
          </div>
        </RevealOnScroll>

        {/* SUBJUDUL 2: Pendidikan Berjenjang */}
        <RevealOnScroll delay={200} className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-200">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-black text-slate-900 inline-flex items-center tracking-tight border-b-4 border-[#FFDD00] pb-3">
              <Award className="mr-3 text-[#006569]" size={28}/> Pendidikan Berjenjang
            </h3>
            <p className="text-slate-500 mt-3 font-medium text-sm">Jenjang pendidikan kualifikasi komando tingkat provinsi dan nasional.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {pendidikanBerjenjang.map((course) => (
              <div 
                key={course.id}
                onClick={() => toggleCourse(course)}
                role="button"
                tabIndex={0}
                aria-expanded={!!selectedCourse && selectedCourse.id === course.id}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCourse(course); } }}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-[#006569] hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-[#FFDD00] text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      {course.level}
                    </span>
                    <span className="text-xs font-bold text-slate-500 flex items-center">
                      <Clock size={12} className="mr-1 text-[#006569]" /> {course.duration}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-base mb-2 group-hover:text-[#006569] transition-colors">
                    {course.title} - {course.duration}
                  </h4>
                  <p className={`text-slate-600 text-xs font-medium leading-relaxed ${selectedCourse && selectedCourse.id === course.id ? '' : 'line-clamp-3'}`}>
                    {course.desc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-[#006569]">
                  <span>{selectedCourse && selectedCourse.id === course.id ? 'Tutup Detail' : 'Lihat Detail Modul'}</span>
                  <ChevronRight size={16} className={`transition-transform duration-300 ${selectedCourse && selectedCourse.id === course.id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                </div>
                <CourseDetail course={course} open={!!selectedCourse && selectedCourse.id === course.id} />
              </div>
            ))}
          </div>
        </RevealOnScroll>

        {/* SUBJUDUL 3: Pendidikan Berlanjut */}
        <RevealOnScroll delay={300} className="bg-slate-900 text-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-800">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-black text-white inline-flex items-center tracking-tight border-b-4 border-[#006569] pb-3">
              <Target className="mr-3 text-[#FFDD00]" size={28}/> Pendidikan Berlanjut
            </h3>
            <p className="text-slate-400 mt-3 font-medium text-sm">Pendidikan spesialisasi pembinaan mental, keprotokolan, dan intelijen pengamanan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {pendidikanLanjutan.map((course) => (
              <div 
                key={course.id}
                onClick={() => toggleCourse(course)}
                role="button"
                tabIndex={0}
                aria-expanded={!!selectedCourse && selectedCourse.id === course.id}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCourse(course); } }}
                className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 hover:border-[#FFDD00] hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-[#006569] text-[#FFDD00] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-[#FFDD00]/30">
                      {course.level}
                    </span>
                    <span className="text-xs font-bold text-slate-400 flex items-center">
                      <Clock size={12} className="mr-1 text-[#FFDD00]" /> {course.duration}
                    </span>
                  </div>
                  <h4 className="font-black text-white text-base mb-2 group-hover:text-[#FFDD00] transition-colors">
                    {course.title} - {course.duration}
                  </h4>
                  <p className={`text-slate-300 text-xs font-medium leading-relaxed ${selectedCourse && selectedCourse.id === course.id ? '' : 'line-clamp-3'}`}>
                    {course.desc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-700 flex items-center justify-between text-xs font-bold text-[#FFDD00]">
                  <span>{selectedCourse && selectedCourse.id === course.id ? 'Tutup Detail' : 'Lihat Spesialisasi'}</span>
                  <ChevronRight size={16} className={`transition-transform duration-300 ${selectedCourse && selectedCourse.id === course.id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                </div>
                <CourseDetail course={course} open={!!selectedCourse && selectedCourse.id === course.id} dark />
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </div>

    </div>
  );
};

const MakoTab = () => {
  return (
    <div className="bg-slate-100 min-h-screen pb-32 font-sans flex-grow">
      <TabHero title="Markas Komando (MAKO)" subtitle="Pusat Komando & Pelayanan Administrasi Satuan UNJ" icon={<MapPin size={15} />} eyebrow="Markas Komando" />

      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-20 space-y-12">
        <RevealOnScroll delay={200} className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#006569]/10 text-[#006569] rounded-full font-black text-xs uppercase tracking-widest mb-4">
                <MapPin size={16}/> Lokasi Markas Komando
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4">Mako Resimen Mahasiswa UNJ</h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-6">
                Jl. R.Mangun Muka Kampus A UNJ Gedung G R.107, RT.11/RW.14, Rawamangun, Kec. Pulo Gadung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13220
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-700 font-bold text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <Phone className="text-[#006569] shrink-0" size={20} />
                  <span>WhatsApp (Wakil Komandan): <a href="https://wa.me/6281525823503" target="_blank" rel="noopener noreferrer" className="text-[#006569] underline font-black">+62 815-2582-3503</a></span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 font-bold text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <Mail className="text-[#006569] shrink-0" size={20} />
                  <span>Email Satuan: <a href="mailto:unjmenwa@gmail.com" className="text-[#006569] underline font-black">unjmenwa@gmail.com</a></span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 font-bold text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <Clock className="text-[#006569] shrink-0" size={20} />
                  <span>Jam Operasional Piket: Senin - Minggu (08.00 - 22.00 WIB)</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white h-80 bg-slate-200 relative">
              <iframe 
                title="Google Maps Mako Menwa UNJ"
                src="https://maps.google.com/maps?q=Mako%20Menwa%20UNJ%20Universitas%20Negeri%20Jakarta&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                className="w-full h-full border-0"
                allowFullScreen="" 
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
};

const AdministrasiUmumTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('pendaftaran');

  const pendaftaranItems = [
    {
      id: 1,
      title: "Pendaftaran Calon Anggota Angkatan LIII",
      category: "Rekrutmen Camen",
      desc: "Formulir resmi penerimaan Calon Menwa UNJ Angkatan LIII Tahun 2026. Terbuka untuk mahasiswa aktif UNJ.",
      url: "https://bit.ly/PCABMENWA2026",
      status: "Resmi Dibuka",
      statusClass: "bg-emerald-600 text-white",
      ctaText: "Akses Form Pendaftaran Camen"
    },
    {
      id: 2,
      title: "Pendaftaran Lomba Nasional Ksatria Cendekia VIII",
      category: "Giat Perlombaan",
      desc: "Formulir pendaftaran Latihan Integrasi & Kompetisi Pemuda Nusantara Ksatria Cendekia VIII Tahun 2026.",
      url: "/kc",
      status: "Link Resmi",
      statusClass: "bg-[#FFDD00] text-slate-950",
      ctaText: "Lihat Info & Daftar KC VIII"
    },
    {
      id: 3,
      title: "Pendaftaran Lomba Paskibra GERANAT VI",
      category: "Giat Paskibra",
      desc: "Formulir pendaftaran Lomba Formasi Pengibaran Bendera Gerakan Paskibra Semangat VI Tahun 2026.",
      url: "/geranat",
      status: "Link Resmi",
      statusClass: "bg-[#FFDD00] text-slate-950",
      ctaText: "Lihat Info GERANAT"
    }
  ];

  const permohonanItems = [
    {
      id: 1,
      title: "Permohonan Pengajuan Personil",
      category: "Operasional & Satgas",
      desc: "Layanan resmi pengajuan personel satgas pengamanan, protokoler upacara, atau bantuan operasional prajurit Menwa UNJ.",
      url: "https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20mengajukan%20Permohonan%20Pengajuan%20Personil.",
      status: "Siaga Operasional",
      statusClass: "bg-[#006569] text-white",
      ctaText: "Ajukan Permohonan Personil"
    },
    {
      id: 2,
      title: "Permohonan Peminjaman Barang",
      category: "Sarana & Prasarana",
      desc: "Pengajuan resmi peminjaman inventaris perlengkapan lapangan, tenda komando, atau fasilitas Mako Gedung G R.107.",
      url: "https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20mengajukan%20Permohonan%20Peminjaman%20Barang.",
      status: "Siaga Operasional",
      statusClass: "bg-[#006569] text-white",
      ctaText: "Ajukan Peminjaman Barang"
    },
    {
      id: 3,
      title: "Permohonan Pemateri / Instruktur / Narasumber",
      category: "Pendidikan & Pelatihan",
      desc: "Permohonan instruktur PBB, tata upacara, pelatihan kedisiplinan, wawasan kebangsaan, pembentukan karakter, dan survival.",
      url: "https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20mengajukan%20Permohonan%20Pemateri/Instruktur.",
      status: "Siaga Operasional",
      statusClass: "bg-[#006569] text-white",
      ctaText: "Ajukan Pemateri / Instruktur"
    }
  ];

  const kerjasamaItems = [
    {
      id: 1,
      title: "Kerjasama Sponsorship",
      category: "Kemitraan Satuan",
      desc: "Pengajuan proposal kemitraan dukungan sponsorship dana maupun in-kind untuk event nasional dan kegiatan operasional satuan.",
      url: "https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20mengajukan%20Kerjasama%20Sponsorship.",
      status: "Terbuka",
      statusClass: "bg-teal-700 text-white",
      ctaText: "Ajukan Kerjasama Sponsorship"
    },
    {
      id: 2,
      title: "Kerjasama Media Partner",
      category: "Publikasi & Humas",
      desc: "Pengajuan publikasi bersama, eksposur media sosial, dan kemitraan media partner untuk kegiatan event kepemudaan/lomba.",
      url: "https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20mengajukan%20Kerjasama%20Media%20Partner.",
      status: "Terbuka",
      statusClass: "bg-teal-700 text-white",
      ctaText: "Ajukan Media Partner"
    },
    {
      id: 3,
      title: "Kerjasama Partnership",
      category: "Kemitraan Strategis",
      desc: "Kolaborasi strategis antar instansi perguruan tinggi, organisasi kemahasiswaan, kedinasan, maupun lembaga pemerintah.",
      url: "https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20mengajukan%20Kerjasama%20Partnership.",
      status: "Terbuka",
      statusClass: "bg-teal-700 text-white",
      ctaText: "Ajukan Kerjasama Partnership"
    },
    {
      id: 4,
      title: "Kerjasama Kegiatan",
      category: "Giat Kolaborasi",
      desc: "Kolaborasi penyelenggaraan acara bersama, bakti sosial kemanusiaan, pengabdian masyarakat terpadu, & latihan gabungan.",
      url: "https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20mengajukan%20Kerjasama%20Kegiatan.",
      status: "Terbuka",
      statusClass: "bg-teal-700 text-white",
      ctaText: "Ajukan Kerjasama Kegiatan"
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-32 font-sans flex-grow">
      <TabHero title="Administrasi Umum" subtitle="Portal Resmi Pendaftaran, Permohonan Layanan Satuan, & Kerjasama Strategis" icon={<FileText size={15} />} eyebrow="Portal Layanan Terpadu" />

      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-20 space-y-12">
        <div className="flex flex-wrap justify-center gap-3 bg-white/95 backdrop-blur-md p-2.5 rounded-full border border-slate-200 shadow-xl w-fit mx-auto">
          <button 
            onClick={() => setActiveSubTab('pendaftaran')} 
            className={`px-6 py-3.5 rounded-full font-black text-xs md:text-sm uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              activeSubTab === 'pendaftaran' ? 'bg-[#006569] text-[#FFDD00] shadow-lg shadow-[#006569]/40 scale-105' : 'text-slate-600 hover:text-[#006569]'
            }`}
          >
            <Award size={16} /> 1. Pendaftaran
          </button>
          <button 
            onClick={() => setActiveSubTab('permohonan')} 
            className={`px-6 py-3.5 rounded-full font-black text-xs md:text-sm uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              activeSubTab === 'permohonan' ? 'bg-[#006569] text-[#FFDD00] shadow-lg shadow-[#006569]/40 scale-105' : 'text-slate-600 hover:text-[#006569]'
            }`}
          >
            <Briefcase size={16} /> 2. Permohonan
          </button>
          <button 
            onClick={() => setActiveSubTab('kerjasama')} 
            className={`px-6 py-3.5 rounded-full font-black text-xs md:text-sm uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              activeSubTab === 'kerjasama' ? 'bg-[#006569] text-[#FFDD00] shadow-lg shadow-[#006569]/40 scale-105' : 'text-slate-600 hover:text-[#006569]'
            }`}
          >
            <Users size={16} /> 3. Kerjasama
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-14 border border-slate-200">
          {activeSubTab === 'pendaftaran' && (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h3 className="text-2xl md:text-3xl font-black text-slate-900">Formulir & Portal Pendaftaran</h3>
                <p className="text-slate-500 font-medium text-sm mt-2">Pilih tautan pendaftaran di bawah ini untuk menuju ke portal formulir pendaftaran resmi.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pendaftaranItems.map((item) => (
                  <div key={item.id} className="bg-slate-50 rounded-3xl p-6 border border-slate-200 hover:border-[#006569] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#006569] bg-[#006569]/10 px-3 py-1 rounded-full">
                          {item.category}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${item.statusClass}`}>
                          {item.status}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 leading-tight mb-3 group-hover:text-[#006569] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-slate-600 text-xs font-medium leading-relaxed mb-6">
                        {item.desc}
                      </p>
                    </div>

                    <Link
                      to={item.url}
                      className="w-full bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-bold py-3.5 px-4 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                    >
                      <span>{item.ctaText}</span>
                      {/^https?:/.test(item.url) ? <ExternalLink size={14} /> : <ChevronRight size={14} />}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'permohonan' && (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h3 className="text-2xl md:text-3xl font-black text-slate-900">Layanan Permohonan Satuan</h3>
                <p className="text-slate-500 font-medium text-sm mt-2">Pilih jenis permohonan untuk langsung terhubung dengan layanan konfirmasi Piket Mako Menwa UNJ.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {permohonanItems.map((item) => (
                  <div key={item.id} className="bg-slate-50 rounded-3xl p-6 border border-slate-200 hover:border-[#006569] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#006569] bg-[#006569]/10 px-3 py-1 rounded-full">
                          {item.category}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${item.statusClass}`}>
                          {item.status}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 leading-tight mb-3 group-hover:text-[#006569] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-slate-600 text-xs font-medium leading-relaxed mb-6">
                        {item.desc}
                      </p>
                    </div>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-bold py-3.5 px-4 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                    >
                      <span>{item.ctaText}</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'kerjasama' && (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h3 className="text-2xl md:text-3xl font-black text-slate-900">Portal Kemitraan & Kerjasama</h3>
                <p className="text-slate-500 font-medium text-sm mt-2">Pilih opsi kerjasama di bawah ini untuk mengakses pengajuan proposal & koordinasi resmi.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kerjasamaItems.map((item) => (
                  <div key={item.id} className="bg-slate-50 rounded-3xl p-6 border border-slate-200 hover:border-[#006569] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#006569] bg-[#006569]/10 px-3 py-1 rounded-full">
                          {item.category}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${item.statusClass}`}>
                          {item.status}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 leading-tight mb-3 group-hover:text-[#006569] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-slate-600 text-xs font-medium leading-relaxed mb-6">
                        {item.desc}
                      </p>
                    </div>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-bold py-3.5 px-4 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                    >
                      <span>{item.ctaText}</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Footer = SiteFooter;

class AppErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error) { console.error('Menwa UNJ UI error:', error); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16 text-center">
        <div className="max-w-md">
          <div className="mx-auto h-48 w-64"><LaptopMotion /></div>
          <h1 className="mt-4 text-2xl font-black text-slate-900">Ada gangguan koneksi</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">Halaman mengalami kendala saat memuat komponen. Periksa koneksi internet lalu coba lagi.</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-[#006569] px-6 py-3 text-sm font-black text-[#FFDD00]">Muat Ulang</button>
        </div>
      </div>
    );
  }
}

const BootLoader = ({ done }) => {
  useEffect(() => {
    const t = setTimeout(done, 1100);
    return () => clearTimeout(t);
  }, [done]);
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <div className="h-44 w-64"><PlaneMotion /></div>
        <div className="mt-2 text-xs font-black uppercase tracking-[0.35em] text-[#006569]">Menwa UNJ</div>
        <div className="mt-3 h-1 w-28 overflow-hidden rounded-full bg-slate-100"><span className="block h-full w-1/2 animate-pulse rounded-full bg-[#FFDD00]" /></div>
      </div>
    </div>
  );
};

export default function App() {
  const path = useRoute();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const baseTitle = useRef(typeof document !== 'undefined' ? document.title : '');

  // /kc/, /geranat/, ... -> halaman program; selain itu tab biasa
  const youthSub = path.startsWith('/youth-spark/') ? path.split('/')[2] : null;
  const youthRoute = path === '/youth-spark' || !!youthSub;
  const program = youthRoute ? PROGRAMS.find((p) => p.slug === 'youth-spark') : PROGRAMS.find((p) => `/${p.slug}` === path);
  const activeTab = program ? 'program' : (PATH_TABS[path] || 'beranda');
  const [booting, setBooting] = useState(true);

  const handleQuickSearch = (tabId) => {
    setIsMobileMenuOpen(false);
    navigate(TAB_PATHS[tabId] || '/');
  };

  useEffect(() => {
    document.title = program ? `${program.title}${youthSub ? ' — ' + youthSub.replaceAll('-', ' ') : ''} | Menwa UNJ` : baseTitle.current;
  }, [program]);

  if (booting) return <BootLoader done={() => setBooting(false)} />;

  return (
    <AppErrorBoundary>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 selection:bg-[#006569] selection:text-[#FFDD00]">
        <MotionStyles />
        <ScrollProgress />
        <CursorGlow />
        <CursorFollower />

        <Navigation
          activeTab={activeTab}
          handleQuickSearch={handleQuickSearch}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <main className="flex-grow flex flex-col">
          <TabSwitch tabKey={path}>
            {program ? (
              youthRoute ? <YouthSparkPage subSlug={youthSub} /> : <ProgramPage slug={program.slug} />
            ) : (
              <>
                {activeTab === 'beranda' && <BerandaTab />}
                {activeTab === 'struktur' && <StrukturOrganisasiTab onNavigate={handleQuickSearch} />}
                {activeTab === 'pendidikan' && <PendidikanTab />}
                {activeTab === 'mako' && <MakoTab />}
                {activeTab === 'administrasi' && <AdministrasiUmumTab />}
              </>
            )}
          </TabSwitch>
        </main>

        <Footer onOpenLogin={() => setIsLoginModalOpen(true)} />

        <LiveChatWidget />

        {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} />}
      </div>
    </AppErrorBoundary>
  );
}
