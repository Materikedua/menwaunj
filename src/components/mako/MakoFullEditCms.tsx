import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Search,
  X,
  Database,
  Calendar,
  MapPin,
  Tag,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  FolderOpen,
  RefreshCw,
} from 'lucide-react';
import {
  useSiteContent,
  upsertCmsItem,
  deleteCmsItem,
  resetSiteContentToDefault,
  exportSiteContentJson,
  importSiteContentJson,
  useAdminuTickets,
  updateAdminuTicketStatus,
  type CmsSectionKey,
  type CmsContentItem,
  type AdminuPamTicket,
} from '../../data/siteConfig';
import { useCanvasStore } from '../../lib/canvasStore.jsx';
import {
  listFirebaseStorageDocuments,
  uploadAndConvertToSVG,
} from '../../firebase.js';
import {
  getMappedRegistryIdsForCmsItem,
  mergeHeroScenesWithRegistry,
  mergeSorotanGiatWithRegistry,
  mergeProgramsWithRegistry,
  mergeGalleryAlbumsWithRegistry,
  isUploadedMediaUrl,
  normalizeContentId,
  type StorageAssetEntry,
  type RegistryMediaItem,
} from '../../lib/contentRegistryBridge';
import { sanitizeInput, sanitizeUrl } from '../../utils/security';

interface MakoFullEditCmsProps {
  officerName: string;
}

type EditorTabId = CmsSectionKey | 'adminuTickets';

const SECTION_META: Array<{
  id: EditorTabId;
  label: string;
  subtitle: string;
}> = [
  {
    id: 'heroScenes',
    label: 'Slide Hero Utama',
    subtitle: 'Kelola tayangan pembuka utama di bagian atas beranda publik.',
  },
  {
    id: 'sorotanGiat',
    label: 'Sorotan Giat',
    subtitle: 'Kelola kartu dokumentasi & pengumuman kegiatan strategis di beranda.',
  },
  {
    id: 'programs',
    label: 'Program Unggulan',
    subtitle: 'Kelola program satuan yang terhubung langsung ke Matriks Peran Pengunjung.',
  },
  {
    id: 'galleryAlbums',
    label: 'Dinding Galeri Lensa',
    subtitle: 'Sinkronisasi album dokumentasi pada Beranda sekaligus halaman /gallery.',
  },
  {
    id: 'adminuTickets',
    label: 'Tiket Smart Adminu (PAM)',
    subtitle: 'Kelola status permohonan pengamanan (PAM-2026-XXX) & catatan disposisi piket.',
  },
];

const QUICK_STATUS_OPTIONS = [
  'Pendaftaran Dibuka',
  'Jadwal Diundur Resmi',
  'Telah Terlaksana',
  'Siaga Operasional',
  'Terpublikasi',
  'Kurikulum Aktif',
];

const QUICK_ROUTE_OPTIONS = [
  { label: 'Beranda (/)', value: '/' },
  { label: 'Ksatria Cendekia VIII (/kc)', value: '/kc' },
  { label: 'GERANAT VII (/geranat)', value: '/geranat' },
  { label: 'Youth Spark (/youth-spark)', value: '/youth-spark' },
  { label: 'Pendidikan & Diklat (/pendidikan)', value: '/pendidikan' },
  { label: 'Pengabdian Masyarakat (/pengabdian)', value: '/pengabdian' },
  { label: 'Smart Adminu & PAM (/adminu)', value: '/adminu' },
  { label: 'Verifikasi Sertifikat (/verify)', value: '/verify' },
  { label: 'Garis Komando (/garis-komando)', value: '/garis-komando' },
  { label: 'Galeri Dokumentasi (/gallery)', value: '/gallery' },
];

const TICKET_STATUS_LABELS: Record<AdminuPamTicket['status'], string> = {
  DITERIMA: 'Diterima Piket Mako',
  DISETUJUI: 'Disetujui Mako (Formulir Surat Terbuka)',
  VERIFIKASI_ADMINU: 'Verifikasi Berkas Adminu',
  AUDIENSI_POLA_PAM: 'Audiensi Pola PAM',
  PERSONEL_DITUGASKAN: 'Personel Ditugaskan (Sprin Terbit)',
};

function compressImageToSafeDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format berkas gambar tidak dikenali.'));
      img.onload = () => {
        const maxWidth = 960;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const targetW = Math.max(1, Math.round(img.width * scale));
        const targetH = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Konteks pengolah gambar tidak tersedia.'));
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}

export const MakoFullEditCms: React.FC<MakoFullEditCmsProps> = ({ officerName }) => {
  const { content, isCloudConfigured, providerName } = useSiteContent();
  const { contentRegistry, updateRegistryItem } = useCanvasStore();
  const adminuTickets = useAdminuTickets();

  const [activeSection, setActiveSection] = useState<EditorTabId>('heroScenes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bannerNotice, setBannerNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Modal Tambah / Edit Lengkap
  const [editingItem, setEditingItem] = useState<CmsContentItem | null>(null);
  const [editingSourceRegistryIds, setEditingSourceRegistryIds] = useState<string[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  // Pemilih Media Firebase Storage & Registry
  const [showMediaPicker, setShowMediaPicker] = useState<boolean>(false);
  const [storageAssets, setStorageAssets] = useState<StorageAssetEntry[]>([]);
  const [loadingStorageAssets, setLoadingStorageAssets] = useState<boolean>(false);
  const [storageError, setStorageError] = useState<string>('');

  // Konfirmasi inline tanpa window.confirm
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmResetDefault, setConfirmResetDefault] = useState<boolean>(false);

  // Modal Impor JSON
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [jsonInputText, setJsonInputText] = useState<string>('');

  useEffect(() => {
    if (editingItem || showImportModal) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [editingItem, showImportModal]);

  // Draft Disposisi Tiket Adminu
  const [ticketNoteDrafts, setTicketNoteDrafts] = useState<Record<string, string>>({});

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setBannerNotice({ type, text });
    window.setTimeout(() => {
      setBannerNotice((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const loadMediaPickerAssets = async () => {
    setLoadingStorageAssets(true);
    setStorageError('');
    try {
      const files = await listFirebaseStorageDocuments([
        'assets/images',
        'assets/svg',
        'adminu_submissions',
        'dokumen',
        'official_portals',
      ]);
      const imagesOnly = (files || []).filter(
        (f: StorageAssetEntry & { isImage?: boolean }) =>
          Boolean(f?.url) &&
          (f.isImage || /\.(webp|jpe?g|png|gif|svg)$/i.test(f.name || ''))
      );
      setStorageAssets(imagesOnly);
    } catch {
      setStorageError('Gagal memindai berkas gambar dari Firebase Storage.');
    } finally {
      setLoadingStorageAssets(false);
    }
  };

  const pickerGalleryItems = useMemo(() => {
    const byUrl = new Map<
      string,
      { url: string; label: string; source: 'Storage' | 'Registry'; contentId?: string }
    >();

    for (const file of storageAssets) {
      const clean = sanitizeUrl(file.url, '');
      if (!clean || byUrl.has(clean)) continue;
      byUrl.set(clean, {
        url: clean,
        label: file.name || file.fullPath,
        source: 'Storage',
      });
    }

    for (const entry of (contentRegistry || []) as RegistryMediaItem[]) {
      if (!entry || entry.isActive === false) continue;
      if (!isUploadedMediaUrl(entry.imageUrl)) continue;
      const clean = sanitizeUrl(entry.imageUrl, '');
      if (!clean || byUrl.has(clean)) continue;
      byUrl.set(clean, {
        url: clean,
        label: sanitizeInput(entry.title || entry.contentId || 'Aset Registry', 80),
        source: 'Registry',
        contentId: entry.contentId,
      });
    }

    return Array.from(byUrl.values());
  }, [storageAssets, contentRegistry]);

  const resolvedSectionItems = useMemo(() => {
    if (activeSection === 'heroScenes') {
      return mergeHeroScenesWithRegistry(content.heroScenes || [], contentRegistry);
    }
    if (activeSection === 'sorotanGiat') {
      return mergeSorotanGiatWithRegistry(content.sorotanGiat || [], contentRegistry);
    }
    if (activeSection === 'programs') {
      return mergeProgramsWithRegistry(content.programs || [], contentRegistry);
    }
    if (activeSection === 'galleryAlbums') {
      return mergeGalleryAlbumsWithRegistry(content.galleryAlbums || [], contentRegistry);
    }
    return [];
  }, [content, contentRegistry, activeSection]);

  const currentItems = useMemo(() => {
    if (activeSection === 'adminuTickets') return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return resolvedSectionItems;
    return resolvedSectionItems.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        it.description.toLowerCase().includes(q) ||
        it.tag.toLowerCase().includes(q) ||
        it.location.toLowerCase().includes(q) ||
        it.status.toLowerCase().includes(q) ||
        it.id.toLowerCase().includes(q)
    );
  }, [resolvedSectionItems, activeSection, searchQuery]);

  const filteredTickets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return adminuTickets;
    return adminuTickets.filter(
      (t) =>
        t.ticketId.toLowerCase().includes(q) ||
        t.eventName.toLowerCase().includes(q) ||
        t.institution.toLowerCase().includes(q) ||
        t.applicantName.toLowerCase().includes(q)
    );
  }, [adminuTickets, searchQuery]);

  const openCreateModal = () => {
    if (activeSection === 'adminuTickets') return;
    const prefixMap: Record<CmsSectionKey, string> = {
      heroScenes: 'HERO',
      sorotanGiat: 'GIAT',
      programs: 'PROG',
      galleryAlbums: 'GAL',
    };
    setIsCreatingNew(true);
    setShowMediaPicker(false);
    setEditingSourceRegistryIds([]);
    setEditingItem({
      id: `${prefixMap[activeSection]}-${Date.now().toString(36).toUpperCase()}`,
      title: '',
      description: '',
      tag: 'Agenda Satuan',
      date: 'Desember 2026',
      location: 'Kampus A UNJ, Rawamangun',
      status: 'Pendaftaran Dibuka',
      image: '/foto-kampus-unj.jpg',
      route: '/',
      featured: true,
    });
  };

  const openEditModal = (item: CmsContentItem & { sourceRegistryIds?: string[] }) => {
    setIsCreatingNew(false);
    setShowMediaPicker(false);
    setEditingSourceRegistryIds(Array.isArray(item.sourceRegistryIds) ? item.sourceRegistryIds : []);
    setEditingItem({
      id: item.id,
      title: item.title,
      description: item.description,
      tag: item.tag,
      date: item.date,
      location: item.location,
      status: item.status,
      image: item.image,
      route: item.route,
      featured: item.featured,
    });
  };

  const handleSaveModalForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || activeSection === 'adminuTickets') return;

    const cleanTitle = sanitizeInput(editingItem.title, 180);
    const cleanDesc = sanitizeInput(editingItem.description, 800);
    if (!cleanTitle || !cleanDesc) {
      showFeedback('error', 'Judul dan deskripsi konten wajib diisi dengan lengkap.');
      return;
    }

    const safeImage = sanitizeUrl(editingItem.image, '/foto-kampus-unj.jpg');

    upsertCmsItem(
      activeSection,
      {
        ...editingItem,
        title: cleanTitle,
        description: cleanDesc,
        tag: sanitizeInput(editingItem.tag, 80) || 'Informasi Satuan',
        date: sanitizeInput(editingItem.date, 80) || '2026',
        location: sanitizeInput(editingItem.location, 140) || 'Kampus A UNJ',
        status: sanitizeInput(editingItem.status, 90) || 'Aktif',
        image: safeImage,
        route: sanitizeUrl(editingItem.route || '/', '/'),
      },
      officerName
    );

    // Sinkronkan juga perubahan gambar & takarir ke koleksi content_registry bila terhubung
    const candidateRegistryIds = [
      ...getMappedRegistryIdsForCmsItem(activeSection, editingItem.id),
      ...editingSourceRegistryIds,
      editingItem.id,
    ];
    const registryKeySet = new Set(
      ((contentRegistry || []) as RegistryMediaItem[]).map((r) =>
        normalizeContentId(r.contentId || r.id)
      )
    );
    const matchingRegistryId = candidateRegistryIds.find((cid) =>
      registryKeySet.has(normalizeContentId(cid))
    );
    if (matchingRegistryId && typeof updateRegistryItem === 'function') {
      void updateRegistryItem(matchingRegistryId, {
        imageUrl: safeImage,
        caption: cleanDesc,
        title: cleanTitle,
      }).catch(() => {});
    }

    setEditingItem(null);
    setEditingSourceRegistryIds([]);
    showFeedback(
      'success',
      isCreatingNew
        ? `Konten "${cleanTitle}" berhasil ditambahkan dan langsung tampil di portal publik.`
        : `Perubahan pada "${cleanTitle}" berhasil disimpan & disinkronkan ke registry media.`
    );
  };

  const handleConfirmDelete = (
    item: CmsContentItem & { sourceRegistryIds?: string[] }
  ) => {
    if (activeSection === 'adminuTickets') return;
    const existsInSiteConfig = content[activeSection].some((it) => it.id === item.id);
    if (existsInSiteConfig) {
      if (content[activeSection].length <= 1) {
        showFeedback(
          'error',
          'Minimal satu item harus tersisa pada seksi ini agar tata letak beranda tetap utuh.'
        );
        setConfirmDeleteId(null);
        return;
      }
      deleteCmsItem(activeSection, item.id, officerName);
    } else if (typeof updateRegistryItem === 'function') {
      const idsToDisable =
        Array.isArray(item.sourceRegistryIds) && item.sourceRegistryIds.length > 0
          ? item.sourceRegistryIds
          : [item.id];
      idsToDisable.forEach((rid) => {
        void updateRegistryItem(rid, { isActive: false }).catch(() => {});
      });
    }
    setConfirmDeleteId(null);
    showFeedback('success', `Konten "${item.title}" telah dihapus dari daftar publik.`);
  };

  const handleExportJson = () => {
    const jsonStr = exportSiteContentJson();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    anchor.href = url;
    anchor.download = `menwa-unj-cms-backup-${stamp}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    showFeedback('success', 'Berkas cadangan JSON CMS berhasil diunduh.');
  };

  const handleImportJsonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonInputText.trim()) return;
    const result = importSiteContentJson(jsonInputText, officerName);
    if (!result.ok) {
      showFeedback('error', result.error || 'Gagal mengimpor berkas JSON.');
      return;
    }
    setJsonInputText('');
    setShowImportModal(false);
    showFeedback('success', 'Seluruh konfigurasi konten CMS berhasil diimpor dan disanitasi.');
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setJsonInputText(String(reader.result || ''));
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleModalImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;
    setUploadingImage(true);
    try {
      const rawDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
        reader.onload = () => resolve(String(reader.result || ''));
        reader.readAsDataURL(file);
      });

      const targetTab = activeSection === 'galleryAlbums' ? 'gallery' : 'beranda';
      try {
        const uploaded = await uploadAndConvertToSVG(rawDataUrl, file.name, targetTab);
        const remoteUrl = sanitizeUrl(uploaded?.svgDataUrl || '', '');
        if (remoteUrl && isUploadedMediaUrl(remoteUrl)) {
          setEditingItem((prev) => (prev ? { ...prev, image: remoteUrl } : null));
          showFeedback(
            'success',
            remoteUrl.startsWith('https://')
              ? 'Gambar berhasil diunggah ke Firebase Storage dan siap dipublikasikan.'
              : 'Gambar berhasil dioptimalkan dan siap disimpan.'
          );
          return;
        }
      } catch {
        // Fallback ke kompresi browser lokal bila unggah cloud belum tersedia
      }

      const safeDataUrl = await compressImageToSafeDataUrl(file);
      setEditingItem((prev) => (prev ? { ...prev, image: safeDataUrl } : null));
      showFeedback('success', 'Gambar berhasil dioptimalkan dan siap disimpan.');
    } catch (err) {
      showFeedback(
        'error',
        err instanceof Error ? err.message : 'Gagal memproses berkas gambar.'
      );
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const activeMeta =
    SECTION_META.find((s) => s.id === activeSection) || SECTION_META[0];

  return (
    <section className="space-y-5" aria-label="Editor Penuh Konten Beranda dan Galeri">
      {/* Bilah Kendali Utama CMS */}
      <div className="bg-[#182024] border border-[#006569]/70 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                CMS Komando Terpadu (Full-Edit Beranda & Galeri)
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-950/90 border border-teal-500/40 text-[11px] font-mono text-teal-300">
                <Database size={12} />
                {isCloudConfigured && providerName === 'firebase-hybrid'
                  ? 'Penyimpanan: Firebase Firestore + Lokal'
                  : 'Penyimpanan: Lokal Reaktif Mako'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Seluruh perubahan judul, takarir, kategori, tanggal, lokasi, dan status disanitasi otomatis dari XSS serta langsung tersinkronisasi ke Beranda dan Galeri Publik.
            </p>
            <p className="text-[11px] font-mono text-slate-500">
              Pembaruan Terakhir:{' '}
              {new Date(content.updatedAt).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}{' '}
              oleh <span className="text-slate-300">{content.updatedBy}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeSection !== 'adminuTickets' && (
              <button
                type="button"
                onClick={openCreateModal}
                className="px-3.5 py-2 rounded-xl bg-[#006569] hover:bg-[#005256] text-[#FFDD00] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Plus size={14} />
                <span>Tambah Konten Baru</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} />
              <span>Ekspor JSON</span>
            </button>

            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-teal-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Upload size={14} />
              <span>Impor JSON</span>
            </button>

            {confirmResetDefault ? (
              <div className="inline-flex items-center gap-1.5 bg-amber-950/90 border border-amber-500/60 rounded-xl px-2.5 py-1.5">
                <span className="text-[11px] font-bold text-amber-200">Pulihkan standar?</span>
                <button
                  type="button"
                  onClick={() => {
                    resetSiteContentToDefault();
                    setConfirmResetDefault(false);
                    showFeedback(
                      'success',
                      'Seluruh konten dikembalikan ke jadwal & konfigurasi standar satuan.'
                    );
                  }}
                  className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[11px] font-black cursor-pointer"
                >
                  Ya, Pulihkan
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmResetDefault(false)}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-bold cursor-pointer"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmResetDefault(true)}
                className="px-3 py-2 rounded-xl bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/30 text-xs font-bold text-amber-300 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Pulihkan Standar</span>
              </button>
            )}
          </div>
        </div>

        {bannerNotice && (
          <div
            role="status"
            className={`p-3 rounded-xl text-xs font-medium flex items-center justify-between gap-3 border ${
              bannerNotice.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/70 border-rose-500/50 text-rose-200'
            }`}
          >
            <span className="flex items-center gap-2">
              {bannerNotice.type === 'success' ? (
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle size={15} className="text-rose-400 shrink-0" />
              )}
              {bannerNotice.text}
            </span>
            <button
              type="button"
              aria-label="Tutup pemberitahuan"
              onClick={() => setBannerNotice(null)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Pilihan Seksi CMS + Pencarian */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Kategori Seksi CMS">
            {SECTION_META.map((sec) => {
              const count =
                sec.id === 'adminuTickets'
                  ? adminuTickets.length
                  : content[sec.id]?.length || 0;
              const active = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setActiveSection(sec.id);
                    setConfirmDeleteId(null);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                    active
                      ? 'bg-[#006569] text-[#FFDD00] border border-[#FFDD00]/40 shadow'
                      : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-white/5'
                  }`}
                >
                  <span>{sec.label}</span>
                  <span className="px-1.5 py-0.5 rounded bg-black/40 font-mono text-[10px]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="search"
              aria-label="Cari item konten atau tiket"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter judul, lokasi, status..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFDD00]"
            />
          </div>
        </div>
      </div>

      {/* Sub-header Seksi Aktif */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            {activeMeta.label}
          </h3>
          <p className="text-xs text-slate-400">{activeMeta.subtitle}</p>
        </div>
      </div>

      {/* Daftar Item Konten atau Tiket Smart Adminu */}
      {activeSection === 'adminuTickets' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTickets.map((ticket) => {
            const draftNote =
              ticketNoteDrafts[ticket.ticketId] !== undefined
                ? ticketNoteDrafts[ticket.ticketId]
                : ticket.statusNote;
            return (
              <article
                key={ticket.ticketId}
                className="bg-[#182024] border border-white/10 rounded-2xl p-5 space-y-3.5 shadow-lg"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-[#FFDD00] bg-[#006569]/40 border border-[#FFDD00]/30 px-2.5 py-0.5 rounded">
                        {ticket.ticketId}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {ticket.letterNumber}
                      </span>
                    </div>
                    <h4 className="font-black text-white text-sm mt-1.5">
                      {ticket.eventName}
                    </h4>
                    <p className="text-xs text-teal-300 font-medium">
                      {ticket.institution} • Pemohon: {ticket.applicantName}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-white/15 text-[11px] font-bold text-emerald-300">
                    {TICKET_STATUS_LABELS[ticket.status]}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-white/5">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">
                      Tanggal & Lokasi
                    </span>
                    <strong>{ticket.eventDate}</strong> • {ticket.eventLocation}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">
                      Kebutuhan & Kontak
                    </span>
                    <strong>{ticket.personnelRequested} Personel</strong> •{' '}
                    {ticket.contactPhone}
                  </div>
                  {(ticket.attachmentPdfName || ticket.linkedLetterNumber) && (
                    <div className="col-span-2 pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                      {ticket.linkedLetterNumber && (
                        <span className="text-[11px] font-mono font-bold text-[#FFDD00]">
                          Surat Resmi Tahap 2: {ticket.linkedLetterNumber}
                        </span>
                      )}
                      {ticket.attachmentPdfUrl && (
                        <a
                          href={ticket.attachmentPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-teal-300 hover:underline inline-flex items-center gap-1"
                        >
                          <FileText size={12} />
                          <span>Unduh Lampiran ({ticket.attachmentPdfName || 'PDF'})</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor={`status-${ticket.ticketId}`}
                        className="text-[11px] font-bold text-slate-300 block mb-1"
                      >
                        Perbarui Tahap Disposisi:
                      </label>
                      <select
                        id={`status-${ticket.ticketId}`}
                        value={ticket.status}
                        onChange={(e) => {
                          const nextStatus = e.target.value as AdminuPamTicket['status'];
                          updateAdminuTicketStatus(ticket.ticketId, nextStatus, draftNote);
                          showFeedback(
                            'success',
                            `Status tiket ${ticket.ticketId} diperbarui ke ${TICKET_STATUS_LABELS[nextStatus]}.`
                          );
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFDD00]"
                      >
                        <option value="DITERIMA">1. Diterima Piket Mako</option>
                        <option value="DISETUJUI">2. Disetujui Mako (Buka Form Lacak Surat)</option>
                        <option value="VERIFIKASI_ADMINU">3. Verifikasi Berkas Adminu</option>
                        <option value="AUDIENSI_POLA_PAM">4. Audiensi Pola PAM</option>
                        <option value="PERSONEL_DITUGASKAN">
                          5. Personel Ditugaskan (Sprin Terbit)
                        </option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor={`note-${ticket.ticketId}`}
                        className="text-[11px] font-bold text-slate-300 block mb-1"
                      >
                        Catatan Disposisi Publik:
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          id={`note-${ticket.ticketId}`}
                          type="text"
                          value={draftNote}
                          onChange={(e) =>
                            setTicketNoteDrafts((prev) => ({
                              ...prev,
                              [ticket.ticketId]: e.target.value,
                            }))
                          }
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFDD00]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            updateAdminuTicketStatus(
                              ticket.ticketId,
                              ticket.status,
                              draftNote
                            );
                            showFeedback(
                              'success',
                              `Catatan disposisi ${ticket.ticketId} berhasil disimpan.`
                            );
                          }}
                          className="px-3 py-2 rounded-xl bg-[#006569] hover:bg-[#005256] text-[#FFDD00] text-xs font-black cursor-pointer"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {currentItems.map((item) => {
            const mappedIds = getMappedRegistryIdsForCmsItem(
              activeSection as CmsSectionKey,
              item.id
            );
            const hasCloudImage = isUploadedMediaUrl(item.image);
            return (
              <article
                key={item.id}
                className="bg-[#182024] border border-white/10 hover:border-[#006569] rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg transition"
              >
                <div>
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    <img
                      src={item.image || '/foto-kampus-unj.jpg'}
                      alt={item.title}
                      onError={(e) => {
                        e.currentTarget.src = '/foto-kampus-unj.jpg';
                      }}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#006569]/95 text-[#FFDD00] text-[10px] font-black uppercase tracking-wider">
                      {item.tag}
                    </span>
                    <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-md bg-slate-950/90 border border-white/15 text-emerald-300 text-[10px] font-mono font-bold">
                      {item.status}
                    </span>
                    {hasCloudImage && (
                      <span className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-400/40 text-emerald-300 text-[10px] font-mono font-bold">
                        Media Cloud Terdeteksi
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
                      <span className="truncate">
                        ID: {item.id}
                        {mappedIds[0] && mappedIds[0] !== normalizeContentId(item.id)
                          ? ` • ${mappedIds[0]}`
                          : ''}
                      </span>
                      <span className="text-teal-300 shrink-0">{item.route}</span>
                    </div>

                    <h4 className="font-black text-white text-sm leading-snug">
                      {item.title}
                    </h4>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-2 border-t border-white/5 space-y-1 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-[#FFDD00] shrink-0" />
                      <span>{item.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-teal-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 bg-slate-950/90 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#006569] hover:bg-[#005256] text-[#FFDD00] text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Edit Lengkap</span>
                </button>

                {confirmDeleteId === item.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(item)}
                      className="py-2 px-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black cursor-pointer"
                    >
                      Hapus!
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="py-2 px-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    aria-label={`Hapus ${item.title}`}
                    onClick={() => setConfirmDeleteId(item.id)}
                    className="py-2 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Hapus</span>
                  </button>
                )}
              </div>
            </article>
            );
          })}
        </div>
      )}

      {/* Modal Form Edit Lengkap / Tambah Baru */}
      {editingItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cms-modal-heading"
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingItem(null);
          }}
        >
          <div
            className="w-full max-w-2xl bg-[#161f24] border border-[#006569] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-950 border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFDD00] block">
                  {activeMeta.label} • ID: {editingItem.id}
                </span>
                <h3 id="cms-modal-heading" className="text-base font-black text-white">
                  {isCreatingNew ? 'Tambah Konten Baru' : ' Formulir Edit Konten Lengkap'}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Tutup formulir editor"
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModalForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label
                  htmlFor="cms-field-title"
                  className="text-xs font-bold text-slate-200 block mb-1"
                >
                  Judul Utama Konten / Kegiatan:
                </label>
                <input
                  id="cms-field-title"
                  type="text"
                  required
                  maxLength={180}
                  value={editingItem.title}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, title: e.target.value })
                  }
                  placeholder="Masukkan judul resmi kegiatan atau pengumuman..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFDD00]"
                />
              </div>

              <div>
                <label
                  htmlFor="cms-field-desc"
                  className="text-xs font-bold text-slate-200 block mb-1"
                >
                  Takarir / Deskripsi Lengkap:
                </label>
                <textarea
                  id="cms-field-desc"
                  rows={3}
                  required
                  maxLength={800}
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, description: e.target.value })
                  }
                  placeholder="Tuliskan ringkasan informasi, nomor SK, atau keterangan kegiatan..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFDD00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="cms-field-tag"
                    className="text-xs font-bold text-slate-200 flex items-center gap-1 mb-1"
                  >
                    <Tag size={12} className="text-[#FFDD00]" />
                    <span>Kategori / Label Tag:</span>
                  </label>
                  <input
                    id="cms-field-tag"
                    type="text"
                    required
                    maxLength={80}
                    value={editingItem.tag}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, tag: e.target.value })
                    }
                    placeholder="Contoh: Kompetisi Nasional"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFDD00]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cms-field-date"
                    className="text-xs font-bold text-slate-200 flex items-center gap-1 mb-1"
                  >
                    <Calendar size={12} className="text-[#FFDD00]" />
                    <span>Tanggal / Periode Pelaksanaan:</span>
                  </label>
                  <input
                    id="cms-field-date"
                    type="text"
                    required
                    maxLength={80}
                    value={editingItem.date}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, date: e.target.value })
                    }
                    placeholder="Contoh: 19–20 Desember 2026"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFDD00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="cms-field-location"
                    className="text-xs font-bold text-slate-200 flex items-center gap-1 mb-1"
                  >
                    <MapPin size={12} className="text-teal-400" />
                    <span>Lokasi Pelaksanaan:</span>
                  </label>
                  <input
                    id="cms-field-location"
                    type="text"
                    required
                    maxLength={140}
                    value={editingItem.location}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, location: e.target.value })
                    }
                    placeholder="Contoh: Kampus A UNJ Rawamangun"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFDD00]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cms-field-status"
                    className="text-xs font-bold text-slate-200 flex items-center gap-1 mb-1"
                  >
                    <FileText size={12} className="text-emerald-400" />
                    <span>Status Pelaksanaan:</span>
                  </label>
                  <input
                    id="cms-field-status"
                    type="text"
                    required
                    maxLength={90}
                    value={editingItem.status}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, status: e.target.value })
                    }
                    placeholder="Contoh: Pendaftaran Dibuka"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFDD00]"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {QUICK_STATUS_OPTIONS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() =>
                          setEditingItem({ ...editingItem, status: preset })
                        }
                        className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-white/10 text-[10px] text-slate-300 cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="cms-field-route"
                    className="text-xs font-bold text-slate-200 flex items-center gap-1 mb-1"
                  >
                    <ExternalLink size={12} className="text-teal-300" />
                    <span>Rute Halaman Tujuan:</span>
                  </label>
                  <select
                    id="cms-field-route"
                    value={editingItem.route}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, route: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFDD00]"
                  >
                    {QUICK_ROUTE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="cms-field-image"
                    className="text-xs font-bold text-slate-200 flex items-center gap-1 mb-1"
                  >
                    <ImageIcon size={12} className="text-[#FFDD00]" />
                    <span>URL / Unggah Gambar Dokumentasi:</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="cms-field-image"
                      type="text"
                      value={editingItem.image}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, image: e.target.value })
                      }
                      placeholder="/kegiatan/kc-menwa-unj.jpg"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFDD00]"
                    />
                    <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-bold text-[#FFDD00] flex items-center gap-1 cursor-pointer shrink-0">
                      <Upload size={13} />
                      <span>{uploadingImage ? 'Mengunggah...' : 'Unggah'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleModalImageFile}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Pratinjau & Pemilih Aset Firebase Storage + Registry */}
              <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={editingItem.image || '/foto-kampus-unj.jpg'}
                      alt="Pratinjau gambar terpilih"
                      onError={(e) => {
                        e.currentTarget.src = '/foto-kampus-unj.jpg';
                      }}
                      className="w-16 h-10 rounded-lg object-cover border border-white/15 bg-slate-900 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-slate-200 block">
                        Pratinjau Media Terpasang
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 truncate block max-w-[260px]">
                        {isUploadedMediaUrl(editingItem.image)
                          ? 'Sumber: Firebase Storage / Registry Cloud'
                          : editingItem.image || '/foto-kampus-unj.jpg'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const nextOpen = !showMediaPicker;
                        setShowMediaPicker(nextOpen);
                        if (nextOpen && storageAssets.length === 0) {
                          void loadMediaPickerAssets();
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#006569]/80 hover:bg-[#006569] border border-[#FFDD00]/30 text-[#FFDD00] text-[11px] font-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <FolderOpen size={13} />
                      <span>
                        {showMediaPicker
                          ? 'Tutup Galeri Storage'
                          : 'Pilih dari Firebase Storage & Registry'}
                      </span>
                    </button>
                    {showMediaPicker && (
                      <button
                        type="button"
                        aria-label="Muat ulang daftar Firebase Storage"
                        onClick={() => void loadMediaPickerAssets()}
                        disabled={loadingStorageAssets}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                      >
                        <RefreshCw
                          size={13}
                          className={loadingStorageAssets ? 'animate-spin text-[#FFDD00]' : ''}
                        />
                      </button>
                    )}
                  </div>
                </div>

                {showMediaPicker && (
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    {storageError && (
                      <p className="text-[11px] text-rose-300">{storageError}</p>
                    )}
                    {loadingStorageAssets ? (
                      <p className="text-[11px] text-slate-400 py-3 text-center">
                        Memindai aset gambar di Firebase Storage…
                      </p>
                    ) : pickerGalleryItems.length === 0 ? (
                      <p className="text-[11px] text-slate-400 py-3 text-center">
                        Belum ada gambar terunggah di Storage maupun Content Registry.
                      </p>
                    ) : (
                      <div className="max-h-56 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 pr-1">
                        {pickerGalleryItems.map((asset) => {
                          const isSelected = editingItem.image === asset.url;
                          return (
                            <button
                              key={asset.url}
                              type="button"
                              onClick={() =>
                                setEditingItem((prev) =>
                                  prev ? { ...prev, image: asset.url } : null
                                )
                              }
                              className={`text-left rounded-xl overflow-hidden border transition cursor-pointer bg-slate-900 ${
                                isSelected
                                  ? 'border-[#FFDD00] ring-2 ring-[#FFDD00]/40'
                                  : 'border-white/10 hover:border-teal-400'
                              }`}
                            >
                              <div className="aspect-video w-full bg-slate-950 overflow-hidden">
                                <img
                                  src={asset.url}
                                  alt={asset.label}
                                  loading="lazy"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-1.5 space-y-0.5">
                                <span className="text-[9px] font-mono uppercase text-teal-300 block">
                                  {asset.source}
                                  {asset.contentId ? ` • ${asset.contentId}` : ''}
                                </span>
                                <span className="text-[10px] font-bold text-slate-200 truncate block">
                                  {asset.label}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#006569] hover:bg-[#005256] text-[#FFDD00] text-xs font-black uppercase tracking-wider shadow-lg cursor-pointer"
                >
                  Simpan & Publikasikan Konten
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Impor JSON */}
      {showImportModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cms-import-heading"
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowImportModal(false);
          }}
        >
          <div
            className="w-full max-w-xl bg-[#161f24] border border-[#006569] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-950 border-b border-white/10 flex items-center justify-between">
              <h3 id="cms-import-heading" className="text-sm font-black text-white uppercase">
                Impor Cadangan Konfigurasi JSON CMS
              </h3>
              <button
                type="button"
                aria-label="Tutup modal impor JSON"
                onClick={() => setShowImportModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleImportJsonSubmit} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">
                  Unggah berkas <code>.json</code> hasil ekspor atau tempel isi JSON di bawah:
                </span>
                <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-[#FFDD00] cursor-pointer">
                  Pilih Berkas .JSON
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={handleImportJsonFile}
                    className="hidden"
                  />
                </label>
              </div>
              <textarea
                rows={7}
                required
                aria-label="Isi JSON Konfigurasi CMS"
                value={jsonInputText}
                onChange={(e) => setJsonInputText(e.target.value)}
                placeholder='{"version": "2026.11.v9", "heroScenes": [...]}'
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-[#FFDD00]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!jsonInputText.trim()}
                  className="px-4 py-2 rounded-xl bg-[#006569] text-[#FFDD00] text-xs font-black uppercase cursor-pointer disabled:opacity-50"
                >
                  Validasi & Terapkan JSON
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
