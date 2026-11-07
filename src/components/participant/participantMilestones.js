import {
  LayoutGrid,
  Building2,
  FileText,
  Users,
  Calendar,
  Award,
  HelpCircle,
} from 'lucide-react';

export function getDockItems(progress, scoringSummary) {
  return [
    { id: 'beranda', label: 'Beranda Kontingen', icon: LayoutGrid, badge: `${progress.overallPct}%` },
    { id: 'profil', label: 'Profil Sekolah', icon: Building2, badge: `${progress.profilPct}%`, pct: progress.profilPct },
    { id: 'pemberkasan', label: 'Pemberkasan', icon: FileText, badge: `${progress.berkasCount}/5`, pct: progress.berkasPct },
    { id: 'biodata', label: 'Biodata Pasukan', icon: Users, badge: `${progress.biodataCount}/20`, pct: progress.biodataPct },
    { id: 'timeline', label: 'Timeline Acara', icon: Calendar, badge: '6 Tahap', pct: progress.timelinePct },
    { id: 'penilaian', label: 'Rekap Nilai Juri', icon: Award, badge: `${scoringSummary.finalScore}`, pct: progress.penilaianPct },
    { id: 'bantuan', label: 'Bantuan & Juknis', icon: HelpCircle, badge: 'Siaga 24/7' },
  ];
}

export function getAdminMilestones(portalData) {
  const docMap = portalData?.documents || {};
  const sp = portalData?.schoolProfile || {};
  const hasLogoAndAddress = Boolean(sp.logoDataUrl && sp.jalan && sp.kabupatenKota);
  const hasAllNisn = (portalData?.pasukanList || []).length >= 16;

  return [
    { id: 'm1', step: 1, label: 'Profil & Logo', done: hasLogoAndAddress },
    { id: 'm2', step: 2, label: 'Formulir', done: Boolean(docMap['formulir-pendaftaran']) },
    { id: 'm3', step: 3, label: 'Foto Pasukan', done: Boolean(docMap['foto-pasukan']) },
    { id: 'm4', step: 4, label: 'Profil Danton', done: Boolean(docMap['profil-danton']) },
    { id: 'm5', step: 5, label: 'Surat Sekolah', done: Boolean(docMap['surat-keterangan-sekolah']) },
    { id: 'm6', step: 6, label: 'Bukti Bayar', done: Boolean(docMap['bukti-pendaftaran']) },
    { id: 'm7', step: 7, label: 'NISN & Roster', done: hasAllNisn },
  ];
}

