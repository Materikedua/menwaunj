import React, { useState } from 'react';
import {
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Building,
  Calendar,
  Phone,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  FileCheck2,
  ArrowRight,
  RefreshCw,
  X,
} from 'lucide-react';
import { getSubmissionById } from '../firebase.js';
import { playTactileClick } from '../lib/tactileAudio.js';

export function LetterProgressSection({ initialId = '', onClose }) {
  const [searchId, setSearchId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [letter, setLetter] = useState(null);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    const clean = searchId.trim();
    if (!clean) return;

    playTactileClick('press');
    setLoading(true);
    setSearched(true);
    setLetter(null);

    try {
      const res = await getSubmissionById(clean);
      setLetter(res);
      if (res) {
        playTactileClick('success');
      } else {
        playTactileClick('release');
      }
    } catch {
      setLetter(null);
    } finally {
      setLoading(false);
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
  };

  // Helper status visual
  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'disetujui' || s === 'selesai' || s === 'lunas') {
      return {
        label: 'Disetujui • Selesai Diproses',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-500',
        step: 4,
      };
    }
    if (s === 'diproses' || s === 'verifikasi') {
      return {
        label: 'Sedang Diproses oleh Staf Adminu',
        bg: 'bg-blue-50 text-blue-800 border-blue-300',
        dot: 'bg-blue-500 animate-pulse',
        step: 2,
      };
    }
    if (s === 'ditolak') {
      return {
        label: 'Ditolak / Memerlukan Revisi Berkas',
        bg: 'bg-rose-50 text-rose-800 border-rose-300',
        dot: 'bg-rose-500',
        step: 1,
      };
    }
    return {
      label: 'Menunggu Verifikasi & Disposisi Mako',
      bg: 'bg-amber-50 text-amber-900 border-amber-300',
      dot: 'bg-amber-500 animate-pulse',
      step: 1,
    };
  };

  const currentStatus = letter ? getStatusBadge(letter.status) : null;
  const currentStep = currentStatus?.step || 1;

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
            <span>Pelacakan Progres Surat &amp; Permohonan Dinas</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Cari Status &amp; Disposisi Surat Masuk
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Ketik nomor registrasi surat (contoh:{' '}
            <code className="text-[#006569] font-mono font-bold">B-001/Web/X/2026</code>) atau Token
            Peserta untuk mengecek perkembangan secara privat.
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
          Nomor Surat Resmi / Token Portal Peserta:
        </label>
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <input
              id="input-id-surat"
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Contoh: B-001/Web/X/2026 atau TOKEN PESERTA..."
              className="w-full bg-slate-50 focus:bg-white border-2 border-slate-300 focus:border-[#006569] rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition shadow-inner"
            />
            {searchId && (
              <button
                type="button"
                onClick={() => {
                  setSearchId('');
                  setLetter(null);
                  setSearched(false);
                }}
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

      {/* Area Hasil Pelacakan (Tampil Langsung di Bawah Formulir) */}
      {searched && !loading && !letter && (
        <div className="rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/60 p-6 sm:p-8 text-center space-y-3 animate-fade-in">
          <AlertCircle size={40} className="mx-auto text-rose-500" />
          <h4 className="text-base font-black text-rose-950">
            Surat dengan Nomor / ID Tersebut Tidak Ditemukan
          </h4>
          <p className="text-xs text-rose-700 max-w-md mx-auto leading-relaxed font-medium">
            Pastikan nomor surat (<span className="font-mono font-bold">B-001/Web/X/2026</span>) atau
            Token yang dimasukkan sudah benar dan sesuai dengan tanda terima pengajuan berkas Anda.
          </p>
        </div>
      )}

      {searched && !loading && letter && (
        <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in">
          {/* Status Badge & ID Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                ID Registrasi Surat:
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base sm:text-lg font-black text-slate-900 bg-white px-3 py-1 rounded-xl border border-slate-300 select-all">
                  {letter.submissionId || letter.id}
                </span>
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
              Tahapan Alur Berkas Surat:
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { num: 1, title: 'Surat Masuk', desc: 'Diterima sistem' },
                { num: 2, title: 'Verifikasi', desc: 'Pemeriksaan berkas' },
                { num: 3, title: 'Disposisi', desc: 'Persetujuan Mako' },
                { num: 4, title: 'Selesai Terbit', desc: 'Surat siap diunduh' },
              ].map((step) => {
                const isPassed = currentStep >= step.num;
                const isCurrent = currentStep === step.num;
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
                  <span className="text-slate-500 font-semibold block">Kategori Formulir:</span>
                  <span className="font-bold text-[#006569]">
                    {letter.formTitle || letter.category || 'Administrasi Umum'}
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
                <a
                  href={letter.documentPdfUrl || letter.documentPdfBase64}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`Surat_${letter.submissionId || 'Menwa_UNJ'}.pdf`}
                  className="neu-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-[#FFDD00] shadow-sm cursor-pointer"
                >
                  <FileText size={15} />
                  <span>Unduh Berkas Surat (PDF)</span>
                  <ExternalLink size={13} />
                </a>
              ) : (
                <span className="text-xs text-slate-500 italic">
                  Berkas lampiran fisik surat sedang dalam verifikasi arsip.
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
              Keamanan &amp; Kerahasiaan Data Surat
            </span>
            <p className="leading-relaxed">
              Sesuai SOP Markas Komando Menwa UNJ, daftar seluruh surat tidak dipublikasikan secara
              terbuka. Informasi tahapan hanya ditampilkan secara privat kepada pemilik ID atau
              Token surat yang bersangkutan.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
