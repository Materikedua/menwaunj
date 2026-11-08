import React, { useState, useEffect } from 'react';
import { playTactileClick } from '../lib/tactileAudio.js';

/**
 * TacticalWelcomeIntro — Clean Modern Splash Screen Animation
 * Based on Menwa UNJ Digital Platform preloader:
 * - Pop-in logo with drop-shadow
 * - Slide-reveal text: MENWA UNJ
 * - Animated progress track (1.2s)
 * - Zoom-out (scale 1.38) & fade-out transition at 1.45s
 */
export function TacticalWelcomeIntro({ onFinish, logoSrc = '/logo-menwa-unj.png' }) {
  const [fadingOut, setFadingOut] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Jalankan efek audio lembut saat logo pop-in
    try {
      playTactileClick('hover');
    } catch {}

    // Setelah progress bar selesai (1.45 detik), jalankan efek zoom-out & fade-out
    const t1 = setTimeout(() => {
      setFadingOut(true);
    }, 1450);

    // Sembunyikan elemen splash sepenuhnya setelah transisi selesai (2.2 detik)
    const t2 = setTimeout(() => {
      setDismissed(true);
      onFinish?.();
    }, 2200);

    // Support ESC key or click to skip immediately
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setFadingOut(true);
        setTimeout(() => {
          setDismissed(true);
          onFinish?.();
        }, 300);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onFinish]);

  const handleSkip = () => {
    try {
      playTactileClick('click');
    } catch {}
    setFadingOut(true);
    setTimeout(() => {
      setDismissed(true);
      onFinish?.();
    }, 300);
  };

  if (dismissed) return null;

  return (
    <aside
      id="splash-screen"
      role="status"
      aria-live="polite"
      aria-label="Memuat Menwa UNJ"
      onClick={handleSkip}
      className={fadingOut ? 'fade-out' : ''}
    >
      <style>{`
        #splash-screen {
          position: fixed;
          inset: 0;
          background: #ffffff;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          transition: background-color 0.6s ease, visibility 0.8s;
          cursor: pointer;
          user-select: none;
        }

        .splash-brand-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform 0.75s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.65s ease;
        }

        .splash-logo-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .splash-logo-img {
          width: 72px;
          height: 72px;
          object-fit: contain;
          filter: drop-shadow(0 4px 10px rgba(0, 128, 128, 0.18));
          opacity: 0;
          transform: scale(0.7);
          animation: popInLogo 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0.1s;
        }

        .splash-text-group {
          display: flex;
          flex-direction: column;
          line-height: 1.05;
          overflow: hidden;
        }

        .splash-title {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 2.4rem;
          font-weight: 800;
          color: #008080;
          letter-spacing: 1px;
          opacity: 0;
          transform: translateX(-20px);
          animation: slideRevealText 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards 0.3s;
        }

        .splash-subtitle {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 2.4rem;
          font-weight: 800;
          color: #008080;
          letter-spacing: 1px;
          opacity: 0;
          transform: translateX(-20px);
          animation: slideRevealText 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards 0.45s;
        }

        .progress-track {
          width: 170px;
          height: 4px;
          background: #e2e8f0;
          border-radius: 10px;
          margin-top: 22px;
          overflow: hidden;
          transition: opacity 0.3s ease;
        }

        .progress-fill {
          width: 0%;
          height: 100%;
          background: #008080;
          border-radius: 10px;
          animation: loadProgress 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards 0.2s;
        }

        #splash-screen.fade-out {
          background-color: rgba(255, 255, 255, 0);
          pointer-events: none;
        }

        #splash-screen.fade-out .progress-track {
          opacity: 0;
        }

        #splash-screen.fade-out .splash-brand-wrapper {
          transform: scale(1.38);
          opacity: 0;
        }

        @keyframes popInLogo {
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes slideRevealText {
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes loadProgress {
          0% { width: 0%; }
          65% { width: 80%; }
          100% { width: 100%; }
        }
      `}</style>

      <div className="splash-brand-wrapper">
        <div className="splash-logo-row">
          <img
            src={logoSrc}
            alt="Logo Menwa UNJ"
            className="splash-logo-img"
            onError={(e) => {
              e.currentTarget.src = '/logo-menwa-unj.png';
            }}
          />
          <div className="splash-text-group">
            <span className="splash-title">MENWA</span>
            <span className="splash-subtitle">UNJ</span>
          </div>
        </div>
        <div className="progress-track">
          <div className="progress-fill" />
        </div>
      </div>
    </aside>
  );
}

export default TacticalWelcomeIntro;
