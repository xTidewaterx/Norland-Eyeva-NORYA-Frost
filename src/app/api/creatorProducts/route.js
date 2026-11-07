import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { authAdmin, db } from '../../lib/firebaseAdmin';
import {
  isProductPreviewEnabled,
  PRODUCT_PREVIEW_STOCK,
} from '../../lib/productPreview';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


//To retrieve search parameters from a URL in a GET request, you can utilize the URLSearchParams interface. This allows you to easily manage and access query parameters.
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get('creator');
    const includeUnapproved = searchParams.get('includeUnapproved') === 'true';
    const productPreviewEnabled = isProductPreviewEnabled();
    let requestingUserIsAdmin = false;

    if (!creatorId) {
      return NextResponse.json({ error: 'creator query param is required' }, { status: 400 });
    }

    if (includeUnapproved) {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      try {
        const decoded = await authAdmin.verifyIdToken(authHeader.slice(7));
        const userSnapshot = await db.collection('users').doc(decoded.uid).get();
        const userData = userSnapshot.exists ? userSnapshot.data() : {};
        requestingUserIsAdmin =
          userData.role === 'admin' || userData.roles?.includes('admin');
        if (decoded.uid !== creatorId && !requestingUserIsAdmin) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Fetch all products from Stripe
    const products = await stripe.products.list({ limit: 100 });

    // Only expose approved products publicly; owners can see their own pending items.
    const creatorProducts = await Promise.all(
      products.data
        .filter((p) => p.metadata?.creatorId === creatorId)
        .map(async (product) => {
          const productSnapshot = await db.collection('products').doc(product.id).get();
          const projection = productSnapshot.exists ? productSnapshot.data() : {};
          if (projection.notPublic === true && !requestingUserIsAdmin) return null;

          let approved = false;
          let stock = PRODUCT_PREVIEW_STOCK;
          if (includeUnapproved) {
            approved = productPreviewEnabled || (productSnapshot.exists && projection.approved === true);
            if (!productPreviewEnabled) {
              stock = productSnapshot.exists
                ? projection.stock ?? 0
                : Number.parseInt(product.metadata?.stock || '0', 10);
            }
          } else {
            if (!productPreviewEnabled && (!productSnapshot.exists || projection.approved !== true)) return null;

            if (!productPreviewEnabled) {
              const sellerId = projection.sellerId;
              if (!sellerId) return null;
              const sellerSnapshot = await db.collection('sellers').doc(sellerId).get();
              if (!sellerSnapshot.exists) return null;

              const seller = sellerSnapshot.data();
              if (
                seller.approved !== true ||
                seller.payoutsEnabled !== true ||
                seller.chargesEnabled !== true
              ) {
                return null;
              }
              stock = projection.stock ?? 0;
            }
            approved = true;
          }

          let price = null;
          if (product.default_price) {
            const priceData = await stripe.prices.retrieve(product.default_price);
            price = priceData.unit_amount / 100;
          }

          return {
            id: product.id,
            name: product.name,
            description: product.description,
            images: product.images || product.metadata?.images || [],
            price,
            approved,
            stock,
            notPublic: projection.notPublic === true,
            metadata: product.metadata,
          };
        })
    );

    return NextResponse.json({ data: creatorProducts.filter(Boolean) }, { status: 200 });
  } catch (err) {
    console.error('Error fetching creator products:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
