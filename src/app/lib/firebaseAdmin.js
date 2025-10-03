import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // or your service account JSON
    databaseURL: "https://norland-a7730-default-rtdb.firebaseio.com", // optional for Firestore
  });
}

export const db = admin.firestore(); // ✅ this must be exported
