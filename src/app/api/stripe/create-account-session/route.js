import Stripe from "stripe";
import { NextResponse } from "next/server";
import { admin, authAdmin, db } from "../../../lib/firebaseAdmin";

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

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  try {
    const uid = decodedToken.uid;
    const userRef = db.collection("users").doc(uid);
    const shopRef = db.collection("shops").doc(uid);
    const [userSnapshot, shopSnapshot, authUser] = await Promise.all([
      userRef.get(),
      shopRef.get(),
      authAdmin.getUser(uid),
    ]);

    if (!userSnapshot.exists) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    const userData = userSnapshot.data();
    if (userData.role !== "seller" && !userData.roles?.includes("seller")) {
      return NextResponse.json({ error: "Seller account required." }, { status: 403 });
    }

    const shopData = shopSnapshot.data() || {};
    let accountId = userData.stripeConnectId || shopData.stripeAccountId;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });

    if (!accountId) {
      if (!authUser.email) {
        return NextResponse.json({ error: "An email address is required for seller onboarding." }, { status: 400 });
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL;
      const account = await stripe.accounts.create(
        {
          type: "express",
          country: "NO",
          email: authUser.email,
          business_type: "individual",
          default_currency: "nok",
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          business_profile: {
            name: userData.displayName || authUser.displayName || "NORYA Creator",
            ...(appUrl ? { url: appUrl } : {}),
          },
          metadata: { user_id: uid, platform: "NORYA" },
        },
        { idempotencyKey: `norya-seller-account-${uid}` }
      );
      accountId = account.id;

      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const batch = db.batch();
      batch.set(userRef, {
        stripeConnectId: accountId,
        stripeConnectEmail: authUser.email,
        stripeConnectAt: new Date().toISOString(),
        onboardingCompleted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        sellerApprovalStatus: shopData.sellerApprovalStatus || "pending",
        updatedAt: timestamp,
      }, { merge: true });
      batch.set(shopRef, {
        stripeAccountId: accountId,
        onboardingCompleted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        sellerApprovalStatus: shopData.sellerApprovalStatus || "pending",
        updatedAt: timestamp,
        ...(!shopSnapshot.exists ? { createdAt: timestamp } : {}),
      }, { merge: true });
      await batch.commit();
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL;
    if (!appUrl) {
      return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL is not configured." }, { status: 503 });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      type: "account_onboarding",
      refresh_url: `${appUrl}/profile?stripe=refresh`,
      return_url: `${appUrl}/profile?stripe=success`,
    });

    return NextResponse.json({ url: accountLink.url, accountId });
  } catch (error) {
    console.error("Stripe Connect onboarding session could not be created:", error);
    return NextResponse.json(
      { error: "Stripe onboarding could not be started. Please try again." },
      { status: 500 }
    );
  }
}
