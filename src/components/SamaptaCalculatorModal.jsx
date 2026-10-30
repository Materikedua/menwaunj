import React, { useState, useMemo } from 'react';
import {
  X,
  Activity,
  Award,
  Flame,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Printer,
  ChevronRight,
  Shield,
  Zap,
  Heart,
  TrendingUp,
  Info,
} from 'lucide-react';
import { playTactileClick } from '../lib/tactileAudio.js';

export function SamaptaCalculatorModal({ isOpen, onClose }) {
  const [gender, setGender] = useState('pria'); // 'pria' | 'wanita'
  const [ageGroup, setAgeGroup] = useState('17-25'); // '17-25' | '26-35'

  // Nilai Input Pengguna
  const [runDistance, setRunDistance] = useState(2400); // meter (lari 12 menit)
  const [pullUp, setPullUp] = useState(10); // repetisi
  const [pushUp, setPushUp] = useState(30); // repetisi 1 menit
  const [sitUp, setSitUp] = useState(32); // repetisi 1 menit
  const [shuttleRun, setShuttleRun] = useState(18.2); // detik (6x10m)

  if (!isOpen) return null;

  // Preset Cepat
  const applyPreset = (presetName) => {
    playTactileClick('pill');
    if (presetName === 'camen') {
      setGender('pria');
      setRunDistance(2200);
      setPullUp(7);
      setPushUp(25);
      setSitUp(26);
      setShuttleRun(19.2);
    } else if (presetName === 'baret_ungu') {
      setGender('pria');
      setRunDistance(2800);
      setPullUp(14);
      setPushUp(38);
      setSitUp(38);
      setShuttleRun(17.0);
    } else if (presetName === 'srikandi') {
      setGender('wanita');
      setRunDistance(2300);
      setPullUp(35); // Chinning
      setPushUp(28);
      setSitUp(30);
      setShuttleRun(18.8);
    } else if (presetName === 'atlet_kc') {
      setGender('pria');
      setRunDistance(3200);
      setPullUp(18);
      setPushUp(45);
      setSitUp(44);
      setShuttleRun(16.2);
    }
  };

  // Kalkulasi Skor Standar Jasmani Militer / Menwa
  const scores = useMemo(() => {
    // 1. Samapta A: Lari 12 Menit
    let scoreA = 0;
    if (gender === 'pria') {
      if (runDistance >= 3200) scoreA = 100;
      else if (runDistance <= 1400) scoreA = 20;
      else scoreA = Math.round(20 + ((runDistance - 1400) / (3200 - 1400)) * 80);
    } else {
      if (runDistance >= 2800) scoreA = 100;
      else if (runDistance <= 1200) scoreA = 20;
      else scoreA = Math.round(20 + ((runDistance - 1200) / (2800 - 1200)) * 80);
    }

    // 2. Samapta B1: Pull-up (Pria) / Chinning (Wanita)
    let scorePull = 0;
    if (gender === 'pria') {
      if (pullUp >= 18) scorePull = 100;
      else if (pullUp <= 1) scorePull = 10;
      else scorePull = Math.round(10 + (pullUp / 18) * 90);
    } else {
      if (pullUp >= 50) scorePull = 100;
      else if (pullUp <= 5) scorePull = 15;
      else scorePull = Math.round(15 + (pullUp / 50) * 85);
    }

    // 3. Samapta B2: Push-up (1 Menit)
    let scorePush = 0;
    const maxPush = gender === 'pria' ? 44 : 36;
    if (pushUp >= maxPush) scorePush = 100;
    else if (pushUp <= 5) scorePush = 15;
    else scorePush = Math.round(15 + (pushUp / maxPush) * 85);

    // 4. Samapta B3: Sit-up (1 Menit)
    let scoreSit = 0;
    const maxSit = gender === 'pria' ? 42 : 38;
    if (sitUp >= maxSit) scoreSit = 100;
    else if (sitUp <= 5) scoreSit = 15;
    else scoreSit = Math.round(15 + (sitUp / maxSit) * 85);

    // 5. Samapta B4: Shuttle Run 6x10 Meter (Makin cepat makin tinggi)
    let scoreShuttle = 0;
    const bestShuttle = gender === 'pria' ? 16.0 : 17.5;
    const slowShuttle = gender === 'pria' ? 22.0 : 24.0;
    if (shuttleRun <= bestShuttle) scoreShuttle = 100;
    else if (shuttleRun >= slowShuttle) scoreShuttle = 25;
    else {
      scoreShuttle = Math.round(
        100 - ((shuttleRun - bestShuttle) / (slowShuttle - bestShuttle)) * 75
      );
    }

    // Rata-rata Samapta B
    const scoreB = Math.round((scorePull + scorePush + scoreSit + scoreShuttle) / 4);

    // Nilai Akhir Gabungan
    const composite = Math.round((scoreA + scoreB) / 2);

    let predikat = 'Kurang (K)';
    let badgeColor = 'bg-rose-600 text-white border-rose-700';
    let summaryText = 'Diperlukan bimbingan jasmani harian dan penguatan endurance bertahap.';

    if (composite >= 81) {
      predikat = 'Baik Sekali (BS)';
      badgeColor = 'bg-amber-400 text-slate-950 border-amber-500';
      summaryText = 'Kebugaran fisik prima tingkat ksatria utama, memenuhi kualifikasi operasi dan komando khusus.';
    } else if (composite >= 65) {
      predikat = 'Baik (B)';
      badgeColor = 'bg-[#006569] text-[#FFDD00] border-[#004f52]';
      summaryText = 'Fisik memenuhi syarat tugas kesatuan, siap melaksanakan giat lapangan dan upacara kedinasan.';
    } else if (composite >= 51) {
      predikat = 'Cukup (C)';
      badgeColor = 'bg-slate-700 text-white border-slate-800';
      summaryText = 'Memenuhi batas minimal kelulusan, disarankan menambah porsi latihan calisthenics dan kardio.';
    }

    return {
      scoreA,
      scoreB,
      scorePull,
      scorePush,
      scoreSit,
      scoreShuttle,
      composite,
      predikat,
      badgeColor,
      summaryText,
    };
  }, [gender, runDistance, pullUp, pushUp, sitUp, shuttleRun]);

  const handlePrint = () => {
    playTactileClick('press');
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-3xl neu-card bg-[#F5F8F6] p-5 sm:p-8 text-[#092D32] shadow-2xl my-auto space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup Pinned */}
        <button
          type="button"
          onClick={() => {
            playTactileClick('release');
            onClose();
          }}
          aria-label="Tutup kalkulator"
          className="absolute top-5 right-5 p-2 rounded-full neu-btn text-slate-600 hover:text-rose-600 transition cursor-pointer shadow-sm"
        >
          <X size={18} />
        </button>

        {/* Header Modal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4 pr-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#006569] to-[#092D32] text-[#FFDD00] flex items-center justify-center font-black shadow-md shrink-0">
              <Activity size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-[#006569] border border-teal-200">
                  STANDAR KESEGARAN JASMANI
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-bold">
                  SK TNI &amp; MENWA JAYAKARTA
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#092D32] mt-0.5">
                Kalkulator &amp; Simulator Samapta
              </h2>
            </div>
          </div>

          {/* Quick Presets Bar */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Preset:
            </span>
            <button
              type="button"
              onClick={() => applyPreset('camen')}
              className="px-2.5 py-1 rounded-lg neu-btn text-[10px] font-bold text-slate-700 hover:text-[#006569]"
            >
              Camen LIII
            </button>
            <button
              type="button"
              onClick={() => applyPreset('baret_ungu')}
              className="px-2.5 py-1 rounded-lg neu-btn text-[10px] font-bold text-slate-700 hover:text-[#006569]"
            >
              Prajurit Ungu
            </button>
            <button
              type="button"
              onClick={() => applyPreset('srikandi')}
              className="px-2.5 py-1 rounded-lg neu-btn text-[10px] font-bold text-slate-700 hover:text-[#006569]"
            >
              Srikandi
            </button>
            <button
              type="button"
              onClick={() => applyPreset('atlet_kc')}
              className="px-2.5 py-1 rounded-lg neu-btn text-[10px] font-bold text-slate-700 hover:text-[#006569]"
            >
              Atlet KC
            </button>
          </div>
        </div>

        {/* Konten Utama Grid 2 Kolom: Kiri Input Data, Kanan Score Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Formulir Parameter Fisik (7 Kolom) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Filter Gender & Usia Pill Switcher */}
            <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-white border border-slate-200">
              <span className="text-xs font-black text-slate-700 pl-2">Kategori Prajurit:</span>
              <div className="neu-pill-bar">
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick('pill');
                    setGender('pria');
                  }}
                  className={gender === 'pria' ? 'neu-pill-tab-dark' : 'neu-pill-tab'}
                >
                  Pria
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick('pill');
                    setGender('wanita');
                  }}
                  className={gender === 'wanita' ? 'neu-pill-tab-dark' : 'neu-pill-tab'}
                >
                  Wanita (Srikandi)
                </button>
              </div>
            </div>

            {/* Parameter Samapta A */}
            <div className="rounded-2xl p-4 bg-white border border-slate-200 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#006569] text-[#FFDD00] flex items-center justify-center text-xs font-black">
                    A
                  </span>
                  <span className="text-xs font-black text-slate-800">
                    Lari 12 Menit (Endurance Aerobik)
                  </span>
                </div>
                <span className="font-mono text-xs font-black text-[#006569] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {runDistance} Meter ({scores.scoreA} Poin)
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="3600"
                step="50"
                value={runDistance}
                onChange={(e) => setRunDistance(Number(e.target.value))}
                className="w-full accent-[#006569] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1000m (Batas Awal)</span>
                <span>Standar Pria: 2400m+</span>
                <span>3600m (Maksimal)</span>
              </div>
            </div>

            {/* Parameter Samapta B (4 Sub-item) */}
            <div className="rounded-2xl p-4 bg-white border border-slate-200 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-black">
                    B
                  </span>
                  <span className="text-xs font-black text-slate-800">
                    Uji Ketahanan Otot (Calisthenics &amp; Agility)
                  </span>
                </div>
                <span className="font-mono text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Rata-rata: {scores.scoreB} Poin
                </span>
              </div>

              {/* B1: Pull Up / Chinning */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>{gender === 'pria' ? 'Pull-Up (Repetisi)' : 'Chinning (Repetisi)'}</span>
                  <span className="font-mono text-[#006569]">{pullUp}x ({scores.scorePull} Poin)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={gender === 'pria' ? 22 : 60}
                  step="1"
                  value={pullUp}
                  onChange={(e) => setPullUp(Number(e.target.value))}
                  className="w-full accent-[#006569] cursor-pointer"
                />
              </div>

              {/* B2: Push Up */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Push-Up 1 Menit</span>
                  <span className="font-mono text-[#006569]">{pushUp}x ({scores.scorePush} Poin)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="1"
                  value={pushUp}
                  onChange={(e) => setPushUp(Number(e.target.value))}
                  className="w-full accent-[#006569] cursor-pointer"
                />
              </div>

              {/* B3: Sit Up */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Sit-Up 1 Menit</span>
                  <span className="font-mono text-[#006569]">{sitUp}x ({scores.scoreSit} Poin)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="55"
                  step="1"
                  value={sitUp}
                  onChange={(e) => setSitUp(Number(e.target.value))}
                  className="w-full accent-[#006569] cursor-pointer"
                />
              </div>

              {/* B4: Shuttle Run */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Shuttle Run 6 x 10 Meter (Kelincahan)</span>
                  <span className="font-mono text-[#006569]">{shuttleRun}s ({scores.scoreShuttle} Poin)</span>
                </div>
                <input
                  type="range"
                  min="15.0"
                  max="25.0"
                  step="0.1"
                  value={shuttleRun}
                  onChange={(e) => setShuttleRun(Number(e.target.value))}
                  className="w-full accent-[#006569] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Rapor Nilai & Predikat Kebugaran (5 Kolom) */}
          <div className="lg:col-span-5 rounded-3xl neu-card p-6 bg-white border border-slate-200 space-y-5 text-center shadow-lg">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#006569]">
              HASIL EVALUASI KOMPOSIT
            </span>

            {/* Score Ring Display */}
            <div className="relative mx-auto w-36 h-36 rounded-full flex flex-col items-center justify-center border-8 border-[#006569]/15 bg-gradient-to-b from-[#006569]/5 to-transparent shadow-inner">
              <span className="text-4xl font-black text-[#006569] tracking-tight font-mono">
                {scores.composite}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Skala 0 - 100
              </span>
            </div>

            {/* Predikat Badge */}
            <div className="space-y-2">
              <div
                className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${scores.badgeColor}`}
              >
                PREDIKAT: {scores.predikat}
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed px-2">
                {scores.summaryText}
              </p>
            </div>

            {/* Rincian Komponen Nilai Mini Table */}
            <div className="rounded-2xl p-3 bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5 font-bold">
              <div className="flex justify-between text-slate-600">
                <span>Samapta A (Lari 12 Menit):</span>
                <span className="font-mono text-[#006569]">{scores.scoreA} Poin</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Samapta B (Ketangkasan Jasmani):</span>
                <span className="font-mono text-[#006569]">{scores.scoreB} Poin</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 flex justify-between text-slate-900 font-black">
                <span>Nilai Akhir Kelulusan:</span>
                <span className="font-mono text-emerald-600 text-sm">{scores.composite} Poin</span>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full neu-btn-strong-blue rounded-full py-2.5 px-4 text-xs font-black flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Printer size={14} />
                <span>Cetak Rapor Taktis</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playTactileClick('release');
                  applyPreset('camen');
                }}
                className="w-full neu-btn rounded-full py-2.5 px-4 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={13} />
                <span>Reset Awal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SamaptaCalculatorModal;
