import { KC_JERSEYS, PROGRAMS, YOUTH_SPARK_REGISTER_URL } from '../../src/data/siteData.js';

// These are repository baselines, not a claim that a human reviewed them today.
export const ACTION_BASELINES = Object.freeze([
  { id: 'kc-registration', label: 'Pendaftaran KC VIII', url: PROGRAMS.find(p => p.slug === 'kc').cta.url },
  { id: 'youth-spark-registration', label: 'Pendaftaran Youth Spark', url: YOUTH_SPARK_REGISTER_URL },
  { id: 'kc-jersey-peserta', label: 'Pendataan Jersey Peserta KC', url: KC_JERSEYS.find(j => j.id === 'peserta').form },
  { id: 'kc-jersey-official', label: 'Pre-order Jersey Official KC', url: KC_JERSEYS.find(j => j.id === 'official').form },
]);

export class CommandError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}

export function validateDestination(raw, { restoreBaseline = false } = {}) {
  if (typeof raw !== 'string' || raw.length > 2048 || !/^https:\/\//i.test(raw) || /[\s\\<>"'`\u0000-\u001f\u007f]/u.test(raw)) {
    throw new CommandError(422, 'INVALID_URL', 'Gunakan satu URL HTTPS formulir yang lengkap, tanpa spasi atau karakter terlarang.');
  }
  let parsed;
  try { parsed = new URL(raw); } catch { throw new CommandError(422, 'INVALID_URL', 'URL formulir tidak valid.'); }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.port) {
    throw new CommandError(422, 'INVALID_URL', 'URL harus memakai HTTPS tanpa akun, kata sandi, atau port khusus.');
  }
  const shortForm = parsed.hostname === 'forms.gle' && /^\/[A-Za-z0-9_-]+\/?$/.test(parsed.pathname);
  const longForm = parsed.hostname === 'docs.google.com' && /^\/forms\/d\/(?:e\/)?[A-Za-z0-9_-]+\/viewform\/?$/.test(parsed.pathname);
  const baseline = restoreBaseline && ACTION_BASELINES.some(action => action.url === raw);
  if (!shortForm && !longForm && !baseline) {
    throw new CommandError(422, 'URL_NOT_ALLOWED', 'Tujuan baru dibatasi ke forms.gle atau halaman viewform docs.google.com/forms. URL lokal, IP privat, dan penyedia lain tidak diizinkan.');
  }
  return [
    { name: 'https', passed: true, message: 'Format HTTPS tanpa kredensial atau port khusus.' },
    { name: 'provider', passed: true, message: baseline && !shortForm && !longForm ? 'Pemulihan ke URL baseline repositori.' : 'Format penyedia Google Forms sesuai kebijakan.' },
    { name: 'reachability', passed: null, message: 'Akses dan kepemilikan formulir belum diperiksa; validasi ini tidak membuka URL tujuan.' },
  ];
}

export function parseCommand(command) {
  if (typeof command !== 'string' || !command.trim() || command.length > 4000) {
    throw new CommandError(422, 'INVALID_COMMAND', 'Tulis perintah maksimal 4.000 karakter, misalnya: Ubah link pendaftaran KC menjadi https://forms.gle/IDform.');
  }
  const urls = command.match(/\b[a-z][a-z0-9+.-]*:\/\/[^\s<>"'`]+/gi) || [];
  if (urls.length !== 1) throw new CommandError(422, 'URL_REQUIRED', 'Sebutkan tepat satu URL tujuan HTTPS di dalam perintah.');
  const target = urls[0];
  const text = command.replace(target, '').toLowerCase().normalize('NFKC');
  if (!/\b(ubah|ganti|perbarui|set|update|change|replace|atur)\b/.test(text)) {
    throw new CommandError(422, 'INTENT_REQUIRED', 'Sebutkan tindakan yang jelas: ubah, ganti, perbarui, set, atau update tautan.');
  }
  const candidates = new Set();
  for (const action of ACTION_BASELINES) if (text.includes(action.id)) candidates.add(action.id);
  if (/jersey/.test(text) && /\b(peserta|atlet|athlete)\b/.test(text)) candidates.add('kc-jersey-peserta');
  if (/jersey/.test(text) && /\b(official|ofisial)\b/.test(text)) candidates.add('kc-jersey-official');
  const registration = /\b(pendaftaran|pendaftaran|daftar|registrasi|registration|register|sign.?up)\b/.test(text);
  if (registration && /\b(kc|ksatria cendekia)\b/.test(text) && !/jersey/.test(text)) candidates.add('kc-registration');
  if (registration && /youth[\s-]*spark/.test(text)) candidates.add('youth-spark-registration');
  if (candidates.size !== 1) {
    throw new CommandError(422, 'AMBIGUOUS_ACTION', 'Sebutkan satu aksi secara jelas: pendaftaran KC, pendaftaran Youth Spark, jersey peserta KC, atau jersey official KC.');
  }
  const actionId = [...candidates][0];
  const action = ACTION_BASELINES.find(item => item.id === actionId);
  return {
    actionId, afterUrl: target,
    validation: [{ name: 'intent', passed: true, message: `Satu aksi teridentifikasi: ${action.label}.` }, ...validateDestination(target)],
  };
}
