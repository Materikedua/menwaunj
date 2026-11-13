import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Building,
  Calendar,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  FileCheck2,
  RefreshCw,
  X,
  Upload,
  Send,
  Trash2,
} from 'lucide-react';
import { getSubmissionById, submitAdministrationForm } from '../firebase.js';
import { useAuth } from '../lib/authContext.jsx';
import { playTactileClick } from '../lib/tactileAudio.js';
import { openOrDownloadPdf } from '../lib/pdfUtils.js';
import {
  findAdminuTicketByCode,
  updateLocalAdminuTicketLetterLink,
} from '../data/siteConfig';
import { linkLetterToAdminuTicketInCloud } from '../lib/firebaseCmsBridge';
import {
  isTicketApprovedForFormalSubmission,
  validatePdfAttachmentFile,
} from '../utils/adminuUtils';
import { sanitizeInput } from '../utils/security';

const OCCUPATION_OPTIONS = [
  'Mahasiswa',
  'TNI/Polri',
  'Pemerintahan',
  'Karyawan Swasta',
  'Umum',
  'Mitra / Ormawa',
];

function mapTicketToTrackerRecord(t) {
  if (!t) return null;
  return {
    id: t.ticketId,
    submissionId: t.linkedLetterNumber || t.ticketId,
    ticketId: t.ticketId,
    recordKind: 'adminu_ticket',
    ticket: t,
    linkedLetterNumber: t.linkedLetterNumber || '',
    fullName: t.applicantName || 'Pemohon',
    institution: t.institution || 'Instansi Terdaftar',
    phone: t.contactPhone || '',
    email: t.contactEmail || '',
    serviceType: t.serviceLabel || 'Layanan Smart Adminu',
    formTitle: t.eventName || t.serviceLabel || 'Permohonan Surat Resmi',
    status: t.status || 'DITERIMA',
    createdAt: t.createdAt,
    additionalNotes: t.notes || '',
    adminNotes: t.statusNote || '',
    documentPdfUrl: t.attachmentPdfUrl || '',
    documentPdfBase64: '',
    documentPdfName: t.attachmentPdfName || '',
    documentPdfSizeKb: t.attachmentPdfSizeKb || 0,
  };
}

export function LetterProgressSection({ initialId = '', onClose }) {
  const { user, profile } = useAuth();
  const [searchId, setSearchId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [letter, setLetter] = useState(null);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  // State Formulir Tahap 2 (Biodata + PDF Maks 1 MB setelah tiket disetujui)
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [occupation, setOccupation] = useState('Mahasiswa');
  const [birthDate, setBirthDate] = useState('2002-01-01');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfBase64, setPdfBase64] = useState('');
  const [pdfSizeKb, setPdfSizeKb] = useState(0);
  const [stage2Error, setStage2Error] = useState('');
  const [stage2Submitting, setStage2Submitting] = useState(false);
  const [issuedLetterNumber, setIssuedLetterNumber] = useState('');

  const hydrateStage2Form = useCallback(
    (record) => {
      if (!record) return;
      setFullName(
        sanitizeInput(profile?.displayName || user?.displayName || record.fullName || '', 120)
      );
      setInstitution(
        sanitizeInput(profile?.institution || record.institution || '', 150)
      );
      setOccupation(
        sanitizeInput(profile?.occupation || 'Mahasiswa', 50)
      );
      setBirthDate(sanitizeInput(profile?.birthDate || '2002-01-01', 20));
      setPhone(sanitizeInput(profile?.phone || record.phone || '', 30));
      setEmail(sanitizeInput(user?.email || record.email || '', 150));
      setNotes(sanitizeInput(record.additionalNotes || '', 900));
      setPdfFileName('');
      setPdfBase64('');
      setPdfSizeKb(0);
      setStage2Error('');
      setIssuedLetterNumber(record.linkedLetterNumber || '');
    },
    [profile, user]
  );

  const performLookup = useCallback(
    async (rawQuery) => {
      const clean = String(rawQuery || '').trim();
      if (!clean) return;

      playTactileClick('press');
      setLoading(true);
      setSearched(true);
      setLetter(null);
      setStage2Error('');
      setIssuedLetterNumber('');

      try {
        let res = await getSubmissionById(clean);
        if (!res) {
          const localTicket = findAdminuTicketByCode(clean);
          if (localTicket) {
            res = mapTicketToTrackerRecord(localTicket);
          }
        }
        setLetter(res);
        if (res) {
          hydrateStage2Form(res);
          playTactileClick('success');
        } else {
          playTactileClick('release');
        }
      } catch {
        const localTicket = findAdminuTicketByCode(clean);
        if (localTicket) {
          const mapped = mapTicketToTrackerRecord(localTicket);
          setLetter(mapped);
          hydrateStage2Form(mapped);
        } else {
          setLetter(null);
        }
      } finally {
        setLoading(false);
      }
    },
    [hydrateStage2Form]
  );

  useEffect(() => {
    if (initialId && String(initialId).trim()) {
      setSearchId(initialId.trim());
      performLookup(initialId.trim());
    }
  }, [initialId, performLookup]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    await performLookup(searchId);
  };

  const handleStage2PdfChange = (e) => {
    setStage2Error('');
    const file = e.target.files?.[0];
    if (!file) return;

    const check = validatePdfAttachmentFile({
      name: file.name,
      type: file.type,
      sizeBytes: file.size,
    });
    if (!check.ok) {
      setStage2Error(check.error || 'Berkas PDF tidak valid.');
      setPdfFileName('');
      setPdfBase64('');
      setPdfSizeKb(0);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => setStage2Error('Gagal membaca berkas PDF.');
    reader.onload = () => {
      setPdfFileName(sanitizeInput(file.name, 160));
      setPdfBase64(String(reader.result || ''));
      setPdfSizeKb(check.sizeKb || 1);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleStage2Submit = async (e) => {
    e.preventDefault();
    if (!letter) return;
    setStage2Error('');

    const cleanName = sanitizeInput(fullName, 120);
    const cleanInst = sanitizeInput(institution, 150);
    const cleanOcc = sanitizeInput(occupation, 50);
    const cleanBirth = sanitizeInput(birthDate, 20);
    const cleanPhone = sanitizeInput(phone, 30);
    const cleanEmail = sanitizeInput(email, 150);
    const cleanNotes = sanitizeInput(notes, 900);

    if (!cleanName || !cleanInst || !cleanOcc || !cleanBirth || !cleanPhone) {
      setStage2Error('Mohon lengkapi seluruh kolom biodata wajib (*) terlebih dahulu.');
      return;
    }

    if (!pdfBase64 || !pdfFileName) {
      setStage2Error('Berkas dokumen surat resmi (.PDF maksimal 1 MB) wajib diunggah.');
      return;
    }

    setStage2Submitting(true);
    try {
      const targetTicketId = letter.ticketId || letter.id;
      const newLetterNumber = await submitAdministrationForm({
        ticketId: targetTicketId,
        serviceType: letter.serviceType || 'Pengajuan Surat Resmi',
        fullName: cleanName,
        institution: cleanInst,
        occupation: cleanOcc,
        birthDate: cleanBirth,
        phone: cleanPhone,
        email: cleanEmail,
        title: `[${targetTicketId}] ${letter.formTitle || letter.serviceType || 'Permohonan Surat'}`,
        purpose: cleanNotes || letter.additionalNotes || 'Kelengkapan surat resmi dari tiket yang disetujui.',
        notes: cleanNotes,
        documentPdfName: pdfFileName,
        documentPdfBase64: pdfBase64,
        documentPdfSizeKb: pdfSizeKb,
      });

      if (targetTicketId) {
        updateLocalAdminuTicketLetterLink(targetTicketId, newLetterNumber);
        await linkLetterToAdminuTicketInCloud(targetTicketId, newLetterNumber);
      }

      setIssuedLetterNumber(newLetterNumber);
      setLetter((prev) =>
        prev
          ? {
              ...prev,
              submissionId: newLetterNumber,
              linkedLetterNumber: newLetterNumber,
              fullName: cleanName,
              institution: cleanInst,
              phone: cleanPhone,
              email: cleanEmail,
              additionalNotes: cleanNotes,
              documentPdfName: pdfFileName,
              documentPdfSizeKb: pdfSizeKb,
              documentPdfBase64: pdfBase64,
            }
          : prev
      );
      playTactileClick('success');
    } catch (err) {
      setStage2Error(
        err instanceof Error
          ? err.message
          : 'Gagal menyimpan biodata & dokumen surat. Silakan coba lagi.'
      );
    } finally {
      setStage2Submitting(false);
    }
  };

  const copyId = () => {
    if (!letter) return;
    playTactileClick('pill');
    navigator.clipboard?.writeText(letter.submissionId || letter.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    playTactileClick('release');
    setSearchId('');
    setLetter(null);
    setSearched(false);
    setIssuedLetterNumber('');
    setStage2Error('');
  };

  // Helper status visual untuk Tiket & Surat
  const getStatusBadge = (status) => {
    const raw = String(status || '').trim();
    const upper = raw.toUpperCase();
    const lower = raw.toLowerCase();

    if (upper === 'PERSONEL_DITUGASKAN' || lower === 'disetujui' || lower === 'selesai' || lower === 'lunas') {
      return {
        label: upper === 'PERSONEL_DITUGASKAN' ? 'Personel Ditugaskan • Selesai' : 'Disetujui • Selesai Diproses',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-500',
        step: 4,
      };
    }
    if (upper === 'DISETUJUI') {
      return {
        label: 'Tiket Disetujui • Lengkapi Biodata & PDF',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-500',
        step: 3,
      };
    }
    if (upper === 'VERIFIKASI_ADMINU' || upper === 'AUDIENSI_POLA_PAM') {
      return {
        label:
          upper === 'AUDIENSI_POLA_PAM'
            ? 'Audiensi & Disposisi Disetujui'
            : 'Verifikasi Adminu • Formulir Surat Terbuka',
        bg: 'bg-blue-50 text-blue-800 border-blue-300',
        dot: 'bg-blue-500 animate-pulse',
        step: 3,
      };
    }
    if (lower === 'diproses' || lower === 'verifikasi') {
      return {
        label: 'Sedang Diproses oleh Staf Adminu',
        bg: 'bg-blue-50 text-blue-800 border-blue-300',
        dot: 'bg-blue-500 animate-pulse',
        step: 2,
      };
    }
    if (lower === 'ditolak' || lower === 'belum disetujui') {
      return {
        label: 'Ditolak / Memerlukan Revisi Berkas',
        bg: 'bg-rose-50 text-rose-800 border-rose-300',
        dot: 'bg-rose-500',
        step: 1,
      };
    }
    return {
      label: 'Menunggu Persetujuan & Disposisi Mako',
      bg: 'bg-amber-50 text-amber-900 border-amber-300',
      dot: 'bg-amber-500 animate-pulse',
      step: 1,
    };
  };

  const currentStatus = letter ? getStatusBadge(letter.status) : null;
  const currentStep = currentStatus?.step || 1;
  const canSubmitStage2 = Boolean(
    letter?.recordKind === 'adminu_ticket' &&
      isTicketApprovedForFormalSubmission(letter.status) &&
      !letter.linkedLetterNumber &&
      !issuedLetterNumber
  );

  // Format tanggal
  const formatDate = (raw) => {
    if (!raw) return 'Tanggal belum tercatat';
    try {
      const d = raw?.toDate ? raw.toDate() : new Date(raw);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(raw);
    }
  };

  return (
    <section
      id="cari-surat-form-section"
      className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-6 sm:p-10 md:p-12 space-y-8 scroll-mt-24 transition-all duration-300"
    >
      {/* Header Formulir Pencarian */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#006569] text-xs font-black uppercase tracking-wider mb-2">
            <Clock size={13} />
            <span>Pelacakan Tiket &amp; Pengajuan Surat Resmi</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Lacak Status Tiket &amp; Berkas Surat Masuk
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Masukkan kode tiket (contoh:{' '}
            <code className="text-[#006569] font-mono font-bold">PAM-2026-103</code>) atau nomor surat resmi (contoh:{' '}
            <code className="text-[#006569] font-mono font-bold">B-001/Web/XI/2026</code>). Jika tiket telah disetujui Mako, formulir pengisian biodata &amp; unggah PDF akan terbuka otomatis.
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="self-start md:self-auto px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
          >
            Tutup Formulir
          </button>
        )}
      </div>

      {/* Input Form Pencarian ID */}
      <form onSubmit={handleSearch} className="space-y-3">
        <label
          htmlFor="input-id-surat"
          className="block text-xs font-black uppercase tracking-wider text-slate-700"
        >
          Kode Tiket / Nomor Surat Resmi / Token Peserta:
        </label>
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <input
              id="input-id-surat"
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Contoh: PAM-2026-103 atau B-001/Web/XI/2026..."
              className="w-full bg-slate-50 focus:bg-white border-2 border-slate-300 focus:border-[#006569] rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition shadow-inner"
            />
            {searchId && (
              <button
                type="button"
                onClick={handleReset}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                title="Hapus"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !searchId.trim()}
            className="neu-btn-primary px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider text-[#FFDD00] shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#FFDD00] border-t-transparent rounded-full animate-spin" />
                <span>Mencari...</span>
              </>
            ) : (
              <>
                <Search size={16} />
                <span>Cari Status Surat</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Area Hasil Pelacakan */}
      {searched && !loading && !letter && (
        <div className="rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/60 p-6 sm:p-8 text-center space-y-3 animate-fade-in">
          <AlertCircle size={40} className="mx-auto text-rose-500" />
          <h4 className="text-base font-black text-rose-950">
            Tiket atau Surat dengan ID Tersebut Tidak Ditemukan
          </h4>
          <p className="text-xs text-rose-700 max-w-md mx-auto leading-relaxed font-medium">
            Pastikan kode tiket (<span className="font-mono font-bold">PAM-2026-XXX</span>) atau nomor surat (<span className="font-mono font-bold">B-001/Web/XI/2026</span>) yang dimasukkan sudah benar.
          </p>
        </div>
      )}

      {searched && !loading && letter && (
        <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in">
          {/* Status Badge & ID Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {letter.linkedLetterNumber || issuedLetterNumber
                  ? 'Nomor Surat Resmi & Kode Tiket:'
                  : 'ID Registrasi / Kode Tiket:'}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-base sm:text-lg font-black text-slate-900 bg-white px-3 py-1 rounded-xl border border-slate-300 select-all">
                  {letter.submissionId || letter.id}
                </span>
                {letter.ticketId && letter.submissionId !== letter.ticketId && (
                  <span className="font-mono text-xs font-bold text-[#006569] bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                    Tiket: {letter.ticketId}
                  </span>
                )}
                <button
                  type="button"
                  onClick={copyId}
                  className="p-2 rounded-xl bg-white border border-slate-300 hover:border-[#006569] text-slate-700 hover:text-[#006569] transition cursor-pointer"
                  title="Salin ID"
                >
                  {copied ? (
                    <Check size={16} className="text-emerald-600" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </div>

            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs sm:text-sm font-black self-start sm:self-auto ${currentStatus?.bg}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${currentStatus?.dot}`} />
              <span>{currentStatus?.label}</span>
            </div>
          </div>

          {/* Stepper Tahapan Surat */}
          <div className="py-2">
            <h5 className="text-xs font-black uppercase tracking-wider text-[#006569] mb-4">
              Tahapan Alur Tiket &amp; Berkas Surat:
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { num: 1, title: 'Tiket Masuk', desc: 'Diterima sistem Mako' },
                { num: 2, title: 'Verifikasi', desc: 'Pemeriksaan Piket' },
                { num: 3, title: 'Disetujui / Lanjut', desc: 'Isi biodata & PDF' },
                { num: 4, title: 'Surat Resmi Terbit', desc: 'Nomor B-XXX/Web/...' },
              ].map((step) => {
                const effectiveStep = letter.linkedLetterNumber || issuedLetterNumber ? 4 : currentStep;
                const isPassed = effectiveStep >= step.num;
                const isCurrent = effectiveStep === step.num;
                return (
                  <div
                    key={step.num}
                    className={`rounded-2xl p-4 border transition-all ${
                      isPassed
                        ? 'bg-white border-[#006569] shadow-sm'
                        : 'bg-slate-100/70 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          isPassed
                            ? 'bg-[#006569] text-[#FFDD00]'
                            : 'bg-slate-300 text-slate-600'
                        }`}
                      >
                        {isPassed ? <Check size={14} /> : step.num}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-black uppercase text-[#006569] bg-teal-50 px-2 py-0.5 rounded-full">
                          Aktif
                        </span>
                      )}
                    </div>
                    <div className="font-black text-xs text-slate-900">{step.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{step.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notifikasi Nomor Surat Resmi Baru Terbit (Tahap 2 Selesai) */}
          {(issuedLetterNumber || letter.linkedLetterNumber) && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 block">
                    Formulir Biodata &amp; Berkas Surat Resmi Tercatat
                  </span>
                  <h4 className="text-base font-black text-slate-900 mt-0.5">
                    Nomor Surat Resmi:{' '}
                    <span className="font-mono text-[#006569]">
                      {issuedLetterNumber || letter.linkedLetterNumber}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-700 mt-1">
                    Data biodata pemohon dan berkas PDF resmi telah tersimpan di database Firebase Firestore &amp; Storage.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAHAP 2: FORMULIR BIODATA & UNGGAH PDF MAKS 1 MB (TERBUKA SETELAH TIKET DISETUJUI) */}
          {canSubmitStage2 && (
            <form
              onSubmit={handleStage2Submit}
              className="rounded-3xl bg-white border-2 border-[#006569]/40 p-6 sm:p-8 space-y-5 shadow-md"
            >
              <div className="border-b border-slate-100 pb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-black uppercase tracking-wider mb-2">
                  <CheckCircle2 size={13} /> Tiket Disetujui — Tahap 2 Terbuka
                </span>
                <h4 className="text-xl font-black text-slate-900">
                  Lengkapi Biodata Pemohon &amp; Unggah Berkas Surat (.PDF Maks. 1 MB)
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Pengiriman formulir ini akan menerbitkan nomor surat resmi berformat{' '}
                  <code className="font-mono font-bold text-[#006569]">B-001/Web/(Bulan Romawi)/2026</code> dan mengarsipkan berkas PDF Anda ke Firebase Storage.
                </p>
              </div>

              {stage2Error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{stage2Error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="s2-fullname" className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Pemohon <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="s2-fullname"
                    type="text"
                    required
                    maxLength={120}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama lengkap sesuai identitas resmi"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#006569] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="s2-institution" className="block text-xs font-bold text-slate-700 mb-1">
                    Asal Instansi / Kampus / Ormawa <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="s2-institution"
                    type="text"
                    required
                    maxLength={150}
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Contoh: Universitas Negeri Jakarta"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#006569] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="s2-occupation" className="block text-xs font-bold text-slate-700 mb-1">
                    Pekerjaan / Status <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="s2-occupation"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#006569] focus:outline-none"
                  >
                    {OCCUPATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="s2-birthdate" className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Lahir <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="s2-birthdate"
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#006569] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="s2-phone" className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / HP <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="s2-phone"
                    type="tel"
                    required
                    maxLength={30}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812-XXXX-XXXX"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#006569] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="s2-email" className="block text-xs font-bold text-slate-700 mb-1">
                    Email Konfirmasi
                  </label>
                  <input
                    id="s2-email"
                    type="email"
                    maxLength={150}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@instansi.ac.id"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#006569] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="s2-pdf-upload" className="block text-xs font-bold text-slate-700 mb-1">
                    Unggah Dokumen Surat Resmi (.PDF Maks. 1 MB) <span className="text-rose-600">*</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      htmlFor="s2-pdf-upload"
                      className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-[#006569] bg-teal-50/50 hover:bg-teal-50 text-xs font-bold text-[#006569] cursor-pointer transition"
                    >
                      <Upload size={14} />
                      <span>{pdfFileName ? 'Ganti Berkas PDF' : 'Pilih File PDF (≤ 1 MB)'}</span>
                    </label>
                    <input
                      id="s2-pdf-upload"
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handleStage2PdfChange}
                      className="hidden"
                    />
                    {pdfFileName && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
                        <FileText size={13} />
                        <span className="truncate max-w-[160px]">
                          {pdfFileName} ({pdfSizeKb} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setPdfFileName('');
                            setPdfBase64('');
                            setPdfSizeKb(0);
                          }}
                          className="text-rose-600 hover:text-rose-800 cursor-pointer"
                          aria-label="Hapus berkas PDF"
                        >
                          <Trash2 size={13} />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="s2-notes" className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan / Perihal Tambahan
                </label>
                <textarea
                  id="s2-notes"
                  rows={2}
                  maxLength={900}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan tambahan terkait pengajuan surat resmi..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-900 focus:border-[#006569] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={stage2Submitting}
                className="w-full py-3.5 px-6 rounded-xl bg-[#006569] hover:bg-[#004d50] disabled:opacity-50 text-[#FFDD00] font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Send size={15} />
                <span>
                  {stage2Submitting
                    ? 'Menyimpan Biodata & Mengunggah PDF ke Firebase…'
                    : 'Kirim Biodata & Terbitkan Nomor Surat Resmi (B-XXX/Web/...)'}
                </span>
              </button>
            </form>
          )}

          {/* Rincian Permohonan / Surat */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <FileText size={15} className="text-[#006569]" />
              <span>Detail Informasi Pengajuan</span>
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <User size={15} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-500 font-semibold block">Nama Pemohon:</span>
                  <span className="font-bold text-slate-900">
                    {letter.fullName || letter.name || 'Tidak dicantumkan'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Building size={15} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-500 font-semibold block">Asal Instansi:</span>
                  <span className="font-bold text-slate-900">
                    {letter.institution || letter.campus || 'Universitas Negeri Jakarta'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <FileCheck2 size={15} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-500 font-semibold block">Kategori Layanan:</span>
                  <span className="font-bold text-[#006569]">
                    {letter.formTitle || letter.category || letter.serviceType || 'Administrasi Umum'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar size={15} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-500 font-semibold block">Waktu Registrasi:</span>
                  <span className="font-bold text-slate-900">
                    {formatDate(letter.submittedAt || letter.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {letter.additionalNotes && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 block mb-1">
                  Keterangan Permohonan:
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {letter.additionalNotes}
                </p>
              </div>
            )}

            {letter.adminNotes && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-black text-[#006569] block mb-1">
                  Catatan Resmi Piket / Mako:
                </span>
                <p className="text-xs text-slate-800 bg-teal-50/70 p-3 rounded-xl border border-teal-200 font-semibold">
                  {letter.adminNotes}
                </p>
              </div>
            )}
          </div>

          {/* Tombol Aksi Dokumen & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div>
              {letter.documentPdfUrl || letter.documentPdfBase64 ? (
                <button
                  type="button"
                  onClick={() => {
                    const pdfTarget = letter.documentPdfUrl || letter.documentPdfBase64;
                    openOrDownloadPdf(pdfTarget, letter.documentPdfName || `Surat_${letter.submissionId || 'Menwa_UNJ'}.pdf`);
                  }}
                  className="neu-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-[#FFDD00] shadow-sm cursor-pointer"
                >
                  <FileText size={15} />
                  <span>Unduh Berkas Surat (PDF)</span>
                  <ExternalLink size={13} />
                </button>
              ) : (
                <span className="text-xs text-slate-500 italic">
                  {letter.recordKind === 'adminu_ticket' && !isTicketApprovedForFormalSubmission(letter.status)
                    ? 'Menunggu persetujuan Mako sebelum pengisian biodata & unggah PDF final dibuka.'
                    : 'Berkas lampiran fisik surat sedang dalam verifikasi arsip.'}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>Cari ID Surat Lain</span>
            </button>
          </div>
        </div>
      )}

      {/* Petunjuk Privasi & Bantuan */}
      {!searched && (
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 flex items-start gap-3 text-xs text-slate-600">
          <ShieldCheck size={18} className="text-[#006569] mt-0.5 shrink-0" />
          <div className="space-y-1">
            <span className="font-bold text-slate-900 block">
              Keamanan &amp; Alur Pelacakan Dua Tahap
            </span>
            <p className="leading-relaxed">
              Sesuai SOP Markas Komando Menwa UNJ, pemohon mengajukan tiket terlebih dahulu di{' '}
              <strong>Pengajuan Surat &amp; Tiket</strong>. Setelah tiket disetujui oleh Staf Mako, masukkan kode tiket di sini untuk mengisi biodata lengkap beserta berkas PDF (maks. 1 MB) guna menerbitkan nomor surat resmi{' '}
              <code className="font-mono font-bold text-[#006569]">B-001/Web/(Bulan Romawi)/2026</code>.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
