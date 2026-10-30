/**
 * tactileAudio.js
 * Generator audio haptic prosedural via Web Audio API
 * Menghasilkan sensasi klik mekanik keycap 3D autentik tanpa dependensi file eksternal
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isTactileAudioMuted() {
  try {
    return localStorage.getItem('menwa_tactile_audio_muted') === 'true';
  } catch {
    return false;
  }
}

export function setTactileAudioMuted(muted) {
  try {
    localStorage.setItem('menwa_tactile_audio_muted', muted ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('menwa-audio-mute-change', { detail: { muted } }));
  } catch {
    /* ignore */
  }
}

export function playTactileClick(type = 'click') {
  try {
    if (isTactileAudioMuted()) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'press') {
      // Sensasi tombol ditekan ke bawah (keycap depression)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.032);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.032);
    } else if (type === 'release') {
      // Sensasi tombol membal ke atas (keycap release)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(560, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.028);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);
    } else if (type === 'success') {
      // Umpan balik keberhasilan / aksi selesai
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.05);
      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    } else if (type === 'pill') {
      // Sentuhan halus pada tab pill navigasi
      osc.type = 'sine';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.025);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
    } else {
      // Klik standar 3D tactile button
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.03);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + (type === 'success' ? 0.16 : 0.035));
  } catch {
    // Abaikan jika browser membatasi audio sebelum interaksi pengguna
  }
}

// Alias export for interoperability
export const playTactileSound = playTactileClick;
