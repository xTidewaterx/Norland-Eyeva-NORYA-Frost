import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  admin,
  db,
  firebaseProjectId,
  firestoreDatabaseId,
} from "../../lib/firebaseAdmin";
import { provisionUserProfile } from "../../lib/userProfileProvisioning";

function isFirestoreDatabaseNotFound(error) {
  return ["5", "not-found", "not_found"].includes(
    String(error?.code || "").toLowerCase()
  );
}

function getFirestoreTarget() {
  const projectId = firebaseProjectId || admin.app().options.projectId || null;
  const clientProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null;

  return {
    projectId,
    databaseId: firestoreDatabaseId,
    clientProjectId,
    projectMatchesClient: clientProjectId ? projectId === clientProjectId : null,
  };
}

export async function POST(req) {
  let createdUserUid = null;

  try {
    const { email, password, fullName, phone, photoURL, role } = await req.json();
    const accountRole = role || "civilian";

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!["civilian", "seller"].includes(accountRole)) {
      return NextResponse.json({ error: "Invalid account type" }, { status: 400 });
    }

    const firestoreTarget = getFirestoreTarget();
    console.info("[registerUser] Checking Firestore target:", firestoreTarget);
    await db.collection("_health").limit(1).get();

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: fullName,
      photoURL: photoURL || null,
    });
    createdUserUid = userRecord.uid;

    const userTag = `#${uuidv4().slice(0, 8)}`;

    const profile = await provisionUserProfile({
      uid: userRecord.uid,
      email,
      displayName: fullName,
      phone,
      photoURL,
      requestedRole: accountRole,
      userTag,
    });

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      userTag,
      role: profile.role,
      roles: profile.roles,
    });
  } catch (err) {
    console.error("Error creating user:", err);

    if (createdUserUid) {
      const cleanupResults = await Promise.allSettled([
        db.collection("users").doc(createdUserUid).delete(),
        db.collection("publicUsers").doc(createdUserUid).delete(),
        db.collection("publicProfiles").doc(createdUserUid).delete(),
        db.collection("shops").doc(createdUserUid).delete(),
        admin.auth().deleteUser(createdUserUid),
      ]);

      cleanupResults.forEach((result) => {
        if (result.status === "rejected") {
          console.error("Failed to clean up partially created user:", result.reason);
        }
      });
    }

    if (err.code === "auth/email-already-in-use") {
      return NextResponse.json(
        {
          error: "Denne e-posten er allerede registrert. Logg inn i stedet, eller slett kontoen din fra profilen.",
          code: "email-already-in-use",
        },
        { status: 409 }
      );
    }

    if (isFirestoreDatabaseNotFound(err)) {
      const firestoreTarget = getFirestoreTarget();
      console.error("[registerUser] Firestore database not found:", firestoreTarget);

      return NextResponse.json(
        {
          error: `Firestore database "${firestoreTarget.databaseId}" was not found in Firebase project "${firestoreTarget.projectId || "unknown"}" (client project: "${firestoreTarget.clientProjectId || "unknown"}"). Verify the project and database ID in Firebase Console.`,
          code: "firestore-database-not-found",
          firestoreTarget,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: "Kontoen kunne ikke opprettes. Prøv igjen." }, { status: 500 });
  }
}
