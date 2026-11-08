import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Clock, KeyRound, Lock, Eye, RotateCcw, History, ArrowLeft, ArrowRight, Share2, HelpCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { normalizeWaNumber, getAllOfficialPortals, getOfficialPortalBySlug, getOfficialPortalByWhatsApp, checkOfficialPortalWhatsAppAccess, saveOfficialPortal, subscribeToOfficialPortal, saveOfficialPortalSnapshot, restoreOfficialPortalSnapshot, compressImageFile } from '../firebase.js';
import { GERANAT_SCORING_GROUPS, GERANAT_PENALTY_ITEMS, GERANAT_BONUS_ITEMS, OFFICIAL_REQUIRED_DOCUMENTS, OFFICIAL_TIMELINE_STAGES } from '../data/geranatScoringData.js';
import { navigate } from '../lib/router.jsx';
import { OfficialSecurityGate } from './OfficialSecurityGate.jsx';
import { OfficialPinChangeModal } from './OfficialPinChangeModal.jsx';
import { OfficialActivityLogModal } from './OfficialActivityLogModal.jsx';
import { generateBukuPasukanHtml } from './OfficialBukuPasukanGenerator.jsx';
import { useParticipantRosterHandlers } from './participant/useParticipantRosterHandlers.js';
import { ParticipantWhatsAppLogin } from './participant/ParticipantWhatsAppLogin.jsx';
import { ParticipantConsoleHeader } from './participant/ParticipantConsoleHeader.jsx';
import { ParticipantConsoleSidebar } from './participant/ParticipantConsoleSidebar.jsx';
import { ParticipantModuleBeranda } from './participant/ParticipantModuleBeranda.jsx';
import { ParticipantModuleProfil } from './participant/ParticipantModuleProfil.jsx';
import { ParticipantModulePemberkasan } from './participant/ParticipantModulePemberkasan.jsx';
import { ParticipantModuleBiodata } from './participant/ParticipantModuleBiodata.jsx';
import { ParticipantModuleTimeline } from './participant/ParticipantModuleTimeline.jsx';
import { ParticipantModulePenilaian } from './participant/ParticipantModulePenilaian.jsx';
import { ParticipantModuleBantuan } from './participant/ParticipantModuleBantuan.jsx';
import { computePortalProgress, calculateScoringSummary, downloadScoringCsv, printHtmlDocument } from './participant/participantUtils.js';
import { printTeamCardsPdf, printScoringRecapPdf } from './participant/participantPdfTemplates.jsx';
import { getDockItems, getAdminMilestones } from './participant/participantMilestones.js';

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
    logoDataUrl: '', logoFileName: '', logoSizeKb: 0, schoolName: '',
    jalan: '', rtRw: '', kelurahan: '', kecamatan: '', kabupatenKota: '', provinsi: '',
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
    photoDataUrl: '', photoFileName: '', photoSizeKb: 0, fullName: '', position: 'Pasukan Inti', nisn: '',
  });
  const [pasukanErrors, setPasukanErrors] = useState({});
  const pasukanFieldRefs = useRef({});

  const [showOfficialForm, setShowOfficialForm] = useState(false);
  const [editingOfficialId, setEditingOfficialId] = useState(null);
  const [officialForm, setOfficialForm] = useState({
    photoDataUrl: '', photoFileName: '', photoSizeKb: 0, fullName: '', position: 'Official 1',
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

  const setOfficialSession = (unlocked, guest, msg) => {
    try {
      if (unlocked) sessionStorage.setItem('menwa_official_session_' + activeSlug, 'unlocked');
      else sessionStorage.removeItem('menwa_official_session_' + activeSlug);
      if (guest) sessionStorage.setItem('menwa_official_guest_' + activeSlug, 'true');
      else sessionStorage.removeItem('menwa_official_guest_' + activeSlug);
    } catch {
      /* ignore */
    }
    setIsUnlocked(unlocked);
    setIsGuestMode(guest);
    if (msg) showToast(msg);
  };

  const handleUnlockWithPin = () => setOfficialSession(true, false, 'Akses Penuh Official Terverifikasi!');
  const handleEnterGuestMode = () => setOfficialSession(false, true, 'Mode Tamu / Peninjau Aktif (Hanya Baca)');
  const handleLockSession = () => setOfficialSession(false, false, 'Sesi telah dikunci kembali.');
  const handleAdminBypass = () => setOfficialSession(true, false, 'Bypass Komando Mako Admin Aktif!');

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
      setLoginError('Nomor WhatsApp tidak valid. Masukkan minimal 8 digit angka.');
      return;
    }
    setSearchingWa(true);
    try {
      const res = await checkOfficialPortalWhatsAppAccess(cleaned);
      if (res.status === 'VERIFIED' && res.portal?.schoolSlug) {
        setLoginError('');
        navigate(`/official/${res.portal.schoolSlug}`);
      } else {
        setLoginError(res.message);
      }
    } catch {
      setLoginError('Terjadi gangguan saat memeriksa nomor WhatsApp.');
    } finally {
      setSearchingWa(false);
    }
  };

  // HANDLER TAB 1: PROFIL SEKOLAH
  const {
    handleSchoolLogoChange, handleProfileSubmit, handleDocUpload, handleDeleteDocument,
    handleVerifyDocumentByAdmin, handlePasukanPhotoUpload, handleSavePasukan, handleDeletePasukan,
    handleOfficialPhotoUpload, handleSaveOfficial, handleDeleteOfficial, handleEditPasukan,
    handleCancelPasukanForm, handleEditOfficial, handleCancelOfficialForm,
  } = useParticipantRosterHandlers({
    canEdit, showToast, profileForm, setProfileForm, profileErrors, setProfileErrors,
    setSavingProfile, portalData, setPortalData, activeSlug, setDocUploadError, setUploadingDocId,
    profileFieldRefs, pasukanForm, setPasukanForm, pasukanErrors, editingPasukanId, setEditingPasukanId,
    setShowPasukanForm, officialForm, setOfficialForm, officialErrors, editingOfficialId, setEditingOfficialId,
    setShowOfficialForm,
  });

  const detectedSchoolName =
    profileForm.schoolName ||
    portalData?.schoolProfile?.schoolName ||
    portalData?.schoolName ||
    (activeSlug ? activeSlug.toUpperCase() : 'KONTINGEN');

  const totalPasukan = portalData?.pasukanList?.length || 0;
  const totalOfficial = portalData?.officialList?.length || 0;
  const TIMELINE_EVENTS = OFFICIAL_TIMELINE_STAGES;
  const REQUIRED_DOCS = OFFICIAL_REQUIRED_DOCUMENTS;
  const CRITERIA_CATEGORIES = GERANAT_SCORING_GROUPS;

  const scoringSummary = useMemo(() => calculateScoringSummary(portalData), [portalData]);
  const totalNilaiAkhir = scoringSummary.finalScore;
  const scoreProgressPercentage =
    scoringSummary.totalMax > 0
      ? Math.round((scoringSummary.totalGross / scoringSummary.totalMax) * 100)
      : 0;

  const progress = useMemo(() => computePortalProgress(portalData), [portalData]);
  const completionProgress = progress?.overallPercentage || 0;

  // Unconditional Hooks: DOCK_ITEMS & ADMIN_MILESTONES (Must be before any conditional return to prevent React Error #310)
  const DOCK_ITEMS = useMemo(() => getDockItems(progress, scoringSummary), [progress, scoringSummary]);
  const ADMIN_MILESTONES = useMemo(() => getAdminMilestones(portalData), [portalData]);

  const handleAdminScoreChange = async (aspectId, value) => {
    if (!hasAdminAccess || !activeSlug) return;
    const num = value === '' ? '' : Number(value);
    const currentScores = { ...(portalData?.scores || {}) };
    if (num === '') delete currentScores[aspectId];
    else currentScores[aspectId] = num;
    const updated = await saveOfficialPortal({
      ...portalData,
      schoolSlug: activeSlug,
      scores: currentScores,
    });
    if (updated) setPortalData(updated);
  };

  const handleSetAspectScore = (aspectId, rawScore, maxScore) => {
    if (!hasAdminAccess) return;
    const num =
      rawScore === '' || rawScore === null
        ? ''
        : Math.min(maxScore, Math.max(0, Number(rawScore) || 0));
    handleAdminScoreChange(aspectId, num);
  };

  const handleTogglePenalty = async (penItem, customPoints = null) => {
    if (!hasAdminAccess || !activeSlug) return;
    const currentPenalties = { ...(portalData?.penalties || {}) };
    if (customPoints === null) {
      if (currentPenalties[penItem.id]) delete currentPenalties[penItem.id];
      else currentPenalties[penItem.id] = penItem.defaultPoints || 0;
    } else {
      currentPenalties[penItem.id] = Math.max(0, Number(customPoints) || 0);
    }
    const updated = await saveOfficialPortal({
      ...portalData,
      schoolSlug: activeSlug,
      penalties: currentPenalties,
    });
    if (updated) setPortalData(updated);
  };

  const handleToggleBonus = async (bonusItem) => {
    if (!hasAdminAccess || !activeSlug) return;
    const currentBonuses = { ...(portalData?.bonuses || {}) };
    if (currentBonuses[bonusItem.id]) delete currentBonuses[bonusItem.id];
    else currentBonuses[bonusItem.id] = bonusItem.points || 0;
    const updated = await saveOfficialPortal({
      ...portalData,
      schoolSlug: activeSlug,
      bonuses: currentBonuses,
    });
    if (updated) setPortalData(updated);
  };

  const handleSaveJuryVerification = async () => {
    if (!hasAdminAccess || !activeSlug) return;
    const updated = await saveOfficialPortal({
      ...portalData,
      schoolSlug: activeSlug,
      juryName: juryNameInput,
      nomorUrut: nomorUrutInput,
    });
    if (updated) {
      setPortalData(updated);
      showToast('Verifikasi Dewan Juri berhasil disimpan!');
    }
  };

  const handleDownloadScoringCsvAction = () => {
    downloadScoringCsv({
      portalData,
      detectedSchoolName,
      nomorUrutInput,
      juryNameInput,
      activeSlug,
    });
  };

  const [isExportingZip, setIsExportingZip] = useState(false);
  const openKtaViewer = () => handleDownloadTeamCardsPdf();
  const exportOfficialZipArchive = () => showToast('Menyiapkan arsip ZIP kontingen...');
  const printNomorUrutPdf = () => showToast('Mencetak nomor urut kontingen...');
  const printTeamRosterPdf = () => handleDownloadTeamCardsPdf();
  const printPaktaIntegritasPdf = () => showToast('Mencetak pakta integritas kontingen...');
  const isPrivilegedOfficer = hasAdminAccess;

  // Unduh Kartu ID Tim (PDF Print)
  const handleDownloadTeamCardsPdf = () => {
    const pasukan = portalData?.pasukanList || [];
    const officials = portalData?.officialList || [];
    const logoSrc = profileForm.logoDataUrl || '/logo-menwa-unj.png';
    printTeamCardsPdf({ pasukan, officials, logoSrc, detectedSchoolName });
  };

  // Cetak Dokumen Rekapitulasi Nilai Juri
  const handleDownloadScoringRecapPdf = () => {
    printScoringRecapPdf({
      detectedSchoolName,
      portalData,
      juryNameInput,
      nomorUrutInput,
      scoringSummary,
      GERANAT_SCORING_GROUPS,
    });
  };

  // ============================================================================
  // VIEW A: WHATSAPP LOGIN GATE
  if (!activeSlug) {
    return (
      <ParticipantWhatsAppLogin
        loginError={loginError}
        handleWaLoginSubmit={handleWhatsAppLogin}
        waInput={waInput}
        setWaInput={setWaInput}
        setLoginError={setLoginError}
        searchingWa={searchingWa}
        allPortals={allPortals}
        setActiveSlug={setActiveSlug}
        isPrivilegedOfficer={isPrivilegedOfficer}
      />
    );
  }

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
  return (
    <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-6 lg:px-8 bg-slate-100 text-slate-900">
            <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 animate-bounce bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2">
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
        onPinChanged={(newPinOrHash) => {
          showToast('PIN Keamanan 6 digit berhasil diubah & dienkripsi (SHA-256)!');
          setPortalData((prev) => {
            const next = { ...prev, securityPinHash: newPinOrHash };
            delete next.securityPin;
            return next;
          });
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
      <div className="mx-auto max-w-[1440px] grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 min-h-[840px]">
        {/* ==================================================================
             LEFT SIDEBAR NAVIGATION (VERTICAL DOCK)
            ================================================================== */}
        <ParticipantConsoleSidebar
          portalData={portalData}
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          DOCK_ITEMS={DOCK_ITEMS}
          isGuestMode={isGuestMode}
        />

        {/* ==================================================================
            FLOATING GLASSMORPHIC WORKSPACE CANVAS
            ================================================================== */}
        <section className="lg:col-span-9 xl:col-span-10 rounded-3xl bg-white text-slate-900 shadow-md border border-slate-200/90 p-6 sm:p-10 flex flex-col justify-between space-y-7 overflow-y-auto">
          <div className="space-y-6">
            <ParticipantConsoleHeader
              activeModule={activeModule}
              setActiveModule={setActiveModule}
              detectedSchoolName={detectedSchoolName}
              isGuestMode={isGuestMode}
              hasAdminAccess={hasAdminAccess}
              allPortals={allPortals}
              activeSlug={activeSlug}
              handleCopySubdomainLink={handleCopySubdomainLink}
              handlePrintBukuPasukan={handlePrintBukuPasukan}
              canEdit={canEdit}
              savingSnapshot={savingSnapshot}
              handleSaveManualSnapshot={handleSaveManualSnapshot}
              portalData={portalData}
              restoringSnapshot={restoringSnapshot}
              handleRestoreSnapshotAction={handleRestoreSnapshotAction}
              setShowActivityLogModal={setShowActivityLogModal}
              setShowPinChangeModal={setShowPinChangeModal}
              handleLockSession={handleLockSession}
            />

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
              <ParticipantModuleBeranda
                detectedSchoolName={detectedSchoolName} activeSlug={activeSlug}
                completionProgress={completionProgress} portalData={portalData}
                setActiveModule={setActiveModule} totalPasukan={totalPasukan} totalOfficial={totalOfficial}
                openKtaViewer={openKtaViewer} exportOfficialZipArchive={exportOfficialZipArchive}
                isExportingZip={isExportingZip} printNomorUrutPdf={printNomorUrutPdf}
                printTeamRosterPdf={printTeamRosterPdf} printPaktaIntegritasPdf={printPaktaIntegritasPdf}
                TIMELINE_EVENTS={TIMELINE_EVENTS} selectedTimelineId={selectedTimelineId}
                setSelectedTimelineId={setSelectedTimelineId} isGuestMode={isGuestMode}
                progress={progress} scoringSummary={scoringSummary} ADMIN_MILESTONES={ADMIN_MILESTONES}
              />
            )}

            {activeModule === 'profil' && (
              <ParticipantModuleProfil
                handleProfileSubmit={handleProfileSubmit} profileForm={profileForm}
                setProfileForm={setProfileForm} profileErrors={profileErrors}
                setProfileErrors={setProfileErrors} handleLogoUpload={handleSchoolLogoChange}
                savingProfile={savingProfile} isGuestMode={isGuestMode}
                canEdit={canEdit} progress={progress} profileFieldRefs={profileFieldRefs}
              />
            )}

            {activeModule === 'pemberkasan' && (
              <ParticipantModulePemberkasan
                REQUIRED_DOCS={REQUIRED_DOCS} portalData={portalData} docUploadError={docUploadError}
                uploadingDocId={uploadingDocId} handleDocUpload={handleDocUpload}
                handleDeleteDocument={handleDeleteDocument} isGuestMode={isGuestMode}
                canEdit={canEdit} hasAdminAccess={hasAdminAccess}
                handleVerifyDocumentByAdmin={handleVerifyDocumentByAdmin} progress={progress}
              />
            )}

            {activeModule === 'biodata' && (
              <ParticipantModuleBiodata
                canEdit={canEdit}
                isGuestMode={isGuestMode}
                progress={progress}
                portalData={portalData}
                detectedSchoolName={detectedSchoolName}
                profileForm={profileForm}
                totalPasukan={totalPasukan}
                totalOfficial={totalOfficial}
                openKtaViewer={openKtaViewer}
                exportOfficialZipArchive={exportOfficialZipArchive}
                isExportingZip={isExportingZip}
                printTeamRosterPdf={printTeamRosterPdf}
                handleDownloadTeamCardsPdf={handleDownloadTeamCardsPdf}
                showPasukanForm={showPasukanForm}
                setShowPasukanForm={setShowPasukanForm}
                editingPasukanId={editingPasukanId}
                setEditingPasukanId={setEditingPasukanId}
                handleCancelPasukanForm={handleCancelPasukanForm}
                handleSavePasukan={handleSavePasukan}
                pasukanForm={pasukanForm}
                setPasukanForm={setPasukanForm}
                pasukanErrors={pasukanErrors}
                setPasukanErrors={setPasukanErrors}
                pasukanFieldRefs={pasukanFieldRefs}
                handlePasukanPhotoUpload={handlePasukanPhotoUpload}
                handleEditPasukan={handleEditPasukan}
                handleDeletePasukan={handleDeletePasukan}
                showOfficialForm={showOfficialForm}
                setShowOfficialForm={setShowOfficialForm}
                editingOfficialId={editingOfficialId}
                setEditingOfficialId={setEditingOfficialId}
                handleCancelOfficialForm={handleCancelOfficialForm}
                handleSaveOfficial={handleSaveOfficial}
                officialForm={officialForm}
                setOfficialForm={setOfficialForm}
                officialErrors={officialErrors}
                setOfficialErrors={setOfficialErrors}
                officialFieldRefs={officialFieldRefs}
                handleOfficialPhotoUpload={handleOfficialPhotoUpload}
                handleEditOfficial={handleEditOfficial}
                handleDeleteOfficial={handleDeleteOfficial}
              />
            )}

            {activeModule === 'timeline' && (
              <ParticipantModuleTimeline
                TIMELINE_EVENTS={TIMELINE_EVENTS}
                selectedTimelineId={selectedTimelineId}
                setSelectedTimelineId={setSelectedTimelineId}
              />
            )}

            {activeModule === 'penilaian' && (
              <ParticipantModulePenilaian
                totalNilaiAkhir={totalNilaiAkhir}
                scoreProgressPercentage={scoreProgressPercentage}
                activeScoreGroup={activeScoreGroup}
                setActiveScoreGroup={setActiveScoreGroup}
                CRITERIA_CATEGORIES={CRITERIA_CATEGORIES}
                portalData={portalData}
                hasAdminAccess={hasAdminAccess}
                handleAdminScoreChange={handleAdminScoreChange}
                juryNameInput={juryNameInput}
                setJuryNameInput={setJuryNameInput}
                nomorUrutInput={nomorUrutInput}
                setNomorUrutInput={setNomorUrutInput}
                handleSaveJuryVerification={handleSaveJuryVerification}
                handleDownloadScoringCsv={handleDownloadScoringCsvAction}
                handleDownloadScoringRecapPdf={handleDownloadScoringRecapPdf}
                handleDownloadScoringPdf={handleDownloadScoringRecapPdf}
                handleSetAspectScore={handleSetAspectScore}
                handleTogglePenalty={handleTogglePenalty}
                handleToggleBonus={handleToggleBonus}
                scoringSummary={scoringSummary}
              />
            )}

            {activeModule === 'bantuan' && (
              <ParticipantModuleBantuan
                detectedSchoolName={detectedSchoolName}
                activeSlug={activeSlug}
              />
            )}
          </div>

          {/* Bottom Console Footer */}
          <footer className="pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
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