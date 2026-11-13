import test from 'node:test';
import assert from 'node:assert/strict';
import {
  UNIT_METRICS,
  DEFAULT_SITE_CONTENT,
  ROLE_NAVIGATION_MATRIX,
  MAKO_CENTER_COORDS,
  TACTICAL_OPERATION_NODES,
  verifyCertificateById,
  createAdminuTicket,
  updateAdminuTicketStatus,
  findAdminuTicketByCode,
  getSiteContent,
  upsertCmsItem,
  deleteCmsItem,
  exportSiteContentJson,
  importSiteContentJson,
  resetSiteContentToDefault,
  createCmsAdapter,
  registerSiteConfigCloudBridge,
  applyRemoteSiteContent,
  applyRemoteAdminuTickets,
} from './siteConfig';
import type { StorageLike } from '../utils/security';

function createMockStorage(): StorageLike {
  const store = new Map<string, string>();
  return {
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    setItem: (key, val) => {
      store.set(key, String(val));
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
}

test('UNIT_METRICS provides cumulative unit figures without inflated single-cohort claims', () => {
  const displays = UNIT_METRICS.map((m) => m.displayValue);
  assert.deepEqual(displays, [
    '50+ Anggota Aktif',
    '12 Program Kerja/Tahun',
    '8 Edisi Kompetisi Nasional',
    '1.000+ Penerima Manfaat Pengabdian',
  ]);
});

test('DEFAULT_SITE_CONTENT synchronizes KC VIII, Youth Spark, and GERANAT VII schedules across sections', () => {
  const kcProgram = DEFAULT_SITE_CONTENT.programs.find((p) => p.id === 'PROG-KC-VIII');
  assert.ok(kcProgram);
  assert.equal(kcProgram.date, 'Awal Desember 2026');
  assert.ok(kcProgram.status.includes('B-159/Sat-UNJ/XI/2026'));

  const ysProgram = DEFAULT_SITE_CONTENT.programs.find((p) => p.id === 'PROG-YOUTH-SPARK');
  assert.ok(ysProgram);
  assert.equal(ysProgram.date, '24 Oktober 2026');
  assert.ok(ysProgram.status.includes('Telah Terlaksana'));

  const grnProgram = DEFAULT_SITE_CONTENT.programs.find((p) => p.id === 'PROG-GERANAT-VII');
  assert.ok(grnProgram);
  assert.equal(grnProgram.date, '19–20 Desember 2026');
  assert.ok(grnProgram.status.includes('Pendaftaran Dibuka'));

  assert.equal(ROLE_NAVIGATION_MATRIX.length, 3);
  const allRoleProgIds = ROLE_NAVIGATION_MATRIX.flatMap((r) => r.programIds);
  // Zero duplicate program assignments across role tracks
  assert.equal(new Set(allRoleProgIds).size, allRoleProgIds.length);
});

test('Tactical Operation Map coordinates center on Rawamangun Mako and include Cianjur, Karawang, and Padang', () => {
  assert.equal(MAKO_CENTER_COORDS.lat, -6.1944);
  assert.equal(MAKO_CENTER_COORDS.lng, 106.8794);
  const nodeIds = TACTICAL_OPERATION_NODES.map((n) => n.id);
  assert.ok(nodeIds.includes('NODE-MAKO-UNJ'));
  assert.ok(nodeIds.includes('NODE-OPS-CIANJUR'));
  assert.ok(nodeIds.includes('NODE-OPS-KARAWANG'));
  assert.ok(nodeIds.includes('NODE-OPS-PADANG'));
});

test('verifyCertificateById resolves valid certificate IDs and decree numbers and rejects forged codes', () => {
  const grn = verifyCertificateById('  cert-grn7-2026-014 ');
  assert.ok(grn);
  assert.equal(grn.status, 'SAH_TERVERIFIKASI');
  assert.equal(grn.institution, 'SMA Negeri 8 Jakarta');

  const byDecree = verifyCertificateById('SERT/088/YSP-DISPORA/SAT-UNJ/X/2026');
  assert.ok(byDecree);
  assert.equal(byDecree.recipientName, 'Aulia Asharany Jasmine');

  assert.equal(verifyCertificateById('CERT-PALSU-9999'), null);
});

test('Smart Adminu creates sequential PAM-2026-XXX tickets, sanitizes XSS, updates disposition, and resolves by code', () => {
  const storage = createMockStorage();
  const created = createAdminuTicket(
    {
      applicantName: 'BEM Fakultas Ilmu Pendidikan <script>alert(1)</script>',
      institution: 'Universitas Negeri Jakarta',
      contactPhone: '081299887766',
      contactEmail: 'bemfip@unj.ac.id',
      serviceCategory: 'PAM_KEGIATAN',
      serviceLabel: 'Permohonan Personel Pengamanan Kegiatan (PAM)',
      eventName: 'Seminar Pendidikan Nasional FIP',
      eventDate: '2026-12-15',
      eventLocation: 'Aula Bung Hatta UNJ',
      personnelRequested: 6,
      notes: 'Pengamanan pintu utama & tamu VIP',
    },
    storage
  );

  assert.equal(created.ticketId, 'PAM-2026-104');
  assert.equal(created.applicantName.includes('<script'), false);
  assert.equal(created.status, 'DITERIMA');

  const lookedUp = findAdminuTicketByCode('pam-2026-104', storage);
  assert.ok(lookedUp);
  assert.equal(lookedUp.eventName, 'Seminar Pendidikan Nasional FIP');

  updateAdminuTicketStatus(
    'PAM-2026-104',
    'PERSONEL_DITUGASKAN',
    '6 personel Pokpas ditugaskan oleh Kasi Ops.',
    storage
  );
  const updated = findAdminuTicketByCode('PAM-2026-104', storage);
  assert.ok(updated);
  assert.equal(updated.status, 'PERSONEL_DITUGASKAN');
  assert.equal(updated.statusNote, '6 personel Pokpas ditugaskan oleh Kasi Ops.');
});

test('Full-Edit CMS supports CRUD with XSS sanitization, JSON Export/Import, and factory reset', () => {
  const storage = createMockStorage();

  // Create new item in sorotanGiat with XSS attempt
  const afterCreate = upsertCmsItem(
    'sorotanGiat',
    {
      id: 'GIAT-TEST-99',
      title: 'Apel Siaga <img src=x onerror=alert(1)> Gabungan',
      description: 'Latihan kesiapsiagaan satuan.',
      tag: 'Operasi',
      date: 'Desember 2026',
      location: 'Kampus A UNJ',
      status: 'Siaga',
      image: 'javascript:bad()',
      route: '/mako',
    },
    'Dansat UNJ',
    storage
  );

  const inserted = afterCreate.sorotanGiat.find((g) => g.id === 'GIAT-TEST-99');
  assert.ok(inserted);
  assert.equal(inserted.title, 'Apel Siaga  Gabungan');
  assert.equal(inserted.image, '/foto-kampus-unj.jpg');

  // Update existing item
  upsertCmsItem(
    'sorotanGiat',
    {
      ...inserted,
      title: 'Apel Siaga Gabungan Jayakarta',
    },
    'Dansat UNJ',
    storage
  );
  assert.equal(
    getSiteContent(storage).sorotanGiat.find((g) => g.id === 'GIAT-TEST-99')?.title,
    'Apel Siaga Gabungan Jayakarta'
  );

  // Export & Import into fresh storage
  const exportedJson = exportSiteContentJson(storage);
  const secondStorage = createMockStorage();
  const importRes = importSiteContentJson(exportedJson, 'Admin Impor', secondStorage);
  assert.equal(importRes.ok, true);
  assert.ok(
    getSiteContent(secondStorage).sorotanGiat.some(
      (g) => g.title === 'Apel Siaga Gabungan Jayakarta'
    )
  );

  // Reject malformed JSON import
  const badImport = importSiteContentJson('{broken-json', 'Admin Impor', secondStorage);
  assert.equal(badImport.ok, false);

  // Delete item & reset to default
  const afterDelete = deleteCmsItem('sorotanGiat', 'GIAT-TEST-99', 'Dansat UNJ', storage);
  assert.equal(
    afterDelete.sorotanGiat.some((g) => g.id === 'GIAT-TEST-99'),
    false
  );

  const reset = resetSiteContentToDefault(storage);
  assert.equal(reset.heroScenes.length, DEFAULT_SITE_CONTENT.heroScenes.length);
});

test('Firebase CMS cloud bridge adapter reports firebase-hybrid and invokes sync callbacks cleanly', async () => {
  const storage = createMockStorage();
  const adapter = createCmsAdapter(storage);
  assert.equal(adapter.providerName, 'firebase-hybrid');
  assert.equal(adapter.isCloudConfigured, true);

  let syncedCmsCount = 0;
  let createdTicketCount = 0;
  let updatedTicketCount = 0;

  registerSiteConfigCloudBridge({
    async syncCmsToCloud() {
      syncedCmsCount += 1;
      return true;
    },
    async createAdminuTicketInCloud() {
      createdTicketCount += 1;
      return true;
    },
    async updateAdminuTicketInCloud() {
      updatedTicketCount += 1;
      return true;
    },
  });

  try {
    upsertCmsItem(
      'sorotanGiat',
      {
        id: 'GIAT-FB-1',
        title: 'Uji Sinkronisasi Firebase Firestore',
        description: 'Memastikan bridge Firebase terpanggil saat menyimpan.',
        tag: 'Sistem',
        date: 'November 2026',
        location: 'Mako UNJ',
        status: 'Aktif',
      },
      'Admin Uji',
      storage
    );
    assert.equal(syncedCmsCount, 1);

    // applyRemoteSiteContent must hydrate local cache WITHOUT echoing back to syncCmsToCloud
    applyRemoteSiteContent(
      {
        version: '2026.11.remote',
        updatedBy: 'Cloud Sync',
        sorotanGiat: [
          {
            id: 'GIAT-REMOTE-1',
            title: 'Data Remote <script>alert(1)</script> Tervalidasi',
            description: 'Disanitasi otomatis saat sinkronisasi masuk.',
            tag: 'Operasi',
            date: 'Desember 2026',
            location: 'Kampus A UNJ',
            status: 'Terpublikasi',
            image: '/foto-kampus-unj.jpg',
            route: '/',
            featured: true,
          },
        ],
      },
      storage
    );
    assert.equal(syncedCmsCount, 1);
    assert.equal(
      getSiteContent(storage).sorotanGiat[0].title,
      'Data Remote  Tervalidasi'
    );

    const t = createAdminuTicket(
      {
        applicantName: 'Panitia Uji Firebase',
        institution: 'UNJ',
        contactPhone: '081200001111',
        contactEmail: 'uji@unj.ac.id',
        serviceCategory: 'PAM_KEGIATAN',
        serviceLabel: 'Permohonan Personel Pengamanan Kegiatan (PAM)',
        eventName: 'Apel Pengamanan Uji',
        eventDate: '2026-12-20',
        eventLocation: 'Lapangan UNJ',
        personnelRequested: 4,
        notes: 'Pengujian cloud bridge.',
      },
      storage
    );
    assert.equal(createdTicketCount, 1);

    updateAdminuTicketStatus(t.ticketId, 'VERIFIKASI_ADMINU', 'Disposisi uji.', storage);
    assert.equal(updatedTicketCount, 1);

    const merged = applyRemoteAdminuTickets(
      [
        {
          ...t,
          status: 'PERSONEL_DITUGASKAN',
          statusNote: 'Sprin terbit dari Firestore.',
        },
      ],
      storage
    );
    assert.equal(merged.find((x) => x.ticketId === t.ticketId)?.status, 'PERSONEL_DITUGASKAN');
  } finally {
    registerSiteConfigCloudBridge(null);
  }
});
