# Usulan implementasi MENWA UNJ COMMAND OS

Tanggal audit: 18 Oktober 2026 (Asia/Jakarta). Status: **implementasi lokal tahap pertama disetujui pengguna; produksi tetap usulan**.

Dokumen ini adalah usulan yang ditinjau melalui gerbang persetujuan Bagian 8.3 lampiran MASTER SYSTEM PROMPT. Pengguna menjawab **“Setujui implementasi tahap pertama”** untuk implementasi lokal dan pengujiannya. Tidak ada izin publikasi produksi yang diasumsikan. Daftar berikut merekam lingkup yang disetujui; rincian implementasi aktual dan batasnya ada di [operations](operations.md).

Penyesuaian lingkungan lokal: penyimpanan nyata memakai SQLite bawaan Node 24, tanpa akun cloud yang belum tersedia. PostgreSQL/auth/storage terkelola tetap target produksi; layanan produksi mengembalikan `503` sampai adapter diimplementasikan dan diverifikasi. Ini memungkinkan pengujian alur dengan database persisten lokal tanpa mengklaim koneksi produksi.

## Perubahan yang diusulkan

Bangun fondasi Command Center dan satu alur operasional lengkap terlebih dahulu: **pengurus masuk → meminta perubahan tautan pendaftaran → sistem mengidentifikasi aksi dan memvalidasi URL → pratinjau perubahan → persetujuan atas revisi tersebut → publikasi data → tombol publik memakai tujuan yang disetujui → hasil dicatat dan dapat dikembalikan**.

Alur tautan dipilih sebelum unggah gambar karena data kegiatan dan tombol sudah ada di `src/data/siteData.js`, sedangkan penyimpanan privat, autentikasi, dan pemrosesan media belum ada. Ini menguji kewenangan, data persisten, persetujuan, dan dampak nyata pada situs dengan lingkup terkecil. Pipeline gambar menyusul setelah fondasi ini lulus.

## Alasan dan manfaat

- Konten kini berada dalam JavaScript/JSX; perubahan rutin memerlukan perubahan sumber dan build.
- Chatbot saat ini hanya membantu navigasi; belum ada eksekusi perintah atau penyimpanan pekerjaan.
- Tidak ditemukan backend akun pengurus, peran, persetujuan, registri tautan, atau audit log.
- Registri memisahkan perubahan konten rutin dari perubahan kode, menjaga tautan resmi yang sudah ada, dan menguji batas akses sebelum mengarsipkan surat rahasia.

## Lingkup implementasi yang dimintakan persetujuan

1. Perbaikan pemeriksaan sumber agar berjalan pada Windows dan penanganan berkas router lama yang masih memuat JSX dalam `.js` setelah memastikan seluruh konsumennya.
2. Modul baru Command Center terpisah di `/command-center`, dengan akun individual, pemeriksaan sesi server, dan peran `editor`, `approver`, `admin`, serta akses baca audit sesuai kewenangan. Tidak ada login palsu atau penyimpanan kata sandi di browser.
3. Skema database berversi untuk keanggotaan, tugas, registri tautan, revisi, persetujuan, publikasi, pekerjaan latar, dan audit. Penyimpanan persisten produksi menggunakan PostgreSQL; Supabase menjadi opsi awal karena menyediakan auth dan storage dalam satu layanan, tetapi belum dipilih/dihubungkan atas nama pengguna.
4. API server dengan validasi input, pembatasan kemampuan, transaksi persetujuan/publikasi, kontrol konflik revisi, dan kunci idempotensi. API publik hanya membaca proyeksi data yang telah diterbitkan.
5. Penyambungan tombol KC, Youth Spark, dan pendataan jersey ke registri. Nilai saat ini menjadi seed kandidat berdasarkan repository, bukan bukti baru bahwa tautan telah disetujui atau berhasil diakses. Situs tetap memakai nilai terakhir yang diketahui bila layanan data tidak tersedia.
6. Parser perintah terbatas untuk permintaan perubahan tautan yang menyertakan URL dan aksi yang jelas. Model opsional membantu membuat rencana; model tidak diberi kredensial publikasi dan tidak boleh melewati validasi/persetujuan. Permintaan ambigu menghasilkan kebutuhan klarifikasi, tanpa mengubah tautan.
7. Pratinjau revisi, persetujuan, jejak aktivitas, serta rollback ke revisi terdahulu. Pemeriksaan URL memisahkan validitas sintaks dari keterjangkauan jaringan. Pemeriksaan akses server harus menolak jaringan privat dan memvalidasi setiap redirect untuk mencegah SSRF.
8. Pengujian alur nyata terhadap database pengujian: akses tanpa sesi ditolak, peran salah ditolak, revisi yang telah berubah tidak dapat dipublikasikan dengan persetujuan lama, publikasi berulang tidak menggandakan efek, dan rollback mengembalikan tujuan sebelumnya. Regresi portal publik dan pemeriksaan tampilan desktop/ponsel.
9. Dokumentasi konfigurasi, pengoperasian, migrasi, pemulihan, dan catatan perubahan.

## Komponen terdampak

| Area | Rencana perubahan |
| --- | --- |
| `src/App.jsx` | Tambahkan rute masuk modul internal yang dimuat terpisah; pertahankan rute publik |
| `src/components/Sections.jsx`, `JerseyShowcase.jsx` | Konsumsi tujuan tautan yang telah dipublikasikan melalui adapter dengan fallback |
| `src/data/siteData.js` | Sumber migrasi data awal; tautan tidak diganti dengan tebakan |
| `src/command/` (baru) | Antarmuka login, pekerjaan, pratinjau, persetujuan, registri |
| `api/command/`, layanan server (baru) | Otorisasi dan operasi yang diaudit; jalur API disesuaikan batas runtime/deployment |
| Migrasi database dan pengujian (baru) | Schema, grants, RLS, transaksi, seed yang ditinjau, acceptance tests |
| `scripts/validate-source.mjs`, router duplikat | Perbaikan regresi awal dengan pemeriksaan seluruh import |
| `README.md`, `CHANGELOG.md`, `docs/command-os/` | Panduan, keputusan arsitektur, migrasi dan rollback |

Daftar ini adalah ruang lingkup usulan yang disetujui; nama berkas final mengikuti implementasi yang didokumentasikan. Tidak ada refactor visual publik dalam milestone pertama.

## Risiko dan mitigasi

| Risiko | Pengendalian yang wajib diuji |
| --- | --- |
| Internal terpapar publik | Tolak akses API tanpa sesi dan keanggotaan aktif; RLS/grants; data internal tidak berada di `public/` atau bundle |
| Penggantian tujuan tanpa kewenangan | Persetujuan terikat hash/revisi, peran dan scope; validasi kembali saat commit |
| Gangguan situs saat migrasi | Fitur bertahap; data statis tetap tersedia; aktivasi baca registri setelah seed diverifikasi |
| Dua pengurus menimpa perubahan | Optimistic concurrency dan transaksi; konflik ditampilkan untuk ditinjau |
| Perintah AI melewati batas | Allowlist tool; output model berupa usulan tervalidasi; kredensial dan persetujuan dipisahkan dari model |
| Kegagalan provider/pekerjaan | Timeout, retry terbatas, idempotensi, antrean persisten, status gagal yang terlihat |
| Perubahan tak sengaja pada tautan resmi | Perbandingan sebelum/sesudah dan pengujian tujuan persis; tidak mengoreksi URL dengan tebakan |

## Rencana pelaksanaan

1. Setelah persetujuan, buat branch kerja `codex/command-os-foundations` jika izin Git tersedia; jangan mengubah produksi.
2. Perbaiki baseline validasi dan pastikan build portal lulus.
3. Siapkan migrasi yang ditinjau serta konfigurasi lingkungan pengujian, akun peran dan storage privat. Jangan menjalankan migrasi produksi tanpa persetujuan khusus.
4. Implementasikan kontrak layanan dan alur registri tautan; jalankan acceptance tests menggunakan database terisolasi.
5. Sambungkan modul internal dan tombol publik; periksa regressi visual/responsif dan fallback.
6. Siapkan staging jika akses proyek/deployment telah dikonfirmasi. Tunjukkan URL dan bukti pemeriksaan yang benar-benar berhasil.
7. Minta persetujuan publikasi produksi atas revisi yang telah diverifikasi, lalu verifikasi hasil setelah publikasi jika disetujui.

## Pemulihan

- Perubahan sumber melalui branch dan commit terpisah; rollback deployment ke versi portal sebelumnya.
- Matikan adapter registri melalui konfigurasi dan kembali ke tujuan statis yang sudah ada.
- Publikasi konten menyimpan revisi terdahulu; rollback menerbitkan ulang revisi yang dipilih melalui transaksi dan audit baru.
- Migrasi awal bersifat tambahan. Sebelum migrasi produksi: backup terverifikasi dan uji restore ke lingkungan terpisah. Jangan menghapus data untuk membatalkan rilis.

## Akses eksternal yang diperlukan

Repository lokal sudah dapat dibaca dan dokumen dapat disiapkan. Metadata lokal menunjuk proyek Vercel `menwaunj`, tetapi itu tidak membuktikan sesi aktif, izin deployment, atau URL produksi. Variabel provider tidak ditemukan pada nama environment proses yang diperiksa; konfigurasi dashboard remote belum diverifikasi.

Untuk tahap terhubung: tentukan proyek database/auth/storage milik organisasi, akun admin awal beserta peran, dan akses konfigurasi lingkungan pengujian. Untuk staging/produksi: akses deployment Vercel yang benar. Gunakan secret manager atau environment server; jangan mengirim kunci melalui dokumen atau memasukkannya ke bundle frontend. Tidak perlu memberi akses email, penerbitan surat, pembayaran, atau mengubah rahasia produksi untuk milestone ini.

## Batas persetujuan

Persetujuan usulan ini mengizinkan implementasi lokal dan pengujian fondasi serta registri tautan. Publikasi produksi, penerbitan surat, perubahan hak akses organisasi, penghapusan arsip, dan biaya layanan baru tetap memerlukan kewenangan tersendiri. Jika integrasi belum tersedia, hasil harus disebut implementasi lokal/teruji terisolasi; jangan menyebutnya sistem produksi yang telah tersambung.
