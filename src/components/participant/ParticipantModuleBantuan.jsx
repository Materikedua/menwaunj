import React from 'react';
import {
  FileText,
  Download,
  Phone,
} from 'lucide-react';

export function ParticipantModuleBantuan({
  detectedSchoolName,
  activeSlug,
}) {
  return (
    <div className="neu-card rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/70 pb-4">
        <div>
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#006569] block">
            MODUL 06 · LAYANAN KONTINGEN &amp; PUSAT BANTUAN
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#092D32]">
            Pusat Unduh Juknis &amp; Helpdesk Panitia
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Dokumen teknis resmi perlombaan GERANAT, template formulir dan surat pernyataan, serta saluran koordinasi langsung dengan Panitia Menwa UNJ.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Helpdesk Siaga 24/7
        </span>
      </div>

      {/* Grid Download Cepat & Kontak WA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl neu-card-sm p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#006569] flex items-center justify-center font-bold">
              <FileText size={20} />
            </div>
            <h3 className="text-sm font-black text-[#092D32]">Buku Panduan &amp; Juknis GERANAT 2026</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Petunjuk teknis resmi perlombaan LFPB GERANAT Satuan Menwa UNJ mencakup ketentuan lapangan, materi gerakan PBB, tata cara penghormatan, dan jadwal registrasi ulang.
            </p>
          </div>
          <a
            href="/docs/juknis-geranat-2026.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl neu-btn-primary bg-gradient-to-r from-[#006569] to-[#092D32] text-[#FFDD00] hover:text-white font-black text-xs uppercase tracking-wider shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>Unduh Juknis Lengkap (PDF)</span>
          </a>
        </div>

        <div className="rounded-2xl neu-card-sm p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center font-bold">
              <Phone size={20} />
            </div>
            <h3 className="text-sm font-black text-[#092D32]">Helpdesk WhatsApp Resmi Panitia</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mengalami kendala saat melengkapi biodata 20 personel, upload berkas, atau verifikasi nomor urut kontingen? Hubungi panitia teknis melalui WhatsApp.
            </p>
          </div>
          <a
            href={`https://wa.me/6281234567890?text=${encodeURIComponent(
              `Halo Panitia GERANAT Menwa UNJ, saya Official dari kontingen ${detectedSchoolName} (${activeSlug}). Ingin bertanya terkait kelengkapan administrasi.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs uppercase tracking-wider shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Phone size={14} />
            <span>Hubungi Panitia (WhatsApp)</span>
          </a>
        </div>
      </div>

      {/* Frequently Asked Questions Ringkas */}
      <div className="rounded-2xl bg-[#F5F8F6] border border-slate-200/80 p-5 space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-[#092D32]">
          Pertanyaan Umum Official (FAQ)
        </h4>
        <div className="space-y-2.5 text-xs text-slate-600">
          <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
            <strong className="text-[#092D32] block mb-0.5">Berapa kuota personel wajib yang harus diisi?</strong>
            Setiap kontingen wajib mendaftarkan 16 Pasukan Peleton Inti + 2 Pasukan Cadangan (total 18 pasukan) serta 2 Official Pendamping. Total keseluruhan adalah 20 personel.
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
            <strong className="text-[#092D32] block mb-0.5">Format file apa saja yang diterima untuk pemberkasan?</strong>
            Format yang didukung adalah PDF, JPG, PNG, atau WEBP dengan ukuran maksimal 2 MB per berkas dokumen wajib.
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
            <strong className="text-[#092D32] block mb-0.5">Kapan penilaian dari dewan juri dipublikasikan?</strong>
            Penilaian dewan juri akan muncul secara bertahap atau setelah seluruh kontingen menyelesaikan rangkaian penampilan di lapangan sesuai instruksi dewan juri.
          </div>
        </div>
      </div>
    </div>
  );
}
