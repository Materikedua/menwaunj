import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Phone,
  HelpCircle,
  Eye as GuestEye,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Building2,
  Calendar,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react';
import BorderBeam from './ui/BorderBeam.jsx';
import { setOfficialSecurityPin, requestOfficialPinReset } from '../firebase.js';

/**
 * OfficialSecurityGate
 * Multi-Factor / 6-Digit PIN Protection Lockscreen Gate untuk Subdomain Portal Official (/official/:schoolSlug)
 * 
 * Mencegah kebocoran data kontingen akibat nomor WhatsApp yang terlihat di grup publik:
 * 1. Verifikasi PIN 6-Digit untuk Akses Penuh (Full Edit Access)
 * 2. Inisiasi PIN Pertama Kali (Setup Wizard) jika portal belum memiliki PIN
 * 3. Mode Tamu / Peninjau (Read-Only) bagi penonton, suporter, atau kepsek
 * 4. Brute-Force Rate Limiting (5x salah coba = cooldown 10 menit)
 * 5. Fitur Bantuan Lupa PIN terhubung langsung ke Piket Mako Menwa UNJ via WhatsApp
 */
export function OfficialSecurityGate({
  portalData,
  activeSlug,
  onUnlock,
  onEnterGuestMode,
  hasAdminAccess,
  onAdminBypass,
  onCancel,
}) {
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Setup PIN pertama kali
  const [isSetupMode, setIsSetupMode] = useState(!portalData?.securityPin);
  const [phoneConfirmInput, setPhoneConfirmInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');

  // Brute force lockout state
  const lockoutKey = `menwa_lockout_${activeSlug}`;
  const attemptsKey = `menwa_attempts_${activeSlug}`;
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState(0);

  // Check lockout on mount and interval
  useEffect(() => {
    const checkLockout = () => {
      try {
        const storedLockout = localStorage.getItem(lockoutKey);
        if (storedLockout) {
          const lockoutUntil = parseInt(storedLockout, 10);
          const now = Date.now();
          if (now < lockoutUntil) {
            setIsLockedOut(true);
            setLockoutRemainingSeconds(Math.ceil((lockoutUntil - now) / 1000));
            return;
          } else {
            localStorage.removeItem(lockoutKey);
            localStorage.removeItem(attemptsKey);
            setIsLockedOut(false);
            setLockoutRemainingSeconds(0);
          }
        }
      } catch {
        /* ignore localStorage quota/disabled errors */
      }
    };

    checkLockout();
    const timer = setInterval(checkLockout, 1000);
    return () => clearInterval(timer);
  }, [lockoutKey, attemptsKey]);

  // Handler Verifikasi PIN Masuk
  const handleVerifyPin = (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isLockedOut) {
      setErrorMsg(`Sistem terkunci sementara untuk keamanan. Coba lagi dalam ${lockoutRemainingSeconds} detik.`);
      return;
    }

    const cleanPin = pinInput.trim();
    if (cleanPin.length !== 6 || !/^[0-9]{6}$/.test(cleanPin)) {
      setErrorMsg('PIN Keamanan wajib tepat 6 angka numerik (0-9).');
      return;
    }

    setSubmitting(true);
    const expectedPin = String(portalData?.securityPin || '').trim();

    if (expectedPin && cleanPin === expectedPin) {
      // Sukses: reset percobaan
      try {
        localStorage.removeItem(lockoutKey);
        localStorage.removeItem(attemptsKey);
      } catch { /* ignore */ }
      setSuccessMsg('Verifikasi berhasil! Membuka portal kontingen...');
      setTimeout(() => {
        onUnlock(cleanPin);
      }, 400);
    } else {
      // Gagal: hitung percobaan
      let currentAttempts = 0;
      try {
        currentAttempts = parseInt(localStorage.getItem(attemptsKey) || '0', 10) + 1;
        localStorage.setItem(attemptsKey, String(currentAttempts));
      } catch { /* ignore */ }

      if (currentAttempts >= 5) {
        const lockUntil = Date.now() + 10 * 60 * 1000; // 10 menit
        try {
          localStorage.setItem(lockoutKey, String(lockUntil));
        } catch { /* ignore */ }
        setIsLockedOut(true);
        setLockoutRemainingSeconds(600);
        setErrorMsg('Terlalu banyak percobaan salah (5x). Akses dikunci sementara selama 10 menit demi keamanan data kontingen.');
      } else {
        const remaining = 5 - currentAttempts;
        setErrorMsg(`PIN Keamanan salah! Sisa percobaan: ${remaining} kali.`);
      }
      setSubmitting(false);
    }
  };

  // Handler Aktivasi PIN Pertama Kali
  const handleSetupFirstPin = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validasi konfirmasi nomor WhatsApp
    const registeredPhone = String(portalData?.whatsappNumber || '').replace(/\D/g, '');
    const enteredPhone = phoneConfirmInput.replace(/\D/g, '');

    // Cek nomor WA jika portal sudah memiliki nomor terdaftar
    if (registeredPhone && registeredPhone.length >= 8) {
      const lastDigitsReg = registeredPhone.slice(-6);
      const lastDigitsEntered = enteredPhone.slice(-6);
      if (lastDigitsReg !== lastDigitsEntered) {
        setErrorMsg('Nomor WhatsApp konfirmasi tidak cocok dengan nomor official terdaftar kontingen ini.');
        return;
      }
    }

    if (newPinInput.length !== 6 || !/^[0-9]{6}$/.test(newPinInput)) {
      setErrorMsg('PIN Baru wajib tepat 6 angka (0-9).');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setErrorMsg('Konfirmasi PIN tidak cocok dengan PIN Baru.');
      return;
    }

    setSubmitting(true);
    try {
      await setOfficialSecurityPin(activeSlug, newPinInput, 'Official (Inisiasi Pertama)');
      setSuccessMsg('PIN Keamanan 6 digit berhasil diaktifkan! Membuka akses portal...');
      setTimeout(() => {
        onUnlock(newPinInput);
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengaktifkan PIN Keamanan.');
      setSubmitting(false);
    }
  };

  // Handler Lupa PIN -> Request Reset & Open WhatsApp ke Mako
  const handleForgotPin = async () => {
    const schoolName = portalData?.schoolName || 'Sekolah Peserta';
    const noUrut = portalData?.nomorUrut || 'KONTINGEN-01';

    try {
      await requestOfficialPinReset(activeSlug, `Permintaan reset PIN oleh Official ${schoolName}`);
    } catch { /* ignore error */ }

    const message = `Halo Piket Mako Satuan Menwa UNJ,\n\nKami Official dari:\n- Sekolah: ${schoolName}\n- No. Urut: ${noUrut}\n- Subdomain: /official/${activeSlug}\n\nKami memerlukan bantuan RESET PIN KEAMANAN Portal Official GERANAT VII 2026 karena lupa PIN. Mohon verifikasi identitas kami.\n\nTerima kasih.\nWidya Castrena Dharma Siddha!`;

    const waUrl = `https://wa.me/6285213251025?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setErrorMsg('Permintaan reset PIN telah dicatat dan notifikasi dikirim ke Komando Mako. Silakan lanjutkan pesan WhatsApp untuk verifikasi kilat.');
  };

  const schoolName = portalData?.schoolName || 'Kontingen Sekolah';
  const schoolLogo = portalData?.schoolProfile?.logoDataUrl || '';
  const nomorUrut = portalData?.nomorUrut || 'KONTINGEN';
  const hasExistingPin = Boolean(portalData?.securityPin);

  return (
    <div className="relative min-h-[90vh] py-8 sm:py-14 px-3 sm:px-6 font-sans flex flex-col items-center justify-center">
      {/* Decorative Light Ambience */}
      <div className="pointer-events-none absolute top-12 left-1/4 w-96 h-96 bg-[#FFDD00]/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-12 right-1/4 w-96 h-96 bg-[#006569]/15 rounded-full blur-3xl" />

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-lg rounded-[2.5rem] bg-white border border-slate-200/90 shadow-[0_25px_70px_-15px_rgba(9,45,50,0.18)] p-6 sm:p-10 overflow-hidden text-slate-900">
        
        {/* Animated Laser BorderBeam */}
        <BorderBeam
          duration={5}
          borderWidth={2.5}
          borderRadius={40}
          colorFrom="#FFDD00"
          colorTo="#006569"
        />

        {/* Header Identitas Kontingen */}
        <div className="text-center relative z-10">
          {/* Logo Badge (Logo Sekolah atau Menwa UNJ) */}
          <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-[#006569]/30 p-2 flex items-center justify-center shadow-md overflow-hidden relative">
            {schoolLogo ? (
              <img src={schoolLogo} alt={schoolName} className="w-full h-full object-contain" />
            ) : (
              <img src="/logo-menwa-unj.png" alt="Menwa UNJ" className="w-full h-full object-contain" />
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#006569] text-[#FFDD00] flex items-center justify-center text-[10px] font-black shadow-xs">
              <ShieldCheck size={13} />
            </div>
          </div>

          {/* Nomor Urut & Status */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#006569] text-[10px] font-black uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006569] animate-pulse" />
            <span>{nomorUrut} • GERANAT VII 2026</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#092D32] tracking-tight">
            {schoolName}
          </h2>

          <p className="mt-1.5 text-xs text-slate-500 max-w-xs mx-auto">
            Subdomain Resmi: <code className="font-mono text-[#006569] font-bold">/official/{activeSlug}</code>
          </p>
        </div>

        {/* Security Alert / Status Pill */}
        <div className="my-6 rounded-2xl bg-amber-50/80 border border-amber-200/90 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
          <Shield size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-left text-[11px] leading-relaxed">
            <strong>Proteksi Keamanan 6-Digit PIN:</strong> Data biodata pasukan, berkas, dan kartu kontingen Anda dikunci secara privat agar tidak dapat diubah oleh nomor dari grup WhatsApp lain.
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-5 rounded-2xl border border-rose-300 bg-rose-50 p-3.5 text-rose-800 text-xs flex items-start gap-2.5 animate-fade-in">
            <AlertTriangle size={17} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="font-bold leading-snug">{errorMsg}</div>
          </div>
        )}

        {/* Success Notification */}
        {successMsg && (
          <div className="mb-5 rounded-2xl border border-emerald-300 bg-emerald-50 p-3.5 text-emerald-800 text-xs flex items-start gap-2.5 animate-fade-in">
            <CheckCircle2 size={17} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="font-bold leading-snug">{successMsg}</div>
          </div>
        )}

        {/* Lockout Notice */}
        {isLockedOut && (
          <div className="mb-5 rounded-2xl border border-red-400 bg-red-100 p-4 text-center">
            <div className="text-red-900 font-black text-sm">AKSES SEMENTARA DIKUNCI</div>
            <div className="text-xs text-red-800 mt-1">
              Batas percobaan gagal terlampaui. Tunggu: <strong className="font-mono text-sm">{lockoutRemainingSeconds} detik</strong>
            </div>
          </div>
        )}

        {/* MODE A: MASUKKAN PIN KEAMANAN */}
        {!isSetupMode && hasExistingPin && (
          <form onSubmit={handleVerifyPin} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                  PIN KEAMANAN OFFICIAL (6 DIGIT)
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-[11px] font-bold text-[#006569] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {showPin ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showPin ? 'Sembunyikan' : 'Tampilkan'}</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  disabled={isLockedOut || submitting}
                  value={pinInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setPinInput(val);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="••••••"
                  autoFocus
                  className="w-full text-center text-3xl font-mono tracking-[0.5em] py-3.5 px-4 rounded-2xl border-2 border-slate-300 focus:border-[#006569] focus:ring-4 focus:ring-[#006569]/15 text-[#092D32] bg-slate-50 focus:bg-white transition font-black disabled:opacity-50"
                />
              </div>

              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                <span>Masukkan 6 angka rahasia official</span>
                <button
                  type="button"
                  onClick={handleForgotPin}
                  className="text-amber-600 hover:text-amber-700 font-bold hover:underline cursor-pointer"
                >
                  Lupa PIN?
                </button>
              </div>
            </div>

            {/* Tombol Verifikasi & Masuk */}
            <button
              type="submit"
              disabled={isLockedOut || submitting || pinInput.length !== 6}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#006569] to-[#092D32] hover:opacity-95 text-[#FFDD00] font-black text-sm uppercase tracking-wider shadow-lg shadow-teal-900/20 flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50 active:scale-95"
            >
              {submitting ? (
                <>
                  <RefreshCw size={17} className="animate-spin text-[#FFDD00]" />
                  <span>Memverifikasi PIN...</span>
                </>
              ) : (
                <>
                  <Unlock size={17} className="text-[#FFDD00]" />
                  <span>Buka Akses Penuh Official</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* MODE B: AKTIVASI PIN PERTAMA KALI (SETUP WIZARD) */}
        {(isSetupMode || !hasExistingPin) && (
          <form onSubmit={handleSetupFirstPin} className="space-y-4">
            <div className="rounded-2xl bg-blue-50/80 border border-blue-200 p-3 text-xs text-blue-900">
              <div className="font-bold mb-1">Inisiasi PIN Keamanan Kontingen:</div>
              Portal ini belum memiliki PIN. Silakan masukkan nomor WhatsApp official dan tentukan 6 angka PIN rahasia untuk mengamankan data kontingen Anda.
            </div>

            {/* Konfirmasi WhatsApp */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5">
                KONFIRMASI NOMOR WHATSAPP OFFICIAL
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 focus-within:bg-white focus-within:border-[#006569] transition">
                <span className="text-[#059669] font-black text-xs">+62</span>
                <input
                  type="tel"
                  value={phoneConfirmInput}
                  onChange={(e) => setPhoneConfirmInput(e.target.value)}
                  placeholder="81234567890 (Sesuai yang didaftarkan)"
                  className="w-full bg-transparent text-xs font-bold text-[#092D32] placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Input PIN Baru */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                  BUAT PIN (6 DIGIT)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Contoh: 261026"
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 font-mono text-center font-black tracking-widest text-sm focus:border-[#006569] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                  ULANGI PIN (6 DIGIT)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Ulangi PIN"
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 font-mono text-center font-black tracking-widest text-sm focus:border-[#006569] focus:outline-none"
                />
              </div>
            </div>

            {/* Tombol Simpan & Aktifkan PIN */}
            <button
              type="submit"
              disabled={submitting || newPinInput.length !== 6 || confirmPinInput.length !== 6}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#006569] to-[#092D32] hover:opacity-95 text-[#FFDD00] font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
            >
              {submitting ? (
                <span>Mengaktifkan PIN...</span>
              ) : (
                <>
                  <KeyRound size={15} />
                  <span>Aktifkan PIN & Buka Portal</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Divider Atau */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Atau Opsi Lainnya
          </span>
        </div>

        {/* MODE C: MODE TAMU / PENINJAU (READ-ONLY) */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onEnterGuestMode}
            className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200/90 text-slate-800 font-bold text-xs flex items-center justify-between transition cursor-pointer border border-slate-200"
          >
            <span className="flex items-center gap-2.5">
              <GuestEye size={16} className="text-slate-600" />
              <span>Masuk sebagai <strong>Mode Tamu (Hanya Lihat)</strong></span>
            </span>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              Read-Only
            </span>
          </button>

          {/* Admin Command Center Bypass */}
          {hasAdminAccess && (
            <button
              type="button"
              onClick={onAdminBypass}
              className="w-full py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-between transition cursor-pointer border border-amber-300"
            >
              <span className="flex items-center gap-2">
                <Shield size={16} className="text-amber-600" />
                <span>Bypass Komando (Hak Akses Mako Admin)</span>
              </span>
              <span className="text-[10px] font-black uppercase text-amber-700">
                Superadmin
              </span>
            </button>
          )}

          {/* Tombol Kembali / Ganti Nomor WA */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2.5 text-center text-xs font-bold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
            >
              Kembali ke Pencarian Sekolah / Cari Nomor Lain
            </button>
          )}
        </div>

        {/* Footer Subdomain */}
        <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
          Resimen Mahasiswa Jayakarta Satuan UNJ • Widya Castrena Dharma Siddha
        </div>
      </div>
    </div>
  );
}

export default OfficialSecurityGate;
