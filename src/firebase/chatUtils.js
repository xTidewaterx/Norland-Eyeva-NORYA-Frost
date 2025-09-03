import {
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebaseConfigbadCopy';

export function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_'); // consistent chat ID
}

export async function sendMessage(chatId, senderId, text) {
  const msgRef = collection(db, 'chats', chatId, 'messages');
  await addDoc(msgRef, {
    text,
    sender: senderId,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToMessages(chatId, callback) {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
}