import React, { useState, useEffect, useMemo } from 'react'; import { ChevronDown, ChevronUp, Folder, Shield, ShieldAlert, ShieldCheck, Lock, Radio, Sparkles, FileText, Newspaper, History, Layers, ArrowLeft, LogOut, Check, CheckCircle2, Copy, Download, Send, Upload, Trash2, RotateCcw, UserCheck, Terminal, AlertTriangle, FileCheck, Image as ImageIcon, BarChart3, Settings, Eye, Edit3, Plus, RefreshCw, X, KeyRound, Printer, EyeOff, MessageCircle } from 'lucide-react'; import { useCanvasStore, AUTHORIZED_EMAIL, AVAILABLE_CONTAINERS, PORTAL_TABS_OVERVIEW } from '../lib/canvasStore.jsx'; import { getGeranatTeams, getAllSubmissionsForAdmin, getAuditLogs, getCommandCenterLogs, createScheduledTask, getScheduledTasks, getAllOfficialPortals, saveOfficialPortal, deleteOfficialPortal, normalizeWaNumber, slugifySchoolName, getLockdownState, setLockdownState, subscribeToLockdownState, getIncidentLogs, recordSecurityIncident, DEFAULT_LOCKDOWN_STATE } from '../firebase.js'; import { createForensicEvidenceBundle, computeSHA256, sanitizeText } from '../lib/securitySanitizer.js'; import { useAuth } from '../hooks/useAuth.jsx'; import { MakoBankQRISSettings } from './MakoBankQRISSettings.jsx'; import { navigate } from '../lib/router.jsx'; /* TacticalHoloGlobe3D dihapus */ import { formatRupiah } from '../lib/qris.js'; import './LiveCanvasStudio.css';
import { resetOfficialPinByAdmin } from '../firebase.js';
import { generateBukuPasukanHtml } from './OfficialBukuPasukanGenerator.jsx';
 const QUICK_PROMPTS = [ 'Ubah caption gambar di tab Beranda menjadi: Apel Kehormatan Korps Menwa UNJ 2026', 'Tambah tombol WhatsApp Layanan Piket Mako di hero', 'Bikin galeri 3 kolom foto giat Menwa di beranda', 'Tambah kartu pengumuman pendaftaran Ksatria Cendekia VIII', 'Ubah galeri menjadi 2 kolom dan ratakan tengah', 'Tambah tombol unduh juknis KC VIII di seksi KC', ]; const COMMAND_TABS = [ { id: 'ai_agent', label: '🤖 AI Agent', short: 'AI Agent' }, { id: 'cyber_security', label: '🛡️ Kedaruratan Siber', short: 'Keamanan Siber' }, { id: 'official_portals', label: '🏫 Portal Official & Subdomain', short: 'Portal Official' }, { id: 'image_tracker', label: '📸 Image Tracker', short: 'Image Tracker' }, { id: 'content_editor', label: '📝 Content Editor', short: 'Content Editor' }, { id: 'doc_generator', label: '📄 Document Generator', short: 'Doc Generator' }, { id: 'analytics', label: '📊 Analytics Dashboard', short: 'Analytics' }, { id: 'settings', label: '⚙️ Settings', short: 'Settings' }, { id: 'activity_log', label: '📜 Activity Log', short: 'Activity Log' }, ]; export function CommandCenterPage() { const { user, profile, isSuperAdmin, isStaffAdmin, userRole, signInWithGoogle, signInWithEmail } = useAuth(); const { authSession, loginWithGoogle, logout, components, contentRegistry, updateRegistryItem, uploadAndRegisterImage, softRemoveRegistryItem, revertRegistryItemToOriginal, restoreGoldenState, pendingAIProposal, proposeNaturalLanguage, approveAIProposal, rejectAIProposal, snapshots, history, activeTab, setActiveTab, deleteComponent, resetToDefaults, exportSchema, importSchema, rollbackSnapshot, generateNaskahDinas, generatePressRelease, socialConfig, updateSocialConfig, } = useCanvasStore(); /* Login state */ const [loginEmail, setLoginEmail] = useState(''); const [loginPassword, setLoginPassword] = useState(''); const [authError, setAuthError] = useState(''); const [authLoading, setAuthLoading] = useState(false); /* Cyber Security & Lockdown State */
  const [lockdownData, setLockdownDataState] = useState(DEFAULT_LOCKDOWN_STATE);
  const [incidentLogsList, setIncidentLogsList] = useState([]);
  const [isEngagingLockdown, setIsEngagingLockdown] = useState(false);
  const [isRestoringGolden, setIsRestoringGolden] = useState(false);
  const [securityBannerMsg, setSecurityBannerMsg] = useState('');

  useEffect(() => {
    const unsub = subscribeToLockdownState((st) => {
      if (st) setLockdownDataState(st);
    });
    getIncidentLogs().then(setIncidentLogsList);
    return () => unsub();
  }, []);

  const handleToggleLockdown = async (enable) => {
    const actionName = enable ? 'MENGAKTIFKAN SIAGA 1 (Kunci Situs Total)' : 'MENONAKTIFKAN SIAGA 1 (Kembali Normal)';
    if (!confirm(`Konfirmasi Tindakan Darurat: Apakah Anda yakin ingin ${actionName}?`)) return;
    setIsEngagingLockdown(true);
    try {
      const updated = await setLockdownState({
        isLockdown: enable,
        level: enable ? 'SIAGA_1' : 'NORMAL',
        activatedAt: enable ? new Date().toISOString() : null,
        activatedBy: user?.email || authSession.userEmail || 'Perwira Mako',
      });
      setLockdownDataState(updated);
      setSecurityBannerMsg(`Protokol Siber: Status situs berhasil diubah menjadi ${enable ? 'SIAGA 1 (TERKUNCI)' : 'NORMAL (TERBUKA)'}.`);
      const logs = await getIncidentLogs();
      setIncidentLogsList(logs);
      setTimeout(() => setSecurityBannerMsg(''), 5000);
    } catch (err) {
      alert(`Gagal mengubah status Siaga 1: ${err.message}`);
    } finally {
      setIsEngagingLockdown(false);
    }
  };

  const handleRestoreGoldenState = async () => {
    if (!confirm('PERINGATAN PEMULIHAN SIBER:\n\nTindakan ini akan membersihkan seluruh perubahan teks, judul, caption, dan gambar yang terindikasi sabotase/defacement, lalu memulihkannya ke Golden Master Baseline resmi Menwa UNJ.\n\nLanjutkan eksekusi?')) return;
    setIsRestoringGolden(true);
    try {
      await restoreGoldenState(user?.displayName || authSession.officerName || 'Perwira Komando');
      setSecurityBannerMsg('✅ PEMULIHAN TOTAL BERHASIL: Seluruh registry, aset visual, dan konten telah dipulihkan ke Golden State resmi.');
      const logs = await getIncidentLogs();
      setIncidentLogsList(logs);
      setTimeout(() => setSecurityBannerMsg(''), 6000);
    } catch (err) {
      alert(`Gagal memulihkan ke Golden State: ${err.message}`);
    } finally {
      setIsRestoringGolden(false);
    }
  };

  const handleDownloadForensicEvidence = async () => {
    try {
      const currentSnapshot = {
        timestamp: new Date().toISOString(),
        officer: user?.email || authSession.userEmail || 'Komando Satuan',
        lockdownState: lockdownData,
        contentRegistryCount: contentRegistry.length,
        sampleRegistry: contentRegistry.slice(0, 15),
        componentsCount: components.length,
        recentIncidentLogs: incidentLogsList.slice(0, 10),
      };
      const bundle = await createForensicEvidenceBundle(
        lockdownData.isLockdown ? 'DEFACEMENT_INVESTIGATION' : 'ROUTINE_SECURITY_AUDIT',
        currentSnapshot,
        user?.email || authSession.userEmail || 'Perwira Mako'
      );
      const filename = `BUKTI_FORENSIK_MENWA_UNJ_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      downloadTextFile(JSON.stringify(bundle, null, 2), filename);
      setSecurityBannerMsg(`Bundel bukti forensik digital terenkripsi (${bundle.evidenceId}) berhasil diunduh.`);
      setTimeout(() => setSecurityBannerMsg(''), 4000);
    } catch (err) {
      alert(`Gagal membuat bundel forensik: ${err.message}`);
    }
  };

  /* Tab 1 */ const [promptText, setPromptText] = useState(''); const [copiedId, setCopiedId] = useState(null); /* Tab 2 */ const [selectedTrackerTab, setSelectedTrackerTab] = useState('all'); const [trackerSearchQuery, setTrackerSearchQuery] = useState(''); const [previewAspectRatio, setPreviewAspectRatio] = useState('16:9'); /* Ratio */ const [strukturSubFilter, setStrukturSubFilter] = useState('all'); const [youthSparkSubFilter, setYouthSparkSubFilter] = useState('all'); const [onlyTempVisuals, setOnlyTempVisuals] = useState(false);
  const [galleryYearFilter, setGalleryYearFilter] = useState('all');
  const [expandedAlbumIds, setExpandedAlbumIds] = useState({});
  const [allExpanded, setAllExpanded] = useState(false); const [editingCaptionId, setEditingCaptionId] = useState(null); const [editingCaptionText, setEditingCaptionText] = useState(''); const [editingUrlId, setEditingUrlId] = useState(null); const [editingUrlText, setEditingUrlText] = useState(''); const [editingSocialId, setEditingSocialId] = useState(null); const [socialDraft, setSocialDraft] = useState({ socialPlatform: 'instagram', socialUrl: '', syncedLikes: 0 }); const [showSocialApiPanel, setShowSocialApiPanel] = useState(false); const [previewModalItem, setPreviewModalItem] = useState(null); const [uploadTabId, setUploadTabId] = useState('beranda'); const [uploadTitle, setUploadTitle] = useState(''); const [uploadCaption, setUploadCaption] = useState(''); const [isUploadingSvg, setIsUploadingSvg] = useState(false); /* Tab 3 */ const [editingCompId, setEditingCompId] = useState(null); const [editingCompLabel, setEditingCompLabel] = useState(''); const [editingCompCaption, setEditingCompCaption] = useState(''); /* Tab 4 */ const [docSubMode, setDocSubMode] = useState('naskah'); /* DocType */ const [docType, setDocType] = useState('DISPENSASI'); const [docParams, setDocParams] = useState({ namaKegiatan: 'Ksatria Cendekia VIII Tingkat Nasional', tanggal: '05 s.d. 08 November 2026', lokasi: 'Kampus A UNJ dan Batalyon Taipur Cikarang', namaAnggota: 'Eben Haezer Sitorus / Raffli Syahputra', nimFakultas: '1402621001 / FISH (Pendidikan Geografi)', jabatan: 'Komandan Pasukan Pelaksana Giat Satuan', fasilitas: 'Aula Latief Hendraningrat & GOR Otista', jumlahPeserta: '± 350 Peserta dan Delegasi Menwa Se-Indonesia', }); const [generatedDoc, setGeneratedDoc] = useState(''); const [pressParams, setPressParams] = useState({ namaKegiatan: 'Pembukaan Giat Latihan Satuan Menwa UNJ 2026', lokasi: 'Plaza Kampus A Universitas Negeri Jakarta', inspektur: 'Komandan Satuan Menwa UNJ Eben Haezer Sitorus', }); const [generatedPress, setGeneratedPress] = useState(''); /* Tab 5 & 7 */ const [geranatStats, setGeranatStats] = useState({ totalTeams: 5, totalVotes: 9120 }); const [submissionStats, setSubmissionStats] = useState({ total: 0, pendaftaran: 0, permohonan: 0, pengajuan: 0 }); const [auditLogs, setAuditLogs] = useState([]); const [ccLogs, setCcLogs] = useState([]); const [scheduledTasks, setScheduledTasks] = useState([]); const [newTaskDesc, setNewTaskDesc] = useState(''); const [rawSchemaInput, setRawSchemaInput] = useState(''); const [healthStatus, setHealthStatus] = useState('100% Optimal • Semua Gambar Terindeks SVG'); /* Load live data */ const refreshCloudTelemetry = async () => { try { const [teams, subs, audits, cLogs, tasks] = await Promise.all([ getGeranatTeams(), getAllSubmissionsForAdmin(), getAuditLogs(), getCommandCenterLogs(), getScheduledTasks(), ]); if (teams && teams.length > 0) { const votes = teams.reduce((acc, t) => acc + (t.votesCount || 0), 0); setGeranatStats({ totalTeams: teams.length, totalVotes: votes }); } if (subs) { setSubmissionStats({ total: subs.length, pendaftaran: subs.filter((s) => s.serviceType?.startsWith('pendaftaran_')).length, permohonan: subs.filter((s) => s.serviceType?.startsWith('permohonan_')).length, pengajuan: subs.filter((s) => !s.serviceType?.startsWith('pendaftaran_') && !s.serviceType?.startsWith('permohonan_')).length, }); } if (audits) setAuditLogs(audits); if (cLogs) setCcLogs(cLogs); if (tasks) setScheduledTasks(tasks); } catch (e) { console.warn('Telemetry refresh note:', e); } }; useEffect(() => { if (authSession.isAuthenticated) { refreshCloudTelemetry(); } }, [authSession.isAuthenticated, activeTab]); const copyToClipboard = (text, id) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(false), 2000); }; const downloadTextFile = (content, filename) => { const blob = new Blob([content], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); }; /* Official portal */ const [adminOfficialPortals, setAdminOfficialPortals] = useState([]); const [loadingPortals, setLoadingPortals] = useState(false); const [newSchoolName, setNewSchoolName] = useState(''); const [newSchoolWa, setNewSchoolWa] = useState(''); const [newSchoolNoUrut, setNewSchoolNoUrut] = useState(''); const [newSchoolVerified, setNewSchoolVerified] = useState(true); const [portalActionMsg, setPortalActionMsg] = useState(''); const [portalSearchFilter, setPortalSearchFilter] = useState('');
  const [visiblePinSlug, setVisiblePinSlug] = useState(null);
  const [resetPinModalPortal, setResetPinModalPortal] = useState(null);
  const [adminNewPinInput, setAdminNewPinInput] = useState('123456');
  const [resetPinSuccessMsg, setResetPinSuccessMsg] = useState('');
 const loadAdminOfficialPortals = async () => { setLoadingPortals(true); try { const list = await getAllOfficialPortals(); setAdminOfficialPortals(list); } finally { setLoadingPortals(false); } }; useEffect(() => { if (activeTab === 'official_portals') { loadAdminOfficialPortals(); } }, [activeTab]); const handleAdminCreateSchool = async (e) => { e.preventDefault(); if (!newSchoolName.trim()) return; const cleanWa = normalizeWaNumber(newSchoolWa); if (!cleanWa) { setPortalActionMsg('Nomor WhatsApp wajib diisi angka valid.'); return; } const cleanSlug = slugifySchoolName(newSchoolName); await saveOfficialPortal({ schoolSlug: cleanSlug, schoolName: newSchoolName.trim(), whatsappNumber: cleanWa, nomorUrut: newSchoolNoUrut.trim() || `KONTINGEN-${String(adminOfficialPortals.length + 1).padStart(2, '0')}`, isVerifiedByAdmin: newSchoolVerified, schoolProfile: { schoolName: newSchoolName.trim(), jalan: '', rtRw: '', kelurahan: '', kecamatan: '', kabupatenKota: '', provinsi: '', } }); setNewSchoolName(''); setNewSchoolWa(''); setNewSchoolNoUrut(''); setPortalActionMsg(`Kontingen "${newSchoolName.trim()}" (/official/${cleanSlug}) berhasil didaftarkan dan diverifikasi!`); await loadAdminOfficialPortals(); setTimeout(() => setPortalActionMsg(''), 4000); }; const handleAdminToggleVerification = async (portal) => { const nextStatus = !portal.isVerifiedByAdmin; await saveOfficialPortal({ ...portal, isVerifiedByAdmin: nextStatus }); await loadAdminOfficialPortals(); setPortalActionMsg(`Status verifikasi ${portal.schoolName} diubah: ${nextStatus ? 'TERVERIFIKASI AKTIF' : 'NONAKTIF'}`); setTimeout(() => setPortalActionMsg(''), 3000); }; 
  const handleAdminResetPin = async (e) => {
    e.preventDefault();
    if (!resetPinModalPortal) return;
    const cleanPin = adminNewPinInput.trim();
    if (cleanPin.length !== 6 || !/^[0-9]{6}$/.test(cleanPin)) {
      alert('PIN Baru wajib tepat 6 angka numerik (0-9).');
      return;
    }
    try {
      await resetOfficialPinByAdmin(
        resetPinModalPortal.schoolSlug,
        cleanPin,
        user?.email || 'Mako Admin'
      );
      setResetPinSuccessMsg(`PIN untuk ${resetPinModalPortal.schoolName} berhasil direset menjadi ${cleanPin}`);
      await loadAdminOfficialPortals();
    } catch (err) {
      alert(`Gagal mereset PIN: ${err.message}`);
    }
  };

  const handleAdminSendPinWhatsApp = (portal, pin) => {
    const cleanWa = normalizeWaNumber(portal.whatsappNumber);
    if (!cleanWa) {
      alert('Nomor WhatsApp kontingen belum diatur.');
      return;
    }
    const message = `Halo Official ${portal.schoolName},\n\nPIN Keamanan Portal Official GERANAT VII 2026 Anda telah direset oleh Komando CommandCenter Satuan Menwa UNJ.\n\n🔐 PIN Baru Anda: ${pin}\n🔗 Buka Portal: https://menwaunj.com/official/${portal.schoolSlug}\n\nDemi keamanan data kontingen, mohon segera ganti PIN ini setelah Anda login.\n\nWidya Castrena Dharma Siddha!\nSatuan Resimen Mahasiswa Jayakarta UNJ`;
    const waUrl = `https://wa.me/62${cleanWa}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAdminPrintBukuPasukan = (portal) => {
    const html = generateBukuPasukanHtml(portal);
    const existingFrame = document.getElementById('menwa-official-print-frame');
    if (existingFrame) existingFrame.remove();
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
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 350);
  };
const handleAdminDeletePortal = async (slug, name) => { if (!confirm(`Hapus seluruh data subdomain dan berkas kontingen "${name}"?`)) return; await deleteOfficialPortal(slug); await loadAdminOfficialPortals(); setPortalActionMsg(`Subdomain /official/${slug} telah dihapus.`); setTimeout(() => setPortalActionMsg(''), 3000); }; const handleFirebaseGoogleSignIn = async () => { setAuthError(''); setAuthLoading(true); try { const loggedUser = await signInWithGoogle(); if (loggedUser?.email) { loginWithGoogle(loggedUser.email, userRole?.toUpperCase() || 'STAFF_ADMIN', loggedUser.displayName || 'Perwira Komando'); } } catch (err) { setAuthError(err.message || 'Gagal melakukan autentikasi Google Firebase.'); } finally { setAuthLoading(false); } }; const handleFirebaseEmailSignIn = async (e) => { e.preventDefault(); setAuthError(''); setAuthLoading(true); try { const loggedUser = await signInWithEmail(loginEmail.trim(), loginPassword); if (loggedUser?.email) { loginWithGoogle(loggedUser.email, userRole?.toUpperCase() || 'STAFF_ADMIN', loggedUser.displayName || 'Perwira Komando'); } } catch (err) { setAuthError('Email atau kata sandi tidak valid atau tidak memiliki hak akses RBAC.'); } finally { setAuthLoading(false); } }; const handlePromptSubmit = (e) => { e.preventDefault(); if (!promptText.trim()) return; proposeNaturalLanguage(promptText); setPromptText(''); }; /* Auto-Convert */ const handleNewImageUpload = async (e, replaceContentId = null, targetTabOverride = null) => { const file = e.target.files?.[0]; if (!file) return; setIsUploadingSvg(true); const existingItem = replaceContentId ? contentRegistry.find((i) => i.contentId === replaceContentId) : null; const targetTab = targetTabOverride || existingItem?.tabId || uploadTabId; const targetSection = existingItem?.sectionId || 'custom_svg_asset'; const targetTitle = uploadTitle.trim() || existingItem?.title || file.name.replace(/\.[^/.]+$/, ''); const targetCaption = uploadCaption.trim() || existingItem?.caption || `Dokumentasi resmi ${file.name}`; const reader = new FileReader(); reader.onload = async (ev) => { try { await uploadAndRegisterImage({ tabId: targetTab, sectionId: targetSection, title: targetTitle, caption: targetCaption, fileDataUrl: ev.target.result, fileName: file.name, replaceContentId, }); setUploadTitle(''); setUploadCaption(''); } finally { setIsUploadingSvg(false); if (e.target) e.target.value = ''; } }; reader.readAsDataURL(file); }; const [berandaSectionFilter, setBerandaSectionFilter] = useState('all'); const activeRegistryItems = useMemo(() => { let list = contentRegistry.filter((item) => item.isActive !== false); if (selectedTrackerTab !== 'all') { list = list.filter((item) => item.tabId === selectedTrackerTab); } if (selectedTrackerTab === 'beranda' && berandaSectionFilter !== 'all') { list = list.filter((item) => item.sectionId === berandaSectionFilter); } if (selectedTrackerTab === 'struktur' && strukturSubFilter !== 'all') { list = list.filter((item) => { const unit = (item.unitLabel || '').toLowerCase(); if (strukturSubFilter === 'pimpinan') return unit.includes('pimpinan'); if (strukturSubFilter === 'staf') return unit.includes('staf'); if (strukturSubFilter === 'pokpas') return unit.includes('kelompok') || unit.includes('anggota'); return true; }); } if (selectedTrackerTab === 'youth-spark' && youthSparkSubFilter !== 'all') { list = list.filter((item) => item.sectionId === youthSparkSubFilter); } if (onlyTempVisuals) { list = list.filter((item) => item.isTemporaryVisual); } if (trackerSearchQuery.trim()) { const q = trackerSearchQuery.trim().toLowerCase(); list = list.filter( (item) => (item.title || '').toLowerCase().includes(q) || (item.caption || '').toLowerCase().includes(q) || (item.contentId || '').toLowerCase().includes(q) || (item.memberName || '').toLowerCase().includes(q) || (item.roleLabel || '').toLowerCase().includes(q) ); } return list; }, [ contentRegistry, selectedTrackerTab, berandaSectionFilter, strukturSubFilter, youthSparkSubFilter, onlyTempVisuals, trackerSearchQuery, ]); 
  const galleryGroups = useMemo(() => {
    const groupsMap = new Map();
    activeRegistryItems.forEach((item) => {
      if (item.tabId !== 'gallery') return;
      const key = item.albumId || item.albumTitle || 'album-lainnya';
      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          id: key,
          title: item.albumTitle || item.groupTitle || item.title?.split(' — Slide')[0] || key,
          year: item.year || 2026,
          coverUrl: item.imageUrl,
          items: [],
        });
      }
      const grp = groupsMap.get(key);
      if (item.isCover) {
        grp.coverUrl = item.imageUrl;
      }
      grp.items.push(item);
    });
    return Array.from(groupsMap.values());
  }, [activeRegistryItems]);

  const displayedGalleryGroups = useMemo(() => {
    if (galleryYearFilter === 'all') return galleryGroups;
    return galleryGroups.filter((g) => String(g.year) === String(galleryYearFilter));
  }, [galleryGroups, galleryYearFilter]);

  const toggleAlbumExpand = (albumId) => {
    setExpandedAlbumIds((prev) => ({
      ...prev,
      [albumId]: !prev[albumId],
    }));
  };

  const toggleAllAlbums = () => {
    const nextState = !allExpanded;
    setAllExpanded(nextState);
    const newMap = {};
    displayedGalleryGroups.forEach((g) => {
      newMap[g.id] = nextState;
    });
    setExpandedAlbumIds(newMap);
  };

  const renderTrackerCard = (item) => (
    <div key={item.contentId} className="bg-[#1e1e1e] border border-slate-800 hover:border-[#006569] rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl" > <div> <div className={`relative bg-slate-950 overflow-hidden transition-all ${ previewAspectRatio === '1:1' ? 'aspect-square' : 'aspect-video' }`} > <img src={item.imageUrl || item.originalImageUrl || '/foto-kampus-unj.jpg'} alt={item.caption || item.title} onError={(e) => { const fallback = item.originalImageUrl || '/foto-kampus-unj.jpg'; if (e.currentTarget.src !== fallback) { e.currentTarget.src = fallback; } }} className="w-full h-full object-cover" /> <span className="absolute top-3 left-3 rounded-full bg-[#006569] text-[#FFDD00] px-3 py-0.5 text-[10px] font-black uppercase"> Tab: {item.tabId} </span> <span className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold border ${ item.isTemporaryVisual ? 'bg-amber-950/90 border-amber-400/50 text-amber-300' : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300' }`} > {item.isTemporaryVisual ? 'Visual Sementara' : 'Foto Resmi Aktif'} </span> {item.unitLabel && ( <span className="absolute bottom-2.5 left-3 rounded-lg bg-slate-950/90 border border-white/15 text-teal-300 px-2.5 py-0.5 text-[10px] font-bold"> {item.unitLabel} </span> )} </div> <div className="p-5 space-y-3"> <div> <span className="text-[10px] font-mono text-slate-400 block"> ID: {item.contentId} • Seksi: {item.sectionId} </span> <h4 className="font-black text-white text-base mt-0.5">{item.title}</h4> </div> {/* Inline Caption Editor */} {editingCaptionId === item.contentId ? ( <div className="space-y-2"> <textarea rows={2} value={editingCaptionText} onChange={(e) => setEditingCaptionText(e.target.value)} className="w-full bg-slate-900 border border-[#FFDD00] rounded-xl p-2.5 text-xs text-white" /> <div className="flex gap-2"> <button type="button" onClick={async () => { await updateRegistryItem(item.contentId, { caption: editingCaptionText }); setEditingCaptionId(null); }} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer" > Simpan Caption </button> <button type="button" onClick={() => setEditingCaptionId(null)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer" > Batal </button> </div> </div> ) : ( <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5 text-xs text-slate-300"> <span className="text-[10px] font-bold uppercase text-teal-400 block mb-0.5">Caption Aktif:</span> "{item.caption}" </div> )} {/* Inline URL Photo Replacement Editor */} {editingUrlId === item.contentId && ( <div className="p-3 rounded-xl bg-slate-900 border border-[#FFDD00]/60 space-y-2"> <label className="text-[10px] font-black uppercase text-[#FFDD00] block"> Tempel URL Foto Resmi Baru (JPG / PNG / WebP / SVG): </label> <input type="url" value={editingUrlText} onChange={(e) => setEditingUrlText(e.target.value)} placeholder="https://..." className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white" /> <div className="flex gap-2"> <button type="button" onClick={async () => { if (!editingUrlText.trim()) return; await updateRegistryItem(item.contentId, { imageUrl: editingUrlText.trim(), isTemporaryVisual: false, }); setEditingUrlId(null); }} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer" > Terapkan Foto URL </button> <button type="button" onClick={() => setEditingUrlId(null)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer" > Batal </button> </div> </div> )} {/* Inline Social Media Sync Editor (Khusus Album Galeri) */} {editingSocialId === item.contentId && ( <div className="p-3.5 rounded-xl bg-slate-900 border border-teal-400/60 space-y-2.5"> <span className="text-[10px] font-black uppercase text-teal-300 block"> Sinkronisasi Tautan & Metrik Sosial Media: </span> <div className="grid grid-cols-2 gap-2"> <div> <label className="text-[10px] text-slate-400 block mb-0.5">Platform</label> <select value={socialDraft.socialPlatform} onChange={(e) => setSocialDraft({ ...socialDraft, socialPlatform: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white" > <option value="instagram">Instagram (@menwaunj)</option> <option value="youtube">YouTube (Menwa UNJ)</option> <option value="tiktok">TikTok (@menwaunj)</option> <option value="berita">Portal Berita Resmi</option> </select> </div> <div> <label className="text-[10px] text-slate-400 block mb-0.5">Jumlah Like Pos</label> <input type="number" min={0} value={socialDraft.syncedLikes} onChange={(e) => setSocialDraft({ ...socialDraft, syncedLikes: Number(e.target.value) || 0 })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white" /> </div> </div> <div> <label className="text-[10px] text-slate-400 block mb-0.5">Tautan Postingan Resmi</label> <input type="url" value={socialDraft.socialUrl} onChange={(e) => setSocialDraft({ ...socialDraft, socialUrl: e.target.value })} placeholder="https://www.instagram.com/p/..." className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white" /> </div> <div className="flex gap-2"> <button type="button" onClick={async () => { await updateRegistryItem(item.contentId, { socialPlatform: socialDraft.socialPlatform, socialUrl: socialDraft.socialUrl.trim(), syncedLikes: Number(socialDraft.syncedLikes) || 0, }); setEditingSocialId(null); }} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer" > Simpan & Sinkronkan </button> <button type="button" onClick={() => setEditingSocialId(null)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer" > Batal </button> </div> </div> )} {item.tabId === 'gallery' && ( <div className="flex items-center justify-between text-[11px] bg-slate-900/70 border border-white/5 px-3 py-1.5 rounded-xl text-slate-300"> <span className="uppercase font-bold text-teal-300"> {item.socialPlatform || 'instagram'} • {item.syncedLikes || 0} Likes </span> <button type="button" onClick={() => { setEditingSocialId(item.contentId); setSocialDraft({ socialPlatform: item.socialPlatform || 'instagram', socialUrl: item.socialUrl || 'https://www.instagram.com/menwaunj/', syncedLikes: item.syncedLikes || 0, }); }} className="text-[11px] font-bold text-[#FFDD00] hover:underline cursor-pointer" > 🔗 Link & Sync Sosmed </button> </div> )} <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1"> <span> Dimensi: {item.dimensions?.width || 1200}×{item.dimensions?.height || 675} </span> <span>{Math.round((item.fileSize || 120000) / 1024)} KB</span> </div> </div> </div> {/* Action Bar per Gambar (Termasuk Revert to Original SVG/WebP) */} <div className="px-5 py-3.5 bg-slate-950 border-t border-white/10 flex flex-wrap items-center justify-between gap-2"> <button type="button" onClick={() => { setEditingCaptionId(item.contentId); setEditingCaptionText(item.caption || ''); }} className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1 cursor-pointer" > <Edit3 size={12} /> Caption </button> <label className="px-2.5 py-1.5 rounded-lg bg-[#006569] hover:bg-[#004d50] text-xs font-bold text-[#FFDD00] flex items-center gap-1 cursor-pointer shadow"> <Upload size={12} /> Ganti Foto <input type="file" accept="image/*" onChange={(e) => handleNewImageUpload(e, item.contentId, item.tabId)} className="hidden" /> </label> <button type="button" onClick={() => { setEditingUrlId(item.contentId); setEditingUrlText(item.imageUrl?.startsWith('data:') ? '' : item.imageUrl || ''); }} className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-teal-300 cursor-pointer" title="Ganti via URL Gambar" > URL Foto </button> <button type="button" onClick={() => revertRegistryItemToOriginal(item.contentId)} className="px-2.5 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer" title="Kembalikan ke file SVG / WebP asli bawaan" > <RotateCcw size={12} /> Revert </button> <button type="button" onClick={() => setPreviewModalItem(item)} className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer" title="Preview Ukuran Penuh (1:1 & 16:9)" > <Eye size={14} /> </button> <button type="button" onClick={() => softRemoveRegistryItem(item.contentId)} className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 cursor-pointer" title="Nonaktifkan (Soft Delete)" > <Trash2 size={14} /> </button> </div> </div>
  );

  const tabOverviewStats = useMemo(() => { return PORTAL_TABS_OVERVIEW.map((t) => { const items = contentRegistry.filter((i) => i.tabId === t.tabId && i.isActive !== false); const allSvg = items.every((i) => i.imageFormat === 'svg'); const latest = items.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())[0]; return { ...t, count: items.length, allSvg, lastUpdated: latest?.updatedAt ? new Date(latest.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Standar Bawaan', }; }); }, [contentRegistry]); const latestAction = history[0]; /* VIEW 1: GATEWAY LOGIN MODAL */ if (!authSession.isAuthenticated) { return ( <div className="min-h-screen bg-[#141414] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans"> <div className="absolute inset-0 bg-[radial-gradient(#006569_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" /> <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#006569]/25 rounded-full blur-[120px] pointer-events-none" /> <div className="w-full max-w-md bg-[#1e1e1e] border border-[#006569] rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative z-10 space-y-6"> <div className="text-center space-y-2"> <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#006569] to-[#00383b] text-[#FFDD00] flex items-center justify-center border border-[#FFDD00]/40 shadow-xl mb-3"> <Lock size={28} /> </div> <span className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-[#FFDD00] block"> OTORISASI RBAC KOMANDO SATUAN UNJ </span> <h1 className="text-2xl font-black text-white tracking-tight"> Gerbang Command Center </h1> <p className="text-xs text-slate-400"> Akses terenkripsi berbasis Firebase Authentication & Role-Based Access Control (`dansat`, `wadansat`, `staf_adminu`). </p> </div> {authError && ( <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2"> <AlertTriangle size={15} className="shrink-0" /> <span>{authError}</span> </div> )} {/* Sesi RBAC Terotorisasi Aktif - Masuk 1 Klik */} {user && isStaffAdmin && ( <div className="p-4 rounded-2xl bg-[#006569]/30 border border-[#FFDD00]/50 space-y-2.5"> <div className="flex items-center gap-2 text-xs font-black text-[#FFDD00]"> <Shield size={16} /> <span>Sesi RBAC Terverifikasi ({userRole.toUpperCase()})</span> </div> <p className="text-[11px] text-slate-300"> Akun Anda memiliki otorisasi komando aktif. Klik di bawah untuk membuka Command Center. </p> <button type="button" onClick={() => loginWithGoogle(user.email, userRole.toUpperCase(), profile?.displayName || 'Perwira Komando')} className="w-full py-2.5 px-4 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer" > <CheckCircle2 size={14} /> Masuk ke Command Center </button> </div> )} <button type="button" onClick={handleFirebaseGoogleSignIn} disabled={authLoading} className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2.5 cursor-pointer" > <span>Masuk dengan Google OAuth (Firebase Auth)</span> </button> <form onSubmit={handleFirebaseEmailSignIn} className="space-y-4 pt-2 border-t border-white/10"> <div> <label className="text-xs font-bold text-slate-300 block mb-1"> Email Akun Perwira / Staf Adminu: </label> <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Masukkan email akun resmi terdaftar..." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FFDD00]" /> </div> <div> <label className="text-xs font-bold text-slate-300 block mb-1"> Kata Sandi Akun: </label> <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••••••" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FFDD00]" /> </div> <button type="submit" disabled={authLoading || !loginEmail.trim() || !loginPassword.trim()} className="w-full py-3 px-4 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider transition shadow-lg cursor-pointer disabled:opacity-50" > {authLoading ? 'Memverifikasi RBAC...' : 'Otorisasi Masuk Command Center'} </button> </form> <div className="pt-4 border-t border-white/10 text-center"> <button type="button" onClick={() => navigate('/')} className="text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto cursor-pointer" > <ArrowLeft size={14} /> Kembali ke Beranda Publik </button> </div> </div> </div> ); } /* VIEW 2: AUTHENTICATED COMMAND CENTER */ return ( <div className="min-h-screen bg-[#141414] text-slate-100 font-sans flex flex-col pb-20"> {/* Top Tactical Command Header */} <header className="sticky top-0 z-40 bg-[#030f14]/95 border-b border-[#006569]/60 backdrop-blur-xl px-4 py-3 sm:px-8"> <div className="max-w-[1760px] mx-auto flex flex-wrap items-center justify-between gap-4"> <div className="flex items-center gap-3"> <div className="w-10 h-10 rounded-xl bg-[#006569] text-[#FFDD00] flex items-center justify-center border border-[#FFDD00]/40 shadow-lg shrink-0"> <Radio size={20} className="animate-pulse" /> </div> <div> <div className="flex items-center gap-2"> <h1 className="text-sm sm:text-base font-black text-white uppercase tracking-wider"> Mako Command Center V8 </h1> <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1"> <UserCheck size={11} /> {authSession.role} </span> {lockdownData.isLockdown ? ( <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500 font-black animate-pulse flex items-center gap-1"> <ShieldAlert size={11} /> SIAGA 1: TERKUNCI </span> ) : ( <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-500/40 font-bold flex items-center gap-1"> <ShieldCheck size={11} /> DEFENSE: SECURE </span> )} </div> <p className="text-[11px] text-slate-400 font-mono"> Sesi Aktif: <strong className="text-slate-200">{authSession.userEmail}</strong> • Jam Piket: {authSession.loginTime} WIB </p> </div> </div> <div className="flex items-center gap-3"> <button type="button" onClick={() => navigate('/')} className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-1.5" > <ArrowLeft size={14} /> <span>Lihat Web Publik</span> </button> <button type="button" onClick={logout} className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-xs font-bold text-red-300 transition flex items-center gap-1.5" > <LogOut size={14} /> <span>Kunci & Logout</span> </button> </div> </div> </header> <main className="max-w-[1760px] mx-auto w-full px-4 sm:px-8 py-6 space-y-6 flex-grow"> {/* 7-Tab Navigation Bar (Bagian 4.F) */} <nav className="bg-[#1e1e1e] border border-[#006569] rounded-2xl p-2 flex flex-wrap items-center gap-2 shadow-xl"> {COMMAND_TABS.map((tab) => ( <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-wider transition flex items-center gap-2 cursor-pointer ${ activeTab === tab.id ? 'bg-[#006569] text-[#FFDD00] border border-[#FFDD00]/50 shadow-lg' : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent' }`} > <span>{tab.label}</span> </button> ))} </nav> {/* =================================================================== TAB 1: 🤖 AI AGENT (Natural Language + Preview & Approval Card) =================================================================== */} {activeTab === 'ai_agent' && ( <div className="grid grid-cols-1 lg:grid-cols-12 gap-6"> <div className="lg:col-span-7 bg-[#1e1e1e] border border-[#006569] rounded-3xl p-6 space-y-6 shadow-2xl"> <div className="border-b border-white/10 pb-4 flex items-center justify-between"> <div> <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2"> <Sparkles size={20} className="text-[#FFDD00]" /> AI Agent Command Center (NLP Engine) </h2> <p className="text-xs text-slate-400 mt-0.5"> Ketik perintah bahasa alami untuk memperbarui caption gambar, menyuntikkan galeri/CTA, atau merombak tata letak. </p> </div> <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full font-bold"> Approval Mode Aktif </span> </div> <form onSubmit={handlePromptSubmit} className="space-y-3"> <label className="block text-xs font-black uppercase tracking-wider text-slate-300"> Instruksi Bahasa Alami (Natural Language): </label> <div className="relative"> <textarea rows={3} value={promptText} onChange={(e) => setPromptText(e.target.value)} placeholder="Contoh: 'Ubah caption gambar di tab Beranda menjadi: Apel Korps Menwa UNJ' atau 'Tambahkan tombol WhatsApp Piket Mako di hero'..." className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FFDD00]" /> <button type="submit" disabled={!promptText.trim()} className="absolute bottom-3 right-3 px-4 py-2 rounded-xl bg-[#006569] text-[#FFDD00] text-xs font-black hover:bg-[#004d50] disabled:opacity-40 transition flex items-center gap-1.5 shadow cursor-pointer" > <span>Analisis & Buat Pratinjau</span> <Send size={14} /> </button> </div> </form> {/* Proposed Changes Preview Card (Bagian 4.E: Wajib Approve / Reject Sebelum Eksekusi) */} {pendingAIProposal && ( <div className="rounded-2xl bg-amber-950/30 border-2 border-[#FFDD00] p-5 space-y-4 animate-fade-in"> <div className="flex items-center justify-between border-b border-amber-500/30 pb-2.5"> <span className="text-xs font-black uppercase tracking-wider text-[#FFDD00] flex items-center gap-2"> <Sparkles size={15} /> Pratinjau Perubahan AI Agent (Menunggu Konfirmasi Admin) </span> <span className="text-[10px] font-mono bg-amber-500/20 text-amber-200 px-2.5 py-0.5 rounded-full"> Target: {pendingAIProposal.targetTab.toUpperCase()} </span> </div> <div className="space-y-2 text-xs"> <div className="text-slate-300"> <span className="text-slate-400">Perintah Input:</span>{' '} <em className="text-white">"{pendingAIProposal.prompt}"</em> </div> <div className="p-3 rounded-xl bg-slate-950 border border-white/10 text-emerald-300 font-bold"> {pendingAIProposal.summary} </div> </div> <div className="flex items-center gap-3 pt-1"> <button type="button" onClick={approveAIProposal} className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg" > <Check size={15} /> <span>✅ Approve & Execute</span> </button> <button type="button" onClick={rejectAIProposal} className="py-2.5 px-4 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-500/40 font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer" > <X size={15} /> <span>❌ Reject</span> </button> </div> </div> )} {/* Quick Presets */} <div className="space-y-2"> <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block"> Pilihan Instruksi Cepat: </span> <div className="flex flex-wrap gap-2"> {QUICK_PROMPTS.map((p, idx) => ( <button key={idx} type="button" onClick={() => setPromptText(p)} className="text-left text-xs bg-slate-900 border border-white/10 hover:border-[#FFDD00] text-slate-300 px-3 py-1.5 rounded-xl transition cursor-pointer" > {p} </button> ))} </div> </div> {/* Latest Executed Action Output */} {latestAction && ( <div className="border border-[#006569]/60 rounded-2xl bg-slate-950 p-5 space-y-3"> <div className="flex items-center justify-between border-b border-white/10 pb-2"> <span className="text-xs font-black uppercase tracking-wider text-[#FFDD00] flex items-center gap-1.5"> <CheckCircle2 size={16} /> Eksekusi Terakhir </span> <span className="text-[11px] font-mono text-slate-400">{latestAction.timestamp}</span> </div> <p className="text-xs text-slate-200 font-medium">{latestAction.userMessage}</p> <pre className="canvas-json-block text-[11px]"> {JSON.stringify(latestAction.schema, null, 2)} </pre> </div> )} </div> {/* Right Column: 3D Hologram Globe + Quick Stats */} <div className="lg:col-span-5 space-y-6"> <div className="bg-[#1e1e1e] border border-[#006569] rounded-3xl p-5 shadow-2xl flex flex-col space-y-4"> <div className="flex items-center justify-between border-b border-white/10 pb-3"> <span className="text-xs font-black uppercase tracking-wider text-[#FFDD00] flex items-center gap-2"> <Radio size={15} /> Status Telemetri Mako </span> <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-bold"> <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> SISTEM ONLINE </span> </div> <div className="grid grid-cols-2 gap-3 text-xs"> <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1"> <span className="text-[10px] font-mono uppercase text-slate-400 block">Pangkalan Data</span> <strong className="text-sm font-bold text-white block">Firestore Native</strong> <span className="text-[10px] text-emerald-400">Terkoneksi</span> </div> <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1"> <span className="text-[10px] font-mono uppercase text-slate-400 block">Otentikasi</span> <strong className="text-sm font-bold text-white block">Firebase Auth</strong> <span className="text-[10px] text-emerald-400">Siaga (Multi-Role)</span> </div> <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1"> <span className="text-[10px] font-mono uppercase text-slate-400 block">AI Gemini</span> <strong className="text-sm font-bold text-white block">2.5-Flash Server</strong> <span className="text-[10px] text-emerald-400">Hemat Kuota Aktif</span> </div> <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1"> <span className="text-[10px] font-mono uppercase text-slate-400 block">Mode Offline</span> <strong className="text-sm font-bold text-white block">PWA Service Worker</strong> <span className="text-[10px] text-emerald-400">Aktif & Siap PWA</span> </div> </div> <div className="pt-1 flex gap-2"> <button type="button" onClick={() => setActiveTab('image_tracker')} className="flex-1 py-2.5 px-3 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] text-xs font-black uppercase tracking-wider transition text-center cursor-pointer" > Buka Image Tracker </button> <button type="button" onClick={refreshCloudTelemetry} className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition cursor-pointer" title="Segarkan telemetri cloud" > Refresh </button> </div> </div> <div className="bg-[#1e1e1e] border border-[#006569] rounded-3xl p-5 shadow-2xl space-y-3"> <span className="text-xs font-black uppercase tracking-wider text-[#FFDD00] block"> Ringkasan Aset & Komponen Portal </span> <div className="grid grid-cols-2 gap-3 text-xs"> <div className="p-3 rounded-xl bg-slate-900 border border-white/5"> <span className="text-[10px] font-mono text-slate-400 block">Gambar Terindeks (SVG)</span> <strong className="text-xl font-mono text-[#FFDD00] font-black">{activeRegistryItems.length} Aset</strong> </div> <div className="p-3 rounded-xl bg-slate-900 border border-white/5"> <span className="text-[10px] font-mono text-slate-400 block">Komponen Canvas</span> <strong className="text-xl font-mono text-emerald-400 font-black">{components.length} Elemen</strong> </div> </div> </div> </div> </div> )} {/* ===================================================================
    TAB: 🛡️ KEDARURATAN & KEAMANAN SIBER (SIAGA 1, KILL-SWITCH, GOLDEN RESTORE, FORENSIK)
    =================================================================== */}
{activeTab === 'cyber_security' && (
  <div className="space-y-6 animate-fade-in">
    {/* Incident Response Banner */}
    <div className="bg-[#1e1e1e] border border-[#006569] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[11px] font-mono mb-2">
            <ShieldAlert size={13} /> PROTOKOL TANGGAP DARURAT SIBER & FORENSIK DIGITAL (SEV-0)
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            🛡️ Pusat Kendali Keamanan Siber & Pemulihan Integritas
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl">
            Modul pertahanan siber taktis Mako Satuan UNJ. Didesain untuk meredam serangan peretasan (defacement/data breach),
            mengeksekusi Kill Switch darurat (<em className="text-amber-300 font-mono">Siaga 1</em>), memulihkan pangkalan data ke Golden Baseline,
            dan mengunduh berkas rantai bukti digital (<em className="text-teal-300 font-mono">ISO/IEC 27037</em>) untuk perlindungan hukum UU ITE.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              const logs = await getIncidentLogs();
              setIncidentLogsList(logs);
            }}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition"
          >
            <RefreshCw size={14} /> Segarkan Telemetri
          </button>
        </div>
      </div>

      {securityBannerMsg && (
        <div className="mt-4 p-3.5 rounded-2xl bg-teal-950/90 border border-[#006569] text-teal-200 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="text-[#FFDD00]" />
            <span>{securityBannerMsg}</span>
          </div>
          <button type="button" onClick={() => setSecurityBannerMsg('')} className="text-teal-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 3 Major Operational Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
        {/* Card 1: Emergency Kill-Switch */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
          lockdownData.isLockdown ? 'bg-rose-950/30 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.2)]' : 'bg-slate-900/80 border-white/10'
        }`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-black tracking-wider text-slate-400">
                1. Sakelar Darurat (Kill Switch)
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                lockdownData.isLockdown ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {lockdownData.isLockdown ? 'SIAGA 1 AKTIF' : 'NORMAL (SIAGA 4)'}
              </span>
            </div>
            <h3 className="text-base font-black text-white">Mode Kedaruratan Publik</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Memutus akses pengunjung umum ke seluruh halaman publik dan menggantinya seketika dengan layar siaga pemeliharaan resmi berstempel komando.
            </p>
          </div>

          <div className="pt-2">
            {lockdownData.isLockdown ? (
              <button
                type="button"
                disabled={isEngagingLockdown}
                onClick={() => handleToggleLockdown(false)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={15} />
                <span>Normalkan Situs (Buka Publik)</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isEngagingLockdown}
                onClick={() => handleToggleLockdown(true)}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldAlert size={15} />
                <span>🚨 Aktifkan Siaga 1 (Kunci Situs)</span>
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Golden Master Restore */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col justify-between space-y-4 hover:border-amber-500/60 transition">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-black tracking-wider text-slate-400">
                2. Pemulihan Pangkalan Data
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                GOLDEN MASTER
              </span>
            </div>
            <h3 className="text-base font-black text-white">Purge & Restore Golden State</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Menghapus seluruh injeksi teks fitnah, caption rusak, atau modifikasi liar penyerang pada 100+ aset, lalu menyinkronkan ulang baseline resmi.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              disabled={isRestoringGolden}
              onClick={handleRestoreGoldenState}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw size={15} />
              <span>{isRestoringGolden ? 'Memulihkan Data...' : '🛡️ Eksekusi Pemulihan Total'}</span>
            </button>
          </div>
        </div>

        {/* Card 3: Forensic Evidence Bundle */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col justify-between space-y-4 hover:border-[#006569] transition">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-black tracking-wider text-slate-400">
                3. Perlindungan Hukum UU ITE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                ISO/IEC 27037
              </span>
            </div>
            <h3 className="text-base font-black text-white">Bundel Bukti Forensik Digital</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mengunduh arsip bukti telemetri terenkripsi hash SHA-256 untuk diserahkan ke penasihat hukum / kepolisian membuktikan situs korban sabotase.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleDownloadForensicEvidence}
              className="w-full py-3 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={15} />
              <span>📥 Unduh Bukti Forensik (.json)</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Incident Logs Table (Immutable Telemetry) */}
    <div className="bg-[#1e1e1e] border border-[#006569] rounded-3xl p-6 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Terminal size={18} className="text-[#FFDD00]" /> Catatan Forensik & Riwayat Insiden Kedaruratan
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Log ini bersifat <em className="text-emerald-400">Immutable (Append-Only)</em> dan terlindungi secara hukum sebagai rantai bukti sah.
          </p>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Total Insiden: {incidentLogsList.length}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
              <th className="py-2.5 px-3">ID Insiden</th>
              <th className="py-2.5 px-3">Tipe / Level</th>
              <th className="py-2.5 px-3">Waktu Kejadian</th>
              <th className="py-2.5 px-3">Aktor Pelapor</th>
              <th className="py-2.5 px-3">Uraian / Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {incidentLogsList.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500 italic">
                  Belum ada rekaman insiden kedaruratan tercatat. Sistem dalam kondisi prima.
                </td>
              </tr>
            ) : (
              incidentLogsList.map((log) => (
                <tr key={log.incidentId || log.id} className="hover:bg-white/5 transition">
                  <td className="py-2.5 px-3 text-teal-300 font-bold">{log.incidentId || log.id}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.level === 'SIAGA_1' || log.type?.includes('ENGAGED') ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                      log.level === 'RECOVERY' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString('id-ID') : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 truncate max-w-[150px]">{log.actorEmail}</td>
                  <td className="py-2.5 px-3 text-slate-200">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

{/* =================================================================== TAB: 🏫 PORTAL OFFICIAL & SUBDOMAIN (/official/:namasekolah) =================================================================== */} {activeTab === 'official_portals' && ( <div className="space-y-6"> {/* Header & UU ITE Compliance Notice */} <div className="bg-[#1e1e1e] border border-[#006569] rounded-3xl p-6 shadow-2xl relative overflow-hidden"> <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" /> <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4"> <div> <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono mb-2"> <Shield size={13} /> OTORISASI MAKO OPS • VERIFIKASI RESMI </div> <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2"> 🏫 Manajemen Portal Official & Subdomain Kontingen </h2> <p className="text-xs text-slate-300 mt-1 max-w-3xl"> Seluruh pendaftaran nomor WhatsApp dan subdomain kontingen dikelola terpusat di sini. Sesuai standar UU ITE dan privasi peserta, nomor kontak dan direktori sekolah tidak dipublikasikan di gerbang login publik melainkan hanya dapat diakses melalui verifikasi admin. </p> </div> <div className="flex items-center gap-2"> <button type="button" onClick={loadAdminOfficialPortals} disabled={loadingPortals} className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition" > <RefreshCw size={14} className={loadingPortals ? 'animate-spin' : ''} /> {loadingPortals ? 'Memuat...' : 'Segarkan Data'} </button> </div> </div> {/* Status Alert Banner */} {portalActionMsg && ( <div className="mt-4 p-3.5 rounded-2xl bg-teal-950/90 border border-[#006569] text-teal-200 text-xs flex items-center justify-between animate-fade-in"> <div className="flex items-center gap-2 font-medium"> <CheckCircle2 size={16} className="text-[#FFDD00]" /> <span>{portalActionMsg}</span> </div> <button type="button" onClick={() => setPortalActionMsg('')} className="text-teal-400 hover:text-white" > <X size={14} /> </button> </div> )} {/* Summary KPIs */} <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5"> <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5"> <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Total Sekolah / Kontingen</span> <strong className="text-2xl font-mono text-[#FFDD00] font-black">{adminOfficialPortals.length}</strong> <span className="text-[10px] text-slate-400 block mt-0.5">Subdomain terdaftar</span> </div> <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5"> <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Terverifikasi Aktif</span> <strong className="text-2xl font-mono text-emerald-400 font-black"> {adminOfficialPortals.filter((p) => p.isVerifiedByAdmin !== false).length} </strong> <span className="text-[10px] text-emerald-400/80 block mt-0.5">Akses login dibuka</span> </div> <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5"> <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Tertunda / Nonaktif</span> <strong className="text-2xl font-mono text-amber-400 font-black"> {adminOfficialPortals.filter((p) => p.isVerifiedByAdmin === false).length} </strong> <span className="text-[10px] text-amber-400/80 block mt-0.5">Menunggu konfirmasi admin</span> </div> <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5"> <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Total Anggota Kontingen</span> <strong className="text-2xl font-mono text-blue-400 font-black"> {adminOfficialPortals.reduce((acc, p) => acc + (p.teamMembers ? p.teamMembers.length : 0), 0)} </strong> <span className="text-[10px] text-blue-400/80 block mt-0.5">Personel di seluruh sekolah</span> </div> </div> </div> {/* Form Pendaftaran Kontingen Baru oleh Admin */} <div className="bg-[#1e1e1e] border border-[#006569] rounded-3xl p-6 shadow-2xl space-y-4"> <div className="flex items-center gap-2"> <Plus size={18} className="text-[#FFDD00]" /> <h3 className="text-base font-black text-white uppercase tracking-wider"> Daftarkan Kontingen & Nomor WhatsApp Baru </h3> </div> <p className="text-xs text-slate-400"> Masukkan nama instansi/sekolah dan nomor WhatsApp resmi pembina/official. Sistem akan otomatis mengenerate subdomain format <code className="text-[#FFDD00] bg-black/40 px-1 py-0.5 rounded">/official/:slug</code> dan mengaktifkan izin login. </p> <form onSubmit={handleAdminCreateSchool} className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1"> <div className="md:col-span-4 space-y-1"> <label className="text-[11px] font-bold text-slate-300 block"> Nama Sekolah / Instansi Kontingen * </label> <input type="text" required value={newSchoolName} onChange={(e) => setNewSchoolName(e.target.value)} placeholder="Contoh: SMAN 1 Jakarta atau SMA Taruna Nusantara" className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#006569]" /> {newSchoolName && ( <span className="text-[10px] font-mono text-teal-400 block"> Subdomain: /official/{slugifySchoolName(newSchoolName)} </span> )} </div> <div className="md:col-span-3 space-y-1"> <label className="text-[11px] font-bold text-slate-300 block"> Nomor WhatsApp Resmi Official * </label> <input type="text" required value={newSchoolWa} onChange={(e) => setNewSchoolWa(e.target.value)} placeholder="Contoh: 08xxxxxxxxxx atau +628xxxxxxxxxx" className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#006569]" /> <span className="text-[10px] text-slate-400 block">Otomatis dinormalisasi ke format +62</span> </div> <div className="md:col-span-2 space-y-1"> <label className="text-[11px] font-bold text-slate-300 block"> Nomor Urut Undian / Tenda </label> <input type="text" value={newSchoolNoUrut} onChange={(e) => setNewSchoolNoUrut(e.target.value)} placeholder={`KONTINGEN-${String(adminOfficialPortals.length + 1).padStart(2, '0')}`} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#006569]" /> </div> <div className="md:col-span-3 flex flex-col justify-end space-y-2"> <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300"> <input type="checkbox" checked={newSchoolVerified} onChange={(e) => setNewSchoolVerified(e.target.checked)} className="rounded accent-[#006569] w-4 h-4 cursor-pointer" /> <span>Verifikasi & Buka Akses Langsung</span> </label> <button type="submit" className="w-full py-2.5 px-4 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider transition shadow-lg cursor-pointer flex items-center justify-center gap-1.5" > <Plus size={15} /> Buat Subdomain & Daftarkan </button> </div> </form> </div> {/* Direktori Subdomain Sekolah Terdaftar (Khusus Command Center) */} <div className="bg-[#1e1e1e] border border-[#006569] rounded-3xl p-6 shadow-2xl space-y-4"> <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4"> <div> <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2"> <FileText size={18} className="text-[#FFDD00]" /> Direktori Subdomain Sekolah Terdaftar </h3> <span className="text-xs text-slate-400"> Menampilkan seluruh kontingen resmi yang telah dibuat oleh Admin Mako. </span> </div> <div className="w-full sm:w-72"> <input type="text" value={portalSearchFilter} onChange={(e) => setPortalSearchFilter(e.target.value)} placeholder="Cari nama sekolah, slug, atau nomor WA..." className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#006569]" /> </div> </div> {/* List Cards */} <div className="space-y-3"> {adminOfficialPortals.length === 0 ? ( <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-slate-900/30"> <p className="text-slate-400 text-sm">Belum ada sekolah/kontingen yang didaftarkan oleh admin.</p> <p className="text-slate-500 text-xs mt-1">Gunakan formulir di atas untuk mendaftarkan kontingen perdana.</p> </div> ) : ( adminOfficialPortals .filter((portal) => { if (!portalSearchFilter.trim()) return true; const q = portalSearchFilter.toLowerCase(); return ( (portal.schoolName || '').toLowerCase().includes(q) || (portal.schoolSlug || '').toLowerCase().includes(q) || (portal.whatsappNumber || '').includes(q) || (portal.nomorUrut || '').toLowerCase().includes(q) ); }) .map((portal) => { const isVerified = portal.isVerifiedByAdmin !== false; const memberCount = Array.isArray(portal.teamMembers) ? portal.teamMembers.length : 0; const docCount = portal.documents ? Object.keys(portal.documents).length : 0; const hasAddress = Boolean(portal.schoolProfile?.jalan && portal.schoolProfile?.kabupatenKota); return ( <div key={portal.schoolSlug} className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 hover:border-[#006569] transition space-y-3" > <div className="flex flex-wrap items-center justify-between gap-3"> <div className="flex items-center gap-3"> <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 font-mono text-xs font-black text-[#FFDD00]"> {portal.nomorUrut || 'KONTINGEN'} </span> <div> <h4 className="font-black text-white text-base flex items-center gap-2"> {portal.schoolName} {isVerified ? ( <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-mono border border-emerald-500/40"> <CheckCircle2 size={11} /> TERVERIFIKASI </span> ) : ( <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 text-[10px] font-mono border border-amber-500/40"> <AlertTriangle size={11} /> TERTUNDA </span> )} </h4> <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5"> <span className="font-mono text-teal-300"> Subdomain: /official/{portal.schoolSlug} </span> <span>•</span> <span className="font-mono text-slate-300"> WA: {portal.whatsappNumber || 'Belum diatur'} </span>
                          <span>•</span>
                          <span className="font-mono text-amber-300 flex items-center gap-1">
                            <KeyRound size={11} />
                            PIN: {visiblePinSlug === portal.schoolSlug ? (portal.securityPin || 'Belum ada') : (portal.securityPin ? '••••••' : 'Belum diatur')}
                            {portal.securityPin && (
                              <button
                                type="button"
                                onClick={() => setVisiblePinSlug(visiblePinSlug === portal.schoolSlug ? null : portal.schoolSlug)}
                                className="text-slate-400 hover:text-white ml-1 cursor-pointer"
                                title="Lihat/Sembunyikan PIN"
                              >
                                {visiblePinSlug === portal.schoolSlug ? <EyeOff size={11} /> : <Eye size={11} />}
                              </button>
                            )}
                          </span>
                          {portal.pinResetRequested && (
                            <span className="px-2 py-0.5 rounded-full bg-red-950 border border-red-500 text-red-300 font-mono text-[10px] font-black animate-pulse flex items-center gap-1">
                              <AlertTriangle size={10} />
                              MINTA RESET PIN
                            </span>
                          )}
   {portal.schoolProfile?.kabupatenKota && ( <> <span>•</span> <span className="text-slate-400">{portal.schoolProfile.kabupatenKota}</span> </> )} </div> </div> </div> {/* Action Buttons */} <div className="flex items-center gap-2"> <button type="button" onClick={() => navigate(`/official/${portal.schoolSlug}`)} className="px-3.5 py-2 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1" > <Eye size={13} /> Buka Subdomain </button> <button type="button" onClick={() => handleAdminToggleVerification(portal)} className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${ isVerified ? 'bg-amber-950/60 hover:bg-amber-900/80 border-amber-500/40 text-amber-300' : 'bg-emerald-950/60 hover:bg-emerald-900/80 border-emerald-500/40 text-emerald-300' }`} > {isVerified ? 'Tangguhkan Login' : 'Verifikasi Akses'} </button> 
                        <button
                          type="button"
                          onClick={() => handleAdminPrintBukuPasukan(portal)}
                          className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                          title="Cetak Dokumen Rekapitulasi Pasukan Format A4 Lengkap"
                        >
                          <Printer size={13} />
                          <span>Cetak A4</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setResetPinModalPortal(portal);
                            setAdminNewPinInput(portal.securityPin || '123456');
                            setResetPinSuccessMsg('');
                          }}
                          className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1 ${
                            portal.pinResetRequested
                              ? 'bg-red-950 hover:bg-red-900 border-red-500 text-red-300 animate-pulse'
                              : 'bg-amber-950/60 hover:bg-amber-900 border-amber-500/40 text-amber-300'
                          }`}
                          title="Reset PIN Keamanan Sekolah"
                        >
                          <KeyRound size={13} />
                          <span>{portal.pinResetRequested ? 'Respon Reset PIN' : 'Reset PIN'}</span>
                        </button>
  <button type="button" onClick={() => handleAdminDeletePortal(portal.schoolSlug, portal.schoolName)} className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 transition cursor-pointer" title="Hapus Kontingen" > <Trash2 size={14} /> </button> </div> </div> {/* 4 Sub-Module Progress Indicators */} <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-white/5"> <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px]"> <span className="text-slate-400 block text-[10px]">1. Profil Alamat</span> <strong className={hasAddress ? 'text-emerald-400' : 'text-slate-400'}> {hasAddress ? '✓ Lengkap' : '○ Belum Diisi'} </strong> </div> <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px]"> <span className="text-slate-400 block text-[10px]">2. Berkas & Dokumen</span> <strong className={docCount > 0 ? 'text-emerald-400' : 'text-slate-400'}> {docCount} Berkas Terunggah </strong> </div> <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px]"> <span className="text-slate-400 block text-[10px]">3. Personel Tim (20 Slot)</span> <strong className={memberCount > 0 ? 'text-[#FFDD00]' : 'text-slate-400'}> {memberCount} / 20 Personel Terdata </strong> </div> <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px]"> <span className="text-slate-400 block text-[10px]">4. Status Kelayakan</span> <strong className={isVerified ? 'text-emerald-400' : 'text-amber-400'}> {isVerified ? '✓ Layak Bertanding' : '⏳ Menunggu Verifikasi'} </strong> </div> </div> </div> ); }) )} </div> </div> </div> )} {/* =================================================================== TAB 2: 📸 IMAGE TRACKER (Per-Tab Image Tracker + Auto-SVG Upload) =================================================================== */} 
        {/* Modal Admin Reset PIN Keamanan Official */}
        {resetPinModalPortal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in font-sans">
            <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-teal-500/40 p-6 shadow-2xl text-white">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <KeyRound size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      Reset PIN Keamanan Official
                    </h4>
                    <span className="text-[11px] text-teal-300">
                      {resetPinModalPortal.schoolName}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setResetPinModalPortal(null)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {resetPinSuccessMsg ? (
                <div className="py-4 space-y-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-950 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>{resetPinSuccessMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAdminSendPinWhatsApp(resetPinModalPortal, adminNewPinInput)}
                    className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg"
                  >
                    <MessageCircle size={15} />
                    <span>Kirim PIN Baru ke WhatsApp Official</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetPinModalPortal(null)}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-slate-300 font-bold transition cursor-pointer"
                  >
                    Selesai & Tutup
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAdminResetPin} className="py-4 space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Masukkan 6 angka PIN baru untuk kontingen <strong className="text-white">{resetPinModalPortal.schoolName}</strong>. PIN lama akan otomatis digantikan.
                  </p>
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      PIN BARU (6 DIGIT)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={adminNewPinInput}
                      onChange={(e) => setAdminNewPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      className="w-full bg-slate-800 border border-white/20 rounded-xl px-4 py-3 font-mono text-center text-xl font-black text-[#FFDD00] tracking-widest focus:border-teal-400 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setResetPinModalPortal(null)}
                      className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-slate-300 font-bold transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={adminNewPinInput.length !== 6}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md disabled:opacity-50"
                    >
                      Terapkan PIN Baru
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
  
{activeTab === 'image_tracker' && ( <div className="space-y-6"> {/* Tab Overview Dashboard Cards (Bagian 4.D) */} <div className="bg-[#1e1e1e] border border-[#006569] rounded-3xl p-6 space-y-4 shadow-2xl"> <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4"> <div> <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2"> <ImageIcon size={20} className="text-[#FFDD00]" /> Tab Overview Dashboard & Image Tracker </h2> <p className="text-xs text-slate-400"> Deteksi & ganti seluruh foto sementara (Sorotan Giat, 44 Foto Profil Garis Komando, Dokumentasi Seminar Youth Spark, & 14 Album Galeri) secara langsung. </p> </div> <div className="flex flex-wrap items-center gap-2"> <button type="button" onClick={() => setShowSocialApiPanel((prev) => !prev)} className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${ showSocialApiPanel ? 'bg-[#006569] text-[#FFDD00] border-[#FFDD00]' : 'bg-slate-900 text-teal-300 border-teal-500/40 hover:text-white' }`} > 🔗 Integrasi API Sosmed & Berita </button> <button type="button" onClick={() => setSelectedTrackerTab('all')} className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${ selectedTrackerTab === 'all' ? 'bg-[#FFDD00] text-slate-950 border-[#FFDD00]' : 'bg-slate-900 text-slate-300 border-white/10 hover:text-white' }`} > Tampilkan Semua Tab ({contentRegistry.filter((i) => i.isActive !== false).length}) </button> </div> </div> <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5"> {tabOverviewStats.map((t) => ( <div key={t.tabId} onClick={() => setSelectedTrackerTab(t.tabId)} className={`p-4 rounded-2xl border transition cursor-pointer ${ selectedTrackerTab === t.tabId ? 'bg-[#006569]/40 border-[#FFDD00]' : 'bg-slate-900/90 border-white/10 hover:border-teal-500/50' }`} > <div className="flex items-center justify-between mb-2"> <span className="font-black text-xs text-white uppercase">{t.label}</span> <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30"> {t.allSvg ? '100% .SVG' : 'Mixed'} </span> </div> <div className="text-2xl font-mono font-black text-[#FFDD00]"> {t.count} <span className="text-xs font-sans font-normal text-slate-400">Gambar Aktif</span> </div> <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400"> <span>Update: {t.lastUpdated}</span> <span className="text-teal-300 font-bold">Kelola →</span> </div> </div> ))} </div> </div> {/* Panel Konfigurasi API Sosial Media Hibrida (Instagram / YouTube / TikTok / Portal Berita) */} {showSocialApiPanel && ( <div className="bg-[#1e1e1e] border-2 border-[#FFDD00]/60 rounded-3xl p-6 space-y-4 shadow-2xl animate-fade-in"> <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3"> <div> <h3 className="text-sm font-black uppercase tracking-wider text-[#FFDD00]"> 🔗 Mode Hibrida: Integrasi API & Sinkronisasi Like/Komentar Sosial Media Menwa UNJ </h3> <p className="text-xs text-slate-300 mt-0.5"> Masukkan token API resmi jika ingin menarik metrik otomatis, atau gunakan tombol <strong>"🔗 Link & Sync Sosmed"</strong> pada tiap kartu album Galeri untuk menautkan URL postingan Instagram, YouTube, TikTok, atau Berita secara langsung. </p> </div> <button type="button" onClick={() => setShowSocialApiPanel(false)} className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer" > <X size={15} /> </button> </div> <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2"> <span className="text-xs font-black text-pink-400 uppercase block"> 1. Instagram Graph API (@menwaunj) </span> <p className="text-[11px] text-slate-400"> Butuh <strong>Instagram Graph API User Access Token</strong> (izin `instagram_basic`, `pages_read_engagement`) untuk membaca `like_count` & `comments_count`. </p> <input type="password" value={socialConfig?.instagramAccessToken || ''} onChange={(e) => updateSocialConfig({ instagramAccessToken: e.target.value })} placeholder="IGQVJ... (Instagram Access Token)" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white" /> </div> <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2"> <span className="text-xs font-black text-red-400 uppercase block"> 2. YouTube Data API v3 (Menwa UNJ TV) </span> <p className="text-[11px] text-slate-400"> Butuh <strong>Google Cloud YouTube Data API v3 Key</strong> untuk mengambil `statistics.likeCount` dan `statistics.commentCount` dari Video ID. </p> <input type="password" value={socialConfig?.youtubeApiKey || ''} onChange={(e) => updateSocialConfig({ youtubeApiKey: e.target.value })} placeholder="AIzaSy... (YouTube Data API v3 Key)" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white" /> </div> <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2"> <span className="text-xs font-black text-cyan-400 uppercase block"> 3. TikTok Display API / Webhook Berita </span> <p className="text-[11px] text-slate-400"> Opsional: Masukkan <strong>TikTok Client Key / oEmbed Endpoint</strong> untuk sinkronisasi statistik video TikTok & portal berita. </p> <input type="password" value={socialConfig?.tiktokClientKey || ''} onChange={(e) => updateSocialConfig({ tiktokClientKey: e.target.value })} placeholder="aw123... (TikTok Client Key / Webhook)" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white" /> </div> </div> </div> )} {/* Form Unggah Gambar Baru + Auto-Convert ke SVG */} <div className="bg-[#1e1e1e] border border-[#006569] rounded-3xl p-6 space-y-4 shadow-2xl"> <h3 className="text-sm font-black uppercase tracking-wider text-[#FFDD00] flex items-center gap-2"> <Upload size={16} /> Unggah Gambar Baru (Otomatis Dikonversi ke Format .SVG) </h3> <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"> <div> <label className="block text-xs font-bold text-slate-300 mb-1">Target Tab Halaman</label> <select value={uploadTabId} onChange={(e) => setUploadTabId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white" > {PORTAL_TABS_OVERVIEW.map((t) => ( <option key={t.tabId} value={t.tabId}> {t.label} ({t.route}) </option> ))} </select> </div> <div> <label className="block text-xs font-bold text-slate-300 mb-1">Judul Aset Gambar</label> <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Contoh: Apel Pembukaan GERANAT" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white" /> </div> <div> <label className="block text-xs font-bold text-slate-300 mb-1">Caption / Alt-Text Resmi</label> <input type="text" value={uploadCaption} onChange={(e) => setUploadCaption(e.target.value)} placeholder="Tulis caption dokumentasi..." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white" /> </div> <div> <label className="w-full py-2.5 px-4 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"> <Upload size={15} /> <span>{isUploadingSvg ? 'Mengonversi ke SVG...' : 'Pilih File & Konversi SVG'}</span> <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(e) => handleNewImageUpload(e)} className="hidden" /> </label> </div> </div> </div> {/* Bar Pencarian Cepat, Pemilih Rasio Preview (1:1 & 16:9), & Filter Visual */} <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#1e1e1e] border border-[#006569]/60 rounded-2xl"> <div className="flex-1 min-w-[240px]"> <input type="text" value={trackerSearchQuery} onChange={(e) => setTrackerSearchQuery(e.target.value)} placeholder="Cari CMD-01..CMD-44, nama personel, jabatan, atau judul kegiatan..." className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FFDD00]" /> </div> <div className="flex flex-wrap items-center gap-2"> <div className="inline-flex rounded-xl bg-slate-900 border border-white/10 p-1"> <button type="button" onClick={() => setPreviewAspectRatio('16:9')} className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${ previewAspectRatio === '16:9' ? 'bg-[#006569] text-[#FFDD00]' : 'text-slate-400 hover:text-white' }`} > Rasio 16:9 </button> <button type="button" onClick={() => setPreviewAspectRatio('1:1')} className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${ previewAspectRatio === '1:1' ? 'bg-[#006569] text-[#FFDD00]' : 'text-slate-400 hover:text-white' }`} > Rasio 1:1 </button> </div> <button type="button" onClick={() => setOnlyTempVisuals((prev) => !prev)} className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${ onlyTempVisuals ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-amber-300 border-amber-500/40 hover:bg-slate-800' }`} > {onlyTempVisuals ? '✓ Hanya Visual Sementara' : 'Filter: Visual Sementara'} </button> <span className="text-xs font-mono text-slate-400 px-2 tabular-nums"> Menampilkan <strong className="text-[#FFDD00]">{activeRegistryItems.length}</strong> aset </span> </div> </div> {/* Sub-filter Khusus Bagian Beranda */} {selectedTrackerTab === 'beranda' && ( <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/80 border border-[#006569]/40 rounded-2xl text-xs"> <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider px-2"> Filter Seksi Beranda: </span> <button type="button" onClick={() => setBerandaSectionFilter('all')} className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${ berandaSectionFilter === 'all' ? 'bg-[#006569] text-[#FFDD00]' : 'bg-slate-800 text-slate-300 hover:text-white' }`} > Semua ({contentRegistry.filter((i) => i.tabId === 'beranda' && i.isActive !== false).length}) </button> <button type="button" onClick={() => setBerandaSectionFilter('sorotan_giat')} className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${ berandaSectionFilter === 'sorotan_giat' ? 'bg-[#006569] text-[#FFDD00]' : 'bg-slate-800 text-slate-300 hover:text-white' }`} > Sorotan Giat / Carousel (8 Foto) </button> <button type="button" onClick={() => setBerandaSectionFilter('dokumentasi_kegiatan')} className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${ berandaSectionFilter === 'dokumentasi_kegiatan' ? 'bg-[#006569] text-[#FFDD00]' : 'bg-slate-800 text-slate-300 hover:text-white' }`} > Dokumentasi Kegiatan (5 Foto) </button> <button type="button" onClick={() => setBerandaSectionFilter('hero_banner')} className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${ berandaSectionFilter === 'hero_banner' ? 'bg-[#006569] text-[#FFDD00]' : 'bg-slate-800 text-slate-300 hover:text-white' }`} > Hero Banner Utama </button> <button type="button" onClick={() => setBerandaSectionFilter('identitas_satuan')} className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${ berandaSectionFilter === 'identitas_satuan' ? 'bg-[#006569] text-[#FFDD00]' : 'bg-slate-800 text-slate-300 hover:text-white' }`} > Logo & Lambang Satuan </button> </div> )} {/* Sub-filter Khusus Bagian Garis Komando (44 Foto Profil Pimpinan & Anggota) */} {selectedTrackerTab === 'struktur' && ( <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/80 border border-[#006569]/40 rounded-2xl text-xs"> <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider px-2"> Filter Unsur Garis Komando: </span> {[ { id: 'all', label: 'Semua Personel (45 Aset)' }, { id: 'pimpinan', label: 'Unsur Pimpinan (Dansat, Wadansat, Danden)' }, { id: 'staf', label: 'Unsur Staf Perencana & Pelayanan (Skomen - Sintel)' }, { id: 'pokpas', label: 'Unsur Kelompok Pasukan & Anggota' }, ].map((sub) => ( <button key={sub.id} type="button" onClick={() => setStrukturSubFilter(sub.id)} className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${ strukturSubFilter === sub.id ? 'bg-[#006569] text-[#FFDD00]' : 'bg-slate-800 text-slate-300 hover:text-white' }`} > {sub.label} </button> ))} </div> )} {/* Sub-filter Khusus Bagian Youth Spark Seminar */} {selectedTrackerTab === 'youth-spark' && ( <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/80 border border-[#006569]/40 rounded-2xl text-xs"> <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider px-2"> Filter Aset Youth Spark: </span> {[ { id: 'all', label: 'Semua Aset Youth Spark (10 Foto)' }, { id: 'dokumentasi_seminar', label: 'Galeri Dokumentasi Seminar (6 Slot)' }, { id: 'narasumber_seminar', label: 'Foto Profil Narasumber (3 Slot)' }, { id: 'poster_utama', label: 'Poster Utama Youth Spark' }, ].map((sub) => ( <button key={sub.id} type="button" onClick={() => setYouthSparkSubFilter(sub.id)} className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${ youthSparkSubFilter === sub.id ? 'bg-[#006569] text-[#FFDD00]' : 'bg-slate-800 text-slate-300 hover:text-white' }`} > {sub.label} </button> ))} </div> )} {/* Daftar Kartu Image Tracker per Tab */} 
        {/* Sub-filter Khusus Bagian Galeri Dokumentasi (Tahun 2025–2026 & Pengelompokan Kegiatan) */}
        {selectedTrackerTab === 'gallery' && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#202020] border border-[#333333] rounded-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-300 text-xs">Rentang Tahun Galeri:</span>
              {['all', '2026', '2025'].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setGalleryYearFilter(yr)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                    galleryYearFilter === yr
                      ? 'bg-[#FFDD00] text-slate-950 font-black'
                      : 'bg-[#2a2a2a] text-slate-300 hover:text-white'
                  }`}
                >
                  {yr === 'all' ? 'Semua Tahun (2025–2026)' : yr}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono">
                {displayedGalleryGroups.length} Kegiatan ({displayedGalleryGroups.reduce((a, g) => a + g.items.length, 0)} Slide)
              </span>
              <button
                type="button"
                onClick={toggleAllAlbums}
                className="px-3 py-1.5 rounded-xl bg-[#2a2a2a] hover:bg-[#333333] border border-[#3a3a3a] text-xs font-bold text-slate-200 cursor-pointer"
              >
                {allExpanded ? 'Tutup Semua Kegiatan' : 'Buka Semua Kegiatan'}
              </button>
            </div>
          </div>
        )}

        {/* Daftar Kartu Image Tracker: Pengelompokan per Kegiatan untuk Galeri, atau Grid Biasa untuk Tab Lain */}
        {selectedTrackerTab === 'gallery' && !trackerSearchQuery.trim() ? (
          <div className="space-y-4">
            {displayedGalleryGroups.length === 0 ? (
              <div className="p-8 text-center bg-[#202020] border border-[#333333] rounded-2xl text-slate-400 text-xs">
                Tidak ada kegiatan dokumentasi yang sesuai filter tahun ini.
              </div>
            ) : (
              displayedGalleryGroups.map((group) => {
                const isExpanded = !!expandedAlbumIds[group.id];
                return (
                  <div key={group.id} className="bg-[#202020] border border-[#333333] hover:border-[#444444] rounded-2xl overflow-hidden shadow-lg transition">
                    <div
                      onClick={() => toggleAlbumExpand(group.id)}
                      className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer select-none bg-[#202020] hover:bg-[#252525] transition"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-[#141414] border border-[#333333] overflow-hidden shrink-0">
                          <img src={group.coverUrl} alt={group.title} onError={(e) => { e.currentTarget.src = '/foto-kampus-unj.jpg'; }} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#141414] text-[#FFDD00] border border-[#333333]">
                              {group.year}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {group.items.length} Foto Slide Carousel
                            </span>
                          </div>
                          <h4 className="font-black text-white text-sm sm:text-base truncate mt-0.5">
                            {group.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                        <span>{isExpanded ? 'Tutup Slide' : 'Kelola Slide'}</span>
                        <div className="w-7 h-7 rounded-lg bg-[#2a2a2a] flex items-center justify-center">
                          <ChevronDown size={15} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 sm:p-5 pt-0 border-t border-[#2a2a2a] bg-[#191919]">
                        <div className="pt-4 pb-2 flex items-center justify-between text-xs text-slate-400">
                          <span className="font-bold">Daftar Slide Foto Carousel ({group.items.length} slide):</span>
                          <span className="text-[11px]">Unggah foto atau ubah caption per-slide</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                          {group.items.map(renderTrackerCard)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeRegistryItems.map(renderTrackerCard)}
          </div>
        )}
      </div>
    )}
    {/* =================================================================== TAB 3: 📝 CONTENT EDITOR (Kelola Komponen Canvas & Teks) =================================================================== */} {activeTab === 'content_editor' && ( <div className="bg-[#1e1e1e] border border-[#006569] rounded-3xl p-6 space-y-6 shadow-2xl"> <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4"> <div> <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2"> <Layers size={20} className="text-[#FFDD00]" /> Content & Canvas Component Editor </h2> <p className="text-xs text-slate-400"> Edit teks judul, deskripsi, atau hapus elemen dinamis yang aktif di seluruh seksi halaman web. </p> </div> <button type="button" onClick={resetToDefaults} className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold cursor-pointer" > Reset ke Komponen Standar </button> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {components.map((comp) => ( <div key={comp.id} className="p-5 rounded-2xl bg-slate-900 border border-white/10 flex flex-col justify-between gap-4" > <div className="space-y-2"> <div className="flex items-center justify-between"> <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-[#006569] text-[#FFDD00] font-bold uppercase"> {comp.component_type} • {comp.container} </span> <span className="text-[10px] font-mono text-slate-500">{comp.id}</span> </div> {editingCompId === comp.id ? ( <div className="space-y-2 pt-2"> <input type="text" value={editingCompLabel} onChange={(e) => setEditingCompLabel(e.target.value)} placeholder="Judul / Label Komponen" className="w-full bg-slate-950 border border-[#FFDD00] rounded-xl p-2 text-xs text-white" /> <textarea rows={2} value={editingCompCaption} onChange={(e) => setEditingCompCaption(e.target.value)} placeholder="Deskripsi / Caption" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white" /> <div className="flex gap-2"> <button type="button" onClick={() => { proposeNaturalLanguage(`Ubah judul komponen ${comp.id} menjadi ${editingCompLabel}`); setEditingCompId(null); }} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer" > Terapkan </button> <button type="button" onClick={() => setEditingCompId(null)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer" > Batal </button> </div> </div> ) : ( <> <h4 className="font-black text-white text-base">{comp.props?.label || comp.id}</h4> {comp.props?.caption && ( <p className="text-xs text-slate-400">{comp.props.caption}</p> )} </> )} </div> <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10"> <button type="button" onClick={() => { setEditingCompId(comp.id); setEditingCompLabel(comp.props?.label || ''); setEditingCompCaption(comp.props?.caption || ''); }} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1 cursor-pointer" > <Edit3 size={12} /> Edit Teks </button> <button type="button" onClick={() => deleteComponent(comp.id)} className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-xs font-bold text-rose-300 flex items-center gap-1 cursor-pointer" > <Trash2 size={12} /> Hapus </button> </div> </div> ))} </div> </div> )} {/* =================================================================== TAB 4: 📄 DOCUMENT GENERATOR (Naskah Dinas & Siaran Pers 5W+1H) =================================================================== */} {activeTab === 'doc_generator' && ( <div className="bg-[#1e1e1e] border border-[#006569] rounded-3xl p-6 space-y-6 shadow-2xl"> <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4"> <div> <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2"> <FileCheck size={20} className="text-[#FFDD00]" /> Generator Naskah Dinas & Siaran Pers Resmi </h2> <p className="text-xs text-slate-400"> Otomasi pembuatan surat dispensasi, izin sarpras, proposal RAB, dan rilis berita 5W+1H berkop Satuan UNJ. </p> </div> <div className="flex gap-2"> <button type="button" onClick={() => setDocSubMode('naskah')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase cursor-pointer ${ docSubMode === 'naskah' ? 'bg-[#006569] text-[#FFDD00]' : 'bg-slate-900 text-slate-400' }`} > Naskah Dinas & Proposal </button> <button type="button" onClick={() => setDocSubMode('press')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase cursor-pointer ${ docSubMode === 'press' ? 'bg-[#006569] text-[#FFDD00]' : 'bg-slate-900 text-slate-400' }`} > Siaran Pers 5W+1H </button> </div> </div> {docSubMode === 'naskah' ? ( <div className="grid grid-cols-1 lg:grid-cols-12 gap-6"> <div className="lg:col-span-5 space-y-4 bg-slate-900 p-5 rounded-2xl border border-white/10"> <div> <label className="text-xs font-bold text-slate-300 block mb-1">Jenis Naskah:</label> <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white" > <option value="KOP_SURAT_KOSONG">📄 Template Resmi Kop Surat Kosong (Siap Pakai)</option>
<option value="PENGAJUAN_DOMAIN">🌐 Surat Pengajuan Nama Domain Organisasi (menwaunj.or.id)</option>
<option value="DISPENSASI">Surat Permohonan Dispensasi Kuliah Anggota</option> <option value="IZIN_SARPRAS">Surat Permohonan Izin Peminjaman Sarpras Kampus</option> <option value="PROPOSAL_RINGKAS">Draft Proposal Kegiatan & Anggaran Biaya (RAB)</option> </select> </div> <div> <label className="text-[11px] font-bold text-slate-400 block mb-1">Nama Agenda / Kegiatan:</label> <input type="text" value={docParams.namaKegiatan} onChange={(e) => setDocParams({ ...docParams, namaKegiatan: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white" /> </div> <div> <label className="text-[11px] font-bold text-slate-400 block mb-1">Waktu Pelaksanaan:</label> <input type="text" value={docParams.tanggal} onChange={(e) => setDocParams({ ...docParams, tanggal: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white" /> </div> <button type="button" onClick={() => setGeneratedDoc(generateNaskahDinas(docType, docParams))} className="w-full py-3 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider transition cursor-pointer" > Generate Naskah Dinas Resmi </button> </div> <div className="lg:col-span-7 bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-3"> <div className="flex items-center justify-between border-b border-white/10 pb-2"> <span className="text-xs font-black uppercase tracking-wider text-[#FFDD00]"> Pratinjau Naskah Siap Cetak </span> {generatedDoc && ( <div className="flex gap-3"> <button type="button" onClick={() => copyToClipboard(generatedDoc, 'doc-copy')} className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-bold" > {copiedId === 'doc-copy' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />} <span>Salin</span> </button> <button type="button" onClick={() => downloadTextFile(generatedDoc, `naskah-${docType.toLowerCase()}.txt`)} className="text-xs text-[#FFDD00] flex items-center gap-1 font-bold" > <Download size={14} /> Unduh (.txt) </button> </div> )} </div> <pre className="font-mono text-[11px] leading-relaxed text-slate-200 bg-black/60 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap min-h-[280px]"> {generatedDoc || 'Klik "Generate Naskah Dinas Resmi" untuk membuat dokumen.'} </pre> </div> </div> ) : ( <div className="grid grid-cols-1 lg:grid-cols-12 gap-6"> <div className="lg:col-span-5 space-y-4 bg-slate-900 p-5 rounded-2xl border border-white/10"> <div> <label className="text-[11px] font-bold text-slate-300 block mb-1">Nama Kegiatan:</label> <input type="text" value={pressParams.namaKegiatan} onChange={(e) => setPressParams({ ...pressParams, namaKegiatan: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white" /> </div> <div> <label className="text-[11px] font-bold text-slate-300 block mb-1">Lokasi Kegiatan:</label> <input type="text" value={pressParams.lokasi} onChange={(e) => setPressParams({ ...pressParams, lokasi: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white" /> </div> <button type="button" onClick={() => setGeneratedPress(generatePressRelease(pressParams))} className="w-full py-3 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider transition cursor-pointer" > Generate Siaran Pers 5W+1H </button> </div> <div className="lg:col-span-7 bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-3"> <pre className="font-mono text-[11px] leading-relaxed text-slate-200 bg-black/60 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap min-h-[280px]"> {generatedPress || 'Klik "Generate Siaran Pers 5W+1H" untuk menyusun rilis berita.'} </pre> </div> </div> )} </div> )} {/* =================================================================== TAB 5: 📊 ANALYTICS DASHBOARD (Real-Time Portal & Firestore Metrics) =================================================================== */} {activeTab === 'analytics' && ( <div className="bg-[#1e1e1e] border border-[#006569] rounded-3xl p-6 space-y-6 shadow-2xl"> <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4"> <div> <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2"> <BarChart3 size={20} className="text-[#FFDD00]" /> Real-Time Analytics & Auto-Maintain Health Check </h2> <p className="text-xs text-slate-400"> Statistik langsung dari koleksi Firestore (`geranat_teams`, `forms_submissions`, `content_registry`) dan pemeriksaan kesehatan aset. </p> </div> <button type="button" onClick={() => { refreshCloudTelemetry(); setHealthStatus(`Диагностика Selesai (${new Date().toLocaleTimeString('id-ID')}) • 0 Broken Images • Semua Aset .SVG Optimal`); }} className="px-4 py-2 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer" > <RefreshCw size={14} /> Jalankan Health Check </button> </div> <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-200"> <span><strong>Status Auto-Maintain:</strong> {healthStatus}</span> <span className="font-mono text-emerald-400 font-bold">ONLINE</span> </div> <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"> <div className="p-5 rounded-2xl bg-slate-900 border border-white/10"> <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Suara GERANAT</span> <div className="text-2xl font-mono font-black text-[#FFDD00] mt-1"> {geranatStats.totalVotes.toLocaleString('id-ID')} Suara </div> <span className="text-xs text-emerald-400 font-mono mt-1 block"> {formatRupiah(geranatStats.totalVotes * 1000)} ({geranatStats.totalTeams} Tim) </span> </div> <div className="p-5 rounded-2xl bg-slate-900 border border-white/10"> <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Berkas Administrasi</span> <div className="text-2xl font-mono font-black text-white mt-1"> {submissionStats.total} Berkas </div> <span className="text-[11px] text-slate-400 mt-1 block"> Pendaftaran: {submissionStats.pendaftaran} • Permohonan/Pengajuan: {submissionStats.permohonan + submissionStats.pengajuan} </span> </div> <div className="p-5 rounded-2xl bg-slate-900 border border-white/10"> <span className="text-[10px] font-mono uppercase text-slate-400 block">Aset Gambar .SVG Aktif</span> <div className="text-2xl font-mono font-black text-teal-400 mt-1"> {activeRegistryItems.length} File SVG </div> <span className="text-[11px] text-slate-400 mt-1 block"> Tersebar di {PORTAL_TABS_OVERVIEW.length} tab utama </span> </div> <div className="p-5 rounded-2xl bg-slate-900 border border-white/10"> <span className="text-[10px] font-mono uppercase text-slate-400 block">Snapshot & Audit Log</span> <div className="text-2xl font-mono font-black text-amber-400 mt-1"> {snapshots.length} Versi </div> <span className="text-[11px] text-slate-400 mt-1 block"> {auditLogs.length} rekaman audit cloud </span> </div> </div> </div> )} {/* =================================================================== TAB 6: ⚙️ SETTINGS (2-Verification Bank & QRIS + Scheduled Tasks) =================================================================== */} {activeTab === 'settings' && ( <div className="space-y-6"> <div className="bg-[#1e1e1e] border border-[#006569] rounded-3xl p-6 shadow-2xl"> <MakoBankQRISSettings /> </div> <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> {/* Scheduled Auto-Maintain Tasks (/scheduled_tasks/) */} <div className="bg-[#1e1e1e] border border-[#006569] rounded-3xl p-6 space-y-4 shadow-2xl"> <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2"> <Settings size={18} className="text-[#FFDD00]" /> Jadwal Tugas Otomatis (/scheduled_tasks) </h3> <div className="flex gap-2"> <input type="text" value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} placeholder="Contoh: Auto-backup klasemen GERANAT setiap malam..." className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white" /> <button type="button" onClick={async () => { if (!newTaskDesc.trim()) return; const created = await createScheduledTask({ taskType: 'auto_maintain', description: newTaskDesc.trim(), targetTab: 'all', }); if (created) setScheduledTasks((prev) => [created, ...prev]); setNewTaskDesc(''); }} className="px-4 py-2.5 rounded-xl bg-[#006569] text-[#FFDD00] font-black text-xs uppercase cursor-pointer" > + Jadwalkan </button> </div> <div className="space-y-2 max-h-56 overflow-y-auto"> {scheduledTasks.length === 0 ? ( <p className="text-xs text-slate-500">Belum ada tugas terjadwal.</p> ) : ( scheduledTasks.map((t) => ( <div key={t.taskId} className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between text-xs"> <div> <strong className="text-white block">{t.description}</strong> <span className="text-[10px] text-slate-400 font-mono">{t.taskId} •Oleh: {t.createdBy}</span> </div> <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-mono"> {t.status} </span> </div> )) )} </div> </div> {/* Export / Import Schema */} <div className="bg-[#1e1e1e] border border-[#006569] rounded-3xl p-6 space-y-4 shadow-2xl"> <h3 className="text-base font-black text-white uppercase tracking-wider"> Ekspor / Impor Skema Konfigurasi JSON </h3> <div className="flex gap-2"> <button type="button" onClick={() => downloadTextFile(exportSchema(), `menwa-v8-schema-${Date.now()}.json`)} className="px-4 py-2.5 rounded-xl bg-[#006569] text-[#FFDD00] font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer" > <Download size={14} /> Unduh Backup JSON </button> </div> <textarea rows={4} value={rawSchemaInput} onChange={(e) => setRawSchemaInput(e.target.value)} placeholder="Tempel JSON skema di sini untuk mengimpor..." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white" /> <button type="button" disabled={!rawSchemaInput.trim()} onClick={() => { if (importSchema(rawSchemaInput)) setRawSchemaInput(''); }} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold disabled:opacity-40 cursor-pointer" > Impor Skema JSON </button> </div> </div> </div> )} {/* =================================================================== TAB 7: 📜 ACTIVITY LOG (Audit Trail, Command Logs & Snapshot Rollback) =================================================================== */} {activeTab === 'activity_log' && ( <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> {/* Snapshot Rollback Guardian */} <div className="bg-[#1e1e1e] border border-[#006569] rounded-3xl p-6 space-y-4 shadow-2xl"> <div className="flex items-center justify-between border-b border-white/10 pb-3"> <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2"> <History size={18} className="text-[#FFDD00]" /> Snapshot Rollback Guardian </h3> <span className="text-xs font-mono text-[#FFDD00]">{snapshots.length} Versi</span> </div> <div className="space-y-3 max-h-[460px] overflow-y-auto"> {snapshots.map((snap) => ( <div key={snap.id} className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex flex-wrap items-center justify-between gap-3" > <div> <span className="text-[10px] font-mono text-[#FFDD00] bg-[#006569]/40 px-2 py-0.5 rounded"> {snap.timestamp} </span> <p className="text-sm font-black text-white mt-1">{snap.description}</p> <span className="text-[11px] text-slate-400">Petugas: {snap.officer}</span> </div> <button type="button" onClick={() => rollbackSnapshot(snap.id)} className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer" > <RotateCcw size={13} /> Rollback </button> </div> ))} </div> </div> {/* Cloud Audit & Command Center Logs (/audit_logs & /command_center_logs) */} <div className="bg-[#1e1e1e] border border-[#006569] rounded-3xl p-6 space-y-4 shadow-2xl"> <div className="flex items-center justify-between border-b border-white/10 pb-3"> <h3 className="text-base font-black text-white uppercase tracking-wider"> Cloud Audit Trail & Command Logs </h3> <button type="button" onClick={refreshCloudTelemetry} className="text-xs text-teal-300 hover:text-white flex items-center gap-1 cursor-pointer" > <RefreshCw size={12} /> Segarkan </button> </div> <div className="space-y-2.5 max-h-[460px] overflow-y-auto"> {ccLogs.map((log) => ( <div key={log.logId} className="p-3.5 rounded-2xl bg-slate-900/90 border border-teal-500/30 text-xs space-y-1"> <div className="flex justify-between font-mono text-[10px] text-teal-300"> <span>[COMMAND LOG] {log.parsedIntent}</span> <span>{new Date(log.executedAt).toLocaleString('id-ID')}</span> </div> <p className="text-white font-bold">{log.prompt}</p> <span className="text-[10px] text-slate-400 block">Dieksekusi oleh: {log.executedBy}</span> </div> ))} {auditLogs.map((a) => ( <div key={a.logId} className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 text-xs space-y-1"> <div className="flex justify-between font-mono text-[10px] text-[#FFDD00]"> <span>[AUDIT] {a.action}</span> <span>{new Date(a.timestamp).toLocaleString('id-ID')}</span> </div> <p className="text-slate-200"> Koleksi: <strong>{a.targetCollection}</strong> ({a.targetDocId}) </p> <span className="text-[10px] text-slate-400 block">Aktor: {a.actorEmail}</span> </div> ))} {ccLogs.length === 0 && auditLogs.length === 0 && ( <p className="text-xs text-slate-500">Belum ada log audit cloud yang tercatat.</p> )} </div> </div> </div> )} </main> {/* Modal Preview Gambar Ukuran Penuh (Dilengkapi Switcher Rasio 1:1 & 16:9 + Revert to Original) */} {previewModalItem && ( <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"> <div className="relative max-w-3xl w-full bg-[#1e1e1e] border border-[#006569] rounded-3xl overflow-hidden shadow-2xl"> <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10"> <div> <h4 className="font-black text-white text-sm">{previewModalItem.title}</h4> <span className="text-[11px] text-teal-300 font-mono"> ID: {previewModalItem.contentId} • Tab: {previewModalItem.tabId} • Format: .{previewModalItem.imageFormat} </span> </div> <div className="flex items-center gap-2"> <div className="inline-flex rounded-xl bg-slate-900 border border-white/10 p-1"> <button type="button" onClick={() => setPreviewAspectRatio('16:9')} className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${ previewAspectRatio === '16:9' ? 'bg-[#006569] text-[#FFDD00]' : 'text-slate-400 hover:text-white' }`} > 16:9 </button> <button type="button" onClick={() => setPreviewAspectRatio('1:1')} className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${ previewAspectRatio === '1:1' ? 'bg-[#006569] text-[#FFDD00]' : 'text-slate-400 hover:text-white' }`} > 1:1 </button> </div> <button type="button" onClick={async () => { const reverted = await revertRegistryItemToOriginal(previewModalItem.contentId); if (reverted) setPreviewModalItem(reverted); }} className="px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer" > <RotateCcw size={13} /> Revert ke Asli </button> <button type="button" onClick={() => setPreviewModalItem(null)} className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white cursor-pointer" > <X size={18} /> </button> </div> </div> <div className="p-6 bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-auto"> <div className={`overflow-hidden rounded-2xl border border-white/10 bg-slate-900 ${ previewAspectRatio === '1:1' ? 'w-80 h-80 aspect-square' : 'w-full max-w-2xl aspect-video' }`} > <img src={previewModalItem.imageUrl || previewModalItem.originalImageUrl || '/foto-kampus-unj.jpg'} alt={previewModalItem.caption} onError={(e) => { e.currentTarget.src = previewModalItem.originalImageUrl || '/foto-kampus-unj.jpg'; }} className="w-full h-full object-cover" /> </div> </div> <div className="p-4 bg-slate-900 text-xs text-slate-300 flex items-center justify-between gap-4"> <div> <strong>Caption:</strong> {previewModalItem.caption} </div> <span className="font-mono text-[11px] text-teal-400 shrink-0"> Rasio Pratinjau: {previewAspectRatio} </span> </div> </div> </div> )} </div> ); } export default CommandCenterPage;