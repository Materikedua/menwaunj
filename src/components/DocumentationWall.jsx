import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Search,
  MapPin,
  Users,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  X,
  Check,
  RotateCcw,
  Images,
  Send,
  Filter,
  ExternalLink,
  Disc,
  LayoutGrid,
  Maximize2,
  Shield,
  Award,
  BookOpen,
  HeartHandshake,
  Calendar,
} from 'lucide-react';
import {
  DEFAULT_DOCUMENTATION_DATA,
  PROKER_12_MONTHS,
  EXTRA_ACTIVITIES,
  useMenwaInteractiveData,
} from '../data/menwaInteractiveData.js';
import {
  subscribeToDocumentationPosts,
  syncDocumentationLikeFirestore,
  addDocumentationCommentFirestore,
} from '../firebase.js';
import { useCanvasStore } from '../lib/canvasStore.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

const AVAILABLE_YEARS = ['Semua Tahun', '2026', '2025'];

const DIAL_CATEGORIES = [
  { id: 'ALL', label: 'Semua Giat', short: 'Semua', icon: LayoutGrid },
  { id: 'LKBB', label: 'LKBB & Paskibra', short: 'Paskibra', icon: Award, match: ['geranat', 'paskibra', 'lkbb'] },
  { id: 'DIKLAT', label: 'Diklat & Militer', short: 'Diklat', icon: Shield, match: ['pembaretan', 'cakrawala', 'kds', 'provos', 'diklat', 'latgabnas', 'binjas', 'olahraga'] },
  { id: 'BAKSOS', label: 'Baksos & Rohani', short: 'Baksos', icon: HeartHandshake, match: ['buka-bersama', 'santunan', 'baksos', 'pengabdian', 'kemanusiaan'] },
  { id: 'SEMINAR', label: 'Seminar & Kompetisi', short: 'Seminar', icon: BookOpen, match: ['youth-spark', 'ksatria-cendekia', 'lempika', 'seminar', 'kompetisi'] },
  { id: 'PROTOKOLER', label: 'Protokoler & Komando', short: 'Protokoler', icon: Sparkles, match: ['sertijab', 'pcab', 'rakomsat', 'pam-wisuda', 'upacara', 'kunjungan'] },
];

export function parseCommentDate(comment) {
  if (!comment) return null;
  const raw = comment.createdAt || comment.timestamp || comment.time;
  if (!raw) {
    if (comment.id && typeof comment.id === 'string' && comment.id.startsWith('c-')) {
      const ms = parseInt(comment.id.replace('c-', ''), 10);
      if (!isNaN(ms) && ms > 1600000000000) return new Date(ms);
    }
    return null;
  }
  if (typeof raw?.toDate === 'function') return raw.toDate();
  if (typeof raw?.seconds === 'number') return new Date(raw.seconds * 1000);
  if (typeof raw === 'number') return new Date(raw > 1e11 ? raw : raw * 1000);
  if (typeof raw === 'string') {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d;
    const num = Number(raw);
    if (!isNaN(num) && num > 1600000000) return new Date(num > 1e11 ? num : num * 1000);
  }
  return null;
}

export function formatCommentTime(comment) {
  if (!comment) return '';
  const d = parseCommentDate(comment);
  if (!d) return comment.timeAgo || 'Baru saja';

  const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60 && diffSec >= 0) return `Baru saja (${timeStr})`;
  if (diffMin < 60 && diffMin >= 0) return `${diffMin} mnt lalu (${timeStr})`;
  if (diffHour < 24 && diffHour >= 0) return `${diffHour} jam lalu (${timeStr})`;
  if (diffDay === 1) return `Kemarin (${timeStr})`;
  if (diffDay < 7 && diffDay >= 0) return `${diffDay} hr lalu (${timeStr})`;

  const dateStr = d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `${dateStr}, ${timeStr}`;
}

export function cleanCaptionText(text) {
  if (!text) return '';
  return String(text)
    .replace(/#[\w\u0590-\u05ff]+/g, '')
    .replace(/@menwa\.unj\b/gi, '')
    .replace(/@menwaunj\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function DocumentationWall({ apiUrl = null, customData = null, onOpenAuth = null }) {
  const { data: rawPosts } = useMenwaInteractiveData(
    apiUrl,
    customData || DEFAULT_DOCUMENTATION_DATA
  );

  // Integrasi autentikasi pengguna untuk fitur komentar
  let authData = { user: null, profile: null };
  try {
    authData = useAuth() || { user: null, profile: null };
  } catch {
    authData = { user: null, profile: null };
  }
  const { user, profile } = authData;
  const isLoggedIn = Boolean(user);
  const currentAuthorName =
    profile?.displayName ||
    user?.displayName ||
    (user?.email ? user.email.split('@')[0] : 'Sivitas Terdaftar');

  // Integrasi Content Registry Command Center
  let contentRegistry = [];
  try {
    const store = useCanvasStore();
    contentRegistry = store?.contentRegistry || [];
  } catch {
    contentRegistry = [];
  }

  // Mode Tampilan: 'dial' (Radial Arc Wheel - Default) | 'grid' (Classic Grid)
  const [viewMode, setViewMode] = useState('dial');

  // Filter States
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState('ALL');
  const [selectedActivityId, setSelectedActivityId] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('Semua Tahun');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFeatured, setOnlyFeatured] = useState(false);

  // State Indeks Album Aktif pada Radial Arc Wheel & Slide Foto di Panel Dossier Kanan
  const [activeAlbumIndex, setActiveAlbumIndex] = useState(0);
  const [activeDossierSlide, setActiveDossierSlide] = useState(0);

  // Drag / Wheel Interaction State untuk Radial Dial
  const dialContainerRef = useRef(null);
  const dragStateRef = useRef({ active: false, startY: 0, accumulatedDelta: 0 });
  const wheelCooldownRef = useRef(0);

  // Dropdown Proker Lainnya
  const [extraDropdownOpen, setExtraDropdownOpen] = useState(false);
  const extraDropdownRef = useRef(null);

  // Interaksi Pengguna (Likes, Bookmarks, Comments)
  const [firestorePostMap, setFirestorePostMap] = useState({});
  const [likedPostIds, setLikedPostIds] = useState(() => {
    try {
      const saved = localStorage.getItem('menwa_doc_liked_ids');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState(() => {
    try {
      const saved = localStorage.getItem('menwa_doc_bookmarked_ids');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [localLikesDelta, setLocalLikesDelta] = useState(() => {
    try {
      const saved = localStorage.getItem('menwa_doc_likes_override');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [localCommentsMap, setLocalCommentsMap] = useState(() => {
    try {
      const saved = localStorage.getItem('menwa_doc_comments_override_v2');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [heartBurstPostId, setHeartBurstPostId] = useState(null);
  const [shareToast, setShareToast] = useState(null);

  // Lightbox Modal Fullscreen
  const [activeModalPostId, setActiveModalPostId] = useState(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [dossierCommentText, setDossierCommentText] = useState('');
  const commentInputRef = useRef(null);

  // Langganan Real-time Firestore
  useEffect(() => {
    const unsubscribe = subscribeToDocumentationPosts((liveMap) => {
      if (liveMap) {
        setFirestorePostMap(liveMap);
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Listener Event Filter Eksternal (dari MakoCommandCenter dsb.)
  useEffect(() => {
    const handleExternalFilter = (e) => {
      const prokerId = e.detail?.prokerId;
      if (prokerId) {
        setSelectedCategoryGroup('ALL');
        setSelectedActivityId(prokerId === 'gps-viii' ? 'geranat-viii' : prokerId);
        setSelectedYear('Semua Tahun');
        setOnlyFeatured(false);
        setActiveAlbumIndex(0);
      }
    };
    window.addEventListener('menwa:filter-documentation', handleExternalFilter);
    return () => window.removeEventListener('menwa:filter-documentation', handleExternalFilter);
  }, []);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (extraDropdownRef.current && !extraDropdownRef.current.contains(e.target)) {
        setExtraDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gabungkan data album dengan Content Registry & Firestore
  const posts = useMemo(() => {
    const list = Array.isArray(rawPosts) ? rawPosts : DEFAULT_DOCUMENTATION_DATA;
    const registryMap = new Map(
      (contentRegistry || [])
        .filter((item) => item && item.isActive !== false)
        .map((item) => [item.contentId, item])
    );
    const albumRegistryMap = new Map(
      (contentRegistry || [])
        .filter((item) => item && item.isActive !== false && item.albumId)
        .map((item) => [item.albumId, item])
    );

    const allowedYears = [2025, 2026, '2025', '2026'];
    const filteredList = list.filter((p) => !p.year || allowedYears.includes(p.year));

    return filteredList.map((post) => {
      const normalizedProkerId = post.prokerId === 'gps-viii' ? 'geranat-viii' : post.prokerId;
      const normalizedProkerName =
        post.prokerName === 'GPS VIII'
          ? 'GERANAT VIII'
          : post.prokerName === 'GPS VII'
          ? 'GERANAT VII'
          : post.prokerName;

      const regAlbum =
        albumRegistryMap.get(post.id) ||
        (post.contentId ? registryMap.get(post.contentId) : null);
      const fsDoc = firestorePostMap[post.id];

      let updatedPhotos = Array.isArray(post.photos) ? [...post.photos] : [];
      updatedPhotos = updatedPhotos.map((ph, idx) => {
        const slideReg = registryMap.get(`CNT-GALERI-${post.id}-SLIDE-${idx + 1}`);
        if (slideReg && slideReg.imageUrl) {
          return {
            ...ph,
            url: slideReg.imageUrl,
            caption: slideReg.caption || ph.caption,
          };
        }
        if (post.id === 'doc-youth-spark-2026') {
          const ysReg = registryMap.get(ph.contentId || `CNT-YS-DOK-${idx + 1}`);
          if (ysReg) {
            return {
              ...ph,
              url: ysReg.imageUrl || ph.url,
              caption: ysReg.caption || ph.caption,
            };
          }
        }
        return ph;
      });

      if (regAlbum && regAlbum.imageUrl && updatedPhotos.length > 0) {
        updatedPhotos[0] = {
          ...updatedPhotos[0],
          url: regAlbum.imageUrl,
          caption: regAlbum.caption || updatedPhotos[0].caption,
        };
      }

      const baseLikes =
        typeof regAlbum?.syncedLikes === 'number' ? regAlbum.syncedLikes : post.likes;
      const mergedLikes =
        typeof localLikesDelta[post.id] === 'number'
          ? localLikesDelta[post.id]
          : typeof fsDoc?.likes === 'number'
          ? fsDoc.likes
          : baseLikes;

      const mergedComments = Array.isArray(localCommentsMap[post.id])
        ? localCommentsMap[post.id]
        : Array.isArray(fsDoc?.comments)
        ? fsDoc.comments
        : [];

      return {
        ...post,
        prokerId: normalizedProkerId,
        prokerName: normalizedProkerName,
        caption: regAlbum?.caption || post.caption,
        socialPlatform: regAlbum?.socialPlatform || post.socialPlatform || 'instagram',
        socialUrl: regAlbum?.socialUrl || post.socialUrl || 'https://www.instagram.com/menwaunj/',
        photos: updatedPhotos,
        likes: mergedLikes,
        comments: mergedComments,
        isLiked: Boolean(likedPostIds[post.id]),
        isBookmarked: Boolean(bookmarkedPostIds[post.id]),
      };
    });
  }, [
    rawPosts,
    contentRegistry,
    firestorePostMap,
    localLikesDelta,
    localCommentsMap,
    likedPostIds,
    bookmarkedPostIds,
  ]);

  // Hasil penyaringan
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (selectedCategoryGroup !== 'ALL') {
        const catObj = DIAL_CATEGORIES.find((c) => c.id === selectedCategoryGroup);
        if (catObj && catObj.match) {
          const hay = `${post.prokerId} ${post.prokerName} ${post.category}`.toLowerCase();
          if (!catObj.match.some((kw) => hay.includes(kw))) return false;
        }
      }
      if (selectedActivityId !== 'ALL' && post.prokerId !== selectedActivityId) {
        return false;
      }
      if (selectedYear !== 'Semua Tahun' && String(post.year) !== selectedYear) {
        return false;
      }
      if (onlyFeatured && !post.isFeatured) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const haystack = `${post.prokerName} ${post.caption} ${post.location} ${post.year} ${post.category}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [posts, selectedCategoryGroup, selectedActivityId, selectedYear, onlyFeatured, searchQuery]);

  // Pastikan activeAlbumIndex selalu valid saat filter berubah
  useEffect(() => {
    if (activeAlbumIndex >= filteredPosts.length) {
      setActiveAlbumIndex(0);
    }
    setActiveDossierSlide(0);
  }, [filteredPosts.length, selectedCategoryGroup, selectedActivityId, selectedYear]);

  // Deep-Linking dari URL Query (?album=..., ?post=..., atau ?proker=...) agar Radial Arc otomatis berputar ke album tujuan
  useEffect(() => {
    if (typeof window === 'undefined' || filteredPosts.length === 0) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const targetKey = (
        params.get('album') ||
        params.get('post') ||
        params.get('proker') ||
        ''
      )
        .trim()
        .toLowerCase();
      if (!targetKey) return;

      const foundIdx = filteredPosts.findIndex(
        (p) =>
          String(p.id || '').toLowerCase() === targetKey ||
          String(p.prokerId || '').toLowerCase() === targetKey ||
          String(p.prokerName || '').toLowerCase().includes(targetKey)
      );
      if (foundIdx >= 0) {
        setActiveAlbumIndex(foundIdx);
        setActiveDossierSlide(0);
      }
    } catch {
      /* ignore */
    }
  }, [filteredPosts]);

  const activeAlbum = filteredPosts[activeAlbumIndex] || filteredPosts[0] || null;

  // Navigasi Putar Roda Dial
  const stepDial = useCallback(
    (delta) => {
      if (filteredPosts.length <= 1) return;
      setActiveAlbumIndex((prev) => {
        const next = Math.max(0, Math.min(filteredPosts.length - 1, prev + delta));
        if (next !== prev) {
          setActiveDossierSlide(0);
        }
        return next;
      });
    },
    [filteredPosts.length]
  );

  // Pasang non-passive wheel listener pada kontainer Dial Kiri agar putaran mouse wheel memutar busur tanpa men-scroll halaman
  useEffect(() => {
    const el = dialContainerRef.current;
    if (!el || viewMode !== 'dial') return undefined;

    const onWheel = (e) => {
      if (filteredPosts.length <= 1) return;
      e.preventDefault();
      const now = Date.now();
      if (now - wheelCooldownRef.current < 90) return;
      if (Math.abs(e.deltaY) > 8) {
        wheelCooldownRef.current = now;
        stepDial(e.deltaY > 0 ? 1 : -1);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [viewMode, filteredPosts.length, stepDial]);

  // Keyboard navigation (Panah Atas / Bawah untuk memutar Dial)
  useEffect(() => {
    if (viewMode !== 'dial' || activeModalPostId) return undefined;
    const onKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        stepDial(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        stepDial(-1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [viewMode, activeModalPostId, stepDial]);

  // Drag / Swipe Gesture Vertikal pada Roda Dial
  const handleDialPointerDown = (e) => {
    dragStateRef.current = {
      active: true,
      startY: e.clientY,
      accumulatedDelta: 0,
    };
  };

  const handleDialPointerMove = (e) => {
    if (!dragStateRef.current.active) return;
    const dy = e.clientY - dragStateRef.current.startY;
    if (Math.abs(dy) >= 42) {
      stepDial(dy < 0 ? 1 : -1);
      dragStateRef.current.startY = e.clientY;
    }
  };

  const handleDialPointerUp = () => {
    dragStateRef.current.active = false;
  };

  const activeModalPost = useMemo(
    () => posts.find((p) => p.id === activeModalPostId) || null,
    [posts, activeModalPostId]
  );

  // Kunci scroll saat Lightbox Modal terbuka
  useEffect(() => {
    if (!activeModalPost) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModalPostId(null);
      } else if (e.key === 'ArrowRight') {
        setActiveSlideIndex((prev) => (prev + 1) % (activeModalPost.photos?.length || 1));
      } else if (e.key === 'ArrowLeft') {
        const len = activeModalPost.photos?.length || 1;
        setActiveSlideIndex((prev) => (prev - 1 + len) % len);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeModalPost]);

  // Handler Like
  const handleToggleLike = useCallback(
    async (post, forceLike = false) => {
      if (!post) return;
      const currentlyLiked = Boolean(likedPostIds[post.id]);
      if (forceLike && currentlyLiked) {
        setHeartBurstPostId(post.id);
        setTimeout(() => setHeartBurstPostId(null), 850);
        return;
      }
      const nextLiked = forceLike ? true : !currentlyLiked;
      const nextLikesCount = Math.max(0, (post.likes || 0) + (nextLiked ? 1 : -1));

      const updatedLikedMap = { ...likedPostIds, [post.id]: nextLiked };
      setLikedPostIds(updatedLikedMap);
      try {
        localStorage.setItem('menwa_doc_liked_ids', JSON.stringify(updatedLikedMap));
      } catch {
        /* ignore */
      }

      const updatedLikesOverride = {
        ...localLikesDelta,
        [post.id]: nextLikesCount,
      };
      setLocalLikesDelta(updatedLikesOverride);
      try {
        localStorage.setItem('menwa_doc_likes_override', JSON.stringify(updatedLikesOverride));
      } catch {
        /* ignore */
      }

      if (nextLiked) {
        setHeartBurstPostId(post.id);
        setTimeout(() => setHeartBurstPostId(null), 850);
      }
      await syncDocumentationLikeFirestore(post.id, nextLikesCount);
    },
    [likedPostIds, localLikesDelta]
  );

  // Handler Bookmark
  const handleToggleBookmark = useCallback(
    (postId) => {
      const nextMap = {
        ...bookmarkedPostIds,
        [postId]: !bookmarkedPostIds[postId],
      };
      setBookmarkedPostIds(nextMap);
      try {
        localStorage.setItem('menwa_doc_bookmarked_ids', JSON.stringify(nextMap));
      } catch {
        /* ignore */
      }
    },
    [bookmarkedPostIds]
  );

  // Handler Share
  const handleSharePost = useCallback(async (post) => {
    if (!post) return;
    const shareUrl = `${window.location.origin}/gallery?album=${post.id}`;
    const shareTitle = `${post.prokerName} (${post.year}) — Menwa Satuan UNJ`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: cleanCaptionText(post.caption),
          url: shareUrl,
        });
        return;
      }
    } catch {
      /* fallback ke clipboard */
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      /* ignore */
    }
    setShareToast(`Tautan dokumentasi "${post.prokerName}" berhasil disalin!`);
    setTimeout(() => setShareToast(null), 3200);
  }, []);

  // Buka Lightbox
  const openLightbox = useCallback((post, slideIdx = 0, focusComments = false) => {
    setActiveModalPostId(post.id);
    setActiveSlideIndex(slideIdx);
    if (focusComments) {
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 200);
    }
  }, []);

  // Kirim Komentar (dari Dossier Panel maupun Lightbox Modal)
  const submitPostComment = useCallback(
    async (targetPost, rawText, clearInputCallback) => {
      if (!targetPost || !rawText.trim()) return;
      const authorLabel = currentAuthorName.trim() || profile?.institution || 'Sivitas Terdaftar';
      const newComment = {
        id: `c-${Date.now()}`,
        author: authorLabel,
        role: profile?.role || 'Sivitas UNJ',
        text: rawText.trim(),
        createdAt: new Date().toISOString(),
        timeAgo: 'Baru saja',
      };
      const existing = targetPost.comments || [];
      const nextList = [...existing, newComment];
      const nextLocalComments = {
        ...localCommentsMap,
        [targetPost.id]: nextList,
      };
      setLocalCommentsMap(nextLocalComments);
      try {
        localStorage.setItem('menwa_doc_comments_override_v2', JSON.stringify(nextLocalComments));
      } catch {
        /* ignore */
      }
      clearInputCallback('');
      await addDocumentationCommentFirestore(targetPost.id, newComment, existing);
    },
    [currentAuthorName, profile, localCommentsMap]
  );

  const handleResetFilters = useCallback(() => {
    setSelectedCategoryGroup('ALL');
    setSelectedActivityId('ALL');
    setSelectedYear('Semua Tahun');
    setSearchQuery('');
    setOnlyFeatured(false);
    setExtraDropdownOpen(false);
    setActiveAlbumIndex(0);
  }, []);

  const isFiltered =
    selectedCategoryGroup !== 'ALL' ||
    selectedActivityId !== 'ALL' ||
    selectedYear !== 'Semua Tahun' ||
    Boolean(searchQuery.trim()) ||
    onlyFeatured;

  return (
    <section
      id="dinding-dokumentasi"
      aria-labelledby="dinding-dokumentasi-title"
      className="relative overflow-hidden bg-[#F5F8F6] py-4 sm:py-6 text-[#092D32]"
    >
      {/* Toast Notifikasi Salin Tautan */}
      {shareToast && (
        <div className="fixed bottom-8 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-[#059669] bg-[#092D32] px-4 py-3 text-xs font-extrabold text-white shadow-2xl">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-[#059669] text-white">
            <Check size={13} />
          </span>
          <span>{shareToast}</span>
        </div>
      )}

      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8">
        {/* ====================================================================
            TOP CONTROL & VIEW SWITCHER BAR (Compact 1-Row 3D Neumorphic)
            ==================================================================== */}
        <div className="relative z-30 mb-4 rounded-3xl neu-card px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Kiri: View Mode Switcher (Radial Dial vs Classic Grid) + Filter Kategori Cepat */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-2xl neu-inset p-1">
              <button
                type="button"
                onClick={() => setViewMode('dial')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black transition cursor-pointer whitespace-nowrap ${
                  viewMode === 'dial'
                    ? 'neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <Disc size={14} />
                <span>Radial Arc Dial</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black transition cursor-pointer whitespace-nowrap ${
                  viewMode === 'grid'
                    ? 'neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <LayoutGrid size={14} />
                <span>Grid Klasik</span>
              </button>
            </div>

            <div className="hidden xl:flex items-center gap-1.5 pl-2 border-l border-slate-200/80">
              {DIAL_CATEGORIES.map((cat) => {
                const active = selectedCategoryGroup === cat.id && selectedActivityId === 'ALL';
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryGroup(cat.id);
                      setSelectedActivityId('ALL');
                      setActiveAlbumIndex(0);
                    }}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      active
                        ? 'neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white shadow-xs'
                        : 'neu-btn bg-white hover:bg-slate-50 text-slate-700 hover:text-[#006569] border border-slate-200/80'
                    }`}
                  >
                    {cat.short}
                  </button>
                );
              })}
            </div>

            {/* Dropdown Pilih Proker Spesifik */}
            <div className="relative" ref={extraDropdownRef}>
              <button
                type="button"
                onClick={() => setExtraDropdownOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  selectedActivityId !== 'ALL'
                    ? 'neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white shadow-xs'
                    : 'neu-btn bg-white hover:bg-slate-50 text-[#092D32] border border-slate-200/80'
                }`}
              >
                <span>
                  {selectedActivityId !== 'ALL'
                    ? PROKER_12_MONTHS.find((p) => p.id === selectedActivityId)?.shortName ||
                      EXTRA_ACTIVITIES.find((e) => e.id === selectedActivityId)?.shortName ||
                      'Proker Aktif'
                    : 'Pilih Proker'}
                </span>
                <ChevronDown size={13} className={`transition-transform ${extraDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {extraDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl neu-card p-2.5 z-50">
                  <div className="max-h-60 space-y-1 overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedActivityId('ALL');
                        setExtraDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-left text-xs font-bold ${
                        selectedActivityId === 'ALL'
                          ? 'bg-[#006569] text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>Semua Program Kerja</span>
                    </button>
                    {PROKER_12_MONTHS.map((proker) => (
                      <button
                        key={proker.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryGroup('ALL');
                          setSelectedActivityId(proker.id);
                          setExtraDropdownOpen(false);
                          setActiveAlbumIndex(0);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-left text-xs font-bold transition ${
                          selectedActivityId === proker.id
                            ? 'bg-[#006569] text-white'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{proker.name}</span>
                        <span className="text-[10px] font-mono opacity-75">{proker.monthCode}</span>
                      </button>
                    ))}
                    {EXTRA_ACTIVITIES.map((act) => (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryGroup('ALL');
                          setSelectedActivityId(act.id);
                          setExtraDropdownOpen(false);
                          setActiveAlbumIndex(0);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-left text-xs font-bold transition ${
                          selectedActivityId === act.id
                            ? 'bg-[#006569] text-white'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{act.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Kanan: Pencarian, Tahun, & Reset */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex w-44 sm:w-52 items-center gap-2 rounded-2xl neu-inset px-3 py-2">
              <Search size={13} className="text-[#006569] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveAlbumIndex(0);
                }}
                style={{ color: '#020617' }}
                placeholder="Cari giat / lokasi..."
                className="w-full bg-transparent text-xs font-bold text-slate-950 placeholder:text-slate-400 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="neu-inset rounded-2xl px-3 py-1.5">
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setActiveAlbumIndex(0);
                }}
                style={{ color: '#020617' }}
                className="bg-transparent text-xs font-bold text-slate-950 outline-none cursor-pointer"
              >
                {AVAILABLE_YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 rounded-2xl neu-btn px-3 py-2 text-xs font-extrabold text-[#E11D48] cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* ====================================================================
            EMPTY STATE JIKA FILTER TIDAK MENEMUKAN ALBUM
            ==================================================================== */}
        {filteredPosts.length === 0 ? (
          <div className="mx-auto my-8 max-w-lg rounded-3xl neu-card p-10 text-center">
            <Filter size={38} className="mx-auto text-[#006569]" />
            <h3 className="mt-4 text-xl font-black text-[#092D32]">Belum Ada Album yang Cocok</h3>
            <p className="mt-2 text-xs sm:text-sm text-[#64748B]">
              Tidak ditemukan dokumentasi untuk kombinasi filter kegiatan dan tahun yang dipilih.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#FFDD00] hover:text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <RotateCcw size={14} /> Reset Semua Filter
            </button>
          </div>
        ) : viewMode === 'dial' ? (
          /* ====================================================================
             MODE 1: RADIAL ARC WHEEL GALLERY ("LOSFERA DIAL VIEW")
             Pas 1 Layar Laptop (lg:h-[80vh] lg:max-h-[660px]) tanpa window scrolling!
             ==================================================================== */
          <div className="space-y-4">
            {/* MOBILE (< 1024px): Horizontal Snap Reel Carousel */}
            <div className="lg:hidden space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-[#006569]">
                  Geser Reel Album ({activeAlbumIndex + 1} / {filteredPosts.length})
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepDial(-1)}
                    disabled={activeAlbumIndex === 0}
                    className="p-2 rounded-xl neu-btn text-slate-700 disabled:opacity-40"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => stepDial(1)}
                    disabled={activeAlbumIndex === filteredPosts.length - 1}
                    className="p-2 rounded-xl neu-btn text-slate-700 disabled:opacity-40"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar">
                {filteredPosts.map((post, idx) => {
                  const isCurrent = idx === activeAlbumIndex;
                  const coverUrl = post.photos?.[0]?.url || '/foto-kampus-unj.jpg';
                  return (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => {
                        setActiveAlbumIndex(idx);
                        setActiveDossierSlide(0);
                      }}
                      className={`snap-center shrink-0 w-44 rounded-2xl overflow-hidden border-2 text-left transition-all ${
                        isCurrent
                          ? 'border-[#006569] bg-[#092D32] text-white shadow-lg scale-[1.02]'
                          : 'border-white/80 bg-white text-slate-800 opacity-85 shadow-sm'
                      }`}
                    >
                      <div className="aspect-[16/10] w-full overflow-hidden bg-slate-900 relative">
                        <img src={coverUrl} alt={post.prokerName} className="w-full h-full object-cover" />
                        <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[#FFDD00] font-mono text-[9px] font-bold">
                          {post.monthCode} {post.year}
                        </span>
                      </div>
                      <div className="p-2.5">
                        <div className="font-black text-xs truncate">{post.prokerName}</div>
                        <div className={`text-[10px] truncate mt-0.5 ${isCurrent ? 'text-teal-200' : 'text-slate-500'}`}>
                          {post.location}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DESKTOP (>= 1024px) DUAL-ARC & DOSSIER SPLIT LAYOUT — LOCKED TO 1 LAPTOP SCREEN (lg:h-[80vh] lg:max-h-[660px]) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch lg:h-[80vh] lg:min-h-[550px] lg:max-h-[660px]">
              {/* ==============================================================
                  SISI KIRI (45% / 5 Kolom): CONCENTRIC RADIAL ARC WHEEL DIAL
                  ============================================================== */}
              <div
                ref={dialContainerRef}
                onPointerDown={handleDialPointerDown}
                onPointerMove={handleDialPointerMove}
                onPointerUp={handleDialPointerUp}
                onPointerCancel={handleDialPointerUp}
                className="hidden lg:flex lg:col-span-5 relative rounded-[2.5rem] bg-gradient-to-br from-[#061E22] via-[#092D32] to-[#003B3E] border-2 border-[#006569]/60 shadow-[0_25px_60px_-15px_rgba(9,45,50,0.45)] overflow-hidden select-none cursor-grab active:cursor-grabbing"
              >
                {/* Latar Glow & Grid Kinetik Halus */}
                <div className="pointer-events-none absolute -left-32 top-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-[#006569]/30 blur-3xl" />

                {/* SVG Concentric Arc Tracks (Pusat di X = -105, Y = 50%) */}
                <svg
                  className="pointer-events-none absolute inset-0 w-full h-full"
                  viewBox="0 0 540 660"
                  preserveAspectRatio="xMinYMid slice"
                >
                  <defs>
                    <linearGradient id="losferaArcGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#006569" stopOpacity="0.05" />
                      <stop offset="50%" stopColor="#FFDD00" stopOpacity="0.65" />
                      <stop offset="100%" stopColor="#006569" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  {/* Busur Dalam: Indikator Kategori */}
                  <circle
                    cx="-105"
                    cy="330"
                    r="210"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1.5"
                    strokeDasharray="4 6"
                  />
                  {/* Busur Utama: Jalur Filmstrip Foto (R = 335) */}
                  <circle
                    cx="-105"
                    cy="330"
                    r="335"
                    fill="none"
                    stroke="url(#losferaArcGrad)"
                    strokeWidth="2"
                  />
                  {/* Busur Luar: Orbit Reticle (R = 450) */}
                  <circle
                    cx="-105"
                    cy="330"
                    r="450"
                    fill="none"
                    stroke="rgba(0, 101, 105, 0.4)"
                    strokeWidth="1"
                  />
                  {/* Garis Bidik Horizontal 0 Derajat (Active Reticle Line) */}
                  <line
                    x1="60"
                    y1="330"
                    x2="215"
                    y2="330"
                    stroke="#FFDD00"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    strokeOpacity="0.7"
                  />
                </svg>

                {/* ARC LAPISAN 1 (Sisi Kiri Dalam): Vertical Curved Category Selector */}
                <div className="relative z-20 flex flex-col justify-center gap-2 pl-4 pr-2 py-6 border-r border-white/10 bg-black/20 backdrop-blur-md w-[108px] shrink-0">
                  <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#FFDD00]/80 px-1 mb-1">
                    SEKTOR GIAT
                  </div>
                  {DIAL_CATEGORIES.map((cat) => {
                    const IconComp = cat.icon;
                    const isActive = selectedCategoryGroup === cat.id && selectedActivityId === 'ALL';
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategoryGroup(cat.id);
                          setSelectedActivityId('ALL');
                          setActiveAlbumIndex(0);
                        }}
                        className={`group flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[11px] font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#FFDD00] text-[#092D32] font-black shadow-[0_0_20px_rgba(255,221,0,0.4)]'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <IconComp size={14} className="shrink-0" />
                        <span className="truncate">{cat.short}</span>
                      </button>
                    );
                  })}
                </div>

                {/* ARC LAPISAN 2 (Jalur Filmstrip Foto Trigonometri: X0 = -105px, Y0 = 50%, R = 335px) */}
                <div className="relative flex-1 h-full overflow-hidden">
                  {/* Header Status Dial */}
                  <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between text-[11px] font-mono text-teal-200/90">
                    <span>DIAL WHEEL · {activeAlbumIndex + 1}/{filteredPosts.length}</span>
                    <span className="text-[#FFDD00]">SCROLL / DRAG ↕</span>
                  </div>

                  {/* Center Reticle Indicator (0 Degree Pointer) */}
                  <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFDD00] shadow-[0_0_12px_#FFDD00]" />
                    <div className="w-5 h-[2px] bg-[#FFDD00]" />
                    <span className="text-[10px] font-mono font-black text-[#FFDD00] bg-[#092D32]/90 border border-[#FFDD00]/50 px-1.5 py-0.5 rounded">
                      0° AKTIF
                    </span>
                  </div>

                  {/* Origin Point Lingkaran Imajiner: X0 = -105px dari batas area busur, Y0 = 50% */}
                  <div
                    className="absolute top-1/2"
                    style={{ left: '-105px', width: 0, height: 0 }}
                  >
                    {filteredPosts.map((post, idx) => {
                      const offset = idx - activeAlbumIndex;
                      // Batasi render pada rentang -3 s.d +3 agar tetap dalam [-45 deg, +45 deg] dan muat 1 layar
                      if (Math.abs(offset) > 3) return null;

                      const angle = offset * 14.5; // Rentang -43.5 deg s.d +43.5 deg
                      const radius = 335; // Jari-jari busur dalam px
                      const isActive = offset === 0;
                      const coverPhoto = post.photos?.[0]?.url || '/foto-kampus-unj.jpg';
                      const distanceFactor = Math.abs(offset);
                      const scale = isActive ? 1.04 : Math.max(0.76, 1 - distanceFactor * 0.09);
                      const opacity = isActive ? 1 : Math.max(0.32, 1 - distanceFactor * 0.24);

                      return (
                        <div
                          key={post.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveAlbumIndex(idx);
                            setActiveDossierSlide(0);
                          }}
                          style={{
                            transform: `translate(-50%, -50%) rotate(${angle}deg) translate(${radius}px) rotate(${-angle * 0.65}deg) scale(${scale})`,
                            opacity,
                            zIndex: 30 - distanceFactor * 5,
                            transition: 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 320ms ease',
                          }}
                          className={`absolute left-0 top-0 w-[250px] rounded-2xl p-2.5 cursor-pointer flex items-center gap-3 border backdrop-blur-md ${
                            isActive
                              ? 'bg-white text-[#092D32] border-[#FFDD00] shadow-[0_0_30px_rgba(0,101,105,0.85)] ring-2 ring-[#FFDD00]/70'
                              : 'bg-[#092D32]/85 text-white border-white/15 hover:border-[#FFDD00]/50'
                          }`}
                        >
                          <div className="w-16 h-14 rounded-xl overflow-hidden bg-slate-900 shrink-0 relative border border-black/10">
                            <img
                              src={coverPhoto}
                              alt={post.prokerName}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/75 text-[#FFDD00] font-mono text-[8px] font-bold">
                              {post.photos?.length || 1}P
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1 font-mono text-[10px]">
                              <span className={isActive ? 'font-black text-[#006569]' : 'text-[#FFDD00]'}>
                                {post.monthCode} {post.year}
                              </span>
                              <span className="opacity-60">#{String(idx + 1).padStart(2, '0')}</span>
                            </div>
                            <h4
                              className={`text-xs font-black truncate mt-0.5 ${
                                isActive ? 'text-[#092D32]' : 'text-white'
                              }`}
                            >
                              {post.prokerName}
                            </h4>
                            <p
                              className={`text-[10px] truncate ${
                                isActive ? 'text-slate-500 font-semibold' : 'text-slate-300/80'
                              }`}
                            >
                              {post.dateLabel || post.location}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Kontrol Putar Atas / Bawah di Pojok Kanan Bawah Dial */}
                  <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        stepDial(-1);
                      }}
                      disabled={activeAlbumIndex === 0}
                      aria-label="Album Sebelumnya"
                      className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#FFDD00] text-white hover:text-[#092D32] border border-white/20 flex items-center justify-center transition disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        stepDial(1);
                      }}
                      disabled={activeAlbumIndex === filteredPosts.length - 1}
                      aria-label="Album Berikutnya"
                      className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#FFDD00] text-white hover:text-[#092D32] border border-white/20 flex items-center justify-center transition disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* ==============================================================
                  SISI KANAN (55% / 7 Kolom): DOSSIER & SHOWCASE ALBUM AKTIF (3D NEUMORPHIC)
                  ============================================================== */}
              {activeAlbum && (
                <div className="lg:col-span-7 rounded-[2.5rem] neu-card p-4 sm:p-6 flex flex-col justify-between overflow-y-auto">
                  <div className="space-y-4">
                    {/* 1. Header Dossier: Judul Program Kerja Resmi (#006569), Tanggal, Lokasi, Jumlah Foto */}
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/70 pb-3.5">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-semibold">
                          <span className="font-mono font-bold text-[#006569]">
                            {activeAlbum.monthCode} {activeAlbum.year}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{activeAlbum.dateLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <MapPin size={12} className="text-[#006569]" />
                            {activeAlbum.location}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono font-bold text-[#092D32]">
                            {activeAlbum.photos?.length || 1} Foto
                          </span>
                        </div>
                        <h2
                          id="dinding-dokumentasi-title"
                          className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-[#006569]"
                        >
                          {activeAlbum.prokerName}
                        </h2>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openLightbox(activeAlbum, activeDossierSlide, false)}
                          className="inline-flex items-center gap-1.5 rounded-2xl neu-btn text-[#092D32] hover:text-[#006569] px-3.5 py-2 text-xs font-extrabold transition cursor-pointer"
                        >
                          <Maximize2 size={13} className="text-[#006569]" />
                          <span>Layar Penuh</span>
                        </button>
                      </div>
                    </div>

                    {/* 2. Pratinjau Multi-Foto (Hero Carousel Bersih & Luas tanpa thumbnail strip) */}
                    <div className="w-full">
                      <div
                        onDoubleClick={() => handleToggleLike(activeAlbum, true)}
                        className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-950 group select-none shadow-lg neu-flat-sm"
                      >
                        <img
                          src={
                            activeAlbum.photos?.[activeDossierSlide]?.url ||
                            activeAlbum.photos?.[0]?.url ||
                            '/foto-kampus-unj.jpg'
                          }
                          alt={
                            activeAlbum.photos?.[activeDossierSlide]?.caption ||
                            activeAlbum.prokerName
                          }
                          className="w-full h-full object-cover transition duration-500"
                        />

                        {/* Navigasi Slide Sebelumnya / Berikutnya */}
                        {(activeAlbum.photos?.length || 0) > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                const len = activeAlbum.photos.length;
                                setActiveDossierSlide((prev) => (prev - 1 + len) % len);
                              }}
                              aria-label="Slide Foto Sebelumnya"
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-[#FFDD00] text-white hover:text-[#092D32] flex items-center justify-center transition cursor-pointer tactile-btn shadow-md z-10"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const len = activeAlbum.photos.length;
                                setActiveDossierSlide((prev) => (prev + 1) % len);
                              }}
                              aria-label="Slide Foto Berikutnya"
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-[#FFDD00] text-white hover:text-[#092D32] flex items-center justify-center transition cursor-pointer tactile-btn shadow-md z-10"
                            >
                              <ChevronRight size={20} />
                            </button>

                            {/* Indicator Dots Carousel */}
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md z-10">
                              {(activeAlbum.photos || []).map((_, dotIdx) => (
                                <button
                                  key={dotIdx}
                                  type="button"
                                  onClick={() => setActiveDossierSlide(dotIdx)}
                                  aria-label={`Beralih ke foto ${dotIdx + 1}`}
                                  className={`h-2 rounded-full transition-all cursor-pointer ${
                                    dotIdx === activeDossierSlide
                                      ? 'w-6 bg-[#FFDD00]'
                                      : 'w-2 bg-white/50 hover:bg-white/80'
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}

                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 sm:p-4 text-white flex items-end justify-between gap-2 z-10">
                          <p className="text-xs font-medium leading-snug line-clamp-1 max-w-[70%]">
                            {activeAlbum.photos?.[activeDossierSlide]?.caption || activeAlbum.prokerName}
                          </p>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => openLightbox(activeAlbum, activeDossierSlide, false)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-black/60 hover:bg-[#FFDD00] text-white hover:text-[#092D32] px-2.5 py-1.5 text-xs font-bold transition cursor-pointer tactile-btn shadow-sm"
                              title="Perbesar foto ke layar penuh"
                            >
                              <Maximize2 size={13} />
                              <span>Zoom</span>
                            </button>
                            <span className="font-mono text-xs font-bold text-[#FFDD00] px-2 py-1 rounded-lg bg-black/60">
                              {activeDossierSlide + 1} / {activeAlbum.photos?.length || 1}
                            </span>
                          </div>
                        </div>

                        {heartBurstPostId === activeAlbum.id && (
                          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/20 z-20">
                            <Heart size={76} className="animate-ping fill-[#E11D48] text-[#E11D48]" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 3. Narasi & Laporan Giat (Bersih dari #hashtag dan @menwa.unj via cleanCaptionText) */}
                    <div className="rounded-2xl neu-inset p-3.5 space-y-1.5">
                      <p className="text-xs sm:text-sm font-medium leading-relaxed text-[#092D32]">
                        {cleanCaptionText(activeAlbum.caption)}
                      </p>
                      {activeAlbum.narrativeReport && (
                        <p className="text-xs leading-relaxed text-slate-600 pt-1 border-t border-slate-200/70">
                          {cleanCaptionText(activeAlbum.narrativeReport)}
                        </p>
                      )}
                    </div>

                    {/* Daftar Komentar Real-Time Ringkas dengan formatCommentTime */}
                    {(activeAlbum.comments || []).length > 0 && (
                      <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                        {activeAlbum.comments.slice(-2).map((c) => (
                          <div
                            key={c.id}
                            className="rounded-xl bg-white/80 border border-slate-200/70 px-3 py-1.5 text-[11px] flex items-center justify-between gap-2"
                          >
                            <p className="truncate text-slate-700">
                              <strong className="font-black text-[#092D32] mr-1.5">
                                @{c.author}
                              </strong>
                              {c.text}
                            </p>
                            <span className="font-mono text-[10px] text-slate-400 shrink-0">
                              {formatCommentTime(c)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 4. Bar Apresiasi (Like Angka Bersih) & Komentar Sinkron Firestore */}
                  <div className="mt-4 pt-3.5 border-t border-slate-200/70 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-5 flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleToggleLike(activeAlbum, false)}
                        aria-label="Sukai dokumentasi"
                        className="inline-flex items-center gap-1.5 rounded-2xl neu-btn px-3.5 py-2 text-xs font-black text-[#092D32] cursor-pointer"
                      >
                        <Heart
                          size={18}
                          className={
                            activeAlbum.isLiked
                              ? 'fill-[#E11D48] text-[#E11D48]'
                              : 'text-[#092D32] hover:text-[#E11D48]'
                          }
                        />
                        <span className="font-mono tabular-nums text-sm">{activeAlbum.likes}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openLightbox(activeAlbum, activeDossierSlide, true)}
                        className="inline-flex items-center gap-1.5 rounded-2xl neu-btn px-3.5 py-2 text-xs font-black text-[#092D32] cursor-pointer"
                      >
                        <MessageCircle size={18} className="text-[#006569]" />
                        <span className="font-mono tabular-nums text-sm">
                          {activeAlbum.comments?.length || 0}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSharePost(activeAlbum)}
                        aria-label="Bagikan dokumentasi"
                        className="p-2.5 rounded-2xl neu-btn text-[#092D32] cursor-pointer"
                      >
                        <Share2 size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleBookmark(activeAlbum.id)}
                        aria-label="Simpan dokumentasi"
                        className="p-2.5 rounded-2xl neu-btn text-[#092D32] cursor-pointer"
                      >
                        <Bookmark
                          size={17}
                          className={
                            activeAlbum.isBookmarked
                              ? 'fill-[#006569] text-[#006569]'
                              : 'text-[#092D32]'
                          }
                        />
                      </button>
                    </div>

                    {/* Kolom Komentar Cepat / Daftar Komentar Terkini */}
                    <div className="md:col-span-7">
                      {isLoggedIn ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            submitPostComment(
                              activeAlbum,
                              dossierCommentText,
                              setDossierCommentText
                            );
                          }}
                          className="flex items-center gap-2"
                        >
                          <div className="flex-1 neu-inset rounded-2xl px-3.5 py-2">
                            <input
                              type="text"
                              value={dossierCommentText}
                              onChange={(e) => setDossierCommentText(e.target.value)}
                              style={{ color: '#020617' }}
                              placeholder={`Komentar sebagai @${currentAuthorName}...`}
                              className="w-full bg-transparent text-xs font-bold text-slate-950 placeholder:text-slate-400 outline-none"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={!dossierCommentText.trim()}
                            className="inline-flex items-center gap-1.5 rounded-2xl neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] px-4 py-2.5 text-xs font-black text-[#FFDD00] hover:text-white shadow-sm transition-all cursor-pointer disabled:opacity-40"
                          >
                            <Send size={14} />
                            <span>Kirim</span>
                          </button>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between gap-2 rounded-2xl neu-inset px-3.5 py-2 text-xs">
                          <span className="text-slate-600 font-semibold truncate">
                            {(activeAlbum.comments || []).length > 0
                              ? `@${activeAlbum.comments[activeAlbum.comments.length - 1].author}: "${
                                  activeAlbum.comments[activeAlbum.comments.length - 1].text
                                }"`
                              : 'Masuk akun untuk menulis komentar apresiasi.'}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            {onOpenAuth && (
                              <button
                                type="button"
                                onClick={onOpenAuth}
                                className="rounded-xl neu-btn-primary px-3 py-1.5 text-[11px] font-black text-[#FFDD00] transition cursor-pointer"
                              >
                                Login Akun
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => openLightbox(activeAlbum, activeDossierSlide, true)}
                              className="font-black text-[#006569] hover:underline cursor-pointer"
                            >
                              Diskusi →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ====================================================================
             MODE 2: CLASSIC RESPONSIVE GRID VIEW (3D NEUMORPHIC CARDS)
             ==================================================================== */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-2">
            {filteredPosts.map((post) => {
              const coverPhoto = post.photos?.[0]?.url || '/foto-kampus-unj.jpg';
              const photoCount = post.photos?.length || 1;
              return (
                <article
                  key={post.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl neu-card transition-all duration-300 hover:-translate-y-1.5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 px-4 py-3.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#006569] to-[#092D32] p-0.5">
                          <div className="grid h-full w-full place-items-center rounded-full bg-white p-0.5">
                            <img
                              src="/logo-menwa-unj.png"
                              alt="Menwa UNJ"
                              className="h-full w-full rounded-full object-contain"
                            />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-xs font-black text-[#006569]">
                            {post.prokerName}
                          </div>
                          <div className="flex items-center gap-1 truncate text-[11px] text-[#64748B]">
                            <MapPin size={11} className="shrink-0 text-[#006569]" />
                            <span className="truncate">{post.location}</span>
                          </div>
                        </div>
                      </div>
                      <span className="shrink-0 font-mono text-[11px] font-black text-[#092D32]">
                        {post.monthCode} {post.year}
                      </span>
                    </div>

                    <div
                      className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-slate-900 select-none"
                      onDoubleClick={() => handleToggleLike(post, true)}
                      onClick={() => openLightbox(post, 0, false)}
                    >
                      <img
                        src={coverPhoto}
                        alt={`${post.prokerName} (${post.year})`}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-[#092D32]/85 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                        <Images size={11} className="text-[#FFDD00]" />
                        <span>1/{photoCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-4 pt-3">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleToggleLike(post, false)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#092D32] cursor-pointer"
                        >
                          <Heart
                            size={19}
                            className={
                              post.isLiked
                                ? 'fill-[#E11D48] text-[#E11D48]'
                                : 'text-[#092D32] hover:text-[#E11D48]'
                            }
                          />
                          <span className="font-mono tabular-nums">{post.likes}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openLightbox(post, 0, true)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#092D32] cursor-pointer"
                        >
                          <MessageCircle size={19} />
                          <span className="font-mono tabular-nums">{post.comments?.length || 0}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSharePost(post)}
                          className="text-[#092D32] hover:text-[#006569] cursor-pointer"
                        >
                          <Share2 size={18} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const targetIdx = filteredPosts.findIndex((p) => p.id === post.id);
                          if (targetIdx >= 0) {
                            setActiveAlbumIndex(targetIdx);
                            setViewMode('dial');
                          }
                        }}
                        className="text-[11px] font-black text-[#006569] hover:underline cursor-pointer"
                      >
                        Buka di Dial →
                      </button>
                    </div>

                    <div className="px-4 pb-4 pt-2">
                      <p className="line-clamp-2 text-xs leading-relaxed text-slate-700 font-medium">
                        {cleanCaptionText(post.caption)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================================
          LIGHTBOX MODAL FULLSCREEN (RENDERED VIA PORTAL)
          ====================================================================== */}
      {activeModalPost &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Dokumentasi ${activeModalPost.prokerName}`}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-md sm:p-6 animate-fade-in"
            onClick={() => setActiveModalPostId(null)}
          >
            <button
              type="button"
              onClick={() => setActiveModalPostId(null)}
              className="fixed right-4 top-4 z-[10000] inline-flex items-center gap-2 rounded-full border border-white/25 bg-slate-900/90 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-2xl transition hover:border-[#FFDD00] hover:bg-[#E11D48] cursor-pointer"
            >
              <X size={16} />
              <span>Tutup (ESC)</span>
            </button>

            <div
              className="relative grid max-h-[88dvh] w-full max-w-6xl grid-cols-1 overflow-hidden rounded-3xl border border-white/20 bg-white shadow-[0_35px_90px_-15px_rgba(0,0,0,0.85)] lg:grid-cols-12"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col justify-between bg-[#021B25] p-4 sm:p-6 lg:col-span-7 overflow-y-auto">
                <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl bg-black">
                  <img
                    src={
                      activeModalPost.photos?.[activeSlideIndex]?.url ||
                      '/foto-kampus-unj.jpg'
                    }
                    alt={
                      activeModalPost.photos?.[activeSlideIndex]?.caption ||
                      activeModalPost.prokerName
                    }
                    className="h-full w-full object-contain"
                  />

                  {(activeModalPost.photos?.length || 0) > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const len = activeModalPost.photos.length;
                          setActiveSlideIndex((prev) => (prev - 1 + len) % len);
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-[#092D32]/85 text-white shadow transition hover:bg-[#FFDD00] hover:text-[#092D32] cursor-pointer"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const len = activeModalPost.photos.length;
                          setActiveSlideIndex((prev) => (prev + 1) % len);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-[#092D32]/85 text-white shadow transition hover:bg-[#FFDD00] hover:text-[#092D32] cursor-pointer"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  <span className="absolute left-3 top-3 rounded-lg bg-[#092D32]/90 px-3 py-1 font-mono text-xs font-extrabold text-[#FFDD00]">
                    Foto {activeSlideIndex + 1} / {activeModalPost.photos?.length || 1}
                  </span>
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-[#092D32] px-4 py-2.5 text-xs font-medium text-slate-200">
                  <strong className="mr-1.5 text-[#FFDD00]">
                    Lensa #{activeSlideIndex + 1}:
                  </strong>
                  {activeModalPost.photos?.[activeSlideIndex]?.caption}
                </div>
              </div>

              <div className="flex max-h-[85dvh] flex-col justify-between overflow-y-auto bg-white p-5 sm:p-6 lg:col-span-5">
                <div>
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src="/logo-menwa-unj.png"
                        alt="Menwa UNJ"
                        className="h-10 w-10 rounded-full border border-slate-200 p-1 object-contain"
                      />
                      <div>
                        <h3 className="text-sm font-black text-[#006569]">
                          {activeModalPost.prokerName} ({activeModalPost.year})
                        </h3>
                        <div className="text-xs font-semibold text-slate-500">
                          {activeModalPost.dateLabel} · {activeModalPost.location}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5 text-xs leading-relaxed text-slate-700">
                    <p>{cleanCaptionText(activeModalPost.caption)}</p>
                    {activeModalPost.narrativeReport && (
                      <div className="rounded-2xl border border-[#006569]/15 bg-[#F5F8F6] p-3.5 text-xs text-[#092D32]">
                        <div className="mb-1 font-mono text-[10px] font-black uppercase tracking-wider text-[#006569]">
                          Laporan Giat:
                        </div>
                        {cleanCaptionText(activeModalPost.narrativeReport)}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-[#092D32]">
                        Apresiasi &amp; Komentar ({activeModalPost.comments?.length || 0})
                      </span>
                    </div>

                    <div className="max-h-44 space-y-2.5 overflow-y-auto pr-1">
                      {(activeModalPost.comments || []).length === 0 ? (
                        <p className="py-3 text-center text-xs text-slate-400">
                          Belum ada komentar pada album ini.
                        </p>
                      ) : (
                        activeModalPost.comments.map((c) => (
                          <div key={c.id} className="rounded-xl bg-slate-50 px-3 py-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-[#092D32]">@{c.author}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {formatCommentTime(c)}
                              </span>
                            </div>
                            <p className="mt-1 text-slate-700">{c.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3.5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleToggleLike(activeModalPost, false)}
                        className="inline-flex items-center gap-1.5 rounded-2xl neu-btn px-3.5 py-2 text-xs font-extrabold text-[#092D32] transition cursor-pointer"
                      >
                        <Heart
                          size={16}
                          className={
                            activeModalPost.isLiked
                              ? 'fill-[#E11D48] text-[#E11D48]'
                              : 'text-[#092D32]'
                          }
                        />
                        <span className="font-mono tabular-nums">{activeModalPost.likes}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSharePost(activeModalPost)}
                        className="inline-flex items-center gap-1.5 rounded-2xl neu-btn px-3.5 py-2 text-xs font-extrabold text-[#092D32] transition cursor-pointer"
                      >
                        <Share2 size={15} /> Bagikan
                      </button>
                    </div>
                  </div>

                  {isLoggedIn ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        submitPostComment(activeModalPost, commentText, setCommentText);
                      }}
                      className="space-y-2"
                    >
                      <div className="flex gap-2">
                        <div className="flex-1 neu-inset rounded-2xl px-3.5 py-2.5">
                          <input
                            ref={commentInputRef}
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            style={{ color: '#020617' }}
                            placeholder="Tulis apresiasi atau kesan..."
                            className="w-full bg-transparent text-xs font-bold text-slate-950 outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={!commentText.trim()}
                          className="inline-flex items-center justify-center rounded-2xl neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] px-4 py-2.5 text-xs font-black text-[#FFDD00] hover:text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Send size={15} />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="rounded-2xl neu-inset p-3.5 text-center space-y-2">
                      <p className="text-xs text-slate-600 font-semibold">
                        Masuk ke akun portal untuk memberikan komentar pada dokumentasi ini.
                      </p>
                      {onOpenAuth && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveModalPostId(null);
                            onOpenAuth();
                          }}
                          className="inline-flex items-center justify-center rounded-2xl neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] px-4 py-2 text-xs font-black text-[#FFDD00] hover:text-white shadow-sm transition-all cursor-pointer"
                        >
                          Login Akun untuk Berkomentar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}

export default DocumentationWall;