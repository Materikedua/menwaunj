import React, { useState, useEffect } from 'react';

export const MODE = 'history';

export const normalize = (p) => {
  let x = (p || '/').split('?')[0].split('#')[0].toLowerCase();
  if (!x.startsWith('/')) x = '/' + x;
  if (x.length > 1) x = x.replace(/\/+$/, '');
  return x || '/';
};

export const getSubdomain = () => {
  if (typeof window === 'undefined') return null;
  const hostname = window.location.hostname.toLowerCase();
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname) || hostname === 'localhost') return null;
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    const sub = parts[0];
    if (sub !== 'www' && sub !== 'menwaunj') {
      return sub;
    }
  }
  return null;
};

const read = () => {
  if (typeof window === 'undefined') return '/';
  const path = normalize(MODE === 'hash' ? window.location.hash.replace(/^#/, '') : window.location.pathname);
  if (path === '/') {
    const sub = getSubdomain();
    if (sub === 'official') return '/portal-peserta';
    if (sub) return `/official/${sub}`;
  }
  return path;
};

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
