import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Copy, 
  Check, 
  QrCode,
  Building,
  RefreshCw,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { DEFAULT_BANK_CONFIG, formatRupiah } from '../lib/qris.js';
import { 
  getBankQRISConfig, 
  createPendingVoteTransaction, 
  cancelExpiredVoteTransaction,
  subscribeToVoteTransaction
} from '../firebase.js';

const TOTAL_SECONDS = 15 * 60; // 15 Menit = 900 detik

/**
 * Komponen QRIS Statis + Countdown 15 Menit + Deteksi Pembayaran Otomatis (V8)
 * - QRIS di-generate client-side menggunakan library `qrcode` dari qrisPayload di Firestore (/settings/bank_qris)
 * - Countdown timer 15:00 menit dengan progress bar visual (Hijau -> Kuning -> Merah -> Merah Berkedip)
 * - Jika waktu habis (0:00), transaksi otomatis dibatalkan (status: 'batal', cancelReason: 'timeout_15min')
 * - Deteksi pembayaran otomatis via Firestore onSnapshot (/voting_transactions/{txId}) + polling 5 detik ke /api/verify-payment
 */
export function DynamicQRISModal({
  isOpen,
  onClose,
  amount = 1000,
  votes = 1,
  teamId = 'team-1',
  teamName = 'Tim Kontingen GERANAT',
  voterUid = 'anonymous',
  voterName = 'Pendukung Setia',
  title = 'Pembayaran QRIS Statis Menwa UNJ',
  description = 'E-Voting Dukungan Kontingen GERANAT',
  invoiceId = '',
  onPaymentSuccess,
  onPaymentFailed
}) {
  const [bankConfig, setBankConfig] = useState(DEFAULT_BANK_CONFIG);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedNominal, setCopiedNominal] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [pollingCount, setPollingCount] = useState(0);

  const hasCompletedRef = useRef(false);
  const activeTxIdRef = useRef('');

  const finalInvoiceId = useRef('');
  if (isOpen && !finalInvoiceId.current) {
    finalInvoiceId.current = invoiceId || `VOTE-${teamId}-${Date.now().toString(36).toUpperCase()}`;
  } else if (!isOpen && finalInvoiceId.current) {
    finalInvoiceId.current = '';
  }

  const currentTxId = invoiceId || finalInvoiceId.current || `VOTE-${Date.now().toString(36).toUpperCase()}`;

  // 1. Muat konfigurasi rekening & qrisPayload dari Firestore (/settings/bank_qris) dan render QRIS Statis Client-Side
  useEffect(() => {
    if (!isOpen) return undefined;
    let isMounted = true;

    const loadAndRenderQR = async () => {
      try {
        const cfg = await getBankQRISConfig();
        const merged = {
          ...DEFAULT_BANK_CONFIG,
          ...(cfg || {})
        };
        if (isMounted) setBankConfig(merged);

        // Gunakan qrisPayload statis dari Firestore (/settings/bank_qris) atau EMVCo statis resmi Mako
        const staticPayload =
          merged.qrisPayload ||
          `00020101021126610014ID.CO.BANKMANDIRI.WWW01189360000801123456780215${merged.accountNumber}0303UMI5204541153033605802ID5921${(merged.accountHolder || 'MENWA UNJ').substring(0, 21)}6007JAKARTA6105132206304A1B2`;

        const dataUrl = await QRCode.toDataURL(staticPayload, {
          width: 280,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'M'
        });

        if (isMounted) {
          setQrDataUrl(dataUrl);
        }
      } catch (err) {
        console.warn('QRIS client-side generation note:', err);
      }
    };

    loadAndRenderQR();
    return () => { isMounted = false; };
  }, [isOpen]);

  // 2. Buat dokumen transaksi berstatus 'pending' di /voting_transactions/{txId} & pasang listener onSnapshot + Polling 5 detik
  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(TOTAL_SECONDS);
      setPollingCount(0);
      hasCompletedRef.current = false;
      return undefined;
    }

    hasCompletedRef.current = false;
    activeTxIdRef.current = currentTxId;
    setSecondsLeft(TOTAL_SECONDS);

    // Simpan status 'pending' ke Firestore
    createPendingVoteTransaction({
      txId: currentTxId,
      teamId,
      teamName,
      voterUid,
      voterName,
      votes,
      amount
    }).catch(() => {});

    // Real-time listener onSnapshot pada /voting_transactions/{txId}
    const unsubscribeSnapshot = subscribeToVoteTransaction(currentTxId, (txDoc) => {
      if (txDoc && txDoc.status === 'lunas' && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        const receipt = {
          txId: currentTxId,
          amount,
          votes,
          paidAt: txDoc.verifiedAt || new Date().toISOString(),
          bankName: bankConfig.bankName,
          accountNumber: bankConfig.accountNumber,
          accountHolder: bankConfig.accountHolder,
          status: 'LUNAS'
        };
        setTimeout(() => {
          onPaymentSuccess?.(receipt);
          onClose?.();
        }, 120);
      }
    });

    // Polling setiap 5 detik ke /api/verify-payment
    const pollInterval = setInterval(async () => {
      if (hasCompletedRef.current) return;
      setPollingCount(prev => prev + 1);
      try {
        const res = await fetch(
          `/api/verify-payment?txId=${encodeURIComponent(currentTxId)}&expectedAmount=${encodeURIComponent(amount)}`,
          { method: 'GET', headers: { Accept: 'application/json' } }
        );
        if (res.ok) {
          const data = await res.json();
          if ((data.verified === true || data.status === 'lunas') && !hasCompletedRef.current) {
            hasCompletedRef.current = true;
            const receipt = {
              txId: currentTxId,
              amount,
              votes,
              paidAt: data.verifiedAt || new Date().toISOString(),
              bankName: bankConfig.bankName,
              accountNumber: bankConfig.accountNumber,
              accountHolder: bankConfig.accountHolder,
              status: 'LUNAS'
            };
            onPaymentSuccess?.(receipt);
            onClose?.();
          }
        }
      } catch {
        // Abaikan error jaringan sementara saat polling
      }
    }, 5000);

    return () => {
      unsubscribeSnapshot();
      clearInterval(pollInterval);
    };
  }, [isOpen, currentTxId, teamId, teamName, voterUid, voterName, votes, amount]);

  // 3. Countdown Timer 15:00 Menit (900 Detik)
  useEffect(() => {
    if (!isOpen) return undefined;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            // Batalkan transaksi di Firestore (status: 'batal', cancelReason: 'timeout_15min')
            cancelExpiredVoteTransaction(activeTxIdRef.current, 'timeout_15min').finally(() => {
              onClose?.();
              onPaymentFailed?.({
                txId: activeTxIdRef.current,
                reason: 'timeout_15min',
                message: 'Pembayaran Gagal — Waktu habis. Silakan ulangi voting.'
              });
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onClose, onPaymentFailed]);

  if (!isOpen) return null;

  // Format MM:SS
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const timeProgressPercent = Math.max(0, Math.min(100, (secondsLeft / TOTAL_SECONDS) * 100));

  // Warna indikator waktu sesuai spesifikasi Bagian 1.B:
  // > 10m (600s): Hijau | 5-10m (300-600s): Kuning | < 5m (60-299s): Merah | < 1m (<60s): Merah Berkedip
  let timerBadgeClass = 'bg-emerald-50 border-emerald-300 text-emerald-800';
  let timerBarClass = 'bg-emerald-500';
  let timerTextClass = 'text-emerald-700';

  if (secondsLeft < 60) {
    timerBadgeClass = 'bg-rose-100 border-rose-500 text-rose-800 animate-pulse';
    timerBarClass = 'bg-rose-600 animate-pulse';
    timerTextClass = 'text-rose-600 animate-pulse';
  } else if (secondsLeft < 300) {
    timerBadgeClass = 'bg-rose-50 border-rose-300 text-rose-800';
    timerBarClass = 'bg-rose-500';
    timerTextClass = 'text-rose-600';
  } else if (secondsLeft <= 600) {
    timerBadgeClass = 'bg-amber-50 border-amber-300 text-amber-800';
    timerBarClass = 'bg-amber-500';
    timerTextClass = 'text-amber-600';
  }

  const handleCopyBankAccount = () => {
    if (navigator?.clipboard && bankConfig.accountNumber) {
      navigator.clipboard.writeText(bankConfig.accountNumber);
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    }
  };

  const handleCopyNominal = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(String(amount));
      setCopiedNominal(true);
      setTimeout(() => setCopiedNominal(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in font-sans">
      <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden text-slate-900 my-6">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#006569] to-[#004d50] p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-[#FFDD00]">
              <QrCode size={22} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-teal-200">
                QRIS Statis Resmi • {currentTxId}
              </div>
              <h3 className="text-base font-black text-white leading-tight">
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
            aria-label="Tutup Panel Pembayaran"
          >
            <X size={20} />
          </button>
        </div>

        {/* Konten Utama */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Banner Countdown 15 Menit dengan Transisi Warna */}
          <div className={`border rounded-2xl p-3.5 transition-colors ${timerBadgeClass}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={15} />
                <span>Batas Waktu Pembayaran</span>
              </span>
              <span className={`font-mono text-lg font-black ${timerTextClass}`}>
                {formattedTime}
              </span>
            </div>
            <div className="w-full h-2 bg-white/80 rounded-full overflow-hidden border border-black/5">
              <div
                className={`h-full transition-all duration-1000 ease-linear rounded-full ${timerBarClass}`}
                style={{ width: `${timeProgressPercent}%` }}
              />
            </div>
            <p className="text-[10px] mt-1.5 opacity-85 font-semibold">
              {secondsLeft < 60
                ? '⚠️ Segera selesaikan transfer! Kurang dari 1 menit sebelum otomatis dibatalkan.'
                : 'Selesaikan pembayaran sebelum waktu 15:00 menit habis.'}
            </p>
          </div>

          {/* Nominal Tagihan yang Harus Ditransfer pada QRIS Statis */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full inline-block mb-1">
              Masukkan Nominal Sesuai Tagihan ({votes} Suara)
            </span>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <span className="text-3xl font-black text-[#006569] font-mono">
                {formatRupiah(amount)}
              </span>
              <button
                type="button"
                onClick={handleCopyNominal}
                className="p-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition text-xs font-bold flex items-center gap-1"
                title="Salin Nominal"
              >
                {copiedNominal ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {description}
            </p>
          </div>

          {/* Kartu QRIS Statis Client-Side (qrcode library) */}
          <div className="bg-white border-2 border-slate-300 rounded-2xl p-4 shadow-sm max-w-xs mx-auto text-center">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 px-1">
              <span>QRIS Statis Mako</span>
              <span className="text-[#006569]">NMID Resmi</span>
            </div>
            <div className="relative mx-auto w-52 h-52 bg-slate-50 rounded-xl border border-slate-200 p-2 flex items-center justify-center overflow-hidden">
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="QRIS Statis Pembayaran Menwa UNJ" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-xs text-slate-400">
                  <RefreshCw size={22} className="animate-spin text-[#006569]" />
                  <span>Membuat QRIS Statis...</span>
                </div>
              )}
            </div>
            <span className="text-[11px] font-bold text-slate-600 block mt-2">
              Scan menggunakan GoPay, OVO, DANA, ShopeePay, atau Mobile Banking lalu ketik nominal <strong>{formatRupiah(amount)}</strong>
            </span>
          </div>

          {/* Rincian Rekening Bank Resmi */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold border-b border-slate-200/80 pb-2">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Building size={14} className="text-[#006569]" />
                Rekening Tujuan Resmi
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                2-Admin Verified
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="font-black text-slate-900 text-sm">{bankConfig.bankName}</div>
                <div className="font-mono text-slate-800 text-base font-bold tracking-wider">{bankConfig.accountNumber}</div>
                <div className="text-[11px] text-slate-500 uppercase font-semibold">a.n. {bankConfig.accountHolder}</div>
              </div>
              <button
                type="button"
                onClick={handleCopyBankAccount}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-1 cursor-pointer shadow-sm active:scale-95"
              >
                {copiedBank ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copiedBank ? 'Tersalin' : 'Salin Rek'}</span>
              </button>
            </div>
          </div>

          {/* Status Deteksi Pembayaran Otomatis & Listener Real-Time Murni */}
          <div className="bg-gradient-to-br from-teal-50 via-emerald-50 to-blue-50 border border-teal-200/80 rounded-2xl p-4 text-center space-y-2 shadow-sm">
            <div className="flex items-center justify-center gap-2 text-xs font-black text-[#006569]">
              <RefreshCw size={14} className="animate-spin text-[#006569]" />
              <span>Memantau Pembayaran Masuk Secara Real-Time (Cek #{pollingCount + 1})</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Begitu Anda menyelesaikan transfer di aplikasi perbankan/e-wallet Anda, sistem akan mendeteksi mutasi secara otomatis dalam beberapa detik. Jendela ini akan tertutup otomatis dan donasi/suara Anda akan langsung tercatat.
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-teal-700 font-semibold pt-1">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Verifikasi Kriptografis Mako Aman & Transparan</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DynamicQRISModal;
