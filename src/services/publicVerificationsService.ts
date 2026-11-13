import { getApp, getApps, initializeApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import {
  doc,
  Firestore,
  getDoc,
  getFirestore,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  PublicVerificationRecord,
  PublicVerificationStatus,
} from '../types/espriVerification';
import {
  isValidVerificationHashId,
  parseVerificationQueryFromUrl,
  sanitizeVerificationHashId,
} from '../lib/espriVerification';

/**
 * Menginisialisasi instance Firestore secara aman (anti-bentrok jika Firebase App [DEFAULT]
 * sudah diinisialisasi oleh website utama menwaunj.or.id).
 */
export function getSafeFirestoreInstance(
  options?: FirebaseOptions & { firestoreDatabaseId?: string },
  appName?: string
): Firestore {
  const existingApps = getApps();
  let app: FirebaseApp;

  if (appName) {
    const named = existingApps.find((a) => a.name === appName);
    if (named) {
      app = named;
    } else if (options) {
      app = initializeApp(options, appName);
    } else {
      app = getApp();
    }
  } else if (existingApps.length > 0) {
    app = getApp();
  } else if (options) {
    app = initializeApp(options);
  } else {
    throw new Error(
      'Firebase belum diinisialisasi. Sertakan FirebaseOptions atau inisialisasi app [DEFAULT] terlebih dahulu.'
    );
  }

  return options?.firestoreDatabaseId
    ? getFirestore(app, options.firestoreDatabaseId)
    : getFirestore(app);
}

/**
 * Membaca 1 dokumen verifikasi publik dari `/publicVerifications/{hash}` berdasarkan exact Document ID.
 * Catatan: `allow list` ditutup di firestore.rules, jadi gunakan `getDoc` secara langsung (bukan query `collection`).
 */
export async function fetchPublicVerificationByHash(
  db: Firestore,
  rawHash: string
): Promise<PublicVerificationRecord | null> {
  const hash = sanitizeVerificationHashId(rawHash);
  if (!isValidVerificationHashId(hash)) {
    return null;
  }

  const ref = doc(db, 'publicVerifications', hash);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return null;
  }

  return snap.data() as PublicVerificationRecord;
}

/**
 * Menyelesaikan lookup dari URL (`?hash=`, `/verifikasi/{hash}`, `?no=`, `?doc=`, dll.)
 * dengan mencoba kandidat ID secara berurutan (exact hash, lalu prefix `no-{nomor}` jika numerik).
 */
export async function resolveVerificationFromLocation(
  db: Firestore,
  search: string,
  pathname = ''
): Promise<{
  record: PublicVerificationRecord | null;
  queriedId: string;
  matchedParam: string;
}> {
  const parsed = parseVerificationQueryFromUrl(search, pathname);
  if (!parsed.hash) {
    return { record: null, queriedId: '', matchedParam: parsed.matchedParam };
  }

  const candidates = [parsed.hash];
  if (parsed.matchedParam === 'no' || parsed.matchedParam === 'nomor') {
    const prefixed = sanitizeVerificationHashId(`no-${parsed.agendaOrNomor}`);
    if (!candidates.includes(prefixed)) {
      candidates.push(prefixed);
    }
  }

  for (const candidate of candidates) {
    const found = await fetchPublicVerificationByHash(db, candidate);
    if (found) {
      return {
        record: found,
        queriedId: candidate,
        matchedParam: parsed.matchedParam,
      };
    }
  }

  return {
    record: null,
    queriedId: parsed.hash,
    matchedParam: parsed.matchedParam,
  };
}

/**
 * Menyimpan atau memperbarui dokumen verifikasi di `/publicVerifications/{hash}`
 * sambil menghormati field immutable (`hash`, `createdAt`, `source`) sesuai `firestore.rules`.
 */
export async function upsertPublicVerificationRecord(
  db: Firestore,
  record: PublicVerificationRecord
): Promise<void> {
  const hash = sanitizeVerificationHashId(record.hash);
  const ref = doc(db, 'publicVerifications', hash);
  const existing = await getDoc(ref);

  if (existing.exists()) {
    const { hash: _h, createdAt: _c, source: _s, ...updatable } = record;
    void _h;
    void _c;
    void _s;
    await updateDoc(ref, {
      ...updatable,
      updatedAt: new Date().toISOString().slice(0, 50),
    });
    return;
  }

  await setDoc(ref, {
    ...record,
    hash,
  });
}

/**
 * Memperbarui status dokumen (misal DICABUT atau KEDALUWARSA) oleh Staf Admin terautentikasi.
 */
export async function updatePublicVerificationStatus(
  db: Firestore,
  hash: string,
  status: PublicVerificationStatus,
  statusReason?: string
): Promise<void> {
  const cleanHash = sanitizeVerificationHashId(hash);
  const ref = doc(db, 'publicVerifications', cleanHash);
  await updateDoc(ref, {
    status,
    ...(statusReason ? { statusReason: statusReason.slice(0, 300) } : {}),
    updatedAt: new Date().toISOString().slice(0, 50),
  });
}
