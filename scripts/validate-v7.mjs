// Pemeriksaan regresi ringan untuk revisi V7. Tidak membutuhkan dependensi npm.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const app = read('src/App.jsx');
const brand = read('src/components/BrandExperience.jsx');
const css = read('src/components/BrandExperience.css');
const router = read('src/lib/router.jsx');

assert.match(app, /Flame, ArrowRight, Search as SearchIcon/, 'Mako membutuhkan ArrowRight dari lucide-react');
assert.match(app, /const MakoTab\s*=\s*\(\)\s*=>/, 'Komponen MakoTab harus tersedia');
assert.match(app, /<Link to="\/administrasi"/, 'Tautan administrasi di halaman Mako wajib ada');
assert.match(router, /mako:\s*'\/mako'/, 'Alamat /mako adalah route tab yang benar');
assert.match(brand, /KOMANDO RESIMEN MAHASISWA<\/span><span>JAYAKARTA/, 'Headline beranda wajib dua baris khusus');
assert.match(brand, /brand-legacy-motto/, 'Motto memakai kelas responsif khusus');
assert.match(css, /\.brand-legacy-motto\s*\{[^}]*white-space:\s*nowrap/s, 'Motto satu baris pada desktop');
assert.match(css, /\.brand-legacy-inner \.brand-legacy-scroll\s*\{[^}]*position:\s*static/s, 'Cue Sorotan tidak boleh absolute di atas tombol');
assert.match(css, /\.brand-hub-head::before\s*\{[^}]*foto-kampus-unj\.jpg/s, 'Header Pusat Informasi harus memakai foto hero Plaza UNJ');
assert.ok(fs.existsSync(path.join(root, 'public/foto-kampus-unj.jpg')), 'Aset foto Plaza UNJ harus tersedia');
assert.match(app, /\(now-start\)\/4700/, 'Durasi counter Pride seharusnya 4,7 detik');
assert.match(app, /threshold:\.58/, 'Counter Pride mulai setelah kartu cukup terlihat');
assert.doesNotMatch(app, />Ada gangguan koneksi<\/h1>/, 'Error runtime tidak boleh disamakan dengan gangguan koneksi');
console.log('V7 regression checks passed: Mako routing, hero layout, foto informasi, dan Pride.');
