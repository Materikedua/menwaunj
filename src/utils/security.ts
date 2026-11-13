/**
 * Zero-Trust Frontend Security & Sanitization Engine
 * Komando Resimen Mahasiswa Jayakarta Satuan Universitas Negeri Jakarta (menwaunj.or.id)
 *
 * Standar Keamanan:
 * 1. Sanitasi ketat XSS pada semua input CMS (/mako-ops) & formulir publik.
 * 2. Perlindungan Prompt Injection & batas karakter (maks 500 karakter) untuk Asisten Komando.
 * 3. Rate-limiting Gerbang Komando (/mako-ops): kunci 5 menit setelah 5 percobaan gagal + kedaluwarsa sesi otomatis.
 * 4. Validasi Honeypot & Throttling pengiriman formulir / E-Voting.
 */

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const memoryFallbackMap = new Map<string, string>();

const defaultMemoryStorage: StorageLike = {
  getItem: (k) => (memoryFallbackMap.has(k) ? memoryFallbackMap.get(k)! : null),
  setItem: (k, v) => {
    memoryFallbackMap.set(k, String(v));
  },
  removeItem: (k) => {
    memoryFallbackMap.delete(k);
  },
};

export function resolveSafeStorage(customStorage?: StorageLike): StorageLike {
  if (customStorage) return customStorage;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // Fallback ke memori bila diblokir browser
  }
  return defaultMemoryStorage;
}

/**
 * Membersihkan teks input dari muatan berbahaya XSS (script, iframe, event handler inline, URI eksekusi)
 * tanpa merusak tanda baca Bahasa Indonesia yang sah ketika dirender oleh React text node.
 */
export function sanitizeInput(raw: unknown, maxLength = 2000): string {
  if (raw === null || raw === undefined) return '';
  let text = String(raw);

  // Hapus null bytes & karakter kontrol non-cetak (kecuali newline dan tab)
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');

  // Hapus blok tag eksekusi berbahaya beserta isinya
  text = text
    .replace(/<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/<\s*iframe\b[^>]*>[\s\S]*?<\s*\/\s*iframe\s*>/gi, '')
    .replace(/<\s*object\b[^>]*>[\s\S]*?<\s*\/\s*object\s*>/gi, '')
    .replace(/<\s*embed\b[^>]*>[\s\S]*?<\s*\/\s*embed\s*>/gi, '')
    .replace(/<\s*style\b[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi, '');

  // Hapus seluruh tag HTML yang tersisa (<...>)
  text = text.replace(/<\/?[a-zA-Z][^>]*>/g, '');

  // Hapus kurung sudut tersisa agar tidak membentuk elemen HTML
  text = text.replace(/[<>]/g, '');

  // Hapus atribut event handler inline & skema URI berbahaya
  text = text
    .replace(/\bon[a-z]+\s*=/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '');

  return text.trim().slice(0, Math.max(1, maxLength));
}

/**
 * Validasi & sanitasi URL gambar / tautan agar bebas dari skema javascript:, vbscript:, atau data:text/html.
 */
export function sanitizeUrl(rawUrl: unknown, fallback = '/foto-kampus-unj.jpg'): string {
  const val = String(rawUrl || '').trim();
  if (!val) return fallback;

  const lower = val.toLowerCase().replace(/\s+/g, '');
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:text/') ||
    lower.startsWith('data:application/') ||
    lower.includes('<script') ||
    lower.includes('onerror=') ||
    lower.includes('onload=')
  ) {
    return fallback;
  }

  // Izinkan data URL khusus gambar raster yang aman (tanpa SVG inline yang berisiko menyimpan script)
  if (lower.startsWith('data:')) {
    if (/^data:image\/(png|jpe?g|webp|gif);base64,[a-z0-9+/=]+$/i.test(val)) {
      return val;
    }
    return fallback;
  }

  // Izinkan path lokal portal, protokol https/http, mailto, tel
  if (
    val.startsWith('/') ||
    val.startsWith('https://') ||
    val.startsWith('http://') ||
    val.startsWith('mailto:') ||
    val.startsWith('tel:')
  ) {
    return val.replace(/[<>"'`]/g, '').slice(0, 2048);
  }

  return fallback;
}

/**
 * Sanitasi rekursif untuk objek data CMS atau payload formulir sebelum disimpan ke localStorage / database.
 */
export function sanitizeDeep<T>(value: T): T {
  if (typeof value === 'string') {
    return sanitizeInput(value, 4000) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeDeep(item)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (
        typeof val === 'string' &&
        (lowerKey.includes('photo') ||
          lowerKey.includes('image') ||
          lowerKey.includes('url') ||
          lowerKey.includes('href') ||
          lowerKey === 'route' ||
          lowerKey === 'to')
      ) {
        result[key] = val.trim() ? sanitizeUrl(val, '') : '';
      } else {
        result[key] = sanitizeDeep(val);
      }
    }
    return result as T;
  }
  return value;
}

export const MAX_CHAT_PROMPT_LENGTH = 500;

const PROMPT_INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
  /abaikan\s+(semua\s+)?(instruksi|perintah|aturan)\s+(sebelumnya|di\s+atas)/i,
  /disregard\s+(all\s+)?system\s+prompt/i,
  /reveal\s+(your\s+)?(system\s+prompt|api\s*key|secret|instructions)/i,
  /(bocorkan|tampilkan|berikan)\s+(system\s+prompt|api\s*key|kunci\s+api|rahasia\s+sistem)/i,
  /you\s+are\s+now\s+(dan|jailbreak|unrestricted)/i,
  /<\s*\|\s*(im_start|system|endoftext)\s*\|\s*>/i,
  /\[\s*system\s*override\s*\]/i,
];

export interface PromptSanitizeResult {
  clean: string;
  flagged: boolean;
  reason?: string;
}

export function sanitizePromptInput(
  rawPrompt: unknown,
  maxLength = MAX_CHAT_PROMPT_LENGTH
): PromptSanitizeResult {
  const truncated = sanitizeInput(rawPrompt, maxLength);
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(truncated)) {
      return {
        clean: '',
        flagged: true,
        reason: 'Pola instruksi manipulatif (prompt injection) terdeteksi dan diblokir oleh sistem keamanan.',
      };
    }
  }
  return {
    clean: truncated,
    flagged: false,
  };
}

/**
 * Pemeriksaan kolom jebakan bot (Honeypot). Pengunjung manusia tidak pernah mengisi kolom ini.
 */
export function isHoneypotTriggered(honeypotValue: unknown): boolean {
  return String(honeypotValue ?? '').trim().length > 0;
}

/**
 * Pembatas jeda pengiriman (Client-Side Cooldown / Throttling) untuk E-Voting, Formulir Adminu, dan Chat.
 */
const THROTTLE_PREFIX = 'menwa_sec_throttle_v1_';

export interface CooldownCheckResult {
  allowed: boolean;
  remainingSeconds: number;
}

export function evaluateActionCooldown(
  actionKey: string,
  cooldownMs: number,
  nowMs = Date.now(),
  customStorage?: StorageLike
): CooldownCheckResult {
  const store = resolveSafeStorage(customStorage);
  const raw = store.getItem(`${THROTTLE_PREFIX}${actionKey}`);
  const lastTs = raw ? Number(raw) : 0;
  if (!lastTs || Number.isNaN(lastTs)) {
    return { allowed: true, remainingSeconds: 0 };
  }
  const elapsed = nowMs - lastTs;
  if (elapsed >= cooldownMs) {
    return { allowed: true, remainingSeconds: 0 };
  }
  return {
    allowed: false,
    remainingSeconds: Math.max(1, Math.ceil((cooldownMs - elapsed) / 1000)),
  };
}

export function recordActionTimestamp(
  actionKey: string,
  nowMs = Date.now(),
  customStorage?: StorageLike
): void {
  const store = resolveSafeStorage(customStorage);
  store.setItem(`${THROTTLE_PREFIX}${actionKey}`, String(nowMs));
}

/* ============================================================================
 * PROTEKSI GERBANG OTORISASI KOMANDO (/mako-ops)
 * - Rate-limit: Maksimal 5 percobaan gagal -> Kunci 5 menit (300.000 ms)
 * - Kedaluwarsa Sesi Otomatis: 30 menit tidak aktif (1.800.000 ms)
 * ============================================================================ */

export const COMMAND_LOCKOUT_KEY = 'menwa_mako_auth_guard_v2';
export const COMMAND_SESSION_KEY = 'menwa_mako_active_session_v2';
export const MAX_COMMAND_ATTEMPTS = 5;
export const COMMAND_LOCKOUT_MS = 5 * 60 * 1000; // 5 Menit
export const COMMAND_SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 Menit

interface LockoutRecord {
  failedAttempts: number;
  lockUntil: number;
  lastAttemptAt: number;
}

export interface CommandLockoutStatus {
  isLocked: boolean;
  failedAttempts: number;
  remainingAttempts: number;
  remainingLockoutSeconds: number;
  lockUntil: number;
}

function readLockoutRecord(store: StorageLike): LockoutRecord {
  try {
    const raw = store.getItem(COMMAND_LOCKOUT_KEY);
    if (!raw) return { failedAttempts: 0, lockUntil: 0, lastAttemptAt: 0 };
    const parsed = JSON.parse(raw) as Partial<LockoutRecord>;
    return {
      failedAttempts: Math.max(0, Number(parsed.failedAttempts) || 0),
      lockUntil: Math.max(0, Number(parsed.lockUntil) || 0),
      lastAttemptAt: Math.max(0, Number(parsed.lastAttemptAt) || 0),
    };
  } catch {
    return { failedAttempts: 0, lockUntil: 0, lastAttemptAt: 0 };
  }
}

export function getCommandLockoutStatus(
  nowMs = Date.now(),
  customStorage?: StorageLike
): CommandLockoutStatus {
  const store = resolveSafeStorage(customStorage);
  const rec = readLockoutRecord(store);

  if (rec.lockUntil > 0 && nowMs < rec.lockUntil) {
    return {
      isLocked: true,
      failedAttempts: rec.failedAttempts,
      remainingAttempts: 0,
      remainingLockoutSeconds: Math.max(1, Math.ceil((rec.lockUntil - nowMs) / 1000)),
      lockUntil: rec.lockUntil,
    };
  }

  // Jika masa kunci telah berakhir, pulihkan kuota percobaan secara otomatis
  if (rec.lockUntil > 0 && nowMs >= rec.lockUntil) {
    store.removeItem(COMMAND_LOCKOUT_KEY);
    return {
      isLocked: false,
      failedAttempts: 0,
      remainingAttempts: MAX_COMMAND_ATTEMPTS,
      remainingLockoutSeconds: 0,
      lockUntil: 0,
    };
  }

  const remaining = Math.max(0, MAX_COMMAND_ATTEMPTS - rec.failedAttempts);
  return {
    isLocked: false,
    failedAttempts: rec.failedAttempts,
    remainingAttempts: remaining,
    remainingLockoutSeconds: 0,
    lockUntil: 0,
  };
}

export function recordCommandAuthFailure(
  nowMs = Date.now(),
  customStorage?: StorageLike
): CommandLockoutStatus {
  const store = resolveSafeStorage(customStorage);
  const current = getCommandLockoutStatus(nowMs, store);
  if (current.isLocked) {
    return current;
  }

  const nextFailed = current.failedAttempts + 1;
  const shouldLock = nextFailed >= MAX_COMMAND_ATTEMPTS;
  const lockUntil = shouldLock ? nowMs + COMMAND_LOCKOUT_MS : 0;

  const updated: LockoutRecord = {
    failedAttempts: nextFailed,
    lockUntil,
    lastAttemptAt: nowMs,
  };
  store.setItem(COMMAND_LOCKOUT_KEY, JSON.stringify(updated));

  return {
    isLocked: shouldLock,
    failedAttempts: nextFailed,
    remainingAttempts: Math.max(0, MAX_COMMAND_ATTEMPTS - nextFailed),
    remainingLockoutSeconds: shouldLock ? Math.ceil(COMMAND_LOCKOUT_MS / 1000) : 0,
    lockUntil,
  };
}

export function resetCommandLockout(customStorage?: StorageLike): void {
  const store = resolveSafeStorage(customStorage);
  store.removeItem(COMMAND_LOCKOUT_KEY);
}

export interface CommandAuthSession {
  email: string;
  officerName: string;
  role: string;
  issuedAt: number;
  lastActiveAt: number;
  expiresAt: number;
}

export function createCommandAuthSession(
  params: { email: string; officerName: string; role: string },
  nowMs = Date.now(),
  customStorage?: StorageLike
): CommandAuthSession {
  const store = resolveSafeStorage(customStorage);
  const session: CommandAuthSession = {
    email: sanitizeInput(params.email, 120),
    officerName: sanitizeInput(params.officerName, 120),
    role: sanitizeInput(params.role, 40) || 'PERWIRA_PIKET',
    issuedAt: nowMs,
    lastActiveAt: nowMs,
    expiresAt: nowMs + COMMAND_SESSION_TIMEOUT_MS,
  };
  store.setItem(COMMAND_SESSION_KEY, JSON.stringify(session));
  resetCommandLockout(store);
  return session;
}

export function getValidCommandAuthSession(
  nowMs = Date.now(),
  customStorage?: StorageLike
): CommandAuthSession | null {
  const store = resolveSafeStorage(customStorage);
  try {
    const raw = store.getItem(COMMAND_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CommandAuthSession>;
    if (!parsed.email || !parsed.expiresAt) {
      store.removeItem(COMMAND_SESSION_KEY);
      return null;
    }
    if (nowMs >= Number(parsed.expiresAt)) {
      store.removeItem(COMMAND_SESSION_KEY);
      return null;
    }
    return {
      email: String(parsed.email),
      officerName: String(parsed.officerName || 'Perwira Piket'),
      role: String(parsed.role || 'PERWIRA_PIKET'),
      issuedAt: Number(parsed.issuedAt || nowMs),
      lastActiveAt: Number(parsed.lastActiveAt || nowMs),
      expiresAt: Number(parsed.expiresAt),
    };
  } catch {
    store.removeItem(COMMAND_SESSION_KEY);
    return null;
  }
}

export function touchCommandAuthSession(
  nowMs = Date.now(),
  customStorage?: StorageLike
): CommandAuthSession | null {
  const store = resolveSafeStorage(customStorage);
  const current = getValidCommandAuthSession(nowMs, store);
  if (!current) return null;
  const refreshed: CommandAuthSession = {
    ...current,
    lastActiveAt: nowMs,
    expiresAt: nowMs + COMMAND_SESSION_TIMEOUT_MS,
  };
  store.setItem(COMMAND_SESSION_KEY, JSON.stringify(refreshed));
  return refreshed;
}

export function clearCommandAuthSession(customStorage?: StorageLike): void {
  const store = resolveSafeStorage(customStorage);
  store.removeItem(COMMAND_SESSION_KEY);
}

/**
 * Verifikasi Kode Otorisasi Piket Komando (tanpa memaparkan kredensial plaintext di UI publik)
 * menggunakan fungsi digest deterministik FNV-1a ganda untuk pemeriksaan cepat di klien.
 */
function tacticalDigest(value: string): string {
  const salted = `WCDS-JAYAKARTA-UNJ::${value.trim()}::G107`;
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < salted.length; i++) {
    const code = salted.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= code + i;
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  return `${(h1 >>> 0).toString(16).padStart(8, '0')}-${(h2 >>> 0).toString(16).padStart(8, '0')}`;
}

// Hash yang terotorisasi untuk kode akses taktis Staf Komando Gedung G R.107 ("MAKO-UNJ-2026" / "WCDS-G107-2026")
const AUTHORIZED_TACTICAL_DIGESTS = new Set<string>([
  tacticalDigest('MAKO-UNJ-2026'),
  tacticalDigest('WCDS-G107-2026'),
]);

export function verifyCommandAccessCode(rawCode: string): boolean {
  const cleaned = sanitizeInput(rawCode, 64).toUpperCase();
  if (!cleaned || cleaned.length < 8) return false;
  return AUTHORIZED_TACTICAL_DIGESTS.has(tacticalDigest(cleaned));
}
