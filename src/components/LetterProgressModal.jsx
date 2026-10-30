import React, { useState } from 'react';
import {
  X,
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
  Send,
  ArrowRight,
} from 'lucide-react';
import { getSubmissionById } from '../firebase.js';
import { playTactileClick } from '../lib/tactileAudio.js';

export function LetterProgressModal({ isOpen, onClose, initialId = '' }) {
  const [searchId, setSearchId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [letter, setLetter] = useState(null);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

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

  const statusInfo = letter ? getStatusBadge(letter.status) : null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in font-sans"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="progress-modal-title"
        className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 text-slate-800 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup */}
        <button
          type="button"
          onClick={() => {
            playTactileClick('release');
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Tutup pelacak progres surat"
        >
          <X size={20} />
        </button>

        {/* Header Modal */}
        <div className="flex items-center gap-3.5 pb-4 mb-4 border-b border-slate-100 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-[#006569] text-[#FFDD00] flex items-center justify-center font-black shadow-md shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#006569] block">
              LAYANAN ADMINISTRASI MAKO
            </span>
            <h3 id="progress-modal-title" className="text-xl font-black text-slate-900 leading-tight">
              Cari Progres Surat &amp; Permohonan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cek status verifikasi, disposisi, dan surat resmi tanpa harus datang ke Mako.
            </p>
          </div>
        </div>

        {/* Form Pencarian Spesifik */}
        <form onSubmit={handleSearch} className="mb-4 shrink-0">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
            Masukkan ID Surat / Nomor Registrasi
          </label>
          <div className="flex gap-2">
            <div className="neu-search-capsule flex-1 px-4 py-2 border-2 border-slate-200">
              <Search size={16} className="text-teal-700 shrink-0" />
              <input
                type="text"
                required
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Contoh: ADM-XXXX-XXXX atau REG-XXXX"
                className="bg-transparent border-none text-xs sm:text-sm text-black font-bold placeholder:text-slate-400 focus:outline-none w-full"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchId.trim()}
              className="neu-btn-primary px-5 py-2.5 rounded-full text-white text-xs font-black uppercase tracking-wider shadow-md cursor-pointer disabled:opacity-40 shrink-0 flex items-center gap-1.5"
            >
              <Search size={14} />
              <span>{loading ? 'Mencari...' : 'Lacak'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            🔒 <em>Privasi Terjaga: Sistem hanya menampilkan surat spesifik yang kodenya Anda masukkan.</em>
          </p>
        </form>

        {/* Hasil Pencarian (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {searched && !loading && !letter && (
            <div className="rounded-2xl p-6 bg-slate-50 border border-slate-200 text-center space-y-2">
              <AlertCircle size={28} className="mx-auto text-amber-600" />
              <h4 className="font-black text-sm text-slate-800">
                Surat / Permohonan Tidak Ditemukan
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                ID surat <strong>"{searchId}"</strong> tidak terdaftar di sistem Mako. Pastikan Anda memasukkan kode lengkap yang diterima saat mengirim formulir (contoh: ADM-XXXX-XXXX).
              </p>
            </div>
          )}

          {letter && statusInfo && (
            <div className="space-y-4 animate-fade-in">
              {/* Badge Status */}
              <div
                className={`p-4 rounded-2xl border ${statusInfo.bg} flex items-center justify-between gap-3 shadow-xs`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full ${statusInfo.dot}`} />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                      Status Terkini
                    </span>
                    <strong className="text-sm font-black">{statusInfo.label}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyId}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/80 hover:bg-white text-slate-800 text-[11px] font-bold border border-slate-300 transition cursor-pointer"
                  title="Salin Nomor Surat"
                >
                  {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copied ? 'Tersalin' : 'Salin ID'}</span>
                </button>
              </div>

              {/* Rincian Surat */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                  <span className="text-slate-500 font-semibold">Nomor Surat / ID:</span>
                  <span className="font-mono font-black text-[#006569]">
                    {letter.submissionId || letter.id}
                  </span>
                </div>
                <div className="flex justify-between items-start pb-2 border-b border-slate-200/80">
                  <span className="text-slate-500 font-semibold">Jenis Layanan:</span>
                  <span className="font-bold text-slate-900 text-right max-w-[65%]">
                    {letter.serviceType || letter.title || 'Layanan Administrasi'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                  <span className="text-slate-500 font-semibold">Nama Pemohon:</span>
                  <span className="font-bold text-slate-900">{letter.fullName || '-'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                  <span className="text-slate-500 font-semibold">Asal Instansi:</span>
                  <span className="font-bold text-slate-900">{letter.institution || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Waktu Pengajuan:</span>
                  <span className="text-slate-700 font-mono">
                    {letter.createdAt ? new Date(letter.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                  </span>
                </div>
              </div>

              {/* Catatan Disposisi Mako */}
              {letter.adminNotes && (
                <div className="rounded-2xl p-4 bg-teal-50/70 border border-teal-200 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#006569] flex items-center gap-1">
                    <ShieldCheck size={13} />
                    <span>Catatan Resmi Petugas Piket / Staf Mako</span>
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {letter.adminNotes}
                  </p>
                </div>
              )}

              {/* Berkas Terlampir */}
              {(letter.documentPdfUrl || letter.documentPdfBase64) && (
                <div className="p-3.5 rounded-2xl bg-white border-2 border-teal-200 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-teal-100 text-[#006569] flex items-center justify-center font-black shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">
                        {letter.documentPdfName || 'Berkas_Pengajuan.pdf'}
                      </p>
                      <span className="text-[10px] text-teal-700 font-mono">
                        Dokumen PDF Terverifikasi di Database Mako
                      </span>
                    </div>
                  </div>
                  <a
                    href={letter.documentPdfUrl || letter.documentPdfBase64}
                    download={letter.documentPdfName || 'Berkas_Pengajuan.pdf'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neu-btn-gold px-3.5 py-1.5 rounded-xl text-xs font-black text-slate-950 inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <span>Unduh PDF</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}

              {/* Stepper Progres Timeline */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                  Tahapan Alur Surat di Markas Komando
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="space-y-1">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xs font-black">
                      ✓
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 block">1. Masuk</span>
                  </div>
                  <div className="space-y-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto text-xs font-black ${
                        statusInfo.step >= 2 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {statusInfo.step >= 2 ? '✓' : '2'}
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 block">2. Verifikasi</span>
                  </div>
                  <div className="space-y-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto text-xs font-black ${
                        statusInfo.step >= 3 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {statusInfo.step >= 3 ? '✓' : '3'}
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 block">3. Disposisi</span>
                  </div>
                  <div className="space-y-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto text-xs font-black ${
                        statusInfo.step >= 4 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {statusInfo.step >= 4 ? '✓' : '4'}
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 block">4. Terbit</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Mako Menwa UNJ • Kampus A Gedung G R.107
          </span>
          <button
            type="button"
            onClick={() => {
              playTactileClick('release');
              onClose();
            }}
            className="neu-pill-tab px-4 py-2 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export default LetterProgressModal;
