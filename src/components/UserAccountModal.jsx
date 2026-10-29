import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  LogIn,
  LogOut,
  Shield,
  Check,
  FileText,
  Clock,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  Award,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Building2,
  Calendar,
} from 'lucide-react';
import { useAuth, VALID_ROLES } from '../hooks/useAuth.jsx';
import { getLeaderboardUsers, verifyMenwaMember, updateUserRoleByAdmin } from '../firebase.js';
import { CertificateViewerModal } from './CertificateViewerModal.jsx';
import { navigate } from '../lib/router.jsx';

const ROLE_LABELS = {
  superadmin: 'Superadmin / Komandan Satuan',
  dansat: 'Komandan Satuan (Dansat)',
  wadansat: 'Wakil Komandan Satuan (Wadansat)',
  staf_adminu: 'Staf Administrasi Umum (Adminu)',
  anggota_verified: 'Anggota Terverifikasi (NBP Valid)',
  public_user: 'Pengunjung Publik / Peserta',
};

export function UserAccountModal({ isOpen, onClose }) {
  const {
    user,
    profile,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    saveProfile,
    submissions,
    submissionsLoading,
    refreshSubmissions,
    certificates,
    certificatesLoading,
    refreshCertificates,
    isAdmin,
    isSuperAdmin,
    userRole,
    resetPassword,
  } = useAuth();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'submissions' | 'certificates' | 'admin'
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('Universitas Negeri Jakarta');
  const [occupation, setOccupation] = useState('Mahasiswa');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [isMenwaMember, setIsMenwaMember] = useState(false);
  const [menwaNia, setMenwaNia] = useState('');

  const [viewingCert, setViewingCert] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.displayName || '');
      setInstitution(profile.institution || 'Universitas Negeri Jakarta');
      setOccupation(profile.occupation || 'Mahasiswa');
      setBirthDate(profile.birthDate || '');
      setPhone(profile.phone || '');
      setIsMenwaMember(!!profile.isMenwaMember);
      setMenwaNia(profile.menwaNia || '');
    }
  }, [profile]);

  useEffect(() => {
    if (activeTab === 'admin' && isAdmin) {
      loadAllUsers();
    }
  }, [activeTab, isAdmin]);

  const loadAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const users = await getLeaderboardUsers();
      setAllUsers(users);
    } catch (e) {
      console.error('Gagal muat data anggota untuk verifikasi:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleToggleVerification = async (targetUid, currentStatus) => {
    try {
      await verifyMenwaMember(targetUid, !currentStatus);
      setAllUsers((prev) =>
        prev.map((u) =>
          u.uid === targetUid || u.id === targetUid
            ? {
                ...u,
                isVerifiedMenwa: !currentStatus,
                role: !currentStatus ? 'anggota_verified' : 'public_user',
              }
            : u
        )
      );
      setSuccess('Status verifikasi NBP anggota berhasil diperbarui.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError('Gagal mengubah verifikasi: ' + e.message);
    }
  };

  const handleRoleChange = async (targetUid, newRole) => {
    if (!isSuperAdmin) return;
    try {
      await updateUserRoleByAdmin(targetUid, newRole);
      setAllUsers((prev) =>
        prev.map((u) =>
          u.uid === targetUid || u.id === targetUid
            ? { ...u, role: newRole, isVerifiedMenwa: newRole !== 'public_user' }
            : u
        )
      );
      setSuccess(`Peran personel berhasil diubah menjadi ${ROLE_LABELS[newRole] || newRole}.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError('Gagal memperbarui peran RBAC: ' + e.message);
    }
  };

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      await loginWithGoogle();
      setSuccess('Berhasil masuk dengan Akun Google!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err.code === 'auth/unauthorized-domain') {
        setError(
          'Domain ini belum terdaftar di Firebase Authorized Domains. Silakan masuk menggunakan Email & Kata Sandi di bawah.'
        );
      } else if (err.code === 'auth/popup-blocked') {
        setError(
          'Pop-up Google diblokir oleh peramban. Izinkan pop-up atau gunakan formulir Email di bawah.'
        );
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Jendela masuk Google ditutup sebelum selesai.');
      } else {
        setError(
          err.message || 'Gagal masuk dengan Google. Silakan gunakan formulir Email di bawah.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (authMode === 'login') {
        await loginWithEmail(email, password);
        setSuccess('Berhasil masuk ke akun Anda!');
      } else {
        if (!fullName.trim()) throw new Error('Nama Lengkap wajib diisi.');
        await registerWithEmail(
          email,
          password,
          fullName,
          institution,
          occupation,
          birthDate,
          phone
        );
        setSuccess('Akun berhasil dibuat dan profil tersimpan!');
      }
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      const msg =
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential'
          ? 'Email atau kata sandi tidak cocok.'
          : err.code === 'auth/email-already-in-use'
          ? 'Email sudah terdaftar. Silakan pilih tab Masuk Akun.'
          : err.message || 'Gagal memproses autentikasi.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Masukkan alamat email terdaftar untuk menerima tautan pemulihan kata sandi.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await resetPassword(email.trim());
      setSuccess(`Tautan pemulihan kata sandi telah dikirim ke ${email.trim()}.`);
    } catch (err) {
      const msg =
        err.code === 'auth/user-not-found'
          ? 'Alamat email ini belum terdaftar di portal.'
          : err.code === 'auth/invalid-email'
          ? 'Format alamat email tidak valid.'
          : err.message || 'Gagal mengirim email pemulihan kata sandi.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await saveProfile({
        displayName: fullName,
        institution,
        occupation,
        birthDate,
        phone,
        isMenwaMember,
        menwaNia: isMenwaMember ? menwaNia : '',
      });
      setSuccess('Profil berhasil diperbarui!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError('Gagal menyimpan profil: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/65 backdrop-blur-md animate-fade-in font-sans">
        {/* ====================================================================
            FLOATING 3D CUSHION MODAL CONTAINER (NEUMORPHIC 3D AUTH)
            ==================================================================== */}
        <div
          className={`relative w-full ${
            user ? 'max-w-2xl' : 'max-w-md'
          } rounded-[2.75rem] bg-gradient-to-br from-[#EEF5F6] via-[#F5F8F6] to-[#F9FBFA] border-2 border-white/85 shadow-[12px_12px_35px_rgba(9,45,50,0.22),-12px_-12px_35px_rgba(255,255,255,0.95)] overflow-hidden flex flex-col max-h-[92vh]`}
        >
          {/* Soft Extruded Circular Rings (Ornamen Latar 3D Timbul) */}
          <div className="pointer-events-none absolute -top-20 -left-20 w-52 h-52 neu-extruded-ring opacity-75" />
          <div className="pointer-events-none absolute top-14 -right-12 w-28 h-28 neu-extruded-ring opacity-65" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 w-60 h-60 neu-extruded-ring opacity-70" />

          {/* Tombol Tutup Taktil 3D di Pojok Kanan Atas */}
          <div className="relative z-20 flex items-center justify-between px-6 pt-5 pb-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-[#006569]">
              {user ? 'PORTAL SIVITAS & ANGGOTA' : 'MENWA UNJ · AUTHENTICATION'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-2xl neu-btn text-[#092D32] hover:text-rose-600 flex items-center justify-center cursor-pointer"
              aria-label="Tutup modal akun"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content Body */}
          <div className="relative z-10 px-6 sm:px-9 pb-8 pt-2 overflow-y-auto flex-grow space-y-5">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/90 text-rose-700 text-xs font-bold flex items-center gap-2.5 shadow-sm">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs font-bold flex items-center gap-2.5 shadow-sm">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                <span>{success}</span>
              </div>
            )}

            {/* ================================================================
                KONDISI 1: BELUM LOGIN (3D NEUMORPHIC LOGIN VIEW)
                ================================================================ */}
            {!user ? (
              <div className="space-y-5 text-center">
                {/* Tile Logo 3D Elevated di Bagian Atas */}
                <div className="mx-auto w-24 h-24 rounded-3xl neu-logo-tile p-3.5 flex items-center justify-center relative overflow-hidden">
                  <div className="pointer-events-none absolute -top-6 -left-6 w-16 h-16 bg-white/80 rounded-full blur-md" />
                  <img
                    src="/logo-menwa-unj.png"
                    alt="Logo Menwa UNJ"
                    className="w-full h-full object-contain relative z-10 drop-shadow-sm"
                  />
                </div>

                {/* Tipografi Header */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#092D32] tracking-tight">
                    {authMode === 'register'
                      ? 'Buat Akun Baru'
                      : authMode === 'forgot'
                      ? 'Pemulihan Sandi'
                      : 'Selamat Datang'}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 font-semibold">
                    {authMode === 'register'
                      ? 'Daftarkan identitas sivitas atau peserta untuk melanjutkan'
                      : authMode === 'forgot'
                      ? 'Masukkan email terdaftar untuk menerima tautan reset'
                      : 'Masukkan kredensial akun untuk melanjutkan'}
                  </p>
                </div>

                {/* Switcher Masuk / Daftar */}
                {authMode !== 'forgot' ? (
                  <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl neu-inset">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setError('');
                      }}
                      className={`py-2.5 text-xs font-black rounded-xl transition cursor-pointer ${
                        authMode === 'login'
                          ? 'neu-btn text-[#006569]'
                          : 'text-slate-500 hover:text-[#092D32]'
                      }`}
                    >
                      Masuk Akun
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setError('');
                      }}
                      className={`py-2.5 text-xs font-black rounded-xl transition cursor-pointer ${
                        authMode === 'register'
                          ? 'neu-btn text-[#006569]'
                          : 'text-slate-500 hover:text-[#092D32]'
                      }`}
                    >
                      Daftar Baru
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-slate-500">Reset Kata Sandi</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setError('');
                      }}
                      className="text-xs font-black text-[#006569] hover:underline cursor-pointer"
                    >
                      ← Kembali ke Login
                    </button>
                  </div>
                )}

                {/* FORM PEMULIHAN SANDI */}
                {authMode === 'forgot' ? (
                  <form onSubmit={handlePasswordReset} className="space-y-4 text-left">
                    <div className="neu-inset rounded-2xl px-4 py-3.5 flex items-center gap-3">
                      <Mail size={18} className="text-[#006569] shrink-0" />
                      <input
                        type="email"
                        required
                        placeholder="Alamat Email Terdaftar"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ color: '#020617' }}
                        className="w-full bg-transparent text-slate-950 font-bold text-sm sm:text-base placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 pl-6 pr-3.5 rounded-full neu-btn-primary text-white font-black text-sm tracking-wide flex items-center justify-between cursor-pointer disabled:opacity-60"
                    >
                      <span className="mx-auto pl-6">
                        {submitting ? 'Mengirim Tautan...' : 'Kirim Tautan Reset'}
                      </span>
                      <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-[#FFDD00] shrink-0">
                        <ArrowRight size={17} />
                      </span>
                    </button>
                  </form>
                ) : (
                  /* FORM LOGIN / REGISTER UTAMA (INSET 3D FIELDS) */
                  <form onSubmit={handleEmailAuth} className="space-y-3.5 text-left">
                    {authMode === 'register' && (
                      <div className="neu-inset rounded-2xl px-4 py-3.5 flex items-center gap-3">
                        <User size={18} className="text-[#006569] shrink-0" />
                        <input
                          type="text"
                          required
                          placeholder="Nama Lengkap Sesuai Identitas"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          style={{ color: '#020617' }}
                          className="w-full bg-transparent text-slate-950 font-bold text-sm sm:text-base placeholder:text-slate-400 focus:outline-none"
                        />
                      </div>
                    )}

                    <div className="neu-inset rounded-2xl px-4 py-3.5 flex items-center gap-3">
                      <Mail size={18} className="text-[#006569] shrink-0" />
                      <input
                        type="email"
                        required
                        placeholder="Email atau Akun Sivitas"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ color: '#020617' }}
                        className="w-full bg-transparent text-slate-950 font-bold text-sm sm:text-base placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>

                    <div className="neu-inset rounded-2xl px-4 py-3.5 flex items-center gap-3">
                      <Lock size={18} className="text-[#006569] shrink-0" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="Kata Sandi"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ color: '#020617' }}
                        className="w-full bg-transparent text-slate-950 font-bold text-sm sm:text-base placeholder:text-slate-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="text-slate-500 hover:text-[#006569] p-1 cursor-pointer"
                        aria-label="Tampilkan atau sembunyikan kata sandi"
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>

                    {/* Baris Ingat Saya & Lupa Kata Sandi */}
                    <div className="flex items-center justify-between px-1 pt-0.5 text-xs">
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none font-bold text-slate-700">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={rememberMe}
                          onClick={() => setRememberMe((prev) => !prev)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition cursor-pointer ${
                            rememberMe
                              ? 'bg-[#006569] text-[#FFDD00] shadow-xs'
                              : 'neu-inset text-transparent'
                          }`}
                        >
                          <Check size={13} className="stroke-[3]" />
                        </button>
                        <span>Ingat Saya</span>
                      </label>

                      {authMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('forgot');
                            setError('');
                            setSuccess('');
                          }}
                          className="font-bold text-[#006569] hover:underline cursor-pointer"
                        >
                          Lupa Kata Sandi?
                        </button>
                      )}
                    </div>

                    {/* Tombol CTA Login Utama (Pill 3D + Bulatan Panah Kanan) */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 pl-6 pr-3.5 rounded-full neu-btn-primary text-white font-black text-sm sm:text-base tracking-wide flex items-center justify-between cursor-pointer disabled:opacity-60 mt-2"
                    >
                      <span className="mx-auto pl-6">
                        {submitting
                          ? 'Memproses...'
                          : authMode === 'login'
                          ? 'Login'
                          : 'Daftar & Masuk'}
                      </span>
                      <span className="w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-[#FFDD00] shrink-0 shadow-inner">
                        <ArrowRight size={17} />
                      </span>
                    </button>
                  </form>
                )}

                {/* Pemisah "ATAU MASUK MELALUI" */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-slate-300/80 to-slate-300/80" />
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    ATAU MASUK MELALUI
                  </span>
                  <div className="h-[1.5px] flex-1 bg-gradient-to-l from-transparent via-slate-300/80 to-slate-300/80" />
                </div>

                {/* Deretan Tombol Sosial 3D (w-14 h-14 rounded-2xl) */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={submitting}
                    title="Masuk dengan Akun Google"
                    className="neu-social-btn cursor-pointer"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/official');
                    }}
                    title="Portal Official WhatsApp Kontingen"
                    className="neu-social-btn cursor-pointer text-[#059669]"
                  >
                    <Phone size={22} className="stroke-[2.4]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'register' : 'login');
                      setError('');
                    }}
                    title={authMode === 'login' ? 'Buat Akun Baru' : 'Masuk dengan Email'}
                    className="neu-social-btn cursor-pointer text-[#006569]"
                  >
                    <ShieldCheck size={23} className="stroke-[2.3]" />
                  </button>
                </div>

                {/* Footer Motto */}
                <div className="pt-2 text-[10px] font-black tracking-[0.22em] text-slate-400 uppercase">
                  WIDYA · CASTRENA · DHARMA · SIDDHA
                </div>
              </div>
            ) : (
              /* ================================================================
                 KONDISI 2: SUDAH LOGIN (DASHBOARD PROFIL & RBAC NEUMORPHIC)
                 ================================================================ */
              <div className="space-y-5">
                {/* Kartu Identitas Singkat */}
                <div className="neu-card-sm rounded-3xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl neu-logo-tile flex items-center justify-center text-[#006569] font-black shrink-0">
                      <User size={22} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-black text-base text-[#092D32] truncate">
                          {profile?.displayName || 'Akun Portal Menwa UNJ'}
                        </h3>
                        {profile?.isVerifiedMenwa && (
                          <ShieldCheck
                            size={16}
                            className="text-[#006569] shrink-0"
                            title="Anggota Resmi Menwa UNJ Terverifikasi (NBP Valid)"
                          />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-semibold truncate">
                        {user.email} · {ROLE_LABELS[userRole] || 'Pengguna'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigasi Tab Profil */}
                <div className="flex neu-inset p-1.5 rounded-2xl flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className={`flex-1 min-w-[110px] py-2.5 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'profile'
                        ? 'neu-btn text-[#006569]'
                        : 'text-slate-600 hover:text-[#092D32]'
                    }`}
                  >
                    <User size={14} /> Profil &amp; RBAC
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('submissions');
                      refreshSubmissions();
                    }}
                    className={`flex-1 min-w-[110px] py-2.5 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'submissions'
                        ? 'neu-btn text-[#006569]'
                        : 'text-slate-600 hover:text-[#092D32]'
                    }`}
                  >
                    <FileText size={14} /> Formulir ({submissions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('certificates');
                      if (refreshCertificates) refreshCertificates();
                    }}
                    className={`flex-1 min-w-[110px] py-2.5 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'certificates'
                        ? 'neu-btn text-[#006569]'
                        : 'text-slate-600 hover:text-[#092D32]'
                    }`}
                  >
                    <Award size={14} /> Sertifikat ({certificates.length})
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('admin')}
                      className={`flex-1 min-w-[110px] py-2.5 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'admin'
                          ? 'neu-btn-primary text-[#FFDD00]'
                          : 'text-[#006569] hover:text-[#092D32]'
                      }`}
                    >
                      <Shield size={14} /> Otorisasi RBAC
                    </button>
                  )}
                </div>

                {/* TAB 1: PROFIL & STATUS ANGGOTA */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="p-4 bg-[#092D32] rounded-2xl text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-[#FFDD00] flex items-center justify-center">
                          <Flame size={20} />
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-300 block">Poin Taktis Anda</span>
                          <span className="font-mono text-xl font-bold text-[#FFDD00] tabular-nums">
                            {profile?.tacticalPoints || 0} EXP
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-slate-300 block">
                          Peran Sistem (RBAC)
                        </span>
                        <span className="inline-flex items-center gap-1.5 mt-0.5 text-[#FFDD00] text-xs font-black">
                          <ShieldCheck size={14} />
                          <span>{ROLE_LABELS[userRole] || userRole}</span>
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-[#092D32] mb-1.5">
                        Nama Lengkap
                      </label>
                      <div className="neu-inset rounded-2xl px-4 py-3 flex items-center gap-3">
                        <User size={16} className="text-[#006569] shrink-0" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          style={{ color: '#020617' }}
                          className="w-full bg-transparent text-slate-950 font-bold text-xs sm:text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-black text-[#092D32] mb-1.5">
                          Asal Instansi / Kampus
                        </label>
                        <div className="neu-inset rounded-2xl px-4 py-3 flex items-center gap-2.5">
                          <Building2 size={16} className="text-[#006569] shrink-0" />
                          <input
                            type="text"
                            required
                            value={institution}
                            onChange={(e) => setInstitution(e.target.value)}
                            style={{ color: '#020617' }}
                            className="w-full bg-transparent text-slate-950 font-bold text-xs sm:text-sm focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-[#092D32] mb-1.5">
                          Pekerjaan / Status
                        </label>
                        <div className="neu-inset rounded-2xl px-4 py-3">
                          <select
                            value={occupation}
                            onChange={(e) => setOccupation(e.target.value)}
                            style={{ color: '#020617' }}
                            className="w-full bg-transparent text-slate-950 font-bold text-xs sm:text-sm focus:outline-none"
                          >
                            <option value="Mahasiswa">Mahasiswa</option>
                            <option value="TNI/Polri">TNI/Polri</option>
                            <option value="Pemerintahan">Pemerintahan / ASN</option>
                            <option value="Karyawan Swasta">Karyawan Swasta</option>
                            <option value="Umum">Umum</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-black text-[#092D32] mb-1.5">
                          Tanggal Lahir
                        </label>
                        <div className="neu-inset rounded-2xl px-4 py-3 flex items-center gap-2.5">
                          <Calendar size={16} className="text-[#006569] shrink-0" />
                          <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            style={{ color: '#020617' }}
                            className="w-full bg-transparent text-slate-950 font-bold text-xs sm:text-sm focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-[#092D32] mb-1.5">
                          Nomor WhatsApp / HP
                        </label>
                        <div className="neu-inset rounded-2xl px-4 py-3 flex items-center gap-2.5">
                          <Phone size={16} className="text-[#006569] shrink-0" />
                          <input
                            type="tel"
                            placeholder="08xxxxxxxxxx"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            style={{ color: '#020617' }}
                            className="w-full bg-transparent text-slate-950 font-bold text-xs sm:text-sm focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Opsi Keanggotaan Menwa UNJ (NBP) */}
                    <div className="p-4 neu-card-sm rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isMenwaMember}
                            onChange={(e) => setIsMenwaMember(e.target.checked)}
                            className="w-4 h-4 text-[#006569] rounded focus:ring-[#006569]"
                          />
                          <span className="text-xs font-black text-[#092D32]">
                            Saya Anggota Aktif / Purna Menwa UNJ
                          </span>
                        </label>
                        {profile?.isVerifiedMenwa ? (
                          <span className="text-[10px] text-[#006569] font-black flex items-center gap-1">
                            <ShieldCheck size={13} /> NBP Terverifikasi
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-semibold">
                            Menunggu validasi Staf Adminu
                          </span>
                        )}
                      </div>

                      {isMenwaMember && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Nomor Baris Pokok (NBP) / NIA Menwa UNJ
                          </label>
                          <div className="neu-inset rounded-xl px-3.5 py-2.5">
                            <input
                              type="text"
                              placeholder="Contoh: 22020742263"
                              value={menwaNia}
                              onChange={(e) => setMenwaNia(e.target.value)}
                              style={{ color: '#020617' }}
                              className="w-full bg-transparent text-slate-950 font-bold text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-3">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-3.5 px-5 neu-btn-primary text-[#FFDD00] font-black text-xs uppercase tracking-wider rounded-2xl cursor-pointer"
                      >
                        {submitting ? 'Menyimpan...' : 'Perbarui Profil Pokok'}
                      </button>
                      <button
                        type="button"
                        onClick={logout}
                        className="py-3.5 px-5 neu-btn text-rose-700 font-black text-xs rounded-2xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut size={14} /> Keluar
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 2: RIWAYAT FORMULIR */}
                {activeTab === 'submissions' && (
                  <div className="space-y-3">
                    {submissionsLoading ? (
                      <div className="py-12 text-center text-xs text-slate-500 font-medium">
                        Memuat daftar pengajuan berkas...
                      </div>
                    ) : submissions.length === 0 ? (
                      <div className="py-12 text-center neu-inset rounded-2xl p-6">
                        <FileText size={32} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-xs font-black text-[#092D32]">
                          Belum ada formulir yang diajukan
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Formulir pendaftaran dan permohonan dinas yang Anda isi akan muncul di sini.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {submissions.map((sub) => (
                          <div
                            key={sub.submissionId}
                            className="p-4 neu-card-sm rounded-2xl space-y-2"
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="font-black text-[#092D32]">{sub.submissionId}</span>
                              <span className="font-black text-[#006569]">
                                {sub.status?.replace('_', ' ')?.toUpperCase()}
                              </span>
                            </div>
                            <h4 className="font-black text-xs text-[#092D32]">
                              {sub.title || sub.serviceType}
                            </h4>
                            <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                              {sub.notes || sub.purpose}
                            </p>
                            <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                              <span>
                                {new Date(sub.createdAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                              <span className="font-sans font-bold text-[#006569]">
                                {sub.institution}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: RIWAYAT SERTIFIKAT YOUTH SPARK */}
                {activeTab === 'certificates' && (
                  <div className="space-y-3">
                    {certificatesLoading ? (
                      <div className="py-12 text-center text-xs text-slate-500 font-medium">
                        Memuat data sertifikat...
                      </div>
                    ) : certificates.length === 0 ? (
                      <div className="py-12 text-center neu-inset rounded-2xl p-6">
                        <Award size={32} className="mx-auto text-amber-500/60 mb-2" />
                        <p className="text-xs font-black text-[#092D32]">
                          Belum ada sertifikat diraih
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                          Selesaikan modul Pelatihan Pelatih di tab Youth Spark untuk mendapatkan sertifikat digital resmi.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {certificates.map((cert) => (
                          <div
                            key={cert.certId}
                            className="p-4 bg-[#092D32] border border-white/10 rounded-2xl text-white space-y-2 shadow-md"
                          >
                            <div className="flex items-center justify-between font-mono text-[10px]">
                              <span className="font-bold text-[#FFDD00]">{cert.certId}</span>
                              <span className="text-emerald-400 font-semibold">
                                {cert.grade || 'Lulus Kompetensi'}
                              </span>
                            </div>
                            <h4 className="font-bold text-xs sm:text-sm text-white">
                              {cert.courseTitle}
                            </h4>
                            <p className="text-[11px] text-slate-300">
                              Penerima: {cert.recipientName}
                            </p>
                            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400">
                                {new Date(cert.issuedAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </span>
                              <button
                                type="button"
                                onClick={() => setViewingCert(cert)}
                                className="px-3.5 py-1.5 neu-btn-gold text-slate-950 font-black text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                              >
                                <span>Lihat / Cetak PDF</span>
                                <ExternalLink size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: PANEL ADMIN VERIFIKASI NBP & MANAJEMEN RBAC */}
                {activeTab === 'admin' && isAdmin && (
                  <div className="space-y-4">
                    <div className="p-3.5 neu-card-sm rounded-2xl flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-[#092D32]">
                          Panel Otorisasi RBAC &amp; Verifikasi NBP Anggota
                        </h4>
                        <p className="text-[11px] text-slate-600">
                          Kelola peran personel (`dansat`, `wadansat`, `staf_adminu`, `anggota_verified`, `public_user`)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={loadAllUsers}
                        className="px-3.5 py-2 neu-btn-primary text-[#FFDD00] text-xs font-black rounded-xl cursor-pointer"
                      >
                        Muat Ulang
                      </button>
                    </div>

                    {loadingUsers ? (
                      <div className="py-8 text-center text-xs text-slate-500 font-mono">
                        Memeriksa pangkalan data personel...
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                        {allUsers.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-500">
                            Belum ada data pengguna terdaftar.
                          </div>
                        ) : (
                          allUsers.map((u) => {
                            const targetId = u.uid || u.id;
                            return (
                              <div
                                key={targetId}
                                className="p-3.5 neu-card-sm rounded-2xl flex flex-wrap items-center justify-between gap-3"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-black text-[#092D32] truncate">
                                      {u.displayName || 'Pengguna'}
                                    </span>
                                    {u.isVerifiedMenwa && (
                                      <ShieldCheck size={14} className="text-[#006569] shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-600 truncate">{u.email}</p>
                                  <p className="text-[10px] font-mono text-[#006569] font-bold">
                                    NBP: {u.menwaNia || '-'} · Peran: {u.role || 'public_user'}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {isSuperAdmin && (
                                    <div className="neu-inset rounded-xl px-2.5 py-1.5">
                                      <select
                                        value={
                                          u.role ||
                                          (u.isVerifiedMenwa ? 'anggota_verified' : 'public_user')
                                        }
                                        onChange={(e) => handleRoleChange(targetId, e.target.value)}
                                        style={{ color: '#020617' }}
                                        className="bg-transparent text-xs font-bold text-slate-950 focus:outline-none"
                                      >
                                        {VALID_ROLES.map((r) => (
                                          <option key={r} value={r}>
                                            {r}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleToggleVerification(targetId, u.isVerifiedMenwa)
                                    }
                                    className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 cursor-pointer ${
                                      u.isVerifiedMenwa
                                        ? 'neu-btn text-rose-700'
                                        : 'neu-btn-primary text-[#FFDD00]'
                                    }`}
                                  >
                                    {u.isVerifiedMenwa ? 'Cabut NBP' : 'Verifikasi NBP'}
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {viewingCert && (
        <CertificateViewerModal
          certificate={viewingCert}
          isOpen={!!viewingCert}
          onClose={() => setViewingCert(null)}
        />
      )}
    </>
  );
}

export default UserAccountModal;