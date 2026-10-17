# Inventaris portal publik MENWA UNJ

Tanggal audit: 18 Oktober 2026, Asia/Jakarta. Inventaris ini mencatat kondisi portal publik sebelum integrasi tahap 1 Command OS. Pemeriksaan dilakukan pada sumber dan berkas lokal; tujuan formulir eksternal tidak dibuka, dan isi dokumen PDF tidak diekstrak.

## Sumber yang aktif

`index.html` memuat `src/main.jsx`, yang memasang `src/App.jsx` dan mengimpor `src/styles.css`. Build aktif menggunakan Vite dari `package.json`. Router yang diimpor oleh seluruh konsumen aktif adalah `src/lib/router.jsx`.

| Bagian | Sumber |
| --- | --- |
| Navigasi utama, organisasi, pendidikan, Mako, administrasi, chat | `src/App.jsx` |
| Hero beranda dan direktori informasi | `src/components/BrandExperience.jsx` |
| Sorotan, dokumentasi, footer, halaman program, Youth Spark | `src/components/Sections.jsx` |
| Galeri dan pilihan formulir jersey | `src/components/JerseyShowcase.jsx` |
| Pencarian cepat, navigasi bagian, FAQ | `src/components/PortalUtilities.jsx` |
| Data program, kegiatan, jersey, musik | `src/data/siteData.js` |
| Pencarian navigasi AI | `src/lib/portalSearch.js`, `api/search.js` |
| Chat navigasi AI | `api/chat.js` |

`useKegiatan` menggunakan `KEGIATAN` dari sumber lokal. `FEED_URL` kosong; jalur feed JSON belum dikonfigurasi. Struktur organisasi dan beberapa layanan administrasi masih ditulis langsung dalam `App.jsx`.

## Rute publik

Rute publik yang dikenali pada snapshot awal:

- `/`, `/informasi`, `/garis-komando`, `/pendidikan`, `/mako`, `/administrasi`.
- `/kc`, `/geranat`, `/pengabdian`, `/pam`, `/diklat`.
- `/youth-spark`, `/youth-spark/seminar-webinar`, `/youth-spark/kompetisi`, `/youth-spark/pelatihan-pelatih`.

Router menormalkan huruf kecil serta garis miring akhir, dan menampilkan URL dengan garis miring akhir. Snapshot awal menampilkan beranda untuk rute tingkat atas yang tidak dikenal; subrute Youth Spark yang tidak dikenal menampilkan landing Youth Spark. Dua kategori Youth Spark selain seminar menampilkan informasi “Segera Hadir”.

## Tautan pendaftaran dan integrasi tahap 1

Nilai berikut adalah nilai sumber yang sudah ada, bukan hasil pemeriksaan akses eksternal atau persetujuan baru dari panitia.

| ID kanonis | Tujuan sumber | Konsumen aktif |
| --- | --- | --- |
| `kc-registration` | `https://bit.ly/PendaftaranKCVIII` | Hero KC, tombol pada isi program KC, direktori, pencarian cepat |
| `youth-spark-registration` | `https://forms.gle/Xc3QsBLNueoXYLfDA` | Hero Youth Spark, informasi dan penutup seminar, direktori, pencarian cepat |
| `kc-jersey-peserta` | `https://forms.gle/voyPEgvxvhS8VrKf8` | Pilihan jersey peserta, direktori, pencarian cepat |
| `kc-jersey-official` | `https://forms.gle/RHoXRFTEVKWHQfFx9` | Pilihan jersey official, direktori, pencarian cepat |

Tahap 1 menyambungkan konsumen tersebut ke `PublishedActionsProvider` melalui `usePublishedAction(id, fallback)`. Provider hanya membaca `GET /api/public/actions` dengan bentuk `{ actions: [{ id, url, revision }] }`; revisi harus bilangan bulat positif dan ID harus salah satu dari empat ID di atas. Nilai draft, status draft eksplisit, ID ganda, dan URL yang tidak valid tidak menggantikan tujuan yang telah dikonfirmasi. Penyegaran dilakukan saat provider dipasang, jendela kembali mendapat fokus, dan peristiwa `command:published` diterima. Sebelum ada respons valid, tombol menggunakan nilai sumber yang sama. Setelah tujuan terbitan diterima, kegagalan jaringan atau penyegaran yang tidak valid mempertahankan tujuan terakhir selama provider terpasang. Draft tidak disimpan atau dibaca dari browser.

Tujuan baru dibatasi pada HTTPS `forms.gle/<id>` atau `docs.google.com/forms/d/[e/]<id>/viewform`, tanpa kredensial, port khusus, spasi, tanda kutip, backtick, atau karakter markup. Tautan KC `bit.ly` yang sudah ada diterima secara persis untuk kompatibilitas. Pendaftaran anggota baru `https://bit.ly/PCABMENWA2026` berada di administrasi dan di luar empat aksi tahap 1.

## Inventaris aset

`public/` berisi **111 berkas**, total **61.460.766 byte (58,61 MiB)**. MiB dihitung dengan pembagi 1.048.576 byte. Angka ini adalah ukuran berkas di disk, bukan perkiraan unduhan awal halaman.

| Jenis | Jumlah |
| --- | ---: |
| SVG | 53 |
| PNG | 27 |
| WebP | 10 |
| JPG | 3 |
| MP3 | 6 |
| Lottie | 6 |
| PDF | 3 |
| Teks | 3 |
| **Total** | **111** |

Semua gambar utama enam program dan tiga PDF lokal yang dirujuk tersedia. Delapan dari sembilan gambar kegiatan yang diharapkan melalui `IMG(name)` tidak tersedia:

- `oprec-menwa-unj.jpg`, `geranat-menwa-unj.jpg`, `pengabdian-menwa-unj.jpg`, `kds-menwa-unj.jpg`.
- `anjangsana-menwa-unj.jpg`, `hutri-menwa-unj.jpg`, `studibanding-menwa-unj.jpg`, `aftermovie-kc-menwa-unj.jpg`.

Seluruh nama di atas merujuk `public/kegiatan/`; gambar KC tersedia. `SmartImg` mengganti gambar yang gagal dimuat dengan latar dan lambang, sehingga kekurangan aset tidak selalu tampak sebagai gambar rusak.

Tiga sampul musik (`public/musik/pop.jpg`, `jazz.jpg`, `indie.jpg`) juga tidak tersedia; pemutar memiliki fallback visual. Dua lokasi alternatif logo Geranat tidak tersedia, tetapi kandidat pertama `public/geranat-menwa-unj.png` tersedia. Ini bukan kegagalan logo utama. Artwork header opsional belum tersedia, dan `HeaderArt` tidak memiliki pemanggilan render aktif pada snapshot awal.

Tiga MP3 identik secara byte disimpan pada `public/audio/` dan `public/musik/`, menggandakan **13.482.526 byte (12,86 MiB)**. Playlist aktif merujuk `/musik/`, dan elemen audio menggunakan `preload="none"`. Duplikasi identik lain terdapat pada logo Geranat, logo KC, logo Jayakarta, serta dua nama poster Youth Spark.

| Berkas besar | Byte | MiB |
| --- | ---: | ---: |
| `public/porsterkc-menwa-unj.png` | 7.260.724 | 6,92 |
| `public/kesbangpol.png` | 5.134.033 | 4,90 |
| `public/_Jersey KC VIII.png` | 2.535.649 | 2,42 |

`public/struktur/` memuat 44 SVG. Kartu organisasi aktif menggunakan ilustrasi maskot bersama dari `PersonPhoto.jsx`; helper `src/lib/foto.js` tidak diimpor. Ilustrasi tersebut sudah diberi keterangan sebagai avatar sementara, bukan foto resmi. Foto tiga narasumber seminar juga menggunakan SVG placeholder karena data narasumber belum memuat properti `photo`.

## Sumber lama dan konsistensi konten

`menwa-site/` memuat **18 berkas, sekitar 3,28 MiB**: salinan lama sebagian sumber dan aset. Folder ini tidak memiliki entry/build aktif dan tidak dirujuk import aplikasi utama. `src/lib/router.js` adalah salinan identik byte dari `router.jsx`, sedangkan seluruh import aktif memilih `.jsx`. `src/index.css` tidak memiliki import aktif.

Catatan konsistensi yang ditemukan pada snapshot awal:

- Administrasi memberi label pendaftaran calon anggota “Resmi Dibuka”, sedangkan kegiatan sumber berakhir 27 September 2026.
- Administrasi menyebut GERANAT VI, sedangkan program saat ini menyebut VII.
- Fakta kegiatan dan daftar tujuan diulang pada data, direktori, chat, pencarian lokal, dan prompt API. Perubahan data melalui empat aksi tahap 1 hanya mengubah tujuan tombol publik; teks informasi, jadwal, dan jawaban AI belum menjadi konten dinamis.
- Tombol login pada footer hanya dirender jika callback diberikan; App awal tidak memberikannya. Mekanisme ini bukan autentikasi pengurus.

Penghapusan salinan lama, kompresi aset, penggantian gambar yang hilang, dan penyelarasan teks di atas merupakan pekerjaan terpisah. Integrasi registri tahap 1 mempertahankan visual serta nilai fallback portal yang sudah ada.
