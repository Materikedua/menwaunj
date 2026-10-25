# MENWA UNJ — Portal Resmi V7

Website organisasi dan pusat sumber informasi Menwa UNJ berbasis React + Vite.

## Jalankan

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Dokumentasi

- [Pembaruan V5 dan panduan lengkap](PEMBARUAN-V5-REVISI-UX-AI.md)
- [Riwayat V4](PEMBARUAN-V4-BRANDING-INFORMASI.md)

## AI

`/api/search` dan `/api/chat` berbagi `GEMINI_API_KEY` milik server. Gunakan `.env.example` sebagai referensi variabel lingkungan. Jangan menaruh kunci pada kode browser.

## Deployment

Vercel: framework Vite, build `npm run build`, output `dist`.

Sebelum mempublikasikan PDF di `public/dokumen/`, pastikan izin publikasi dari pengurus karena juknis sumber ditandai KONFIDENSIAL.

## Pembaruan V6

Panduan perubahan visual, hierarki, tata letak, akses admin, dan asset narasumber ada pada **`PEMBARUAN-V6-HERO-PRIDE-VISUAL.md`**.

## Pembaruan V7

Perbaikan error `/mako/`, posisi tautan Sorotan Giat, format judul hero dan motto, header Pusat Informasi, serta animasi statistik Pride dijelaskan pada **`PEMBARUAN-V7-MAKO-HERO-PRIDE.md`**. Jalankan `npm run test:v7` untuk regresi tanpa dependensi eksternal.
