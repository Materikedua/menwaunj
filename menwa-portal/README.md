# Portal Komando Resimen Mahasiswa UNJ (v4)

Sudah di-build & ditest lokal, **sukses tanpa error**.

## Perubahan dari panduan v4 yang saya terapkan

Semua sesuai `PANDUAN-v4.md`, **kecuali satu hal atas permintaan Anda**:

- **Sorotan Giat**: tampilan coverflow dari panduan (kartu tengah besar, kartu samping miring) saya pertahankan, tapi interaksinya diganti total — **tidak auto-geser, tidak statis**. Geser sekarang murni manual: klik/tap-tahan lalu seret kursor (di HP cukup swipe biasa). Lepas tahan, kartu otomatis merapat (snap) ke posisi terdekat. Ada kartu "Lihat Semua" di ujung yang menuju Instagram. Komponen `HighlightCoverflow` di `src/components/Sections.jsx`.

Semua bagian lain (Footer dengan 5 logo mitra, sosial media YouTube/Instagram/Facebook/TikTok, statistik baru, Garis Komando "FISH / Geografi", header subtab pakai foto beranda, header & timeline KC lengkap) mengikuti panduan v4 apa adanya.

## Struktur

```
src/
  App.jsx                  <- shell halaman, navbar, semua tab
  components/MenwaUI.jsx   <- animasi, navbar, hero (tidak berubah dari v3)
  components/Sections.jsx  <- Program Unggulan, Kegiatan Terbaru, Sorotan Giat (kartu), Footer, subtab
  data/siteData.js         <- SATU-SATUNYA FILE YANG PERLU DIEDIT untuk konten
  lib/router.jsx           <- router ringan tanpa dependency
scripts/
  prepare-images.mjs       <- rename + convert + kompres gambar kegiatan
public/
  logo-menwa-unj.png       <- belum ada, taruh file aslinya
  logo-kc-viii.png         <- belum ada, logo KC untuk header /kc/
  foto-kampus-unj.jpg      <- belum ada, foto hero beranda + semua subtab
  mitra/unj.png, dispora.png, kesbangpol.png, konas.png  <- belum ada, logo "Didukung oleh"
  dokumen/proposal-kc-viii-menwa-unj.pdf  <- belum ada, untuk tombol "Unduh PDF" di /kc/
  kegiatan/                <- hasil scripts/prepare-images.mjs
gambar-mentah/              <- taruh foto mentah di sini sebelum menjalankan scripts/prepare-images.mjs
```

> Belum ada satu pun file gambar/PDF di atas yang saya terima sebagai lampiran, jadi semuanya masih placeholder (fallback gradien hijau / pill disembunyikan / tombol unduh tidak tampil). Website tetap jalan normal tanpa file-file ini.

## Jalankan lokal

```bash
npm install
npm run dev
```

## Siapkan gambar kegiatan

```bash
npm i -D sharp
# taruh foto mentah di folder gambar-mentah/
npm run images
```

## Edit konten (tanpa sentuh kode)

Semua ada di **`src/data/siteData.js`**. Lihat `PANDUAN-v4.md` untuk detail tiap bagian, termasuk 5 poin "perlu kamu isi/cek" (logo Skomen, juknis PDF, dasar timeline KC, dsb).

## Deploy ke Vercel

Push ke GitHub → import di vercel.com/new, atau `vercel` CLI. `vercel.json` sudah disiapkan supaya `/kc/` dan subtab lain tidak 404 saat dibuka/di-refresh langsung.
