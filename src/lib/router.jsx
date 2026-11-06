import React, { useState, useEffect } from 'react';

export const MODE = 'history';

const OFFICIAL_BASE_DOMAINS = ['menwaunj.or.id', 'menwaunj.id'];
let forceMainHomeOnSubdomain = false;

export const normalize = (p) => {
  let x = (p || '/').split('?')[0].split('#')[0].toLowerCase();
  if (!x.startsWith('/')) x = '/' + x;
  if (x.length > 1) x = x.replace(/\/+$/, '');
  return x || '/';
};

/**
 * Hanya mengenali subdomain resmi di bawah *.menwaunj.or.id atau *.menwaunj.id.
 * Mencegah domain hosting seperti Cloud Run (*.run.app), Vercel (*.vercel.app),
 * atau Firebase (*.web.app / *.firebaseapp.com) dianggap sebagai subdomain sekolah
 * yang membajak Beranda utama (/) menjadi Portal Official GERANAT (/official/...).
 */
export const extractSchoolSubdomain = (hostnameInput = '') => {
  const hostname = String(hostnameInput || '').trim().toLowerCase();
  if (!hostname || /^\d+\.\d+\.\d+\.\d+$/.test(hostname) || hostname === 'localhost') {
    return null;
  }

  for (const baseDomain of OFFICIAL_BASE_DOMAINS) {
    if (hostname === baseDomain || hostname === `www.${baseDomain}`) {
      return null;
    }
    const suffix = `.${baseDomain}`;
    if (hostname.endsWith(suffix)) {
      const sub = hostname.slice(0, -suffix.length);
      if (sub && !sub.includes('.') && sub !== 'www' && sub !== 'menwaunj') {
        return sub;
      }
    }
  }

  return null;
};

export const getSubdomain = () => {
  if (typeof window === 'undefined') return null;
  return extractSchoolSubdomain(window.location.hostname);
};

export const resolveRoutePath = (rawPathname = '/', hostname = '') => {
  const path = normalize(rawPathname);
  if (path === '/' && !forceMainHomeOnSubdomain) {
    const sub = extractSchoolSubdomain(hostname);
    if (sub === 'official') return '/portal-peserta';
    if (sub) return `/official/${sub}`;
  }
  return path;
};

const read = () => {
  if (typeof window === 'undefined') return '/';
  const rawPath = MODE === 'hash' ? window.location.hash.replace(/^#/, '') : window.location.pathname;
  return resolveRoutePath(rawPath, window.location.hostname);
};

export const hrefFor = (path) => {
  const p = normalize(path);
  const shown = p === '/' ? '/' : p + '/';
  return MODE === 'hash' ? '#' + shown : shown;
};

export function navigate(path, { scroll = true } = {}) {
  const normalizedTarget = normalize(path);
  if (normalizedTarget === '/') {
    forceMainHomeOnSubdomain = true;
  } else {
    forceMainHomeOnSubdomain = false;
  }

  const target = hrefFor(path);
  if (MODE === 'hash') {
    window.location.hash = target.slice(1);
  } else if (window.location.pathname !== target) {
    window.history.pushState({}, '', target);
  }
  window.dispatchEvent(new Event('mu:navigate'));
  if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
}

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

export const TAB_PATHS = {
  beranda: '/',
  gallery: '/gallery',
  struktur: '/garis-komando',
  pendidikan: '/pendidikan',
  mako: '/mako',
  administrasi: '/administrasi',
  'mako-ops': '/mako-ops',
  games: '/games',
  geranat: '/geranat',
  geranat_voting: '/geranat/voting',
  charity_voting: '/charity/voting',
  portal_peserta: '/portal-peserta',
  privacy: '/privacy',
  terms: '/terms',
};
export const PATH_TABS = Object.fromEntries(Object.entries(TAB_PATHS).map(([k, v]) => [v, k]));
