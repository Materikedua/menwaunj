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
  if (!portal) return 0;
  let score = 0;
  const maxScore = 100;

  // Profil sekolah: 25 poin
  const p = portal.schoolProfile || {};
  if (p.schoolName && p.schoolName.trim()) score += 5;
  if (p.address && p.address.trim()) score += 5;
  if (p.headmasterName && p.headmasterName.trim()) score += 5;
  if (p.picName && p.picName.trim()) score += 5;
  if (p.picPhone && p.picPhone.trim()) score += 5;

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
    if (docs[key]?.url) score += 5;
  });

  // Biodata Pasukan: 25 poin (minimal 10 anggota @ 2.5 poin)
  const pasukan = portal.pasukanList || [];
  score += Math.min(25, pasukan.length * 2.5);

  // Biodata Official: 20 poin (minimal 2 official @ 10 poin)
  const officials = portal.officialList || [];
  score += Math.min(20, officials.length * 10);

  return Math.min(maxScore, Math.round(score));
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

