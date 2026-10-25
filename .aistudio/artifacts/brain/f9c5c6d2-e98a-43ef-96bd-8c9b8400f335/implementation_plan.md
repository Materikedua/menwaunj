# Rencana Implementasi: GitHub Repo & Vercel Deployment (Vite SPA)

Dokumen ini menguraikan tahapan untuk menghubungkan proyek **MENWA UNJ Portal V8** ke GitHub dan mengonfigurasi otomatisasi deployment ke Vercel melalui integrasi Git.

---

## 1. Analisis Kebutuhan & Arsitektur
- **Frontend Framework**: React 19 + Vite SPA.
- **Routing**: Client-side history routing (`/`, `/kc`, `/geranat`, `/geranat/voting`, `/youth-spark`, `/garis-komando`, `/mako`, `/pendidikan`, `/administrasi`, `/games`, `/mako-ops`, `/portal-peserta`).
- **Serverless API**: Endpoint `/api/verify-payment.js` dan `/api/chat.js`.
- **Integrasi Vercel**: Vercel Git Integration membaca repository GitHub secara otomatis, menjalankan `npm run build`, dan menyajikan folder output `dist/`.

---

## 2. Tahapan Eksekusi

### Langkah 1: Konfigurasi `vercel.json`
Membuat file konfigurasi `vercel.json` di root direktori dengan spesifikasi:
- Build command: `npm run build`
- Output directory: `dist`
- Rewrites: Memetakan seluruh rute client-side ke `/index.html` dan mempertahankan rute serverless `/api/(.*)`.
- Header keamanan & caching yang optimal untuk aset `.svg`, gambar, dan font.

### Langkah 2: Audit File `.gitignore`
Memastikan file-file sensitif dan dependensi lokal diabaikan:
- `node_modules/`, `dist/`, `.env`, `.env.local`
- File konfigurasi lokal yang tidak boleh terekspos

### Langkah 3: Inisialisasi Git & Commit Awal
1. Menjalankan `git init` dan menyetel branch default ke `main`.
2. Melakukan staging seluruh file kode sumber, aset, dan konfigurasi.
3. Membuat commit rilis versi produksi: `feat: release MENWA UNJ Portal V8 (Vite SPA & Mako Command Center)`.

### Langkah 4: Skrip & Panduan Penghubung ke GitHub
Menyediakan skrip shell interaktif `scripts/push-to-github.sh`:
- Memungkinkan pengguna memasukkan URL repository GitHub (HTTPS atau SSH):
  `git remote add origin <URL_REPO_GITHUB>`
  `git push -u origin main`
- Panduan 1-klik untuk menghubungkan repository GitHub ke dashboard Vercel (**Import Project** -> **Deploy**).

### Langkah 5: Verifikasi Build Produksi
- Menjalankan `npm run build` dan `compile_applet` untuk memastikan kompilasi bundel produksi Vite berhasil 100% tanpa kendala sebelum di-push.
