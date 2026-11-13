import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toRomanMonth,
  formatWebLetterNumber,
  letterNumberToDocId,
  detectLampiranText,
  validatePdfAttachmentFile,
  isTicketApprovedForFormalSubmission,
} from './adminuUtils';

test('toRomanMonth maps zero-based months accurately to Roman numerals', () => {
  assert.equal(toRomanMonth(0), 'I');
  assert.equal(toRomanMonth(9), 'X');
  assert.equal(toRomanMonth(10), 'XI');
  assert.equal(toRomanMonth(11), 'XII');
});

test('formatWebLetterNumber produces B-001/Web/<Romawi>/<Tahun> and docId converter', () => {
  const novDate = new Date('2026-11-12T10:00:00Z');
  const num = formatWebLetterNumber(1, novDate);
  assert.equal(num, 'B-001/Web/XI/2026');
  assert.equal(letterNumberToDocId(num), 'B-001_Web_XI_2026');

  const janDate = new Date('2026-01-15T10:00:00Z');
  assert.equal(formatWebLetterNumber(42, janDate), 'B-042/Web/I/2026');
});

test('detectLampiranText auto-detects attachment when PDF is present or returns dash', () => {
  assert.equal(detectLampiranText('', 0), '-');
  assert.equal(detectLampiranText(null, null), '-');
  assert.equal(
    detectLampiranText('proposal_kegiatan.pdf', 320),
    '1 (Satu) Berkas PDF — proposal_kegiatan.pdf (320 KB)'
  );
});

test('validatePdfAttachmentFile enforces .pdf format and <= 1 MB size limit', () => {
  assert.deepEqual(
    validatePdfAttachmentFile({
      name: 'surat.pdf',
      type: 'application/pdf',
      sizeBytes: 512000,
    }),
    { ok: true, sizeKb: 500 }
  );

  const nonPdf = validatePdfAttachmentFile({
    name: 'foto.png',
    type: 'image/png',
    sizeBytes: 50000,
  });
  assert.equal(nonPdf.ok, false);
  assert.ok(nonPdf.error?.includes('.PDF'));

  const oversize = validatePdfAttachmentFile({
    name: 'besar.pdf',
    type: 'application/pdf',
    sizeBytes: 1500000,
  });
  assert.equal(oversize.ok, false);
  assert.ok(oversize.error?.includes('1 MB'));
});

test('isTicketApprovedForFormalSubmission unlocks stage 2 only when approved beyond DITERIMA', () => {
  assert.equal(isTicketApprovedForFormalSubmission('DITERIMA'), false);
  assert.equal(isTicketApprovedForFormalSubmission('DISETUJUI'), true);
  assert.equal(isTicketApprovedForFormalSubmission('VERIFIKASI_ADMINU'), true);
  assert.equal(isTicketApprovedForFormalSubmission('AUDIENSI_POLA_PAM'), true);
  assert.equal(isTicketApprovedForFormalSubmission('PERSONEL_DITUGASKAN'), true);
});
