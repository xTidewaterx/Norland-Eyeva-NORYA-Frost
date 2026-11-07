import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { authAdmin } from "../../../lib/firebaseAdmin";
import { provisionUserProfile } from "../../../lib/userProfileProvisioning";

export async function POST(req) {
  try {
    const { email, role = "civilian" } = await req.json();

    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "E-post er påkrevd" }, { status: 400 });
    }
    if (!["civilian", "seller"].includes(role)) {
      return NextResponse.json({ error: "Ugyldig kontotype." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let userRecord;
    try {
      userRecord = await authAdmin.getUserByEmail(normalizedEmail);
    } catch (error) {
      if (error.code !== "auth/user-not-found") throw error;
      userRecord = await authAdmin.createUser({ email: normalizedEmail });
    }

    const profile = await provisionUserProfile({
      uid: userRecord.uid,
      email: normalizedEmail,
      displayName: userRecord.displayName || normalizedEmail.split("@")[0],
      photoURL: userRecord.photoURL || null,
      requestedRole: role,
      userTag: `#${uuidv4().slice(0, 8)}`,
    });

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      role: profile.role,
      roles: profile.roles,
    });
  } catch (error) {
    console.error("Magic-link profile provisioning failed:", error);
    return NextResponse.json(
      { error: "Profilen kunne ikke opprettes. Prøv igjen." },
      { status: 500 }
    );
  }
}
