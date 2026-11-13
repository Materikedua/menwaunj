import {
  KopSuratStandardConfig,
  ParsedVerificationQuery,
  PublicVerificationRecord,
  PublicVerificationSource,
  PublicVerificationStatus,
} from '../types/espriVerification';

export const MAIN_WEBSITE_ORIGIN = 'https://menwaunj.or.id';
export const MAIN_WEBSITE_VERIFIKASI_PATH = '/verifikasi';

/**
 * Standar baku Kop Surat Resmi Komando Resimen Mahasiswa Jayakarta Satuan UNJ (SOP E-Spri 2026).
 * Gunakan konstanta ini sebagai Single Source of Truth pada seluruh generator surat website utama
 * (E-Dispensasi, AdminU, Surat Tugas web, maupun sertifikat/rekomendasi dinas).
 */
export const KOP_SURAT_STANDARD_MENWA_UNJ: KopSuratStandardConfig = {
  baris1: 'KOMANDO RESIMEN MAHASISWA JAYAKARTA',
  baris2: 'SATUAN UNIVERSITAS NEGERI JAKARTA',
  alamat: 'Gedung G, Lantai 1, Ruang 107, Kampus A UNJ, Jakarta Timur 13220',
  kontak: 'Telepon: 0815-2582-3503 | Surel: unjmenwa@gmail.com',
  lamanLabel: 'www.menwaunj.or.id',
  lamanUrl: 'https://www.menwaunj.or.id',
  mottoJudul: 'WIDYA CASTRENA DHARMA SIDDHA',
  mottoSubJudul: '“Penyempurnaan Pengabdian dengan Ilmu Pengetahuan dan Ilmu olah Keprajuritan”',
  logoUnjPath: '/assets/logo_unj_kop_2026.png',
  logoMenwaPath: '/assets/logo_menwa_kop_2026.png',
};

const VALID_HASH_REGEX = /^[a-zA-Z0-9_-]{3,128}$/;

/**
 * Pure TypeScript synchronous SHA-256 (UTF-8) -> 64 lowercase hex characters.
 */
export function sha256Hex(message: string): string {
  const bytes = new TextEncoder().encode(message);
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);
  const H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);

  const bitLen = bytes.length * 8;
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  const highBits = Math.floor(bitLen / 0x100000000);
  const lowBits = bitLen >>> 0;
  view.setUint32(paddedLen - 8, highBits, false);
  view.setUint32(paddedLen - 4, lowBits, false);

  const W = new Uint32Array(64);
  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      W[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 =
        ((W[i - 15] >>> 7) | (W[i - 15] << 25)) ^
        ((W[i - 15] >>> 18) | (W[i - 15] << 14)) ^
        (W[i - 15] >>> 3);
      const s1 =
        ((W[i - 2] >>> 17) | (W[i - 2] << 15)) ^
        ((W[i - 2] >>> 19) | (W[i - 2] << 13)) ^
        (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 =
        ((e >>> 6) | (e << 26)) ^
        ((e >>> 11) | (e << 21)) ^
        ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
      const S0 =
        ((a >>> 2) | (a << 30)) ^
        ((a >>> 13) | (a << 19)) ^
        ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }

  return Array.from(H)
    .map((word) => word.toString(16).padStart(8, '0'))
    .join('');
}

export function sanitizeVerificationHashId(raw: string): string {
  const cleaned = (raw || '').trim().replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  if (cleaned.length >= 3) return cleaned;
  return `doc-${cleaned.padEnd(3, '0')}`;
}

export function isValidVerificationHashId(hash: string): boolean {
  return VALID_HASH_REGEX.test((hash || '').trim());
}

/**
 * Mengekstrak hash / nomor agenda / ID dokumen dari URL verifikasi QR sesuai urutan prioritas
 * resmi menwaunj.or.id (case-sensitive):
 * 1. ?hash=
 * 2. Path segment /verifikasi/{hash} atau /verifikasi-surat/{hashOrId}
 * 3. ?no= / ?nomor=
 * 4. ?doc= / ?surat= / ?id= / ?kode= / ?cert= / ?verify=
 */
export function parseVerificationQueryFromUrl(
  search: string,
  pathname = ''
): ParsedVerificationQuery {
  const params = new URLSearchParams(search || '');

  const hashParam = params.get('hash')?.trim() || '';
  if (hashParam) {
    return {
      hash: sanitizeVerificationHashId(hashParam),
      agendaOrNomor: '',
      docId: hashParam,
      matchedParam: 'hash',
    };
  }

  const pathMatch = pathname.match(/^\/verifikasi(?:-surat)?\/([^/?#]+)\/?$/i);
  if (pathMatch && pathMatch[1]) {
    const seg = decodeURIComponent(pathMatch[1]).trim();
    return {
      hash: sanitizeVerificationHashId(seg),
      agendaOrNomor: seg,
      docId: seg,
      matchedParam: 'path',
    };
  }

  const noParam = params.get('no')?.trim() || '';
  if (noParam) {
    return {
      hash: sanitizeVerificationHashId(noParam),
      agendaOrNomor: noParam,
      docId: noParam,
      matchedParam: 'no',
    };
  }

  const nomorParam = params.get('nomor')?.trim() || '';
  if (nomorParam) {
    return {
      hash: sanitizeVerificationHashId(nomorParam),
      agendaOrNomor: nomorParam,
      docId: nomorParam,
      matchedParam: 'nomor',
    };
  }

  const altKeys: Array<'doc' | 'surat' | 'id' | 'kode' | 'cert' | 'verify'> = [
    'doc',
    'surat',
    'id',
    'kode',
    'cert',
    'verify',
  ];
  for (const key of altKeys) {
    const val = params.get(key)?.trim();
    if (val) {
      return {
        hash: sanitizeVerificationHashId(val),
        agendaOrNomor: val,
        docId: val,
        matchedParam: key,
      };
    }
  }

  return {
    hash: '',
    agendaOrNomor: '',
    docId: '',
    matchedParam: 'none',
  };
}

/**
 * Membangun URL verifikasi resmi menwaunj.or.id untuk ditanam di QR surat.
 */
export function buildMainVerificationUrl(
  hash: string,
  origin = MAIN_WEBSITE_ORIGIN
): string {
  const cleanOrigin = (origin || MAIN_WEBSITE_ORIGIN).replace(/\/+$/, '');
  return `${cleanOrigin}${MAIN_WEBSITE_VERIFIKASI_PATH}?hash=${encodeURIComponent(
    sanitizeVerificationHashId(hash)
  )}`;
}

/**
 * Membangun payload siap simpan ke koleksi Firestore `/publicVerifications/{hash}`
 * untuk surat yang dihasilkan langsung di website utama (ADMINU / EDISPENSASI / E-SPRI).
 */
export function createPublicVerificationRecord(input: {
  hash?: string;
  letterNumber: string;
  letterType: string;
  subject: string;
  recipient: string;
  issuedDate: string;
  signerName: string;
  signerTitle: string;
  status: PublicVerificationStatus;
  source: PublicVerificationSource;
  agendaNumber?: string;
  issuingUnit?: string;
  validUntil?: string;
  signerNia?: string;
  statusReason?: string;
  documentSha256?: string;
  existingCreatedAt?: string;
  nowIso?: string;
}): PublicVerificationRecord {
  const nowIso = (input.nowIso || new Date().toISOString()).slice(0, 50);
  const createdAt = (input.existingCreatedAt || nowIso).slice(0, 50);
  const prefix =
    input.source === 'EDISPENSASI'
      ? 'edisp'
      : input.source === 'ADMINU'
        ? 'adminu'
        : 'espri';
  const derivedHash =
    input.hash && isValidVerificationHashId(input.hash)
      ? input.hash.trim()
      : `${prefix}-${sha256Hex(`${input.letterNumber}|${input.issuedDate}|${input.subject}`).slice(0, 16)}`;

  const hash = sanitizeVerificationHashId(derivedHash);

  return {
    hash,
    letterNumber: input.letterNumber.trim().slice(0, 100),
    letterType: input.letterType.trim().slice(0, 80),
    subject: input.subject.trim().slice(0, 240),
    recipient: input.recipient.trim().slice(0, 200),
    issuedDate: input.issuedDate.trim().slice(0, 40),
    signerName: input.signerName.trim().slice(0, 120),
    signerTitle: input.signerTitle.trim().slice(0, 140),
    status: input.status,
    source: input.source,
    createdAt,
    updatedAt: nowIso,
    ...(input.agendaNumber?.trim()
      ? { agendaNumber: input.agendaNumber.trim().slice(0, 40) }
      : {}),
    issuingUnit: (
      input.issuingUnit?.trim() ||
      'Komando Resimen Mahasiswa Jayakarta Satuan UNJ'
    ).slice(0, 180),
    ...(input.validUntil?.trim()
      ? { validUntil: input.validUntil.trim().slice(0, 40) }
      : {}),
    ...(input.signerNia?.trim()
      ? { signerNia: input.signerNia.trim().slice(0, 50) }
      : {}),
    ...(input.statusReason?.trim()
      ? { statusReason: input.statusReason.trim().slice(0, 300) }
      : {}),
    ...(input.documentSha256?.trim()
      ? { documentSha256: input.documentSha256.trim().slice(0, 128) }
      : {}),
    verificationUrl: buildMainVerificationUrl(hash).slice(0, 300),
  };
}

export function getVerificationStatusMeta(status: PublicVerificationStatus): {
  label: string;
  description: string;
  tone: 'emerald' | 'amber' | 'rose' | 'slate';
} {
  switch (status) {
    case 'SAH':
      return {
        label: 'DOKUMEN SAH & TERCATAT',
        description: 'Surat resmi telah disahkan dan tercatat di sistem komando Menwa UNJ.',
        tone: 'emerald',
      };
    case 'TERVERIFIKASI':
      return {
        label: 'TERVERIFIKASI',
        description: 'Keaslian dokumen terverifikasi di arsip Komando Menwa UNJ.',
        tone: 'emerald',
      };
    case 'MENUNGGU_TTD':
      return {
        label: 'MENUNGGU PENGESAHAN TTD',
        description: 'Dokumen telah terdaftar di agenda, namun masih menunggu tanda tangan final.',
        tone: 'amber',
      };
    case 'DICABUT':
      return {
        label: 'DOKUMEN DICABUT',
        description: 'Surat ini telah dibatalkan atau dicabut keberlakuannya oleh Komando Satuan.',
        tone: 'rose',
      };
    case 'KEDALUWARSA':
      return {
        label: 'MASA BERLAKU HABIS',
        description: 'Masa berlaku surat dinas atau penugasan ini telah berakhir.',
        tone: 'slate',
      };
  }
}

/**
 * Menghasilkan potongan HTML Kop Surat standar E-Spri (Arial + Garis Ganda Resmi)
 * untuk digunakan pada fitur export Word (.doc) atau cetak HTML di website utama menwaunj.or.id.
 */
export function renderKopSuratHtmlString(
  config: Partial<KopSuratStandardConfig> = {},
  origin = MAIN_WEBSITE_ORIGIN
): string {
  const c = { ...KOP_SURAT_STANDARD_MENWA_UNJ, ...config };
  const cleanOrigin = origin.replace(/\/+$/, '');
  const escapeHtml = (val: string) =>
    val
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  return `
<div style="font-family: Arial, Helvetica, sans-serif; color: #000000; width: 100%;">
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 4px;">
    <tr>
      <td style="width: 88px; vertical-align: middle; text-align: left;">
        <img src="${escapeHtml(cleanOrigin + c.logoUnjPath)}" alt="Logo UNJ" style="width: 84px; height: 88px; object-fit: contain;" />
      </td>
      <td style="vertical-align: middle; text-align: center; line-height: 1.18;">
        <div style="font-size: 13.5pt; font-weight: bold; text-transform: uppercase;">${escapeHtml(c.baris1)}</div>
        <div style="font-size: 13.5pt; font-weight: bold; text-transform: uppercase;">${escapeHtml(c.baris2)}</div>
        <div style="font-size: 9.5pt; margin-top: 2px;">${escapeHtml(c.alamat)}</div>
        <div style="font-size: 9.5pt;">${escapeHtml(c.kontak)}</div>
        <div style="font-size: 9.5pt;">Laman: <a href="${escapeHtml(c.lamanUrl)}" style="color: #0000ee; text-decoration: underline;">${escapeHtml(c.lamanLabel)}</a></div>
      </td>
      <td style="width: 96px; vertical-align: middle; text-align: right;">
        <img src="${escapeHtml(cleanOrigin + c.logoMenwaPath)}" alt="Logo Menwa Jayakarta" style="width: 90px; height: 88px; object-fit: contain;" />
      </td>
    </tr>
  </table>
  <div style="border-top: 0.75pt solid #000000; margin-bottom: 2pt;"></div>
  <div style="border-top: 2.75pt solid #000000; margin-bottom: 8pt;"></div>
</div>`.trim();
}
