/**
 * SecuritySanitizer — Modul Keamanan Siber, Sanitasi Input & Bukti Forensik Kriptografis
 * Menwa UNJ Cyber Security & Incident Response Engine
 * Standar: OWASP Top 10, ISO/IEC 27037 (Digital Evidence), & UU ITE Compliance
 */

// Regex pola serangan XSS, script injection, dan skema protokol berbahaya
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi,
  /javascript\s*:/gi,
  /data:\s*text\/html/gi,
  /vbscript\s*:/gi,
  /on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, // onload=, onerror=, onclick=, etc.
];

// Kata kunci ofensif / sabotase peretasan defacement
const DEFACEMENT_INDICATORS = [
  'hacked by',
  'pwned by',
  'defaced by',
  'indonesian hacker',
  'cyber crime',
  'security breach',
  'drop database',
  'bypassed',
];

/**
 * Membersihkan string teks dari tag HTML injeksi dan karakter eksploitasi
 */
export function sanitizeText(input, maxLength = 2000) {
  if (typeof input !== 'string') return '';
  let clean = input;

  // Hapus pola-pola berbahaya
  DANGEROUS_PATTERNS.forEach((pattern) => {
    clean = clean.replace(pattern, '');
  });

  // Escape sisa tag HTML terbuka/tertutup
  clean = clean
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  // Normalisasi spasi dan batasi panjang
  clean = clean.trim().slice(0, maxLength);
  return clean;
}

/**
 * Validasi URL agar hanya menggunakan protokol resmi yang aman
 */
export function sanitizeUrl(url) {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Protokol yang sah untuk portal
  const ALLOWED_PROTOCOLS = ['https:', 'http:', 'mailto:', 'tel:'];
  if (trimmed.startsWith('/') || trimmed.startsWith('data:image/') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      return trimmed;
    }
    return '';
  } catch {
    // Jika bukan URL valid, periksa apakah path relatif
    if (/^[a-zA-Z0-9_\-./]+$/.test(trimmed)) {
      return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    }
    return '';
  }
}

/**
 * Deteksi apakah teks berpotensi sebagai payload peretasan atau defacement
 */
export function detectMaliciousPayload(text) {
  if (typeof text !== 'string') return false;
  const lower = text.toLowerCase();

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  for (const keyword of DEFACEMENT_INDICATORS) {
    if (lower.includes(keyword)) return true;
  }
  return false;
}

/**
 * Menghitung sidik jari kriptografis SHA-256 untuk bukti integritas forensik digital
 */
export async function computeSHA256(content) {
  try {
    const str = typeof content === 'string' ? content : JSON.stringify(content);
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    // Fallback hashing matematis jika Web Crypto API tidak tersedia
    let hash = 0;
    const str = typeof content === 'string' ? content : JSON.stringify(content);
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return `FALLBACK-${Math.abs(hash).toString(16).toUpperCase()}`;
  }
}

/**
 * Membuat bundel forensik digital berstandar rantai bukti (Chain of Custody)
 */
export async function createForensicEvidenceBundle(incidentType, payload, reportedBy = 'Mako Security Engine') {
  const timestamp = new Date().toISOString();
  const sha256 = await computeSHA256(payload);

  return {
    evidenceId: `EVD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    incidentType,
    sha256Fingerprint: sha256,
    recordedAt: timestamp,
    reportedBy,
    legalNotice: 'Dokumen telemetri forensik digital ini dicatat otomatis sebagai bukti resmi perlindungan hukum Pasal 30, 32, dan 46 UU ITE.',
    payloadSnapshot: payload,
  };
}
