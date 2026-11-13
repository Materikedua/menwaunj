import { orderBy, limit, type Unsubscribe } from 'firebase/firestore';
import {
  firestore,
  auth,
  handleFirestoreError,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  onSnapshot,
  onAuthStateChanged,
} from '../firebase.js';
import {
  registerSiteConfigCloudBridge,
  applyRemoteSiteContent,
  applyRemoteAdminuTickets,
  type SiteCmsContent,
  type AdminuPamTicket,
} from '../data/siteConfig';
import { sanitizeInput } from '../utils/security';

const CMS_COLLECTION = 'site_cms_config';
const CMS_DOC_ID = 'menwaunj_primary_v9';
const ADMINU_COLLECTION = 'adminu_tickets';
const SUPER_ADMIN_EMAILS = ['unjmenwa@gmail.com', 'rafflysyahpoetra@gmail.com'];

let isBridgeInitialized = false;

async function checkIsFirebaseStaffOfficer(): Promise<boolean> {
  const current = auth.currentUser;
  if (!current || current.isAnonymous) return false;
  const email = (current.email || '').toLowerCase();
  if (current.emailVerified && SUPER_ADMIN_EMAILS.includes(email)) {
    return true;
  }
  try {
    const adminDoc = await getDoc(doc(firestore, 'admins', current.uid));
    if (adminDoc.exists()) return true;
    const userDoc = await getDoc(doc(firestore, 'users', current.uid));
    const role = userDoc.exists() ? String(userDoc.data()?.role || '') : '';
    return ['superadmin', 'dansat', 'wadansat', 'staf_adminu', 'admin'].includes(role);
  } catch {
    return false;
  }
}

function buildFirestoreTicketPayload(ticket: AdminuPamTicket): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    ticketId: ticket.ticketId,
    createdAt: ticket.createdAt,
    applicantName: ticket.applicantName,
    institution: ticket.institution,
    contactPhone: ticket.contactPhone,
    serviceCategory: ticket.serviceCategory,
    serviceLabel: ticket.serviceLabel,
    eventName: ticket.eventName,
    eventDate: ticket.eventDate,
    eventLocation: ticket.eventLocation,
    personnelRequested: Number(ticket.personnelRequested) || 4,
    letterNumber: ticket.letterNumber,
    status: ticket.status,
    statusNote: ticket.statusNote,
  };
  if (ticket.contactEmail) {
    payload.contactEmail = ticket.contactEmail;
  }
  if (ticket.notes) {
    payload.notes = ticket.notes;
  }
  if (ticket.attachmentPdfName) {
    payload.attachmentPdfName = ticket.attachmentPdfName;
  }
  if (ticket.attachmentPdfUrl) {
    payload.attachmentPdfUrl = ticket.attachmentPdfUrl;
  }
  if (typeof ticket.attachmentPdfSizeKb === 'number') {
    payload.attachmentPdfSizeKb = ticket.attachmentPdfSizeKb;
  }
  if (ticket.linkedLetterNumber) {
    payload.linkedLetterNumber = ticket.linkedLetterNumber;
  }
  return payload;
}

export function registerFirebaseCloudBridge(): void {
  registerSiteConfigCloudBridge({
    isAuthenticatedForCloudWrite: () =>
      Boolean(auth.currentUser && !auth.currentUser.isAnonymous),

    async syncCmsToCloud(content: SiteCmsContent): Promise<boolean> {
      const current = auth.currentUser;
      if (!current || current.isAnonymous) {
        return false;
      }
      const isStaff = await checkIsFirebaseStaffOfficer();
      if (!isStaff) {
        return false;
      }
      const path = `${CMS_COLLECTION}/${CMS_DOC_ID}`;
      try {
        await setDoc(doc(firestore, CMS_COLLECTION, CMS_DOC_ID), content);
        return true;
      } catch (error) {
        handleFirestoreError(error, 'write', path);
        return false;
      }
    },

    async createAdminuTicketInCloud(ticket: AdminuPamTicket): Promise<boolean> {
      const path = `${ADMINU_COLLECTION}/${ticket.ticketId}`;
      try {
        const payload = buildFirestoreTicketPayload(ticket);
        await setDoc(doc(firestore, ADMINU_COLLECTION, ticket.ticketId), payload);
        return true;
      } catch (error) {
        console.warn('Sinkronisasi tiket Smart Adminu ke Firestore tertunda:', error);
        return false;
      }
    },

    async updateAdminuTicketInCloud(
      ticketId: string,
      status: AdminuPamTicket['status'],
      statusNote: string
    ): Promise<boolean> {
      const current = auth.currentUser;
      if (!current || current.isAnonymous) {
        return false;
      }
      const isStaff = await checkIsFirebaseStaffOfficer();
      if (!isStaff) {
        return false;
      }
      const safeId = sanitizeInput(ticketId, 40).toUpperCase();
      const path = `${ADMINU_COLLECTION}/${safeId}`;
      try {
        await updateDoc(doc(firestore, ADMINU_COLLECTION, safeId), {
          status,
          statusNote: sanitizeInput(statusNote, 400),
        });
        return true;
      } catch (error) {
        handleFirestoreError(error, 'update', path);
        return false;
      }
    },
  });
}

export function initFirebaseCmsBridge(): () => void {
  registerFirebaseCloudBridge();
  if (typeof window === 'undefined') {
    return () => {};
  }
  if (isBridgeInitialized) {
    return () => {};
  }
  isBridgeInitialized = true;

  let unsubTickets: Unsubscribe | null = null;
  let cancelled = false;

  const cmsDocRef = doc(firestore, CMS_COLLECTION, CMS_DOC_ID);
  const unsubCms = onSnapshot(
    cmsDocRef,
    (snap) => {
      if (snap.exists()) {
        applyRemoteSiteContent(snap.data() as Partial<SiteCmsContent>);
      }
    },
    (err) => {
      console.warn('Listener CMS Firebase note:', err);
    }
  );

  const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
    if (unsubTickets) {
      unsubTickets();
      unsubTickets = null;
    }
    if (!fbUser || fbUser.isAnonymous) return;

    const isStaff = await checkIsFirebaseStaffOfficer();
    if (!isStaff || cancelled) return;

    const ticketsQuery = query(
      collection(firestore, ADMINU_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    unsubTickets = onSnapshot(
      ticketsQuery,
      (snapshot) => {
        const remoteList = snapshot.docs.map((d) => d.data() as AdminuPamTicket);
        if (remoteList.length > 0) {
          applyRemoteAdminuTickets(remoteList);
        }
      },
      (err) => {
        console.warn('Listener tiket Smart Adminu Firebase note:', err);
      }
    );
  });

  return () => {
    cancelled = true;
    isBridgeInitialized = false;
    unsubCms();
    unsubAuth();
    if (unsubTickets) {
      unsubTickets();
      unsubTickets = null;
    }
  };
}

export async function findAvailablePamTicketSeq(startSeq: number): Promise<number> {
  const base = Math.max(104, Math.floor(startSeq));
  try {
    for (let offset = 0; offset < 12; offset += 1) {
      const candidateSeq = base + offset;
      const candidateId = `PAM-2026-${String(candidateSeq).padStart(3, '0')}`;
      const snap = await getDoc(doc(firestore, ADMINU_COLLECTION, candidateId));
      if (!snap.exists()) {
        return candidateSeq;
      }
    }
    return 10000 + Math.floor(Math.random() * 89999);
  } catch {
    return base;
  }
}

export async function lookupRemoteAdminuTicket(rawCode: string): Promise<AdminuPamTicket | null> {
  const clean = sanitizeInput(rawCode, 60).toUpperCase().replace(/\s+/g, '');
  if (!/^PAM-2026-[0-9]{3,6}$/.test(clean)) {
    return null;
  }
  try {
    const snap = await getDoc(doc(firestore, ADMINU_COLLECTION, clean));
    if (!snap.exists()) return null;
    return snap.data() as AdminuPamTicket;
  } catch (error) {
    console.warn('Pencarian tiket Firestore note:', error);
    return null;
  }
}

export async function linkLetterToAdminuTicketInCloud(
  ticketId: string,
  letterNumber: string
): Promise<boolean> {
  const cleanTicketId = sanitizeInput(ticketId, 40).toUpperCase().replace(/\s+/g, '');
  const cleanLetterNumber = sanitizeInput(letterNumber, 80);
  if (!/^PAM-2026-[0-9]{3,6}$/.test(cleanTicketId) || !cleanLetterNumber) {
    return false;
  }
  try {
    await updateDoc(doc(firestore, ADMINU_COLLECTION, cleanTicketId), {
      linkedLetterNumber: cleanLetterNumber,
    });
    return true;
  } catch (err) {
    console.warn('Tautan nomor surat ke tiket Firestore note:', err);
    return false;
  }
}
