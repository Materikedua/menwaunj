# Rencana Implementasi: Rebranding Charity Vote, Penutupan Mode Siaga, Reset Data, Penghapusan Bypass QRIS, & Ekspor Spreadsheet

Berdasarkan keputusan pengguna, berikut adalah rencana terstruktur untuk memperbarui sistem e-voting menjadi **Charity Vote: Beasiswa Menwa dan Bantuan Kemanusiaan**, menutup akses publik sementara dengan mode siaga interaktif, membersihkan data lama, menghapus tombol bypass QRIS yang tidak valid, menyediakan fitur ekspor spreadsheet konfidensial, serta menyegarkan palet visual dengan warna semangat khas Google dan hijau portal Menwa UNJ.

---

## 1. Penutupan Halaman & Mode Siaga Interaktif (Standby Mode)
- **Status Publik**: Mengunci pemungutan suara publik pada rute `/geranat/voting` (dan alias `/charity/voting`) dalam status **Mode Siaga Interaktif**.
- **Komponen Tampilan**:
  - Banner status resmi: *"Pintu Charity Vote Sedang Disiapkan — Segera Dibuka"*.
  - Countdown timer dinamis menuju jadwal pembukaan resmi.
  - Informasi program beasiswa (*Menwa Scholarship*), bantuan logistik kemanusiaan, dan donasi tanggap darurat karhutla.
- **Admin Control**:
  - Tombol sakelar Buka / Tutup Gerbang Voting di Command Center Mako Ops (`/mako-ops`) khusus untuk Super Admin (`unjmenwa@gmail.com` dan `rafflysyahpoetra@gmail.com`).
  - Pratinjau langsung untuk admin yang login tanpa terhalang gerbang siaga.

---

## 2. Penghapusan Tombol Bypass QRIS & Validasi Mutasi Jujur
- **Pembersihan di `src/components/DynamicQRISModal.jsx`**:
  - Hapus tombol *"Sudah Transfer? Klik untuk Deteksi Seketika →"* dan fungsi `handleTriggerVerifyNow` yang mensimulasikan status lunas otomatis.
  - Menjaga sistem hanya membaca bukti mutasi yang tervalidasi secara riil via real-time listener Firestore (`/voting_transactions/{txId}`) dan polling resmi backend (`/api/verify-payment`).
  - Memperbarui teks panduan: *"Sistem memantau mutasi secara otomatis setiap 5 detik. Suara akan bertambah seketika setelah pembayaran terkonfirmasi oleh sistem bank."*

---

## 3. Pembersihan & Reset Data Tim E-Voting serta Skor Gamifikasi
- **Reset Tim Charity Vote**:
  - Menghapus bibit tim statis (`INITIAL_SEED_TEAMS`) sehingga daftar kontingen/penerima beasiswa mulai dari keadaan bersih (0 tim / kosong).
  - Menyediakan utilitas admin di Mako Ops untuk mengosongkan koleksi `geranat_teams` dan transaksi lama di Firestore dengan satu kali konfirmasi aman.
- **Reset Skor Gamifikasi & Leaderboard**:
  - Mereset akumulasi poin `tacticalPoints`, `weeklyPoints`, `monthlyPoints`, dan `currentStreak` pengguna menjadi 0.
  - Menghapus data kontestan statis (`SEED_COMPETITORS`) pada papan peringkat agar kompetisi gamifikasi mulai dari titik awal.

---

## 4. Ekspor Terstruktur Spreadsheet Konfidensial (Google Sheets & CSV)
- **Pusat Rekapitulasi Data di Admin Mako Ops**:
  - Menambahkan panel **"Pusat Data Konfidensial & Transparansi Donasi"** pada dashboard admin.
  - Tiga jenis ekspor terpisah dengan satu klik (format `.CSV` UTF-8 dengan BOM, langsung kompatibel 100% untuk dibuka di Microsoft Excel atau diimpor ke Google Sheets):
    1. **Data Transaksi Charity Vote & Donasi**: ID Transaksi, Tanggal/Waktu, Nama Donatur, Alamat Email, Tim/Penerima Donasi, Jumlah Suara, Nominal Donasi (Rp), Status Verifikasi, Metode QRIS.
    2. **Rekapitulasi Tim / Kontingen Penerima**: ID Tim, Nama Tim/Program, Instansi, Kategori, Total Suara Terkumpul, Total Donasi Terkumpul (Rp), Tanggal Pendaftaran.
    3. **Pemberkasan & Permohonan Administrasi**: ID Berkas, Nama Pemohon, Instansi, Layanan, Status, Tanggal Pengajuan, Link/Ukuran Dokumen.
  - Tombol panduan & pintasan: *"Buka di Google Sheets"* yang mempermudah admin membagikan akses *view-only* secara selektif kepada pihak eksternal untuk transparansi.

---

## 5. Rebranding & Palet Desain Energik (Google Design + Hijau Portal)
- **Rebranding Konsep**:
  - Mengubah judul menjadi **"Charity Vote: Beasiswa Menwa & Bantuan Kemanusiaan"**.
  - Subtitle: *"Satu Suara, Sejuta Kebaikan untuk Generasi Bangsa & Tanggap Darurat Bencana"*.
  - Pilar kegiatan:
    - 🎓 *Menwa Scholarship Program* (Beasiswa Pendidikan Kader Berprestasi).
    - 📦 *Bantuan Logistik Kemanusiaan* (Penyaluran logistik untuk warga binaan & kaum dhuafa).
    - 🌲 *Donasi Tanggap Darurat Karhutla* (Bantuan masker, logistik evakuasi, dan pemulihan lingkungan).
- **Penyegaran Palet Warna**:
  - Menggantikan nuansa hijau gelap yang monoton dengan kombinasi warna bersemangat dan modern:
    - **Google Blue (`#4285F4`)**: Aksen modern, tombol aksi, dan lencana transparansi.
    - **Google Green (`#34A853`)**: Indikator status aktif, donasi berhasil, dan keramahan sosial.
    - **Google Yellow (`#FBBC05`)**: Peringatan waktu, lencana prestasi, dan ornamen beasiswa.
    - **Google Red (`#EA4335`)**: Lencana darurat karhutla dan tombol tutup/batal.
    - **Portal Signature Teal (`#006569`)**: Identitas inti kesatuan Menwa UNJ sebagai warna jangkar.
  - Mengadopsi latar belakang putih cerah yang bersih, kartu modern berbayang halus (*soft elevation*), dan kontras tipografi yang ramah mata.

---

## 6. Verifikasi & Pengujian
- Memastikan halaman Charity Vote terkunci untuk publik dan menampilkan mode siaga interaktif dengan countdown.
- Menguji tombol buka/tutup gerbang di panel admin Mako Ops.
- Memastikan tombol bayar instan palsu telah hilang sepenuhnya dari modal QRIS.
- Menguji pengunduhan file spreadsheet CSV untuk ketiga dataset (Charity Vote, Tim, dan Berkas Administrasi).
- Menjalankan `compile_applet` dan `lint_applet` untuk menjamin tidak ada regresi atau kesalahan sintaks.
