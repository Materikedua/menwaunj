# Mengoperasikan Command OS tahap 1 secara lokal

Tahap 1 memakai React/Vite, Node 24 dan database SQLite lokal. Perubahan yang diterbitkan melalui alur ini berlaku pada server lokal. **Belum ada adapter database/auth produksi yang terhubung, publikasi Vercel, penyimpanan dokumen privat, atau penerbitan surat resmi.** Rancangan pengembangan ada di [architecture](architecture.md); jalur produksi yang belum dijalankan ada di [migration](migration.md).

## 1. Menjalankan aplikasi

Jalankan dari direktori utama repository, bukan `menwa-site/`. Pastikan `node --version` menunjukkan Node 24 agar modul bawaan `node:sqlite` tersedia. Instal dependensi memakai lockfile proyek, lalu jalankan:

```powershell
npm ci
npm run dev
```

Buka alamat lokal yang ditampilkan Vite dan tambahkan `/command-center`. Server pengembangan mengikat `127.0.0.1` secara default. Gunakan host yang sama untuk login dan halaman publik; cookie sesi serta pemeriksaan Origin mengikuti host/protokol tersebut. Jangan membuka server ini ke internet sebagai layanan produksi.

Vite memasang middleware layanan Command OS hanya pada server pengembangan. `npm run build` menghasilkan frontend; build bukan bukti backend produksi berjalan. Handler produksi Command OS dan registri publik mengembalikan `503` sampai adapter terkelola benar-benar diimplementasikan. Portal menggunakan tautan baseline dari sumber ketika pembacaan registri tidak tersedia.

## 2. Akun individual

Tidak ada akun atau kata sandi bawaan. Operator yang memiliki akses lokal ke direktori database membuat akun melalui terminal. Setiap orang memakai username sendiri, termasuk penyetuju. Minimal dua orang diperlukan karena pembuat permintaan tidak boleh menyetujui permintaannya sendiri.

```powershell
node scripts/command-admin.mjs create-user --username nama.editor --name "Nama Pengurus" --role editor
node scripts/command-admin.mjs create-user --username nama.penyetuju --name "Nama Penyetuju" --role approver
```

Alias npm yang setara adalah `npm run command:user -- create-user` diikuti opsi yang sama.

Nama dan username di atas hanya contoh; ganti dengan identitas orang yang berwenang. CLI meminta kata sandi tersembunyi dan konfirmasi. Jangan memasukkan kata sandi melalui argumen perintah, berkas proyek, chat, atau environment variable. Kata sandi harus 12–256 karakter dan disimpan sebagai hash scrypt dengan salt individual, bukan teks asli.

| Peran lokal | Kewenangan |
| --- | --- |
| `editor` | Membuat tugas perubahan biasa dan membaca registri/tugas/audit; tidak menyetujui, menerbitkan atau meminta rollback. |
| `approver` | Membaca registri/tugas/audit, menyetujui tugas orang lain, menerbitkan tugas yang disetujui dan meminta rollback. Tidak membuat tugas perubahan biasa. |
| `admin` | Gabungan kemampuan editor dan approver; larangan menyetujui permintaan sendiri tetap berlaku. Tidak menyediakan akun admin bawaan. |

Pembatasan akun ini berada di server. Menyembunyikan tombol pada UI bukan mekanisme izin. Akses berkas database/CLI adalah kewenangan operator lokal, sehingga lindungi direktori tersebut memakai izin akun Windows dan jangan membagikannya. Pasangan contoh `editor` + `approver` cukup untuk pengajuan biasa; pemulihan yang diajukan penyetuju memerlukan orang lain dengan peran `approver` atau `admin`. Tetapkan peran berdasarkan kewenangan orang tersebut, bukan untuk menyetujui permintaannya sendiri.

## 3. Lokasi data dan penyimpanan

Lokasi default adalah `.command-os/command.sqlite`. Direktori `.command-os/` tidak boleh masuk Git, `public/`, atau paket deployment. SQLite adalah penyimpanan satu host untuk validasi lokal; belum ada RLS PostgreSQL, autentikasi terkelola, replikasi, backup otomatis atau audit eksternal yang tahan perubahan oleh pemilik host.

Untuk memakai lokasi lain, tentukan `COMMAND_DATABASE_PATH` sebelum memulai server:

```powershell
$env:COMMAND_DATABASE_PATH = 'C:\lokasi-pribadi\menwa-command\command.sqlite'
npm run dev
```

Gunakan path privat yang memang dapat ditulis akun operator. CLI akun harus memakai database yang sama; opsi `--database <path>` dapat dipakai secara eksplisit. Jangan memakai database produksi atau arsip organisasi sebagai lokasi pengujian. Pengujian otomatis memakai database terisolasi, bukan menghapus data operator.

Skema SQLite lokal versi 1:

| Tabel | Isi dan batas |
| --- | --- |
| `users` | UUID, username unik, nama, satu peran yang dibatasi enum, salt/hash scrypt, waktu dibuat. Belum ada tenant/unit/ACL dokumen atau manajemen siklus akun lengkap. |
| `sessions` | Hash token sebagai kunci, FK pengguna, token CSRF dan waktu kedaluwarsa. Token sesi mentah hanya di cookie; sesi berlaku 8 jam dan dihapus saat logout/kedaluwarsa. |
| `actions` | ID aksi tetap, label, URL terbit, revisi integer positif, waktu perubahan. Empat baseline diimpor sekali tanpa menimpa perubahan tersimpan. |
| `tasks` | UUID, FK aksi/pengaju/penyetuju/tugas asal rollback, perintah, label, URL sebelum/sesudah, revisi dasar, validasi JSON, status dan waktu persetujuan/publikasi serta revisi terbit. Tidak ada endpoint mengedit payload tugas. |
| `audit_entries` | ID berurutan, aktor, jenis tindakan, aksi/tugas, detail JSON dan waktu. Trigger SQL menolak UPDATE/DELETE audit; pemilik berkas host tetap memiliki kendali atas database lokal. |
| `login_limits` | Kunci hash alamat IP/username, awal jendela dan jumlah percobaan. Pembatasan default 10 percobaan dalam 15 menit. |

`PRAGMA foreign_keys` aktif dan transaksi mutasi memakai `BEGIN IMMEDIATE`. Publikasi memeriksa URL/revisi dasar lalu memperbarui aksi, status tugas dan audit dalam transaksi yang sama. Permintaan publikasi tugas selesai mengembalikan hasil tersimpan tanpa menaikkan revisi lagi. Nomor revisi ini adalah versi tautan, **bukan nomor surat resmi**.

## 4. Alur perubahan tautan

Empat aksi yang didukung:

| ID tetap | Tombol yang dituju | Baseline repository |
| --- | --- | --- |
| `kc-registration` | Pendaftaran KC VIII | `https://bit.ly/PendaftaranKCVIII` |
| `youth-spark-registration` | Pendaftaran Youth Spark | `https://forms.gle/Xc3QsBLNueoXYLfDA` |
| `kc-jersey-peserta` | Pendataan jersey peserta KC | `https://forms.gle/voyPEgvxvhS8VrKf8` |
| `kc-jersey-official` | Pre-order jersey official KC | `https://forms.gle/RHoXRFTEVKWHQfFx9` |

Baseline ini dibaca dari sumber proyek. Impor bukan bukti persetujuan baru, kepemilikan formulir, atau keberhasilan membuka tujuan pada hari ini. Tidak ada tautan yang diganti dengan tebakan.

1. Editor masuk dan memberi perintah yang menyebut satu aksi serta tepat satu URL. Contoh format: `Ubah link pendaftaran KC menjadi https://forms.gle/IDform`. `IDform` adalah contoh; masukkan URL formulir yang benar dari panitia.
2. Parser deterministik mengenali aksi dan memvalidasi URL. Perintah ambigu, tanpa tindakan perubahan, lebih dari satu URL atau tujuan di luar kebijakan ditolak tanpa mengubah tautan publik.
3. Tinjau pratinjau URL lama/baru, revisi, hasil validasi dan batas pemeriksaan. Tahap 1 mengubah tujuan URL dari aksi yang sudah ada; pembuatan tombol baru, penggantian label, jadwal aktif/kedaluwarsa dan semua jenis tautan belum diterapkan.
4. Orang lain masuk dengan peran penyetuju dan menyetujui tugas tersebut. Persetujuan melekat pada payload tugas tetap dan revisi dasar; API tidak menyediakan pengeditan URL pada tugas. Perubahan berikutnya dibuat sebagai tugas baru dan tidak boleh memakai persetujuan lama. Hash payload terpisah adalah rencana produksi, belum disimpan pada tahap lokal.
5. Jalankan publikasi melalui UI. Server memeriksa kembali sesi/peran, persetujuan dan versi publik; perubahan dan jejak audit disimpan secara atomik. Permintaan dengan versi lama menghasilkan konflik, bukan penimpaan diam-diam.
6. Periksa hasil pada halaman publik lokal. Provider publik menyegarkan setelah publikasi dan ketika jendela kembali fokus. Tombol harus menunjukkan tujuan persis dari proyeksi yang telah diterbitkan.

Status lokal adalah `AWAITING_APPROVAL → APPROVED → COMPLETED`. Publikasi pemulihan mengubah tugas asal menjadi `ROLLED_BACK` dan tugas pemulihannya menjadi `COMPLETED`. `COMPLETED` berarti transaksi publikasi lokal selesai; pemeriksaan tampilan dan tujuan tetap harus dilakukan. State machine orkestrasi yang lebih luas dalam rancangan produksi belum diterapkan seluruhnya.

URL baru dibatasi ke HTTPS `forms.gle` atau halaman `viewform` di `docs.google.com/forms`, tanpa kredensial/port khusus/karakter terlarang. URL pendek KC yang sudah ada hanya dipertahankan sebagai baseline dan dapat dipulihkan melalui riwayat; ini bukan izin memasukkan tautan `bit.ly` baru. Tahap ini **tidak mengambil URL tujuan dari server**: keterjangkauan jaringan, redirect, isi dan pemilik formulir belum diperiksa. Validasi format tidak menjamin formulir yang dipilih benar; peninjau harus memastikan tujuan resmi sebelum menyetujui.

## 5. Sesi dan batas API

Cookie sesi bersifat HttpOnly; mutasi memerlukan Origin host/protokol yang sama dan token CSRF dari sesi. Login memerlukan Origin yang sama, lalu mutasi setelah login mengirim `X-CSRF-Token`. Identitas dan peran dibaca ulang oleh layanan, bukan dipercaya dari badan permintaan atau browser. API bukan konektor bebas untuk model AI.

| Endpoint lokal | Fungsi |
| --- | --- |
| `GET /api/command/session` | Status pengguna dan token CSRF sesi. |
| `POST /api/command/login` | Login individual dengan `{username,password}`. |
| `POST /api/command/logout` | Mengakhiri sesi. |
| `GET /api/command/actions` | Registri/riwayat aksi sesuai kewenangan. |
| `GET /api/command/tasks` | Daftar tugas dan revisi sesuai kewenangan. |
| `POST /api/command/tasks` | Membuat usulan dari `{command}`. |
| `POST /api/command/tasks/:id/approve` | Menyetujui revisi yang ditinjau. |
| `POST /api/command/tasks/:id/publish` | Menerbitkan revisi yang sudah disetujui secara lokal. |
| `POST /api/command/tasks/:id/rollback` | Membuat permintaan pemulihan baru; tidak langsung mengubah tautan. |
| `GET /api/command/audit` | Jejak aktivitas sesuai kewenangan. |
| `GET /api/public/actions` | Proyeksi publik `{actions:[{id,url,revision}]}`, tanpa data akun/draft. |

Badan JSON dibatasi 16 KiB. Parser layanan membatasi perintah 4.000 karakter; UI memakai batas lebih kecil. Endpoint approve/publish/rollback memakai badan `{}`; targetnya ID tugas tetap yang ditampilkan pada pratinjau. Jangan menulis integrasi yang memalsukan identitas penyetuju atau melewati kontrol revisi/CSRF. Endpoint publik mengembalikan URL/revisi/label/waktu terbit, tanpa akun, sesi, draft, perintah dan audit.

## 6. Pemulihan

Pemulihan konten dilakukan dengan permintaan rollback dari tugas yang telah diterbitkan. Layanan membuat tugas baru berstatus menunggu persetujuan. Orang lain dengan peran `approver` atau `admin` meninjau URL yang akan dipulihkan, menyetujui, lalu menerbitkannya melalui alur yang sama. Jika publikasi lain sudah mengubah aksi tersebut, konflik versi harus ditinjau terlebih dahulu. Riwayat asli tidak dihapus, persetujuan lama tidak dipakai ulang, dan nomor revisi tidak mundur.

Untuk backup lokal, hentikan server dan CLI akun terlebih dahulu. Salin direktori data lengkap beserta berkas sidecar SQLite yang ada ke lokasi privat. Uji salinan pada direktori terpisah dengan versi aplikasi yang sama sebelum mengandalkannya. Jangan mengganti database aktif sebagai cara rutin membatalkan satu perubahan tautan; itu dapat menghilangkan pekerjaan lain. Pemulihan sumber aplikasi dan deployment produksi adalah prosedur terpisah.

## 7. Pemeriksaan dan keterbatasan

```powershell
npm run test:command
npm test
```

Suite Command OS menguji perilaku layanan dengan data terisolasi. Suite proyek juga memeriksa sumber/JSX, data kegiatan, navigasi AI dan build portal. Hasil nyata pengujian akhir dicatat pada laporan penyelesaian; dokumen ini tidak mengklaim tes yang belum dijalankan lulus.

Jika UI menampilkan layanan belum dikonfigurasi pada deployment atau saat hanya membuka hasil build, itu sesuai batas tahap lokal. Gunakan server pengembangan untuk uji lokal, atau implementasikan adapter produksi lewat milestone tersendiri. Bila startup gagal pada `node:sqlite`, periksa Node 24. Bila akun tidak ditemukan, pastikan CLI dan Vite menunjuk file database yang sama. Bila mutasi ditolak, periksa sesi, peran, Origin dan token CSRF; jangan menghapus kontrol akses untuk mengatasi kesalahan.

Belum termasuk: koneksi managed Auth/PostgreSQL/private storage, penerbitan publik jarak jauh, upload/OCR, SVG vectorization, template/arsip surat, nomor surat resmi, tanda tangan, pengiriman email, job worker, semantic search, pembuatan desain, riset terjadwal dan otorisasi otomatis L4. Semua itu tetap usulan bertahap dalam [architecture](architecture.md).
