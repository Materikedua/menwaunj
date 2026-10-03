# Portal Komando Resimen Mahasiswa UNJ

Sudah di-build & ditest lokal, **sukses tanpa error** (MenwaUI v2 — tanpa tilt 3D, efek kursor ringan).

## Jalankan lokal

```bash
npm install
npm run dev
```

## Deploy ke Vercel

Push ke GitHub lalu import di vercel.com/new (Vercel otomatis kenali Vite), atau pakai `vercel` CLI.

## Catatan v2

- Hero sekarang pakai `HeroStage` dengan foto latar. Taruh file **`foto-kampus-unj.jpg`** di folder `public/` (landscape, ≥1920px, <500KB). Kalau belum ada, otomatis fallback ke gradasi hijau gelap — tidak error.
- Semua kartu (`TiltCard`+`Spotlight` versi lama) sudah diganti `HoverCard` — efeknya kartu terangkat sedikit + cahaya emas ikut kursor, tanpa kemiringan 3D.
- Ditambah `CursorGlow` (cahaya global ikut kursor) dan `CursorFollower` (titik + cincin kecil). Otomatis mati di HP/tablet dan saat user mengaktifkan "reduce motion". Kalau mengganggu, cukup hapus dua baris itu dari `App()`.
- Logo `logo-menwa-unj.png` juga tetap pakai fallback placeholder kalau belum ada file aslinya.
