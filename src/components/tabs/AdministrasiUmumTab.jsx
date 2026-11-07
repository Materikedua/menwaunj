import React, { useState, lazy, Suspense } from 'react';
import {
  FileText,
  User,
  Clock,
  Sparkles,
  LogIn,
  Award,
  Briefcase,
  Users,
  ShieldCheck,
  Building,
  FileSpreadsheet,
  ChevronRight,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  QrCode,
} from 'lucide-react';
import { useAuth } from '../../lib/authContext.jsx';
import { Link } from '../../lib/router.jsx';
import { Reveal, HeroStage } from '../MenwaUI.jsx';
import { LetterProgressSection } from '../LetterProgressSection.jsx';
import { TacticalMakoNavigator } from '../TacticalMakoNavigator.jsx';
import { DynamicCanvasZone } from '../DynamicCanvasZone.jsx';
import { playTactileClick } from '../../lib/tactileAudio.js';
import { HERO_PHOTO } from '../../data/siteData.js';

const RegistrationForm = lazy(() =>
  import('../RegistrationForm.jsx').then((m) => ({ default: m.RegistrationForm }))
);
const ParticipantPortal = lazy(() =>
  import('../ParticipantPortal.jsx').then((m) => ({ default: m.ParticipantPortal }))
);
const MakoBankQRISSettings = lazy(() =>
  import('../MakoBankQRISSettings.jsx').then((m) => ({ default: m.MakoBankQRISSettings }))
);
const AdminSubmissionsDashboard = lazy(() =>
  import('../AdminSubmissionsDashboard.jsx').then((m) => ({ default: m.AdminSubmissionsDashboard }))
);
const EDispensasiModal = lazy(() =>
  import('../EDispensasiModal.jsx').then((m) => ({ default: m.EDispensasiModal }))
);

const SubTabLoading = () => (
  <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-slate-400">
    <div className="w-10 h-10 rounded-full border-4 border-[#006569]/20 border-t-[#006569] animate-spin" />
    <span className="text-xs font-bold uppercase tracking-wider">Memuat modul administrasi…</span>
  </div>
);

const PENDAFTARAN_ITEMS = [
  {
    id: 1,
    title: 'Pendaftaran Camen Angkatan LIII',
    category: 'Rekrutmen Camen',
    desc: 'Formulir penerimaan Calon Menwa UNJ Angkatan LIII 2026 bagi mahasiswa aktif UNJ.',
    url: 'https://bit.ly/PCABMENWA2026',
    status: 'Dibuka',
    statusClass: 'bg-emerald-600 text-white',
    ctaText: 'Daftar Camen',
  },
  {
    id: 2,
    title: 'Lomba Nasional Ksatria Cendekia VIII',
    category: 'Giat Lomba',
    desc: 'Pendaftaran Kompetisi Pemuda Nusantara Ksatria Cendekia VIII 2026.',
    url: '/kc',
    status: 'Resmi',
    statusClass: 'bg-[#FFDD00] text-slate-950',
    ctaText: 'Daftar KC VIII',
  },
  {
    id: 3,
    title: 'Lomba Paskibra GERANAT VII',
    category: 'Giat Paskibra',
    desc: 'Pendaftaran Lomba Formasi Pengibaran Bendera GERANAT VII.',
    url: '/geranat',
    status: 'Resmi',
    statusClass: 'bg-[#FFDD00] text-slate-950',
    ctaText: 'Info GERANAT',
  },
];

const PERMOHONAN_ITEMS = [
  {
    id: 1,
    title: 'Permohonan Personil',
    category: 'Operasional',
    desc: 'Pengajuan satgas pengamanan, protokoler upacara, dan bantuan operasional satuan.',
    url: 'https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20mengajukan%20Permohonan%20Pengajuan%20Personil.',
    status: 'Siaga',
    statusClass: 'bg-[#006569] text-white',
    ctaText: 'Ajukan Personil',
  },
  {
    id: 2,
    title: 'Peminjaman Barang & Sarpras',
    category: 'Inventaris',
    desc: 'Peminjaman perlengkapan lapangan, tenda komando, dan fasilitas Mako.',
    url: 'https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20mengajukan%20Permohonan%20Peminjaman%20Barang.',
    status: 'Siaga',
    statusClass: 'bg-[#006569] text-white',
    ctaText: 'Pinjam Sarpras',
  },
  {
    id: 3,
    title: 'Permohonan Instruktur / Pemateri',
    category: 'Pelatihan',
    desc: 'Permohonan pelatih PBB, tata upacara, kedisiplinan, bela negara, & survival.',
    url: 'https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20mengajukan%20Permohonan%20Pemateri/Instruktur.',
    status: 'Siaga',
    statusClass: 'bg-[#006569] text-white',
    ctaText: 'Ajukan Instruktur',
  },
];

const KERJASAMA_ITEMS = [
  {
    id: 1,
    title: 'Sponsorship',
    category: 'Kemitraan',
    desc: 'Dukungan dana maupun in-kind untuk ajang nasional dan operasional satuan.',
    url: 'https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20mengajukan%20Kerjasama%20Sponsorship.',
    status: 'Terbuka',
    statusClass: 'bg-teal-700 text-white',
    ctaText: 'Ajukan Sponsor',
  },
  {
    id: 2,
    title: 'Media Partner',
    category: 'Publikasi',
    desc: 'Publikasi bersama dan eksposur media untuk agenda kepemudaan & kompetisi.',
    url: 'https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20mengajukan%20Kerjasama%20Media%20Partner.',
    status: 'Terbuka',
    statusClass: 'bg-teal-700 text-white',
    ctaText: 'Ajukan Medpart',
  },
  {
    id: 3,
    title: 'Partnership Instansi',
    category: 'Strategis',
    desc: 'Kolaborasi strategis antar kampus, ormawa, kedinasan, dan instansi.',
    url: 'https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20mengajukan%20Kerjasama%20Partnership.',
    status: 'Terbuka',
    statusClass: 'bg-teal-700 text-white',
    ctaText: 'Ajukan Partner',
  },
  {
    id: 4,
    title: 'Kolaborasi Kegiatan',
    category: 'Giat Gabungan',
    desc: 'Penyelenggaraan bakti sosial, pengabdian masyarakat, & latihan gabungan.',
    url: 'https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20mengajukan%20Kerjasama%20Kegiatan.',
    status: 'Terbuka',
    statusClass: 'bg-teal-700 text-white',
    ctaText: 'Ajukan Kolaborasi',
  },
];

const ADMINU_SUBTABS = [
  { id: 'pendaftaran', num: '1', label: 'Pendaftaran', icon: Award },
  { id: 'permohonan', num: '2', label: 'Permohonan', icon: Briefcase },
  { id: 'kerjasama', num: '3', label: 'Kerjasama', icon: Users },
  { id: 'registrasi-mandiri', num: '4', label: 'Registrasi', icon: FileText },
  { id: 'portal-peserta', num: '5', label: 'Official', icon: ShieldCheck },
  { id: 'bank-qris-settings', num: '6', label: 'Pembayaran', icon: Building },
  { id: 'rekapitulasi-admin', num: '7', label: 'Rekap Data', icon: FileSpreadsheet, adminBadge: true },
  { id: 'cari-progres-surat', num: '8', label: 'Lacak Surat', icon: Clock },
];

export function AdministrasiUmumTab({ onOpenAdminForm, onOpenAccountModal }) {
  const { user, profile, submissions, isAdmin } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('pendaftaran');
  const [dispensasiOpen, setDispensasiOpen] = useState(false);

  const handleOpenLetterTracker = () => {
    playTactileClick('press');
    setActiveSubTab('cari-progres-surat');
    setTimeout(() => {
      document.getElementById('cari-surat-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  return (
    <div className="bg-[#051419] min-h-screen pb-32 font-sans flex-grow text-slate-100">
      <HeroStage className="min-h-[400px] py-20 md:py-28" photo={HERO_PHOTO} blur={2.5} dim={0.62}>
        <Reveal className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#FFDD00]/40 bg-black/40 px-5 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#FFDD00] backdrop-blur-md">
            <FileText size={15} /> Administrasi &amp; Markas Komando
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white drop-shadow-2xl md:text-6xl">
            Administrasi Umum &amp; Mako
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg font-bold leading-relaxed text-[#FFDD00] drop-shadow-lg md:text-xl">
            Portal Pendaftaran, Layanan Satuan, Kemitraan, &amp; Mako UNJ
          </p>
        </Reveal>
      </HeroStage>

      <div className="max-w-7xl mx-auto px-4 pt-8 md:pt-12 relative z-10 space-y-8">
        {/* Banner Auto-Fill Profil Pengguna */}
        {user ? (
          <div className="bg-[#071c22]/90 backdrop-blur-xl border border-white/12 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#006569] text-[#FFDD00] flex items-center justify-center font-black text-lg shrink-0 shadow-md">
                <User size={22} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
                    Auto-Fill Aktif
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{user.email}</span>
                </div>
                <h4 className="text-base font-black text-white mt-1">
                  {profile?.displayName || user.displayName || 'Anggota Pengguna'}
                  <span className="text-slate-400 font-normal text-xs ml-2">
                    ({profile?.institution || 'UNJ'} · {profile?.occupation || 'Mahasiswa'})
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Identitas profil otomatis terisi pada setiap formulir pengajuan.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onOpenAccountModal}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-slate-100 text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
              >
                Edit Profil
              </button>
              <button
                type="button"
                onClick={onOpenAccountModal}
                className="px-3.5 py-2 bg-[#006569] text-[#FFDD00] text-xs font-black rounded-xl shadow-md hover:bg-[#00474c] transition flex items-center gap-1.5 cursor-pointer"
              >
                <FileText size={14} /> Berkas ({submissions?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setDispensasiOpen(true)}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <QrCode size={14} /> E-Dispensasi
              </button>
              <button
                type="button"
                onClick={handleOpenLetterTracker}
                className="neu-btn-strong-blue px-3.5 py-2 text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer text-white"
                title="Lacak Progres Surat"
              >
                <Clock size={14} />
                <span>Lacak Surat</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#071c22]/90 backdrop-blur-xl text-white rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFDD00] text-slate-950 flex items-center justify-center font-black text-lg shrink-0 shadow-md">
                <Sparkles size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FFDD00]">
                  Administrasi Digital Terpadu
                </span>
                <h4 className="text-base font-black text-white mt-0.5">
                  Isi Formulir Instan dengan Auto-Fill Profil
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Masuk akun agar identitas otomatis terisi pada setiap layanan administrasi.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onOpenAccountModal}
                className="px-4 py-2.5 bg-[#FFDD00] hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn size={15} /> Masuk Akun
              </button>
              <button
                type="button"
                onClick={handleOpenLetterTracker}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-[#FFDD00] text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                title="Lacak Progres Surat"
              >
                <Clock size={15} />
                <span>Lacak Surat</span>
              </button>
            </div>
          </div>
        )}

        {/* Responsive Sub-Tab Navigation Bar: Horizontal Scrollable on Mobile, Balanced Flex/Grid on Desktop */}
        <div
          className="bg-[#071c22]/90 backdrop-blur-xl p-2 sm:p-2.5 rounded-3xl border border-white/10 shadow-2xl overflow-x-auto no-scrollbar"
          role="tablist"
          aria-label="Sub-kategori Administrasi Umum"
        >
          <div className="flex md:flex-wrap md:justify-center items-center gap-2 min-w-max md:min-w-0">
            {ADMINU_SUBTABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    playTactileClick('pill');
                    setActiveSubTab(tab.id);
                  }}
                  className={`px-3.5 sm:px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#006569] text-[#FFDD00] shadow-md shadow-[#006569]/30 border border-[#00A8AF]/60'
                      : 'bg-[#09252e] hover:bg-[#0d2f3a] text-slate-200 hover:text-white border border-white/10'
                  }`}
                >
                  <Icon size={14} />
                  <span>
                    {tab.num}. {tab.label}
                  </span>
                  {tab.adminBadge && isAdmin && (
                    <span className="bg-[#FFDD00] text-slate-950 text-[10px] px-1.5 py-0.5 rounded-full font-black">
                      Admin
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Sub-Tab Panel */}
        <div className="bg-[#071c22]/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-6 sm:p-8 md:p-14 border border-white/12 text-slate-100">
          {activeSubTab === 'pendaftaran' && (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h3 className="text-2xl md:text-3xl font-black text-white">Portal Pendaftaran</h3>
                <p className="text-slate-300 font-medium text-sm mt-2">
                  Pilih program pendaftaran untuk pengisian langsung di aplikasi.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PENDAFTARAN_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#09252e] rounded-3xl p-6 border border-white/10 hover:border-[#00A8AF]/60 hover:bg-[#0d2f3a] hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#FFDD00] bg-[#006569]/40 border border-[#006569]/60 px-3 py-1 rounded-full">
                          {item.category}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${item.statusClass}`}>
                          {item.status}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-white leading-tight mb-2.5 group-hover:text-[#FFDD00] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-slate-300 text-xs font-medium leading-relaxed mb-5">{item.desc}</p>
                    </div>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => onOpenAdminForm?.(item)}
                        className="w-full bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-bold py-3 px-4 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 cursor-pointer"
                      >
                        <FileText size={15} />
                        <span>Isi Formulir</span>
                      </button>
                      {item.url.startsWith('/') ? (
                        <Link
                          to={item.url}
                          className="w-full py-1.5 text-center text-[11px] font-bold text-slate-500 hover:text-[#006569] flex items-center justify-center gap-1 transition"
                        >
                          <span>{item.ctaText}</span>
                          <ChevronRight size={13} />
                        </Link>
                      ) : (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-1.5 text-center text-[11px] font-bold text-slate-500 hover:text-[#006569] flex items-center justify-center gap-1 transition"
                        >
                          <span>Tautan Eksternal</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'permohonan' && (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h3 className="text-2xl md:text-3xl font-black text-white">Permohonan Layanan Satuan</h3>
                <p className="text-slate-300 font-medium text-sm mt-2">
                  Ajukan personel, sarpras, atau instruktur langsung secara digital.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PERMOHONAN_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#09252e] rounded-3xl p-6 border border-white/10 hover:border-[#00A8AF]/60 hover:bg-[#0d2f3a] hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#FFDD00] bg-[#006569]/40 border border-[#006569]/60 px-3 py-1 rounded-full">
                          {item.category}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${item.statusClass}`}>
                          {item.status}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-white leading-tight mb-2.5 group-hover:text-[#FFDD00] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-slate-300 text-xs font-medium leading-relaxed mb-5">{item.desc}</p>
                    </div>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => onOpenAdminForm?.(item)}
                        className="w-full bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-bold py-3 px-4 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 cursor-pointer"
                      >
                        <FileText size={15} />
                        <span>{item.ctaText}</span>
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-1.5 text-center text-[11px] font-bold text-slate-400 hover:text-[#FFDD00] flex items-center justify-center gap-1 transition"
                      >
                        <span>WhatsApp Piket</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'kerjasama' && (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h3 className="text-2xl md:text-3xl font-black text-white">Portal Kemitraan</h3>
                <p className="text-slate-300 font-medium text-sm mt-2">
                  Ajukan sponsorship, media partner, dan kolaborasi kegiatan.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {KERJASAMA_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#09252e] rounded-3xl p-6 border border-white/10 hover:border-[#00A8AF]/60 hover:bg-[#0d2f3a] hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#FFDD00] bg-[#006569]/40 border border-[#006569]/60 px-3 py-1 rounded-full">
                          {item.category}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${item.statusClass}`}>
                          {item.status}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-white leading-tight mb-2.5 group-hover:text-[#FFDD00] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-slate-300 text-xs font-medium leading-relaxed mb-5">{item.desc}</p>
                    </div>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => onOpenAdminForm?.(item)}
                        className="w-full bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-bold py-3 px-3 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5 cursor-pointer"
                      >
                        <FileText size={14} />
                        <span>{item.ctaText}</span>
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-1 text-center text-[10px] font-bold text-slate-400 hover:text-[#FFDD00] flex items-center justify-center gap-1 transition"
                      >
                        <span>WhatsApp</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'registrasi-mandiri' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center max-w-2xl mx-auto mb-6">
                <h3 className="text-2xl md:text-3xl font-black text-white">Formulir Registrasi Mandiri</h3>
                <p className="text-slate-300 font-medium text-sm mt-2">
                  Data profil Anda (Nama Lengkap, Asal Instansi, Pekerjaan, Tanggal Lahir) terisi secara otomatis dan
                  tersimpan langsung ke database Firestore.
                </p>
              </div>
              <Suspense fallback={<SubTabLoading />}>
                <RegistrationForm />
              </Suspense>
            </div>
          )}

          {activeSubTab === 'portal-peserta' && (
            <Suspense fallback={<SubTabLoading />}>
              <ParticipantPortal />
            </Suspense>
          )}

          {activeSubTab === 'bank-qris-settings' && (
            <Suspense fallback={<SubTabLoading />}>
              <MakoBankQRISSettings />
            </Suspense>
          )}

          {activeSubTab === 'rekapitulasi-admin' && (
            <Suspense fallback={<SubTabLoading />}>
              <AdminSubmissionsDashboard />
            </Suspense>
          )}

          {activeSubTab === 'cari-progres-surat' && (
            <LetterProgressSection onClose={() => setActiveSubTab('pendaftaran')} />
          )}
        </div>

        {/* Bagian Bawah Adminu: Informasi Markas Komando (MAKO) & Kontak Resmi */}
        <Reveal delay={150} className="bg-[#071c22]/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-6 sm:p-8 md:p-12 border border-white/12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#006569]/30 border border-[#006569]/60 text-[#FFDD00] rounded-full font-black text-xs uppercase tracking-widest mb-4">
                <MapPin size={16} /> Lokasi &amp; Kontak Markas Komando (MAKO)
              </div>
              <h3 className="text-3xl font-black text-white mb-4">Mako Resimen Mahasiswa UNJ</h3>
              <p className="text-slate-300 font-medium leading-relaxed mb-6">
                Jl. R.Mangun Muka Kampus A UNJ Gedung G R.107, RT.11/RW.14, Rawamangun, Kec. Pulo Gadung, Kota Jakarta
                Timur, Daerah Khusus Ibukota Jakarta 13220
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-200 font-bold text-sm bg-[#09252e] p-4 rounded-2xl border border-white/10">
                  <Phone className="text-[#00A8AF] shrink-0" size={20} />
                  <span>
                    WhatsApp (Wakil Komandan):{' '}
                    <a
                      href="https://wa.me/6281525823503"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FFDD00] hover:underline font-black"
                    >
                      +62 815-2582-3503
                    </a>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-200 font-bold text-sm bg-[#09252e] p-4 rounded-2xl border border-white/10">
                  <Mail className="text-[#00A8AF] shrink-0" size={20} />
                  <span>
                    Email Satuan:{' '}
                    <a href="mailto:unjmenwa@gmail.com" className="text-[#FFDD00] hover:underline font-black">
                      unjmenwa@gmail.com
                    </a>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-200 font-bold text-sm bg-[#09252e] p-4 rounded-2xl border border-white/10">
                  <Clock className="text-[#00A8AF] shrink-0" size={20} />
                  <span>Jam Operasional Piket: Senin - Minggu (08.00 - 22.00 WIB)</span>
                </div>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 h-80 bg-slate-900 relative">
              <iframe
                title="Google Maps Mako Menwa UNJ"
                src="https://maps.google.com/maps?q=Mako%20Menwa%20UNJ%20Universitas%20Negeri%20Jakarta&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                allowFullScreen=""
                loading="lazy"
              />
            </div>
          </div>
        </Reveal>

        <Reveal>
          <TacticalMakoNavigator />
        </Reveal>

        <DynamicCanvasZone containerId="mako_slot" title="Layanan & Kontak Tambahan Markas Komando" />
      </div>

      <Suspense fallback={null}>
        <EDispensasiModal isOpen={dispensasiOpen} onClose={() => setDispensasiOpen(false)} />
      </Suspense>
    </div>
  );
}
