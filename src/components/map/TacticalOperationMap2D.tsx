import React from 'react';
import { MapPin, Compass } from 'lucide-react';
import {
  MAKO_CENTER_COORDS,
  type TacticalOperationNode,
} from '../../data/siteConfig';

interface TacticalOperationMap2DProps {
  nodes: TacticalOperationNode[];
  selectedId: string;
  onSelectNode: (node: TacticalOperationNode) => void;
}

/**
 * Proyeksi koordinat geografis Indonesia (Lintang 6°LU s.d. 11°LS, Bujur 94°BT s.d. 141°BT)
 * ke kanvas vektor SVG (1000 x 460).
 */
function projectGeoToSvg(lat: number, lng: number): { x: number; y: number } {
  const minLng = 94.0;
  const maxLng = 141.0;
  const maxLat = 6.5;
  const minLat = -11.5;

  const x = ((lng - minLng) / (maxLng - minLng)) * 920 + 40;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 380 + 40;
  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
  };
}

export const TacticalOperationMap2D: React.FC<TacticalOperationMap2DProps> = ({
  nodes,
  selectedId,
  onSelectNode,
}) => {
  const makoPt = projectGeoToSvg(MAKO_CENTER_COORDS.lat, MAKO_CENTER_COORDS.lng);

  return (
    <div className="relative w-full h-[420px] sm:h-[480px] bg-[#04141a] rounded-2xl border border-[#006569]/50 overflow-hidden select-none">
      {/* Grid Koordinat Taktis SVG */}
      <svg
        viewBox="0 0 1000 460"
        className="w-full h-full"
        role="img"
        aria-label="Peta Vektor Taktis Operasi & Sebaran Kontingen Menwa UNJ"
      >
        <defs>
          <radialGradient id="makoGlow2d" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFDD00" stopOpacity="0.32" />
            <stop offset="55%" stopColor="#006569" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#04141a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="islandFill2d" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0c353d" />
            <stop offset="100%" stopColor="#072229" />
          </linearGradient>
        </defs>

        {/* Garis Lintang & Bujur */}
        {[90, 165, 240, 315, 390].map((gy) => (
          <line
            key={`lat-${gy}`}
            x1={20}
            y1={gy}
            x2={980}
            y2={gy}
            stroke="#0d3b44"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
        ))}
        {[120, 260, 400, 540, 680, 820].map((gx) => (
          <line
            key={`lng-${gx}`}
            x1={gx}
            y1={20}
            x2={gx}
            y2={440}
            stroke="#0d3b44"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
        ))}

        {/* Garis Khatulistiwa (0° Lintang) */}
        <line
          x1={20}
          y1={projectGeoToSvg(0, 100).y}
          x2={980}
          y2={projectGeoToSvg(0, 100).y}
          stroke="#145863"
          strokeWidth="1.2"
          strokeDasharray="8 4"
        />
        <text
          x={32}
          y={projectGeoToSvg(0, 100).y - 6}
          fill="#4ca5b0"
          fontSize="10"
          fontFamily="monospace"
        >
          GARIS KHATULISTIWA 00°00&apos;
        </text>

        {/* Siluet Kepulauan Utama Nusantara (Gaya Peta Komando) */}
        <g fill="url(#islandFill2d)" stroke="#1d6f79" strokeWidth="1.5">
          {/* Sumatera */}
          <polygon points="62,74 112,96 176,162 238,242 222,272 172,248 118,186 58,110" />
          {/* Jawa */}
          <polygon points="246,282 325,288 416,304 446,316 408,325 314,314 242,298" />
          {/* Bali & Nusa Tenggara */}
          <polygon points="456,318 502,322 574,330 628,334 622,344 552,340 454,328" />
          {/* Kalimantan */}
          <polygon points="332,126 426,108 486,144 476,222 414,242 338,224 316,174" />
          {/* Sulawesi */}
          <polygon points="538,148 608,142 612,166 566,184 598,208 584,254 552,256 544,212 522,238 508,224 528,176" />
          {/* Maluku */}
          <polygon points="668,168 704,180 712,226 676,236 660,198" />
          {/* Papua */}
          <polygon points="758,186 838,176 936,216 944,284 872,292 818,248 754,220" />
        </g>

        {/* Halo Radar Mako Rawamangun */}
        <circle cx={makoPt.x} cy={makoPt.y} r="95" fill="url(#makoGlow2d)" />
        <circle
          cx={makoPt.x}
          cy={makoPt.y}
          r="46"
          fill="none"
          stroke="#FFDD00"
          strokeOpacity="0.28"
          strokeWidth="1"
          strokeDasharray="3 4"
        />

        {/* Garis Lengkung Operasi & Kontingen dari Mako UNJ Rawamangun */}
        {nodes
          .filter((n) => n.id !== 'NODE-MAKO-UNJ')
          .map((node) => {
            const pt = projectGeoToSvg(node.lat, node.lng);
            const midX = (makoPt.x + pt.x) / 2;
            const dist = Math.hypot(pt.x - makoPt.x, pt.y - makoPt.y);
            const midY = (makoPt.y + pt.y) / 2 - Math.min(72, dist * 0.24);
            const isSelected = node.id === selectedId;
            const strokeColor =
              node.category === 'pengabdian_bencana' ? '#34d399' : '#38bdf8';

            return (
              <path
                key={`arc-${node.id}`}
                d={`M ${makoPt.x} ${makoPt.y} Q ${midX} ${midY} ${pt.x} ${pt.y}`}
                fill="none"
                stroke={isSelected ? '#FFDD00' : strokeColor}
                strokeWidth={isSelected ? 2.6 : 1.5}
                strokeOpacity={isSelected ? 0.95 : 0.55}
                strokeDasharray={node.category === 'pengabdian_bencana' ? 'none' : '5 4'}
              />
            );
          })}

        {/* Titik Koordinat Interaktif */}
        {nodes.map((node) => {
          const pt = projectGeoToSvg(node.lat, node.lng);
          const isSelected = node.id === selectedId;
          const isMako = node.category === 'mako_pusat';
          const dotColor = isMako
            ? '#FFDD00'
            : node.category === 'pengabdian_bencana'
            ? '#10b981'
            : '#38bdf8';

          return (
            <g
              key={node.id}
              transform={`translate(${pt.x}, ${pt.y})`}
              onClick={() => onSelectNode(node)}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`Pilih lokasi ${node.name}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectNode(node);
                }
              }}
            >
              {isSelected && (
                <circle
                  r={isMako ? 18 : 15}
                  fill="none"
                  stroke="#FFDD00"
                  strokeWidth="2"
                />
              )}
              <circle
                r={isMako ? 9 : 6.5}
                fill={dotColor}
                stroke="#021318"
                strokeWidth="2"
              />
              <rect
                x={-44}
                y={isMako ? -29 : 11}
                width={88}
                height={17}
                rx={4}
                fill={isSelected ? '#FFDD00' : '#031c24'}
                stroke={isSelected ? '#FFDD00' : '#1b5e68'}
                strokeWidth="1"
              />
              <text
                x={0}
                y={isMako ? -17 : 23}
                textAnchor="middle"
                fill={isSelected ? '#04141a' : '#e2e8f0'}
                fontSize="9.5"
                fontWeight="800"
              >
                {node.shortLabel}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Indikator Sudut Kiri Atas */}
      <div className="absolute top-3 left-3 flex items-center gap-2 rounded-lg bg-[#031820]/95 border border-[#006569]/60 px-3 py-1.5 text-[11px] font-mono text-teal-200">
        <Compass size={14} className="text-[#FFDD00]" />
        <span>PROYEKSI VEKTOR 2D RINGAN • PUSAT KOMANDO RAWAMANGUN</span>
      </div>

      {/* Indikator Koordinat Kanan Bawah */}
      <div className="hidden sm:flex absolute bottom-3 right-3 items-center gap-1.5 rounded-lg bg-[#031820]/95 border border-white/10 px-3 py-1 text-[10px] font-mono text-slate-300">
        <MapPin size={12} className="text-[#FFDD00]" />
        <span>
          MAKO G.107: {Math.abs(MAKO_CENTER_COORDS.lat).toFixed(4)}°LS,{' '}
          {MAKO_CENTER_COORDS.lng.toFixed(4)}°BT
        </span>
      </div>
    </div>
  );
};

export default TacticalOperationMap2D;
