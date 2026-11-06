import React, { useState } from 'react';
import { Printer, Copy, Check, FileText } from 'lucide-react';
import { BLANK_LETTERHEAD_HTML, OFFICIAL_MAKO_CONTACT } from '../data/officialLetterheadTemplate.js';

export function OfficialLetterhead({
  nomorSurat = 'B-____/Sat-UNJ/____/2026',
  lampiran = '-',
  perihal = '________________________________________',
  penerimaNama = '[Nama Penerima / Lembaga]',
  penerimaLokasi = 'di Tempat',
  tanggalSurat = 'Jakarta, ____ _____________ 2026',
  children,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(BLANK_LETTERHEAD_HTML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 text-white rounded-2xl border border-white/10 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#006569] text-[#FFDD00] rounded-xl">
            <FileText size={20} />
          </div>
          <div>
            <h4 className="font-black text-sm text-white">Template Kop Surat Resmi Menwa UNJ</h4>
            <p className="text-xs text-slate-400">
              Format kedinasan standar SKEP Komando Resimen Mahasiswa Satuan UNJ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyHtml}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-white/10 flex items-center gap-1.5 transition cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Tersalin!' : 'Salin Kode HTML'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <Printer size={15} />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Frame */}
      <div className="bg-white p-8 sm:p-12 max-w-[210mm] mx-auto border border-slate-200 rounded-3xl shadow-xl text-black font-serif print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-full">
        {/* Header Kop Surat */}
        <div className="flex items-center justify-between gap-4 text-center pb-2">
          <img
            src={OFFICIAL_MAKO_CONTACT.logoLeft}
            alt="Logo UNJ"
            className="w-20 h-20 object-contain shrink-0"
          />
          <div className="flex-1">
            <h1 className="text-[14pt] font-bold tracking-tight uppercase leading-snug">
              KOMANDO RESIMEN MAHASISWA JAKARTA RAYA
            </h1>
            <h2 className="text-[15pt] font-bold tracking-wider uppercase leading-snug">
              JAYAKARTA
            </h2>
            <h3 className="text-[16pt] font-black tracking-normal uppercase leading-snug">
              SATUAN UNIVERSITAS NEGERI JAKARTA
            </h3>
            <p className="text-[9.5pt] font-sans font-normal leading-tight mt-1 text-slate-800">
              {OFFICIAL_MAKO_CONTACT.address}, Telp ({OFFICIAL_MAKO_CONTACT.phone})
            </p>
          </div>
          <img
            src={OFFICIAL_MAKO_CONTACT.logoRight}
            alt="Logo Menwa Jayakarta"
            className="w-20 h-20 object-contain shrink-0"
          />
        </div>

        {/* Double Line Divider (Khas Kedinasan) */}
        <div className="border-t-[3px] border-black border-b border-black h-1 my-3" />

        {/* Metadata Surat */}
        <table className="w-full text-[11pt] mb-6">
          <tbody>
            <tr>
              <td className="w-24 py-0.5">Nomor</td>
              <td className="w-4 text-center">:</td>
              <td className="font-mono">{nomorSurat}</td>
            </tr>
            <tr>
              <td className="w-24 py-0.5">Lampiran</td>
              <td className="w-4 text-center">:</td>
              <td>{lampiran}</td>
            </tr>
            <tr>
              <td className="w-24 py-0.5">Perihal</td>
              <td className="w-4 text-center">:</td>
              <td className="font-bold">{perihal}</td>
            </tr>
          </tbody>
        </table>

        {/* Penerima Surat */}
        <div className="text-[11pt] mb-6 leading-relaxed">
          Kepada Yth.<br />
          <strong>{penerimaNama}</strong><br />
          {penerimaLokasi}
        </div>

        <div className="text-[11pt] mb-4">
          Dengan hormat,
        </div>

        {/* Isi Surat */}
        <div className="min-h-[300pt] text-[12pt] leading-relaxed text-justify mb-8">
          {children || (
            <div className="p-12 border-2 border-dashed border-slate-300 rounded-2xl text-center text-slate-400 italic text-sm no-print">
              [Area Naskah Dinas — Template Kosong Siap Digunakan]
            </div>
          )}
        </div>

        {/* Tanda Tangan Komandan */}
        <div className="flex justify-end text-[11pt] text-center mb-8">
          <div className="w-72">
            <div>{tanggalSurat}</div>
            <div className="mt-1 mb-20 leading-snug">
              Komandan Resimen Mahasiswa<br />
              Universitas Negeri Jakarta
            </div>
            <div className="font-bold underline">{OFFICIAL_MAKO_CONTACT.dansatName}</div>
            <div className="font-mono text-[10pt]">NBP {OFFICIAL_MAKO_CONTACT.dansatNbp}</div>
          </div>
        </div>

        {/* Tembusan & CP */}
        <div className="text-[10pt] leading-snug border-t border-slate-200 pt-3">
          <strong>Tembusan:</strong>
          1. Arsip<br />
          CP: {OFFICIAL_MAKO_CONTACT.phoneFormatted} (Raffli)
        </div>
      </div>
    </div>
  );
}

export default OfficialLetterhead;
