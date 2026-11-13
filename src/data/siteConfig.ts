/**
 * Single Source of Truth & Reactive Command CMS Data Layer
 * Komando Resimen Mahasiswa Jayakarta Satuan Universitas Negeri Jakarta (menwaunj.or.id)
 *
 * Seluruh metrik satuan, jadwal agenda nasional (KC VIII, Youth Spark, GERANAT VII),
 * Hero Slider, Sorotan Giat, Program Unggulan, Dinding Galeri Lensa, Peta Operasi 3D/2D,
 * Sertifikat Digital (/verify), Jadwal Piket Mako, dan Antrean Tiket Smart Adminu (PAM-2026-XXX)
 * bersumber dari modul ini sehingga tidak pernah terjadi konflik tanggal atau status antar-halaman.
 */

import { useState, useEffect } from 'react';
import {
  sanitizeDeep,
  sanitizeInput,
  sanitizeUrl,
  resolveSafeStorage,
  type StorageLike,
} from '../utils/security';

export interface UnitMetric {
  id: string;
  number: number;
  suffix: string;
  displayValue: string;
  label: string;
  description: string;
  color: 'teal' | 'gold' | 'violet' | 'coral';
  iconKey: 'users' | 'calendar' | 'trophy' | 'heart';
}

export interface CmsContentItem {
  id: string;
  title: string;
  description: string;
  tag: string;
  date: string;
  location: string;
  status: string;
  image: string;
  route: string;
  featured?: boolean;
}

export interface SiteCmsContent {
  version: string;
  updatedAt: string;
  updatedBy: string;
  heroScenes: CmsContentItem[];
  sorotanGiat: CmsContentItem[];
  programs: CmsContentItem[];
  galleryAlbums: CmsContentItem[];
}

export type CmsSectionKey = 'heroScenes' | 'sorotanGiat' | 'programs' | 'galleryAlbums';

export interface RoleNavigationTrack {
  id: 'mahasiswa-unj' | 'peserta-nasional' | 'mitra-ormawa';
  roleLabel: string;
  badge: string;
  headline: string;
  summary: string;
  primaryCta: { label: string; to: string };
  programIds: string[];
  quickLinks: Array<{
    title: string;
    subtitle: string;
    tag: string;
    to: string;
  }>;
}

export interface TacticalOperationNode {
  id: string;
  name: string;
  shortLabel: string;
  category: 'mako_pusat' | 'pengabdian_bencana' | 'kontingen_nasional';
  categoryLabel: string;
  lat: number;
  lng: number;
  region: string;
  date: string;
  status: string;
  personnelOrTeams: string;
  summary: string;
  route: string;
}

export interface VerifiedCertificateRecord {
  certId: string;
  recipientName: string;
  institution: string;
  programCode: 'KC_VIII' | 'GERANAT_VII' | 'YOUTH_SPARK' | 'DIKSAR';
  eventName: string;
  categoryOrRank: string;
  predicate: string;
  eventDate: string;
  issuedDate: string;
  signedBy: string;
  signerTitle: string;
  decreeNumber: string;
  status: 'SAH_TERVERIFIKASI' | 'DICABUT';
}

export interface PiketMakoShift {
  day: string;
  shiftTime: string;
  commanderOnDuty: string;
  staffOnDuty: string;
  readinessStatus: string;
}

export interface AdminuPamTicket {
  ticketId: string;
  createdAt: string;
  applicantName: string;
  institution: string;
  contactPhone: string;
  contactEmail: string;
  serviceCategory:
    | 'PAM_KEGIATAN'
    | 'KEMITRAAN_INSTANSI'
    | 'INSTRUKTUR_PELATIH'
    | 'SARPRAS_KOMANDO'
    | 'PENDAFTARAN_PROGRAM'
    | 'DISPENSASI_IZIN';
  serviceLabel: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  personnelRequested: number;
  notes: string;
  letterNumber: string;
  status:
    | 'DITERIMA'
    | 'DISETUJUI'
    | 'VERIFIKASI_ADMINU'
    | 'AUDIENSI_POLA_PAM'
    | 'PERSONEL_DITUGASKAN';
  statusNote: string;
  attachmentPdfName?: string;
  attachmentPdfUrl?: string;
  attachmentPdfSizeKb?: number;
  linkedLetterNumber?: string;
}

/* ============================================================================
 * 1. METRIK KUMULATIF KREDIBEL SATUAN (PRIDE SECTION)
 * ============================================================================ */
export const UNIT_METRICS: UnitMetric[] = [
  {
    id: 'metric-anggota-aktif',
    number: 50,
    suffix: '+',
    displayValue: '50+ Anggota Aktif',
    label: 'Anggota Aktif',
    description: 'Kader prajurit intelektual lintas fakultas UNJ dalam jajaran Staf & Pokpas.',
    color: 'teal',
    iconKey: 'users',
  },
  {
    id: 'metric-proker-tahunan',
    number: 12,
    suffix: '',
    displayValue: '12 Program Kerja/Tahun',
    label: 'Program Kerja/Tahun',
    description: 'Siklus pembinaan karakter, pendidikan berjenjang, kompetisi, dan operasional satuan.',
    color: 'gold',
    iconKey: 'calendar',
  },
  {
    id: 'metric-kompetisi-nasional',
    number: 8,
    suffix: '',
    displayValue: '8 Edisi Kompetisi Nasional',
    label: 'Edisi Kompetisi Nasional',
    description: 'Penyelenggaraan konsisten Ksatria Cendekia & GERANAT bagi pemuda se-Indonesia.',
    color: 'violet',
    iconKey: 'trophy',
  },
  {
    id: 'metric-penerima-pengabdian',
    number: 1000,
    suffix: '+',
    displayValue: '1.000+ Penerima Manfaat Pengabdian',
    label: 'Penerima Manfaat Pengabdian',
    description: 'Dampak nyata bakti sosial Cianjur, Karawang, dan misi kemanusiaan UNJ Peduli Padang.',
    color: 'coral',
    iconKey: 'heart',
  },
];

/* ============================================================================
 * 2. BASELINE KONTEN TERPADU (HERO, SOROTAN GIAT, PROGRAM, GALERI LENSA)
 * Jadwal & Status Tersinkronisasi Penuh:
 * - Ksatria Cendekia VIII: Awal Desember 2026 • Jadwal Diundur (SK B-159/Sat-UNJ/XI/2026)
 * - Youth Spark National Seminar: 24 Oktober 2026 • Telah Terlaksana
 * - Gerakan Paskibra Semangat VII: 19–20 Desember 2026 • Pendaftaran Dibuka
 * ============================================================================ */
export const DEFAULT_SITE_CONTENT: SiteCmsContent = {
  version: '2026.11.v9',
  updatedAt: '2026-11-12T08:00:00.000Z',
  updatedBy: 'Komando Satuan Menwa UNJ',
  heroScenes: [
    {
      id: 'HERO-01',
      title: 'Apel Kehormatan Korps Menwa Satuan UNJ',
      description: 'Barisan kader prajurit intelektual pengemban semboyan Widya Castrena Dharma Siddha di Kampus A UNJ.',
      tag: 'Komando Satuan',
      date: 'Tahun Bakti 2026',
      location: 'Plaza Kampus A UNJ, Rawamangun',
      status: 'Siaga Operasional',
      image: '/foto-kampus-unj.jpg',
      route: '/garis-komando',
    },
    {
      id: 'HERO-02',
      title: 'Ksatria Cendekia VIII Tingkat Nasional',
      description: 'Latihan Integrasi Pemuda Nusantara: 5 mata lomba ketangkasan & akademik. Estimasi awal Desember 2026 (SK B-159/Sat-UNJ/XI/2026).',
      tag: 'Kompetisi Nasional',
      date: 'Awal Desember 2026',
      location: 'Kampus A UNJ, GOR Otista & Yon Taipur Cikarang',
      status: 'Jadwal Diundur Resmi',
      image: '/kegiatan/kc-menwa-unj.jpg',
      route: '/kc',
    },
    {
      id: 'HERO-03',
      title: 'Gerakan Paskibra Semangat (GERANAT) VII',
      description: 'Lomba Formasi Pengibaran Bendera (LFPB) tingkat SLTA/Sederajat se-Indonesia memperebutkan piala bergilir kehormatan.',
      tag: 'LFPB Nasional',
      date: '19–20 Desember 2026',
      location: 'Kampus A Universitas Negeri Jakarta',
      status: 'Pendaftaran Dibuka',
      image: '/geranat-menwa-unj.png',
      route: '/geranat',
    },
    {
      id: 'HERO-04',
      title: 'Youth Spark National Seminar 2026',
      description: 'Sinergi DISPORA DKI Jakarta × Menwa UNJ bertema Empowering Youth, Elevating UMKM bersama jajaran narasumber nasional.',
      tag: 'Seminar Nasional',
      date: '24 Oktober 2026',
      location: 'Aula Latief Hendraningrat UNJ',
      status: 'Telah Terlaksana',
      image: '/kegiatan/youth-spark-2026.webp',
      route: '/youth-spark',
    },
    {
      id: 'HERO-05',
      title: 'Operasi Bakti Masyarakat & Tanggap Bencana',
      description: 'Pengabdian teritorial di Cianjur, Karawang, hingga misi kemanusiaan UNJ Peduli Padang.',
      tag: 'Bakti Pertiwi',
      date: 'Juni – Oktober 2026',
      location: 'Cianjur, Karawang & Padang',
      status: 'Dokumentasi Tersedia',
      image: '/dokumentasi/pengabdian26.svg',
      route: '/pengabdian',
    },
  ],
  sorotanGiat: [
    {
      id: 'GIAT-01',
      title: 'Latihan Integrasi Pemuda Nusantara Ksatria Cendekia VIII',
      description: 'Lima cabang perlombaan nasional (Esai, Renang, T.H.O.R., Menembak, Video Kreatif) dan Seminar Nasional. Pelaksanaan disesuaikan ke awal Desember 2026 sesuai Surat B-159/Sat-UNJ/XI/2026.',
      tag: 'Giat Nasional',
      date: 'Awal Desember 2026',
      location: 'Kampus A UNJ & Cikarang',
      status: 'Jadwal Diundur Resmi',
      image: '/kegiatan/kc-menwa-unj.jpg',
      route: '/kc',
      featured: true,
    },
    {
      id: 'GIAT-02',
      title: 'Gerakan Paskibra Semangat (GERANAT) VII Tahun 2026',
      description: 'Ajang Lomba Formasi Pengibaran Bendera (LFPB) tingkat pelajar SLTA/Sederajat se-Indonesia lengkap dengan Portal Official Kontingen.',
      tag: 'Kompetisi Paskibra',
      date: '19–20 Desember 2026',
      location: 'Kampus A UNJ Rawamangun',
      status: 'Pendaftaran Dibuka',
      image: '/geranat-menwa-unj.png',
      route: '/geranat',
      featured: true,
    },
    {
      id: 'GIAT-03',
      title: 'Youth Spark National Seminar: Empowering Youth, Elevating UMKM',
      description: 'Kolaborasi strategis DISPORA DKI Jakarta dan Menwa UNJ menghimpun ratusan pemuda lintas kampus dalam penguatan literasi industri kreatif & UMKM.',
      tag: 'Seminar Nasional',
      date: '24 Oktober 2026',
      location: 'Aula Latief Hendraningrat UNJ',
      status: 'Telah Terlaksana',
      image: '/kegiatan/youth-spark-2026.webp',
      route: '/youth-spark',
      featured: true,
    },
    {
      id: 'GIAT-04',
      title: 'Pengabdian Masyarakat & Pemantapan Komando Cianjur',
      description: 'Bakti sosial pelayanan warga, edukasi kebencanaan, dan latihan pemantapan komando lapangan bersama mahasiswa Mappi.',
      tag: 'Bakti Masyarakat',
      date: '3–7 Juni 2026',
      location: 'Kabupaten Cianjur, Jawa Barat',
      status: 'Telah Terlaksana',
      image: '/dokumentasi/pengabdian26.svg',
      route: '/pengabdian',
      featured: true,
    },
    {
      id: 'GIAT-05',
      title: 'Penerimaan Calon Anggota Baru (Camen) Angkatan LIII',
      description: 'Pembinaan mahasiswa aktif UNJ menjadi kader intelektual berkarakter tangguh, disiplin, dan siap mengabdi bagi almamater serta bangsa.',
      tag: 'Rekrutmen Kader',
      date: '20 Agt – 27 Sep 2026',
      location: 'Mako Gedung G R.107 UNJ',
      status: 'Tahap Pembinaan',
      image: '/foto-kampus-unj.jpg',
      route: '/pendidikan',
      featured: true,
    },
    {
      id: 'GIAT-06',
      title: 'Kursus Dinas Staf (KDS) & Studi Banding Antar-Satuan',
      description: 'Penguatan tata kelola staf komando, administrasi umum, serta interoperabilitas latihan gabungan lintas perguruan tinggi.',
      tag: 'Dinas Staf',
      date: 'Mei – Juli 2026',
      location: 'Mako Menwa UNJ Rawamangun',
      status: 'Telah Terlaksana',
      image: '/kegiatan/program-diklat.svg',
      route: '/garis-komando',
      featured: true,
    },
  ],
  programs: [
    {
      id: 'PROG-KC-VIII',
      title: 'Ksatria Cendekia VIII',
      description: 'Kompetisi nasional 5 cabang (Esai, Renang, T.H.O.R., Menembak, Video Kreatif) bagi satuan Menwa se-Indonesia.',
      tag: 'Kompetisi Nasional',
      date: 'Awal Desember 2026',
      location: 'UNJ, GOR Otista & Yon Taipur Cikarang',
      status: 'Jadwal Diundur (SK B-159/Sat-UNJ/XI/2026)',
      image: '/kegiatan/kc-menwa-unj.jpg',
      route: '/kc',
      featured: true,
    },
    {
      id: 'PROG-GERANAT-VII',
      title: 'Gerakan Paskibra Semangat VII',
      description: 'Lomba Formasi Pengibaran Bendera (LFPB) tingkat SLTA/Sederajat se-Indonesia beserta Portal Official & Charity Vote.',
      tag: 'LFPB Pelajar Nasional',
      date: '19–20 Desember 2026',
      location: 'Kampus A UNJ Rawamangun',
      status: 'Pendaftaran Dibuka (s.d. 10 Des 2026)',
      image: '/geranat-menwa-unj.png',
      route: '/geranat',
      featured: true,
    },
    {
      id: 'PROG-YOUTH-SPARK',
      title: 'Youth Spark National Seminar',
      description: 'Pembinaan Aktivitas Pemuda DISPORA DKI Jakarta × Menwa UNJ: seminar nasional kepemudaan, industri kreatif, dan UMKM.',
      tag: 'Seminar & Pembinaan',
      date: '24 Oktober 2026',
      location: 'Aula Latief Hendraningrat UNJ',
      status: 'Telah Terlaksana • Dokumentasi Aktif',
      image: '/kegiatan/youth-spark-2026.webp',
      route: '/youth-spark',
      featured: true,
    },
    {
      id: 'PROG-DIKLAT',
      title: 'Pendidikan & Pelatihan Karakter',
      description: 'Kurikulum berjenjang Pra-Diksar, Pendidikan Dasar Militer (Diksarmil), Kursus Dinas Staf (KDS), Kursus Provos, dan Pembaretan.',
      tag: 'Kaderisasi Mahasiswa UNJ',
      date: 'Semester Ganjil & Genap 2026',
      location: 'Kampus A UNJ & Pusat Pendidikan Militer',
      status: 'Kurikulum Aktif',
      image: '/kegiatan/program-diklat.svg',
      route: '/pendidikan',
      featured: true,
    },
    {
      id: 'PROG-PENGABDIAN',
      title: 'Bina Teritorial & Pengabdian Masyarakat',
      description: 'Ekspedisi sosial pedesaan Cianjur & Karawang serta Satgas Tanggap Darurat Bencana UNJ Peduli Padang.',
      tag: 'Pengabdian & Kemanusiaan',
      date: 'Juni – November 2026',
      location: 'Cianjur, Karawang & Sumatera Barat',
      status: 'Terlaksana Berkelanjutan',
      image: '/dokumentasi/pengabdian26.svg',
      route: '/pengabdian',
      featured: true,
    },
    {
      id: 'PROG-PAM-ADMINU',
      title: 'Pengamanan Kegiatan (PAM) & Smart Adminu',
      description: 'Dukungan personel pengamanan acara kampus/instansi, protokoler upacara, peminjaman sarpras, dan penerbitan tiket pelacakan surat.',
      tag: 'Layanan Kampus & Mitra',
      date: 'Senin–Minggu (08.00–22.00 WIB)',
      location: 'Mako Gedung G R.107 UNJ',
      status: 'Layanan Siaga Aktif',
      image: '/kegiatan/program-pam.svg',
      route: '/adminu',
      featured: true,
    },
  ],
  galleryAlbums: [
    {
      id: 'GAL-YOUTH-SPARK-2026',
      title: 'Youth Spark National Seminar 2026',
      description: 'Dokumentasi panggung utama, diskusi panel tiga narasumber nasional, dan antusiasme peserta di Aula Latief Hendraningrat UNJ.',
      tag: 'Seminar Nasional',
      date: '24 Oktober 2026',
      location: 'Aula Latief Hendraningrat UNJ',
      status: 'Telah Terlaksana',
      image: '/kegiatan/youth-spark-2026.webp',
      route: '/youth-spark/seminar-webinar',
    },
    {
      id: 'GAL-KC-VIII-2026',
      title: 'Persiapan & Arsip Ksatria Cendekia VIII',
      description: 'Rekaman ketangkasan T.H.O.R., menembak, renang militer, dan apel kontingen Menwa Nusantara menuju pelaksanaan awal Desember 2026.',
      tag: 'Kompetisi Nasional',
      date: 'Awal Desember 2026',
      location: 'Kampus A UNJ & Yon Taipur Cikarang',
      status: 'Jadwal Diundur Resmi',
      image: '/kegiatan/kc-menwa-unj.jpg',
      route: '/kc',
    },
    {
      id: 'GAL-GERANAT-VII-2026',
      title: 'Gerakan Paskibra Semangat (GERANAT) VII',
      description: 'Parade devile, variasi formasi pengibaran bendera, dan ketangkasan komandan peleton kontingen pelajar se-Indonesia.',
      tag: 'LFPB & Paskibra',
      date: '19–20 Desember 2026',
      location: 'Kampus A UNJ Rawamangun',
      status: 'Pendaftaran Dibuka',
      image: '/geranat-menwa-unj.png',
      route: '/geranat',
    },
    {
      id: 'GAL-PENGABDIAN-CIANJUR-2026',
      title: 'Pengabdian Masyarakat Cianjur & Karawang',
      description: 'Aksi sosial pelayanan pendidikan desa, distribusi sembako warga, dan pemantapan teritorial personel Satuan UNJ.',
      tag: 'Bakti Masyarakat',
      date: '3–7 Juni 2026',
      location: 'Cianjur & Karawang, Jawa Barat',
      status: 'Terpublikasi',
      image: '/dokumentasi/pengabdian26.svg',
      route: '/pengabdian',
    },
    {
      id: 'GAL-PEDULI-PADANG-2026',
      title: 'Satgas Kemanusiaan UNJ Peduli Padang',
      description: 'Pengiriman personel relawan dan penyaluran bantuan logistik darurat bencana alam di wilayah Sumatera Barat.',
      tag: 'Tanggap Bencana',
      date: 'Mei 2026',
      location: 'Padang, Sumatera Barat',
      status: 'Terpublikasi',
      image: '/dokumentasi/pengabdian25.svg',
      route: '/pengabdian',
    },
    {
      id: 'GAL-DIKSAR-PEMBARETAN',
      title: 'Tradisi Pembaretan Baret Ungu & Diksarmil',
      description: 'Penempaan mental, disiplin fisik samapta, longmarch taktis, dan penyematan Baret Ungu kader baru Menwa UNJ.',
      tag: 'Diklat Militer',
      date: 'April 2026',
      location: 'Pantai Marunda & Kampus A UNJ',
      status: 'Terpublikasi',
      image: '/kegiatan/program-diklat.svg',
      route: '/pendidikan',
    },
  ],
};

/* ============================================================================
 * 3. MATRIKS NAVIGASI & PROGRAM BERDASARKAN PERAN (PENGGABUNGAN ORIENTASI + PROGRAM)
 * Menghilangkan duplikasi kartu acara di beranda secara menyeluruh.
 * ============================================================================ */
export const ROLE_NAVIGATION_MATRIX: RoleNavigationTrack[] = [
  {
    id: 'mahasiswa-unj',
    roleLabel: 'Mahasiswa UNJ',
    badge: 'Kaderisasi & Layanan Internal',
    headline: 'Bergabung, Berlatih, & Urus Administrasi Kader UNJ',
    summary:
      'Jalur terpadu bagi mahasiswa aktif Universitas Negeri Jakarta untuk mengenal kurikulum pendidikan bela negara, rekrutmen Camen Angkatan LIII, uji kebugaran Samapta, serta pengajuan E-Dispensasi perkuliahan.',
    primaryCta: { label: 'Pelajari Pendidikan & Kaderisasi', to: '/pendidikan' },
    programIds: ['PROG-DIKLAT', 'PROG-YOUTH-SPARK'],
    quickLinks: [
      {
        title: 'Pendaftaran Camen Angkatan LIII',
        subtitle: 'Formulir daring calon anggota baru Menwa UNJ',
        tag: 'Rekrutmen',
        to: '/administrasi',
      },
      {
        title: 'Verifikasi E-Dispensasi Perkuliahan',
        subtitle: 'Validasi surat tugas & izin kuliah ber-QR resmi',
        tag: 'Akademik',
        to: '/verifikasi-surat',
      },
      {
        title: 'Struktur Garis Komando Satuan',
        subtitle: 'Kenali 44 personel pimpinan, staf, dan kelompok pasukan',
        tag: 'Organisasi',
        to: '/garis-komando',
      },
    ],
  },
  {
    id: 'peserta-nasional',
    roleLabel: 'Pelajar & Peserta Nasional',
    badge: 'Kompetisi, Official & Sertifikat',
    headline: 'Akses Juknis Kompetisi Nasional, Portal Official, & Validasi Sertifikat',
    summary:
      'Pusat kendali satu pintu bagi kontingen Menwa perguruan tinggi (Ksatria Cendekia VIII), pasukan Paskibra SLTA se-Indonesia (GERANAT VII), serta peserta seminar nasional untuk memantau jadwal terbaru dan memverifikasi sertifikat.',
    primaryCta: { label: 'Verifikasi Sertifikat Resmi', to: '/verify' },
    programIds: ['PROG-KC-VIII', 'PROG-GERANAT-VII'],
    quickLinks: [
      {
        title: 'Portal Official Kontingen GERANAT VII',
        subtitle: 'Buku pasukan digital, pemberkasan & rekap nilai',
        tag: 'Kontingen',
        to: '/portal-peserta',
      },
      {
        title: 'Verifikasi Sertifikat Juara & Seminar (/verify)',
        subtitle: 'Cek keaslian piagam KC VIII, GERANAT VII & Youth Spark',
        tag: 'Validasi Publik',
        to: '/verify',
      },
      {
        title: 'Charity Vote & Dukungan Kemanusiaan',
        subtitle: 'Partisipasi e-voting beasiswa kader & posko bencana',
        tag: 'E-Voting QRIS',
        to: '/geranat/voting',
      },
    ],
  },
  {
    id: 'mitra-ormawa',
    roleLabel: 'Mitra, Kampus & Ormawa',
    badge: 'Pengamanan PAM & Kemitraan',
    headline: 'Ajukan Personel Pengamanan (PAM), Kolaborasi Giat, & Lacak Tiket Surat',
    summary:
      'Layanan Smart Adminu bagi BEM/Ormawa, fakultas, instansi pemerintah, dan sponsor untuk mengajukan bantuan personel pengamanan acara, instruktur baris-berbaris, kemitraan strategis, lengkap dengan tanda terima PAM-2026-XXX dan pratinjau surat siap cetak.',
    primaryCta: { label: 'Buka Smart Adminu & Tiket PAM', to: '/adminu' },
    programIds: ['PROG-PAM-ADMINU', 'PROG-PENGABDIAN'],
    quickLinks: [
      {
        title: 'Permohonan Pengamanan (Smart PAM)',
        subtitle: 'Terbitkan resi PAM-2026-XXX & cetak surat permohonan',
        tag: 'Prioritas',
        to: '/adminu',
      },
      {
        title: 'Lokasi & Rute Mako Gedung G R.107',
        subtitle: 'Panduan kunjungan audiensi & kontak WhatsApp Piket',
        tag: 'Markas',
        to: '/mako',
      },
      {
        title: 'Official Store & Atribut 2026',
        subtitle: 'Katalog pre-order polo shirt resmi mendukung operasional satuan',
        tag: 'Kemitraan',
        to: '/toko',
      },
    ],
  },
];

/* ============================================================================
 * 4. KOORDINAT PETA OPERASI TAKTIS 3D/2D & SEBARAN KONTINGEN NASIONAL
 * Berpusat di Mako Menwa UNJ Rawamangun (-6.1944, 106.8794)
 * ============================================================================ */
export const MAKO_CENTER_COORDS = {
  lat: -6.1944,
  lng: 106.8794,
  label: 'Mako Menwa UNJ • Gedung G R.107 Rawamangun, Jakarta Timur',
};

export const TACTICAL_OPERATION_NODES: TacticalOperationNode[] = [
  {
    id: 'NODE-MAKO-UNJ',
    name: 'Mako Menwa Satuan UNJ (Pusat Komando)',
    shortLabel: 'Rawamangun (Mako)',
    category: 'mako_pusat',
    categoryLabel: 'Markas Komando Pusat',
    lat: -6.1944,
    lng: 106.8794,
    region: 'Jakarta Timur, DKI Jakarta',
    date: 'Siaga Piket 08.00–22.00 WIB',
    status: 'Komando Aktif',
    personnelOrTeams: '50+ Personel Aktif',
    summary:
      'Pusat kendali operasi, staf administrasi umum (Gedung G R.107 Kampus A UNJ), serta titik pemberangkatan satgas pengamanan dan kontingen.',
    route: '/mako',
  },
  {
    id: 'NODE-OPS-CIANJUR',
    name: 'Operasi Pengabdian Masyarakat & Pemantapan Cianjur',
    shortLabel: 'Cianjur',
    category: 'pengabdian_bencana',
    categoryLabel: 'Operasi Pengabdian & Bencana',
    lat: -6.8168,
    lng: 107.1425,
    region: 'Kabupaten Cianjur, Jawa Barat',
    date: '3–7 Juni 2026',
    status: 'Misi Tuntas',
    personnelOrTeams: '38 Personel & Relawan Mappi',
    summary:
      'Bakti sosial pelayanan kesehatan warga, pengajaran bela negara bagi siswa desa, serta latihan pemantapan komando lapangan.',
    route: '/pengabdian',
  },
  {
    id: 'NODE-OPS-KARAWANG',
    name: 'Bina Desa & Bakti Sosial Teritorial Karawang',
    shortLabel: 'Karawang',
    category: 'pengabdian_bencana',
    categoryLabel: 'Operasi Pengabdian & Bencana',
    lat: -6.3227,
    lng: 107.3376,
    region: 'Kabupaten Karawang, Jawa Barat',
    date: 'Februari 2026',
    status: 'Misi Tuntas',
    personnelOrTeams: '32 Personel Teritorial',
    summary:
      'Penyaluran paket sembako masyarakat pesisir/pedesaan, kerja bakti fasilitas umum, dan penyuluhan kesiapsiagaan banjir.',
    route: '/pengabdian',
  },
  {
    id: 'NODE-OPS-PADANG',
    name: 'Satgas Kemanusiaan UNJ Peduli Padang',
    shortLabel: 'Padang',
    category: 'pengabdian_bencana',
    categoryLabel: 'Operasi Pengabdian & Bencana',
    lat: -0.9471,
    lng: 100.4172,
    region: 'Kota Padang & Tanah Datar, Sumatera Barat',
    date: 'Mei 2026',
    status: 'Distribusi Logistik Tuntas',
    personnelOrTeams: 'Tim Satgas Gabungan UNJ',
    summary:
      'Misi tanggap darurat kemanusiaan UNJ Peduli Sumatera Barat: distribusi bantuan logistik, perlengkapan darurat, dan pemulihan psikososial penyintas.',
    route: '/pengabdian',
  },
  {
    id: 'NODE-KONTINGEN-MEDAN',
    name: 'Delegasi Kontingen Sumatera Utara (KC VIII)',
    shortLabel: 'Medan',
    category: 'kontingen_nasional',
    categoryLabel: 'Asal Kontingen KC VIII & GERANAT VII',
    lat: 3.5952,
    lng: 98.6722,
    region: 'Medan, Sumatera Utara',
    date: 'Menuju Awal Des 2026',
    status: 'Kontingen Terdaftar',
    personnelOrTeams: '4 Tim Menwa Perguruan Tinggi',
    summary:
      'Partisipasi satuan Resimen Mahasiswa wilayah Sumatera Utara pada cabang Esai Nasional, Menembak, dan T.H.O.R. Ksatria Cendekia VIII.',
    route: '/kc',
  },
  {
    id: 'NODE-KONTINGEN-PALEMBANG',
    name: 'Delegasi Kontingen Sumatera Selatan (KC VIII & GERANAT)',
    shortLabel: 'Palembang',
    category: 'kontingen_nasional',
    categoryLabel: 'Asal Kontingen KC VIII & GERANAT VII',
    lat: -2.9761,
    lng: 104.7754,
    region: 'Palembang, Sumatera Selatan',
    date: 'Desember 2026',
    status: 'Kontingen Terdaftar',
    personnelOrTeams: '5 Kontingen Menwa & Paskibra',
    summary:
      'Delegasi kontingen perguruan tinggi dan pasukan Paskibra SLTA asal Sumatera Selatan yang berlaga di Kampus A UNJ.',
    route: '/geranat',
  },
  {
    id: 'NODE-KONTINGEN-BANDUNG',
    name: 'Koridor Kontingen Jawa Barat & Banten (GERANAT VII & KC VIII)',
    shortLabel: 'Bandung',
    category: 'kontingen_nasional',
    categoryLabel: 'Asal Kontingen KC VIII & GERANAT VII',
    lat: -6.9175,
    lng: 107.6191,
    region: 'Bandung, Bogor, Bekasi & Tangerang',
    date: '19–20 Desember 2026',
    status: 'Kuota Aktif',
    personnelOrTeams: '18+ Pasukan LFPB & Tim Menwa',
    summary:
      'Konsentrasi kontingen terbesar Lomba Formasi Pengibaran Bendera GERANAT VII dan Batalyon Menwa Mahawarman Jawa Barat.',
    route: '/geranat',
  },
  {
    id: 'NODE-KONTINGEN-YOGYAKARTA',
    name: 'Delegasi Kontingen DI Yogyakarta & Jawa Tengah',
    shortLabel: 'Yogyakarta',
    category: 'kontingen_nasional',
    categoryLabel: 'Asal Kontingen KC VIII & GERANAT VII',
    lat: -7.7956,
    lng: 110.3695,
    region: 'DI Yogyakarta & Semarang',
    date: 'Awal Desember 2026',
    status: 'Kontingen Terdaftar',
    personnelOrTeams: '7 Tim Satuan Menwa',
    summary:
      'Delegasi tradisional juara umum cabang akademik, esai strategis, dan ketangkasan militer pada perhelatan Ksatria Cendekia.',
    route: '/kc',
  },
  {
    id: 'NODE-KONTINGEN-SURABAYA',
    name: 'Delegasi Kontingen Jawa Timur & Bali',
    shortLabel: 'Surabaya',
    category: 'kontingen_nasional',
    categoryLabel: 'Asal Kontingen KC VIII & GERANAT VII',
    lat: -7.2575,
    lng: 112.7521,
    region: 'Surabaya, Malang & Denpasar',
    date: 'Desember 2026',
    status: 'Kontingen Terdaftar',
    personnelOrTeams: '8 Tim Menwa & SLTA',
    summary:
      'Kontingen lintas universitas Jawa Timur dan Bali dalam rangkaian Latihan Integrasi Pemuda Nusantara KC VIII di Jakarta.',
    route: '/kc',
  },
  {
    id: 'NODE-KONTINGEN-BALIKPAPAN',
    name: 'Delegasi Kontingen Kalimantan (KC VIII)',
    shortLabel: 'Balikpapan',
    category: 'kontingen_nasional',
    categoryLabel: 'Asal Kontingen KC VIII & GERANAT VII',
    lat: -1.2379,
    lng: 116.8529,
    region: 'Balikpapan, Samarinda & Banjarmasin',
    date: 'Awal Desember 2026',
    status: 'Kontingen Terdaftar',
    personnelOrTeams: '3 Tim Menwa Kalimantan',
    summary:
      'Perwakilan satuan Resimen Mahasiswa wilayah Kalimantan pada cabang Video Kreatif Kearifan Lokal dan Menembak.',
    route: '/kc',
  },
  {
    id: 'NODE-KONTINGEN-MAKASSAR',
    name: 'Delegasi Kontingen Indonesia Timur (Makassar & Mappi)',
    shortLabel: 'Makassar',
    category: 'kontingen_nasional',
    categoryLabel: 'Asal Kontingen KC VIII & GERANAT VII',
    lat: -5.1477,
    lng: 119.4327,
    region: 'Sulawesi Selatan & Kawasan Timur',
    date: 'Awal Desember 2026',
    status: 'Kontingen Terdaftar',
    personnelOrTeams: '4 Tim Delegasi Nusantara',
    summary:
      'Jejaring persaudaraan nusantara satuan Menwa kawasan timur Indonesia pada kompetisi nasional dan sinergi pengabdian.',
    route: '/kc',
  },
];

/* ============================================================================
 * 5. BASIS DATA VERIFIKASI SERTIFIKAT DIGITAL (/verify)
 * ============================================================================ */
export const VERIFIED_CERTIFICATES: VerifiedCertificateRecord[] = [
  {
    certId: 'CERT-YSP-2026-088',
    recipientName: 'Aulia Asharany Jasmine',
    institution: 'Universitas Negeri Jakarta',
    programCode: 'YOUTH_SPARK',
    eventName: 'Youth Spark National Seminar 2026: Empowering Youth, Elevating UMKM',
    categoryOrRank: 'Peserta & Delegasi Aktif Seminar Nasional',
    predicate: 'Lulus Evaluasi Pre-Test & Post-Test (Sangat Memuaskan)',
    eventDate: '24 Oktober 2026',
    issuedDate: '26 Oktober 2026',
    signedBy: 'Eben Haezer Sitorus',
    signerTitle: 'Komandan Satuan Resimen Mahasiswa UNJ',
    decreeNumber: 'SERT/088/YSP-DISPORA/SAT-UNJ/X/2026',
    status: 'SAH_TERVERIFIKASI',
  },
  {
    certId: 'CERT-KCVIII-2026-001',
    recipientName: 'Kontingen Batalyon Mahawarman Universitas Padjadjaran (Tim A)',
    institution: 'Universitas Padjadjaran',
    programCode: 'KC_VIII',
    eventName: 'Latihan Integrasi Pemuda Nusantara — Ksatria Cendekia VIII Tahun 2026',
    categoryOrRank: 'Finalis Terverifikasi Cabang Esai Nasional & Ketangkasan T.H.O.R.',
    predicate: 'Kontingen Resmi Terdaftar (Prioritas Kompensasi SK B-159)',
    eventDate: 'Estimasi Awal Desember 2026',
    issuedDate: '02 November 2026',
    signedBy: 'Eben Haezer Sitorus',
    signerTitle: 'Komandan Satuan Resimen Mahasiswa UNJ',
    decreeNumber: 'REG-CERT/001/KCVIII/SAT-UNJ/XI/2026',
    status: 'SAH_TERVERIFIKASI',
  },
  {
    certId: 'CERT-GRN7-2026-014',
    recipientName: 'Pasukan Paskibra SMAN 8 Jakarta (Kontingen Garuda)',
    institution: 'SMA Negeri 8 Jakarta',
    programCode: 'GERANAT_VII',
    eventName: 'Lomba Formasi Pengibaran Bendera GERANAT VII Tingkat Nasional',
    categoryOrRank: 'Juara Umum I LFPB & Komandan Peleton Terbaik',
    predicate: 'Kualifikasi Kehormatan Tingkat SLTA/Sederajat',
    eventDate: '19–20 Desember 2026',
    issuedDate: '20 Desember 2026',
    signedBy: 'Eben Haezer Sitorus',
    signerTitle: 'Komandan Satuan Resimen Mahasiswa UNJ',
    decreeNumber: 'PIAGAM/014/GRN-VII/SAT-UNJ/XII/2026',
    status: 'SAH_TERVERIFIKASI',
  },
  {
    certId: 'CERT-KCVII-2025-003',
    recipientName: 'Kontingen Menwa Satuan Universitas Gadjah Mada',
    institution: 'Universitas Gadjah Mada',
    programCode: 'KC_VIII',
    eventName: 'Latihan Integrasi Pemuda Nusantara — Ksatria Cendekia VII',
    categoryOrRank: 'Juara I Lomba Menembak Senapan & Juara II Esai Strategis',
    predicate: 'Penerima Piala Kehormatan Komando Satuan UNJ',
    eventDate: '14–16 November 2025',
    issuedDate: '17 November 2025',
    signedBy: 'Komandan Satuan Menwa UNJ Periode 2025',
    signerTitle: 'Komandan Satuan Resimen Mahasiswa UNJ',
    decreeNumber: 'PIAGAM/003/KCVII/SAT-UNJ/XI/2025',
    status: 'SAH_TERVERIFIKASI',
  },
  {
    certId: 'CERT-DIKSAR-2026-053',
    recipientName: 'Ibnu Bintang Satriawan',
    institution: 'Universitas Negeri Jakarta',
    programCode: 'DIKSAR',
    eventName: 'Pendidikan Dasar Militer (Diksarmil) & Pembaretan Baret Ungu Menwa Jayakarta',
    categoryOrRank: 'Lulusan Terbaik Aspek Kepemimpinan Lapangan & Samapta',
    predicate: 'Kualifikasi Kader Aktif Baret Ungu',
    eventDate: 'April 2026',
    issuedDate: '28 April 2026',
    signedBy: 'Eben Haezer Sitorus',
    signerTitle: 'Komandan Satuan Resimen Mahasiswa UNJ',
    decreeNumber: 'SERT/053/DIKSAR/SAT-UNJ/IV/2026',
    status: 'SAH_TERVERIFIKASI',
  },
];

export function normalizeCertificateId(rawInput: string): string {
  return sanitizeInput(rawInput, 80)
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/[^A-Z0-9-_/]/g, '');
}

export function verifyCertificateById(
  rawCertId: string,
  additionalRecords: VerifiedCertificateRecord[] = []
): VerifiedCertificateRecord | null {
  const target = normalizeCertificateId(rawCertId);
  if (!target) return null;
  const combined = [...additionalRecords, ...VERIFIED_CERTIFICATES];
  return (
    combined.find((rec) => normalizeCertificateId(rec.certId) === target) ||
    combined.find((rec) => normalizeCertificateId(rec.decreeNumber) === target) ||
    null
  );
}

/* ============================================================================
 * 6. JADWAL PIKET HARIAN MAKO (GEDUNG G R.107) — TACTICAL WALLBOARD
 * ============================================================================ */
export const PIKET_MAKO_SCHEDULE: PiketMakoShift[] = [
  {
    day: 'Senin',
    shiftTime: '08.00 – 22.00 WIB',
    commanderOnDuty: 'Raffli Syahputra (Wadansat)',
    staffOnDuty: 'Ichsan Ridwan Hafizh & Hilmi Suciasih',
    readinessStatus: 'Siaga Penuh G.107',
  },
  {
    day: 'Selasa',
    shiftTime: '08.00 – 22.00 WIB',
    commanderOnDuty: 'Mario Bagaskara (Kasi Ops)',
    staffOnDuty: 'Adam Ramadhana & Nadia Windra Zahara',
    readinessStatus: 'Siaga Penuh G.107',
  },
  {
    day: 'Rabu',
    shiftTime: '08.00 – 22.00 WIB',
    commanderOnDuty: 'Ghifari Ghufron (Kasminu)',
    staffOnDuty: 'Julia Rizqi Rahmawati & Alip Rohman Gunawan',
    readinessStatus: 'Siaga Pelayanan Surat',
  },
  {
    day: 'Kamis',
    shiftTime: '08.00 – 22.00 WIB',
    commanderOnDuty: 'Muhammad Zickry Iswandi (Danden)',
    staffOnDuty: 'Khansa Asma Itsar & Belli Vio Saputra',
    readinessStatus: 'Siaga Penuh G.107',
  },
  {
    day: 'Jumat',
    shiftTime: '08.00 – 22.00 WIB',
    commanderOnDuty: 'Ahza Rusyaidi Zaman (Kasi Log)',
    staffOnDuty: 'Tiara Cendy Julianti & Ibnu Bintang Satriawan',
    readinessStatus: 'Inspeksi Inventaris & PAM',
  },
  {
    day: 'Sabtu',
    shiftTime: '08.00 – 20.00 WIB',
    commanderOnDuty: 'Eben Haezer Sitorus (Dansat)',
    staffOnDuty: 'Regu Provos & Pokpas Latihan Rutin',
    readinessStatus: 'Giat Pembinaan Fisik',
  },
  {
    day: 'Minggu',
    shiftTime: '09.00 – 18.00 WIB',
    commanderOnDuty: 'Perwira Piket Mingguan',
    staffOnDuty: ' Tim Siaga Komunikasi WhatsApp Mako',
    readinessStatus: 'Siaga Terbatas / Daring',
  },
];

/* ============================================================================
 * 7. SMART ADMINU TICKET TRACKER (PAM-2026-XXX)
 * ============================================================================ */
const ADMINU_TICKETS_STORAGE_KEY = 'menwa_smart_adminu_tickets_v1';
const ADMINU_UPDATE_EVENT = 'menwa:adminu-tickets-updated';

export const DEFAULT_ADMINU_TICKETS: AdminuPamTicket[] = [
  {
    ticketId: 'PAM-2026-101',
    createdAt: '2026-11-08T09:15:00.000Z',
    applicantName: 'Panitia Wisuda Semester Ganjil UNJ',
    institution: 'Biro Akademik & Kemahasiswaan UNJ',
    contactPhone: '0812-8800-1122',
    contactEmail: 'akademik@unj.ac.id',
    serviceCategory: 'PAM_KEGIATAN',
    serviceLabel: 'Permohonan Personel Pengamanan Kegiatan (PAM)',
    eventName: 'Pengamanan & Protokoler Sidang Terbuka Wisuda UNJ',
    eventDate: '2026-11-28',
    eventLocation: ' Gedung GOR Kampus B UNJ',
    personnelRequested: 14,
    notes: 'Pengaturan jalur VIP rektorat, ring 1 pintu masuk wisudawan, dan sterilisasi tribun.',
    letterNumber: 'B-101/PAM-WEB/SAT-UNJ/XI/2026',
    status: 'PERSONEL_DITUGASKAN',
    statusNote: 'Surat Perintah Tugas (Sprin) 14 personel telah diterbitkan oleh Kasi Operasi.',
  },
  {
    ticketId: 'PAM-2026-102',
    createdAt: '2026-11-10T13:40:00.000Z',
    applicantName: 'BEM Fakultas Teknik UNJ',
    institution: 'Fakultas Teknik Universitas Negeri Jakarta',
    contactPhone: '0857-1920-3344',
    contactEmail: 'bemft@unj.ac.id',
    serviceCategory: 'PAM_KEGIATAN',
    serviceLabel: 'Permohonan Personel Pengamanan Kegiatan (PAM)',
    eventName: 'Pekan Raya & Pameran Inovasi Teknologi Mahasiswa FT',
    eventDate: '2026-12-04',
    eventLocation: 'Plaza & Aula Fakultas Teknik Kampus A UNJ',
    personnelRequested: 8,
    notes: 'Pengamanan registrasi pengunjung dan ketertiban panggung penutupan.',
    letterNumber: 'B-102/PAM-WEB/SAT-UNJ/XI/2026',
    status: 'AUDIENSI_POLA_PAM',
    statusNote: 'Dijadwalkan audiensi teknis pola pengamanan di Mako Gedung G R.107.',
  },
  {
    ticketId: 'PAM-2026-103',
    createdAt: '2026-11-11T16:05:00.000Z',
    applicantName: 'OSIS & MPK SMAN 31 Jakarta',
    institution: 'SMA Negeri 31 Jakarta Timur',
    contactPhone: '0813-7744-9900',
    contactEmail: 'osis@sman31jkt.sch.id',
    serviceCategory: 'INSTRUKTUR_PELATIH',
    serviceLabel: 'Permohonan Instruktur LDKS & Tata Upacara',
    eventName: 'Latihan Dasar Kepemimpinan Siswa (LDKS) Angkatan 2026',
    eventDate: '2026-12-11',
    eventLocation: 'Aula SMAN 31 Jakarta Timur',
    personnelRequested: 4,
    notes: 'Materi PBB dasar, kepemimpinan lapangan, dan wawasan kebangsaan.',
    letterNumber: 'B-103/ADM-WEB/SAT-UNJ/XI/2026',
    status: 'VERIFIKASI_ADMINU',
    statusNote: 'Berkas surat permohonan sedang diverifikasi oleh Kepala Urusan Administrasi Umum.',
  },
];

export function generatePamTicketId(existingCount = 0, seedNumber?: number): string {
  const seq = seedNumber ?? 104 + Math.max(0, existingCount);
  return `PAM-2026-${String(seq).padStart(3, '0')}`;
}

export function getAdminuTickets(customStorage?: StorageLike): AdminuPamTicket[] {
  const store = resolveSafeStorage(customStorage);
  try {
    const raw = store.getItem(ADMINU_TICKETS_STORAGE_KEY);
    if (!raw) return DEFAULT_ADMINU_TICKETS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_ADMINU_TICKETS;
    return parsed;
  } catch {
    return DEFAULT_ADMINU_TICKETS;
  }
}

export function createAdminuTicket(
  draft: Omit<AdminuPamTicket, 'ticketId' | 'createdAt' | 'letterNumber' | 'status' | 'statusNote'>,
  customStorage?: StorageLike,
  overrideSeq?: number
): AdminuPamTicket {
  const store = resolveSafeStorage(customStorage);
  const current = getAdminuTickets(store);
  const maxExistingNum = current.reduce((max, item) => {
    const match = /PAM-2026-(\d+)/i.exec(item.ticketId);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 103);

  const chosenSeq =
    typeof overrideSeq === 'number' && Number.isFinite(overrideSeq) && overrideSeq > 0
      ? Math.max(maxExistingNum + 1, Math.floor(overrideSeq))
      : maxExistingNum + 1;

  const ticketId = generatePamTicketId(0, chosenSeq);
  const seqStr = ticketId.split('-')[2] || '104';
  const cleanDraft = sanitizeDeep(draft);

  const romawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const now = new Date();
  const romanMonth = romawi[now.getMonth()] || 'XI';
  const year = now.getFullYear();

  const created: AdminuPamTicket = {
    ticketId,
    createdAt: now.toISOString(),
    applicantName: sanitizeInput(cleanDraft.applicantName, 120),
    institution: sanitizeInput(cleanDraft.institution, 150),
    contactPhone: sanitizeInput(cleanDraft.contactPhone, 40),
    contactEmail: sanitizeInput(cleanDraft.contactEmail, 120),
    serviceCategory: cleanDraft.serviceCategory,
    serviceLabel: sanitizeInput(cleanDraft.serviceLabel, 120),
    eventName: sanitizeInput(cleanDraft.eventName, 180),
    eventDate: sanitizeInput(cleanDraft.eventDate, 40),
    eventLocation: sanitizeInput(cleanDraft.eventLocation, 180),
    personnelRequested: Math.min(100, Math.max(1, Number(cleanDraft.personnelRequested) || 4)),
    notes: sanitizeInput(cleanDraft.notes, 1000),
    letterNumber: `B-${seqStr}/Web/${romanMonth}/${year}`,
    status: 'DITERIMA',
    statusNote: 'Permohonan telah tercatat di antrean Piket Mako untuk verifikasi awal.',
  };

  const cleanPdfName = sanitizeInput(cleanDraft.attachmentPdfName || '', 160);
  if (cleanPdfName) {
    created.attachmentPdfName = cleanPdfName;
  }
  const cleanPdfUrl = sanitizeUrl(cleanDraft.attachmentPdfUrl || '', '');
  if (cleanPdfUrl) {
    created.attachmentPdfUrl = cleanPdfUrl;
  }
  if (typeof cleanDraft.attachmentPdfSizeKb === 'number' && Number.isFinite(cleanDraft.attachmentPdfSizeKb)) {
    created.attachmentPdfSizeKb = Math.max(0, Math.min(2048, Math.round(cleanDraft.attachmentPdfSizeKb)));
  }

  const nextList = [created, ...current];
  store.setItem(ADMINU_TICKETS_STORAGE_KEY, JSON.stringify(nextList));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ADMINU_UPDATE_EVENT));
  }
  if (activeCloudBridge?.createAdminuTicketInCloud) {
    activeCloudBridge.createAdminuTicketInCloud(created).catch(() => false);
  }
  return created;
}

export function updateAdminuTicketStatus(
  ticketId: string,
  status: AdminuPamTicket['status'],
  statusNote: string,
  customStorage?: StorageLike
): AdminuPamTicket[] {
  const store = resolveSafeStorage(customStorage);
  const current = getAdminuTickets(store);
  const cleanNote = sanitizeInput(statusNote, 400);
  const nextList = current.map((item) =>
    item.ticketId.toUpperCase() === ticketId.trim().toUpperCase()
      ? { ...item, status, statusNote: cleanNote || item.statusNote }
      : item
  );
  store.setItem(ADMINU_TICKETS_STORAGE_KEY, JSON.stringify(nextList));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ADMINU_UPDATE_EVENT));
  }
  if (activeCloudBridge?.updateAdminuTicketInCloud) {
    activeCloudBridge.updateAdminuTicketInCloud(ticketId, status, cleanNote).catch(() => false);
  }
  return nextList;
}

export function updateLocalAdminuTicketLetterLink(
  ticketId: string,
  letterNumber: string,
  customStorage?: StorageLike
): AdminuPamTicket[] {
  const store = resolveSafeStorage(customStorage);
  const current = getAdminuTickets(store);
  const cleanId = sanitizeInput(ticketId, 40).toUpperCase();
  const cleanLetter = sanitizeInput(letterNumber, 80);
  if (!cleanId || !cleanLetter) return current;

  const nextList = current.map((item) =>
    item.ticketId.toUpperCase() === cleanId
      ? { ...item, linkedLetterNumber: cleanLetter }
      : item
  );
  store.setItem(ADMINU_TICKETS_STORAGE_KEY, JSON.stringify(nextList));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ADMINU_UPDATE_EVENT));
  }
  return nextList;
}

export function applyRemoteAdminuTickets(
  remoteTickets: AdminuPamTicket[],
  customStorage?: StorageLike
): AdminuPamTicket[] {
  if (!Array.isArray(remoteTickets) || remoteTickets.length === 0) {
    return getAdminuTickets(customStorage);
  }
  const store = resolveSafeStorage(customStorage);
  const localTickets = getAdminuTickets(store);
  const mergedMap = new Map<string, AdminuPamTicket>();

  for (const t of localTickets) {
    if (t && t.ticketId) {
      mergedMap.set(t.ticketId.toUpperCase(), t);
    }
  }
  for (const rt of remoteTickets) {
    if (rt && rt.ticketId) {
      const normalized: AdminuPamTicket = {
        ...rt,
        applicantName: sanitizeInput(rt.applicantName, 120),
        institution: sanitizeInput(rt.institution, 150),
        eventName: sanitizeInput(rt.eventName, 180),
        eventLocation: sanitizeInput(rt.eventLocation, 180),
        statusNote: sanitizeInput(rt.statusNote, 400),
      };
      if (rt.attachmentPdfName) {
        normalized.attachmentPdfName = sanitizeInput(rt.attachmentPdfName, 160);
      }
      if (rt.attachmentPdfUrl) {
        normalized.attachmentPdfUrl = sanitizeUrl(rt.attachmentPdfUrl, '');
      }
      if (rt.linkedLetterNumber) {
        normalized.linkedLetterNumber = sanitizeInput(rt.linkedLetterNumber, 80);
      }
      mergedMap.set(rt.ticketId.toUpperCase(), normalized);
    }
  }

  const merged = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
  store.setItem(ADMINU_TICKETS_STORAGE_KEY, JSON.stringify(merged));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ADMINU_UPDATE_EVENT));
  }
  return merged;
}

export function findAdminuTicketByCode(
  rawCode: string,
  customStorage?: StorageLike
): AdminuPamTicket | null {
  const target = sanitizeInput(rawCode, 60).toUpperCase().replace(/\s+/g, '');
  if (!target) return null;
  const list = getAdminuTickets(customStorage);
  return (
    list.find((t) => t.ticketId.toUpperCase() === target) ||
    list.find((t) => t.letterNumber.toUpperCase() === target) ||
    list.find((t) => (t.linkedLetterNumber || '').toUpperCase() === target) ||
    null
  );
}

export function useAdminuTickets(): AdminuPamTicket[] {
  const [tickets, setTickets] = useState<AdminuPamTicket[]>(() => getAdminuTickets());
  useEffect(() => {
    const sync = () => setTickets(getAdminuTickets());
    window.addEventListener(ADMINU_UPDATE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(ADMINU_UPDATE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return tickets;
}

/* ============================================================================
 * 8. MODULAR CMS SERVICE LAYER (FIREBASE FIRESTORE + LOCALSTORAGE REAKTIF)
 * ============================================================================ */
export const CMS_STORAGE_KEY = 'menwa_site_cms_v9';
const CMS_UPDATE_EVENT = 'menwa:site-cms-updated';

export interface SiteConfigCloudBridge {
  syncCmsToCloud?: (content: SiteCmsContent) => Promise<boolean>;
  createAdminuTicketInCloud?: (ticket: AdminuPamTicket) => Promise<boolean>;
  updateAdminuTicketInCloud?: (
    ticketId: string,
    status: AdminuPamTicket['status'],
    statusNote: string
  ) => Promise<boolean>;
  isAuthenticatedForCloudWrite?: () => boolean;
}

let activeCloudBridge: SiteConfigCloudBridge | null = null;

export function registerSiteConfigCloudBridge(bridge: SiteConfigCloudBridge | null): void {
  activeCloudBridge = bridge;
}

export interface CmsDataAdapter {
  readonly providerName: 'firebase-hybrid' | 'localStorage';
  readonly isCloudConfigured: boolean;
  load(): SiteCmsContent;
  save(content: SiteCmsContent): SiteCmsContent;
  syncToCloud?(content: SiteCmsContent): Promise<boolean>;
}

function normalizeCmsItem(raw: Partial<CmsContentItem>, fallbackId: string): CmsContentItem {
  return {
    id: sanitizeInput(raw.id || fallbackId, 80) || fallbackId,
    title: sanitizeInput(raw.title || 'Agenda Satuan Menwa UNJ', 180),
    description: sanitizeInput(raw.description || '', 800),
    tag: sanitizeInput(raw.tag || 'Informasi Satuan', 80),
    date: sanitizeInput(raw.date || '2026', 80),
    location: sanitizeInput(raw.location || 'Kampus A UNJ, Rawamangun', 140),
    status: sanitizeInput(raw.status || 'Aktif', 90),
    image: sanitizeUrl(raw.image, '/foto-kampus-unj.jpg'),
    route: sanitizeUrl(raw.route || '/', '/'),
    featured: raw.featured !== false,
  };
}

function validateAndSanitizeSiteContent(raw: Partial<SiteCmsContent>): SiteCmsContent {
  const heroScenes = Array.isArray(raw.heroScenes) && raw.heroScenes.length > 0
    ? raw.heroScenes.map((it, i) => normalizeCmsItem(it, `HERO-${i + 1}`))
    : DEFAULT_SITE_CONTENT.heroScenes;

  const sorotanGiat = Array.isArray(raw.sorotanGiat) && raw.sorotanGiat.length > 0
    ? raw.sorotanGiat.map((it, i) => normalizeCmsItem(it, `GIAT-${i + 1}`))
    : DEFAULT_SITE_CONTENT.sorotanGiat;

  const programs = Array.isArray(raw.programs) && raw.programs.length > 0
    ? raw.programs.map((it, i) => normalizeCmsItem(it, `PROG-${i + 1}`))
    : DEFAULT_SITE_CONTENT.programs;

  const galleryAlbums = Array.isArray(raw.galleryAlbums) && raw.galleryAlbums.length > 0
    ? raw.galleryAlbums.map((it, i) => normalizeCmsItem(it, `GAL-${i + 1}`))
    : DEFAULT_SITE_CONTENT.galleryAlbums;

  return {
    version: sanitizeInput(raw.version || DEFAULT_SITE_CONTENT.version, 40),
    updatedAt:
      typeof raw.updatedAt === 'string' && raw.updatedAt.trim()
        ? sanitizeInput(raw.updatedAt, 50)
        : new Date().toISOString(),
    updatedBy: sanitizeInput(raw.updatedBy || 'Perwira Komando Mako', 120),
    heroScenes,
    sorotanGiat,
    programs,
    galleryAlbums,
  };
}

export function applyRemoteSiteContent(
  remoteContent: Partial<SiteCmsContent>,
  customStorage?: StorageLike
): SiteCmsContent {
  const store = resolveSafeStorage(customStorage);
  const sanitized = validateAndSanitizeSiteContent(remoteContent);
  store.setItem(CMS_STORAGE_KEY, JSON.stringify(sanitized));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CMS_UPDATE_EVENT));
  }
  return sanitized;
}

export function createCmsAdapter(customStorage?: StorageLike): CmsDataAdapter {
  const store = resolveSafeStorage(customStorage);

  return {
    providerName: 'firebase-hybrid',
    isCloudConfigured: true,
    load(): SiteCmsContent {
      try {
        const saved = store.getItem(CMS_STORAGE_KEY);
        if (!saved) return DEFAULT_SITE_CONTENT;
        const parsed = JSON.parse(saved) as Partial<SiteCmsContent>;
        return validateAndSanitizeSiteContent(parsed);
      } catch {
        return DEFAULT_SITE_CONTENT;
      }
    },
    save(content: SiteCmsContent): SiteCmsContent {
      const sanitized = validateAndSanitizeSiteContent({
        ...content,
        updatedAt: new Date().toISOString(),
      });
      store.setItem(CMS_STORAGE_KEY, JSON.stringify(sanitized));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(CMS_UPDATE_EVENT));
      }
      if (activeCloudBridge?.syncCmsToCloud) {
        activeCloudBridge.syncCmsToCloud(sanitized).catch(() => {
          // Tetap tersimpan aman di localStorage apabila offline atau mode Piket lokal
        });
      }
      return sanitized;
    },
    async syncToCloud(content: SiteCmsContent): Promise<boolean> {
      if (!activeCloudBridge?.syncCmsToCloud) return false;
      return activeCloudBridge.syncCmsToCloud(validateAndSanitizeSiteContent(content));
    },
  };
}

export function getSiteContent(customStorage?: StorageLike): SiteCmsContent {
  return createCmsAdapter(customStorage).load();
}

export function saveSiteContent(
  nextContent: SiteCmsContent,
  officerLabel = 'Perwira Komando Mako',
  customStorage?: StorageLike
): SiteCmsContent {
  const adapter = createCmsAdapter(customStorage);
  return adapter.save({
    ...nextContent,
    updatedBy: sanitizeInput(officerLabel, 120),
    updatedAt: new Date().toISOString(),
  });
}

export function upsertCmsItem(
  section: CmsSectionKey,
  item: Partial<CmsContentItem>,
  officerLabel = 'Perwira Komando Mako',
  customStorage?: StorageLike
): SiteCmsContent {
  const current = getSiteContent(customStorage);
  const list = [...current[section]];
  const targetId = item.id ? sanitizeInput(item.id, 80) : `${section.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const normalized = normalizeCmsItem({ ...item, id: targetId }, targetId);

  const existingIdx = list.findIndex((entry) => entry.id === normalized.id);
  if (existingIdx >= 0) {
    list[existingIdx] = normalized;
  } else {
    list.unshift(normalized);
  }

  return saveSiteContent(
    {
      ...current,
      [section]: list,
    },
    officerLabel,
    customStorage
  );
}

export function deleteCmsItem(
  section: CmsSectionKey,
  itemId: string,
  officerLabel = 'Perwira Komando Mako',
  customStorage?: StorageLike
): SiteCmsContent {
  const current = getSiteContent(customStorage);
  const filtered = current[section].filter((entry) => entry.id !== itemId);
  // Cegah koleksi kosong total agar tata letak beranda selalu terjaga
  if (filtered.length === 0) {
    return current;
  }
  return saveSiteContent(
    {
      ...current,
      [section]: filtered,
    },
    officerLabel,
    customStorage
  );
}

export function resetSiteContentToDefault(customStorage?: StorageLike): SiteCmsContent {
  const store = resolveSafeStorage(customStorage);
  store.removeItem(CMS_STORAGE_KEY);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CMS_UPDATE_EVENT));
  }
  if (activeCloudBridge?.syncCmsToCloud) {
    activeCloudBridge.syncCmsToCloud(DEFAULT_SITE_CONTENT).catch(() => false);
  }
  return DEFAULT_SITE_CONTENT;
}

export function exportSiteContentJson(customStorage?: StorageLike): string {
  const current = getSiteContent(customStorage);
  return JSON.stringify(current, null, 2);
}

export function importSiteContentJson(
  rawJson: string,
  officerLabel = 'Impor JSON Komando',
  customStorage?: StorageLike
): { ok: boolean; content?: SiteCmsContent; error?: string } {
  try {
    const parsed = JSON.parse(rawJson) as Partial<SiteCmsContent>;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      (!Array.isArray(parsed.heroScenes) &&
        !Array.isArray(parsed.sorotanGiat) &&
        !Array.isArray(parsed.programs) &&
        !Array.isArray(parsed.galleryAlbums))
    ) {
      return {
        ok: false,
        error: 'Struktur berkas JSON tidak sesuai dengan skema CMS Portal Menwa UNJ.',
      };
    }
    const saved = saveSiteContent(parsed as SiteCmsContent, officerLabel, customStorage);
    return { ok: true, content: saved };
  } catch {
    return {
      ok: false,
      error: 'Format JSON tidak valid. Pastikan seluruh tanda kutip dan kurung kurawal lengkap.',
    };
  }
}

export function useSiteContent(): {
  content: SiteCmsContent;
  isCloudConfigured: boolean;
  providerName: string;
} {
  const adapter = createCmsAdapter();
  const [content, setContent] = useState<SiteCmsContent>(() => adapter.load());

  useEffect(() => {
    const handleSync = () => {
      setContent(createCmsAdapter().load());
    };
    window.addEventListener(CMS_UPDATE_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(CMS_UPDATE_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  return {
    content,
    isCloudConfigured: adapter.isCloudConfigured,
    providerName: adapter.providerName,
  };
}
