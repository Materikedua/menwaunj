import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Send, 
  AlertCircle, 
  FileText, 
  Building, 
  Briefcase, 
  Calendar, 
  Phone, 
  Mail, 
  User, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  QrCode,
  CreditCard,
  ExternalLink,
  Upload,
  File,
  Trash2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { submitAdministrationForm, saveParticipantPortal } from '../firebase.js';
import { DynamicQRISModal } from './DynamicQRISModal.jsx';
import { navigate } from '../lib/router.jsx';

export function RegistrationForm({ onSuccess, defaultServiceType = 'Pendaftaran Calon Anggota Baru' }) {
  const { user, profile, loading } = useAuth();

  const [serviceType, setServiceType] = useState(defaultServiceType);
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [occupation, setOccupation] = useState('Mahasiswa');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Kolom Unggah Berkas PDF (Wajib, Maks 1 MB, Base64)
  const [pdfBase64, setPdfBase64] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [pdfSizeKb, setPdfSizeKb] = useState(0);
  const [pdfError, setPdfError] = useState('');

  const handlePdfChange = (e) => {
    const file = e.target.files?.[0];
    setPdfError('');
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setPdfError('Hanya berkas berformat PDF yang diperbolehkan.');
      return;
    }

    if (file.size > 1048576) {
      setPdfError(`Ukuran berkas (${(file.size / 1024 / 1024).toFixed(2)} MB) melebihi batas maksimal 1 MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPdfBase64(event.target.result);
      setPdfName(file.name);
      setPdfSizeKb(Math.round(file.size / 1024));
    };
    reader.onerror = () => {
      setPdfError('Gagal membaca berkas PDF.');
    };
    reader.readAsDataURL(file);
  };

  const removePdf = () => {
    setPdfBase64('');
    setPdfName('');
    setPdfSizeKb(0);
    setPdfError('');
  };
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedId, setSubmittedId] = useState(null);
  const [participantToken, setParticipantToken] = useState(null);
  const [isQRISOpen, setIsQRISOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Auto-fill dari profil user atau auth state
  useEffect(() => {
    if (profile) {
      if (profile.displayName) setFullName(profile.displayName);
      if (profile.institution) setInstitution(profile.institution);
      if (profile.occupation) setOccupation(profile.occupation);
      if (profile.birthDate) setBirthDate(profile.birthDate);
      if (profile.phone) setPhone(profile.phone);
      if (profile.email) setEmail(profile.email);
    } else if (user) {
      if (user.displayName) setFullName(user.displayName);
      if (user.email) setEmail(user.email);
    }
  }, [profile, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Nama lengkap wajib diisi.');
      return;
    }
    if (!institution.trim()) {
      setError('Asal instansi wajib diisi.');
      return;
    }
    if (!birthDate) {
      setError('Tanggal lahir wajib diisi.');
      return;
    }
    if (!phone.trim()) {
      setError('Nomor kontak WhatsApp/telepon wajib diisi.');
      return;
    }

    if (!pdfBase64) {
      setError('Wajib mengunggah berkas formulir/dokumen pendukung dalam format PDF (maksimal 1 MB).');
      return;
    }

    const isPaidProgram = serviceType.toLowerCase().includes('lomba') || 
                          serviceType.toLowerCase().includes('kc') || 
                          serviceType.toLowerCase().includes('geranat') || 
                          serviceType.toLowerCase().includes('pelatihan');
    const programFee = serviceType.toLowerCase().includes('geranat') ? 350000 : 150000;

    setSubmitting(true);
    try {
      const token = `REG-${Date.now().toString(36).substring(3, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const submissionId = await submitAdministrationForm({
        serviceType,
        fullName: fullName.trim(),
        institution: institution.trim(),
        occupation,
        birthDate,
        phone: phone.trim(),
        email: email || user?.email || '',
        notes: notes.trim(),
        participantToken: token,
        applicantUid: user?.uid || 'anonymous',
        documentPdfBase64: pdfBase64,
        documentPdfName: pdfName,
        documentPdfSizeKb: pdfSizeKb
      });

      // Simpan entri Portal Peserta Digital otomatis
      await saveParticipantPortal({
        token,
        programSlug: serviceType.toLowerCase().includes('geranat') ? 'geranat' : 'kc',
        programTitle: serviceType,
        applicantUid: user?.uid || 'anonymous',
        applicantName: fullName.trim(),
        teamName: `Kontingen ${institution.trim()}`,
        institution: institution.trim(),
        registrationNumber: `REG-${Math.floor(10 + Math.random() * 89)}`,
        performanceTimeSlot: 'Jadwal Ditentukan Panitia Saat Technical Meeting',
        paymentStatus: isPaid ? 'LUNAS' : 'menunggu_verifikasi',
        amount: isPaidProgram ? programFee : 0,
        createdAt: new Date().toISOString(),
        documents: [
          { id: 'doc-1', name: 'Surat Rekomendasi Resmi / Surat Tugas', status: 'terverifikasi', verifiedAt: new Date().toISOString().split('T')[0], note: 'Digital In-App Registration' },
          { id: 'doc-2', name: 'Biodata Peserta & Anggota Lengkap', status: 'terverifikasi', verifiedAt: new Date().toISOString().split('T')[0], note: 'Auto-fill Cloud' }
        ],
        juryScores: [
          { id: 'j1', judge: 'Dewan Juri Panitia Pelaksana', criteria: 'Verifikasi Awal Berkas & Administrasi', score: 95, maxScore: 100 }
        ]
      });

      setSubmittedId(submissionId);
      setParticipantToken(token);
      if (onSuccess) {
        onSuccess(submissionId);
      }
    } catch (err) {
      console.error('Gagal mengirim formulir:', err);
      setError('Gagal mengirim formulir. Pastikan Anda telah masuk dengan akun.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedId(null);
    setParticipantToken(null);
    setIsPaid(false);
    setNotes('');
  };

  if (submittedId) {
    const isPaidProgram = serviceType.toLowerCase().includes('lomba') || 
                          serviceType.toLowerCase().includes('kc') || 
                          serviceType.toLowerCase().includes('geranat') || 
                          serviceType.toLowerCase().includes('pelatihan');
    const programFee = serviceType.toLowerCase().includes('geranat') ? 350000 : 150000;

    return (
      <div className="bg-slate-900/95 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 text-center text-white backdrop-blur-md shadow-2xl">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
          Pendaftaran Berhasil Dikirim
        </h3>
        <p className="text-slate-300 text-sm max-w-md mx-auto mb-6">
          Berkas formulir Anda telah tersimpan secara otomatis di sistem database Mako Menwa UNJ.
        </p>
        
        {/* Token Card */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-xl p-4 mb-6 max-w-md mx-auto text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Kode Akses Portal Peserta
            </span>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-mono">
              Less-Paper Ready
            </span>
          </div>
          <p className="text-xs text-slate-300 mb-3">
            Gunakan token rahasia ini untuk masuk ke <strong>Portal Peserta Digital</strong>, cek validasi berkas, cetak ID card, dan rekap penilaian juri.
          </p>
          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="font-mono text-sm sm:text-base font-bold text-amber-400 tracking-wider">
              {participantToken || submittedId}
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(participantToken || submittedId);
                alert('Kode token portal disalin ke clipboard!');
              }}
              className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded transition-colors"
            >
              Salin
            </button>
          </div>
        </div>

        {/* Ringkasan Registrasi */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6 max-w-md mx-auto text-left space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Nomor Tiket Registrasi:</span>
            <span className="font-mono text-slate-200 font-semibold">{submittedId}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Jenis Layanan:</span>
            <span className="text-slate-200">{serviceType}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Nama Pemohon:</span>
            <span className="text-slate-200">{fullName}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Status Pembayaran:</span>
            <span className={isPaid ? "text-emerald-400 font-semibold" : "text-amber-400 font-medium"}>
              {isPaid ? "LUNAS (Otomatis)" : (isPaidProgram ? "Menunggu Pembayaran QRIS" : "Gratis / Terverifikasi")}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-md mx-auto space-y-3 mb-6">
          {isPaidProgram && !isPaid && (
            <button
              type="button"
              onClick={() => setIsQRISOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <QrCode className="w-5 h-5" />
              <span>Bayar Tagihan via QRIS Otomatis (Rp {programFee.toLocaleString('id-ID')})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              navigate('/portal-peserta');
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-950/40 transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Buka Portal Peserta Digital</span>
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Isi Formulir Baru
          </button>
        </div>

        {/* Dynamic QRIS Modal */}
        <DynamicQRISModal
          isOpen={isQRISOpen}
          onClose={() => setIsQRISOpen(false)}
          amount={programFee}
          purposeName={`${serviceType} - ${fullName}`}
          invoiceId={participantToken || submittedId}
          onPaymentSuccess={() => {
            setIsPaid(true);
            setIsQRISOpen(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-2xl">
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold text-amber-400 tracking-wider uppercase">
            Formulir Administrasi Terpadu
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Registrasi & Pengajuan Digital
          </h2>
        </div>
        {user ? (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="truncate max-w-[150px] sm:max-w-none">Auto-fill Aktif ({user.email})</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
            <Lock className="w-4 h-4 shrink-0" />
            <span>Mode Tamu (Daftar Akun untuk Simpan Otomatis)</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Jenis Formulir / Pendaftaran
          </label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          >
            <option value="Pendaftaran Calon Anggota Baru">Pendaftaran Calon Anggota Baru (Camen)</option>
            <option value="Permohonan Personel Lapangan">Permohonan Dukungan Personel & Pengamanan</option>
            <option value="Peminjaman Sarana Prasarana">Peminjaman Sarana & Prasarana</option>
            <option value="Permohonan Instruktur / Pelatih">Permohonan Instruktur Kepemimpinan / PBB</option>
            <option value="Kerjasama Kemitraan & Sponsor">Kerjasama Kemitraan, Publikasi & Sponsor</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="cth. Praditya Yudha"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Asal Instansi / Fakultas / Kampus
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="cth. Universitas Negeri Jakarta"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Pekerjaan / Status
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              >
                <option value="Mahasiswa">Mahasiswa</option>
                <option value="TNI/Polri">TNI / Polri</option>
                <option value="Pemerintahan">ASN / Pemerintahan</option>
                <option value="Karyawan Swasta">Karyawan Swasta</option>
                <option value="Umum">Umum / Profesional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Tanggal Lahir
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Nomor WhatsApp / HP
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Konfirmasi
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Keterangan Tambahan / Motivasi Bergabung
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tuliskan keterangan detail, tujuan pendaftaran, atau waktu kegiatan yang diajukan..."
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 resize-none"
          />
        </div>

        {/* Kolom Upload PDF Wajib (Maksimal 1 MB) */}
        <div className="bg-slate-950/80 border-2 border-dashed border-slate-800 hover:border-amber-400/60 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <FileText size={14} className="text-amber-400" />
              <span>Unggah Berkas Formulir (PDF) <span className="text-rose-400">*</span></span>
            </label>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
              Wajib • Maks. 1 MB
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Unggah scan formulir pendaftaran, surat pengantar resmi, atau identitas pendukung dalam format PDF.
          </p>

          {pdfBase64 ? (
            <div className="bg-slate-900 border border-emerald-500/50 rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <File size={18} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-100 truncate">
                    {pdfName}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono">
                    {pdfSizeKb} KB • Terenkripsi Base64 siap disimpan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removePdf}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                title="Hapus / Ganti Berkas"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div>
              <label className="cursor-pointer flex flex-col items-center justify-center py-5 px-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition group">
                <Upload size={22} className="text-slate-500 group-hover:text-amber-400 transition mb-1.5" />
                <span className="text-xs font-bold text-slate-300 group-hover:text-amber-400 text-center">
                  Klik untuk memilih file PDF
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  Format dokumen .PDF saja (Ukuran maksimal 1 MB)
                </span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfChange}
                  className="hidden"
                />
              </label>
              {pdfError && (
                <p className="text-xs font-semibold text-rose-400 mt-2 flex items-center gap-1">
                  <AlertCircle size={13} /> {pdfError}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-6 bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-700 hover:to-amber-600 text-white font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-red-900/30 disabled:opacity-50"
          >
            {submitting ? (
              <span>Mengirim Berkas...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Kirim Formulir Administrasi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegistrationForm;
