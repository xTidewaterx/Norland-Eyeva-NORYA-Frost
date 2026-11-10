import Stripe from "stripe";
import { NextResponse } from "next/server";
import { authAdmin, db, admin } from "../../lib/firebaseAdmin";
import {
  isProductPreviewEnabled,
  PRODUCT_PREVIEW_STOCK,
} from "../../lib/productPreview";
import { normalizeProductSpecifications } from "../../../lib/productSpecifications";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function isFirestoreDatabaseNotFound(error) {
  return ["5", "not-found", "not_found"].includes(
    String(error?.code || "").toLowerCase()
  );
}

// Returns decoded token for any authenticated user, null otherwise
async function verifyToken(req) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return await authAdmin.verifyIdToken(authHeader.slice(7));
  } catch {
    return null;
  }
}

// Returns decoded token if caller is the product owner or an admin, null otherwise
async function verifyOwnerOrAdmin(req, stripeProductId) {
  const decoded = await verifyToken(req);
  if (!decoded) return null;
  try {
    const product = await stripe.products.retrieve(stripeProductId);
    if (product.metadata?.creatorId === decoded.uid) return decoded;
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    if (userDoc.exists && userDoc.data().role === "admin") return decoded;
  } catch {
    // fall through
  }
  return null;
}

// Check if seller is approved and has payouts/charges enabled
async function isSellerMarketplaceReady(sellerId) {
  if (!sellerId) return false;
  try {
    const sellerDoc = await db.collection("sellers").doc(sellerId).get();
    if (!sellerDoc.exists) return false;
    const data = sellerDoc.data();
    return data.approved === true && 
           data.payoutsEnabled === true && 
           data.chargesEnabled === true;
  } catch (error) {
    console.error(`[products] Firestore read failed at sellers/${sellerId}:`, {
      code: error?.code || "unknown",
      message: error?.message || String(error),
      error,
    });
    throw Object.assign(
      new Error(`Firestore read failed at sellers/${sellerId}: ${error?.message || String(error)}`),
      {
        code: error?.code || "unknown",
        source: `Firebase Admin Firestore: sellers/${sellerId}`,
        cause: error,
      }
    );
  }
}

/* ===========================
   GET PRODUCTS OR SINGLE PRODUCT
=========================== */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const includeUnapproved = searchParams.get("includeUnapproved") === "true";
    const productPreviewEnabled = isProductPreviewEnabled();
    let requestingUser = null;
    let requestingUserIsAdmin = false;

    if (includeUnapproved) {
      requestingUser = await verifyToken(req);
      if (!requestingUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const requestingUserDoc = await db.collection("users").doc(requestingUser.uid).get();
      requestingUserIsAdmin =
        requestingUserDoc.exists &&
        (requestingUserDoc.data().role === "admin" ||
          requestingUserDoc.data().roles?.includes("admin"));
    }

    // If product ID is provided, return that single product
    if (id) {
      const product = await stripe.products.retrieve(id);
      const projectionSnapshot = await db.collection("products").doc(id).get();
      const projection = projectionSnapshot.exists ? projectionSnapshot.data() : {};
      if (projection.notPublic === true && !requestingUserIsAdmin) {
        return NextResponse.json({ error: "Product not available" }, { status: 404 });
      }
      let price = 0;
      let currency = 'nok';

      if (product.default_price) {
        try {
          const priceData = await stripe.prices.retrieve(product.default_price);
          price = priceData.unit_amount / 100;
          currency = priceData.currency || 'nok';
        } catch (err) {
          console.warn(`Failed to retrieve price for product ${product.id}`, err);
        }
      }

      // Check seller marketplace readiness for single product
      const sellerAccountId = product.metadata?.sellerAccountId || projection.sellerId || null;
      const sellerReady = await isSellerMarketplaceReady(sellerAccountId);
      const productApproved =
        projectionSnapshot.exists
          ? projection.approved === true
          : product.metadata?.approved === "true";
      const creatorId = product.metadata?.creatorId || projection.creatorId || "";
      const isOwner = creatorId === requestingUser?.uid;

      if (includeUnapproved && !isOwner && !requestingUserIsAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (!includeUnapproved && !productPreviewEnabled && (!productApproved || !sellerReady)) {
        return NextResponse.json({ error: "Product not available" }, { status: 404 });
      }

      return NextResponse.json({
        id: product.id,
        name: product.name,
        description: product.description,
        story: projection.story || "",
        images: projection.images || product.images || [],
        price,
        currency,
        metadata: product.metadata,
        creatorId,
        creatorName: projection.creatorName || product.metadata?.creatorName || "",
        stock: productPreviewEnabled ? PRODUCT_PREVIEW_STOCK : projection.stock ?? 0,
        category: projection.category || "",
        dimensions: projection.dimensions || null,
        weight: projection.weight ?? null,
        specifications: projection.specifications || [],
        sellerAccountId,
        approved: productPreviewEnabled || (productApproved && sellerReady),
        notPublic: projection.notPublic === true,
      });
    }

    // Fetch all products from Firestore projection (fast, searchable)
    const snapshot = await db.collection("products").get();
    const products = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      if (includeUnapproved && !requestingUserIsAdmin && data.creatorId !== requestingUser.uid) {
        continue;
      }
      if (data.notPublic === true && !requestingUserIsAdmin) {
        continue;
      }
      
      // Enforce marketplace rule: only show approved products from approved sellers with payouts/charges enabled
      if (!includeUnapproved && !productPreviewEnabled) {
        const productApproved = data.approved === true;
        const sellerReady = await isSellerMarketplaceReady(data.sellerId);
        
        if (!productApproved || !sellerReady) {
          continue;
        }
      }

      products.push({
        id: doc.id,
        name: data.title,
        description: data.description,
        story: data.story || "",
        images: data.images,
        price: data.price / 100,
        currency: data.currency,
        stock: productPreviewEnabled ? PRODUCT_PREVIEW_STOCK : data.stock || 0,
        approved: productPreviewEnabled || data.approved === true,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        category: data.category || "",
        dimensions: data.dimensions || null,
        weight: data.weight || null,
        specifications: data.specifications || [],
        metadata: {
          creatorId: data.creatorId || "",
          sellerAccountId: data.sellerId || "",
        },
        sellerAccountId: data.sellerId,
        notPublic: data.notPublic === true,
      });
    }

    return NextResponse.json({ data: products });
  } catch (error) {
    console.error("[products] GET failed while reading Firestore products or seller data:", {
      code: error?.code || "unknown",
      message: error?.message || String(error),
      error,
    });
    if (isFirestoreDatabaseNotFound(error)) {
      return NextResponse.json(
        {
          error:
            "Firestore database was not found. Create the default Cloud Firestore database for the Firebase project used by the server credentials.",
          code: "firestore-database-not-found",
          ...(process.env.NODE_ENV === "development"
            ? {
                source: error?.source || "Firebase Admin Firestore: products collection",
                detail: error?.message || String(error),
              }
            : {}),
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Products could not be loaded. Please try again.",
        ...(process.env.NODE_ENV === "development"
          ? {
              code: String(error?.code || "unknown"),
              source: error?.source || "Firebase Admin Firestore: products collection",
              detail: error?.message || String(error),
            }
          : {}),
      },
      { status: 500 }
    );
  }
}

/* ===========================
   CREATE NEW PRODUCT
=========================== */
export async function POST(req) {
  const decoded = await verifyToken(req);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { name, description, price, images, specifications } = await req.json();
    const normalizedSpecifications =
      normalizeProductSpecifications(specifications);

    if (!normalizedSpecifications.valid) {
      return NextResponse.json(
        { error: "Product specifications must have a label and value (up to 20 entries)." },
        { status: 400 }
      );
    }

    if (
      typeof name !== "string" ||
      !name.trim() ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0
    ) {
      return NextResponse.json(
        { error: "A product name and a valid positive price are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(images) || images.length === 0 || images.length > 8 || images.some((image) => typeof image !== "string")) {
      return NextResponse.json({ error: "Add between one and eight valid product images." }, { status: 400 });
    }

    const userDoc = await db.collection("users").doc(decoded.uid).get();
    if (!userDoc.exists || userDoc.data().role !== "seller") {
      return NextResponse.json({ error: "Only seller accounts can publish products." }, { status: 403 });
    }

    const sellerAccountId = userDoc.data().stripeConnectId || null;
    const creatorId = decoded.uid;
    const productMetadata = {
      creatorId,
      creatorEmail: userDoc.data().email || decoded.email || "",
    };
    if (sellerAccountId) {
      productMetadata.sellerAccountId = sellerAccountId;
    } else {
      console.info("Seller has not connected Stripe yet:", decoded.uid);
    }

    console.log("Creating new Stripe product:", { name, description, price, images, metadata: productMetadata, sellerAccountId });

const product = await stripe.products.create({
      name: name.trim(),
      description: description || "",
      images: images || [],
      metadata: productMetadata,
    });

    const priceData = await stripe.prices.create({
      unit_amount: Math.round(Number(price) * 100),
      currency: "nok",
      product: product.id,
    });

    const updatedProduct = await stripe.products.update(product.id, {
      default_price: priceData.id,
    });

    // Write lightweight projection to Firestore
    try {
      await db.collection("products").doc(product.id).set({
        stripeProductId: product.id,
        stripePriceId: priceData.id,
        sellerId: sellerAccountId,
        creatorId,
        title: name.trim(),
        description: description || "",
        story: "",
        images: images || [],
        price: Math.round(Number(price) * 100),
        currency: "nok",
        stock: 0,
        approved: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        category: "",
        dimensions: null,
        weight: null,
        specifications: normalizedSpecifications.specifications || [],
      });
    } catch (err) {
      console.error("❌ [products] Firestore projection write failed:", err);
      throw new Error("Product could not be saved to the marketplace catalog.");
    }

    // Also create/update seller document
    if (sellerAccountId) {
      try {
        const sellerDoc = await db.collection("sellers").doc(sellerAccountId).get();
        const stripeAccount = await stripe.accounts.retrieve(sellerAccountId);
        
        await db.collection("sellers").doc(sellerAccountId).set({
          stripeAccountId: sellerAccountId,
          userId: decoded.uid,
          email: stripeAccount.email,
          businessName: stripeAccount.business_profile?.name || "",
          country: stripeAccount.country,
          defaultCurrency: stripeAccount.default_currency,
          chargesEnabled: stripeAccount.charges_enabled,
          payoutsEnabled: stripeAccount.payouts_enabled,
          detailsSubmitted: stripeAccount.details_submitted,
          requirements: stripeAccount.requirements || {},
          capabilities: stripeAccount.capabilities || {},
          approved: false, // Admin must approve
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      } catch (err) {
        console.warn("⚠️ [products] Seller document sync failed:", err.message);
      }
    }

    console.log("✅ Product created successfully:", updatedProduct.id);

    return NextResponse.json({ product: updatedProduct, price: priceData });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* ===========================
   PATCH (UPDATE PRODUCT - includes all new fields)
=========================== */
export async function PATCH(req) {
  try {
    const { 
      id, 
      images, 
      price, 
      metadata,
      story,
      stock,
      category,
      dimensions,
      weight,
      specifications,
      approved
    } = await req.json();
    console.log("PATCH request received:", { id, images, price, metadata, story, stock, category, dimensions, weight, specifications, approved });

    const normalizedSpecifications =
      normalizeProductSpecifications(specifications);
    if (!normalizedSpecifications.valid) {
      return NextResponse.json(
        { error: "Product specifications must have a label and value (up to 20 entries)." },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if caller is owner, admin, or has special permission for approval
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = async () => {
      try {
        const userDoc = await db.collection("users").doc(decoded.uid).get();
        return userDoc.exists && userDoc.data().role === "admin";
      } catch {
        return false;
      }
    };

    const isOwnerOrAdmin = await verifyOwnerOrAdmin(req, id) || await isAdmin();
    
    if (!isOwnerOrAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can approve products
    if (approved !== undefined && !(await isAdmin())) {
      return NextResponse.json({ error: "Only admins can approve products" }, { status: 403 });
    }

    const updatedFields = {};
    if (images) updatedFields.images = images;
    if (metadata) updatedFields.metadata = metadata;
    if (story !== undefined) updatedFields.metadata = { ...updatedFields.metadata, story };
    if (stock !== undefined) updatedFields.metadata = { ...updatedFields.metadata, stock: String(stock) };
    if (category !== undefined) updatedFields.metadata = { ...updatedFields.metadata, category };
    if (dimensions !== undefined) updatedFields.metadata = { ...updatedFields.metadata, dimensions: JSON.stringify(dimensions) };
    if (weight !== undefined) updatedFields.metadata = { ...updatedFields.metadata, weight: String(weight) };
    if (approved !== undefined) updatedFields.metadata = { ...updatedFields.metadata, approved: String(approved) };

    let newPriceData = null;
    if (price) {
      const parsedPrice = Math.round(Number(price) * 100);
      if (isNaN(parsedPrice)) {
        return NextResponse.json(
          { error: "Invalid price format" },
          { status: 400 }
        );
      }

      newPriceData = await stripe.prices.create({
        unit_amount: parsedPrice,
        currency: "nok",
        product: id,
      });

      updatedFields.default_price = newPriceData.id;
    }

    const updatedProduct = await stripe.products.update(id, updatedFields);
    console.log("✅ Product updated:", updatedProduct.id);

    // Sync changes to Firestore projection
    try {
      const updateData = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
      if (images) updateData.images = images;
      if (metadata?.sellerAccountId) updateData.sellerId = metadata.sellerAccountId;
      if (price) {
        updateData.price = Math.round(Number(price) * 100);
        updateData.stripePriceId = newPriceData.id;
      }
      if (story !== undefined) updateData.story = story;
      if (stock !== undefined) updateData.stock = stock;
      if (category !== undefined) updateData.category = category;
      if (dimensions !== undefined) updateData.dimensions = dimensions;
      if (weight !== undefined) updateData.weight = weight;
      if (normalizedSpecifications.specifications !== undefined) {
        updateData.specifications = normalizedSpecifications.specifications;
      }
      if (approved !== undefined) updateData.approved = approved;
      await db.collection("products").doc(id).update(updateData);
    } catch (err) {
      console.warn("⚠️ [products] Firestore projection sync failed:", err.message);
    }

    return NextResponse.json({ updatedProduct, newPrice: newPriceData });
  } catch (error) {
    console.error("❌ Error in PATCH:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
