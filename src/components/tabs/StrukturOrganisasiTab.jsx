import React, { useState, useMemo } from 'react';
import {
  Shield,
  Target,
  Briefcase,
  Wrench,
  Users,
  Crosshair,
  User,
  Search,
  ChevronsUpDown,
  X,
} from 'lucide-react';
import { Reveal, HeroStage } from '../MenwaUI.jsx';
import { PersonPhoto } from '../PersonPhoto.jsx';
import { HERO_PHOTO } from '../../data/siteData.js';

const UNSUR_PERENCANA = [
  {
    id: 'pam',
    title: 'Pengamanan',
    desc: 'Perencanaan intelijen, pengamanan mako, serta pengawasan operasional.',
    members: [
      { role: 'Kaur Pengamanan', name: 'Mario Bagaskara', detail: 'FEB / Manajemen (NBP: 21020741495)' },
      { role: 'Wa Kaur Pengamanan', name: 'Ghifari Ghufron', detail: 'FT / Rekayasa Keselamatan Kebakaran' },
      { role: 'Staf Pengamanan', name: 'Amiliudin Lesmana', detail: 'FEB / Administrasi Perkantoran Digital' },
    ],
  },
  {
    id: 'ops',
    title: 'Operasi',
    desc: 'Perencanaan & pelaksanaan giat keprajuritan, latihan komando, dan taktis.',
    members: [
      { role: 'Kaur Operasi', name: 'Ichsan Ridwan Hafizh', detail: 'FEB / Akuntansi Sektor Publik (NBP: 22020742263)' },
      { role: 'Wa Kaur Operasi', name: 'Alea Afiyanti', detail: 'FIKK / Pendidikan Jasmani' },
    ],
  },
  {
    id: 'pers',
    title: 'Personalia',
    desc: 'Pengelolaan keanggotaan, pendaftaran, administrasi, & pembinaan kader.',
    members: [
      { role: 'Kaur Personalia', name: 'Nadia Windra Zahara', detail: 'FISH / Pendidikan Geografi (NBP: 2240742269)' },
      { role: 'Wa Kaur Personalia', name: 'Anggie Palentrina', detail: 'FMIPA / Kimia' },
      { role: 'Staf Personalia', name: 'Gyan Muhammad Irhamir Subiyantoro', detail: 'FT / Rekayasa Keselamatan Kebakaran' },
    ],
  },
  {
    id: 'log',
    title: 'Logistik',
    desc: 'Pengelolaan perlengkapan lapangan, inventaris mako & sarana prasarana.',
    members: [
      { role: 'Kaur Logistik', name: 'Wanda Putri Amalia', detail: 'FPSI / Psikologi (NBP: 22030742265)' },
      { role: 'Wa Kaur Logistik', name: 'Muhammad Afdhal Abdillah', detail: 'FEB / Akuntansi' },
    ],
  },
  {
    id: 'ter',
    title: 'Teritorial',
    desc: 'Bakti masyarakat, kemanunggalan, serta hubungan antar-lembaga/masyarakat.',
    members: [
      { role: 'Kaur Teritorial', name: 'Aulia Asharany Jasmine', detail: 'FIP / Pendidikan Guru Sekolah Dasar' },
      { role: 'Wa Kaur Teritorial', name: 'Julia Rizqi Rahmawati', detail: 'FISH / Pendidikan IPS' },
      { role: 'Staf Teritorial', name: 'Laras Veby Damayanti', detail: 'FISH / PPKn' },
    ],
  },
  {
    id: 'putri',
    title: 'Keputrian',
    desc: 'Pembinaan & pemberdayaan anggota Srikandi Resimen Mahasiswa.',
    members: [
      { role: 'Kaur Keputrian', name: 'Siti Jaojah', detail: 'FIP / Manajemen Pendidikan' },
      { role: 'Wa Kaur Keputrian', name: 'Hilmi Suciasih', detail: 'FIP / Manajemen Pendidikan (NBP: 22030742270)' },
    ],
  },
];

const UNSUR_PELAYANAN = [
  {
    id: 'set',
    title: 'Kesekretariatan',
    desc: 'Pengelolaan kearsipan resmi, tata persuratan, & administrasi satuan.',
    members: [
      { role: 'Kepala Kesekretariatan', name: 'Belli Vio Saputra', detail: 'FEB / Akuntansi' },
      { role: 'Wa Kepala Kesekretariatan', name: 'Riza Rahmandawanti', detail: 'FBS / Pendidikan Bahasa Mandarin' },
    ],
  },
  {
    id: 'mako',
    title: 'Markas',
    desc: 'Pengelolaan kelancaran operasional, kebersihan, & tata tertib Mako Gedung G.',
    members: [
      { role: 'Kepala Markas', name: 'Alip Rohman Gunawan', detail: 'FT / Rekayasa Keselamatan Kebakaran' },
      { role: 'Wa Kepala Markas', name: 'Ronis Satia', detail: 'FIKK / Ilmu Keolahragaan' },
      { role: 'Staf Markas', name: 'Muhammad Tendison Iha Tabuni', detail: 'FIKK / Pendidikan Jasmani (NBP: 22010742261)' },
    ],
  },
  {
    id: 'prov',
    title: 'Provos',
    desc: 'Penegakan tata tertib, kedisiplinan prajurit, & pengawasan etika satuan.',
    members: [
      { role: 'Kepala Provost', name: 'Adam Ramadhana', detail: 'FBS / Pendidikan Bahasa Inggris' },
      { role: 'Wa Kepala Provost', name: 'Muhammad Alfonso Hermawan', detail: 'FISH / Ilmu Komunikasi' },
    ],
  },
];

const UNSUR_PELAKSANA = [
  {
    id: 'pokpas',
    title: 'Komandan Pokok Pasukan',
    desc: 'Pimpinan taktis pasukan latihan dan operasional lapangan.',
    members: [
      { role: 'Komandan Pokok Pasukan', name: 'Ghibthah Maulidya Azzahra', detail: 'FIP / Perpustakaan & Sains Informasi' },
      { role: 'Wakil Komandan Pokok Pasukan', name: 'Gisela Rori', detail: 'FPSI / Psikologi' },
    ],
  },
  {
    id: 'anggota',
    title: 'Jajaran Anggota Satuan',
    desc: 'Prajurit jajaran Satuan Menwa UNJ penegak Tri Dharma & bela negara.',
    members: [
      { role: 'Anggota Satuan', name: 'Romy Nirwana', detail: 'FISH / Pendidikan IPS' },
      { role: 'Anggota Satuan', name: 'Khansa Asma Itsar', detail: 'FIKK / Olahraga Rekreasi' },
      { role: 'Anggota Satuan', name: 'Ibnu Bintang Satriawan', detail: 'FMIPA / Kimia' },
      { role: 'Anggota Satuan', name: 'Revalia Febriani', detail: 'FPSI / Psikologi' },
      { role: 'Anggota Satuan', name: 'Tiara Cendy Julianti', detail: 'FPSI / Psikologi' },
      { role: 'Anggota Satuan', name: 'Lia Bertha Yadohamang', detail: 'FT / Pendidikan Teknik Informatika & Komputer' },
      { role: 'Anggota Satuan', name: 'Ahza Rusyaidi Zaman', detail: 'FIKK / Pendidikan Jasmani' },
      { role: 'Anggota Satuan', name: 'Santi Bapaimu', detail: 'FT / Pendidikan Teknik Informatika & Komputer' },
      { role: 'Anggota Satuan', name: 'Medis Siburian', detail: 'FIKK / Pendidikan Jasmani' },
      { role: 'Anggota Satuan', name: 'Hermina Simanagae', detail: 'FT / Pendidikan Teknik Informatika & Komputer' },
      { role: 'Anggota Satuan', name: 'Paskalina Sami', detail: 'FT / Pendidikan Teknik Informatika & Komputer' },
      { role: 'Anggota Satuan', name: 'Natalia Erma Ive', detail: 'FT / Pendidikan Teknik Informatika & Komputer' },
      { role: 'Anggota Satuan', name: 'Margaretha Fridolin', detail: 'FT / Pendidikan Teknik Informatika & Komputer' },
      { role: 'Anggota Satuan', name: 'Lisa Kriswinda Korwa', detail: 'FT / Pendidikan Teknik Informatika & Komputer' },
      { role: 'Anggota Satuan', name: 'Agustina Lusia', detail: 'FT / Pendidikan Teknik Informatika & Komputer' },
      { role: 'Anggota Satuan', name: 'Muhammad Zickry Iswandi', detail: 'FMIPA / Kimia' },
      { role: 'Anggota Satuan', name: 'Theofila Yakanaimu', detail: 'FT / Pendidikan Teknik Informatika & Komputer' },
      { role: 'Anggota Satuan', name: 'Serlina Sompika', detail: 'FIP / Pendidikan Guru Sekolah Dasar' },
    ],
  },
];

const ALL_SECTION_IDS = [
  ...UNSUR_PERENCANA.map((s) => s.id),
  ...UNSUR_PELAYANAN.map((s) => s.id),
  ...UNSUR_PELAKSANA.map((s) => s.id),
];

export function StrukturOrganisasiTab() {
  const [expandedIds, setExpandedIds] = useState(() => new Set(['pam']));
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSection = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedIds(new Set(ALL_SECTION_IDS));
  const collapseAll = () => setExpandedIds(new Set());

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filterSections = (sections) => {
    if (!normalizedQuery) return sections;
    return sections
      .map((sec) => {
        const secMatches = `${sec.title} ${sec.desc}`.toLowerCase().includes(normalizedQuery);
        const filteredMembers = sec.members.filter((m) =>
          `${m.name} ${m.role} ${m.detail}`.toLowerCase().includes(normalizedQuery)
        );
        if (secMatches) return sec;
        if (filteredMembers.length > 0) return { ...sec, members: filteredMembers };
        return null;
      })
      .filter(Boolean);
  };

  const filteredPerencana = useMemo(() => filterSections(UNSUR_PERENCANA), [normalizedQuery]);
  const filteredPelayanan = useMemo(() => filterSections(UNSUR_PELAYANAN), [normalizedQuery]);
  const filteredPelaksana = useMemo(() => filterSections(UNSUR_PELAKSANA), [normalizedQuery]);

  const isCardOpen = (id) => Boolean(normalizedQuery) || expandedIds.has(id);

  return (
    <div className="bg-slate-50 min-h-screen pb-32 font-sans flex-grow text-slate-800">
      <HeroStage className="min-h-[400px] py-20 md:py-28" photo={HERO_PHOTO} blur={2.5} dim={0.62}>
        <Reveal className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#FFDD00]/40 bg-black/40 px-5 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#FFDD00] backdrop-blur-md">
            <Shield size={15} /> Garis Komando
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white drop-shadow-2xl md:text-6xl">
            Garis Komando Satuan
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base sm:text-lg font-bold leading-relaxed text-[#FFDD00] drop-shadow-lg md:text-xl">
            Resimen Mahasiswa Satuan Universitas Negeri Jakarta (SKEP 2026)
          </p>
        </Reveal>
      </HeroStage>

      <div className="max-w-7xl mx-auto px-4 pt-10 md:pt-14 relative z-10 space-y-10">
        {/* Toolbar Pencarian Cepat Personel & Buka/Tutup Semua */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-md border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006569]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, jabatan, atau fakultas…"
              aria-label="Cari personel dalam struktur organisasi"
              className="w-full pl-11 pr-9 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006569]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Hapus pencarian"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={expandAll}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] text-xs font-black transition shadow-sm cursor-pointer"
            >
              <ChevronsUpDown size={14} />
              <span>Buka Semua</span>
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200 cursor-pointer"
            >
              <span>Ringkas</span>
            </button>
          </div>
        </div>

        {/* Unsur Pimpinan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Reveal delay={100} className="flex justify-center">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 text-center w-full shadow-lg relative group hover:border-[#006569] transition-all">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#006569] text-white text-xs font-black px-5 py-1.5 rounded-full shadow-md uppercase tracking-widest">
                Pimpinan Satuan
              </div>
              <div className="w-28 h-28 mx-auto rounded-full bg-[#00383b] text-[#FFDD00] flex items-center justify-center font-black text-2xl border-4 border-[#006569] shadow-md mb-4 group-hover:scale-105 transition-transform overflow-hidden">
                <PersonPhoto name="Eben Haezer Sitorus" fallback="EHS" />
              </div>
              <h3 className="font-black text-xl text-slate-900 leading-tight mb-1">Eben Haezer Sitorus</h3>
              <p className="text-[#006569] font-extrabold text-xs uppercase tracking-widest bg-teal-50 py-2 px-3 rounded-xl border border-teal-200">
                Komandan Satuan (FISH / Geografi)
              </p>
            </div>
          </Reveal>

          <Reveal delay={180} className="flex justify-center">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 text-center w-full shadow-lg relative group hover:border-[#006569] transition-all">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFDD00] text-slate-950 text-xs font-black px-5 py-1.5 rounded-full shadow-md uppercase tracking-widest">
                Wakil Pimpinan
              </div>
              <div className="w-28 h-28 mx-auto rounded-full bg-[#FFDD00] text-slate-950 flex items-center justify-center font-black text-2xl border-4 border-amber-300 shadow-md mb-4 group-hover:scale-105 transition-transform overflow-hidden">
                <PersonPhoto name="Raffli Syahputra" fallback="RS" />
              </div>
              <h3 className="font-black text-xl text-slate-900 leading-tight mb-1">Raffli Syahputra</h3>
              <p className="text-[#006569] font-extrabold text-xs uppercase tracking-widest bg-amber-50 py-2 px-3 rounded-xl border border-amber-200">
                Wakil Komandan Satuan (FEB / Manajemen)
              </p>
            </div>
          </Reveal>
        </div>

        {/* Unsur Perencana */}
        {filteredPerencana.length > 0 && (
          <Reveal delay={240} className="bg-white rounded-[2.5rem] shadow-xl p-6 sm:p-8 md:p-12 border border-slate-200">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 inline-flex items-center tracking-tight border-b-4 border-[#006569] pb-3">
                <Target className="mr-3 text-[#006569]" size={28} /> Unsur Perencana (Staf Komando)
              </h3>
              <p className="text-slate-600 mt-3 font-medium text-sm">
                Klik kartu staf untuk menampilkan atau menyembunyikan daftar pejabat staf perencana.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPerencana.map((staf) => {
                const isExpanded = isCardOpen(staf.id);
                return (
                  <div
                    key={staf.id}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onClick={() => toggleSection(staf.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleSection(staf.id);
                      }
                    }}
                    className={`rounded-2xl p-6 border transition-all duration-300 cursor-pointer ${
                      isExpanded
                        ? 'bg-teal-50/70 border-[#006569] shadow-md ring-2 ring-[#006569]/30'
                        : 'bg-slate-50 border-slate-200 hover:shadow-md hover:border-[#006569] hover:bg-teal-50/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#006569] flex items-center justify-center font-black border border-teal-200">
                        <Shield size={20} />
                      </div>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                          isExpanded ? 'bg-[#006569] text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isExpanded ? 'Tutup ▲' : `Buka (${staf.members.length}) ▼`}
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-base mb-1">{staf.title}</h4>
                    <p className="text-slate-600 text-xs font-medium leading-relaxed">{staf.desc}</p>
                    {isExpanded && (
                      <div className="mt-5 pt-4 border-t border-slate-200 space-y-3" onClick={(e) => e.stopPropagation()}>
                        <h5 className="text-[11px] font-black uppercase text-[#006569] tracking-wider flex items-center gap-1">
                          <User size={12} /> Pejabat Staf Terdaftar ({staf.members.length}):
                        </h5>
                        {staf.members.map((m, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 text-xs font-black border-[#006569]/40 bg-teal-50 text-[#006569]">
                              <PersonPhoto name={m.name} />
                            </span>
                            <div className="min-w-0">
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#006569] block">{m.role}</span>
                              <span className="font-bold text-slate-900 text-sm block">{m.name}</span>
                              <span className="text-[11px] text-slate-500 font-medium block">{m.detail}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Reveal>
        )}

        {/* Unsur Pelayanan */}
        {filteredPelayanan.length > 0 && (
          <Reveal delay={300} className="bg-white rounded-[2.5rem] shadow-xl p-6 sm:p-8 md:p-12 border border-slate-200">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 inline-flex items-center tracking-tight border-b-4 border-[#006569] pb-3">
                <Briefcase className="mr-3 text-[#006569]" size={28} /> Unsur Pelayanan
              </h3>
              <p className="text-slate-600 mt-3 font-medium text-sm">
                Pejabat staf kesekretariatan, markas komando, dan provos satuan.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {filteredPelayanan.map((staf) => {
                const isExpanded = isCardOpen(staf.id);
                return (
                  <div
                    key={staf.id}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onClick={() => toggleSection(staf.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleSection(staf.id);
                      }
                    }}
                    className={`rounded-2xl p-6 border transition-all duration-300 cursor-pointer ${
                      isExpanded
                        ? 'bg-amber-50/70 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                        : 'bg-slate-50 border-slate-200 hover:shadow-md hover:border-amber-400 hover:bg-amber-50/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black border border-amber-300">
                        <Wrench size={20} />
                      </div>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                          isExpanded ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isExpanded ? 'Tutup ▲' : `Buka (${staf.members.length}) ▼`}
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-base mb-1">{staf.title}</h4>
                    <p className="text-slate-600 text-xs font-medium leading-relaxed">{staf.desc}</p>
                    {isExpanded && (
                      <div className="mt-5 pt-4 border-t border-slate-200 space-y-3" onClick={(e) => e.stopPropagation()}>
                        <h5 className="text-[11px] font-black uppercase text-amber-700 tracking-wider flex items-center gap-1">
                          <User size={12} /> Pejabat Staf Terdaftar ({staf.members.length}):
                        </h5>
                        {staf.members.map((m, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 text-xs font-black border-amber-400/50 bg-amber-50 text-amber-800">
                              <PersonPhoto name={m.name} />
                            </span>
                            <div className="min-w-0">
                              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">{m.role}</span>
                              <span className="font-bold text-slate-900 text-sm block">{m.name}</span>
                              <span className="text-[11px] text-slate-500 font-medium block">{m.detail}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Reveal>
        )}

        {/* Unsur Pelaksana */}
        {filteredPelaksana.length > 0 && (
          <Reveal delay={360} className="bg-white rounded-[2.5rem] shadow-xl p-6 sm:p-8 md:p-12 border border-slate-200">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 inline-flex items-center tracking-tight border-b-4 border-[#006569] pb-3">
                <Users className="mr-3 text-[#006569]" size={28} /> Unsur Pelaksana
              </h3>
              <p className="text-slate-600 mt-3 font-medium text-sm">
                Jajaran Komandan Pokok Pasukan dan Anggota Satuan Menwa UNJ.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPelaksana.map((staf) => {
                const isExpanded = isCardOpen(staf.id);
                return (
                  <div
                    key={staf.id}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onClick={() => toggleSection(staf.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleSection(staf.id);
                      }
                    }}
                    className={`rounded-2xl p-6 border transition-all duration-300 cursor-pointer ${
                      isExpanded
                        ? 'bg-teal-50/80 border-[#006569] shadow-md ring-2 ring-[#006569]/30'
                        : 'bg-slate-50 border-slate-200 hover:shadow-md hover:border-[#006569]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#006569] flex items-center justify-center font-black border border-teal-200">
                        <Crosshair size={20} />
                      </div>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                          isExpanded ? 'bg-[#006569] text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isExpanded ? 'Tutup ▲' : `Buka (${staf.members.length}) ▼`}
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-base mb-1">{staf.title}</h4>
                    <p className="text-slate-600 text-xs font-medium leading-relaxed">{staf.desc}</p>
                    {isExpanded && (
                      <div
                        className="mt-5 pt-4 border-t border-slate-200 space-y-3 max-h-96 overflow-y-auto pr-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h5 className="text-[11px] font-black uppercase text-[#006569] tracking-wider flex items-center gap-1">
                          <User size={12} /> Daftar Prajurit &amp; Pejabat ({staf.members.length}):
                        </h5>
                        {staf.members.map((m, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 text-xs font-black border-[#006569]/40 bg-teal-50 text-[#006569]">
                              <PersonPhoto name={m.name} />
                            </span>
                            <div className="min-w-0">
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#006569] block">{m.role}</span>
                              <span className="font-bold text-slate-900 text-sm block">{m.name}</span>
                              <span className="text-[11px] text-slate-500 font-medium block">{m.detail}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
