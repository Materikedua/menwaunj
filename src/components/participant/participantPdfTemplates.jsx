import { printHtmlDocument } from './participantUtils.js';

export function printTeamCardsPdf({ pasukan, officials, logoSrc, detectedSchoolName }) {
  const cardsHtml = [
    ...pasukan.map((p, idx) => ({ ...p, cardType: 'PASUKAN', no: idx + 1 })),
    ...officials.map((o, idx) => ({ ...o, cardType: 'OFFICIAL', no: idx + 1 })),
  ]
    .map(
      (item) => `
      <div class="id-card">
        <div class="id-header ${item.cardType === 'OFFICIAL' ? 'bg-off' : 'bg-pas'}">
          <img src="${logoSrc}" alt="Logo" class="logo" />
          <div class="head-txt">
            <div class="eyebrow">GERANAT · MENWA UNJ</div>
            <div class="school">${detectedSchoolName}</div>
          </div>
          <div class="badge-no">#${String(item.no).padStart(2, '0')}</div>
        </div>
        <div class="id-body">
          <div class="photo-box">
            ${item.photoDataUrl ? `<img src="${item.photoDataUrl}" alt="${item.fullName}" />` : `<span>FOTO 3x4</span>`}
          </div>
          <div class="role">${item.position}</div>
          <div class="name">${item.fullName}</div>
          <div class="nisn">${item.cardType === 'PASUKAN' ? `NISN: ${item.nisn || '—'}` : 'OFFICIAL TIM'}</div>
        </div>
        <div class="id-foot">
          <span>${item.cardType === 'OFFICIAL' ? 'ID OFFICIAL RESMI' : 'ID PASUKAN RESMI'}</span>
          <span>TERVERIFIKASI</span>
        </div>
      </div>
    `
    )
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>ID Card Kontingen - ${detectedSchoolName}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; background: #fff; color: #092D32; margin: 0; padding: 0; }
    .page-title { text-align: center; margin-bottom: 16px; border-bottom: 2px solid #006569; padding-bottom: 8px; }
    .page-title h2 { margin: 0; font-size: 16px; font-weight: 900; color: #006569; }
    .page-title p { margin: 3px 0 0 0; font-size: 11px; color: #64748B; font-weight: 700; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; page-break-inside: auto; }
    .id-card { border: 1.5px solid #092D32; border-radius: 14px; overflow: hidden; page-break-inside: avoid; background: #fff; }
    .id-header { padding: 8px 10px; color: #fff; display: flex; align-items: center; justify-content: space-between; }
    .bg-pas { background: #006569; }
    .bg-off { background: #1e3a8a; }
    .logo { width: 24px; height: 24px; object-fit: contain; background: #fff; border-radius: 6px; padding: 2px; }
    .head-txt { flex: 1; margin: 0 8px; min-width: 0; }
    .eyebrow { font-size: 7px; font-weight: 900; letter-spacing: 1px; color: #FFDD00; }
    .school { font-size: 9px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .badge-no { font-family: monospace; font-size: 9px; font-weight: 900; background: #FFDD00; color: #092D32; padding: 2px 5px; border-radius: 4px; }
    .id-body { padding: 10px; text-align: center; }
    .photo-box { width: 68px; height: 88px; border: 1.5px solid #cbd5e1; border-radius: 8px; margin: 0 auto 6px auto; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f8fafc; font-size: 8px; font-weight: 800; color: #94a3b8; }
    .photo-box img { width: 100%; height: 100%; object-fit: cover; }
    .role { font-size: 8px; font-weight: 900; color: #006569; text-transform: uppercase; margin-bottom: 2px; }
    .name { font-size: 10px; font-weight: 900; color: #092D32; line-height: 1.2; margin-bottom: 3px; max-height: 24px; overflow: hidden; }
    .nisn { font-size: 8px; font-weight: 700; color: #64748B; font-family: monospace; }
    .id-foot { background: #092D32; color: #fff; font-size: 7px; font-family: monospace; font-weight: 800; padding: 4px 8px; display: flex; justify-content: space-between; }
    .id-foot span:first-child { color: #FFDD00; }
    .id-foot span:last-child { color: #34d399; }
  </style>
</head>
<body>
  <div class="page-title">
    <h2>LEMBAR ID CARD KONTINGEN RESMI — GERANAT 2026</h2>
    <p>${detectedSchoolName} · Cetak pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
  </div>
  <div class="grid">${cardsHtml}</div>
</body>
</html>`;

  printHtmlDocument(html);
}

export function printScoringRecapPdf({
  detectedSchoolName,
  portalData,
  juryNameInput,
  nomorUrutInput,
  scoringSummary,
  GERANAT_SCORING_GROUPS,
}) {
  const groupsHtml = GERANAT_SCORING_GROUPS.map((g) => {
    const rows = g.criteria
      .map((c) => {
        const val = portalData?.scores?.[c.id];
        const hasVal = val !== undefined && val !== null;
        return `
        <tr>
          <td>${c.name}</td>
          <td style="text-align:center;">${c.max}</td>
          <td style="text-align:center; font-weight:bold;">${hasVal ? String(val) : '-'}</td>
        </tr>`;
      })
      .join('');

    return `
      <table class="score-table">
        <thead>
          <tr>
            <th style="width:70%;">${g.name}</th>
            <th style="width:15%; text-align:center;">Maks</th>
            <th style="width:15%; text-align:center;">Nilai</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr class="total-row">
            <td><strong>Subtotal ${g.short}</strong></td>
            <td style="text-align:center;"><strong>${scoringSummary.groups[g.id].max}</strong></td>
            <td style="text-align:center;"><strong>${scoringSummary.groups[g.id].subtotal}</strong></td>
          </tr>
        </tbody>
      </table>
    `;
  }).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Rekapitulasi Nilai Juri - ${detectedSchoolName}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 11px; color: #092D32; line-height: 1.4; margin: 0; padding: 0; }
    .head { text-align: center; border-bottom: 2px solid #006569; padding-bottom: 8px; margin-bottom: 12px; }
    .head h1 { font-size: 14px; font-weight: 900; margin-bottom: 3px; }
    .head h2 { font-size: 10px; font-weight: 700; color: #006569; margin: 0; }
    .meta { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
    .meta td { padding: 4px 6px; border: 1px solid #cbd5e1; }
    .score-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; page-break-inside: avoid; }
    .score-table th, .score-table td { border: 1px solid #092D32; padding: 5px 8px; }
    .score-table th { background: #006569; color: #fff; text-align: left; }
    .total-row { background: #F5F8F6; }
  </style>
</head>
<body>
  <div class="head">
    <h1>BLANKO REKAPITULASI PENILAIAN PESERTA LOMBA</h1>
    <h2>GERAKAN PASKIBRA SEMANGAT (GERANAT) — MENWA SATUAN UNJ</h2>
  </div>
  <table class="meta">
    <tr><td style="width:180px;">Nama Tim / Sekolah</td><td>${detectedSchoolName}</td></tr>
    <tr><td>Nama Juri</td><td>${portalData?.juryName || juryNameInput || 'Dewan Juri Mako'}</td></tr>
    <tr><td>No. Urut Peserta</td><td>${portalData?.nomorUrut || nomorUrutInput || '-'}</td></tr>
    <tr><td>Total Nilai Akhir</td><td><strong>${scoringSummary.finalScore} / ${scoringSummary.totalMax}</strong> (Kotor: ${scoringSummary.totalGross}, Pengurangan: -${scoringSummary.totalPenalty}, Penambahan: +${scoringSummary.totalBonus})</td></tr>
  </table>
  ${groupsHtml}
</body>
</html>`;

  printHtmlDocument(html);
}
