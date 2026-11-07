import { redirect } from "next/navigation";

import PostProduct from "../../post/PostProduct";
import ProductDetailView from "../../components/productDetailPage/ProductDetailView";
import GetProducts from "../../components/productDetailPage/get/GetProducts";
import OwnerProductFallback from "./OwnerProductFallback";

async function getProduct(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products?id=${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductDetail({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;

  if (query?.saved === "true") redirect(`/products/${id}?edit=false`);

  const product = await getProduct(id);

  // Public product requests only return items that are approved and marketplace-ready.
  if (!product || product.approved !== true) {
    return (
      <OwnerProductFallback
        id={id}
        isEditing={query?.edit === "true"}
      />
    );
  }

  const completeProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    story: product.story,
    images: product.images || [],
    stock: product.stock,
    category: product.category,
    dimensions: product.dimensions,
    weight: product.weight,
    price: product.priceNok ?? product.price ?? 0,
    currency: product.currency || 'nok',
    creatorId: product.creatorId || product.metadata?.creatorId,
    sellerAccountId: product.sellerAccountId || product.sellerId,
    artist: product.creatorName || product.metadata?.creatorName || "Skaper",
    approved: product.approved,
  };

  const isEditing = query?.edit === "true";

  return (
    <>
      <div className="bg-slate-50 px-4 pt-28 pb-12 sm:pt-32 sm:pb-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="p-5 sm:p-8">
            {isEditing ? (
              <PostProduct currentProduct={completeProduct} />
            ) : (
              <ProductDetailView completeProduct={completeProduct} id={id} />
            )}
          </div>
        </div>
      </div>
      <GetProducts />
    </>
  );
}