// MusicPlayer.jsx — tombol musik di pojok kanan atas + panel mini ala Spotify.
// Taruh 3 file audio di public/audio/: jazz.mp3, pop.mp3, rock.mp3
import React, { useEffect, useRef, useState } from 'react';
import { Music2, Play, Pause, SkipBack, SkipForward, X } from 'lucide-react';

const TRACKS = [
  { id: 'jazz', title: 'Jazz Santai', artist: 'Instrumental', src: '/audio/jazz.mp3' },
  { id: 'pop', title: 'Pop Ceria', artist: 'Instrumental', src: '/audio/pop.mp3' },
  { id: 'rock', title: 'Rock Semangat', artist: 'Instrumental', src: '/audio/rock.mp3' },
];

export const MusicPlayer = () => {
  const audioRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const [blocked, setBlocked] = useState(false); // autoplay diblokir browser, tunggu interaksi

  const track = TRACKS[index];

  // Coba autoplay begitu masuk web. Kalau browser menolak (kebijakan autoplay),
  // tunggu sentuhan/klik pertama di halaman lalu mulai otomatis.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const tryPlay = () => {
      el.play().then(() => setPlaying(true)).catch(() => setBlocked(true));
    };
    tryPlay();
    const onFirstInteract = () => {
      if (!playing) tryPlay();
      window.removeEventListener('pointerdown', onFirstInteract);
      window.removeEventListener('keydown', onFirstInteract);
    };
    window.addEventListener('pointerdown', onFirstInteract, { once: true });
    window.addEventListener('keydown', onFirstInteract, { once: true });
    return () => {
      window.removeEventListener('pointerdown', onFirstInteract);
      window.removeEventListener('keydown', onFirstInteract);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ganti track -> auto play track baru kalau sedang playing
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.load();
    if (playing) el.play().catch(() => {});
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) { el.pause(); setPlaying(false); }
    else { el.play().then(() => setPlaying(true)).catch(() => setBlocked(true)); }
  };
  const next = () => setIndex((i) => (i + 1) % TRACKS.length);
  const prev = () => setIndex((i) => (i - 1 + TRACKS.length) % TRACKS.length);

  return (
    <div className="relative z-[200] select-none">
      <audio ref={audioRef} src={track.src} loop={false} onEnded={next} />

      {/* Tombol bulat kanan atas */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={playing ? 'Buka pemutar musik (sedang main)' : 'Buka pemutar musik'}
        className={`relative grid h-11 w-11 place-items-center rounded-full border shadow-lg backdrop-blur transition-colors ${
          open ? 'border-[#FFDD00] bg-[#006569] text-[#FFDD00]' : 'border-white/15 bg-slate-950/80 text-white hover:border-[#FFDD00]/60'
        }`}
      >
        <Music2 size={18} className={playing ? 'animate-pulse' : ''} />
        {playing && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#FFDD00] ring-2 ring-slate-950" />
        )}
      </button>

      {/* Panel mini ala Spotify — ringkas, tidak memanjang ke bawah */}
      {open && (
        <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3 p-3">
            {/* Visual album: kotak gradien + ikon not, muter pelan saat playing */}
            <div
              className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#006569] to-[#FFDD00] shadow-inner ${playing ? 'mu-float' : ''}`}
              style={{ animationDuration: '3s' }}
            >
              <Music2 size={22} className="text-slate-950" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-white">{track.title}</p>
              <p className="truncate text-xs font-semibold text-slate-400">{track.artist}</p>
              {blocked && !playing && (
                <p className="mt-0.5 text-[10px] font-bold text-[#FFDD00]">Ketuk mana saja untuk mulai</p>
              )}
            </div>

            <button
              type="button" onClick={() => setOpen(false)} aria-label="Tutup"
              className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center justify-center gap-5 border-t border-white/10 px-4 py-2.5">
            <button type="button" onClick={prev} aria-label="Sebelumnya" className="text-slate-300 hover:text-[#FFDD00] transition-colors">
              <SkipBack size={18} />
            </button>
            <button
              type="button" onClick={togglePlay} aria-label={playing ? 'Jeda' : 'Putar'}
              className="grid h-9 w-9 place-items-center rounded-full bg-[#FFDD00] text-[#00383b] shadow-md transition-transform hover:scale-105"
            >
              {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
            <button type="button" onClick={next} aria-label="Berikutnya" className="text-slate-300 hover:text-[#FFDD00] transition-colors">
              <SkipForward size={18} />
            </button>
          </div>

          {/* Pilih track cepat */}
          <div className="flex gap-1.5 border-t border-white/10 p-2">
            {TRACKS.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`flex-1 truncate rounded-lg px-2 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
                  i === index ? 'bg-[#006569] text-[#FFDD00]' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {t.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
