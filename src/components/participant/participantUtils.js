import { GERANAT_SCORING_GROUPS } from '../../data/geranatScoringData.js';

export function validateImageFile(file) {
  if (!file) return { valid: false, error: 'File tidak ditemukan' };
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP.',
    };
  }
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Ukuran file melebihi batas 2MB. Silakan kompres foto Anda.',
    };
  }
  return { valid: true };
}

export function computePortalProgress(portal) {
  if (!portal) return { overallPercentage: 0 };
  let score = 0;
  const maxScore = 100;

  // Profil sekolah: 25 poin
  const p = portal.schoolProfile || {};
  if (p.schoolName && p.schoolName.trim()) score += 5;
  if (p.jalan && p.jalan.trim()) score += 5;
  if (p.kelurahan || p.kecamatan) score += 5;
  if (p.kabupatenKota) score += 5;
  if (p.provinsi) score += 5;

  // Pemberkasan: 30 poin (6 dokumen wajib @ 5 poin)
  const docs = portal.documents || {};
  const docKeys = [
    'suratTugas',
    'rekomendasiKepsek',
    'kesediaanTaatAturan',
    'buktiBayar',
    'izinOrtuKolektif',
    'kartuPelajarKolektif',
  ];
  docKeys.forEach((key) => {
    if (docs[key]?.url || docs[key]?.fileDataUrl) score += 5;
  });

  // Biodata Pasukan: 25 poin (minimal 10 anggota @ 2.5 poin)
  const pasukan = portal.pasukanList || [];
  score += Math.min(25, pasukan.length * 2.5);

  // Biodata Official: 20 poin (minimal 2 official @ 10 poin)
  const officials = portal.officialList || [];
  score += Math.min(20, officials.length * 10);

  const overallPercentage = Math.min(maxScore, Math.round(score));
  return { overallPercentage };
}

export function calculateScoringSummary(portalData) {
  const scores = portalData?.scores || {};
  const penalties = portalData?.penalties || {};
  const bonuses = portalData?.bonuses || {};
  let totalGross = 0;
  let totalMax = 0;
  const groupTotals = {};

  GERANAT_SCORING_GROUPS.forEach((group) => {
    let gSum = 0;
    let gScoredCount = 0;
    group.aspects.forEach((asp) => {
      const val = scores[asp.id];
      if (val !== undefined && val !== null && val !== '') {
        gSum += Number(val);
        gScoredCount += 1;
      }
    });
    groupTotals[group.id] = {
      sum: gSum,
      max: group.maxTotal,
      scoredCount: gScoredCount,
    };
    totalGross += gSum;
    totalMax += group.maxTotal;
  });

  const totalPenalty = Object.values(penalties).reduce((acc, v) => acc + (Number(v) || 0), 0);
  const totalBonus = Object.values(bonuses).reduce((acc, v) => acc + (Number(v) || 0), 0);
  const finalScore = totalGross - totalPenalty + totalBonus;

  return {
    groupTotals,
    totalGross,
    totalMax,
    totalPenalty,
    totalBonus,
    finalScore,
  };
}

export function downloadScoringCsv({ portalData, detectedSchoolName, nomorUrutInput, juryNameInput, activeSlug }) {
  const scores = portalData?.scores || {};
  const rows = [
    ['BLANKO REKAPITULASI PENILAIAN PESERTA LOMBA GERANAT'],
    ['Nama Tim / Sekolah', detectedSchoolName || '-'],
    ['Nomor Urut Peserta', portalData?.nomorUrut || nomorUrutInput || '-'],
    ['Nama Juri', portalData?.juryName || juryNameInput || 'Dewan Juri Mako Menwa UNJ'],
    [],
    ['Kelompok', 'No', 'Aspek Penilaian', 'Skor', 'Maksimal'],
  ];

  GERANAT_SCORING_GROUPS.forEach((g) => {
    g.aspects.forEach((asp) => {
      rows.push([g.title, String(asp.no), asp.name, String(scores[asp.id] ?? ''), String(asp.max)]);
    });
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Rekap_Nilai_${activeSlug || 'geranat'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printHtmlDocument(htmlContent) {
  const win = window.open('', '_blank');
  if (!win) {
    alert('Popup diblokir oleh peramban. Izinkan popup untuk mencetak dokumen.');
    return;
  }
  win.document.write(htmlContent);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 350);
}

