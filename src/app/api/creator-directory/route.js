import { NextResponse } from "next/server";
import { db } from "../../lib/firebaseAdmin";

export const dynamic = "force-dynamic";

function toPublicProfile(id, data) {
  return {
    id,
    displayName: data.displayName || data.fullName || "",
    profileImage: data.profileImage || data.photoURL || null,
    bio: data.bio || "",
    creatorStory: data.creatorStory || data.story || "",
    creatorRegion: data.creatorRegion || data.region || "",
  };
}

export async function GET() {
  try {
    const [publicProfilesSnapshot, sellerRoleSnapshot, sellerRolesSnapshot] =
      await Promise.all([
        db.collection("publicProfiles").where("role", "==", "seller").get(),
        db.collection("users").where("role", "==", "seller").get(),
        db.collection("users").where("roles", "array-contains", "seller").get(),
      ]);

    const profiles = new Map(
      publicProfilesSnapshot.docs.map((profileDoc) => [
        profileDoc.id,
        toPublicProfile(profileDoc.id, profileDoc.data()),
      ])
    );

    for (const userDoc of [...sellerRoleSnapshot.docs, ...sellerRolesSnapshot.docs]) {
      if (profiles.has(userDoc.id)) continue;
      profiles.set(userDoc.id, toPublicProfile(userDoc.id, userDoc.data()));
    }

    return NextResponse.json({ data: Array.from(profiles.values()) });
  } catch (error) {
    console.error("[creator-directory] Failed to load public profiles:", error);
    return NextResponse.json(
      { error: "Skaperne kunne ikke lastes akkurat nå. Prøv igjen senere." },
      { status: 500 }
    );
  }
}
