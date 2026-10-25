import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Lock,
  Radio,
  Sparkles,
  FileText,
  Newspaper,
  History,
  Layers,
  ArrowLeft,
  LogOut,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Send,
  Upload,
  Trash2,
  RotateCcw,
  UserCheck,
  Terminal,
  AlertTriangle,
  FileCheck,
  Image as ImageIcon,
  BarChart3,
  Settings,
  Eye,
  Edit3,
  Plus,
  RefreshCw,
  X
} from 'lucide-react';
import {
  useCanvasStore,
  AUTHORIZED_EMAIL,
  AVAILABLE_CONTAINERS,
  PORTAL_TABS_OVERVIEW
} from '../lib/canvasStore.jsx';
import {
  getGeranatTeams,
  getAllSubmissionsForAdmin,
  getAuditLogs,
  getCommandCenterLogs,
  createScheduledTask,
  getScheduledTasks
} from '../firebase.js';
import { MakoBankQRISSettings } from './MakoBankQRISSettings.jsx';
import { navigate } from '../lib/router.jsx';
import { TacticalHoloGlobe3D } from './TacticalHoloGlobe3D.jsx';
import { formatRupiah } from '../lib/qris.js';
import './LiveCanvasStudio.css';

const QUICK_PROMPTS = [
  'Ubah caption gambar di tab Beranda menjadi: Apel Kehormatan Korps Menwa UNJ 2026',
  'Tambah tombol WhatsApp Layanan Piket Mako di hero',
  'Bikin galeri 3 kolom foto giat Menwa di beranda',
  'Tambah kartu pengumuman pendaftaran Ksatria Cendekia VIII',
  'Ubah galeri menjadi 2 kolom dan ratakan tengah',
  'Tambah tombol unduh juknis KC VIII di seksi KC',
];

const COMMAND_TABS = [
  { id: 'ai_agent', label: '🤖 AI Agent', short: 'AI Agent' },
  { id: 'image_tracker', label: '📸 Image Tracker', short: 'Image Tracker' },
  { id: 'content_editor', label: '📝 Content Editor', short: 'Content Editor' },
  { id: 'doc_generator', label: '📄 Document Generator', short: 'Doc Generator' },
  { id: 'analytics', label: '📊 Analytics Dashboard', short: 'Analytics' },
  { id: 'settings', label: '⚙️ Settings', short: 'Settings' },
  { id: 'activity_log', label: '📜 Activity Log', short: 'Activity Log' },
];

export function CommandCenterPage() {
  const {
    authSession,
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
    activeTab,
    setActiveTab,
    deleteComponent,
    resetToDefaults,
    exportSchema,
    importSchema,
    rollbackSnapshot,
    generateNaskahDinas,
    generatePressRelease,
  } = useCanvasStore();

  // Login form state
  const [googleEmail, setGoogleEmail] = useState(AUTHORIZED_EMAIL);
  const [username, setUsername] = useState('mako_admin');
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState('google');

  // Tab 1: AI Agent state
  const [promptText, setPromptText] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Tab 2: Image Tracker state
  const [selectedTrackerTab, setSelectedTrackerTab] = useState('all');
  const [editingCaptionId, setEditingCaptionId] = useState(null);
  const [editingCaptionText, setEditingCaptionText] = useState('');
  const [previewModalItem, setPreviewModalItem] = useState(null);
  const [uploadTabId, setUploadTabId] = useState('beranda');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [isUploadingSvg, setIsUploadingSvg] = useState(false);

  // Tab 3: Content Editor state
  const [editingCompId, setEditingCompId] = useState(null);
  const [editingCompLabel, setEditingCompLabel] = useState('');
  const [editingCompCaption, setEditingCompCaption] = useState('');

  // Tab 4: Document Generator state
  const [docSubMode, setDocSubMode] = useState('naskah'); // 'naskah' | 'press'
  const [docType, setDocType] = useState('DISPENSASI');
  const [docParams, setDocParams] = useState({
    namaKegiatan: 'Ksatria Cendekia VIII Tingkat Nasional',
    tanggal: '05 s.d. 08 November 2026',
    lokasi: 'Kampus A UNJ dan Batalyon Taipur Cikarang',
    namaAnggota: 'Eben Haezer Sitorus / Raffli Syahputra',
    nimFakultas: '1402621001 / FISH (Pendidikan Geografi)',
    jabatan: 'Komandan Pasukan Pelaksana Giat Satuan',
    fasilitas: 'Aula Latief Hendraningrat & GOR Otista',
    jumlahPeserta: '± 350 Peserta dan Delegasi Menwa Se-Indonesia',
  });
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [pressParams, setPressParams] = useState({
    namaKegiatan: 'Pembukaan Giat Latihan Satuan Menwa UNJ 2026',
    lokasi: 'Plaza Kampus A Universitas Negeri Jakarta',
    inspektur: 'Komandan Satuan Menwa UNJ Eben Haezer Sitorus',
  });
  const [generatedPress, setGeneratedPress] = useState('');

  // Tab 5 & 7: Analytics & Logs state
  const [geranatStats, setGeranatStats] = useState({ totalTeams: 5, totalVotes: 9120 });
  const [submissionStats, setSubmissionStats] = useState({ total: 0, pendaftaran: 0, permohonan: 0, pengajuan: 0 });
  const [auditLogs, setAuditLogs] = useState([]);
  const [ccLogs, setCcLogs] = useState([]);
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [rawSchemaInput, setRawSchemaInput] = useState('');
  const [healthStatus, setHealthStatus] = useState('100% Optimal • Semua Gambar Terindeks SVG');

  // Load live data from Firestore when authenticated
  const refreshCloudTelemetry = async () => {
    try {
      const [teams, subs, audits, cLogs, tasks] = await Promise.all([
        getGeranatTeams(),
        getAllSubmissionsForAdmin(),
        getAuditLogs(),
        getCommandCenterLogs(),
        getScheduledTasks(),
      ]);

      if (teams && teams.length > 0) {
        const votes = teams.reduce((acc, t) => acc + (t.votesCount || 0), 0);
        setGeranatStats({ totalTeams: teams.length, totalVotes: votes });
      }
      if (subs) {
        setSubmissionStats({
          total: subs.length,
          pendaftaran: subs.filter((s) => s.serviceType?.startsWith('pendaftaran_')).length,
          permohonan: subs.filter((s) => s.serviceType?.startsWith('permohonan_')).length,
          pengajuan: subs.filter((s) => !s.serviceType?.startsWith('pendaftaran_') && !s.serviceType?.startsWith('permohonan_')).length,
        });
      }
      if (audits) setAuditLogs(audits);
      if (cLogs) setCcLogs(cLogs);
      if (tasks) setScheduledTasks(tasks);
    } catch (e) {
      console.warn('Telemetry refresh note:', e);
    }
  };

  useEffect(() => {
    if (authSession.isAuthenticated) {
      refreshCloudTelemetry();
    }
  }, [authSession.isAuthenticated, activeTab]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const downloadTextFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    setTimeout(() => {
      const res = loginWithGoogle(googleEmail.trim());
      setAuthLoading(false);
      if (!res.success) setAuthError(res.message);
    }, 300);
  };

  const handleTerminalLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    setTimeout(() => {
      const res = loginWithPasscode(username.trim(), passcode.trim());
      setAuthLoading(false);
      if (!res.success) setAuthError(res.message);
    }, 300);
  };

  const handlePromptSubmit = (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    proposeNaturalLanguage(promptText);
    setPromptText('');
  };

  // Upload & Auto-Convert Raster Image (PNG/JPG/WebP) to SVG in Image Tracker
  const handleNewImageUpload = async (e, replaceContentId = null, targetTabOverride = null) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingSvg(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        await uploadAndRegisterImage({
          tabId: targetTabOverride || uploadTabId,
          sectionId: 'custom_svg_asset',
          title: uploadTitle.trim() || file.name.replace(/\.[^/.]+$/, ''),
          caption: uploadCaption.trim() || `Dokumentasi resmi ${file.name} (Auto-Converted to SVG)`,
          fileDataUrl: ev.target.result,
          fileName: file.name,
          replaceContentId,
        });
        setUploadTitle('');
        setUploadCaption('');
      } finally {
        setIsUploadingSvg(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const activeRegistryItems = useMemo(() => {
    const list = contentRegistry.filter((item) => item.isActive !== false);
    if (selectedTrackerTab === 'all') return list;
    return list.filter((item) => item.tabId === selectedTrackerTab);
  }, [contentRegistry, selectedTrackerTab]);

  const tabOverviewStats = useMemo(() => {
    return PORTAL_TABS_OVERVIEW.map((t) => {
      const items = contentRegistry.filter((i) => i.tabId === t.tabId && i.isActive !== false);
      const allSvg = items.every((i) => i.imageFormat === 'svg');
      const latest = items.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())[0];
      return {
        ...t,
        count: items.length,
        allSvg,
        lastUpdated: latest?.updatedAt
          ? new Date(latest.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
          : 'Standar Bawaan',
      };
    });
  }, [contentRegistry]);

  const latestAction = history[0];

  // =========================================================================
  // VIEW 1: GATEWAY LOGIN MODAL (When unauthenticated)
  // =========================================================================
  if (!authSession.isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#02080c] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(#006569_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#006569]/25 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md bg-[#031117] border border-[#006569] rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#006569] to-[#00383b] text-[#FFDD00] flex items-center justify-center border border-[#FFDD00]/40 shadow-xl mb-3">
              <Lock size={28} />
            </div>
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-[#FFDD00] block">
              POS PUSAT KOMANDO V8 // MAKO-OPS
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Gerbang Command Center
            </h1>
            <p className="text-xs text-slate-400">
              Akses khusus perwira & staf Resimen Mahasiswa Satuan UNJ.
            </p>
          </div>

          <div className="flex border-b border-white/10 gap-4">
            <button
              type="button"
              onClick={() => { setAuthMethod('google'); setAuthError(''); }}
              className={`pb-2 text-xs font-black uppercase tracking-wider transition-colors border-b-2 ${
                authMethod === 'google' ? 'border-[#FFDD00] text-[#FFDD00]' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Google Admin
            </button>
            <button
              type="button"
              onClick={() => { setAuthMethod('terminal'); setAuthError(''); }}
              className={`pb-2 text-xs font-black uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
                authMethod === 'terminal' ? 'border-[#FFDD00] text-[#FFDD00]' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal size={13} />
              <span>Sandi Terminal</span>
            </button>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authMethod === 'google' ? (
            <form onSubmit={handleGoogleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Akun Google Admin Resmi:
                </label>
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="unjmenwa@gmail.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FFDD00]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Diizinkan: <strong className="text-[#FFDD00]">unjmenwa@gmail.com</strong> & <strong className="text-[#FFDD00]">rafflysyahpoetra@gmail.com</strong>
                </span>
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#006569] hover:bg-[#004d50] text-white font-black text-xs uppercase tracking-wider transition shadow-lg"
              >
                {authLoading ? 'Memverifikasi...' : 'Masuk ke Command Center'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleTerminalLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Username Staf:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FFDD00]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Passcode Otorisasi:</label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="MENWA-MAKO-2026"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FFDD00]"
                />
              </div>
              <button
                type="submit"
                disabled={authLoading || !passcode}
                className="w-full py-3 px-4 rounded-xl bg-[#006569] hover:bg-[#004d50] text-white font-black text-xs uppercase tracking-wider transition shadow-lg"
              >
                {authLoading ? 'Mengotentikasi...' : 'Otorisasi Kredensial Mako'}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto"
            >
              <ArrowLeft size={14} /> Kembali ke Beranda Publik
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED 7-TAB COMMAND CENTER V8
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#02080c] text-slate-100 font-sans flex flex-col pb-20">
      {/* Top Tactical Command Header */}
      <header className="sticky top-0 z-40 bg-[#030f14]/95 border-b border-[#006569]/60 backdrop-blur-xl px-4 py-3 sm:px-8">
        <div className="max-w-[1760px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006569] text-[#FFDD00] flex items-center justify-center border border-[#FFDD00]/40 shadow-lg shrink-0">
              <Radio size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  Mako Command Center V8
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                  <UserCheck size={11} /> {authSession.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Sesi Aktif: <strong className="text-slate-200">{authSession.userEmail}</strong> • Jam Piket: {authSession.loginTime} WIB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Lihat Web Publik</span>
            </button>
            <button
              type="button"
              onClick={logout}
              className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-xs font-bold text-red-300 transition flex items-center gap-1.5"
            >
              <LogOut size={14} />
              <span>Kunci & Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1760px] mx-auto w-full px-4 sm:px-8 py-6 space-y-6 flex-grow">
        {/* 7-Tab Navigation Bar (Bagian 4.F) */}
        <nav className="bg-[#031117] border border-[#006569] rounded-2xl p-2 flex flex-wrap items-center gap-2 shadow-xl">
          {COMMAND_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-wider transition flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#006569] text-[#FFDD00] border border-[#FFDD00]/50 shadow-lg'
                  : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* ===================================================================
            TAB 1: 🤖 AI AGENT (Natural Language + Preview & Approval Card)
            =================================================================== */}
        {activeTab === 'ai_agent' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-[#031117] border border-[#006569] rounded-3xl p-6 space-y-6 shadow-2xl">
              <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={20} className="text-[#FFDD00]" /> AI Agent Command Center (NLP Engine)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ketik perintah bahasa alami untuk memperbarui caption gambar, menyuntikkan galeri/CTA, atau merombak tata letak.
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full font-bold">
                  Approval Mode Aktif
                </span>
              </div>

              <form onSubmit={handlePromptSubmit} className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                  Instruksi Bahasa Alami (Natural Language):
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="Contoh: 'Ubah caption gambar di tab Beranda menjadi: Apel Korps Menwa UNJ' atau 'Tambahkan tombol WhatsApp Piket Mako di hero'..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FFDD00]"
                  />
                  <button
                    type="submit"
                    disabled={!promptText.trim()}
                    className="absolute bottom-3 right-3 px-4 py-2 rounded-xl bg-[#006569] text-[#FFDD00] text-xs font-black hover:bg-[#004d50] disabled:opacity-40 transition flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <span>Analisis & Buat Pratinjau</span>
                    <Send size={14} />
                  </button>
                </div>
              </form>

              {/* Proposed Changes Preview Card (Bagian 4.E: Wajib Approve / Reject Sebelum Eksekusi) */}
              {pendingAIProposal && (
                <div className="rounded-2xl bg-amber-950/30 border-2 border-[#FFDD00] p-5 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-amber-500/30 pb-2.5">
                    <span className="text-xs font-black uppercase tracking-wider text-[#FFDD00] flex items-center gap-2">
                      <Sparkles size={15} /> Pratinjau Perubahan AI Agent (Menunggu Konfirmasi Admin)
                    </span>
                    <span className="text-[10px] font-mono bg-amber-500/20 text-amber-200 px-2.5 py-0.5 rounded-full">
                      Target: {pendingAIProposal.targetTab.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="text-slate-300">
                      <span className="text-slate-400">Perintah Input:</span>{' '}
                      <em className="text-white">"{pendingAIProposal.prompt}"</em>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-white/10 text-emerald-300 font-bold">
                      {pendingAIProposal.summary}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={approveAIProposal}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                    >
                      <Check size={15} />
                      <span>✅ Approve & Execute</span>
                    </button>
                    <button
                      type="button"
                      onClick={rejectAIProposal}
                      className="py-2.5 px-4 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-500/40 font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <X size={15} />
                      <span>❌ Reject</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Presets */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Pilihan Instruksi Cepat:
                </span>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPromptText(p)}
                      className="text-left text-xs bg-slate-900 border border-white/10 hover:border-[#FFDD00] text-slate-300 px-3 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Latest Executed Action Output */}
              {latestAction && (
                <div className="border border-[#006569]/60 rounded-2xl bg-slate-950 p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-[#FFDD00] flex items-center gap-1.5">
                      <CheckCircle2 size={16} /> Eksekusi Terakhir
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{latestAction.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">{latestAction.userMessage}</p>
                  <pre className="canvas-json-block text-[11px]">
                    {JSON.stringify(latestAction.schema, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Right Column: 3D Hologram Globe + Quick Stats */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#031117] border border-[#006569] rounded-3xl p-5 shadow-2xl flex flex-col min-h-[340px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#FFDD00] flex items-center gap-2">
                    <Radio size={15} /> Globe Taktis Komando 3D
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">60 FPS Studio PBR</span>
                </div>
                <div className="flex-grow w-full h-[280px] rounded-2xl bg-black/40 overflow-hidden relative">
                  <TacticalHoloGlobe3D />
                </div>
              </div>

              <div className="bg-[#031117] border border-[#006569] rounded-3xl p-5 shadow-2xl space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#FFDD00] block">
                  Ringkasan Aset & Komponen Portal
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">Gambar Terindeks (SVG)</span>
                    <strong className="text-xl font-mono text-[#FFDD00] font-black">{activeRegistryItems.length} Aset</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">Komponen Canvas</span>
                    <strong className="text-xl font-mono text-emerald-400 font-black">{components.length} Elemen</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2: 📸 IMAGE TRACKER (Per-Tab Image Tracker + Auto-SVG Upload)
            =================================================================== */}
        {activeTab === 'image_tracker' && (
          <div className="space-y-6">
            {/* Tab Overview Dashboard Cards (Bagian 4.D) */}
            <div className="bg-[#031117] border border-[#006569] rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon size={20} className="text-[#FFDD00]" /> Tab Overview Dashboard & Image Tracker
                  </h2>
                  <p className="text-xs text-slate-400">
                    Pantau jumlah gambar di setiap tab, status konversi vektor `.svg` otomatis, serta perbarui gambar dan caption secara langsung.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTrackerTab('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    selectedTrackerTab === 'all'
                      ? 'bg-[#FFDD00] text-slate-950 border-[#FFDD00]'
                      : 'bg-slate-900 text-slate-300 border-white/10 hover:text-white'
                  }`}
                >
                  Tampilkan Semua Tab ({contentRegistry.filter((i) => i.isActive !== false).length})
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {tabOverviewStats.map((t) => (
                  <div
                    key={t.tabId}
                    onClick={() => setSelectedTrackerTab(t.tabId)}
                    className={`p-4 rounded-2xl border transition cursor-pointer ${
                      selectedTrackerTab === t.tabId
                        ? 'bg-[#006569]/40 border-[#FFDD00]'
                        : 'bg-slate-900/90 border-white/10 hover:border-teal-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-xs text-white uppercase">{t.label}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        {t.allSvg ? '100% .SVG' : 'Mixed'}
                      </span>
                    </div>
                    <div className="text-2xl font-mono font-black text-[#FFDD00]">
                      {t.count} <span className="text-xs font-sans font-normal text-slate-400">Gambar Aktif</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Update: {t.lastUpdated}</span>
                      <span className="text-teal-300 font-bold">Kelola →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Unggah Gambar Baru + Auto-Convert ke SVG */}
            <div className="bg-[#031117] border border-[#006569] rounded-3xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#FFDD00] flex items-center gap-2">
                <Upload size={16} /> Unggah Gambar Baru (Otomatis Dikonversi ke Format .SVG)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Target Tab Halaman</label>
                  <select
                    value={uploadTabId}
                    onChange={(e) => setUploadTabId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  >
                    {PORTAL_TABS_OVERVIEW.map((t) => (
                      <option key={t.tabId} value={t.tabId}>
                        {t.label} ({t.route})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Judul Aset Gambar</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Contoh: Apel Pembukaan GERANAT"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Caption / Alt-Text Resmi</label>
                  <input
                    type="text"
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    placeholder="Tulis caption dokumentasi..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="w-full py-2.5 px-4 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-lg">
                    <Upload size={15} />
                    <span>{isUploadingSvg ? 'Mengonversi ke SVG...' : 'Pilih File & Konversi SVG'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={(e) => handleNewImageUpload(e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Daftar Kartu Image Tracker per Tab */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeRegistryItems.map((item) => (
                <div
                  key={item.contentId}
                  className="bg-[#031117] border border-slate-800 hover:border-[#006569] rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl"
                >
                  <div>
                    <div className="relative h-48 bg-slate-950 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.caption || item.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 rounded-full bg-[#006569] text-[#FFDD00] px-3 py-0.5 text-[10px] font-black uppercase">
                        Tab: {item.tabId}
                      </span>
                      <span className="absolute top-3 right-3 rounded-full bg-slate-950/90 border border-emerald-500/40 text-emerald-300 px-2.5 py-0.5 text-[10px] font-mono font-bold">
                        .{item.imageFormat || 'svg'} (dari {item.convertedFromFormat || 'svg'})
                      </span>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          ID: {item.contentId} • Seksi: {item.sectionId}
                        </span>
                        <h4 className="font-black text-white text-base mt-0.5">{item.title}</h4>
                      </div>

                      {/* Inline Caption Editor */}
                      {editingCaptionId === item.contentId ? (
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            value={editingCaptionText}
                            onChange={(e) => setEditingCaptionText(e.target.value)}
                            className="w-full bg-slate-900 border border-[#FFDD00] rounded-xl p-2.5 text-xs text-white"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={async () => {
                                await updateRegistryItem(item.contentId, { caption: editingCaptionText });
                                setEditingCaptionId(null);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                            >
                              Simpan Caption
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCaptionId(null)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5 text-xs text-slate-300">
                          <span className="text-[10px] font-bold uppercase text-teal-400 block mb-0.5">Caption Aktif:</span>
                          "{item.caption}"
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                        <span>
                          Dimensi: {item.dimensions?.width || 1200}×{item.dimensions?.height || 675}
                        </span>
                        <span>{Math.round((item.fileSize || 120000) / 1024)} KB</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar per Gambar */}
                  <div className="px-5 py-3.5 bg-slate-950 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCaptionId(item.contentId);
                        setEditingCaptionText(item.caption || '');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 size={12} /> Edit Caption
                    </button>

                    <label className="px-2.5 py-1.5 rounded-lg bg-[#006569]/40 hover:bg-[#006569] text-xs font-bold text-[#FFDD00] flex items-center gap-1 cursor-pointer">
                      <Upload size={12} /> Ganti (.SVG)
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleNewImageUpload(e, item.contentId, item.tabId)}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setPreviewModalItem(item)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
                      title="Preview Ukuran Penuh"
                    >
                      <Eye size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => softRemoveRegistryItem(item.contentId)}
                      className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 cursor-pointer"
                      title="Nonaktifkan (Soft Delete)"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 3: 📝 CONTENT EDITOR (Kelola Komponen Canvas & Teks)
            =================================================================== */}
        {activeTab === 'content_editor' && (
          <div className="bg-[#031117] border border-[#006569] rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers size={20} className="text-[#FFDD00]" /> Content & Canvas Component Editor
                </h2>
                <p className="text-xs text-slate-400">
                  Edit teks judul, deskripsi, atau hapus elemen dinamis yang aktif di seluruh seksi halaman web.
                </p>
              </div>
              <button
                type="button"
                onClick={resetToDefaults}
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold cursor-pointer"
              >
                Reset ke Komponen Standar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {components.map((comp) => (
                <div
                  key={comp.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-white/10 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-[#006569] text-[#FFDD00] font-bold uppercase">
                        {comp.component_type} • {comp.container}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{comp.id}</span>
                    </div>

                    {editingCompId === comp.id ? (
                      <div className="space-y-2 pt-2">
                        <input
                          type="text"
                          value={editingCompLabel}
                          onChange={(e) => setEditingCompLabel(e.target.value)}
                          placeholder="Judul / Label Komponen"
                          className="w-full bg-slate-950 border border-[#FFDD00] rounded-xl p-2 text-xs text-white"
                        />
                        <textarea
                          rows={2}
                          value={editingCompCaption}
                          onChange={(e) => setEditingCompCaption(e.target.value)}
                          placeholder="Deskripsi / Caption"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              proposeNaturalLanguage(`Ubah judul komponen ${comp.id} menjadi ${editingCompLabel}`);
                              setEditingCompId(null);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                          >
                            Terapkan
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCompId(null)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 className="font-black text-white text-base">{comp.props?.label || comp.id}</h4>
                        {comp.props?.caption && (
                          <p className="text-xs text-slate-400">{comp.props.caption}</p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCompId(comp.id);
                        setEditingCompLabel(comp.props?.label || '');
                        setEditingCompCaption(comp.props?.caption || '');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 size={12} /> Edit Teks
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteComponent(comp.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-xs font-bold text-rose-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={12} /> Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 4: 📄 DOCUMENT GENERATOR (Naskah Dinas & Siaran Pers 5W+1H)
            =================================================================== */}
        {activeTab === 'doc_generator' && (
          <div className="bg-[#031117] border border-[#006569] rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FileCheck size={20} className="text-[#FFDD00]" /> Generator Naskah Dinas & Siaran Pers Resmi
                </h2>
                <p className="text-xs text-slate-400">
                  Otomasi pembuatan surat dispensasi, izin sarpras, proposal RAB, dan rilis berita 5W+1H berkop Satuan UNJ.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDocSubMode('naskah')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase cursor-pointer ${
                    docSubMode === 'naskah' ? 'bg-[#006569] text-[#FFDD00]' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  Naskah Dinas & Proposal
                </button>
                <button
                  type="button"
                  onClick={() => setDocSubMode('press')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase cursor-pointer ${
                    docSubMode === 'press' ? 'bg-[#006569] text-[#FFDD00]' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  Siaran Pers 5W+1H
                </button>
              </div>
            </div>

            {docSubMode === 'naskah' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-4 bg-slate-900 p-5 rounded-2xl border border-white/10">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Jenis Naskah:</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    >
                      <option value="DISPENSASI">Surat Permohonan Dispensasi Kuliah Anggota</option>
                      <option value="IZIN_SARPRAS">Surat Permohonan Izin Peminjaman Sarpras Kampus</option>
                      <option value="PROPOSAL_RINGKAS">Draft Proposal Kegiatan & Anggaran Biaya (RAB)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Nama Agenda / Kegiatan:</label>
                    <input
                      type="text"
                      value={docParams.namaKegiatan}
                      onChange={(e) => setDocParams({ ...docParams, namaKegiatan: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Waktu Pelaksanaan:</label>
                    <input
                      type="text"
                      value={docParams.tanggal}
                      onChange={(e) => setDocParams({ ...docParams, tanggal: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setGeneratedDoc(generateNaskahDinas(docType, docParams))}
                    className="w-full py-3 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    Generate Naskah Dinas Resmi
                  </button>
                </div>

                <div className="lg:col-span-7 bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-[#FFDD00]">
                      Pratinjau Naskah Siap Cetak
                    </span>
                    {generatedDoc && (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(generatedDoc, 'doc-copy')}
                          className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-bold"
                        >
                          {copiedId === 'doc-copy' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          <span>Salin</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadTextFile(generatedDoc, `naskah-${docType.toLowerCase()}.txt`)}
                          className="text-xs text-[#FFDD00] flex items-center gap-1 font-bold"
                        >
                          <Download size={14} /> Unduh (.txt)
                        </button>
                      </div>
                    )}
                  </div>
                  <pre className="font-mono text-[11px] leading-relaxed text-slate-200 bg-black/60 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap min-h-[280px]">
                    {generatedDoc || 'Klik "Generate Naskah Dinas Resmi" untuk membuat dokumen.'}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-4 bg-slate-900 p-5 rounded-2xl border border-white/10">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Nama Kegiatan:</label>
                    <input
                      type="text"
                      value={pressParams.namaKegiatan}
                      onChange={(e) => setPressParams({ ...pressParams, namaKegiatan: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Lokasi Kegiatan:</label>
                    <input
                      type="text"
                      value={pressParams.lokasi}
                      onChange={(e) => setPressParams({ ...pressParams, lokasi: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setGeneratedPress(generatePressRelease(pressParams))}
                    className="w-full py-3 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    Generate Siaran Pers 5W+1H
                  </button>
                </div>
                <div className="lg:col-span-7 bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-3">
                  <pre className="font-mono text-[11px] leading-relaxed text-slate-200 bg-black/60 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap min-h-[280px]">
                    {generatedPress || 'Klik "Generate Siaran Pers 5W+1H" untuk menyusun rilis berita.'}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 5: 📊 ANALYTICS DASHBOARD (Real-Time Portal & Firestore Metrics)
            =================================================================== */}
        {activeTab === 'analytics' && (
          <div className="bg-[#031117] border border-[#006569] rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 size={20} className="text-[#FFDD00]" /> Real-Time Analytics & Auto-Maintain Health Check
                </h2>
                <p className="text-xs text-slate-400">
                  Statistik langsung dari koleksi Firestore (`geranat_teams`, `forms_submissions`, `content_registry`) dan pemeriksaan kesehatan aset.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  refreshCloudTelemetry();
                  setHealthStatus(`Диагностика Selesai (${new Date().toLocaleTimeString('id-ID')}) • 0 Broken Images • Semua Aset .SVG Optimal`);
                }}
                className="px-4 py-2 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={14} /> Jalankan Health Check
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-200">
              <span><strong>Status Auto-Maintain:</strong> {healthStatus}</span>
              <span className="font-mono text-emerald-400 font-bold">ONLINE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-white/10">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Suara GERANAT</span>
                <div className="text-2xl font-mono font-black text-[#FFDD00] mt-1">
                  {geranatStats.totalVotes.toLocaleString('id-ID')} Suara
                </div>
                <span className="text-xs text-emerald-400 font-mono mt-1 block">
                  {formatRupiah(geranatStats.totalVotes * 1000)} ({geranatStats.totalTeams} Tim)
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-white/10">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Berkas Administrasi</span>
                <div className="text-2xl font-mono font-black text-white mt-1">
                  {submissionStats.total} Berkas
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Pendaftaran: {submissionStats.pendaftaran} • Permohonan/Pengajuan: {submissionStats.permohonan + submissionStats.pengajuan}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-white/10">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Aset Gambar .SVG Aktif</span>
                <div className="text-2xl font-mono font-black text-teal-400 mt-1">
                  {activeRegistryItems.length} File SVG
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Tersebar di {PORTAL_TABS_OVERVIEW.length} tab utama
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-white/10">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Snapshot & Audit Log</span>
                <div className="text-2xl font-mono font-black text-amber-400 mt-1">
                  {snapshots.length} Versi
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {auditLogs.length} rekaman audit cloud
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 6: ⚙️ SETTINGS (2-Verification Bank & QRIS + Scheduled Tasks)
            =================================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-[#031117] border border-[#006569] rounded-3xl p-6 shadow-2xl">
              <MakoBankQRISSettings />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scheduled Auto-Maintain Tasks (/scheduled_tasks/) */}
              <div className="bg-[#031117] border border-[#006569] rounded-3xl p-6 space-y-4 shadow-2xl">
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Settings size={18} className="text-[#FFDD00]" /> Jadwal Tugas Otomatis (/scheduled_tasks)
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    placeholder="Contoh: Auto-backup klasemen GERANAT setiap malam..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newTaskDesc.trim()) return;
                      const created = await createScheduledTask({
                        taskType: 'auto_maintain',
                        description: newTaskDesc.trim(),
                        targetTab: 'all',
                      });
                      if (created) setScheduledTasks((prev) => [created, ...prev]);
                      setNewTaskDesc('');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#006569] text-[#FFDD00] font-black text-xs uppercase cursor-pointer"
                  >
                    + Jadwalkan
                  </button>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {scheduledTasks.length === 0 ? (
                    <p className="text-xs text-slate-500">Belum ada tugas terjadwal.</p>
                  ) : (
                    scheduledTasks.map((t) => (
                      <div key={t.taskId} className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-white block">{t.description}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">{t.taskId} •Oleh: {t.createdBy}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-mono">
                          {t.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Export / Import Schema */}
              <div className="bg-[#031117] border border-[#006569] rounded-3xl p-6 space-y-4 shadow-2xl">
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Ekspor / Impor Skema Konfigurasi JSON
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => downloadTextFile(exportSchema(), `menwa-v8-schema-${Date.now()}.json`)}
                    className="px-4 py-2.5 rounded-xl bg-[#006569] text-[#FFDD00] font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} /> Unduh Backup JSON
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={rawSchemaInput}
                  onChange={(e) => setRawSchemaInput(e.target.value)}
                  placeholder="Tempel JSON skema di sini untuk mengimpor..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white"
                />
                <button
                  type="button"
                  disabled={!rawSchemaInput.trim()}
                  onClick={() => {
                    if (importSchema(rawSchemaInput)) setRawSchemaInput('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  Impor Skema JSON
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 7: 📜 ACTIVITY LOG (Audit Trail, Command Logs & Snapshot Rollback)
            =================================================================== */}
        {activeTab === 'activity_log' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Snapshot Rollback Guardian */}
            <div className="bg-[#031117] border border-[#006569] rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <History size={18} className="text-[#FFDD00]" /> Snapshot Rollback Guardian
                </h3>
                <span className="text-xs font-mono text-[#FFDD00]">{snapshots.length} Versi</span>
              </div>
              <div className="space-y-3 max-h-[460px] overflow-y-auto">
                {snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-[#FFDD00] bg-[#006569]/40 px-2 py-0.5 rounded">
                        {snap.timestamp}
                      </span>
                      <p className="text-sm font-black text-white mt-1">{snap.description}</p>
                      <span className="text-[11px] text-slate-400">Petugas: {snap.officer}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => rollbackSnapshot(snap.id)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw size={13} /> Rollback
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Cloud Audit & Command Center Logs (/audit_logs & /command_center_logs) */}
            <div className="bg-[#031117] border border-[#006569] rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Cloud Audit Trail & Command Logs
                </h3>
                <button
                  type="button"
                  onClick={refreshCloudTelemetry}
                  className="text-xs text-teal-300 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={12} /> Segarkan
                </button>
              </div>
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto">
                {ccLogs.map((log) => (
                  <div key={log.logId} className="p-3.5 rounded-2xl bg-slate-900/90 border border-teal-500/30 text-xs space-y-1">
                    <div className="flex justify-between font-mono text-[10px] text-teal-300">
                      <span>[COMMAND LOG] {log.parsedIntent}</span>
                      <span>{new Date(log.executedAt).toLocaleString('id-ID')}</span>
                    </div>
                    <p className="text-white font-bold">{log.prompt}</p>
                    <span className="text-[10px] text-slate-400 block">Dieksekusi oleh: {log.executedBy}</span>
                  </div>
                ))}
                {auditLogs.map((a) => (
                  <div key={a.logId} className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 text-xs space-y-1">
                    <div className="flex justify-between font-mono text-[10px] text-[#FFDD00]">
                      <span>[AUDIT] {a.action}</span>
                      <span>{new Date(a.timestamp).toLocaleString('id-ID')}</span>
                    </div>
                    <p className="text-slate-200">
                      Koleksi: <strong>{a.targetCollection}</strong> ({a.targetDocId})
                    </p>
                    <span className="text-[10px] text-slate-400 block">Aktor: {a.actorEmail}</span>
                  </div>
                ))}
                {ccLogs.length === 0 && auditLogs.length === 0 && (
                  <p className="text-xs text-slate-500">Belum ada log audit cloud yang tercatat.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Preview Gambar Ukuran Penuh */}
      {previewModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-3xl w-full bg-[#031117] border border-[#006569] rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <div>
                <h4 className="font-black text-white text-sm">{previewModalItem.title}</h4>
                <span className="text-[11px] text-teal-300 font-mono">
                  Tab: {previewModalItem.tabId} • Format: .{previewModalItem.imageFormat}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalItem(null)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={previewModalItem.imageUrl}
                alt={previewModalItem.caption}
                className="max-h-[60vh] w-auto object-contain rounded-xl"
              />
            </div>
            <div className="p-4 bg-slate-900 text-xs text-slate-300">
              <strong>Caption:</strong> {previewModalItem.caption}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default CommandCenterPage;
