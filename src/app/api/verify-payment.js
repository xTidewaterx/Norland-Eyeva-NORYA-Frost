//api/verify-payment.js
import Stripe from "stripe";
import { db } from "../../lib/firebaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

export default async function handler(req, res) {
  try {
    const { session_id, payment_intent } = req.query;
    if (!session_id && !payment_intent) return res.status(400).json({ error: "Missing session_id or payment_intent" });

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
        const session = await stripe.checkout.sessions.retrieve(session_id);
        const orderId = session.metadata?.orderId || pi.metadata?.orderId;
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
      return res.json({ ok: true, status: pi.status, consignmentNumber, trackingUrl });
    }

    return res.json({ ok: false, status: pi.status, message: "Payment not succeeded yet", consignmentNumber, trackingUrl });
  } catch (err) {
    console.error("verify-payment error:", err);
    return res.status(500).json({ error: err.message });
  }
}
