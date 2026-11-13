import { sanitizeInput, sanitizeUrl } from './security';

export type EspriVerificationStatus =
  | 'SAH'
  | 'TERVERIFIKASI'
  | 'MENUNGGU_TTD'
  | 'DICABUT'
  | 'KEDALUWARSA';

export type EspriSourceSystem = 'E-SPRI' | 'ADMINU' | 'EDISPENSASI';

export interface EspriVerificationRecord {
  hash: string;
  letterNumber: string;
  agendaNumber: string;
  letterType: string;
  subject: string;
  recipient: string;
  issuingUnit: string;
  issuedDate: string;
  validUntil: string;
  signerName: string;
  signerTitle: string;
  signerNia: string;
  status: EspriVerificationStatus;
  statusReason: string;
  documentSha256: string;
  verificationUrl: string;
  source: EspriSourceSystem;
  createdAt: string;
  updatedAt: string;
}

const SAFE_DOC_ID_RE = /^[a-zA-Z0-9_-]{1,128}$/;

const ALLOWED_STATUSES: ReadonlySet<EspriVerificationStatus> = new Set([
  'SAH',
  'TERVERIFIKASI',
  'MENUNGGU_TTD',
  'DICABUT',
  'KEDALUWARSA',
]);

const ALLOWED_SOURCES: ReadonlySet<EspriSourceSystem> = new Set([
  'E-SPRI',
  'ADMINU',
  'EDISPENSASI',
]);

/**
 * Mengekstrak parameter verifikasi dari URL path maupun query string dengan mempertahankan huruf besar/kecil.
 * Mendukung:
 * - /verifikasi/{hash}
 * - /verifikasi?hash={hash}&no={nomor}&id={id}&kode={kode}&nomor={nomor}&doc={doc}&surat={surat}
 * - /verifikasi-surat/{idOrHash}
 * - /verify/{idOrHash}
 */
export function extractVerificationLookupInput(
  rawPath = '',
  searchString = ''
): string {
  try {
    if (searchString) {
      const params = new URLSearchParams(
        searchString.startsWith('?') ? searchString : `?${searchString}`
      );
      const queryKeys = ['hash', 'no', 'nomor', 'doc', 'surat', 'id', 'kode', 'cert'];
      for (const key of queryKeys) {
        const val = params.get(key);
        if (val && val.trim()) {
          return sanitizeInput(val.trim(), 128);
        }
      }
    }

    const cleanPath = String(rawPath || '').split('?')[0].split('#')[0];
    const segments = cleanPath.split('/').filter(Boolean);
    if (segments.length >= 2) {
      const rootSeg = segments[0].toLowerCase();
      if (
        rootSeg === 'verifikasi' ||
        rootSeg === 'verifikasi-surat' ||
        rootSeg === 'verify'
      ) {
        const joined = decodeURIComponent(segments.slice(1).join('/'));
        return sanitizeInput(joined.trim(), 128);
      }
    }
  } catch {
    // Abaikan kesalahan parsing URI yang tidak valid
  }

  return '';
}

/**
 * Menghasilkan kandidat Document ID Firestore yang aman (^[a-zA-Z0-9_-]{1,128}$)
 * untuk pencarian langsung `getDoc(doc(db, 'publicVerifications', id))` tanpa `allow list`.
 */
export function buildPublicVerificationCandidateIds(rawInput = ''): string[] {
  const clean = String(rawInput || '').trim();
  if (!clean) return [];

  const candidates: string[] = [];
  const pushIfSafe = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && SAFE_DOC_ID_RE.test(trimmed) && !candidates.includes(trimmed)) {
      candidates.push(trimmed);
    }
  };

  // 1. Persis seperti input (contoh: sha256/token hash dari ?hash=...)
  pushIfSafe(clean);

  // 2. Variasi penggantian '/' dan spasi menjadi '_' (contoh: B-045/Sat-UNJ/XI/2026 -> B-045_Sat-UNJ_XI_2026)
  const slashToUnderscore = clean.replace(/[\s/]+/g, '_');
  pushIfSafe(slashToUnderscore);
  pushIfSafe(slashToUnderscore.toUpperCase());

  // 3. Variasi penggantian seluruh pemisah menjadi '-'
  const sepToDash = clean.replace(/[\s/]+/g, '-');
  pushIfSafe(sepToDash);
  pushIfSafe(sepToDash.toUpperCase());

  // 4. Jika input berupa nomor agenda pendek seperti "045" atau "45"
  if (/^[0-9]{1,6}$/.test(clean)) {
    const padded = clean.padStart(3, '0');
    pushIfSafe(padded);
    pushIfSafe(`no-${padded}`);
    pushIfSafe(`NO-${padded}`);
    pushIfSafe(`no_${padded}`);
    pushIfSafe(`agenda-${padded}`);
  }

  return candidates;
}

function normalizeStatus(rawStatus: unknown, fallbackValidFlag?: unknown): EspriVerificationStatus {
  if (typeof rawStatus === 'string') {
    const upper = rawStatus.trim().toUpperCase().replace(/\s+/g, '_');
    if (ALLOWED_STATUSES.has(upper as EspriVerificationStatus)) {
      return upper as EspriVerificationStatus;
    }
    if (upper === 'VALID' || upper === 'AKTIF' || upper === 'APPROVED' || upper === 'DISETUJUI') {
      return 'SAH';
    }
    if (upper === 'PENDING' || upper === 'DRAFT' || upper === 'MENUNGGU') {
      return 'MENUNGGU_TTD';
    }
    if (upper === 'REVOKED' || upper === 'BATAL' || upper === 'DIBATALKAN' || upper === 'TIDAK_SAH') {
      return 'DICABUT';
    }
    if (upper === 'EXPIRED' || upper === 'KADALUARSA') {
      return 'KEDALUWARSA';
    }
  }
  if (fallbackValidFlag === false) return 'DICABUT';
  return 'SAH';
}

function normalizeSource(rawSource: unknown): EspriSourceSystem {
  if (typeof rawSource === 'string') {
    const upper = rawSource.trim().toUpperCase().replace(/\s+/g, '_');
    if (ALLOWED_SOURCES.has(upper as EspriSourceSystem)) {
      return upper as EspriSourceSystem;
    }
  }
  return 'E-SPRI';
}

/**
 * Menormalkan dan menyaring XSS seluruh field dokumen Firestore `/publicVerifications/{hash}`
 * sebelum ditampilkan ke UI publik.
 */
export function normalizePublicVerificationDoc(
  docId: string,
  rawData: Record<string, unknown> = {}
): EspriVerificationRecord {
  const hash = sanitizeInput(String(rawData.hash || docId || ''), 128);
  const letterNumber = sanitizeInput(
    String(rawData.letterNumber || rawData.nomorSurat || rawData.nomor || docId || '-'),
    100
  );
  const agendaNumber = sanitizeInput(
    String(rawData.agendaNumber || rawData.noAgenda || rawData.no || ''),
    40
  );
  const letterType = sanitizeInput(
    String(rawData.letterType || rawData.jenisSurat || 'Naskah Dinas Resmi'),
    80
  );
  const subject = sanitizeInput(
    String(rawData.subject || rawData.perihal || rawData.title || 'Surat Resmi Satuan'),
    240
  );
  const recipient = sanitizeInput(
    String(rawData.recipient || rawData.kepada || rawData.tujuan || 'Pihak Terkait'),
    200
  );
  const issuingUnit = sanitizeInput(
    String(
      rawData.issuingUnit ||
        rawData.satuanPenerbit ||
        'Komando Resimen Mahasiswa Jayakarta Satuan UNJ'
    ),
    180
  );
  const issuedDate = sanitizeInput(
    String(rawData.issuedDate || rawData.tanggalSurat || rawData.tanggal || '-'),
    40
  );
  const validUntil = sanitizeInput(
    String(rawData.validUntil || rawData.berlakuHingga || ''),
    40
  );
  const signerName = sanitizeInput(
    String(rawData.signerName || rawData.penandatangan || 'Moch. Naufal Aziz'),
    120
  );
  const signerTitle = sanitizeInput(
    String(rawData.signerTitle || rawData.jabatanPenandatangan || 'Komandan Satuan Menwa UNJ'),
    140
  );
  const signerNia = sanitizeInput(String(rawData.signerNia || rawData.nia || ''), 50);
  const status = normalizeStatus(rawData.status, rawData.isValid);
  const statusReason = sanitizeInput(
    String(rawData.statusReason || rawData.catatanStatus || ''),
    300
  );
  const documentSha256 = sanitizeInput(
    String(rawData.documentSha256 || rawData.pdfSha256 || ''),
    128
  );
  const rawVerifyUrl = String(rawData.verificationUrl || '');
  const verificationUrl = rawVerifyUrl
    ? sanitizeUrl(rawVerifyUrl, '')
    : `https://menwaunj.or.id/verifikasi?hash=${encodeURIComponent(hash)}`;
  const source = normalizeSource(rawData.source);
  const createdAt = sanitizeInput(String(rawData.createdAt || ''), 50);
  const updatedAt = sanitizeInput(String(rawData.updatedAt || rawData.createdAt || ''), 50);

  return {
    hash,
    letterNumber,
    agendaNumber,
    letterType,
    subject,
    recipient,
    issuingUnit,
    issuedDate,
    validUntil,
    signerName,
    signerTitle,
    signerNia,
    status,
    statusReason,
    documentSha256,
    verificationUrl,
    source,
    createdAt,
    updatedAt,
  };
}

export function buildEspriVerificationUrls(
  hashOrId: string,
  origin = 'https://menwaunj.or.id'
): {
  primaryQueryUrl: string;
  pathUrl: string;
  legacyAliasUrl: string;
} {
  const clean = encodeURIComponent(String(hashOrId || '').trim());
  const cleanOrigin = String(origin || 'https://menwaunj.or.id').replace(/\/+$/, '');
  return {
    primaryQueryUrl: `${cleanOrigin}/verifikasi?hash=${clean}`,
    pathUrl: `${cleanOrigin}/verifikasi/${clean}`,
    legacyAliasUrl: `${cleanOrigin}/verifikasi-surat/${clean}`,
  };
}
