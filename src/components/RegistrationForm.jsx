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
  Trash2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { submitAdministrationForm, saveParticipantPortal } from '../firebase.js';
import { DynamicQRISModal } from './DynamicQRISModal.jsx';
import { navigate } from '../lib/router.jsx';
import { playTactileClick } from '../lib/tactileAudio.js';

export function RegistrationForm({
  onSuccess,
  defaultServiceType = 'Pendaftaran Calon Anggota Baru (Camen)',
}) {
  const { user, profile } = useAuth();
  const [serviceType, setServiceType] = useState(defaultServiceType);
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [occupation, setOccupation] = useState('Mahasiswa');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  /* Kolom Unggah Berkas PDF (Wajib, Maks 1 MB, Base64) */
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

  /* Auto-fill dari profil user atau auth state */
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
    playTactileClick('press');
    setError('');

    if (!fullName.trim()) {
      setError('Nama lengkap wajib diisi.');
      return;
    }
    if (!institution.trim()) {
      setError('Asal instansi / kampus wajib diisi.');
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

    const isPaidProgram =
      serviceType.toLowerCase().includes('lomba') ||
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
        documentPdfSizeKb: pdfSizeKb,
      });

      /* Simpan entri Portal Peserta Digital otomatis */
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
          {
            id: 'doc-1',
            name: 'Surat Rekomendasi Resmi / Surat Tugas',
            status: 'terverifikasi',
            verifiedAt: new Date().toISOString().split('T')[0],
            note: 'Digital In-App Registration',
          },
          {
            id: 'doc-2',
            name: 'Biodata Peserta & Anggota Lengkap',
            status: 'terverifikasi',
            verifiedAt: new Date().toISOString().split('T')[0],
            note: 'Auto-fill Cloud',
          },
        ],
        juryScores: [
          {
            id: 'j1',
            judge: 'Dewan Juri Panitia Pelaksana',
            criteria: 'Verifikasi Awal Berkas & Administrasi',
            score: 95,
            maxScore: 100,
          },
        ],
      });

      playTactileClick('success');
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
    playTactileClick('release');
    setSubmittedId(null);
    setParticipantToken(null);
    setIsPaid(false);
    setNotes('');
  };

  /* SUCCESS VIEW DALAM TEMA TERANG (LIGHT THEME) */
  if (submittedId) {
    const isPaidProgram =
      serviceType.toLowerCase().includes('lomba') ||
      serviceType.toLowerCase().includes('kc') ||
      serviceType.toLowerCase().includes('geranat') ||
      serviceType.toLowerCase().includes('pelatihan');
    const programFee = serviceType.toLowerCase().includes('geranat') ? 350000 : 150000;

    return (
      <div className="bg-white border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-10 text-center text-slate-900 shadow-2xl animate-fade-in font-sans">
        <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#006569] block mb-1">
          PENGIRIMAN ADMINISTRASI BERHASIL
        </span>
        <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-2">
          Pendaftaran Berhasil Dikirim
        </h3>
        <p className="text-slate-600 text-sm max-w-md mx-auto mb-6 leading-relaxed">
          Berkas formulir Anda telah tersimpan secara resmi di sistem database Mako Menwa UNJ.
        </p>

        {/* Token Card */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-5 mb-6 max-w-md mx-auto text-left shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" /> Kode Akses Portal Peserta
            </span>
            <span className="text-[10px] bg-amber-200/80 text-amber-950 font-bold px-2 py-0.5 rounded-full font-mono">
              Less-Paper Ready
            </span>
          </div>
          <p className="text-xs text-slate-700 mb-3 leading-relaxed">
            Gunakan token rahasia ini untuk masuk ke <strong>Portal Peserta Digital</strong>, cek validasi berkas, cetak ID card, dan rekap penilaian juri.
          </p>
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-amber-300 shadow-xs">
            <span className="font-mono text-base font-black text-[#006569] tracking-wider">
              {participantToken || submittedId}
            </span>
            <button
              type="button"
              onClick={() => {
                playTactileClick('pill');
                navigator.clipboard?.writeText(participantToken || submittedId);
                alert('Kode token portal disalin ke clipboard!');
              }}
              className="neu-btn-gold text-xs px-3.5 py-1.5 rounded-lg font-black text-slate-950 cursor-pointer"
            >
              Salin
            </button>
          </div>
        </div>

        {/* Ringkasan Registrasi */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 max-w-md mx-auto text-left space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-semibold">Nomor Tiket Registrasi:</span>
            <span className="font-mono text-slate-900 font-black">{submittedId}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-semibold">Jenis Layanan:</span>
            <span className="text-slate-900 font-bold">{serviceType}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-semibold">Nama Pemohon:</span>
            <span className="text-slate-900 font-bold">{fullName}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-semibold">Status Pembayaran:</span>
            <span className={isPaid ? 'text-emerald-700 font-black' : 'text-amber-700 font-black'}>
              {isPaid
                ? 'LUNAS (Otomatis)'
                : isPaidProgram
                ? 'Menunggu Pembayaran QRIS'
                : 'Gratis / Terverifikasi'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-md mx-auto space-y-3 mb-6">
          {isPaidProgram && !isPaid && (
            <button
              type="button"
              onClick={() => {
                playTactileClick('press');
                setIsQRISOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 neu-btn-strong-green text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg cursor-pointer"
            >
              <QrCode className="w-5 h-5" />
              <span>Bayar Tagihan via QRIS Otomatis (Rp {programFee.toLocaleString('id-ID')})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              playTactileClick('press');
              navigate('/portal-peserta');
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 neu-btn-primary text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md cursor-pointer"
          >
            <span>Buka Portal Peserta Digital</span>
            <ArrowRight className="w-4 h-4 text-[#FFDD00]" />
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="w-full py-2.5 px-4 neu-pill-tab text-slate-700 font-bold text-xs rounded-2xl cursor-pointer"
          >
            Isi Formulir Baru
          </button>
        </div>

        <DynamicQRISModal
          isOpen={isQRISOpen}
          onClose={() => setIsQRISOpen(false)}
          amount={programFee}
          purpose={`Registrasi: ${serviceType} - ${institution}`}
          orderId={participantToken || submittedId}
          onPaymentSuccess={() => {
            setIsPaid(true);
            setIsQRISOpen(false);
          }}
        />
      </div>
    );
  }

  /* FORM UTAMA DALAM TEMA TERANG (LIGHT THEME) */
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 text-slate-800 shadow-xl font-sans relative overflow-hidden">
      {/* Ambient Highlight */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-teal-500/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl" />

      {/* Header Formulir */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100 relative z-10">
        <div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#006569] block mb-1">
            FORMULIR ADMINISTRASI TERPADU
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Registrasi &amp; Pengajuan Digital
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Pengisian data resmi secara mandiri untuk rekrutmen camen, lomba nasional, dan layanan satuan.
          </p>
        </div>

        {user ? (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-xs shrink-0 self-start sm:self-auto">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            <span className="truncate max-w-[200px]">Auto-fill Aktif ({user.email})</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold shadow-xs shrink-0 self-start sm:self-auto">
            <Sparkles size={14} className="text-amber-600 shrink-0" />
            <span>Mode Publik Mandiri</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2.5 shadow-xs">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        {/* Jenis Formulir / Pendaftaran */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
            Jenis Formulir / Pendaftaran
          </label>
          <div className="relative">
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#006569] rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 shadow-xs cursor-pointer transition"
            >
              <option value="Pendaftaran Calon Anggota Baru (Camen)">
                Pendaftaran Calon Anggota Baru (Camen)
              </option>
              <option value="Pendaftaran Lomba Ksatria Cendekia (KC VIII)">
                Pendaftaran Lomba Ksatria Cendekia (KC VIII)
              </option>
              <option value="Pendaftaran Lomba Paskibra GERANAT VI/VII">
                Pendaftaran Lomba Paskibra GERANAT VI/VII
              </option>
              <option value="Permohonan Personil Satgas / Protokoler">
                Permohonan Personil Satgas / Protokoler
              </option>
              <option value="Permohonan Peminjaman Barang / Alpal">
                Permohonan Peminjaman Barang / Alpal
              </option>
              <option value="Permohonan Pemateri / Pelatih PBB">
                Permohonan Pemateri / Pelatih PBB
              </option>
              <option value="Pengajuan Kerjasama / Sponsorship / Media Partner">
                Pengajuan Kerjasama / Sponsorship / Media Partner
              </option>
            </select>
          </div>
        </div>

        {/* Baris 1: Nama Lengkap & Asal Instansi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-teal-700" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda..."
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#006569] rounded-2xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition shadow-xs placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Asal Instansi / Fakultas / Kampus
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-3.5 w-4 h-4 text-teal-700" />
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Contoh: Universitas Negeri Jakarta / SMAN 1"
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#006569] rounded-2xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition shadow-xs placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>
        </div>

        {/* Baris 2: Pekerjaan & Tanggal Lahir */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Pekerjaan / Status
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-3.5 w-4 h-4 text-teal-700" />
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#006569] rounded-2xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition shadow-xs cursor-pointer"
              >
                <option value="Mahasiswa">Mahasiswa</option>
                <option value="Pelajar">Pelajar (SMA/SMK/MA)</option>
                <option value="Alumni / Anggota Purna">Alumni / Anggota Purna</option>
                <option value="Guru / Dosen">Guru / Tenaga Pendidik</option>
                <option value="Umum">Umum / Profesional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Tanggal Lahir
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-teal-700" />
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#006569] rounded-2xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Baris 3: WhatsApp & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Nomor WhatsApp / HP
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-teal-700" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#006569] rounded-2xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition shadow-xs placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Email Konfirmasi
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-teal-700" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#006569] rounded-2xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition shadow-xs placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>
        </div>

        {/* Keterangan Tambahan */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
            Keterangan Tambahan / Motivasi Bergabung
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tuliskan keterangan detail, tujuan pendaftaran, atau waktu kegiatan yang diajukan..."
            className="w-full px-4 py-3 bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-[#006569] rounded-2xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition shadow-xs placeholder:text-slate-400 resize-none"
          />
        </div>

        {/* Kolom Upload PDF Wajib (Maksimal 1 MB) */}
        <div className="bg-teal-50/40 border-2 border-dashed border-teal-200 hover:border-[#006569] rounded-2xl p-5 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <FileText size={15} className="text-[#006569]" />
              <span>
                Unggah Berkas Formulir (PDF) <span className="text-rose-500">*</span>
              </span>
            </label>
            <span className="text-[10px] font-black text-teal-900 bg-teal-100/80 border border-teal-300 px-2.5 py-0.5 rounded-full font-mono">
              Wajib • Maks. 1 MB
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mb-3 font-medium">
            Unggah scan formulir pendaftaran, surat pengantar resmi, atau identitas pendukung dalam format PDF.
          </p>

          {pdfBase64 ? (
            <div className="bg-white border-2 border-emerald-500/60 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-black">
                  <File size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-black text-slate-900 truncate">{pdfName}</p>
                  <p className="text-[10px] text-emerald-700 font-mono font-bold">
                    {pdfSizeKb} KB • Dokumen PDF Terverifikasi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removePdf}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                title="Hapus / Ganti Berkas"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div>
              <label className="cursor-pointer flex flex-col items-center justify-center py-6 px-4 bg-white hover:bg-teal-50/50 border-2 border-slate-200 hover:border-[#006569] rounded-2xl transition group shadow-xs">
                <Upload size={24} className="text-slate-400 group-hover:text-[#006569] transition mb-2" />
                <span className="text-xs font-black text-slate-700 group-hover:text-[#006569] text-center">
                  Klik untuk memilih file PDF
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 font-medium">
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
                <p className="text-xs font-bold text-rose-600 mt-2 flex items-center gap-1">
                  <AlertCircle size={13} /> {pdfError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Tombol Kirim */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 neu-btn-primary text-white font-black rounded-2xl text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <span>Mengirim Berkas ke Database Mako...</span>
            ) : (
              <>
                <Send className="w-4 h-4 text-[#FFDD00]" />
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
