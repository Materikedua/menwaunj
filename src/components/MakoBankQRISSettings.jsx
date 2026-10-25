import React, { useState, useEffect } from 'react';
import { 
  Building, 
  CreditCard, 
  QrCode, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink,
  Copy,
  Sparkles,
  Lock,
  UserCheck,
  Check,
  XCircle,
  Clock,
  Send
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { 
  getBankConfigWithProposal, 
  proposeBankConfigUpdate, 
  approveBankConfigProposal, 
  rejectBankConfigProposal,
  AUTHORIZED_BANK_ADMINS 
} from '../firebase.js';
import { DEFAULT_BANK_CONFIG, formatRupiah } from '../lib/qris.js';

export function MakoBankQRISSettings({ onClose }) {
  const { user } = useAuth();
  const userEmail = user?.email?.toLowerCase();
  const isAuthorized = user && AUTHORIZED_BANK_ADMINS.includes(userEmail);

  // Rekan admin untuk 2-verification
  const partnerEmail = AUTHORIZED_BANK_ADMINS.find(e => e !== userEmail) || 'Admin Rekan';

  const [activeConfig, setActiveConfig] = useState(DEFAULT_BANK_CONFIG);
  const [pendingProposal, setPendingProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedBank, setCopiedBank] = useState(false);

  // Form input pengajuan baru
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const { activeConfig: cfg, pendingProposal: prop } = await getBankConfigWithProposal();
      if (cfg) {
        setActiveConfig(cfg);
        setBankName(cfg.bankName || '');
        setAccountNumber(cfg.accountNumber || '');
        setAccountHolder(cfg.accountHolder || '');
      } else {
        setActiveConfig(DEFAULT_BANK_CONFIG);
        setBankName(DEFAULT_BANK_CONFIG.bankName);
        setAccountNumber(DEFAULT_BANK_CONFIG.accountNumber);
        setAccountHolder(DEFAULT_BANK_CONFIG.accountHolder);
      }
      setPendingProposal(prop?.status === 'PENDING_APPROVAL' ? prop : null);
    } catch (err) {
      console.warn('Gagal memuat konfigurasi bank:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Handle pengajuan perubahan oleh Admin 1
  const handlePropose = async (e) => {
    e.preventDefault();
    if (!isAuthorized) {
      setErrorMsg('Akses ditolak. Hanya unjmenwa@gmail.com dan rafflysyahpoetra@gmail.com yang berhak mengubah.');
      return;
    }

    if (!bankName.trim() || !accountNumber.trim() || !accountHolder.trim()) {
      setErrorMsg('Nama Bank, Nomor Rekening, dan Atas Nama Rekening wajib diisi.');
      return;
    }

    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const newProp = await proposeBankConfigUpdate({
        bankName,
        accountNumber,
        accountHolder,
        userEmail
      });
      setPendingProposal(newProp);
      setSuccessMsg(`Pengajuan berhasil dikirim! Menunggu persetujuan (2-Verification) dari ${partnerEmail}.`);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengirim pengajuan.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle persetujuan oleh Admin 2
  const handleApprove = async () => {
    setActionLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const approvedConfig = await approveBankConfigProposal(userEmail);
      setActiveConfig(approvedConfig);
      setPendingProposal(null);
      setSuccessMsg('Verifikasi 2 Admin berhasil! Rekening bank telah resmi diperbarui dan aktif di seluruh sistem.');
      await loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyetujui pengajuan.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle penolakan / pembatalan pengajuan
  const handleReject = async () => {
    if (!confirm('Apakah Anda yakin ingin membatalkan / menolak pengajuan perubahan rekening ini?')) return;
    setActionLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await rejectBankConfigProposal(userEmail);
      setPendingProposal(null);
      setSuccessMsg('Pengajuan perubahan rekening berhasil dibatalkan.');
      await loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memproses penolakan.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyAccount = () => {
    if (navigator?.clipboard && activeConfig?.accountNumber) {
      navigator.clipboard.writeText(activeConfig.accountNumber);
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    }
  };

  // QR String langsung ke bank
  const qrDirectData = `BANK:${activeConfig.bankName || 'BANK'}|REK:${activeConfig.accountNumber || ''}|NAMA:${activeConfig.accountHolder || ''}`;
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(qrDirectData)}`;

  return (
    <div className="bg-slate-900 border border-teal-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative font-sans">
      
      {/* Header Pengaturan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#006569]/40 text-[#FFDD00] border border-[#FFDD00]/30 mb-2">
            <Building size={14} className="text-[#FFDD00]" />
            <span>Mako Bank Settings • 2-Verification Protocol</span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            Pengaturan Rekening Bank & QR Pembayaran
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Rekening tujuan resmi Satuan Menwa UNJ. Setiap perubahan rekening memerlukan persetujuan ganda (2 Verification) antara <strong className="text-[#FFDD00]">unjmenwa@gmail.com</strong> dan <strong className="text-[#FFDD00]">rafflysyahpoetra@gmail.com</strong>.
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="self-start sm:self-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
          >
            Tutup
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#FFDD00]" />
          <span>Memuat data konfigurasi rekening bank...</span>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          
          {/* Pesan Sukses / Error */}
          {successMsg && (
            <div className="p-4 bg-emerald-950/90 border border-emerald-500/60 rounded-2xl flex items-center gap-3 text-emerald-200 text-xs sm:text-sm animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-950/90 border border-red-500/60 rounded-2xl flex items-center gap-3 text-red-200 text-xs sm:text-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. REKENING BANK AKTIF SAAT INI & LIVE QR */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-lg">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Rekening Aktif Terverifikasi
                  </span>
                  {activeConfig.lastApprovedBy && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Disetujui: {activeConfig.lastApprovedBy}
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                    Nama Bank Resmi
                  </div>
                  <h4 className="text-2xl font-black text-white mt-0.5">
                    {activeConfig.bankName || DEFAULT_BANK_CONFIG.bankName}
                  </h4>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Nomor Rekening Tujuan</span>
                    <span className="text-xl sm:text-2xl font-mono font-black text-[#FFDD00] tracking-wider block mt-0.5">
                      {activeConfig.accountNumber || DEFAULT_BANK_CONFIG.accountNumber}
                    </span>
                    <span className="text-xs text-slate-300 font-bold block mt-1 uppercase">
                      a.n. {activeConfig.accountHolder || DEFAULT_BANK_CONFIG.accountHolder}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 shrink-0"
                  >
                    {copiedBank ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedBank ? 'Tersalin!' : 'Salin Rekening'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Semua transaksi pendaftaran kegiatan dan transfer e-voting secara otomatis mengarah langsung ke rekening bank di atas.
                </p>
              </div>

              {/* QR Code Bersih Langsung ke Bank */}
              <div className="bg-white p-4 rounded-2xl shadow-xl border-4 border-[#006569] text-center mx-auto lg:mx-0 shrink-0">
                <img 
                  src={qrImageSrc} 
                  alt="QR Code Rekening Bank Resmi"
                  className="w-44 h-44 object-contain mx-auto"
                />
                <div className="mt-2 text-slate-950 font-black text-[11px] uppercase tracking-wider">
                  QR Pembayaran Bank
                </div>
                <div className="text-slate-600 text-[10px] font-mono font-bold">
                  {activeConfig.bankName}
                </div>
              </div>

            </div>
          </div>

          {/* 2. SECTION 2-VERIFICATION (APPROVAL DARI ADMIN REKAN) */}
          {pendingProposal && (
            <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-2 border-amber-500 rounded-3xl p-6 sm:p-7 shadow-2xl relative animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFDD00] text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
                  <ShieldCheck size={24} />
                </div>
                <div className="space-y-3 flex-1">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-3 py-0.5 rounded-full inline-block">
                      Persetujuan Diperlukan (2-Verification Protocol)
                    </span>
                    <h4 className="text-lg font-black text-white mt-1">
                      Pengajuan Perubahan Rekening oleh Admin: <span className="text-[#FFDD00] font-mono">{pendingProposal.proposedBy}</span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Diajukan pada {new Date(pendingProposal.proposedAt).toLocaleString('id-ID')} WIB.
                    </p>
                  </div>

                  {/* Detail Perubahan Rekening yang Diajukan */}
                  <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Bank Baru</span>
                      <strong className="text-white text-sm">{pendingProposal.proposedBankName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Nomor Rekening Baru</span>
                      <strong className="text-[#FFDD00] font-mono text-sm">{pendingProposal.proposedAccountNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Atas Nama Baru</span>
                      <strong className="text-white text-sm uppercase">{pendingProposal.proposedAccountHolder}</strong>
                    </div>
                  </div>

                  {/* Aksi Persetujuan */}
                  {userEmail === pendingProposal.proposedBy?.toLowerCase() ? (
                    <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-slate-300 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-amber-300 font-medium">
                        <Clock size={16} className="shrink-0" />
                        <span>Menunggu persetujuan dari rekan admin ({partnerEmail}). Berdasarkan aturan 2-Verification, Anda tidak dapat menyetujui pengajuan Anda sendiri.</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleReject}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-red-900/80 hover:bg-red-800 text-red-200 rounded-lg text-xs font-bold transition shrink-0"
                      >
                        Batalkan Pengajuan
                      </button>
                    </div>
                  ) : isAuthorized ? (
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="px-6 py-3 bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95"
                      >
                        {actionLoading ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <UserCheck size={16} />
                        )}
                        <span>Setujui & Terapkan ke Sistem (2-Verification)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleReject}
                        disabled={actionLoading}
                        className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
                      >
                        Tolak Perubahan
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Hanya akun rekan ({partnerEmail}) yang dapat menyetujui pengajuan ini.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. FORM PENGAJUAN PERUBAHAN REKENING BANK */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-black text-white flex items-center gap-2">
                  <CreditCard size={17} className="text-[#FFDD00]" />
                  <span>Input / Ajukan Perubahan Rekening Bank</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {isAuthorized 
                    ? `Anda login sebagai admin berwenang (${userEmail}). Penginputan akan disimpan sebagai proposal 2-Verification.`
                    : 'Fitur pengubahan nomor rekening hanya dapat diakses oleh akun rafflysyahpoetra@gmail.com dan unjmenwa@gmail.com.'}
                </p>
              </div>
            </div>

            {isAuthorized ? (
              <form onSubmit={handlePropose} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Nama Bank *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Bank DKI / Bank Mandiri / BCA"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FFDD00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Nomor Rekening Bank *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 102-23-90812-4"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono font-bold focus:outline-none focus:border-[#FFDD00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Atas Nama Rekening *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: RESIMEN MAHASISWA SATUAN UNJ"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white uppercase focus:outline-none focus:border-[#FFDD00]"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-start gap-3 text-xs text-slate-300">
                  <ShieldCheck size={18} className="text-[#FFDD00] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Aturan Keamanan 2-Verification:</strong>
                    Ketika Anda menginput perubahan rekening ini, perubahan tidak langsung aktif seketika. Sistem akan mengirimkan notifikasi persetujuan kepada rekan admin ({partnerEmail}). Setelah disetujui, nomor rekening dan QR code pembayaran akan diperbarui secara otomatis.
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3.5 bg-[#FFDD00] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95"
                  >
                    {submitting ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    <span>Kirim Pengajuan Perubahan (Perlu Verifikasi 2-Admin)</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center gap-3">
                <Lock size={18} className="text-amber-400 shrink-0" />
                <span>
                  Anda saat ini login sebagai pengunjung. Pengubahan nomor rekening bank resmi Mako dilindungi dan hanya dapat dilakukan oleh <strong className="text-slate-200">rafflysyahpoetra@gmail.com</strong> dan <strong className="text-slate-200">unjmenwa@gmail.com</strong> dengan persetujuan 2 pihak.
                </span>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

export default MakoBankQRISSettings;
