import React, { useId } from 'react';

/**
 * BorderBeam - Efek sinar laser yang mengitari border kartu
 * 
 * @param {string} className - Kelas tambahan (opsional)
 * @param {number} size - Panjang berkas sinar (default: 180)
 * @param {number} duration - Durasi 1 putaran penuh dalam detik (default: 5)
 * @param {number} borderWidth - Tebal garis border (default: 2)
 * @param {string} colorFrom - Warna awal gradien (default: '#60a5fa')
 * @param {string} colorTo - Warna tengah/ekor gradien (default: '#2563eb')
 * @param {number} borderRadius - Radius sudut kartu dalam px (default: 24)
 */
export default function BorderBeam({
  className = '',
  size = 180,
  duration = 5,
  borderWidth = 2,
  colorFrom = '#FFDD00',
  colorTo = '#EAB308',
  borderRadius = 24,
}) {
  const uniqueId = useId().replace(/:/g, '');
  const gradientId = `beam-gradient-${uniqueId}`;
  const filterId = `beam-glow-${uniqueId}`;

  return (
    <div
      className={`pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden ${className}`}
      style={{
        padding: `${borderWidth}px`,
      }}
    >
      {/* SVG lintasan border */}
      <svg
        className="w-full h-full absolute inset-0 overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradien warna berkas sinar */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" stopOpacity="0" />
            <stop offset="60%" stopColor={colorTo} stopOpacity="0.85" />
            <stop offset="100%" stopColor={colorFrom} stopOpacity="1" />
          </linearGradient>

          {/* Efek Neon Glow */}
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Garis Dasar (Track pasif) */}
        <rect
          x={borderWidth / 2}
          y={borderWidth / 2}
          width={`calc(100% - ${borderWidth}px)`}
          height={`calc(100% - ${borderWidth}px)`}
          rx={borderRadius}
          ry={borderRadius}
          fill="none"
          stroke="rgba(226, 232, 240, 0.85)"
          strokeWidth={borderWidth}
        />

        {/* Berkas Sinar Beranimasi */}
        <rect
          x={borderWidth / 2}
          y={borderWidth / 2}
          width={`calc(100% - ${borderWidth}px)`}
          height={`calc(100% - ${borderWidth}px)`}
          rx={borderRadius}
          ry={borderRadius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={borderWidth + 1}
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="25 75"
          filter={`url(#${filterId})`}
          style={{
            animation: `border-beam-slide ${duration}s linear infinite`,
          }}
        />
      </svg>
    </div>
  );
}

export { BorderBeam };
