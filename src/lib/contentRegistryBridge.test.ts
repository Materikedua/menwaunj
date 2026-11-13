import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SITE_CONTENT } from '../data/siteConfig';
import {
  normalizeContentId,
  isUploadedMediaUrl,
  isGenericOrFilenameTitle,
  mergeHeroScenesWithRegistry,
  mergeSorotanGiatWithRegistry,
  mergeProgramsWithRegistry,
  mergeGalleryAlbumsWithRegistry,
  resolvePartnerLogoOverride,
  getMappedRegistryIdsForCmsItem,
  buildStorageFallbackRegistryEntries,
  type RegistryMediaItem,
} from './contentRegistryBridge';

const FIREBASE_TEST_URL_1 =
  'https://firebasestorage.googleapis.com/v0/b/admin-raffli.firebasestorage.app/o/assets%2Fimages%2Fberanda%2FIMG_5614-1794000000000.webp?alt=media';
const FIREBASE_TEST_URL_2 =
  'https://firebasestorage.googleapis.com/v0/b/admin-raffli.firebasestorage.app/o/assets%2Fimages%2Fberanda%2FHUTRI-81-1794000000001.webp?alt=media';
const FIREBASE_TEST_URL_3 =
  'https://firebasestorage.googleapis.com/v0/b/admin-raffli.firebasestorage.app/o/assets%2Fimages%2Fgallery%2Fsertijab-1.webp?alt=media';
const FIREBASE_TEST_URL_4 =
  'https://firebasestorage.googleapis.com/v0/b/admin-raffli.firebasestorage.app/o/assets%2Fimages%2Fgallery%2Fsertijab-2.webp?alt=media';
const FIREBASE_UNJ_LOGO =
  'https://firebasestorage.googleapis.com/v0/b/admin-raffli.firebasestorage.app/o/assets%2Fimages%2Fberanda%2Flogo-unj.webp?alt=media';

test('normalizeContentId dan isUploadedMediaUrl memvalidasi format aset unggahan', () => {
  assert.equal(normalizeContentId(' cnt_beranda_hero_2 '), 'CNT-BERANDA-HERO-2');
  assert.equal(isUploadedMediaUrl(FIREBASE_TEST_URL_1), true);
  assert.equal(isUploadedMediaUrl('data:image/webp;base64,UklGRh4AAABXRUJQ'), true);
  assert.equal(isUploadedMediaUrl('/foto-kampus-unj.jpg'), false);
  assert.equal(isUploadedMediaUrl('data:image/svg+xml;utf8,<svg></svg>'), false);
  assert.equal(isUploadedMediaUrl('javascript:alert(1)'), false);
});

test('isGenericOrFilenameTitle mendeteksi nama berkas kamera & prefix bawaan', () => {
  assert.equal(isGenericOrFilenameTitle('IMG_5614'), true);
  assert.equal(isGenericOrFilenameTitle('DSC09371'), true);
  assert.equal(isGenericOrFilenameTitle('Hero Scene 02: Ksatria Cendekia VIII'), true);
  assert.equal(isGenericOrFilenameTitle('Latihan Integrasi Pemuda Nusantara'), false);
});

test('mergeHeroScenesWithRegistry memetakan CNT-BERANDA-HERO-2..5 ke HERO-02..05 dan menjaga jadwal resmi', () => {
  const registry: RegistryMediaItem[] = [
    {
      contentId: 'CNT-BERANDA-HERO-2',
      tabId: 'beranda',
      sectionId: 'hero_banner',
      title: 'IMG_5614',
      caption: 'Dokumentasi baru',
      imageUrl: FIREBASE_TEST_URL_1,
      isActive: true,
    },
    {
      contentId: 'CNT-BERANDA-HERO-CUSTOM',
      tabId: 'beranda',
      sectionId: 'hero_banner',
      title: 'Apel Gabungan Lintas Satuan Jabodetabek',
      caption: 'Sinergi Batalyon Jayakarta di Kampus A UNJ.',
      imageUrl: FIREBASE_TEST_URL_2,
      isActive: true,
    },
  ];

  const merged = mergeHeroScenesWithRegistry(DEFAULT_SITE_CONTENT.heroScenes, registry);
  assert.equal(merged.length, DEFAULT_SITE_CONTENT.heroScenes.length + 1);

  const hero2 = merged.find((s) => s.id === 'HERO-02');
  assert.ok(hero2);
  assert.equal(hero2.image, FIREBASE_TEST_URL_1);
  // Nama berkas kamera tidak menimpa judul resmi KC VIII, dan jadwal resmi tetap terjaga
  assert.equal(hero2.title, 'Ksatria Cendekia VIII Tingkat Nasional');
  assert.equal(hero2.date, 'Awal Desember 2026');
  assert.equal(hero2.status, 'Jadwal Diundur Resmi');

  const extra = merged.find((s) => s.id === 'CNT-BERANDA-HERO-CUSTOM');
  assert.ok(extra);
  assert.equal(extra.title, 'Apel Gabungan Lintas Satuan Jabodetabek');
  assert.equal(extra.image, FIREBASE_TEST_URL_2);
});

test('mergeSorotanGiatWithRegistry menerapkan pemetaan tergeser dan menyertakan GIAT-7/8 yang terunggah', () => {
  const registry: RegistryMediaItem[] = [
    {
      contentId: 'CNT-BERANDA-GIAT-2',
      tabId: 'beranda',
      sectionId: 'sorotan_giat',
      imageUrl: FIREBASE_TEST_URL_1,
      isActive: true,
    },
    {
      contentId: 'CNT-BERANDA-GIAT-7',
      tabId: 'beranda',
      sectionId: 'sorotan_giat',
      title: 'Sorotan Giat: Upacara HUT RI ke-81',
      caption: 'Pasukan Pengibar Bendera Menwa Satuan UNJ di Kampus A.',
      imageUrl: FIREBASE_TEST_URL_2,
      isActive: true,
    },
    {
      contentId: 'CNT-BERANDA-GIAT-8',
      tabId: 'beranda',
      sectionId: 'sorotan_giat',
      title: 'Studi Banding Menwa IPB',
      caption: 'Pertukaran wawasan komando staf antar satuan.',
      imageUrl: '/dokumentasi/rakomsat25.svg', // belum ada upload baru, tidak menduplikasi bila bukan URL unggahan
      isActive: true,
    },
  ];

  const merged = mergeSorotanGiatWithRegistry(DEFAULT_SITE_CONTENT.sorotanGiat, registry);
  const giat1 = merged.find((g) => g.id === 'GIAT-01');
  assert.ok(giat1);
  assert.equal(giat1.image, FIREBASE_TEST_URL_1);
  assert.equal(giat1.date, 'Awal Desember 2026');

  // CNT-BERANDA-GIAT-7 punya URL Firebase Storage jadi ikut ditampilkan
  const giat7 = merged.find((g) => g.id === 'CNT-BERANDA-GIAT-7');
  assert.ok(giat7);
  assert.equal(giat7.title, 'Upacara HUT RI ke-81');
  assert.equal(giat7.image, FIREBASE_TEST_URL_2);

  // CNT-BERANDA-GIAT-8 hanya placeholder SVG lokal sehingga tidak menambah kartu ekstra duplikat
  assert.equal(
    merged.find((g) => g.id === 'CNT-BERANDA-GIAT-8'),
    undefined
  );
});

test('mergeGalleryAlbumsWithRegistry menggabungkan slide dan album terunggah seperti Sertijab 2026 serta memblokir XSS', () => {
  const registry: RegistryMediaItem[] = [
    {
      contentId: 'CNT-GALERI-doc-youth-spark-2026-SLIDE-1',
      albumId: 'doc-youth-spark-2026',
      tabId: 'gallery',
      sectionId: 'album_galeri',
      slideIndex: 0,
      caption: 'Pembukaan <script>alert(1)</script> Youth Spark 2026',
      imageUrl: FIREBASE_TEST_URL_1,
      isActive: true,
    },
    {
      contentId: 'CNT-GALERI-doc-sertijab-2026-SLIDE-1',
      albumId: 'doc-sertijab-2026',
      albumTitle: 'Sertijab Komandan Satuan (2026)',
      tabId: 'gallery',
      sectionId: 'album_galeri',
      slideIndex: 0,
      caption: 'Pelantikan Dansat Periode 2026',
      imageUrl: FIREBASE_TEST_URL_3,
      year: '2026',
      isActive: true,
    },
    {
      contentId: 'CNT-GALERI-doc-sertijab-2026-SLIDE-2',
      albumId: 'doc-sertijab-2026',
      albumTitle: 'Sertijab Komandan Satuan (2026)',
      tabId: 'gallery',
      sectionId: 'album_galeri',
      slideIndex: 1,
      caption: 'Penyerahan Tunggul Satuan UNJ',
      imageUrl: FIREBASE_TEST_URL_4,
      year: '2026',
      isActive: true,
    },
    {
      contentId: 'CNT-XSS-ATTACK',
      albumId: 'doc-xss',
      tabId: 'gallery',
      sectionId: 'album_galeri',
      caption: 'Payload XSS',
      imageUrl: 'javascript:alert("xss")',
      isActive: true,
    },
  ];

  const merged = mergeGalleryAlbumsWithRegistry(DEFAULT_SITE_CONTENT.galleryAlbums, registry);

  const youthSpark = merged.find((a) => a.id === 'GAL-YOUTH-SPARK-2026');
  assert.ok(youthSpark);
  assert.equal(youthSpark.image, FIREBASE_TEST_URL_1);
  assert.equal(youthSpark.hasUploadedMedia, true);
  assert.ok(!youthSpark.photos[0].caption.includes('<script>'));

  const sertijab = merged.find((a) => a.id === 'doc-sertijab-2026');
  assert.ok(sertijab);
  assert.equal(sertijab.title, 'Sertijab Komandan Satuan (2026)');
  assert.equal(sertijab.photos.length, 2);
  assert.equal(sertijab.image, FIREBASE_TEST_URL_3);

  assert.equal(
    merged.find((a) => a.id === 'doc-xss'),
    undefined
  );
});

test('resolvePartnerLogoOverride dan buildStorageFallbackRegistryEntries memulihkan logo UNJ dan berkas Storage', () => {
  const registry: RegistryMediaItem[] = [
    {
      contentId: 'CNT-BERANDA-LOGO-UNJ',
      tabId: 'beranda',
      sectionId: 'identitas_satuan',
      imageUrl: FIREBASE_UNJ_LOGO,
      isActive: true,
    },
  ];

  assert.equal(
    resolvePartnerLogoOverride('/mitra/unj.png', 'Universitas Negeri Jakarta', registry),
    FIREBASE_UNJ_LOGO
  );
  assert.equal(
    resolvePartnerLogoOverride('/mitra/dispora.png', 'DISPORA DKI Jakarta', registry),
    '/mitra/dispora.png'
  );

  assert.deepEqual(getMappedRegistryIdsForCmsItem('sorotanGiat', 'GIAT-01'), ['CNT-BERANDA-GIAT-2']);

  const fallback = buildStorageFallbackRegistryEntries(
    [
      {
        name: 'sertijab-2026.webp',
        fullPath: 'assets/images/gallery/sertijab-2026.webp',
        url: FIREBASE_TEST_URL_3,
        contentType: 'image/webp',
      },
      {
        name: 'beranda-banner.webp',
        fullPath: 'assets/images/beranda/beranda-banner.webp',
        url: FIREBASE_TEST_URL_2,
        contentType: 'image/webp',
      },
    ],
    []
  );

  assert.equal(fallback.length, 2);
  assert.equal(fallback[0].albumId, 'doc-sertijab-2026');
  assert.equal(fallback[1].tabId, 'beranda');
});
