import { NextResponse } from "next/server";
import { authAdmin, db, admin } from "../../lib/firebaseAdmin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function verifyAdmin(req) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const decoded = await authAdmin.verifyIdToken(authHeader.slice(7));
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    if (!userDoc.exists || userDoc.data().role !== "admin") return null;
    return decoded;
  } catch {
    return null;
  }
}

async function processSyncProduct(job) {
  const { eventType, product } = job.payload;
  
  // Determine the product ID to fetch
  let productId;
  if (eventType === "price.created" || eventType === "price.updated") {
    const priceObj = product;
    if (!priceObj.product) {
      console.log("⚠️ [sync] Price object missing product reference:", priceObj.id);
      return;
    }
    productId = priceObj.product;
  } else {
    productId = product.id;
  }
  
  if (eventType === "product.deleted") {
    await db.collection("products").doc(productId).set({
      notPublic: true,
      notPublicAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    console.log("🔒 [sync] Hid deleted Stripe product projection:", productId);
    return;
  }

  try {
    // 1. Retrieve the authoritative product from Stripe
    const productData = await stripe.products.retrieve(productId);
    if (productData.deleted || productData.active === false) {
      await db.collection("products").doc(productId).set({
        notPublic: true,
        notPublicAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      console.log("🔒 [sync] Hid inactive product projection:", productId);
      return;
    }
    
    // 2. Retrieve ALL prices for that product
    const prices = await stripe.prices.list({ 
      product: productId, 
      active: true,
      limit: 100 
    });
    
    // 3. Find the default/active price
    let price = 0;
    let currency = "nok";
    let stripePriceId = null;
    
    // Prefer the product's default_price, fallback to first active price
    const defaultPriceId = productData.default_price;
    let selectedPrice = prices.data.find(p => p.id === defaultPriceId) || prices.data[0];
    
    if (selectedPrice) {
      price = selectedPrice.unit_amount;
      currency = selectedPrice.currency || "nok";
      stripePriceId = selectedPrice.id;
    }

    const sellerAccountId = productData.metadata?.sellerAccountId || null;

    // 4. Upsert Firestore product projection with merge
    await db.collection("products").doc(productId).set({
      stripeProductId: productId,
      stripePriceId,
      sellerId: sellerAccountId,
      title: productData.name,
      description: productData.description || "",
      story: productData.metadata?.story || "",
      images: productData.images || [],
      price,
      currency,
      stock: productData.metadata?.stock ? parseInt(productData.metadata.stock) : 0,
      approved: productData.metadata?.approved === "true",
      category: productData.metadata?.category || "",
      dimensions: productData.metadata?.dimensions ? JSON.parse(productData.metadata.dimensions) : null,
      weight: productData.metadata?.weight ? parseFloat(productData.metadata.weight) : null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Also sync seller if present
    if (sellerAccountId) {
      await processSyncSeller({ payload: { account: await stripe.accounts.retrieve(sellerAccountId) } });
    }

    console.log("✅ [sync] Synced product projection:", productId, "| price:", stripePriceId);
  } catch (err) {
    console.error("❌ [sync] Failed to sync product:", err.message);
    throw err;
  }
}

async function processSyncSeller(job) {
  const { account } = job.payload;
  
  try {
    const sellerRef = db.collection("sellers").doc(account.id);
    const sellerSnapshot = await sellerRef.get();
    const sellerData = sellerSnapshot.data() || {};
    const userId = account.metadata?.user_id || sellerData.userId || null;
    const userRef = userId ? db.collection("users").doc(userId) : null;
    const shopRef = userId ? db.collection("shops").doc(userId) : null;
    const [userSnapshot, shopSnapshot] = userId
      ? await Promise.all([userRef.get(), shopRef.get()])
      : [null, null];
    const shopData = shopSnapshot?.data() || {};
    const approved =
      sellerData.approved === true ||
      account.metadata?.approved === "true" ||
      shopData.sellerApprovalStatus === "approved";
    const sellerApprovalStatus = approved
      ? "approved"
      : shopData.sellerApprovalStatus || "pending";
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const batch = db.batch();

    batch.set(sellerRef, {
      stripeAccountId: account.id,
      userId,
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
      updatedAt: timestamp,
    }, { merge: true });

    if (userId && userSnapshot?.exists) {
      batch.set(shopRef, {
        stripeAccountId: account.id,
        onboardingCompleted: account.details_submitted === true,
        chargesEnabled: account.charges_enabled === true,
        payoutsEnabled: account.payouts_enabled === true,
        sellerApprovalStatus,
        requirementsCurrentlyDue: account.requirements?.currently_due?.length || 0,
        lastStripeSyncAt: timestamp,
        updatedAt: timestamp,
        ...(!shopSnapshot.exists ? { createdAt: timestamp } : {}),
      }, { merge: true });
      batch.set(userRef, {
        stripeConnectId: account.id,
        stripeConnectEmail: account.email || null,
        onboardingCompleted: account.details_submitted === true,
        chargesEnabled: account.charges_enabled === true,
        payoutsEnabled: account.payouts_enabled === true,
        sellerApprovalStatus,
        updatedAt: timestamp,
      }, { merge: true });
    }

    await batch.commit();
    console.log("✅ [sync] Synced seller:", account.id);
  } catch (err) {
    console.error("❌ [sync] Failed to sync seller:", err.message);
    throw err;
  }
}

async function processBookShipment(job) {
  const { orderId, paymentIntentId } = job.payload;
  
  try {
    const orderDoc = await db.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) {
      throw new Error("Order not found");
    }
    const order = { id: orderDoc.id, ...orderDoc.data() };

    // Import the booking logic
    const { tryBookShipmentForOrder } = await import("@/app/api/webhook/route");
    const consignmentNumber = await tryBookShipmentForOrder(order, paymentIntentId);
    
    if (consignmentNumber) {
      await db.collection("orders").doc(orderId).update({ 
        consignmentNumber,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    
    console.log("✅ [pending] Booked shipment for order:", orderId);
  } catch (err) {
    console.error("❌ [pending] Failed to book shipment:", err.message);
    throw err;
  }
}

async function processSendEmails(job) {
  const { orderId, buyerEmail, sellerEmail, consignmentNumber } = job.payload;
  
  try {
    const orderDoc = await db.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) {
      throw new Error("Order not found");
    }
    const order = { id: orderDoc.id, ...orderDoc.data() };

    const { sendOrderEmails } = await import("@/app/api/webhook/route");
    await sendOrderEmails(order, buyerEmail, sellerEmail, consignmentNumber);
    
    console.log("✅ [pending] Sent emails for order:", orderId);
  } catch (err) {
    console.error("❌ [pending] Failed to send emails:", err.message);
    throw err;
  }
}

const jobHandlers = {
  sync_product: processSyncProduct,
  sync_seller: processSyncSeller,
  book_shipment: processBookShipment,
  send_emails: processSendEmails,
};

export async function POST(req) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { jobId } = await req.json();
    
    if (!jobId) {
      // Process all pending jobs
      const snapshot = await db.collection("pending_actions")
        .where("status", "==", "pending")
        .orderBy("createdAt")
        .limit(10)
        .get();

      const results = [];
      for (const doc of snapshot.docs) {
        const job = { id: doc.id, ...doc.data() };
        const handler = jobHandlers[job.type];
        
        if (!handler) {
          await doc.ref.update({ 
            status: "failed", 
            error: `Unknown job type: ${job.type}`,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          continue;
        }

        await doc.ref.update({ 
          status: "processing",
          attempts: admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        try {
          await handler(job);
          await doc.ref.update({ 
            status: "completed",
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          results.push({ jobId: doc.id, type: job.type, status: "completed" });
        } catch (err) {
          const newAttempts = (job.attempts || 0) + 1;
          if (newAttempts >= 3) {
            await doc.ref.update({ 
              status: "failed",
              error: err.message,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          } else {
            await doc.ref.update({ 
              status: "pending",
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
          results.push({ jobId: doc.id, type: job.type, status: "failed", error: err.message });
        }
      }

      return NextResponse.json({ processed: results.length, results });
    }

    // Process single job
    const jobDoc = await db.collection("pending_actions").doc(jobId).get();
    if (!jobDoc.exists) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = { id: jobDoc.id, ...jobDoc.data() };
    const handler = jobHandlers[job.type];
    
    if (!handler) {
      return NextResponse.json({ error: `Unknown job type: ${job.type}` }, { status: 400 });
    }

    await jobDoc.ref.update({ 
      status: "processing",
      attempts: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    try {
      await handler(job);
      await jobDoc.ref.update({ 
        status: "completed",
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ status: "completed" });
    } catch (err) {
      const newAttempts = (job.attempts || 0) + 1;
      if (newAttempts >= 3) {
        await jobDoc.ref.update({ 
          status: "failed",
          error: err.message,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        await jobDoc.ref.update({ 
          status: "pending",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      return NextResponse.json({ status: "failed", error: err.message }, { status: 500 });
    }
  } catch (err) {
    console.error("❌ [pending_actions] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";
    const limit = parseInt(searchParams.get("limit") || "50");

    const snapshot = await db.collection("pending_actions")
      .where("status", "==", status)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ data: jobs });
  } catch (err) {
    console.error("❌ [pending_actions] GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}