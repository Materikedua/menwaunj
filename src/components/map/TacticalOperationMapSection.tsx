import React, { useState, useMemo, lazy, Suspense } from 'react';
import {
  Compass,
  MapPin,
  Layers,
  ArrowRight,
  Calendar,
  Users,
  Radio,
  Cpu,
} from 'lucide-react';
import { Link } from '../../lib/router.jsx';
import {
  TACTICAL_OPERATION_NODES,
  type TacticalOperationNode,
} from '../../data/siteConfig';
import { TacticalOperationMap2D } from './TacticalOperationMap2D';

const TacticalOperationCanvas3D = lazy(() => import('./TacticalOperationCanvas3D'));

/**
 * Deteksi kapabilitas perangkat & jaringan otomatis (Mobile-First Adaptive 3D Rule).
 * Kembali mulus ke Peta Vektor 2D Ringan pada ponsel spesifikasi rendah, penghemat data aktif, atau tanpa WebGL.
 */
function detectPreferLightweight2D(): { prefer2D: boolean; reason: string } {
  if (typeof window === 'undefined') {
    return { prefer2D: false, reason: '' };
  }

  try {
    const nav = window.navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean; effectiveType?: string };
    };

    if (nav.connection?.saveData) {
      return { prefer2D: true, reason: 'Mode Penghemat Data terdeteksi — Peta Vektor 2D Ringan diaktifkan otomatis.' };
    }
    if (nav.connection?.effectiveType && /^(slow-2g|2g)$/i.test(nav.connection.effectiveType)) {
      return { prefer2D: true, reason: 'Koneksi lambat terdeteksi — Peta Vektor 2D Ringan diaktifkan otomatis.' };
    }

    const isSmallViewport = window.innerWidth < 768;
    const lowCores = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 2;
    const lowRam = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2;

    if (isSmallViewport && (lowCores || lowRam)) {
      return { prefer2D: true, reason: 'Optimalisasi perangkat seluler — Peta Vektor 2D Ringan diaktifkan otomatis.' };
    }

    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    if (!gl) {
      return { prefer2D: true, reason: 'WebGL tidak tersedia — dialihkan ke Peta Vektor 2D Interaktif.' };
    }
  } catch {
    return { prefer2D: true, reason: 'Mode Kompatibilitas Peta Vektor 2D aktif.' };
  }

  return { prefer2D: false, reason: '' };
}

type FilterCategory = 'all' | 'mako_pusat' | 'pengabdian_bencana' | 'kontingen_nasional';

export const TacticalOperationMapSection: React.FC = () => {
  const capability = useMemo(() => detectPreferLightweight2D(), []);
  const [renderMode, setRenderMode] = useState<'3d' | '2d'>(() =>
    capability.prefer2D ? '2d' : '3d'
  );
  const [filterCat, setFilterCat] = useState<FilterCategory>('all');
  const [selectedNode, setSelectedNode] = useState<TacticalOperationNode>(
    TACTICAL_OPERATION_NODES[0]
  );

  const filteredNodes = useMemo(() => {
    if (filterCat === 'all') return TACTICAL_OPERATION_NODES;
    return TACTICAL_OPERATION_NODES.filter(
      (n) => n.category === filterCat || n.id === 'NODE-MAKO-UNJ'
    );
  }, [filterCat]);

  const activeNode = useMemo(() => {
    return (
      filteredNodes.find((n) => n.id === selectedNode.id) ||
      filteredNodes[0] ||
      TACTICAL_OPERATION_NODES[0]
    );
  }, [filteredNodes, selectedNode]);

  return (
    <section
      id="peta-operasi-taktis"
      aria-labelledby="peta-operasi-title"
      className="relative bg-[#031218] text-slate-100 py-16 lg:py-22 border-y border-[#006569]/40 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Seksi & Sakelar Adaptif 3D / 2D */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-lg bg-[#006569]/30 border border-[#006569]/60 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-widest text-[#FFDD00]">
              <Radio size={13} />
              <span>PUSAT KENDALI GEOSPASIAL • MAKO GEDUNG G R.107</span>
            </div>
            <h2
              id="peta-operasi-title"
              className="text-2xl sm:text-4xl font-black tracking-tight text-white"
            >
              Peta Taktis Operasi Lapangan &amp; Sebaran Kontingen Nasional
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Visualisasi jangkauan pengabdian teritorial (Cianjur, Karawang, dan Satgas Kemanusiaan UNJ Peduli Padang) serta jaringan asal kontingen peserta nasional Ksatria Cendekia VIII dan GERANAT VII yang berpusat di Rawamangun, Jakarta Timur.
            </p>
          </div>

          {/* Pemilih Mode 3D / 2D */}
          <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
            <div
              className="inline-flex rounded-xl bg-[#07212a] border border-[#006569]/60 p-1"
              role="group"
              aria-label="Pilih mode tampilan peta"
            >
              <button
                type="button"
                onClick={() => setRenderMode('3d')}
                className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                  renderMode === '3d'
                    ? 'bg-[#FFDD00] text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layers size={14} />
                <span>Peta 3D Taktis</span>
              </button>
              <button
                type="button"
                onClick={() => setRenderMode('2d')}
                className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                  renderMode === '2d'
                    ? 'bg-[#FFDD00] text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Compass size={14} />
                <span>Vektor 2D Ringan</span>
              </button>
            </div>
            {capability.reason && (
              <span className="text-[11px] font-mono text-amber-300 flex items-center gap-1">
                <Cpu size={12} /> {capability.reason}
              </span>
            )}
          </div>
        </div>

        {/* Baris Filter Kategori Operasi */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#061d26] border border-white/10 rounded-2xl p-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all' as const, label: 'Semua Titik Operasi (11)' },
              { id: 'pengabdian_bencana' as const, label: 'Bakti Sosial & Tanggap Bencana' },
              { id: 'kontingen_nasional' as const, label: 'Asal Kontingen KC VIII & GERANAT VII' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterCat(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterCat === tab.id
                    ? 'bg-[#006569] text-[#FFDD00] border border-[#FFDD00]/40'
                    : 'bg-[#0a2935] text-slate-300 hover:text-white border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-300 px-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFDD00]" /> Mako UNJ Rawamangun
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Pengabdian &amp; Bencana
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Kontingen Nasional
            </span>
          </div>
        </div>

        {/* Tata Letak Peta Utama + Panel Intelijen Titik Terpilih */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 flex flex-col gap-3">
            {renderMode === '3d' ? (
              <Suspense
                fallback={
                  <div className="w-full h-[420px] sm:h-[480px] rounded-2xl border border-[#006569]/50 bg-[#04141a] flex flex-col items-center justify-center gap-3 text-teal-200">
                    <div className="w-10 h-10 rounded-full border-4 border-[#006569]/30 border-t-[#FFDD00] animate-spin" />
                    <span className="text-xs font-mono uppercase tracking-wider">
                      Memuat Medan Taktis 3D Nusantara…
                    </span>
                  </div>
                }
              >
                <TacticalOperationCanvas3D
                  nodes={filteredNodes}
                  selectedId={activeNode.id}
                  onSelectNode={(node) => setSelectedNode(node)}
                  onWebglUnsupported={() => setRenderMode('2d')}
                />
              </Suspense>
            ) : (
              <TacticalOperationMap2D
                nodes={filteredNodes}
                selectedId={activeNode.id}
                onSelectNode={(node) => setSelectedNode(node)}
              />
            )}

            {/* Daftar Tombol Pilih Cepat Koordinat */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {filteredNodes.map((node) => {
                const isSelected = node.id === activeNode.id;
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedNode(node)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFDD00] text-slate-950 border-[#FFDD00]'
                        : 'bg-[#07212a] text-slate-300 border-white/10 hover:border-[#006569]'
                    }`}
                  >
                    {node.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kartu Rincian Titik Operasi / Kontingen */}
          <div className="lg:col-span-4 bg-[#072029] border border-[#006569]/60 rounded-2xl p-6 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#006569]/40 text-[#FFDD00] border border-[#006569]">
                  {activeNode.categoryLabel}
                </span>
                <span className="text-[11px] font-mono text-emerald-300 font-bold">
                  {activeNode.status}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white leading-snug">
                  {activeNode.name}
                </h3>
                <p className="mt-1 text-xs font-mono text-teal-300 flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#FFDD00] shrink-0" />
                  <span>
                    {activeNode.region} ({Math.abs(activeNode.lat).toFixed(2)}°
                    {activeNode.lat >= 0 ? 'LU' : 'LS'}, {activeNode.lng.toFixed(2)}°BT)
                  </span>
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeNode.summary}
              </p>

              <div className="grid grid-cols-1 gap-2.5 pt-1 text-xs">
                <div className="p-3 rounded-xl bg-[#04141a] border border-white/10 flex items-center gap-2.5">
                  <Calendar size={15} className="text-[#FFDD00] shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-bold">
                      Waktu &amp; Periode Operasi
                    </span>
                    <strong className="text-slate-100">{activeNode.date}</strong>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#04141a] border border-white/10 flex items-center gap-2.5">
                  <Users size={15} className="text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-bold">
                      Kekuatan Personel / Kontingen
                    </span>
                    <strong className="text-slate-100">{activeNode.personnelOrTeams}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <Link
                to={activeNode.route}
                className="w-full py-3 px-4 rounded-xl bg-[#FFDD00] hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
              >
                <span>Buka Halaman Terkait</span>
                <ArrowRight size={15} />
              </Link>
              <span className="text-[11px] text-slate-400 text-center">
                {renderMode === '3d'
                  ? 'Seret untuk memutar orbit 3D • Klik suar kota untuk melihat laporan'
                  : 'Klik titik kota pada peta vektor untuk berpindah laporan'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TacticalOperationMapSection;
