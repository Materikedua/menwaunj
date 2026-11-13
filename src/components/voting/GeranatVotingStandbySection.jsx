import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Unlock,
  Send,
  GraduationCap,
  Heart,
  Flame,
} from 'lucide-react';
import {
  sanitizeInput,
  isHoneypotTriggered,
  evaluateActionCooldown,
  recordActionTimestamp,
} from '../../utils/security';

export function GeranatVotingStandbySection({
  standbyTimeLeft,
  reminderSent,
  setReminderSent,
  reminderEmail,
  setReminderEmail,
  isSuperAdmin,
  handleToggleVotingStatus,
}) {
  const [honeypot, setHoneypot] = useState('');
  const [throttleMsg, setThrottleMsg] = useState('');

  return (
    <section
      aria-label="Mode Siaga Interaktif"
      className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-16 space-y-8 animate-fade-in"
    >
      {/* Card Pengumuman Mode Siaga dengan Countdown */}
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border-2 border-dashed border-[#006569]/30 shadow-xl relative overflow-hidden text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-[#006569] border border-amber-200 flex items-center justify-center mx-auto shadow-inner">
          <Clock size={32} className="text-[#006569]" />
        </div>

        <div className="max-w-xl mx-auto space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-amber-100 text-amber-900 border border-amber-300">
            Pintu Donasi Sedang Disiapkan
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Pintu Charity Vote Segera Dibuka
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Saat ini panitia dan pengurus Mako Menwa UNJ sedang melakukan finalisasi verifikasi data calon penerima beasiswa dan posko logistik kemanusiaan.
          </p>
        </div>

        {/* Countdown Box */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg mx-auto pt-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/60 border border-blue-200 rounded-2xl p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-4xl font-black text-blue-600 font-mono">
              {standbyTimeLeft.days}
            </div>
            <div className="text-[10px] sm:text-xs font-bold uppercase text-slate-600 mt-1">Hari</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100/60 border border-red-200 rounded-2xl p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-4xl font-black text-red-600 font-mono">
              {String(standbyTimeLeft.hours).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs font-bold uppercase text-slate-600 mt-1">Jam</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/60 border border-amber-200 rounded-2xl p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-4xl font-black text-amber-600 font-mono">
              {String(standbyTimeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs font-bold uppercase text-slate-600 mt-1">Menit</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/60 border border-emerald-200 rounded-2xl p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-4xl font-black text-emerald-600 font-mono">
              {String(standbyTimeLeft.seconds).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs font-bold uppercase text-slate-600 mt-1">Detik</div>
          </div>
        </div>

        {/* Form Pengingat Pembukaan */}
        <div className="max-w-md mx-auto pt-4 space-y-2">
          {reminderSent ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 size={16} />
              <span>Terima kasih! Notifikasi pembukaan akan dikirimkan ke email Anda.</span>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setThrottleMsg('');
                if (isHoneypotTriggered(honeypot)) return;
                const cd = evaluateActionCooldown('geranat_reminder_email', 8000);
                if (!cd.allowed) {
                  setThrottleMsg(`Mohon tunggu ${cd.remainingSeconds} detik sebelum mengirim ulang.`);
                  return;
                }
                const cleanEmail = sanitizeInput(reminderEmail, 120);
                if (cleanEmail) {
                  recordActionTimestamp('geranat_reminder_email');
                  setReminderEmail(cleanEmail);
                  setReminderSent(true);
                }
              }}
              className="flex gap-2 relative"
            >
              {/* Kolom jebakan bot (honeypot) tersembunyi */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="geranat-website-trap">Jangan diisi</label>
                <input
                  id="geranat-website-trap"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>
              <input
                type="email"
                required
                maxLength={120}
                aria-label="Alamat email pengingat pembukaan Charity Vote"
                placeholder="Masukkan email Anda untuk diingatkan..."
                value={reminderEmail}
                onChange={(e) => setReminderEmail(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#006569]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] text-xs font-black uppercase rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Send size={13} />
                <span>Ingatkan Saya</span>
              </button>
            </form>
          )}
          {throttleMsg && (
            <p className="text-[11px] font-bold text-amber-700">{throttleMsg}</p>
          )}
        </div>
      </div>

      {/* 3 PILAR MISI CHARITY VOTE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border-t-4 border-t-blue-500 border-x border-b border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <GraduationCap size={24} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
            Pendidikan Bangsa
          </span>
          <h3 className="text-lg font-black text-slate-900 mt-2 mb-2">
            Beasiswa Ksatria Menwa
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Beasiswa pembinaan dan keringanan biaya SPP/UKT untuk mahasiswa aktif dan kader Menwa UNJ berprestasi dari latar belakang prasejahtera.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border-t-4 border-t-rose-500 border-x border-b border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-rose-600 flex items-center justify-center mb-4">
            <Heart size={24} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-red-50 px-2.5 py-0.5 rounded-full">
            Tanggap Darurat
          </span>
          <h3 className="text-lg font-black text-slate-900 mt-2 mb-2">
            Bantuan Logistik Bencana
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Penyediaan paket sembako, selimut, obat-obatan, dan air bersih untuk disalurkan langsung oleh personel Menwa ke titik bencana alam.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border-t-4 border-t-emerald-500 border-x border-b border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <Flame size={24} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            Pelestarian Lingkungan
          </span>
          <h3 className="text-lg font-black text-slate-900 mt-2 mb-2">
            Aksi Cepat Karhutla
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dukungan peralatan respirator perlindungan kabut asap, pompa apung pemadam, dan suplai tim gabungan penanganan kebakaran hutan dan lahan.
          </p>
        </div>
      </div>

      {/* Banner Ajakan Buka untuk Super Admin / Perwira */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-[#006569] to-[#004d50] text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-black text-base text-[#FFDD00]">
              Siap Membuka Sesi Donasi untuk Publik?
            </h4>
            <p className="text-xs text-teal-100 mt-1">
              Klik tombol di samping untuk mengaktifkan pemungutan suara/donasi secara real-time.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleVotingStatus}
            className="px-6 py-3 rounded-2xl bg-[#FFDD00] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Unlock size={16} />
            <span>Buka Charity Vote Sekarang</span>
          </button>
        </div>
      )}
    </section>
  );
}
