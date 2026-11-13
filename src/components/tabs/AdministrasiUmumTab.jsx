import React, { useState, lazy, Suspense } from 'react';
import {
  FileText,
  User,
  Clock,
  Sparkles,
  LogIn,
  ShieldCheck,
  Building,
  FileSpreadsheet,
  MapPin,
  Phone,
  Mail,
  QrCode,
} from 'lucide-react';
import { useAuth } from '../../lib/authContext.jsx';
import { Reveal, HeroStage } from '../MenwaUI.jsx';
import { LetterProgressSection } from '../LetterProgressSection.jsx';
import { TacticalMakoNavigator } from '../TacticalMakoNavigator.jsx';
import { DynamicCanvasZone } from '../DynamicCanvasZone.jsx';
import { playTactileClick } from '../../lib/tactileAudio.js';
import { HERO_PHOTO } from '../../data/siteData.js';

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
const SmartAdminuSection = lazy(() =>
  import('../adminu/SmartAdminuSection').then((m) => ({ default: m.SmartAdminuSection }))
);

const SubTabLoading = () => (
  <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-slate-400">
    <div className="w-10 h-10 rounded-full border-4 border-[#006569]/20 border-t-[#006569] animate-spin" />
    <span className="text-xs font-bold uppercase tracking-wider">Memuat modul administrasi…</span>
  </div>
);

const ADMINU_SUBTABS = [
  { id: 'pengajuan-surat-tiket', num: '1', label: 'Pengajuan Surat & Tiket', icon: FileText },
  { id: 'portal-peserta', num: '2', label: 'Official', icon: ShieldCheck },
  { id: 'bank-qris-settings', num: '3', label: 'Pembayaran', icon: Building },
  { id: 'rekapitulasi-admin', num: '4', label: 'Rekap Data', icon: FileSpreadsheet, adminBadge: true },
  { id: 'cari-progres-surat', num: '5', label: 'Lacak Surat', icon: Clock },
];

export function AdministrasiUmumTab({ onOpenAccountModal }) {
  const { user, profile, submissions, isAdmin } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('pengajuan-surat-tiket');
  const [trackerInitialId, setTrackerInitialId] = useState('');
  const [dispensasiOpen, setDispensasiOpen] = useState(false);

  const handleOpenLetterTracker = (prefillId = '') => {
    playTactileClick('press');
    if (typeof prefillId === 'string' && prefillId.trim()) {
      setTrackerInitialId(prefillId.trim());
    }
    setActiveSubTab('cari-progres-surat');
    setTimeout(() => {
      document.getElementById('cari-surat-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-32 font-sans flex-grow text-slate-800">
      <HeroStage className="min-h-[400px] py-20 md:py-28" photo={HERO_PHOTO} blur={2.5} dim={0.62}>
        <Reveal className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#FFDD00]/40 bg-black/40 px-5 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#FFDD00] backdrop-blur-md">
            <FileText size={15} /> Administrasi &amp; Markas Komando
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white drop-shadow-2xl md:text-6xl">
            Pengajuan Surat &amp; Tiket
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg font-bold leading-relaxed text-[#FFDD00] drop-shadow-lg md:text-xl">
            Portal Terpadu Layanan Satuan, Permohonan Surat Resmi, &amp; Mako UNJ
          </p>
        </Reveal>
      </HeroStage>

      <div className="max-w-7xl mx-auto px-4 pt-8 md:pt-12 relative z-10 space-y-8">
        {/* Banner Auto-Fill Profil Pengguna */}
        {user ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#006569] text-[#FFDD00] flex items-center justify-center font-black text-lg shrink-0 shadow-md">
                <User size={22} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
                    Auto-Fill Aktif
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{user.email}</span>
                </div>
                <h4 className="text-base font-black text-slate-900 mt-1">
                  {profile?.displayName || user.displayName || 'Anggota Pengguna'}
                  <span className="text-slate-500 font-normal text-xs ml-2">
                    ({profile?.institution || 'UNJ'} · {profile?.occupation || 'Mahasiswa'})
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Identitas profil otomatis terisi pada setiap pengajuan tiket maupun kelengkapan surat resmi.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onOpenAccountModal}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
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
                onClick={() => handleOpenLetterTracker()}
                className="neu-btn-strong-blue px-3.5 py-2 text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer text-white"
                title="Lacak Progres Surat"
              >
                <Clock size={14} />
                <span>Lacak Surat</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white text-slate-900 rounded-3xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#006569] text-[#FFDD00] flex items-center justify-center font-black text-lg shrink-0 shadow-md">
                <Sparkles size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#006569]">
                  Administrasi Digital Satu Pintu
                </span>
                <h4 className="text-base font-black text-slate-900 mt-0.5">
                  Isi Pengajuan Surat &amp; Tiket dengan Auto-Fill Profil
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Masuk akun agar identitas otomatis terisi, atau ajukan langsung untuk menerbitkan tiket PAM-2026-XXX.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onOpenAccountModal}
                className="px-4 py-2.5 bg-[#FFDD00] hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn size={15} /> Masuk Akun
              </button>
              <button
                type="button"
                onClick={() => handleOpenLetterTracker()}
                className="neu-btn-primary px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-2 cursor-pointer text-white"
                title="Lacak Progres Surat"
              >
                <Clock size={15} />
                <span>Lacak Surat</span>
              </button>
            </div>
          </div>
        )}

        {/* Bilah Navigasi Sub-Tab Terpadu */}
        <div
          className="bg-white/95 backdrop-blur-xl p-2 sm:p-2.5 rounded-3xl border border-slate-200 shadow-md overflow-x-auto no-scrollbar"
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
                      ? 'bg-[#006569] text-white shadow-md border border-[#006569]'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/80'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-[#FFDD00]' : 'text-[#006569]'} />
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

        {/* Panel Sub-Tab Aktif */}
        <div className="bg-white rounded-[2.5rem] shadow-xl p-6 sm:p-8 md:p-14 border border-slate-200 text-slate-800">
          {activeSubTab === 'pengajuan-surat-tiket' && (
            <Suspense fallback={<SubTabLoading />}>
              <SmartAdminuSection
                embedded
                onOpenLetterTracker={(ticketId) => handleOpenLetterTracker(ticketId)}
              />
            </Suspense>
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
            <LetterProgressSection
              initialId={trackerInitialId}
              onClose={() => setActiveSubTab('pengajuan-surat-tiket')}
            />
          )}
        </div>

        {/* Bagian Bawah Adminu: Informasi Markas Komando (MAKO) & Kontak Resmi */}
        <Reveal delay={150} className="bg-white rounded-[2.5rem] shadow-xl p-6 sm:p-8 md:p-12 border border-slate-200 text-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-50 border border-teal-200 text-[#006569] rounded-full font-black text-xs uppercase tracking-widest mb-4">
                <MapPin size={16} /> Lokasi &amp; Kontak Markas Komando (MAKO)
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4">Mako Resimen Mahasiswa UNJ</h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-6">
                Jl. R.Mangun Muka Kampus A UNJ Gedung G R.107, RT.11/RW.14, Rawamangun, Kec. Pulo Gadung, Kota Jakarta
                Timur, Daerah Khusus Ibukota Jakarta 13220
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-800 font-bold text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <Phone className="text-[#006569] shrink-0" size={20} />
                  <span>
                    WhatsApp (Wakil Komandan):{' '}
                    <a
                      href="https://wa.me/6281525823503"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#006569] hover:underline font-black"
                    >
                      +62 815-2582-3503
                    </a>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-800 font-bold text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <Mail className="text-[#006569] shrink-0" size={20} />
                  <span>
                    Email Satuan:{' '}
                    <a href="mailto:unjmenwa@gmail.com" className="text-[#006569] hover:underline font-black">
                      unjmenwa@gmail.com
                    </a>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-800 font-bold text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <Clock className="text-[#006569] shrink-0" size={20} />
                  <span>Jam Operasional Piket: Senin - Minggu (08.00 - 22.00 WIB)</span>
                </div>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-md border-4 border-slate-200 h-80 bg-slate-100 relative">
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
