# Panduan v3: Program Unggulan, Subtab, Footer, dan Display Kegiatan

`src/App.jsx` di folder ini **sudah dipatch dari App.jsx milikmu**, jadi cukup timpa. Semua tab lain (Struktur, Pendidikan, Mako, Administrasi, LiveChat, LoginModal) isinya tidak diubah.

## 1. Pasang file

```
src/
  App.jsx                      <- timpa file lama
  components/MenwaUI.jsx       <- baru (animasi, navbar, hero)
  components/Sections.jsx      <- baru (program, kegiatan, footer, subtab)
  data/siteData.js             <- baru (SATU file untuk diedit)
  lib/router.js                <- baru (URL /kc/, /geranat/, ...)
scripts/prepare-images.mjs     <- baru
public/
  logo-menwa-unj.png
  foto-kampus-unj.jpg          <- foto hero kampus
  kegiatan/                    <- semua gambar kegiatan (hasil skrip)
  mitra/                       <- logo untuk pill "Didukung oleh" (opsional)
```

Tidak ada dependency baru, hanya React dan lucide-react yang sudah kamu pakai.

## 2. Gambar: rename ke `[nama]-menwa-unj.jpg`

```bash
npm i -D sharp
# taruh foto mentah di folder gambar-mentah/
node scripts/prepare-images.mjs
```

Skrip ini mengubah nama, mengonversi PNG/WEBP ke JPG, memperkecil ke lebar maksimal 1600px, dan mengompres. Dari sinilah ukuran halaman bisa turun jauh. Di akhir ia mencetak daftar gambar yang dipakai website tetapi belum ada.

Empat file yang sudah kita kenal sudah dipetakan:

| Nama lama | Nama baru |
|---|---|
| `FLYER OPREC 2026.png` | `oprec-menwa-unj.jpg` |
| `3X1 KC VIII.jpg` | `kc-menwa-unj.jpg` |
| `CS GERANAT VII.jpg` | `geranat-menwa-unj.jpg` |
| `Menwa UNJ_Pengabdian Cianjur.jpg` | `pengabdian-menwa-unj.jpg` |

Gambar lain yang dibutuhkan (silakan siapkan fotonya): `seminar`, `pam`, `diklat`, `kds`, `anjangsana`, `hutri`, `studibanding`, `aftermovie-kc`, semuanya berakhiran `-menwa-unj.jpg`. Dulu kartu kegiatan memakai foto stok Unsplash, jadi kamu perlu foto asli untuk ini. Tambahkan barisnya di `MAP` pada skrip, atau langsung beri nama `xxx-menwa-unj.jpg` sebelum dijalankan.

Kalau gambar belum ada, website tidak rusak: kartu tampil dengan blok gradien hijau berisi label kategori.

## 3. Hosting: agar `situsmu.com/kc/` bisa dibuka langsung

Navigasi di dalam website sudah jalan tanpa pengaturan apa pun. Pengaturan ini hanya dibutuhkan agar **link langsung** (dibagikan, di-refresh) ke `/kc/` tidak 404. Pilih sesuai hosting:

**Vercel**: buat `vercel.json`
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Netlify**: buat `public/_redirects`
```
/*  /index.html  200
```

**Vite dev (`npm run dev`)**: sudah otomatis.

**GitHub Pages atau hosting statis tanpa rewrite**: buka `src/lib/router.js` dan ubah `MODE = 'hash'`. URL menjadi `situsmu.com/#/kc/` dan jalan di mana saja.

## 4. Cara mengubah display (tanpa menyentuh App.jsx)

Semua ada di `src/data/siteData.js`:

| Mau ubah | Edit bagian |
|---|---|
| Kegiatan terbaru, carousel Sorotan Giat | array `KEGIATAN`. **Urutan di atas = tampil duluan.** Kartu "Kegiatan Terbaru" menampilkan 4 teratas. |
| Kegiatan masuk carousel | beri `highlight: true` |
| Klik kegiatan menuju subtab | isi `program: 'kc'` (slug). Tanpa `program`, klik membuka `url` (mis. link Instagram) |
| Teks, alur, tombol tiap program | array `PROGRAMS` (`about`, `timeline`, `cta`, `facts`) |
| Kontak, sosial media, logo mitra | objek `SITE` |

Menambah satu kegiatan baru = menaruh jpg di `public/kegiatan/` lalu menambah satu blok di `KEGIATAN`:

```js
{
  id: 'seminar-bela-negara-2026',
  title: 'Seminar Kepemudaan dan Bela Negara 2026',
  category: 'Seminar',
  date: '12 Nov 2026',
  location: 'Auditorium UNJ',
  excerpt: 'Ringkasan satu kalimat.',
  image: 'seminar-menwa-unj',
  program: 'seminar',
  highlight: true,
},
```

## 5. Instagram otomatis

Teknisnya mungkin, tetapi tidak sederhana (penjelasan ada di jawaban chat). Website sudah **disiapkan** untuk itu: isi `FEED_URL` di `siteData.js` dengan alamat file JSON berisi array yang formatnya sama dengan `KEGIATAN`, maka website membaca daftar dari sana dan otomatis kembali ke daftar lokal bila gagal dimuat. Dengan begitu, nanti workflow n8n yang menulis JSON itu bisa dipasang tanpa mengubah tampilan sama sekali.

## 6. Yang perlu kamu cek atau isi

- **Alur Pengabdian Masyarakat**: kamu belum menyebutkan alurnya, jadi sementara memakai Perencanaan → Persiapan → Pelaksanaan → Evaluasi. Ubah di `PROGRAMS` (`slug: 'pengabdian'`, `timeline`).
- **Teks program Seminar, Pengamanan, dan Diklat** ditulis umum karena belum ada penjelasan resminya. Ganti `about`, `short`, dan `heroSub` sesuai kenyataan.
- **Tombol CTA** Pengabdian, Seminar, dan Pengamanan mengarah ke WhatsApp piket Mako dengan pesan otomatis. Ubah bila ada formulir resmi.
- **Logo mitra** di pill footer: dua isian awal (UNJ dan Resimen Mahasiswa Jayakarta) hanyalah contoh. Ganti dengan sponsor atau mitra sebenarnya, dan taruh logonya di `public/mitra/`.
- **Akun Instagram utama, TikTok, YouTube**: baris contohnya sudah ada (dikomentari) di `SITE.social`. Aktifkan bila ada.
- **Foto tiap program** juga dipakai sebagai latar header subtab. Karena foto poster biasanya ramai, header memakai blur lebih kuat dan overlay lebih gelap. Kalau mau foto lain untuk header, tambahkan `hero: 'nama-file'` pada program terkait.

## 7. Performa (kenapa Ksatria Cendekia tidak lagi berat)

- Highlight KC besar (border emas, glow, `backdrop-blur`, modal berisi poster penuh) diganti satu kartu program ringan. Detailnya sekarang halaman sendiri, `/kc/`, yang hanya dimuat saat dibuka.
- Slider layar penuh 85vh dengan transisi `scale` untuk tiap berita dan modal-modalnya dihapus, diganti 4 kartu biasa.
- Semua gambar memakai `loading="lazy"` dan `decoding="async"`, plus kompresi JPG dari skrip.
- Carousel bergeser memakai satu animasi `transform` murni CSS, berhenti saat di-hover, dan mati otomatis bila pengguna memilih *reduce motion*.
