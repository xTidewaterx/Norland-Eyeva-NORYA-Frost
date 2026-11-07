import { NextResponse } from "next/server";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();
const PROFILE_THEME_IDS = new Set([
  "fjord",
  "midnatt",
  "skog",
  "rav",
  "plomme",
  "stein",
  "kyst",
  "vin",
  "sol",
  "havs",
]);

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const { displayName, photoURL, profileThemeId } = await req.json();

    if (displayName !== undefined && (typeof displayName !== "string" || !displayName.trim() || displayName.trim().length > 80)) {
      return NextResponse.json({ error: "Visningsnavnet må være mellom 1 og 80 tegn." }, { status: 400 });
    }
    if (photoURL !== undefined && photoURL !== null && typeof photoURL !== "string") {
      return NextResponse.json({ error: "Ugyldig profilbilde." }, { status: 400 });
    }
    if (typeof photoURL === "string" && photoURL.length > 2048) {
      return NextResponse.json({ error: "Ugyldig profilbilde." }, { status: 400 });
    }
    if (typeof photoURL === "string") {
      try {
        if (new URL(photoURL).protocol !== "https:") {
          return NextResponse.json({ error: "Ugyldig profilbilde." }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: "Ugyldig profilbilde." }, { status: 400 });
      }
    }
    if (profileThemeId !== undefined && (typeof profileThemeId !== "string" || !PROFILE_THEME_IDS.has(profileThemeId))) {
      return NextResponse.json({ error: "Ugyldig profilfarge." }, { status: 400 });
    }
    if (displayName === undefined && photoURL === undefined && profileThemeId === undefined) {
      return NextResponse.json({ error: "Ingen profilendringer ble sendt." }, { status: 400 });
    }

    const profileUpdates = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (displayName !== undefined) {
      profileUpdates.displayName = displayName.trim();
      profileUpdates.fullName = profileUpdates.displayName;
    }
    if (profileThemeId !== undefined) profileUpdates.profileThemeId = profileThemeId;
    if (photoURL) profileUpdates.photoURL = photoURL;

    const userDocRef = db.collection("users").doc(uid);
    const publicUserDocRef = db.collection("publicUsers").doc(uid);
    const publicProfileRef = db.collection("publicProfiles").doc(uid);
    const authUpdates = {};
    if (profileUpdates.displayName) authUpdates.displayName = profileUpdates.displayName;
    if (profileUpdates.photoURL) authUpdates.photoURL = profileUpdates.photoURL;

    if (Object.keys(authUpdates).length) {
      await admin.auth().updateUser(uid, authUpdates);
    }

    const batch = db.batch();
    batch.set(userDocRef, profileUpdates, { merge: true });
    batch.set(publicUserDocRef, profileUpdates, { merge: true });
    const userSnapshot = await userDocRef.get();
    const userData = userSnapshot.data() || {};
    if (userData.role === "seller" || userData.roles?.includes("seller")) {
      const publicProfileUpdates = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
      if (profileUpdates.displayName) {
        publicProfileUpdates.displayName = profileUpdates.displayName;
      }
      if (profileUpdates.photoURL) {
        publicProfileUpdates.profileImage = profileUpdates.photoURL;
      }
      batch.set(publicProfileRef, publicProfileUpdates, { merge: true });
    }

    try {
      await batch.commit();
    } catch (error) {
      if (!Object.keys(authUpdates).length) throw error;

      console.error("Firebase Auth profile updated, but Firestore profile sync failed:", error);
      return NextResponse.json({
        success: true,
        firestoreSynced: false,
        warning: "Endringen er lagret på kontoen din, men profilen kunne ikke synkroniseres til Firestore.",
      });
    }

    return NextResponse.json({ success: true, firestoreSynced: true });
  } catch (err) {
    console.error("Error updating profile:", err);
    const errorCode = String(err?.code || "").toLowerCase();
    const firestoreUnavailable = ["5", "not-found", "unavailable", "firestore/unavailable"].includes(errorCode);

    return NextResponse.json(
      {
        error: firestoreUnavailable
          ? "Firestore er ikke tilgjengelig. Kontroller at Cloud Firestore-databasen er opprettet for Firebase-prosjektet."
          : "Profilen kunne ikke lagres. Prøv igjen.",
      },
      { status: firestoreUnavailable ? 503 : 500 }
    );
  }
}