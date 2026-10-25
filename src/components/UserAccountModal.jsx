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
  Building, 
  Briefcase, 
  Calendar, 
  Phone, 
  Mail, 
  AlertCircle,
  ExternalLink,
  Award,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { getLeaderboardUsers, verifyMenwaMember } from '../firebase.js';
import { CertificateViewerModal } from './CertificateViewerModal.jsx';

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
    claimMenwaMembership
  } = useAuth();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'submissions' | 'certificates' | 'admin'
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

  // Selected Certificate to view
  const [viewingCert, setViewingCert] = useState(null);

  // Admin Verification state
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Sinkronisasi data form profil dari auth context
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
      setAllUsers(prev => prev.map(u => u.uid === targetUid ? { ...u, isVerifiedMenwa: !currentStatus } : u));
      setSuccess(`Status verifikasi berhasil diubah!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError('Gagal mengubah verifikasi: ' + e.message);
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
      setError(err.message || 'Gagal masuk dengan Google. Coba lagi.');
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
        await registerWithEmail(email, password, fullName, institution, occupation, birthDate, phone);
        setSuccess('Akun berhasil dibuat dan profil tersimpan!');
      }
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      const msg = err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found'
        ? 'Email atau kata sandi tidak cocok.'
        : err.code === 'auth/email-already-in-use'
        ? 'Email sudah terdaftar. Silakan pilih tab Masuk.'
        : err.message || 'Gagal memproses autentikasi.';
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
        menwaNia: isMenwaMember ? menwaNia : ''
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header Modal */}
          <div className="bg-[#006569] px-6 py-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFDD00] text-slate-950 flex items-center justify-center font-black">
                <User size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-lg tracking-tight">
                    {user ? (profile?.displayName || 'Akun Portal Menwa UNJ') : 'Masuk / Buat Akun'}
                  </h3>
                  {profile?.isVerifiedMenwa && (
                    <span title="Anggota Resmi Menwa UNJ Terverifikasi">
                      <ShieldCheck className="w-5 h-5 text-sky-400" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#FFDD00] font-medium">
                  {user ? user.email : 'Otomatisasi pengisian formulir, gamifikasi poin & sertifikat'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              aria-label="Tutup modal akun"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto flex-grow space-y-6">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check size={16} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* KONDISI 1: Belum Login */}
            {!user ? (
              <div className="space-y-6">
                {/* Opsi Google Sign-In Resmi */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={submitting}
                    className="w-full py-3.5 px-4 bg-white border border-slate-300 hover:border-[#006569] hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-2xl shadow-sm flex items-center justify-center gap-3 transition-all group"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"/>
                    </svg>
                    <span>Lanjutkan dengan Akun Google</span>
                  </button>
                  <p className="text-center text-[11px] text-slate-500 font-medium">
                    Masuk instan menggunakan akun Google atau unjmenwa@gmail.com.
                  </p>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 w-full"></div>
                  <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest absolute">
                    atau via email
                  </span>
                </div>

                {/* Toggle Login vs Register */}
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setError(''); }}
                    className={`flex-1 py-2 text-xs font-black rounded-xl transition ${authMode === 'login' ? 'bg-white text-[#006569] shadow-sm' : 'text-slate-600'}`}
                  >
                    Masuk Akun
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setError(''); }}
                    className={`flex-1 py-2 text-xs font-black rounded-xl transition ${authMode === 'register' ? 'bg-white text-[#006569] shadow-sm' : 'text-slate-600'}`}
                  >
                    Buat Akun Baru
                  </button>
                </div>

                {/* Form Input Email/Password */}
                <form onSubmit={handleEmailAuth} className="space-y-3.5">
                  {authMode === 'register' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Contoh: Muhammad Farhan"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006569]"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006569]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi</label>
                    <input 
                      type="password" 
                      required
                      minLength={6}
                      placeholder="Minimal 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006569]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-[#006569] text-[#FFDD00] font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:bg-[#00474c] transition mt-2"
                  >
                    {submitting ? 'Memproses...' : (authMode === 'login' ? 'Masuk ke Akun' : 'Daftar & Buat Profil')}
                  </button>
                </form>
              </div>
            ) : (
              /* KONDISI 2: Sudah Login */
              <div className="space-y-6">
                {/* Header Tab Profil, Riwayat, Sertifikat & Admin */}
                <div className="flex bg-slate-100 p-1 rounded-2xl flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className={`flex-1 min-w-[110px] py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 ${activeTab === 'profile' ? 'bg-white text-[#006569] shadow-sm' : 'text-slate-600'}`}
                  >
                    <User size={14} /> Profil & Auto-Fill
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('submissions'); refreshSubmissions(); }}
                    className={`flex-1 min-w-[110px] py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 ${activeTab === 'submissions' ? 'bg-white text-[#006569] shadow-sm' : 'text-slate-600'}`}
                  >
                    <FileText size={14} /> Formulir ({submissions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('certificates'); if (refreshCertificates) refreshCertificates(); }}
                    className={`flex-1 min-w-[110px] py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 ${activeTab === 'certificates' ? 'bg-white text-[#006569] shadow-sm' : 'text-slate-600'}`}
                  >
                    <Award size={14} /> Sertifikat ({certificates.length})
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('admin')}
                      className={`flex-1 min-w-[110px] py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 ${activeTab === 'admin' ? 'bg-red-700 text-white shadow-sm' : 'text-red-700 hover:bg-red-50'}`}
                    >
                      <Shield size={14} /> Verifikasi Mako
                    </button>
                  )}
                </div>

                {/* TAB 1: PROFIL & STATUS ANGGOTA */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    {/* Tactical Points Bar */}
                    <div className="p-4 bg-slate-900 rounded-2xl text-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                          <Flame size={20} />
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400 block">Poin Taktis Anda</span>
                          <span className="font-mono text-xl font-bold text-amber-400">
                            {profile?.tacticalPoints || 0} EXP
                          </span>
                        </div>
                      </div>

                      {profile?.isVerifiedMenwa ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-300 text-xs font-semibold">
                          <ShieldCheck size={16} />
                          <span>Anggota Terverifikasi</span>
                        </div>
                      ) : profile?.isMenwaMember ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-400/30 rounded-xl text-amber-300 text-xs font-semibold">
                          <Clock size={14} />
                          <span>Menunggu Verifikasi Admin</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Peserta Umum</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                      <input 
                        type="text" 
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006569]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Asal Instansi / Kampus</label>
                        <input 
                          type="text" 
                          required
                          value={institution}
                          onChange={(e) => setInstitution(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006569]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Pekerjaan / Status</label>
                        <select 
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006569]"
                        >
                          <option value="Mahasiswa">Mahasiswa</option>
                          <option value="TNI/Polri">TNI/Polri</option>
                          <option value="Pemerintahan">Pemerintahan / ASN</option>
                          <option value="Karyawan Swasta">Karyawan Swasta</option>
                          <option value="Umum">Umum</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                        <input 
                          type="date" 
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006569]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
                        <input 
                          type="tel" 
                          placeholder="081234567890"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006569]"
                        />
                      </div>
                    </div>

                    {/* Opsi Keanggotaan Menwa UNJ */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={isMenwaMember}
                            onChange={(e) => setIsMenwaMember(e.target.checked)}
                            className="w-4 h-4 text-[#006569] rounded focus:ring-[#006569]"
                          />
                          <span className="text-xs font-bold text-slate-800">
                            Saya Anggota Aktif / Purna Menwa UNJ
                          </span>
                        </label>
                        {profile?.isVerifiedMenwa ? (
                          <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <ShieldCheck size={12} /> Centang Biru Aktif
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-medium">Perlu verifikasi admin</span>
                        )}
                      </div>

                      {isMenwaMember && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Nomor Induk Anggota (NIA) / Angkatan
                          </label>
                          <input 
                            type="text"
                            placeholder="Contoh: UNJ-2023-042 (Angkatan 52)"
                            value={menwaNia}
                            onChange={(e) => setMenwaNia(e.target.value)}
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006569]"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">
                            *Admin Mako akan memvalidasi nomor ini. Setelah diverifikasi, Anda akan mendapatkan centang biru dan masuk ke Papan Peringkat Khusus Menwa UNJ.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-3">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-3 bg-[#006569] text-[#FFDD00] font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:bg-[#00474c] transition"
                      >
                        {submitting ? 'Menyimpan...' : 'Perbarui Profil Pokok'}
                      </button>
                      <button
                        type="button"
                        onClick={logout}
                        className="py-3 px-4 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
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
                      <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl p-6">
                        <FileText size={32} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-bold text-slate-700">Belum ada formulir yang diajukan</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Formulir pendaftaran dan permohonan dinas yang Anda isi melalui tab Administrasi akan muncul di sini.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {submissions.map((sub) => (
                          <div key={sub.submissionId} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-black bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                                {sub.submissionId}
                              </span>
                              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                                sub.status === 'disetujui' ? 'bg-emerald-100 text-emerald-800' :
                                sub.status === 'diproses' ? 'bg-blue-100 text-blue-800' :
                                'bg-amber-100 text-amber-900'
                              }`}>
                                {sub.status?.replace('_', ' ')?.toUpperCase()}
                              </span>
                            </div>
                            <h4 className="font-black text-xs text-slate-900">{sub.title || sub.serviceType}</h4>
                            <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">{sub.notes || sub.purpose}</p>
                            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                              <span>{new Date(sub.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              <span className="font-sans font-bold text-[#006569]">{sub.institution}</span>
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
                      <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl p-6">
                        <Award size={32} className="mx-auto text-amber-500/50 mb-2" />
                        <p className="text-xs font-bold text-slate-700">Belum ada sertifikat diraih</p>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                          Selesaikan proker Pelatihan Pelatih di tab Youth Spark untuk mendapatkan sertifikat digital resmi yang dapat diunduh kapan saja.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {certificates.map((cert) => (
                          <div key={cert.certId} className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl text-white space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                                {cert.certId}
                              </span>
                              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                                {cert.grade || 'Lulus Kompetensi'}
                              </span>
                            </div>
                            <h4 className="font-bold text-xs sm:text-sm text-white">{cert.courseTitle}</h4>
                            <p className="text-[11px] text-slate-300">Penerima: {cert.recipientName}</p>
                            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400">
                                {new Date(cert.issuedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                              <button
                                onClick={() => setViewingCert(cert)}
                                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
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

                {/* TAB 4: PANEL ADMIN VERIFIKASI MAKO */}
                {activeTab === 'admin' && isAdmin && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-red-900">Panel Verifikasi Anggota Menwa UNJ</h4>
                        <p className="text-[11px] text-red-700">Khusus Perwira Mako (unjmenwa@gmail.com)</p>
                      </div>
                      <button 
                        onClick={loadAllUsers}
                        className="px-3 py-1 bg-red-800 text-white text-xs font-semibold rounded-lg hover:bg-red-700"
                      >
                        Muat Ulang
                      </button>
                    </div>

                    {loadingUsers ? (
                      <div className="py-8 text-center text-xs text-slate-500 font-mono">
                        Memeriksa pangkalan data anggota...
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                        {allUsers.filter(u => u.isMenwaMember || u.isVerifiedMenwa).length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-500">
                            Belum ada anggota yang mengajukan klaim keanggotaan Menwa UNJ.
                          </div>
                        ) : (
                          allUsers.filter(u => u.isMenwaMember || u.isVerifiedMenwa).map(u => (
                            <div key={u.uid} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-900 truncate">{u.displayName || 'Pengguna'}</span>
                                  {u.isVerifiedMenwa && <ShieldCheck size={14} className="text-blue-600 shrink-0" />}
                                </div>
                                <p className="text-[11px] text-slate-600 truncate">{u.email}</p>
                                <p className="text-[10px] font-mono text-[#006569] font-semibold">NIA: {u.menwaNia || '-'}</p>
                              </div>

                              <button
                                onClick={() => handleToggleVerification(u.uid, u.isVerifiedMenwa)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
                                  u.isVerifiedMenwa
                                    ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-sm'
                                }`}
                              >
                                {u.isVerifiedMenwa ? 'Cabut Centang Biru' : 'Verifikasi (Beri Centang Biru)'}
                              </button>
                            </div>
                          ))
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

      {/* Certificate Viewer Modal */}
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
