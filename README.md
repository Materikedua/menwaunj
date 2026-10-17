# MENWA UNJ — Portal Resmi V7

Website organisasi dan pusat sumber informasi Menwa UNJ berbasis React + Vite.

## Command OS — tahap 1 lokal

Command Center tersedia di `/command-center` ketika menjalankan server pengembangan. Fondasi ini memakai **Node 24**, database SQLite persisten lokal, akun individual, serta peran editor/penyetuju/admin. Tidak ada akun bawaan. Buat akun pengurus dan penyetuju berbeda melalui `npm run command:user -- create-user --username nama --name "Nama Pengurus" --role editor`; kata sandi diminta secara tersembunyi. Lihat [panduan operasi](docs/command-os/operations.md) untuk akun penyetuju, lokasi database, backup dan alur lengkap.

Lingkup yang bekerja secara lokal: perintah perubahan empat tautan pendaftaran → pratinjau → persetujuan pengurus lain → publikasi data → tombol portal lokal diperbarui → audit dan permintaan pemulihan. Parser terbatas bersifat deterministik; integrasi model eksekutor belum dibuat. Database berada di `.command-os/command.sqlite`, di luar direktori publik dan dikecualikan dari Git.

**Produksi belum diaktifkan.** Build frontend tidak menyediakan backend SQLite produksi. API Command OS pada Vercel menolak operasi dengan status `503` sampai adapter database/auth terkelola diterapkan dan diverifikasi. Portal memakai tautan sumber jika registri tidak tersedia. Jangan mengunggah database lokal atau arsip rahasia ke `public/` maupun deployment.

Dokumen pengembangan: [audit](docs/command-os/audit.md), [inventaris konten/aset](docs/command-os/content-inventory.md), [arsitektur, skema dan backlog](docs/command-os/architecture.md), [migrasi produksi](docs/command-os/migration.md), [bukti pengujian dan keterbatasan](docs/command-os/verification.md), serta [catatan perubahan](CHANGELOG.md).

## Jalankan

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Jalankan `npm run test:command` untuk acceptance tests registri dan `npm test` untuk seluruh validasi serta build. Pengujian layanan memakai database terisolasi.

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
