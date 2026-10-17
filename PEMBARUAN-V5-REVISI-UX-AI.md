# MENWA UNJ PORTAL — V5 · REVISI UX, BRANDING & AI NAVIGATOR

Tanggal revisi: 18 Oktober 2026  
Sumber: proyek V4, screenshot masalah layout, serta video referensi maskot dari pengguna.

## Ringkasan eksekusi

Versi V5 **mempertahankan portal organisasi dan konten kegiatan dari V4**, tetapi mengembalikan karakter visual khas beranda, memperbaiki hierarki dan navigasi, mengembalikan bagian statistik, menyesuaikan maskot chatbot, dan menambahkan AI untuk *memilih halaman tujuan tanpa menjawab dalam bentuk chat*.

### 1. Beranda ikonik kembali
- Hero sekarang berpusat pada logo Menwa UNJ, judul `KOMANDO RESIMEN MAHASISWA JAYAKARTA`, subjudul `SATUAN UNIVERSITAS NEGERI JAKARTA`, motto organisasi, dan `WIDYA CASTRENA DHARMA SIDDHA`.
- Tetap ada tombol **Jelajahi Pusat Informasi** dan **Kenali Organisasi**.
- Bagian **Pilihan Editorial** dihapus.
- **Sorotan Giat** dari galeri coverflow dinaikkan ke bagian awal setelah akses cepat; program dan dokumentasi tetap ada.
- Konten nilai/pembinaan organisasi ditempatkan setelah statistik agar penjelajahan lebih runtut.

### 2. Statistik Pride dipulihkan
Kembali ada empat kartu animasi penghitung: Anggota Aktif, Prestasi Terdata, Giat Pengabdian Masyarakat, dan Penyelenggaraan Lomba.

**Penting:** Angka `50+`, `150+`, `100+`, dan `30+` berasal dari tampilan V3. File sumber tidak menyertakan dasar data verifikasi. Karena itu bagian statistik diberi catatan **data perlu diverifikasi pengurus**. Ganti dengan angka yang disahkan sebelum publikasi resmi.

Kode: `src/App.jsx` → `V3_STATS`, `PrideSection`; gaya: `src/styles.css`.

### 3. Navbar satu baris + jam
- **KC VIII** dan **Youth Spark** diperjelas dengan `white-space: nowrap`.
- Area navbar desktop dibuat lebih lebar, spasi dipadatkan secukupnya.
- Pada lebar yang lebih sempit, otomatis beralih ke menu seluler daripada memaksa teks bertumpuk.
- Jam **HH:MM WIB** ditambahkan setelah tombol musik. Jam memakai `Intl.DateTimeFormat` dengan zona `Asia/Jakarta`, diperbarui ketika halaman aktif.
- Tab Administrasi tetap tidak muncul pada navigasi utama karena modulnya masih dalam pengembangan. Rute yang sudah ada tidak dihapus.

Kode: `src/components/MenwaUI.jsx`, `src/App.jsx`, `src/styles.css`.

### 4. Tata letak Garis Komando + avatar
- Menghapus margin negatif yang menyebabkan kartu Komandan dan Wakil Komandan menutupi teks header.
- Avatar sementara diganti menjadi chibi dari pengguna: untuk nama yang terpetakan ke karakter perempuan dipakai maskot perempuan; lainnya memakai maskot laki-laki.
- **Avatar tersebut ilustrasi, bukan foto resmi dan bukan pernyataan identitas/jenis kelamin seseorang.** Daftar penugasan avatar dapat disesuaikan pengurus.

Kode: `src/components/PersonPhoto.jsx` dan `src/App.jsx`.

### 5. Chibi chatbot sederhana sesuai video
- Kedua chibi asli pengguna tetap digunakan.
- Ukuran diperkecil menjadi kurang lebih 100 × 94 px di desktop dan 84 × 78 px di ponsel.
- Animasi idle berupa gerakan lompat/bobbing ringan dan halus.
- Saat kursor tepat di atas maskot, muncul **😊 Ada yang bisa kami bantu?** sebagai balon teks mini.
- Tombol tetap membuka chatbot dan mendukung drag. Efek mengikuti kursor berlebihan serta ekspresi kaget diganti sesuai instruksi.
- Mendukung pengaturan sistem `prefers-reduced-motion`.

Kode: `src/components/MenwaPet.jsx` dan `.css`.

### 6. Pusat Informasi memakai AI Navigator
**Alur:** pengunjung memasukkan pertanyaan bahasa alami → frontend mengirim ke `/api/search` → server menggunakan variabel lingkungan `GEMINI_API_KEY` (sama dengan `/api/chat`) → AI memilih **satu rute lokal yang diizinkan** → browser langsung berpindah ke halaman tersebut. **Tidak ada jawaban teks AI**.

Contoh:
- “Saya mau pesan baju official” → `/kc`
- “Rundown dan sesi UMKM hari seminar?” → `/youth-spark/seminar-webinar`
- “Siapa pimpinan satuan?” → `/garis-komando`
- “Di mana alamat markas?” → `/mako`

Perubahan tersedia pada:
- `/informasi`: input pencarian AI beraksi dengan Enter/tombol Cari dengan AI.
- Pencarian cepat **Ctrl/⌘ + K**: Enter juga memilih halaman lewat AI; daftar hasil manual tetap bisa diklik.
- Filter kategori lebih besar dan dapat membungkus menjadi beberapa baris di desktop; digeser horizontal hanya di layar kecil.

**Keamanan dan batasan:**
- Kunci API **tidak** dikirim ke browser; set variabel `GEMINI_API_KEY` di Vercel Environment Variables.
- Server **memvalidasi rute AI** terhadap allowlist. URL eksternal atau teks bebas dari AI tidak akan dipakai untuk navigasi.
- Jika AI tidak tersedia, tersedia pencocokan lokal berbasis kata kunci; ini **bukan** pencarian semantik penuh, sehingga kalimat sangat unik mungkin tidak menemukan hasil.
- Jika tak ada halaman cocok, UI hanya menampilkan pesan status singkat dan tidak membuat jawaban chat.
- Konten halaman tidak diambil secara bebas dari internet. AI hanya memilih dari halaman website yang memang telah dibangun.

Kode: `api/search.js` (baru), `src/lib/portalSearch.js` (baru), `src/components/BrandExperience.jsx`, `src/components/PortalUtilities.jsx`.

### 7. Informasi chatbot ikut diselaraskan
Prompt dan jawaban lokal pada `api/chat.js` diperbarui untuk Youth Spark 24 Oktober 2026, Aula Latief Hendraningrat dan formulir yang benar. Chatbot lama tetap ada sebagai fitur terpisah dari AI Navigator.

## Lokasi file baru/diubah

| File | Tujuan |
|---|---|
| `src/App.jsx` | Jam, Pride, hero, tata letak struktur, urutan bagian |
| `src/components/BrandExperience.jsx/.css` | Hero ikonik, direktori AI, filter lebih besar |
| `src/components/MenwaUI.jsx` | Navbar desktop responsif satu baris |
| `src/components/Sections.jsx` | Sorotan Giat naik ke awal |
| `src/components/MenwaPet.jsx/.css` | Mini chatbot chibi + hover emoji |
| `src/components/PersonPhoto.jsx` | Avatar ilustrasi sementara |
| `src/components/PortalUtilities.jsx/.css` | Command Palette AI routing |
| `src/styles.css` | Statistik dan jam |
| `src/lib/portalSearch.js` | Client API dan fallback rute |
| `api/search.js` | Backend AI rute dengan allowlist |
| `api/chat.js` | Koreksi data lama |
| `.env.example` | Contoh environment key dan model |
| `scripts/validate-events.mjs` | Tes konten V5 |

## Menjalankan lokal

```bash
npm install
npm run dev
```

- Kunjungi alamat localhost yang ditampilkan Vite.
- Tanpa deployment serverless, `api/search` mungkin tidak aktif saat menjalankan Vite saja. Pencarian masih mempunyai **fallback lokal**, tetapi AI Gemini baru aktif saat `/api/search` tersedia di server/Vercel.
- Uji build dengan `npm run build`, lalu deploy ulang ke Vercel.

## Pengaturan Vercel

1. Project root: folder `menwa-unj-portal-v5`.
2. Framework: Vite; build command `npm run build`; output `dist`.
3. Pada **Project Settings → Environment Variables**, tambahkan:
   - `GEMINI_API_KEY`: API key Gemini milik pengurus, bersifat rahasia.
   - `GEMINI_MODEL`: contoh `gemini-2.5-flash`, atau model yang tersedia pada akun API.
4. Deploy, kemudian uji secara online `/api/search` dengan input dari UI Pusat Informasi.
5. Jangan menaruh key di `src/`, `public/`, atau mengunggah `.env` berisi nilai rahasia.

## Validasi
- Syntax Node dan validasi import: **lulus**.
- JSX via Babel parser: **lulus**.
- Konten, tautan jersey, rundowns, aset dan maskot: **lulus**.
- Endpoint routing dengan fallback enam pertanyaan + method 405: **lulus**.
- Build Vite dan uji visual browser menyeluruh: **belum terverifikasi**; pemasangan dependensi di lingkungan pembuatan mengalami timeout. Jalankan setelah `npm install` pada komputer/CI.

## Checklist sebelum publikasi

- [ ] Verifikasi dan setujui angka statistik Pride.
- [ ] Periksa pemetaan avatar anggota; ganti dengan foto berizin bila tersedia.
- [ ] Verifikasi tautan dan isi formulir kegiatan.
- [ ] Periksa izin publikasi PDF proposal dan juknis. Juknis sumber memiliki penanda **KONFIDENSIAL**.
- [ ] Konfigurasi key Gemini di server dan uji AI Navigator pada situs ter-deploy.
- [ ] Uji desktop 1280, 1440, dan 1920 px; ponsel 375 dan 430 px.
- [ ] Uji keyboard, performa mobile, dan reduced motion.

## Catatan desain

Prioritas V5 adalah **branding yang dikenali, informasi yang mudah dituju, dan animasi yang tidak mengganggu pembacaan**. Animasi dibuat mendukung tujuan, bukan sekadar dekorasi.
