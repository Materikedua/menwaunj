import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../lib/authContext.jsx';
import { navigate } from '../lib/router.jsx';
import MenwaPet from './MenwaPet.jsx';

export const CHAT_DESTINATIONS = [
  { label: 'Beranda', path: '/', keywords: ['beranda', 'home', 'program', 'kegiatan', 'sorotan'] },
  { label: 'Galeri & Dokumentasi Kegiatan', path: '/gallery', keywords: ['galeri', 'gallery', 'album', 'dokumentasi', 'foto', 'kegiatan', 'arsip'] },
  { label: 'Garis Komando', path: '/garis-komando', keywords: ['struktur', 'komando', 'pimpinan', 'organisasi', 'staf', 'dansat'] },
  { label: 'Pendidikan & Pelatihan', path: '/pendidikan', keywords: ['pendidikan', 'latihan', 'diklat', 'provos', 'dasar satuan', 'diksar'] },
  { label: 'Markas Komando', path: '/mako', keywords: ['mako', 'alamat', 'lokasi', 'kontak', 'piket'] },
  { label: 'Administrasi Umum', path: '/administrasi', keywords: ['administrasi', 'surat', 'permohonan', 'layanan', 'camen'] },
  { label: 'Ksatria Cendekia VIII', path: '/kc', keywords: ['ksatria', 'cendekia', 'kc', 'lomba', 'pendaftaran kc'] },
  { label: 'Youth Spark National', path: '/youth-spark', keywords: ['youth spark', 'youth spark national', 'dispora', 'umkm', 'seminar'] },
  { label: 'Seminar & Webinar Youth Spark', path: '/youth-spark/seminar-webinar', keywords: ['seminar webinar', 'seminar youth spark', 'webinar'] },
  { label: 'Kompetisi Youth Spark', path: '/youth-spark/kompetisi', keywords: ['kompetisi youth spark', 'kompetisi'] },
  { label: 'Game Taktis & Papan Peringkat', path: '/games', keywords: ['game', 'games', 'kuis', 'leaderboard', 'peringkat', 'poin', 'exp', 'tantangan'] },
  { label: 'E-Voting Juara Terfavorit GERANAT', path: '/geranat/voting', keywords: ['voting', 'vote', 'geranat voting', 'juara terfavorit', 'dukung tim', 'e-voting'] },
  { label: 'Portal Official', path: '/portal-peserta', keywords: ['portal official', 'official', 'portal peserta', 'peserta', 'kartu pasukan', 'pemberkasan', 'rekap nilai', 'format penilaian'] },
  { label: 'Uji Samapta & Kebugaran Jasmani', path: '/pendidikan', keywords: ['samapta', 'lari', 'push up', 'sit up', 'pull up', 'fisik', 'kebugaran', 'jasmani'] },
  { label: 'Denah Blueprint Markas Komando', path: '/mako', keywords: ['denah', 'blueprint', 'gedung g', 'pos jaga', 'rute', 'transjakarta', 'lrt'] },
];

const QUICK_PROMPTS = [
  'Bagaimana daftar Camen?',
  'Info lomba KC VIII',
  'Di mana lokasi Mako?',
  'Kurikulum Pendidikan',
];

export const localChatAnswer = (text) => {
  const q = String(text || '').toLowerCase();
  const hit = CHAT_DESTINATIONS.find((d) => d.keywords.some((k) => q.includes(k)));

  if (q.includes('daftar') && (q.includes('camen') || q.includes('anggota'))) {
    return {
      text: 'Pendaftaran Calon Anggota Menwa UNJ (Camen Angkatan LIII) terbuka bagi mahasiswa aktif UNJ melalui portal Administrasi Umum (Adminu).',
      suggestions: [
        { label: 'Buka Pendaftaran di Adminu', path: '/administrasi' },
        { label: 'Pelajari Kurikulum Pendidikan', path: '/pendidikan' },
      ],
    };
  }

  if (q.includes('daftar') && q.includes('kc')) {
    return {
      text: 'Untuk pendaftaran Ksatria Cendekia VIII, silakan buka halaman Ksatria Cendekia agar informasi juknis, jersey, dan pendaftaran dapat dilihat dari satu halaman.',
      suggestions: [{ label: 'Buka Ksatria Cendekia VIII', path: '/kc' }],
    };
  }

  if (q.includes('youth spark')) {
    return {
      text: 'Youth Spark National mewadahi pengetahuan dan minat bakat pemuda melalui Seminar & Webinar, Kompetisi, dan Pelatihan Pelatih.',
      suggestions: [
        { label: 'Buka Youth Spark National', path: '/youth-spark' },
        { label: 'Buka Seminar & Webinar', path: '/youth-spark/seminar-webinar' },
      ],
    };
  }

  if (hit) {
    return {
      text: `Saya dapat mengarahkan kamu langsung ke halaman ${hit.label}.`,
      suggestions: [{ label: `Buka ${hit.label}`, path: hit.path }],
    };
  }

  return {
    text: 'Saya dapat membantu mencari informasi Menwa UNJ dan mengarahkan kamu ke halaman yang tepat. Coba tanyakan tentang pendaftaran Camen, KC VIII, Youth Spark, lokasi Mako, atau pendidikan satuan.',
    suggestions: CHAT_DESTINATIONS.slice(0, 5).map((d) => ({ label: d.label, path: d.path })),
  };
};

export function LiveChatWidget() {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Komando! Saya Asisten Menwa UNJ. Tanyakan seputar kegiatan, pendidikan, struktur komando, Mako, administrasi, atau pendaftaran.',
      sender: 'admin',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [petOffset, setPetOffset] = useState({ x: 0, y: 0 });
  const [petDragging, setPetDragging] = useState(false);
  const petStart = useRef(null);
  const petWasDragged = useRef(false);

  const handleStartNewSession = () => {
    setMessages([
      {
        id: Date.now(),
        text: `Komando, ${profile?.displayName?.split(' ')[0] || 'Rekan'}! Sesi obrolan baru dimulai. Ada yang bisa saya bantu seputar kegiatan, administrasi, atau pelatihan Menwa UNJ?`,
        sender: 'admin',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const beginPetDrag = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    petWasDragged.current = false;
    petStart.current = { x: event.clientX, y: event.clientY, origin: petOffset };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const movePet = (event) => {
    if (!petStart.current) return;
    const dx = event.clientX - petStart.current.x;
    const dy = event.clientY - petStart.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 7) {
      petWasDragged.current = true;
      setPetDragging(true);
    }
    if (!petWasDragged.current) return;
    const maxLeft = Math.max(0, window.innerWidth - 100);
    const maxUp = Math.max(0, window.innerHeight - 115);
    setPetOffset({
      x: Math.max(-maxLeft, Math.min(0, petStart.current.origin.x + dx)),
      y: Math.max(-maxUp, Math.min(0, petStart.current.origin.y + dy)),
    });
  };

  const endPetDrag = () => {
    petStart.current = null;
    setPetDragging(false);
  };

  const clickPet = () => {
    if (petWasDragged.current) {
      petWasDragged.current = false;
      return;
    }
    setIsOpen((wasOpen) => !wasOpen);
    setPetOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const ask = async (text) => {
    const q = String(text || '').trim();
    if (!q || loading) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { id: Date.now(), text: q, sender: 'user', time: nowTime }]);
    setInputMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q }),
      });
      if (!res.ok) throw new Error('Chat endpoint unavailable');
      const data = await res.json();
      const answerText = data.text || localChatAnswer(q).text;
      const suggestions = data.suggestions || localChatAnswer(q).suggestions;
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: answerText, sender: 'admin', suggestions, time: nowTime },
      ]);
    } catch {
      const fallback = localChatAnswer(q);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: fallback.text, sender: 'admin', suggestions: fallback.suggestions, time: nowTime },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-3 right-3 z-[100] flex flex-col items-end font-sans sm:bottom-4 sm:right-5">
      <div
        className={`mb-1 overflow-hidden flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all duration-500 origin-bottom-right relative ${
          isOpen
            ? 'scale-100 opacity-100 w-[min(400px,calc(100vw-1.5rem))] h-[min(560px,calc(100dvh-115px))]'
            : 'scale-0 opacity-0 w-0 h-0 pointer-events-none'
        }`}
      >
        {/* Header Widget */}
        <div className="bg-gradient-to-r from-[#006569] via-[#004d50] to-[#00383b] p-3.5 sm:p-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white rounded-full p-1 shrink-0">
              <img src="/logo-menwa-unj.png" className="w-full h-full object-contain" alt="Menwa UNJ" />
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm">Asisten Menwa UNJ</h4>
              <p className="text-[10px] text-[#FFDD00] font-bold flex items-center gap-1">
                <span>Navigasi Cepat Portal Satuan</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleStartNewSession}
              className="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 text-[11px] font-bold bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              title="Mulai Percakapan Baru"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 text-white cursor-pointer"
              aria-label="Tutup chat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick Prompts Bar */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <Sparkles size={13} className="text-[#006569] shrink-0" />
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => ask(prompt)}
              disabled={loading}
              className="whitespace-nowrap rounded-full bg-white border border-slate-200 hover:border-[#006569] px-2.5 py-1 text-[10px] font-bold text-slate-700 hover:text-[#006569] transition shrink-0 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 min-h-0 bg-slate-50 p-4 overflow-y-auto flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[90%] ${
                msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div
                className={`p-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#006569] text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none font-medium'
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === 'admin' && msg.suggestions?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.suggestions.map((s) => (
                    <button
                      key={s.path}
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        navigate(s.path);
                      }}
                      className="rounded-full border border-[#006569]/25 bg-[#006569]/10 px-3 py-1.5 text-[11px] font-black text-[#006569] hover:bg-[#006569] hover:text-white transition cursor-pointer"
                    >
                      {s.label} →
                    </button>
                  ))}
                </div>
              )}
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
            </div>
          ))}
          {loading && (
            <div className="self-start rounded-2xl rounded-bl-none border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-500">
              Asisten sedang menyiapkan informasi…
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Field */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(inputMessage);
          }}
          className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center shrink-0"
        >
          <input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ketik pertanyaan seputar Menwa UNJ…"
            className="flex-grow bg-slate-100 text-slate-900 rounded-full px-4 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#006569] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            aria-label="Kirim pesan"
            className="w-10 h-10 bg-[#006569] disabled:bg-slate-300 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm cursor-pointer"
          >
            <Send size={18} className="ml-0.5" />
          </button>
        </form>
      </div>

      <div
        className="menwa-pet-drag-anchor"
        style={{ transform: `translate3d(${petOffset.x}px,${petOffset.y}px,0)` }}
      >
        <button
          type="button"
          onClick={clickPet}
          onPointerDown={beginPetDrag}
          onPointerMove={movePet}
          onPointerUp={endPetDrag}
          onPointerCancel={endPetDrag}
          onLostPointerCapture={endPetDrag}
          className={`menwa-pet-trigger ${petDragging ? 'is-dragging' : ''}`}
          aria-label={isOpen ? 'Tutup Asisten Menwa UNJ' : 'Buka Asisten Menwa UNJ, maskot dapat digeser'}
          aria-expanded={isOpen}
          title="Klik untuk bantuan cepat • geser untuk memindahkan maskot"
        >
          <span className="menwa-pet-label">{isOpen ? 'Tutup chat' : 'Tanya Minwa!'}</span>
          <span className="menwa-pet-glow" aria-hidden="true" />
          <MenwaPet />
        </button>
      </div>
    </div>
  );
}
