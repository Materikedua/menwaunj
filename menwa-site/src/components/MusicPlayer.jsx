// MusicPlayer.jsx — pemutar musik Menwa UNJ
//  • Tombol di ujung kanan atas navbar: Play/Pause cepat + tombol pembuka panel.
//  • Panel ala Spotify: visual album, judul track, previous / play / next, progres, volume, daftar lagu.
//  • Mencoba memutar otomatis saat web dibuka. Browser memblokir suara otomatis sebelum pengguna
//    berinteraksi, jadi bila diblokir, musik mulai pada klik/ketukan PERTAMA di mana saja.
//  • Bila pengguna menekan pause, musik tidak akan dinyalakan lagi oleh sistem.
//  Daftar lagu, judul, dan warna diatur di siteData.js (MUSIC).
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music2, X, Volume2, VolumeX } from 'lucide-react';
import { MUSIC } from '../data/siteData';

const mod = (a, n) => ((a % n) + n) % n;
const fmt = (s) => {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};
const KEY = 'menwa:music';
const readSaved = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
};

const Styles = () => (
  <style>{`
    @keyframes mu-eq { from { transform: scaleY(.25); } to { transform: scaleY(1); } }
    @keyframes mu-vinyl { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .mu-range { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 999px; outline: none; cursor: pointer; }
    .mu-range::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #FFDD00; border: 0; }
    .mu-range::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; background: #FFDD00; border: 0; }
    @media (prefers-reduced-motion: reduce) { .mu-anim { animation: none !important; } }
  `}</style>
);

const Eq = ({ playing }) => (
  <span className="flex h-4 items-end gap-[2px]" aria-hidden>
    {[0, 1, 2, 3].map((i) => (
      <span
        key={i}
        className="mu-anim block h-full w-[3px] rounded-full bg-[#FFDD00]"
        style={{
          transformOrigin: 'bottom',
          transform: 'scaleY(.35)',
          animation: playing ? `mu-eq ${700 + i * 130}ms ease-in-out ${i * 90}ms infinite alternate` : 'none',
        }}
      />
    ))}
  </span>
);

/** Visual album: sampul + piringan hitam yang berputar saat lagu diputar */
const Album = ({ track, playing }) => (
  <div className="relative h-44 w-44">
    <div
      className="mu-anim absolute -right-9 top-3 h-40 w-40 rounded-full shadow-xl"
      style={{
        background: 'repeating-radial-gradient(circle at center, #0a0a0a 0 2px, #1d1d1d 2px 4px)',
        animation: playing ? 'mu-vinyl 5s linear infinite' : 'none',
      }}
    >
      <div className="absolute inset-[34%] rounded-full" style={{ background: `linear-gradient(135deg, ${track.from}, ${track.to})` }}>
        <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
      </div>
    </div>
    <div
      className="relative h-44 w-44 overflow-hidden rounded-2xl"
      style={{ background: `linear-gradient(135deg, ${track.from}, ${track.to})`, boxShadow: `0 18px 40px -12px ${track.to}aa` }}
    >
      <div className="absolute inset-0 opacity-30" style={{ background: 'repeating-radial-gradient(circle at 25% 125%, transparent 0 14px, rgba(255,255,255,.4) 14px 15px)' }} />
      <span className="absolute bottom-3 left-3 text-4xl font-black uppercase tracking-tight text-white/90 drop-shadow">{track.title}</span>
      {track.cover && (
        <img
          src={track.cover} alt="" draggable={false}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  </div>
);

/** Deretan batang visualizer (animasi CSS, ringan) */
const Bars = ({ playing, color }) => (
  <div className="flex h-7 items-end justify-center gap-[3px]" aria-hidden>
    {Array.from({ length: 28 }).map((_, i) => (
      <span
        key={i}
        className="mu-anim block h-full w-[4px] rounded-full"
        style={{
          background: color,
          opacity: 0.85,
          transformOrigin: 'bottom',
          transform: 'scaleY(.18)',
          animation: playing ? `mu-eq ${480 + ((i * 53) % 9) * 70}ms ease-in-out ${(i * 37) % 400}ms infinite alternate` : 'none',
        }}
      />
    ))}
  </div>
);

export const MusicPlayer = () => {
  const tracks = MUSIC.tracks;
  const n = tracks.length;
  const rootRef = useRef(null);
  const audioRef = useRef(null);
  const wantPlay = useRef(!!MUSIC.autoplay);

  const [idx, setIdx] = useState(() => {
    const s = readSaved();
    return Number.isInteger(s.idx) && s.idx >= 0 && s.idx < n ? s.idx : 0;
  });
  const [vol, setVol] = useState(() => {
    const s = readSaved();
    return typeof s.vol === 'number' ? s.vol : MUSIC.volume;
  });
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [err, setErr] = useState('');
  const track = tracks[idx];

  const tryPlay = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return false;
    try {
      await a.play();
      setBlocked(false);
      setErr('');
      return true;
    } catch (e) {
      if (e && e.name === 'NotAllowedError') setBlocked(true);
      else if (e && e.name === 'NotSupportedError') setErr('missing');
      return false;
    }
  }, []);

  // Ganti lagu -> putar otomatis bila pengguna tidak sedang menjeda
  useEffect(() => {
    setErr('');
    setCur(0);
    setDur(0);
    if (wantPlay.current) tryPlay();
  }, [idx, tryPlay]);

  // Autoplay diblokir -> mulai pada interaksi pertama di luar pemutar
  useEffect(() => {
    if (!blocked) return undefined;
    const start = (e) => {
      if (rootRef.current && rootRef.current.contains(e.target)) return; // tombol pemutar menangani dirinya sendiri
      if (wantPlay.current) tryPlay();
    };
    const evs = ['pointerdown', 'touchend', 'click', 'keydown'];
    evs.forEach((ev) => window.addEventListener(ev, start, true));
    return () => evs.forEach((ev) => window.removeEventListener(ev, start, true));
  }, [blocked, tryPlay]);

  // Volume + simpan pilihan
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = vol;
    try { localStorage.setItem(KEY, JSON.stringify({ idx, vol })); } catch { /* abaikan */ }
  }, [vol, idx]);

  // Tutup panel: klik di luar / Escape
  useEffect(() => {
    if (!open) return undefined;
    const out = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', out);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', out); document.removeEventListener('keydown', esc); };
  }, [open]);

  const toggle = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { wantPlay.current = true; await tryPlay(); }
    else { wantPlay.current = false; a.pause(); }
  }, [tryPlay]);

  const step = useCallback((d) => { wantPlay.current = true; setIdx((i) => mod(i + d, n)); }, [n]);
  const prev = useCallback(() => {
    const a = audioRef.current;
    if (a && a.currentTime > 3) a.currentTime = 0; else step(-1);
  }, [step]);
  const select = (i) => { if (i === idx) toggle(); else { wantPlay.current = true; setIdx(i); } };

  // Kontrol layar kunci / tombol media
  useEffect(() => {
    if (!('mediaSession' in navigator) || typeof window.MediaMetadata === 'undefined') return;
    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: track.title, artist: track.artist, album: 'Menwa UNJ',
        artwork: track.cover ? [{ src: track.cover, sizes: '512x512', type: 'image/jpeg' }] : [],
      });
      navigator.mediaSession.setActionHandler('play', () => { wantPlay.current = true; tryPlay(); });
      navigator.mediaSession.setActionHandler('pause', () => { wantPlay.current = false; audioRef.current && audioRef.current.pause(); });
      navigator.mediaSession.setActionHandler('previoustrack', prev);
      navigator.mediaSession.setActionHandler('nexttrack', () => step(1));
    } catch { /* tidak didukung */ }
  }, [idx, track, tryPlay, prev, step]);

  const a11yToggle = playing ? 'Jeda musik' : 'Putar musik';

  return (
    <div ref={rootRef} className="static flex items-center gap-2 sm:relative" data-ui="music-player">
      <Styles />
      <audio
        ref={audioRef}
        src={track.file}
        preload="auto"
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onEnded={() => step(1)}
        onError={() => { setErr('missing'); setPlaying(false); }}
      />

      {/* Play / Pause cepat */}
      <button
        type="button" onClick={toggle} aria-label={a11yToggle} title={a11yToggle}
        className="relative hidden h-10 w-10 place-items-center rounded-full bg-[#FFDD00] text-[#00383b] shadow-lg transition hover:scale-105 sm:grid"
      >
        {blocked && !playing && wantPlay.current && (
          <span className="mu-anim absolute inset-0 animate-ping rounded-full bg-[#FFDD00]/60" aria-hidden />
        )}
        {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
      </button>

      {/* Buka panel */}
      <button
        type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Buka pemutar musik" title="Pemutar musik"
        className={`flex h-10 items-center gap-2 rounded-full border px-3 text-xs font-black uppercase tracking-wider text-white backdrop-blur transition ${
          open ? 'border-[#FFDD00]/70 bg-white/20' : 'border-white/15 bg-white/10 hover:border-[#FFDD00]/60'
        }`}
      >
        {playing ? <Eq playing /> : <Music2 size={16} className="text-[#FFDD00]" />}
        <span className="hidden max-w-[84px] truncate xl:inline">{track.title}</span>
      </button>

      {/* Petunjuk saat autoplay diblokir browser */}
      {blocked && !playing && !open && wantPlay.current && (
        <div className="pointer-events-none absolute right-3 top-full mt-2 w-max max-w-[230px] sm:right-0 sm:mt-3 rounded-xl border border-white/10 bg-slate-900/95 px-3 py-2 text-[11px] font-semibold leading-snug text-slate-200 shadow-xl">
          Ketuk di mana saja untuk memutar musik
        </div>
      )}

      {open && (
        <div
          role="dialog" aria-label="Pemutar musik"
          className="absolute inset-x-3 top-full z-[70] mt-2 max-h-[calc(100dvh-104px)] overflow-y-auto overscroll-contain rounded-3xl sm:inset-x-auto sm:right-0 sm:mt-3 sm:w-[360px] border border-white/10 text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,.9)]"
          style={{ backgroundColor: '#0b1220', backgroundImage: `linear-gradient(180deg, ${track.from} 0%, #0b1220 64%)` }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/70">Sedang diputar</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Tutup pemutar" className="rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 flex justify-center pr-6"><Album track={track} playing={playing} /></div>
            <div className="mt-5"><Bars playing={playing} color={track.to} /></div>

            <div className="mt-4 min-w-0">
              <h3 className="truncate text-2xl font-black leading-tight">{track.title}</h3>
              <p className="truncate text-sm text-white/60">{track.artist}</p>
              {err && (
                <p className="mt-2 rounded-lg bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-200">
                  File {track.file.split('/').pop()} belum ditemukan. Taruh di folder public/musik/.
                </p>
              )}
              {blocked && !playing && !err && (
                <p className="mt-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white/80">
                  Browser menahan suara otomatis. Tekan tombol putar untuk memulai.
                </p>
              )}
            </div>

            <div className="mt-4">
              <input
                type="range" min={0} max={dur || 0} step={0.1} value={Math.min(cur, dur || 0)}
                onChange={(e) => { const v = Number(e.target.value); if (audioRef.current) audioRef.current.currentTime = v; setCur(v); }}
                aria-label="Posisi lagu" className="mu-range w-full"
                style={{ background: `linear-gradient(to right, #FFDD00 ${dur ? (cur / dur) * 100 : 0}%, rgba(255,255,255,.2) 0)` }}
              />
              <div className="mt-1.5 flex justify-between text-[11px] font-semibold tabular-nums text-white/60"><span>{fmt(cur)}</span><span>{fmt(dur)}</span></div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-7">
              <button type="button" onClick={prev} aria-label="Lagu sebelumnya" className="text-white/80 transition hover:scale-110 hover:text-white"><SkipBack size={26} fill="currentColor" /></button>
              <button
                type="button" onClick={toggle} aria-label={a11yToggle}
                className="grid h-14 w-14 place-items-center rounded-full bg-[#FFDD00] text-[#00383b] shadow-lg transition hover:scale-105"
              >
                {playing ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" className="ml-1" />}
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Lagu berikutnya" className="text-white/80 transition hover:scale-110 hover:text-white"><SkipForward size={26} fill="currentColor" /></button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button type="button" onClick={() => setVol((v) => (v > 0 ? 0 : MUSIC.volume))} aria-label={vol > 0 ? 'Bisukan' : 'Nyalakan suara'} className="text-white/70 hover:text-white">
                {vol > 0 ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <input
                type="range" min={0} max={1} step={0.01} value={vol} onChange={(e) => setVol(Number(e.target.value))}
                aria-label="Volume" className="mu-range w-full"
                style={{ background: `linear-gradient(to right, #FFDD00 ${vol * 100}%, rgba(255,255,255,.2) 0)` }}
              />
            </div>
          </div>

          <ul className="border-t border-white/10 bg-black/30 p-2" aria-label="Pilihan lagu">
            {tracks.map((t, i) => (
              <li key={t.id}>
                <button
                  type="button" onClick={() => select(i)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${i === idx ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <span className="h-9 w-9 shrink-0 rounded-lg" style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }} />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-black ${i === idx ? 'text-[#FFDD00]' : 'text-white'}`}>{t.title}</span>
                    <span className="block truncate text-xs text-white/50">{t.artist}</span>
                  </span>
                  {i === idx && <Eq playing={playing} />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
