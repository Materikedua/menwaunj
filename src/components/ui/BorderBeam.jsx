import React, { useId } from 'react';

/**
 * BorderBeam - Komponen animasi sinar laser yang mengitari tepi border kartu secara presisi.
 * Dirancang agar mandiri (self-contained) dan kompatibel lintas proyek (termasuk Antigravity).
 *
 * @param {string} className - Kelas CSS tambahan pada wrapper
 * @param {number} size - Panjang berkas sinar dalam rasio keliling (10 - 45, atau piksel 60 - 360)
 * @param {number} duration - Durasi 1 putaran penuh dalam detik (default: 5)
 * @param {number} delay - Penundaan awal animasi dalam detik (default: 0)
 * @param {number} borderWidth - Ketebalan garis sinar dalam piksel (default: 2)
 * @param {string} colorFrom - Warna inti/ujung depan sinar (default: '#FFDD00' atau '#38BDF8')
 * @param {string} colorTo - Warna ekor gradien sinar (default: '#006569' atau '#2563EB')
 * @param {number} borderRadius - Radius lengkung sudut kartu dalam piksel (default: 24)
 * @param {boolean} reverse - Putar arah animasi berlawanan jarum jam (default: false)
 * @param {string} trackColor - Warna jalur statis tipis di bawah sinar (opsional)
 */
export function BorderBeam({
  className = '',
  size = 180,
  duration = 5,
  delay = 0,
  borderWidth = 2,
  colorFrom = '#FFDD00',
  colorTo = '#006569',
  borderRadius = 24,
  reverse = false,
  trackColor = 'rgba(226, 232, 240, 0.35)',
}) {
  const rawId = useId();
  const uniqueId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const gradientId = `border-beam-grad-${uniqueId}`;
  const coreGradientId = `border-beam-core-${uniqueId}`;
  const filterId = `border-beam-glow-${uniqueId}`;

  // Konversi nilai size (baik skala 10-50 maupun 60-360px) ke persentase keliling pathLength=100
  const beamLength =
    size <= 50
      ? Math.max(8, Math.min(45, size))
      : Math.max(12, Math.min(42, Math.round((size / 720) * 100)));
  const gapLength = 100 - beamLength;
  const coreLength = Math.max(4, Math.round(beamLength * 0.45));
  const coreGap = 100 - coreLength;

  const animationName = reverse ? 'border-beam-spin-reverse' : 'border-beam-spin';

  return (
    <div
      className={`pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-10 ${className}`}
      aria-hidden="true"
    >
      <style>{`
        @keyframes border-beam-spin {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes border-beam-spin-reverse {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 100; }
        }
      `}</style>

      <svg
        className="w-full h-full absolute inset-0 overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradien utama untuk tubuh dan ekor sinar */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorTo} stopOpacity="0" />
            <stop offset="35%" stopColor={colorTo} stopOpacity="0.65" />
            <stop offset="80%" stopColor={colorFrom} stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </linearGradient>

          {/* Gradien inti cahaya terang (laser head) */}
          <linearGradient id={coreGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colorFrom} stopOpacity="0" />
            <stop offset="70%" stopColor={colorFrom} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </linearGradient>

          {/* Filter pendaran neon (blooming glow) */}
          <filter id={filterId} x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="3.5" result="outerGlow" />
            <feMerge>
              <feMergeNode in="outerGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Jalur statis halus di sekeliling border */}
        <rect
          x={borderWidth / 2}
          y={borderWidth / 2}
          width={`calc(100% - ${borderWidth}px)`}
          height={`calc(100% - ${borderWidth}px)`}
          rx={borderRadius}
          ry={borderRadius}
          fill="none"
          stroke={trackColor}
          strokeWidth={Math.max(1, borderWidth - 0.5)}
        />

        {/* Lapisan 1: Berkas pendaran utama (Outer Beam Glow) */}
        <rect
          x={borderWidth / 2}
          y={borderWidth / 2}
          width={`calc(100% - ${borderWidth}px)`}
          height={`calc(100% - ${borderWidth}px)`}
          rx={borderRadius}
          ry={borderRadius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={borderWidth + 1.25}
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray={`${beamLength} ${gapLength}`}
          filter={`url(#${filterId})`}
          style={{
            animation: `${animationName} ${duration}s linear infinite`,
            animationDelay: `${delay}s`,
          }}
        />

        {/* Lapisan 2: Inti laser tajam berintensitas tinggi (High-Energy Core) */}
        <rect
          x={borderWidth / 2}
          y={borderWidth / 2}
          width={`calc(100% - ${borderWidth}px)`}
          height={`calc(100% - ${borderWidth}px)`}
          rx={borderRadius}
          ry={borderRadius}
          fill="none"
          stroke={`url(#${coreGradientId})`}
          strokeWidth={Math.max(1.5, borderWidth)}
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray={`${coreLength} ${coreGap}`}
          style={{
            animation: `${animationName} ${duration}s linear infinite`,
            animationDelay: `${delay}s`,
          }}
        />
      </svg>
    </div>
  );
}

export default BorderBeam;