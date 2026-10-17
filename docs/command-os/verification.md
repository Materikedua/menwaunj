# Verifikasi tahap pertama — 18 Oktober 2026

Status: implementasi **lokal**, branch `codex/command-os-foundations`. Tidak ada commit/push atau deployment perubahan ini ke produksi. Screenshot memakai identitas dan data pengujian terpisah, bukan akun resmi organisasi.

## Pengujian otomatis

- `npm test`: pemeriksaan sumber Windows, parser 22 berkas JSX/JavaScript, regresi kegiatan/V7, syntax API dan enam fallback navigasi lulus. Suite Command OS berisi 11 tes dan seluruhnya lulus.
- Kebijakan payload publik: empat ID tetap, URL Forms sesuai kebijakan, revisi positif, payload ambigu/draf ditolak, snapshot yang telah dikonfirmasi dipertahankan saat refresh gagal.
- Akun: validasi identitas/peran/kata sandi, scrypt, CLI menolak argumen kata sandi; sesi dirotasi, kedaluwarsa dan dicabut saat logout.
- Izin: anonymous ditolak pada data internal; CSRF dan Origin salah ditolak; editor tidak dapat menyetujui; pengaju tidak dapat menyetujui tugas sendiri.
- Publikasi: draf dan persetujuan belum mengubah proyeksi publik; hanya publikasi sah mengubah tujuan. Konflik revisi dan dua publikasi bersaing tidak menimpa data terbaru; pengulangan publikasi tidak menambah efek.
- Pemulihan: membuat tugas baru, membutuhkan persetujuan lain, dan tidak dapat menimpa revisi yang lebih baru. Data tugas/sesi/publikasi bertahan setelah layanan dibuka kembali. Trigger menolak perubahan/penghapusan audit.
- Uji HTTP Vite sesungguhnya: database default, database konfigurasi dengan ekstensi nonstandar, sidecar SQLite, jalur `/@fs/`, dan sumber server mengembalikan `403`; API publik hanya mengandung metadata terbit dan API tugas tanpa sesi mengembalikan `401`.
- `git diff --check`: lulus. Cache dependensi yang terlacak dan berubah akibat pengujian dikembalikan; cache baru memakai `.vite-cache/` yang diabaikan Git.

`npm test` final selesai dengan exit code 0, termasuk seluruh 11 tes dan `vite build` (1604 modul). Bundle utama 355,74 kB / gzip 102,21 kB; Command Center dimuat sebagai chunk terpisah 23,06 kB / gzip 7,06 kB dan stylesheet 19,06 kB / gzip 4,86 kB. Build bukan bukti deployment atau backend produksi terhubung.

## Alur browser yang benar-benar dijalankan

Chrome desktop, tampilan sekitar 1536 piksel:

1. Akun editor pengujian masuk melalui halaman login. Dashboard membaca data layanan lokal.
2. Instruksi `Ubah tautan pendaftaran Youth Spark menjadi [URL fixture Google Forms]` membuat pratinjau menunggu persetujuan. Tidak ada URL fixture yang dibuka atau dikirim ke formulir eksternal.
3. Ketiga tombol `Take Your Seat Now!` pada halaman seminar masih menunjuk URL sumber `https://forms.gle/Xc3QsBLNueoXYLfDA` sebelum publikasi.
4. Akun penyetuju berbeda masuk, meninjau URL dan menyetujui. Langkah penerbitan tetap terpisah.
5. Setelah publikasi lokal, pemeriksaan atribut `href` ketiga tombol menghasilkan URL fixture persis yang diminta.
6. Penyetuju mengajukan pemulihan. Sistem membuat tugas menunggu persetujuan baru.
7. Akun administrator pengujian berbeda menyetujui dan menerbitkan pemulihan. Ketiga atribut `href` kembali persis ke URL sumber. Tugas awal menampilkan status telah dipulihkan.
8. Screenshot [command-center-preview.jpg](command-center-preview.jpg) merekam dashboard dan dua record pengujian setelah pemulihan. Server QA dihentikan, lalu pratinjau final dijalankan memakai database default terpisah tanpa akun bawaan.

Upaya override viewport ke 390 × 844 melalui kemampuan browser tidak mengubah `innerWidth` yang terukur (tetap 1536). **Tampilan ponsel belum terverifikasi secara visual.** CSS breakpoint tersedia dan telah ditinjau, tetapi tidak diklaim sebagai pengujian perangkat nyata. Tidak dilakukan audit aksesibilitas menyeluruh atau pengukuran Core Web Vitals.

## Status eksternal dan batas

`vercel whoami` berhasil membaca akun CLI dan `vercel inspect https://menwaunj.vercel.app` mengonfirmasi deployment portal yang sudah ada berstatus Ready, dengan fungsi chat/search. Tidak ada perintah deployment dijalankan. Akun/proyek auth, database PostgreSQL dan storage terkelola belum dihubungkan.

Layanan Command OS produksi mengembalikan `503` sampai adapter terkelola diterapkan dan diverifikasi. Produksi belum memiliki MFA, RLS PostgreSQL, private object storage, backup otomatis, worker, OCR, arsip/nomor surat, eksekutor model atau Creative Studio. Parser tahap pertama terbatas dan deterministik; tidak mengklaim interpretasi AI umum.

Temuan dependensi dev, validasi output chatbot, aset hilang dan konsistensi konten tetap tercatat dalam [audit](audit.md) dan backlog [architecture](architecture.md). Jangan menyebut seluruh Command OS selesai atau siap produksi berdasarkan hasil tahap ini.
