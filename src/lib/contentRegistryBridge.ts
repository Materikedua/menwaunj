import type { CmsContentItem, CmsSectionKey } from '../data/siteConfig';
import { sanitizeInput, sanitizeUrl } from '../utils/security';

export interface RegistryMediaItem {
  contentId: string;
  id?: string;
  tabId?: string;
  sectionId?: string;
  albumId?: string;
  albumTitle?: string;
  groupTitle?: string;
  title?: string;
  caption?: string;
  description?: string;
  imageUrl?: string;
  originalImageUrl?: string;
  slideIndex?: number;
  order?: number;
  year?: string;
  isActive?: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface GallerySlidePhoto {
  url: string;
  caption: string;
  contentId?: string;
}

export interface MergedGalleryAlbum extends CmsContentItem {
  photos: GallerySlidePhoto[];
  hasUploadedMedia?: boolean;
  sourceRegistryIds?: string[];
}

export interface StorageAssetEntry {
  name: string;
  fullPath: string;
  folder?: string;
  url: string;
  sizeBytes?: number;
  contentType?: string;
  updatedAt?: string;
}

const GENERIC_TITLE_REGEX =
  /^(DSC|IMG|PHOTO|FOTO|WHATSAPP|WA|SCREENSHOT|CUPLIKAN|PXL|MVIMG|DOCUMENT|FILE)[_\s-]*\d*/i;
const DATE_PREFIX_FILENAME_REGEX = /^20\d{6}[_-]\d+/;
const GENERIC_PREFIX_REGEX =
  /^(Hero Scene \d+:|Hero Banner Utama|Sorotan Giat:|Dokumentasi Youth Spark #\d+:|Album Galeri:|Dokumentasi Baru Menwa UNJ)/i;

export function normalizeContentId(id: unknown): string {
  return String(id || '')
    .trim()
    .toUpperCase()
    .replace(/_/g, '-');
}

export function isUploadedMediaUrl(url: unknown): boolean {
  const clean = sanitizeUrl(url, '');
  if (!clean) return false;
  if (clean.startsWith('https://') || clean.startsWith('http://')) {
    return true;
  }
  return /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(clean);
}

export function isDisplayableImageUrl(url: unknown): boolean {
  const clean = sanitizeUrl(url, '');
  if (!clean) return false;
  if (clean.startsWith('/')) return true;
  return isUploadedMediaUrl(clean);
}

export function stripKnownTitlePrefix(title: unknown): string {
  return sanitizeInput(title, 200)
    .replace(/^(Hero Scene \d+:|Hero Banner Utama[^:]*:|Sorotan Giat:|Dokumentasi Youth Spark #\d+:|Album Galeri:|Dokumentasi:)\s*/i, '')
    .trim();
}

export function isGenericOrFilenameTitle(title: unknown): boolean {
  const t = sanitizeInput(title, 200);
  if (!t) return true;
  if (GENERIC_TITLE_REGEX.test(t)) return true;
  if (DATE_PREFIX_FILENAME_REGEX.test(t)) return true;
  if (GENERIC_PREFIX_REGEX.test(t)) return true;
  return false;
}

const HERO_ID_MAP: Record<string, string[]> = {
  'HERO-01': ['CNT-BERANDA-HERO-1', 'CNT-BERANDA-HERO'],
  'HERO-02': ['CNT-BERANDA-HERO-2'],
  'HERO-03': ['CNT-BERANDA-HERO-3'],
  'HERO-04': ['CNT-BERANDA-HERO-4'],
  'HERO-05': ['CNT-BERANDA-HERO-5'],
};

const GIAT_ID_MAP: Record<string, string[]> = {
  'GIAT-01': ['CNT-BERANDA-GIAT-2'],
  'GIAT-02': ['CNT-BERANDA-GIAT-3'],
  'GIAT-03': ['CNT-YOUTH-POSTER', 'CNT-GALLERY-YOUTH-SPARK'],
  'GIAT-04': ['CNT-BERANDA-GIAT-4'],
  'GIAT-05': ['CNT-BERANDA-GIAT-1'],
  'GIAT-06': ['CNT-BERANDA-GIAT-5'],
};

const PROGRAM_ID_MAP: Record<string, string[]> = {
  'PROG-KC-VIII': ['CNT-KC-POSTER', 'CNT-BERANDA-GIAT-2'],
  'PROG-GERANAT-VII': ['CNT-BERANDA-GIAT-3', 'CNT-GERANAT-LOGO'],
  'PROG-YOUTH-SPARK': ['CNT-YOUTH-POSTER', 'CNT-GALLERY-YOUTH-SPARK'],
  'PROG-DIKLAT': ['CNT-PENDIDIKAN-DIKLAT'],
  'PROG-PENGABDIAN': ['CNT-BERANDA-DOK-3', 'CNT-BERANDA-GIAT-4'],
  'PROG-PAM-ADMINU': ['CNT-BERANDA-SARANA-MAKO', 'CNT-MAKO-GEDUNG'],
};

interface GalleryMappingRule {
  coverIds: string[];
  slideAlbumIds: string[];
  slidePrefixes: string[];
}

const GALLERY_ID_MAP: Record<string, GalleryMappingRule> = {
  'GAL-YOUTH-SPARK-2026': {
    coverIds: ['CNT-GALLERY-YOUTH-SPARK', 'CNT-YOUTH-POSTER'],
    slideAlbumIds: ['doc-youth-spark-2026'],
    slidePrefixes: ['CNT-YS-DOK-', 'CNT-GALERI-DOC-YOUTH-SPARK-2026-SLIDE-'],
  },
  'GAL-KC-VIII-2026': {
    coverIds: ['CNT-GALLERY-KC-2026', 'CNT-KC-POSTER'],
    slideAlbumIds: ['doc-kc-viii-2026', 'doc-kc-ix-2026'],
    slidePrefixes: ['CNT-GALERI-DOC-KC-'],
  },
  'GAL-GERANAT-VII-2026': {
    coverIds: ['CNT-GALLERY-GERANAT-2025', 'CNT-GERANAT-LOGO'],
    slideAlbumIds: ['doc-geranat-vii-2025', 'doc-geranat-viii-2025'],
    slidePrefixes: ['CNT-GALERI-DOC-GERANAT-'],
  },
  'GAL-PENGABDIAN-CIANJUR-2026': {
    coverIds: ['CNT-BERANDA-DOK-3', 'CNT-GALLERY-SANTUNAN-2026'],
    slideAlbumIds: ['doc-santunan-2026'],
    slidePrefixes: ['CNT-GALERI-DOC-SANTUNAN-'],
  },
  'GAL-PEDULI-PADANG-2026': {
    coverIds: ['CNT-BERANDA-DOK-4'],
    slideAlbumIds: ['doc-baksos-bencana-2024'],
    slidePrefixes: ['CNT-GALERI-DOC-BAKSOS-'],
  },
  'GAL-DIKSAR-PEMBARETAN': {
    coverIds: ['CNT-GALLERY-PEMBARETAN-2025', 'CNT-PENDIDIKAN-DIKLAT'],
    slideAlbumIds: ['doc-pembaretan-2025'],
    slidePrefixes: ['CNT-GALERI-DOC-PEMBARETAN-'],
  },
};

export function getMappedRegistryIdsForCmsItem(
  section: CmsSectionKey,
  itemId: string
): string[] {
  const norm = normalizeContentId(itemId);
  if (section === 'heroScenes') return HERO_ID_MAP[norm] || [norm];
  if (section === 'sorotanGiat') return GIAT_ID_MAP[norm] || [norm];
  if (section === 'programs') return PROGRAM_ID_MAP[norm] || [norm];
  if (section === 'galleryAlbums') {
    return GALLERY_ID_MAP[norm]?.coverIds || [norm];
  }
  return [norm];
}

function indexActiveRegistry(registry: RegistryMediaItem[]): Map<string, RegistryMediaItem> {
  const map = new Map<string, RegistryMediaItem>();
  for (const item of registry || []) {
    if (!item || item.isActive === false) continue;
    const key = normalizeContentId(item.contentId || item.id);
    if (!key) continue;
    map.set(key, item);
  }
  return map;
}

function pickFirstMatch(
  map: Map<string, RegistryMediaItem>,
  candidateIds: string[]
): RegistryMediaItem | undefined {
  for (const rawId of candidateIds) {
    const found = map.get(normalizeContentId(rawId));
    if (found) return found;
  }
  return undefined;
}

export function mergeHeroScenesWithRegistry(
  heroScenes: CmsContentItem[] = [],
  contentRegistry: RegistryMediaItem[] = []
): CmsContentItem[] {
  const map = indexActiveRegistry(contentRegistry);
  const consumedIds = new Set<string>();

  const merged = (heroScenes || []).map((scene) => {
    const sceneNorm = normalizeContentId(scene.id);
    const candidates = [sceneNorm, ...(HERO_ID_MAP[sceneNorm] || [])];
    candidates.forEach((id) => consumedIds.add(normalizeContentId(id)));

    const uploadedMatch = candidates
      .map((id) => map.get(normalizeContentId(id)))
      .find((entry) => entry && isUploadedMediaUrl(entry.imageUrl));
    const exactMatch = uploadedMatch || pickFirstMatch(map, candidates);

    if (!exactMatch) return scene;

    const nextImage =
      isUploadedMediaUrl(exactMatch.imageUrl) && sanitizeUrl(exactMatch.imageUrl, '')
        ? sanitizeUrl(exactMatch.imageUrl, scene.image)
        : scene.image;

    const customTitle =
      exactMatch.title && !isGenericOrFilenameTitle(exactMatch.title)
        ? sanitizeInput(exactMatch.title, 180)
        : scene.title;

    return {
      ...scene,
      title: customTitle,
      image: nextImage || scene.image,
    };
  });

  // Tambahkan item hero_banner kustom yang diunggah namun belum dipetakan ke HERO-01..05
  const extras: CmsContentItem[] = [];
  for (const item of contentRegistry || []) {
    if (!item || item.isActive === false) continue;
    if (item.sectionId !== 'hero_banner') continue;
    const norm = normalizeContentId(item.contentId || item.id);
    if (!norm || consumedIds.has(norm)) continue;
    if (!isUploadedMediaUrl(item.imageUrl)) continue;

    consumedIds.add(norm);
    const cleanImg = sanitizeUrl(item.imageUrl, '');
    if (!cleanImg) continue;

    extras.push({
      id: item.contentId || norm,
      title: isGenericOrFilenameTitle(item.title)
        ? 'Dokumentasi Pilihan Korps Menwa UNJ'
        : sanitizeInput(item.title, 180),
      description: sanitizeInput(
        item.caption || item.description || 'Dokumentasi resmi Menwa Satuan UNJ.',
        500
      ),
      tag: 'Komando Satuan',
      date: sanitizeInput(item.year || 'Tahun Bakti 2026', 80),
      location: 'Universitas Negeri Jakarta',
      status: 'Terpublikasi',
      image: cleanImg,
      route: '/gallery',
      featured: true,
    });
  }

  return [...merged, ...extras];
}

export function mergeSorotanGiatWithRegistry(
  sorotanGiat: CmsContentItem[] = [],
  contentRegistry: RegistryMediaItem[] = []
): CmsContentItem[] {
  const map = indexActiveRegistry(contentRegistry);
  const consumedIds = new Set<string>();

  const merged = (sorotanGiat || []).map((item) => {
    const itemNorm = normalizeContentId(item.id);
    const candidates = [itemNorm, ...(GIAT_ID_MAP[itemNorm] || [])];
    candidates.forEach((id) => consumedIds.add(normalizeContentId(id)));

    const uploadedMatch = candidates
      .map((id) => map.get(normalizeContentId(id)))
      .find((entry) => entry && isUploadedMediaUrl(entry.imageUrl));
    const exactMatch = uploadedMatch || pickFirstMatch(map, candidates);

    if (!exactMatch) return item;

    const nextImage = isUploadedMediaUrl(exactMatch.imageUrl)
      ? sanitizeUrl(exactMatch.imageUrl, item.image)
      : item.image;

    return {
      ...item,
      image: nextImage || item.image,
    };
  });

  const extras: CmsContentItem[] = [];
  for (const item of contentRegistry || []) {
    if (!item || item.isActive === false) continue;
    if (item.sectionId !== 'sorotan_giat') continue;
    const norm = normalizeContentId(item.contentId || item.id);
    if (!norm || consumedIds.has(norm)) continue;
    if (!isUploadedMediaUrl(item.imageUrl)) continue;

    consumedIds.add(norm);
    const cleanImg = sanitizeUrl(item.imageUrl, '');
    if (!cleanImg) continue;

    const strippedTitle = stripKnownTitlePrefix(item.title);
    const cleanTitle =
      !strippedTitle || isGenericOrFilenameTitle(strippedTitle)
        ? sanitizeInput(item.caption || 'Agenda & Dokumentasi Satuan Menwa UNJ', 180)
        : strippedTitle;

    extras.push({
      id: item.contentId || norm,
      title: cleanTitle || 'Dokumentasi Giat Menwa UNJ',
      description: sanitizeInput(
        item.caption || item.description || 'Dokumentasi resmi kegiatan Menwa Satuan UNJ.',
        600
      ),
      tag: 'Sorotan Satuan',
      date: sanitizeInput(item.year || 'Tahun 2026', 80),
      location: 'Kampus A UNJ, Rawamangun',
      status: 'Terpublikasi',
      image: cleanImg,
      route: '/gallery',
      featured: true,
    });
  }

  return [...merged, ...extras];
}

export function mergeProgramsWithRegistry(
  programs: CmsContentItem[] = [],
  contentRegistry: RegistryMediaItem[] = []
): CmsContentItem[] {
  const map = indexActiveRegistry(contentRegistry);
  return (programs || []).map((prog) => {
    const norm = normalizeContentId(prog.id);
    const candidates = [norm, ...(PROGRAM_ID_MAP[norm] || [])];
    const uploadedMatch = candidates
      .map((id) => map.get(normalizeContentId(id)))
      .find((entry) => entry && isUploadedMediaUrl(entry.imageUrl));
    if (!uploadedMatch) return prog;
    return {
      ...prog,
      image: sanitizeUrl(uploadedMatch.imageUrl, prog.image),
    };
  });
}

function collectAlbumSlides(
  rule: GalleryMappingRule | undefined,
  fallbackAlbum: CmsContentItem,
  activeItems: RegistryMediaItem[]
): { photos: GallerySlidePhoto[]; uploadedCover?: string; matchedIds: string[] } {
  const matched: RegistryMediaItem[] = [];
  const seen = new Set<string>();

  if (rule) {
    for (const item of activeItems) {
      const cidNorm = normalizeContentId(item.contentId || item.id);
      const albumNorm = normalizeContentId(item.albumId);

      const matchesCover = rule.coverIds.some((c) => normalizeContentId(c) === cidNorm);
      const matchesAlbum = rule.slideAlbumIds.some((a) => normalizeContentId(a) === albumNorm);
      const matchesPrefix = rule.slidePrefixes.some((p) => cidNorm.startsWith(normalizeContentId(p)));

      if (matchesCover || matchesAlbum || matchesPrefix) {
        if (!seen.has(cidNorm)) {
          seen.add(cidNorm);
          matched.push(item);
        }
      }
    }
  }

  // Urutkan slide: foto unggahan nyata (https/base64) diutamakan, lalu slideIndex/order
  matched.sort((a, b) => {
    const aUp = isUploadedMediaUrl(a.imageUrl) ? 0 : 1;
    const bUp = isUploadedMediaUrl(b.imageUrl) ? 0 : 1;
    if (aUp !== bUp) return aUp - bUp;
    const aIdx = typeof a.slideIndex === 'number' ? a.slideIndex : Number(a.order || 999);
    const bIdx = typeof b.slideIndex === 'number' ? b.slideIndex : Number(b.order || 999);
    return aIdx - bIdx;
  });

  const photos: GallerySlidePhoto[] = [];
  const urlSeen = new Set<string>();

  for (const item of matched) {
    const cleanUrl = sanitizeUrl(item.imageUrl, '');
    if (!cleanUrl || !isDisplayableImageUrl(cleanUrl)) continue;
    if (urlSeen.has(cleanUrl)) continue;
    urlSeen.add(cleanUrl);
    photos.push({
      url: cleanUrl,
      caption: sanitizeInput(
        item.caption || item.description || item.title || fallbackAlbum.description,
        300
      ),
      contentId: item.contentId || item.id,
    });
  }

  const uploadedCover = photos.find((p) => isUploadedMediaUrl(p.url))?.url;
  const fallbackImg = sanitizeUrl(fallbackAlbum.image, '/foto-kampus-unj.jpg');
  if (photos.length === 0 && fallbackImg) {
    photos.push({
      url: fallbackImg,
      caption: sanitizeInput(fallbackAlbum.description, 300),
      contentId: fallbackAlbum.id,
    });
  }

  return {
    photos,
    uploadedCover,
    matchedIds: matched.map((m) => m.contentId || String(m.id || '')).filter(Boolean),
  };
}

export function mergeGalleryAlbumsWithRegistry(
  galleryAlbums: CmsContentItem[] = [],
  contentRegistry: RegistryMediaItem[] = []
): MergedGalleryAlbum[] {
  const activeItems = (contentRegistry || []).filter((item) => item && item.isActive !== false);
  const consumedAlbumIds = new Set<string>();
  const consumedContentIds = new Set<string>();

  const mergedBase: MergedGalleryAlbum[] = (galleryAlbums || []).map((album) => {
    const albumNorm = normalizeContentId(album.id);
    const rule = GALLERY_ID_MAP[albumNorm];
    if (rule) {
      rule.coverIds.forEach((c) => consumedContentIds.add(normalizeContentId(c)));
      rule.slideAlbumIds.forEach((a) => consumedAlbumIds.add(normalizeContentId(a)));
    }

    const { photos, uploadedCover, matchedIds } = collectAlbumSlides(rule, album, activeItems);
    matchedIds.forEach((id) => consumedContentIds.add(normalizeContentId(id)));

    const resolvedCover = uploadedCover || sanitizeUrl(album.image, '/foto-kampus-unj.jpg');
    return {
      ...album,
      image: resolvedCover,
      photos,
      hasUploadedMedia: Boolean(uploadedCover),
      sourceRegistryIds: matchedIds,
    };
  });

  // Kelompokkan album/slide galeri dari contentRegistry yang memiliki foto unggahan nyata
  // (mis. doc-sertijab-2026, doc-kds-2025, doc-bukber-2026, atau album baru dari Storage/Command Center)
  const extraGroups = new Map<string, RegistryMediaItem[]>();
  for (const item of activeItems) {
    const cidNorm = normalizeContentId(item.contentId || item.id);
    if (!cidNorm || consumedContentIds.has(cidNorm)) continue;

    const isGalleryScoped =
      item.tabId === 'gallery' ||
      item.sectionId === 'album_galeri' ||
      item.sectionId === 'dokumentasi_kegiatan';
    if (!isGalleryScoped) continue;

    const albumKey = normalizeContentId(item.albumId || item.contentId || item.id);
    if (!albumKey || consumedAlbumIds.has(albumKey)) continue;

    const list = extraGroups.get(albumKey) || [];
    list.push(item);
    extraGroups.set(albumKey, list);
  }

  const extraAlbums: MergedGalleryAlbum[] = [];
  for (const [groupKey, groupItems] of extraGroups.entries()) {
    const uploadedItems = groupItems.filter((it) => isUploadedMediaUrl(it.imageUrl));
    if (uploadedItems.length === 0) continue;

    const sorted = [...groupItems].sort((a, b) => {
      const aUp = isUploadedMediaUrl(a.imageUrl) ? 0 : 1;
      const bUp = isUploadedMediaUrl(b.imageUrl) ? 0 : 1;
      if (aUp !== bUp) return aUp - bUp;
      const aIdx = typeof a.slideIndex === 'number' ? a.slideIndex : Number(a.order || 999);
      const bIdx = typeof b.slideIndex === 'number' ? b.slideIndex : Number(b.order || 999);
      return aIdx - bIdx;
    });

    const photos: GallerySlidePhoto[] = [];
    const seenUrls = new Set<string>();
    for (const it of sorted) {
      const cleanUrl = sanitizeUrl(it.imageUrl, '');
      if (!cleanUrl || !isDisplayableImageUrl(cleanUrl)) continue;
      if (seenUrls.has(cleanUrl)) continue;
      seenUrls.add(cleanUrl);
      photos.push({
        url: cleanUrl,
        caption: sanitizeInput(it.caption || it.description || it.title || '', 300),
        contentId: it.contentId || it.id,
      });
    }
    if (photos.length === 0) continue;

    const rep = uploadedItems[0] || sorted[0];
    const rawAlbumTitle =
      rep.albumTitle ||
      rep.groupTitle ||
      String(rep.title || '')
        .replace(/^Album Galeri:\s*/i, '')
        .replace(/\s*—\s*Slide\s*#\d+(\s*\(Cover\))?$/i, '');

    const cleanTitle = isGenericOrFilenameTitle(rawAlbumTitle)
      ? sanitizeInput(rep.caption || `Dokumentasi ${groupKey}`, 140)
      : sanitizeInput(rawAlbumTitle, 140);

    extraAlbums.push({
      id: rep.albumId || rep.contentId || groupKey,
      title: cleanTitle || 'Dokumentasi Kegiatan Menwa UNJ',
      description: sanitizeInput(
        rep.caption || rep.description || 'Dokumentasi resmi kegiatan Resimen Mahasiswa Satuan UNJ.',
        500
      ),
      tag: rep.sectionId === 'dokumentasi_kegiatan' ? 'Arsip Giat' : 'Dokumentasi Korps',
      date: sanitizeInput(rep.year || '2026', 60),
      location: 'Kampus A UNJ, Rawamangun',
      status: 'Terpublikasi',
      image: photos[0].url,
      route: '/gallery',
      featured: true,
      photos,
      hasUploadedMedia: true,
      sourceRegistryIds: sorted.map((s) => s.contentId || String(s.id || '')).filter(Boolean),
    });
  }

  return [...mergedBase, ...extraAlbums];
}

export function resolvePartnerLogoOverride(
  defaultLogoUrl: string,
  partnerName: string,
  contentRegistry: RegistryMediaItem[] = []
): string {
  const nameLower = String(partnerName || '').toLowerCase();
  if (nameLower.includes('universitas negeri jakarta') || nameLower === 'unj') {
    const unjLogo = (contentRegistry || []).find(
      (item) =>
        item &&
        item.isActive !== false &&
        normalizeContentId(item.contentId || item.id) === 'CNT-BERANDA-LOGO-UNJ'
    );
    if (unjLogo && isUploadedMediaUrl(unjLogo.imageUrl)) {
      return sanitizeUrl(unjLogo.imageUrl, defaultLogoUrl);
    }
  }
  return sanitizeUrl(defaultLogoUrl, '/foto-kampus-unj.jpg');
}

const STORAGE_FILENAME_HINTS: Array<{
  pattern: RegExp;
  contentId: string;
  tabId: string;
  sectionId: string;
  albumId?: string;
  albumTitle?: string;
}> = [
  {
    pattern: /hero[-_]?2|kc[-_]?viii|ksatria/i,
    contentId: 'CNT-BERANDA-HERO-2',
    tabId: 'beranda',
    sectionId: 'hero_banner',
  },
  {
    pattern: /hero[-_]?3|geranat/i,
    contentId: 'CNT-BERANDA-HERO-3',
    tabId: 'beranda',
    sectionId: 'hero_banner',
  },
  {
    pattern: /hero[-_]?4|youth[-_]?spark/i,
    contentId: 'CNT-BERANDA-HERO-4',
    tabId: 'beranda',
    sectionId: 'hero_banner',
  },
  {
    pattern: /hero[-_]?5|pengabdian|cianjur|padang/i,
    contentId: 'CNT-BERANDA-HERO-5',
    tabId: 'beranda',
    sectionId: 'hero_banner',
  },
  {
    pattern: /logo[-_]?unj/i,
    contentId: 'CNT-BERANDA-LOGO-UNJ',
    tabId: 'beranda',
    sectionId: 'identitas_satuan',
  },
  {
    pattern: /sertijab/i,
    contentId: 'CNT-GALLERY-SERTIJAB-2026',
    tabId: 'gallery',
    sectionId: 'album_galeri',
    albumId: 'doc-sertijab-2026',
    albumTitle: 'Serah Terima Jabatan (Sertijab) 2026',
  },
  {
    pattern: /kds/i,
    contentId: 'CNT-GALLERY-KDS-2025',
    tabId: 'gallery',
    sectionId: 'album_galeri',
    albumId: 'doc-kds-2025',
    albumTitle: 'Kursus Dinas Staf (KDS)',
  },
  {
    pattern: /bukber/i,
    contentId: 'CNT-GALLERY-BUKBER-2026',
    tabId: 'gallery',
    sectionId: 'album_galeri',
    albumId: 'doc-bukber-2026',
    albumTitle: 'Buka Bersama Korps Menwa UNJ',
  },
  {
    pattern: /pembaretan|diksar/i,
    contentId: 'CNT-GALLERY-PEMBARETAN-2025',
    tabId: 'gallery',
    sectionId: 'album_galeri',
    albumId: 'doc-pembaretan-2025',
    albumTitle: 'Pembaretan Anggota Muda',
  },
  {
    pattern: /giat[-_]?1|oprec|camen/i,
    contentId: 'CNT-BERANDA-GIAT-1',
    tabId: 'beranda',
    sectionId: 'sorotan_giat',
  },
  {
    pattern: /giat[-_]?7|hut[-_]?ri/i,
    contentId: 'CNT-BERANDA-GIAT-7',
    tabId: 'beranda',
    sectionId: 'sorotan_giat',
  },
  {
    pattern: /giat[-_]?8|studi[-_]?banding|ipb/i,
    contentId: 'CNT-BERANDA-GIAT-8',
    tabId: 'beranda',
    sectionId: 'sorotan_giat',
  },
];

export function buildStorageFallbackRegistryEntries(
  storageFiles: StorageAssetEntry[] = [],
  existingRegistry: RegistryMediaItem[] = []
): RegistryMediaItem[] {
  if (!Array.isArray(storageFiles) || storageFiles.length === 0) return [];

  const existingUploadedUrls = new Set(
    (existingRegistry || [])
      .filter((item) => item && isUploadedMediaUrl(item.imageUrl))
      .map((item) => sanitizeUrl(item.imageUrl, ''))
  );

  const existingUploadedIds = new Set(
    (existingRegistry || [])
      .filter((item) => item && isUploadedMediaUrl(item.imageUrl))
      .map((item) => normalizeContentId(item.contentId || item.id))
  );

  const generated: RegistryMediaItem[] = [];

  for (const file of storageFiles) {
    const cleanUrl = sanitizeUrl(file.url, '');
    if (!cleanUrl || !isUploadedMediaUrl(cleanUrl)) continue;
    if (existingUploadedUrls.has(cleanUrl)) continue;
    if (!/\.(webp|jpe?g|png|gif)$/i.test(file.name || '') && !String(file.contentType || '').startsWith('image/')) {
      continue;
    }

    const hint = STORAGE_FILENAME_HINTS.find((h) => h.pattern.test(file.fullPath || file.name));
    if (hint && !existingUploadedIds.has(normalizeContentId(hint.contentId))) {
      existingUploadedIds.add(normalizeContentId(hint.contentId));
      generated.push({
        contentId: hint.contentId,
        tabId: hint.tabId,
        sectionId: hint.sectionId,
        albumId: hint.albumId,
        albumTitle: hint.albumTitle,
        imageUrl: cleanUrl,
        title: hint.albumTitle || 'Dokumentasi Resmi Satuan Menwa UNJ',
        caption: 'Dipulihkan langsung dari arsip Firebase Storage satuan.',
        isActive: true,
        updatedAt: file.updatedAt || new Date().toISOString(),
      });
      continue;
    }

    const isGalleryFolder = String(file.fullPath || '').includes('assets/images/gallery');
    const cleanBase = sanitizeInput(
      String(file.name || 'dokumentasi')
        .replace(/-\d{10,14}\.[^.]+$/, '')
        .replace(/\.[^.]+$/, '')
        .replace(/[-_]+/g, ' '),
      80
    );

    generated.push({
      contentId: `CNT-STORAGE-${normalizeContentId(file.name).replace(/[^A-Z0-9-]/g, '').slice(0, 32)}`,
      tabId: isGalleryFolder ? 'gallery' : 'beranda',
      sectionId: isGalleryFolder ? 'album_galeri' : 'sorotan_giat',
      albumId: isGalleryFolder ? 'doc-arsip-storage-unj' : undefined,
      albumTitle: isGalleryFolder ? 'Arsip Lensa Firebase Storage Menwa UNJ' : undefined,
      title: isGenericOrFilenameTitle(cleanBase)
        ? 'Dokumentasi Satuan Menwa UNJ'
        : cleanBase,
      caption: 'Dokumentasi resmi tersimpan di Firebase Storage Menwa UNJ.',
      imageUrl: cleanUrl,
      isActive: true,
      updatedAt: file.updatedAt || new Date().toISOString(),
    });
  }

  return generated;
}
