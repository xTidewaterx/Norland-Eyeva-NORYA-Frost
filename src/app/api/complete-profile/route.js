import { NextResponse } from "next/server";
import { authAdmin } from "../../lib/firebaseAdmin";
import { provisionUserProfile } from "../../lib/userProfileProvisioning";

export async function POST(req) {
  const authorization = req.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await authAdmin.verifyIdToken(authorization.slice(7));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let requestedRole;
  try {
    const body = await req.json();
    requestedRole = body.role;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!["civilian", "seller"].includes(requestedRole)) {
    return NextResponse.json({ error: "Invalid account type." }, { status: 400 });
  }

  try {
    const authUser = await authAdmin.getUser(decodedToken.uid);
    if (!authUser.email) {
      return NextResponse.json({ error: "A verified email is required." }, { status: 400 });
    }

    const profile = await provisionUserProfile({
      uid: authUser.uid,
      email: authUser.email,
      displayName: authUser.displayName || authUser.email.split("@")[0],
      photoURL: authUser.photoURL || null,
      requestedRole,
    });

    return NextResponse.json({ success: true, role: profile.role, roles: profile.roles });
  } catch (error) {
    console.error("Google profile provisioning failed:", error);
    return NextResponse.json(
      { error: "Profilen kunne ikke opprettes. Prøv igjen." },
      { status: 500 }
    );
  }
}
