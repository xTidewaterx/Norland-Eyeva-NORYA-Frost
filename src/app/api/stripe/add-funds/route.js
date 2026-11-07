import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;

if (!stripeSecret) {
  throw new Error("❌ STRIPE_SECRET_KEY is required but not set in environment");
}

const stripe = new Stripe(stripeSecret, {
  apiVersion: "2024-06-20",
});

export async function POST(req) {
  try {
    const { accountId, amount = 50000, currency = "nok" } = await req.json();

    if (!accountId) {
      return new Response(
        JSON.stringify({ error: "accountId is required." }),
        { status: 400 }
      );
    }

    const isTestMode = stripeSecret.startsWith("sk_test_");

    if (!isTestMode) {
      return new Response(
        JSON.stringify({ error: "Test funding is only available in test mode." }),
        { status: 400 }
      );
    }

    console.log("🔵 [add-funds] Setting up test funding for account:", accountId);

    // Step 1: Ensure card_payments + transfers capabilities are requested
    // For Express accounts, the platform can request capabilities
    // In test mode, they auto-activate after the seller completes onboarding
    await stripe.accounts.update(accountId, {
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    console.log("✅ [add-funds] Requested card_payments and transfers capabilities");

    // Step 2: Wait for capabilities to activate (test mode auto-activates after onboarding)
    console.log("⏳ [add-funds] Waiting for capabilities...");
    await new Promise(r => setTimeout(r, 2000));

    // Step 3: Create test PaymentIntent — use stripeAccount to create
    // the charge directly on the connected account.
    // This makes the charge appear in the connected account's Stripe Dashboard.
    // No on_behalf_of needed (which would require card_payments on destination).
    console.log("🔵 [add-funds] Creating test PaymentIntent on connected account...");
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency.toLowerCase(),
      payment_method: "pm_card_visa",
      payment_method_types: ["card"],
      confirm: true,
      off_session: true,
    }, {
      stripeAccount: accountId,
    });

    console.log("✅ [add-funds] PaymentIntent created:", paymentIntent.id, "status:", paymentIntent.status);

    // Retrieve the connected account to check updated status
    const account = await stripe.accounts.retrieve(accountId);

    return new Response(
      JSON.stringify({
        success: true,
        paymentIntentId: paymentIntent.id,
        paymentIntentStatus: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        capabilities: account.capabilities,
        requirements_currently_due: account.requirements?.currently_due || [],
        requirements_eventually_due: account.requirements?.eventually_due || [],
        available_balance: account.balance?.available?.[0]?.amount || 0,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ [add-funds] error:", err);
    return new Response(
      JSON.stringify({
        error: err.message || "Failed to add funds",
        type: err.type || "unknown",
        code: err.code || "unknown",
        param: err.param || undefined,
      }),
      { status: 500 }
    );
  }
}
