import { NextResponse } from "next/server";
import Stripe from "stripe";
import { authAdmin, db, admin } from "../../lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const terminalOrderStatuses = new Set([
  "cancelled",
  "canceled",
  "refunded",
  "fulfilled",
  "completed",
  "delivered",
]);

async function getAuthenticatedUser(req) {
  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return null;

  try {
    return await authAdmin.verifyIdToken(authorization.slice(7), true);
  } catch {
    return null;
  }
}

function isSeller(userData, shopExists, sellerDocs) {
  return (
    userData.role === "seller" ||
    userData.roles?.includes("seller") ||
    shopExists ||
    !sellerDocs.empty
  );
}

async function getSellerProducts(uid, stripeAccountId) {
  const sellerIds = [...new Set([uid, stripeAccountId].filter(Boolean))];
  const snapshots = await Promise.all([
    db.collection("products").where("creatorId", "==", uid).get(),
    ...sellerIds.map((sellerId) =>
      db.collection("products").where("sellerId", "==", sellerId).get()
    ),
  ]);
  const products = new Map();
  for (const snapshot of snapshots) {
    for (const product of snapshot.docs) products.set(product.id, product.data());
  }
  return [...products.values()];
}

function isActiveProduct(product) {
  const status = String(product.status || "").toLowerCase();
  return product.approved !== false &&
    !["draft", "inactive", "archived", "rejected", "deleted"].includes(status);
}

async function getOpenSellerOrders(sellerIds) {
  const orderSnapshot = await db.collection("orders").get();
  return orderSnapshot.docs.filter((orderDoc) => {
    const order = orderDoc.data();
    const belongsToSeller =
      sellerIds.includes(order.sellerId) ||
      sellerIds.includes(order.sellerStripeAccountId) ||
      (Array.isArray(order.items) &&
        order.items.some((item) => sellerIds.includes(item.sellerId)));

    return belongsToSeller &&
      !terminalOrderStatuses.has(String(order.status || "").toLowerCase());
  });
}

async function hasPendingStripePayouts(stripeAccountId) {
  if (!stripe || !stripeAccountId) {
    throw new Error("Stripe payout status could not be verified. Please contact support.");
  }

  let startingAfter;
  do {
    let page;
    try {
      page = await stripe.payouts.list(
        { limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}) },
        { stripeAccount: stripeAccountId }
      );
    } catch {
      throw new Error("Stripe payout status could not be verified. Please try again later or contact support.");
    }

    if (page.data.some((payout) =>
      payout.status === "pending" || payout.status === "in_transit"
    )) {
      return true;
    }

    if (!page.has_more) return false;
    startingAfter = page.data[page.data.length - 1]?.id;
    if (!startingAfter) {
      throw new Error("Stripe payout status could not be verified. Please contact support.");
    }
  } while (startingAfter);

  return false;
}

async function deleteOwnedStorageFiles(uid, bucketName) {
  if (!bucketName) {
    throw new Error("Firebase Storage bucket is not configured on the server.");
  }

  const bucket = admin.storage().bucket(bucketName);
  const ownedPaths = [
    `profilePics/${uid}/`,
    `userImages/${uid}/`,
    `users/${uid}/`,
  ];

  for (const prefix of ownedPaths) {
    const [files] = await bucket.getFiles({ prefix });
    await Promise.all(files.map((file) => file.delete({ ignoreNotFound: true })));
  }

  // Product uploads use a shared path; remove only files tagged with this owner.
  const [productFiles] = await bucket.getFiles({ prefix: "products/" });
  for (const file of productFiles) {
    const [metadata] = await file.getMetadata();
    if (metadata.metadata?.owner === uid) {
      await file.delete({ ignoreNotFound: true });
    }
  }
}

export async function POST(req) {
  const decoded = await getAuthenticatedUser(req);
  if (!decoded) {
    return NextResponse.json({ error: "Please sign in again to delete your account." }, { status: 401 });
  }

  const uid = decoded.uid;

  try {
    const userRef = db.collection("users").doc(uid);
    const [userSnapshot, shopSnapshot, sellerSnapshot] = await Promise.all([
      userRef.get(),
      db.collection("shops").doc(uid).get(),
      db.collection("sellers").where("userId", "==", uid).get(),
    ]);

    const userData = userSnapshot.exists ? userSnapshot.data() : {};
    const sellerAccountId =
      userData.stripeConnectId ||
      userData.stripeAccountId ||
      shopSnapshot.data()?.stripeAccountId ||
      sellerSnapshot.docs[0]?.data()?.stripeAccountId ||
      null;
    const sellerAccount = isSeller(userData, shopSnapshot.exists, sellerSnapshot);

    if (sellerAccount) {
      const sellerIds = [...new Set([uid, sellerAccountId].filter(Boolean))];
      const [products, openOrders] = await Promise.all([
        getSellerProducts(uid, sellerAccountId),
        getOpenSellerOrders(sellerIds),
      ]);

      if (products.some(isActiveProduct)) {
        return NextResponse.json(
          { error: "Please unpublish or resolve your active products before deleting your account." },
          { status: 409 }
        );
      }

      if (openOrders.length > 0) {
        return NextResponse.json(
          { error: "Please complete or resolve your pending orders before deleting your account." },
          { status: 409 }
        );
      }

      if (sellerAccountId && await hasPendingStripePayouts(sellerAccountId)) {
        return NextResponse.json(
          { error: "A Stripe payout is still processing. Please wait until it completes before deleting your account." },
          { status: 409 }
        );
      }
    }

    const bucketName =
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      process.env.FIREBASE_STORAGE_BUCKET;
    await deleteOwnedStorageFiles(uid, bucketName);

    // Remove public profile projections, but preserve marketplace and financial history.
    await Promise.all([
      userRef.collection("favourites").get().then((snapshot) =>
        Promise.all(snapshot.docs.map((favorite) => favorite.ref.delete()))
      ),
      db.collection("publicProfiles").doc(uid).delete(),
      db.collection("publicUsers").doc(uid).delete(),
    ]);

    await db.recursiveDelete(userRef);
    await authAdmin.deleteUser(uid);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[delete-account] Account deletion failed:", error);
    const payoutCheckFailed = error.message?.startsWith("Stripe payout status could not be verified");
    return NextResponse.json(
      {
        error: payoutCheckFailed
          ? error.message
          : "Account deletion could not be completed. Please try again or contact support.",
      },
      { status: payoutCheckFailed ? 503 : 500 }
    );
  }
}
