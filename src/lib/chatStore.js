import {
db, handleFirestoreError
}
from './firebase';
import {
collection, doc, setDoc, getDoc, getDocs, query, orderBy, onSnapshot, deleteDoc, serverTimestamp
}
from 'firebase/firestore';
export async function createChatSession(userId, initialTitle = 'Percakapan Baru') {
if (!userId) return null;
const sessionId = `SES-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
const path = `user_chats/${userId}/sessions`;
try {
const sessionRef = doc(db, 'user_chats', userId, 'sessions', sessionId);
await setDoc(sessionRef, {
sessionId, userId, title: initialTitle.substring(0, 150), lastMessage: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
return sessionId;
} catch (error) {
handleFirestoreError(error, 'create', path);
}
}
export async function getUserChatSessions(userId) {
if (!userId) return [];
const path = `user_chats/${userId}/sessions`;
try {
const q = query( collection(db, 'user_chats', userId, 'sessions') );
const snap = await getDocs(q);
const list = snap.docs.map(d => d.data());
// Urutkan berdasarkan updatedAt terbaru return list.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
} catch (error) {
handleFirestoreError(error, 'list', path);
return [];
}
}
export async function getSessionMessages(userId, sessionId) {
if (!userId || !sessionId) return [];
const path = `user_chats/${userId}/sessions/${sessionId}/messages`;
try {
const q = query( collection(db, 'user_chats', userId, 'sessions', sessionId, 'messages') );
const snap = await getDocs(q);
const msgs = snap.docs.map(d => d.data());
return msgs.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
} catch (error) {
handleFirestoreError(error, 'list', path);
return [];
}
}
export async function addChatMessage(userId, sessionId, sender, text, suggestions = []) {
if (!userId || !sessionId || !text) return null;
const messageId = `MSG-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
const path = `user_chats/${userId}/sessions/${sessionId}/messages`;
try {
const msgRef = doc(db, 'user_chats', userId, 'sessions', sessionId, 'messages', messageId);
const msgData = {
messageId, sender: sender === 'user' ? 'user' : 'assistant', text: text.substring(0, 4000), suggestions: suggestions || [], createdAt: new Date().toISOString() };
await setDoc(msgRef, msgData);
// Update parent session last message & timestamp const sessionRef = doc(db, 'user_chats', userId, 'sessions', sessionId);
await setDoc(sessionRef, {
lastMessage: text.substring(0, 300), updatedAt: new Date().toISOString() }, {
merge: true });
return msgData;
} catch (error) {
handleFirestoreError(error, 'create', path);
}
}
export async function updateSessionTitle(userId, sessionId, title) {
if (!userId || !sessionId) return;
const path = `user_chats/${userId}/sessions/${sessionId}`;
try {
const sessionRef = doc(db, 'user_chats', userId, 'sessions', sessionId);
await setDoc(sessionRef, {
title: title.substring(0, 150), updatedAt: new Date().toISOString() }, {
merge: true });
} catch (error) {
handleFirestoreError(error, 'update', path);
}
}
export async function deleteChatSession(userId, sessionId) {
if (!userId || !sessionId) return;
const path = `user_chats/${userId}/sessions/${sessionId}`;
try {
const sessionRef = doc(db, 'user_chats', userId, 'sessions', sessionId);
await deleteDoc(sessionRef);
} catch (error) {
handleFirestoreError(error, 'delete', path);
} }
