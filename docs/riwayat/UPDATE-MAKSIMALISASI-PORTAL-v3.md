# UPDATE MAKSIMALISASI PORTAL MENWA UNJ — V3

Pembaruan ini berfokus pada **elegansi visual, kemudahan interaksi, dan karakter website yang lebih hidup**.

---

## 1) Perubahan utama yang dikerjakan

### A. Chatbot diganti memakai chibi asli dari lampiran
Sebelumnya chatbot memakai maskot SVG buatan. Sekarang visual chatbot memakai **dua chibi asli** yang Anda lampirkan.

**Perilaku baru chatbot:**
- Bergerak **loop otomatis** dengan nuansa jalan/lompat kecil.
- Saat kursor **mendekat**, chibi memberi reaksi seperti **melihat ke arah kursor**.
- Saat kursor **tepat berada di area chibi**, maskot **kaget** dan mengeluarkan **tanda seru (!)**.
- Tetap bisa dipakai sebagai tombol pembuka chatbot dan tetap bisa digeser oleh pengguna seperti versi sebelumnya.

**Aset baru:**
- `public/mascot/chibi-menwa-boy.png`
- `public/mascot/chibi-menwa-girl.png`
- `public/mascot/chibi-menwa-duo.png`

---

### B. Mockup jersey disederhanakan
Sebelumnya preview dibuat seperti simulasi putar 3D/manekin.
Sekarang diubah menjadi **mockup statis yang lebih elegan dan mudah dipahami**, mengikuti arah referensi Anda.

**Perubahan:**
- Mode putar 3D dihapus dari area showcase.
- Diganti menjadi **dua tampilan mockup langsung**: depan dan belakang.
- Detail depan, belakang, poster, dan mockup besar bisa dibuka dalam popup yang lebih nyaman.
- Tombol **Tutup** dibuat **floating/fixed** di kanan atas layar saat popup dibuka, sehingga tidak perlu scroll ke atas.

---

### C. Link pendataan jersey peserta dipisah dari official
Sesuai arahan terbaru:

- **Jersey peserta:**
  `https://forms.gle/voyPEgvxvhS8VrKf8`
- **Jersey official / pre-order:**
  tetap memakai link official sebelumnya.

Ini membuat alur peserta dan pembelian official jadi lebih rapi dan tidak membingungkan.

---

### D. Rundown Youth Spark disederhanakan
- Tombol/link **unduhan DOCX** dihilangkan dari tampilan website.
- Yang ditampilkan hanya akses **PDF rundown resmi** dan CTA pendaftaran.
- Susunan acara tetap mengikuti dokumen rundown resmi 08.00–12.00.

---

## 2) Inovasi UI/UX yang ditambahkan

### A. Website terasa lebih “hidup”
Saya memaksimalkan website agar bukan hanya informatif, tetapi juga terasa **punya karakter**. Fokus utamanya adalah:
- animasi mikro yang tidak berlebihan,
- elemen visual yang lebih responsif,
- interaksi yang intuitif dan ringan.

### B. Micro-interaction yang lebih kuat
Fitur yang sekarang terasa lebih hidup:
- bubble teks pada chatbot berubah sesuai keadaan,
- glow dan orbit kecil di area maskot,
- kartu mockup jersey memiliki elevasi, sudut, dan pencahayaan lembut,
- popup visual jersey lebih fokus dan bersih.

### C. Pemisahan fungsi lebih jelas
Saya sengaja memisahkan pengalaman menjadi tiga lapis yang lebih mudah dimengerti pengunjung:
1. **Lihat cepat** → mockup statis langsung terlihat.
2. **Lihat detail** → buka depan / belakang / poster.
3. **Aksi** → klik form sesuai jenis jersey.

Ini membantu pengunjung yang ingin cepat melihat, cepat paham, lalu cepat bertindak.

---

## 3) File yang diubah

### File utama yang diedit
- `src/components/MenwaPet.jsx`
- `src/components/MenwaPet.css`
- `src/components/JerseyShowcase.jsx`
- `src/components/JerseyShowcase.css`
- `src/components/Sections.jsx`
- `src/data/siteData.js`

### File aset baru
- `public/mascot/chibi-menwa-boy.png`
- `public/mascot/chibi-menwa-girl.png`
- `public/mascot/chibi-menwa-duo.png`

---

## 4) Arah kreatif yang saya terapkan

Untuk membuat website lebih menarik, saya memakai pendekatan berikut:

### Visual tone
- modern
- elegan
- interaktif
- tidak terlalu ramai
- tetap formal sesuai identitas Menwa

### Prinsip desain yang dipakai
- **lebih sedikit friksi** saat pengguna ingin melihat konten,
- **CTA lebih jelas**,
- **elemen penting langsung terlihat**,
- **animasi membantu pengalaman**, bukan mengganggu.

---

## 5) Rekomendasi peningkatan lanjutan (opsional)

Jika ingin saya maksimalkan lagi di tahap berikutnya, saya sarankan fitur-fitur ini:

### Prioritas tinggi
1. **Command Center mini** di beranda
   - statistik kegiatan,
   - agenda terdekat,
   - shortcut ke pendaftaran / juknis / proposal.

2. **Floating quick navigation** di halaman program
   - anchor cepat ke: Tentang, Timeline, Jersey, Rundown, Dokumen.

3. **Mode spotlight kegiatan utama**
   - section khusus yang menonjolkan KC VIII dan Youth Spark sebagai agenda unggulan.

4. **Progressive storytelling**
   - beberapa section dibuat muncul berurutan agar pengalaman eksplorasi terasa premium.

### Prioritas menengah
5. **FAQ interaktif** untuk KC VIII dan Youth Spark.
6. **Preview poster sinematik** dengan efek glass / glow ringan.
7. **Badge status dinamis** untuk “Pendaftaran Dibuka”, “Segera Hadir”, “Kuota Terbatas”, dll.

### Prioritas lanjutan
8. **Sound cue sangat halus** untuk chatbot atau popup (opsional, harus bisa dimatikan).
9. **Halaman dokumentasi yang lebih imersif** seperti galeri expo.
10. **Onboarding kecil** saat pertama kali membuka web.

---

## 6) Catatan teknis

- Sistem chatbot tetap ringan karena animasi dilakukan dominan dengan CSS.
- Tidak ada library animasi berat tambahan untuk fitur chibi.
- Perubahan mockup jersey menjaga performa tetap ringan karena tidak memakai engine 3D.
- Pendekatan ini lebih aman untuk deployment Vercel dan lebih nyaman di perangkat mobile.

---

## 7) Kesimpulan

Versi V3 ini membuat portal terasa:
- lebih **rapi**,
- lebih **interaktif**,
- lebih **ramah pengunjung**,
- dan lebih **punya identitas visual**.

Perubahan terpenting ada pada:
- **chatbot chibi yang lebih hidup**,
- **showcase jersey yang lebih elegan**,
- **alur form yang lebih jelas**,
- dan **rundown yang lebih ringkas**.

Jika diinginkan, tahap berikutnya saya bisa lanjutkan ke versi **V4 premium**, dengan fokus pada:
- quick nav pintar,
- command center kegiatan,
- FAQ interaktif,
- dan penyempurnaan pengalaman visual keseluruhan.
