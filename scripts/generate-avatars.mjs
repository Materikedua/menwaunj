// generate-avatars.mjs — membuat foto avatar .svg untuk setiap nama di scripts/people.json
// Pakai:  node scripts/generate-avatars.mjs          (tambah nama baru di scripts/people.json lalu jalankan lagi)
//         node scripts/generate-avatars.mjs --force  (timpa semua)
// Hasil:  public/struktur/<nama-slug>.svg
//
// CATATAN: ini avatar netral (siluet berbaret ungu + papan nama inisial), BUKAN foto asli.
// Untuk memasang foto asli, lihat scripts/wrap-photo.mjs (membungkus foto menjadi .svg).
import fs from 'node:fs';
import path from 'node:path';
import { slugify, initials } from '../src/lib/foto.js';

const OUT = 'public/struktur';
const people = JSON.parse(fs.readFileSync('scripts/people.json', 'utf8'));
fs.mkdirSync(OUT, { recursive: true });

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// warna latar per kelompok
const THEME = {
  pimpinan:       { c1: '#00383b', c2: '#0a7a7f', uni: '#06292b' },
  unsurPerencana: { c1: '#0f4c5c', c2: '#2a8c9f', uni: '#0b3541' },
  unsurPelayanan: { c1: '#1e3a5f', c2: '#4a7fb8', uni: '#152a45' },
  unsurPelaksana: { c1: '#14532d', c2: '#2f9e57', uni: '#0d3a1f' },
  anggota:        { c1: '#1e293b', c2: '#64748b', uni: '#111827' },
};

// jumlah balok emas di pundak sesuai jabatan
const bars = (role, group) => {
  if (group === 'pimpinan') return 3;
  if (/^(Wa |Wakil Komandan Pokok)/i.test(role)) return 1;
  if (/^(Kaur|Kepala|Komandan Pokok)/i.test(role)) return 2;
  return 0;
};

const epaulette = (cx, rot, n) => {
  let g = `<g transform="rotate(${rot} ${cx} 338)"><rect x="${cx - 30}" y="326" width="60" height="26" rx="5" fill="#0b1a1c" opacity=".55"/>`;
  for (let i = 0; i < n; i++) g += `<rect x="${cx - 24 + i * 17}" y="331" width="11" height="16" rx="2" fill="#FFDD00"/>`;
  return g + '</g>';
};

const avatar = ({ name, role, group }) => {
  const g = group === 'unsurPelaksana' && /Anggota/i.test(role) ? 'anggota' : group;
  const t = THEME[g] || THEME.anggota;
  const n = bars(role, g);
  const ini = esc(initials(name).toUpperCase());
  const id = slugify(name);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img" aria-label="${esc(name)}">
<title>${esc(name)} — ${esc(role)}</title>
<defs>
<linearGradient id="bg-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.c1}"/><stop offset="1" stop-color="${t.c2}"/></linearGradient>
<linearGradient id="hd-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eaf2f3"/><stop offset="1" stop-color="#c7d8da"/></linearGradient>
</defs>
<rect width="400" height="400" fill="url(#bg-${id})"/>
<circle cx="200" cy="175" r="190" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="2"/>
<circle cx="200" cy="175" r="135" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="2"/>
<g transform="translate(200 372) scale(1.12) translate(-200 -372)">
<path d="M24 400C24 318 100 276 200 276s176 42 176 124z" fill="${t.uni}"/>
<path d="M158 278 200 352 242 278 200 296z" fill="#e8eef0" opacity=".92"/>
<path d="M200 296 190 352h20z" fill="#FFDD00" opacity=".9"/>
<rect x="172" y="232" width="56" height="58" rx="26" fill="#b9cccf"/>
<ellipse cx="200" cy="172" rx="66" ry="78" fill="url(#hd-${id})"/>
<path d="M120 154C118 84 162 58 214 60c50 2 78 40 68 94-34-26-124-30-162 0z" fill="#5b21b6"/>
<path d="M120 154c40-30 130-26 162 0" fill="none" stroke="#3b0f85" stroke-width="6" stroke-linecap="round"/>
<circle cx="252" cy="70" r="8" fill="#3b0f85"/>
<path d="m172 128 5.5 11 12 1.8-8.7 8.4 2 12-10.8-5.7-10.8 5.7 2-12-8.7-8.4 12-1.8z" fill="#FFDD00" transform="translate(-6 -22) scale(.9)"/>
${n ? epaulette(86, -14, n) + epaulette(314, 14, n) : ''}
</g>
<rect x="226" y="340" width="76" height="32" rx="7" fill="#000" opacity=".4"/>
<text x="264" y="363" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="21" font-weight="800" fill="#FFDD00" letter-spacing="1">${ini}</text>
</svg>
`;
};

// File yang sudah ada TIDAK ditimpa (supaya foto asli yang sudah dipasang aman). Tambah --force untuk menimpa semua.
const force = process.argv.includes('--force');
let count = 0;
let skipped = 0;
for (const p of people) {
  const file = path.join(OUT, `${slugify(p.name)}.svg`);
  if (fs.existsSync(file) && !force) { skipped++; continue; }
  fs.writeFileSync(file, avatar(p));
  count++;
}
console.log(`${count} avatar dibuat di ${OUT}/` + (skipped ? `, ${skipped} dilewati karena sudah ada (pakai --force untuk menimpa)` : ''));
