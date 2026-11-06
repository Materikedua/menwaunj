// wrap-photo.mjs — membungkus FOTO ASLI (jpg/png) menjadi file .svg untuk Garis Komando.
// Pakai (dari folder proyek):
//   npm i -D sharp
//   node scripts/wrap-photo.mjs "Eben Haezer Sitorus" ./foto-mentah/eben.jpg
// Hasil: public/struktur/eben-haezer-sitorus.svg  (foto dipotong persegi 400x400 dan ditanam di dalam SVG)
// Banyak foto sekaligus: node scripts/wrap-photo.mjs --map scripts/foto-map.json
//   isi foto-map.json:  { "Eben Haezer Sitorus": "./foto-mentah/eben.jpg", "Raffli Syahputra": "./foto-mentah/raffli.png" }
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { slugify } from '../src/lib/foto.js';

const OUT = 'public/struktur';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function wrap(name, file) {
  const buf = await sharp(file).rotate().resize(400, 400, { fit: 'cover', position: 'attention' }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img" aria-label="${esc(name)}">
<title>${esc(name)}</title>
<image href="data:image/jpeg;base64,${buf.toString('base64')}" width="400" height="400" preserveAspectRatio="xMidYMid slice"/>
</svg>
`;
  fs.mkdirSync(OUT, { recursive: true });
  const out = path.join(OUT, `${slugify(name)}.svg`);
  fs.writeFileSync(out, svg);
  console.log(`OK  ${name}  ->  ${out}  (${Math.round(svg.length / 1024)} KB)`);
}

const args = process.argv.slice(2);
if (args[0] === '--map') {
  const map = JSON.parse(fs.readFileSync(args[1], 'utf8'));
  for (const [name, file] of Object.entries(map)) await wrap(name, file);
} else if (args.length === 2) {
  await wrap(args[0], args[1]);
} else {
  console.log('Pakai: node scripts/wrap-photo.mjs "Nama Lengkap" ./foto.jpg\n   atau: node scripts/wrap-photo.mjs --map scripts/foto-map.json');
  process.exit(1);
}
