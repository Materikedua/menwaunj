# Rencana Penguatan Keamanan Mako Ops, Reset Password, Hak Akses Canvas & Deteksi Penuh Foto Beranda

Rencana ini menangani secara menyeluruh 5 kendala utama yang dihadapi: otentikasi Google domain Vercel, fitur Lupa Password otomatis via Gmail, pengetatan hak akses Canvas (publik hanya baca, Super Admin dapat mengubah), pengamanan gerbang Command Center (tanpa prefill kata sandi), dan pelacakan seluruh slot foto Beranda di Image Tracker.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan konfirmasi yang Anda berikan:
> 1. **Pintu Gerbang `/mako-ops`**: Input form dibuat bersih dan kosong tanpa ada pembocoran kata sandi bawaan di placeholder atau teks panduan.
> 2. **Hak Akses Canvas**: Publik hanya mode baca (read-only). Tombol hapus/edit dinonaktifkan untuk publik dan hanya aktif jika Super Admin (`unjmenwa@gmail.com` atau `rafflysyahpoetra@gmail.com`) telah login.
> 3. **Image Tracker Beranda**: Seluruh foto Sorotan Giat (carousel), Dokumentasi Kegiatan (5 kartu), Hero Banner, dan Logo Satuan didaftarkan secara lengkap sehingga admin dapat mengelola semua foto di beranda secara visual.

---

### 1. Overview & Core Concept

- **Apa yang Dibangun**:
  - **Sistem Pemulihan Akun (Lupa Kata Sandi)**: Penambahan alur reset password mandiri via Firebase Auth yang mengirimkan link verifikasi dan reset langsung ke kotak masuk Gmail pengguna.
  - **Proteksi Tingkat Tinggi Canvas & Content Registry**: Penguncian operasi mutasi (`deleteComponent`, `softRemoveRegistryItem`, `rollbackSnapshot`, `resetToDefaults`) sehingga hanya dieksekusi oleh Super Admin terverifikasi. Pengunjung umum tidak memiliki hak menghapus atau merusak tampilan web.
  - **Gerbang Aman `/mako-ops`**: Form terminal otorisasi dibuat steril tanpa teks bocoran sandi, dengan validasi kredensial perwira mako atau sesi Google Super Admin.
  - **Pelacakan Komprehensif Image Tracker Beranda**: Registrasi 15+ slot foto resmi di Beranda (8 kartu Sorotan Giat, 5 kartu Dokumentasi Kegiatan, Hero Banner, Logo & Lambang) ke dalam Content Registry dengan konversi format SVG otomatis.
  - **Panduan & Penanganan Otentikasi Domain Vercel**: Instruksi terarah untuk mendaftarkan URL Vercel ke *Authorized Domains* Firebase Console guna menghentikan penolakan login Google "emi-1".

---

### 2. User Experience & Visual Design

- **Alur Lupa Kata Sandi**:
  - Pada modal akun (tab *Masuk Akun*), terdapat tautan `Lupa Kata Sandi?` tepat di samping input kata sandi.
  - Saat diklik, modal beralih ke formulir pemulihan yang elegan dengan input email, tombol `Kirim Tautan Reset ke Gmail`, dan status notifikasi instan.
- **Tampilan Pintu Gerbang Command Center**:
  - Input `Username` dan `Passcode` sepenuhnya kosong.
  - Placeholder berupa teks bantuan netral (`contoh: admin_piket`, `••••••••••••`).
  - Tidak ada lagi teks rahasia yang tertera di UI publik.
  - Jika Super Admin sudah login di web, gerbang memberikan opsi satu-klik `Masuk sebagai Super Admin Terverifikasi`.
- **Tampilan Canvas Publik vs Admin**:
  - Publik: Toolbar editing dan tombol hapus/reset disembunyikan secara bersih.
  - Super Admin: Muncul badge keamanan `Mode Komando Aktif` dengan tombol kontrol penuh.
- **Panel Image Tracker**:
  - Menampilkan katalog foto Beranda secara visual dalam bentuk grid kartu taktis.
  - Masing-masing kartu menampilkan thumbnail, judul giat, kategori (Sorotan Giat / Dokumentasi), rasio dimensi, dan tombol `Ganti Foto / Upload SVG`.

---

### 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Mekanisme Reset Password**:
  - *Pendekatan*: Memanfaatkan fungsi resmi Firebase Auth `sendPasswordResetEmail(auth, email)` dengan template email bawaan Google yang mengirimkan link aman langsung ke Gmail pengguna.
  - *Alasan*: Standar keamanan industri, tidak menyimpan password dalam bentuk teks, dan langsung terintegrasi dengan akun Google/Gmail pengguna.
- **Keputusan 2: Pengetatan Role-Based Access Control (RBAC) pada Canvas**:
  - *Pendekatan*: Mengintegrasikan `useAuth()` ke dalam `useCanvasStore()`. Jika `!isAdmin`, fungsi penghapusan dan pengubahan mengembalikan penolakan dan tidak merender kontrol edit di layar pengunjung.
  - *Alasan*: Mencegah vandalisme atau penghapusan konten oleh pengunjung umum yang tidak memiliki wewenang.
- **Keputusan 3: Registrasi Lengkap Foto Beranda**:
  - *Pendekatan*: Menambahkan seluruh item array `KEGIATAN` dan `DokumentasiKegiatan` dari `siteData.js` ke dalam `INITIAL_CONTENT_REGISTRY` untuk tab `beranda`.
  - *Alasan*: Memastikan admin memiliki kendali penuh atas setiap visual kartu yang tampil di halaman beranda tanpa ada foto yang terlewat.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PORTAL MENWA UNJ V8                            │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐        ┌──────────────────┐
│  useAuth() Hook  │       │ useCanvasStore() │        │  Command Center  │
│ - Reset Password │◄──────┤ - RBAC Guard     │◄───────┤ - Secure Gateway │
│ - Google Login   │       │ - 15+ Foto Giat  │        │ - Image Tracker  │
│ - Super Admin    │       │ - Read-Only Pub  │        │ - Clean Inputs   │
└────────┬─────────┘       └─────────┬────────┘        └──────────────────┘
         │                           │
         ▼                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                Firebase Services (Project: admin-raffli)                │
│  - Firebase Auth (Email/Pass & Google OAuth)                            │
│  - Firestore: /content_registry/, /audit_logs/, /command_center_logs/   │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Komponen Utama yang Dikerjakan:
1. **`src/firebase.js` & `src/hooks/useAuth.jsx`**:
   - Ekspor fungsi `sendPasswordResetEmail` dari Firebase SDK.
   - Tambahkan method `resetPassword(email)` ke dalam `useAuth`.
2. **`src/components/UserAccountModal.jsx`**:
   - Tambahkan state dan tampilan form "Lupa Kata Sandi".
   - Integrasikan pengiriman link reset kata sandi ke Gmail.
3. **`src/lib/canvasStore.jsx`**:
   - Daftarkan seluruh item foto Beranda (Sorotan Giat: Oprec, KC VIII, Geranat VII, Pengabdian, KDS, Anjangsana, HUT RI, Studi Banding; Dokumentasi: KC VII, Geranat VI, Pengabdian 26/25, Rakomsat 25).
   - Terapkan validasi `isAuthorized` untuk mutasi dan hapus komponen.
4. **`src/components/CommandCenterPage.jsx`**:
   - Hapus semua prefill default kredensial di gateway `/mako-ops`.
   - Perbarui Image Tracker agar menyajikan filter dan slot gambar Sorotan Giat & Dokumentasi secara utuh.
5. **Panduan Konfigurasi Domain Vercel**:
   - Menyertakan dokumentasi penambahan domain Vercel ke Firebase Console untuk mengeliminasi error `auth/unauthorized-domain`.
