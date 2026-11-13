import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  AlertTriangle,
  ArrowLeft,
  Clock,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import {
  getCommandLockoutStatus,
  recordCommandAuthFailure,
  createCommandAuthSession,
  getValidCommandAuthSession,
  touchCommandAuthSession,
  clearCommandAuthSession,
  verifyCommandAccessCode,
  isHoneypotTriggered,
  sanitizeInput,
  type CommandAuthSession,
  type CommandLockoutStatus,
} from '../../utils/security';
import { navigate } from '../../lib/router.jsx';

export interface MakoAuthGateRenderContext {
  session: CommandAuthSession;
  remainingSessionSeconds: number;
  handleLogout: () => void;
}

interface MakoAuthGateProps {
  children: (ctx: MakoAuthGateRenderContext) => React.ReactNode;
  firebaseUser?: { email?: string | null; displayName?: string | null } | null;
  isAuthorizedFirebaseOfficer?: boolean;
  firebaseRoleLabel?: string;
  onFirebaseGoogleSignIn?: () => Promise<{ email?: string | null; displayName?: string | null } | null | void>;
  onFirebaseEmailSignIn?: (
    email: string,
    password: string
  ) => Promise<{ email?: string | null; displayName?: string | null } | null | void>;
  onExternalSessionSync?: (session: CommandAuthSession | null) => void;
}

function formatDurationMmSs(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const MakoAuthGate: React.FC<MakoAuthGateProps> = ({
  children,
  firebaseUser,
  isAuthorizedFirebaseOfficer = false,
  firebaseRoleLabel = 'PERWIRA_KOMANDO',
  onFirebaseGoogleSignIn,
  onFirebaseEmailSignIn,
  onExternalSessionSync,
}) => {
  const [session, setSession] = useState<CommandAuthSession | null>(() =>
    getValidCommandAuthSession()
  );
  const [lockout, setLockout] = useState<CommandLockoutStatus>(() =>
    getCommandLockoutStatus()
  );
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  const [authMethod, setAuthMethod] = useState<'kode_piket' | 'sso_perwira'>('kode_piket');
  const [officerName, setOfficerName] = useState<string>('Perwira Piket G.107');
  const [accessCode, setAccessCode] = useState<string>('');
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [honeypotWebsite, setHoneypotWebsite] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [expiredNotice, setExpiredNotice] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Sinkronisasi sesi ke canvasStore induk bila tersedia
  useEffect(() => {
    if (onExternalSessionSync) {
      onExternalSessionSync(session);
    }
  }, [session, onExternalSessionSync]);

  // Detak 1 detik untuk memantau sisa kunci (lockout) & kedaluwarsa sesi tidak aktif (30 menit)
  useEffect(() => {
    const interval = window.setInterval(() => {
      const currentNow = Date.now();
      setNowMs(currentNow);
      setLockout(getCommandLockoutStatus(currentNow));

      setSession((prevSession) => {
        const valid = getValidCommandAuthSession(currentNow);
        if (prevSession && !valid) {
          setExpiredNotice(
            'Sesi komando telah berakhir otomatis demi keamanan karena tidak ada aktivitas selama 30 menit.'
          );
        }
        return valid;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  // Perpanjang masa aktif sesi saat perwira berinteraksi di dalam /mako-ops (throttled tiap 15 detik)
  useEffect(() => {
    if (!session) return;
    let lastTouch = 0;
    const handleActivity = () => {
      const ts = Date.now();
      if (ts - lastTouch > 15000) {
        lastTouch = ts;
        const refreshed = touchCommandAuthSession(ts);
        if (refreshed) {
          setSession(refreshed);
        }
      }
    };
    window.addEventListener('pointerdown', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [session]);

  const handleLogout = useCallback(() => {
    clearCommandAuthSession();
    setSession(null);
    setAccessCode('');
    setLoginPassword('');
    setErrorMsg('');
  }, []);

  const handleAccessCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setExpiredNotice('');

    if (isHoneypotTriggered(honeypotWebsite)) {
      const nextLock = recordCommandAuthFailure();
      setLockout(nextLock);
      setErrorMsg('Permintaan ditolak oleh sistem proteksi otomatis.');
      return;
    }

    const currentLock = getCommandLockoutStatus();
    if (currentLock.isLocked) {
      setLockout(currentLock);
      setErrorMsg(
        `Gerbang Komando dikunci sementara. Silakan tunggu ${formatDurationMmSs(
          currentLock.remainingLockoutSeconds
        )}.`
      );
      return;
    }

    const cleanOfficer = sanitizeInput(officerName, 80) || 'Perwira Piket Mako';
    const isValid = verifyCommandAccessCode(accessCode);

    if (!isValid) {
      const updatedLock = recordCommandAuthFailure();
      setLockout(updatedLock);
      setAccessCode('');
      if (updatedLock.isLocked) {
        setErrorMsg(
          `Batas 5 percobaan gagal terlampaui. Akses dikunci selama ${formatDurationMmSs(
            updatedLock.remainingLockoutSeconds
          )}.`
        );
      } else {
        setErrorMsg(
          `Kode otorisasi tidak valid. Sisa kuota percobaan sebelum penguncian: ${updatedLock.remainingAttempts} kali.`
        );
      }
      return;
    }

    const created = createCommandAuthSession({
      email: 'piket.mako@menwaunj.or.id',
      officerName: cleanOfficer,
      role: 'STAF_KOMANDO_G107',
    });
    setLockout(getCommandLockoutStatus());
    setAccessCode('');
    setSession(created);
  };

  const handleAuthorizedSsoOneClick = () => {
    if (!firebaseUser?.email || !isAuthorizedFirebaseOfficer) return;
    const currentLock = getCommandLockoutStatus();
    if (currentLock.isLocked) {
      setLockout(currentLock);
      return;
    }
    const created = createCommandAuthSession({
      email: firebaseUser.email,
      officerName: firebaseUser.displayName || 'Perwira Komando UNJ',
      role: firebaseRoleLabel || 'PERWIRA_KOMANDO',
    });
    setSession(created);
  };

  const handleGoogleLoginClick = async () => {
    if (!onFirebaseGoogleSignIn) return;
    setErrorMsg('');
    setExpiredNotice('');
    const currentLock = getCommandLockoutStatus();
    if (currentLock.isLocked) {
      setLockout(currentLock);
      return;
    }
    setSubmitting(true);
    try {
      const logged = await onFirebaseGoogleSignIn();
      if (logged && logged.email) {
        const em = logged.email.toLowerCase();
        const allowed =
          em === 'unjmenwa@gmail.com' ||
          em === 'rafflysyahpoetra@gmail.com' ||
          isAuthorizedFirebaseOfficer;
        if (!allowed) {
          const updatedLock = recordCommandAuthFailure();
          setLockout(updatedLock);
          setErrorMsg(
            `Akun ${logged.email} tidak terdaftar dalam daftar otorisasi RBAC Komando. Sisa percobaan: ${updatedLock.remainingAttempts} kali.`
          );
          return;
        }
        const created = createCommandAuthSession({
          email: logged.email,
          officerName: logged.displayName || 'Perwira Komando',
          role: em === 'unjmenwa@gmail.com' ? 'SUPERADMIN' : firebaseRoleLabel,
        });
        setSession(created);
      }
    } catch {
      const updatedLock = recordCommandAuthFailure();
      setLockout(updatedLock);
      setErrorMsg(
        `Autentikasi Google dibatalkan atau gagal. Sisa kuota percobaan: ${updatedLock.remainingAttempts} kali.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onFirebaseEmailSignIn) return;
    setErrorMsg('');
    setExpiredNotice('');

    if (isHoneypotTriggered(honeypotWebsite)) {
      setLockout(recordCommandAuthFailure());
      return;
    }

    const currentLock = getCommandLockoutStatus();
    if (currentLock.isLocked) {
      setLockout(currentLock);
      return;
    }

    setSubmitting(true);
    try {
      const cleanEmail = sanitizeInput(loginEmail, 120);
      const logged = await onFirebaseEmailSignIn(cleanEmail, loginPassword);
      if (logged && logged.email) {
        const created = createCommandAuthSession({
          email: logged.email,
          officerName: logged.displayName || 'Perwira Staf Adminu',
          role: firebaseRoleLabel || 'STAF_ADMINU',
        });
        setLoginPassword('');
        setSession(created);
      }
    } catch {
      const updatedLock = recordCommandAuthFailure();
      setLockout(updatedLock);
      setLoginPassword('');
      if (updatedLock.isLocked) {
        setErrorMsg(
          `Terlalu banyak percobaan gagal. Gerbang Komando dikunci selama ${formatDurationMmSs(
            updatedLock.remainingLockoutSeconds
          )}.`
        );
      } else {
        setErrorMsg(
          `Email atau kata sandi perwira tidak sah. Sisa kuota percobaan: ${updatedLock.remainingAttempts} kali.`
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (session) {
    const remainingSessionSeconds = Math.max(
      0,
      Math.ceil((session.expiresAt - nowMs) / 1000)
    );
    return <>{children({ session, remainingSessionSeconds, handleLogout })}</>;
  }

  return (
    <div className="dark min-h-screen bg-[#0b1114] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      <div
        className="absolute inset-0 bg-[radial-gradient(#006569_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#006569]/20 rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      <main className="w-full max-w-md bg-[#141c20] border border-[#006569]/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-5">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-xl bg-[#006569]/30 text-[#FFDD00] flex items-center justify-center border border-[#FFDD00]/40 shadow-lg mb-2">
            {lockout.isLocked ? <ShieldAlert size={28} className="text-rose-400" /> : <Lock size={26} />}
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-[#FFDD00] block">
            GERBANG OTORISASI KOMANDO • ZERO-TRUST
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Pusat Kendali Mako UNJ
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Akses terbatas khusus Perwira Komando, Staf Administrasi Umum, dan Petugas Piket Gedung G R.107.
          </p>
        </div>

        {/* Status Keamanan Rate-Limit & Sesi */}
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950/90 border border-white/10 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-teal-300">
            <ShieldCheck size={13} />
            Kuota Akses: {lockout.remainingAttempts}/5
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Clock size={12} />
            Auto-Lock Sesi: 30 Menit
          </span>
        </div>

        {expiredNotice && (
          <div
            role="status"
            className="p-3 rounded-xl bg-amber-950/70 border border-amber-500/50 text-amber-200 text-xs flex items-start gap-2"
          >
            <Clock size={15} className="shrink-0 mt-0.5 text-amber-300" />
            <span>{expiredNotice}</span>
          </div>
        )}

        {lockout.isLocked && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs space-y-1.5"
          >
            <div className="font-black uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
              <ShieldAlert size={15} />
              Akses Dikunci Sementara (Proteksi Brute-Force)
            </div>
            <p className="text-rose-200/90 leading-relaxed">
              Tercatat 5 kali kegagalan otorisasi berturut-turut. Silakan tunggu hingga penghitung waktu selesai:
            </p>
            <div className="text-lg font-mono font-black text-white pt-1">
              {formatDurationMmSs(lockout.remainingLockoutSeconds)}
            </div>
          </div>
        )}

        {errorMsg && !lockout.isLocked && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2"
          >
            <AlertTriangle size={15} className="shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Pilihan Metode Otorisasi */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('kode_piket');
              setErrorMsg('');
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              authMethod === 'kode_piket'
                ? 'bg-[#006569] text-[#FFDD00] shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound size={13} />
            <span>Kode Piket Mako</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('sso_perwira');
              setErrorMsg('');
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              authMethod === 'sso_perwira'
                ? 'bg-[#006569] text-[#FFDD00] shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck size={13} />
            <span>Akun Perwira RBAC</span>
          </button>
        </div>

        {/* Kolom Honeypot Tersembunyi Anti-Bot */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="mako-sec-hp">Jangan isi kolom ini</label>
          <input
            id="mako-sec-hp"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypotWebsite}
            onChange={(e) => setHoneypotWebsite(e.target.value)}
          />
        </div>

        {authMethod === 'kode_piket' ? (
          <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="mako-officer-name"
                className="text-xs font-bold text-slate-300 block mb-1.5"
              >
                Nama / Jabatan Petugas Piket:
              </label>
              <input
                id="mako-officer-name"
                type="text"
                required
                disabled={lockout.isLocked}
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                placeholder="Contoh: Raffli Syahputra (Wadansat)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFDD00] disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="mako-access-code"
                className="text-xs font-bold text-slate-300 block mb-1.5"
              >
                Kode Otorisasi Komando Mako:
              </label>
              <input
                id="mako-access-code"
                type="password"
                required
                autoComplete="off"
                disabled={lockout.isLocked}
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Masukkan kode akses taktis resmi..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white tracking-wider focus:outline-none focus:border-[#FFDD00] disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={lockout.isLocked || !accessCode.trim()}
              className="w-full py-3 px-4 rounded-xl bg-[#006569] hover:bg-[#005256] text-[#FFDD00] font-black text-xs uppercase tracking-wider transition shadow-lg cursor-pointer disabled:opacity-50"
            >
              Buka Otorisasi Pusat Kendali
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {firebaseUser && isAuthorizedFirebaseOfficer && (
              <div className="p-3.5 rounded-xl bg-[#006569]/25 border border-[#FFDD00]/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#FFDD00]">
                  <Shield size={15} />
                  <span>Sesi Akun Perwira Terdeteksi ({firebaseRoleLabel})</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Masuk sebagai <strong>{firebaseUser.email}</strong>
                </p>
                <button
                  type="button"
                  disabled={lockout.isLocked}
                  onClick={handleAuthorizedSsoOneClick}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#006569] hover:bg-[#005256] text-[#FFDD00] font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 size={14} />
                  <span>Lanjutkan ke Command Center</span>
                </button>
              </div>
            )}

            {onFirebaseGoogleSignIn && (
              <button
                type="button"
                disabled={submitting || lockout.isLocked}
                onClick={handleGoogleLoginClick}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs uppercase tracking-wider transition shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Masuk dengan Google Resmi Satuan</span>
              </button>
            )}

            {onFirebaseEmailSignIn && (
              <form
                onSubmit={handleEmailPasswordSubmit}
                className="space-y-3 pt-3 border-t border-white/10"
              >
                <div>
                  <label
                    htmlFor="mako-rbac-email"
                    className="text-xs font-bold text-slate-300 block mb-1"
                  >
                    Email Perwira / Staf Adminu:
                  </label>
                  <input
                    id="mako-rbac-email"
                    type="email"
                    required
                    disabled={lockout.isLocked || submitting}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama.perwira@unj.ac.id"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFDD00] disabled:opacity-50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="mako-rbac-pass"
                    className="text-xs font-bold text-slate-300 block mb-1"
                  >
                    Kata Sandi Otorisasi:
                  </label>
                  <input
                    id="mako-rbac-pass"
                    type="password"
                    required
                    disabled={lockout.isLocked || submitting}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFDD00] disabled:opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    lockout.isLocked ||
                    !loginEmail.trim() ||
                    !loginPassword.trim()
                  }
                  className="w-full py-2.5 px-4 rounded-xl bg-[#006569] hover:bg-[#005256] text-[#FFDD00] font-black text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Memverifikasi Kredensial...' : 'Verifikasi Akun Perwira'}
                </button>
              </form>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs font-bold text-slate-400 hover:text-white inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Beranda Publik</span>
          </button>
        </div>
      </main>
    </div>
  );
};
