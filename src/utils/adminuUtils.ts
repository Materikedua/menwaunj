/**
 * Utilitas Murni Naskah Dinas & Alur Tiket -> Surat Resmi Menwa UNJ
 * - Format penomoran surat resmi: B-001/Web/(Bulan Romawi)/2026
 * - Deteksi otomatis kolom Lampiran dari berkas PDF (maks 1 MB)
 * - Validasi berkas PDF & gerbang persetujuan tiket tahap 2 (Lacak Surat)
 */

const ROMAN_MONTHS = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
] as const;

export const MAX_ADMINU_PDF_BYTES = 1048576; // 1 MB (1024 * 1024 bytes)

export function toRomanMonth(zeroBasedMonthIndex: number): string {
  const idx = Math.max(0, Math.min(11, Math.floor(Number(zeroBasedMonthIndex) || 0)));
  return ROMAN_MONTHS[idx] || 'I';
}

export function formatWebLetterNumber(seqNumber: number, referenceDate: Date = new Date()): string {
  const safeSeq = Math.max(1, Math.floor(Number(seqNumber) || 1));
  const padded = String(safeSeq).padStart(3, '0');
  const romanMonth = toRomanMonth(referenceDate.getMonth());
  const year = referenceDate.getFullYear();
  return `B-${padded}/Web/${romanMonth}/${year}`;
}

export function letterNumberToDocId(letterNumber: string): string {
  return String(letterNumber || '')
    .trim()
    .replace(/\//g, '_');
}

export function detectLampiranText(pdfName?: string | null, pdfSizeKb?: number | null): string {
  const cleanName = String(pdfName || '').trim();
  if (!cleanName) return '-';
  const sizePart = pdfSizeKb && Number(pdfSizeKb) > 0 ? ` (${Math.round(Number(pdfSizeKb))} KB)` : '';
  return `1 (Satu) Berkas PDF — ${cleanName}${sizePart}`;
}

export function validatePdfAttachmentFile(fileMeta: {
  name?: string;
  type?: string;
  sizeBytes?: number;
}): { ok: boolean; error?: string; sizeKb?: number } {
  const name = String(fileMeta?.name || '').trim();
  const type = String(fileMeta?.type || '').toLowerCase();
  const sizeBytes = Number(fileMeta?.sizeBytes || 0);

  if (!name) {
    return { ok: false, error: 'Berkas PDF tidak ditemukan.' };
  }
  const isPdfMime = type === 'application/pdf';
  const isPdfExt = name.toLowerCase().endsWith('.pdf');
  if (!isPdfMime && !isPdfExt) {
    return { ok: false, error: 'Hanya berkas berformat .PDF yang diperbolehkan.' };
  }
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return { ok: false, error: 'Ukuran berkas PDF tidak valid atau kosong.' };
  }
  if (sizeBytes > MAX_ADMINU_PDF_BYTES) {
    const mb = (sizeBytes / (1024 * 1024)).toFixed(2);
    return {
      ok: false,
      error: `Ukuran berkas (${mb} MB) melebihi batas maksimal 1 MB.`,
    };
  }
  return {
    ok: true,
    sizeKb: Math.max(1, Math.round(sizeBytes / 1024)),
  };
}

export const APPROVED_TICKET_STATUSES = new Set([
  'DISETUJUI',
  'VERIFIKASI_ADMINU',
  'AUDIENSI_POLA_PAM',
  'PERSONEL_DITUGASKAN',
]);

export function isTicketApprovedForFormalSubmission(status?: string | null): boolean {
  const normalized = String(status || '')
    .trim()
    .toUpperCase();
  return APPROVED_TICKET_STATUSES.has(normalized);
}
