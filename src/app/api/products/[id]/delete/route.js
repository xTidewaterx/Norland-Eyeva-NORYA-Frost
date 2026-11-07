import { NextResponse } from "next/server";
import Stripe from "stripe";
import { authAdmin, db, admin } from "../../../../lib/firebaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const runtime = "nodejs";

export async function DELETE(req, { params }) {
  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await authAdmin.verifyIdToken(authorization.slice(7), true);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id || !/^[a-zA-Z0-9_]+$/.test(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const productRef = db.collection("products").doc(id);
    const projectionSnapshot = await productRef.get();
    const projection = projectionSnapshot.exists ? projectionSnapshot.data() : {};
    let stripeProduct = null;

    if (!projection.creatorId) {
      try {
        stripeProduct = await stripe.products.retrieve(id);
      } catch (error) {
        if (error.code !== "resource_missing") throw error;
      }
    }

    const creatorId = projection.creatorId || stripeProduct?.metadata?.creatorId;
    const userSnapshot = await db.collection("users").doc(decoded.uid).get();
    const userData = userSnapshot.exists ? userSnapshot.data() : {};
    const isAdmin = userData.role === "admin" || userData.roles?.includes("admin");

    if (!projectionSnapshot.exists && !stripeProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (!isAdmin && (!creatorId || creatorId !== decoded.uid)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const productData = {
      ...(projectionSnapshot.exists
        ? projection.createdAt
          ? {}
          : { createdAt: admin.firestore.FieldValue.serverTimestamp() }
        : {
            stripeProductId: id,
            ...(creatorId ? { creatorId } : {}),
            sellerId: stripeProduct?.metadata?.sellerAccountId || null,
            title: stripeProduct?.name || "",
            description: stripeProduct?.description || "",
            images: stripeProduct?.images || [],
            approved: stripeProduct?.metadata?.approved === "true",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          }),
      notPublic: true,
      notPublicAt: admin.firestore.FieldValue.serverTimestamp(),
      notPublicBy: decoded.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await productRef.set(productData, { merge: true });

    return NextResponse.json({ success: true, notPublic: true });
  } catch (error) {
    console.error("[products] Failed to hide product:", error);
    return NextResponse.json(
      { error: "Could not remove the product from the shop. Please try again." },
      { status: 500 }
    );
  }
}
