# MENWA UNJ Portal V6 — Hero Asli, Pride & Penyempurnaan Visual

**Tanggal revisi:** 18 Oktober 2026  
**Dasar:** ZIP proyek awal `menwa-portal.zip`, V5 `MENWA-UNJ-PORTAL-V5-REVISI-UX-AI.zip`, video rekaman layar pengguna, dan instruksi revisi terakhir.

## Ringkasan

V6 mengembalikan karakter beranda paling awal: **logo Menwa UNJ melayang di tengah hero**, cincin cahaya, efek kursor/parallax, pergerakan halus foto latar, tipografi identitas satuan dan motto. Dua CTA V5 **Jelajahi Pusat Informasi** dan **Kenali Organisasi** tetap ada.

Semua halaman dan konten V5 dipertahankan; perubahan di bawah ini terfokus pada hierarchy, konsistensi estetika, kemudahan pembacaan, ikon, serta komponen detail.

## 1. Beranda — hero pertama dipulihkan

- Mengganti layout hero editorial V5 dengan susunan dan animasi dari komponen hero pertama (`HeroStage`, `HeroLogo`, `Reveal`) yang ditemukan di ZIP asal.
- Efek hero meliputi:
  - logo melayang dan cincin sinar animatif,
  - background foto Kampus UNJ dengan efek Ken Burns,
  - parallax relatif ke kursor saat tersedia,
  - aksen ambient teal/emas,
  - animasi kemunculan saat halaman ditampilkan.
- Dua CTA dipertahankan: `/informasi` dan `/garis-komando`.
- Ditambahkan tautan lembut ke sorotan kegiatan.
- Responsif untuk desktop dan HP; `prefers-reduced-motion` tetap dihormati.

**File:** `src/components/BrandExperience.jsx`, `src/components/BrandExperience.css`.

## 2. Pride — urutan dan warna

- Urutan akhir beranda sekarang: **Hero → Akses Cepat → Sorotan Giat → Program Unggulan → Dokumentasi → Bukan sekadar organisasi/Ruang untuk bertumbuh → Statistik Pride → Footer**.
- Data yang ditampilkan **mengikuti angka yang dikonfirmasi pengguna:**
  - Anggota Aktif **50+** — teal.
  - Prestasi Terdata **150+** — emas.
  - Giat Pengabdian Masyarakat **100+** — ungu.
  - Penyelenggaraan Lomba **30+** — koral.
- Catatan verifikasi angka di bawah kartu telah dihapus atas konfirmasi pengguna.
- Section Pride dan footer menggunakan basis latar gelap yang sama `#020617`; garis pembatas tebal di footer disederhanakan.
- Animasi penghitung angka saat masuk viewport tetap aktif.

**File:** `src/App.jsx`, `src/styles.css`, `src/components/Sections.jsx`.

## 3. Sorotan Giat — latar konsisten

- Latar Sorotan Giat diubah ke warna terang seragam `bg-slate-50`, menyatu dengan Akses Cepat dan Program Unggulan.
- Coverflow dan interaksi geser kegiatan dari versi sebelumnya dipertahankan.

**File:** `src/components/Sections.jsx`, `src/components/BrandExperience.css`.

## 4. Jersey KC VIII — kurangi friksi visual

- Menyingkirkan keterangan teknis yang tidak dibutuhkan di bawah showcase jersey dan di bawah tombol formulir.
- Tiga label ringkas sekarang mencakup:
  - **Motif Waffle yang vintage**
  - **Punggung edisi ATHLETE/OFFICIAL**
  - **Bahan Premium dan Tahan Lama**
- Menghapus kartu **Poster Jersey Peserta/Official** dari galeri detail.
- Masih tersedia preview mockup manekin asli, detail depan, detail belakang dan popup besar yang tombol Tutup-nya tetap terlihat.
- Tautan tetap benar:
  - ATHLETE (pendataan): `https://forms.gle/voyPEgvxvhS8VrKf8`
  - OFFICIAL (Rp150.000, pre-order): `https://forms.gle/RHoXRFTEVKWHQfFx9`

**File:** `src/components/JerseyShowcase.jsx`.

## 5. Chibi chatbot — hover tenang

- Dua chibi asli pengguna tetap dipakai.
- Di keadaan idle tetap ada gerakan lompat kecil dan bergantian.
- **Ketika pointer/fokus tepat di tombol maskot, loop gerakan berhenti sementara**, bukan dipercepat.
- Bubble muncul dengan emoji 😊 dan teks **“Ada yang bisa saya bantu?”**.
- Fungsi membuka asisten, drag posisi, dan ukuran mini dari V5 tidak berubah.

**File:** `src/components/MenwaPet.jsx`, `src/components/MenwaPet.css`.

## 6. Youth Spark — kartu narasumber siap foto transparan

- Judul, subjudul dan deskripsi narasumber sekarang rata tengah.
- Section narasumber menggunakan `bg-slate-50` yang sama dengan section atas dan benefit berikutnya, sehingga tidak terlihat seperti blok warna berbeda.
- Kartu narasumber berisi placeholder **siluet manekin profil tiga-perempat badan transparan**.
- Penataan nama, jabatan dan bidang sekarang rata tengah, dengan animasi hover elevasi halus.
- Untuk memasang foto asli: simpan file PNG/WebP **background transparan** di `public/narasumber/`, lalu tambahkan properti `photo` di masing-masing objek pada `YOUTH_SPARK_SPEAKERS` di `src/data/siteData.js`.
  - Contoh: `photo: '/narasumber/narasumber-1.webp'`
  - Disarankan foto setengah/3/4 badan dengan posisi tegak, ketajaman tinggi, dan bagian bawah tubuh sampai pinggang atau paha untuk kesan editorial.
- Data tiga narasumber dan rundown tidak diubah.

**File:** `src/components/Sections.jsx`, `public/narasumber/speaker-placeholder.svg`, `src/components/BrandExperience.css`.

## 7. Identitas warna ikon program

Komponen `PortalIcon` baru memberikan warna berbeda sesuai jenis informasi:

| Konten | Ikon | Palet |
|---|---|---|
| Ksatria Cendekia VIII | Piala | Kuning keemasan |
| Youth Spark | Cahaya / four-point star | Gradasi biru–ungu–merah muda–emas |
| Gerakan Paskibra Semangat | Bendera | Koral |
| Pengabdian Masyarakat | Kerja sama | Merah muda |
| Pengamanan Kegiatan | Perisai | Hijau |
| Pendidikan dan Pelatihan | Edukasi | Biru |
| Garis Komando | Perisai | Hijau |
| Markas Komando | Lokasi | Koral |
| Administrasi Umum / formulir | Dokumen | Ungu |

Komponen dipakai pada **Program Unggulan**, **Program Lainnya**, **Akses Cepat**, dan **Pusat Informasi**. Warna digunakan sebagai petunjuk visual, bukan sekadar dekorasi.

**File:** `src/components/PortalIcon.jsx`, `src/components/PortalIcon.css`, `src/components/BrandExperience.jsx`, `src/components/Sections.jsx`, `src/data/siteData.js`.

## 8. Markas Komando — akses Administrasi Umum

Di bawah blok **alamat, kontak, dan peta**, tersedia CTA baru:

> **Butuh pengurusan administrasi?**  
> Akses pengajuan surat, permohonan personel, peminjaman perlengkapan, dan kerja sama melalui Administrasi Umum Menwa UNJ.  
> **Buka Administrasi Umum** → `/administrasi`

Tab Administrasi tetap **tidak masuk header global**, sesuai arahan sebelumnya, tetapi mudah ditemukan dari Markas Komando.

**File:** `src/App.jsx`.

## 9. Cara menjalankan dan deploy

1. Ekstrak ZIP hasil V6.
2. Buka terminal pada folder `menwa-unj-portal-v6`.
3. Jalankan:

```bash
npm install
npm run test:source
npm run test:jsx
npm run test:events
npm run test:api
npm run build
npm run dev
```

4. Untuk Vercel: impor repo/folder hasil ekstrak, framework **Vite**, build command `npm run build`, output directory `dist`.
5. Agar AI pencarian serta chatbot bisa mengakses Gemini, pasang `GEMINI_API_KEY` sebagai environment variable **server** di Vercel. Jangan letakkan kunci dalam source frontend.

## 10. Hasil pengujian di lingkungan penyusunan

- `npm run test:source` — **lulus**.
- `npm run test:jsx` — **lulus** (18 file JSX/JS, dengan parser yang hanya dipakai untuk pengujian lokal).
- `npm run test:events` — **lulus**, termasuk perubahan V6.
- `npm run test:api` — **lulus**, termasuk fallback pencarian AI dan pembatasan rute.
- **Build Vite dan inspeksi visual browser penuh belum terverifikasi** di lingkungan penyusunan karena dependensi Vite lengkap tidak tersedia. Jalankan perintah `npm install && npm run build` pada mesin developer atau pada Vercel sebelum publikasi.

## 11. Pemeriksaan publikasi

- Pastikan aset foto narasumber resmi dapat dipakai sebelum mengganti placeholder.
- Pastikan izin publikasi untuk proposal dan juknis pada `public/dokumen/`, terutama dokumen yang memakai penanda **KONFIDENSIAL**.
- Cek desktop dan HP terutama ukuran logo di hero, popup jersey, dan overlay chatbot.
- Pastikan seluruh formulir eksternal masih aktif.

---

**Ringkasan hasil:** V6 menjaga identitas animasi dari portal pertama, namun memakai UX yang lebih rapi dari V5: mudah dicari, elegan, informatif, ramah mobile, dan siap dikembangkan tanpa mengubah struktur inti lagi.
