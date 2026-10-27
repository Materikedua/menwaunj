# Pembaruan Portal Menwa UNJ — Oktober 2026

## Yang berubah

### `/kc/` — Ksatria Cendekia VIII

- Menyesuaikan teks dengan proposal dan juknis yang diberikan, termasuk jadwal kegiatan **05–08 November 2026**, pendaftaran **18 September–30 Oktober 2026** pukul 08.00–22.00 WIB, biaya **Rp2.000.000 per tim**, maksimum 3 tim per satuan, komposisi 2 peserta dan 1 official opsional, persyaratan, fasilitas dan lima mata lomba.
- Batas pengumpulan Esai dan Video Kreatif **30 Oktober 2026, pukul 22.00 WIB** menurut juknis; pengumuman karya **3 November 2026**.
- Menambahkan galeri **Jersey Peserta (ATHLETE)** sebagai benefit pendaftaran tanpa biaya jersey terpisah dan **Jersey Official (OFFICIAL)** berbayar **Rp150.000**; desain depan sama, punggung berbeda.
- Pratinjau putar depan-belakang memakai transformasi CSS 3D dan gambar mockup resmi transparan yang dioptimalkan (`public/jersey/`). Dapat digeser dengan pointer/touch, dioperasikan dengan tombol atau panah keyboard; foto juga bisa diperbesar dan poster edisi bisa dibuka. Ini **simulasi 3D dua sisi**, bukan model 3D dengan geometri sisi lengkap.
- Kedua opsi memakai tautan formulir yang **sama**, sesuai instruksi: <https://forms.gle/RHoXRFTEVKWHQfFx9>.
- Tombol “Lihat Jersey 3D” pada bagian header `/kc/` mengarah ke galeri.

### `/youth-spark/` dan `/youth-spark/seminar-webinar/`

- Menampilkan poster terbaru dan membuat tulisan **“Pembinaan Aktivitas Pemuda”** sebagai highlight utama di hero dan konten.
- Youth Spark National Seminar: *Empowering Youth, Elevating UMKM*, **24 Oktober 2026**, **Aula Latief Hendraningrat, UNJ**.
- Narasumber: Dr. Tomi Ari Sudewo, M.M. (Kepemudaan, Kepala Seksi Kepemudaan Dispora Jakarta Selatan); Dr. Ir. Achmad Fachrodji, M.M. (Industri Kreatif, Direktur Utama PT Balai Pustaka); Deputi Bidang Kewirausahaan (UMKM Naik Kelas, Kementerian UMKM RI).
- Benefit terbaru: **E-certificate, Knowledge Sharing, Door Prize, Networking & Relation**. Souvenir dihapus.
- Tombol **“Take Your Seat Now!”** mengarah ke <https://forms.gle/Xc3QsBLNueoXYLfDA>.
- Jadwal sesi mengikuti file rundown yang sudah ada; judul dan pembicara disesuaikan dengan informasi terkini dari pengguna. Jadwal dapat berubah mengikuti panitia.

## Catatan perbedaan dokumen

Kedua dokumen KC VIII yang dilampirkan memiliki beberapa detail berbeda:

| Butir | Juknis | Proposal | Yang digunakan pada halaman |
|---|---|---|---|
| Batas esai | 30 Oktober 2026, 22.00 | 23 Oktober 2026, 22.00 | Juknis |
| Tempat Seminar Nasional KC | Aula Latief, Kampus A UNJ | Aula Maftuchah, Kampus A UNJ | Juknis |
| Posisi/jarak lomba menembak | Tiarap, ±30 m | Berdiri, ±50 m | Juknis (untuk ketentuan teknis) |

**Penting:** Dokumen Juknis yang dilampirkan memuat penanda **“KONFIDENSIAL”**. Berkas itu sebelumnya juga sudah ada dalam folder publik proyek asli. Sebelum mengunggah situs ke internet, pastikan panitia memang mengizinkan distribusi publik berkas tersebut. Jika tidak, hapus file `public/dokumen/juknis-kc-viii-menwa-unj.pdf` atau pindahkan ke sistem autentikasi, dan hilangkan tautan unduh pada situs.

## Cara menjalankan dan deploy

Gunakan **direktori utama arsip** yang berisi `package.json`, `vite.config.js`, `src`, `public`, dan `vercel.json`. Folder `menwa-site/` di dalamnya adalah salinan kode lama dan **bukan** root situs utama.

```bash
npm install
npm run dev
npm run test:source
npm run test:events
npm run test:api
npm run build
```

Jalankan `npm run dev` di lokal dan uji `/kc/`, `/youth-spark/` dan `/youth-spark/seminar-webinar/`, terutama alur drag jersey dan tombol Google Form. Untuk Vercel gunakan root directory proyek utama, framework **Vite**, build command `npm run build`, output directory `dist`. File `vercel.json` sudah memiliki rewrite yang mendukung refresh pada URL subtab.

**Catatan verifikasi di lingkungan pembuatan arsip:** validasi source, API, asset dan konten telah lolos. Build Vite lokal belum bisa diselesaikan karena dependensi native Linux Rollup/esbuild dari arsip `node_modules` Windows tidak tersedia dan registry npm tidak dapat diakses. Pada komputer/Vercel yang memiliki akses npm, jalankan `npm install` untuk mengambil native dependencies yang sesuai.

## Pembaruan lanjutan – Manekin 360°, lightbox mudah ditutup, pet, rundown (18 Oktober 2026)

- Preview jersey di `/kc` sekarang menampilkan **manekin seluruh tubuh** (kepala, lengan, celana, sepatu) dengan jersey hasil mockup resmi yang dipasang tanpa mengubah artwork. Tombol depan/belakang, geser kiri/kanan, dan tombol panah keyboard tetap berfungsi. Ini **simulasi 3D CSS dan manekin ilustratif**, bukan model 3D GLB/GLTF bertekstur lengkap.
- Detail depan, belakang, dan poster memakai React Portal ke `document.body`, tinggi layar dinamis (`100dvh`), dan tombol **Tutup** selalu tampak di bar paling atas. Bisa ditutup dengan Escape atau klik area luar, dan scroll halaman sementara dikunci. Menangani viewport mobile dan `prefers-reduced-motion`.
- Tombol chatbot diganti maskot **pet Menwa UNJ** berbaret ungu dan PDH krem/beige. Maskot melakukan animasi loop (bobbing, angguk, berkedip, melambai), bisa diseret secara manual, dan tetap membuka widget chat asli. Sumber SVG orisinal ada di `src/components/MenwaPet.jsx`, ilustrasi mandiri di `public/mascot/`.
- Agenda Youth Spark di `/youth-spark/seminar-webinar` mengikuti **semua 16 slot** dari dokumen `Rundown_Youth_Spark_08.00-12.00_2026.docx` yang dilampirkan, pukul **08.00–12.00 WIB**, lengkap dengan pre-test, 3 sesi materi, Q&A panel, post-test, foto bersama, coffee break & doorprize, dan penutupan. Nama pembicara dicantumkan sebagai keterangan tambahan, bukan perubahan pada judul jadwal resmi.
- Tautan PDF `public/dokumen/youth-spark-rundown.pdf` telah diganti dengan hasil konversi dokumen terbaru; sumber DOCX disediakan di `public/dokumen/youth-spark-rundown-2026.docx`.
- Referensi visual konsep disediakan di `gambar-mentah/referensi-ui-maskot-dan-jersey.png`. Ini ilustrasi konsep, sedangkan aset yang dipakai oleh situs berasal dari komponen React/SVG dan gambar jersey resmi.

Untuk pengujian produksi jalankan `npm install` terlebih dahulu di lingkungan target Linux/Vercel, kemudian `npm run test` atau `npm run build`. `node_modules` lama berasal dari Windows sehingga build Linux tidak dapat diuji tanpa pemasangan ulang dependensi native Rollup/esbuild.
