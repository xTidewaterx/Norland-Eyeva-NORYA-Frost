import { NextResponse } from "next/server";
import { withRateLimit } from "../lib/rateLimit";
import { db } from "../../lib/firebaseAdmin";

const handler = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get("session_id");
    const payment_intent = searchParams.get("payment_intent");

    if (!session_id && !payment_intent) {
      return NextResponse.json({ ok: false, error: "Missing session_id or payment_intent" }, { status: 400 });
    }

    const { stripe } = await import("../../../lib/stripe");
    let pi;

    if (session_id) {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      pi = await stripe.paymentIntents.retrieve(session.payment_intent);
    } else {
      pi = await stripe.paymentIntents.retrieve(payment_intent);
    }

    let consignmentNumber = pi.metadata?.consignmentNumber || null;

    if (!consignmentNumber && session_id) {
      try {
        const session = session_id ? await stripe.checkout.sessions.retrieve(session_id) : null;
        const orderId = session?.metadata?.orderId || pi.metadata?.orderId;
        if (orderId) {
          const orderDoc = await db.collection("orders").doc(orderId).get();
          if (orderDoc.exists) {
            consignmentNumber = orderDoc.data()?.consignmentNumber || null;
          }
        }
      } catch {
        // non-fatal
      }
    }

    const trackingUrl = consignmentNumber
      ? `https://sporing.posten.no/sporing/${encodeURIComponent(consignmentNumber)}`
      : null;

    if (pi.status === "succeeded") {
      return NextResponse.json({
        ok: true,
        status: pi.status,
        consignmentNumber,
        trackingUrl,
      });
    }

    return NextResponse.json({
      ok: false,
      status: pi.status,
      message: "Payment not succeeded yet",
      consignmentNumber,
      trackingUrl,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Verification failed" }, { status: 500 });
  }
};

export const GET = withRateLimit(20, 60000)(handler);
