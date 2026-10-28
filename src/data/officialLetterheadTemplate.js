/**
 * Template Kop Surat Resmi Resimen Mahasiswa Satuan Universitas Negeri Jakarta
 * Disinkronkan langsung dari dokumen naskah dinas resmi nomor B-158/Sat-UNJ/X/2026
 */

export const OFFICIAL_MAKO_CONTACT = {
  organization: 'KOMANDO RESIMEN MAHASISWA JAKARTA RAYA JAYAKARTA',
  unit: 'SATUAN UNIVERSITAS NEGERI JAKARTA',
  address: 'Markas Komando Jl. Rawamangun Muka Komplek UNJ Gedung G Lt. I R. 107, Jakarta Timur',
  phone: '081525823503',
  phoneFormatted: '0815-2582-3503',
  contactPerson: 'Raffli Syahputra (Wadansat / CP: 0815-2582-3503)',
  email: 'unjmenwa@gmail.com',
  dansatName: 'Eben Haezer Sitorus, S.Si.',
  dansatNbp: '21020741491',
  dansatTitle: 'Komandan Resimen Mahasiswa Universitas Negeri Jakarta',
  logoLeft: '/logo-unj.png',
  logoRight: '/Logo Menwa Jayakarta.png',
};

/**
 * Template HTML Murni Kop Surat Kosong (Print-Ready A4 Standalone)
 * Siap dicetak langsung ke PDF atau disalin ke editor dokumen
 */
export const BLANK_LETTERHEAD_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kop Surat Resmi — Menwa UNJ</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 20mm 20mm 20mm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 0;
      line-height: 1.4;
    }
    .letterhead-container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px 30px;
      box-sizing: border-box;
    }
    /* Header Kop Surat */
    .kop-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      text-align: center;
      padding-bottom: 8px;
    }
    .kop-logo {
      width: 82px;
      height: 82px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .kop-text {
      flex: 1;
    }
    .kop-title-1 {
      font-size: 14pt;
      font-weight: bold;
      letter-spacing: 0.5px;
      margin: 0;
      text-transform: uppercase;
    }
    .kop-title-2 {
      font-size: 15pt;
      font-weight: bold;
      letter-spacing: 1px;
      margin: 2px 0 0 0;
      text-transform: uppercase;
    }
    .kop-title-3 {
      font-size: 16pt;
      font-weight: 900;
      letter-spacing: 0.5px;
      margin: 3px 0 4px 0;
      text-transform: uppercase;
    }
    .kop-address {
      font-size: 9.5pt;
      font-weight: normal;
      margin: 0;
      line-height: 1.25;
    }
    /* Garis Pembatas Ganda Khas Kedinasan */
    .kop-divider {
      border: 0;
      border-top: 3px solid #000;
      border-bottom: 1px solid #000;
      height: 2px;
      margin: 4px 0 24px 0;
    }
    /* Area Metadata Surat */
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11pt;
      margin-bottom: 24px;
    }
    .meta-table td {
      padding: 2px 0;
      vertical-align: top;
    }
    .meta-table .label-col {
      width: 90px;
    }
    .meta-table .colon-col {
      width: 15px;
      text-align: center;
    }
    /* Area Isi Surat Kosong (Tempat Pengetikan Naskah Dinas) */
    .letter-body {
      min-height: 380px;
      font-size: 12pt;
      text-align: justify;
      line-height: 1.5;
    }
    .letter-body-placeholder {
      border: 1px dashed #ccc;
      padding: 40px;
      text-align: center;
      color: #888;
      font-style: italic;
      font-size: 11pt;
      border-radius: 8px;
    }
    /* Area Tanda Tangan */
    .signature-section {
      margin-top: 40px;
      display: flex;
      justify-content: flex-end;
      text-align: center;
      font-size: 11pt;
    }
    .signature-block {
      width: 280px;
    }
    .signature-title {
      font-weight: normal;
      margin-bottom: 70px;
      line-height: 1.3;
    }
    .signature-name {
      font-weight: bold;
      text-decoration: underline;
      margin: 0;
    }
    .signature-nbp {
      margin: 2px 0 0 0;
    }
    /* Tembusan & Contact Person Kiri Bawah */
    .footer-notes {
      margin-top: 30px;
      font-size: 10pt;
      line-height: 1.35;
    }
    .footer-notes strong {
      display: block;
      margin-bottom: 2px;
    }
    @media print {
      body {
        background: #fff;
      }
      .letterhead-container {
        padding: 0;
        max-width: 100%;
      }
      .letter-body-placeholder {
        display: none;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="letterhead-container">
    <!-- KOP SURAT RESMI -->
    <div class="kop-header">
      <img src="/logo-unj.png" alt="Logo UNJ" class="kop-logo" />
      <div class="kop-text">
        <h1 class="kop-title-1">KOMANDO RESIMEN MAHASISWA JAKARTA RAYA</h1>
        <h2 class="kop-title-2">JAYAKARTA</h2>
        <h3 class="kop-title-3">SATUAN UNIVERSITAS NEGERI JAKARTA</h3>
        <p class="kop-address">
          Markas Komando Jl. Rawamangun Muka Komplek UNJ Gedung G Lt. I R. 107, Jakarta Timur, Telp (081525823503)
        </p>
      </div>
      <img src="/Logo Menwa Jayakarta.png" alt="Logo Menwa Jayakarta" class="kop-logo" />
    </div>

    <!-- GARIS PEMBATAS GANDA (TEBAL - TIPIS) -->
    <div class="kop-divider"></div>

    <!-- METADATA SURAT (KOSONG SIAP ISI) -->
    <table class="meta-table">
      <tr>
        <td class="label-col">Nomor</td>
        <td class="colon-col">:</td>
        <td>B-____/Sat-UNJ/____/2026</td>
      </tr>
      <tr>
        <td class="label-col">Lampiran</td>
        <td class="colon-col">:</td>
        <td>-</td>
      </tr>
      <tr>
        <td class="label-col">Perihal</td>
        <td class="colon-col">:</td>
        <td>________________________________________</td>
      </tr>
    </table>

    <!-- TEMPAT PENERIMA SURAT -->
    <div style="font-size: 11pt; margin-bottom: 24px;">
      Kepada Yth.<br>
      <strong>[Nama Penerima / Pimpinan Lembaga]</strong><br>
      di Tempat
    </div>

    <!-- AREA ISI SURAT (KOSONG) -->
    <div class="letter-body">
      <div class="letter-body-placeholder no-print">
        [Area Isi Naskah Dinas — Ketik atau sisipkan materi surat Anda di sini]
      </div>
    </div>

    <!-- TANDA TANGAN KOMANDAN -->
    <div class="signature-section">
      <div class="signature-block">
        <div>Jakarta, ____ _____________ 2026</div>
        <div class="signature-title">
          Komandan Resimen Mahasiswa<br>
          Universitas Negeri Jakarta
        </div>
        <div class="signature-name">Eben Haezer Sitorus, S.Si.</div>
        <div class="signature-nbp">NBP 21020741491</div>
      </div>
    </div>

    <!-- TEMBUSAN & CP -->
    <div class="footer-notes">
      <strong>Tembusan:</strong>
      1. Arsip<br>
      CP: 0815-2582-3503 (Raffli)
    </div>
  </div>
</body>
</html>
`;
