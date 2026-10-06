// ============================================================
//  siteData.js — SATU-SATUNYA FILE YANG PERLU DIEDIT untuk konten display.
//  Gambar: taruh di  public/kegiatan/  dengan format  [nama]-menwa-unj.jpg
//  (jalankan scripts/prepare-images.mjs untuk rename + konversi ke jpg + kompres)
// ============================================================

/** Helper: IMG('kc-menwa-unj') -> '/kegiatan/kc-menwa-unj.jpg' */
export const IMG = (name) => `/kegiatan/${name}.jpg`;

// ------------------------------------------------------------
//  Opsional: kalau nanti kegiatan diisi otomatis (mis. n8n -> file JSON),
//  isi alamat JSON-nya di sini. Kosongkan = pakai daftar KEGIATAN di bawah.
//  Format JSON = array yang sama persis dengan KEGIATAN.
// ------------------------------------------------------------
export const FEED_URL = '';

/** Foto hero beranda (foto bersama di UNJ). Dipakai juga sebagai latar header semua subtab. */
export const HERO_PHOTO = '/foto-kampus-unj.jpg';

// ------------------------------------------------------------
//  Identitas, kontak, sosial media
// ------------------------------------------------------------
export const SITE = {
  name: 'Komando Resimen Mahasiswa',
  unit: 'Satuan Universitas Negeri Jakarta',
  motto: 'Widya Castrena Dharma Siddha',
  tagline: 'Penyempurnaan Pengabdian dengan Ilmu Pengetahuan dan Ilmu Olah Keprajuritan.',
  address: 'Jl. R.Mangun Muka Kampus A UNJ Gedung G R.107, Rawamangun, Pulo Gadung, Jakarta Timur 13220',
  email: 'unjmenwa@gmail.com',
  phone: '+62 815-2582-3503',
  phoneLabel: 'Wakil Komandan',
  whatsapp: 'https://wa.me/6281525823503',
  maps: 'https://maps.google.com/?cid=17438056564465491782',
  copyright: '© 2026 Komando Resimen Mahasiswa Satuan Universitas Negeri Jakarta.',
  // Sosial media. Urutan = urutan tampil di footer. type: instagram | youtube | facebook | tiktok
  social: [
    { label: 'YouTube Menwa UNJ', url: 'https://www.youtube.com/@MenwaUNJ', type: 'youtube' },
    { label: 'Instagram Menwa UNJ', url: 'https://www.instagram.com/menwa.unjakarta/', type: 'instagram' },
    { label: 'Instagram Ksatria Cendekia', url: 'https://www.instagram.com/kc_menwaunj/', type: 'instagram' },
    { label: 'Instagram Geranat', url: 'https://www.instagram.com/geranat_menwaunj/', type: 'instagram' },
    { label: 'Facebook Menwa Univ Negeri Jakarta', url: 'https://www.facebook.com/menwauniv.negerijakarta.5?locale=id_ID', type: 'facebook' },
    { label: 'TikTok Menwa UNJ', url: 'https://www.tiktok.com/@menwa.unjakarta', type: 'tiktok' },
  ],
  // Logo di pill "Didukung oleh" (file di public/mitra/). Urutan = urutan tampil.
  partners: [
    { name: 'Universitas Negeri Jakarta', logo: '/mitra/unj.png' },
    { name: 'Dispora DKI Jakarta', logo: '/mitra/dispora.png' },
    { name: 'Kesbangpol Provinsi DKI Jakarta', logo: '/mitra/kesbangpol.png' },
    { name: 'Komando Nasional Resimen Mahasiswa Indonesia', logo: '/mitra/konas.png' },
    { name: 'Staf Komando Resimen Mahasiswa Jayakarta', logo: '/mitra/skomen.png' },
  ],
};

// ------------------------------------------------------------
//  Alur kegiatan (timeline) per jenis. Urutan = urutan tampil.
// ------------------------------------------------------------
export const STEP_DESC = {
  'Pendaftaran': 'Peserta atau tim mendaftar melalui tautan resmi sebelum kuota terpenuhi.',
  'Pengumpulan Karya': 'Peserta mengirimkan karya sesuai ketentuan juknis.',
  'Technical Meeting': 'Pembahasan teknis lomba bersama seluruh kontingen.',
  'Tes Track': 'Uji coba lintasan dan penyesuaian sebelum hari pelaksanaan.',
  'Pelaksanaan': 'Kegiatan berlangsung sesuai rangkaian acara.',
  'Pengumuman': 'Hasil dan pemenang diumumkan secara resmi.',
  'Perencanaan': 'Penyusunan kebutuhan, sasaran, dan rencana kegiatan.',
  'Persiapan': 'Penyiapan personel, perlengkapan, dan materi.',
  'Evaluasi': 'Penilaian hasil kegiatan dan bahan perbaikan berikutnya.',
  'Permohonan': 'Pemohon mengajukan permohonan pengamanan secara resmi.',
  'Audiensi': 'Pertemuan untuk menyamakan kebutuhan dan pola pengamanan.',
  'Penyerahan Sertifikat': 'Sertifikat diberikan kepada peserta setelah acara.',
};

// ------------------------------------------------------------
//  6 PROGRAM UNGGULAN  ->  tiap program punya subtab /<slug>/
//  icon: nama ikon lucide (lihat ICONS di Sections.jsx)
// ------------------------------------------------------------
export const PROGRAMS = [
  {
    slug: 'kc',
    title: 'Ksatria Cendekia',
    icon: 'trophy',
    image: IMG('kc-menwa-unj'),
    logo: '/logo-kc-viii.png',
    tag: 'Pendaftaran dibuka',
    status: 'Pendaftaran dibuka sampai 15 Oktober 2026',
    short: 'Latihan Integrasi Pemuda Nusantara: seminar nasional dan lima cabang lomba bagi anggota Resimen Mahasiswa se-Indonesia.',
    badge: 'Lomba Nasional • 06–08 November 2026',
    heroLead: 'Ksatria',
    heroAccent: 'Cendekia VIII',
    heroSub: 'Latihan Integrasi Pemuda Nusantara 2026. Tunjukkan ketangkasan dan kreativitas kalian sekarang!',
    about: [
      'Latihan Integrasi Pemuda Nusantara Ksatria Cendekia VIII Tahun 2026 diselenggarakan Komando Resimen Mahasiswa Jayakarta Satuan Universitas Negeri Jakarta sebagai wadah integrasi dan pengembangan potensi anggota Resimen Mahasiswa Indonesia.',
      'Rangkaian kegiatan mencakup Seminar Nasional, lima cabang lomba (Esai, Renang, T.H.O.R., Menembak, dan Video Kreatif), serta Pesiar. Seminar Nasional bertema "Pemuda Berkarya: Mewujudkan Semangat Sumpah Pemuda untuk Indonesia yang Berkelanjutan".',
    ],
    facts: [
      { label: 'Pelaksanaan', value: '06–08 Nov 2026' },
      { label: 'Biaya', value: 'Rp2.000.000 / tim' },
      { label: 'Tim', value: '2 peserta + 1 official (opsional)' },
      { label: 'Kuota', value: 'Maks. 3 tim / satuan' },
    ],
    // Timeline mengikuti poster; detail tambahan dari proposal. Urutan = urutan waktu.
    timeline: [
      { label: 'Pendaftaran', date: '18 Sep – 15 Okt 2026', desc: 'Daring lewat formulir panitia atau langsung di Mako Menwa UNJ, pukul 08.00–22.00 WIB.' },
      { label: 'Pengumpulan Karya', date: '1 – 23 Okt 2026', desc: 'Esai dan Video Kreatif dikirim paling lambat 23 Oktober 2026 pukul 22.00 WIB.' },
      { label: 'Technical Meeting', date: '17 Okt 2026', desc: 'Technical meeting secara daring bersama seluruh kontingen.' },
      { label: 'Pengumuman Finalis Karya', date: '30 Okt 2026', desc: 'Finalis Esai dan tiga video terbaik diumumkan.' },
      { label: 'Daftar Ulang', date: '5 Nov 2026', desc: 'Penyerahan berkas dalam map plastik kuning dan bukti pembayaran untuk memperoleh nomor peserta.' },
      { label: 'Pelaksanaan', date: '6 – 8 Nov 2026', desc: 'Seminar Nasional, lomba, Malam Keakraban, dan Pesiar di UNJ, Batalyon Intai Tempur, dan Ragunan.' },
      { label: 'Pengumuman Pemenang', date: '7 – 8 Nov 2026', desc: 'Pemenang tiap mata lomba dan Juara Umum diumumkan; upacara penutupan 8 November.' },
    ],
    details: [
      { title: 'Mata Lomba', items: ['Renang', 'Menembak', 'T.H.O.R. (Tactical Hardest Obstacle Run)', 'Esai', 'Video Kreatif'] },
      { title: 'Rangkaian Kegiatan', items: ['Seminar Nasional (Pemuda Berkarya: Mewujudkan Semangat Sumpah Pemuda untuk Indonesia yang Berkelanjutan)', 'Pesiar', 'Malam Keakraban'] },
      { title: 'Persyaratan Umum', items: ['Mahasiswa aktif di seluruh perguruan tinggi', 'Anggota aktif Komando Resimen Mahasiswa Indonesia di Satuan/Batalyon', 'Telah menempuh Pendidikan Dasar Militer'] },
      {
        title: 'Benefit',
        items: [
          'Sertifikat Nasional', 'Jersey, Topi, dan Tumbler', 'Lanyard dan E-Money eksklusif', 'Brevet PDH & PDL',
          'Penginapan AC & kasur INOAC', 'Konsumsi rutin bergizi', 'Foto jajar', 'Relasi Komando Resimen Mahasiswa se-Nasional',
          'Piala & medali*', 'Uang pembinaan*',
        ],
        note: '*Untuk pemenang lomba',
      },
    ],
    docs: [
      {
        label: 'Proposal Kegiatan',
        desc: 'Proposal Latihan Integrasi Pemuda Nusantara Ksatria Cendekia VIII 2026.',
        file: '/dokumen/proposal-kc-viii-menwa-unj.pdf',
        drive: 'https://drive.google.com/drive/folders/1XoGoVFvMoNJtWb3Ss-kKDBuvirKjSOND?usp=sharing',
      },
      {
        label: 'Petunjuk Teknis (Juknis)',
        desc: 'Ketentuan teknis tiap mata lomba.',
        // Untuk unduhan langsung: taruh PDF di public/dokumen/ lalu isi, mis. '/dokumen/juknis-kc-viii-menwa-unj.pdf'
        file: '',
        drive: 'https://drive.google.com/drive/folders/1LBWHxr1mJezqBGhaRrTZ5ol9U0c3d_5I?usp=sharing',
      },
    ],
    cta: { label: 'Daftarkan Tim Kalian', url: 'https://bit.ly/PendaftaranKCVIII' },
    ig: 'https://www.instagram.com/kc_menwaunj/',
  },
  {
    slug: 'geranat',
    title: 'Gerakan Paskibra Semangat',
    icon: 'flag',
    image: IMG('geranat-menwa-unj'),
    short: 'Kompetisi baris-berbaris dan paskibra yang menyatukan langkah, semangat, dan kekompakan tim.',
    badge: 'Kompetisi Paskibra • 2026',
    heroLead: 'Gerakan Paskibra',
    heroAccent: 'Semangat VII',
    heroSub: 'Rapatkan barisan, satukan langkah, kobarkan semangat.',
    about: [
      'Gerakan Paskibra Semangat (Geranat) adalah kompetisi paskibra tahunan yang diselenggarakan Resimen Mahasiswa Jayakarta Satuan Universitas Negeri Jakarta.',
      'Edisi ketujuh tahun 2026 segera hadir. Pantau informasi resmi di akun Instagram Geranat.',
    ],
    facts: [{ label: 'Jenis', value: 'Kompetisi Paskibra' }, { label: 'Edisi', value: 'VII' }, { label: 'Tahun', value: '2026' }],
    timeline: ['Pendaftaran', 'Technical Meeting', 'Tes Track', 'Pelaksanaan', 'Pengumuman'],
    cta: { label: 'Ikuti Info Resmi', url: 'https://www.instagram.com/geranat_menwaunj/' },
    ig: 'https://www.instagram.com/geranat_menwaunj/',
  },
  {
    slug: 'pengabdian',
    title: 'Pengabdian Masyarakat',
    icon: 'heart',
    image: IMG('pengabdian-menwa-unj'),
    short: 'Bakti sosial dan latihan pemantapan komando yang menyatukan kepedulian dan pembentukan karakter.',
    badge: 'Bakti Masyarakat',
    heroLead: 'Pengabdian',
    heroAccent: 'Masyarakat',
    heroSub: 'Semangat pengabdian, kebersamaan, dan pembentukan karakter bersama masyarakat.',
    about: [
      'Pengabdian Masyarakat adalah wujud kemanunggalan Menwa UNJ dengan masyarakat, dipadukan dengan Latihan Pemantapan Komando.',
      'Kegiatan terakhir dilaksanakan di Kabupaten Cianjur bersama mahasiswa Mappi pada 3–7 Juni 2026.',
    ],
    facts: [{ label: 'Lokasi terakhir', value: 'Cianjur' }, { label: 'Waktu', value: '3–7 Juni 2026' }],
    // Alur belum ditentukan: memakai pola Perencanaan–Evaluasi. Silakan ganti.
    timeline: ['Perencanaan', 'Persiapan', 'Pelaksanaan', 'Evaluasi'],
    cta: { label: 'Hubungi Piket Mako', url: 'https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20bertanya%20tentang%20Pengabdian%20Masyarakat.' },
  },
  {
    slug: 'seminar',
    title: 'Seminar Kepemudaan dan Bela Negara',
    icon: 'mic',
    image: IMG('seminar-menwa-unj'),
    short: 'Forum edukasi wawasan kepemudaan dan bela negara bagi mahasiswa dan pemuda.',
    badge: 'Seminar',
    heroLead: 'Seminar Kepemudaan',
    heroAccent: 'dan Bela Negara',
    heroSub: 'Memperkuat wawasan kebangsaan dan peran pemuda melalui forum yang terbuka.',
    about: [
      'Seminar Kepemudaan dan Bela Negara adalah forum edukasi yang membahas peran pemuda dan wawasan bela negara.',
      'Informasi jadwal dan pendaftaran diumumkan melalui kanal resmi Menwa UNJ.',
    ],
    facts: [{ label: 'Jenis', value: 'Seminar' }],
    timeline: ['Pendaftaran', 'Pelaksanaan', 'Penyerahan Sertifikat'],
    cta: { label: 'Tanya Jadwal Seminar', url: 'https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20bertanya%20tentang%20Seminar%20Kepemudaan%20dan%20Bela%20Negara.' },
  },
  {
    slug: 'pam',
    title: 'Pengamanan Kegiatan',
    icon: 'shield',
    image: IMG('pam-menwa-unj'),
    short: 'Dukungan personel pengamanan untuk kegiatan kampus dan mitra secara tertib dan terkoordinasi.',
    badge: 'Layanan Pengamanan',
    heroLead: 'Pengamanan',
    heroAccent: 'Kegiatan',
    heroSub: 'Personel terlatih untuk menjaga kegiatan Anda tetap aman, tertib, dan lancar.',
    about: [
      'Menwa UNJ menerima permohonan pengamanan kegiatan. Setiap permohonan melalui audiensi agar kebutuhan dan pola pengamanan sesuai.',
      'Ajukan permohonan melalui piket Mako dengan menyebutkan nama kegiatan, waktu, dan lokasi.',
    ],
    facts: [{ label: 'Jenis', value: 'Layanan' }, { label: 'Kontak', value: 'Piket Mako' }],
    timeline: ['Permohonan', 'Audiensi', 'Persiapan', 'Pelaksanaan', 'Evaluasi'],
    cta: { label: 'Ajukan Permohonan', url: 'https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20mengajukan%20Permohonan%20Pengamanan%20Kegiatan.' },
  },
  {
    slug: 'diklat',
    title: 'Pendidikan dan Pelatihan Karakter',
    icon: 'graduation',
    image: IMG('diklat-menwa-unj'),
    short: 'Pendidikan dan pelatihan berjenjang untuk membentuk karakter, disiplin, dan kepemimpinan.',
    badge: 'Pendidikan & Pelatihan',
    heroLead: 'Pendidikan dan',
    heroAccent: 'Pelatihan Karakter',
    heroSub: 'Menempa disiplin, kepemimpinan, dan karakter melalui pendidikan yang berjenjang.',
    about: [
      'Pendidikan dan Pelatihan Karakter membentuk disiplin, kepemimpinan, dan kemampuan anggota melalui tahapan yang terencana.',
      'Rincian jenjang pendidikan tersedia di tab Pendidikan dan Pelatihan.',
    ],
    facts: [{ label: 'Jenis', value: 'Diklat' }],
    timeline: ['Perencanaan', 'Persiapan', 'Pelaksanaan', 'Evaluasi'],
    cta: { label: 'Lihat Jenjang Pendidikan', url: '/pendidikan/' },
  },
];

// ------------------------------------------------------------
//  KEGIATAN — urutan di sini = urutan tampil (paling atas = terbaru).
//  program: slug subtab tujuan klik. Kalau kosong, klik membuka `url` (mis. Instagram).
//  date / location boleh dikosongkan (otomatis disembunyikan).
//  image: nama file tanpa ekstensi di public/kegiatan/
// ------------------------------------------------------------
export const KEGIATAN = [
  {
    id: 'oprec-liii',
    title: 'Penerimaan Calon Anggota Baru Angkatan LIII Tahun 2026',
    category: 'Rekrutmen',
    date: '20 Agt – 27 Sep 2026',
    location: '',
    excerpt: 'Menwa UNJ Angkatan LIII membuka pintu untuk jiwa-jiwa tangguh, disiplin, dan bermental baja.',
    image: 'oprec-menwa-unj',
    url: 'https://www.instagram.com/p/DckXz2DSoKV/',
    highlight: true,
  },
  {
    id: 'kc-viii',
    title: 'Latihan Integrasi Pemuda Nusantara Ksatria Cendekia VIII Tahun 2026',
    category: 'Giat Nasional',
    date: '06 – 08 November 2026',
    location: 'UNJ, Cikarang & Ragunan',
    excerpt: 'Pendaftaran dibuka 18 September – 15 Oktober 2026. Seminar nasional dan lima cabang lomba.',
    image: 'kc-menwa-unj',
    program: 'kc',
    highlight: true,
  },
  {
    id: 'geranat-vii',
    title: 'Gerakan Paskibra Semangat VII Tahun 2026',
    category: 'Kompetisi Paskibra',
    date: 'Coming Soon 2026',
    location: '',
    excerpt: 'Rapatkan barisan, satukan langkah, kobarkan semangat.',
    image: 'geranat-menwa-unj',
    program: 'geranat',
    highlight: true,
  },
  {
    id: 'pengabdian-cianjur',
    title: 'Pengabdian Masyarakat dan Latihan Pemantapan Komando di Cianjur',
    category: 'Bakti Masyarakat',
    date: '3 – 7 Juni 2026',
    location: 'Cianjur',
    excerpt: 'Menwa UNJ dan mahasiswa Mappi menggelar pengabdian masyarakat serta latihan pemantapan komando.',
    image: 'pengabdian-menwa-unj',
    program: 'pengabdian',
    highlight: true,
  },
  {
    id: 'kds-2026',
    title: 'Kursus Dinas Staf Satuan Gabungan 2026',
    category: 'Dinas Staf',
    date: '',
    location: '',
    excerpt: 'Menempa kemampuan manajerial dan memperkokoh interoperabilitas antar-satuan.',
    image: 'kds-menwa-unj',
    program: 'diklat',
    url: 'https://www.instagram.com/p/DcvaTHGklo-/',
    highlight: true,
  },
  {
    id: 'anjangsana-ksr',
    title: 'Anjangsana Menwa UNJ x KSR PMI UNJ',
    category: 'Sinergi',
    date: '',
    location: 'UNJ Rawamangun',
    excerpt: 'Mempererat silaturahmi dan membangun sinergi lintas organisasi di lingkungan kampus.',
    image: 'anjangsana-menwa-unj',
    url: 'https://www.instagram.com/p/DcvjdmmEu9x/',
    highlight: true,
  },
  {
    id: 'upacara-hut-ri-81',
    title: 'Upacara HUT ke-81 RI di UNJ',
    category: 'Upacara',
    date: '',
    location: 'UNJ Rawamangun',
    excerpt: 'Semangat kemerdekaan terus berkobar dalam jiwa prajurit intelektual.',
    image: 'hutri-menwa-unj',
    url: 'https://www.instagram.com/reel/DcJT9UmKFrZ/',
    highlight: true,
  },
  {
    id: 'studi-banding-ipb',
    title: 'Studi Banding Menwa IPB x UNJ',
    category: 'Kerjasama',
    date: '23 Mei 2026',
    location: 'Mako Menwa UNJ',
    excerpt: 'Saling berbagi ilmu dan pengalaman serta mempererat silaturahmi antar satuan.',
    image: 'studibanding-menwa-unj',
    url: 'https://www.instagram.com/reel/DYuKdzKJuFV/',
    highlight: true,
  },
  {
    id: 'aftermovie-kc-vii',
    title: 'After Movie Ksatria Cendekia VII Tahun 2025',
    category: 'Dokumentasi',
    date: '2025',
    location: '',
    excerpt: 'Saksikan momen penuh semangat dari pembukaan khidmat hingga perlombaan menegangkan.',
    image: 'aftermovie-kc-menwa-unj',
    program: 'kc',
    url: 'https://www.instagram.com/reel/DPo1NDSAWg9/',
  },
];

/** Semua nama gambar yang diharapkan ada di public/kegiatan/ (dipakai scripts/prepare-images.mjs) */
export const expectedImages = [
  ...new Set([
    ...PROGRAMS.map((p) => p.image.replace('/kegiatan/', '').replace('.jpg', '')),
    ...KEGIATAN.map((k) => k.image),
  ]),
];
