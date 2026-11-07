import { NextResponse } from "next/server";
import { authAdmin, db, admin } from "../../lib/firebaseAdmin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function verifyAuth(req) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return await authAdmin.verifyIdToken(authHeader.slice(7));
  } catch {
    return null;
  }
}

export async function POST(req) {
  const decoded = await verifyAuth(req);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    if (userData.role !== "seller" && !userData.roles?.includes("seller")) {
      return NextResponse.json({ error: "Seller account required" }, { status: 403 });
    }

    const shopRef = db.collection("shops").doc(decoded.uid);
    const shopSnapshot = await shopRef.get();
    const shopData = shopSnapshot.data() || {};
    const stripeAccountId = userData.stripeConnectId || shopData.stripeAccountId;
    
    if (!stripeAccountId) {
      return NextResponse.json({ error: "No Stripe Connect account found" }, { status: 400 });
    }

    // Retrieve the Stripe account to get latest status
    const account = await stripe.accounts.retrieve(stripeAccountId);

    const sellerRef = db.collection("sellers").doc(stripeAccountId);
    const sellerSnapshot = await sellerRef.get();
    const sellerData = sellerSnapshot.data() || {};
    const sellerApprovalStatus =
      shopData.sellerApprovalStatus === "rejected"
        ? "rejected"
        : shopData.sellerApprovalStatus === "approved" || sellerData.approved === true
          ? "approved"
          : "pending";
    const requirementsCurrentlyDue = account.requirements?.currently_due?.length || 0;
    const onboardingCompleted = account.details_submitted === true;

    await db.runTransaction(async (transaction) => {
      transaction.set(shopRef, {
        stripeAccountId,
        onboardingCompleted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        sellerApprovalStatus,
        requirementsCurrentlyDue,
        lastStripeSyncAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        ...(!shopSnapshot.exists
          ? { createdAt: admin.firestore.FieldValue.serverTimestamp() }
          : {}),
      }, { merge: true });

      transaction.set(sellerRef, {
      stripeAccountId,
      userId: decoded.uid,
      email: account.email,
      businessName: account.business_profile?.name || "",
      country: account.country,
      defaultCurrency: account.default_currency,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requirements: account.requirements || {},
      capabilities: account.capabilities || {},
      approved: sellerApprovalStatus === "approved",
      ...(!sellerSnapshot.exists
        ? { createdAt: admin.firestore.FieldValue.serverTimestamp() }
        : {}),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      transaction.set(db.collection("users").doc(decoded.uid), {
        stripeConnectId: stripeAccountId,
        stripeConnectEmail: account.email,
        onboardingCompleted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        sellerApprovalStatus,
        stripeChargesEnabled: account.charges_enabled,
        stripePayoutsEnabled: account.payouts_enabled,
        stripeDetailsSubmitted: account.details_submitted,
        stripeRequirements: account.requirements || {},
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });

    console.log("✅ [seller-onboarding] Seller document created/updated:", stripeAccountId);

    return NextResponse.json({ 
      success: true, 
      seller: {
        stripeAccountId,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        sellerApprovalStatus,
      }
    });
  } catch (err) {
    console.error("❌ [seller-onboarding] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}