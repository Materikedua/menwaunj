/**
 * OfficialBukuPasukanGenerator.js
 * Modul Generator Buku Pasukan Kontingen Format Standar Cetak A4
 * Untuk Keperluan Verifikasi Registrasi Ulang, Technical Meeting, dan Dewan Juri GERANAT VII 2026
 */

export function generateBukuPasukanHtml(portalData) {
  if (!portalData) return '';

  const sp = portalData.schoolProfile || {};
  const schoolName = sp.schoolName || portalData.schoolName || 'KONTINGEN SEKOLAH';
  const schoolLogo = sp.logoDataUrl || '';
  const nomorUrut = portalData.nomorUrut || 'KONTINGEN-01';
  const whatsapp = portalData.whatsappNumber || '-';
  const alamat = [
    sp.jalan,
    sp.rtRw ? `RT/RW ${sp.rtRw}` : '',
    sp.kelurahan ? `Kel. ${sp.kelurahan}` : '',
    sp.kecamatan ? `Kec. ${sp.kecamatan}` : '',
    sp.kabupatenKota,
    sp.provinsi,
  ]
    .filter(Boolean)
    .join(', ') || 'Alamat belum dilengkapi';

  const pasukanList = Array.isArray(portalData.pasukanList) ? portalData.pasukanList : [];
  const officialList = Array.isArray(portalData.officialList) ? portalData.officialList : [];

  const fullPasukanRows = [];
  for (let i = 0; i < 18; i++) {
    const item = pasukanList[i] || null;
    let defaultRole = 'Pasukan Inti';
    if (i === 0) defaultRole = 'Komandan Peleton (Danton)';
    else if (i === 1) defaultRole = 'Pengibar / Baki 1';
    else if (i === 2) defaultRole = 'Pengibar / Baki 2';
    else if (i >= 16) defaultRole = `Pasukan Cadangan ${i - 15}`;

    fullPasukanRows.push({
      no: i + 1,
      name: item?.fullName || '-',
      position: item?.position || defaultRole,
      nisn: item?.nisn || '-',
      photo: item?.photoDataUrl || '',
      isFilled: Boolean(item?.fullName),
    });
  }

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Buku Pasukan Resmi - ${schoolName} - GERANAT VII 2026</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 15mm 15mm 15mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; color: #111827; background: #ffffff; margin: 0; padding: 0; font-size: 11pt; line-height: 1.35; }
    .kop-wrapper { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px double #006569; padding-bottom: 8px; margin-bottom: 14px; }
    .kop-logo-menwa { width: 72px; height: 72px; object-fit: contain; }
    .kop-center { text-align: center; flex: 1; padding: 0 10px; }
    .kop-center h4 { margin: 0; font-size: 10.5pt; font-weight: 800; letter-spacing: 0.5px; color: #092D32; }
    .kop-center h3 { margin: 2px 0; font-size: 12pt; font-weight: 900; letter-spacing: 0.5px; color: #006569; }
    .kop-center h2 { margin: 2px 0; font-size: 13.5pt; font-weight: 900; letter-spacing: 1px; color: #092D32; }
    .kop-center p { margin: 2px 0 0 0; font-size: 7.5pt; color: #4B5563; line-height: 1.25; }
    .kop-logo-school { width: 70px; height: 70px; object-fit: contain; border-radius: 8px; }
    .logo-placeholder { width: 70px; height: 70px; border: 1px dashed #9CA3AF; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 7pt; color: #9CA3AF; text-align: center; padding: 4px; }
    .doc-title { text-align: center; margin: 10px 0 14px 0; }
    .doc-title h1 { margin: 0; font-size: 13pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.8px; color: #006569; }
    .doc-title p { margin: 3px 0 0 0; font-size: 9pt; font-weight: bold; color: #374151; }
    .kontingen-box { border: 1.5px solid #006569; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; background-color: #F8FAF9; display: grid; grid-template-columns: 2fr 1fr; gap: 10px; font-size: 9pt; }
    .kontingen-box table { width: 100%; border-collapse: collapse; }
    .kontingen-box td { padding: 2px 4px; vertical-align: top; }
    .kontingen-box td.label { width: 110px; font-weight: bold; color: #4B5563; }
    .kontingen-box td.val { font-weight: 800; color: #111827; }
    .badge-nomor { display: inline-block; background: #006569; color: #FFDD00; font-weight: 900; font-size: 9.5pt; padding: 4px 10px; border-radius: 4px; text-align: center; }
    .section-head { background: #092D32; color: #ffffff; padding: 4px 8px; font-size: 9pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; margin: 12px 0 6px 0; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; }
    table.data-table { width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 10px; }
    table.data-table th, table.data-table td { border: 1px solid #D1D5DB; padding: 4px 6px; text-align: left; vertical-align: middle; }
    table.data-table th { background: #E5E7EB; font-weight: 900; color: #111827; text-transform: uppercase; font-size: 8pt; text-align: center; }
    table.data-table tr:nth-child(even) { background-color: #F9FAFB; }
    .col-no { width: 28px; text-align: center; font-weight: bold; }
    .col-foto { width: 44px; text-align: center; }
    .col-nisn { width: 100px; font-family: monospace; font-weight: bold; }
    .col-posisi { width: 150px; font-weight: bold; }
    .foto-box { width: 36px; height: 48px; border: 1px solid #9CA3AF; border-radius: 3px; margin: 0 auto; object-fit: cover; display: block; background: #F3F4F6; }
    .foto-empty { width: 36px; height: 48px; border: 1px dashed #CBD5E1; border-radius: 3px; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 6pt; color: #9CA3AF; text-align: center; line-height: 1; }
    .official-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
    .official-card { border: 1px solid #D1D5DB; border-radius: 6px; padding: 6px 10px; display: flex; align-items: center; gap: 10px; background: #FDFDFD; }
    .official-foto { width: 44px; height: 56px; border: 1px solid #9CA3AF; border-radius: 4px; object-fit: cover; }
    .official-info h5 { margin: 0; font-size: 9.5pt; font-weight: 900; color: #092D32; }
    .official-info p { margin: 2px 0 0 0; font-size: 8pt; color: #4B5563; }
    .ttd-section { margin-top: 14px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; text-align: center; font-size: 8.5pt; page-break-inside: avoid; }
    .ttd-box { padding: 6px; }
    .ttd-box .role { font-weight: bold; color: #374151; min-height: 28px; }
    .ttd-box .space { height: 55px; display: flex; align-items: center; justify-content: center; position: relative; }
    .ttd-box .name { font-weight: 900; text-decoration: underline; color: #111827; }
    .ttd-box .nip { font-size: 7.5pt; color: #6B7280; }
    .stempel-menwa { width: 58px; opacity: 0.75; position: absolute; }
    .doc-footer { border-top: 1px solid #D1D5DB; margin-top: 12px; padding-top: 4px; display: flex; justify-content: space-between; font-size: 7pt; color: #6B7280; }
  </style>
</head>
<body>
  <div class="kop-wrapper">
    <img src="/logo-menwa-unj.png" alt="Logo Menwa UNJ" class="kop-logo-menwa" onerror="this.style.display='none'" />
    <div class="kop-center">
      <h4>KOMANDO RESIMEN MAHASISWA JAYAKARTA</h4>
      <h3>SATUAN UNIVERSITAS NEGERI JAKARTA</h3>
      <h2>PANITIA PELAKSANA GERANAT VII 2026</h2>
      <p>Gedung Menwa UNJ, Kampus A Universitas Negeri Jakarta, Jl. Rawamangun Muka, Jakarta Timur 13220<br/>
      Telepon / WhatsApp: 0852-1325-1025 • Email: unjmenwa@gmail.com • Laman: menwaunj.or.id</p>
    </div>
    ${schoolLogo ? `<img src="${schoolLogo}" alt="Logo Sekolah" class="kop-logo-school" />` : `<div class="logo-placeholder">LOGO SEKOLAH</div>`}
  </div>

  <div class="doc-title">
    <h1>BUKU REKAPITULASI DAFTAR PASUKAN &amp; OFFICIAL RESMI</h1>
    <p>GERANAT VII TINGKAT NASIONAL TAHUN 2026 — UNIVERSITAS NEGERI JAKARTA</p>
  </div>

  <div class="kontingen-box">
    <div>
      <table>
        <tr><td class="label">Nama Kontingen</td><td class="val">: ${schoolName}</td></tr>
        <tr><td class="label">Alamat Sekolah</td><td class="val">: ${alamat}</td></tr>
        <tr><td class="label">Subdomain Resmi</td><td class="val">: /official/${portalData.schoolSlug || 'sekolah'}</td></tr>
        <tr><td class="label">Kontak Official</td><td class="val">: +62 ${whatsapp}</td></tr>
      </table>
    </div>
    <div style="text-align: right; display: flex; flex-direction: column; justify-content: center; align-items: flex-end;">
      <span style="font-size: 8pt; font-weight: bold; color: #4B5563; margin-bottom: 2px;">NOMOR PESERTA / UNDIAN:</span>
      <div class="badge-nomor">${nomorUrut}</div>
      <span style="font-size: 7pt; color: #059669; font-weight: 800; margin-top: 4px;">TERVERIFIKASI MAKO UNJ</span>
    </div>
  </div>

  <div class="section-head">
    <span>I. DATA OFFICIAL &amp; PELATIH PENDAMPING (MAKSIMAL 2 ORANG)</span>
    <span>STATUS: ${officialList.length}/2 TERDAFTAR</span>
  </div>

  <div class="official-grid">
    ${[0, 1]
      .map((idx) => {
        const off = officialList[idx];
        const defaultTitle = idx === 0 ? 'Official 1 / Pelatih Utama' : 'Official 2 / Pendamping';
        return `
          <div class="official-card">
            ${
              off?.photoDataUrl
                ? `<img src="${off.photoDataUrl}" alt="${off.fullName}" class="official-foto" />`
                : `<div class="official-foto" style="display:flex;align-items:center;justify-content:center;background:#F3F4F6;color:#9CA3AF;font-size:6pt;text-align:center;">PAS FOTO 4x6</div>`
            }
            <div class="official-info">
              <h5>${off?.fullName || `[ Belum Terdaftar: ${defaultTitle} ]`}</h5>
              <p><strong>Jabatan:</strong> ${off?.position || defaultTitle}</p>
              <p><strong>Nomor Kontak:</strong> ${whatsapp || '-'}</p>
            </div>
          </div>
        `;
      })
      .join('')}
  </div>

  <div class="section-head">
    <span>II. DAFTAR SUSUNAN PASUKAN PELETON (16 INTI + 2 CADANGAN)</span>
    <span>TOTAL: ${pasukanList.length}/18 PERSONEL</span>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th class="col-no">No</th>
        <th class="col-foto">Foto</th>
        <th>Nama Lengkap Siswa</th>
        <th class="col-nisn">NISN</th>
        <th class="col-posisi">Posisi / Jabatan</th>
        <th style="width: 80px; text-align: center;">Paraf Panitia</th>
      </tr>
    </thead>
    <tbody>
      ${fullPasukanRows
        .map((row) => `
          <tr>
            <td class="col-no">${row.no}</td>
            <td class="col-foto">
              ${row.photo ? `<img src="${row.photo}" alt="${row.name}" class="foto-box" />` : `<div class="foto-empty">Foto<br/>3x4</div>`}
            </td>
            <td><strong style="color: ${row.isFilled ? '#111827' : '#9CA3AF'}; font-size: 9pt;">${row.name}</strong></td>
            <td class="col-nisn">${row.nisn}</td>
            <td class="col-posisi">
              <span style="display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 7.5pt; font-weight: bold; background: ${
                row.no === 1 ? '#FEF3C7; color: #92400E;' : row.no >= 17 ? '#FEE2E2; color: #991B1B;' : '#E0F2FE; color: #075985;'
              }">${row.position}</span>
            </td>
            <td style="text-align: center;"><span style="font-size: 7pt; color: #D1D5DB;">[ &nbsp; &nbsp; &nbsp; ]</span></td>
          </tr>
        `)
        .join('')}
    </tbody>
  </table>

  <div class="ttd-section">
    <div class="ttd-box">
      <div class="role">Official / Pelatih Kontingen<br/>${schoolName}</div>
      <div class="space"></div>
      <div class="name">${officialList[0]?.fullName || '( ............................................... )'}</div>
      <div class="nip">Tanda Tangan &amp; Nama Terang</div>
    </div>
    <div class="ttd-box">
      <div class="role">Ketua Pelaksana<br/>GERANAT VII 2026 UNJ</div>
      <div class="space"></div>
      <div class="name">Satgas GERANAT VII UNJ</div>
      <div class="nip">NTA. Satuan Menwa UNJ</div>
    </div>
    <div class="ttd-box">
      <div class="role">Mengetahui,<br/>Komandan Resimen Mahasiswa Satuan UNJ</div>
      <div class="space">
        <img src="/logo-menwa-unj.png" alt="Stempel Dinas Menwa UNJ" class="stempel-menwa" onerror="this.style.display='none'" />
      </div>
      <div class="name">Komandan Satuan Menwa UNJ</div>
      <div class="nip">Widya Castrena Dharma Siddha</div>
    </div>
  </div>

  <div class="doc-footer">
    <span>Dicetak secara resmi melalui Portal Official: <strong>menwaunj.or.id/official/${portalData.schoolSlug || 'sekolah'}</strong></span>
    <span>Tanggal Cetak: ${currentDateStr}</span>
    <span>Lembar Sah Verifikasi Registrasi Dokumen &amp; Tim</span>
  </div>
</body>
</html>`;
}