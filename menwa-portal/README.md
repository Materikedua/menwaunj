# Portal Komando Resimen Mahasiswa UNJ (v3)

Sudah di-build & ditest lokal, **sukses tanpa error**.

## Struktur

```
src/
  App.jsx                  <- shell halaman, navbar, semua tab
  components/MenwaUI.jsx   <- animasi, navbar, hero (jangan diedit kalau tidak perlu)
  components/Sections.jsx  <- Program Unggulan, Kegiatan Terbaru, Sorotan Giat, Footer, halaman /kc/ dst.
  data/siteData.js         <- SATU-SATUNYA FILE YANG PERLU DIEDIT untuk ubah konten/kegiatan
  lib/router.jsx           <- router ringan tanpa dependency (URL /kc/, /garis-komando/, dst.)
scripts/
  prepare-images.mjs       <- rename + convert + kompres gambar kegiatan
public/
  logo-menwa-unj.png       <- taruh file aslinya di sini (belum ada)
  foto-kampus-unj.jpg      <- foto hero kampus (belum ada)
  kegiatan/                <- hasil scripts/prepare-images.mjs
  mitra/                   <- logo pill "Didukung oleh" (opsional)
gambar-mentah/             <- taruh foto mentah di sini sebelum menjalankan scripts/prepare-images.mjs
```

> Catatan: `router.js` dari panduan di-rename jadi **`router.jsx`** di project ini karena isinya memakai JSX (komponen `Link`) — Vite mewajibkan file berisi JSX berekstensi `.jsx`. Semua `import ... from '../lib/router'` tetap jalan tanpa perlu diubah karena Vite otomatis mencari `.jsx`.

## Jalankan lokal

```bash
npm install
npm run dev
```

## Siapkan gambar kegiatan

```bash
npm i -D sharp
# taruh foto mentah (apa adanya, nama file bebas) di folder gambar-mentah/
npm run images
```

Script akan:
- rename 4 foto yang sudah dikenali (lihat `MAP` di `scripts/prepare-images.mjs`)
- konversi ke `.jpg`, perkecil ke lebar maks 1600px, kompres kualitas 82
- mencetak daftar gambar yang masih kurang

Kalau gambar belum ada sama sekali, website **tidak rusak** — kartu kegiatan otomatis tampil dengan blok gradien hijau + label kategori.

## Edit konten (tanpa sentuh kode)

Semua ada di **`src/data/siteData.js`**: identitas & kontak (`SITE`), 6 program unggulan (`PROGRAMS`), daftar kegiatan (`KEGIATAN`). Lihat `PANDUAN-v3.md` untuk detail lengkap tiap bagian.

## Deploy ke Vercel

Push ke GitHub → import di vercel.com/new (otomatis kenali Vite), atau `vercel` CLI. File `vercel.json` sudah disiapkan supaya URL langsung seperti `/kc/` atau `/garis-komando/` tidak 404 saat dibuka langsung atau di-refresh.

Kalau pindah ke hosting statis yang tidak mendukung rewrite (mis. GitHub Pages), buka `src/lib/router.jsx` dan ganti `MODE = 'hash'` — URL berubah jadi `situsmu.com/#/kc/` dan jalan di mana saja tanpa pengaturan tambahan.
