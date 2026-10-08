// foto.js — alamat foto anggota Garis Komando.
// Aturan: public/struktur/<nama-huruf-kecil-dengan-strip>.svg
//   "Eben Haezer Sitorus"  ->  /struktur/eben-haezer-sitorus.svg
import { FOTO_DIR, FOTO_EXT } from '../data/siteData.js';

export const slugify = (name) =>
  String(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const fotoUrl = (name) => `${FOTO_DIR}${slugify(name)}.${FOTO_EXT}`;

export const initials = (name) => {
  const w = String(name).trim().split(/\s+/);
  return ((w[0] || '')[0] || '') + (w.length > 1 ? (w[w.length - 1][0] || '') : '');
};
