# Audit awal MENWA UNJ dan dasar implementasi Command OS

Tanggal: 18 Oktober 2026, Asia/Jakarta. Baseline sumber: commit `15c20b6`, branch awal `main`. Audit dilakukan pada repository lokal; ketersediaan situs produksi dan akun eksternal tidak dianggap terverifikasi oleh pemeriksaan ini.

## Peta sistem yang terverifikasi

```text
index.html → src/main.jsx → src/App.jsx
  ├─ src/styles.css + komponen dan CSS masing-masing
  ├─ src/lib/router.jsx → rute publik dan navigasi History API
  ├─ src/data/siteData.js → program, kegiatan, tautan, narasumber, musik
  ├─ Sections.jsx / BrandExperience.jsx / PortalUtilities.jsx
  ├─ /api/search → Gemini opsional + fallback navigasi deterministik
  └─ /api/chat → Gemini opsional + fallback bantuan navigasi
```

React 18, Vite 5, JavaScript dan Tailwind/CSS adalah stack aktif. `menwa-site/` merupakan salinan lama yang tidak dirujuk entry utama; `src/index.css` juga bukan stylesheet entry aktif. `src/lib/router.js` menduplikasi router JSX sebelum perbaikan tahap pertama. Tidak ditemukan dependensi atau layanan akun, database, storage privat, arsip surat, antrean pekerjaan, persetujuan, maupun audit persisten pada baseline.

Inventaris rute, empat tujuan pendaftaran yang dimigrasikan, serta rincian aset tersedia dalam [content-inventory](content-inventory.md). Public portal mencakup beranda, informasi, organisasi, pendidikan, Mako, administrasi, KC, Youth Spark dengan tiga subhalaman, Geranat, pengabdian, PAM dan diklat. Tautan pendaftaran di repository diperlakukan sebagai nilai sumber yang harus dipertahankan, bukan hasil pemeriksaan akses atau persetujuan baru.

## Temuan dan prioritas

| Prioritas | Bukti pada baseline | Dampak dan tindak lanjut |
| --- | --- | --- |
| P1 | Tidak ada otorisasi backend; footer hanya mendukung callback login opsional | Jangan memuat data internal/rahasia ke UI publik. Tahap 1 menambahkan layanan lokal terpisah dengan sesi dan RBAC; produksi tetap tertutup sampai adapter terkelola tersedia. |
| P1 | `api/chat.js` mengembalikan JSON model tanpa validasi bentuk/path, input tanpa batas eksplisit, fetch tanpa timeout | Respons model tak sesuai kontrak dapat mengganggu tampilan chat; probe terisolasi menerima suggestions berupa string. Terapkan validasi output, batas input/waktu dan rate limit pada milestone pemeliharaan. Ini bukan bukti XSS atau redirect lintas origin yang berhasil. |
| P1 | `.gitignore` semula hanya berisi `.vercel` | Secret lokal, database dan output build memerlukan aturan pengecualian. Aturan ditambah dalam tahap 1. Sebanyak 6.055 file `node_modules` sudah dilacak Git; menambah ignore tidak menghapus file yang telah dilacak. Pembersihan index terpisah diperlukan. |
| P1 | Audit dependensi melaporkan Vite/PostCSS high, esbuild moderate | Rencanakan upgrade tooling terkendali beserta pengujian. Temuan tooling bukan bukti eksploitasi situs statis. Dev server dibatasi localhost; upgrade belum dilakukan oleh tahap registri. |
| P2 | `npm test` gagal pada `validate-source.mjs` karena URL.pathname di Windows | Lokasi menjadi `C:\C:\Users\Santa%20Nayla\...`; perbaiki memakai `fileURLToPath`. Salinan router `.js` mengandung JSX; jadikan compatibility re-export ke `.jsx` yang aktif. |
| P2 | Delapan dari sembilan JPG kegiatan tidak ada; fallback tampilan menyembunyikannya | Pipeline validasi aset perlu membedakan fallback dari konten asli. Tidak mengarang foto pengganti. |
| P2 | Rute tidak dikenal masuk beranda; subrute Youth Spark tidak dikenal masuk landing | Tambahkan penanganan 404 pada milestone navigasi agar tautan rusak terlihat. Rute internal baru dipisahkan secara eksplisit. |
| P2 | Tanggal/status PCAB dan penomoran Geranat berbeda antar record/JSX | Perlu konfirmasi pemilik konten sebelum memperbaiki informasi operasional; jangan menebak status terbaru. |
| P2 | URL dan fakta diulang dalam data, JSX dan prompt chatbot | Tahap registri memusatkan empat tujuan publik; prompt chat tetap navigasi dan belum menjadi sumber konten terkelola. |
| P3 | `public/` 111 berkas, 61.460.766 byte; tiga pasang MP3 identik | Optimasi media dapat mengurangi paket; jangan menghapus aset yang sudah digunakan tanpa verifikasi konsumen. |

Semua data pada `public/`, termasuk tiga PDF yang ditemukan, merupakan kandidat publikasi statis. README baseline menyatakan dokumen sumber juknis bertanda KONFIDENSIAL dan meminta izin pengurus sebelum publikasi. Audit ini tidak menyimpulkan apakah izin tersebut sudah diberikan, dan tidak mengklaim kerahasiaan dapat dipenuhi hanya dengan menutup halaman admin. Review izin publikasi PDF perlu dilakukan pemilik dokumen.

## Integrasi dan akses

| Integrasi | Fakta yang diperiksa | Batas verifikasi |
| --- | --- | --- |
| GitHub | Remote lokal mengarah ke `Materikedua/menwaunj` | Baca/tulis remote dan pembuatan PR tidak diuji. |
| Vercel | `vercel.json` memakai fallback SPA; CLI `whoami` berhasil dan `inspect` mengonfirmasi deployment existing `menwaunj.vercel.app` berstatus Ready dengan API chat/search | Sesi akun CLI telah diverifikasi baca-saja. Perubahan tahap 1 belum dideploy; environment remote dan adapter data terkelola belum diverifikasi. |
| Gemini | Kedua API memakai `GEMINI_API_KEY` sisi server dan `GEMINI_MODEL` | Nama environment provider tidak ditemukan pada proses yang diperiksa; dashboard remote dan akses model tidak diuji. Kunci tidak dicetak atau disalin. |
| Registrasi | Empat URL sumber berhasil diinventarisasi | Formulir eksternal tidak dibuka untuk mengirim data; kepemilikan, redirect dan statusnya belum diverifikasi. |
| Auth/DB/storage | Tidak ada layanan terkelola aktif pada baseline | SQLite tahap 1 hanya menambahkan penyimpanan lokal yang nyata; PostgreSQL/Auth/storage produksi masih rancangan. |

## Hasil pengujian sebelum perubahan

| Pemeriksaan | Hasil baseline |
| --- | --- |
| `npm test` | Gagal pada pemeriksaan sumber Windows; tahap sesudahnya tidak dijalankan oleh rangkaian ini. |
| `npm run test:jsx` terpisah | Lulus, 19 berkas sumber. |
| `npm run test:events` terpisah | Lulus. |
| `npm run test:v7` terpisah | Lulus. |
| `npm run test:api` terpisah | Lulus; syntax + enam fallback navigasi dan method 405. Bukan pengujian live Gemini. |
| `npm run build` terpisah | Lulus; JavaScript utama 351,27 kB, gzip 100,46 kB. Bukan deployment. |

Kekuatan suite baseline terutama pemeriksaan struktur/data/sintaks. Ini belum membuktikan aksesibilitas, performa perangkat nyata, alur akun, atau tampilan semua rute di browser.

## Keputusan implementasi

Pengguna menyetujui implementasi lokal tahap pertama setelah menerima [implementation-proposal](implementation-proposal.md). Lingkupnya: baseline validasi, Command Center, akun individual/peran, database lokal persisten, alur registri tautan dengan persetujuan dan rollback, serta pengujian. Branch kerja: `codex/command-os-foundations`.

Penyimpanan SQLite lokal dipilih agar alur dapat dieksekusi dan diuji tanpa mengarang akun/koneksi cloud. Ini adalah penyempitan implementasi lingkungan lokal dari usulan PostgreSQL produksi, bukan migrasi produksi tersembunyi. Rancangan produksi, skema domain lanjutan, pembagian tool agen dan backlog ada di [architecture](architecture.md); operasi lokal dan peralihan produksi ada di [operations](operations.md) dan [migration](migration.md).

Tahap berikutnya membutuhkan proyek database/auth/storage organisasi, keputusan role/scope, akses staging Vercel, dan konfigurasi secret melalui kanal server. Tidak perlu akses penerbitan surat, email, pembayaran, atau penghapusan arsip untuk milestone registri ini.

Referensi teknis: [Vercel Functions limits](https://vercel.com/docs/functions/limitations), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [private Storage access](https://supabase.com/docs/guides/storage/security/access-control). RLS/grants dan storage terkelola dalam referensi tersebut adalah target produksi yang belum diterapkan pada layanan SQLite lokal. Advisory tooling: [Vite](https://github.com/vitejs/vite/security/advisories/GHSA-fx2h-pf6j-xcff), [PostCSS](https://github.com/postcss/postcss/security/advisories/GHSA-6g55-p6wh-862q), [esbuild](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99).
