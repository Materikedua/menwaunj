# Panduan v5

Melengkapi `PANDUAN-v4.md` (bagian foto, logo Skomen, dan timeline KC di sana tetap berlaku). Timpa seluruh isi `src/` proyekmu dengan folder `src/` di paket ini, lalu salin `public/` dan `vercel.json`. Jangan hanya mengganti sebagian file: `App.jsx`, `Sections.jsx`, `MenwaUI.jsx`, `siteData.js`, dan `MusicPlayer.jsx` saling terhubung.

## 1. Kenapa coverflow "tidak muncul" di screenshot-mu

Screenshot yang kamu kirim (latar gelap, grid 4 kolom, subjudul "Klik kartu untuk melihat detail") **bukan tampilan yang dihasilkan kode v4**. Coverflow v4 berlatar terang dengan kartu miring. Artinya situs yang kamu lihat masih menjalankan versi Sections lama atau campuran: file belum tertimpa semua, atau hasil deploy lama masih tampil (cache).

Cara memastikan versi yang tampil benar: buka DevTools, cari `data-ui="coverflow-v5"` di Elements. Kalau tidak ketemu, berarti masih kode lama. Kartu Ksatria Cendekia di screenshot juga tidak menampilkan poster, padahal `public/kegiatan/kc-menwa-unj.jpg` ada di paket v4, jadi folder `public/` kemungkinan belum ikut tersalin atau ter-deploy.

Selain itu, saat saya uji di browser sungguhan, ada **dua bug nyata di kode v4** yang kini sudah diperbaiki:

| Bug v4 | Perbaikan v5 |
|---|---|
| Drag dengan mouse tidak andal: gambar dan tautan memicu drag bawaan browser, sehingga event `pointerup` tidak pernah datang. | Drag memakai pointer capture, `draggable=false`, dan `touch-action: pan-y`. Kartu **mengikuti kursor atau jari saat di-drag**, lalu snap ke kartu terdekat. Swipe cepat minimal memajukan satu kartu. |
| Klik pada kartu samping tidak terdeteksi: kontainer 3D menutupi kartu yang berada di belakang bidang z=0. | Kontainer diberi `pointer-events: none`. Klik kartu samping kini memajukannya. |

Hasil uji (Chromium, 35 pemeriksaan semuanya lulus): drag mouse ke kiri dan kanan mengganti kartu, drag tidak membuka link, klik kartu samping memajukannya, klik kartu tengah membuka `/kc/`, dan swipe sentuh di layar HP mengganti kartu.

## 2. Perubahan di v5

- **Kegiatan Terbaru dihapus.** Beranda kini: Hero, Program Unggulan, Sorotan Giat (coverflow), lalu bagian sesudahnya seperti semula.
- **Administrasi Umum:** tombol Pendaftaran KC kini membuka `/kc/` di tab yang sama (tulisan tombol: "Lihat Info & Daftar KC VIII"). Tombol GERANAT di sebelahnya juga diarahkan ke `/geranat/` agar konsisten. Kalau ingin GERANAT tetap ke Instagram, kembalikan `url` item itu di `App.jsx`.
- **Pendidikan:** detail modul tidak lagi pop up. Klik kartu untuk membuka detail **di dalam kartu** (animasi halus), klik "Tutup Detail" untuk menutup. Satu kartu terbuka dalam satu waktu.
- **Penamaan kategori pendidikan.** Urutan kini: **Pendidikan Bertingkat → Berjenjang → Berlanjut**.
  - Bertingkat (dulu tertulis Berjenjang): Pendidikan Dasar Satuan, Latihan Pemantapan Komando, Kursus Dinas Staf, Pendidikan Provos Satuan.
  - Berjenjang (dulu tertulis Bertingkat): Pendidikan Dasar Militer, Kursus Kader Pelaksana, Kursus Dinas Staf, Kursus Pelatih Nasional, Kursus Kader Pimpinan.
  - Berlanjut (dulu tertulis "Lanjutan"): tiga pendidikan di kelompok itu. **Saya ikut mengganti "Lanjutan" menjadi "Berlanjut"** karena kamu menulis urutannya sebagai bertingkat, berjenjang, berlanjut. Kalau hanya ingin dua label pertama yang bertukar, ubah kembali tulisan "Pendidikan Berlanjut" dan `category: "Berlanjut"` di `PendidikanTab`.
  - Jenis dan isi pendidikan tidak diubah, hanya labelnya. Deskripsi menu navigasi dan teks program Diklat juga disesuaikan.

## 3. Pemutar musik

Tombol ada di **ujung kanan atas navbar**: tombol bulat kuning (Play/Pause cepat) dan tombol berisi nama lagu dengan equalizer. Klik tombol nama lagu untuk membuka panel ala Spotify: visual album (sampul + piringan hitam berputar), batang visualizer, judul track, previous / play-pause / next, progres lagu (bisa digeser), volume, dan daftar lagu (Jazz, Pop, Rock). Panel tertutup dengan klik di luar atau tombol Esc. Di HP, panel selebar layar dan bisa di-scroll; tombol Play/Pause cepat disembunyikan, kontrolnya ada di dalam panel.

**Taruh file di `public/musik/`:** `jazz.mp3`, `pop.mp3`, `rock.mp3` (sampul opsional `jazz.jpg`, `pop.jpg`, `rock.jpg`). Judul, nama artis, dan warna diatur di `MUSIC` pada `siteData.js`. Kalau file belum ada, panel menampilkan pesan yang menyebut nama file yang dicari.

### Soal autoplay, harus jujur

Browser (Chrome, Safari, Firefox, Edge) **memblokir suara otomatis** sebelum pengunjung berinteraksi dengan halaman. Ini aturan browser, tidak bisa ditembus lewat kode. Yang dilakukan pemutar:

1. Begitu web dibuka, ia mencoba memutar. Kalau browser mengizinkan, musik langsung jalan.
2. Kalau diblokir, muncul petunjuk "Ketuk di mana saja untuk memutar musik", dan musik **mulai pada klik atau ketukan pertama** di bagian mana pun halaman.
3. Kalau pengunjung menekan Pause, musik tidak dinyalakan lagi oleh sistem, termasuk saat pindah halaman. Musik terus berjalan saat berpindah tab di dalam web.
4. Pilihan lagu dan volume diingat di browser pengunjung. Setiap kali web dibuka ulang, musik dicoba diputar otomatis lagi.

Jadi untuk sebagian besar pengunjung, suara baru menyala setelah klik pertama, bukan di detik pertama. Pada uji saya: tanpa interaksi musik belum berbunyi (sesuai kebijakan browser), dan setelah satu klik di mana saja musik langsung mulai.

**Hak cipta:** jazz.mp3, pop.mp3, dan rock.mp3 dimainkan di website publik. Kalau itu lagu komersial milik orang lain, ada risiko hak cipta. Lebih aman memakai lagu bebas royalti atau berlisensi.

## 4. Tetap perlu kamu isi

1. `public/foto-kampus-unj.jpg` (hero beranda dan semua subtab).
2. `public/musik/jazz.mp3`, `pop.mp3`, `rock.mp3`.
3. Foto kegiatan lain di `public/kegiatan/` (nama `xxx-menwa-unj.jpg`). Kartu tanpa foto tampil sebagai blok hijau berlogo satuan.
4. Logo "Skomen" bila berbeda dari logo satuan (lihat `PANDUAN-v4.md` bagian 3, poin 2).
