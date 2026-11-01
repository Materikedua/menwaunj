/**
 * SEO & Social Open Graph Metadata Manager for Menwa UNJ Portal
 * Dynamically synchronizes document title, canonical link, description,
 * Open Graph, and Twitter Cards on client-side routing.
 */

export const ROUTE_METADATA = {
  '/': {
    title: 'Menwa UNJ — Portal Resmi Komando Resimen Mahasiswa Satuan Universitas Negeri Jakarta',
    description: 'Portal resmi Komando Resimen Mahasiswa Jayakarta Satuan Universitas Negeri Jakarta: informasi organisasi, Ksatria Cendekia VIII, Youth Spark, GERANAT VII, verifikasi E-Dispensasi, kegiatan, pendaftaran, dan layanan kemahasiswaan.',
    ogTitle: 'Menwa UNJ — Portal Resmi & Pusat Informasi Satuan',
    ogDescription: 'Portal resmi Komando Resimen Mahasiswa Jayakarta Satuan Universitas Negeri Jakarta. Widya Castrena Dharma Siddha.',
    ogImage: 'https://menwaunj.or.id/logo-menwa-unj.png',
    keywords: 'Menwa UNJ, Resimen Mahasiswa, Universitas Negeri Jakarta, Bela Negara, KC VIII, Youth Spark, GERANAT VII',
  },
  '/kc': {
    title: 'Ksatria Cendekia VIII 2026 — Lomba Nasional & Jersey Atlet | Menwa UNJ',
    description: 'Pusat informasi resmi Ksatria Cendekia VIII Tingkat Nasional: lima cabang lomba bergengsi, juknis, pendaftaran kontingen, dan jersey official.',
    ogTitle: 'Ksatria Cendekia VIII — Kompetisi Ketangkasan Nasional',
    ogDescription: 'Ikuti Latihan Integrasi Pemuda Nusantara & Kompetisi Ksatria Cendekia VIII di Universitas Negeri Jakarta.',
    ogImage: 'https://menwaunj.or.id/logo-kc-viii.png',
    keywords: 'Ksatria Cendekia VIII, KC VIII, Lomba Menwa UNJ, Lomba Ketangkasan, Menwa Indonesia',
  },
  '/geranat': {
    title: 'GERANAT VII (LFPB) & Podium Juara — Gerakan Paskibra Semangat | Menwa UNJ',
    description: 'Kompetisi Lomba Formasi Pengibaran Bendera (LFPB) GERANAT VII: juknis, pendaftaran satuan, dan podium e-voting.',
    ogTitle: 'GERANAT VII — Gerakan Paskibra Semangat Tingkat Nasional',
    ogDescription: 'Rapatkan barisan, satukan langkah, kobarkan semangat patriotisme di GERANAT VII Menwa UNJ.',
    ogImage: 'https://menwaunj.or.id/geranat-menwa-unj.png',
    keywords: 'GERANAT VII, LFPB, Paskibra Nasional, Gerakan Paskibra Semangat, Menwa UNJ',
  },
  '/geranat/voting': {
    title: 'E-Voting & Charity Juara Terfavorit GERANAT VII | Menwa UNJ',
    description: 'Dukung kontingen sekolah favoritmu di GERANAT VII secara real-time via QRIS resmi Mako Menwa UNJ dengan verifikasi audit anti-kecurangan.',
    ogTitle: 'E-Voting Juara Terfavorit & Charity GERANAT VII',
    ogDescription: 'Berikan dukungan suaramu untuk kontingen favoritmu di GERANAT VII!',
    ogImage: 'https://menwaunj.or.id/geranat-menwa-unj.png',
    keywords: 'E-Voting GERANAT VII, Juara Terfavorit, Charity Paskibra, Menwa UNJ',
  },
  '/youth-spark': {
    title: 'Youth Spark National 2026 — Seminar & Pembinaan Pemuda | Menwa UNJ',
    description: 'Program kepemudaan nasional kolaborasi Dispora DKI Jakarta: seminar, lokakarya, dan pembinaan pemuda tangguh berkarakter.',
    ogTitle: 'Youth Spark National 2026 — Pembinaan Aktivitas Pemuda',
    ogDescription: 'Seminar & lokakarya nasional pemuda di Universitas Negeri Jakarta.',
    ogImage: 'https://menwaunj.or.id/foto-kampus-unj.jpg',
    keywords: 'Youth Spark National, Seminar Pemuda, Dispora DKI Jakarta, Menwa UNJ',
  },
  '/gallery': {
    title: 'Galeri Lensa & Dinding Dokumentasi Resmi Satuan | Menwa UNJ',
    description: 'Arsip foto dan rekaman visual kegiatan keprajuritan, apel kehormatan, bakti masyarakat, dan kejuaraan Menwa UNJ.',
    ogTitle: 'Galeri & Arsip Visual Dokumentasi Menwa UNJ',
    ogDescription: 'Arsip foto dan dokumentasi kegiatan resmi Resimen Mahasiswa Satuan UNJ.',
    ogImage: 'https://menwaunj.or.id/foto-kampus-unj.jpg',
    keywords: 'Galeri Menwa UNJ, Foto Dokumentasi, Arsip Militer Kampus, Kegiatan Satuan UNJ',
  },
  '/garis-komando': {
    title: 'Garis Komando & Struktur Organisasi Satuan (SKEP 2026) | Menwa UNJ',
    description: 'Susunan unsur pimpinan, perencana, pelayanan, dan unsur pelaksana Komando Resimen Mahasiswa Jayakarta Satuan UNJ.',
    ogTitle: 'Garis Komando Satuan — Resimen Mahasiswa UNJ',
    ogDescription: 'Struktur kepemimpinan dan perwira staf Menwa Jayakarta Satuan UNJ.',
    ogImage: 'https://menwaunj.or.id/logo-menwa-unj.png',
    keywords: 'Garis Komando Menwa UNJ, Struktur Organisasi, Dansat Menwa UNJ, Perwira Staf',
  },
  '/pendidikan': {
    title: 'Pendidikan & Latihan Olah Keprajuritan (Diksar, KDS, Provos) | Menwa UNJ',
    description: 'Kurikulum pendidikan bertingkat, berjenjang, dan berlanjut: Diksar Satuan, Latihan Pemantapan Komando Curug Benjol, Kursus Dinas Staf, dan Provos.',
    ogTitle: 'Pendidikan & Pelatihan Keprajuritan Menwa UNJ',
    ogDescription: 'Materi renlat, kurikulum bela negara, dan kalkulator uji Samapta fisik.',
    ogImage: 'https://menwaunj.or.id/foto-kampus-unj.jpg',
    keywords: 'Pendidikan Menwa, Diksar Satuan, Latihan Pemantapan Komando, Provos Menwa, Samapta',
  },
  '/administrasi': {
    title: 'Adminu — Administrasi Umum, Permohonan Surat & Layanan Mako | Menwa UNJ',
    description: 'Layanan administrasi persuratan, formulir dispensasi resmi, pelacakan disposisi berkas surat dinas, dan pengamanan kegiatan.',
    ogTitle: 'Adminu — Layanan Administrasi & Persuratan Resmi Menwa UNJ',
    ogDescription: 'Layanan administrasi resmi dan pelacakan disposisi berkas Markas Komando.',
    ogImage: 'https://menwaunj.or.id/logo-menwa-unj.png',
    keywords: 'Administrasi Menwa UNJ, Disposisi Surat, Permohonan Pengamanan, Dispensasi Kuliah',
  },
  '/games': {
    title: 'Arena Taktis Menwa — Kuis Bela Negara, Mini Games & Leaderboard | Menwa UNJ',
    description: 'Asah wawasan keprajuritan, sejarah militer, sandi morse, simulasi komando, peroleh EXP harian, dan raih posisi teratas di papan peringkat.',
    ogTitle: 'Arena Taktis & Games Keprajuritan Menwa UNJ',
    ogDescription: 'Kuis wawasan bela negara, game taktis, dan leaderboard tingkat ksatria.',
    ogImage: 'https://menwaunj.or.id/logo-menwa-unj.png',
    keywords: 'Games Taktis, Kuis Bela Negara, Sandi Morse, Leaderboard EXP Menwa UNJ',
  },
  '/portal-peserta': {
    title: 'Portal Official & Pemberkasan Kontingen Lomba | Menwa UNJ',
    description: 'Akses khusus official kontingen sekolah untuk pengelolaan berkas peserta, verifikasi KTA, cetak kartu pasukan, dan rekap penilaian lomba.',
    ogTitle: 'Portal Official Kontingen Lomba Menwa UNJ',
    ogDescription: 'Portal digital terintegrasi untuk official dan pendamping kontingen lomba.',
    ogImage: 'https://menwaunj.or.id/logo-menwa-unj.png',
    keywords: 'Portal Official, Pemberkasan Kontingen, Kartu Pasukan, Rekap Nilai Lomba',
  },
  '/official': {
    title: 'Portal Official & Pemberkasan Kontingen Lomba | Menwa UNJ',
    description: 'Akses khusus official kontingen sekolah untuk pengelolaan berkas peserta, verifikasi KTA, cetak kartu pasukan, dan rekap penilaian lomba.',
    ogTitle: 'Portal Official Kontingen Lomba Menwa UNJ',
    ogDescription: 'Portal digital terintegrasi untuk official dan pendamping kontingen lomba.',
    ogImage: 'https://menwaunj.or.id/logo-menwa-unj.png',
    keywords: 'Portal Official, Pemberkasan Kontingen, Kartu Pasukan, Rekap Nilai Lomba',
  },
  '/verifikasi-surat': {
    title: 'Verifikasi E-Dispensasi & Naskah Dinas Resmi | Menwa UNJ',
    description: 'Sistem verifikasi keaslian surat dinas dan dispensasi akademik bertanda tangan digital dan berstempel resmi Komando Menwa UNJ.',
    ogTitle: 'Verifikasi E-Dispensasi & Surat Resmi Menwa UNJ',
    ogDescription: 'Cek keabsahan naskah dinas resmi Komando Resimen Mahasiswa Satuan UNJ.',
    ogImage: 'https://menwaunj.or.id/logo-menwa-unj.png',
    keywords: 'Verifikasi Surat Menwa, E-Dispensasi, Validasi Digital, Sertifikat Resmi',
  },
  '/informasi': {
    title: 'Pusat Informasi & Direktori Layanan | Menwa UNJ',
    description: 'Direktori komprehensif seluruh informasi kegiatan, panduan juknis, tautan formulir, kontak piket Mako, dan dokumen resmi satuan.',
    ogTitle: 'Pusat Informasi & Direktori Satuan Menwa UNJ',
    ogDescription: 'Temukan panduan, formulir, dan layanan resmi Menwa UNJ dalam satu pintu.',
    ogImage: 'https://menwaunj.or.id/logo-menwa-unj.png',
    keywords: 'Pusat Informasi Menwa UNJ, Direktori Layanan, Juknis Lomba, Kontak Mako',
  },
  '/privacy': {
    title: 'Kebijakan Privasi (Privacy Policy) | Menwa UNJ',
    description: 'Kebijakan privasi perlindungan data pribadi pengguna pada portal resmi Komando Resimen Mahasiswa Jayakarta Satuan UNJ.',
    ogTitle: 'Kebijakan Privasi | Menwa UNJ',
    ogDescription: 'Kebijakan privasi dan tata kelola perlindungan data pada portal Menwa UNJ.',
    ogImage: 'https://menwaunj.or.id/logo-menwa-unj.png',
    keywords: 'Kebijakan Privasi, Privacy Policy, Menwa UNJ',
  },
  '/terms': {
    title: 'Persyaratan Layanan (Terms of Service) | Menwa UNJ',
    description: 'Ketentuan dan syarat penggunaan portal resmi Komando Resimen Mahasiswa Jayakarta Satuan UNJ.',
    ogTitle: 'Persyaratan Layanan | Menwa UNJ',
    ogDescription: 'Syarat dan ketentuan hukum penggunaan portal resmi Menwa UNJ.',
    ogImage: 'https://menwaunj.or.id/logo-menwa-unj.png',
    keywords: 'Persyaratan Layanan, Terms of Service, Ketentuan Hukum, Menwa UNJ',
  },
};

/**
 * Apply metadata to the active document head
 * @param {string} currentPath
 * @param {Object} [overrideMeta]
 */
export function syncDocumentMetadata(currentPath, overrideMeta = {}) {
  if (typeof document === 'undefined') return;

  // Normalize path
  let cleanPath = currentPath || '/';
  if (cleanPath.startsWith('/official/')) {
    cleanPath = '/official';
  } else if (cleanPath.startsWith('/verifikasi-surat')) {
    cleanPath = '/verifikasi-surat';
  } else if (cleanPath === '/kebijakan-privasi') {
    cleanPath = '/privacy';
  } else if (cleanPath === '/persyaratan-layanan') {
    cleanPath = '/terms';
  } else if (cleanPath === '/mako') {
    cleanPath = '/administrasi';
  }

  const meta = {
    ...(ROUTE_METADATA[cleanPath] || ROUTE_METADATA['/']),
    ...overrideMeta,
  };

  // 1. Update Title
  if (meta.title) {
    document.title = meta.title;
  }

  // Helper function to update or create meta tag
  const setMeta = (attr, key, content) => {
    if (!content) return;
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 2. Primary Meta Tags
  setMeta('name', 'description', meta.description);
  setMeta('name', 'keywords', meta.keywords);

  // 3. Open Graph Tags
  const canonicalUrl = `https://menwaunj.or.id${currentPath === '/' ? '' : currentPath}`;
  setMeta('property', 'og:title', meta.ogTitle || meta.title);
  setMeta('property', 'og:description', meta.ogDescription || meta.description);
  setMeta('property', 'og:url', canonicalUrl);
  setMeta('property', 'og:image', meta.ogImage || 'https://menwaunj.or.id/logo-menwa-unj.png');

  // 4. Twitter Tags
  setMeta('name', 'twitter:title', meta.ogTitle || meta.title);
  setMeta('name', 'twitter:description', meta.ogDescription || meta.description);
  setMeta('name', 'twitter:image', meta.ogImage || 'https://menwaunj.or.id/logo-menwa-unj.png');
  setMeta('name', 'twitter:url', canonicalUrl);

  // 5. Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);
}
