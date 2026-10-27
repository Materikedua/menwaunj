# Penyempurnaan Subtab `/gallery`, Konsolidasi Tab `Adminu`, Ringkasan Tombol Musik, Galeri Seminar Youth Spark & Integrasi Penuh Image Tracker Command Center

Menyempurnakan subtab `/gallery` dan *Album Preview Banner* Beranda, memindahkan filter ke atas galeri dengan animasi **Slide Horizontal Kinetik**, memperbaiki *pop-up* Lightbox agar *viewport-fixed* ala Instagram, menstandarkan nama **`GERANAT`**, menggabungkan tab **Adminu (Administrasi Umum + Markas Komando di bawahnya)** pada navigasi header, meringkas tombol musik di header menjadi **satu tombol ikon musik saja**, mengarahkan tab **Youth Spark** ke `/youth-spark` lengkap dengan **Galeri Dokumentasi Seminar Youth Spark** di seluruh tab terkait, serta mendaftarkan seluruh foto visual sementara agar dapat diganti gambar & caption-nya melalui **Command Center (`/mako-ops`)**.

## User Review & Critical Decisions

> [!IMPORTANT]
> Rangkuman seluruh keputusan dan tambahan terbaru dari pengguna:
> - **Konsolidasi Tab `Adminu` di Header**: Tab *Kontak & Markas* pada header diganti menjadi **`Adminu`** (`/administrasi`). Halaman **Adminu** menampilkan seluruh layanan **Administrasi Umum** di bagian atas, diikuti langsung oleh informasi lengkap **Markas Komando & Kontak Resmi** di bagian bawahnya.
> - **Tombol Musik Header Ringkas (`MusicPlayer`)**: Diubah menjadi **satu tombol ikon musik saja** di bar navigasi (tanpa tombol *Play* terpisah di sebelahnya). Saat ikon musik diklik, barulah muncul pop-up/panel ringkas berisi tombol *Play/Pause*, judul mars/lagu, dan pengatur suara.
> - **Navigasi `/youth-spark` & Galeri Dokumentasi Seminar Youth Spark**: Tab **Youth Spark** di header diarahkan ke `/youth-spark` dengan status kegiatan telah terlaksana, dilengkapi **Seksi Galeri Dokumentasi Seminar Nasional Youth Spark** (baik di halaman `/youth-spark`, `/youth-spark/seminar-webinar`, subtab `/gallery`, maupun di **Image Tracker Command Center**) agar Admin dapat langsung mengunggah foto dan mengisi caption dokumentasinya.
> - **Filter di Atas Galeri + Animasi Slide Horizontal Kinetik**: Dock filter dipindah ke atas galeri disertai efek *Slide Horizontal Kinetik + Stagger Fade-In Kartu*.
> - **Pop-Up Lightbox Ala Instagram (`createPortal`)**: Selalu muncul tepat di tengah layar aktif (*viewport*) tanpa harus *scroll* halaman, dan sangat mudah ditutup (klik area luar, tombol `✕`, atau tombol `ESC`).
> - **Standarisasi `GERANAT` & Pengosongan Komentar Awal**: Seluruh teks `GPS` diganti menjadi **`GERANAT`**, komentar *dummy* dikosongkan (`0 komentar`), dan disiapkan **Mode Hibrida Sinkronisasi Sosmed (IG/YT/TikTok/Berita)** serta tombol **Ganti Foto & Caption** di Command Center.

---

## 1. Overview & Core Concept

1. **Tab Header `Adminu` (Gabungan Administrasi Umum + Markas Komando)**:
   - Mengganti item navigasi header dari `Kontak & Markas` menjadi **`Adminu`** (ikon `FileText`, mengarah ke `/administrasi`).
   - Pada halaman `Adminu` (`/administrasi`), bagian pertama menampilkan panduan surat-menyurat, SOP layanan administrasi, dan tombol pengajuan formulir, lalu tepat di bawahnya ditampilkan seksi **Markas Komando & Kontak Satuan** (lokasi Gedung G R.107 Kampus A UNJ, peta interaktif, jam piket Mako, dan kontak langsung). Rute `/mako` juga tetap diarahkan ke tampilan gabungan ini agar tidak ada tautan yang terputus.
2. **Penyederhanaan Tombol Musik Header (`MusicPlayer.jsx`)**:
   - Menghapus tombol *Play/Pause* tambahan yang memakan ruang di header.
   - Menampilkan **hanya satu tombol bulat ikon Musik (`Music`)** (dengan indikator denyut halus saat musik sedang diputar). Ketika tombol ikon musik tersebut diklik, muncul *dropdown popover* elegan untuk menekan *Play/Pause*, mengganti lagu, atau mengatur volume.
3. **Pengarahan Tab `/youth-spark` & Penyediaan Galeri Dokumentasi Seminar Youth Spark**:
   - Mengubah navigasi tab **Youth Spark** agar mengarah ke `/youth-spark`.
   - Karena kegiatan Seminar Nasional Youth Spark telah terlaksana, disiapkan **Galeri Dokumentasi Seminar Youth Spark** yang terintegrasi di:
     - Halaman `/youth-spark` dan `/youth-spark/seminar-webinar` (seksi khusus Galeri Dokumentasi & Rekaman Jejak Seminar Youth Spark).
     - Subtab `/gallery` (kategori/filter khusus **Youth Spark** dan album multi-foto yang siap diisi).
     - **Command Center (`/mako-ops` $\rightarrow$ Image Tracker)**: Slot khusus aset foto & caption `Youth Spark` (`tabId: 'youth-spark'` & `tabId: 'gallery'`) sehingga Admin cukup klik **Ganti Foto** dan **Edit Caption** untuk menampilkan dokumentasi terbaru.
4. **Pop-Up Galeri Ala Instagram (`createPortal`) & Filter di Atas Galeri**:
   - Lightbox Modal dirender langsung ke `document.body` dengan `fixed inset-0 z-[999]` dan penguncian *scroll* layar belakang.
   - Baris filter Proker (12 Proker termasuk **GERANAT**, ditambah filter **Youth Spark** & *Kegiatan Lainnya ▾*) serta filter Tahun (`2026`–`2023`) ditempatkan di **atas galeri** dengan animasi **Kinetic Horizontal Slide + Stagger Fade-In**.
5. **Deteksi & Penggantian Seluruh Foto Sementara di Command Center**:
   - Seluruh foto pada **Sorotan Giat**, **Profil Anggota & Pimpinan Garis Komando**, **Seminar Youth Spark**, dan **Album Galeri `/gallery`** terdaftar di `contentRegistry` dan memiliki tombol langsung **Ganti Foto (File / URL)** serta **Edit Caption** di tab **📸 Image Tracker**.

---

## 2. Technical Architecture & Component Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         Header Navigation Bar                              │
│  Beranda | Galeri | Informasi | KC VIII | Youth Spark | Organisasi | Adminu│
│  + [🎵 Ikon Musik Ringkas (Klik -> Popover Play/Pause)]                     │
└──────┬───────────────────────────┬─────────────────────────────┬───────────┘
       │                           │                             │
       ▼                           ▼                             ▼
┌─────────────────────┐ ┌─────────────────────────┐ ┌────────────────────────┐
│   Subtab /gallery   │ │  Subtab /youth-spark    │ │ Subtab /administrasi   │
│ • Top Filter Bar    │ │ • Info & Sorotan Giat   │ │        (Adminu)        │
│ • Kinetic Slide Grid│ │ • Galeri Dokumentasi    │ │ • Bagian 1: Layanan    │
│ • Portal IG Modal   │ │   Seminar Youth Spark   │ │   Administrasi Umum    │
│ • GERANAT & Youth   │ │   (Sinkron ImageTracker)│ │ • Bagian 2 (Bawah):    │
│   Spark Albums      │ └─────────────────────────┘ │   Markas Komando &     │
└─────────────────────┘                             │   Kontak Resmi Mako    │
                                                    └────────────────────────┘
```

### Rincian Pembaruan Komponen:
- **Header & Router (`App.jsx` & `router.jsx`)**:
  - Mengganti item akhir `NAV_ITEMS` menjadi `{ id: 'administrasi', label: 'Adminu', ... }`.
  - Mengubah target klik tab `youth-spark` di `handleQuickSearch` menjadi `'/youth-spark'`.
  - Menggabungkan komponen `MakoTab` ke bagian bawah `AdministrasiUmumTab` sehingga halaman `Adminu` menampilkan Administrasi Umum di atas dan keterangan Markas Komando di bawahnya.
- **Music Player (`MusicPlayer.jsx`)**:
  - Merombak tampilan tombol di header menjadi satu tombol ikon musik (`w-9 h-9 rounded-full`) tanpa tombol *Play* di sebelahnya; klik pada ikon membuka *popover* kontrol pemutar musik.
- **Youth Spark & Galeri (`Sections.jsx`, `DocumentationWall.jsx`, `menwaInteractiveData.js`, `canvasStore.jsx`)**:
  - Menambahkan seksi **Galeri Dokumentasi Seminar Nasional Youth Spark** pada halaman `/youth-spark` dan `/youth-spark/seminar-webinar` yang terhubung langsung ke `contentRegistry` (`CNT-YS-DOK-1` s.d. `CNT-YS-DOK-6`).
  - Menambahkan album & filter **Seminar Nasional Youth Spark** di `/gallery` dan mendaftarkan seluruh slot fotonya di **Image Tracker Command Center**.
  - Mengganti seluruh penamaan `GPS` menjadi **`GERANAT`**, mengosongkan komentar awal (`comments: []`), memindahkan filter ke atas galeri dengan animasi *Slide Horizontal Kinetik*, dan merender modal via `createPortal`.
