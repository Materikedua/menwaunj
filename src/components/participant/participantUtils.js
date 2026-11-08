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
  if (!portal) {
    return {
      overallPercentage: 0,
      overallPct: 0,
      profilPct: 0,
      berkasCount: 0,
      berkasPct: 0,
      pasukanCount: 0,
      officialCount: 0,
      biodataCount: 0,
      biodataPct: 0,
      timelineCount: 6,
      timelinePct: 100,
      scoredAspectsCount: 0,
    };
  }

  // 1. Profil Sekolah (Bobot 25 Poin)
  let profilPoints = 0;
  const p = portal.schoolProfile || {};
  if (p.schoolName && p.schoolName.trim()) profilPoints += 5;
  if (p.jalan && p.jalan.trim()) profilPoints += 5;
  if (p.kelurahan || p.kecamatan) profilPoints += 5;
  if (p.kabupatenKota && p.kabupatenKota.trim()) profilPoints += 5;
  if (p.provinsi && p.provinsi.trim()) profilPoints += 5;
  const profilPct = Math.round((profilPoints / 25) * 100);

  // 2. Pemberkasan Persyaratan Juknis (Bobot 35 Poin - 5 Dokumen Wajib)
  const docs = portal.documents || {};
  const docGroups = [
    ['suratTugas', 'surat-tugas', 'suratTugasKolektif'],
    ['rekomendasiKepsek', 'rekomendasi-kepsek', 'rekomendasi'],
    ['kesediaanTaatAturan', 'kesediaan-taat-aturan', 'pernyataan'],
    ['buktiBayar', 'bukti-bayar', 'bukti-pendaftaran', 'buktiPembayaran'],
    ['izinOrtuKolektif', 'izin-ortu', 'kartuPelajarKolektif', 'kartu-pelajar'],
  ];

  let berkasCount = 0;
  docGroups.forEach((aliases) => {
    const isUploaded = aliases.some(
      (key) => docs[key]?.url || docs[key]?.fileDataUrl || docs[key]?.fileName
    );
    if (isUploaded) berkasCount += 1;
  });
  const berkasPct = Math.min(100, Math.round((berkasCount / 5) * 100));
  const berkasPoints = (berkasCount / 5) * 35;

  // 3. Biodata Personel Tim (Bobot 40 Poin - Kuota 18 Pasukan + 2 Official = 20 Personel)
  const pasukan = portal.pasukanList || [];
  const officials = portal.officialList || [];
  const pasukanCount = pasukan.length;
  const officialCount = officials.length;
  const biodataCount = Math.min(20, pasukanCount + officialCount);
  const biodataPct = Math.min(100, Math.round((biodataCount / 20) * 100));
  const biodataPoints = (biodataCount / 20) * 40;

  // Skor aspek penilaian juri yang sudah terisi
  const scores = portal.scores || {};
  const scoredAspectsCount = Object.keys(scores).filter(
    (k) => scores[k] !== undefined && scores[k] !== null && scores[k] !== ''
  ).length;

  // Total Kelengkapan Kontingen Resmi (Maks 100% - Timeline TIDAK dihitung)
  const totalScore = profilPoints + berkasPoints + biodataPoints;
  const overallPct = Math.min(100, Math.round(totalScore));

  return {
    overallPercentage: overallPct,
    overallPct,
    profilPct,
    berkasCount,
    berkasPct,
    pasukanCount,
    officialCount,
    biodataCount,
    biodataPct,
    timelineCount: 6,
    timelinePct: 100,
    scoredAspectsCount,
  };
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

