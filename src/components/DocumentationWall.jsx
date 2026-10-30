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
  ChevronDown,
  X,
  Check,
  RotateCcw,
  Images,
  Send,
  Filter,
  ExternalLink,
  LayoutGrid,
  Maximize2,
  Shield,
  Award,
  BookOpen,
  HeartHandshake,
  Calendar,
  Clock,
  ArrowRight,
  Layers,
  CalendarDays,
  SlidersHorizontal,
  FolderOpen,
  Camera,
} from 'lucide-react';
import { playTactileClick } from '../lib/tactileAudio.js';
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

const AVAILABLE_YEARS = ['Semua Tahun', '2026', '2025', '2024', '2023'];

const GALLERY_CATEGORIES = [
  { id: 'ALL', label: 'Semua Giat', short: 'Semua', icon: LayoutGrid },
  { id: 'LFPB', label: 'LFPB & Paskibra', short: 'Paskibra', icon: Award, match: ['geranat', 'paskibra', 'lkbb', 'lfpb'] },
  { id: 'DIKLAT', label: 'Diklat & Militer', short: 'Diklat', icon: Shield, match: ['pembaretan', 'cakrawala', 'kds', 'provos', 'diklat', 'latgabnas', 'binjas', 'olahraga'] },
  { id: 'BAKSOS', label: 'Baksos & Rohani', short: 'Baksos', icon: HeartHandshake, match: ['buka-bersama', 'santunan', 'baksos', 'pengabdian', 'kemanusiaan'] },
  { id: 'SEMINAR', label: 'Seminar & Prestasi', short: 'Seminar', icon: BookOpen, match: ['youth-spark', 'ksatria-cendekia', 'lempika', 'seminar', 'kompetisi'] },
  { id: 'PROTOKOLER', label: 'Protokoler & Upacara', short: 'Protokoler', icon: Sparkles, match: ['sertijab', 'pcab', 'rakomsat', 'pam-wisuda', 'upacara', 'kunjungan'] },
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

  // Mode Tampilan: 'showcase' (Showcase Album - Sesuai Lampiran!) | 'grid' (Grid Klasik) | 'timeline' (Garis Waktu)
  const [viewMode, setViewMode] = useState('showcase');

  // Filter & Urutan
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState('ALL');
  const [selectedActivityId, setSelectedActivityId] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('Semua Tahun');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'likes' | 'comments'
  const [extraDropdownOpen, setExtraDropdownOpen] = useState(false);
  const extraDropdownRef = useRef(null);

  // Showcase state
  const [showcaseAlbumIndex, setShowcaseAlbumIndex] = useState(0);
  const [showcaseSlideIndex, setShowcaseSlideIndex] = useState(0);
  const filmstripReelRef = useRef(null);

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
  const [showcaseCommentText, setShowcaseCommentText] = useState('');
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
        setSelectedActivityId(prokerId);
        setShowcaseAlbumIndex(0);
        setShowcaseSlideIndex(0);
      }
    };
    window.addEventListener('menwa-filter-gallery', handleExternalFilter);
    return () => window.removeEventListener('menwa-filter-gallery', handleExternalFilter);
  }, []);

  // Tutup dropdown proker saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (extraDropdownRef.current && !extraDropdownRef.current.contains(e.target)) {
        setExtraDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Normalisasi & Sinkronisasi Daftar Posting
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

    return list.map((post) => {
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

  // Hasil penyaringan dan pengurutan
  const filteredPosts = useMemo(() => {
    let result = posts.filter((post) => {
      if (selectedCategoryGroup !== 'ALL') {
        const catObj = GALLERY_CATEGORIES.find((c) => c.id === selectedCategoryGroup);
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
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const haystack = `${post.prokerName} ${post.caption} ${post.location} ${post.year} ${post.category}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    // Pengurutan
    if (sortBy === 'likes') {
      result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sortBy === 'comments') {
      result.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
    } else {
      // Default: 'newest' (Urut tahun terbaru, kemudian indeks bulan)
      result.sort((a, b) => {
        const yrDiff = Number(b.year || 0) - Number(a.year || 0);
        if (yrDiff !== 0) return yrDiff;
        return (b.monthIndex || 0) - (a.monthIndex || 0);
      });
    }

    return result;
  }, [posts, selectedCategoryGroup, selectedActivityId, selectedYear, searchQuery, sortBy]);

  // Deep Link URL Sync (?album=id-album)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const targetKey = (params.get('album') || params.get('proker') || '')
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
        setShowcaseAlbumIndex(foundIdx);
        setShowcaseSlideIndex(0);
      }
    } catch {
      /* ignore */
    }
  }, [filteredPosts]);

  const activeShowcaseAlbum = filteredPosts[showcaseAlbumIndex] || filteredPosts[0] || null;

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
      if (!postId) return;
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

  // Kirim Komentar (dari Dossier Showcase maupun Lightbox Modal)
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
    setSortBy('newest');
    setExtraDropdownOpen(false);
    setShowcaseAlbumIndex(0);
    setShowcaseSlideIndex(0);
  }, []);

  const isFiltered =
    selectedCategoryGroup !== 'ALL' ||
    selectedActivityId !== 'ALL' ||
    selectedYear !== 'Semua Tahun' ||
    Boolean(searchQuery.trim()) ||
    sortBy !== 'newest';

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

  // Kelompokkan posting per tahun untuk Mode Timeline Garis Waktu
  const postsByYear = useMemo(() => {
    const map = {};
    filteredPosts.forEach((p) => {
      const yr = String(p.year || '2026');
      if (!map[yr]) map[yr] = [];
      map[yr].push(p);
    });
    // Urutkan tahun dari terbesar ke terkecil
    return Object.keys(map)
      .sort((a, b) => Number(b) - Number(a))
      .map((year) => ({
        year,
        items: map[year],
      }));
  }, [filteredPosts]);

  return (
    <section
      id="dinding-dokumentasi"
      aria-labelledby="dinding-dokumentasi-title"
      className="relative overflow-hidden bg-[#F5F8F6] py-5 sm:py-7 text-[#092D32]"
    >
      {/* Toast Notifikasi Salin Tautan */}
      {shareToast && (
        <div className="fixed bottom-8 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-[#059669] bg-[#092D32] px-4 py-3 text-xs font-extrabold text-white shadow-2xl animate-fade-in">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-[#059669] text-white">
            <Check size={13} />
          </span>
          <span>{shareToast}</span>
        </div>
      )}

      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8 space-y-5">
        {/* ====================================================================
            BARIS ATAS: KONTROL TAMPILAN & FILTER PINTAR (3D TACTILE NEUMORPHIC)
            ==================================================================== */}
        <div className="relative z-30 rounded-3xl neu-card p-3.5 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shadow-md">
          {/* Sisi Kiri: Switcher 3 Mode Tampilan (Showcase Album | Grid Klasik | Garis Waktu) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="neu-pill-bar">
              <button
                type="button"
                onClick={() => {
                  playTactileClick('pill');
                  setViewMode('showcase');
                  setShowcaseSlideIndex(0);
                }}
                className={
                  viewMode === 'showcase'
                    ? 'neu-pill-tab-dark'
                    : 'neu-pill-tab'
                }
                title="Tampilan Showcase Album"
              >
                <Layers size={14} className={viewMode === 'showcase' ? 'text-amber-400' : 'text-amber-500'} />
                <span>Showcase Album</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTactileClick('pill');
                  setViewMode('grid');
                }}
                className={
                  viewMode === 'grid'
                    ? 'neu-pill-tab-dark'
                    : 'neu-pill-tab'
                }
                title="Tampilan Grid Foto Klasik"
              >
                <LayoutGrid size={14} className={viewMode === 'grid' ? 'text-emerald-400' : 'text-emerald-600'} />
                <span>Grid Klasik</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTactileClick('pill');
                  setViewMode('timeline');
                }}
                className={
                  viewMode === 'timeline'
                    ? 'neu-pill-tab-dark'
                    : 'neu-pill-tab'
                }
                title="Tampilan Kronik Garis Waktu"
              >
                <CalendarDays size={14} className={viewMode === 'timeline' ? 'text-sky-400' : 'text-sky-600'} />
                <span>Garis Waktu</span>
              </button>
            </div>

            {/* Filter Kategori Singkat (Pills Ref: Image 1) */}
            <div className="hidden xl:flex items-center gap-1.5 pl-2 border-l border-slate-200">
              {GALLERY_CATEGORIES.map((cat) => {
                const active = selectedCategoryGroup === cat.id && selectedActivityId === 'ALL';
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryGroup(cat.id);
                      setSelectedActivityId('ALL');
                      setShowcaseAlbumIndex(0);
                    }}
                    className={
                      active
                        ? 'neu-pill-tab-dark'
                        : 'neu-pill-tab'
                    }
                  >
                    <IconComponent
                      size={13}
                      className={
                        active
                          ? 'text-[#FFDD00]'
                          : cat.id === 'ALL'
                          ? 'text-teal-600'
                          : cat.id === 'LFPB'
                          ? 'text-amber-500'
                          : cat.id === 'DIKLAT'
                          ? 'text-emerald-600'
                          : cat.id === 'BAKSOS'
                          ? 'text-rose-500'
                          : cat.id === 'SEMINAR'
                          ? 'text-blue-500'
                          : 'text-purple-500'
                      }
                    />
                    <span>{cat.short}</span>
                  </button>
                );
              })}
            </div>

            {/* Dropdown Proker Tertentu */}
            <div className="relative" ref={extraDropdownRef}>
              <button
                type="button"
                onClick={() => setExtraDropdownOpen((prev) => !prev)}
                className={`neu-pill-tab ${
                  selectedActivityId !== 'ALL'
                    ? 'neu-pill-tab-dark'
                    : ''
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
                <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl neu-card p-2.5 z-50 shadow-2xl">
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
                          setShowcaseAlbumIndex(0);
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
                          setShowcaseAlbumIndex(0);
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

          {/* Sisi Kanan: Pencarian, Tahun, Urutan, & Reset (Ref: Image 4 Warm Luminous Pill) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Input Pencarian Backlit Warm Glow (Ref: Image 4) */}
            <div className="neu-search-capsule flex-1 sm:flex-none sm:w-60 px-4 py-2">
              <Search size={14} className="text-slate-800 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowcaseAlbumIndex(0);
                }}
                style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
                placeholder="Cari giat / lokasi..."
                className="w-full bg-white text-black text-xs font-bold placeholder:text-slate-400 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter Tahun Pill */}
            <div className="neu-pill-tab px-3.5 py-1.5 bg-white">
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setShowcaseAlbumIndex(0);
                }}
                style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
                className="bg-transparent text-black text-xs font-bold outline-none cursor-pointer"
              >
                {AVAILABLE_YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Urutkan Berdasarkan Pill */}
            <div className="neu-pill-tab px-3.5 py-1.5 bg-white">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
                className="bg-transparent text-black text-xs font-bold outline-none cursor-pointer"
              >
                <option value="newest">Terbaru</option>
                <option value="likes">Terbanyak Disukai</option>
                <option value="comments">Paling Ramai</option>
              </select>
            </div>

            {/* Tombol Reset STRONG Red (Ref: Image 2) */}
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="neu-btn-strong-red inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-xs font-black cursor-pointer shadow-sm"
                title="Reset semua penyaringan"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* ====================================================================
            KONDISI KOSONG (EMPTY STATE)
            ==================================================================== */}
        {filteredPosts.length === 0 ? (
          <div className="mx-auto my-12 max-w-lg rounded-3xl neu-card p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl neu-inset mx-auto flex items-center justify-center text-[#006569]">
              <Filter size={32} />
            </div>
            <h3 className="text-xl font-black text-[#092D32]">Tidak Ada Dokumentasi yang Cocok</h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Tidak ditemukan arsip kegiatan untuk kata kunci atau kombinasi kategori yang dipilih.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 rounded-2xl neu-btn-primary px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#FFDD00] shadow-md cursor-pointer"
            >
              <RotateCcw size={14} /> Reset Penyaringan
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* ====================================================================
             MODE 1: GRID FOTO KLASIK (DEFAULT & AUTHENTIC PHOTOGRAPHIC CARDS)
             ==================================================================== */
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500">
              <span>Menampilkan <strong className="text-[#092D32]">{filteredPosts.length}</strong> Album Dokumentasi</span>
              <span className="font-mono text-[11px] text-[#006569]">{selectedYear} · {selectedCategoryGroup}</span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPosts.map((post) => {
                const coverPhoto = post.photos?.[0]?.url || '/foto-kampus-unj.jpg';
                const photoCount = post.photos?.length || 1;
                return (
                  <article
                    key={post.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl neu-card transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                  >
                    <div>
                      {/* Kartu Header Info */}
                      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#006569] to-[#092D32] p-0.5 shrink-0 shadow-xs">
                            <div className="w-full h-full rounded-[10px] bg-white p-0.5 flex items-center justify-center">
                              <img
                                src="/logo-menwa-unj.png"
                                alt="Menwa UNJ"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-xs font-black text-[#006569]">
                              {post.prokerName}
                            </h3>
                            <div className="flex items-center gap-1 truncate text-[11px] text-[#64748B]">
                              <MapPin size={11} className="shrink-0 text-[#006569]" />
                              <span className="truncate">{post.location}</span>
                            </div>
                          </div>
                        </div>

                        <span className="shrink-0 font-mono text-[11px] font-black text-[#092D32] px-2 py-0.5 rounded-lg bg-slate-100">
                          {post.monthCode} {post.year}
                        </span>
                      </div>

                      {/* Cover Photo Stage */}
                      <div
                        className="relative aspect-[16/10] w-full cursor-pointer overflow-hidden bg-slate-950 select-none group"
                        onDoubleClick={() => handleToggleLike(post, true)}
                        onClick={() => openLightbox(post, 0, false)}
                      >
                        <img
                          src={coverPhoto}
                          alt={`${post.prokerName} (${post.year})`}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = '/foto-kampus-unj.jpg';
                          }}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        {/* Badges Overlay */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-black/65 backdrop-blur-md px-2 py-0.5 text-[10px] font-black text-[#FFDD00] uppercase tracking-wider">
                            {post.category || 'DOKUMENTASI'}
                          </span>
                        </div>

                        <div className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-lg bg-black/65 backdrop-blur-md px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                          <Images size={11} className="text-[#FFDD00]" />
                          <span>{photoCount} Foto</span>
                        </div>

                        {/* Double-Click Heart Burst */}
                        {heartBurstPostId === post.id && (
                          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/20">
                            <Heart size={68} className="animate-ping fill-[#E11D48] text-[#E11D48]" />
                          </div>
                        )}
                      </div>

                      {/* Baris Aksi Interaktif */}
                      <div className="flex items-center justify-between px-4 pt-3">
                        <div className="flex items-center gap-3">
                          {/* Tombol Suka */}
                          <button
                            type="button"
                            onClick={() => handleToggleLike(post, false)}
                            aria-label="Sukai postingan"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#092D32] hover:text-[#E11D48] transition cursor-pointer"
                          >
                            <Heart
                              size={18}
                              className={
                                post.isLiked
                                  ? 'fill-[#E11D48] text-[#E11D48]'
                                  : 'text-[#092D32] hover:text-[#E11D48]'
                              }
                            />
                            <span className="font-mono tabular-nums font-bold">{post.likes}</span>
                          </button>

                          {/* Tombol Komentar */}
                          <button
                            type="button"
                            onClick={() => openLightbox(post, 0, true)}
                            aria-label="Komentar postingan"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#092D32] hover:text-[#006569] transition cursor-pointer"
                          >
                            <MessageCircle size={18} />
                            <span className="font-mono tabular-nums font-bold">
                              {post.comments?.length || 0}
                            </span>
                          </button>

                          {/* Tombol Bagikan */}
                          <button
                            type="button"
                            onClick={() => handleSharePost(post)}
                            aria-label="Bagikan tautan"
                            className="text-[#092D32] hover:text-[#006569] transition cursor-pointer"
                            title="Salin Tautan Album"
                          >
                            <Share2 size={17} />
                          </button>
                        </div>

                        {/* Tombol Simpan / Bookmark */}
                        <button
                          type="button"
                          onClick={() => handleToggleBookmark(post.id)}
                          aria-label="Simpan album"
                          className="text-[#092D32] hover:text-[#006569] transition cursor-pointer p-1"
                          title={post.isBookmarked ? 'Tersimpan' : 'Simpan Album'}
                        >
                          <Bookmark
                            size={17}
                            className={
                              post.isBookmarked
                                ? 'fill-[#006569] text-[#006569]'
                                : 'text-[#092D32]'
                            }
                          />
                        </button>
                      </div>

                      {/* Cuplikan Narasi Bersih */}
                      <div className="px-4 pb-4 pt-2 space-y-2">
                        <p className="line-clamp-2 text-xs leading-relaxed text-slate-700 font-medium">
                          {cleanCaptionText(post.caption)}
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            const targetIdx = filteredPosts.findIndex((p) => p.id === post.id);
                            if (targetIdx >= 0) {
                              setShowcaseAlbumIndex(targetIdx);
                              setShowcaseSlideIndex(0);
                              setViewMode('showcase');
                            }
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-black text-[#006569] hover:text-[#092D32] cursor-pointer"
                        >
                          <span>Buka di Showcase</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : viewMode === 'showcase' ? (
          /* ====================================================================
             MODE 2: SHOWCASE ALBUM GALERI (PERSIS SESUAI REFERENSI GAMBAR USER)
             ==================================================================== */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPosts.map((post) => {
                const photosCount = post.photos?.length || 1;
                const coverUrl = post.photos?.[0]?.url || '/foto-kampus-unj.jpg';
                const dateBadge = `${post.monthCode || ''} ${post.year || ''}`.trim() || 'OKT 2026';

                return (
                  <article
                    key={post.id}
                    onClick={() => {
                      playTactileClick('pop');
                      openLightbox(post, 0, false);
                    }}
                    className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* Container Foto Cover dengan Badges */}
                      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-sm mb-4">
                        <img
                          src={coverUrl}
                          alt={post.prokerName}
                          onError={(e) => {
                            e.currentTarget.src = '/foto-kampus-unj.jpg';
                          }}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        {/* Badge Jumlah Foto (Kiri Bawah) */}
                        <div className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white text-[11px] font-black tracking-wider shadow-sm">
                          <Camera size={13} className="text-[#FFDD00]" />
                          <span>{photosCount} FOTO</span>
                        </div>
                        {/* Badge Bulan/Tahun (Kanan Atas) */}
                        <div className="absolute top-2.5 right-2.5 inline-flex items-center px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[#FFDD00] text-[11px] font-mono font-black tracking-wider shadow-sm">
                          <span>{dateBadge}</span>
                        </div>
                      </div>

                      {/* Info Konten Album */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-black uppercase tracking-wider text-[#006569]">
                          {post.category || 'PROGRAM KERJA'}
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug line-clamp-1 group-hover:text-[#006569] transition-colors">
                          {post.prokerName}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 pt-0.5">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{post.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tombol Footer Buka Album */}
                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playTactileClick('pop');
                          openLightbox(post, 0, false);
                        }}
                        className="inline-flex items-center gap-1 text-xs sm:text-sm font-black text-slate-800 group-hover:text-[#006569] transition-colors cursor-pointer py-1"
                      >
                        <span>Buka Album</span>
                        <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredPosts.length === 0 && (
              <div className="neu-card rounded-3xl p-12 text-center text-slate-500 space-y-2">
                <FolderOpen size={36} className="mx-auto text-slate-400 opacity-60" />
                <p className="font-bold text-sm">Tidak ada album dokumentasi yang cocok dengan pencarian.</p>
              </div>
            )}
          </div>
        ) : (
          /* ====================================================================
             MODE 3: KRONIK GARIS WAKTU (INTERACTIVE HISTORICAL CHRONOLOGY)
             ==================================================================== */
          <div className="space-y-10 py-4 max-w-4xl mx-auto">
            {postsByYear.map(({ year, items }) => (
              <div key={year} className="space-y-6">
                {/* Header Tahun Anggaran */}
                <div className="flex items-center gap-3">
                  <div className="px-4 py-1.5 rounded-2xl neu-btn-primary text-[#FFDD00] font-black text-sm tracking-wider">
                    TAHUN ANGGARAN {year}
                  </div>
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-[#006569]/40 to-transparent" />
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {items.length} Agenda Selesai
                  </span>
                </div>

                {/* Timeline Spine */}
                <div className="relative border-l-2 border-[#006569]/30 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-6">
                  {items.map((post) => {
                    const coverPhoto = post.photos?.[0]?.url || '/foto-kampus-unj.jpg';
                    return (
                      <div key={post.id} className="relative group">
                        {/* Node Badge on the timeline */}
                        <div className="absolute -left-[31px] sm:-left-[39px] top-4 w-5 h-5 rounded-full bg-[#006569] border-4 border-[#F5F8F6] shadow-md group-hover:scale-125 transition-transform" />

                        {/* Card */}
                        <div className="rounded-3xl neu-card p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black text-[#006569] px-2 py-0.5 rounded-lg bg-teal-50 border border-teal-200">
                                {post.monthName} {post.year}
                              </span>
                              <span className="text-xs font-bold text-slate-500">· {post.category}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                              <MapPin size={12} className="text-[#006569]" />
                              <span>{post.location}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                            <div
                              onClick={() => openLightbox(post, 0, false)}
                              className="sm:col-span-4 aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 cursor-pointer select-none relative group/thumb"
                            >
                              <img
                                src={coverPhoto}
                                alt={post.prokerName}
                                onError={(e) => {
                                  e.currentTarget.src = '/foto-kampus-unj.jpg';
                                }}
                                className="w-full h-full object-cover transition duration-300 group-hover/thumb:scale-105"
                              />
                              <div className="absolute bottom-1.5 right-1.5 bg-black/70 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold text-white">
                                {post.photos?.length || 1} Foto
                              </div>
                            </div>

                            <div className="sm:col-span-8 space-y-2">
                              <h3 className="text-base font-black text-[#092D32]">
                                {post.prokerName}
                              </h3>
                              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                {cleanCaptionText(post.caption)}
                              </p>
                              <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-3 text-xs font-bold text-[#092D32]">
                                  <span className="flex items-center gap-1">
                                    <Heart size={14} className="fill-[#E11D48] text-[#E11D48]" />
                                    <span className="font-mono">{post.likes}</span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MessageCircle size={14} />
                                    <span className="font-mono">{post.comments?.length || 0}</span>
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => openLightbox(post, 0, false)}
                                  className="inline-flex items-center gap-1 text-xs font-black text-[#006569] hover:underline cursor-pointer"
                                >
                                  <span>Lihat Foto Lengkap</span>
                                  <ArrowRight size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================================
          LIGHTBOX MODAL FULLSCREEN INTERAKTIF (DENGAN SLIDE & KOMENTAR)
          ====================================================================== */}
      {activeModalPost &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-md animate-fade-in"
            onClick={() => setActiveModalPostId(null)}
          >
            <div
              className="relative flex flex-col lg:flex-row max-h-[95vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-[#F5F8F6] text-[#092D32] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Tombol Tutup Modal */}
              <button
                type="button"
                onClick={() => setActiveModalPostId(null)}
                aria-label="Tutup modal"
                className="absolute top-4 right-4 z-40 p-2 rounded-full neu-btn text-slate-600 hover:text-rose-600 transition cursor-pointer shadow-md"
              >
                <X size={18} />
              </button>

              {/* Sisi Kiri: Carousel Foto Layar Lebar */}
              <div className="relative flex lg:flex-1 aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto items-center justify-center overflow-hidden bg-black">
                <img
                  src={
                    activeModalPost.photos?.[activeSlideIndex]?.url ||
                    activeModalPost.photos?.[0]?.url ||
                    '/foto-kampus-unj.jpg'
                  }
                  alt={
                    activeModalPost.photos?.[activeSlideIndex]?.caption ||
                    activeModalPost.prokerName
                  }
                  onError={(e) => {
                    e.currentTarget.src = '/foto-kampus-unj.jpg';
                  }}
                  className="max-h-full max-w-full object-contain select-none"
                />

                {/* Tombol Slide Sebelumnya / Berikutnya */}
                {(activeModalPost.photos?.length || 0) > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const len = activeModalPost.photos.length;
                        setActiveSlideIndex((prev) => (prev - 1 + len) % len);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-[#FFDD00] text-white hover:text-[#092D32] flex items-center justify-center transition cursor-pointer shadow-md z-20"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const len = activeModalPost.photos.length;
                        setActiveSlideIndex((prev) => (prev + 1) % len);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-[#FFDD00] text-white hover:text-[#092D32] flex items-center justify-center transition cursor-pointer shadow-md z-20"
                    >
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}

                {/* Indikator Posisi Foto */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white font-mono text-xs font-black z-20">
                  {activeSlideIndex + 1} / {activeModalPost.photos?.length || 1}
                </div>
              </div>

              {/* Sisi Kanan: Panel Info, Narasi & Komentar */}
              <div className="flex flex-col justify-between p-6 sm:p-7 lg:w-[420px] max-h-[85vh] lg:max-h-[92vh] overflow-y-auto space-y-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#006569] bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-lg">
                        {activeModalPost.category || 'PROGRAM KERJA'}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-500">
                        {activeModalPost.monthCode} {activeModalPost.year}
                      </span>
                    </div>

                    <h2 className="mt-2 text-xl font-black text-[#092D32]">
                      {activeModalPost.prokerName}
                    </h2>

                    <div className="mt-1 flex items-center gap-1.5 text-xs text-[#64748B] font-semibold">
                      <MapPin size={13} className="text-[#006569] shrink-0" />
                      <span>{activeModalPost.location}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl neu-inset p-3.5 space-y-1.5">
                    <p className="text-xs leading-relaxed text-slate-800 font-medium">
                      {cleanCaptionText(activeModalPost.caption)}
                    </p>
                    {activeModalPost.narrativeReport && (
                      <p className="text-xs leading-relaxed text-slate-500 pt-1.5 border-t border-slate-200/70">
                        {activeModalPost.narrativeReport}
                      </p>
                    )}
                  </div>

                  {/* Tombol Interaksi */}
                  <div className="flex items-center gap-2 pt-1 border-b border-slate-200 pb-3">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(activeModalPost, false)}
                      className="inline-flex items-center gap-1.5 rounded-2xl neu-btn px-4 py-2 text-xs font-black text-[#092D32] cursor-pointer"
                    >
                      <Heart
                        size={17}
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
                      className="inline-flex items-center gap-1.5 rounded-2xl neu-btn px-3.5 py-2 text-xs font-black text-[#092D32] cursor-pointer"
                    >
                      <Share2 size={15} />
                      <span>Bagikan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(activeModalPost.id)}
                      className="p-2 rounded-2xl neu-btn text-[#092D32] cursor-pointer"
                    >
                      <Bookmark
                        size={16}
                        className={
                          activeModalPost.isBookmarked
                            ? 'fill-[#006569] text-[#006569]'
                            : 'text-[#092D32]'
                        }
                      />
                    </button>
                  </div>

                  {/* Daftar Komentar */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#006569]">
                      Apresiasi &amp; Komentar ({activeModalPost.comments?.length || 0})
                    </h4>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {(activeModalPost.comments || []).length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2">
                          Belum ada komentar pada album ini.
                        </p>
                      ) : (
                        activeModalPost.comments.map((cmt) => (
                          <div key={cmt.id} className="rounded-2xl bg-white border border-slate-200/80 p-3 text-xs space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-black text-[#006569]">@{cmt.author}</span>
                              <span className="font-mono text-slate-400 text-[10px]">
                                {formatCommentTime(cmt)}
                              </span>
                            </div>
                            <p className="text-slate-800 font-medium">{cmt.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Formulir Tulis Komentar */}
                <div className="pt-2 border-t border-slate-200">
                  {isLoggedIn ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        submitPostComment(activeModalPost, commentText, setCommentText);
                      }}
                      className="flex items-center gap-2"
                    >
                      <div className="flex-1 rounded-2xl bg-white border-2 border-slate-300 focus-within:border-[#006569] px-3.5 py-2 shadow-inner">
                        <input
                          ref={commentInputRef}
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
                          placeholder="Tulis apresiasi kegiatan..."
                          className="w-full bg-white text-black text-xs font-bold placeholder:text-slate-400 outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!commentText.trim()}
                        className="inline-flex items-center gap-1 rounded-2xl neu-btn-primary px-3.5 py-2.5 text-xs font-black text-[#FFDD00] shadow-sm cursor-pointer disabled:opacity-40"
                      >
                        <Send size={14} />
                      </button>
                    </form>
                  ) : (
                    <div className="rounded-2xl neu-inset p-3 text-center space-y-1.5">
                      <p className="text-xs text-slate-600 font-semibold">
                        Masuk akun untuk memberikan komentar pada dokumentasi ini.
                      </p>
                      {onOpenAuth && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveModalPostId(null);
                            onOpenAuth();
                          }}
                          className="neu-btn-strong-blue px-5 py-2 rounded-full text-xs font-black text-white cursor-pointer shadow-sm"
                        >
                          Login Akun
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
