import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  auth, 
  firestore, 
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile as fbUpdateProfile,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addTacticalPoints as fbAddTacticalPoints,
  saveCertificate as fbSaveCertificate,
  getUserCertificates as fbGetUserCertificates,
  resetUserPassword as fbResetUserPassword
} from '../firebase';

export const AuthContext = createContext(null);

// Helper to fetch user profile document from Firestore
async function fetchUserProfile(uid) {
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(firestore, 'users', uid));
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn('Error fetching user profile:', err);
  }
  return null;
}

// Custom hook logic
export function useProvideAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [certificatesLoading, setCertificatesLoading] = useState(false);

  const [claims, setClaims] = useState({});

  const loadSubmissions = useCallback(async (uid) => {
    if (!uid) return;
    setSubmissionsLoading(true);
    try {
      const q = query(
        collection(firestore, 'forms_submissions'),
        where('applicantUid', '==', uid)
      );
      const snap = await getDocs(q);
      setSubmissions(snap.docs.map(d => d.data()));
    } catch (err) {
      console.warn('Error fetching submissions:', err);
    } finally {
      setSubmissionsLoading(false);
    }
  }, []);

  const loadCertificates = useCallback(async (uid) => {
    if (!uid) return;
    setCertificatesLoading(true);
    try {
      const certs = await fbGetUserCertificates(uid);
      setCertificates(certs);
    } catch (err) {
      console.warn('Error fetching certificates:', err);
    } finally {
      setCertificatesLoading(false);
    }
  }, []);

  // Monitor auth state changes & propagate role claims
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setError(null);
      if (currentUser) {
        try {
          let tokenClaims = {};
          try {
            const tokenResult = await currentUser.getIdTokenResult();
            tokenClaims = tokenResult?.claims || {};
          } catch (tokErr) {
            console.warn('Claims fetch notice:', tokErr);
          }
          setClaims(tokenClaims);

          const prof = await fetchUserProfile(currentUser.uid);
          const emailLower = currentUser.email?.toLowerCase();
          const isSuperAdminEmail = emailLower === 'unjmenwa@gmail.com' || emailLower === 'rafflysyahpoetra@gmail.com';

          setProfile(prof || {
            uid: currentUser.uid,
            displayName: currentUser.displayName || '',
            email: currentUser.email || '',
            institution: 'Universitas Negeri Jakarta',
            occupation: 'Mahasiswa',
            birthDate: '',
            phone: '',
            isMenwaMember: isSuperAdminEmail,
            menwaNia: isSuperAdminEmail ? 'MENWA-UNJ-COMMANDER' : '',
            isVerifiedMenwa: isSuperAdminEmail,
            role: isSuperAdminEmail ? 'admin' : 'member',
            tacticalPoints: 0,
            lastQuizDate: ''
          });
          loadSubmissions(currentUser.uid);
          loadCertificates(currentUser.uid);
        } catch (e) {
          console.error('Failed to load user profile:', e);
        }
      } else {
        setProfile(null);
        setClaims({});
        setSubmissions([]);
        setCertificates([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadSubmissions, loadCertificates]);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedUser = result.user;
      
      const userRef = doc(firestore, 'users', loggedUser.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        const initialData = {
          uid: loggedUser.uid,
          email: loggedUser.email || '',
          displayName: loggedUser.displayName || 'Anggota Pengunjung',
          institution: 'Universitas Negeri Jakarta',
          occupation: 'Mahasiswa',
          birthDate: '',
          phone: '',
          isMenwaMember: false,
          menwaNia: '',
          isVerifiedMenwa: false,
          tacticalPoints: 0,
          lastQuizDate: '',
          updatedAt: new Date().toISOString()
        };
        await setDoc(userRef, initialData);
        setProfile(initialData);
      } else {
        setProfile(snap.data());
      }
      loadSubmissions(loggedUser.uid);
      loadCertificates(loggedUser.uid);
      return loggedUser;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      throw err;
    }
  }, [loadSubmissions, loadCertificates]);

  // Register with Email and Password
  const registerWithEmail = useCallback(async (
    email, 
    password, 
    displayName = '', 
    institution = 'Universitas Negeri Jakarta', 
    occupation = 'Mahasiswa', 
    birthDate = '', 
    phone = ''
  ) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = cred.user;
      if (displayName) {
        await fbUpdateProfile(newUser, { displayName });
      }
      const newProfileData = {
        uid: newUser.uid,
        email: newUser.email || email,
        displayName: displayName || newUser.displayName || 'Anggota Pengguna',
        institution: institution || 'Universitas Negeri Jakarta',
        occupation: occupation || 'Mahasiswa',
        birthDate: birthDate || '',
        phone: phone || '',
        isMenwaMember: false,
        menwaNia: '',
        isVerifiedMenwa: false,
        tacticalPoints: 0,
        lastQuizDate: '',
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(firestore, 'users', newUser.uid), newProfileData);
      setProfile(newProfileData);
      return newUser;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      throw err;
    }
  }, []);

  // Sign in with Email and Password
  const signInWithEmail = useCallback(async (email, password) => {
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const loggedUser = cred.user;
      const prof = await fetchUserProfile(loggedUser.uid);
      setProfile(prof);
      loadSubmissions(loggedUser.uid);
      loadCertificates(loggedUser.uid);
      return loggedUser;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      throw err;
    }
  }, [loadSubmissions, loadCertificates]);

  // Reset password via Gmail (Firebase Auth sendPasswordResetEmail)
  const resetPassword = useCallback(async (emailToReset) => {
    setError(null);
    try {
      await fbResetUserPassword(emailToReset);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      throw err;
    }
  }, []);

  // Sign out / Logout
  const signOut = useCallback(async () => {
    setError(null);
    try {
      await fbSignOut(auth);
      setUser(null);
      setProfile(null);
      setSubmissions([]);
      setCertificates([]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      throw err;
    }
  }, []);

  // Update profile
  const saveProfile = useCallback(async (newProfileData) => {
    if (!user) return;
    setError(null);
    try {
      const ref = doc(firestore, 'users', user.uid);
      await updateDoc(ref, {
        ...newProfileData,
        updatedAt: new Date().toISOString()
      });
      setProfile(prev => ({ ...prev, ...newProfileData }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      throw err;
    }
  }, [user]);

  // Klaim status anggota Menwa UNJ
  const claimMenwaMembership = useCallback(async (nia) => {
    if (!user) return;
    setError(null);
    try {
      const ref = doc(firestore, 'users', user.uid);
      const payload = {
        isMenwaMember: true,
        menwaNia: nia || '',
        updatedAt: new Date().toISOString()
      };
      await updateDoc(ref, payload);
      setProfile(prev => ({ ...prev, ...payload }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      throw err;
    }
  }, [user]);

  // Tambahkan poin gamifikasi
  const earnPoints = useCallback(async (points, quizDate) => {
    if (!user) return;
    try {
      const newPts = await fbAddTacticalPoints(user.uid, points, quizDate);
      setProfile(prev => ({ 
        ...prev, 
        tacticalPoints: newPts,
        lastQuizDate: quizDate || new Date().toISOString().split('T')[0]
      }));
      return newPts;
    } catch (err) {
      console.warn('Earn points error:', err);
    }
  }, [user]);

  // Simpan sertifikat pelatihan
  const awardCertificate = useCallback(async (certData) => {
    if (!user) return;
    try {
      const saved = await fbSaveCertificate(user.uid, certData);
      if (saved) {
        setCertificates(prev => [saved, ...prev.filter(c => c.certId !== saved.certId)]);
      }
      return saved;
    } catch (err) {
      console.warn('Award certificate error:', err);
    }
  }, [user]);

  const refreshSubmissions = useCallback(() => {
    if (user?.uid) {
      loadSubmissions(user.uid);
    }
  }, [user, loadSubmissions]);

  const refreshCertificates = useCallback(() => {
    if (user?.uid) {
      loadCertificates(user.uid);
    }
  }, [user, loadCertificates]);

  return {
    user,
    profile,
    loading,
    error,
    // Google Sign-In
    signInWithGoogle,
    loginWithGoogle: signInWithGoogle,
    // Email Registration
    registerWithEmail,
    signUpWithEmail: registerWithEmail,
    // Email Sign-In
    signInWithEmail,
    loginWithEmail: signInWithEmail,
    // Password Reset via Gmail
    resetPassword,
    sendPasswordReset: resetPassword,
    // Sign-out
    signOut,
    logout: signOut,
    logoutUser: signOut,
    // Profile Management
    saveProfile,
    updateProfile: saveProfile,
    updateUserProfile: saveProfile,
    claimMenwaMembership,
    earnPoints,
    awardCertificate,
    // Submissions & Certificates
    submissions,
    submissionsLoading,
    refreshSubmissions,
    certificates,
    certificatesLoading,
    refreshCertificates,
    // Status flags & Role Propagation
    claims,
    role: (user?.email && (user.email.toLowerCase() === 'unjmenwa@gmail.com' || user.email.toLowerCase() === 'rafflysyahpoetra@gmail.com')) || profile?.role === 'admin' || claims?.admin === true ? 'admin' : (profile?.role || 'member'),
    isVerifiedMenwa: !!(profile?.isVerifiedMenwa || (user?.email && (user.email.toLowerCase() === 'unjmenwa@gmail.com' || user.email.toLowerCase() === 'rafflysyahpoetra@gmail.com')) || claims?.verifiedMenwa),
    tacticalPoints: profile?.tacticalPoints || 0,
    isAdmin: !!(user && (
      user.email?.toLowerCase() === 'unjmenwa@gmail.com' || 
      user.email?.toLowerCase() === 'rafflysyahpoetra@gmail.com' || 
      profile?.role === 'admin' || 
      claims?.admin === true
    )),
    isSuperAdmin: !!(user && (
      user.email?.toLowerCase() === 'unjmenwa@gmail.com' || 
      user.email?.toLowerCase() === 'rafflysyahpoetra@gmail.com'
    ))
  };
}

// AuthProvider component for React tree
export function AuthProvider({ children }) {
  const authState = useProvideAuth();
  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

// Primary hook
export function useAuth() {
  const context = useContext(AuthContext);
  const standalone = useProvideAuth();
  return context || standalone;
}

export default useAuth;
