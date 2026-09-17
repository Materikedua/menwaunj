# Portal Komando Resimen Mahasiswa UNJ

Project React + Vite + Tailwind, sudah dicoba di-build lokal dan **berhasil tanpa error**.

## Jalankan di lokal (opsional, untuk cek dulu)

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Deploy ke Vercel

### Cara A — lewat GitHub (paling gampang)

1. Buat repo baru di GitHub, lalu push folder ini:
   ```bash
   git init
   git add .
   git commit -m "Portal Komando Menwa UNJ"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```
2. Buka https://vercel.com/new, pilih **Import Git Repository**, pilih repo tadi.
3. Vercel otomatis mendeteksi **Framework Preset: Vite** dengan:
   - Build Command: `npm run build` (atau `vite build`)
   - Output Directory: `dist`
   Biarkan default itu, klik **Deploy**.

### Cara B — lewat Vercel CLI (tanpa GitHub)

```bash
npm install -g vercel
cd menwa-portal
vercel
```
Ikuti prompt-nya (pilih scope, nama project, dsb). Untuk deploy ke production:
```bash
vercel --prod
```

## Catatan penting supaya tidak error di Vercel

- File komponen sengaja disimpan sebagai `App.jsx` (bukan `.tsx`) karena kode aslinya memakai parameter tanpa tipe (mis. `({ children, className })`) — kalau dipaksa jadi TypeScript dengan mode strict, Vercel akan gagal build karena "implicit any". Sebagai `.jsx` murni, ini tidak jadi masalah.
- Pastikan Node.js version di Vercel Project Settings ≥ 18 (default Vercel sekarang sudah 20/22, aman).
- Logo `logo-menwa-unj.png` belum ada file aslinya — kalau tidak ditemukan, otomatis fallback ke placeholder image (sudah ada `onError` handler). Kalau punya file logo asli, taruh di folder `public/` dengan nama persis `logo-menwa-unj.png`.
- Jangan commit folder `node_modules` atau `dist` (sudah diatur di `.gitignore`).
