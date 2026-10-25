import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  saveContentRegistryItem,
  subscribeToContentRegistry,
  uploadAndConvertToSVG,
  saveCommandCenterLog,
  createAuditLog
} from '../firebase.js';

const STORAGE_KEY = 'menwa_canvas_state_v2';
const SNAPSHOT_KEY = 'menwa_canvas_snapshots_v1';
const AUTH_KEY = 'menwa_command_auth_v1';
const REGISTRY_KEY = 'menwa_content_registry_v8';

// Default authorized master accounts
export const AUTHORIZED_EMAIL = 'unjmenwa@gmail.com';
export const TERMINAL_CREDENTIALS = {
  username: 'mako_admin',
  passcode: 'MENWA-MAKO-2026',
};

// Daftar Tab Portal untuk Image Tracker & Content Registry (Bagian 4.D)
export const PORTAL_TABS_OVERVIEW = [
  { tabId: 'beranda', label: 'Beranda Utama', route: '/' },
  { tabId: 'kc', label: 'Ksatria Cendekia VIII', route: '/kc' },
  { tabId: 'geranat', label: 'GERANAT 2026 & Podium', route: '/geranat' },
  { tabId: 'youth-spark', label: 'Youth Spark National', route: '/youth-spark' },
  { tabId: 'struktur', label: 'Organisasi & Komando', route: '/garis-komando' },
  { tabId: 'pendidikan', label: 'Pendidikan & Latihan', route: '/pendidikan' },
  { tabId: 'mako', label: 'Kontak & Markas', route: '/mako' },
  { tabId: 'administrasi', label: 'Administrasi Umum', route: '/administrasi' },
];

export const INITIAL_CONTENT_REGISTRY = [
  {
    contentId: 'CNT-BERANDA-HERO',
    tabId: 'beranda',
    sectionId: 'hero_banner',
    type: 'image',
    title: 'Hero Banner Utama Menwa UNJ',
    caption: 'Apel Korps Resimen Mahasiswa Jayakarta Satuan Universitas Negeri Jakarta di Plaza Kampus A',
    description: 'Banner pembuka halaman utama portal resmi Menwa UNJ',
    imageUrl: '/foto-kampus-unj.jpg',
    imageFormat: 'svg',
    originalFileName: 'foto-kampus-unj.svg',
    convertedFromFormat: 'jpg',
    fileSize: 184320,
    dimensions: { width: 1200, height: 675 },
    order: 1,
    isActive: true,
    updatedBy: 'unjmenwa@gmail.com',
    updatedAt: '2026-10-25T08:00:00.000Z',
  },
  {
    contentId: 'CNT-BERANDA-DOK-1',
    tabId: 'beranda',
    sectionId: 'dokumentasi_kegiatan',
    type: 'image',
    title: 'Dokumentasi Ksatria Cendekia VII',
    caption: 'Kompetisi Ketangkasan Militer & Karya Ilmiah Tingkat Nasional KC VII',
    description: 'Kartu dokumentasi sorotan giat beranda',
    imageUrl: '/dokumentasi/kcvii.svg',
    imageFormat: 'svg',
    originalFileName: 'kcvii.svg',
    convertedFromFormat: 'svg',
    fileSize: 95400,
    dimensions: { width: 800, height: 1000 },
    order: 2,
    isActive: true,
    updatedBy: 'unjmenwa@gmail.com',
    updatedAt: '2026-10-25T08:10:00.000Z',
  },
  {
    contentId: 'CNT-KC-POSTER',
    tabId: 'kc',
    sectionId: 'kc_showcase',
    type: 'image',
    title: 'Poster Utama Ksatria Cendekia VIII',
    caption: 'Latihan Integrasi Pemuda Nusantara & Lomba Ketangkasan Nasional KC VIII 2026',
    description: 'Visual utama subtab Ksatria Cendekia VIII',
    imageUrl: '/kegiatan/kc-menwa-unj.jpg',
    imageFormat: 'svg',
    originalFileName: 'kc-menwa-unj.svg',
    convertedFromFormat: 'jpg',
    fileSize: 210500,
    dimensions: { width: 1080, height: 1350 },
    order: 1,
    isActive: true,
    updatedBy: 'unjmenwa@gmail.com',
    updatedAt: '2026-10-25T08:15:00.000Z',
  },
  {
    contentId: 'CNT-GERANAT-LOGO',
    tabId: 'geranat',
    sectionId: 'geranat_hero',
    type: 'image',
    title: 'Visual Giat GERANAT VI Paskibra',
    caption: 'Gerakan Paskibra Semangat (GERANAT) Tingkat SMP/MTs & SMA/SMK Se-Pulau Jawa',
    description: 'Aset visual halaman utama GERANAT dan Podium Terfavorit',
    imageUrl: '/dokumentasi/geranatvi.svg',
    imageFormat: 'svg',
    originalFileName: 'geranatvi.svg',
    convertedFromFormat: 'svg',
    fileSize: 112000,
    dimensions: { width: 800, height: 1000 },
    order: 1,
    isActive: true,
    updatedBy: 'rafflysyahpoetra@gmail.com',
    updatedAt: '2026-10-25T08:20:00.000Z',
  },
  {
    contentId: 'CNT-YOUTH-POSTER',
    tabId: 'youth-spark',
    sectionId: 'youth_spark_hero',
    type: 'image',
    title: 'Poster Youth Spark National Seminar 2026',
    caption: 'Empowering Youth, Elevating UMKM — Kolaborasi DISPORA DKI Jakarta × Menwa UNJ',
    description: 'Poster resmi kegiatan seminar nasional Youth Spark',
    imageUrl: '/kegiatan/youth-spark-2026.webp',
    imageFormat: 'svg',
    originalFileName: 'youth-spark-2026.svg',
    convertedFromFormat: 'webp',
    fileSize: 164000,
    dimensions: { width: 1080, height: 1350 },
    order: 1,
    isActive: true,
    updatedBy: 'unjmenwa@gmail.com',
    updatedAt: '2026-10-25T08:25:00.000Z',
  },
  {
    contentId: 'CNT-STRUKTUR-KOMANDO',
    tabId: 'struktur',
    sectionId: 'garis_komando_header',
    type: 'image',
    title: 'Dokumentasi Rapat Komando Satuan',
    caption: 'Sidang & Rapat Komando Satuan (RAKOMSAT) Menwa UNJ',
    description: 'Dokumentasi jajaran pimpinan dan staf komando',
    imageUrl: '/dokumentasi/rakomsat25.svg',
    imageFormat: 'svg',
    originalFileName: 'rakomsat25.svg',
    convertedFromFormat: 'svg',
    fileSize: 98000,
    dimensions: { width: 800, height: 1000 },
    order: 1,
    isActive: true,
    updatedBy: 'unjmenwa@gmail.com',
    updatedAt: '2026-10-25T08:30:00.000Z',
  },
  {
    contentId: 'CNT-PENDIDIKAN-DIKLAT',
    tabId: 'pendidikan',
    sectionId: 'diklat_header',
    type: 'image',
    title: 'Gelar Apel Giat Renang Militer & Diklat',
    caption: 'Pembinaan Fisik Terukur, Diksarmil, dan Kursus Kader Pelaksana Menwa UNJ',
    description: 'Aset visual halaman Pendidikan & Pelatihan',
    imageUrl: '/kegiatan/geranat-logo-menwa-unj.png',
    imageFormat: 'svg',
    originalFileName: 'diklat-menwa-unj.svg',
    convertedFromFormat: 'png',
    fileSize: 142000,
    dimensions: { width: 900, height: 600 },
    order: 1,
    isActive: true,
    updatedBy: 'unjmenwa@gmail.com',
    updatedAt: '2026-10-25T08:35:00.000Z',
  },
  {
    contentId: 'CNT-MAKO-GEDUNG',
    tabId: 'mako',
    sectionId: 'mako_showcase',
    type: 'image',
    title: 'Markas Komando Gedung G R.107 Kampus A',
    caption: 'Posko Piket 24 Jam Markas Komando Menwa UNJ Rawamangun Jakarta Timur',
    description: 'Foto lokasi Markas Komando Menwa UNJ',
    imageUrl: '/foto-kampus-unj.jpg',
    imageFormat: 'svg',
    originalFileName: 'mako-gedung-g.svg',
    convertedFromFormat: 'jpg',
    fileSize: 175000,
    dimensions: { width: 1200, height: 675 },
    order: 1,
    isActive: true,
    updatedBy: 'unjmenwa@gmail.com',
    updatedAt: '2026-10-25T08:40:00.000Z',
  },
];

// Preset sample photos from portal's public assets for immediate demonstration
export const PRESET_MEDIA = [
  { url: '/kegiatan/kc-menwa-unj.jpg', caption: 'Pembukaan & Perlombaan Ksatria Cendekia Nasional', tag: 'KC VIII' },
  { url: '/kegiatan/poster-youthspark.png', caption: 'Youth Spark National Seminar & Kewirausahaan Pemuda', tag: 'Youth Spark' },
  { url: '/foto-kampus-unj.jpg', caption: 'Apel Korps Menwa UNJ di Plaza Kampus A', tag: 'Mako / Kampus' },
  { url: '/kegiatan/geranat-logo-menwa-unj.png', caption: 'Gelar Apel Giat Renang Militer & Ketangkasan', tag: 'Diklat' },
  { url: '/kegiatan/youth-spark-2026.webp', caption: 'Dokumentasi Pemberdayaan Pemuda & UMKM Berdaya', tag: 'Youth Spark' },
];

export const AVAILABLE_CONTAINERS = [
  { id: 'hero_cta_slot', label: 'Hero Banner (Tombol Aksi Cepat)', page: 'Beranda' },
  { id: 'beranda_showcase_slot', label: 'Beranda (Galeri & Kartu Kegiatan)', page: 'Beranda' },
  { id: 'kc_action_slot', label: 'Ksatria Cendekia VIII (Informasi & CTA)', page: 'KC VIII' },
  { id: 'youth_spark_slot', label: 'Youth Spark (Pengumuman & Media)', page: 'Youth Spark' },
  { id: 'mako_slot', label: 'Markas Komando (Layanan & Kontak)', page: 'Mako' },
];

const INITIAL_COMPONENTS = [
  {
    id: 'btn-piket-mako',
    container: 'hero_cta_slot',
    component_type: 'button',
    props: {
      label: 'Hubungi Piket Mako 24 Jam',
      style: { variant: 'secondary', align: 'center' },
      action_trigger: 'https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ',
    },
  },
  {
    id: 'card-pengumuman-diklat',
    container: 'beranda_showcase_slot',
    component_type: 'card',
    props: {
      label: 'Penerimaan Kader Baru & Diksarmil Menwa UNJ 2026',
      caption: 'Pendaftaran gelombang pembinaan jasmani, wawasan kebangsaan, dan dasar keprajuritan telah dibuka untuk mahasiswa aktif.',
      media_url: '/foto-kampus-unj.jpg',
      style: { variant: 'primary', align: 'left' },
      action_trigger: '/pendidikan',
    },
  },
  {
    id: 'gallery-giat-terkini',
    container: 'beranda_showcase_slot',
    component_type: 'gallery',
    props: {
      label: 'Dokumentasi Terkini Kegiatan Lapangan',
      style: { grid_columns: 3, align: 'left' },
      media_items: [
        { url: '/foto-kampus-unj.jpg', caption: 'Apel Kesiapsiagaan Anggota Satuan di Plaza Kampus A' },
        { url: '/kegiatan/kc-menwa-unj.jpg', caption: 'Penyelenggaraan Lomba Ketangkasan Ksatria Cendekia' },
        { url: '/kegiatan/poster-youthspark.png', caption: 'Youth Spark National Seminar di Aula Latief Hendraningrat' },
      ],
    },
  },
];

const CanvasContext = createContext(null);

export function CanvasProvider({ children }) {
  // Authentication state
  const [authSession, setAuthSession] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      isAuthenticated: false,
      userEmail: null,
      officerName: null,
      role: null,
      loginTime: null,
    };
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Content Registry state (Image Tracker & Auto-SVG Registry per tab)
  const [contentRegistry, setContentRegistry] = useState(() => {
    try {
      const saved = localStorage.getItem(REGISTRY_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_CONTENT_REGISTRY;
  });

  // Pending AI Agent Proposal requiring [Approve & Execute] or [Reject]
  const [pendingAIProposal, setPendingAIProposal] = useState(null);

  // Components state
  const [components, setComponents] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_COMPONENTS;
  });

  // Snapshots for Rollback engine
  const [snapshots, setSnapshots] = useState(() => {
    try {
      const saved = localStorage.getItem(SNAPSHOT_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'snap-initial',
        timestamp: new Date().toLocaleString('id-ID'),
        description: 'Kondisi awal portal bawaan',
        officer: 'Sistem Pusat Menwa UNJ',
        componentsState: INITIAL_COMPONENTS,
      },
    ];
  });

  const [history, setHistory] = useState([
    {
      id: 'init-0',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userMessage: 'Command Center V8 & AI Agent Ecosystem aktif dan terlindungi.',
      schema: {
        action: 'ADD_COMPONENT',
        target_container: 'beranda_showcase_slot',
        payload: {
          component_type: 'gallery',
          id: 'gallery-giat-terkini',
          props: {
            label: 'Dokumentasi Terkini Kegiatan Lapangan',
            style: { grid_columns: 3, align: 'left' },
            media_items: INITIAL_COMPONENTS[2].props.media_items,
          },
        },
      },
    },
  ]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ai_agent');

  // Sync Content Registry with Firestore /content_registry
  useEffect(() => {
    const unsub = subscribeToContentRegistry((remoteItems) => {
      if (remoteItems && remoteItems.length > 0) {
        setContentRegistry((prev) => {
          const map = new Map(prev.map((item) => [item.contentId, item]));
          remoteItems.forEach((r) => map.set(r.contentId || r.id, r));
          return Array.from(map.values());
        });
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(REGISTRY_KEY, JSON.stringify(contentRegistry));
    } catch {
      // ignore
    }
  }, [contentRegistry]);

  // Persist session
  useEffect(() => {
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(authSession));
    } catch (e) {
      console.warn('Gagal menyimpan sesi auth:', e);
    }
  }, [authSession]);

  // Persist components
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(components));
    } catch (e) {
      console.warn('Gagal menyimpan canvas state:', e);
    }
  }, [components]);

  // Persist snapshots
  useEffect(() => {
    try {
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshots));
    } catch (e) {
      console.warn('Gagal menyimpan snapshots:', e);
    }
  }, [snapshots]);

  // Record a snapshot before mutations
  const createSnapshot = useCallback((description, currentComponents) => {
    const newSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID'),
      description: description || 'Pembaruan tata letak oleh staf Mako',
      officer: authSession.officerName || authSession.userEmail || 'Staf Terotorisasi',
      componentsState: JSON.parse(JSON.stringify(currentComponents || components)),
    };
    setSnapshots((prev) => [newSnapshot, ...prev.slice(0, 19)]);
  }, [authSession, components]);

  // Rollback to specific snapshot
  const rollbackSnapshot = useCallback((snapshotId) => {
    const target = snapshots.find((s) => s.id === snapshotId);
    if (!target) return false;
    setComponents(target.componentsState);
    setHistory((prev) => [
      {
        id: `act-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userMessage: `Rollback berhasil: Layout dikembalikan ke snapshot "${target.description}" (${target.timestamp}).`,
        schema: {
          action: 'MODIFY_LAYOUT',
          target_container: 'all',
          payload: {
            component_type: 'container',
            id: `rollback-${snapshotId}`,
            props: { label: `Rollback to ${target.timestamp}` },
          },
        },
      },
      ...prev,
    ]);
    return true;
  }, [snapshots]);

  // Login handler with Google (supports both unjmenwa@gmail.com and rafflysyahpoetra@gmail.com)
  const loginWithGoogle = useCallback((email = AUTHORIZED_EMAIL) => {
    const clean = email.toLowerCase().trim();
    if (clean === 'unjmenwa@gmail.com' || clean === 'rafflysyahpoetra@gmail.com') {
      const session = {
        isAuthenticated: true,
        userEmail: clean,
        officerName: clean === 'rafflysyahpoetra@gmail.com' ? 'Admin Raffli Syahputra' : 'Perwira Piket Mako Satuan UNJ',
        role: 'SUPER_ADMIN',
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setAuthSession(session);
      setIsLoginModalOpen(false);
      setIsDrawerOpen(true);
      return { success: true };
    }
    return {
      success: false,
      message: `Akses ditolak. Email ${email} bukan akun resmi komando (unjmenwa@gmail.com / rafflysyahpoetra@gmail.com).`,
    };
  }, []);

  // Login handler with Localhost Terminal Passcode
  const loginWithPasscode = useCallback((username, passcode) => {
    if (
      username === TERMINAL_CREDENTIALS.username &&
      passcode === TERMINAL_CREDENTIALS.passcode
    ) {
      const session = {
        isAuthenticated: true,
        userEmail: 'localhost_admin@menwa.unj',
        officerName: 'Administrator Piket Terminal',
        role: 'KOMANDAN',
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setAuthSession(session);
      setIsLoginModalOpen(false);
      setIsDrawerOpen(true);
      return { success: true };
    }
    return {
      success: false,
      message: 'Kredensial salah. Periksa username dan passcode terminal.',
    };
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    setAuthSession({
      isAuthenticated: false,
      userEmail: null,
      officerName: null,
      role: null,
      loginTime: null,
    });
    setIsDrawerOpen(false);
  }, []);

  // Image Tracker CRUD (Bagian 4.B, 4.C, 4.D)
  const updateRegistryItem = useCallback(async (contentId, updates) => {
    let updatedItem = null;
    setContentRegistry((prev) =>
      prev.map((item) => {
        if (item.contentId === contentId) {
          updatedItem = {
            ...item,
            ...updates,
            updatedBy: authSession.userEmail || 'unjmenwa@gmail.com',
            updatedAt: new Date().toISOString(),
          };
          return updatedItem;
        }
        return item;
      })
    );
    if (updatedItem) {
      await saveContentRegistryItem(updatedItem);
      await createAuditLog({
        actorEmail: authSession.userEmail || 'unjmenwa@gmail.com',
        action: 'CONTENT_REGISTRY_UPDATED',
        targetCollection: 'content_registry',
        targetDocId: contentId,
        newValue: updates,
      });
    }
    return updatedItem;
  }, [authSession.userEmail]);

  const uploadAndRegisterImage = useCallback(async ({
    tabId = 'beranda',
    sectionId = 'galeri_utama',
    title = 'Dokumentasi Baru Menwa UNJ',
    caption = 'Dokumentasi resmi kegiatan Resimen Mahasiswa Satuan UNJ',
    fileDataUrl,
    fileName = 'image.png',
    replaceContentId = null,
  }) => {
    const converted = await uploadAndConvertToSVG(fileDataUrl, fileName, tabId);
    const contentId = replaceContentId || `CNT-${tabId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const newItem = {
      contentId,
      tabId,
      sectionId,
      type: 'image',
      title,
      caption,
      description: `Dikonversi otomatis ke SVG dari ${fileName}`,
      imageUrl: converted.svgDataUrl,
      imageFormat: 'svg',
      originalFileName: fileName,
      convertedFromFormat: converted.convertedFromFormat || 'png',
      fileSize: converted.fileSize || 125000,
      dimensions: converted.dimensions || { width: 1200, height: 675 },
      order: 1,
      isActive: true,
      updatedBy: authSession.userEmail || 'unjmenwa@gmail.com',
      updatedAt: new Date().toISOString(),
    };

    setContentRegistry((prev) => {
      const idx = prev.findIndex((i) => i.contentId === contentId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newItem;
        return copy;
      }
      return [newItem, ...prev];
    });

    await saveContentRegistryItem(newItem);
    await createAuditLog({
      actorEmail: authSession.userEmail || 'unjmenwa@gmail.com',
      action: replaceContentId ? 'IMAGE_REPLACED_AUTO_SVG' : 'IMAGE_UPLOADED_AUTO_SVG',
      targetCollection: 'content_registry',
      targetDocId: contentId,
      newValue: { title, caption, tabId, convertedFromFormat: newItem.convertedFromFormat },
    });

    return newItem;
  }, [authSession.userEmail]);

  const softRemoveRegistryItem = useCallback(async (contentId) => {
    return updateRegistryItem(contentId, { isActive: false });
  }, [updateRegistryItem]);

  // Execute an action schema directly (protected)
  const executeActionSchema = useCallback((actionSchema, customMessage, promptUsed = '') => {
    if (!authSession.isAuthenticated) {
      setIsLoginModalOpen(true);
      return false;
    }
    if (!actionSchema || typeof actionSchema !== 'object') return false;
    const { action, target_container, payload } = actionSchema;

    let confirmationText = customMessage;

    // Save snapshot before mutating
    createSnapshot(`Aksi ${action} pada ${target_container}`);

    setComponents((prev) => {
      let next = [...prev];
      if (action === 'ADD_COMPONENT' || action === 'INSERT_MEDIA') {
        const existingIdx = next.findIndex((c) => c.id === payload.id);
        const item = {
          id: payload.id || `comp-${Date.now()}`,
          container: target_container,
          component_type: payload.component_type,
          props: payload.props || {},
        };
        if (existingIdx >= 0) {
          next[existingIdx] = item;
        } else {
          next.push(item);
        }
        if (!confirmationText) {
          confirmationText = action === 'INSERT_MEDIA'
            ? `Media foto berhasil ditambahkan ke ${target_container} dengan penataan proporsional.`
            : `Komponen ${payload.component_type} berhasil disuntikkan ke dalam ${target_container}.`;
        }
      } else if (action === 'MODIFY_LAYOUT') {
        const idx = next.findIndex((c) => c.id === payload.id || c.container === target_container);
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            props: {
              ...next[idx].props,
              ...(payload.props || {}),
              style: {
                ...(next[idx].props?.style || {}),
                ...(payload.props?.style || {}),
              },
            },
          };
          if (!confirmationText) {
            confirmationText = `Layout komponen ${next[idx].id} berhasil diperbarui sesuai instruksi.`;
          }
        } else {
          next.push({
            id: payload.id || `comp-${Date.now()}`,
            container: target_container,
            component_type: payload.component_type || 'container',
            props: payload.props || {},
          });
          if (!confirmationText) {
            confirmationText = `Wadah baru ${target_container} telah disesuaikan tata letaknya.`;
          }
        }
      } else if (action === 'DELETE_COMPONENT') {
        next = next.filter((c) => c.id !== payload.id);
        if (!confirmationText) {
          confirmationText = `Komponen ${payload.id} telah dihapus dari canvas.`;
        }
      }
      return next;
    });

    const newHistItem = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userMessage: confirmationText || 'Perubahan layout berhasil dieksekusi secara realtime.',
      schema: actionSchema,
    };

    setHistory((prev) => [newHistItem, ...prev.slice(0, 24)]);

    // Catat ke /command_center_logs/ dan /audit_logs/
    saveCommandCenterLog({
      prompt: promptUsed || confirmationText || action,
      parsedIntent: action,
      targetTab: target_container,
      actionsExecuted: [{ type: action, targetId: payload?.id || target_container, after: payload }],
      status: 'completed',
      executedBy: authSession.userEmail || 'unjmenwa@gmail.com',
      rollbackAvailable: true,
    }).catch(() => {});

    return true;
  }, [authSession.isAuthenticated, authSession.userEmail, createSnapshot]);

  // Build AI Proposal Card first (requires [Approve & Execute] or [Reject] per Bagian 4.E)
  const buildAIProposal = useCallback((promptText, attachedMedia = null) => {
    const q = String(promptText || '').toLowerCase().trim();
    if (!q && !attachedMedia) return null;

    let action = 'ADD_COMPONENT';
    let targetContainer = 'beranda_showcase_slot';
    let targetTab = 'beranda';
    let userMessage = '';
    const componentId = `comp-${Date.now().toString(36)}`;

    if (q.includes('hero') || q.includes('banner') || q.includes('atas') || q.includes('header')) {
      targetContainer = 'hero_cta_slot';
      targetTab = 'beranda';
    } else if (q.includes('kc') || q.includes('cendekia') || q.includes('lomba') || q.includes('jersey')) {
      targetContainer = 'kc_action_slot';
      targetTab = 'kc';
    } else if (q.includes('youth') || q.includes('spark') || q.includes('seminar')) {
      targetContainer = 'youth_spark_slot';
      targetTab = 'youth-spark';
    } else if (q.includes('mako') || q.includes('markas') || q.includes('piket') || q.includes('kontak')) {
      targetContainer = 'mako_slot';
      targetTab = 'mako';
    } else if (q.includes('geranat') || q.includes('paskibra')) {
      targetContainer = 'beranda_showcase_slot';
      targetTab = 'geranat';
    }

    // Jika perintah mengubah caption gambar di Image Tracker
    if (q.includes('caption') || q.includes('keterangan')) {
      const matchItem = contentRegistry.find((item) => item.tabId === targetTab && item.isActive) || contentRegistry[0];
      const extractedCaption = promptText.replace(/^(ubah|ganti|update)\s+caption.*?(jadi|menjadi|:)\s*/i, '').trim() || promptText;
      return {
        proposalId: `PROP-${Date.now()}`,
        prompt: promptText,
        intent: 'UPDATE_CAPTION',
        targetTab,
        targetContainer,
        summary: `Perbarui caption pada gambar "${matchItem?.title}" di tab ${targetTab.toUpperCase()} menjadi: "${extractedCaption}"`,
        registryTargetId: matchItem?.contentId,
        newCaption: extractedCaption,
        schema: {
          action: 'UPDATE_CAPTION',
          target_container: targetTab,
          payload: {
            contentId: matchItem?.contentId,
            previousCaption: matchItem?.caption,
            newCaption: extractedCaption,
          },
        },
      };
    }

    if (q.includes('hapus') || q.includes('hilangkan') || q.includes('delete') || q.includes('buang')) {
      const candidate = components.find((c) => q.includes(c.id.toLowerCase()) || q.includes(c.props.label?.toLowerCase() || '')) || components[components.length - 1];
      if (candidate) {
        const schema = {
          action: 'DELETE_COMPONENT',
          target_container: candidate.container,
          payload: {
            component_type: candidate.component_type,
            id: candidate.id,
            props: candidate.props,
          },
        };
        userMessage = `Hapus komponen "${candidate.props.label || candidate.id}" dari ${candidate.container}.`;
        return {
          proposalId: `PROP-${Date.now()}`,
          prompt: promptText,
          intent: 'DELETE_COMPONENT',
          targetTab,
          targetContainer: candidate.container,
          summary: userMessage,
          schema,
        };
      }
    }

    if (q.includes('kolom') || q.includes('geser') || q.includes('ubah layout') || q.includes('ratakan') || q.includes('tata letak')) {
      const cols = q.includes('4 kolom') ? 4 : q.includes('2 kolom') ? 2 : q.includes('1 kolom') ? 1 : 3;
      const align = q.includes('kanan') ? 'right' : q.includes('tengah') || q.includes('center') ? 'center' : 'left';
      const existing = components.find((c) => c.component_type === 'gallery' || c.container === targetContainer) || components[0];
      const schema = {
        action: 'MODIFY_LAYOUT',
        target_container: existing?.container || targetContainer,
        payload: {
          component_type: existing?.component_type || 'gallery',
          id: existing?.id || componentId,
          props: {
            style: {
              grid_columns: cols,
              align: align,
            },
          },
        },
      };
      userMessage = `Ubah tata letak pada ${existing?.container || targetContainer} menjadi ${cols} kolom (rata ${align}).`;
      return {
        proposalId: `PROP-${Date.now()}`,
        prompt: promptText,
        intent: 'MODIFY_LAYOUT',
        targetTab,
        targetContainer: existing?.container || targetContainer,
        summary: userMessage,
        schema,
      };
    }

    if (attachedMedia || q.includes('galeri') || q.includes('foto') || q.includes('dokumentasi') || q.includes('gambar')) {
      const cols = q.includes('2 kolom') ? 2 : q.includes('4 kolom') ? 4 : 3;
      const mediaUrl = attachedMedia || '/foto-kampus-unj.jpg';
      const title = q.includes('kc') ? 'Dokumentasi Persiapan Ksatria Cendekia' : q.includes('youth') ? 'Dokumentasi Giat Youth Spark National' : 'Galeri Dokumentasi Kegiatan Satuan';
      const schema = {
        action: 'INSERT_MEDIA',
        target_container: targetContainer,
        payload: {
          component_type: 'gallery',
          id: `gallery-${Date.now().toString(36)}`,
          props: {
            label: title,
            caption: 'Dokumentasi resmi Resimen Mahasiswa Jayakarta Satuan UNJ.',
            style: {
              grid_columns: cols,
              align: 'left',
            },
            media_items: [
              { url: mediaUrl, caption: 'Dokumentasi Utama Giat Satuan' },
              { url: '/kegiatan/kc-menwa-unj.jpg', caption: 'Pelaksanaan Lomba & Apel Bersama' },
              { url: '/foto-kampus-unj.jpg', caption: 'Plaza Kampus A Universitas Negeri Jakarta' },
            ],
          },
        },
      };
      userMessage = `Pasang galeri foto ${cols} kolom "${title}" pada ${targetContainer} + konversi aset ke SVG.`;
      return {
        proposalId: `PROP-${Date.now()}`,
        prompt: promptText,
        intent: 'INSERT_MEDIA',
        targetTab,
        targetContainer,
        summary: userMessage,
        attachedMedia,
        schema,
      };
    }

    if (q.includes('tombol') || q.includes('button') || q.includes('cta') || q.includes('link') || q.includes('daftar')) {
      let label = 'Daftar Sekarang';
      let link = '#';
      let variant = 'primary';

      if (q.includes('wa') || q.includes('whatsapp') || q.includes('piket') || q.includes('kontak')) {
        label = 'Hubungi Piket Mako 24 Jam';
        link = 'https://wa.me/6281525823503';
        variant = 'secondary';
      } else if (q.includes('kc') || q.includes('cendekia')) {
        label = 'Registrasi Ksatria Cendekia VIII';
        link = 'https://bit.ly/PendaftaranKCVIII';
        variant = 'primary';
      } else if (q.includes('youth') || q.includes('seminar')) {
        label = 'Ambil Kursi Seminar Youth Spark';
        link = 'https://forms.gle/Xc3QsBLNueoXYLfDA';
        variant = 'primary';
      } else if (q.includes('juknis') || q.includes('panduan')) {
        label = 'Unduh Petunjuk Teknis Resmi';
        link = '/dokumen/juknis-kc-viii-menwa-unj.pdf';
        variant = 'outline';
      }

      const align = q.includes('kiri') ? 'left' : q.includes('kanan') ? 'right' : 'center';
      const schema = {
        action: 'ADD_COMPONENT',
        target_container: targetContainer,
        payload: {
          component_type: 'button',
          id: `btn-${Date.now().toString(36)}`,
          props: {
            label: label,
            action_trigger: link,
            style: {
              variant: variant,
              align: align,
            },
          },
        },
      };
      userMessage = `Tambahkan tombol CTA "${label}" pada seksi ${targetContainer}.`;
      return {
        proposalId: `PROP-${Date.now()}`,
        prompt: promptText,
        intent: 'ADD_BUTTON',
        targetTab,
        targetContainer,
        summary: userMessage,
        schema,
      };
    }

    const cardTitle = q ? promptText.slice(0, 60) : 'Pengumuman Penting Satuan';
    const schema = {
      action: 'ADD_COMPONENT',
      target_container: targetContainer,
      payload: {
        component_type: 'card',
        id: `card-${Date.now().toString(36)}`,
        props: {
          label: cardTitle,
          caption: 'Informasi dan instruksi resmi Komando Resimen Mahasiswa Jayakarta Satuan UNJ.',
          media_url: attachedMedia || '/foto-kampus-unj.jpg',
          style: {
            variant: 'primary',
            align: 'left',
          },
          action_trigger: '/informasi',
        },
      },
    };
    userMessage = `Tambahkan kartu pengumuman "${cardTitle}" ke dalam ${targetContainer}.`;
    return {
      proposalId: `PROP-${Date.now()}`,
      prompt: promptText,
      intent: 'ADD_CARD',
      targetTab,
      targetContainer,
      summary: userMessage,
      schema,
    };
  }, [components, contentRegistry]);

  // Propose Natural Language Command (shows Preview Card for Admin Approval)
  const proposeNaturalLanguage = useCallback((promptText, attachedMedia = null) => {
    const proposal = buildAIProposal(promptText, attachedMedia);
    if (proposal) {
      setPendingAIProposal(proposal);
    }
    return proposal;
  }, [buildAIProposal]);

  // Approve & Execute Proposed AI Command
  const approveAIProposal = useCallback(async () => {
    if (!pendingAIProposal) return null;
    const prop = pendingAIProposal;
    setPendingAIProposal(null);

    if (prop.intent === 'UPDATE_CAPTION' && prop.registryTargetId) {
      await updateRegistryItem(prop.registryTargetId, { caption: prop.newCaption });
      const newHistItem = {
        id: `act-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userMessage: prop.summary,
        schema: prop.schema,
      };
      setHistory((prev) => [newHistItem, ...prev.slice(0, 24)]);
      await saveCommandCenterLog({
        prompt: prop.prompt,
        parsedIntent: prop.intent,
        targetTab: prop.targetTab,
        actionsExecuted: [prop.schema],
        status: 'completed',
        executedBy: authSession.userEmail || 'unjmenwa@gmail.com',
      });
      return prop;
    }

    executeActionSchema(prop.schema, prop.summary, prop.prompt);
    return prop;
  }, [pendingAIProposal, updateRegistryItem, executeActionSchema, authSession.userEmail]);

  const rejectAIProposal = useCallback(() => {
    setPendingAIProposal(null);
  }, []);

  // Direct execution for backward compatibility
  const processNaturalLanguage = useCallback((promptText, attachedMedia = null) => {
    const prop = buildAIProposal(promptText, attachedMedia);
    if (!prop) return null;
    executeActionSchema(prop.schema, prop.summary, promptText);
    return { schema: prop.schema, userMessage: prop.summary };
  }, [buildAIProposal, executeActionSchema]);

  // Insert media directly via Drag and Drop
  const insertMediaDragAndDrop = useCallback((mediaUrl, targetContainer = 'beranda_showcase_slot', customCaption = '') => {
    if (!authSession.isAuthenticated) {
      setIsLoginModalOpen(true);
      return null;
    }
    const caption = customCaption || 'Dokumentasi kegiatan resmi Menwa UNJ.';
    const schema = {
      action: 'INSERT_MEDIA',
      target_container: targetContainer,
      payload: {
        component_type: 'gallery',
        id: `gallery-drop-${Date.now().toString(36)}`,
        props: {
          label: 'Galeri Dokumentasi Terkini',
          caption: caption,
          style: {
            grid_columns: 3,
            align: 'left',
          },
          media_items: [
            { url: mediaUrl, caption: caption },
            { url: '/kegiatan/kc-menwa-unj.jpg', caption: 'Dokumentasi Giat Ksatria Cendekia VIII' },
            { url: '/foto-kampus-unj.jpg', caption: 'Suasana Apel di Kampus A UNJ' },
          ],
        },
      },
    };
    const userMessage = `Gambar berhasil ditempatkan ke dalam galeri ${targetContainer} dengan penataan proporsional.`;
    executeActionSchema(schema, userMessage, `Insert media to ${targetContainer}`);
    return { schema, userMessage };
  }, [authSession.isAuthenticated, executeActionSchema]);

  const deleteComponent = useCallback((id) => {
    if (!authSession.isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    const comp = components.find((c) => c.id === id);
    if (!comp) return;
    const schema = {
      action: 'DELETE_COMPONENT',
      target_container: comp.container,
      payload: {
        component_type: comp.component_type,
        id: comp.id,
      },
    };
    executeActionSchema(schema, `Komponen "${comp.props.label || comp.id}" telah dihapus.`);
  }, [authSession.isAuthenticated, components, executeActionSchema]);

  const resetToDefaults = useCallback(() => {
    if (!authSession.isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    createSnapshot('Reset ke konfigurasi bawaan');
    setComponents(INITIAL_COMPONENTS);
    const schema = {
      action: 'MODIFY_LAYOUT',
      target_container: 'all',
      payload: {
        component_type: 'container',
        id: 'reset-all',
        props: { label: 'Reset to Factory Layout Defaults' },
      },
    };
    setHistory((prev) => [
      {
        id: `act-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userMessage: 'Seluruh canvas telah dikembalikan ke susunan bawaan portal.',
        schema,
      },
      ...prev,
    ]);
  }, [authSession.isAuthenticated, createSnapshot]);

  const exportSchema = useCallback(() => {
    return JSON.stringify({ components, contentRegistry, exportedAt: new Date().toISOString() }, null, 2);
  }, [components, contentRegistry]);

  const importSchema = useCallback((jsonStr) => {
    if (!authSession.isAuthenticated) {
      setIsLoginModalOpen(true);
      return false;
    }
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.components)) {
        createSnapshot('Impor skema kustom');
        setComponents(parsed.components);
        if (Array.isArray(parsed.contentRegistry)) {
          setContentRegistry(parsed.contentRegistry);
        }
        return true;
      }
    } catch (e) {
      console.error('Import error:', e);
    }
    return false;
  }, [authSession.isAuthenticated, createSnapshot]);

  // Agent 2: Generator Naskah Dinas Resmi & Proposal
  const generateNaskahDinas = useCallback((type, params) => {
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const currentYear = new Date().getFullYear();
    const docNo = `B/${Math.floor(100 + Math.random() * 900)}/MENWA-UNJ/${new Date().getMonth() + 1}/${currentYear}`;

    if (type === 'DISPENSASI') {
      return `KOMANDO RESIMEN MAHASISWA JAYAKARTA
SATUAN UNIVERSITAS NEGERI JAKARTA
MARKAS KOMANDO: GEDUNG G R.107 KAMPUS A UNJ
Telepon/WA: +62 815-2582-3503 | Email: unjmenwa@gmail.com
================================================================================

Nomor       : ${docNo}
Klasifikasi : Biasa / Resmi
Lampiran    : 1 (satu) Berkas Jadwal Kegiatan
Perihal     : Permohonan Dispensasi Mengikuti Kegiatan Satuan

Kepada Yth.
Bapak/Ibu Dekan / Koordinator Program Studi
Universitas Negeri Jakarta
di Tempat.

Dengan hormat,
Sehubungan dengan akan diselenggarakannya agenda:
Nama Kegiatan : ${params.namaKegiatan || 'Latihan Pemantapan Komando & Ketangkasan'}
Waktu / Tgl   : ${params.tanggal || '05 s.d. 08 November 2026'}
Tempat        : ${params.lokasi || 'Daerah Latihan Satuan Menwa UNJ'}

Maka bersama ini kami memohonkan dispensasi kehadiran perkuliahan dan tugas akademik bagi anggota aktif Resimen Mahasiswa Satuan UNJ sebagai berikut:

Nama Lengkap  : ${params.namaAnggota || 'Eben Haezer Sitorus'}
NIM / Fakultas: ${params.nimFakultas || '1402621001 / FISH (Pendidikan Geografi)'}
Jabatan       : ${params.jabatan || 'Komandan Pasukan Pelaksana'}

Demikian surat permohonan ini kami sampaikan. Atas perhatian dan kerja sama Bapak/Ibu, kami haturkan terima kasih.

WIDYA CASTRENA DHARMA SIDDHA

Jakarta, ${today}
Komandan Satuan Menwa UNJ,


EBEN HAEZER SITORUS
NBP: 21010741490`;
    }

    if (type === 'IZIN_SARPRAS') {
      return `KOMANDO RESIMEN MAHASISWA JAYAKARTA
SATUAN UNIVERSITAS NEGERI JAKARTA
MARKAS KOMANDO: GEDUNG G R.107 KAMPUS A UNJ
================================================================================

Nomor       : ${docNo}
Lampiran    : 1 (satu) Lembar Rundown & Denah
Perihal     : Permohonan Izin Penggunaan Fasilitas Kampus

Kepada Yth.
Kepala Bagian Umum & Sarana Prasarana
Universitas Negeri Jakarta
di Tempat.

Dengan hormat,
Dalam rangka menunjang kelancaran penyelenggaraan kegiatan resmi Resimen Mahasiswa Satuan UNJ:

Nama Acara    : ${params.namaKegiatan || 'Youth Spark National Seminar & Ekshibisi Prestasi'}
Hari / Tanggal: ${params.tanggal || 'Sabtu, 24 Oktober 2026'}
Fasilitas     : ${params.fasilitas || 'Aula Latief Hendraningrat Gedung Dewi Sartika & Plaza Kampus A'}
Jumlah Peserta: ${params.jumlahPeserta || '± 350 Mahasiswa dan Pemuda Nasional'}

Bersama ini kami mengajukan permohonan izin penggunaan fasilitas sarana prasarana beserta perlengkapan pendukung di lokasi tersebut.

Jakarta, ${today}
a.n. Komandan Satuan Menwa UNJ,
Kepala Seksi Logistik & Markas`;
    }

    return `PROPOSAL SINGKAT KEGIATAN KEPRAJURITAN DAN PRESTASI
RESIMEN MAHASISWA SATUAN UNIVERSITAS NEGERI JAKARTA
================================================================================

I. JUDUL KEGIATAN
${params.namaKegiatan || 'Ksatria Cendekia VIII Tingkat Nasional'}

II. WAKTU DAN TEMPAT
Hari / Tanggal : ${params.tanggal || 'Kamis s.d. Minggu, 05–08 November 2026'}
Lokasi         : ${params.lokasi || 'Kampus A UNJ, GOR Otista, Batalyon Intai Tempur, dan Ragunan'}

III. ESTIMASI ANGGARAN BIAYA (RAB)
1. Kesekretariatan & Juknis    : Rp 3.500.000,-
2. Perlengkapan & Sarpras      : Rp 12.000.000,-
3. Jersey Atlet & Official     : Rp 18.500.000,-
4. Konsumsi & Akomodasi        : Rp 15.000.000,-
5. Hadiah & Trofi Juara Umum   : Rp 11.000.000,-
Total Estimasi                 : Rp 60.000.000,-

WIDYA CASTRENA DHARMA SIDDHA
Disahkan di Mako Satuan UNJ, ${today}`;
  }, []);

  // Agent 3: Press Release & Photo Caption Generator (5W+1H)
  const generatePressRelease = useCallback((params) => {
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const location = params.lokasi || 'Kampus A Universitas Negeri Jakarta';
    const eventName = params.namaKegiatan || 'Kegiatan Pembinaan Satuan Menwa UNJ';
    const officer = params.inspektur || 'Komandan Satuan Menwa UNJ Eben Haezer Sitorus';

    return `SIARAN PERS RESMI / PRESS RELEASE
KORPS RESIMEN MAHASISWA JAYAKARTA SATUAN UNJ
Nomor Rilis: PR/UNJ-MENWA/${new Date().getMonth() + 1}/${new Date().getFullYear()}

MEMPERKOKOH JIWA KORPS DAN DISIPLIN PRAJURIT: ${eventName.toUpperCase()}

JAKARTA (${today}) — Komando Resimen Mahasiswa Jayakarta Satuan Universitas Negeri Jakarta sukses menyelenggarakan ${eventName} yang bertempat di ${location}.

Dalam amanatnya, ${officer} menegaskan pentingnya memegang teguh semboyan Widya Castrena Dharma Siddha, yaitu menyempurnakan pengabdian dengan memadukan ilmu pengetahuan akademik dan keprajuritan bela negara.

#MenwaUNJ #WidyaCastrenaDharmaSiddha #BelaNegara #KsatriaCendekia #YouthSpark2026`;
  }, []);

  return (
    <CanvasContext.Provider
      value={{
        authSession,
        isLoginModalOpen,
        setIsLoginModalOpen,
        loginWithGoogle,
        loginWithPasscode,
        logout,
        components,
        contentRegistry,
        updateRegistryItem,
        uploadAndRegisterImage,
        softRemoveRegistryItem,
        pendingAIProposal,
        proposeNaturalLanguage,
        approveAIProposal,
        rejectAIProposal,
        snapshots,
        history,
        isDrawerOpen,
        setIsDrawerOpen,
        activeTab,
        setActiveTab,
        executeActionSchema,
        processNaturalLanguage,
        insertMediaDragAndDrop,
        deleteComponent,
        resetToDefaults,
        exportSchema,
        importSchema,
        createSnapshot,
        rollbackSnapshot,
        generateNaskahDinas,
        generatePressRelease,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvasStore() {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error('useCanvasStore must be used within a CanvasProvider');
  return ctx;
}
