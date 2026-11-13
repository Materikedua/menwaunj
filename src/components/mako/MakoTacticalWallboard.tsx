import React, { useState, useEffect } from 'react';
import {
  Radio,
  ShieldCheck,
  Clock,
  Calendar,
  FileText,
  Edit3,
  Maximize2,
  Users,
  MapPin,
} from 'lucide-react';
import {
  PIKET_MAKO_SCHEDULE,
  UNIT_METRICS,
  useAdminuTickets,
  type AdminuPamTicket,
} from '../../data/siteConfig';

interface MakoTacticalWallboardProps {
  onExitMonitorMode: () => void;
  officerName: string;
}

interface CountdownBreakdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function computeCountdown(targetIso: string, nowMs: number): CountdownBreakdown {
  const targetMs = new Date(targetIso).getTime();
  const diff = Math.max(0, targetMs - nowMs);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

const INDONESIAN_DAYS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

const STATUS_BADGE_MAP: Record<
  AdminuPamTicket['status'],
  { label: string; className: string }
> = {
  DITERIMA: {
    label: 'DITERIMA PIKET',
    className: 'bg-sky-950/90 border-sky-500/40 text-sky-300',
  },
  VERIFIKASI_ADMINU: {
    label: 'VERIFIKASI ADMINU',
    className: 'bg-amber-950/90 border-amber-500/40 text-amber-300',
  },
  AUDIENSI_POLA_PAM: {
    label: 'AUDIENSI POLA PAM',
    className: 'bg-violet-950/90 border-violet-500/40 text-violet-300',
  },
  PERSONEL_DITUGASKAN: {
    label: 'SPRIN DITERBITKAN',
    className: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300',
  },
};

export const MakoTacticalWallboard: React.FC<MakoTacticalWallboardProps> = ({
  onExitMonitorMode,
  officerName,
}) => {
  const tickets = useAdminuTickets();
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Konversi ke Waktu Indonesia Barat (WIB / UTC+7)
  const wibTimeStr = now.toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const wibDateStr = now.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const wibWeekdayIndex = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      weekday: 'short',
    })
      .format(now)
      .replace('Sun', '0')
      .replace('Mon', '1')
      .replace('Tue', '2')
      .replace('Wed', '3')
      .replace('Thu', '4')
      .replace('Fri', '5')
      .replace('Sat', '6')
  );
  const currentDayName = INDONESIAN_DAYS[Number.isNaN(wibWeekdayIndex) ? now.getDay() : wibWeekdayIndex];

  const kcCountdown = computeCountdown('2026-12-05T07:00:00+07:00', now.getTime());
  const geranatCountdown = computeCountdown('2026-12-19T07:00:00+07:00', now.getTime());

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div
      data-testid="mako-tactical-wallboard"
      className="fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-[#060c0f] text-slate-100 flex flex-col font-sans select-none"
    >
      {/* Header Telemetri Monitor Mako */}
      <header className="shrink-0 bg-[#0b1519] border-b border-[#006569]/70 px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src="/logo-menwa-unj.png"
            alt="Lambang Menwa Satuan UNJ"
            className="w-10 h-10 object-contain shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300">
                <Radio size={11} className="animate-pulse" />
                SIAGA OPERASIONAL GEDUNG G R.107
              </span>
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                Perwira Jaga: <strong className="text-slate-200">{officerName}</strong>
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-black tracking-wider uppercase text-white mt-0.5">
              Monitor Taktis Komando Resimen Mahasiswa Satuan UNJ
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <div className="text-xl font-mono font-black text-[#FFDD00] leading-none tracking-wider">
              {wibTimeStr} WIB
            </div>
            <div className="text-[11px] text-teal-300 font-medium mt-0.5">
              {wibDateStr}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleFullscreen}
              aria-label="Layar penuh monitor TV"
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
              title="Layar Penuh Monitor"
            >
              <Maximize2 size={15} />
            </button>
            <button
              type="button"
              onClick={onExitMonitorMode}
              className="px-3.5 py-2 rounded-xl bg-[#006569] hover:bg-[#005256] text-[#FFDD00] border border-[#FFDD00]/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <Edit3 size={14} />
              <span>Mode Editor Konten</span>
            </button>
          </div>
        </div>
      </header>

      {/* Grid Utama Zero-Scroll 3 Kolom Proporsional */}
      <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5 p-3.5 overflow-hidden">
        {/* KOLOM 1: JADWAL PIKET HARIAN MAKO */}
        <section className="lg:col-span-4 bg-[#0d171c] border border-white/10 rounded-2xl p-4 flex flex-col min-h-0 overflow-hidden">
          <div className="shrink-0 flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#FFDD00]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-white">
                Jadwal Piket Harian Mako G.107
              </h2>
            </div>
            <span className="text-[10px] font-mono text-teal-300">
              Hari Ini: {currentDayName}
            </span>
          </div>

          <div className="flex-1 min-h-0 grid grid-rows-7 gap-1.5 overflow-hidden">
            {PIKET_MAKO_SCHEDULE.map((shift) => {
              const isToday = shift.day.toLowerCase() === currentDayName.toLowerCase();
              return (
                <div
                  key={shift.day}
                  className={`px-3 py-1.5 rounded-xl border flex items-center justify-between gap-2 min-h-0 ${
                    isToday
                      ? 'bg-[#006569]/35 border-[#FFDD00]/70 shadow'
                      : 'bg-slate-950/70 border-white/5'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black uppercase ${
                          isToday ? 'text-[#FFDD00]' : 'text-white'
                        }`}
                      >
                        {shift.day}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {shift.shiftTime}
                      </span>
                      {isToday && (
                        <span className="px-1.5 py-0.2 rounded bg-[#FFDD00] text-slate-950 text-[9px] font-black uppercase">
                          AKTIF
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-200 font-semibold truncate">
                      {shift.commanderOnDuty}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      Staf Jaga: {shift.staffOnDuty}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-mono text-teal-300 bg-black/40 px-2 py-0.5 rounded border border-white/5 hidden sm:inline">
                    {shift.readinessStatus}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* KOLOM 2: HITUNG MUNDUR AGENDA NASIONAL & KEKUATAN SATUAN */}
        <section className="lg:col-span-4 flex flex-col gap-3.5 min-h-0 overflow-hidden">
          <div className="flex-1 bg-[#0d171c] border border-white/10 rounded-2xl p-4 flex flex-col justify-between min-h-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#FFDD00]" />
                <h2 className="text-xs font-black uppercase tracking-wider text-white">
                  Hitung Mundur Operasi & Kompetisi Nasional
                </h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">SINKRON</span>
            </div>

            <div className="space-y-3 my-auto py-1">
              {/* Countdown 1: KC VIII */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-[#006569]/60 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-white">
                    Ksatria Cendekia VIII Nasional
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold">
                    SK B-159 • Awal Des 2026
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { val: kcCountdown.days, unit: 'Hari' },
                    { val: kcCountdown.hours, unit: 'Jam' },
                    { val: kcCountdown.minutes, unit: 'Menit' },
                    { val: kcCountdown.seconds, unit: 'Detik' },
                  ].map((box) => (
                    <div
                      key={box.unit}
                      className="bg-[#0b1519] border border-white/10 rounded-lg py-1.5"
                    >
                      <div className="text-lg font-mono font-black text-[#FFDD00] leading-none">
                        {String(box.val).padStart(2, '0')}
                      </div>
                      <div className="text-[9px] uppercase text-slate-400 mt-0.5">
                        {box.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Countdown 2: GERANAT VII */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-white">
                    LFPB GERANAT VII Se-Indonesia
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold">
                    19–20 Desember 2026
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { val: geranatCountdown.days, unit: 'Hari' },
                    { val: geranatCountdown.hours, unit: 'Jam' },
                    { val: geranatCountdown.minutes, unit: 'Menit' },
                    { val: geranatCountdown.seconds, unit: 'Detik' },
                  ].map((box) => (
                    <div
                      key={box.unit}
                      className="bg-[#0b1519] border border-white/10 rounded-lg py-1.5"
                    >
                      <div className="text-lg font-mono font-black text-emerald-300 leading-none">
                        {String(box.val).padStart(2, '0')}
                      </div>
                      <div className="text-[9px] uppercase text-slate-400 mt-0.5">
                        {box.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestone 3: Youth Spark National Seminar */}
              <div className="p-3 rounded-xl bg-slate-950/90 border border-white/10 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-black text-white truncate">
                    Youth Spark National Seminar 2026
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    DISPORA DKI Jakarta × Menwa UNJ • Aula Latief Hendraningrat
                  </p>
                </div>
                <span className="shrink-0 px-2 py-1 rounded bg-teal-950 text-teal-300 border border-teal-500/40 text-[9px] font-mono font-bold uppercase">
                  24 Okt • Terlaksana
                </span>
              </div>
            </div>
          </div>

          {/* Ringkasan Kekuatan Satuan */}
          <div className="shrink-0 bg-[#0d171c] border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-teal-400" />
                Indikator Kesiapan & Pengabdian Satuan
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {UNIT_METRICS.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5"
                >
                  <div className="text-base font-mono font-black text-[#FFDD00] leading-tight">
                    {m.number.toLocaleString('id-ID')}
                    {m.suffix}
                  </div>
                  <div className="text-[10px] font-bold text-slate-300 truncate">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KOLOM 3: ANTREAN TIKET SMART ADMINU & PERMOHONAN PAM */}
        <section className="lg:col-span-4 bg-[#0d171c] border border-white/10 rounded-2xl p-4 flex flex-col min-h-0 overflow-hidden">
          <div className="shrink-0 flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-[#FFDD00]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-white">
                Antrean Tiket Smart Adminu & PAM
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#006569]/50 text-[#FFDD00] text-[10px] font-mono font-bold">
              {tickets.length} Tiket Aktif
            </span>
          </div>

          <div className="flex-1 min-h-0 space-y-2 overflow-hidden">
            {tickets.slice(0, 5).map((ticket) => {
              const badge = STATUS_BADGE_MAP[ticket.status];
              return (
                <div
                  key={ticket.ticketId}
                  className="p-3 rounded-xl bg-slate-950/85 border border-white/10 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black text-[#FFDD00]">
                      {ticket.ticketId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border text-[9px] font-mono font-bold ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white truncate">
                    {ticket.eventName}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate">{ticket.institution}</span>
                    <span className="font-mono text-teal-300 shrink-0">
                      {ticket.personnelRequested} Pers • {ticket.eventDate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="shrink-0 mt-2.5 pt-2.5 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-white/5">
              <div className="font-mono text-slate-400 uppercase">Kanal Pengajuan PAM</div>
              <div className="font-black text-[#FFDD00] mt-0.5">menwaunj.or.id/adminu</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-white/5">
              <div className="font-mono text-slate-400 uppercase">Validasi Sertifikat</div>
              <div className="font-black text-emerald-300 mt-0.5">menwaunj.or.id/verify</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Bilah Status Operasional */}
      <footer className="shrink-0 bg-[#0b1519] border-t border-white/10 px-5 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-2 text-teal-300">
          <MapPin size={12} />
          Markas Komando Menwa Satuan UNJ • Gedung G R.107 Kampus A Rawamangun
        </span>
        <span className="flex items-center gap-2">
          <Clock size={12} className="text-[#FFDD00]" />
          WIDYA CASTRENA DHARMA SIDDHA • Portal Resmi menwaunj.or.id
        </span>
      </footer>
    </div>
  );
};
