import { firestore, storage, storageRef, uploadString, getDownloadURL } from '../firebase.js';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { hashOfficialSecurityPin, verifyOfficialSecurityPin, isOfficialPinConfigured, evaluatePinLockout, computeNextFailedPinState, stripHeavyBase64FromSnapshot, sanitizeOfficialPortalForFirestore } from './securityAndDbUtils.js';

/* === */
/* PORTAL OFFICIAL SEKOLAH (/official/:namasekolah) — WhatsApp Login, Hashed PIN & Subcollections */
const OFFICIAL_PORTALS_CACHE_KEY = 'menwa_official_portals_cache_v2';
export function normalizeWaNumber(raw) {
  let clean = String(raw || '').replace(/[^0-9]/g, '');
  if (clean.startsWith('62')) clean = clean.slice(2);
  if (clean.startsWith('0')) clean = clean.slice(1);
  return clean;
}
export function slugifySchoolName(name) {
  return (
    String(name || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'sekolah-baru'
  );
}
export const DEFAULT_SEED_OFFICIAL_PORTALS = {};
function readLocalOfficialCache() {
  try {
    try {
      localStorage.removeItem('menwa_official_portals_cache_v1');
    } catch {}
    const raw = localStorage.getItem(OFFICIAL_PORTALS_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    delete parsed['sman-1-jakarta'];
    delete parsed['sman-8-jakarta'];
    Object.keys(parsed).forEach((k) => {
      if (
        parsed[k]?.whatsappNumber === '81234567890' ||
        parsed[k]?.whatsappNumber === '81298765432'
      ) {
        delete parsed[k];
      }
    });
    return parsed;
  } catch {
    return {};
  }
}
function writeLocalOfficialCache(mapObj) {
  try {
    localStorage.setItem(OFFICIAL_PORTALS_CACHE_KEY, JSON.stringify(mapObj));
  } catch {
    /* ignore storage quota errors */
  }
}
export async function getAllOfficialPortals() {
  const localMap = readLocalOfficialCache();
  try {
    const snap = await getDocs(collection(firestore, 'official_portals'));
    snap.docs.forEach((d) => {
      const data = d.data();
      const slug = data.schoolSlug || d.id;
      localMap[slug] = sanitizeOfficialPortalForFirestore({
        ...localMap[slug],
        ...data,
        schoolSlug: slug,
      });
    });
    writeLocalOfficialCache(localMap);
  } catch (err) {
    console.warn('Official portals list fallback to cache:', err);
  }
  return Object.values(localMap).sort((a, b) =>
    String(a.schoolName || '').localeCompare(String(b.schoolName || ''))
  );
}
export async function getOfficialPortalBySlug(slug) {
  const cleanSlug = slugifySchoolName(slug);
  const localMap = readLocalOfficialCache();
  try {
    const snap = await getDoc(doc(firestore, 'official_portals', cleanSlug));
    if (snap.exists()) {
      const merged = sanitizeOfficialPortalForFirestore({
        ...localMap[cleanSlug],
        ...snap.data(),
        schoolSlug: cleanSlug,
      });
      localMap[cleanSlug] = merged;
      writeLocalOfficialCache(localMap);
      return merged;
    }
  } catch (err) {
    console.warn('Official portal get by slug fallback to cache:', err);
  }
  return localMap[cleanSlug] || null;
}
export async function checkOfficialPortalWhatsAppAccess(rawWa) {
  const normalized = normalizeWaNumber(rawWa);
  if (!normalized || normalized.length < 8) {
    return {
      status: 'INVALID',
      message: 'Nomor WhatsApp tidak valid. Masukkan minimal 8 digit angka.',
    };
  }
  const all = await getAllOfficialPortals();
  const matched = all.find(
    (item) => normalizeWaNumber(item.whatsappNumber) === normalized
  );
  if (!matched || !matched.schoolSlug) {
    return {
      status: 'NOT_FOUND',
      message:
        'Nomor WhatsApp Anda belum terdaftar sebagai Official Kontingen di event GERANAT. Daftarkan nomor melalui Admin Mako di Command Center.',
    };
  }
  if (matched.isVerifiedByAdmin === false) {
    return {
      status: 'PENDING_VERIFICATION',
      portal: matched,
      message: `Kontingen "${matched.schoolName || 'Peserta'}" terdaftar, namun status verifikasi akses masih TERTUNDA oleh Admin Mako. Silakan aktifkan verifikasi di Command Center atau hubungi panitia.`,
    };
  }
  return {
    status: 'VERIFIED',
    portal: matched,
    message: 'Akses terverifikasi.',
  };
}

export async function getOfficialPortalByWhatsApp(rawWa) {
  const res = await checkOfficialPortalWhatsAppAccess(rawWa);
  if (res.status === 'VERIFIED') return res.portal;
  return null;
}

export async function saveOfficialPortal(portalData) {
  if (!portalData) return null;
  const schoolName = String(
    portalData.schoolProfile?.schoolName || portalData.schoolName || 'Sekolah Peserta'
  ).trim();
  const schoolSlug = slugifySchoolName(portalData.schoolSlug || schoolName);
  const whatsappNumber = normalizeWaNumber(portalData.whatsappNumber || '');
  const localMap = readLocalOfficialCache();
  const existing = localMap[schoolSlug] || {};

  // Stage 1.2: Konversi securityPin plaintext (jika ada) menjadi securityPinHash SHA-256
  let resolvedPinHash = portalData.securityPinHash || existing.securityPinHash || '';
  const candidatePlainPin =
    portalData.securityPin !== undefined
      ? String(portalData.securityPin || '').trim()
      : String(existing.securityPin || '').trim();
  if (/^[0-9]{6}$/.test(candidatePlainPin)) {
    resolvedPinHash = hashOfficialSecurityPin(candidatePlainPin, schoolSlug);
  }

  const rawPayload = {
    ...existing,
    ...portalData,
    schoolSlug,
    schoolName,
    whatsappNumber: whatsappNumber || existing.whatsappNumber || '',
    securityPinHash: resolvedPinHash,
    failedPinAttempts:
      portalData.failedPinAttempts !== undefined
        ? Number(portalData.failedPinAttempts || 0)
        : Number(existing.failedPinAttempts || 0),
    lockoutUntil:
      portalData.lockoutUntil !== undefined
        ? Number(portalData.lockoutUntil || 0)
        : Number(existing.lockoutUntil || 0),
    pinResetRequested:
      portalData.pinResetRequested !== undefined
        ? Boolean(portalData.pinResetRequested)
        : Boolean(existing.pinResetRequested),
    pinResetRequestedAt:
      portalData.pinResetRequestedAt !== undefined
        ? portalData.pinResetRequestedAt
        : existing.pinResetRequestedAt || null,
    activityLogs: Array.isArray(portalData.activityLogs)
      ? portalData.activityLogs.slice(0, 15)
      : (existing.activityLogs || []).slice(0, 15),
    snapshotBackup:
      portalData.snapshotBackup !== undefined
        ? portalData.snapshotBackup
        : existing.snapshotBackup || null,
    isVerifiedByAdmin:
      portalData.isVerifiedByAdmin !== undefined
        ? Boolean(portalData.isVerifiedByAdmin)
        : existing.isVerifiedByAdmin !== undefined
        ? Boolean(existing.isVerifiedByAdmin)
        : true,
    eventTitle:
      portalData.eventTitle ||
      existing.eventTitle ||
      'GERANAT — Gerakan Paskibra Semangat Satuan Menwa UNJ',
    nomorUrut: portalData.nomorUrut || existing.nomorUrut || 'KONTINGEN-01',
    juryName:
      portalData.juryName ||
      existing.juryName ||
      'Dewan Juri Mako Menwa UNJ',
    schoolProfile: {
      ...(existing.schoolProfile || {}),
      ...(portalData.schoolProfile || {}),
      schoolName,
    },
    documents: portalData.documents ?? existing.documents ?? {},
    pasukanList: Array.isArray(portalData.pasukanList)
      ? portalData.pasukanList.slice(0, 18)
      : existing.pasukanList || [],
    officialList: Array.isArray(portalData.officialList)
      ? portalData.officialList.slice(0, 2)
      : existing.officialList || [],
    scores: portalData.scores ?? existing.scores ?? {},
    penalties: portalData.penalties ?? existing.penalties ?? {},
    bonuses: portalData.bonuses ?? existing.bonuses ?? {},
    createdAt: existing.createdAt || portalData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const payload = sanitizeOfficialPortalForFirestore(rawPayload);

  // Sinkronisasi berkas dokumen dan foto kontingen ke Firebase Storage
  const activeStorage = typeof storage !== 'undefined' ? storage : null;
  const canUploadStorage = Boolean(activeStorage && storageRef && uploadString && getDownloadURL);
  if (canUploadStorage && payload.documents && typeof payload.documents === 'object') {
    for (const [docId, docObj] of Object.entries(payload.documents)) {
      if (docObj && docObj.fileDataUrl && docObj.fileDataUrl.startsWith('data:')) {
        try {
          const ext = (docObj.fileName?.split('.').pop() || 'pdf').toLowerCase();
          const sRef = storageRef(activeStorage, `official_portals/${schoolSlug}/documents/${docId}.${ext}`);
          await uploadString(sRef, docObj.fileDataUrl, 'data_url');
          const dUrl = await getDownloadURL(sRef);
          payload.documents[docId] = {
            ...docObj,
            fileDownloadUrl: dUrl,
            fileDataUrl: dUrl,
          };
        } catch (e) {
          console.warn('Storage sync document note:', e);
        }
      }
    }
  }

  if (canUploadStorage && Array.isArray(payload.pasukanList)) {
    for (let i = 0; i < payload.pasukanList.length; i++) {
      const p = payload.pasukanList[i];
      if (p && p.photoDataUrl && p.photoDataUrl.startsWith('data:')) {
        try {
          const sRef = storageRef(activeStorage, `official_portals/${schoolSlug}/photos/pasukan-${i + 1}.webp`);
          await uploadString(sRef, p.photoDataUrl, 'data_url');
          const pUrl = await getDownloadURL(sRef);
          payload.pasukanList[i] = {
            ...p,
            photoDownloadUrl: pUrl,
            photoDataUrl: pUrl,
          };
        } catch (e) {
          console.warn('Storage sync photo note:', e);
        }
      }
    }
  }

  if (canUploadStorage && Array.isArray(payload.officialList)) {
    for (let i = 0; i < payload.officialList.length; i++) {
      const o = payload.officialList[i];
      if (o && o.photoDataUrl && o.photoDataUrl.startsWith('data:')) {
        try {
          const sRef = storageRef(activeStorage, `official_portals/${schoolSlug}/photos/official-${i + 1}.webp`);
          await uploadString(sRef, o.photoDataUrl, 'data_url');
          const oUrl = await getDownloadURL(sRef);
          payload.officialList[i] = {
            ...o,
            photoDownloadUrl: oUrl,
            photoDataUrl: oUrl,
          };
        } catch (e) {
          console.warn('Storage sync official photo note:', e);
        }
      }
    }
  }

  localMap[schoolSlug] = payload;
  writeLocalOfficialCache(localMap);

  try {
    await setDoc(doc(firestore, 'official_portals', schoolSlug), payload, { merge: true });
  } catch (err) {
    console.warn('Official portal Firestore save warning (saved locally):', err);
  }

  return payload;
}

export async function deleteOfficialPortal(schoolSlug) {
  const cleanSlug = slugifySchoolName(schoolSlug);
  const localMap = readLocalOfficialCache();
  delete localMap[cleanSlug];
  writeLocalOfficialCache(localMap);
  try {
    await deleteDoc(doc(firestore, 'official_portals', cleanSlug));
  } catch (err) {
    console.warn('Delete official portal warning:', err);
  }
  return true;
}

export function subscribeToOfficialPortal(schoolSlug, onUpdate) {
  const cleanSlug = slugifySchoolName(schoolSlug);
  if (!cleanSlug || typeof onUpdate !== 'function') return () => {};
  const localMap = readLocalOfficialCache();
  if (localMap[cleanSlug]) {
    onUpdate(localMap[cleanSlug]);
  }
  try {
    return onSnapshot(
      doc(firestore, 'official_portals', cleanSlug),
      (snap) => {
        if (snap.exists()) {
          const data = sanitizeOfficialPortalForFirestore({
            ...localMap[cleanSlug],
            ...snap.data(),
            schoolSlug: cleanSlug,
          });
          const latestCache = readLocalOfficialCache();
          latestCache[cleanSlug] = data;
          writeLocalOfficialCache(latestCache);
          onUpdate(data);
        }
      },
      (err) => {
        console.warn('Official portal realtime listener fallback:', err);
      }
    );
  } catch {
    return () => {};
  }
}

/* Helper internal: catat entri log ke subkoleksi /official_portals/{schoolSlug}/activity_logs/{logId} */
async function writeOfficialActivityLogSubdoc(cleanSlug, entry) {
  if (!cleanSlug || !entry) return;
  const logId = `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  try {
    await setDoc(doc(firestore, 'official_portals', cleanSlug, 'activity_logs', logId), {
      logId,
      schoolSlug: cleanSlug,
      ...entry,
    });
  } catch (err) {
    console.warn('Official activity_logs subcollection write note:', err);
  }
}

export async function getOfficialPortalActivityLogs(schoolSlug, maxCount = 50) {
  const cleanSlug = slugifySchoolName(schoolSlug);
  try {
    const q = query(
      collection(firestore, 'official_portals', cleanSlug, 'activity_logs'),
      orderBy('timestamp', 'desc'),
      limit(maxCount)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('Fetch official activity_logs subcollection fallback:', err);
  }
  const portal = await getOfficialPortalBySlug(cleanSlug);
  return Array.isArray(portal?.activityLogs) ? portal.activityLogs : [];
}

export async function recordOfficialFailedPinAttempt(schoolSlug, localAttempts = 0) {
  const cleanSlug = slugifySchoolName(schoolSlug);
  const portal = await getOfficialPortalBySlug(cleanSlug);
  const nextState = computeNextFailedPinState({
    portalData: portal,
    localAttempts,
    nowMs: Date.now(),
  });

  if (portal) {
    try {
      await setDoc(
        doc(firestore, 'official_portals', cleanSlug),
        {
          schoolSlug: cleanSlug,
          schoolName: portal.schoolName || 'Kontingen Sekolah',
          whatsappNumber: portal.whatsappNumber || '',
          failedPinAttempts: nextState.failedPinAttempts,
          lockoutUntil: nextState.lockoutUntil,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Failed PIN attempt sync note:', err);
    }
  }

  return nextState;
}

export async function clearOfficialPinLockout(schoolSlug) {
  const cleanSlug = slugifySchoolName(schoolSlug);
  const portal = await getOfficialPortalBySlug(cleanSlug);
  if (!portal) return;
  if (!portal.failedPinAttempts && !portal.lockoutUntil) return;
  try {
    await setDoc(
      doc(firestore, 'official_portals', cleanSlug),
      {
        schoolSlug: cleanSlug,
        schoolName: portal.schoolName || 'Kontingen Sekolah',
        whatsappNumber: portal.whatsappNumber || '',
        failedPinAttempts: 0,
        lockoutUntil: 0,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch {
    /* ignore */
  }
}

export async function setOfficialSecurityPin(schoolSlug, newPin, actor = 'Official') {
  const cleanSlug = slugifySchoolName(schoolSlug);
  const portal = await getOfficialPortalBySlug(cleanSlug);
  if (!portal) throw new Error('Portal kontingen tidak ditemukan.');

  const pinStr = String(newPin || '').trim();
  const pinHash = hashOfficialSecurityPin(pinStr, cleanSlug);

  const logEntry = {
    action: 'PIN_UPDATED',
    details: 'PIN Keamanan 6 digit berhasil diperbarui & dienkripsi (SHA-256).',
    actor: String(actor || 'Official'),
    timestamp: new Date().toISOString(),
  };
  await writeOfficialActivityLogSubdoc(cleanSlug, logEntry);

  const logs = Array.isArray(portal.activityLogs) ? [...portal.activityLogs] : [];
  logs.unshift(logEntry);

  return await saveOfficialPortal({
    ...portal,
    schoolSlug: cleanSlug,
    securityPinHash: pinHash,
    failedPinAttempts: 0,
    lockoutUntil: 0,
    pinResetRequested: false,
    pinResetRequestedAt: null,
    activityLogs: logs.slice(0, 15),
  });
}

export async function requestOfficialPinReset(schoolSlug, reason = 'Permintaan bantuan reset PIN') {
  const cleanSlug = slugifySchoolName(schoolSlug);
  const portal = await getOfficialPortalBySlug(cleanSlug);
  if (!portal) throw new Error('Portal kontingen tidak ditemukan.');

  const logEntry = {
    action: 'PIN_RESET_REQUESTED',
    details: `Permintaan reset PIN diajukan: ${reason}`,
    actor: 'Official',
    timestamp: new Date().toISOString(),
  };
  await writeOfficialActivityLogSubdoc(cleanSlug, logEntry);

  const logs = Array.isArray(portal.activityLogs) ? [...portal.activityLogs] : [];
  logs.unshift(logEntry);

  return await saveOfficialPortal({
    ...portal,
    schoolSlug: cleanSlug,
    pinResetRequested: true,
    pinResetRequestedAt: new Date().toISOString(),
    activityLogs: logs.slice(0, 15),
  });
}

export async function resetOfficialPinByAdmin(schoolSlug, newPin = '123456', adminEmail = 'Mako Admin') {
  const cleanSlug = slugifySchoolName(schoolSlug);
  const portal = await getOfficialPortalBySlug(cleanSlug);
  if (!portal) throw new Error('Portal kontingen tidak ditemukan.');

  const pinStr = String(newPin || '123456').trim();
  const pinHash = hashOfficialSecurityPin(pinStr, cleanSlug);

  // Jangan pernah mencatat PIN baru secara plaintext di dalam log aktivitas
  const logEntry = {
    action: 'PIN_RESET_BY_ADMIN',
    details: `PIN direset oleh Komando CommandCenter (${adminEmail}) menggunakan hash SHA-256.`,
    actor: adminEmail,
    timestamp: new Date().toISOString(),
  };
  await writeOfficialActivityLogSubdoc(cleanSlug, logEntry);

  const logs = Array.isArray(portal.activityLogs) ? [...portal.activityLogs] : [];
  logs.unshift(logEntry);

  return await saveOfficialPortal({
    ...portal,
    schoolSlug: cleanSlug,
    securityPinHash: pinHash,
    failedPinAttempts: 0,
    lockoutUntil: 0,
    pinResetRequested: false,
    pinResetRequestedAt: null,
    activityLogs: logs.slice(0, 15),
  });
}

export async function logOfficialPortalActivity(schoolSlug, action, details, actor = 'Official') {
  const cleanSlug = slugifySchoolName(schoolSlug);
  const portal = await getOfficialPortalBySlug(cleanSlug);
  if (!portal) return null;

  const logEntry = {
    action: String(action || 'ACTIVITY'),
    details: String(details || ''),
    actor: String(actor || 'Official'),
    timestamp: new Date().toISOString(),
  };
  await writeOfficialActivityLogSubdoc(cleanSlug, logEntry);

  const logs = Array.isArray(portal.activityLogs) ? [...portal.activityLogs] : [];
  logs.unshift(logEntry);

  return await saveOfficialPortal({
    ...portal,
    schoolSlug: cleanSlug,
    activityLogs: logs.slice(0, 15),
  });
}

export async function saveOfficialPortalSnapshot(schoolSlug, reason = 'Snapshot Otomatis Sebelum Perubahan') {
  const cleanSlug = slugifySchoolName(schoolSlug);
  const portal = await getOfficialPortalBySlug(cleanSlug);
  if (!portal) return null;

  const nowIso = new Date().toISOString();
  const snapId = `SNAP-${Date.now()}`;
  const rawSnapshot = {
    snapId,
    schoolSlug: cleanSlug,
    pasukanList: portal.pasukanList ? JSON.parse(JSON.stringify(portal.pasukanList)) : [],
    officialList: portal.officialList ? JSON.parse(JSON.stringify(portal.officialList)) : [],
    schoolProfile: portal.schoolProfile ? JSON.parse(JSON.stringify(portal.schoolProfile)) : {},
    documents: portal.documents ? JSON.parse(JSON.stringify(portal.documents)) : {},
    savedAt: nowIso,
    reason,
  };

  // Stage 2.2b: Bersihkan base64 berat dan simpan ke subkoleksi /official_portals/{schoolSlug}/snapshots/
  const snapshotBackup = stripHeavyBase64FromSnapshot(rawSnapshot);
  try {
    await setDoc(doc(firestore, 'official_portals', cleanSlug, 'snapshots', 'latest'), snapshotBackup);
    await setDoc(doc(firestore, 'official_portals', cleanSlug, 'snapshots', snapId), snapshotBackup);
  } catch (subErr) {
    console.warn('Official snapshot subcollection write note:', subErr);
  }

  const logEntry = {
    action: 'SNAPSHOT_SAVED',
    details: `Backup snapshot otomatis tersimpan di subkoleksi (${snapshotBackup.pasukanList.length} pasukan, ${snapshotBackup.officialList.length} official)`,
    actor: 'System',
    timestamp: nowIso,
  };
  await writeOfficialActivityLogSubdoc(cleanSlug, logEntry);

  const logs = Array.isArray(portal.activityLogs) ? [...portal.activityLogs] : [];
  logs.unshift(logEntry);

  return await saveOfficialPortal({
    ...portal,
    schoolSlug: cleanSlug,
    snapshotBackup,
    latestSnapshotMeta: {
      snapId,
      savedAt: nowIso,
      reason,
      pasukanCount: snapshotBackup.pasukanList.length,
      officialCount: snapshotBackup.officialList.length,
    },
    activityLogs: logs.slice(0, 15),
  });
}

export async function restoreOfficialPortalSnapshot(schoolSlug) {
  const cleanSlug = slugifySchoolName(schoolSlug);
  const portal = await getOfficialPortalBySlug(cleanSlug);
  if (!portal) {
    throw new Error('Portal kontingen tidak ditemukan.');
  }

  let snap = portal.snapshotBackup || null;
  try {
    const subSnap = await getDoc(doc(firestore, 'official_portals', cleanSlug, 'snapshots', 'latest'));
    if (subSnap.exists()) {
      snap = subSnap.data();
    }
  } catch (err) {
    console.warn('Restore snapshot subcollection read fallback:', err);
  }

  if (!snap) {
    throw new Error('Tidak ada snapshot cadangan yang dapat dipulihkan.');
  }

  const logEntry = {
    action: 'SNAPSHOT_RESTORED',
    details: `Pemulihan data dari snapshot tertanggal ${new Date(snap.savedAt).toLocaleString('id-ID')}`,
    actor: 'Official',
    timestamp: new Date().toISOString(),
  };
  await writeOfficialActivityLogSubdoc(cleanSlug, logEntry);

  const logs = Array.isArray(portal.activityLogs) ? [...portal.activityLogs] : [];
  logs.unshift(logEntry);

  return await saveOfficialPortal({
    ...portal,
    schoolSlug: cleanSlug,
    pasukanList: snap.pasukanList || [],
    officialList: snap.officialList || [],
    schoolProfile: { ...(portal.schoolProfile || {}), ...(snap.schoolProfile || {}) },
    documents: { ...(portal.documents || {}), ...(snap.documents || {}) },
    activityLogs: logs.slice(0, 15),
  });
}
export async function toggleOfficialPortalVerification(schoolSlug, isVerified) {
  if (!schoolSlug) throw new Error('Slug sekolah wajib diisi');
  const cleanSlug = slugifySchoolName(schoolSlug);
  const localMap = readLocalOfficialCache();
  const existing = localMap[cleanSlug] || {};
  const nextVerified = typeof isVerified === 'boolean' ? isVerified : existing.isVerifiedByAdmin === false;

  const updated = {
    ...existing,
    schoolSlug: cleanSlug,
    isVerifiedByAdmin: nextVerified,
    updatedAt: new Date().toISOString(),
  };
  localMap[cleanSlug] = updated;
  writeLocalOfficialCache(localMap);

  try {
    await updateDoc(doc(firestore, 'official_portals', cleanSlug), {
      isVerifiedByAdmin: nextVerified,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    try {
      await setDoc(doc(firestore, 'official_portals', cleanSlug), updated, { merge: true });
    } catch (e) {
      console.warn('Firestore toggle verification warning (saved locally):', e);
    }
  }

  return updated;
}
