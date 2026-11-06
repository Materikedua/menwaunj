import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  Send,
  FileText,
  User,
  Sparkles,
  Clock,
  Copy,
  Check,
  AlertCircle,
  Upload,
  File,
  Trash2
} from 'lucide-react';
import { useAuth } from '../lib/authContext';
import { submitAdministrationForm } from '../lib/firebase';

export function AdministrationFormModal({ isOpen, onClose, initialItem, onOpenAccountModal }) {
  const { user, profile, refreshSubmissions } = useAuth();
  const [serviceType, setServiceType] = useState('pendaftaran_camen');
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [occupation, setOccupation] = useState('Mahasiswa');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [personCount, setPersonCount] = useState('');
  const [itemDetails, setItemDetails] = useState('');

  /* Kolom Unggah Berkas PDF (Hanya untuk Permohonan & Pengajuan, Maks 1 MB, Base64) */
  const [pdfBase64, setPdfBase64] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [pdfSizeKb, setPdfSizeKb] = useState(0);
  const [pdfError, setPdfError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [copied, setCopied] = useState(false);

  /* Kategori layanan sesuai Spesifikasi: Pendaftaran -> TANPA PDF | Permohonan & Pengajuan -> WAJIB PDF */
  const isPendaftaran = serviceType.startsWith('pendaftaran_');
  const isPermohonan = serviceType.startsWith('permohonan_');
  const requiresPdf = !isPendaftaran;
  const serviceCategory = isPendaftaran ? 'pendaftaran' : isPermohonan ? 'permohonan' : 'pengajuan';

  /* Inisialisasi data form ketika modal dibuka */
  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title || '');
      const t = (initialItem.title || '').toLowerCase();
      const c = (initialItem.category || '').toLowerCase();
      if (t.includes('calon anggota') || c.includes('camen') || t.includes('rekrutmen')) {
        setServiceType('pendaftaran_camen');
      } else if (t.includes('peserta') || t.includes('youth spark') || t.includes('ksatria cendekia')) {
        setServiceType('pendaftaran_kegiatan');
      } else if (t.includes('diklat') || t.includes('pelatihan')) {
        setServiceType('pendaftaran_pelatihan');
      } else if (t.includes('personil') || t.includes('personel') || t.includes('keamanan')) {
        setServiceType('permohonan_personel');
      } else if (t.includes('peminjaman') || c.includes('sarana') || t.includes('barang')) {
        setServiceType('permohonan_sarpras');
      } else if (t.includes('pemateri') || t.includes('instruktur')) {
        setServiceType('permohonan_instruktur');
      } else if (t.includes('dispensasi')) {
        setServiceType('pengajuan_dispensasi');
      } else if (t.includes('izin')) {
        setServiceType('pengajuan_izin');
      } else {
        setServiceType('pengajuan_kerjasama');
      }
    }
  }, [initialItem]);

  /* Bersihkan error PDF apabila beralih ke Pendaftaran */
  useEffect(() => {
    if (!requiresPdf) {
      setPdfError('');
    }
  }, [requiresPdf]);

  /* AUTO-FILL: Otomatis membaca profil pengguna yang sedang login */
  useEffect(() => {
    if (profile) {
      if (profile.displayName) setFullName(profile.displayName);
      if (profile.institution) setInstitution(profile.institution);
      if (profile.occupation) setOccupation(profile.occupation);
      if (profile.birthDate) setBirthDate(profile.birthDate);
      if (profile.phone) setPhone(profile.phone);
    }
    if (user?.email) {
      setEmail(user.email);
    }
  }, [profile, user]);

  const handlePdfChange = (e) => {
    const file = e.target.files?.[0];
    setPdfError('');
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setPdfError('Hanya berkas dokumen berformat PDF yang diperbolehkan.');
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

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!user) {
      setError('Silakan masuk atau buat akun terlebih dahulu agar berkas terhubung resmi dengan akun Anda.');
      return;
    }
    if (!fullName.trim() || !institution.trim() || !birthDate || !phone.trim() || !purpose.trim()) {
      setError('Mohon lengkapi semua kolom wajib.');
      return;
    }
    /* Validasi PDF HANYA jika kategori adalah Permohonan atau Pengajuan */
    if (requiresPdf && !pdfBase64) {
      setError(
        isPermohonan
          ? 'Wajib mengunggah Surat Permohonan Resmi dalam format PDF (maksimal 1 MB).'
          : 'Wajib mengunggah Proposal / Dokumen Pengajuan dalam format PDF (maksimal 1 MB).'
      );
      return;
    }

    setSubmitting(true);
    try {
      const fullPurpose =
        `Detail: ${purpose}` +
        (personCount ? ` | Estimasi Personel/Peserta: ${personCount}` : '') +
        (itemDetails ? ` | Rincian Barang: ${itemDetails}` : '');

      const submissionId = await submitAdministrationForm({
        applicantUid: user?.uid || null,
        applicantEmail: user?.email || email.trim() || '',
        uid: user?.uid || null,
        serviceType,
        category: serviceCategory,
        fullName: fullName.trim(),
        institution: institution.trim(),
        occupation,
        birthDate,
        phone: phone.trim(),
        email: email || user?.email || '',
        title: title || (isPendaftaran ? 'Pendaftaran Anggota / Kegiatan' : 'Pengajuan Administrasi Satuan'),
        purpose: fullPurpose,
        eventDate: eventDate || new Date().toISOString().slice(0, 10),
        documentPdfBase64: requiresPdf ? pdfBase64 : null,
        documentPdfName: requiresPdf ? pdfName : null,
        documentPdfSizeKb: requiresPdf ? pdfSizeKb : 0
      });

      refreshSubmissions();
      setReceipt({
        submissionId,
        serviceType,
        category: serviceCategory,
        title: title || 'Pengajuan Layanan Satuan',
        fullName,
        institution,
        occupation,
        birthDate,
        documentPdfName: requiresPdf ? pdfName : null,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      setError('Gagal mengirim formulir: ' + (err.message || 'Coba lagi nanti'));
    } finally {
      setSubmitting(false);
    }
  };

  const copyReceiptCode = () => {
    if (receipt?.submissionId) {
      navigator.clipboard.writeText(receipt.submissionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const pdfUploadTitle = isPermohonan
    ? 'Unggah Surat Permohonan Resmi (PDF, maks 1 MB)'
    : 'Unggah Proposal/Dokumen Pengajuan (PDF, maks 1 MB)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl neu-card rounded-[2.5rem] bg-gradient-to-br from-[#EEF5F6] via-[#F5F8F6] to-[#F9FBFA] border-2 border-white/85 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal 3D */}
        <div className="bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] px-6 py-5 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FFDD00] to-[#F59E0B] text-slate-950 flex items-center justify-center font-black shadow-md border border-white/40 shrink-0">
              <FileText size={22} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-widest font-black text-[#FFDD00] block truncate">
                Formulir Administrasi Digital In-App
              </span>
              <h3 className="font-black text-base sm:text-lg tracking-tight text-white truncate">
                {title || 'Layanan Administrasi & Pendaftaran Menwa UNJ'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition border border-white/20 shrink-0 cursor-pointer shadow-sm hover:scale-105"
            aria-label="Tutup formulir"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 md:p-8 overflow-y-auto flex-grow space-y-6">
          {receipt ? (
            /* Tampilan Tanda Terima Digital Seketika */
            <div className="space-y-6 text-center py-3">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg border-2 border-white">
                <CheckCircle size={36} />
              </div>
              <div>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Formulir Berhasil Dikirim &amp; Tersimpan!
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto font-medium leading-relaxed">
                  Data Anda telah tersimpan secara cloud di sistem administrasi Menwa UNJ dan otomatis tersinkron ke akun Anda.
                </p>
              </div>

              {/* Kartu Bukti Tanda Terima 3D */}
              <div className="neu-card-sm rounded-3xl p-6 text-left space-y-4 max-w-lg mx-auto border border-white/80">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">
                      Kode Registrasi
                    </span>
                    <span className="font-mono font-black text-lg text-[#006569]">{receipt.submissionId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={copyReceiptCode}
                    className="flex items-center gap-1.5 px-3.5 py-2 neu-btn text-xs font-black text-slate-700 rounded-xl transition cursor-pointer"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>{copied ? 'Tersalin' : 'Salin Kode'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">Nama Pemohon:</span>
                    <span className="font-bold text-slate-800">{receipt.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">Asal Instansi:</span>
                    <span className="font-bold text-slate-800">{receipt.institution}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">Kategori Layanan:</span>
                    <span className="font-black text-slate-800 uppercase tracking-wide">{receipt.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">Lampiran Berkas:</span>
                    <span className="font-bold text-slate-800">
                      {receipt.documentPdfName ? receipt.documentPdfName : '✓ Tanpa lampiran dokumen'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 neu-inset rounded-2xl text-[11px] text-amber-900 font-medium flex items-center gap-2.5">
                  <Clock size={16} className="shrink-0 text-amber-700" />
                  <span>
                    Status: <strong>Menunggu Konfirmasi Staf Piket Mako</strong>. Anda dapat memantau status di menu profil akun.
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setReceipt(null);
                    onClose();
                  }}
                  className="px-8 py-3.5 neu-btn-primary rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Selesai &amp; Kembali
                </button>
              </div>
            </div>
          ) : (
            /* Formulir Input Interaktif In-App */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Notifikasi Indikator Auto-Fill */}
              {user ? (
                <div className="p-4 neu-card-sm rounded-2xl flex items-center justify-between gap-3 border border-emerald-300/40 bg-gradient-to-r from-emerald-50/80 to-[#F5F8F6]">
                  <div className="flex items-center gap-2.5 text-xs text-emerald-950 font-medium min-w-0">
                    <Sparkles size={16} className="text-emerald-700 shrink-0" />
                    <span className="truncate">
                      <strong>Auto-Fill Aktif:</strong> Data Anda terbaca otomatis dari akun <strong>{user.email}</strong>.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAccountModal}
                    className="text-[11px] font-black text-[#006569] hover:underline shrink-0 cursor-pointer"
                  >
                    Edit Profil Akun
                  </button>
                </div>
              ) : (
                <div className="p-4 neu-card-sm rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-amber-300/40 bg-gradient-to-r from-amber-50/80 to-[#F5F8F6]">
                  <div className="flex items-center gap-2.5 text-xs text-amber-950 font-medium">
                    <AlertCircle size={16} className="text-amber-700 shrink-0" />
                    <span>Masuk dengan Google atau Email agar formulir terisi otomatis dan tersimpan di akun Anda.</span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAccountModal}
                    className="px-4 py-2 neu-btn-primary rounded-xl text-xs font-black shadow-sm shrink-0 whitespace-nowrap cursor-pointer"
                  >
                    Masuk Sekarang
                  </button>
                </div>
              )}

              {error && (
                <div className="p-4 neu-inset rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2.5 border border-rose-300">
                  <AlertCircle size={16} className="shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Pemilih Jenis Layanan dengan optgroup & Badge Status */}
              <div className="neu-card-sm rounded-3xl p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-[#092D32]">
                    Pilih Jenis Layanan Administrasi <span className="text-rose-500">*</span>
                  </label>
                  {isPendaftaran ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 border border-emerald-300 px-3 py-1 text-[11px] font-black text-emerald-900 shadow-sm">
                      ✓ Tanpa lampiran dokumen
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 border border-amber-300 px-3 py-1 text-[11px] font-black text-amber-950 shadow-sm">
                      📎 Wajib lampirkan dokumen PDF
                    </span>
                  )}
                </div>

                <div className="neu-inset rounded-2xl p-1">
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-transparent rounded-xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <optgroup label="Pendaftaran (Tanpa Upload PDF)">
                      <option value="pendaftaran_camen">Pendaftaran Calon Anggota Menwa (Camen)</option>
                      <option value="pendaftaran_kegiatan">Pendaftaran Peserta Kegiatan (KC / Youth Spark)</option>
                      <option value="pendaftaran_pelatihan">Pendaftaran Pelatihan / Diklat</option>
                    </optgroup>
                    <optgroup label="Permohonan (Wajib Upload PDF ≤ 1 MB)">
                      <option value="permohonan_personel">Permohonan Bantuan Personel / Keamanan</option>
                      <option value="permohonan_instruktur">Permohonan Pemateri / Instruktur / Pelatih</option>
                      <option value="permohonan_sarpras">Permohonan Peminjaman Barang / Sarana Prasarana</option>
                    </optgroup>
                    <optgroup label="Pengajuan (Wajib Upload PDF ≤ 1 MB)">
                      <option value="pengajuan_kerjasama">Pengajuan Kerjasama / MoU / Sponsorship</option>
                      <option value="pengajuan_dispensasi">Pengajuan Surat Dispensasi Kegiatan</option>
                      <option value="pengajuan_izin">Pengajuan Izin Kegiatan / Penggunaan Tempat</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Data Pokok Pemohon */}
              <div className="space-y-4 pt-1">
                <div className="border-b border-slate-200/80 pb-2">
                  <h4 className="font-black text-xs uppercase tracking-wider text-[#092D32] flex items-center gap-2">
                    <User size={15} className="text-[#006569]" />
                    <span>Identitas Pemohon (Data Pokok Terhubung Akun)</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <div className="neu-inset rounded-2xl px-3.5 py-1">
                      <input
                        type="text"
                        required
                        placeholder="Masukkan nama lengkap"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full py-2 bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Asal Instansi / Universitas <span className="text-rose-500">*</span>
                    </label>
                    <div className="neu-inset rounded-2xl px-3.5 py-1">
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Universitas Negeri Jakarta / Kodim"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="w-full py-2 bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Pekerjaan / Status <span className="text-rose-500">*</span>
                    </label>
                    <div className="neu-inset rounded-2xl px-3.5 py-1">
                      <select
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        className="w-full py-2 bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                      >
                        <option value="Mahasiswa">Mahasiswa</option>
                        <option value="TNI/Polri">TNI/Polri</option>
                        <option value="Pemerintahan">Pemerintahan / ASN</option>
                        <option value="Karyawan Swasta">Karyawan Swasta</option>
                        <option value="Umum">Umum</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tanggal Lahir <span className="text-rose-500">*</span>
                    </label>
                    <div className="neu-inset rounded-2xl px-3.5 py-1">
                      <input
                        type="date"
                        required
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full py-2 bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nomor WhatsApp / HP <span className="text-rose-500">*</span>
                    </label>
                    <div className="neu-inset rounded-2xl px-3.5 py-1">
                      <input
                        type="tel"
                        required
                        placeholder="0812-XXXX-XXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full py-2 bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Rincian Layanan */}
              <div className="space-y-4 pt-1">
                <div className="border-b border-slate-200/80 pb-2">
                  <h4 className="font-black text-xs uppercase tracking-wider text-[#092D32] flex items-center gap-2">
                    <FileText size={15} className="text-[#006569]" />
                    <span>Detail {isPendaftaran ? 'Pendaftaran' : isPermohonan ? 'Permohonan' : 'Pengajuan'}</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nama Kegiatan / Perihal
                    </label>
                    <div className="neu-inset rounded-2xl px-3.5 py-1">
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={
                          isPendaftaran
                            ? 'Contoh: Pendaftaran Diksarmil / Seminar Youth Spark'
                            : 'Contoh: Pengamanan Wisuda UNJ Ke-122'
                        }
                        className="w-full py-2 bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tanggal Pelaksanaan Giat
                    </label>
                    <div className="neu-inset rounded-2xl px-3.5 py-1">
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full py-2 bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {serviceType === 'permohonan_personel' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Jumlah Personel Yang Dibutuhkan (Orang)
                    </label>
                    <div className="neu-inset rounded-2xl px-3.5 py-1">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="Contoh: 10 personel"
                        value={personCount}
                        onChange={(e) => setPersonCount(e.target.value)}
                        className="w-full py-2 bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {serviceType === 'permohonan_sarpras' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Daftar Peralatan / Fasilitas Mako Yang Dipinjam
                    </label>
                    <div className="neu-inset rounded-2xl px-3.5 py-1">
                      <input
                        type="text"
                        placeholder="Contoh: 2 Unit Tenda Pleton Komando, 4 Buah Handy Talky"
                        value={itemDetails}
                        onChange={(e) => setItemDetails(e.target.value)}
                        className="w-full py-2 bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isPendaftaran ? 'Motivasi / Keterangan Pendaftaran' : 'Deskripsi Keperluan / Catatan Surat Tugas'}
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="neu-inset rounded-2xl p-2.5">
                    <textarea
                      required
                      rows={3}
                      placeholder={
                        isPendaftaran
                          ? 'Tuliskan fakultas/prodi, angkatan, serta motivasi mengikuti kegiatan/pendaftaran...'
                          : 'Jelaskan secara ringkas maksud tujuan pengajuan, lokasi acara, durasi kegiatan, atau kelengkapan berkas...'
                      }
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Kolom Upload PDF HANYA Tampil untuk Permohonan & Pengajuan */}
                {requiresPdf && (
                  <div className="neu-card-sm rounded-3xl p-5 border-2 border-dashed border-[#006569]/30 hover:border-[#006569] transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-black uppercase tracking-wider text-[#092D32] flex items-center gap-1.5">
                        <FileText size={15} className="text-[#006569]" />
                        <span>
                          {pdfUploadTitle} <span className="text-rose-500">*</span>
                        </span>
                      </label>
                      <span className="text-[10px] font-black text-amber-950 bg-amber-200/90 px-3 py-0.5 rounded-full shadow-sm">
                        📎 Wajib PDF • Maks. 1 MB
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mb-3 font-medium">
                      {isPermohonan
                        ? 'Unggah surat permohonan resmi dari instansi/kepanitiaan dalam format PDF (maksimal 1 MB).'
                        : 'Unggah dokumen proposal kegiatan, surat pengajuan, atau draf MoU dalam format PDF (maksimal 1 MB).'}
                    </p>

                    {pdfBase64 ? (
                      <div className="neu-card-sm rounded-2xl p-3.5 flex items-center justify-between gap-3 border border-emerald-400/50 bg-white">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-inner">
                            <File size={20} />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-black text-slate-900 truncate">{pdfName}</p>
                            <p className="text-[10px] text-slate-500 font-semibold">
                              {pdfSizeKb} KB • Terbaca dan siap dikirim
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removePdf}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                          title="Hapus / Ganti Berkas"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <label className="cursor-pointer flex flex-col items-center justify-center py-6 px-4 neu-inset rounded-2xl hover:bg-white/80 transition-all group">
                          <Upload
                            size={26}
                            className="text-slate-400 group-hover:text-[#006569] transition mb-2 group-hover:scale-110"
                          />
                          <span className="text-xs font-black text-slate-800 group-hover:text-[#006569] text-center">
                            Klik untuk memilih berkas PDF
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium mt-1">
                            Format: Dokumen .PDF saja (Ukuran maksimal 1.024 KB)
                          </span>
                          <input type="file" accept=".pdf,application/pdf" onChange={handlePdfChange} className="hidden" />
                        </label>
                        {pdfError && (
                          <p className="text-xs font-bold text-rose-600 mt-2.5 flex items-center gap-1.5">
                            <AlertCircle size={14} /> {pdfError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons 3D */}
              <div className="pt-4 border-t border-slate-200/80 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 neu-btn rounded-2xl text-slate-700 font-black text-xs cursor-pointer transition hover:text-[#092D32]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-7 py-3 neu-btn-primary rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg hover:shadow-xl transition flex items-center gap-2 disabled:opacity-60"
                >
                  <Send size={15} />
                  <span>
                    {submitting
                      ? 'Menyimpan ke Cloud...'
                      : isPendaftaran
                      ? 'Kirim Pendaftaran'
                      : 'Kirim Berkas Administrasi'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdministrationFormModal;
