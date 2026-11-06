// prepare-images.mjs — rename, konversi ke JPG, dan kompres gambar kegiatan.
//
// Cara pakai (dari folder proyek):
//   1. npm i -D sharp
//   2. taruh semua foto/poster mentah di folder  gambar-mentah/
//   3. node scripts/prepare-images.mjs
// Hasil: public/kegiatan/[nama]-menwa-unj.jpg  (lebar maks 1600px, kualitas 82)
//
// Aturan nama:
//   - File yang namanya ada di MAP di bawah -> dinamai ulang sesuai MAP
//   - File yang sudah bernama  xxx-menwa-unj.(png|jpg|jpeg|webp) -> hanya dikonversi
//   - Selain itu dilewati, dan dicatat supaya kamu tinggal menambah barisnya di MAP
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { expectedImages } from '../src/data/siteData.js';

const IN_DIR = 'gambar-mentah';
const OUT_DIR = 'public/kegiatan';

// nama lama (persis, huruf besar/kecil diabaikan)  ->  nama baru tanpa ekstensi
const MAP = {
  'FLYER OPREC 2026.png': 'oprec-menwa-unj',
  '3X1 KC VIII.jpg': 'kc-menwa-unj',
  'posterkc-menwa-unj.jpg': 'kc-menwa-unj',
  'CS GERANAT VII.jpg': 'geranat-menwa-unj',
  'Menwa UNJ_Pengabdian Cianjur.jpg': 'pengabdian-menwa-unj',
  // Tambahkan foto lain di sini, contoh:
  // 'IMG_2031.jpeg': 'kds-menwa-unj',
  // 'foto seminar.png': 'seminar-menwa-unj',
};

const lowerMap = Object.fromEntries(Object.entries(MAP).map(([k, v]) => [k.toLowerCase(), v]));
const IMG_EXT = /\.(png|jpe?g|webp|heic|avif)$/i;

if (!fs.existsSync(IN_DIR)) {
  console.error(`Folder "${IN_DIR}" belum ada. Buat folder itu lalu taruh foto mentah di dalamnya.`);
  process.exit(1);
}
fs.mkdirSync(OUT_DIR, { recursive: true });

const done = new Set();
const skipped = [];

for (const file of fs.readdirSync(IN_DIR)) {
  if (!IMG_EXT.test(file)) continue;
  const stem = file.replace(IMG_EXT, '');
  let target = lowerMap[file.toLowerCase()];
  if (!target && /-menwa-unj$/i.test(stem)) target = stem.toLowerCase();
  if (!target) { skipped.push(file); continue; }

  const outFile = path.join(OUT_DIR, `${target}.jpg`);
  await sharp(path.join(IN_DIR, file))
    .rotate()                                   // hormati orientasi dari HP
    .resize({ width: 1600, withoutEnlargement: true })
    .flatten({ background: '#ffffff' })         // PNG transparan -> latar putih
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(outFile);

  const kb = Math.round(fs.statSync(outFile).size / 1024);
  console.log(`OK  ${file}  ->  ${outFile}  (${kb} KB)`);
  done.add(target);
}

if (skipped.length) {
  console.log('\nDilewati (belum ada di MAP dan namanya belum berformat xxx-menwa-unj):');
  skipped.forEach((f) => console.log('  - ' + f));
}

const missing = expectedImages.filter((n) => !fs.existsSync(path.join(OUT_DIR, `${n}.jpg`)));
console.log(
  missing.length
    ? `\nGambar yang dipakai website tapi belum ada di ${OUT_DIR}/:\n` + missing.map((n) => `  - ${n}.jpg`).join('\n')
    : '\nSemua gambar yang dipakai website sudah tersedia.'
);
