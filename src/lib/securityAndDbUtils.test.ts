import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  hashOfficialSecurityPin,
  verifyOfficialSecurityPin,
  isOfficialPinConfigured,
  evaluatePinLockout,
  computeNextFailedPinState,
  estimateFirestoreDocBytes,
  sanitizeSubmissionForFirestore,
  buildBoundedCommentUpdate,
  stripHeavyBase64FromSnapshot,
  sanitizeOfficialPortalForFirestore,
} from './securityAndDbUtils.js';
import {
  verifyHmacSignature,
  markTransactionProcessed,
  getVerifiedTransaction,
  markTransactionClaimedPersistent,
} from '../../api/payment-webhook.js';
import { extractSchoolSubdomain, resolveRoutePath } from './router.jsx';

describe('Stage 1: Keamanan Kriptografi PIN & Anti-Brute-Force Lockout', () => {
  it('menghasilkan hash SHA-256 salted per sekolah dan tidak pernah menyimpan PIN plaintext', () => {
    const hashA = hashOfficialSecurityPin('654321', 'sman-1-jakarta');
    const hashB = hashOfficialSecurityPin('654321', 'sman-2-jakarta');

    assert.ok(hashA.startsWith('sha256v2$'));
    assert.notEqual(hashA, '654321');
    assert.notEqual(hashA, hashB, 'PIN yang sama di sekolah berbeda wajib menghasilkan hash berbeda');

    const portalDoc = sanitizeOfficialPortalForFirestore({
      schoolSlug: 'sman-1-jakarta',
      schoolName: 'SMAN 1 Jakarta',
      whatsappNumber: '81234567890',
      securityPin: '654321',
    });

    assert.equal(portalDoc.securityPin, undefined, 'Plaintext securityPin wajib dihapus');
    assert.equal(portalDoc.securityPinHash, hashA);
    assert.equal(isOfficialPinConfigured(portalDoc), true);
    assert.equal(verifyOfficialSecurityPin('654321', portalDoc, 'sman-1-jakarta'), true);
    assert.equal(verifyOfficialSecurityPin('000000', portalDoc, 'sman-1-jakarta'), false);
    assert.equal(verifyOfficialSecurityPin('654321', portalDoc, 'sman-2-jakarta'), false);
  });

  it('menolak PIN yang bukan tepat 6 digit numerik', () => {
    assert.throws(() => hashOfficialSecurityPin('12345', 'sman-1-jakarta'));
    assert.throws(() => hashOfficialSecurityPin('12345a', 'sman-1-jakarta'));
    assert.throws(() => hashOfficialSecurityPin('', 'sman-1-jakarta'));
  });

  it('mencegah bypass lockout meskipun pengguna menghapus localStorage (Server Lockout Enforcement)', () => {
    const now = 1_700_000_000_000;
    const portalWithServerLockout = {
      schoolSlug: 'sman-1-jakarta',
      failedPinAttempts: 5,
      lockoutUntil: now + 300_000, // masih terkunci 5 menit di Firestore
    };

    // Pengguna menghapus localStorage (localLockoutUntil = 0)
    const lockoutStatus = evaluatePinLockout({
      portalData: portalWithServerLockout,
      localLockoutUntil: 0,
      nowMs: now,
    });

    assert.equal(lockoutStatus.isLockedOut, true);
    assert.equal(lockoutStatus.remainingSeconds, 300);

    // Percobaan gagal ke-5 memicu penguncian 10 menit (600 detik)
    const fifthFailure = computeNextFailedPinState({
      portalData: { failedPinAttempts: 4, lockoutUntil: 0 },
      localAttempts: 0,
      nowMs: now,
    });
    assert.equal(fifthFailure.isLockedOut, true);
    assert.equal(fifthFailure.failedPinAttempts, 5);
    assert.equal(fifthFailure.remainingSeconds, 600);
    assert.equal(fifthFailure.lockoutUntil, now + 600_000);
  });
});

describe('Stage 2: Proteksi Batas 1 MiB Firestore, Subkoleksi & Idempotensi Pembayaran', () => {
  it('menghapus documentPdfBase64 dari forms_submissions agar ukuran dokumen selalu jauh di bawah 1 MiB', () => {
    // Simulasi file PDF base64 sebesar 1.4 MB (yang sebelumnya membuat setDoc gagal di Firestore)
    const hugeBase64 = 'data:application/pdf;base64,' + 'A'.repeat(1_400_000);
    const rawForm = {
      submissionId: 'B-001/Web/XI/2026',
      fullName: 'Taruna Menwa UNJ',
      institution: 'Universitas Negeri Jakarta',
      documentPdfName: 'surat_tugas.pdf',
      documentPdfBase64: hugeBase64,
    };

    // Skenario A: Berhasil diunggah ke Firebase Storage
    const sanitizedWithUrl = sanitizeSubmissionForFirestore(
      rawForm,
      'https://firebasestorage.googleapis.com/v0/b/admin-raffli/o/surat_tugas.pdf'
    );
    assert.equal(sanitizedWithUrl.documentPdfBase64, undefined);
    assert.ok(sanitizedWithUrl.documentPdfUrl.includes('firebasestorage'));
    assert.ok(estimateFirestoreDocBytes(sanitizedWithUrl) < 2048);

    // Skenario B: Storage gagal/offline, namun base64 > 650 KB tetap wajib dipangkas agar tidak crash 1 MiB
    const sanitizedOffline = sanitizeSubmissionForFirestore(rawForm, '');
    assert.equal(sanitizedOffline.documentPdfBase64, undefined);
    assert.equal(sanitizedOffline.documentStorageMode, 'oversized_stripped_safe');
    assert.ok(estimateFirestoreDocBytes(sanitizedOffline) < 2048);
  });

  it('membatasi array komentar di dokumen induk maksimal 20 item sambil menyiapkan dokumen subkoleksi', () => {
    const existing25 = Array.from({ length: 25 }, (_, i) => ({
      commentId: `CMT-${i + 1}`,
      author: `User ${i + 1}`,
      text: `Komentar ke-${i + 1}`,
    }));

    const result = buildBoundedCommentUpdate(
      existing25,
      { author: 'Komandan', text: 'Komando! Tetap semangat.' },
      25
    );

    assert.equal(result.parentUpdate.comments.length, 20, 'Preview di dokumen induk wajib dibatasi 20 komentar');
    assert.equal(result.parentUpdate.commentsCount, 26, 'Total counter komentar tetap akurat');
    assert.equal(result.subcollectionDoc.author, 'Komandan');
    assert.equal(result.parentUpdate.comments[19].text, 'Komando! Tetap semangat.');
  });

  it('membersihkan base64 berat dari snapshot cadangan dan membatasi activityLogs maksimal 15 entri', () => {
    const heavyPhoto = 'data:image/webp;base64,' + 'B'.repeat(200_000);
    const rawSnap = {
      pasukanList: [
        {
          name: 'Anggota 1',
          photoDataUrl: heavyPhoto,
          photoDownloadUrl: 'https://storage.googleapis.com/photo1.webp',
        },
      ],
      officialList: [],
      documents: {
        suratTugas: {
          fileName: 'surat.pdf',
          fileDataUrl: heavyPhoto,
          fileDownloadUrl: 'https://storage.googleapis.com/surat.pdf',
        },
      },
    };

    const cleanSnap = stripHeavyBase64FromSnapshot(rawSnap);
    assert.equal(cleanSnap.pasukanList[0].photoDataUrl, 'https://storage.googleapis.com/photo1.webp');
    assert.equal(cleanSnap.documents.suratTugas.fileDataUrl, 'https://storage.googleapis.com/surat.pdf');

    const manyLogs = Array.from({ length: 40 }, (_, i) => ({ action: `ACT_${i}` }));
    const cleanPortal = sanitizeOfficialPortalForFirestore({
      schoolSlug: 'sman-3-jakarta',
      activityLogs: manyLogs,
      snapshotBackup: rawSnap,
    });
    assert.equal(cleanPortal.activityLogs.length, 15);
  });

  it('memverifikasi HMAC SHA-256 dan mencegah double-spending pada transaksi pembayaran', async () => {
    const secret = 'mako-secret-key-2026';
    const payload = '{"txId":"VOTE-TEST-999","amount":5000}';
    const validSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    assert.equal(verifyHmacSignature(payload, validSig, secret), true);
    assert.equal(verifyHmacSignature(payload, 'invalid-signature', secret), false);

    const txId = `VOTE-UNITTEST-${Date.now()}`;
    const firstMark = markTransactionProcessed(txId, { amount: 10000, provider: 'UNIT_TEST' });
    assert.equal(firstMark.alreadyProcessed, false);

    const secondMark = markTransactionProcessed(txId, { amount: 10000, provider: 'UNIT_TEST' });
    assert.equal(secondMark.alreadyProcessed, true);

    assert.ok(getVerifiedTransaction(txId, 10000));
    assert.equal(getVerifiedTransaction(txId, 25000), null, 'Nominal kurang dari tagihan wajib ditolak');

    const firstClaim = await markTransactionClaimedPersistent(txId);
    assert.equal(firstClaim.alreadyClaimed, false);

    const secondClaim = await markTransactionClaimedPersistent(txId);
    assert.equal(secondClaim.alreadyClaimed, true, 'Klaim kedua untuk txId yang sama wajib ditolak (Double-Spend Prevention)');
  });
});

describe('Stage 3: Resolusi Route Beranda Utama vs Subdomain Portal Official', () => {
  it('tidak membajak Beranda utama (/) pada domain Cloud Run, Vercel, Firebase, atau domain utama menwaunj.or.id', () => {
    assert.equal(
      extractSchoolSubdomain('ais-dev-tir77ecisljduum65hfcs2-759807786041.asia-northeast1.run.app'),
      null
    );
    assert.equal(
      extractSchoolSubdomain('ais-pre-tir77ecisljduum65hfcs2-759807786041.asia-northeast1.run.app'),
      null
    );
    assert.equal(extractSchoolSubdomain('menwaunj-git-main.vercel.app'), null);
    assert.equal(extractSchoolSubdomain('ai-studio-menwaunj.web.app'), null);
    assert.equal(extractSchoolSubdomain('menwaunj.or.id'), null);
    assert.equal(extractSchoolSubdomain('www.menwaunj.or.id'), null);
    assert.equal(extractSchoolSubdomain('localhost'), null);

    // Pastikan '/' selalu merender Beranda utama ('/') di semua host tersebut
    assert.equal(
      resolveRoutePath('/', 'ais-dev-tir77ecisljduum65hfcs2-759807786041.asia-northeast1.run.app'),
      '/'
    );
    assert.equal(resolveRoutePath('/', 'menwaunj.or.id'), '/');
  });

  it('tetap mengarahkan subdomain sekolah resmi *.menwaunj.or.id ke /official/<slug>', () => {
    assert.equal(extractSchoolSubdomain('sman1jakarta.menwaunj.or.id'), 'sman1jakarta');
    assert.equal(extractSchoolSubdomain('official.menwaunj.or.id'), 'official');
    assert.equal(resolveRoutePath('/', 'sman1jakarta.menwaunj.or.id'), '/official/sman1jakarta');
    assert.equal(resolveRoutePath('/', 'official.menwaunj.or.id'), '/portal-peserta');
  });
});

