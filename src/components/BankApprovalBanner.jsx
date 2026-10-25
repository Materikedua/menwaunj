import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Check, 
  X, 
  ArrowRight, 
  AlertCircle, 
  RefreshCw,
  Building,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { 
  getBankConfigWithProposal, 
  approveBankConfigProposal, 
  rejectBankConfigProposal,
  AUTHORIZED_BANK_ADMINS 
} from '../firebase.js';
import { navigate } from '../lib/router.jsx';

export function BankApprovalBanner({ onOpenSettings }) {
  const { user } = useAuth();
  const userEmail = user?.email?.toLowerCase();
  const isAuthorized = user && AUTHORIZED_BANK_ADMINS.includes(userEmail);

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [successText, setSuccessText] = useState('');

  const checkPendingProposal = async () => {
    if (!isAuthorized) return;
    try {
      const { pendingProposal } = await getBankConfigWithProposal();
      if (pendingProposal && pendingProposal.status === 'PENDING_APPROVAL') {
        setProposal(pendingProposal);
      } else {
        setProposal(null);
      }
    } catch (err) {
      console.warn('Bank proposal check warning:', err);
    }
  };

  useEffect(() => {
    checkPendingProposal();
    // Periksa status secara berkala setiap 30 detik
    const interval = setInterval(checkPendingProposal, 30000);
    return () => clearInterval(interval);
  }, [userEmail, isAuthorized]);

  // Jika bukan admin berwenang, atau tidak ada proposal, atau sudah di-dismiss: jangan tampilkan
  if (!isAuthorized || !proposal || dismissed) return null;

  // Jika yang melihat adalah yang mengajukan sendiri, jangan tampilkan tombol setujui (hanya info)
  const isProposer = userEmail === proposal.proposedBy?.toLowerCase();

  const handleApproveDirectly = async () => {
    setActionLoading(true);
    try {
      await approveBankConfigProposal(userEmail);
      setSuccessText('Verifikasi 2-Admin Berhasil! Rekening bank telah aktif.');
      setTimeout(() => {
        setProposal(null);
        setSuccessText('');
      }, 3000);
    } catch (err) {
      alert(err.message || 'Gagal menyetujui perubahan.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectDirectly = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menolak usulan perubahan rekening ini?')) return;
    setActionLoading(true);
    try {
      await rejectBankConfigProposal(userEmail, 'Ditolak oleh rekan admin melalui banner in-app.');
      setSuccessText('Usulan rekening berhasil ditolak.');
      setTimeout(() => {
        setProposal(null);
        setSuccessText('');
      }, 3000);
    } catch (err) {
      alert(err.message || 'Gagal menolak usulan.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-slate-950 px-4 py-3 shadow-lg relative z-40 border-b border-amber-400 font-sans animate-fade-in">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-950 text-[#FFDD00] flex items-center justify-center shrink-0 shadow-sm font-black">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="font-black uppercase tracking-wider text-[10px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full inline-block mr-2">
              2-Verification Required
            </span>
            <span className="font-bold text-slate-950">
              {isProposer ? (
                <>Pengajuan rekening Anda (<strong className="font-mono">{proposal.proposedAccountNumber}</strong>) sedang menunggu persetujuan rekan admin.</>
              ) : (
                <>Persetujuan Diperlukan: Admin <strong>{proposal.proposedBy}</strong> mengajukan rekening baru <strong>{proposal.proposedBankName} ({proposal.proposedAccountNumber})</strong> a.n <strong>{proposal.proposedAccountHolder}</strong>.</>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          {successText ? (
            <span className="font-bold text-slate-950 bg-white/40 px-3 py-1 rounded-xl">
              {successText}
            </span>
          ) : !isProposer ? (
            <>
              <button
                type="button"
                onClick={handleApproveDirectly}
                disabled={actionLoading}
                className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-[#FFDD00] font-black text-xs uppercase tracking-wider rounded-xl transition shadow flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer"
              >
                {actionLoading ? <RefreshCw size={12} className="animate-spin" /> : <UserCheck size={13} />}
                <span>Setujui (2-Verification)</span>
              </button>

              <button
                type="button"
                onClick={handleRejectDirectly}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-200 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <X size={12} />
                <span>Tolak</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigate('/administrasi');
                  onOpenSettings?.();
                }}
                className="px-3 py-1.5 bg-white/80 hover:bg-white text-slate-900 font-bold text-xs rounded-xl transition flex items-center gap-1"
              >
                <span>Buka Detail</span>
                <ArrowRight size={12} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                navigate('/administrasi');
                onOpenSettings?.();
              }}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
            >
              <span>Tinjau di Pengaturan</span>
              <ArrowRight size={12} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1.5 text-slate-950 hover:bg-black/10 rounded-lg transition"
            title="Tutup Banner Sementara"
          >
            <X size={15} />
          </button>
        </div>

      </div>
    </div>
  );
}

export default BankApprovalBanner;
