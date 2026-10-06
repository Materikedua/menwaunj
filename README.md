# Portal Komando Resimen Mahasiswa UNJ (v5)

Sudah di-build & ditest lokal, **sukses tanpa error**.

## Perubahan di pembaruan ini

1. **Logo & foto asli terpasang** — UNJ, Dispora DKI Jakarta, Kesbangpol DKI Jakarta, Konas, Skomen (logo Menwa Jayakarta), logo KC VIII, poster KC VIII, foto kampus, logo Geranat. Semua sudah saya kompres supaya ringan.
2. **Konas** → "Komando Nasional Resimen Mahasiswa Indonesia", **Skomen** → "Staf Komando Resimen Mahasiswa Jayakarta" (keduanya sekarang pakai logo asli, bukan placeholder).
3. **"Kegiatan Terbaru" dihapus** dari beranda — Sorotan Giat sudah mewakili.
4. **Admin → Pendaftaran KC** sekarang membuka subtab `/kc/` langsung (bukan ke Instagram lagi).
5. **Pendidikan**: popup/modal dihapus total → detail Renlat/modul sekarang muncul **inline** di dalam kartu saat diklik (seperti accordion Garis Komando). Urutan & label section ditukar jadi **Bertingkat → Berjenjang → Lanjutan**; isi tiap jenis pendidikan (Pendidikan Dasar Satuan, Latihan Pemantapan, Kursus Dinas Staf, Pendidikan Provos Satuan, dst.) **tidak berubah**, cuma label kelompoknya yang dikoreksi.
6. **Drag coverflow Sorotan Giat**: saya cek ulang kodenya, strukturnya sudah benar (flex + overflow-x drag). Kalau di situs Anda masih tampil grid statis seperti sebelumnya, itu tandanya build lama belum ter-replace — lihat bagian "Cara Deploy" di bawah, pastikan **folder project ditimpa total**, bukan cuma beberapa file.
7. **Pemutar musik** (`src/components/MusicPlayer.jsx`): tombol bulat di pojok kanan atas, panel ringkas ala Spotify (judul track, play/pause, next/prev, visual album, pemilih track cepat — sengaja dibuat ringkas, tidak memanjang). Autoplay dicoba begitu web dibuka; kalau browser memblokir (kebijakan umum semua browser modern), musik otomatis mulai begitu ada klik/ketukan pertama di halaman. **Anda perlu menaruh 3 file audio** di `public/audio/`: `jazz.mp3`, `pop.mp3`, `rock.mp3` — belum ada filenya, jadi tombol akan termuat tapi tidak bersuara sampai file ini ditaruh.
8. **Mode terang/gelap**: tombol di sebelah tombol musik (ikon matahari/bulan), tersimpan di localStorage. Ini **pass pertama**: latar utama (beranda, tab Garis Komando/Pendidikan/Mako/Administrasi, halaman subtab program) sudah merespons dark mode. Kartu-kartu putih di dalamnya sengaja saya biarkan putih (pola umum dark-mode: halaman gelap + kartu terang), supaya tidak perlu menyentuh ratusan className satu per satu dengan risiko salah. Kalau ada bagian spesifik yang menurut Anda masih janggal di mode gelap, kabari bagian mana — saya perbaiki lebih presisi.
9. **Animasi teks ketik** di bagian Statistik: "Menwa UNJ dalam **Pengabdian/Anggota/Prestasi/Perlombaan**" bergantian, meniru referensi video yang Anda kirim.
10. **Hero & header subtab** sedikit diperkaya (partikel kecil melayang mengikuti kursor di hero, konsisten dengan arahan "dinamis tapi tidak terlalu statis" dari referensi UNJ) — struktur dasarnya (foto blur + parallax + ken-burns) sudah dinamis sejak v4, ini tambahan polesan.

## Yang masih perlu Anda lengkapi

- `public/audio/jazz.mp3`, `pop.mp3`, `rock.mp3` — pemutar musik belum bersuara tanpa ini.
- Cek tampilan dark mode di tiap tab; beri tahu saya bagian yang masih kurang pas kalau ada.

## Cara deploy (PENTING untuk masalah coverflow)

1. Extract zip ini.
2. **Hapus folder `menwa-portal` lama di laptop Anda sepenuhnya**, lalu ganti dengan folder baru dari zip ini (jangan cuma timpa sebagian file — banyak file baru & diubah di update ini).
3. `npm install` → `npm run dev`, buka di browser, **coba scroll ke Sorotan Giat dan tahan-geser kartunya** untuk pastikan coverflow-nya jalan sebelum deploy.
4. `git add .` → `git commit -m "v5: logo asli, musik, dark mode, dll"` → `git push`.
5. Setelah Vercel selesai build, **hard refresh** (Ctrl+Shift+R / Cmd+Shift+R) di browser supaya tidak kena cache lama.
