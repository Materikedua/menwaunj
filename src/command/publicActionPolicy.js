export const PUBLIC_ACTION_IDS = Object.freeze([
  'kc-registration',
  'youth-spark-registration',
  'kc-jersey-peserta',
  'kc-jersey-official',
]);

const allowedIds = new Set(PUBLIC_ACTION_IDS);
const existingKcUrl = 'https://bit.ly/PendaftaranKCVIII';

export function isPublishedActionUrl(value) {
  if (typeof value !== 'string' || value.length > 2048 || !/^https:\/\//i.test(value) || /[\s\\<>"'`\u0000-\u001f\u007f]/u.test(value)) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return false;
    if (value === existingKcUrl) return true;
    if (url.hostname === 'forms.gle') return /^\/[A-Za-z0-9_-]+\/?$/.test(url.pathname);
    return url.hostname === 'docs.google.com' && /^\/forms\/d\/(?:e\/)?[A-Za-z0-9_-]+\/viewform\/?$/.test(url.pathname);
  } catch {
    return false;
  }
}

/** Read only the public endpoint's published projection; malformed rows use source fallbacks. */
export function readPublishedActions(payload) {
  const actions = Object.create(null);
  if (!payload || !Array.isArray(payload.actions)) return actions;
  const seen = new Set();
  for (const row of payload.actions) {
    if (!row || !allowedIds.has(row.id)) continue;
    if (seen.has(row.id)) {
      delete actions[row.id];
      continue;
    }
    seen.add(row.id);
    if (!Number.isSafeInteger(row.revision) || row.revision < 1 || !isPublishedActionUrl(row.url)) continue;
    if (row.status !== undefined && row.status !== 'published') continue;
    actions[row.id] = row.url;
  }
  return actions;
}

/** A partial or malformed refresh must not restore an older source URL. */
export function mergePublishedActions(previous, payload) {
  const next = readPublishedActions(payload);
  if (Object.keys(next).length === 0) return previous;
  return Object.assign(Object.create(null), previous, next);
}
