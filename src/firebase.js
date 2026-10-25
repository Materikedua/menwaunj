import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
  getDocFromServer,
  increment
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadString,
  getDownloadURL
} from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase app singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize and export Auth instance
export const auth = getAuth(app);

// Initialize and export Firestore instance using firestoreDatabaseId
export const firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize and export Firebase Storage instance
export const storage = getStorage(app);

// Alias db for common convention and backward compatibility
export const db = firestore;

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Export common auth & firestore methods
export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
  getDocFromServer
};

// Error handling helper
export function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Google Sign-In helper
export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const userDocRef = doc(firestore, 'users', user.uid);
  try {
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Anggota Pengunjung',
        institution: 'Universitas Negeri Jakarta',
        occupation: 'Mahasiswa',
        birthDate: '',
        phone: '',
        updatedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn('Auto profile setup warning:', err);
  }
  return user;
}

// Email Sign-In helper
export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// Email Registration helper
export async function registerWithEmail(email, password, displayName, institution, occupation, birthDate, phone) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const user = cred.user;
  if (displayName) {
    await updateProfile(user, { displayName });
  }
  const userDocRef = doc(firestore, 'users', user.uid);
  try {
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email || email,
      displayName: displayName || user.displayName || 'Anggota Pengguna',
      institution: institution || 'Universitas Negeri Jakarta',
      occupation: occupation || 'Mahasiswa',
      birthDate: birthDate || '',
      phone: phone || '',
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Profile creation warning:', err);
  }
  return user;
}

// Sign-Out helper
export async function logoutUser() {
  await signOut(auth);
}

// User Profile helpers
export async function getUserProfile(uid) {
  if (!uid) return null;
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(firestore, 'users', uid));
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, 'get', path);
  }
}

export async function updateUserProfile(uid, profileData) {
  if (!uid) return;
  const path = `users/${uid}`;
  try {
    const ref = doc(firestore, 'users', uid);
    await updateDoc(ref, {
      ...profileData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, 'update', path);
  }
}

// Submit Formulir Administrasi
export async function submitAdministrationForm(formData) {
  const path = 'forms_submissions';
  try {
    const subId = `ADM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const payload = {
      ...formData,
      submissionId: subId,
      applicantUid: auth.currentUser?.uid || 'anonymous',
      applicantEmail: auth.currentUser?.email || formData.email || '',
      status: 'menunggu_konfirmasi',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(firestore, 'forms_submissions', subId), payload);
    return subId;
  } catch (error) {
    handleFirestoreError(error, 'create', path);
  }
}

// Ambil riwayat pengajuan formulir pengguna
export async function getUserSubmissions(uid) {
  if (!uid) return [];
  const path = 'forms_submissions';
  try {
    const q = query(
      collection(firestore, 'forms_submissions'), 
      where('applicantUid', '==', uid)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  } catch (error) {
    handleFirestoreError(error, 'list', path);
    return [];
  }
}

// Ambil seluruh pengajuan formulir untuk Dashboard Admin Mako
export async function getAllSubmissionsForAdmin() {
  const path = 'forms_submissions';
  try {
    const snap = await getDocs(collection(firestore, 'forms_submissions'));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  } catch (error) {
    console.warn('All submissions fetch warning:', error);
    return [];
  }
}

// Perbarui status pengajuan formulir (Admin Mako)
export async function updateSubmissionStatus(submissionId, status, adminNotes = '') {
  const path = `forms_submissions/${submissionId}`;
  try {
    const docRef = doc(firestore, 'forms_submissions', submissionId);
    await updateDoc(docRef, {
      status,
      adminNotes,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, 'update', path);
  }
}

// Ambil daftar pengguna untuk Leaderboard Taktis
export async function getLeaderboardUsers() {
  const path = 'users';
  try {
    const snap = await getDocs(collection(firestore, 'users'));
    const users = snap.docs.map(d => ({ ...d.data(), id: d.id }));
    return users.sort((a, b) => (b.tacticalPoints || 0) - (a.tacticalPoints || 0));
  } catch (error) {
    console.warn('Leaderboard fetch warning:', error);
    return [];
  }
}

// Tambahkan poin taktis pengguna dari kuis / gamifikasi
export async function addTacticalPoints(uid, points, quizDate) {
  if (!uid || !points) return;
  const path = `users/${uid}`;
  try {
    const userRef = doc(firestore, 'users', uid);
    const snap = await getDoc(userRef);
    const data = snap.exists() ? snap.data() : {};
    const currentPoints = data.tacticalPoints || 0;
    const currentWeekly = data.weeklyPoints || 0;
    const currentMonthly = data.monthlyPoints || 0;
    const newPoints = currentPoints + points;
    const newWeekly = currentWeekly + points;
    const newMonthly = currentMonthly + points;
    await updateDoc(userRef, {
      tacticalPoints: newPoints,
      weeklyPoints: newWeekly,
      monthlyPoints: newMonthly,
      lastQuizDate: quizDate || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString()
    });
    return newPoints;
  } catch (error) {
    handleFirestoreError(error, 'update', path);
  }
}

// Verifikasi status Anggota Menwa UNJ oleh Admin Mako (Centang Biru)
export async function verifyMenwaMember(targetUid, isVerified) {
  const path = `users/${targetUid}`;
  try {
    const userRef = doc(firestore, 'users', targetUid);
    await updateDoc(userRef, {
      isVerifiedMenwa: isVerified,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, 'update', path);
  }
}

// Simpan Sertifikat Kursus Pelatihan Pelatih Youth Spark
export async function saveCertificate(uid, certData) {
  if (!uid || !certData) return null;
  const certId = certData.certId || `CERT-YSP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const path = `users/${uid}/certificates/${certId}`;
  try {
    const certRef = doc(firestore, 'users', uid, 'certificates', certId);
    const payload = {
      ...certData,
      certId,
      issuedAt: certData.issuedAt || new Date().toISOString()
    };
    await setDoc(certRef, payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, 'create', path);
  }
}

// Ambil riwayat sertifikat pengguna
export async function getUserCertificates(uid) {
  if (!uid) return [];
  const path = `users/${uid}/certificates`;
  try {
    const snap = await getDocs(collection(firestore, 'users', uid, 'certificates'));
    return snap.docs.map(d => d.data());
  } catch (error) {
    console.warn('Certificate fetch warning:', error);
    return [];
  }
}

// Rekam dan perbarui login streak berturut-turut
export async function recordUserStreak(uid) {
  if (!uid) return;
  const path = `users/${uid}`;
  try {
    const userRef = doc(firestore, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const today = new Date().toISOString().split('T')[0];
    const lastDate = data.lastStreakDate || '';

    // Sudah login dan tercatat hari ini
    if (lastDate === today) {
      return { 
        currentStreak: data.currentStreak || 1, 
        longestStreak: data.longestStreak || 1,
        streakFreezesCount: data.streakFreezesCount ?? 1
      };
    }

    const todayDateObj = new Date(today);
    const yesterdayDateObj = new Date(todayDateObj);
    yesterdayDateObj.setDate(yesterdayDateObj.getDate() - 1);
    const yesterday = yesterdayDateObj.toISOString().split('T')[0];

    let newStreak = 1;
    let freezeUsed = false;
    let streakReset = false;
    let currentFreezes = data.streakFreezesCount ?? 1; // Rekrut baru default punya 1 freeze

    if (lastDate === yesterday) {
      // Login berturut-turut hari berikutnya
      newStreak = (data.currentStreak || 0) + 1;
    } else if (lastDate && lastDate !== '') {
      // Melewatkan lebih dari 1 hari!
      if (currentFreezes > 0) {
        // Selamat berkat Perlindungan Streak Freeze!
        currentFreezes -= 1;
        newStreak = Math.max(1, data.currentStreak || 1);
        freezeUsed = true;
      } else {
        // Reset kembali ke Hari 1
        newStreak = 1;
        streakReset = true;
      }
    }

    const newLongest = Math.max(data.longestStreak || 0, newStreak);
    const claimed = data.streakMilestonesClaimed || [];
    const isNewMilestone = (newStreak % 7 === 0) && !claimed.includes(newStreak);

    await updateDoc(userRef, {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastStreakDate: today,
      streakFreezesCount: currentFreezes,
      updatedAt: new Date().toISOString()
    });

    return { 
      currentStreak: newStreak, 
      longestStreak: newLongest,
      streakFreezesCount: currentFreezes,
      freezeUsed,
      streakReset,
      milestoneReached: isNewMilestone ? newStreak : null
    };
  } catch (error) {
    console.warn('Streak update warning:', error);
  }
}

// Klaim bonus EXP milestone 7-hari
export async function claimStreakMilestoneBonus(uid, milestoneDays, bonusExp) {
  if (!uid || !milestoneDays) return;
  const path = `users/${uid}`;
  try {
    const userRef = doc(firestore, 'users', uid);
    const snap = await getDoc(userRef);
    const data = snap.exists() ? snap.data() : {};
    const claimed = data.streakMilestonesClaimed || [];

    if (claimed.includes(milestoneDays)) return;

    const newClaimed = [...claimed, milestoneDays];
    const currentPoints = data.tacticalPoints || 0;
    const newPoints = currentPoints + bonusExp;
    // Hadiahi tambahan 1 Streak Freeze di milestone 7 dan 21 hari
    const currentFreezes = data.streakFreezesCount ?? 1;
    const extraFreeze = (milestoneDays === 7 || milestoneDays === 21) ? 1 : 0;

    await updateDoc(userRef, {
      streakMilestonesClaimed: newClaimed,
      tacticalPoints: newPoints,
      streakFreezesCount: currentFreezes + extraFreeze,
      updatedAt: new Date().toISOString()
    });
    return { newPoints, streakFreezesCount: currentFreezes + extraFreeze };
  } catch (error) {
    handleFirestoreError(error, 'update', path);
  }
}

// Ambil daftar tim GERANAT untuk E-Voting Juara Terfavorit
export async function getGeranatTeams() {
  const path = 'geranat_teams';
  try {
    const snap = await getDocs(collection(firestore, 'geranat_teams'));
    if (!snap.empty) {
      return snap.docs.map(d => ({ ...d.data(), id: d.id }));
    }
    return [];
  } catch (error) {
    console.warn('Geranat teams fetch warning:', error);
    return [];
  }
}

// Tambah / Simpan Tim GERANAT (Admin Mako)
export async function saveGeranatTeam(teamData) {
  const teamId = teamData.teamId || `TEAM-${Date.now().toString(36).toUpperCase()}`;
  const path = `geranat_teams/${teamId}`;
  try {
    const payload = {
      ...teamData,
      teamId,
      votesCount: teamData.votesCount || 0,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(firestore, 'geranat_teams', teamId), payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, 'create', path);
  }
}

// Submit E-Voting Berbayar Rp1.000 (QRIS Statis / Otomatis)
export async function submitGeranatVote(teamId, voterUid, voterName, votes, amount, txId) {
  const finalTxId = txId || `VOTE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const txPath = `voting_transactions/${finalTxId}`;

  try {
    const nowIso = new Date().toISOString();
    // 1. Simpan atau update transaksi voting menjadi lunas
    const txPayload = {
      txId: finalTxId,
      teamId,
      voterUid: voterUid || 'anonymous',
      voterName: voterName || 'Pendukung Setia',
      votes: Number(votes) || 1,
      amount: Number(amount) || 1000,
      paymentMethod: 'QRIS Statis Mako',
      status: 'lunas',
      verifiedAt: nowIso,
      verifiedVia: 'auto_mutation',
      createdAt: nowIso
    };
    await setDoc(doc(firestore, 'voting_transactions', finalTxId), txPayload, { merge: true });

    // 2. Tambah akumulasi suara & total dana pada tim
    const teamRef = doc(firestore, 'geranat_teams', teamId);
    const teamSnap = await getDoc(teamRef);
    if (teamSnap.exists()) {
      const currentVotes = teamSnap.data().votesCount || 0;
      const currentAmount = teamSnap.data().totalAmountReceived || (currentVotes * 1000);
      await updateDoc(teamRef, {
        votesCount: currentVotes + Number(votes),
        totalAmountReceived: currentAmount + Number(amount || votes * 1000),
        lastVoteAt: nowIso,
        updatedAt: nowIso
      });
    }

    return txPayload;
  } catch (error) {
    handleFirestoreError(error, 'create', txPath);
  }
}

// Buat transaksi voting berstatus PENDING saat modal QRIS dibuka (Batas 15 Menit)
export async function createPendingVoteTransaction({ txId, teamId, teamName, voterUid, voterName, votes, amount }) {
  const finalTxId = txId || `VOTE-${Date.now().toString(36).toUpperCase()}`;
  const now = Date.now();
  const expiresAt = new Date(now + 15 * 60 * 1000).toISOString();
  const payload = {
    txId: finalTxId,
    teamId: teamId || 'team-1',
    teamName: teamName || 'Tim Kontingen GERANAT',
    voterUid: voterUid || auth.currentUser?.uid || 'anonymous',
    voterName: voterName || auth.currentUser?.displayName || 'Pendukung Setia',
    votes: Number(votes) || 1,
    amount: Number(amount) || 1000,
    paymentMethod: 'QRIS Statis Mako',
    status: 'pending',
    expiresAt,
    createdAt: new Date(now).toISOString()
  };
  try {
    await setDoc(doc(firestore, 'voting_transactions', finalTxId), payload);
    return payload;
  } catch (err) {
    console.warn('Create pending vote transaction note:', err);
    return payload;
  }
}

// Batalkan transaksi voting saat waktu 15 menit habis (TIDAK menambah votesCount)
export async function cancelExpiredVoteTransaction(txId, cancelReason = 'timeout_15min') {
  if (!txId) return null;
  try {
    const txRef = doc(firestore, 'voting_transactions', txId);
    const snap = await getDoc(txRef);
    if (snap.exists() && snap.data().status === 'lunas') {
      return snap.data(); // Sudah lunas, jangan batalkan
    }
    const updateData = {
      status: 'batal',
      cancelReason,
      cancelledAt: new Date().toISOString()
    };
    await setDoc(txRef, updateData, { merge: true });
    return updateData;
  } catch (err) {
    console.warn('Cancel expired vote transaction warning:', err);
    return null;
  }
}

// Listener Real-Time (onSnapshot) untuk 1 dokumen transaksi voting
export function subscribeToVoteTransaction(txId, onUpdate) {
  if (!txId || typeof onUpdate !== 'function') return () => {};
  const txRef = doc(firestore, 'voting_transactions', txId);
  return onSnapshot(
    txRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate({ id: snap.id, ...snap.data() });
      }
    },
    (err) => console.warn('Vote transaction listener warning:', err)
  );
}

// Listener Real-Time (onSnapshot) untuk klasemen seluruh tim GERANAT
export function subscribeToGeranatTeams(onUpdate) {
  if (typeof onUpdate !== 'function') return () => {};
  const colRef = collection(firestore, 'geranat_teams');
  return onSnapshot(
    colRef,
    (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        onUpdate(list);
      } else {
        onUpdate([]);
      }
    },
    (err) => console.warn('Geranat teams realtime listener warning:', err)
  );
}

// Listener Real-Time (onSnapshot) untuk Live Voting Ticker (10 suara terakhir yang lunas)
export function subscribeToRecentVotes(onUpdate, maxCount = 10) {
  if (typeof onUpdate !== 'function') return () => {};
  const colRef = collection(firestore, 'voting_transactions');
  return onSnapshot(
    colRef,
    (snap) => {
      const items = snap.docs
        .map(d => ({ ...d.data(), id: d.id }))
        .filter(tx => tx.status === 'lunas')
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, maxCount);
      onUpdate(items);
    },
    (err) => console.warn('Recent votes ticker listener warning:', err)
  );
}

// Ambil data Portal Peserta berdasarkan Token Unik
export async function getParticipantPortal(token) {
  if (!token) return null;
  const path = `participant_portals/${token}`;
  try {
    const snap = await getDoc(doc(firestore, 'participant_portals', token));
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.warn('Participant portal get warning:', error);
    return null;
  }
}

// Simpan / Perbarui data Portal Peserta
export async function saveParticipantPortal(portalData) {
  if (!portalData || !portalData.token) return;
  const path = `participant_portals/${portalData.token}`;
  try {
    const payload = {
      ...portalData,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(firestore, 'participant_portals', portalData.token), payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, 'create', path);
  }
}

// Perbarui berkas peserta di Portal Peserta
export async function updateParticipantDocument(token, docId, updates) {
  if (!token || !docId) return;
  const path = `participant_portals/${token}`;
  try {
    const docRef = doc(firestore, 'participant_portals', token);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    const currentDocs = snap.data().documents || [];
    const updatedDocs = currentDocs.map(d => d.id === docId ? { ...d, ...updates } : d);
    await updateDoc(docRef, {
      documents: updatedDocs,
      updatedAt: new Date().toISOString()
    });
    return updatedDocs;
  } catch (error) {
    handleFirestoreError(error, 'update', path);
  }
}

// Daftar Akun Admin yang berwenang mengubah rekening bank Mako
export const AUTHORIZED_BANK_ADMINS = ['unjmenwa@gmail.com', 'rafflysyahpoetra@gmail.com'];

// Ambil konfigurasi rekening bank resmi & status verifikasi 2-admin
export async function getBankConfigWithProposal() {
  try {
    const configSnap = await getDoc(doc(firestore, 'settings', 'bank_account_config'));
    const proposalSnap = await getDoc(doc(firestore, 'settings', 'bank_verification_proposal'));

    const activeConfig = configSnap.exists() ? configSnap.data() : null;
    const pendingProposal = proposalSnap.exists() ? proposalSnap.data() : null;

    return {
      activeConfig,
      pendingProposal
    };
  } catch (error) {
    console.warn('Bank config & proposal fetch warning:', error);
    return { activeConfig: null, pendingProposal: null };
  }
}

// Ambil konfigurasi rekening bank & QRIS Statis aktif (/settings/bank_qris, bank_account_config, qris_bank_config)
export async function getBankQRISConfig() {
  try {
    // 1. Cek /settings/bank_qris terlebih dahulu sesuai spesifikasi V8
    const bankQrisSnap = await getDoc(doc(firestore, 'settings', 'bank_qris'));
    if (bankQrisSnap.exists() && bankQrisSnap.data()?.accountNumber) {
      return bankQrisSnap.data();
    }
    // 2. Cek bank_account_config
    const snap = await getDoc(doc(firestore, 'settings', 'bank_account_config'));
    if (snap.exists() && snap.data()?.accountNumber) {
      return snap.data();
    }
    // 3. Fallback ke qris_bank_config
    const legacySnap = await getDoc(doc(firestore, 'settings', 'qris_bank_config'));
    if (legacySnap.exists()) {
      return legacySnap.data();
    }
    return null;
  } catch (error) {
    console.warn('Bank QRIS config fetch warning:', error);
    return null;
  }
}

// Catat Audit Log ke koleksi /audit_logs/{logId}
export async function createAuditLog({
  actorEmail,
  actorUid,
  action,
  targetCollection,
  targetDocId,
  previousValue = null,
  newValue = null
}) {
  try {
    const logId = `AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const payload = {
      logId,
      actorEmail: actorEmail || auth.currentUser?.email || 'system@menwa.unj',
      actorUid: actorUid || auth.currentUser?.uid || 'system',
      action,
      targetCollection,
      targetDocId,
      previousValue,
      newValue,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server'
    };
    await setDoc(doc(firestore, 'audit_logs', logId), payload);
    return payload;
  } catch (err) {
    console.warn('Audit log write warning:', err);
    return null;
  }
}

export async function getAuditLogs() {
  try {
    const snap = await getDocs(collection(firestore, 'audit_logs'));
    return snap.docs
      .map(d => ({ ...d.data(), id: d.id }))
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
  } catch (err) {
    console.warn('Audit logs fetch warning:', err);
    return [];
  }
}

// Pengajuan perubahan rekening bank oleh Admin 1 (Memerlukan Verifikasi Admin 2)
export async function proposeBankConfigUpdate({ bankName, accountNumber, accountHolder, qrisPayload, userEmail }) {
  if (!userEmail || !AUTHORIZED_BANK_ADMINS.includes(userEmail.toLowerCase())) {
    throw new Error('Hanya akun unjmenwa@gmail.com dan rafflysyahpoetra@gmail.com yang berhak mengajukan perubahan bank.');
  }

  const changeId = `BANK-PROP-${Date.now()}`;
  const proposalData = {
    changeId,
    type: 'BANK_ACCOUNT_UPDATE',
    proposedBankName: bankName.trim(),
    proposedAccountNumber: accountNumber.trim(),
    proposedAccountHolder: accountHolder.trim(),
    proposedQrisPayload: qrisPayload || `00020101021126610014ID.CO.BANKMANDIRI.WWW01189360000801123456780215${accountNumber.trim()}0303UMI5204541153033605802ID5921${accountHolder.trim().substring(0, 21)}6007JAKARTA6105132206304A1B2`,
    proposedBy: userEmail.toLowerCase(),
    proposedAt: new Date().toISOString(),
    status: 'PENDING_APPROVAL'
  };

  // Simpan ke koleksi PendingChanges
  await setDoc(doc(firestore, 'PendingChanges', changeId), proposalData);
  // Simpan juga ke pointer aktif di settings/bank_verification_proposal
  await setDoc(doc(firestore, 'settings', 'bank_verification_proposal'), proposalData);

  await createAuditLog({
    actorEmail: userEmail.toLowerCase(),
    action: 'BANK_CHANGE_PROPOSED',
    targetCollection: 'PendingChanges',
    targetDocId: changeId,
    newValue: proposalData
  });

  return proposalData;
}

// Persetujuan perubahan rekening bank oleh Admin 2 (2-Person Verification)
export async function approveBankConfigProposal(approverEmail) {
  if (!approverEmail || !AUTHORIZED_BANK_ADMINS.includes(approverEmail.toLowerCase())) {
    throw new Error('Hanya akun unjmenwa@gmail.com dan rafflysyahpoetra@gmail.com yang dapat menyetujui.');
  }

  const proposalRef = doc(firestore, 'settings', 'bank_verification_proposal');
  const proposalSnap = await getDoc(proposalRef);
  if (!proposalSnap.exists()) {
    throw new Error('Tidak ada pengajuan perubahan rekening yang menunggu persetujuan.');
  }

  const proposal = proposalSnap.data();
  if (proposal.status !== 'PENDING_APPROVAL') {
    throw new Error('Pengajuan ini sudah tidak dalam status menunggu persetujuan.');
  }

  // Verifikasi 2 akun berbeda: Admin yang menginput TIDAK BISA menyetujui sendiri
  if (proposal.proposedBy.toLowerCase() === approverEmail.toLowerCase()) {
    throw new Error('Verifikasi 2 Admin (2-Verification): Anda tidak dapat menyetujui pengajuan Anda sendiri. Persetujuan harus dilakukan oleh akun admin lainnya.');
  }

  const newActiveConfig = {
    bankName: proposal.proposedBankName,
    accountNumber: proposal.proposedAccountNumber,
    accountHolder: proposal.proposedAccountHolder,
    qrisPayload: proposal.proposedQrisPayload || `00020101021126610014ID.CO.BANKMANDIRI.WWW01189360000801123456780215${proposal.proposedAccountNumber}0303UMI5204541153033605802ID5921${proposal.proposedAccountHolder.substring(0, 21)}6007JAKARTA6105132206304A1B2`,
    updatedAt: new Date().toISOString(),
    proposedBy: proposal.proposedBy,
    lastApprovedBy: approverEmail.toLowerCase(),
    status: 'ACTIVE'
  };

  // Simpan ke konfigurasi aktif bank (/settings/bank_qris, bank_account_config, qris_bank_config)
  await setDoc(doc(firestore, 'settings', 'bank_qris'), newActiveConfig, { merge: true });
  await setDoc(doc(firestore, 'settings', 'bank_account_config'), newActiveConfig);
  await setDoc(doc(firestore, 'settings', 'qris_bank_config'), newActiveConfig, { merge: true });

  // Update status proposal menjadi APPROVED di settings
  await updateDoc(proposalRef, {
    status: 'APPROVED',
    approvedBy: approverEmail.toLowerCase(),
    approvedAt: new Date().toISOString()
  });

  // Update juga status di koleksi PendingChanges
  if (proposal.changeId) {
    try {
      await updateDoc(doc(firestore, 'PendingChanges', proposal.changeId), {
        status: 'APPROVED',
        approvedBy: approverEmail.toLowerCase(),
        approvedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('PendingChanges update warning:', e);
    }
  }

  await createAuditLog({
    actorEmail: approverEmail.toLowerCase(),
    action: 'BANK_CHANGE_APPROVED',
    targetCollection: 'settings',
    targetDocId: 'bank_qris',
    previousValue: proposal,
    newValue: newActiveConfig
  });

  return newActiveConfig;
}

// Penolakan pengajuan perubahan rekening bank oleh Admin rekan
export async function rejectBankConfigProposal(rejecterEmail, reason = '') {
  if (!rejecterEmail || !AUTHORIZED_BANK_ADMINS.includes(rejecterEmail.toLowerCase())) {
    throw new Error('Akses ditolak.');
  }

  const proposalRef = doc(firestore, 'settings', 'bank_verification_proposal');
  const proposalSnap = await getDoc(proposalRef);
  if (!proposalSnap.exists()) return;

  const proposal = proposalSnap.data();
  if (proposal.proposedBy.toLowerCase() === rejecterEmail.toLowerCase()) {
    await updateDoc(proposalRef, {
      status: 'CANCELLED_BY_PROPOSER',
      cancelledAt: new Date().toISOString()
    });
    if (proposal.changeId) {
      await updateDoc(doc(firestore, 'PendingChanges', proposal.changeId), {
        status: 'CANCELLED_BY_PROPOSER',
        cancelledAt: new Date().toISOString()
      }).catch(() => {});
    }
    return;
  }

  await updateDoc(proposalRef, {
    status: 'REJECTED',
    rejectedBy: rejecterEmail.toLowerCase(),
    rejectedAt: new Date().toISOString(),
    rejectReason: reason
  });

  if (proposal.changeId) {
    await updateDoc(doc(firestore, 'PendingChanges', proposal.changeId), {
      status: 'REJECTED',
      rejectedBy: rejecterEmail.toLowerCase(),
      rejectedAt: new Date().toISOString(),
      rejectReason: reason
    }).catch(() => {});
  }

  await createAuditLog({
    actorEmail: rejecterEmail.toLowerCase(),
    action: 'BANK_CHANGE_REJECTED',
    targetCollection: 'PendingChanges',
    targetDocId: proposal.changeId || 'bank_verification_proposal',
    previousValue: proposal,
    newValue: { status: 'REJECTED', reason }
  });
}

// Ambil riwayat PendingChanges untuk Audit Trail Admin
export async function getPendingChangesList() {
  try {
    const snap = await getDocs(collection(firestore, 'PendingChanges'));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  } catch (error) {
    console.warn('PendingChanges list fetch warning:', error);
    return [];
  }
}

// Simpan langsung (untuk fallback atau admin super)
export async function saveBankQRISConfig(config) {
  const path = 'settings/bank_account_config';
  try {
    const payload = {
      ...config,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(firestore, 'settings', 'bank_qris'), payload, { merge: true });
    await setDoc(doc(firestore, 'settings', 'bank_account_config'), payload, { merge: true });
    await setDoc(doc(firestore, 'settings', 'qris_bank_config'), payload, { merge: true });
    return payload;
  } catch (error) {
    handleFirestoreError(error, 'write', path);
  }
}

// ============================================================================
// KOLEKSI V8 BARU: Content Registry, Command Center Logs, Notifications, Tasks
// ============================================================================

// Konversi gambar raster (PNG/JPG/WebP) ke format SVG terbungkus & simpan ke Storage/Firestore
export async function uploadAndConvertToSVG(fileDataUrl, originalFileName, tabId = 'beranda') {
  return new Promise((resolve) => {
    const isAlreadySvg = originalFileName?.toLowerCase().endsWith('.svg') || fileDataUrl?.startsWith('data:image/svg+xml');
    if (isAlreadySvg) {
      resolve({
        svgDataUrl: fileDataUrl,
        format: 'svg',
        convertedFromFormat: 'svg',
        dimensions: { width: 1200, height: 675 }
      });
      return;
    }

    const img = new Image();
    img.onload = async () => {
      const width = img.naturalWidth || 1200;
      const height = img.naturalHeight || 675;
      const ext = (originalFileName?.split('.').pop() || 'png').toLowerCase();
      const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><image href="${fileDataUrl}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"/></svg>`;
      const svgBase64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgMarkup)))}`;

      let storageUrl = svgBase64;
      try {
        const cleanName = (originalFileName || 'asset').replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');
        const path = `assets/svg/${tabId}/${cleanName}-${Date.now()}.svg`;
        const sRef = storageRef(storage, path);
        await uploadString(sRef, svgMarkup, 'raw', { contentType: 'image/svg+xml' });
        storageUrl = await getDownloadURL(sRef);
      } catch {
        // Fallback ke data URL SVG apabila bucket storage belum diaktifkan
        storageUrl = svgBase64;
      }

      resolve({
        svgDataUrl: storageUrl,
        format: 'svg',
        convertedFromFormat: ext,
        dimensions: { width, height },
        fileSize: Math.round((svgBase64.length * 3) / 4)
      });
    };
    img.onerror = () => {
      resolve({
        svgDataUrl: fileDataUrl,
        format: 'svg',
        convertedFromFormat: 'png',
        dimensions: { width: 800, height: 600 },
        fileSize: Math.round(((fileDataUrl || '').length * 3) / 4)
      });
    };
    img.src = fileDataUrl;
  });
}

// Simpan atau perbarui item di /content_registry/{contentId}
export async function saveContentRegistryItem(item) {
  const contentId = item.contentId || `CNT-${Date.now().toString(36).toUpperCase()}`;
  try {
    const payload = {
      ...item,
      contentId,
      updatedBy: item.updatedBy || auth.currentUser?.email || 'unjmenwa@gmail.com',
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(firestore, 'content_registry', contentId), payload, { merge: true });
    return payload;
  } catch (err) {
    console.warn('Content registry save warning:', err);
    return { ...item, contentId };
  }
}

export async function getContentRegistryItems() {
  try {
    const snap = await getDocs(collection(firestore, 'content_registry'));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  } catch (err) {
    console.warn('Content registry get warning:', err);
    return [];
  }
}

export function subscribeToContentRegistry(onUpdate) {
  if (typeof onUpdate !== 'function') return () => {};
  return onSnapshot(
    collection(firestore, 'content_registry'),
    (snap) => {
      onUpdate(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    },
    (err) => console.warn('Content registry listener warning:', err)
  );
}

// Simpan log eksekusi AI Agent Command Center ke /command_center_logs/{logId}
export async function saveCommandCenterLog(logData) {
  const logId = logData.logId || `CCLOG-${Date.now()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  try {
    const payload = {
      logId,
      prompt: logData.prompt || '',
      parsedIntent: logData.parsedIntent || 'modify_content',
      targetTab: logData.targetTab || 'beranda',
      actionsExecuted: logData.actionsExecuted || [],
      status: logData.status || 'completed',
      executedBy: logData.executedBy || auth.currentUser?.email || 'unjmenwa@gmail.com',
      executedAt: new Date().toISOString(),
      rollbackAvailable: logData.rollbackAvailable ?? true,
      snapshotBefore: logData.snapshotBefore || null
    };
    await setDoc(doc(firestore, 'command_center_logs', logId), payload);
    return payload;
  } catch (err) {
    console.warn('Command center log warning:', err);
    return null;
  }
}

export async function getCommandCenterLogs() {
  try {
    const snap = await getDocs(collection(firestore, 'command_center_logs'));
    return snap.docs
      .map(d => ({ ...d.data(), id: d.id }))
      .sort((a, b) => new Date(b.executedAt || 0).getTime() - new Date(a.executedAt || 0).getTime());
  } catch (err) {
    console.warn('Command center logs fetch warning:', err);
    return [];
  }
}

// Simpan notifikasi in-app ke /notifications/{notifId}
export async function createSystemNotification(notifData) {
  const notifId = `NOTIF-${Date.now()}`;
  try {
    const payload = {
      notifId,
      targetEmails: notifData.targetEmails || AUTHORIZED_BANK_ADMINS,
      type: notifData.type || 'system_alert',
      title: notifData.title || 'Notifikasi Mako',
      message: notifData.message || '',
      actionUrl: notifData.actionUrl || '/mako-ops',
      readBy: [],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    await setDoc(doc(firestore, 'notifications', notifId), payload);
    return payload;
  } catch (err) {
    console.warn('Create notification warning:', err);
    return null;
  }
}

// Simpan scheduled task ke /scheduled_tasks/{taskId}
export async function createScheduledTask(taskData) {
  const taskId = `TASK-${Date.now()}`;
  try {
    const payload = {
      taskId,
      taskType: taskData.taskType || 'auto_maintain',
      description: taskData.description || '',
      targetTab: taskData.targetTab || 'beranda',
      payload: taskData.payload || {},
      scheduledFor: taskData.scheduledFor || new Date(Date.now() + 3600000).toISOString(),
      status: 'scheduled',
      createdBy: auth.currentUser?.email || 'unjmenwa@gmail.com',
      createdAt: new Date().toISOString(),
      executedAt: null
    };
    await setDoc(doc(firestore, 'scheduled_tasks', taskId), payload);
    return payload;
  } catch (err) {
    console.warn('Create scheduled task warning:', err);
    return null;
  }
}

export async function getScheduledTasks() {
  try {
    const snap = await getDocs(collection(firestore, 'scheduled_tasks'));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  } catch (err) {
    console.warn('Get scheduled tasks warning:', err);
    return [];
  }
}

export default app;



