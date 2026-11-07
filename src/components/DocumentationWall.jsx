
import { DocWallFilterBar } from './docwall/DocWallFilterBar.jsx';
import { DocWallGridView } from './docwall/DocWallGridView.jsx';
import { DocWallShowcaseView } from './docwall/DocWallShowcaseView.jsx';
import { DocWallTimelineView } from './docwall/DocWallTimelineView.jsx';
import { DocWallLightbox } from './docwall/DocWallLightbox.jsx';

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
      const normalizedProkerId = (post.prokerId === 'gps-viii' || post.prokerId === 'geranat-viii') ? 'geranat-vii' : post.prokerId;
      const normalizedProkerName =
        (post.prokerName === 'GPS VIII' || post.prokerName === 'GERANAT VIII' || post.prokerName === 'GERANAT VIII (LKBB)')
          ? 'GERANAT VII (LFPB)'
          : post.prokerName === 'GPS VII'
          ? 'GERANAT VII'
          : (post.prokerName === 'Ksatria Cendekia IX' ? 'Ksatria Cendekia VIII' : post.prokerName);

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
        <DocWallFilterBar
          viewMode={viewMode}
          setViewMode={setViewMode}
          setShowcaseSlideIndex={setShowcaseSlideIndex}
          GALLERY_CATEGORIES={GALLERY_CATEGORIES}
          selectedCategoryGroup={selectedCategoryGroup}
          setSelectedCategoryGroup={setSelectedCategoryGroup}
          selectedActivityId={selectedActivityId}
          setSelectedActivityId={setSelectedActivityId}
          setShowcaseAlbumIndex={setShowcaseAlbumIndex}
          extraDropdownRef={extraDropdownRef}
          extraDropdownOpen={extraDropdownOpen}
          setExtraDropdownOpen={setExtraDropdownOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          AVAILABLE_YEARS={AVAILABLE_YEARS}
          sortBy={sortBy}
          setSortBy={setSortBy}
          isFiltered={isFiltered}
          handleResetFilters={handleResetFilters}
        />


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
          <DocWallGridView
            filteredPosts={filteredPosts}
            selectedYear={selectedYear}
            selectedCategoryGroup={selectedCategoryGroup}
            handleToggleLike={handleToggleLike}
            openLightbox={openLightbox}
            handleSharePost={handleSharePost}
            handleToggleBookmark={handleToggleBookmark}
          />
        ) : viewMode === 'showcase' ? (
          <DocWallShowcaseView
            filteredPosts={filteredPosts}
            openLightbox={openLightbox}
          />
        ) : (
          <DocWallTimelineView
            postsByYear={postsByYear}
            openLightbox={openLightbox}
            handleToggleLike={handleToggleLike}
          />
        )}
      </div>

      <DocWallLightbox
        activeModalPost={activeModalPost}
        activeSlideIndex={activeSlideIndex}
        setActiveSlideIndex={setActiveSlideIndex}
        onClose={() => setActiveModalPostId(null)}
        handleToggleLike={handleToggleLike}
        handleSharePost={handleSharePost}
        handleToggleBookmark={handleToggleBookmark}
        isLoggedIn={isLoggedIn}
        submitPostComment={submitPostComment}
        commentText={commentText}
        setCommentText={setCommentText}
        commentInputRef={commentInputRef}
        onOpenAuth={onOpenAuth}
      />
    </section>
  );
}

export default DocumentationWall;
