import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { CommandError } from './actions.mjs';

const scrypt = promisify(scryptCallback);
export const ROLES = Object.freeze(['editor', 'approver', 'admin']);
export const digest = value => createHash('sha256').update(value).digest('hex');
export const randomToken = () => randomBytes(32).toString('base64url');

export function normalizeUsername(value) {
  const username = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (!/^[a-z0-9][a-z0-9._-]{2,63}$/.test(username)) throw new CommandError(422, 'INVALID_USERNAME', 'Username harus 3–64 karakter huruf, angka, titik, garis bawah, atau tanda hubung.');
  return username;
}

export function validatePassword(value) {
  if (typeof value !== 'string' || value.length < 12 || value.length > 256 || value.trim().length < 12) {
    throw new CommandError(422, 'INVALID_PASSWORD', 'Kata sandi harus 12–256 karakter dan tidak hanya berupa spasi.');
  }
}

export async function hashPassword(password) {
  validatePassword(password);
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return { salt, hash: hash.toString('hex') };
}

export async function verifyPassword(password, user) {
  if (typeof password !== 'string' || password.length > 256) return false;
  const salt = user?.password_salt || 'missing-account-uniform-salt';
  const hash = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  const expected = user ? Buffer.from(user.password_hash, 'hex') : Buffer.alloc(64);
  return timingSafeEqual(hash, expected) && Boolean(user);
}

export function sameToken(actual, expected) {
  if (typeof actual !== 'string' || typeof expected !== 'string') return false;
  const first = Buffer.from(actual); const second = Buffer.from(expected);
  return first.length === second.length && timingSafeEqual(first, second);
}

export function requireSameOrigin(req) {
  const raw = req.headers.origin;
  let origin;
  try { origin = new URL(raw); } catch { throw new CommandError(403, 'ORIGIN_REQUIRED', 'Permintaan harus berasal dari halaman Command OS pada host yang sama.'); }
  const protocol = req.socket?.encrypted ? 'https:' : 'http:';
  if (origin.origin !== raw || origin.protocol !== protocol || origin.host !== req.headers.host) {
    throw new CommandError(403, 'ORIGIN_MISMATCH', 'Origin permintaan harus sama persis dengan host dan protokol Command OS.');
  }
}

export async function readJson(req) {
  if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) {
    throw new CommandError(415, 'JSON_REQUIRED', 'Kirim permintaan sebagai application/json.');
  }
  const chunks = []; let length = 0;
  for await (const chunk of req) {
    length += chunk.length;
    if (length > 16 * 1024) throw new CommandError(413, 'BODY_TOO_LARGE', 'Ukuran permintaan melebihi 16 KiB.');
    chunks.push(chunk);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('object required');
    return value;
  } catch { throw new CommandError(400, 'INVALID_JSON', 'Isi permintaan harus berupa objek JSON yang valid.'); }
}
