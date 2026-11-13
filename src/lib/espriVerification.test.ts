import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMainVerificationUrl,
  createPublicVerificationRecord,
  getVerificationStatusMeta,
  KOP_SURAT_STANDARD_MENWA_UNJ,
  parseVerificationQueryFromUrl,
  renderKopSuratHtmlString,
  sha256Hex,
} from './espriVerification';

test('parseVerificationQueryFromUrl extracts ?hash=, path segments, ?no=, and legacy params accurately', () => {
  const fromHash = parseVerificationQueryFromUrl('?hash=espri-7a91c4e2b8f09c12', '/verifikasi');
  assert.equal(fromHash.hash, 'espri-7a91c4e2b8f09c12');
  assert.equal(fromHash.matchedParam, 'hash');

  const fromPath = parseVerificationQueryFromUrl('', '/verifikasi/espri-7a91c4e2b8f09c12');
  assert.equal(fromPath.hash, 'espri-7a91c4e2b8f09c12');
  assert.equal(fromPath.matchedParam, 'path');

  const fromLegacyPath = parseVerificationQueryFromUrl('', '/verifikasi-surat/disp-001');
  assert.equal(fromLegacyPath.hash, 'disp-001');
  assert.equal(fromLegacyPath.matchedParam, 'path');

  const fromNo = parseVerificationQueryFromUrl('?no=045', '/verifikasi');
  assert.equal(fromNo.agendaOrNomor, '045');
  assert.equal(fromNo.matchedParam, 'no');

  const fromDoc = parseVerificationQueryFromUrl('?doc=B-045_Sat-UNJ_XI_2026', '/verifikasi');
  assert.equal(fromDoc.docId, 'B-045_Sat-UNJ_XI_2026');
  assert.equal(fromDoc.matchedParam, 'doc');
});

test('createPublicVerificationRecord enforces /publicVerifications/{hash} schema boundaries and verificationUrl', () => {
  const record = createPublicVerificationRecord({
    letterNumber: 'B-045/Sat-UNJ/XI/2026',
    letterType: 'Surat Tugas',
    subject: 'Penugasan Personel Pengamanan Wisuda UNJ',
    recipient: 'Wakil Rektor Bidang Kemahasiswaan UNJ',
    issuedDate: '2026-11-13',
    signerName: 'Moch. Naufal Aziz',
    signerTitle: 'Komandan Satuan Resimen Mahasiswa UNJ',
    signerNia: '210412001',
    agendaNumber: '045',
    status: 'SAH',
    source: 'EDISPENSASI',
    nowIso: '2026-11-13T09:30:00.000Z',
  });

  assert.match(record.hash, /^edisp-[0-9a-f]{16}$/);
  assert.equal(
    record.verificationUrl,
    `https://menwaunj.or.id/verifikasi?hash=${record.hash}`
  );
  assert.equal(record.source, 'EDISPENSASI');
  assert.equal(buildMainVerificationUrl(record.hash), record.verificationUrl);
  assert.equal(sha256Hex('').length, 64);
  assert.equal(getVerificationStatusMeta(record.status).tone, 'emerald');
});

test('KOP_SURAT_STANDARD_MENWA_UNJ and renderKopSuratHtmlString include official branding & double separator', () => {
  assert.equal(KOP_SURAT_STANDARD_MENWA_UNJ.baris1, 'KOMANDO RESIMEN MAHASISWA JAYAKARTA');
  assert.equal(KOP_SURAT_STANDARD_MENWA_UNJ.baris2, 'SATUAN UNIVERSITAS NEGERI JAKARTA');

  const html = renderKopSuratHtmlString();
  assert.ok(html.includes('KOMANDO RESIMEN MAHASISWA JAYAKARTA'));
  assert.ok(html.includes('SATUAN UNIVERSITAS NEGERI JAKARTA'));
  assert.ok(html.includes('logo_unj_kop_2026.png'));
  assert.ok(html.includes('logo_menwa_kop_2026.png'));
  assert.ok(html.includes('0.75pt solid #000000'));
  assert.ok(html.includes('2.75pt solid #000000'));
});
