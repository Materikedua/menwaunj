# Panduan v4: Coverflow, Footer Logo, Subtab KC Lengkap

Panduan ini menggantikan v2 dan v3. Folder `menwa-site/` sudah berisi semuanya: timpa `src/` proyekmu dan salin isi `public/`.

## 1. Isi paket

```
vercel.json                         <- agar /kc/ bisa dibuka langsung di Vercel (wajib)
src/App.jsx                         <- sudah dipatch dari App.jsx milikmu
src/components/MenwaUI.jsx          <- animasi, navbar, hero
src/components/Sections.jsx         <- program, kegiatan, coverflow, footer, subtab
src/data/siteData.js                <- SATU file untuk edit konten
src/lib/router.js                   <- URL /kc/, /geranat/, ...
scripts/prepare-images.mjs          <- rename + konversi jpg + kompres
public/
  logo-kc-viii.png                  <- logo KC (latar sudah transparan), dipakai di header /kc/
  mitra/unj.png dispora.png kesbangpol.png konas.png
  dokumen/proposal-kc-viii-menwa-unj.pdf
  kegiatan/kc-menwa-unj.jpg         <- dari posterkc-menwa-unj.jpg, sudah dikompres
```

## 2. Yang berubah

| Permintaan | Hasil |
|---|---|
| Carousel seperti screenshot | `HighlightCoverflow`: kartu tengah besar, kartu samping miring. Otomatis berganti tiap 4,5 detik, berhenti saat kursor di atasnya. Bisa digeser (swipe), panah kiri/kanan, titik, dan klik kartu samping. Klik kartu tengah membuka subtab atau postingan. |
| Footer "Didukung oleh" | Teks diganti logo UNJ, Dispora, Kesbangpol, Konas, Skomen di pill putih (logo berwarna penuh). Logo UNJ dan Kesbangpol sudah saya bersihkan latarnya. |
| Statistik | Prestasi Terdata 150+, Giat Pengabdian 100+, Penyelenggara Lomba 30+ (Anggota Aktif tetap 50+). |
| Sosial media | YouTube, Instagram (Menwa UNJ, Ksatria Cendekia, Geranat), Facebook, dan TikTok di footer. |
| Garis Komando | Komandan Satuan menampilkan "FISH / Geografi" sebagai ganti NBP. |
| Header semua subtab | Memakai foto hero beranda (`HERO_PHOTO` di `siteData.js`), blur dan overlay sama dengan beranda. |
| Header KC | Logo Ksatria Cendekia VIII di sisi kanan (melayang halus, bergeser pelan mengikuti kursor), plus lencana hijau "Pendaftaran dibuka sampai 15 Oktober 2026". |
| Timeline KC | 7 tahap dengan tanggal, mengikuti poster dan dilengkapi proposal (lihat bagian 4). |
| Proposal dan juknis | Kartu "Dokumen Resmi" di halaman `/kc/`: tombol Unduh PDF (proposal) dan tombol Google Drive (proposal dan juknis). |
| Informasi KC | Mata Lomba, Rangkaian Kegiatan, Persyaratan Umum, dan Benefit (dari poster). Biaya, ukuran tim, dan kuota di bagian fakta. |

## 3. Yang perlu kamu isi atau cek

1. **`public/foto-kampus-unj.jpg`**: foto bersama di UNJ untuk hero beranda dan semua subtab. File ini belum ada di paket karena belum kamu kirim. Sebelum ada, header tampil gradasi hijau gelap.
2. **Logo "Skomen"**: saya belum menerima file logonya. Sementara slot kelima memakai logo satuan (`/logo-menwa-unj.png`). Kalau Skomen adalah logo lain, taruh di `public/mitra/skomen.png` lalu ubah satu baris di `SITE.partners` (`siteData.js`, sudah ada komentarnya).
3. **Juknis PDF (opsional)**: saat ini tombol juknis membuka folder Drive. Untuk unduhan langsung, taruh PDF di `public/dokumen/juknis-kc-viii-menwa-unj.pdf` lalu isi `file: '/dokumen/juknis-kc-viii-menwa-unj.pdf'` pada dokumen juknis di `PROGRAMS` (slug `kc`).
4. **Foto kegiatan lain**: seminar, pam, diklat, kds, anjangsana, hutri, studibanding, aftermovie-kc, geranat, pengabdian, oprec (nama `xxx-menwa-unj.jpg`). Jalankan `node scripts/prepare-images.mjs` seperti di panduan sebelumnya. Poster KC milikmu sudah dipetakan ke `kc-menwa-unj`.
5. **`vercel.json`** harus ikut di-deploy (sudah ada di folder ini).

## 4. Dasar timeline KC (silakan dicek)

| Tahap | Tanggal | Sumber |
|---|---|---|
| Pendaftaran | 18 Sep – 15 Okt 2026 | Poster; jam 08.00–22.00 dan opsi daring dari proposal |
| Pengumpulan Karya | 1 – 23 Okt 2026 | Poster; batas 22.00 WIB dari proposal |
| Technical Meeting (daring) | 17 Okt 2026 | Poster |
| Pengumuman Finalis Karya | 30 Okt 2026 | Proposal |
| Daftar Ulang | 5 Nov 2026 | Proposal |
| Pelaksanaan | 6 – 8 Nov 2026 | Poster dan proposal |
| Pengumuman Pemenang | 7 – 8 Nov 2026 | Proposal (rundown) |

Tiga tahap terakhir sebelum Pelaksanaan (Pengumuman Finalis, Daftar Ulang) dan Pengumuman Pemenang tidak ada di poster, hanya di proposal. Hapus barisnya di `timeline` (slug `kc`) bila ingin persis seperti poster.

## 5. Catatan sebelum proposal dipublikasikan

- PDF proposal memuat **NIM dan nama seluruh panitia (Lampiran 1)** serta tanda tangan pada lembar pengesahan. Kalau tidak ingin itu terbuka untuk umum, ekspor versi tanpa lampiran tersebut lalu ganti file `proposal-kc-viii-menwa-unj.pdf`.
- Ada ketidakkonsistenan di proposal: bagian Lomba Esai menyebut sepuluh tim lanjut presentasi, Lampiran 4 menyebut lima tim. Di website saya tidak menyebut jumlahnya.
- Tautan "Panduan Video Kreatif" di Lampiran 4 berakhiran `KCVII` (edisi sebelumnya?), sedangkan lainnya `KCVIII`. Tautan itu tidak saya pasang di website.
- Poster menulis link pendaftaran `menwaunj.vercel.app` (alamat website ini), sedangkan tombol daftar di website memakai `bit.ly/PendaftaranKCVIII` dari kodemu. Pastikan keduanya sesuai alur yang diinginkan.
