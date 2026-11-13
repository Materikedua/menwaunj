import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractVerificationLookupInput,
  buildPublicVerificationCandidateIds,
  normalizePublicVerificationDoc,
  buildEspriVerificationUrls,
} from './espriVerification';

test('extractVerificationLookupInput reads query params and path segments with case preserved', () => {
  assert.equal(
    extractVerificationLookupInput('/verifikasi', '?hash=EsPri_9f8A2b1C4d'),
    'EsPri_9f8A2b1C4d'
  );
  assert.equal(
    extractVerificationLookupInput('/verifikasi', '?no=045'),
    '045'
  );
  assert.equal(
    extractVerificationLookupInput('/verifikasi/AbCd1234', ''),
    'AbCd1234'
  );
  assert.equal(
    extractVerificationLookupInput('/verifikasi-surat/DISP-M6XYZ', ''),
    'DISP-M6XYZ'
  );
  assert.equal(
    extractVerificationLookupInput('/verify', '?hash=esp_Token99'),
    'esp_Token99'
  );
});

test('buildPublicVerificationCandidateIds produces safe Firestore doc IDs for hashes, letter numbers, and agenda numbers', () => {
  const fromHash = buildPublicVerificationCandidateIds('espri-7a91c4e2b8f0');
  assert.ok(fromHash.includes('espri-7a91c4e2b8f0'));

  const fromLetter = buildPublicVerificationCandidateIds('B-045/Sat-UNJ/XI/2026');
  assert.ok(fromLetter.includes('B-045_Sat-UNJ_XI_2026'));
  assert.ok(fromLetter.includes('B-045-Sat-UNJ-XI-2026'));

  const fromAgenda = buildPublicVerificationCandidateIds('45');
  assert.ok(fromAgenda.includes('045'));
  assert.ok(fromAgenda.includes('no-045'));

  // Reject unsafe path traversal strings
  const unsafe = buildPublicVerificationCandidateIds('../etc/passwd');
  assert.equal(unsafe.some((id) => id.includes('..') || id.includes('/')), false);
});

test('normalizePublicVerificationDoc sanitizes XSS payloads and maps status aliases', () => {
  const normalized = normalizePublicVerificationDoc('espri-hash-01', {
    hash: 'espri-hash-01',
    letterNumber: 'B-045/Sat-UNJ/XI/2026',
    agendaNumber: '045',
    letterType: 'Surat Tugas',
    subject: '<script>alert(1)</script>Penugasan Pengamanan Wisuda UNJ',
    recipient: 'Wakil Rektor III UNJ',
    issuedDate: '2026-11-13',
    signerName: 'Moch. Naufal Aziz',
    signerTitle: 'Komandan Satuan Menwa UNJ',
    status: 'DICABUT',
    statusReason: 'Revisi daftar personel',
    verificationUrl: 'javascript:alert(1)',
    source: 'E-SPRI',
  });

  assert.equal(normalized.hash, 'espri-hash-01');
  assert.equal(normalized.letterNumber, 'B-045/Sat-UNJ/XI/2026');
  assert.equal(normalized.subject.includes('<script>'), false);
  assert.ok(normalized.subject.includes('Penugasan Pengamanan Wisuda UNJ'));
  assert.equal(normalized.status, 'DICABUT');
  assert.equal(normalized.verificationUrl, '');
});

test('buildEspriVerificationUrls returns canonical query and path verification links', () => {
  const urls = buildEspriVerificationUrls('esp_045_abc');
  assert.equal(urls.primaryQueryUrl, 'https://menwaunj.or.id/verifikasi?hash=esp_045_abc');
  assert.equal(urls.pathUrl, 'https://menwaunj.or.id/verifikasi/esp_045_abc');
  assert.equal(urls.legacyAliasUrl, 'https://menwaunj.or.id/verifikasi-surat/esp_045_abc');
});
