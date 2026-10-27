# MENWA UNJ Portal V7 — Perbaikan Mako, Hero, dan Statistik Pride

## Ringkasan

V7 adalah perbaikan terarah atas V6. Bagian website lain (KC VIII, Youth Spark, formulir jersey, chatbot chibi, navigasi AI, dan Administrasi Umum) dipertahankan.

## Yang diperbaiki

### 1. Kontak & Markas tidak lagi memunculkan error akibat ikon yang belum diimpor

- **Akar masalah ditemukan di `src/App.jsx`**: komponen `MakoTab` menampilkan tombol “Buka Administrasi Umum” memakai ikon React `<ArrowRight />`, tetapi `ArrowRight` tidak diimpor dari `lucide-react`.
- Ini menimbulkan **error JavaScript saat render**, bukan kesalahan URL atau koneksi internet.
- URL **`/mako/` memang rute yang benar** dalam router. Tidak perlu mengubahnya menjadi `/<nama-lain>/`.
- `ArrowRight` sudah ditambahkan pada daftar impor.
- Pesan error umum diganti dari “Ada gangguan koneksi” menjadi **“Halaman tidak dapat ditampilkan”**, dengan keterangan yang sesuai apabila error render terjadi lagi.

### 2. Perbaikan hero beranda — penempatan tombol dan tautan Sorotan

- Tombol **“Jelajahi Pusat Informasi”** dan **“Kenali Organisasi”** tetap dipertahankan.
- Tautan kecil **“Lihat sorotan kegiatan”** yang sebelumnya bertabrakan dengan tombol kini berada **di bawah tombol**, mengikuti alur layout normal, dan tetap mengarah ke `#sorotan-giat`.
- Spasi vertikal hero diberi ruang lebih aman untuk berbagai ukuran layar.

### 3. Judul hero dan motto

- Judul hero dipisahkan menjadi **dua baris eksplisit**:

  ```text
  KOMANDO RESIMEN MAHASISWA
  JAYAKARTA
  ```

- Motto **“Penyempurnaan Pengabdian dengan Ilmu Pengetahuan dan Ilmu Olah Keprajuritan.”** ditampilkan satu baris pada layar desktop yang memadai. Pada layar ponsel, teks tetap boleh membungkus untuk mencegah overflow.
- Logo dan animasi hero asli (parallax, cincin cahaya, gerak melayang) tetap dipertahankan.

### 4. Foto latar header Pusat Informasi

- Header `/informasi` kini menampilkan foto Plaza UNJ yang sama dengan hero beranda: `/foto-kampus-unj.jpg`.
- Lapisan blur dan gelap halus mempertahankan keterbacaan judul, deskripsi, dan kolom pencarian AI.

### 5. Statistik Pride — animasi lebih lambat

- Durasi perhitungan meningkat dari **1,9 detik ke 4,7 detik**.
- Animasi baru dimulai saat sekitar **58% kartu** terlihat, sehingga hitungan masih berlangsung ketika pengguna tiba di area statistik.
- Nilai dan warna multiwarna dari V6 **tidak diubah**.
- Pengaturan `prefers-reduced-motion` tetap dihormati: pengguna yang mengurangi animasi langsung melihat angka akhir.

## Daftar file yang berubah

- `src/App.jsx`
- `src/components/BrandExperience.jsx`
- `src/components/BrandExperience.css`
- `scripts/validate-v7.mjs` (baru)
- `package.json`
- `README.md`
- `PEMBARUAN-V7-MAKO-HERO-PRIDE.md` (baru)

## Pengujian dan batasan

Berhasil dijalankan:

- `npm run test:source` — pemeriksaan referensi berkas dan source.
- Pemeriksaan sintaks JavaScript/JSX melalui parser TypeScript yang tersedia di lingkungan kerja: **18 file, 0 error parse**.
- `npm run test:events` — konsistensi konten organisasi dan kegiatan.
- `npm run test:api` — sintaks API dan fallback navigasi AI.
- `npm run test:v7` — tes regresi impor ikon Mako, rute `/mako`, hero, latar Pusat Informasi, dan tempo Pride.

**Belum berhasil dijalankan:** build Vite dan pengujian tampilan browser secara penuh. Instalasi npm di lingkungan pembuat paket gagal, sehingga hasil tampilan perlu dikonfirmasi setelah `npm install` dan `npm run build` berhasil pada komputer pengguna/Vercel. Tidak ada klaim bahwa semua halaman telah diuji secara visual.

## Jalankan di komputer

Di direktori hasil ekstraksi:

```bash
npm install
npm run test:v7
npm run build
npm run dev
```

Buka situs lokal pada alamat yang tertera di terminal (umumnya `http://localhost:5173`).

## Yang perlu dicek setelah pembaruan

1. Buka `/mako/` melalui menu **Kontak & Markas** dan tombol **Buka Administrasi Umum**.
2. Buka beranda: lihat judul dua baris, motto desktop satu baris, dan jarak aman antara dua tombol dan tautan Sorotan.
3. Buka `/informasi/` dan periksa foto header Plaza UNJ.
4. Gulir ke statistik Pride dan periksa durasi hitungan sekitar 4–5 detik.
5. Uji di desktop dan HP, terutama setelah ukuran browser diperkecil.

**Catatan keamanan yang tidak berubah:** pastikan izin publikasi proposal/juknis jika dokumen tersebut tetap disimpan di folder `public/dokumen/`, khususnya materi yang diberi label `KONFIDENSIAL`.
