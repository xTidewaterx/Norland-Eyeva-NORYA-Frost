import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
  });
}

export const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
export const firestoreDatabaseId = process.env.FIRESTORE_DATABASE_ID || "(default)";
export const db =
  firestoreDatabaseId === "(default)"
    ? admin.firestore()
    : getFirestore(admin.app(), firestoreDatabaseId);
export const authAdmin = admin.auth();
export { admin };
