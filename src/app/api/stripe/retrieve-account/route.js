import Stripe from "stripe";
import { NextResponse } from "next/server";
import { authAdmin, db } from "../../../lib/firebaseAdmin";

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
    const [userSnapshot, shopSnapshot] = await Promise.all([
      db.collection("users").doc(uid).get(),
      db.collection("shops").doc(uid).get(),
    ]);

    if (!userSnapshot.exists) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    const userData = userSnapshot.data();
    if (userData.role !== "seller" && !userData.roles?.includes("seller")) {
      return NextResponse.json({ error: "Seller account required." }, { status: 403 });
    }

    const accountId =
      userData.stripeConnectId || shopSnapshot.data()?.stripeAccountId;
    if (!accountId) {
      return NextResponse.json({ error: "No Stripe Connect account found." }, { status: 404 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });
    const account = await stripe.accounts.retrieve(accountId);
    const requirementsCurrentlyDue = account.requirements?.currently_due || [];
    const requirementsEventuallyDue = account.requirements?.eventually_due || [];
    const requirementsDue = [
      ...requirementsCurrentlyDue,
      ...requirementsEventuallyDue,
    ];

    return NextResponse.json({
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      requirements_due: requirementsDue,
      requirements_currently_due: requirementsCurrentlyDue,
      requirements_eventually_due: requirementsEventuallyDue,
      needsBankAccount: requirementsCurrentlyDue.includes("external_account"),
      needsTosAcceptance:
        requirementsCurrentlyDue.includes("tos_acceptance.date") ||
        requirementsCurrentlyDue.includes("tos_acceptance.ip") ||
        account.tos_acceptance?.date == null ||
        account.tos_acceptance?.ip == null,
      needsDocumentVerification:
        requirementsCurrentlyDue.some((item) =>
          item.startsWith("individual.verification.document")
        ) ||
        requirementsEventuallyDue.some((item) =>
          item.startsWith("individual.verification.document")
        ),
    });
  } catch (error) {
    console.error("Stripe account status could not be retrieved:", error);
    return NextResponse.json(
      { error: "Could not retrieve Stripe account status." },
      { status: 500 }
    );
  }
}
