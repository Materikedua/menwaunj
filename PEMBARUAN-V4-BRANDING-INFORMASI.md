# MENWA UNJ — PEMBARUAN V4
## Portal organisasi, branding, dan pusat sumber informasi

**Versi:** 4.0  
**Lingkup:** React + Vite, halaman publik Menwa UNJ  
**Acuan konten:** struktur lama portal, proposal dan juknis Ksatria Cendekia VIII 2026, poster serta rundown Youth Spark 2026, mockup jersey, dan chibi Menwa yang sudah dilampirkan pengguna.

---

## 1. Apa arah baru website ini?

Website diposisikan sebagai **pintu masuk resmi ke informasi organisasi**, bukan halaman promosi acara semata. Karena itu, hierarki baru adalah:

1. **Identitas satuan** — siapa Menwa UNJ dan nilai apa yang dibawa.
2. **Tujuan kunjungan** — apa yang dibutuhkan pengunjung saat ini.
3. **Program dan agenda** — KC VIII, Youth Spark, serta program lainnya.
4. **Sumber informasi** — dokumen, jadwal, jersey, formulir, dan FAQ.
5. **Kontak dan layanan** — jalur komunikasi resmi dan markas.

Arah desain: **editorial, berwibawa, modern, banyak ruang napas, kontras jelas, dan interaktif seperlunya**. Warna organisasi tetap mempertahankan teal/hijau gelap, emas-kuning, putih, dan slate.

---

## 2. Inovasi yang benar-benar diterapkan

### A. Beranda editorial baru

- Headline besar yang lebih mudah diingat: **“Membangun karakter. Menggerakkan pengabdian.”**
- Logo organisasi tampil sebagai fokus visual, bukan sekadar ornamen kecil di samping headline.
- Identitas satuan dan semboyan **Widya Castrena Dharma Siddha** tetap tampak.
- Dua tombol tujuan utama: **Jelajahi Pusat Informasi** dan **Kenali Organisasi**.
- Area **Apa yang ingin kamu temukan?** berisi jalur langsung ke KC VIII, Youth Spark, Garis Komando, dan Pendidikan.
- **Dua agenda, satu semangat**: dua kartu editorial untuk KC VIII dan Youth Spark.
- Area **Ruang untuk bertumbuh** merangkum pembinaan, pengabdian, kepemimpinan, dan kerja sama.
- Memperbaiki **4 sampul program yang sebelumnya mengarah ke file hilang**. Untuk kategori tanpa foto kegiatan, digunakan ilustrasi grafis yang jelas bukan dokumentasi fotografis.
- Bagian lama yang menggunakan **angka keanggotaan/prestasi tanpa sumber pembuktian dalam file proyek** tidak lagi ditampilkan di beranda. Ini menghindari kesan website resmi menegaskan angka yang belum dapat diverifikasi.
- Kutipan testimonial lama juga tidak dijadikan pusat desain baru sampai atribusi dan izin tampilnya diverifikasi.

### B. Halaman `/informasi` — direktori konten

Halaman baru berfungsi sebagai **information hub** dengan:

- kolom pencarian real-time,
- filter kategori,
- daftar tautan yang menjelaskan isi dan tujuan masing-masing,
- tautan langsung ke halaman program, pendidikan, organisasi, markas, administrasi, formulir, dan PDF rundown,
- pesan ketika hasil pencarian kosong,
- tombol kontak resmi untuk pertanyaan lanjutan.

**Catatan:** Dokumen berlabel terbatas/konfidensial tidak secara sengaja diindeks pada direktori baru ini. Evaluasi akses file pada folder `public/dokumen` tetap wajib dilakukan sebelum deploy.

### C. Pencarian cepat global (`Ctrl/⌘ + K`)

- Tombol pencarian di navbar.
- Shortcut keyboard **Ctrl + K** (Windows/Linux) dan **Command + K** (macOS).
- Pencarian berdasarkan judul, ringkasan, dan kategori.
- **↑ / ↓** untuk memilih, **Enter** untuk membuka, **Esc** untuk menutup.
- Menampilkan akses internal dan tautan eksternal yang memang ditentukan pada proyek.
- Tidak memerlukan backend atau koneksi ke layanan pencarian pihak ketiga.

### D. Navigasi utama diperbarui

Urutan navbar lebih fokus pada tujuan pengguna:

- **Beranda** → `/`
- **Pusat Informasi** → `/informasi`
- **KC VIII** → `/kc`
- **Youth Spark** → `/youth-spark/seminar-webinar`
- **Organisasi** → `/garis-komando`
- **Kontak & Markas** → `/mako`

Pendidikan serta Administrasi tetap ada melalui Pusat Informasi, footer, dan pencarian global. Menu HP diperbaiki agar bisa di-scroll apabila tinggi layar terbatas.

### E. Wayfinder — navigasi cepat di halaman panjang

Pada halaman **KC VIII** terdapat navigasi sticky ke:
- Tentang,
- Jersey,
- Jadwal,
- Ketentuan,
- FAQ.

Pada halaman **Youth Spark Seminar** terdapat navigasi ke:
- Narasumber,
- Benefit,
- Rundown,
- FAQ.

Navigasi memiliki penanda posisi saat pengguna melakukan scroll dan mempertimbangkan tinggi navbar agar judul bagian tidak tertutup.

### F. FAQ interaktif

- **KC VIII:** 6 pertanyaan umum seputar jadwal, peserta, biaya, dua jenis jersey, dan batas pengumpulan karya.
- **Youth Spark:** 6 pertanyaan seputar tanggal, tema, materi, jam kegiatan, benefit, dan cara mendaftar.
- Dibuat dengan elemen HTML `<details>` agar ringan, aksesibel, dan tidak memerlukan library tambahan.
- Semua jawaban mengikuti informasi yang tersedia dalam proyek/lampiran, bukan asumsi baru.

### G. Mockup jersey asli, bukan simulasi putar 3D

- Memakai mockup **manekin depan–belakang** asli untuk **ATHLETE** dan **OFFICIAL**.
- Dua gambar mockup dikonversi ke WebP untuk mempercepat pemuatan.
- Detail depan, belakang, poster, serta mockup besar tetap bisa dibuka dalam viewer.
- Tombol close viewer tetap melekat di kanan atas viewport sehingga mudah ditutup.
- **Link jersey peserta:** https://forms.gle/voyPEgvxvhS8VrKf8
- **Link pre-order official:** https://forms.gle/RHoXRFTEVKWHQfFx9
- Harga official tetap **Rp150.000**; jersey peserta merupakan benefit pendaftaran.

### H. Chatbot chibi tetap dipertahankan, dengan optimasi

- Chibi laki-laki dan perempuan dari lampiran digunakan sebagai aset utama.
- Animasi jalan/lompat loop, orbit kecil, reaksi mendekati kursor, dan kaget `!` dipertahankan.
- Versi WebP dipakai di runtime untuk mengurangi ukuran aset.
- Posisi pandangan diubah melalui variabel CSS langsung, mengurangi render React pada gerakan kursor berulang.
- Chatbot tetap dapat dibuka dengan klik dan dipindahkan pengguna.
- Reaksi ekspresi dilakukan **secara visual 2D dari gambar yang ada**; mata individual tidak dirender ulang sebagai rig animasi.

### I. Kualitas pengalaman pengguna

- Layar loading buatan yang memblokir konten awal dihilangkan.
- Musik opsional, **tidak lagi otomatis menyala** saat website dibuka atau diklik pertama kali.
- Tombol **Kembali ke atas** muncul saat halaman cukup jauh discroll.
- Tersedia tautan **Langsung ke konten utama** untuk navigasi keyboard.
- Animasi mempertimbangkan pengaturan sistem `prefers-reduced-motion`.
- Metadata judul, deskripsi, tema warna, favicon, dan Open Graph dasar ditambahkan.
- Tombol login anggota berbasis simulasi sebelumnya tidak lagi ditampilkan karena tidak memiliki autentikasi sungguhan. Jika kelak dibutuhkan, perlu dibuat backend auth dan izin akses yang benar.

---

## 3. Struktur route setelah V4

```text
/
├── /informasi/
├── /kc/
│   ├── #tentang-program
│   ├── #jersey-kc
│   ├── #alur
│   ├── #ketentuan-program
│   └── #faq-program
├── /youth-spark/
│   └── /youth-spark/seminar-webinar/
│       ├── #narasumber-youth-spark
│       ├── #benefit-youth-spark
│       ├── #rundown-youth-spark
│       └── #faq-youth-spark
├── /garis-komando/
├── /pendidikan/
├── /mako/
├── /administrasi/
└── halaman program lama lainnya tetap tersedia
```

---

## 4. File yang diubah atau ditambahkan

**Komponen baru:**
- `src/components/BrandExperience.jsx`
- `src/components/BrandExperience.css`
- `src/components/PortalUtilities.jsx`
- `src/components/PortalUtilities.css`

**Komponen dan data yang diperbarui:**
- `src/App.jsx` — hierarki halaman, navbar, perutean pusat informasi, shortcut search, metadata title, wayfinder, dan hapus login simulasi.
- `src/components/Sections.jsx` — anchor section, FAQ, tautan footer.
- `src/components/JerseyShowcase.jsx` — tampilkan gambar mockup manekin asli.
- `src/components/JerseyShowcase.css` — tata letak mockup statis.
- `src/components/MenwaPet.jsx` — optimasi update kursor & WebP.
- `src/components/MenwaUI.jsx` — navigasi HP dapat di-scroll.
- `src/components/MusicPlayer.jsx` — musik hanya atas permintaan.
- `src/data/siteData.js` — aset mockup resmi, pertahankan tautan yang benar, autoplay dinonaktifkan.
- `src/styles.css` — aksesibilitas, komponen navbar search.
- `index.html` — metadata portal dan favicon.
- `scripts/validate-events.mjs` — tes yang diperbarui agar sesuai versi V4.
- `scripts/validate-jsx.mjs` — tes sintaks JSX seluruh sumber.
- `README.md` — panduan operasional utama.

**Aset tambahan:**
- `public/jersey/mockup-peserta.webp`
- `public/jersey/mockup-official.webp`
- `public/mascot/chibi-menwa-boy.webp`
- `public/mascot/chibi-menwa-girl.webp`
- `public/kegiatan/program-pam.svg`
- `public/kegiatan/program-diklat.svg`

---

## 5. Menjalankan proyek

### Prasyarat

- Node.js 20+ disarankan.
- npm tersedia.
- Internet tersedia saat menginstal dependensi.

### Lokal

```bash
npm install
npm run dev
```

### Validasi dan build

```bash
npm run test:source
npm run test:jsx
npm run test:events
npm run test:api
npm run build
```

Gunakan `npm run test` untuk menjalankan seluruh tes dan build setelah dependency terinstal dengan benar.

### Deployment Vercel

1. Unggah isi folder proyek utama (tempat `package.json` berada) ke repository GitHub.
2. Import repository di Vercel sebagai proyek Vite.
3. Pastikan **Root Directory** adalah folder proyek utama, bukan folder anak lama seperti `menwa-site`.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Konfigurasi fallback SPA sudah disediakan melalui `vercel.json`.
7. Lakukan tes di HP dan desktop setelah build berhasil.

---

## 6. Pengujian yang dilakukan di lingkungan penyusunan

| Pengujian | Status |
|---|---|
| Validasi jalur import dan sintaks .js | LULUS |
| Parsing JSX dengan Babel Parser | LULUS |
| Validasi konten KC VIII dan Youth Spark | LULUS |
| Validasi 2 form jersey yang berbeda | LULUS |
| Validasi file poster/manekin/chibi tersedia | LULUS |
| Validasi seluruh gambar sampul 6 program tersedia | LULUS |
| Validasi 16 agenda rundown Youth Spark | LULUS |
| Validasi API syntax `api/chat.js` | LULUS |
| Build Vite lengkap / inspeksi UI browser | BELUM DAPAT DIVERIFIKASI di lingkungan ini |

**Mengapa build belum diverifikasi:** folder `node_modules` sebelumnya berisi binary platform lain, sedangkan akses ke registry npm dari lingkungan ini tidak berhasil. Untuk menghindari pencampuran binary lintas-OS, ZIP akhir **tidak menyertakan `node_modules`**; jalankan `npm install` baru di komputer/Vercel sebelum build.

---

## 7. Checklist wajib sebelum publikasi resmi

- [ ] Cek **setiap tautan formulir** masih aktif dan benar.
- [ ] Cek tanggal, harga, narasumber, dan detail peserta terhadap surat atau pengumuman terakhir.
- [ ] **Audit file `/public/dokumen`**: juknis KC VIII yang dilampirkan pernah mengandung penanda **“KONFIDENSIAL”**. Jangan publikasikan dokumen atau data yang belum mendapat izin rilis. Semua yang berada di `/public` dapat diakses melalui URL langsung walaupun tidak diberi tombol pada halaman.
- [ ] Periksa foto personel/atribusi, logo organisasi/mitra, dan media lain untuk persetujuan publikasi.
- [ ] Jalankan `npm run build` dari instalasi dependensi baru.
- [ ] Uji responsif pada layar **360 px, 768 px, 1366 px** dan periksa apakah tombol chatbot menutupi CTA penting.
- [ ] Uji navigasi keyboard, `Ctrl/⌘ + K`, tombol Escape pada popup, dan animasi pada `prefers-reduced-motion`.
- [ ] Cek formulir yang membuka tab baru dan QR/tautan eksternal.
- [ ] Setelah punya domain resmi, lengkapi URL absolut untuk metadata Open Graph dan canonical.
- [ ] Aktifkan keamanan endpoint chatbot/API dan pantau batas pemakaian sesuai deployment.

---

## 8. Ide pengembangan fase berikutnya (belum diterapkan)

Inovasi V4 sudah dirancang agar bisa dikembangkan lebih jauh tanpa merombak total:

- **CMS konten sederhana** dengan workflow verifikasi sebelum informasi resmi diterbitkan.
- **Agenda kalender terstruktur** dari sumber resmi pengurus, bukan angka atau jadwal yang ditebak.
- **Galeri prestasi terverifikasi** dengan tahun, kategori, hasil, dan sumber.
- **Halaman arsip dokumen publik** yang membedakan dokumen publik, internal, dan rahasia.
- **Autentikasi anggota sungguhan** dengan akun organisasi, bukan username/password yang diperiksa di frontend.
- **Analytics privasi-sadar** untuk memahami halaman yang paling sering dicari pengunjung.
- **Fitur bilingual** Indonesia–Inggris bila organisasi membutuhkan jangkauan lebih luas.

Rekomendasi paling penting: setelah V4 stabil dan teruji secara visual, lanjutkan **sistem pengelolaan informasi terverifikasi** agar perubahan kegiatan dan dokumen dapat diperbarui pengurus tanpa mengubah kode React.
