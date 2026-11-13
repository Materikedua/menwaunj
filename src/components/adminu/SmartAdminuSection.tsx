import React, { useState } from 'react';
import {
  Shield,
  FileText,
  Send,
  Printer,
  Search,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  AlertCircle,
  ArrowLeft,
  Building,
  Users,
  Calendar,
  MapPin,
  Upload,
  Trash2,
  Download,
} from 'lucide-react';
import { Link } from '../../lib/router.jsx';
import { KopSuratMenwaUnj } from '../KopSuratMenwaUnj';
import {
  createAdminuTicket,
  findAdminuTicketByCode,
  generatePamTicketId,
  useAdminuTickets,
  type AdminuPamTicket,
} from '../../data/siteConfig';
import {
  sanitizeInput,
  isHoneypotTriggered,
  evaluateActionCooldown,
  recordActionTimestamp,
} from '../../utils/security';
import {
  detectLampiranText,
  formatWebLetterNumber,
  isTicketApprovedForFormalSubmission,
  validatePdfAttachmentFile,
} from '../../utils/adminuUtils';
import { uploadAdminuPdfToStorage } from '../../lib/firebase.js';
import {
  lookupRemoteAdminuTicket,
  findAvailablePamTicketSeq,
} from '../../lib/firebaseCmsBridge';

interface SmartAdminuSectionProps {
  embedded?: boolean;
  onOpenLetterTracker?: (ticketId?: string) => void;
}

const SERVICE_OPTIONS: Array<{
  value: AdminuPamTicket['serviceCategory'];
  label: string;
  perihal: string;
}> = [
  {
    value: 'PAM_KEGIATAN',
    label: 'Permohonan Personel Pengamanan Kegiatan (PAM)',
    perihal: 'Permohonan Bantuan Personel Pengamanan & Ketertiban Kegiatan',
  },
  {
    value: 'KEMITRAAN_INSTANSI',
    label: 'Pengajuan Kemitraan, Sponsorship, & Media Partner',
    perihal: 'Permohonan Kerja Sama, Kemitraan, & Kolaborasi Penyelenggaraan Kegiatan',
  },
  {
    value: 'INSTRUKTUR_PELATIH',
    label: 'Permohonan Instruktur PBB, Tata Upacara & Kepemimpinan',
    perihal: 'Permohonan Penugasan Instruktur Pelatihan & Pembinaan',
  },
  {
    value: 'SARPRAS_KOMANDO',
    label: 'Peminjaman Tenda Komando & Perlengkapan Operasional Mako',
    perihal: 'Permohonan Peminjaman Sarana & Prasarana Markas Komando',
  },
  {
    value: 'PENDAFTARAN_PROGRAM',
    label: 'Pendaftaran Program Satuan, Camen, & Kompetisi Nasional',
    perihal: 'Permohonan Pendaftaran Program & Keikutsertaan Kegiatan Satuan',
  },
  {
    value: 'DISPENSASI_IZIN',
    label: 'Permohonan Dispensasi / Izin & Surat Tugas Dinas',
    perihal: 'Permohonan Penerbitan Surat Dispensasi / Tugas Kedinasan',
  },
];

const STATUS_STEPS: Array<{
  key: AdminuPamTicket['status'];
  label: string;
  desc: string;
}> = [
  {
    key: 'DITERIMA',
    label: '1. Tiket Tercatat',
    desc: 'Permohonan masuk ke antrean Piket Mako untuk pemeriksaan awal.',
  },
  {
    key: 'DISETUJUI',
    label: '2. Disetujui Mako',
    desc: 'Tiket disetujui; pemohon dapat melengkapi biodata & PDF di tab Lacak Surat.',
  },
  {
    key: 'VERIFIKASI_ADMINU',
    label: '3. Verifikasi Adminu',
    desc: 'Pemeriksaan kelengkapan naskah surat & jadwal oleh Staf Administrasi Umum.',
  },
  {
    key: 'AUDIENSI_POLA_PAM',
    label: '4. Audiensi / Disposisi',
    desc: 'Penyelarasan titik pengamanan, kebutuhan personel, atau teknis acara.',
  },
  {
    key: 'PERSONEL_DITUGASKAN',
    label: '5. Selesai / Terbit',
    desc: 'Surat resmi / Surat Perintah Tugas (Sprin) diterbitkan Komandan Satuan.',
  },
];

export const SmartAdminuSection: React.FC<SmartAdminuSectionProps> = ({
  embedded = false,
  onOpenLetterTracker,
}) => {
  const tickets = useAdminuTickets();
  const [activeMode, setActiveMode] = useState<'ajukan' | 'lacak'>('ajukan');

  // State Formulir Pengajuan
  const [applicantName, setApplicantName] = useState('');
  const [institution, setInstitution] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [serviceCategory, setServiceCategory] =
    useState<AdminuPamTicket['serviceCategory']>('PAM_KEGIATAN');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [personnelRequested, setPersonnelRequested] = useState(6);
  const [notes, setNotes] = useState('');
  const [honeypotWebsite, setHoneypotWebsite] = useState('');

  // State Berkas Lampiran PDF (maks 1 MB)
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfBase64, setPdfBase64] = useState('');
  const [pdfSizeKb, setPdfSizeKb] = useState(0);
  const [pdfError, setPdfError] = useState('');

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<AdminuPamTicket | null>(null);
  const [copiedTicket, setCopiedTicket] = useState(false);

  // State Pelacak Tiket Publik Ringkas
  const [trackInput, setTrackInput] = useState('PAM-2026-101');
  const [trackedTicket, setTrackedTicket] = useState<AdminuPamTicket | null>(() =>
    findAdminuTicketByCode('PAM-2026-101')
  );
  const [trackNotFound, setTrackNotFound] = useState(false);

  const selectedServiceMeta =
    SERVICE_OPTIONS.find((s) => s.value === serviceCategory) || SERVICE_OPTIONS[0];

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPdfError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validatePdfAttachmentFile({
      name: file.name,
      type: file.type,
      sizeBytes: file.size,
    });

    if (!validation.ok) {
      setPdfError(validation.error || 'Berkas PDF tidak valid.');
      setPdfFileName('');
      setPdfBase64('');
      setPdfSizeKb(0);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setPdfError('Gagal membaca berkas PDF yang dipilih.');
    };
    reader.onload = () => {
      setPdfFileName(sanitizeInput(file.name, 160));
      setPdfBase64(String(reader.result || ''));
      setPdfSizeKb(validation.sizeKb || 1);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const clearPdfAttachment = () => {
    setPdfFileName('');
    setPdfBase64('');
    setPdfSizeKb(0);
    setPdfError('');
  };

  const handleSubmitPamRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // 1. Pemeriksaan Honeypot Anti-Bot
    if (isHoneypotTriggered(honeypotWebsite)) {
      setFormError('Permintaan ditolak oleh sistem proteksi otomatis.');
      return;
    }

    // 2. Pembatasan Jeda Pengiriman (Throttling 10 detik)
    const cooldown = evaluateActionCooldown('smart_adminu_submit', 10000);
    if (!cooldown.allowed) {
      setFormError(
        `Mohon tunggu ${cooldown.remainingSeconds} detik sebelum mengirim permohonan berikutnya.`
      );
      return;
    }

    const cleanApplicant = sanitizeInput(applicantName, 120);
    const cleanInst = sanitizeInput(institution, 150);
    const cleanPhone = sanitizeInput(contactPhone, 40);
    const cleanEvent = sanitizeInput(eventName, 180);
    const cleanLoc = sanitizeInput(eventLocation, 180);

    if (!cleanApplicant || !cleanInst || !cleanPhone || !cleanEvent || !eventDate || !cleanLoc) {
      setFormError('Mohon lengkapi seluruh kolom bertanda wajib (*) sebelum menerbitkan tiket.');
      return;
    }

    setSubmitting(true);
    try {
      const localMax = tickets.reduce((max, item) => {
        const match = /PAM-2026-(\d+)/i.exec(item.ticketId);
        return match ? Math.max(max, Number(match[1])) : max;
      }, 103);
      const nextCloudSeq = await findAvailablePamTicketSeq(localMax + 1);
      const upcomingTicketId = generatePamTicketId(0, nextCloudSeq);

      let uploadedPdfUrl = '';
      if (pdfBase64 && pdfFileName) {
        uploadedPdfUrl = await uploadAdminuPdfToStorage(
          pdfBase64,
          upcomingTicketId,
          pdfFileName
        );
      }

      const ticket = createAdminuTicket(
        {
          applicantName: cleanApplicant,
          institution: cleanInst,
          contactPhone: cleanPhone,
          contactEmail: sanitizeInput(contactEmail, 120),
          serviceCategory,
          serviceLabel: selectedServiceMeta.label,
          eventName: cleanEvent,
          eventDate: sanitizeInput(eventDate, 40),
          eventLocation: cleanLoc,
          personnelRequested: Number(personnelRequested) || 4,
          notes: sanitizeInput(notes, 900),
          attachmentPdfName: pdfFileName || undefined,
          attachmentPdfUrl: uploadedPdfUrl || undefined,
          attachmentPdfSizeKb: pdfSizeKb || undefined,
        },
        undefined,
        nextCloudSeq
      );

      recordActionTimestamp('smart_adminu_submit');

      setCreatedTicket(ticket);
      setTrackedTicket(ticket);
      setTrackInput(ticket.ticketId);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    let hit = findAdminuTicketByCode(trackInput);
    if (!hit) {
      hit = await lookupRemoteAdminuTicket(trackInput);
    }
    setTrackedTicket(hit);
    setTrackNotFound(!hit);
  };

  const previewLetterNum = formatWebLetterNumber(1, new Date()).replace('001', '___');
  const activeTicketForLetter: AdminuPamTicket = createdTicket || {
    ticketId: 'PAM-2026-PRATINJAU',
    createdAt: new Date().toISOString(),
    applicantName: sanitizeInput(applicantName, 120) || '[Nama Penanggung Jawab / Pemohon]',
    institution: sanitizeInput(institution, 150) || '[Nama Instansi / Fakultas / Ormawa]',
    contactPhone: sanitizeInput(contactPhone, 40) || '[Nomor WhatsApp Aktif]',
    contactEmail: sanitizeInput(contactEmail, 120) || '-',
    serviceCategory,
    serviceLabel: selectedServiceMeta.label,
    eventName: sanitizeInput(eventName, 180) || '[Nama Kegiatan / Acara Resmi]',
    eventDate: eventDate || '[Tanggal Pelaksanaan]',
    eventLocation: sanitizeInput(eventLocation, 180) || '[Tempat Pelaksanaan]',
    personnelRequested: Number(personnelRequested) || 6,
    notes:
      sanitizeInput(notes, 800) ||
      'Pengamanan jalur utama peserta, ketertiban area acara, serta koordinasi teknis lapangan.',
    letterNumber: previewLetterNum,
    status: 'DITERIMA',
    statusNote: '',
    attachmentPdfName: pdfFileName || undefined,
    attachmentPdfSizeKb: pdfSizeKb || undefined,
  };

  const lampiranText = detectLampiranText(
    activeTicketForLetter.attachmentPdfName,
    activeTicketForLetter.attachmentPdfSizeKb
  );

  const handlePrintLetter = () => {
    const el = document.getElementById('naskah-dinas-letter');
    if (!el) {
      window.print();
      return;
    }
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8"/>
        <title>Surat Permohonan Resmi - ${activeTicketForLetter.ticketId}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 20mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            background: #ffffff;
            color: #000000;
            padding: 0;
            line-height: 1.35;
          }
          #naskah-dinas-letter {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 1.5px 0; }
        </style>
      </head>
      <body>
        ${el.outerHTML}
      </body>
      </html>
    `);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch {}
      }, 1500);
    }, 300);
  };

  const currentStepIdx = trackedTicket
    ? Math.max(0, STATUS_STEPS.findIndex((s) => s.key === trackedTicket.status))
    : 0;

  return (
    <div className={embedded ? 'space-y-8' : 'min-h-screen bg-slate-50 pb-24 font-sans'}>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 20mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          header, nav, footer, .print\\:hidden, #pam-ticket-form, .no-print {
            display: none !important;
          }
          #naskah-dinas-letter {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {!embedded && (
        <header className="bg-[#041d24] text-white border-b border-[#006569]/60 py-12 px-4 sm:px-6 lg:px-8 print:hidden">
          <div className="max-w-7xl mx-auto space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                to="/administrasi"
                className="inline-flex items-center gap-2 text-xs font-bold text-teal-200 hover:text-[#FFDD00] transition"
              >
                <ArrowLeft size={15} />
                <span>Buka Portal Administrasi Lengkap</span>
              </Link>
              <span className="px-3 py-1 rounded-lg bg-[#006569]/40 border border-[#006569] text-[11px] font-mono font-bold text-[#FFDD00]">
                PENGAJUAN SURAT &amp; TIKET • PAM-2026-XXX
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Portal Pengajuan Surat, Layanan Satuan &amp; Tiket
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              Ajukan seluruh layanan administrasi, pengamanan kegiatan, pendaftaran, maupun kemitraan melalui satu pintu. Sistem menerbitkan tiket{' '}
              <strong className="text-[#FFDD00]">PAM-2026-XXX</strong> dan format Formulir Permohonan Naskah Dinas siap cetak.
            </p>
          </div>
        </header>
      )}

      <div className={embedded ? 'space-y-6' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6'}>
        {/* Sakelar Mode: Formulir & Pratinjau Surat vs Pelacak Tiket */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm print:hidden">
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveMode('ajukan')}
              className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 transition cursor-pointer ${
                activeMode === 'ajukan'
                  ? 'bg-[#006569] text-[#FFDD00] shadow-sm'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <FileText size={15} />
              <span>Formulir Pengajuan &amp; Surat Cetak</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('lacak')}
              className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 transition cursor-pointer ${
                activeMode === 'lacak'
                  ? 'bg-[#006569] text-[#FFDD00] shadow-sm'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <Search size={15} />
              <span>Cek Status Tiket ({tickets.length})</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium px-2">
            Layanan Piket Mako • Senin–Minggu (08.00–22.00 WIB)
          </div>
        </div>

        {activeMode === 'ajukan' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Kolom Kiri: Formulir Pengajuan atau Kartu Tanda Terima */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm print:hidden">
              {createdTicket ? (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                    <CheckCircle2 size={24} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 block">
                        Permohonan Berhasil Diterbitkan
                      </span>
                      <h3 className="text-lg font-black text-slate-900">
                        Tanda Terima Resmi: {createdTicket.ticketId}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Simpan kode tiket ini. Setelah tiket disetujui oleh Admin Mako, buka tab{' '}
                        <strong>Lacak Surat</strong> untuk melengkapi biodata dan mengunggah berkas PDF final guna menerbitkan nomor surat resmi{' '}
                        <span className="font-mono font-bold">B-001/Web/.../2026</span>.
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">
                        KODE PELACAKAN SMART ADMINU
                      </span>
                      <strong className="text-2xl font-mono font-black text-[#FFDD00]">
                        {createdTicket.ticketId}
                      </strong>
                      <span className="text-[11px] font-mono text-teal-300 block mt-0.5">
                        Agenda Sementara: {createdTicket.letterNumber}
                      </span>
                      {createdTicket.attachmentPdfName && (
                        <span className="text-[11px] text-emerald-300 block mt-0.5">
                          Lampiran PDF: {createdTicket.attachmentPdfName} ({createdTicket.attachmentPdfSizeKb || 1} KB)
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(createdTicket.ticketId);
                        setCopiedTicket(true);
                        setTimeout(() => setCopiedTicket(false), 2000);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedTicket ? (
                        <Check size={14} className="text-emerald-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                      <span>{copiedTicket ? 'Tersalin' : 'Salin Kode'}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handlePrintLetter}
                      className="flex-1 py-3 px-4 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Printer size={15} />
                      <span>Cetak Surat Permohonan</span>
                    </button>
                    {onOpenLetterTracker ? (
                      <button
                        type="button"
                        onClick={() => onOpenLetterTracker(createdTicket.ticketId)}
                        className="py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
                      >
                        Buka Tab Lacak Surat
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveMode('lacak')}
                        className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
                      >
                        Pantau Status Tiket
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setCreatedTicket(null);
                        clearPdfAttachment();
                      }}
                      className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      Buat Permohonan Baru
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitPamRequest} className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Shield size={19} className="text-[#006569]" />
                      <span>Formulir Pengajuan Surat &amp; Tiket Terpadu</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Seluruh pengajuan layanan satuan, PAM, kemitraan, dan pendaftaran diproses melalui satu pintu ini.
                    </p>
                  </div>

                  {/* Kolom Jebakan Bot (Honeypot Tersembunyi) */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="adminu-company-site">Situs Web Instansi (Jangan Diisi)</label>
                    <input
                      id="adminu-company-site"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypotWebsite}
                      onChange={(e) => setHoneypotWebsite(e.target.value)}
                    />
                  </div>

                  {formError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="pam-service"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Kategori Layanan Komando <span className="text-rose-600">*</span>
                    </label>
                    <select
                      id="pam-service"
                      value={serviceCategory}
                      onChange={(e) =>
                        setServiceCategory(e.target.value as AdminuPamTicket['serviceCategory'])
                      }
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-[#006569] focus:outline-none"
                    >
                      {SERVICE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor="pam-applicant"
                        className="block text-xs font-bold text-slate-700 mb-1"
                      >
                        Nama Penanggung Jawab <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="pam-applicant"
                        type="text"
                        required
                        maxLength={120}
                        placeholder="Nama lengkap pemohon"
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#006569] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="pam-institution"
                        className="block text-xs font-bold text-slate-700 mb-1"
                      >
                        Asal Ormawa / Fakultas / Instansi <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="pam-institution"
                        type="text"
                        required
                        maxLength={150}
                        placeholder="Contoh: BEM FIP UNJ / SMAN 8 Jakarta"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#006569] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor="pam-phone"
                        className="block text-xs font-bold text-slate-700 mb-1"
                      >
                        Nomor WhatsApp Aktif <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="pam-phone"
                        type="tel"
                        required
                        maxLength={35}
                        placeholder="0812-XXXX-XXXX"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#006569] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="pam-email"
                        className="block text-xs font-bold text-slate-700 mb-1"
                      >
                        Email Resmi Pemohon
                      </label>
                      <input
                        id="pam-email"
                        type="email"
                        maxLength={120}
                        placeholder="panitia@unj.ac.id"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#006569] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="pam-event-name"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Nama Kegiatan / Acara <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="pam-event-name"
                      type="text"
                      required
                      maxLength={180}
                      placeholder="Contoh: PKKMB Tingkat Fakultas / Seminar Nasional"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#006569] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label
                        htmlFor="pam-event-date"
                        className="block text-xs font-bold text-slate-700 mb-1"
                      >
                        Tanggal Pelaksanaan <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="pam-event-date"
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#006569] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="pam-event-location"
                        className="block text-xs font-bold text-slate-700 mb-1"
                      >
                        Lokasi Acara <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="pam-event-location"
                        type="text"
                        required
                        maxLength={160}
                        placeholder="Aula Latief / GOR UNJ"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#006569] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="pam-personnel"
                        className="block text-xs font-bold text-slate-700 mb-1"
                      >
                        Kebutuhan Personel
                      </label>
                      <input
                        id="pam-personnel"
                        type="number"
                        min={1}
                        max={80}
                        value={personnelRequested}
                        onChange={(e) => setPersonnelRequested(Number(e.target.value) || 4)}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#006569] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Kolom Unggah Berkas Lampiran PDF (Maks 1 MB) — Mendeteksi Kolom Lampiran Surat Otomatis */}
                  <div>
                    <label
                      htmlFor="pam-pdf-attachment"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Unggah Dokumen Lampiran Pendukung (Opsional, .PDF Maks. 1 MB)
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        htmlFor="pam-pdf-attachment"
                        className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-[#006569]/60 bg-teal-50/40 hover:bg-teal-50 text-xs font-bold text-[#006569] cursor-pointer transition"
                      >
                        <Upload size={14} />
                        <span>{pdfFileName ? 'Ganti Berkas PDF' : 'Pilih Berkas PDF (≤ 1 MB)'}</span>
                      </label>
                      <input
                        id="pam-pdf-attachment"
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={handlePdfSelect}
                        className="hidden"
                      />
                      {pdfFileName && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold">
                          <FileText size={13} className="text-emerald-700 shrink-0" />
                          <span className="truncate max-w-[200px]">
                            {pdfFileName} ({pdfSizeKb} KB)
                          </span>
                          <button
                            type="button"
                            onClick={clearPdfAttachment}
                            aria-label="Hapus lampiran PDF"
                            className="text-rose-600 hover:text-rose-800 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                    {pdfError && (
                      <p className="text-[11px] font-bold text-rose-600 mt-1">{pdfError}</p>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1">
                      Jika berkas PDF dilampirkan, baris <strong>Lampiran</strong> pada surat permohonan otomatis terisi.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="pam-notes"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Rincian Kebutuhan Teknis / Pengamanan
                    </label>
                    <textarea
                      id="pam-notes"
                      rows={3}
                      maxLength={800}
                      placeholder="Tuliskan jam siaga, estimasi jumlah peserta acara, titik steril VIP, atau rincian permohonan..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-900 focus:border-[#006569] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-5 rounded-xl bg-[#006569] hover:bg-[#004d50] disabled:opacity-50 text-[#FFDD00] font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Send size={15} />
                    <span>
                      {submitting
                        ? 'Menerbitkan Resi PAM-2026…'
                        : 'Kirim Permohonan & Terbitkan Tiket PAM-2026'}
                    </span>
                  </button>
                </form>
              )}
            </div>

            {/* Kolom Kanan: Pratinjau Naskah Dinas Resmi (Arial 12pt, Tanpa Elemen Grafis) */}
            <div className="lg:col-span-6 bg-white rounded-3xl border-2 border-slate-300 p-6 sm:p-8 shadow-sm print:border-0 print:p-0 print:shadow-none">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-5 print:hidden">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#006569] font-black block">
                    PRATINJAU NASKAH DINAS RESMI OTOMATIS
                  </span>
                  <h3 className="text-sm font-black text-slate-900">
                    Formulir Permohonan Resmi (Arial 12pt)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handlePrintLetter}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Cetak / PDF</span>
                </button>
              </div>

              {/* Lembar Surat Formal Naskah Dinas: Arial 12pt, Margin Standar, Nol Elemen Grafis */}
              <div
                id="naskah-dinas-letter"
                className="bg-white text-black border border-slate-300 p-6 sm:p-9 print:border-0"
                style={{
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  fontSize: '11pt',
                  lineHeight: 1.45,
                  color: '#000000',
                }}
              >
                {/* Kop Surat Resmi Menwa UNJ Sesuai Standar SOP */}
                <KopSuratMenwaUnj />

                {/* Judul Dokumen Naskah Dinas */}
                <div className="text-center my-3">
                  <div
                    style={{ fontSize: '13pt' }}
                    className="font-bold uppercase tracking-wide underline text-black font-sans"
                  >
                    FORMULIR PERMOHONAN
                  </div>
                  <div style={{ fontSize: '9.5pt' }} className="font-mono text-slate-700 mt-0.5">
                    Nomor: {activeTicketForLetter.letterNumber}
                  </div>
                </div>

                {/* Tanggal Surat Resmi (Rata Kanan Standar Naskah Dinas) */}
                <div className="text-right mb-4">
                  Jakarta,{' '}
                  {new Date().toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>

                {/* Baris Nomor, Kode Tiket, Lampiran (Otomatis), & Perihal */}
                <div className="mb-5">
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      fontSize: '12pt',
                      lineHeight: 1.45,
                    }}
                  >
                    <tbody>
                      <tr>
                        <td className="align-top whitespace-nowrap pr-2" style={{ width: '98px' }}>
                          Nomor
                        </td>
                        <td className="align-top whitespace-nowrap pr-2" style={{ width: '12px' }}>
                          :
                        </td>
                        <td className="align-top break-words">{activeTicketForLetter.letterNumber}</td>
                      </tr>
                      <tr>
                        <td className="align-top whitespace-nowrap pr-2">Kode Tiket</td>
                        <td className="align-top whitespace-nowrap pr-2">:</td>
                        <td className="align-top">{activeTicketForLetter.ticketId}</td>
                      </tr>
                      <tr>
                        <td className="align-top whitespace-nowrap pr-2">Lampiran</td>
                        <td className="align-top whitespace-nowrap pr-2">:</td>
                        <td className="align-top break-words">{lampiranText}</td>
                      </tr>
                      <tr>
                        <td className="align-top whitespace-nowrap pr-2">Perihal</td>
                        <td className="align-top whitespace-nowrap pr-2">:</td>
                        <td className="align-top">
                          <strong>{selectedServiceMeta.perihal}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Alamat Tujuan Resmi */}
                <div className="mb-5">
                  <div>Kepada Yth.</div>
                  <div className="font-bold">
                    Komandan Satuan Komando Resimen Mahasiswa Universitas Negeri Jakarta
                  </div>
                  <div>di Tempat</div>
                </div>

                {/* Isi Surat Formal */}
                <div className="space-y-3 text-justify">
                  <p>Dengan hormat,</p>
                  <p>
                    Sehubungan dengan akan dilaksanakannya kegiatan{' '}
                    <strong>{activeTicketForLetter.eventName}</strong> oleh{' '}
                    <strong>{activeTicketForLetter.institution}</strong>, melalui surat ini kami mengajukan{' '}
                    <strong>{activeTicketForLetter.serviceLabel}</strong> dengan rincian pelaksanaan sebagai berikut:
                  </p>

                  <ol className="list-decimal pl-6 space-y-1 text-left">
                    <li>
                      Penanggung Jawab: <strong>{activeTicketForLetter.applicantName}</strong>
                    </li>
                    <li>
                      Instansi / Ormawa: <strong>{activeTicketForLetter.institution}</strong>
                    </li>
                    <li>
                      Hari / Tanggal Kegiatan: <strong>{activeTicketForLetter.eventDate}</strong>
                    </li>
                    <li>
                      Tempat Pelaksanaan: <strong>{activeTicketForLetter.eventLocation}</strong>
                    </li>
                    <li>
                      Kebutuhan Personel: <strong>{activeTicketForLetter.personnelRequested} Personel</strong>
                    </li>
                    <li>
                      Kontak Narahubung: <strong>{activeTicketForLetter.contactPhone}</strong>
                    </li>
                    <li>
                      Keterangan Lapangan: {activeTicketForLetter.notes}
                    </li>
                  </ol>

                  <p>
                    Demikian surat permohonan resmi ini kami sampaikan untuk ditindaklanjuti sesuai prosedur administrasi yang berlaku. Atas perhatian dan kerja sama Komando, kami ucapkan terima kasih.
                  </p>
                </div>

                {/* Blok Tanda Tangan Standar Naskah Dinas (Tanpa "Mako Gedung G R.107") */}
                <div className="pt-10 grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div>Mengetahui,</div>
                    <div className="font-bold">Staf Administrasi Umum Menwa UNJ</div>
                    <div style={{ height: '20mm' }} />
                    <div>(..........................................)</div>
                  </div>
                  <div>
                    <div>Hormat kami,</div>
                    <div>Pemohon</div>
                    <div className="font-bold">{activeTicketForLetter.institution}</div>
                    <div style={{ height: '16mm' }} />
                    <div className="font-bold underline">
                      {activeTicketForLetter.applicantName}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Mode Pelacak Status Tiket Ringkas */
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="max-w-2xl space-y-2">
              <span className="text-[11px] font-mono font-black uppercase tracking-wider text-[#006569]">
                PELACAK DISPOSISI TIKET &amp; PERMOHONAN
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                Cek Status Tiket Permohonan (PAM-2026-XXX)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Masukkan kode tiket Smart Adminu untuk memeriksa tahap persetujuan Mako sebelum melanjutkan pengisian biodata final di tab <strong>Lacak Surat</strong>.
              </p>
            </div>

            <form onSubmit={handleTrackSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <input
                id="pam-track-code"
                type="text"
                aria-label="Kode Tiket Smart Adminu"
                required
                maxLength={50}
                value={trackInput}
                onChange={(e) => {
                  setTrackInput(e.target.value);
                  setTrackNotFound(false);
                }}
                placeholder="Contoh: PAM-2026-101"
                className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-mono font-bold text-slate-900 focus:border-[#006569] focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                Lacak Tiket
              </button>
            </form>

            {/* Pilihan Cepat Tiket Aktif */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Tiket Aktif Terbaru:</span>
              {tickets.slice(0, 5).map((t) => (
                <button
                  key={t.ticketId}
                  type="button"
                  onClick={() => {
                    setTrackInput(t.ticketId);
                    setTrackedTicket(t);
                    setTrackNotFound(false);
                  }}
                  className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold border transition cursor-pointer ${
                    trackedTicket?.ticketId === t.ticketId
                      ? 'bg-[#006569] text-[#FFDD00] border-[#006569]'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {t.ticketId}
                </button>
              ))}
            </div>

            {trackNotFound && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} />
                <span>
                  Kode tiket tidak ditemukan. Pastikan format penulisan sesuai (contoh: PAM-2026-101).
                </span>
              </div>
            )}

            {trackedTicket && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <span className="font-mono text-xs font-black text-[#006569] bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
                      {trackedTicket.ticketId} • {trackedTicket.linkedLetterNumber || trackedTicket.letterNumber}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-2">
                      {trackedTicket.eventName}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-600 font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <Building size={13} className="text-[#006569]" />
                        {trackedTicket.institution}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={13} className="text-[#006569]" />
                        {trackedTicket.eventDate}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} className="text-[#006569]" />
                        {trackedTicket.eventLocation}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users size={13} className="text-[#006569]" />
                        {trackedTicket.personnelRequested} Personel
                      </span>
                    </div>
                  </div>

                  {trackedTicket.attachmentPdfUrl && (
                    <a
                      href={trackedTicket.attachmentPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-teal-300 text-xs font-bold text-[#006569] hover:bg-teal-50"
                    >
                      <Download size={14} />
                      <span>Unduh Lampiran PDF</span>
                    </a>
                  )}
                </div>

                {/* Alur 5 Tahap Status Komando */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {STATUS_STEPS.map((st, idx) => {
                    const passed = idx <= currentStepIdx;
                    const current = idx === currentStepIdx;
                    return (
                      <div
                        key={st.key}
                        className={`p-4 rounded-2xl border ${
                          current
                            ? 'bg-[#006569] text-white border-[#006569] shadow-md'
                            : passed
                            ? 'bg-emerald-50 border-emerald-200 text-slate-900'
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-xs font-black ${
                              current ? 'text-[#FFDD00]' : passed ? 'text-emerald-700' : 'text-slate-400'
                            }`}
                          >
                            {st.label}
                          </span>
                          {passed ? <CheckCircle2 size={15} /> : <Clock size={15} />}
                        </div>
                        <p
                          className={`text-[11px] leading-relaxed ${
                            current ? 'text-teal-50' : passed ? 'text-slate-600' : 'text-slate-400'
                          }`}
                        >
                          {st.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <Clock size={16} className="text-[#006569] shrink-0" />
                    <span>
                      <strong>Catatan Disposisi Mako:</strong> {trackedTicket.statusNote}
                    </span>
                  </div>

                  {isTicketApprovedForFormalSubmission(trackedTicket.status) && onOpenLetterTracker && (
                    <button
                      type="button"
                      onClick={() => onOpenLetterTracker(trackedTicket.ticketId)}
                      className="px-4 py-2 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black text-xs uppercase tracking-wider cursor-pointer"
                    >
                      {trackedTicket.linkedLetterNumber
                        ? `Lihat Surat ${trackedTicket.linkedLetterNumber}`
                        : 'Lengkapi Biodata & PDF di Lacak Surat'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartAdminuSection;
