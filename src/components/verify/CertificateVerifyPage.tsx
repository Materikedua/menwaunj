import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Award,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Copy,
  Check,
  ArrowLeft,
  Calendar,
  Building,
  FileCheck,
  QrCode,
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebase.js';
import { Link } from '../../lib/router.jsx';
import {
  VERIFIED_CERTIFICATES,
  verifyCertificateById,
  normalizeCertificateId,
  type VerifiedCertificateRecord,
} from '../../data/siteConfig';
import { sanitizeInput } from '../../utils/security';

interface CertificateVerifyPageProps {
  path?: string;
}

export const CertificateVerifyPage: React.FC<CertificateVerifyPageProps> = ({ path = '/verify' }) => {
  const extractInitialCode = (): string => {
    try {
      const parts = path.split('/').filter(Boolean);
      if (parts.length >= 2 && parts[0] === 'verify') {
        return normalizeCertificateId(decodeURIComponent(parts.slice(1).join('/')));
      }
      if (typeof window !== 'undefined') {
        const q = new URLSearchParams(window.location.search);
        const param = q.get('id') || q.get('cert') || q.get('kode');
        if (param) return normalizeCertificateId(param);
      }
    } catch {
      // Abaikan kesalahan parsing URL
    }
    return '';
  };

  const [queryId, setQueryId] = useState<string>(extractInitialCode);
  const [searchedId, setSearchedId] = useState<string>('');
  const [record, setRecord] = useState<VerifiedCertificateRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const performVerification = async (rawId: string) => {
    const cleanId = normalizeCertificateId(rawId);
    if (!cleanId) return;
    setLoading(true);
    setSearchedId(cleanId);

    // 1. Periksa basis data sertifikat resmi terverifikasi di siteConfig.ts
    const localHit = verifyCertificateById(cleanId);
    if (localHit) {
      setRecord(localHit);
      setLoading(false);
      return;
    }

    // 2. Fallback pencarian ke koleksi Firestore `certificates/{certId}` bila tersedia
    try {
      const ref = doc(firestore, 'certificates', cleanId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as Partial<VerifiedCertificateRecord>;
        setRecord({
          certId: sanitizeInput(data.certId || cleanId, 80),
          recipientName: sanitizeInput(data.recipientName || 'Penerima Terdaftar', 160),
          institution: sanitizeInput(data.institution || '-', 160),
          programCode: (data.programCode as VerifiedCertificateRecord['programCode']) || 'KC_VIII',
          eventName: sanitizeInput(data.eventName || 'Kegiatan Resmi Menwa UNJ', 200),
          categoryOrRank: sanitizeInput(data.categoryOrRank || 'Peserta Terverifikasi', 160),
          predicate: sanitizeInput(data.predicate || 'Terverifikasi Komando', 160),
          eventDate: sanitizeInput(data.eventDate || '2026', 80),
          issuedDate: sanitizeInput(data.issuedDate || '2026', 80),
          signedBy: sanitizeInput(data.signedBy || 'Komandan Satuan Menwa UNJ', 120),
          signerTitle: sanitizeInput(data.signerTitle || 'Komandan Satuan Resimen Mahasiswa UNJ', 140),
          decreeNumber: sanitizeInput(data.decreeNumber || '-', 120),
          status: data.status === 'DICABUT' ? 'DICABUT' : 'SAH_TERVERIFIKASI',
        });
        setLoading(false);
        return;
      }
    } catch {
      // Tetap gunakan hasil verifikasi lokal apabila luring
    }

    setRecord(null);
    setLoading(false);
  };

  useEffect(() => {
    const initial = extractInitialCode();
    if (initial) {
      setQueryId(initial);
      performVerification(initial);
    }
  }, [path]);

  const handleCopyVerifyLink = () => {
    if (!record || typeof window === 'undefined') return;
    const verifyUrl = `${window.location.origin}/verify?id=${encodeURIComponent(record.certId)}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans">
      {/* Header Komando Verifikasi */}
      <section className="bg-[#041d24] text-white border-b border-[#006569]/60 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-teal-200 hover:text-[#FFDD00] transition"
            >
              <ArrowLeft size={15} />
              <span>Kembali ke Beranda Portal</span>
            </Link>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#006569]/40 border border-[#006569] text-[11px] font-mono text-[#FFDD00] font-bold">
              <QrCode size={13} /> SISTEM VALIDASI PIAGAM KOMANDO
            </span>
          </div>

          <div className="pt-2 max-w-3xl space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Verifikasi Keaslian Sertifikat &amp; Piagam Resmi
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Layanan validasi publik bagi sekolah, perguruan tinggi, dan instansi untuk memeriksa keabsahan sertifikat kompetisi nasional{' '}
              <strong className="text-[#FFDD00]">Ksatria Cendekia VIII</strong>,{' '}
              <strong className="text-[#FFDD00]">GERANAT VII</strong>,{' '}
              <strong className="text-[#FFDD00]">Youth Spark National Seminar</strong>, dan Pendidikan Satuan Menwa UNJ.
            </p>
          </div>

          {/* Formulir Pencarian Nomor Sertifikat */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              performVerification(queryId);
            }}
            className="pt-4 max-w-3xl"
          >
            <div className="flex flex-col sm:flex-row gap-3 bg-[#082c36] p-2.5 rounded-2xl border border-[#006569]">
              <div className="relative flex-1 flex items-center">
                <Search size={18} className="text-[#FFDD00] ml-3 shrink-0" />
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={queryId}
                  onChange={(e) => setQueryId(e.target.value)}
                  placeholder="Masukkan ID Sertifikat (contoh: CERT-GRN7-2026-014)..."
                  aria-label="Nomor atau ID Sertifikat"
                  className="w-full bg-transparent px-3 py-2.5 text-sm font-mono font-bold text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !queryId.trim()}
                className="px-6 py-3 rounded-xl bg-[#FFDD00] hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shrink-0"
              >
                {loading ? 'Memeriksa Data…' : 'Verifikasi Sertifikat'}
              </button>
            </div>
          </form>

          {/* Contoh Kode Sertifikat untuk Uji Cepat */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Contoh ID Terdaftar:</span>
            {VERIFIED_CERTIFICATES.slice(0, 4).map((sample) => (
              <button
                key={sample.certId}
                type="button"
                onClick={() => {
                  setQueryId(sample.certId);
                  performVerification(sample.certId);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#006569] text-teal-100 font-mono text-[11px] border border-white/15 transition cursor-pointer"
              >
                {sample.certId}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Hasil Pemeriksaan */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {!searchedId ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm grid sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#006569] flex items-center justify-center font-black">
                <QrCode size={20} />
              </div>
              <h2 className="font-black text-sm text-slate-900">1. Pindai QR atau Masukkan ID</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ketik kode unik yang tertera di pojok kanan bawah piagam penghargaan atau pindai QR Code pada sertifikat digital.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#006569] flex items-center justify-center font-black">
                <FileCheck size={20} />
              </div>
              <h2 className="font-black text-sm text-slate-900">2. Pencocokan Buku Registrasi</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sistem mencocokkan ID dengan arsip Surat Keputusan (SK) Komandan Satuan Resimen Mahasiswa UNJ.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#006569] flex items-center justify-center font-black">
                <ShieldCheck size={20} />
              </div>
              <h2 className="font-black text-sm text-slate-900">3. Bukti Validasi Cetak</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sekolah maupun bagian kemahasiswaan universitas dapat mencetak lembar validasi ini sebagai lampiran prestasi resmi.
              </p>
            </div>
          </div>
        ) : record ? (
          <article className="bg-white rounded-3xl border-2 border-[#006569] shadow-xl overflow-hidden print:shadow-none print:border-slate-800">
            {/* Pita Status Validasi */}
            <div className="bg-gradient-to-r from-[#006569] to-[#04363c] px-6 sm:px-8 py-5 text-white flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#FFDD00] font-bold block">
                    STATUS VALIDASI KOMANDO SATUAN UNJ
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    DOKUMEN SAH &amp; TERVERIFIKASI RESMI
                  </h2>
                </div>
              </div>
              <div className="font-mono text-xs bg-black/30 border border-white/20 px-3.5 py-2 rounded-xl text-[#FFDD00] font-bold">
                ID: {record.certId}
              </div>
            </div>

            {/* Rincian Metadata Sertifikat */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-200 pb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Diberikan Kepada Penerima / Kontingen
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  {record.recipientName}
                </h3>
                <p className="text-sm font-bold text-[#006569] mt-1 flex items-center gap-1.5">
                  <Building size={15} />
                  <span>{record.institution}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Nama Kegiatan / Ajang Resmi
                  </span>
                  <strong className="text-slate-900 font-black block mt-1">
                    {record.eventName}
                  </strong>
                </div>

                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#006569] block">
                    Capaian / Peringkat / Kualifikasi
                  </span>
                  <strong className="text-slate-900 font-black flex items-center gap-1.5 mt-1">
                    <Award size={16} className="text-[#006569] shrink-0" />
                    <span>{record.categoryOrRank}</span>
                  </strong>
                  <span className="text-xs text-slate-600 block mt-0.5">{record.predicate}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Nomor Registrasi / Surat Keputusan
                  </span>
                  <strong className="font-mono text-slate-900 font-bold block mt-1">
                    {record.decreeNumber}
                  </strong>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Tanggal Pelaksanaan &amp; Penerbitan
                  </span>
                  <strong className="text-slate-900 font-bold flex items-center gap-1.5 mt-1">
                    <Calendar size={15} className="text-[#006569]" />
                    <span>
                      Giat: {record.eventDate} • Terbit: {record.issuedDate}
                    </span>
                  </strong>
                </div>
              </div>

              {/* Pengesahan Pejabat Komando */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src="/logo-menwa-unj.png"
                    alt="Lambang Menwa UNJ"
                    className="w-12 h-12 object-contain shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFDD00] block">
                      PEJABAT PENGESAH DOKUMEN
                    </span>
                    <strong className="text-base font-black block">{record.signedBy}</strong>
                    <span className="text-xs text-slate-300">{record.signerTitle}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 print:hidden">
                  <button
                    type="button"
                    onClick={handleCopyVerifyLink}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copied ? 'Tautan Tersalin' : 'Salin Tautan Validasi'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2.5 rounded-xl bg-[#FFDD00] hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer size={14} />
                    <span>Cetak Bukti Validasi</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-rose-200 p-8 text-center max-w-2xl mx-auto space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertTriangle size={28} />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Kode Sertifikat Tidak Ditemukan
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Nomor <strong className="font-mono text-rose-700">{searchedId}</strong> belum terdaftar pada buku registrasi piagam digital Menwa Satuan UNJ. Pastikan penulisan tanda hubung sudah sesuai, atau hubungi Staf Administrasi Umum di Gedung G R.107 untuk verifikasi manual.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                to="/adminu"
                className="px-5 py-2.5 rounded-xl bg-[#006569] text-[#FFDD00] text-xs font-black uppercase tracking-wider"
              >
                Hubungi Staf Adminu
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CertificateVerifyPage;
