# Panduan v6

Melengkapi `PANDUAN-v5.md` (musik, autoplay, Pendidikan, dan penjelasan bug coverflow tetap berlaku) dan `PANDUAN-v4.md`. Timpa **seluruh** `src/`, lalu salin `public/` dan `vercel.json`.

Semua perubahan di bawah sudah diuji di Chromium (30 pemeriksaan fitur baru + 35 pemeriksaan regresi, semuanya lulus).

## 1. Geranat

"Gerakan Paskibra Semangat" kini tampil sebagai **Geranat**, dengan nama lengkapnya sebagai keterangan di kartu program, judul halaman, dan lencana header. Header menjadi "GERANAT VII".

**Logo Geranat:** kode mencari `geranat-menwa-unj.png` berurutan di:
1. `public/geranat-menwa-unj.png`
2. `public/kegiatan/geranat-menwa-unj.png`
3. `public/logo/geranat-menwa-unj.png`

Yang pertama ditemukan dipakai (tampil di sisi kanan header `/geranat/`, melayang halus). Kalau file ada di tempat lain, ubah daftar `logo` pada program `geranat` di `siteData.js`.

## 2. Subtab KC

- **Tiga tombol sebaris di header:** Daftarkan Tim Kalian, Lihat Alur Kegiatan, **Lihat Proposal dan Juknis** (menggulir ke kartu "Dokumen Resmi"). Di layar lebih sempit tombol turun ke baris berikutnya.
- **Juknis bisa diunduh seperti proposal.** Taruh PDF juknis di `public/dokumen/juknis-kc-viii-menwa-unj.pdf` (nama persis). Kalau file itu belum ada atau namanya beda, tombol "Unduh PDF" juknis otomatis disembunyikan dan hanya tombol Google Drive yang tampil, jadi tidak pernah ada tombol rusak.

## 3. Live chat

Animasi lompat dihapus. Balasan chat sekarang: *"Fitur ini masih dikembangkan oleh Wakil Komandan, mohon maaf belum berfungsi."* Pesan sambutan pertama ("Komando! Selamat datang... Ada yang bisa Piket Mako bantu?") dan tulisan "Siaga Operasional • Fast Response" di kepala chat tidak saya ubah. Kalau mau disesuaikan agar tidak kontradiktif, ubah di `LiveChatWidget` (`App.jsx`).

## 4. Foto Garis Komando (.svg)

Ada **44 foto** di `public/struktur/`, satu untuk setiap nama (2 pimpinan + 42 pejabat dan anggota). Nama file = nama lengkap huruf kecil dengan strip, misalnya `eben-haezer-sitorus.svg`. Foto tampil di kartu Komandan dan Wakil Komandan serta di setiap baris daftar staf.

**Catatan penting: ini avatar, bukan foto asli.** Saya tidak bisa membuat foto wajah orang sungguhan, jadi yang dibuat adalah avatar netral berformat SVG: siluet berbaret ungu dengan bintang, papan nama inisial, dan balok emas di pundak sesuai jabatan (pimpinan 3, Kaur/Kepala 2, Wa Kaur/Wa Kepala 1, staf dan anggota 0). Warna latar dibedakan per unsur.

**Cara memasang foto asli (tetap berformat .svg):**
```bash
npm i -D sharp
node scripts/wrap-photo.mjs "Eben Haezer Sitorus" ./foto-mentah/eben.jpg
```
Foto dipotong persegi 400x400, dikompres, lalu dibungkus menjadi `public/struktur/eben-haezer-sitorus.svg` (menimpa avatarnya). Banyak foto sekaligus: buat `scripts/foto-map.json` berisi `{ "Nama Lengkap": "./path/foto.jpg" }`, lalu `node scripts/wrap-photo.mjs --map scripts/foto-map.json`.

Menambah nama baru: tambahkan ke `scripts/people.json`, jalankan `node scripts/generate-avatars.mjs` (file yang sudah ada tidak ditimpa, kecuali memakai `--force`). Nama di `App.jsx` harus persis sama ejaannya dengan nama file; kalau file tidak ditemukan, otomatis tampil inisial.

## 5. Sorotan Giat (coverflow baru)

Tema gelap sinematik: latar buram mengikuti poster aktif, kartu aktif berbingkai emas dengan kilau, kartu samping gelap dan miring, ukuran kartu lebih besar. Di bawahnya ada **panel info** (kategori, judul besar, tanggal, lokasi, ringkasan, tombol Selengkapnya) yang berganti dengan animasi, penghitung "03 / 08", dan garis progres emas. Berganti otomatis tiap 5 detik, berhenti saat kursor di atasnya atau saat di-drag. Drag mouse dan swipe sentuh bekerja; klik kartu samping memajukannya; klik kartu utama atau tombol membuka detail.

Kartu yang gambarnya belum ada menampilkan judul kegiatan di atas blok hijau, jadi tidak ada kartu kosong. Tampilannya paling bagus kalau poster asli sudah ada di `public/kegiatan/`.

## 6. Gambar header .svg untuk semua halaman (kecuali beranda)

Taruh file di `public/header/` dengan nama persis seperti ini; yang belum ada otomatis tidak tampil:

| Halaman | File |
|---|---|
| Subtab KC, Geranat, Pengabdian, Seminar, PAM, Diklat | `header-kc.svg`, `header-geranat.svg`, `header-pengabdian.svg`, `header-seminar.svg`, `header-pam.svg`, `header-diklat.svg` |
| Garis Komando | `header-gariskomando.svg` |
| Pendidikan dan Pelatihan | `header-pendidikan.svg` |
| Markas Komando | `header-mako.svg` |
| Administrasi Umum | `header-administrasi.svg` |

Gambar mengisi seluruh area header (`object-fit: cover`), **di atas foto latar dan di bawah teks**. Ukuran saran 1920 x 600 px; kosongkan atau transparankan area tempat teks agar tetap terbaca. Mau tampil di sisi kanan saja atau tanpa dipotong? Ubah props `fit` dan `position` pada `<HeaderArt />` (contoh: `fit="contain" position="right center"`). Komponen ini ada di `Sections.jsx`; di tab-tab selain program, tag `<HeaderArt name="..." />` sudah dipasang di `App.jsx`.

## 7. Animasi angka statistik

Dulu angka mulai menghitung saat halaman dimuat, sehingga sudah selesai sebelum pengunjung men-scroll ke sana. Sekarang:
- Angka baru mulai naik **saat kartunya terlihat di layar**.
- Durasi **5,5 detik** dengan awal dan akhir yang halus (lambat, lalu cepat di tengah, lalu melambat).
- Pada uji: ±2 detik setelah terlihat angkanya baru 8, 23, 15, 5; ±4 detik baru 40, 119, 80, 24; selesai di 50, 150, 100, 30 sekitar 6 detik.
- Pengguna yang mengaktifkan reduce-motion langsung melihat angka akhir.

Mau lebih lambat atau lebih cepat? Ubah `DURATION = 5500` di `StatCard` (`App.jsx`).

## 8. Yang perlu kamu cek

1. **Administrasi Umum menulis "GERANAT VI"** (judul dan deskripsi "Gerakan Paskibra Semangat VI Tahun 2026"), sedangkan poster dan data situs menulis **VII**. Ini teks lama di kodemu yang tidak saya ubah. Sesuaikan di `AdministrasiUmumTab` bila salah satunya keliru.
2. File yang masih perlu kamu taruh sendiri: `geranat-menwa-unj.png`, PDF juknis, foto hero kampus, foto kegiatan lain, dan lagu di `public/musik/`.
