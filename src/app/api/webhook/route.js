import { NextResponse } from "next/server";
import { verifyStripeWebhook, stripe } from "@/lib/stripe";
import { db, authAdmin, admin } from "../../lib/firebaseAdmin";
import {
  sendEmail,
  getBuyerConfirmationHtml,
  getSellerNotificationHtml,
} from "@/lib/sendEmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FALLBACK_EMAIL = process.env.FALLBACK_EMAIL || "johan12ab@gmail.com";
const BOOKING_URL = "/api/book-shipment";
const BRING_CLIENT_URL = process.env.BRING_CLIENT_URL || "https://localhost:3000";
const PLATFORM_FEE_PERCENT = 0.15;
const MAX_WEBHOOK_ATTEMPTS = 5;
const WEBHOOK_CLAIM_TTL_MS = 10 * 60 * 1000;

async function getOrder(orderId) {
  try {
    const doc = await db.collection("orders").doc(orderId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  } catch {
    return null;
  }
}

async function claimWebhookEvent(event) {
  const eventRef = db.collection("webhookEvents").doc(event.id);
  const now = Date.now();

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(eventRef);
    const previous = snapshot.exists ? snapshot.data() : {};

    if (previous.status === "processed" || previous.processedAt) {
      return { status: "processed" };
    }
    if (previous.status === "blocked") return { status: "blocked" };

    const claimExpiresAt = previous.claimExpiresAt?.toMillis?.() || 0;
    if (previous.status === "processing" && claimExpiresAt > now) {
      return { status: "processing" };
    }

    const attempts = Number(previous.attempts) || 0;
    if (attempts >= MAX_WEBHOOK_ATTEMPTS) {
      transaction.set(eventRef, {
        eventId: event.id,
        eventType: event.type,
        status: "blocked",
        blockedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      return { status: "blocked" };
    }

    transaction.set(eventRef, {
      eventId: event.id,
      eventType: event.type,
      status: "processing",
      attempts: attempts + 1,
      claimExpiresAt: admin.firestore.Timestamp.fromMillis(now + WEBHOOK_CLAIM_TTL_MS),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...(!snapshot.exists
        ? { receivedAt: admin.firestore.FieldValue.serverTimestamp() }
        : {}),
    }, { merge: true });

    return { status: "claimed", attempts: attempts + 1 };
  });
}

async function markEventProcessed(eventId, eventType) {
  await db.collection("webhookEvents").doc(eventId).set({
    eventId,
    eventType,
    status: "processed",
    processedAt: admin.firestore.FieldValue.serverTimestamp(),
    claimExpiresAt: admin.firestore.FieldValue.delete(),
    lastError: admin.firestore.FieldValue.delete(),
  }, { merge: true });
}

async function markEventFailed(eventId, eventType, attempts, error) {
  const blocked = attempts >= MAX_WEBHOOK_ATTEMPTS;
  await db.collection("webhookEvents").doc(eventId).set({
    eventId,
    eventType,
    status: blocked ? "blocked" : "failed",
    lastError: String(error?.message || error).slice(0, 500),
    claimExpiresAt: admin.firestore.FieldValue.delete(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    ...(blocked ? { blockedAt: admin.firestore.FieldValue.serverTimestamp() } : {}),
  }, { merge: true });
  return blocked;
}

async function createSellerTransfers(order, paymentIntentId) {
  const items = order.items || [];
  if (items.length === 0) return [];

  const sellerGroups = {};
  for (const item of items) {
    const sellerId = item.sellerId;
    if (!sellerId) continue;
    if (!sellerGroups[sellerId]) {
      sellerGroups[sellerId] = {
        sellerStripeAccountId: sellerId,
        amountNok: 0,
        productIds: [],
      };
    }
    sellerGroups[sellerId].amountNok += item.unitPrice * item.quantity;
    sellerGroups[sellerId].productIds.push(item.productId);
  }

  const transfers = [];
  for (const [sellerId, group] of Object.entries(sellerGroups)) {
    const sellerAmountNok = Math.round(group.amountNok * (1 - PLATFORM_FEE_PERCENT));
    if (sellerAmountNok <= 0) continue;

    const existingTransfer = await db.collection("transfers")
      .where("orderId", "==", order.id)
      .where("sellerId", "==", sellerId)
      .limit(1)
      .get();

    if (!existingTransfer.empty) {
      console.log("ℹ️ [webhook] transfer already exists for seller", sellerId, "order:", order.id);
      continue;
    }

    const transfer = await stripe.transfers.create(
      {
        amount: sellerAmountNok,
        currency: "nok",
        destination: group.sellerStripeAccountId,
        metadata: {
          orderId: order.id,
          sellerId,
        },
      },
      { idempotencyKey: `norya-transfer-${order.id}-${sellerId}` }
    );

    await db.collection("transfers").doc(transfer.id).set({
      orderId: order.id,
      sellerId,
      sellerStripeAccountId: group.sellerStripeAccountId,
      amountNok: sellerAmountNok,
      stripeTransferId: transfer.id,
      productIds: group.productIds,
      platformFeePercent: PLATFORM_FEE_PERCENT,
      status: "completed",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    transfers.push(transfer);
    console.log("✅ [webhook] transfer created:", transfer.id, "to seller", sellerId, "amount:", sellerAmountNok);
  }

  return transfers;
}

async function tryBookShipmentForOrder(order, paymentIntentId) {
  const shipping = order.shipping;
  if (!shipping) {
    console.warn("⚠️ [book-shipment] missing shipping data for order:", order.id);
    return null;
  }

  const customer = shipping.customerData || {};
  const topAddress = {
    street: shipping.address || "",
    streetNumber: "",
    postalCode: shipping.postalCode || "",
    city: shipping.city || "",
    country: shipping.country || "NO",
  };

  const pp = shipping.pickupPointData || shipping.pickupPoint || null;
  const pickupAddress = pp?.address || {};
  const pickupName = pp?.name || "";

  let name = customer.name || pickupName || shipping.name || "";
  const email = customer.email || order.buyerEmail || FALLBACK_EMAIL;
  const street = customer.street || topAddress.street || pickupAddress.street || "";
  const streetNumber = customer.streetNumber || topAddress.streetNumber || pickupAddress.streetNumber || "";
  const postalCode = customer.postcode || topAddress.postalCode || shipping.postalCode || pickupAddress.postalCode || "";
  const city = customer.city || topAddress.city || shipping.city || pickupAddress.city || "";
  const country = customer.country || topAddress.country || pickupAddress.countryCode || "NO";

  if (!name && email && email !== FALLBACK_EMAIL) {
    try {
      const userRecord = await authAdmin.getUserByEmail(email);
      const userDoc = await db.collection("users").doc(userRecord.uid).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        if (data?.fullName) {
          name = data.fullName;
        }
      }
    } catch {
      // non-fatal: use email prefix as name fallback
    }
  }

  if (!name && email) {
    name = email.split("@")[0];
  }

  if (!street && !postalCode && !city) {
    console.warn("⚠️ [book-shipment] no address data available for order:", order.id);
    return null;
  }

  const BRING_MAIN_PRODUCT = "3622";
  const BRING_PICKUP_SERVICE = "1073";
  const PICKUP_INCOMPAT_PRODUCTS = new Set(["3622"]);

  const isPickupPoint = Boolean(pp);
  const isMailboxPickup = shipping.pickupPointType === "MAILBOX" || shipping.id === "MAILBOX";
  const productSupportsPickup = !PICKUP_INCOMPAT_PRODUCTS.has(BRING_MAIN_PRODUCT);
  const usePickup = (isPickupPoint || isMailboxPickup) && productSupportsPickup;

  const weightInKg = Number(process.env.DEFAULT_PACKAGE_WEIGHT_KG || 2);
  const lengthInCm = Number(process.env.DEFAULT_PACKAGE_LENGTH_CM || 30);
  const widthInCm = Number(process.env.DEFAULT_PACKAGE_WIDTH_CM || 20);
  const heightInCm = Number(process.env.DEFAULT_PACKAGE_HEIGHT_CM || 10);

  const hasRealAddress = street && postalCode && city;

  const product = {
    id: BRING_MAIN_PRODUCT,
    customerNumber: "5",
    ...(usePickup ? { additionalServices: [{ id: BRING_PICKUP_SERVICE }] } : {}),
  };

  const normalizedRecipientAddress = {
    addressLine: hasRealAddress ? street : "Testveien 1",
    addressLine2: null,
    postalCode: hasRealAddress ? postalCode : "0155",
    city: hasRealAddress ? city : "OSLO",
    countryCode: country,
  };

  const normalizedPickupPoint = usePickup
    ? {
        id: pp?.id || shipping.id,
        countryCode: pp?.address?.countryCode || pp?.countryCode || country,
      }
    : null;

  const payload = {
    sender: {
      name: "NORYA Marketplace AS",
      addressLine: "Storgata 1",
      addressLine2: null,
      postalCode: "0155",
      city: "OSLO",
      countryCode: "NO",
      reference: order.id,
      contact: {
        name: "NORYA Marketplace AS",
        email: process.env.FALLBACK_EMAIL || FALLBACK_EMAIL,
        phoneNumber: "",
      },
    },

    recipient: {
      name: name || "Test Customer",
      addressLine: normalizedRecipientAddress.addressLine,
      addressLine2: null,
      postalCode: normalizedRecipientAddress.postalCode,
      city: normalizedRecipientAddress.city,
      countryCode: normalizedRecipientAddress.countryCode,
      reference: email || order.id,
      contact: {
        name: name || "Test Customer",
        email: email || order.buyerEmail || "",
        phoneNumber: "",
      },
    },

    product,
    purchaseOrder: null,
    packages: [
      {
        weightInKg,
        goodsDescription: "NORYA order",
        dimensions: {
          heightInCm: heightInCm,
          widthInCm: widthInCm,
          lengthInCm: lengthInCm,
        },
        containerId: null,
        packageType: null,
        numberOfItems: null,
      },
    ],
    shippingDateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    orderId: order.id,
    pickupPoint: normalizedPickupPoint,
    ...(usePickup ? { customerSpecifiedDispatchDateTime: new Date().toISOString() } : {}),
    flow: usePickup ? "pickup" : "pib",
  };

  try {
    const appUrl = BRING_CLIENT_URL.endsWith("/") ? BRING_CLIENT_URL.slice(0, -1) : BRING_CLIENT_URL;
    const bookingEndpoint = `${appUrl}${BOOKING_URL}`;

    async function sendBooking(payloadToSend) {
      const res = await fetch(bookingEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToSend),
        redirect: "follow",
      });
      const text = await res.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        return { res, parsed: { success: false, error: "non_json", text } };
      }
      return { res, parsed };
    }

    function isPickupPointNotSupportedError(parsed) {
      const consignment = parsed?.consignments?.[0] || parsed?.details?.consignments?.[0];
      if (!parsed?.success && consignment?.errors) return false;
      const errors = consignment?.errors;
      return errors?.some(
        (err) => err.code === "BOOK-INPUT-047" || err.code === "CUSTOMER_SPECIFIED_DISPATCH_DATE-INPUT-003"
      );
    }

    let { res, parsed } = await sendBooking(payload);

    if (!res.ok && isPickupPointNotSupportedError(parsed)) {
      console.warn("⚠️ [book-shipment] pickup point not supported, retrying without pickupPoint...");
      const fallbackPayload = JSON.parse(JSON.stringify(payload));
      delete fallbackPayload.pickupPoint;
      fallbackPayload.flow = "pib";
      const retry = await sendBooking(fallbackPayload);
      ({ res, parsed } = retry);
    }

    if (!res.ok || !parsed?.success) {
      console.error("❌ [book-shipment] booking failed:", res?.status, parsed);
      return null;
    }

    const data = parsed;
    const consignmentNumber =
      data?.consignmentNumber ||
      data?.confirmation?.consignmentNumber ||
      data?.consignments?.[0]?.confirmation?.consignmentNumber ||
      null;

    if (!consignmentNumber) {
      console.error("❌ [book-shipment] booking returned no consignmentNumber");
      return null;
    }

    try {
      await stripe.paymentIntents.update(paymentIntentId, {
        metadata: {
          consignmentNumber: String(consignmentNumber),
        },
      });
    } catch {
      // non-fatal
    }

    console.log("✅ [book-shipment] booked:", consignmentNumber);
    return String(consignmentNumber);
  } catch (err) {
    console.error("❌ [book-shipment] failed:", err && err.message ? err.message : String(err));
    return null;
  }
}

async function sendOrderEmails(order, buyerEmail, sellerEmail, consignmentNumber) {
  const items = order.items.map((item) => ({
    id: item.productId,
    name: item.name,
    quantity: item.quantity,
    price: item.unitPrice,
    sellerAccountId: item.sellerId,
  }));

  await Promise.all([
    sendEmail({
      to: buyerEmail,
      subject: "Your NORYA order confirmation",
      html: getBuyerConfirmationHtml({
        orderId: order.id,
        amount: order.totalAmountNok,
        currency: order.currency,
        consignmentNumber,
      }),
    }),
    sendEmail({
      to: sellerEmail,
      subject: `New order received — ${order.id}`,
      html: getSellerNotificationHtml({
        orderId: order.id,
        amount: order.totalAmountNok,
        currency: order.currency,
        buyerEmail,
        items,
        consignmentNumber,
      }),
    }),
  ]);
}

async function queuePendingAction(type, payload, orderId) {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  await db.collection("pending_actions").doc(jobId).set({
    type,
    payload,
    orderId,
    status: "pending",
    attempts: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return jobId;
}

export async function GET() {
  return new Response("Webhook endpoint is alive!", { status: 200 });
}

export async function POST(req) {
  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event;
  try {
    event = verifyStripeWebhook(rawBody, signature);
  } catch {
    return new Response("Webhook Error", { status: 400 });
  }

  let attemptNumber = 0;
  try {
    console.log("🔔 [webhook] event received:", event.type, "(id:", event.id + ")");

    const claim = await claimWebhookEvent(event);
    if (claim.status !== "claimed") {
      console.log(`ℹ️ [webhook] event ${claim.status}; skipping processing:`, event.id);
      return NextResponse.json({ received: true });
    }
    attemptNumber = claim.attempts;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId || session.id;

      if (!orderId) {
        console.warn("⚠️ [webhook] no orderId in session metadata");
        await markEventProcessed(event.id, event.type);
        return NextResponse.json({ received: true });
      }

      const order = await getOrder(orderId);
      if (!order) {
        console.error("❌ [webhook] order not found:", orderId);
        await markEventProcessed(event.id, event.type);
        return NextResponse.json({ received: true });
      }

      const paymentIntentId = session.payment_intent;
      if (!paymentIntentId) {
        console.error("❌ [webhook] no payment_intent in session:", orderId);
        await markEventProcessed(event.id, event.type);
        return NextResponse.json({ received: true });
      }

      // Get charge ID from payment intent
      let chargeId = null;
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        chargeId = paymentIntent.latest_charge;
      } catch (err) {
        console.warn("⚠️ [webhook] could not retrieve charge ID:", err.message);
      }

      await db.collection("orders").doc(orderId).update({
        paymentIntentId,
        chargeId,
        status: "paid",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const buyerEmail = session.customer_details?.email || order.buyerEmail || FALLBACK_EMAIL;
      const sellerEmail = order.sellerEmail || FALLBACK_EMAIL;

      let transfers = [];
      try {
        transfers = await createSellerTransfers(order, paymentIntentId);
      } catch (err) {
        console.error("❌ [webhook] transfer creation failed:", err && err.message ? err.message : String(err));
        await db.collection("orders").doc(orderId).update({ 
          status: "partial_failed",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        await markEventProcessed(event.id, event.type);
        return NextResponse.json({ received: true });
      }

      await db.collection("orders").doc(orderId).update({ 
        status: "transferred",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      let consignmentNumber = null;
      try {
        consignmentNumber = await tryBookShipmentForOrder(order, paymentIntentId);
        if (consignmentNumber) {
          await db.collection("orders").doc(orderId).update({ 
            consignmentNumber,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      } catch (err) {
        console.error("❌ [webhook] shipment booking failed:", err && err.message ? err.message : String(err));
        // Queue for retry
        await queuePendingAction("book_shipment", { orderId, paymentIntentId }, orderId);
      }

      try {
        await sendOrderEmails(order, buyerEmail, sellerEmail, consignmentNumber);
      } catch {
        // email failure should not block payout processing
        await queuePendingAction("send_emails", { orderId, buyerEmail, sellerEmail, consignmentNumber }, orderId);
      }

      await markEventProcessed(event.id, event.type);
      console.log("✅ [webhook] order processed:", orderId);
    }

    // Handle other webhook events for Stripe → Firestore sync
    if (event.type === "product.created" || event.type === "product.updated" || event.type === "product.deleted" || 
        event.type === "price.created" || event.type === "price.updated") {
      await queuePendingAction("sync_product", { eventId: event.id, eventType: event.type, product: event.data.object }, null);
    }

    if (event.type === "account.updated") {
      await queuePendingAction("sync_seller", { eventId: event.id, eventType: event.type, account: event.data.object }, null);
    }

    await markEventProcessed(event.id, event.type);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ [webhook] unhandled error:", err);
    if (attemptNumber > 0) {
      try {
        const blocked = await markEventFailed(event.id, event.type, attemptNumber, err);
        if (blocked) {
          console.error(
            `❌ [webhook] event blocked after ${attemptNumber} failed attempts:`,
            event.id
          );
          return NextResponse.json({ received: true, blocked: true });
        }
      } catch (recordError) {
        console.error("❌ [webhook] failed to record event failure:", recordError);
      }
    }
    return NextResponse.json({ received: false }, { status: 500 });
  }
}