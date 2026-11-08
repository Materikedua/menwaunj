import {
  LayoutGrid,
  Building2,
  FileText,
  Users,
  Calendar,
  Award,
  HelpCircle,
} from 'lucide-react';

export function getDockItems(progress = {}, scoringSummary = {}) {
  const p = progress || {};
  const s = scoringSummary || {};

  const overall = p.overallPct ?? p.overallPercentage ?? 0;
  const profil = p.profilPct ?? 0;
  const berkasCount = p.berkasCount ?? 0;
  const berkasPct = p.berkasPct ?? 0;
  const biodataCount = p.biodataCount ?? 0;
  const biodataPct = p.biodataPct ?? 0;
  const finalScore = s.finalScore ?? 0;

  return [
    { id: 'beranda', label: 'Beranda Kontingen', icon: LayoutGrid, badge: `${overall}%`, pct: overall },
    { id: 'profil', label: 'Profil Sekolah', icon: Building2, badge: `${profil}%`, pct: profil },
    { id: 'pemberkasan', label: 'Pemberkasan', icon: FileText, badge: `${berkasCount}/5`, pct: berkasPct },
    { id: 'biodata', label: 'Biodata Pasukan', icon: Users, badge: `${biodataCount}/20`, pct: biodataPct },
    { id: 'timeline', label: 'Timeline Acara', icon: Calendar, badge: '6 Tahap' },
    { id: 'penilaian', label: 'Rekap Nilai Juri', icon: Award, badge: finalScore > 0 ? `${finalScore} Poin` : 'Tertutup' },
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

