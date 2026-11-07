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
    const userData = userSnapshot.data();

    if (!userSnapshot.exists || (userData.role !== "seller" && !userData.roles?.includes("seller"))) {
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
    const requirementsDue = [
      ...(account.requirements?.currently_due || []),
      ...(account.requirements?.eventually_due || []),
    ];
    const documentRequired = requirementsDue.some((requirement) =>
      requirement.startsWith("individual.verification.document")
    );

    if (!documentRequired) {
      return NextResponse.json({ onboardingUrl: null, requirementsDue });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL;
    if (!appUrl) {
      return NextResponse.json({ error: "Application URL is not configured." }, { status: 503 });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/profile`,
      return_url: `${appUrl}/profile`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      documentRequired: true,
      onboardingUrl: accountLink.url,
      requirementsDue,
    });
  } catch (error) {
    console.error("Stripe document onboarding link could not be created:", error);
    return NextResponse.json(
      { error: "Could not create the Stripe onboarding link." },
      { status: 500 }
    );
  }
}
