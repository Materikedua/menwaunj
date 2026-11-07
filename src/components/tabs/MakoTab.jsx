import React from 'react';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import { Link } from '../../lib/router.jsx';
import { Reveal } from '../MenwaUI.jsx';
import { TacticalMakoNavigator } from '../TacticalMakoNavigator.jsx';
import { DynamicCanvasZone } from '../DynamicCanvasZone.jsx';

export const TabHero = ({ eyebrow, title, subtitle, icon }) => (
  <div className="bg-gradient-to-b from-slate-950 via-[#00383b] to-slate-900 text-white pt-24 pb-16 px-4 sm:px-6 relative overflow-hidden border-b border-white/10">
    <div className="max-w-7xl mx-auto relative z-10 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#FFDD00] text-xs font-black uppercase tracking-wider mb-4 backdrop-blur-md">
        {icon}
        <span>{eyebrow}</span>
      </div>
      <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-3">
        {title}
      </h1>
      <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-medium">
        {subtitle}
      </p>
    </div>
  </div>
);

export const MakoTab = () => {
  return (
    <div className="bg-[#051419] min-h-screen pb-32 font-sans flex-grow text-slate-100">
      <TabHero
        title="Markas Komando (MAKO)"
        subtitle="Pusat Komando & Pelayanan Administrasi Satuan UNJ"
        icon={<MapPin size={15} />}
        eyebrow="Markas Komando"
      />
      <div className="max-w-7xl mx-auto px-4 pt-12 md:pt-16 relative z-10 space-y-12">
        <Reveal delay={200} className="bg-[#071c22]/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-white/12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#006569]/30 border border-[#006569]/60 text-[#FFDD00] rounded-full font-black text-xs uppercase tracking-widest mb-4">
                <MapPin size={16} /> Lokasi Markas Komando
              </div>
              <h3 className="text-3xl font-black text-white mb-4">Mako Resimen Mahasiswa UNJ</h3>
              <p className="text-slate-300 font-medium leading-relaxed mb-6">
                Jl. R.Mangun Muka Kampus A UNJ Gedung G R.107, RT.11/RW.14, Rawamangun, Kec. Pulo Gadung, Kota Jakarta
                Timur, Daerah Khusus Ibukota Jakarta 13220
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-200 font-bold text-sm bg-[#09252e] p-4 rounded-2xl border border-white/10">
                  <Phone className="text-[#00A8AF] shrink-0" size={20} />
                  <span>
                    WhatsApp (Wakil Komandan):{' '}
                    <a
                      href="https://wa.me/6281525823503"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FFDD00] hover:underline font-black"
                    >
                      +62 815-2582-3503
                    </a>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-200 font-bold text-sm bg-[#09252e] p-4 rounded-2xl border border-white/10">
                  <Mail className="text-[#00A8AF] shrink-0" size={20} />
                  <span>
                    Email Satuan:{' '}
                    <a href="mailto:unjmenwa@gmail.com" className="text-[#FFDD00] hover:underline font-black">
                      unjmenwa@gmail.com
                    </a>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-200 font-bold text-sm bg-[#09252e] p-4 rounded-2xl border border-white/10">
                  <Clock className="text-[#00A8AF] shrink-0" size={20} />
                  <span>Jam Operasional Piket: Senin - Minggu (08.00 - 22.00 WIB)</span>
                </div>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 h-80 bg-slate-900 relative">
              <iframe
                title="Google Maps Mako Menwa UNJ"
                src="https://maps.google.com/maps?q=Mako%20Menwa%20UNJ%20Universitas%20Negeri%20Jakarta&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                allowFullScreen=""
                loading="lazy"
              />
            </div>
          </div>
        </Reveal>
        <Reveal className="mt-12">
          <div className="mako-admin-entry flex flex-col items-start justify-between gap-5 rounded-[2rem] border border-white/12 bg-[#071c22]/90 backdrop-blur-xl p-6 shadow-2xl sm:flex-row sm:items-center md:p-8">
            <div className="max-w-xl">
              <span className="text-xs font-black uppercase tracking-[.18em] text-[#00A8AF]">Layanan Satuan</span>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-white">Butuh pengurusan administrasi?</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Pengajuan surat, permohonan personel, peminjaman sarpras, dan kemitraan satuan.
              </p>
            </div>
            <Link to="/administrasi" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#006569] hover:bg-[#00474c] px-6 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#006569]">
              Buka Administrasi <ArrowRight size={18} />
            </Link>
          </div>
        </Reveal>
        <Reveal>
          <TacticalMakoNavigator />
        </Reveal>
        <DynamicCanvasZone containerId="mako_slot" title="Layanan & Kontak Tambahan" />
      </div>
    </div>
  );
};

export default MakoTab;

