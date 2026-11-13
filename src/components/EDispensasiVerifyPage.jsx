/**
 * EDispensasiVerifyPage — Portal Verifikasi Dokumen Resmi & Integrasi QR E-Spri Menwa UNJ
 * Mendukung pemindaian QR Code surat dari aplikasi E-Spri maupun E-Dispensasi:
 * - /verifikasi?hash={hash} (dan alias ?no=, ?id=, ?kode=, ?nomor=, ?doc=, ?surat=)
 * - /verifikasi/{hash}
 * - /verifikasi-surat/{idOrHash}
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  Clock,
  ArrowLeft,
  Search,
  Printer,
  Building2,
  BadgeCheck,
  QrCode,
  FileText,
  Copy,
  Check,
  Hash,
  ShieldAlert,
} from 'lucide-react';
import { verifyLetterOrEspriDocument } from '../firebase.js';
import { navigate, Link } from '../lib/router.jsx';
import {
  extractVerificationLookupInput,
  buildEspriVerificationUrls,
} from '../utils/espriVerification';
import { sanitizeInput } from '../utils/security';

export function EDispensasiVerifyPage({ path = '/verifikasi' }) {
  const resolveUrlLookup = useCallback(() => {
    const rawPath =
      typeof window !== 'undefined' ? window.location.pathname : path || '/verifikasi';
    const rawSearch = typeof window !== 'undefined' ? window.location.search : '';
    return extractVerificationLookupInput(rawPath, rawSearch);
  }, [path]);

  const [searchId, setSearchId] = useState(() => resolveUrlLookup());
  const [searchedQuery, setSearchedQuery] = useState('');
  const [loading, setLoading] = useState(() => Boolean(resolveUrlLookup()));
  const [result, setResult] = useState(null); // { kind: 'espri' | 'dispensasi', data: ... }
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchDocument = useCallback(async (idToSearch) => {
    const cleanId = sanitizeInput(String(idToSearch || '').trim(), 128);
    if (!cleanId) {
      setResult(null);
      setError('');
      setSearchedQuery('');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setSearchedQuery(cleanId);

    try {
      const hit = await verifyLetterOrEspriDocument(cleanId);
      if (hit) {
        setResult(hit);
      } else {
        setError(
          `Dokumen dengan kode atau nomor "${cleanId}" tidak ditemukan dalam registri verifikasi resmi Menwa Satuan UNJ.`
        );
      }
    } catch (err) {
      console.error('Kesalahan verifikasi dokumen resmi:', err);
      setError(
        'Terjadi kendala saat memeriksa keabsahan dokumen ke pangkalan data cloud. Silakan coba kembali.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const urlLookup = resolveUrlLookup();
    if (urlLookup) {
      setSearchId(urlLookup);
      fetchDocument(urlLookup);
    } else {
      setResult(null);
      setError('');
      setSearchedQuery('');
      setLoading(false);
    }
  }, [path, resolveUrlLookup, fetchDocument]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const clean = sanitizeInput(searchId.trim(), 128);
    if (!clean) return;
    navigate(`/verifikasi?hash=${encodeURIComponent(clean)}`);
    fetchDocument(clean);
  };

  const handleCopyVerifyLink = () => {
    if (typeof window === 'undefined') return;
    const activeCode =
      result?.kind === 'espri'
        ? result.data.hash
        : result?.data?.dispensasiId || searchedQuery;
    if (!activeCode) return;
    const { primaryQueryUrl } = buildEspriVerificationUrls(activeCode, window.location.origin);
    navigator.clipboard.writeText(primaryQueryUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const formatTgl = (val) => {
    if (!val || val === '-') return '-';
    try {
      const d = new Date(val);
      if (Number.isNaN(d.getTime())) return String(val);
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return String(val);
    }
  };

  const renderEspriBannerMeta = (docData) => {
    if (docData.status === 'DICABUT' || docData.status === 'KEDALUWARSA') {
      return {
        boxClass: 'bg-rose-950/50 border-rose-500/40',
        iconBoxClass: 'bg-rose-500 text-white',
        labelClass: 'text-rose-400',
        badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        icon: <ShieldAlert size={24} />,
        kicker:
          docData.status === 'DICABUT'
            ? 'DOKUMEN DICABUT / DIBATALKAN'
            : 'MASA BERLAKU DOKUMEN HABIS',
        heading:
          docData.status === 'DICABUT'
            ? 'Surat Resmi Telah Dinyatakan Tidak Berlaku'
            : 'Masa Berlaku Surat Telah Berakhir',
      };
    }

    if (docData.status === 'MENUNGGU_TTD') {
      return {
        boxClass: 'bg-amber-950/40 border-amber-500/35',
        iconBoxClass: 'bg-amber-400 text-slate-950',
        labelClass: 'text-amber-400',
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        icon: <Clock size={24} />,
        kicker: 'DALAM PROSES OTORISASI KOMANDO',
        heading: 'Naskah Dinas Menunggu Tanda Tangan Resmi',
      };
    }

    return {
      boxClass: 'bg-emerald-950/45 border-emerald-500/35',
      iconBoxClass: 'bg-emerald-500 text-slate-950',
      labelClass: 'text-emerald-400',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: <CheckCircle2 size={24} />,
      kicker: 'DOKUMEN SAH & TERVERIFIKASI RESMI',
      heading: 'Naskah Dinas Asli Tercatat pada Sistem Komando',
    };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-7 md:py-12 px-3 sm:px-6 lg:px-8 font-sans selection:bg-[#006569] selection:text-[#FFDD00]">
      <div className="max-w-3xl mx-auto space-y-5 md:space-y-8">
        {/* Bar Navigasi & Status Portal */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-white/10 pb-4 md:pb-6">
          <Link
            to="/adminu"
            className="inline-flex items-center gap-1.5 text-[11px] md:text-xs font-black uppercase tracking-wider text-slate-400 hover:text-[#FFDD00] transition"
          >
            <ArrowLeft size={15} />
            <span>Kembali ke Layanan Surat</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#006569]/30 border border-[#006569] text-[#FFDD00] text-[10px] md:text-[11px] font-black uppercase tracking-widest">
            <ShieldCheck size={13} className="text-[#FFDD00]" />
            <span>Verifikasi QR E-Spri &amp; Surat</span>
          </div>
        </div>

        {/* Judul Portal Verifikasi */}
        <div className="text-center space-y-1.5 md:space-y-2">
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Verifikasi Keaslian Surat Resmi &amp; E-Spri
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Sistem autentikasi QR naskah dinas SOP Resimen Mahasiswa Jayakarta Satuan Universitas
            Negeri Jakarta (terintegrasi langsung dengan E-Spri &amp; E-Dispensasi).
          </p>
        </div>

        {/* Formulir Pencarian Kode / Hash QR */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-lg mx-auto">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchId}
              maxLength={128}
              onChange={(e) => setSearchId(e.target.value)}
              aria-label="Hash QR atau Nomor Surat Resmi"
              placeholder="Masukkan hash QR, nomor surat, atau DISP-..."
              className="w-full !bg-slate-900 border border-slate-700 focus:border-[#006569] focus:ring-2 focus:ring-[#006569]/30 rounded-2xl py-3 pl-4 pr-24 text-xs sm:text-sm !text-white !placeholder-slate-400 font-mono focus:outline-none transition shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !searchId.trim()}
              className="absolute right-1.5 px-3.5 py-2 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] text-[11px] font-black uppercase tracking-wider transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Search size={13} />
              <span>Periksa</span>
            </button>
          </div>
        </form>

        {/* Panduan Ringkas Sebelum Pencarian */}
        {!loading && !error && !result && (
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-7 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5 bg-slate-950/50 p-3.5 rounded-xl border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-[#006569]/40 text-[#FFDD00] flex items-center justify-center">
                <QrCode size={16} />
              </div>
              <h2 className="font-black text-white text-xs">1. Pindai Kode QR Surat</h2>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Pindai QR yang tercetak di surat terbitan E-Spri untuk langsung membuka tautan{' '}
                <code className="text-teal-300">/verifikasi?hash=...</code>.
              </p>
            </div>
            <div className="space-y-1.5 bg-slate-950/50 p-3.5 rounded-xl border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-[#006569]/40 text-[#FFDD00] flex items-center justify-center">
                <FileText size={16} />
              </div>
              <h2 className="font-black text-white text-xs">2. Pencocokan Registri SOP</h2>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Portal mencocokkan hash unik dokumen terhadap koleksi terenkripsi{' '}
                <code className="text-teal-300">publicVerifications</code> &amp; arsip Mako.
              </p>
            </div>
            <div className="space-y-1.5 bg-slate-950/50 p-3.5 rounded-xl border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-[#006569]/40 text-[#FFDD00] flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
              <h2 className="font-black text-white text-xs">3. Cek Pejabat Pengesah</h2>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Pastikan nomor surat, perihal, tujuan, serta pejabat penandatangan sama persis dengan
                naskah fisik atau PDF.
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 md:p-10 text-center space-y-4 animate-pulse">
            <div className="w-11 h-11 rounded-full border-4 border-[#006569]/30 border-t-[#FFDD00] animate-spin mx-auto" />
            <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
              Menghubungkan ke Registri Verifikasi Komando…
            </p>
          </div>
        )}

        {/* Not Found / Error State */}
        {!loading && error && (
          <div className="bg-red-950/40 border border-red-500/50 rounded-3xl p-6 md:p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle size={28} />
            </div>
            <div className="space-y-1">
              <h2 className="text-base md:text-lg font-black text-white">
                Dokumen Tidak Ditemukan / Tidak Valid
              </h2>
              <p className="text-xs text-red-200 max-w-md mx-auto leading-relaxed">{error}</p>
            </div>
            <p className="text-[11px] text-slate-400">
              Pastikan kode QR berasal dari naskah resmi terbaru yang diterbitkan oleh Satuan Menwa
              UNJ atau aplikasi E-Spri.
            </p>
          </div>
        )}

        {/* Result State 1: E-Spri / Surat Keluar SOP (`/publicVerifications/{hash}`) */}
        {!loading && result?.kind === 'espri' && (() => {
          const docData = result.data;
          const banner = renderEspriBannerMeta(docData);
          const isRevoked = docData.status === 'DICABUT' || docData.status === 'KEDALUWARSA';

          return (
            <article
              className={`bg-gradient-to-b from-slate-900 to-slate-900/95 border-2 rounded-3xl p-5 sm:p-8 space-y-5 print:border-slate-800 print:shadow-none ${
                isRevoked
                  ? 'border-rose-500/60 shadow-[0_0_45px_rgba(244,63,94,0.15)]'
                  : 'border-emerald-500/60 shadow-[0_0_45px_rgba(16,185,129,0.15)]'
              }`}
            >
              {/* Status Header */}
              <div
                className={`flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3.5 border rounded-2xl p-4 ${banner.boxClass}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-black shadow-md ${banner.iconBoxClass}`}
                  >
                    {banner.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[11px] font-black uppercase tracking-wider ${banner.labelClass}`}
                      >
                        {banner.kicker}
                      </span>
                      <BadgeCheck size={15} className={banner.labelClass} />
                    </div>
                    <h2 className="text-base md:text-lg font-black text-white leading-snug">
                      {banner.heading}
                    </h2>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-widest border ${banner.badgeClass}`}
                  >
                    STATUS: {docData.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    SUMBER: {docData.source}
                  </span>
                </div>
              </div>

              {/* Metadata Grid SOP Surat */}
              <div className="space-y-4 bg-slate-950/60 rounded-2xl p-4 md:p-5 border border-white/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
                      Nomor Surat Resmi
                    </span>
                    <p className="text-sm font-mono font-black text-[#FFDD00] break-all">
                      {docData.letterNumber}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
                      Jenis Naskah &amp; Tanggal Terbit
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <Calendar size={14} className="text-teal-400 shrink-0" />
                      <span>
                        {docData.letterType} • {formatTgl(docData.issuedDate)}
                      </span>
                    </p>
                  </div>

                  <div className="sm:col-span-2 space-y-1 bg-white/5 p-3.5 rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#FFDD00]">
                      Perihal Naskah Dinas
                    </span>
                    <p className="text-sm font-black text-white leading-snug">{docData.subject}</p>
                    {docData.statusReason && (
                      <p className="text-xs text-amber-200 mt-1 italic">
                        Catatan: {docData.statusReason}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
                      Tujuan / Penerima Surat
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <Building2 size={14} className="text-slate-400 shrink-0" />
                      <span>{docData.recipient}</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
                      Unit / Satuan Penerbit
                    </span>
                    <p className="text-xs font-medium text-slate-200">{docData.issuingUnit}</p>
                  </div>

                  {docData.agendaNumber && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
                        Nomor Urut Agenda
                      </span>
                      <p className="text-xs font-mono font-bold text-teal-300">
                        #{docData.agendaNumber}
                      </p>
                    </div>
                  )}

                  {docData.validUntil && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
                        Masa Berlaku Hingga
                      </span>
                      <p className="text-xs font-bold text-slate-200">
                        {formatTgl(docData.validUntil)}
                      </p>
                    </div>
                  )}

                  {/* Otorisasi Pejabat */}
                  <div className="sm:col-span-2 pt-3 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
                        Pejabat Penandatangan
                      </span>
                      <p className="text-sm font-black text-white">{docData.signerName}</p>
                      <p className="text-xs text-slate-300">
                        {docData.signerTitle}
                        {docData.signerNia ? ` • NIA/NBP: ${docData.signerNia}` : ''}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400 flex items-center sm:justify-end gap-1">
                        <Hash size={11} /> Kode Hash QR
                      </span>
                      <p className="text-[11px] font-mono text-teal-300 break-all">
                        {docData.hash}
                      </p>
                    </div>
                  </div>

                  {docData.documentSha256 && (
                    <div className="sm:col-span-2 pt-2 border-t border-white/5">
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
                        Checksum SHA-256 Berkas Asli
                      </span>
                      <p className="text-[11px] font-mono text-slate-300 break-all mt-0.5">
                        {docData.documentSha256}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1 print:hidden">
                <button
                  type="button"
                  onClick={handleCopyVerifyLink}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? 'Tautan Tersalin' : 'Salin Tautan Verifikasi'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#FFDD00] hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Cetak Bukti Verifikasi</span>
                </button>
              </div>
            </article>
          );
        })()}

        {/* Result State 2: Legacy / E-Dispensasi (`/dispensasi_requests/{dispId}`) */}
        {!loading && result?.kind === 'dispensasi' && (() => {
          const letterData = result.data;
          return (
            <article className="bg-gradient-to-b from-slate-900 to-slate-900/95 border-2 border-emerald-500/60 rounded-3xl p-5 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.15)] space-y-5">
              <div
                className={`flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border rounded-2xl p-4 ${
                  letterData.status === 'disetujui'
                    ? 'bg-emerald-950/40 border-emerald-500/30'
                    : letterData.status === 'belum disetujui'
                    ? 'bg-rose-950/40 border-rose-500/30'
                    : 'bg-amber-950/40 border-amber-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-black shadow-md ${
                      letterData.status === 'disetujui'
                        ? 'bg-emerald-500 text-slate-950'
                        : letterData.status === 'belum disetujui'
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-400 text-slate-950'
                    }`}
                  >
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black uppercase tracking-wider ${
                          letterData.status === 'disetujui'
                            ? 'text-emerald-400'
                            : letterData.status === 'belum disetujui'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {letterData.status === 'disetujui'
                          ? 'Surat Resmi Terverifikasi'
                          : 'Surat Dalam Peninjauan ACC'}
                      </span>
                      <BadgeCheck
                        size={16}
                        className={
                          letterData.status === 'disetujui' ? 'text-emerald-400' : 'text-amber-400'
                        }
                      />
                    </div>
                    <h2 className="text-base md:text-lg font-black text-white">
                      {letterData.status === 'disetujui'
                        ? 'E-Dispensasi Dinyatakan Asli & Sah'
                        : 'E-Dispensasi Menunggu ACC Resmi Admin Mako'}
                    </h2>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-widest border ${
                      letterData.status === 'disetujui'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : letterData.status === 'belum disetujui'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    STATUS: {letterData.status ? letterData.status.toUpperCase() : 'PENGAJUAN'}
                  </span>
                </div>
              </div>

              <div className="space-y-4 bg-slate-950/50 rounded-2xl p-4 md:p-5 border border-white/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
                      Nomor Dokumen
                    </span>
                    <p className="text-sm font-mono font-black text-[#FFDD00] break-all">
                      {letterData.dispensasiId}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
                      Tanggal Kegiatan
                    </span>
                    <p className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400 shrink-0" />
                      {formatTgl(letterData.tanggal)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
                      Nama Mahasiswa
                    </span>
                    <p className="text-sm font-black text-white flex items-center gap-1.5">
                      <User size={14} className="text-[#006569] shrink-0" />
                      {letterData.namaMahasiswa}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
                      NIM
                    </span>
                    <p className="text-sm font-mono font-bold text-white">{letterData.nim}</p>
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
                      Program Studi / Fakultas
                    </span>
                    <p className="text-sm font-medium text-white flex items-center gap-1.5">
                      <Building2 size={14} className="text-slate-400 shrink-0" />
                      {letterData.prodi}
                    </p>
                  </div>
                  <div className="sm:col-span-2 space-y-1 bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#FFDD00]">
                      Keperluan Dispensasi
                    </span>
                    <p className="text-sm font-bold text-white">{letterData.keperluan}</p>
                    {letterData.keterangan && (
                      <p className="text-xs text-slate-300 mt-1 italic">"{letterData.keterangan}"</p>
                    )}
                  </div>
                  <div className="sm:col-span-2 space-y-1 pt-2 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
                        Otorisasi Komandan Satuan
                      </span>
                      <p className="text-xs font-bold text-white">
                        {letterData.dansat || 'Moch. Naufal Aziz'} — Dansat Menwa UNJ
                      </p>
                    </div>
                    {letterData.createdAt?.toDate && (
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
                          Waktu Penerbitan
                        </span>
                        <p className="text-xs text-slate-300 font-mono">
                          {letterData.createdAt.toDate().toLocaleString('id-ID')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1 print:hidden">
                <button
                  type="button"
                  onClick={handleCopyVerifyLink}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? 'Tautan Tersalin' : 'Salin Tautan Verifikasi'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#FFDD00] hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Cetak Bukti Verifikasi</span>
                </button>
              </div>
            </article>
          );
        })()}

        {/* Footer Info */}
        <div className="text-center text-[11px] text-slate-500 space-y-1 pt-2">
          <p>Markas Komando Resimen Mahasiswa Jayakarta Satuan Universitas Negeri Jakarta</p>
          <p>Gedung G R.107 Kampus A UNJ, Rawamangun, Jakarta Timur | unjmenwa@gmail.com</p>
        </div>
      </div>
    </div>
  );
}

export default EDispensasiVerifyPage;