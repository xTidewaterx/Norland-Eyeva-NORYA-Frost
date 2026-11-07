import { NextResponse } from "next/server";
import { authAdmin, db, admin } from "../../../lib/firebaseAdmin";
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
    if (
      !userDoc.exists ||
      (userDoc.data().role !== "admin" && !userDoc.data().roles?.includes("admin"))
    ) return null;
    return decoded;
  } catch {
    return null;
  }
}

// GET all sellers with pagination and filtering
export async function GET(req) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "sellers" or "products"
    const status = searchParams.get("status"); // "pending", "approved", "rejected"
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (type === "sellers") {
      let query = db.collection("sellers").orderBy("createdAt", "desc");
      
      if (status === "pending") {
        query = query.where("approved", "==", false);
      } else if (status === "approved") {
        query = query.where("approved", "==", true);
      }
      
      query = query.limit(limit).offset(offset);
      
      const snapshot = await query.get();
      const sellers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      return NextResponse.json({ data: sellers });
    }

    if (type === "products") {
      let query = db.collection("products");
      if (status === "inactive") {
        query = query.where("notPublic", "==", true);
      } else {
        query = query.orderBy("createdAt", "desc");
        if (status === "pending") {
          query = query.where("approved", "==", false);
        } else if (status === "approved") {
          query = query.where("approved", "==", true);
        }
      }
      
      query = query.limit(limit).offset(offset);
      
      const snapshot = await query.get();
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      return NextResponse.json({ data: products });
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (err) {
    console.error("❌ [admin] GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH - approve/reject sellers or products
export async function PATCH(req) {
  const adminUser = await verifyAdmin(req);
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, id, approved, reason, notPublic } = await req.json();

    if (!type || !id) {
      return NextResponse.json({ error: "Missing required fields: type, id" }, { status: 400 });
    }

    if (notPublic !== undefined) {
      if (type !== "product" || typeof notPublic !== "boolean") {
        return NextResponse.json({ error: "Invalid product visibility update" }, { status: 400 });
      }

      const productRef = db.collection("products").doc(id);
      const productDoc = await productRef.get();
      if (!productDoc.exists) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      await productRef.update({
        notPublic,
        notPublicAt: notPublic ? admin.firestore.FieldValue.serverTimestamp() : null,
        notPublicBy: notPublic ? adminUser.uid : null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true, notPublic });
    }

    if (approved === undefined) {
      return NextResponse.json({ error: "Missing required field: approved" }, { status: 400 });
    }

    if (type === "seller") {
      const sellerDoc = await db.collection("sellers").doc(id).get();
      if (!sellerDoc.exists) {
        return NextResponse.json({ error: "Seller not found" }, { status: 404 });
      }

      const sellerData = sellerDoc.data();
      let sellerUserId = sellerData.userId;
      if (!sellerUserId) {
        const userSnapshot = await db
          .collection("users")
          .where("stripeConnectId", "==", id)
          .limit(1)
          .get();
        sellerUserId = userSnapshot.docs[0]?.id;
      }

      const batch = db.batch();
      batch.update(db.collection("sellers").doc(id), {
        approved: Boolean(approved),
        rejectionReason: reason || null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      if (sellerUserId) {
        batch.set(
          db.collection("users").doc(sellerUserId),
          {
            sellerApprovalStatus: approved ? "approved" : "rejected",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        batch.set(
          db.collection("shops").doc(sellerUserId),
          {
            stripeAccountId: id,
            sellerApprovalStatus: approved ? "approved" : "rejected",
            rejectionReason: reason || null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
      await batch.commit();

      // Also update Stripe account metadata
      try {
        await stripe.accounts.update(id, {
          metadata: {
            approved: String(Boolean(approved)),
            rejection_reason: reason || "",
          },
        });
      } catch (err) {
        console.warn("⚠️ [admin] Failed to update Stripe account metadata:", err.message);
      }

      console.log(`${approved ? "✅" : "❌"} [admin] Seller ${approved ? "approved" : "rejected"}:`, id);
      return NextResponse.json({ success: true, approved: Boolean(approved) });
    }

    if (type === "product") {
      const productDoc = await db.collection("products").doc(id).get();
      if (!productDoc.exists) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      await db.collection("products").doc(id).update({
        approved: Boolean(approved),
        rejectionReason: reason || null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Also update Stripe product metadata
      try {
        await stripe.products.update(id, {
          metadata: {
            approved: String(Boolean(approved)),
            rejection_reason: reason || "",
          },
        });
      } catch (err) {
        console.warn("⚠️ [admin] Failed to update Stripe product metadata:", err.message);
      }

      console.log(`${approved ? "✅" : "❌"} [admin] Product ${approved ? "approved" : "rejected"}:`, id);
      return NextResponse.json({ success: true, approved: Boolean(approved) });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    console.error("❌ [admin] PATCH error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST - bulk approve/reject
export async function POST(req) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, ids, approved, reason } = await req.json();

    if (!type || !ids || !Array.isArray(ids) || approved === undefined) {
      return NextResponse.json({ error: "Missing required fields: type, ids[], approved" }, { status: 400 });
    }

    const batch = db.batch();
    const results = [];

    for (const id of ids) {
      try {
        if (type === "seller") {
          const sellerDoc = db.collection("sellers").doc(id);
          const sellerSnapshot = await sellerDoc.get();
          if (!sellerSnapshot.exists) {
            results.push({ id, success: false, error: "Seller not found" });
            continue;
          }

          const sellerData = sellerSnapshot.data();
          let sellerUserId = sellerData.userId;
          if (!sellerUserId) {
            const userSnapshot = await db
              .collection("users")
              .where("stripeConnectId", "==", id)
              .limit(1)
              .get();
            sellerUserId = userSnapshot.docs[0]?.id;
          }

          batch.update(sellerDoc, {
            approved: Boolean(approved),
            rejectionReason: reason || null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          if (sellerUserId) {
            batch.set(
              db.collection("users").doc(sellerUserId),
              {
                sellerApprovalStatus: approved ? "approved" : "rejected",
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            );
            batch.set(
              db.collection("shops").doc(sellerUserId),
              {
                stripeAccountId: id,
                sellerApprovalStatus: approved ? "approved" : "rejected",
                rejectionReason: reason || null,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            );
          }
          
          // Update Stripe
          try {
            await stripe.accounts.update(id, {
              metadata: { approved: String(Boolean(approved)), rejection_reason: reason || "" },
            });
          } catch (err) {
            console.warn(`⚠️ [admin] Failed to update Stripe seller ${id}:`, err.message);
          }
        } else if (type === "product") {
          const productDoc = db.collection("products").doc(id);
          batch.update(productDoc, {
            approved: Boolean(approved),
            rejectionReason: reason || null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          
          // Update Stripe
          try {
            await stripe.products.update(id, {
              metadata: { approved: String(Boolean(approved)), rejection_reason: reason || "" },
            });
          } catch (err) {
            console.warn(`⚠️ [admin] Failed to update Stripe product ${id}:`, err.message);
          }
        }
        results.push({ id, success: true });
      } catch (err) {
        results.push({ id, success: false, error: err.message });
      }
    }

    await batch.commit();
    console.log(`${approved ? "✅" : "❌"} [admin] Bulk ${type} ${approved ? "approved" : "rejected"}:`, ids.length);
    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("❌ [admin] POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}