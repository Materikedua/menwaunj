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
  CreditCard,
} from 'lucide-react';
import { useAuth, VALID_ROLES } from '../hooks/useAuth.jsx';
import { getLeaderboardUsers, verifyMenwaMember, updateUserRoleByAdmin } from '../firebase.js';
import { CertificateViewerModal } from './CertificateViewerModal.jsx';
import { UserAccountAuthView } from './account/UserAccountAuthView.jsx';
import { UserAccountAdminTab } from './account/UserAccountAdminTab.jsx';
import { UserAccountSubmissionsTab } from './account/UserAccountSubmissionsTab.jsx';
import { navigate } from '../lib/router.jsx';
import { playTactileClick } from '../lib/tactileAudio.js';

const ROLE_LABELS = {
  superadmin: 'Superadmin / Komandan Satuan',
  dansat: 'Komandan Satuan (Dansat)',
  wadansat: 'Wakil Komandan Satuan (Wadansat)',
  staf_adminu: 'Staf Administrasi Umum (Adminu)',
  anggota_verified: 'Anggota Terverifikasi (NBP Valid)',
  public_user: 'Pengunjung Publik / Peserta',
};

export function UserAccountModal({ isOpen, onClose, onOpenKTA = null }) {
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

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
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fade-in font-sans"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* ====================================================================
            FLOATING 3D CUSHION MODAL CONTAINER (NEUMORPHIC 3D AUTH)
            ==================================================================== */}
        <div
          role="dialog"
          aria-modal="true"
          className={`menwa-modal relative w-full ${user ? 'max-w-2xl' : 'max-w-md'
            } rounded-[2.75rem] bg-gradient-to-br from-[#EEF5F6] via-[#F5F8F6] to-[#F9FBFA] border-2 border-white/85 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]`}
        >
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
              <UserAccountAuthView
                authMode={authMode}
                setAuthMode={setAuthMode}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                fullName={fullName}
                setFullName={setFullName}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                rememberMe={rememberMe}
                setRememberMe={setRememberMe}
                submitting={submitting}
                handleEmailAuth={handleEmailAuth}
                handlePasswordReset={handlePasswordReset}
                handleGoogleLogin={handleGoogleLogin}
                setError={setError}
                setSuccess={setSuccess}
                onClose={onClose}
              />
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

                {/* Navigasi Tab Profil 3D */}
                <div className="flex neu-inset p-2 rounded-2xl flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className={`flex-1 min-w-[115px] py-2.5 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'profile'
                        ? 'neu-btn-primary text-[#FFDD00] shadow-md'
                        : 'neu-btn text-slate-700 hover:text-[#006569]'
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
                    className={`flex-1 min-w-[115px] py-2.5 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'submissions'
                        ? 'neu-btn-primary text-[#FFDD00] shadow-md'
                        : 'neu-btn text-slate-700 hover:text-[#006569]'
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
                    className={`flex-1 min-w-[115px] py-2.5 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'certificates'
                        ? 'neu-btn-primary text-[#FFDD00] shadow-md'
                        : 'neu-btn text-slate-700 hover:text-[#006569]'
                      }`}
                  >
                    <Award size={14} /> Sertifikat ({certificates.length})
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('admin')}
                      className={`flex-1 min-w-[115px] py-2.5 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'admin'
                          ? 'neu-btn-gold text-slate-950 shadow-md'
                          : 'neu-btn text-[#006569] hover:text-[#092D32]'
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

                    {onOpenKTA && (
                      <button
                        type="button"
                        onClick={() => {
                          playTactileClick('press');
                          onOpenKTA();
                        }}
                        className="w-full neu-btn-strong-blue rounded-2xl py-3 px-4 text-xs font-black text-white flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <CreditCard size={16} />
                        <span>Lihat &amp; Cetak KTA &amp; ID Card Resmi (E-KTA)</span>
                      </button>
                    )}

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
                        className="flex-1 py-3.5 px-6 neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white font-black text-xs uppercase tracking-wider rounded-2xl cursor-pointer shadow-md hover:shadow-lg transition-all"
                      >
                        {submitting ? 'Menyimpan...' : 'Perbarui Profil Pokok'}
                      </button>
                      <button
                        type="button"
                        onClick={logout}
                        className="py-3.5 px-5 neu-btn bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 font-black text-xs rounded-2xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                      >
                        <LogOut size={14} /> Keluar
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 2: RIWAYAT FORMULIR */}
                {activeTab === 'submissions' && (
                  <UserAccountSubmissionsTab
                    submissionsLoading={submissionsLoading}
                    submissions={submissions}
                  />
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
                  <UserAccountAdminTab
                    isAdmin={isAdmin}
                    isSuperAdmin={isSuperAdmin}
                    loadAllUsers={loadAllUsers}
                    loadingUsers={loadingUsers}
                    allUsers={allUsers}
                    handleRoleChange={handleRoleChange}
                    handleToggleVerification={handleToggleVerification}
                    VALID_ROLES={VALID_ROLES}
                  />
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