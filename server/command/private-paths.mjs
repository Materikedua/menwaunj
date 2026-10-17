import path from 'node:path';

const key = value => path.resolve(value).replaceAll('\\', '/').toLowerCase();
export function privateDatabaseFiles(databasePath) {
  return ['', '-wal', '-shm', '-journal'].map(suffix => `${path.resolve(databasePath)}${suffix}`);
}

export function isPrivateRequestUrl(url, root, databasePath) {
  let pathname;
  try { pathname = decodeURIComponent(new URL(url, 'http://localhost').pathname).replaceAll('\\', '/'); }
  catch { return true; }
  if (/(?:^|\/)(?:\.command-os|server)(?:\/|$)|\.(?:sqlite|db)(?:[.-]|$)/i.test(pathname)) return true;
  const requested = pathname.startsWith('/@fs/') ? path.resolve(pathname.slice(5)) : path.resolve(root, `.${pathname}`);
  return privateDatabaseFiles(databasePath).some(file => key(file) === key(requested));
}
