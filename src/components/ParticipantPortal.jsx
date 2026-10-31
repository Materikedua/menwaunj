import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Upload,
  Download,
  FileText,
  Users,
  UserPlus,
  Building2,
  Calendar,
  Award,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  Plus,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Printer,
  FolderOpen,
  Sparkles,
  Phone,
  MapPin,
  Clock,
  Check,
  X,
  FileSpreadsheet,
  IdCard,
  LayoutGrid,
  Shield,
  Lock,
  KeyRound,
  RotateCcw,
  History,
  Eye,
  Save,
  Share2,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import {
  normalizeWaNumber,
  getAllOfficialPortals,
  getOfficialPortalBySlug,
  getOfficialPortalByWhatsApp,
  saveOfficialPortal,
  subscribeToOfficialPortal,
  saveOfficialPortalSnapshot,
  restoreOfficialPortalSnapshot,
  compressImageFile,
} from '../firebase.js';
import {
  GERANAT_SCORING_GROUPS,
  GERANAT_PENALTY_ITEMS,
  GERANAT_BONUS_ITEMS,
  OFFICIAL_REQUIRED_DOCUMENTS,
  OFFICIAL_TIMELINE_STAGES,
} from '../data/geranatScoringData.js';
import { navigate } from '../lib/router.jsx';
import { OfficialSecurityGate } from './OfficialSecurityGate.jsx';
import { OfficialPinChangeModal } from './OfficialPinChangeModal.jsx';
import { OfficialActivityLogModal } from './OfficialActivityLogModal.jsx';
import { generateBukuPasukanHtml } from './OfficialBukuPasukanGenerator.jsx';

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/svg+xml',
  'image/webp',
];
const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.svg', '.webp'];
const MAX_IMAGE_SIZE_BYTES = 100 * 1024; // 100 KB

const PASUKAN_POSITIONS = [
  'Komandan Peleton',
  'Pengibar',
  'Baki',
  'Pasukan Inti',
  'Pasukan Cadangan',
];
const OFFICIAL_POSITIONS = ['Official 1', 'Official 2'];

export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'Silakan pilih file gambar terlebih dahulu.' };
  }
  const lowerName = (file.name || '').toLowerCase();
  const hasValidExt = ALLOWED_IMAGE_EXTS.some((ext) => lowerName.endsWith(ext));
  const hasValidMime = ALLOWED_IMAGE_TYPES.includes(file.type);
  if (!hasValidExt && !hasValidMime) {
    return {
      valid: false,
      error: 'Format gambar wajib .jpg, .png, .svg, atau .webp.',
    };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeKb = (file.size / 1024).toFixed(1);
    return {
      valid: false,
      error: `Ukuran file (${sizeKb} KB) melebihi batas maksimal 100 KB.`,
    };
  }
  return { valid: true, error: '' };
}

async function readFileAsDataUrl(file) {
  if (file && file.type && file.type.startsWith('image/')) {
    try {
      const compressed = await compressImageFile(file, { maxWidth: 800, maxHeight: 800, quality: 0.82 });
      if (compressed && compressed.dataUrl) {
        return compressed.dataUrl;
      }
    } catch {
      /* Fallback ke reader biasa */
    }
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => resolve(String(ev.target?.result || ''));
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsDataURL(file);
  });
}

export function computePortalProgress(portal) {
  if (!portal) {
    return {
      profilPct: 0,
      berkasPct: 0,
      biodataPct: 0,
      timelinePct: 100,
      penilaianPct: 0,
      overallPct: 0,
      berkasCount: 0,
      biodataCount: 0,
      pasukanCount: 0,
      officialCount: 0,
      scoredAspectsCount: 0,
      totalAspectsCount: 89,
    };
  }

  const sp = portal.schoolProfile || {};
  const profilFields = [
    sp.logoDataUrl,
    sp.schoolName || portal.schoolName,
    sp.jalan,
    sp.rtRw,
    sp.kelurahan,
    sp.kecamatan,
    sp.kabupatenKota,
    sp.provinsi,
  ];
  const filledProfil = profilFields.filter((v) => String(v || '').trim().length > 0).length;
  const profilPct = Math.round((filledProfil / profilFields.length) * 100);

  const docs = portal.documents || {};
  const berkasCount = OFFICIAL_REQUIRED_DOCUMENTS.filter(
    (d) => docs[d.id] && (docs[d.id].fileDataUrl || docs[d.id].fileName)
  ).length;
  const berkasPct = Math.round((berkasCount / OFFICIAL_REQUIRED_DOCUMENTS.length) * 100);

  const pasukanCount = Array.isArray(portal.pasukanList) ? portal.pasukanList.length : 0;
  const officialCount = Array.isArray(portal.officialList) ? portal.officialList.length : 0;
  const biodataCount = Math.min(20, pasukanCount + officialCount);
  const biodataPct = Math.round((biodataCount / 20) * 100);

  const totalAspectsCount = GERANAT_SCORING_GROUPS.reduce(
    (acc, g) => acc + g.aspects.length,
    0
  );
  const scoresObj = portal.scores || {};
  const scoredAspectsCount = Object.keys(scoresObj).filter(
    (k) => scoresObj[k] !== null && scoresObj[k] !== undefined && scoresObj[k] !== ''
  ).length;
  const penilaianPct = Math.round((scoredAspectsCount / totalAspectsCount) * 100);

  const timelinePct = 100;
  const overallPct = Math.round((profilPct + berkasPct + biodataPct) / 3);

  return {
    profilPct,
    berkasPct,
    biodataPct,
    timelinePct,
    penilaianPct,
    overallPct,
    berkasCount,
    biodataCount,
    pasukanCount,
    officialCount,
    scoredAspectsCount,
    totalAspectsCount,
  };
}

function printHtmlDocument(htmlContent) {
  const existingFrame = document.getElementById('menwa-official-print-frame');
  if (existingFrame) {
    existingFrame.remove();
  }
  const iframe = document.createElement('iframe');
  iframe.id = 'menwa-official-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(htmlContent);
  doc.close();
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  }, 350);
}

/**
 * Kartu ID Card Pasukan / Official (Live Preview & Daftar Tim)
 */
function TeamIdCardPreview({
  person,
  schoolName,
  schoolLogo,
  type = 'PASUKAN',
  indexNumber = 1,
}) {
  const isOfficial = type === 'OFFICIAL';
  return (
    <div className="w-full max-w-[285px] rounded-3xl bg-white border border-slate-200 shadow-[0_18px_40px_-15px_rgba(9,45,50,0.18)] overflow-hidden font-sans select-none transition-transform duration-300 hover:-translate-y-1">
      <div
        className="px-4 py-3 text-white flex items-center justify-between relative overflow-hidden"
        style={{
          background: isOfficial
            ? 'linear-gradient(135deg, #092D32 0%, #1e3a8a 100%)'
            : 'linear-gradient(135deg, #092D32 0%, #006569 100%)',
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
            {schoolLogo ? (
              <img
                src={schoolLogo}
                alt="Logo Sekolah"
                onError={(e) => {
                  e.currentTarget.src = '/logo-menwa-unj.png';
                }}
                className="w-full h-full object-contain"
              />
            ) : (
              <img src="/logo-menwa-unj.png" alt="Menwa UNJ" className="w-full h-full object-contain" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#FFDD00] block">
              GERANAT · MENWA UNJ
            </span>
            <h5 className="text-xs font-black text-white truncate">
              {schoolName || 'Kontingen Sekolah'}
            </h5>
          </div>
        </div>
        <span className="relative z-10 px-2 py-0.5 rounded-lg bg-[#FFDD00] text-[#092D32] text-[10px] font-mono font-black">
          #{String(indexNumber).padStart(2, '0')}
        </span>
      </div>

      <div className="p-5 flex flex-col items-center text-center bg-gradient-to-b from-[#F5F8F6] to-white">
        <div className="w-24 h-28 rounded-2xl bg-white border-2 border-[#006569]/25 shadow-inner overflow-hidden flex items-center justify-center mb-3">
          {person?.photoDataUrl ? (
            <img
              src={person.photoDataUrl}
              alt={person.fullName || 'Foto Profil'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-[#64748B] flex flex-col items-center gap-1 p-2">
              <Users size={26} className="text-[#006569]/40" />
              <span className="text-[9px] font-bold uppercase">Foto 3x4</span>
            </div>
          )}
        </div>

        <span className="text-[10px] font-black uppercase tracking-wider text-[#006569] mb-1">
          {person?.position || (isOfficial ? 'Official 1' : 'Pasukan Inti')}
        </span>

        <h4 className="text-sm font-black text-[#092D32] leading-snug line-clamp-1">
          {person?.fullName || 'Nama Lengkap Peserta'}
        </h4>
        <p className="text-[11px] font-bold text-[#64748B] mt-0.5 line-clamp-1">
          {schoolName || person?.schoolName || 'Nama Sekolah'}
        </p>

        {!isOfficial ? (
          <div className="mt-3 w-full rounded-xl bg-[#F5F8F6] border border-slate-200 px-3 py-1.5 flex items-center justify-between text-[11px]">
            <span className="font-bold text-[#64748B] uppercase">NISN</span>
            <span className="font-mono font-black text-[#092D32] tabular-nums">
              {person?.nisn || '—'}
            </span>
          </div>
        ) : (
          <div className="mt-3 w-full rounded-xl bg-[#F5F8F6] border border-slate-200 px-3 py-1.5 flex items-center justify-between text-[11px]">
            <span className="font-bold text-[#64748B] uppercase">STATUS</span>
            <span className="font-mono font-black text-[#006569]">OFFICIAL TIM</span>
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-[#092D32] text-white flex items-center justify-between text-[9px] font-mono">
        <span className="text-[#FFDD00] font-bold uppercase">
          {isOfficial ? 'ID OFFICIAL RESMI' : 'ID PASUKAN RESMI'}
        </span>
        <span className="text-emerald-400 font-bold">TERVERIFIKASI</span>
      </div>
    </div>
  );
}

export function ParticipantPortal({ schoolSlugProp = '' }) {
  const { isAdmin, isSuperAdmin } = useAuth();
  const hasAdminAccess = Boolean(isAdmin || isSuperAdmin);

  // Login Gate
  const [waInput, setWaInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [searchingWa, setSearchingWa] = useState(false);
  const [allPortals, setAllPortals] = useState([]);

  // Security & PIN Lockscreen Gate State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showPinChangeModal, setShowPinChangeModal] = useState(false);
  const [showActivityLogModal, setShowActivityLogModal] = useState(false);
  const [restoringSnapshot, setRestoringSnapshot] = useState(false);
  const [savingSnapshot, setSavingSnapshot] = useState(false);

  // Active Subdomain
  const [activeSlug, setActiveSlug] = useState(schoolSlugProp || '');
  const [portalData, setPortalData] = useState(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [activeModule, setActiveModule] = useState('beranda');
  const [toastMessage, setToastMessage] = useState('');

  // Tab 1: Profil Sekolah
  const [profileForm, setProfileForm] = useState({
    logoDataUrl: '',
    logoFileName: '',
    logoSizeKb: 0,
    schoolName: '',
    jalan: '',
    rtRw: '',
    kelurahan: '',
    kecamatan: '',
    kabupatenKota: '',
    provinsi: '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const profileFieldRefs = useRef({});

  // Tab 2: Pemberkasan
  const [docUploadError, setDocUploadError] = useState('');
  const [uploadingDocId, setUploadingDocId] = useState('');

  // Tab 3: Biodata Pasukan (18) & Official (2)
  const [showPasukanForm, setShowPasukanForm] = useState(false);
  const [editingPasukanId, setEditingPasukanId] = useState(null);
  const [pasukanForm, setPasukanForm] = useState({
    photoDataUrl: '',
    photoFileName: '',
    photoSizeKb: 0,
    fullName: '',
    position: 'Pasukan Inti',
    nisn: '',
  });
  const [pasukanErrors, setPasukanErrors] = useState({});
  const pasukanFieldRefs = useRef({});

  const [showOfficialForm, setShowOfficialForm] = useState(false);
  const [editingOfficialId, setEditingOfficialId] = useState(null);
  const [officialForm, setOfficialForm] = useState({
    photoDataUrl: '',
    photoFileName: '',
    photoSizeKb: 0,
    fullName: '',
    position: 'Official 1',
  });
  const [officialErrors, setOfficialErrors] = useState({});
  const officialFieldRefs = useRef({});

  // Tab 4: Timeline Acara
  const [selectedTimelineId, setSelectedTimelineId] = useState(
    OFFICIAL_TIMELINE_STAGES[0]?.id || 'stage-1'
  );

  // Tab 5: Rekap Nilai Juri
  const [activeScoreGroup, setActiveScoreGroup] = useState('ALL');
  const [juryNameInput, setJuryNameInput] = useState('');
  const [nomorUrutInput, setNomorUrutInput] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  useEffect(() => {
    if (hasAdminAccess) {
      getAllOfficialPortals().then((list) => setAllPortals(list));
    }
  }, [hasAdminAccess]);

  // Security Session Check & Persistence
  useEffect(() => {
    if (!activeSlug) {
      setIsUnlocked(false);
      setIsGuestMode(false);
      return;
    }
    try {
      const sessionKey = 'menwa_official_session_' + activeSlug;
      const guestKey = 'menwa_official_guest_' + activeSlug;
      if (sessionStorage.getItem(guestKey) === 'true') {
        setIsGuestMode(true);
        setIsUnlocked(false);
      } else if (sessionStorage.getItem(sessionKey) === 'unlocked') {
        setIsUnlocked(true);
        setIsGuestMode(false);
      } else {
        setIsUnlocked(false);
        setIsGuestMode(false);
      }
    } catch {
      setIsUnlocked(false);
      setIsGuestMode(false);
    }
  }, [activeSlug]);

  // Strict Rule: canEdit = false mutlak jika isGuestMode === true atau belum isUnlocked
  const canEdit = Boolean(!isGuestMode && isUnlocked);

  const handleUnlockWithPin = () => {
    try {
      sessionStorage.setItem('menwa_official_session_' + activeSlug, 'unlocked');
      sessionStorage.removeItem('menwa_official_guest_' + activeSlug);
    } catch {
      /* ignore */
    }
    setIsUnlocked(true);
    setIsGuestMode(false);
    showToast('Akses Penuh Official Terverifikasi!');
  };

  const handleEnterGuestMode = () => {
    try {
      sessionStorage.setItem('menwa_official_guest_' + activeSlug, 'true');
      sessionStorage.removeItem('menwa_official_session_' + activeSlug);
    } catch {
      /* ignore */
    }
    setIsGuestMode(true);
    setIsUnlocked(false);
    showToast('Mode Tamu / Peninjau Aktif (Hanya Baca)');
  };

  const handleLockSession = () => {
    try {
      sessionStorage.removeItem('menwa_official_session_' + activeSlug);
      sessionStorage.removeItem('menwa_official_guest_' + activeSlug);
    } catch {
      /* ignore */
    }
    setIsUnlocked(false);
    setIsGuestMode(false);
    showToast('Sesi telah dikunci kembali.');
  };

  const handleAdminBypass = () => {
    try {
      sessionStorage.setItem('menwa_official_session_' + activeSlug, 'unlocked');
    } catch {
      /* ignore */
    }
    setIsUnlocked(true);
    setIsGuestMode(false);
    showToast('Bypass Komando Mako Admin Aktif!');
  };

  const handlePrintBukuPasukan = () => {
    if (!portalData) return;
    const html = generateBukuPasukanHtml(portalData);
    printHtmlDocument(html);
    showToast('Menyiapkan Dokumen Buku Pasukan A4 Lengkap...');
  };

  const handleCopySubdomainLink = () => {
    if (!activeSlug) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://menwaunj.com';
    const shareUrl = `${origin}/official/${activeSlug}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast(`Tautan Subdomain (/official/${activeSlug}) berhasil disalin!`);
      }).catch(() => {
        showToast(`Tautan: ${shareUrl}`);
      });
    } else {
      showToast(`Tautan: ${shareUrl}`);
    }
  };

  const handleSaveManualSnapshot = async () => {
    if (!canEdit || !activeSlug) return;
    setSavingSnapshot(true);
    try {
      const updated = await saveOfficialPortalSnapshot(
        activeSlug,
        'Snapshot Manual oleh Official Kontingen'
      );
      if (updated) {
        setPortalData(updated);
        showToast('Snapshot cadangan data kontingen berhasil disimpan!');
      }
    } catch (err) {
      showToast(`Gagal menyimpan snapshot: ${err.message}`);
    } finally {
      setSavingSnapshot(false);
    }
  };

  const handleRestoreSnapshotAction = async () => {
    if (!canEdit) return;
    if (!portalData?.snapshotBackup) {
      showToast('Belum ada snapshot cadangan tersimpan.');
      return;
    }
    const snapDate = new Date(portalData.snapshotBackup.savedAt).toLocaleString('id-ID');
    if (
      !window.confirm(
        `Pulihkan seluruh data pasukan dan official ke snapshot tertanggal ${snapDate}?`
      )
    ) {
      return;
    }
    setRestoringSnapshot(true);
    try {
      const restored = await restoreOfficialPortalSnapshot(activeSlug);
      if (restored) {
        setPortalData(restored);
        showToast('Data kontingen berhasil dipulihkan dari snapshot terakhir!');
      }
    } catch (err) {
      showToast(`Gagal memulihkan snapshot: ${err.message}`);
    } finally {
      setRestoringSnapshot(false);
    }
  };

  useEffect(() => {
    if (schoolSlugProp) {
      setActiveSlug(schoolSlugProp);
    } else {
      setActiveSlug('');
      setPortalData(null);
    }
  }, [schoolSlugProp]);

  // Real-time Firestore Subscription
  useEffect(() => {
    if (!activeSlug) return undefined;
    setLoadingPortal(true);
    let isMounted = true;

    getOfficialPortalBySlug(activeSlug).then((initial) => {
      if (!isMounted) return;
      if (initial) {
        setPortalData(initial);
        const sp = initial.schoolProfile || {};
        setProfileForm({
          logoDataUrl: sp.logoDataUrl || '',
          logoFileName: sp.logoFileName || '',
          logoSizeKb: sp.logoSizeKb || 0,
          schoolName: sp.schoolName || initial.schoolName || '',
          jalan: sp.jalan || '',
          rtRw: sp.rtRw || '',
          kelurahan: sp.kelurahan || '',
          kecamatan: sp.kecamatan || '',
          kabupatenKota: sp.kabupatenKota || '',
          provinsi: sp.provinsi || '',
        });
        setJuryNameInput(initial.juryName || 'Dewan Juri Mako Menwa UNJ');
        setNomorUrutInput(initial.nomorUrut || 'KONTINGEN-01');
      }
      setLoadingPortal(false);
    });

    const unsub = subscribeToOfficialPortal(activeSlug, (liveData) => {
      if (!isMounted || !liveData) return;
      setPortalData(liveData);
      const sp = liveData.schoolProfile || {};
      setProfileForm((prev) => ({
        logoDataUrl: sp.logoDataUrl ?? prev.logoDataUrl,
        logoFileName: sp.logoFileName ?? prev.logoFileName,
        logoSizeKb: sp.logoSizeKb ?? prev.logoSizeKb,
        schoolName: sp.schoolName || liveData.schoolName || prev.schoolName,
        jalan: sp.jalan ?? prev.jalan,
        rtRw: sp.rtRw ?? prev.rtRw,
        kelurahan: sp.kelurahan ?? prev.kelurahan,
        kecamatan: sp.kecamatan ?? prev.kecamatan,
        kabupatenKota: sp.kabupatenKota ?? prev.kabupatenKota,
        provinsi: sp.provinsi ?? prev.provinsi,
      }));
    });

    return () => {
      isMounted = false;
      if (typeof unsub === 'function') unsub();
    };
  }, [activeSlug]);

  // Handler WhatsApp Login
  const handleWhatsAppLogin = async (e) => {
    e?.preventDefault();
    setLoginError('');
    const cleaned = normalizeWaNumber(waInput);
    if (!cleaned || cleaned.length < 8) {
      setLoginError('Nomor WhatsApp Anda tidak terdaftar di event manapun.');
      return;
    }
    setSearchingWa(true);
    try {
      const matched = await getOfficialPortalByWhatsApp(cleaned);
      if (!matched) {
        setLoginError('Nomor WhatsApp Anda tidak terdaftar di event manapun.');
      } else {
        setLoginError('');
        navigate(`/official/${matched.schoolSlug}`);
      }
    } catch {
      setLoginError('Nomor WhatsApp Anda tidak terdaftar di event manapun.');
    } finally {
      setSearchingWa(false);
    }
  };

  // HANDLER TAB 1: PROFIL SEKOLAH
  const handleSchoolLogoChange = async (e) => {
    if (!canEdit) {
      showToast('Mode Tamu: Akses edit dibatasi.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    const check = validateImageFile(file);
    if (!check.valid) {
      setProfileErrors((prev) => ({ ...prev, logoDataUrl: check.error }));
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setProfileForm((prev) => ({
        ...prev,
        logoDataUrl: dataUrl,
        logoFileName: file.name,
        logoSizeKb: Math.round(file.size / 1024),
      }));
      setProfileErrors((prev) => ({ ...prev, logoDataUrl: '' }));
    } catch (err) {
      setProfileErrors((prev) => ({ ...prev, logoDataUrl: err.message }));
    }
  };

  const handleSaveSchoolProfile = async (e) => {
    e?.preventDefault();
    if (!canEdit) {
      showToast('Mode Tamu: Akses edit profil dibatasi.');
      return;
    }
    const errors = {};
    if (!profileForm.logoDataUrl) {
      errors.logoDataUrl = 'Logo Sekolah wajib diunggah (.jpg, .png, .svg, .webp maks 100 KB).';
    }
    if (!profileForm.schoolName.trim()) {
      errors.schoolName = 'Nama Sekolah wajib diisi.';
    }
    if (!profileForm.jalan.trim()) {
      errors.jalan = 'Nama Jalan wajib diisi.';
    }
    if (!profileForm.rtRw.trim()) {
      errors.rtRw = 'RT / RW wajib diisi.';
    }
    if (!profileForm.kelurahan.trim()) {
      errors.kelurahan = 'Kelurahan wajib diisi.';
    }
    if (!profileForm.kecamatan.trim()) {
      errors.kecamatan = 'Kecamatan wajib diisi.';
    }
    if (!profileForm.kabupatenKota.trim()) {
      errors.kabupatenKota = 'Kabupaten/Kota wajib diisi.';
    }
    if (!profileForm.provinsi.trim()) {
      errors.provinsi = 'Provinsi wajib diisi.';
    }
    setProfileErrors(errors);

    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey) {
      const targetEl = profileFieldRefs.current[firstErrorKey];
      if (targetEl?.scrollIntoView) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await saveOfficialPortal({
        ...portalData,
        schoolSlug: activeSlug,
        schoolName: profileForm.schoolName.trim(),
        schoolProfile: {
          ...profileForm,
          schoolName: profileForm.schoolName.trim(),
        },
      });
      setPortalData(updated);
      showToast('Profil Sekolah berhasil disimpan dan disinkronkan!');
    } finally {
      setSavingProfile(false);
    }
  };

  // HANDLER TAB 2: PEMBERKASAN
  const handleDocumentUpload = async (docItem, e) => {
    if (!canEdit) {
      showToast('Mode Tamu: Akses unggah berkas dibatasi.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    setDocUploadError('');
    if (file.size > 1024 * 1024) {
      setDocUploadError(
        `Ukuran berkas "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB) melebihi batas maksimal 1 MB.`
      );
      return;
    }
    setUploadingDocId(docItem.id);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const nextDocs = {
        ...(portalData?.documents || {}),
        [docItem.id]: {
          docId: docItem.id,
          title: docItem.title,
          fileName: file.name,
          fileSizeKb: Math.round(file.size / 1024),
          fileType: file.type || 'application/octet-stream',
          fileDataUrl: dataUrl,
          status: 'terunggah',
          uploadedAt: new Date().toISOString(),
        },
      };
      const updated = await saveOfficialPortal({
        ...portalData,
        schoolSlug: activeSlug,
        documents: nextDocs,
      });
      setPortalData(updated);
      showToast(`Dokumen "${docItem.title}" berhasil diunggah!`);
    } catch (err) {
      setDocUploadError(err.message || 'Gagal mengunggah dokumen.');
    } finally {
      setUploadingDocId('');
    }
  };

  const handleDeleteDocument = async (docId, docTitle) => {
    if (!canEdit) {
      showToast('Mode Tamu: Akses hapus berkas dibatasi.');
      return;
    }
    const nextDocs = { ...(portalData?.documents || {}) };
    delete nextDocs[docId];
    const updated = await saveOfficialPortal({
      ...portalData,
      schoolSlug: activeSlug,
      documents: nextDocs,
    });
    setPortalData(updated);
    showToast(`Dokumen "${docTitle}" telah dihapus.`);
  };

  const handleVerifyDocumentByAdmin = async (docId) => {
    if (!hasAdminAccess) return;
    const currentDoc = portalData?.documents?.[docId];
    if (!currentDoc) return;
    const nextStatus = currentDoc.status === 'terverifikasi' ? 'terunggah' : 'terverifikasi';
    const nextDocs = {
      ...(portalData?.documents || {}),
      [docId]: {
        ...currentDoc,
        status: nextStatus,
        verifiedAt: new Date().toISOString(),
      },
    };
    const updated = await saveOfficialPortal({
      ...portalData,
      schoolSlug: activeSlug,
      documents: nextDocs,
    });
    setPortalData(updated);
    showToast(`Status verifikasi dokumen diperbarui menjadi "${nextStatus.toUpperCase()}".`);
  };

  // HANDLER TAB 3: BIODATA PASUKAN & OFFICIAL
  const detectedSchoolName =
    profileForm.schoolName?.trim() ||
    portalData?.schoolProfile?.schoolName ||
    portalData?.schoolName ||
    'Nama Sekolah Belum Diisi';

  const handlePasukanPhotoChange = async (e) => {
    if (!canEdit) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const check = validateImageFile(file);
    if (!check.valid) {
      setPasukanErrors((prev) => ({ ...prev, photoDataUrl: check.error }));
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setPasukanForm((prev) => ({
      ...prev,
      photoDataUrl: dataUrl,
      photoFileName: file.name,
      photoSizeKb: Math.round(file.size / 1024),
    }));
    setPasukanErrors((prev) => ({ ...prev, photoDataUrl: '' }));
  };

  const handleSubmitPasukan = async (e) => {
    e?.preventDefault();
    if (!canEdit) {
      showToast('Mode Tamu: Akses tambah/edit pasukan dibatasi.');
      return;
    }
    const errors = {};
    if (!pasukanForm.photoDataUrl) {
      errors.photoDataUrl = 'Foto profil pasukan wajib diunggah (.jpg/.png/.svg/.webp maks 100 KB).';
    }
    if (!pasukanForm.fullName.trim()) {
      errors.fullName = 'Nama Lengkap pasukan wajib diisi.';
    }
    if (!PASUKAN_POSITIONS.includes(pasukanForm.position)) {
      errors.position = 'Pilih posisi pasukan yang valid.';
    }
    const cleanNisn = String(pasukanForm.nisn || '').trim();
    if (!cleanNisn || !/^\d+$/.test(cleanNisn)) {
      errors.nisn = 'NISN wajib diisi dan hanya boleh berupa angka.';
    }
    setPasukanErrors(errors);
    const firstErr = Object.keys(errors)[0];
    if (firstErr) {
      const el = pasukanFieldRefs.current[firstErr];
      if (el?.scrollIntoView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const currentList = Array.isArray(portalData?.pasukanList)
      ? [...portalData.pasukanList]
      : [];
    if (!editingPasukanId && currentList.length >= 18) {
      setPasukanErrors({ fullName: 'Kuota Pasukan telah mencapai batas maksimal 18 orang.' });
      return;
    }

    const memberPayload = {
      id: editingPasukanId || `PAS-${Date.now()}`,
      photoDataUrl: pasukanForm.photoDataUrl,
      photoFileName: pasukanForm.photoFileName,
      photoSizeKb: pasukanForm.photoSizeKb,
      fullName: pasukanForm.fullName.trim(),
      schoolName: detectedSchoolName,
      position: pasukanForm.position,
      nisn: cleanNisn,
      updatedAt: new Date().toISOString(),
    };

    const nextList = editingPasukanId
      ? currentList.map((m) => (m.id === editingPasukanId ? memberPayload : m))
      : [...currentList, memberPayload];

    const updated = await saveOfficialPortal({
      ...portalData,
      schoolSlug: activeSlug,
      pasukanList: nextList,
    });
    setPortalData(updated);
    setPasukanForm({
      photoDataUrl: '',
      photoFileName: '',
      photoSizeKb: 0,
      fullName: '',
      position: 'Pasukan Inti',
      nisn: '',
    });
    setEditingPasukanId(null);
    setShowPasukanForm(false);
    showToast(`Biodata Pasukan "${memberPayload.fullName}" berhasil disimpan!`);
  };

  const handleDeletePasukan = async (memberId, memberName) => {
    if (!canEdit) {
      showToast('Mode Tamu: Akses hapus pasukan dibatasi.');
      return;
    }
    const nextList = (portalData?.pasukanList || []).filter((m) => m.id !== memberId);
    const updated = await saveOfficialPortal({
      ...portalData,
      schoolSlug: activeSlug,
      pasukanList: nextList,
    });
    setPortalData(updated);
    showToast(`Data pasukan "${memberName}" telah dihapus.`);
  };

  const handleOfficialPhotoChange = async (e) => {
    if (!canEdit) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const check = validateImageFile(file);
    if (!check.valid) {
      setOfficialErrors((prev) => ({ ...prev, photoDataUrl: check.error }));
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setOfficialForm((prev) => ({
      ...prev,
      photoDataUrl: dataUrl,
      photoFileName: file.name,
      photoSizeKb: Math.round(file.size / 1024),
    }));
    setOfficialErrors((prev) => ({ ...prev, photoDataUrl: '' }));
  };

  const handleSubmitOfficial = async (e) => {
    e?.preventDefault();
    if (!canEdit) {
      showToast('Mode Tamu: Akses tambah/edit official dibatasi.');
      return;
    }
    const errors = {};
    if (!officialForm.photoDataUrl) {
      errors.photoDataUrl = 'Foto profil official wajib diunggah (.jpg/.png/.svg/.webp maks 100 KB).';
    }
    if (!officialForm.fullName.trim()) {
      errors.fullName = 'Nama Lengkap official wajib diisi.';
    }
    if (!OFFICIAL_POSITIONS.includes(officialForm.position)) {
      errors.position = 'Pilih posisi Official 1 atau Official 2.';
    }
    setOfficialErrors(errors);
    const firstErr = Object.keys(errors)[0];
    if (firstErr) {
      const el = officialFieldRefs.current[firstErr];
      if (el?.scrollIntoView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const currentList = Array.isArray(portalData?.officialList)
      ? [...portalData.officialList]
      : [];
    if (!editingOfficialId && currentList.length >= 2) {
      setOfficialErrors({ fullName: 'Kuota Official telah mencapai batas maksimal 2 orang.' });
      return;
    }

    const offPayload = {
      id: editingOfficialId || `OFF-${Date.now()}`,
      photoDataUrl: officialForm.photoDataUrl,
      photoFileName: officialForm.photoFileName,
      photoSizeKb: officialForm.photoSizeKb,
      fullName: officialForm.fullName.trim(),
      schoolName: detectedSchoolName,
      position: officialForm.position,
      updatedAt: new Date().toISOString(),
    };

    const nextList = editingOfficialId
      ? currentList.map((o) => (o.id === editingOfficialId ? offPayload : o))
      : [...currentList, offPayload];

    const updated = await saveOfficialPortal({
      ...portalData,
      schoolSlug: activeSlug,
      officialList: nextList,
    });
    setPortalData(updated);
    setOfficialForm({
      photoDataUrl: '',
      photoFileName: '',
      photoSizeKb: 0,
      fullName: '',
      position: 'Official 1',
    });
    setEditingOfficialId(null);
    setShowOfficialForm(false);
    showToast(`Biodata ${offPayload.position} "${offPayload.fullName}" berhasil disimpan!`);
  };

  const handleDeleteOfficial = async (offId, offName) => {
    if (!canEdit) {
      showToast('Mode Tamu: Akses hapus official dibatasi.');
      return;
    }
    const nextList = (portalData?.officialList || []).filter((o) => o.id !== offId);
    const updated = await saveOfficialPortal({
      ...portalData,
      schoolSlug: activeSlug,
      officialList: nextList,
    });
    setPortalData(updated);
    showToast(`Data official "${offName}" telah dihapus.`);
  };

  // Unduh Kartu ID Tim (PDF Print)
  const handleDownloadTeamCardsPdf = () => {
    const pasukan = portalData?.pasukanList || [];
    const officials = portalData?.officialList || [];
    const logoSrc = profileForm.logoDataUrl || '/logo-menwa-unj.png';
    const cardsHtml = [
      ...pasukan.map((p, idx) => ({ ...p, cardType: 'PASUKAN', no: idx + 1 })),
      ...officials.map((o, idx) => ({ ...o, cardType: 'OFFICIAL', no: idx + 1 })),
    ]
      .map(
        (item) => `
        <div class="id-card">
          <div class="id-header ${item.cardType === 'OFFICIAL' ? 'bg-off' : 'bg-pas'}">
            <img src="${logoSrc}" alt="Logo" class="logo" />
            <div class="head-txt">
              <div class="eyebrow">GERANAT · MENWA UNJ</div>
              <div class="school">${detectedSchoolName}</div>
            </div>
            <div class="badge-no">#${String(item.no).padStart(2, '0')}</div>
          </div>
          <div class="id-body">
            <div class="photo-box">
              ${item.photoDataUrl ? `<img src="${item.photoDataUrl}" alt="${item.fullName}" />` : `<span>FOTO 3x4</span>`}
            </div>
            <div class="role-pill">${item.position}</div>
            <div class="name">${item.fullName}</div>
            <div class="school-sub">${detectedSchoolName}</div>
            ${
              item.cardType === 'PASUKAN'
                ? `<div class="nisn-box"><span>NISN</span><strong>${item.nisn || '-'}</strong></div>`
                : `<div class="nisn-box"><span>STATUS</span><strong>OFFICIAL RESMI</strong></div>`
            }
          </div>
          <div class="id-footer">
            <span>${item.cardType === 'OFFICIAL' ? 'ID OFFICIAL' : 'ID PASUKAN'}</span>
            <span>${portalData?.nomorUrut || 'KONTINGEN'}</span>
          </div>
        </div>`
      )
      .join('');

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Kartu Pasukan & Official - ${detectedSchoolName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; padding: 20px; background: #fff; color: #092D32; }
    .doc-header { text-align: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #006569; }
    .doc-header h1 { font-size: 16px; font-weight: 900; color: #006569; text-transform: uppercase; }
    .doc-header p { font-size: 11px; color: #64748B; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .id-card { border: 1.5px solid #cbd5e1; border-radius: 16px; overflow: hidden; page-break-inside: avoid; display: flex; flex-direction: column; }
    .id-header { padding: 10px 12px; color: #fff; display: flex; align-items: center; gap: 8px; }
    .bg-pas { background: #006569; }
    .bg-off { background: #092D32; }
    .logo { width: 28px; height: 28px; border-radius: 6px; background: #fff; object-fit: contain; padding: 2px; }
    .head-txt { flex: 1; overflow: hidden; }
    .eyebrow { font-size: 8px; font-weight: 800; color: #ffdd00; letter-spacing: 1px; }
    .school { font-size: 10px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .badge-no { font-size: 9px; font-weight: 900; background: #ffdd00; color: #092D32; padding: 2px 6px; border-radius: 99px; }
    .id-body { padding: 14px 12px; text-align: center; display: flex; flex-direction: column; align-items: center; }
    .photo-box { width: 76px; height: 92px; border-radius: 10px; border: 1.5px solid #006569; overflow: hidden; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; background: #F5F8F6; font-size: 9px; color: #64748B; }
    .photo-box img { width: 100%; height: 100%; object-fit: cover; }
    .role-pill { font-size: 9px; font-weight: 800; text-transform: uppercase; background: #ECFDF5; color: #059669; padding: 3px 8px; border-radius: 99px; margin-bottom: 5px; }
    .name { font-size: 12px; font-weight: 900; color: #092D32; margin-bottom: 2px; }
    .school-sub { font-size: 9px; color: #64748B; font-weight: 600; margin-bottom: 8px; }
    .nisn-box { width: 100%; background: #F5F8F6; border: 1px solid #e2e8f0; border-radius: 8px; padding: 4px 8px; display: flex; justify-content: space-between; font-size: 9px; }
    .id-footer { background: #092D32; color: #ffdd00; padding: 6px 10px; font-size: 8px; font-weight: 800; display: flex; justify-content: space-between; margin-top: auto; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="doc-header">
    <h1>KARTU TANDA PASUKAN & OFFICIAL — ${detectedSchoolName}</h1>
    <p>Total Terdaftar: ${pasukan.length} Pasukan & ${officials.length} Official · Dicetak dari Portal Official Menwa UNJ</p>
  </div>
  <div class="grid">${cardsHtml}</div>
</body>
</html>`;
    printHtmlDocument(html);
  };

  // HANDLER TAB 5: REKAP NILAI JURI
  const handleSetAspectScore = async (aspectId, scoreVal, maxScore) => {
    if (!hasAdminAccess) return;
    const numeric =
      scoreVal === '' || scoreVal === null
        ? null
        : Math.max(0, Math.min(Number(maxScore), Number(scoreVal)));
    const nextScores = {
      ...(portalData?.scores || {}),
      [aspectId]: numeric,
    };
    if (numeric === null || Number.isNaN(numeric)) {
      delete nextScores[aspectId];
    }
    const updated = await saveOfficialPortal({
      ...portalData,
      schoolSlug: activeSlug,
      juryName: juryNameInput || portalData?.juryName || 'Dewan Juri Mako Menwa UNJ',
      nomorUrut: nomorUrutInput || portalData?.nomorUrut || 'KONTINGEN-01',
      scores: nextScores,
    });
    setPortalData(updated);
  };

  const handleTogglePenalty = async (penItem, customPoints = null) => {
    if (!hasAdminAccess) return;
    const currentPenalties = { ...(portalData?.penalties || {}) };
    if (customPoints === null) {
      if (currentPenalties[penItem.id]) {
        delete currentPenalties[penItem.id];
      } else {
        currentPenalties[penItem.id] = penItem.defaultPoints || 0;
      }
    } else {
      currentPenalties[penItem.id] = Math.max(0, Number(customPoints) || 0);
    }
    const updated = await saveOfficialPortal({
      ...portalData,
      schoolSlug: activeSlug,
      penalties: currentPenalties,
    });
    setPortalData(updated);
  };

  const handleToggleBonus = async (bonItem) => {
    if (!hasAdminAccess) return;
    const currentBonuses = { ...(portalData?.bonuses || {}) };
    if (currentBonuses[bonItem.id]) {
      delete currentBonuses[bonItem.id];
    } else {
      currentBonuses[bonItem.id] = bonItem.defaultPoints || 0;
    }
    const updated = await saveOfficialPortal({
      ...portalData,
      schoolSlug: activeSlug,
      bonuses: currentBonuses,
    });
    setPortalData(updated);
  };

  const scoringSummary = useMemo(() => {
    const scores = portalData?.scores || {};
    const penalties = portalData?.penalties || {};
    const bonuses = portalData?.bonuses || {};
    let totalGross = 0;
    let totalMax = 0;
    const groupTotals = {};

    GERANAT_SCORING_GROUPS.forEach((group) => {
      let gSum = 0;
      let gScoredCount = 0;
      group.aspects.forEach((asp) => {
        const val = scores[asp.id];
        if (val !== undefined && val !== null && val !== '') {
          gSum += Number(val);
          gScoredCount += 1;
        }
      });
      groupTotals[group.id] = {
        sum: gSum,
        max: group.maxTotal,
        scoredCount: gScoredCount,
      };
      totalGross += gSum;
      totalMax += group.maxTotal;
    });

    const totalPenalty = Object.values(penalties).reduce((acc, v) => acc + (Number(v) || 0), 0);
    const totalBonus = Object.values(bonuses).reduce((acc, v) => acc + (Number(v) || 0), 0);
    const finalScore = totalGross - totalPenalty + totalBonus;

    return {
      groupTotals,
      totalGross,
      totalMax,
      totalPenalty,
      totalBonus,
      finalScore,
    };
  }, [portalData]);

  const handleDownloadScoringCsv = () => {
    const scores = portalData?.scores || {};
    const rows = [
      ['BLANKO REKAPITULASI PENILAIAN PESERTA LOMBA GERANAT'],
      ['Nama Tim / Sekolah', detectedSchoolName],
      ['Nomor Urut Peserta', portalData?.nomorUrut || nomorUrutInput || '-'],
      ['Nama Juri', portalData?.juryName || juryNameInput || 'Dewan Juri Mako Menwa UNJ'],
      [],
      ['Kode Kelompok', 'No', 'Aspek Penilaian', 'Skor Diperoleh', 'Nilai Maksimal', 'Format Tampilan'],
    ];

    GERANAT_SCORING_GROUPS.forEach((g) => {
      g.aspects.forEach((asp) => {
        const val = scores[asp.id];
        const hasVal = val !== undefined && val !== null && val !== '';
        rows.push([
          g.title,
          String(asp.no),
          asp.name,
          hasVal ? String(val) : '-',
          String(asp.maxScore),
          `${hasVal ? val : '-'} / ${asp.maxScore}`,
        ]);
      });
      const gt = scoringSummary.groupTotals[g.id];
      rows.push([
        g.title,
        '',
        `TOTAL ${g.title.toUpperCase()}`,
        String(gt?.sum || 0),
        String(g.maxTotal),
        `${gt?.sum || 0} / ${g.maxTotal}`,
      ]);
      rows.push([]);
    });

    rows.push(['RINGKASAN AKHIR', '', 'Total Nilai Kotor (A-J)', String(scoringSummary.totalGross), String(scoringSummary.totalMax), `${scoringSummary.totalGross} / ${scoringSummary.totalMax}`]);
    rows.push(['RINGKASAN AKHIR', '', 'Total Pengurangan Poin (-)', String(scoringSummary.totalPenalty), '', `-${scoringSummary.totalPenalty}`]);
    rows.push(['RINGKASAN AKHIR', '', 'Total Penambahan Poin (+)', String(scoringSummary.totalBonus), '', `+${scoringSummary.totalBonus}`]);
    rows.push(['RINGKASAN AKHIR', '', 'TOTAL NILAI AKHIR BERSIH', String(scoringSummary.finalScore), String(scoringSummary.totalMax), `${scoringSummary.finalScore} / ${scoringSummary.totalMax}`]);

    const csvContent =
      '\uFEFF' +
      rows
        .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rekap_Penilaian_${activeSlug || 'Kontingen'}_GERANAT.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadScoringPdf = () => {
    const scores = portalData?.scores || {};
    const groupsHtml = GERANAT_SCORING_GROUPS.map((g) => {
      const gt = scoringSummary.groupTotals[g.id];
      const rowsHtml = g.aspects
        .map((asp) => {
          const val = scores[asp.id];
          const hasVal = val !== undefined && val !== null && val !== '';
          return `<tr>
            <td style="text-align:center;">${asp.no}</td>
            <td>${asp.name}</td>
            <td style="text-align:center;font-family:monospace;font-weight:800;">${hasVal ? val : '-'} / ${asp.maxScore}</td>
          </tr>`;
        })
        .join('');
      return `
        <table class="score-table">
          <thead>
            <tr>
              <th style="width:45px;">No.</th>
              <th>${g.title}</th>
              <th style="width:140px;">Nilai (Skor / Maks)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            <tr class="total-row">
              <td colspan="2" style="text-align:right;font-weight:800;">Total Nilai ${g.code}</td>
              <td style="text-align:center;font-weight:900;">${gt?.sum || 0} / ${g.maxTotal}</td>
            </tr>
          </tbody>
        </table>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Rekapitulasi Penilaian GERANAT - ${detectedSchoolName}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #092D32; font-size: 11px; }
    .head { text-align: center; margin-bottom: 16px; }
    .head h1 { font-size: 14px; font-weight: 900; margin-bottom: 3px; }
    .head h2 { font-size: 12px; font-weight: 800; color: #006569; }
    .meta { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .meta td { border: 1px solid #092D32; padding: 6px 10px; font-weight: 700; }
    .score-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; page-break-inside: avoid; }
    .score-table th, .score-table td { border: 1px solid #092D32; padding: 5px 8px; }
    .score-table th { background: #006569; color: #fff; text-align: left; }
    .total-row { background: #F5F8F6; }
  </style>
</head>
<body>
  <div class="head">
    <h1>BLANKO REKAPITULASI PENILAIAN PESERTA LOMBA</h1>
    <h2>GERAKAN PASKIBRA SEMANGAT (GERANAT) — MENWA SATUAN UNJ</h2>
  </div>
  <table class="meta">
    <tr><td style="width:180px;">Nama Tim / Sekolah</td><td>${detectedSchoolName}</td></tr>
    <tr><td>Nama Juri</td><td>${portalData?.juryName || juryNameInput || 'Dewan Juri Mako'}</td></tr>
    <tr><td>No. Urut Peserta</td><td>${portalData?.nomorUrut || nomorUrutInput || '-'}</td></tr>
    <tr><td>Total Nilai Akhir</td><td><strong>${scoringSummary.finalScore} / ${scoringSummary.totalMax}</strong> (Kotor: ${scoringSummary.totalGross}, Pengurangan: -${scoringSummary.totalPenalty}, Penambahan: +${scoringSummary.totalBonus})</td></tr>
  </table>
  ${groupsHtml}
</body>
</html>`;
    printHtmlDocument(html);
  };

  const progress = useMemo(() => computePortalProgress(portalData), [portalData]);

  // ============================================================================
  // VIEW A: WHATSAPP LOGIN GATE (3D NEUMORPHIC AUTH — Ketika belum ada activeSlug)
  // ============================================================================
  if (!activeSlug) {
    return (
      <div className="relative min-h-[85vh] w-full py-10 sm:py-14 px-3 sm:px-6 font-sans flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#EEF5F6] via-[#F5F8F6] to-[#F9FBFA] rounded-[2.75rem]">
        {/* Ambient Background Glows */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />

        {loginError && (
          <div className="relative z-10 mb-6 w-full max-w-md rounded-2xl border border-[#E11D48]/30 bg-rose-50 px-5 py-4 text-[#E11D48] shadow-sm flex items-start gap-3 animate-fade-in">
            <AlertCircle size={20} className="text-[#E11D48] shrink-0 mt-0.5" />
            <div className="text-left text-xs sm:text-sm font-bold leading-snug">
              <p>{loginError}</p>
            </div>
          </div>
        )}

        {/* Kartu Kontainer Login (Floating 3D Cushion Card) */}
        <div className="relative z-10 w-full max-w-md rounded-[2.75rem] neu-card p-8 sm:p-10 text-center overflow-hidden">
          {/* Tile Logo 3D Elevated di Bagian Atas */}
          <div className="mx-auto mb-5 w-24 h-24 rounded-3xl neu-logo-tile p-3.5 flex items-center justify-center relative overflow-hidden">
            <div className="pointer-events-none absolute -top-6 -left-6 w-16 h-16 bg-white/85 rounded-full blur-md" />
            <img
              src="/logo-menwa-unj.png"
              alt="Logo Menwa UNJ"
              className="w-full h-full object-contain relative z-10 drop-shadow-sm"
            />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#092D32]">
            Selamat Datang
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 font-semibold leading-relaxed max-w-xs mx-auto">
            Masukkan kredensial nomor WhatsApp official untuk melanjutkan
          </p>

          <form onSubmit={handleWhatsAppLogin} className="mt-7 text-left space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.14em] text-[#092D32] mb-2">
                NOMOR WHATSAPP OFFICIAL
              </label>
              <div className="flex items-center gap-3 rounded-2xl bg-white border-2 border-slate-300 focus-within:border-[#006569] focus-within:ring-2 focus-within:ring-[#006569]/20 px-4 py-3.5 shadow-inner transition-all">
                <Phone size={18} className="text-[#006569] shrink-0" />
                <span className="text-[#006569] font-black text-sm sm:text-base select-none">
                  +62
                </span>
                <input
                  type="tel"
                  value={waInput}
                  onChange={(e) => {
                    setWaInput(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  placeholder="812xxxxxxxx"
                  style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
                  className="w-full bg-white text-black font-mono placeholder:text-slate-400 font-bold text-base sm:text-lg focus:outline-none"
                />
              </div>
              <span className="mt-2 block text-[11px] font-semibold text-slate-500">
                Masukkan nomor tanpa angka 0 di depan.
              </span>
            </div>

            <button
              type="submit"
              disabled={searchingWa}
              className="w-full py-3.5 pl-6 pr-3.5 rounded-full neu-btn-primary text-white font-black text-sm sm:text-base tracking-wide flex items-center justify-between cursor-pointer disabled:opacity-60"
            >
              <span className="mx-auto pl-6">
                {searchingWa ? 'Memeriksa Kontingen...' : 'Login Official'}
              </span>
              <span className="w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-[#FFDD00] shrink-0 shadow-inner">
                <ArrowRight size={17} />
              </span>
            </button>
          </form>

          {/* Pemisah "ATAU MASUK MELALUI" */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-slate-300/80 to-slate-300/80" />
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              ATAU MASUK MELALUI
            </span>
            <div className="h-[1.5px] flex-1 bg-gradient-to-l from-transparent via-slate-300/80 to-slate-300/80" />
          </div>

          {/* Deretan Tombol Sosial 3D */}
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/geranat')}
              title="Halaman Utama GERANAT"
              className="neu-social-btn cursor-pointer text-[#006569]"
            >
              <ShieldCheck size={22} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/informasi')}
              title="Pusat Informasi & Pendaftaran"
              className="neu-social-btn cursor-pointer text-[#092D32]"
            >
              <FileText size={21} />
            </button>
            {hasAdminAccess && (
              <button
                type="button"
                onClick={() => navigate('/mako-ops')}
                title="Mako Command Center (Admin)"
                className="neu-social-btn cursor-pointer text-amber-600"
              >
                <Shield size={22} />
              </button>
            )}
          </div>

          {hasAdminAccess && (
            <div className="mt-6 pt-4 border-t border-slate-200/70 space-y-3 text-left">
              {allPortals.length > 0 && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Akses Cepat Kontingen Terdaftar (Admin)
                  </label>
                  <div className="neu-inset rounded-2xl px-3.5 py-2.5">
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) navigate(`/official/${e.target.value}`);
                      }}
                      style={{ color: '#020617' }}
                      className="w-full bg-transparent text-xs font-bold text-slate-950 focus:outline-none"
                    >
                      <option value="" disabled>
                        -- Pilih Subdomain Sekolah ({allPortals.length} Terdaftar) --
                      </option>
                      {allPortals.map((p) => (
                        <option key={p.schoolSlug} value={p.schoolSlug}>
                          {p.schoolName} (/official/{p.schoolSlug})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/mako-ops')}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#006569] hover:underline cursor-pointer"
                >
                  <Shield size={14} /> Kelola Pendaftaran &amp; Direktori Sekolah di Command Center
                </button>
              </div>
            </div>
          )}

          <div className="mt-5 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
            PORTAL OFFICIAL TERVERIFIKASI · MENWA UNJ
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // GATE: Tampilkan OfficialSecurityGate jika slug aktif namun belum terverifikasi PIN / Guest
  // ============================================================================
  if (activeSlug && !isUnlocked && !isGuestMode) {
    return (
      <OfficialSecurityGate
        portalData={portalData}
        activeSlug={activeSlug}
        onUnlock={handleUnlockWithPin}
        onEnterGuestMode={handleEnterGuestMode}
        hasAdminAccess={hasAdminAccess}
        onAdminBypass={handleAdminBypass}
        onCancel={() => {
          setActiveSlug('');
          navigate('/geranat#portal-official');
        }}
      />
    );
  }

  // ============================================================================
  // VIEW B: FLOATING GLASSMORPHIC OFFICIAL CONSOLE ("CLASS MANAGEMENT CONSOLE")
  // ============================================================================
  const DOCK_ITEMS = [
    { id: 'beranda', label: 'Beranda Kontingen', icon: LayoutGrid, badge: `${progress.overallPct}%` },
    { id: 'profil', label: 'Profil Sekolah', icon: Building2, badge: `${progress.profilPct}%`, pct: progress.profilPct },
    { id: 'pemberkasan', label: 'Pemberkasan', icon: FileText, badge: `${progress.berkasCount}/5`, pct: progress.berkasPct },
    { id: 'biodata', label: 'Biodata Pasukan', icon: Users, badge: `${progress.biodataCount}/20`, pct: progress.biodataPct },
    { id: 'timeline', label: 'Timeline Acara', icon: Calendar, badge: '6 Tahap', pct: progress.timelinePct },
    { id: 'penilaian', label: 'Rekap Nilai Juri', icon: Award, badge: `${scoringSummary.finalScore}`, pct: progress.penilaianPct },
    { id: 'bantuan', label: 'Bantuan & Juknis', icon: HelpCircle, badge: 'Siaga 24/7' },
  ];

  // 7 Milestone Kelengkapan Administrasi & Juknis (Kartu Sorotan 1)
  const docMap = portalData?.documents || {};
  const sp = portalData?.schoolProfile || {};
  const hasLogoAndAddress = Boolean(sp.logoDataUrl && sp.jalan && sp.kabupatenKota);
  const hasAllNisn = (portalData?.pasukanList || []).length >= 16;

  const ADMIN_MILESTONES = [
    { id: 'm1', step: 1, label: 'Profil & Logo', done: hasLogoAndAddress },
    { id: 'm2', step: 2, label: 'Formulir', done: Boolean(docMap['formulir-pendaftaran']) },
    { id: 'm3', step: 3, label: 'Foto Pasukan', done: Boolean(docMap['foto-pasukan']) },
    { id: 'm4', step: 4, label: 'Profil Danton', done: Boolean(docMap['profil-danton']) },
    { id: 'm5', step: 5, label: 'Surat Sekolah', done: Boolean(docMap['surat-keterangan-sekolah']) },
    { id: 'm6', step: 6, label: 'Bukti Bayar', done: Boolean(docMap['bukti-pendaftaran']) },
    { id: 'm7', step: 7, label: 'NISN & Roster', done: hasAllNisn },
  ];
  const completedMilestonesCount = ADMIN_MILESTONES.filter((m) => m.done).length;
  const adminOverviewPct = Math.round((completedMilestonesCount / ADMIN_MILESTONES.length) * 100);

  // Daftar semua personel untuk tumpukan avatar sirkular
  const allTeamMembers = [
    ...(portalData?.pasukanList || []),
    ...(portalData?.officialList || []),
  ];

  const MODULE_CARDS = [
    {
      id: 'profil',
      number: '01',
      title: 'Profil Instansi Sekolah',
      subtitle: sp.kabupatenKota ? `${sp.jalan || ''}, ${sp.kabupatenKota}` : 'Logo sekolah, NPSN, & alamat 6 kolom resmi',
      progress: progress.profilPct,
      statusText: progress.profilPct === 100 ? 'Lengkap Terisi' : `${progress.profilPct}% Terisi`,
      accentBg: 'from-teal-500/15 to-emerald-500/5',
      accentText: 'text-[#006569]',
      barColor: '#006569',
      icon: Building2,
    },
    {
      id: 'pemberkasan',
      number: '02',
      title: 'Berkas Persyaratan Juknis',
      subtitle: `${progress.berkasCount} dari 5 dokumen PDF/JPG wajib telah terunggah`,
      progress: progress.berkasPct,
      statusText: `${progress.berkasCount}/5 Dokumen`,
      accentBg: 'from-emerald-500/15 to-teal-500/5',
      accentText: 'text-emerald-700',
      barColor: '#059669',
      icon: FileText,
    },
    {
      id: 'biodata',
      number: '03',
      title: 'Komposisi Pasukan & Official',
      subtitle: `${progress.pasukanCount}/18 Pasukan (Danton, Pengibar, Baki, Inti, Cadangan) · ${progress.officialCount}/2 Official`,
      progress: progress.biodataPct,
      statusText: `${progress.biodataCount}/20 Personel`,
      accentBg: 'from-amber-500/20 to-yellow-500/5',
      accentText: 'text-amber-800',
      barColor: '#F59E0B',
      icon: Users,
      showAvatars: true,
    },
    {
      id: 'timeline',
      number: '04',
      title: 'Timeline Teknis Perlombaan',
      subtitle: 'Pendaftaran, Technical Meeting, Tes Track, hingga Hari H Pelaksanaan',
      progress: 100,
      statusText: '6 Tahap Resmi',
      accentBg: 'from-blue-500/15 to-sky-500/5',
      accentText: 'text-blue-700',
      barColor: '#2563EB',
      icon: Calendar,
    },
    {
      id: 'penilaian',
      number: '05',
      title: 'Blanko Penilaian Dewan Juri',
      subtitle: `Rekap 10 aspek penilaian (A–J), pengurangan (-${scoringSummary.totalPenalty}), & bonus (+${scoringSummary.totalBonus})`,
      progress: progress.penilaianPct,
      statusText:
        progress.scoredAspectsCount > 0
          ? `${scoringSummary.finalScore} / ${scoringSummary.totalMax} Poin`
          : 'Penilaian Tertutup',
      accentBg: 'from-purple-500/15 to-indigo-500/5',
      accentText: 'text-indigo-800',
      barColor: '#4F46E5',
      icon: Award,
    },
    {
      id: 'bantuan',
      number: '06',
      title: 'Pusat Unduh Juknis & Bantuan',
      subtitle: 'Juknis PDF resmi GERANAT, formulir blanko surat, tata tertib, dan kontak panitia siaga 24/7',
      progress: 100,
      statusText: 'Helpdesk Siaga',
      accentBg: 'from-teal-500/15 to-emerald-500/5',
      accentText: 'text-[#006569]',
      barColor: '#006569',
      icon: HelpCircle,
    },
  ];

  const selectedTimelineObj =
    OFFICIAL_TIMELINE_STAGES.find((s) => s.id === selectedTimelineId) ||
    OFFICIAL_TIMELINE_STAGES[0];

  return (
    <div className="min-h-screen bg-[#E9F0EE] py-4 sm:py-8 px-2 sm:px-5 lg:px-8 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-[#092D32] text-white border border-[#FFDD00] px-5 py-3.5 shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-fade-in">
          <CheckCircle2 size={17} className="text-[#FFDD00] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals: Ganti PIN & Log Aktivitas */}
      <OfficialPinChangeModal
        isOpen={showPinChangeModal}
        onClose={() => setShowPinChangeModal(false)}
        portalData={portalData}
        activeSlug={activeSlug}
        hasAdminAccess={hasAdminAccess}
        onPinChanged={(newPin) => {
          showToast('PIN Keamanan 6 digit berhasil diubah!');
          setPortalData((prev) => ({ ...prev, securityPin: newPin }));
        }}
      />

      <OfficialActivityLogModal
        isOpen={showActivityLogModal}
        onClose={() => setShowActivityLogModal(false)}
        portalData={portalData}
      />

      {/* ====================================================================
          OUTER BEZEL DARK TABLET CONSOLE FRAME (rounded-[3rem] bg-[#092D32] p-4 lg:p-6 border border-white/10)
          ==================================================================== */}
      <div className="mx-auto max-w-[1440px] rounded-[3rem] bg-[#092D32] p-4 lg:p-6 border border-white/10 shadow-[0_35px_90px_-20px_rgba(9,45,50,0.58)] grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 min-h-[840px]">
        {/* ==================================================================
             LEFT SIDEBAR NAVIGATION (VERTICAL DOCK)
            ================================================================== */}
        <aside className="lg:col-span-3 xl:col-span-2 text-white flex flex-col justify-between py-3 px-2 sm:px-3">
          <div className="space-y-6">
            {/* Tablet OS Top Window Dots & Brand Lockup */}
            <div className="px-2 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <span className="font-mono text-[10px] font-bold text-[#FFDD00]/80">
                  {portalData?.nomorUrut || 'KONTINGEN-01'}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="w-11 h-11 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-md overflow-hidden ring-2 ring-[#FFDD00]/50">
                  {profileForm.logoDataUrl ? (
                    <img
                      src={profileForm.logoDataUrl}
                      alt={detectedSchoolName}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src="/logo-menwa-unj.png"
                      alt="Menwa UNJ"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-mono font-black uppercase tracking-[0.2em] text-[#FFDD00] block">
                    CONSOLE OFFICIAL
                  </span>
                  <h2 className="text-sm font-black text-white truncate">
                    {detectedSchoolName}
                  </h2>
                  <span className="text-[10px] font-mono text-teal-200/80 block truncate">
                    /official/{activeSlug}
                  </span>
                </div>
              </div>
            </div>

            {/* Vertical Navigation Dock */}
            <nav aria-label="Navigasi Modul Kontingen" className="space-y-1.5">
              {DOCK_ITEMS.map((item) => {
                const IconComp = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveModule(item.id)}
                    className={`w-full px-3.5 py-3 rounded-2xl text-left text-xs font-bold flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white/15 text-[#FFDD00] font-black shadow-md ring-1 ring-[#FFDD00]/40'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <IconComp
                        size={16}
                        className={isActive ? 'text-[#FFDD00] shrink-0' : 'text-teal-300/80 shrink-0'}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <span
                      className={`font-mono text-[10px] tabular-nums shrink-0 ${
                        isActive ? 'text-[#FFDD00] font-black' : 'text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Dock Bottom Status & Exit */}
          <div className="pt-6 mt-6 border-t border-white/10 space-y-3 px-1">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-[11px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Keamanan PIN</span>
                <span className="font-mono font-bold text-[#FFDD00]">
                  {isGuestMode ? 'READ-ONLY' : 'TERKUNCI PIN'}
                </span>
              </div>
              <div className="text-[10px] text-teal-200/90 truncate">
                WA: +62 {portalData?.whatsappNumber || '-'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/geranat#portal-official')}
              className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Kembali ke GERANAT</span>
            </button>
          </div>
        </aside>

        {/* ==================================================================
            FLOATING GLASSMORPHIC WORKSPACE CANVAS (rounded-[2.5rem] bg-white/92 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl)
            ================================================================== */}
        <section className="lg:col-span-9 xl:col-span-10 rounded-[2.5rem] bg-white/92 backdrop-blur-2xl text-[#092D32] shadow-2xl border border-white/80 p-6 sm:p-10 flex flex-col justify-between space-y-7 overflow-y-auto">
          <div className="space-y-6">
            {/* 1. TOP HEADER & ACTION BAR */}
            <header className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-5 border-b border-slate-200/80">
              <div className="flex items-start sm:items-center gap-3.5">
                {activeModule !== 'beranda' && (
                  <button
                    type="button"
                    onClick={() => setActiveModule('beranda')}
                    className="p-2.5 rounded-2xl neu-btn text-[#092D32] hover:text-[#006569] cursor-pointer shrink-0"
                    title="Kembali ke Beranda Kontingen"
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}
                <div>
                  {/* Breadcrumb Navigasi */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-[#64748B]">
                    <span>Portal Official</span>
                    <ChevronRight size={13} className="text-slate-400" />
                    <span className="text-[#006569]">{detectedSchoolName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-[#092D32]">
                      {isGuestMode ? 'Mode Tamu (Hanya Baca)' : 'Dilindungi 6-Digit PIN'}
                    </span>
                  </div>
                  <h1 className="mt-1 text-xl sm:text-2xl font-black text-[#092D32] tracking-tight">
                    {detectedSchoolName}
                  </h1>
                </div>
              </div>

              {/* Action Group (3D Neumorphic Buttons) */}
              <div className="flex flex-wrap items-center gap-2.5">
                {hasAdminAccess && allPortals.length > 1 && (
                  <div className="neu-inset rounded-2xl px-3 py-1.5">
                    <select
                      value={activeSlug}
                      onChange={(e) => navigate(`/official/${e.target.value}`)}
                      style={{ color: '#020617' }}
                      className="bg-transparent text-xs font-bold text-slate-950 focus:outline-none"
                    >
                      {allPortals.map((p) => (
                        <option key={p.schoolSlug} value={p.schoolSlug}>
                          Kontingen: {p.schoolName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCopySubdomainLink}
                  className="px-3.5 py-2.5 rounded-2xl neu-btn text-[#092D32] text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title="Salin Tautan Subdomain Kontingen"
                >
                  <Share2 size={14} className="text-[#006569]" />
                  <span>Salin Link</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintBukuPasukan}
                  className="px-4 py-2.5 rounded-2xl neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white text-xs font-black flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-md hover:shadow-lg transition-all"
                >
                  <Printer size={14} />
                  <span>Cetak Buku Pasukan A4</span>
                </button>

                {canEdit && (
                  <button
                    type="button"
                    disabled={savingSnapshot}
                    onClick={handleSaveManualSnapshot}
                    className="px-3.5 py-2.5 rounded-2xl neu-btn text-[#092D32] text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    title="Cadangkan data kontingen saat ini"
                  >
                    <Save size={14} className="text-[#006569]" />
                    <span>{savingSnapshot ? 'Menyimpan...' : 'Snapshot Data'}</span>
                  </button>
                )}

                {canEdit && portalData?.snapshotBackup && (
                  <button
                    type="button"
                    disabled={restoringSnapshot}
                    onClick={handleRestoreSnapshotAction}
                    className="px-3.5 py-2.5 rounded-2xl neu-btn-gold text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw size={13} />
                    <span>Pulihkan</span>
                  </button>
                )}

                {!isGuestMode && (
                  <button
                    type="button"
                    onClick={() => setShowActivityLogModal(true)}
                    className="p-2.5 rounded-2xl neu-btn text-[#092D32] cursor-pointer"
                    title="Riwayat Log Aktivitas"
                  >
                    <History size={15} />
                  </button>
                )}

                {!isGuestMode && (
                  <button
                    type="button"
                    onClick={() => setShowPinChangeModal(true)}
                    className="p-2.5 rounded-2xl neu-btn text-[#092D32] cursor-pointer"
                    title="Ganti 6-Digit PIN Keamanan"
                  >
                    <KeyRound size={15} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLockSession}
                  className="px-3.5 py-2.5 rounded-2xl neu-btn text-[#E11D48] text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Lock size={13} />
                  <span>{isGuestMode ? 'Keluar Mode Tamu' : 'Kunci Sesi'}</span>
                </button>
              </div>
            </header>

            {/* BANNER MODE TAMU (HIGH CONTRAST: bg-[#092D32] border-[#FFDD00] text-white) */}
            {isGuestMode && (
              <div className="rounded-2xl bg-[#092D32] border-2 border-[#FFDD00] p-4 sm:p-5 text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FFDD00] text-[#092D32] flex items-center justify-center font-black shrink-0">
                    <Eye size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#FFDD00] uppercase tracking-wide">
                      Mode Tamu / Peninjau Aktif (Hanya Baca)
                    </h4>
                    <p className="text-xs text-slate-200 mt-0.5">
                      Seluruh fitur ubah profil, unggah berkas, dan tambah/hapus personel dikunci. Buka PIN Official untuk mengelola kontingen.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.removeItem('menwa_official_guest_' + activeSlug);
                    setIsGuestMode(false);
                    setIsUnlocked(false);
                  }}
                  className="px-4 py-2.5 rounded-2xl neu-btn-gold text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <KeyRound size={14} />
                  <span>Masukkan PIN Official</span>
                </button>
              </div>
            )}

            {/* ================================================================
                MODULE 0: BERANDA KONTINGEN ("CLASS MANAGEMENT CONSOLE VIEW")
                ================================================================ */}
            {activeModule === 'beranda' && (
              <div className="space-y-8 animate-fade-in">
                {/* DUA KARTU SOROTAN UTAMA (TOP HIGHLIGHT CARDS) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  {/* KARTU SOROTAN 1: KELENGKAPAN ADMINISTRASI & BERKAS */}
                  <div className="relative rounded-[2.25rem] neu-card p-6 flex flex-col justify-between overflow-hidden">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-14 h-14 rounded-2xl neu-logo-tile flex items-center justify-center text-[#006569] shrink-0">
                            <FolderOpen size={26} />
                          </div>
                          <div>
                            <span className="text-[11px] font-black uppercase tracking-wider text-[#006569]">
                              SOROTAN ADMINISTRASI
                            </span>
                            <h3 className="text-lg font-black text-[#092D32] leading-snug">
                              Kelengkapan Berkas &amp; Juknis
                            </h3>
                            <p className="text-xs text-[#64748B] mt-0.5">
                              {completedMilestonesCount} dari 7 persyaratan utama terverifikasi
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono text-2xl font-black text-[#006569] tabular-nums">
                            {adminOverviewPct}%
                          </span>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">
                            Tuntas
                          </span>
                        </div>
                      </div>

                      {/* Step Milestones Bulatan Angka (1 s.d 7) */}
                      <div className="mt-6">
                        <div className="flex items-center justify-between gap-1">
                          {ADMIN_MILESTONES.map((ms) => (
                            <div
                              key={ms.id}
                              className="flex flex-col items-center flex-1 text-center"
                            >
                              <div
                                className={`w-7 h-7 rounded-full font-mono text-[11px] font-black flex items-center justify-center transition ${
                                  ms.done
                                    ? 'bg-[#006569] text-[#FFDD00] shadow-xs'
                                    : 'neu-inset text-slate-400'
                                }`}
                              >
                                {ms.done ? <Check size={13} /> : ms.step}
                              </div>
                              <span className="mt-1.5 text-[10px] font-bold text-slate-600 line-clamp-1">
                                {ms.label}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 w-full h-2.5 rounded-full neu-inset overflow-hidden p-0.5">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(6, adminOverviewPct)}%`,
                              background: 'linear-gradient(90deg, #006569 0%, #059669 100%)',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200/70 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-500">
                        Berkas wajib: <strong className="font-mono text-[#092D32]">{progress.berkasCount}/5</strong> terunggah
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveModule('pemberkasan')}
                        className="px-4 py-2.5 rounded-2xl neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg transition-all"
                      >
                        <span>Kelola Berkas</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* KARTU SOROTAN 2: STATUS PASUKAN & PENILAIAN EVALUASI */}
                  <div className="relative rounded-[2.25rem] neu-card p-6 flex flex-col justify-between overflow-hidden">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 shrink-0">
                            <Users size={26} />
                          </div>
                          <div>
                            <span className="text-[11px] font-black uppercase tracking-wider text-amber-700">
                              SOROTAN PASUKAN &amp; EVALUASI
                            </span>
                            <h3 className="text-lg font-black text-[#092D32] leading-snug">
                              Kuota Personel &amp; Rekap Juri
                            </h3>
                            <p className="text-xs text-[#64748B] mt-0.5">
                              16 Pasukan Inti + 2 Cadangan + 2 Official Pendamping
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono text-2xl font-black text-[#092D32] tabular-nums">
                            {progress.biodataCount}<span className="text-sm text-slate-400">/20</span>
                          </span>
                          <span className="block text-[10px] font-bold text-amber-700 uppercase">
                            Personel
                          </span>
                        </div>
                      </div>

                      {/* Rincian Kuota & Status Evaluasi Dewan Juri */}
                      <div className="mt-5 grid grid-cols-3 gap-2.5">
                        <div className="rounded-xl bg-[#F5F8F6] border border-slate-200/80 p-3">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">
                            Pasukan Peleton
                          </span>
                          <strong className="font-mono text-base font-black text-[#092D32] tabular-nums">
                            {progress.pasukanCount} / 18
                          </strong>
                        </div>
                        <div className="rounded-xl bg-[#F5F8F6] border border-slate-200/80 p-3">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">
                            Official Tim
                          </span>
                          <strong className="font-mono text-base font-black text-[#006569] tabular-nums">
                            {progress.officialCount} / 2
                          </strong>
                        </div>
                        <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3">
                          <span className="text-[10px] font-bold text-amber-800 uppercase block">
                            Skor Evaluasi
                          </span>
                          <strong className="font-mono text-base font-black text-amber-900 tabular-nums">
                            {progress.scoredAspectsCount > 0
                              ? `${scoringSummary.finalScore} Poin`
                              : 'Tertutup'}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      {/* Avatar Stack */}
                      <div className="flex items-center gap-2">
                        {allTeamMembers.length > 0 ? (
                          <div className="flex -space-x-2 overflow-hidden">
                            {allTeamMembers.slice(0, 5).map((m, i) => (
                              <div
                                key={m.id || i}
                                className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-slate-200 overflow-hidden"
                                title={m.fullName}
                              >
                                {m.photoDataUrl ? (
                                  <img
                                    src={m.photoDataUrl}
                                    alt={m.fullName}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-slate-700">
                                    {(m.fullName || 'P')[0]}
                                  </span>
                                )}
                              </div>
                            ))}
                            {allTeamMembers.length > 5 && (
                              <span className="inline-flex h-7 px-2 items-center justify-center rounded-full bg-[#092D32] text-[#FFDD00] ring-2 ring-white font-mono text-[10px] font-black">
                                +{allTeamMembers.length - 5} lainnya
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            Belum ada personel diinput
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveModule('biodata')}
                          className="px-4 py-2.5 rounded-2xl neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg transition-all"
                        >
                          <span>Biodata Tim</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GRID KARTU MODULAR BAWAH ("ALL MODULES GRID" — 3D NEUMORPHIC CUSHIONS) */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-[#092D32]">
                        Semua Modul Manajemen Kontingen
                      </h3>
                      <p className="text-xs text-[#64748B]">
                        Pilih modul untuk melengkapi data sekolah, berkas, biodata 20 anggota, jadwal teknis, atau melihat lembar nilai juri.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {MODULE_CARDS.map((card) => {
                      const IconComp = card.icon;
                      return (
                        <div
                          key={card.id}
                          onClick={() => setActiveModule(card.id)}
                          className="group cursor-pointer rounded-3xl neu-card p-5 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                        >
                          <div>
                            {/* Header Aksen Lembut */}
                            <div
                              className={`rounded-2xl bg-gradient-to-r ${card.accentBg} p-4 flex items-center justify-between mb-4`}
                            >
                              <div className="w-11 h-11 rounded-2xl neu-logo-tile flex items-center justify-center text-[#092D32]">
                                <IconComp size={22} className="text-[#006569]" />
                              </div>
                              <span
                                className={`font-mono text-xs font-black ${card.accentText} tabular-nums`}
                              >
                                {card.statusText}
                              </span>
                            </div>

                            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                              MODUL {card.number}
                            </div>
                            <h4 className="text-base font-black text-[#092D32] group-hover:text-[#006569] transition mt-0.5">
                              {card.title}
                            </h4>
                            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                              {card.subtitle}
                            </p>
                          </div>

                          <div className="mt-5 pt-3.5 border-t border-slate-200/60 space-y-2.5">
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="text-slate-500">Progres Modul</span>
                              <span className="font-mono font-black text-[#092D32] tabular-nums">
                                {card.progress}%
                              </span>
                            </div>
                            <div className="w-full h-2.5 rounded-full neu-inset overflow-hidden p-0.5">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.max(6, card.progress)}%`,
                                  backgroundColor: card.barColor,
                                }}
                              />
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              {card.showAvatars && allTeamMembers.length > 0 ? (
                                <div className="flex items-center -space-x-1.5">
                                  {allTeamMembers.slice(0, 4).map((m, idx) => (
                                    <div
                                      key={m.id || idx}
                                      className="h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 overflow-hidden"
                                    >
                                      {m.photoDataUrl ? (
                                        <img
                                          src={m.photoDataUrl}
                                          alt=""
                                          className="h-full w-full object-cover"
                                        />
                                      ) : null}
                                    </div>
                                  ))}
                                  {allTeamMembers.length > 4 && (
                                    <span className="pl-2.5 font-mono text-[10px] font-bold text-slate-500">
                                      +{allTeamMembers.length - 4} lainnya
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[11px] font-bold text-slate-400">
                                  Klik untuk membuka
                                </span>
                              )}

                              <span className="inline-flex items-center gap-1 text-xs font-black px-3.5 py-1.5 rounded-xl bg-slate-100 group-hover:bg-[#006569] text-[#092D32] group-hover:text-[#FFDD00] transition-all shadow-xs">
                                <span>Buka</span>
                                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================
                MODULE 1: PROFIL SEKOLAH
                ================================================================ */}
            {activeModule === 'profil' && (
              <div className="neu-card rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/70 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#006569] block">
                      MODUL 01 · IDENTITAS KONTINGEN SEKOLAH
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-[#092D32]">
                      Profil Instansi Sekolah
                    </h2>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Nama dan logo sekolah pada modul ini otomatis terdeteksi pada Kartu ID Pasukan dan Buku Pasukan A4.
                    </p>
                  </div>
                  <span className="font-mono text-xs font-black text-[#059669]">
                    Kelengkapan: {progress.profilPct}%
                  </span>
                </div>

                <form onSubmit={handleSaveSchoolProfile} className="space-y-6">
                  {/* a. Logo Sekolah */}
                  <div
                    ref={(el) => {
                      profileFieldRefs.current.logoDataUrl = el;
                    }}
                    className={`rounded-2xl border-2 border-dashed p-5 transition ${
                      profileErrors.logoDataUrl
                        ? 'border-[#E11D48] bg-rose-50/50'
                        : 'border-[#006569]/30 bg-[#F5F8F6]'
                    }`}
                  >
                    <label className="block text-xs font-black uppercase tracking-wider text-[#092D32] mb-1">
                      a. Logo Sekolah (Wajib .jpg, .png, .svg, .webp · Maksimal 100 KB) *
                    </label>
                    <div className="flex flex-wrap items-center gap-5 mt-3">
                      <div className="w-24 h-24 rounded-2xl neu-logo-tile flex items-center justify-center overflow-hidden p-2 shrink-0">
                        {profileForm.logoDataUrl ? (
                          <img
                            src={profileForm.logoDataUrl}
                            alt="Logo Sekolah"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building2 size={32} className="text-slate-300" />
                        )}
                      </div>
                      <div className="space-y-2">
                        {canEdit ? (
                          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl neu-btn-primary text-[#FFDD00] font-black text-xs uppercase tracking-wider cursor-pointer transition">
                            <Upload size={14} />
                            <span>Pilih File Logo Sekolah</span>
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.svg,.webp,image/jpeg,image/png,image/svg+xml,image/webp"
                              onChange={handleSchoolLogoChange}
                              className="hidden"
                            />
                          </label>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl neu-inset text-slate-500 font-bold text-xs select-none">
                            <Lock size={13} /> Logo Terkunci (Mode Tamu)
                          </span>
                        )}
                        {profileForm.logoFileName && (
                          <p className="text-xs font-bold text-[#059669]">
                            ✓ {profileForm.logoFileName} ({profileForm.logoSizeKb} KB)
                          </p>
                        )}
                        {profileErrors.logoDataUrl && (
                          <p className="text-xs font-bold text-[#E11D48] flex items-center gap-1">
                            <AlertCircle size={14} /> {profileErrors.logoDataUrl}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* b. Nama Sekolah */}
                  <div
                    ref={(el) => {
                      profileFieldRefs.current.schoolName = el;
                    }}
                  >
                    <label className="block text-xs font-black uppercase tracking-wider text-[#092D32] mb-1.5">
                      b. Nama Sekolah *
                    </label>
                    <div
                      className={`neu-inset rounded-2xl px-4 py-3 ${
                        profileErrors.schoolName ? 'ring-2 ring-[#E11D48]/30' : ''
                      }`}
                    >
                      <input
                        type="text"
                        value={profileForm.schoolName}
                        onChange={(e) => {
                          setProfileForm({ ...profileForm, schoolName: e.target.value });
                          if (profileErrors.schoolName) {
                            setProfileErrors({ ...profileErrors, schoolName: '' });
                          }
                        }}
                        disabled={!canEdit}
                        readOnly={!canEdit}
                        style={{ color: '#020617' }}
                        placeholder="Contoh: SMA Negeri 1 Jakarta"
                        className={`w-full bg-transparent text-sm font-bold text-slate-950 focus:outline-none ${
                          !canEdit ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                    {profileErrors.schoolName && (
                      <p className="mt-1 text-xs font-bold text-[#E11D48]">
                        {profileErrors.schoolName}
                      </p>
                    )}
                  </div>

                  {/* c. Alamat Sekolah (6 Sub-Field Terstruktur) */}
                  <div className="space-y-4 pt-2 border-t border-slate-200/70">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#092D32]">
                      c. Alamat Lengkap Sekolah *
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: 'jalan', label: 'Nama Jalan', placeholder: 'Jl. Budi Utomo No. 7' },
                        { key: 'rtRw', label: 'RT / RW', placeholder: 'RT 004 / RW 008' },
                        { key: 'kelurahan', label: 'Kelurahan', placeholder: 'Pasar Baru' },
                        { key: 'kecamatan', label: 'Kecamatan', placeholder: 'Sawah Besar' },
                        { key: 'kabupatenKota', label: 'Kabupaten / Kota', placeholder: 'Kota Jakarta Pusat' },
                        { key: 'provinsi', label: 'Provinsi', placeholder: 'DKI Jakarta' },
                      ].map((field) => (
                        <div
                          key={field.key}
                          ref={(el) => {
                            profileFieldRefs.current[field.key] = el;
                          }}
                        >
                          <label className="block text-xs font-bold text-[#092D32] mb-1">
                            {field.label} *
                          </label>
                          <div
                            className={`neu-inset rounded-xl px-3.5 py-2.5 ${
                              profileErrors[field.key] ? 'ring-2 ring-[#E11D48]/30' : ''
                            }`}
                          >
                            <input
                              type="text"
                              value={profileForm[field.key]}
                              onChange={(e) => {
                                setProfileForm({
                                  ...profileForm,
                                  [field.key]: e.target.value,
                                });
                                if (profileErrors[field.key]) {
                                  setProfileErrors({ ...profileErrors, [field.key]: '' });
                                }
                              }}
                              disabled={!canEdit}
                              readOnly={!canEdit}
                              style={{ color: '#020617' }}
                              placeholder={field.placeholder}
                              className={`w-full bg-transparent text-xs sm:text-sm font-bold text-slate-950 focus:outline-none ${
                                !canEdit ? 'opacity-70 cursor-not-allowed' : ''
                              }`}
                            />
                          </div>
                          {profileErrors[field.key] && (
                            <p className="mt-1 text-[11px] font-bold text-[#E11D48]">
                              {profileErrors[field.key]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {canEdit && (
                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-6 py-3.5 rounded-2xl neu-btn-primary text-[#FFDD00] font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2"
                      >
                        <Check size={16} />
                        <span>{savingProfile ? 'Menyimpan Profil...' : 'Simpan Profil Sekolah'}</span>
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* ================================================================
                MODULE 2: PEMBERKASAN (5 DOKUMEN WAJIB + UNDUH TEMPLATE)
                ================================================================ */}
            {activeModule === 'pemberkasan' && (
              <div className="neu-card rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/70 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#059669] block">
                      MODUL 02 · ADMINISTRASI KONTINGEN
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-[#092D32]">
                      Pemberkasan Dokumen Wajib
                    </h2>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Unduh template resmi di samping tombol Upload, lalu unggah dokumen yang telah dilengkapi.
                    </p>
                  </div>
                  <span className="font-mono text-xs font-black text-[#059669]">
                    {progress.berkasCount} / 5 Dokumen Terunggah ({progress.berkasPct}%)
                  </span>
                </div>

                {docUploadError && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-[#E11D48]/30 text-[#E11D48] text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{docUploadError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {OFFICIAL_REQUIRED_DOCUMENTS.map((docItem) => {
                    const uploaded = portalData?.documents?.[docItem.id];
                    const isVerified = uploaded?.status === 'terverifikasi';
                    return (
                      <div
                        key={docItem.id}
                        className={`rounded-2xl neu-card-sm p-5 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                          uploaded ? 'ring-1 ring-[#059669]/35' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                              uploaded
                                ? 'bg-[#059669] text-white'
                                : 'bg-[#092D32] text-[#FFDD00]'
                            }`}
                          >
                            {docItem.code.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-black text-[#092D32]">
                                {docItem.code}. {docItem.title}
                              </h4>
                              <span className="text-xs font-bold text-[#006569]">
                                · {uploaded ? (isVerified ? 'Terverifikasi Admin' : 'Terunggah') : 'Belum Diunggah'}
                              </span>
                            </div>
                            <p className="text-xs text-[#64748B] mt-1">{docItem.desc}</p>
                            {uploaded && (
                              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-[#059669]">
                                <span>
                                  {uploaded.fileName} ({uploaded.fileSizeKb || 0} KB)
                                </span>
                                {uploaded.fileDataUrl && (
                                  <a
                                    href={uploaded.fileDataUrl}
                                    download={uploaded.fileName}
                                    className="text-[#006569] underline hover:text-[#092D32]"
                                  >
                                    Lihat / Unduh Berkas
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                          <a
                            href={docItem.templateUrl}
                            download
                            className="px-3.5 py-2.5 rounded-2xl neu-btn bg-white hover:bg-slate-50 text-[#092D32] border border-slate-200/90 font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                          >
                            <Download size={14} className="text-[#006569]" />
                            <span>Unduh Template</span>
                          </a>

                          {canEdit && (
                            <label className="px-4 py-2.5 rounded-2xl neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition shadow-md hover:shadow-lg">
                              <Upload size={14} />
                              <span>
                                {uploadingDocId === docItem.id
                                  ? 'Mengunggah...'
                                  : uploaded
                                  ? 'Ganti File'
                                  : 'Upload'}
                              </span>
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                onChange={(e) => handleDocumentUpload(docItem, e)}
                                className="hidden"
                              />
                            </label>
                          )}

                          {uploaded && hasAdminAccess && (
                            <button
                              type="button"
                              onClick={() => handleVerifyDocumentByAdmin(docItem.id)}
                              className="px-3 py-2.5 rounded-2xl bg-[#059669] hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                            >
                              {isVerified ? 'Batalkan Verifikasi' : 'Verifikasi'}
                            </button>
                          )}

                          {uploaded && canEdit && (
                            <button
                              type="button"
                              onClick={() => handleDeleteDocument(docItem.id, docItem.title)}
                              className="p-2.5 rounded-2xl neu-btn text-[#E11D48] transition cursor-pointer"
                              title="Hapus Berkas"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================================================================
                MODULE 3: BIODATA TIM (18 PASUKAN + 2 OFFICIAL = 20 DATA)
                ================================================================ */}
            {activeModule === 'biodata' && (
              <div className="space-y-6 animate-fade-in">
                <div className="neu-card rounded-3xl p-6 sm:p-8 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#006569] block">
                        MODUL 03 · KUOTA TERKUNCI 20 PERSONEL (18 PASUKAN + 2 OFFICIAL)
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-[#092D32]">
                        Biodata Pasukan &amp; Cetak Kartu ID
                      </h2>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Asal sekolah otomatis terdeteksi:{' '}
                        <strong className="text-[#092D32]">{detectedSchoolName}</strong>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {canEdit && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPasukanId(null);
                              setPasukanErrors({});
                              setShowPasukanForm((prev) => !prev);
                              setShowOfficialForm(false);
                            }}
                            disabled={(portalData?.pasukanList?.length || 0) >= 18 && !showPasukanForm}
                            className="px-4 py-2.5 rounded-2xl neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] disabled:opacity-40 text-[#FFDD00] hover:text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-md"
                          >
                            <UserPlus size={15} />
                            <span>Tambah Pasukan ({portalData?.pasukanList?.length || 0}/18)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingOfficialId(null);
                              setOfficialErrors({});
                              setShowOfficialForm((prev) => !prev);
                              setShowPasukanForm(false);
                            }}
                            disabled={(portalData?.officialList?.length || 0) >= 2 && !showOfficialForm}
                            className="px-4 py-2.5 rounded-2xl neu-btn disabled:opacity-40 text-[#092D32] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Plus size={15} className="text-[#006569]" />
                            <span>Tambah Official ({portalData?.officialList?.length || 0}/2)</span>
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={handleDownloadTeamCardsPdf}
                        disabled={progress.biodataCount === 0}
                        className="px-4 py-2.5 rounded-2xl neu-btn-gold disabled:opacity-40 text-[#092D32] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Printer size={15} />
                        <span>Cetak 20 ID Card (PDF)</span>
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl neu-card-sm p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#092D32]">
                        Progres Pengisian Biodata Kontingen ({progress.biodataCount} / 20 Data)
                      </span>
                      <span className="font-mono font-black text-[#059669] tabular-nums">
                        {progress.biodataPct}% Selesai
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full neu-inset overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress.biodataPct}%`,
                          background: 'linear-gradient(90deg, #006569 0%, #059669 100%)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* FORM TAMBAH / EDIT PASUKAN */}
                {canEdit && showPasukanForm && (
                  <div className="neu-card rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                      <h3 className="text-base sm:text-lg font-black text-[#092D32]">
                        {editingPasukanId ? 'Edit Biodata Pasukan' : 'Form Tambah Pasukan Baru'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasukanForm(false);
                          setEditingPasukanId(null);
                        }}
                        className="p-2 rounded-2xl neu-btn text-slate-600 hover:text-slate-950 cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleSubmitPasukan} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div
                          ref={(el) => {
                            pasukanFieldRefs.current.photoDataUrl = el;
                          }}
                          className={`rounded-2xl border-2 border-dashed p-4 ${
                            pasukanErrors.photoDataUrl
                              ? 'border-[#E11D48] bg-rose-50/50'
                              : 'border-[#006569]/30 bg-[#F5F8F6]'
                          }`}
                        >
                          <label className="block text-xs font-black uppercase text-[#092D32] mb-1">
                            a. Foto Profil (.jpg, .png, .svg, .webp · Maks 100 KB) *
                          </label>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="w-16 h-20 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                              {pasukanForm.photoDataUrl ? (
                                <img
                                  src={pasukanForm.photoDataUrl}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Users size={22} className="text-slate-300" />
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white font-black text-xs uppercase cursor-pointer shadow-sm">
                                <Upload size={13} /> Pilih Foto
                                <input
                                  type="file"
                                  accept=".jpg,.jpeg,.png,.svg,.webp"
                                  onChange={handlePasukanPhotoChange}
                                  className="hidden"
                                />
                              </label>
                              {pasukanForm.photoFileName && (
                                <p className="text-[11px] font-bold text-[#059669]">
                                  ✓ {pasukanForm.photoFileName} ({pasukanForm.photoSizeKb} KB)
                                </p>
                              )}
                              {pasukanErrors.photoDataUrl && (
                                <p className="text-[11px] font-bold text-[#E11D48]">
                                  {pasukanErrors.photoDataUrl}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div
                          ref={(el) => {
                            pasukanFieldRefs.current.fullName = el;
                          }}
                        >
                          <label className="block text-xs font-black uppercase text-[#092D32] mb-1">
                            b. Nama Lengkap *
                          </label>
                          <div className="neu-inset rounded-xl px-3.5 py-2.5">
                            <input
                              type="text"
                              value={pasukanForm.fullName}
                              onChange={(e) => {
                                setPasukanForm({ ...pasukanForm, fullName: e.target.value });
                                if (pasukanErrors.fullName) {
                                  setPasukanErrors({ ...pasukanErrors, fullName: '' });
                                }
                              }}
                              style={{ color: '#020617' }}
                              placeholder="Masukkan nama lengkap anggota pasukan"
                              className="w-full bg-transparent text-sm font-bold text-slate-950 focus:outline-none"
                            />
                          </div>
                          {pasukanErrors.fullName && (
                            <p className="mt-1 text-xs font-bold text-[#E11D48]">
                              {pasukanErrors.fullName}
                            </p>
                          )}

                          <label className="block text-xs font-black uppercase text-[#092D32] mt-3 mb-1">
                            c. Asal Sekolah (Otomatis Terdeteksi)
                          </label>
                          <div className="neu-inset rounded-xl px-3.5 py-2.5 opacity-80">
                            <input
                              type="text"
                              readOnly
                              value={detectedSchoolName}
                              style={{ color: '#020617' }}
                              className="w-full bg-transparent text-xs font-bold text-slate-950 cursor-not-allowed focus:outline-none"
                            />
                          </div>
                        </div>

                        <div
                          ref={(el) => {
                            pasukanFieldRefs.current.position = el;
                          }}
                        >
                          <label className="block text-xs font-black uppercase text-[#092D32] mb-1">
                            d. Posisi Dalam Pasukan *
                          </label>
                          <div className="neu-inset rounded-xl px-3.5 py-2.5">
                            <select
                              value={pasukanForm.position}
                              onChange={(e) =>
                                setPasukanForm({ ...pasukanForm, position: e.target.value })
                              }
                              style={{ color: '#020617' }}
                              className="w-full bg-transparent text-sm font-bold text-slate-950 focus:outline-none"
                            >
                              {PASUKAN_POSITIONS.map((pos) => (
                                <option key={pos} value={pos}>
                                  {pos}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div
                          ref={(el) => {
                            pasukanFieldRefs.current.nisn = el;
                          }}
                        >
                          <label className="block text-xs font-black uppercase text-[#092D32] mb-1">
                            e. NISN (Wajib Berupa Angka) *
                          </label>
                          <div className="neu-inset rounded-xl px-3.5 py-2.5">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={pasukanForm.nisn}
                              onChange={(e) => {
                                setPasukanForm({ ...pasukanForm, nisn: e.target.value });
                                if (pasukanErrors.nisn) {
                                  setPasukanErrors({ ...pasukanErrors, nisn: '' });
                                }
                              }}
                              style={{ color: '#020617' }}
                              placeholder="Contoh: 0081234567"
                              className="w-full bg-transparent font-mono text-sm font-bold text-slate-950 focus:outline-none"
                            />
                          </div>
                          {pasukanErrors.nisn && (
                            <p className="mt-1 text-xs font-bold text-[#E11D48]">
                              {pasukanErrors.nisn}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200/70 flex flex-col items-center">
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#64748B] mb-3">
                          LIVE PREVIEW KARTU ID PASUKAN
                        </span>
                        <TeamIdCardPreview
                          person={pasukanForm}
                          schoolName={detectedSchoolName}
                          schoolLogo={profileForm.logoDataUrl}
                          type="PASUKAN"
                          indexNumber={(portalData?.pasukanList?.length || 0) + 1}
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-3 border-t border-slate-200/70">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasukanForm(false);
                            setEditingPasukanId(null);
                          }}
                          className="px-5 py-2.5 rounded-2xl neu-btn text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-3 rounded-2xl neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-md hover:shadow-lg transition-all"
                        >
                          Simpan Biodata Pasukan
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* FORM TAMBAH / EDIT OFFICIAL */}
                {canEdit && showOfficialForm && (
                  <div className="neu-card rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                      <h3 className="text-base sm:text-lg font-black text-[#092D32]">
                        {editingOfficialId ? 'Edit Biodata Official' : 'Form Tambah Biodata Official'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowOfficialForm(false);
                          setEditingOfficialId(null);
                        }}
                        className="p-2 rounded-2xl neu-btn text-slate-600 hover:text-slate-950 cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleSubmitOfficial} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div
                          ref={(el) => {
                            officialFieldRefs.current.photoDataUrl = el;
                          }}
                          className={`rounded-2xl border-2 border-dashed p-4 ${
                            officialErrors.photoDataUrl
                              ? 'border-[#E11D48] bg-rose-50/50'
                              : 'border-[#092D32]/30 bg-[#F5F8F6]'
                          }`}
                        >
                          <label className="block text-xs font-black uppercase text-[#092D32] mb-1">
                            a. Foto Profil (.jpg, .png, .svg, .webp · Maks 100 KB) *
                          </label>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="w-16 h-20 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                              {officialForm.photoDataUrl ? (
                                <img
                                  src={officialForm.photoDataUrl}
                                  alt="Preview Official"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Users size={22} className="text-slate-300" />
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white font-black text-xs uppercase cursor-pointer shadow-sm">
                                <Upload size={13} /> Pilih Foto
                                <input
                                  type="file"
                                  accept=".jpg,.jpeg,.png,.svg,.webp"
                                  onChange={handleOfficialPhotoChange}
                                  className="hidden"
                                />
                              </label>
                              {officialForm.photoFileName && (
                                <p className="text-[11px] font-bold text-[#059669]">
                                  ✓ {officialForm.photoFileName} ({officialForm.photoSizeKb} KB)
                                </p>
                              )}
                              {officialErrors.photoDataUrl && (
                                <p className="text-[11px] font-bold text-[#E11D48]">
                                  {officialErrors.photoDataUrl}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div
                            ref={(el) => {
                              officialFieldRefs.current.fullName = el;
                            }}
                          >
                            <label className="block text-xs font-black uppercase text-[#092D32] mb-1">
                              b. Nama Lengkap Official *
                            </label>
                            <div className="neu-inset rounded-xl px-3.5 py-2.5">
                              <input
                                type="text"
                                value={officialForm.fullName}
                                onChange={(e) => {
                                  setOfficialForm({ ...officialForm, fullName: e.target.value });
                                  if (officialErrors.fullName) {
                                    setOfficialErrors({ ...officialErrors, fullName: '' });
                                  }
                                }}
                                style={{ color: '#020617' }}
                                placeholder="Nama lengkap pelatih / official pendamping"
                                className="w-full bg-transparent text-sm font-bold text-slate-950 focus:outline-none"
                              />
                            </div>
                            {officialErrors.fullName && (
                              <p className="mt-1 text-xs font-bold text-[#E11D48]">
                                {officialErrors.fullName}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-black uppercase text-[#092D32] mb-1">
                              c. Posisi Official *
                            </label>
                            <div className="neu-inset rounded-xl px-3.5 py-2.5">
                              <select
                                value={officialForm.position}
                                onChange={(e) =>
                                  setOfficialForm({ ...officialForm, position: e.target.value })
                                }
                                style={{ color: '#020617' }}
                                className="w-full bg-transparent text-sm font-bold text-slate-950 focus:outline-none"
                              >
                                {OFFICIAL_POSITIONS.map((pos) => (
                                  <option key={pos} value={pos}>
                                    {pos}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-3 border-t border-slate-200/70">
                        <button
                          type="button"
                          onClick={() => {
                            setShowOfficialForm(false);
                            setEditingOfficialId(null);
                          }}
                          className="px-5 py-2.5 rounded-2xl neu-btn text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-3 rounded-2xl neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-md hover:shadow-lg transition-all"
                        >
                          Simpan Biodata Official
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* DAFTAR KARTU ID PASUKAN & OFFICIAL */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                  <h3 className="text-base font-black text-[#092D32]">
                    Daftar Kartu Pasukan ({portalData?.pasukanList?.length || 0}/18) &amp; Official ({portalData?.officialList?.length || 0}/2)
                  </h3>

                  {(portalData?.pasukanList?.length || 0) === 0 &&
                  (portalData?.officialList?.length || 0) === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center space-y-3 bg-[#F5F8F6]">
                      <Users size={36} className="mx-auto text-slate-300" />
                      <p className="text-sm font-bold text-[#092D32]">
                        Belum ada data Pasukan atau Official yang diinput.
                      </p>
                      {canEdit && (
                        <p className="text-xs text-[#64748B]">
                          Gunakan tombol <strong>Tambah Pasukan</strong> atau{' '}
                          <strong>Tambah Official</strong> di atas untuk mulai mengisi.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                      {(portalData?.pasukanList || []).map((p, idx) => (
                        <div key={p.id} className="flex flex-col items-center gap-2 w-full">
                          <TeamIdCardPreview
                            person={p}
                            schoolName={detectedSchoolName}
                            schoolLogo={profileForm.logoDataUrl}
                            type="PASUKAN"
                            indexNumber={idx + 1}
                          />
                          {canEdit && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPasukanId(p.id);
                                  setPasukanForm({
                                    photoDataUrl: p.photoDataUrl || '',
                                    photoFileName: p.photoFileName || '',
                                    photoSizeKb: p.photoSizeKb || 0,
                                    fullName: p.fullName || '',
                                    position: p.position || 'Pasukan Inti',
                                    nisn: p.nisn || '',
                                  });
                                  setShowPasukanForm(true);
                                  setShowOfficialForm(false);
                                }}
                                className="px-3 py-1 rounded-lg bg-[#F5F8F6] hover:bg-slate-200 text-[#092D32] text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 size={12} /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePasukan(p.id, p.fullName)}
                                className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#E11D48] text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 size={12} /> Hapus
                              </button>
                            </div>
                          )}
                        </div>
                      ))}

                      {(portalData?.officialList || []).map((o, idx) => (
                        <div key={o.id} className="flex flex-col items-center gap-2 w-full">
                          <TeamIdCardPreview
                            person={o}
                            schoolName={detectedSchoolName}
                            schoolLogo={profileForm.logoDataUrl}
                            type="OFFICIAL"
                            indexNumber={idx + 1}
                          />
                          {canEdit && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingOfficialId(o.id);
                                  setOfficialForm({
                                    photoDataUrl: o.photoDataUrl || '',
                                    photoFileName: o.photoFileName || '',
                                    photoSizeKb: o.photoSizeKb || 0,
                                    fullName: o.fullName || '',
                                    position: o.position || 'Official 1',
                                  });
                                  setShowOfficialForm(true);
                                  setShowPasukanForm(false);
                                }}
                                className="px-3 py-1 rounded-lg bg-[#F5F8F6] hover:bg-slate-200 text-[#092D32] text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 size={12} /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteOfficial(o.id, o.fullName)}
                                className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#E11D48] text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 size={12} /> Hapus
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================================================================
                MODULE 4: TIMELINE ACARA
                ================================================================ */}
            {activeModule === 'timeline' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#006569] block">
                    MODUL 04 · JADWAL &amp; RANGKAIAN PELAKSANAAN
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#092D32]">
                    Timeline Teknis Kegiatan
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Pilih tahapan kegiatan di kiri untuk membaca rincian teknis, waktu, dan target capaian.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-5 space-y-2.5">
                    {OFFICIAL_TIMELINE_STAGES.map((stage) => {
                      const isSelected = stage.id === selectedTimelineId;
                      return (
                        <button
                          key={stage.id}
                          type="button"
                          onClick={() => setSelectedTimelineId(stage.id)}
                          className={`w-full text-left p-4 rounded-2xl border transition flex items-start gap-3.5 cursor-pointer ${
                            isSelected
                              ? 'bg-[#092D32] text-white border-[#006569] shadow-md'
                              : 'bg-[#F5F8F6] hover:bg-white text-[#092D32] border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-9 h-9 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-[#FFDD00] text-[#092D32]'
                                : 'bg-white text-[#006569] border border-slate-200'
                            }`}
                          >
                            {stage.step}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span
                              className={`text-[10px] font-bold uppercase block ${
                                isSelected ? 'text-[#FFDD00]' : 'text-[#006569]'
                              }`}
                            >
                              {stage.date}
                            </span>
                            <h4 className="font-black text-xs sm:text-sm leading-snug mt-0.5">
                              {stage.title}
                            </h4>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedTimelineObj && (
                    <div
                      className="lg:col-span-7 rounded-3xl text-white p-6 sm:p-8 shadow-xl space-y-5"
                      style={{
                        background:
                          'linear-gradient(135deg, #092D32 0%, #00474A 60%, #006569 100%)',
                      }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs font-black uppercase text-[#FFDD00]">
                          TAHAP {selectedTimelineObj.step} · {selectedTimelineObj.status}
                        </span>
                        <span className="text-xs font-mono text-teal-200 flex items-center gap-1.5">
                          <Clock size={14} /> {selectedTimelineObj.time}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-white">
                          {selectedTimelineObj.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-teal-100/90 mt-2 leading-relaxed">
                          {selectedTimelineObj.summary}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="rounded-2xl bg-white/10 p-3.5 flex items-center gap-2.5">
                          <Calendar size={16} className="text-[#FFDD00] shrink-0" />
                          <div>
                            <span className="text-[10px] text-teal-200 block">Tanggal</span>
                            <strong className="text-white">{selectedTimelineObj.date}</strong>
                          </div>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-3.5 flex items-center gap-2.5">
                          <MapPin size={16} className="text-[#FFDD00] shrink-0" />
                          <div>
                            <span className="text-[10px] text-teal-200 block">Lokasi</span>
                            <strong className="text-white">{selectedTimelineObj.location}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2.5 pt-2 border-t border-white/10">
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#FFDD00]">
                          Rincian Ketentuan &amp; Aktivitas:
                        </h4>
                        {selectedTimelineObj.details.map((det, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-slate-100">
                            <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{det}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================================================================
                MODULE 5: REKAP NILAI JURI
                ================================================================ */}
            {activeModule === 'penilaian' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#006569] block">
                        MODUL 05 · BLANKO RESMI PENILAIAN PESERTA LOMBA GERANAT
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-[#092D32]">
                        Rekapitulasi Penilaian Dewan Juri
                      </h2>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Transparansi skor aspek baris-berbaris, pengibaran bendera, komandan, serta pengurangan/bonus poin.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleDownloadScoringCsv}
                        className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                      >
                        <FileSpreadsheet size={15} />
                        <span>Unduh Excel (.CSV)</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadScoringPdf}
                        className="px-4 py-2.5 rounded-xl bg-[#092D32] hover:bg-[#006569] text-[#FFDD00] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                      >
                        <Printer size={15} />
                        <span>Cetak Lembar Nilai (PDF)</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl bg-[#F5F8F6] border border-slate-200 p-4">
                      <span className="text-[10px] font-black uppercase text-[#64748B] block">
                        Total Nilai Aspek (A–J)
                      </span>
                      <div className="text-xl sm:text-2xl font-mono font-black text-[#092D32] mt-1 tabular-nums">
                        {scoringSummary.totalGross}{' '}
                        <span className="text-xs font-normal text-[#64748B]">
                          / {scoringSummary.totalMax}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-rose-50/70 border border-[#EA4335]/30 p-4">
                      <span className="text-[10px] font-black uppercase text-[#EA4335] block">
                        Pengurangan Poin (-)
                      </span>
                      <div className="text-xl sm:text-2xl font-mono font-black text-[#EA4335] mt-1 tabular-nums">
                        -{scoringSummary.totalPenalty}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-blue-50/70 border border-[#4285F4]/30 p-4">
                      <span className="text-[10px] font-black uppercase text-[#4285F4] block">
                        Penambahan Poin (+)
                      </span>
                      <div className="text-xl sm:text-2xl font-mono font-black text-[#4285F4] mt-1 tabular-nums">
                        +{scoringSummary.totalBonus}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-[#006569] to-[#092D32] text-white p-4 shadow-md">
                      <span className="text-[10px] font-black uppercase text-[#FFDD00] block">
                        Total Nilai Akhir
                      </span>
                      <div className="text-xl sm:text-2xl font-mono font-black text-white mt-1 tabular-nums">
                        {scoringSummary.finalScore}{' '}
                        <span className="text-xs font-normal text-teal-200">
                          / {scoringSummary.totalMax}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveScoreGroup('ALL')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                        activeScoreGroup === 'ALL'
                          ? 'bg-[#006569] text-[#FFDD00]'
                          : 'bg-[#F5F8F6] text-[#64748B] hover:bg-slate-200'
                      }`}
                    >
                      Semua Kategori (A–J)
                    </button>
                    {GERANAT_SCORING_GROUPS.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setActiveScoreGroup(g.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer font-mono tabular-nums ${
                          activeScoreGroup === g.id
                            ? 'bg-[#006569] text-[#FFDD00]'
                            : 'bg-[#F5F8F6] text-[#64748B] hover:bg-slate-200'
                        }`}
                      >
                        {g.code}. ({scoringSummary.groupTotals[g.id]?.sum || 0}/{g.maxTotal})
                      </button>
                    ))}
                  </div>
                </div>

                {GERANAT_SCORING_GROUPS.filter(
                  (g) => activeScoreGroup === 'ALL' || g.id === activeScoreGroup
                ).map((group) => {
                  const gStat = scoringSummary.groupTotals[group.id];
                  return (
                    <div
                      key={group.id}
                      className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs"
                    >
                      <div className="bg-[#092D32] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm sm:text-base font-black text-white">
                            {group.title}
                          </h3>
                          <span className="text-[11px] text-slate-300">
                            Nilai Maksimal Kelompok {group.code}: {group.maxTotal} Poin
                          </span>
                        </div>
                        <div className="px-4 py-1.5 rounded-xl bg-white/10 font-mono text-xs sm:text-sm font-black text-[#FFDD00] tabular-nums">
                          Total {group.code}: {gStat?.sum || 0} / {group.maxTotal}
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 bg-[#F5F8F6] text-[11px] font-black uppercase text-[#092D32]">
                              <th className="py-3 px-4 w-12 text-center">No.</th>
                              <th className="py-3 px-4">Aspek Penilaian</th>
                              <th className="py-3 px-3 text-center text-white bg-[#EA4335]">
                                K (Kurang)
                              </th>
                              <th className="py-3 px-3 text-center text-[#092D32] bg-[#FBBC05]">
                                C (Cukup)
                              </th>
                              <th className="py-3 px-3 text-center text-white bg-[#34A853]">
                                B (Baik)
                              </th>
                              <th className="py-3 px-3 text-center text-white bg-[#4285F4]">
                                SB (Sangat Baik)
                              </th>
                              <th className="py-3 px-4 text-right w-44">
                                Nilai (Skor / Maks)
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {group.aspects.map((asp) => {
                              const currentVal = portalData?.scores?.[asp.id];
                              const hasScore =
                                currentVal !== undefined &&
                                currentVal !== null &&
                                currentVal !== '';
                              return (
                                <tr key={asp.id} className="hover:bg-[#F5F8F6] transition">
                                  <td className="py-3 px-4 text-center font-mono font-bold text-[#64748B]">
                                    {asp.no}
                                  </td>
                                  <td className="py-3 px-4 font-bold text-[#092D32]">
                                    {asp.name}
                                  </td>
                                  {['K', 'C', 'B', 'SB'].map((tierKey) => (
                                    <td key={tierKey} className="py-2.5 px-2 text-center">
                                      <div className="flex flex-wrap items-center justify-center gap-1">
                                        {(asp.tiers[tierKey] || []).map((num) => {
                                          const isSelected =
                                            hasScore && Number(currentVal) === num;
                                          return (
                                            <button
                                              key={num}
                                              type="button"
                                              disabled={!hasAdminAccess}
                                              onClick={() =>
                                                handleSetAspectScore(
                                                  asp.id,
                                                  isSelected ? null : num,
                                                  asp.maxScore
                                                )
                                              }
                                              className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold transition tabular-nums ${
                                                isSelected
                                                  ? 'bg-[#006569] text-[#FFDD00] shadow-xs scale-105'
                                                  : hasAdminAccess
                                                  ? 'bg-slate-100 hover:bg-teal-100 text-[#092D32] cursor-pointer'
                                                  : 'bg-slate-100 text-[#64748B] cursor-default'
                                              }`}
                                            >
                                              {num}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </td>
                                  ))}
                                  <td className="py-3 px-4 text-right">
                                    <div className="inline-flex items-center justify-end gap-1.5 font-mono font-black text-sm tabular-nums">
                                      {hasAdminAccess ? (
                                        <input
                                          type="number"
                                          min="0"
                                          max={asp.maxScore}
                                          value={hasScore ? currentVal : ''}
                                          onChange={(e) =>
                                            handleSetAspectScore(
                                              asp.id,
                                              e.target.value,
                                              asp.maxScore
                                            )
                                          }
                                          placeholder="-"
                                          className="w-14 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-xs font-black text-slate-950 focus:border-[#006569] focus:outline-none"
                                        />
                                      ) : (
                                        <span
                                          className={
                                            hasScore ? 'text-[#006569]' : 'text-slate-400'
                                          }
                                        >
                                          {hasScore ? currentVal : '-'}
                                        </span>
                                      )}
                                      <span className="text-slate-400">/</span>
                                      <span className="text-[#092D32]">{asp.maxScore}</span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}

                {/* Pengurangan & Bonus */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EA4335]/30 overflow-hidden shadow-xs">
                    <div className="text-white px-6 py-4 flex items-center justify-between bg-[#EA4335]">
                      <h3 className="text-sm font-black uppercase tracking-wider">
                        Pengurangan Poin ( - )
                      </h3>
                      <span className="font-mono text-xs font-black tabular-nums">
                        Total: -{scoringSummary.totalPenalty} Poin
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                      {GERANAT_PENALTY_ITEMS.map((item) => {
                        const activeVal = portalData?.penalties?.[item.id];
                        const isChecked = activeVal !== undefined;
                        return (
                          <div
                            key={item.id}
                            className={`px-5 py-3 flex items-center justify-between gap-3 text-xs ${
                              isChecked ? 'bg-rose-50/80' : 'hover:bg-[#F5F8F6]'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="font-mono font-bold text-[#64748B] w-5">
                                {item.no}.
                              </span>
                              <span className="font-semibold text-[#092D32]">
                                {item.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono font-black text-[#EA4335] tabular-nums">
                                -{isChecked ? activeVal : item.pointsLabel}
                              </span>
                              {hasAdminAccess && (
                                <button
                                  type="button"
                                  onClick={() => handleTogglePenalty(item)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase cursor-pointer ${
                                    isChecked
                                      ? 'bg-[#EA4335] text-white'
                                      : 'bg-slate-100 text-[#64748B] hover:bg-rose-100'
                                  }`}
                                >
                                  {isChecked ? 'Aktif' : 'Tandai'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-white rounded-3xl border border-[#4285F4]/30 overflow-hidden shadow-xs h-fit">
                    <div className="text-white px-6 py-4 flex items-center justify-between bg-[#4285F4]">
                      <h3 className="text-sm font-black uppercase tracking-wider">
                        Penambahan Poin ( + )
                      </h3>
                      <span className="font-mono text-xs font-black tabular-nums">
                        Total: +{scoringSummary.totalBonus} Poin
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {GERANAT_BONUS_ITEMS.map((item) => {
                        const activeVal = portalData?.bonuses?.[item.id];
                        const isChecked = activeVal !== undefined;
                        return (
                          <div
                            key={item.id}
                            className={`px-5 py-3.5 flex items-center justify-between gap-3 text-xs ${
                              isChecked ? 'bg-blue-50/80' : 'hover:bg-[#F5F8F6]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-[#64748B] w-5">
                                {item.no}.
                              </span>
                              <span className="font-semibold text-[#092D32]">
                                {item.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono font-black text-[#4285F4] tabular-nums">
                                +{item.pointsLabel}
                              </span>
                              {hasAdminAccess && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleBonus(item)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase cursor-pointer ${
                                    isChecked
                                      ? 'bg-[#4285F4] text-white'
                                      : 'bg-slate-100 text-[#64748B] hover:bg-blue-100'
                                  }`}
                                >
                                  {isChecked ? 'Aktif' : 'Tandai'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================
                MODULE 6: PUSAT UNDUH JUKNIS & BANTUAN PANITIA
                ================================================================ */}
            {activeModule === 'bantuan' && (
              <div className="neu-card rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/70 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#006569] block">
                      MODUL 06 · LAYANAN KONTINGEN &amp; PUSAT BANTUAN
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-[#092D32]">
                      Pusat Unduh Juknis &amp; Helpdesk Panitia
                    </h2>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Dokumen teknis resmi perlombaan GERANAT, template formulir dan surat pernyataan, serta saluran koordinasi langsung dengan Panitia Menwa UNJ.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Helpdesk Siaga 24/7
                  </span>
                </div>

                {/* Grid Download Cepat & Kontak WA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="rounded-2xl neu-card-sm p-5 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#006569] flex items-center justify-center font-bold">
                        <FileText size={20} />
                      </div>
                      <h3 className="text-sm font-black text-[#092D32]">Buku Panduan &amp; Juknis GERANAT 2026</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Petunjuk teknis resmi perlombaan LFPB GERANAT Satuan Menwa UNJ mencakup ketentuan lapangan, materi gerakan PBB, tata cara penghormatan, dan jadwal registrasi ulang.
                      </p>
                    </div>
                    <a
                      href="/docs/juknis-geranat-2026.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl neu-btn-primary bg-gradient-to-r from-[#006569] to-[#092D32] text-[#FFDD00] hover:text-white font-black text-xs uppercase tracking-wider shadow-sm hover:shadow transition-all cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Unduh Juknis Lengkap (PDF)</span>
                    </a>
                  </div>

                  <div className="rounded-2xl neu-card-sm p-5 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center font-bold">
                        <Phone size={20} />
                      </div>
                      <h3 className="text-sm font-black text-[#092D32]">Helpdesk WhatsApp Resmi Panitia</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Mengalami kendala saat melengkapi biodata 20 personel, upload berkas, atau verifikasi nomor urut kontingen? Hubungi panitia teknis melalui WhatsApp.
                      </p>
                    </div>
                    <a
                      href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                        `Halo Panitia GERANAT Menwa UNJ, saya Official dari kontingen ${detectedSchoolName} (${activeSlug}). Ingin bertanya terkait kelengkapan administrasi.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs uppercase tracking-wider shadow-sm hover:shadow transition-all cursor-pointer"
                    >
                      <Phone size={14} />
                      <span>Hubungi Panitia (WhatsApp)</span>
                    </a>
                  </div>
                </div>

                {/* Frequently Asked Questions Ringkas */}
                <div className="rounded-2xl bg-[#F5F8F6] border border-slate-200/80 p-5 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#092D32]">
                    Pertanyaan Umum Official (FAQ)
                  </h4>
                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                      <strong className="text-[#092D32] block mb-0.5">Berapa kuota personel wajib yang harus diisi?</strong>
                      Setiap kontingen wajib mendaftarkan 16 Pasukan Peleton Inti + 2 Pasukan Cadangan (total 18 pasukan) serta 2 Official Pendamping. Total keseluruhan adalah 20 personel.
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                      <strong className="text-[#092D32] block mb-0.5">Format file apa saja yang diterima untuk pemberkasan?</strong>
                      Format yang didukung adalah PDF, JPG, PNG, atau WEBP dengan ukuran maksimal 2 MB per berkas dokumen wajib.
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                      <strong className="text-[#092D32] block mb-0.5">Kapan penilaian dari dewan juri dipublikasikan?</strong>
                      Penilaian dewan juri akan muncul secara bertahap atau setelah seluruh kontingen menyelesaikan rangkaian penampilan di lapangan sesuai instruksi dewan juri.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Console Footer */}
          <footer className="pt-5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs text-[#64748B]">
            <span>
              Konsol Resmi Kontingen · Subdomain:{' '}
              <strong className="font-mono text-[#006569]">/official/{activeSlug}</strong>
            </span>
            <span className="font-bold text-[#092D32]">Widya Castrena Dharma Siddha</span>
          </footer>
        </section>
      </div>
    </div>
  );
}

export default ParticipantPortal;