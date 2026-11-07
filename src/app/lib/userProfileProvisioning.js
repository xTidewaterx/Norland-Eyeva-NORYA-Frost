import Stripe from "stripe";
import { admin, db } from "./firebaseAdmin";

const normalizeRole = (role) => (role === "seller" ? "seller" : "civilian");

const getRoles = (role) => (role === "seller" ? ["buyer", "seller"] : ["buyer"]);

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe is not configured.");
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

export async function provisionUserProfile({
  uid,
  email,
  displayName,
  phone = null,
  photoURL = null,
  requestedRole,
  userTag = null,
}) {
  if (!uid || !email || !displayName) {
    throw new Error("User ID, email, and display name are required.");
  }

  const userRef = db.collection("users").doc(uid);
  const publicUserRef = db.collection("publicUsers").doc(uid);
  const publicProfileRef = db.collection("publicProfiles").doc(uid);
  const shopRef = db.collection("shops").doc(uid);
  const [userSnapshot, publicUserSnapshot, publicProfileSnapshot, shopSnapshot] =
    await Promise.all([
      userRef.get(),
      publicUserRef.get(),
      publicProfileRef.get(),
      shopRef.get(),
    ]);

  const existingUser = userSnapshot.data() || {};
  const legacyPublicUser = publicUserSnapshot.data() || {};
  const existingPublicProfile = publicProfileSnapshot.data() || {};
  const existingShop = shopSnapshot.data() || {};
  const existingSeller = userSnapshot.exists
    ? existingUser.role === "seller" || existingUser.roles?.includes("seller")
    : shopSnapshot.exists;
  const hasExistingProfile =
    userSnapshot.exists || publicUserSnapshot.exists || publicProfileSnapshot.exists || shopSnapshot.exists;
  const role = hasExistingProfile
    ? existingSeller ? "seller" : "civilian"
    : normalizeRole(requestedRole);
  const roles = getRoles(role);

  let stripeConnectId =
    existingUser.stripeConnectId || existingShop.stripeAccountId || null;
  let stripeConnectAt = existingUser.stripeConnectAt || null;

  if (role === "seller" && !stripeConnectId) {
    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL;
    const account = await stripe.accounts.create(
      {
        type: "express",
        country: "NO",
        email,
        business_type: "individual",
        default_currency: "nok",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: displayName,
          ...(appUrl ? { url: appUrl } : {}),
        },
        metadata: {
          user_id: uid,
          platform: "NORYA",
        },
      },
      { idempotencyKey: `norya-seller-account-${uid}` }
    );
    stripeConnectId = account.id;
    stripeConnectAt = new Date().toISOString();
  }

  const now = admin.firestore.FieldValue.serverTimestamp();
  const profileName = displayName.trim();
  const profilePhoto = photoURL || existingUser.photoURL || existingPublicProfile.profileImage || null;
  const userData = {
    uid,
    email,
    fullName: profileName,
    displayName: profileName,
    phone: phone || existingUser.phone || null,
    photoURL: profilePhoto,
    role,
    roles,
    updatedAt: now,
  };

  if (!userSnapshot.exists) {
    userData.createdAt = now;
    userData.userTag = userTag;
    userData.profileThemeId = "fjord";
    userData.story = "";
    userData.region = "";
  }

  if (role === "seller") {
    Object.assign(userData, {
      stripeConnectId,
      stripeConnectEmail: email,
      stripeConnectAt,
      onboardingCompleted: existingShop.onboardingCompleted === true,
      chargesEnabled: existingShop.chargesEnabled === true,
      payoutsEnabled: existingShop.payoutsEnabled === true,
      sellerApprovalStatus: existingShop.sellerApprovalStatus || "pending",
      country: "NO",
    });
  }

  const publicUserData = {
    uid,
    fullName: profileName,
    displayName: profileName,
    photoURL: profilePhoto,
    role,
    roles,
    story: existingPublicProfile.creatorStory || legacyPublicUser.story || "",
    region: existingPublicProfile.creatorRegion || legacyPublicUser.region || "",
  };

  const batch = db.batch();
  batch.set(userRef, userData, { merge: true });
  batch.set(publicUserRef, publicUserData, { merge: true });

  if (role === "seller") {
    batch.set(
      publicProfileRef,
      {
        uid,
        displayName: profileName,
        profileImage: profilePhoto,
        creatorStory:
          existingPublicProfile.creatorStory || legacyPublicUser.story || "",
        bio: existingPublicProfile.bio || "",
        creatorRegion:
          existingPublicProfile.creatorRegion || legacyPublicUser.region || "",
        featuredCreator: existingPublicProfile.featuredCreator === true,
        role: "seller",
        updatedAt: now,
        ...(!publicProfileSnapshot.exists ? { createdAt: now } : {}),
      },
      { merge: true }
    );

    batch.set(
      shopRef,
      {
        stripeAccountId: stripeConnectId,
        onboardingCompleted: existingShop.onboardingCompleted === true,
        chargesEnabled: existingShop.chargesEnabled === true,
        payoutsEnabled: existingShop.payoutsEnabled === true,
        sellerApprovalStatus: existingShop.sellerApprovalStatus || "pending",
        requirementsCurrentlyDue: existingShop.requirementsCurrentlyDue || 0,
        updatedAt: now,
        ...(!shopSnapshot.exists ? { createdAt: now } : {}),
      },
      { merge: true }
    );
  }

  await batch.commit();
  return { role, roles, stripeConnectId, userTag };
}
