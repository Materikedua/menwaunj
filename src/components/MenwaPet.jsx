import React from 'react';
import './MenwaPet.css';

/** Duo chibi asli referensi pengguna. Animasi mini idle + reaksi senyum saat hover. */
export default function MenwaPet() {
  return <span className="menwa-mini-pets" aria-hidden="true">
    <span className="menwa-mini-pets__floor" />
    <span className="menwa-mini-pets__one"><img src="/mascot/chibi-menwa-boy.webp" alt="" draggable="false" /></span>
    <span className="menwa-mini-pets__two"><img src="/mascot/chibi-menwa-girl.webp" alt="" draggable="false" /></span>
    <span className="menwa-mini-pets__bubble">😊 <span>Ada yang bisa saya bantu?</span></span>
  </span>;
}
