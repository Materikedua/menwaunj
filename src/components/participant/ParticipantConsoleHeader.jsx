import React from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Share2,
  Printer,
  Save,
  RotateCcw,
  History,
  KeyRound,
  Lock,
} from 'lucide-react';
import { navigate } from '../../lib/router.jsx';

export function ParticipantConsoleHeader({
  activeModule,
  setActiveModule,
  detectedSchoolName,
  isGuestMode,
  hasAdminAccess,
  allPortals,
  activeSlug,
  handleCopySubdomainLink,
  handlePrintBukuPasukan,
  canEdit,
  savingSnapshot,
  handleSaveManualSnapshot,
  portalData,
  restoringSnapshot,
  handleRestoreSnapshotAction,
  setShowActivityLogModal,
  setShowPinChangeModal,
  handleLockSession,
}) {
  return (
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
  );
}

