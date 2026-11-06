/**
 * Modul Utilitas Keamanan Kriptografi & Sanitasi Database Firestore (Tahap 1 & Tahap 2)
 * - Hashing PIN Official 6-Digit berbasis Salted SHA-256 (Tanpa Plaintext di Firestore)
 * - Constant-time comparison untuk mencegah timing attack
 * - Evaluasi Brute-Force Lockout hibrida (Firestore + LocalStorage)
 * - Penjaga batas ukuran dokumen Firestore (< 1 MiB) & pemisahan subkoleksi
 */

const PIN_HASH_PREFIX = 'sha256v2$';
const MAX_FIRESTORE_SAFE_BYTES = 850 * 1024; // 850 KB batas aman di bawah 1 MiB (1.048.576 byte)
const MAX_PARENT_COMMENTS_PREVIEW = 20;
const MAX_PARENT_ACTIVITY_LOGS = 15;
const MAX_PIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 10 * 60 * 1000; // 10 menit

/**
 * Implementasi SHA-256 murni (deterministic & sinkron) agar berjalan identik
 * di Browser maupun Node.js tanpa bergantung pada async WebCrypto semata.
 */
const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(n, x) {
  return (x >>> n) | (x << (32 - n));
}

export function sha256HexSync(asciiMessage) {
  const bytes = new TextEncoder().encode(String(asciiMessage ?? ''));
  const bitLen = bytes.length * 8;

  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);

  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3);
      const s1 = rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((v) => v.toString(16).padStart(8, '0'))
    .join('');
}

/**
 * Perbandingan string waktu konstan (constant-time comparison)
 */
export function constantTimeEqual(a, b) {
  const strA = String(a ?? '');
  const strB = String(b ?? '');
  if (strA.length !== strB.length) return false;
  let diff = 0;
  for (let i = 0; i < strA.length; i++) {
    diff |= strA.charCodeAt(i) ^ strB.charCodeAt(i);
  }
  return diff === 0;
}

export function normalizeSchoolSlug(slug) {
  return (
    String(slug || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'sekolah-baru'
  );
}

/**
 * Menghasilkan hash salted SHA-256 untuk PIN 6-digit kontingen.
 * PIN mentah tidak pernah disimpan ke dalam dokumen Firestore publik.
 */
export function hashOfficialSecurityPin(rawPin, schoolSlug) {
  const cleanPin = String(rawPin || '').trim();
  if (!/^[0-9]{6}$/.test(cleanPin)) {
    throw new Error('PIN Keamanan wajib terdiri dari tepat 6 angka numerik (0-9).');
  }
  const cleanSlug = normalizeSchoolSlug(schoolSlug);
  const digest = sha256HexSync(`menwa-unj-official-v2:${cleanSlug}:${cleanPin}`);
  return `${PIN_HASH_PREFIX}${digest}`;
}

/**
 * Mengecek apakah portal sudah memiliki PIN keamanan aktif (baik format hash baru maupun legacy).
 */
export function isOfficialPinConfigured(portalData) {
  if (!portalData || typeof portalData !== 'object') return false;
  if (
    typeof portalData.securityPinHash === 'string' &&
    portalData.securityPinHash.startsWith(PIN_HASH_PREFIX)
  ) {
    return true;
  }
  if (typeof portalData.securityPin === 'string' && /^[0-9]{6}$/.test(portalData.securityPin.trim())) {
    return true;
  }
  return false;
}

/**
 * Verifikasi PIN 6-digit terhadap data portal kontingen.
 */
export function verifyOfficialSecurityPin(inputPin, portalData, schoolSlug) {
  const cleanPin = String(inputPin || '').trim();
  if (!/^[0-9]{6}$/.test(cleanPin)) return false;
  if (!portalData || typeof portalData !== 'object') return false;

  const cleanSlug = normalizeSchoolSlug(schoolSlug || portalData.schoolSlug || portalData.schoolName);
  const candidateHash = hashOfficialSecurityPin(cleanPin, cleanSlug);

  if (
    typeof portalData.securityPinHash === 'string' &&
    portalData.securityPinHash.startsWith(PIN_HASH_PREFIX)
  ) {
    return constantTimeEqual(candidateHash, portalData.securityPinHash);
  }

  // Fallback transisi hanya untuk dokumen lama yang belum memiliki securityPinHash
  const legacyPin = String(portalData.securityPin || '').trim();
  if (/^[0-9]{6}$/.test(legacyPin)) {
    return constantTimeEqual(cleanPin, legacyPin);
  }

  return false;
}

/**
 * Evaluasi status penguncian brute-force dengan menggabungkan state server (Firestore)
 * dan state lokal (LocalStorage), sehingga hapus localStorage tidak bisa membobol lockout.
 */
export function evaluatePinLockout({ portalData, localLockoutUntil = 0, nowMs = Date.now() }) {
  const serverLockoutUntil = Number(portalData?.lockoutUntil || 0);
  const effectiveLockoutUntil = Math.max(
    Number.isFinite(serverLockoutUntil) ? serverLockoutUntil : 0,
    Number.isFinite(Number(localLockoutUntil)) ? Number(localLockoutUntil) : 0
  );

  if (effectiveLockoutUntil > nowMs) {
    return {
      isLockedOut: true,
      lockoutUntil: effectiveLockoutUntil,
      remainingSeconds: Math.max(1, Math.ceil((effectiveLockoutUntil - nowMs) / 1000)),
    };
  }

  return {
    isLockedOut: false,
    lockoutUntil: 0,
    remainingSeconds: 0,
  };
}

/**
 * Menghitung state percobaan gagal berikutnya untuk disimpan ke Firestore & LocalStorage.
 */
export function computeNextFailedPinState({
  portalData,
  localAttempts = 0,
  nowMs = Date.now(),
}) {
  const serverAttempts = Number(portalData?.failedPinAttempts || 0);
  const lastLockoutUntil = Number(portalData?.lockoutUntil || 0);
  // Jika masa lockout sebelumnya sudah lewat, mulai hitungan dari 0
  const baseServerAttempts =
    lastLockoutUntil > 0 && lastLockoutUntil <= nowMs ? 0 : serverAttempts;
  const currentAttempts = Math.max(baseServerAttempts, Number(localAttempts) || 0) + 1;

  if (currentAttempts >= MAX_PIN_ATTEMPTS) {
    const lockoutUntil = nowMs + LOCKOUT_DURATION_MS;
    return {
      failedPinAttempts: currentAttempts,
      lockoutUntil,
      isLockedOut: true,
      remainingAttempts: 0,
      remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
    };
  }

  return {
    failedPinAttempts: currentAttempts,
    lockoutUntil: 0,
    isLockedOut: false,
    remainingAttempts: Math.max(0, MAX_PIN_ATTEMPTS - currentAttempts),
    remainingSeconds: 0,
  };
}

/**
 * Menghitung perkiraan ukuran byte JSON dokumen sebelum dikirim ke Firestore.
 */
export function estimateFirestoreDocBytes(obj) {
  try {
    return new TextEncoder().encode(JSON.stringify(obj ?? {})).length;
  } catch {
    return 0;
  }
}

/**
 * Stage 2.1: Sanitasi payload pengajuan formulir administrasi (`forms_submissions`)
 * agar tidak pernah melampaui batas 1 MiB Firestore akibat `documentPdfBase64`.
 */
export function sanitizeSubmissionForFirestore(formData, uploadedStorageUrl = '') {
  const clone = { ...(formData || {}) };
  const rawBase64 = typeof clone.documentPdfBase64 === 'string' ? clone.documentPdfBase64 : '';

  if (uploadedStorageUrl) {
    clone.documentPdfUrl = uploadedStorageUrl;
    delete clone.documentPdfBase64;
    clone.documentStorageMode = 'firebase_storage';
  } else if (rawBase64) {
    const base64Bytes = new TextEncoder().encode(rawBase64).length;
    if (base64Bytes > 650 * 1024) {
      // Jangan pernah biarkan base64 > 650 KB masuk ke dokumen Firestore utama (mencegah error 1 MiB)
      delete clone.documentPdfBase64;
      clone.documentStorageMode = 'oversized_stripped_safe';
      clone.documentPdfSizeWarning = `Berkas (${Math.round(base64Bytes / 1024)} KB) melebihi batas inline dokumen dan dicatat sebagai metadata.`;
    } else {
      clone.documentStorageMode = 'inline_compact';
    }
  }

  // Pastikan field string lain terpotong dengan aman
  if (typeof clone.fullName === 'string') clone.fullName = clone.fullName.slice(0, 120);
  if (typeof clone.institution === 'string') clone.institution = clone.institution.slice(0, 150);

  return clone;
}

/**
 * Stage 2.2a: Membangun pembaruan komentar terbatas (bounded preview) pada dokumen induk
 * `documentation_posts/{postId}` sekaligus menghasilkan dokumen untuk subkoleksi
 * `documentation_posts/{postId}/comments/{commentId}`.
 */
export function buildBoundedCommentUpdate(existingComments, commentObj, currentCount = 0) {
  const safeList = Array.isArray(existingComments) ? existingComments : [];
  const nowIso = new Date().toISOString();
  const commentId =
    commentObj?.commentId ||
    commentObj?.id ||
    `CMT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const normalizedComment = {
    ...commentObj,
    commentId,
    id: commentObj?.id || commentId,
    text: String(commentObj?.text || '').slice(0, 1000),
    author: String(commentObj?.author || commentObj?.user || 'Pengunjung').slice(0, 80),
    createdAt: commentObj?.createdAt || nowIso,
  };

  const fullMerged = [...safeList, normalizedComment];
  const boundedPreview = fullMerged.slice(-MAX_PARENT_COMMENTS_PREVIEW);
  const nextCount = Math.max(Number(currentCount) || 0, safeList.length) + 1;

  return {
    commentId,
    subcollectionDoc: normalizedComment,
    parentUpdate: {
      comments: boundedPreview,
      commentsCount: nextCount,
      updatedAt: nowIso,
    },
    mergedComments: boundedPreview,
  };
}

/**
 * Menghapus data URL base64 berukuran besar dari objek snapshot cadangan
 * agar dokumen snapshot tetap ringan dan di bawah batas 1 MiB.
 */
export function stripHeavyBase64FromSnapshot(snapshotObj) {
  if (!snapshotObj || typeof snapshotObj !== 'object') return {};
  const clone = JSON.parse(JSON.stringify(snapshotObj));

  if (Array.isArray(clone.pasukanList)) {
    clone.pasukanList = clone.pasukanList.slice(0, 18).map((p) => {
      if (!p || typeof p !== 'object') return p;
      const item = { ...p };
      if (typeof item.photoDataUrl === 'string' && item.photoDataUrl.startsWith('data:') && item.photoDataUrl.length > 4096) {
        item.photoDataUrl = item.photoDownloadUrl || '';
      }
      return item;
    });
  }

  if (Array.isArray(clone.officialList)) {
    clone.officialList = clone.officialList.slice(0, 2).map((o) => {
      if (!o || typeof o !== 'object') return o;
      const item = { ...o };
      if (typeof item.photoDataUrl === 'string' && item.photoDataUrl.startsWith('data:') && item.photoDataUrl.length > 4096) {
        item.photoDataUrl = item.photoDownloadUrl || '';
      }
      return item;
    });
  }

  if (clone.documents && typeof clone.documents === 'object') {
    const cleanDocs = {};
    for (const [k, v] of Object.entries(clone.documents)) {
      if (v && typeof v === 'object') {
        const docCopy = { ...v };
        if (typeof docCopy.fileDataUrl === 'string' && docCopy.fileDataUrl.startsWith('data:') && docCopy.fileDataUrl.length > 4096) {
          docCopy.fileDataUrl = docCopy.fileDownloadUrl || '';
        }
        cleanDocs[k] = docCopy;
      }
    }
    clone.documents = cleanDocs;
  }

  return clone;
}

/**
 * Stage 1.2 & Stage 2.2b: Sanitasi dokumen `official_portals/{schoolSlug}` sebelum disimpan ke Firestore:
 * - Mengonversi `securityPin` plaintext menjadi `securityPinHash` (dan menghapus `securityPin` plaintext).
 * - Membatasi `activityLogs` pada dokumen induk maksimal 15 entri terbaru.
 * - Memindahkan beban `snapshotBackup` penuh agar tidak membengkakkan dokumen induk.
 */
export function sanitizeOfficialPortalForFirestore(portalPayload) {
  if (!portalPayload || typeof portalPayload !== 'object') return portalPayload;
  const clean = { ...portalPayload };
  const slug = normalizeSchoolSlug(clean.schoolSlug || clean.schoolName);

  // Konversi PIN plaintext ke hash SHA-256 dan hapus plaintext dari dokumen
  if (typeof clean.securityPin === 'string' && /^[0-9]{6}$/.test(clean.securityPin.trim())) {
    clean.securityPinHash = hashOfficialSecurityPin(clean.securityPin.trim(), slug);
  }
  delete clean.securityPin;

  // Batasi activityLogs di dokumen induk agar tidak tumbuh tak terbatas
  if (Array.isArray(clean.activityLogs)) {
    clean.activityLogs = clean.activityLogs.slice(0, MAX_PARENT_ACTIVITY_LOGS);
  } else {
    clean.activityLogs = [];
  }

  // Sanitasi snapshotBackup agar tidak memuat duplikat base64 besar di dokumen utama
  if (clean.snapshotBackup && typeof clean.snapshotBackup === 'object') {
    clean.snapshotBackup = stripHeavyBase64FromSnapshot(clean.snapshotBackup);
    if (estimateFirestoreDocBytes(clean) > MAX_FIRESTORE_SAFE_BYTES) {
      clean.latestSnapshotMeta = {
        savedAt: clean.snapshotBackup.savedAt || new Date().toISOString(),
        reason: clean.snapshotBackup.reason || 'Snapshot Cadangan',
        pasukanCount: Array.isArray(clean.snapshotBackup.pasukanList)
          ? clean.snapshotBackup.pasukanList.length
          : 0,
      };
      clean.snapshotBackup = null;
    }
  }

  return clean;
}
