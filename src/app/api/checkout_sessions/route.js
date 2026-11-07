import Stripe from "stripe";
import { NextResponse } from "next/server";
import { db, admin } from "../../lib/firebaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const APP_CURRENCY = (process.env.NEXT_PUBLIC_APP_CURRENCY || "nok").toLowerCase();

const SHIPPING_OPTIONS = {
  standard: { id: "standard", name: "Standard frakt (2-4 dager)", cost: 9900 },
  express: { id: "express", name: "Ekspressfrakt (1-2 dager)", cost: 15000 },
};

const MIN_AMOUNT = 300;

async function resolveProductPrice(productId) {
  if (!productId) return null;
  try {
    const productDoc = await db.collection("products").doc(productId).get();
    if (productDoc.exists) {
      const data = productDoc.data();
      if (data.price && data.currency) {
        return {
          unitAmount: data.price,
          currency: data.currency,
        };
      }
    }
    const product = await stripe.products.retrieve(productId);
    if (!product.default_price) return null;
    const price = await stripe.prices.retrieve(product.default_price);
    return {
      unitAmount: price.unit_amount,
      currency: price.currency || APP_CURRENCY,
    };
  } catch (err) {
    console.error(`[checkout] failed to resolve price for product ${productId}:`, err.message);
    return null;
  }
}

async function getSellerForProduct(productId) {
  try {
    const productDoc = await db.collection("products").doc(productId).get();
    if (productDoc.exists) {
      const sellerId = productDoc.data()?.sellerId;
      if (sellerId) return sellerId;
    }
    const product = await stripe.products.retrieve(productId);
    return product.metadata?.sellerAccountId || null;
  } catch (err) {
    console.error(`[checkout] failed to get seller for product ${productId}:`, err.message);
    return null;
  }
}

function normalizeShipping(rawShipping, selectedShipping) {
  if (!rawShipping) return null;

  if (rawShipping.pickupPointType && !rawShipping.pickupPoint) {
    rawShipping.pickupPoint = {
      id: rawShipping.pickupPointType,
      name: rawShipping.pickupPointType,
      address: {
        street: rawShipping.address || "",
        postalCode: rawShipping.postalCode || "",
        city: rawShipping.city || "",
        countryCode: rawShipping.country || "NO",
      },
    };
  }

  const customer = rawShipping.customerData || {};

  return {
    id: selectedShipping.id,
    name: selectedShipping.name,
    cost: selectedShipping.cost,
    pickupPoint: rawShipping.pickupPoint || null,
    pickupPointType: rawShipping.pickupPointType || null,
    address: rawShipping.address || null,
    postalCode: rawShipping.postalCode || null,
    city: rawShipping.city || null,
    country: rawShipping.country || "NO",
    customerData: customer
      ? {
          name: customer.name || "",
          email: customer.email || "",
          phone: customer.phone || "",
          street: customer.street || "",
          streetNumber: customer.streetNumber || "",
          city: customer.city || "",
          postcode: customer.postcode || "",
          country: customer.country || "",
        }
      : null,
  };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { items, shipping, email, sellerEmail, buyerId } = body;

    const forbiddenFields = [
      "price",
      "amount",
      "unit_amount",
      "payout",
      "fee",
      "total",
      "customerNumber",
    ];
    for (const field of forbiddenFields) {
      if (body[field] !== undefined) {
        return NextResponse.json(
          { error: `Client-sent field "${field}" is not allowed` },
          { status: 400 }
        );
      }
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in request" }, { status: 400 });
    }

    const resolvedItems = [];
    let subtotalAmount = 0;

    for (const item of items) {
      const productId = item.id || item.productId;
      const quantity = Math.max(1, Number(item.quantity) || 1);

      if (!productId) {
        return NextResponse.json(
          { error: "Each item must have a productId" },
          { status: 400 }
        );
      }

      const productDoc = await db.collection("products").doc(productId).get();
      const productData = productDoc.exists ? productDoc.data() : {};
      if (productData.notPublic === true) {
        return NextResponse.json(
          { error: "This product is no longer available.", code: "product-not-public" },
          { status: 404 }
        );
      }

      const priceData = await resolveProductPrice(productId);
      if (!priceData) {
        return NextResponse.json(
          { error: `Product ${productId} has no valid price` },
          { status: 400 }
        );
      }

      let sellerAccountId = await getSellerForProduct(productId);
      
      if (!sellerAccountId) {
        return NextResponse.json(
          { error: `Product ${productId} is missing sellerAccountId` },
          { status: 400 }
        );
      }

      // Try to get seller from Firestore, if not found, create from Stripe
      let sellerDoc = await db.collection("sellers").doc(sellerAccountId).get();
      if (!sellerDoc.exists) {
        console.log(`⚠️ [checkout] Seller ${sellerAccountId} not in Firestore, fetching from Stripe...`);
        try {
          const account = await stripe.accounts.retrieve(sellerAccountId);
          await db.collection("sellers").doc(sellerAccountId).set({
            stripeAccountId: sellerAccountId,
            userId: account.metadata?.user_id || null,
            email: account.email,
            businessName: account.business_profile?.name || "",
            country: account.country,
            defaultCurrency: account.default_currency,
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
            detailsSubmitted: account.details_submitted,
            requirements: account.requirements || {},
            capabilities: account.capabilities || {},
            approved: account.metadata?.approved === "true",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          sellerDoc = await db.collection("sellers").doc(sellerAccountId).get();
          console.log(`✅ [checkout] Created seller document for ${sellerAccountId}`);
        } catch (err) {
          console.error(`❌ [checkout] Failed to create seller from Stripe:`, err.message);
          return NextResponse.json(
            { error: `Seller ${sellerAccountId} not found and could not be created` },
            { status: 400 }
          );
        }
      }
      const sellerData = sellerDoc.data();
      const sellerUserId = sellerData.userId;
      const shopSnapshot = sellerUserId
        ? await db.collection("shops").doc(sellerUserId).get()
        : await db
            .collection("shops")
            .where("stripeAccountId", "==", sellerAccountId)
            .limit(1)
            .get()
            .then((snapshot) => snapshot.docs[0] || null);
      const shopData = shopSnapshot?.exists ? shopSnapshot.data() : {};
      const sellerApproved =
        shopData.sellerApprovalStatus === "rejected"
          ? false
          : shopData.sellerApprovalStatus === "approved" || sellerData.approved === true;
      if (!sellerApproved) {
        return NextResponse.json(
          {
            error: "Selgeren er ikke godkjent for markedsplassen ennå.",
            code: "seller-not-approved",
          },
          { status: 400 }
        );
      }

      const chargesEnabled =
        typeof shopData.chargesEnabled === "boolean"
          ? shopData.chargesEnabled
          : sellerData.chargesEnabled === true;
      const payoutsEnabled =
        typeof shopData.payoutsEnabled === "boolean"
          ? shopData.payoutsEnabled
          : sellerData.payoutsEnabled === true;
      if (!chargesEnabled || !payoutsEnabled) {
        return NextResponse.json(
          {
            error: "Selgerens Stripe-konto er ikke klar for betaling og utbetaling.",
            code: "seller-stripe-not-ready",
          },
          { status: 400 }
        );
      }

      const productName = productData.title || "Product";
      const productDescription =
        typeof productData.description === "string"
          ? productData.description.replace(/\s+/g, " ").trim().slice(0, 500)
          : "";
      const productImage = productData.images?.[0] || null;

      resolvedItems.push({
        productId,
        name: productName,
        description: productDescription,
        image: productImage,
        sellerId: sellerAccountId,
        unitPrice: priceData.unitAmount,
        currency: priceData.currency,
        quantity,
      });
      subtotalAmount += priceData.unitAmount * quantity;
    }

    const shippingId = shipping?.id || shipping?.method || "standard";
    const selectedShipping = SHIPPING_OPTIONS[shippingId] || SHIPPING_OPTIONS.standard;
    const shippingCost = selectedShipping.cost;

    const totalAmount = subtotalAmount + shippingCost;

    if (!Number.isInteger(totalAmount) || totalAmount < MIN_AMOUNT) {
      return NextResponse.json({ error: "Invalid total amount" }, { status: 400 });
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const essentialShipping = normalizeShipping(shipping, selectedShipping);
    const checkoutEmail =
      typeof email === "string" &&
      email.trim().length <= 254 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ? email.trim()
        : null;

    const lineItems = resolvedItems.map((item) => ({
      price_data: {
        currency: APP_CURRENCY,
        product_data: {
          name: item.name,
          ...(item.description ? { description: item.description } : {}),
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: item.unitPrice,
      },
      quantity: item.quantity,
    }));
    lineItems.push({
      price_data: {
        currency: APP_CURRENCY,
        product_data: {
          name: `Frakt - ${selectedShipping.name}`,
        },
        unit_amount: selectedShipping.cost,
      },
      quantity: 1,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "embedded",
      locale: "nb",
      submit_type: "pay",
      wallet_options: {
        link: { display: "never" },
      },
      line_items: lineItems,
      ...(checkoutEmail ? { customer_email: checkoutEmail } : {}),
      return_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      redirect_on_completion: "always",
      metadata: {
        orderId,
        buyerId: buyerId || "",
        buyerEmail: (email || "").slice(0, 200),
        sellerEmail: (sellerEmail || "").slice(0, 200),
        shipping: essentialShipping ? JSON.stringify(essentialShipping).slice(0, 500) : "",
        items: JSON.stringify(
          resolvedItems.map((item) => ({
            productId: item.productId,
            sellerId: item.sellerId,
            unitPrice: item.unitPrice,
            currency: item.currency,
            quantity: item.quantity,
          }))
        ).slice(0, 4000),
      },
    });
    if (!checkoutSession.client_secret) {
      throw new Error("Stripe did not return an embedded Checkout client secret");
    }

    const platformFeePercent = 0.15;
    const orderData = {
      checkoutSessionId: checkoutSession.id,
      paymentIntentId: null,
      chargeId: null,
      buyerId: buyerId || null,
      buyerEmail: email || null,
      items: resolvedItems.map(item => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        sellerId: item.sellerId,
        unitPrice: item.unitPrice,
        currency: item.currency,
        quantity: item.quantity,
      })),
      shipping: essentialShipping,
      subtotalAmountNok: subtotalAmount,
      shippingAmountNok: shippingCost,
      taxAmountNok: 0,
      totalAmountNok: totalAmount,
      currency: APP_CURRENCY,
      platformFeePercent,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("orders").doc(orderId).set(orderData);
    console.log("🧾 [checkout] saved order to Firestore:", orderId);

    return NextResponse.json({
      clientSecret: checkoutSession.client_secret,
      orderId,
      summary: {
        items: resolvedItems.map(({ name, quantity, unitPrice }) => ({
          name,
          quantity,
          unitPrice,
        })),
        subtotalAmount,
        shippingName: selectedShipping.name,
        shippingAmount: shippingCost,
        totalAmount,
        currency: APP_CURRENCY,
      },
    });
  } catch (err) {
    console.error("[checkout] error:", err.type, err.message);
    let status = 500;
    let userMsg = "Feil ved betaling. Prøv igjen.";

    if (
      err.message?.includes("missing a valid product id") ||
      err.message?.includes("has no default price")
    ) {
      userMsg = "Mangler vare i handlekurven. Oppdater siden og legg varen i handlekurven på nytt.";
      status = 400;
    } else if (err.type === "StripeInvalidRequestError") {
      userMsg = `Ugyldig betalingsforespørsel: ${err.message}`;
      status = 400;
    }

    return new Response(JSON.stringify({ error: userMsg }), { status });
  }
}