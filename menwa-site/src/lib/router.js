// router.js — router mini tanpa dependency.
// MODE 'history' -> URL bersih:  situsmu.com/kc/   (butuh "SPA fallback" di hosting, lihat panduan)
// MODE 'hash'    -> URL:         situsmu.com/#/kc/ (jalan di hosting apa pun, tanpa pengaturan)
import React, { useState, useEffect } from 'react';

export const MODE = 'history'; // ganti ke 'hash' bila hosting tidak mendukung rewrite

/** '/KC/' -> '/kc',  '' -> '/' */
export const normalize = (p) => {
  let x = (p || '/').split('?')[0].split('#')[0].toLowerCase();
  if (!x.startsWith('/')) x = '/' + x;
  if (x.length > 1) x = x.replace(/\/+$/, '');
  return x || '/';
};

const read = () =>
  normalize(MODE === 'hash' ? window.location.hash.replace(/^#/, '') : window.location.pathname);

/** URL yang ditampilkan: '/kc' -> '/kc/' (atau '#/kc/' pada mode hash) */
export const hrefFor = (path) => {
  const p = normalize(path);
  const shown = p === '/' ? '/' : p + '/';
  return MODE === 'hash' ? '#' + shown : shown;
};

export function navigate(path, { scroll = true } = {}) {
  const target = hrefFor(path);
  if (MODE === 'hash') {
    window.location.hash = target.slice(1);
  } else if (window.location.pathname !== target) {
    window.history.pushState({}, '', target);
  }
  window.dispatchEvent(new Event('mu:navigate'));
  if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** Hook: mengembalikan path aktif ('/', '/kc', '/mako', ...) */
export function useRoute() {
  const [path, setPath] = useState(() => (typeof window === 'undefined' ? '/' : read()));
  useEffect(() => {
    const sync = () => setPath(read());
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    window.addEventListener('mu:navigate', sync);
    sync();
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('mu:navigate', sync);
    };
  }, []);
  return path;
}

/** Pengganti <a>: tetap bisa klik-kanan/buka tab baru, tapi klik biasa tanpa reload */
export const Link = ({ to, children, className = '', onClick, ...rest }) => {
  const external = /^https?:\/\//.test(to);
  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <a
      href={hrefFor(to)}
      className={className}
      onClick={(e) => {
        onClick && onClick(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
};

/** Peta tab lama -> URL baru */
export const TAB_PATHS = {
  beranda: '/',
  struktur: '/garis-komando',
  pendidikan: '/pendidikan',
  mako: '/mako',
  administrasi: '/administrasi',
};
export const PATH_TABS = Object.fromEntries(Object.entries(TAB_PATHS).map(([k, v]) => [v, k]));
