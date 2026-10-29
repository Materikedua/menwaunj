import React, { useState, useEffect } from 'react';
import {
  Shield,
  Unlock,
  KeyRound,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Eye as GuestEye,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';
import { setOfficialSecurityPin, requestOfficialPinReset } from '../firebase.js';

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

  const [isSetupMode, setIsSetupMode] = useState(!portalData?.securityPin);
  const [phoneConfirmInput, setPhoneConfirmInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');

  const lockoutKey = `menwa_lockout_${activeSlug}`;
  const attemptsKey = `menwa_attempts_${activeSlug}`;
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState(0);

  useEffect(() => {
    setIsSetupMode(!portalData?.securityPin);
  }, [portalData?.securityPin]);

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
        /* ignore */
      }
    };

    checkLockout();
    const timer = setInterval(checkLockout, 1000);
    return () => clearInterval(timer);
  }, [lockoutKey, attemptsKey]);

  const handleVerifyPin = (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isLockedOut) {
      setErrorMsg(
        `Sistem terkunci sementara untuk keamanan. Coba lagi dalam ${lockoutRemainingSeconds} detik.`
      );
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
      try {
        localStorage.removeItem(lockoutKey);
        localStorage.removeItem(attemptsKey);
      } catch {
        /* ignore */
      }
      setSuccessMsg('Verifikasi berhasil! Membuka portal kontingen...');
      setTimeout(() => {
        onUnlock(cleanPin);
      }, 300);
    } else {
      let currentAttempts = 0;
      try {
        currentAttempts = parseInt(localStorage.getItem(attemptsKey) || '0', 10) + 1;
        localStorage.setItem(attemptsKey, String(currentAttempts));
      } catch {
        /* ignore */
      }

      if (currentAttempts >= 5) {
        const lockUntil = Date.now() + 10 * 60 * 1000;
        try {
          localStorage.setItem(lockoutKey, String(lockUntil));
        } catch {
          /* ignore */
        }
        setIsLockedOut(true);
        setLockoutRemainingSeconds(600);
        setErrorMsg(
          'Terlalu banyak percobaan salah (5x). Akses dikunci sementara selama 10 menit demi keamanan data kontingen.'
        );
      } else {
        const remaining = 5 - currentAttempts;
        setErrorMsg(`PIN Keamanan salah! Sisa percobaan: ${remaining} kali.`);
      }
      setSubmitting(false);
    }
  };

  const handleSetupFirstPin = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const registeredPhone = String(portalData?.whatsappNumber || '').replace(/\D/g, '');
    const enteredPhone = phoneConfirmInput.replace(/\D/g, '');

    if (registeredPhone && registeredPhone.length >= 8) {
      const lastDigitsReg = registeredPhone.slice(-6);
      const lastDigitsEntered = enteredPhone.slice(-6);
      if (lastDigitsReg !== lastDigitsEntered) {
        setErrorMsg(
          'Nomor WhatsApp konfirmasi tidak cocok dengan nomor official terdaftar kontingen ini.'
        );
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
      }, 400);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengaktifkan PIN Keamanan.');
      setSubmitting(false);
    }
  };

  const handleForgotPin = async () => {
    const schoolName = portalData?.schoolName || 'Sekolah Peserta';
    const noUrut = portalData?.nomorUrut || 'KONTINGEN-01';

    try {
      await requestOfficialPinReset(
        activeSlug,
        `Permintaan reset PIN oleh Official ${schoolName}`
      );
    } catch {
      /* ignore */
    }

    setSuccessMsg(
      `Permintaan reset PIN untuk ${schoolName} (${noUrut}) telah dikirim ke Mako Command Center. Admin segera memverifikasi dan membuka kunci PIN Anda.`
    );
  };

  const schoolName = portalData?.schoolName || 'Kontingen Sekolah';
  const schoolLogo = portalData?.schoolProfile?.logoDataUrl || '';
  const nomorUrut = portalData?.nomorUrut || 'KONTINGEN';
  const hasExistingPin = Boolean(portalData?.securityPin);

  return (
    <div className="relative min-h-[86vh] py-8 sm:py-12 px-3 sm:px-6 font-sans flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#EEF5F6] via-[#F5F8F6] to-[#F9FBFA]">
      {/* Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />

      {/* ======================================================================
          KARTU KONTAINER LOGIN (FLOATING 3D CUSHION CARD)
          ====================================================================== */}
      <div className="relative z-10 w-full max-w-md rounded-[2.75rem] bg-gradient-to-br from-[#FFFFFF] via-[#F6FAF9] to-[#EEF5F4] border-2 border-white/85 shadow-[12px_12px_35px_rgba(9,45,50,0.12),-12px_-12px_35px_rgba(255,255,255,0.96)] p-7 sm:p-10 overflow-hidden text-[#092D32]">
        {/* Tombol Exit / Tutup Cepat di Pojok Kanan Atas Kartu (Tanpa Perlu Scroll) */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            title="Keluar / Ganti WhatsApp Kontingen"
            aria-label="Keluar / Ganti WhatsApp Kontingen"
            className="absolute top-4 sm:top-5 right-4 sm:right-5 w-9 h-9 rounded-2xl neu-btn text-slate-500 hover:text-rose-600 flex items-center justify-center cursor-pointer shadow-xs transition hover:scale-110 active:scale-95 z-30"
          >
            <X size={17} />
          </button>
        )}

        {/* Tile Logo 3D Elevated di Bagian Atas */}
        <div className="text-center relative z-10">
          <div className="mx-auto mb-5 w-24 h-24 rounded-3xl neu-logo-tile p-3 flex items-center justify-center relative overflow-hidden">
            <div className="pointer-events-none absolute -top-6 -left-6 w-16 h-16 bg-white/85 rounded-full blur-md" />
            {schoolLogo ? (
              <img
                src={schoolLogo}
                alt={schoolName}
                className="w-full h-full object-contain relative z-10"
              />
            ) : (
              <img
                src="/logo-menwa-unj.png"
                alt="Menwa UNJ"
                className="w-full h-full object-contain relative z-10"
              />
            )}
            <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-[#006569] text-[#FFDD00] flex items-center justify-center shadow-xs z-20">
              <ShieldCheck size={13} />
            </div>
          </div>

          <div className="text-[11px] font-mono font-black text-[#006569] uppercase tracking-widest mb-1">
            {nomorUrut} · /official/{activeSlug}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#092D32] tracking-tight">
            {schoolName}
          </h2>

          <p className="mt-1 text-xs text-slate-500 font-semibold max-w-xs mx-auto">
            {isSetupMode || !hasExistingPin
              ? 'Konfirmasi nomor WhatsApp & buat 6-Digit PIN keamanan kontingen'
              : 'Masukkan 6-Digit PIN kredensial official untuk melanjutkan'}
          </p>
        </div>

        {/* Alert Banners */}
        {errorMsg && (
          <div className="mt-5 rounded-2xl border border-rose-300 bg-rose-50 p-3.5 text-rose-800 text-xs flex items-start gap-2.5 animate-fade-in">
            <AlertTriangle size={17} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="font-bold leading-snug text-left">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="mt-5 rounded-2xl border border-emerald-300 bg-emerald-50 p-3.5 text-emerald-800 text-xs flex items-start gap-2.5 animate-fade-in">
            <CheckCircle2 size={17} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="font-bold leading-snug text-left">{successMsg}</div>
          </div>
        )}

        {isLockedOut && (
          <div className="mt-5 rounded-2xl border border-red-400 bg-red-100 p-4 text-center">
            <div className="text-red-900 font-black text-sm">AKSES SEMENTARA DIKUNCI</div>
            <div className="text-xs text-red-800 mt-1">
              Batas percobaan gagal terlampaui. Tunggu:{' '}
              <strong className="font-mono text-sm tabular-nums">
                {lockoutRemainingSeconds} detik
              </strong>
            </div>
          </div>
        )}

        {/* ====================================================================
            MODE 1: VERIFIKASI 6-DIGIT PIN KEAMANAN (SOLID WHITE FIELD + BLACK TEXT)
            ==================================================================== */}
        {!isSetupMode && hasExistingPin && (
          <form onSubmit={handleVerifyPin} className="mt-6 space-y-4">
            <div className="bg-white border-2 border-slate-300 focus-within:border-[#006569] focus-within:ring-2 focus-within:ring-[#006569]/20 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-inner transition-all">
              <Lock size={19} className="text-[#006569] shrink-0" />
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
                placeholder="6-Digit PIN Official"
                autoFocus
                style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
                className="w-full bg-white text-black font-mono font-black text-lg sm:text-xl tracking-[0.35em] text-center placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:font-semibold placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-slate-500 hover:text-[#006569] p-1 cursor-pointer shrink-0"
                title={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between px-1 text-xs">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <Shield size={13} className="text-[#006569]" /> Proteksi Enkripsi PIN
              </span>
              <button
                type="button"
                onClick={handleForgotPin}
                className="text-[#006569] hover:underline font-bold cursor-pointer"
              >
                Lupa PIN?
              </button>
            </div>

            {/* Tombol CTA Login Utama (Pill 3D + Bulatan Panah Kanan) */}
            <button
              type="submit"
              disabled={isLockedOut || submitting || pinInput.length !== 6}
              className="w-full py-3.5 pl-6 pr-3.5 rounded-full neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white font-black text-sm sm:text-base tracking-wide flex items-center justify-between cursor-pointer disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
            >
              <span className="mx-auto pl-6 flex items-center gap-2">
                {submitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin text-[#FFDD00]" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <span>Buka Konsol Official</span>
                )}
              </span>
              <span className="w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-[#FFDD00] shrink-0 shadow-inner">
                <ArrowRight size={17} />
              </span>
            </button>
          </form>
        )}

        {/* ====================================================================
            MODE 2: INISIASI PIN PERTAMA KALI (SOLID WHITE FIELDS + BLACK TEXT)
            ==================================================================== */}
        {(isSetupMode || !hasExistingPin) && (
          <form onSubmit={handleSetupFirstPin} className="mt-6 space-y-3.5 text-left">
            <div className="bg-white border-2 border-slate-300 focus-within:border-[#006569] focus-within:ring-2 focus-within:ring-[#006569]/20 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-inner transition-all">
              <Phone size={18} className="text-[#006569] shrink-0" />
              <span className="text-[#006569] font-black text-sm select-none">+62</span>
              <input
                type="tel"
                value={phoneConfirmInput}
                onChange={(e) => setPhoneConfirmInput(e.target.value)}
                placeholder="Konfirmasi WhatsApp Official"
                style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
                className="w-full bg-white text-black font-mono font-bold text-sm sm:text-base placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border-2 border-slate-300 focus-within:border-[#006569] focus-within:ring-2 focus-within:ring-[#006569]/20 rounded-2xl px-3.5 py-3 flex items-center gap-2 shadow-inner transition-all">
                <KeyRound size={16} className="text-[#006569] shrink-0" />
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={6}
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="PIN 6 Digit"
                  style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
                  className="w-full bg-white text-black font-mono font-black text-sm tracking-widest text-center placeholder:font-sans placeholder:tracking-normal placeholder:text-xs placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div className="bg-white border-2 border-slate-300 focus-within:border-[#006569] focus-within:ring-2 focus-within:ring-[#006569]/20 rounded-2xl px-3.5 py-3 flex items-center gap-2 shadow-inner transition-all">
                <Lock size={16} className="text-[#006569] shrink-0" />
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmPinInput}
                  onChange={(e) =>
                    setConfirmPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  placeholder="Ulangi PIN"
                  style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
                  className="w-full bg-white text-black font-mono font-black text-sm tracking-widest text-center placeholder:font-sans placeholder:tracking-normal placeholder:text-xs placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || newPinInput.length !== 6 || confirmPinInput.length !== 6}
              className="w-full py-3.5 pl-6 pr-3.5 rounded-full neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white font-black text-sm sm:text-base tracking-wide flex items-center justify-between cursor-pointer disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
            >
              <span className="mx-auto pl-6">
                {submitting ? 'Mengaktifkan PIN...' : 'Aktifkan PIN & Masuk'}
              </span>
              <span className="w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-[#FFDD00] shrink-0 shadow-inner">
                <ArrowRight size={17} />
              </span>
            </button>
          </form>
        )}

        {/* Pemisah "ATAU MASUK MELALUI" */}
        <div className="flex items-center gap-3 my-6">
          <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-slate-300/80 to-slate-300/80" />
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
            ATAU MASUK MELALUI
          </span>
          <div className="h-[1.5px] flex-1 bg-gradient-to-l from-transparent via-slate-300/80 to-slate-300/80" />
        </div>

        {/* Deretan Tombol Aksi Cepat & Sosial 3D (w-14 h-14 rounded-2xl) */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={onEnterGuestMode}
            title="Masuk Mode Tamu (Hanya Baca / Read-Only)"
            className="neu-social-btn cursor-pointer text-[#092D32] hover:text-[#006569]"
          >
            <GuestEye size={22} className="stroke-[2.3]" />
          </button>

          {hasAdminAccess && (
            <button
              type="button"
              onClick={onAdminBypass}
              title="Bypass Komando (Akses Penuh Mako Superadmin)"
              className="neu-social-btn cursor-pointer text-amber-600"
            >
              <Shield size={22} className="stroke-[2.4]" />
            </button>
          )}

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              title="Kembali / Ganti Nomor WhatsApp Kontingen"
              className="neu-social-btn cursor-pointer text-slate-600 hover:text-[#092D32]"
            >
              <ArrowLeft size={22} className="stroke-[2.3]" />
            </button>
          )}
        </div>

        <div className="mt-4 text-center space-y-1">
          <button
            type="button"
            onClick={onEnterGuestMode}
            className="text-xs font-black text-[#006569] hover:underline cursor-pointer"
          >
            Lanjutkan sebagai Mode Tamu (Read-Only) →
          </button>
          <div className="pt-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
            MENWA UNJ · PORTAL OFFICIAL TERVERIFIKASI
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfficialSecurityGate;