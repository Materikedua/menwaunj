import React from 'react';
import { ShieldCheck, Star, Award, BookOpen, ChevronRight, CreditCard, Flag } from 'lucide-react';
import { PANCA_DHARMA_SATYA, TEKAD_DAN_PENDIRIAN } from '../data/siteData.js';
import { playTactileClick } from '../lib/tactileAudio.js';

/**
 * Komponen Doktrin Resmi Komando Resimen Mahasiswa Indonesia:
 * 1. Panca Dharma Satya Resimen Mahasiswa Indonesia
 * 2. Tekad dan Pendirian Resimen Mahasiswa Indonesia
 */
export function MenwaDoctrines({ onOpenKTA = null, className = '' }) {
  return (
    <section aria-labelledby="doktrin-menwa-title" className={`space-y-8 ${className}`}>
      {/* Header Doktrin */}
      <div className="text-center max-w-3xl mx-auto space-y-2.5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-[#006569]/10 text-[#006569] border border-[#006569]/20 shadow-sm">
          <ShieldCheck size={16} />
          <span>Doktrin &amp; Kode Kehormatan Korps</span>
        </div>
        <h2 id="doktrin-menwa-title" className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Panca Dharma Satya &amp; Tekad Pendirian
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
          Semboyan suci <strong className="text-[#006569]">Widya Castrena Dharma Siddha</strong> menjadi nafas pengabdian prajurit intelektual dalam menjaga kedaulatan bangsa dan keluhuran garba ilmiah.
        </p>
      </div>

      {/* Grid 2 Kolom: Panca Dharma Satya & Tekad Pendirian */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
        {/* KARTU 1: PANCA DHARMA SATYA */}
        <div className="rounded-[2.5rem] bg-gradient-to-br from-[#092D32] via-[#00474c] to-[#021B25] text-white p-6 sm:p-8 md:p-10 shadow-xl border border-white/10 flex flex-col justify-between relative overflow-hidden group">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_70%_20%,rgba(255,221,0,0.15)_0%,transparent_70%)] pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFDD00] text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FFDD00] block">
                    IKRAR KEHORMATAN PRAJURIT
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                    Panca Dharma Satya
                  </h3>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-white/10 border border-white/20 text-slate-200 shrink-0">
                05 BUTIR
              </span>
            </div>

            <p className="text-xs text-slate-300 font-medium mb-5 leading-relaxed">
              Lima janji kesetiaan dan komitmen moral prajurit Resimen Mahasiswa Indonesia dalam membela kehormatan negara:
            </p>

            {/* Daftar Butir Panca Dharma Satya */}
            <ol className="space-y-3.5">
              {PANCA_DHARMA_SATYA.map((item, idx) => (
                <li
                  key={idx}
                  className="rounded-2xl p-3.5 sm:p-4 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 transition flex items-start gap-3.5"
                >
                  <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#FFDD00] to-amber-500 text-slate-950 font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-snug">
                    {item}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="pt-6 mt-6 border-t border-white/15 flex items-center justify-between text-[11px] font-mono text-slate-300">
            <span>RESIMEN MAHASISWA INDONESIA</span>
            <span className="text-[#FFDD00] font-bold">WIDYA CASTRENA DHARMA SIDDHA</span>
          </div>
        </div>

        {/* KARTU 2: TEKAD DAN PENDIRIAN */}
        <div className="rounded-[2.5rem] bg-gradient-to-br from-[#021B25] via-[#00383b] to-[#092D32] text-white p-6 sm:p-8 md:p-10 shadow-xl border border-white/10 flex flex-col justify-between relative overflow-hidden group">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_70%_20%,rgba(56,189,248,0.15)_0%,transparent_70%)] pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                  <Star size={26} className="fill-slate-950" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300 block">
                    KOMITMEN &amp; INTEGRITAS SATUAN
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                    Tekad dan Pendirian
                  </h3>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-white/10 border border-white/20 text-slate-200 shrink-0">
                05 BUTIR
              </span>
            </div>

            <p className="text-xs text-slate-300 font-medium mb-5 leading-relaxed">
              Ketetapan hati dan kepatuhan penuh seluruh personel dalam mempertahankan keutuhan bangsa dan tata tertib organisasi:
            </p>

            {/* Daftar Butir Tekad dan Pendirian */}
            <ol className="space-y-3.5">
              {TEKAD_DAN_PENDIRIAN.map((item, idx) => (
                <li
                  key={idx}
                  className="rounded-2xl p-3.5 sm:p-4 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 transition flex items-start gap-3.5"
                >
                  <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 text-slate-950 font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-snug">
                    {item}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="pt-6 mt-6 border-t border-white/15 flex items-center justify-between text-[11px] font-mono text-slate-300">
            <span>RESIMEN MAHASISWA INDONESIA</span>
            <span className="text-cyan-300 font-bold">SETIA PADA PANCASILA &amp; UUD 1945</span>
          </div>
        </div>
      </div>

      {/* CTA Buka KTA Digital Statis Resmi */}
      {onOpenKTA && (
        <div className="rounded-3xl p-6 bg-gradient-to-r from-blue-900/90 via-[#0050bc] to-[#003e99] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-blue-400/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <CreditCard size={24} />
            </div>
            <div>
              <h4 className="text-base font-black text-white">
                Kartu Tanda Pengenal Resmi (KTA &amp; ID Card Badge)
              </h4>
              <p className="text-xs text-blue-100">
                Desain resmi dengan latar pola geometris biru nasional, memuat Panca Dharma Satya dan Tekad &amp; Pendirian di sisi belakang.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playTactileClick('press');
              onOpenKTA();
            }}
            className="neu-btn-gold px-6 py-3 rounded-full text-xs font-black inline-flex items-center gap-2 cursor-pointer text-slate-950 whitespace-nowrap shadow-lg hover:scale-105 transition"
          >
            <CreditCard size={15} />
            <span>Buka &amp; Cetak KTA Resmi</span>
          </button>
        </div>
      )}
    </section>
  );
}

export default MenwaDoctrines;
