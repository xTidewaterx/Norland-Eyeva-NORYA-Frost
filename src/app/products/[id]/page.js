import { notFound, redirect } from "next/navigation";
import Stripe from "stripe";
import Link from "next/link";

import CartWrapper from "../../../app/utils/cartWrapper";
import CartButton from "../../../app/utils/cartButton";
import PostProduct from "../../post/PostProduct";

import ImageCarousel from "../../components/productDetailPage/ImageCarousel"// Adjust path if needed


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getProduct(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products?id=${id}`);
  if (!res.ok) return null;
  return res.json();
}

async function getProductPrice(productId) {
  const product = await stripe.products.retrieve(productId);
  const price = await stripe.prices.retrieve(product.default_price);
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    images: product.images,
    price_amount: price.unit_amount,
    currency: price.currency,
    default_price_id: product.default_price,
  };
}

export default async function ProductDetail({ params, searchParams }) {
  const { id } = params;
  const product = await getProduct(id);
  if (!product) notFound();

  const stripeProduct = await getProductPrice(product.id);

  const completeProduct = {
    id: product.id,
    name: stripeProduct.name,
    description: stripeProduct.description,
    images: stripeProduct.images,
    price: stripeProduct.price_amount,
    currency: stripeProduct.currency,
    default_price_id: stripeProduct.default_price_id,
    artist: product.name || "Unknown Artist", // Assuming your API returns artist
  };

  const isEditing = searchParams?.edit === "true";
  if (searchParams?.saved === "true") redirect(`/products/${id}?edit=false`);

  return (
    <CartWrapper>
      <div className="bg-neutral-100 px-4 py-12 flex justify-center">
        <div className="max-w-screen-xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-10 rounded-lg shadow-lg items-start">
          {isEditing ? (
            <PostProduct currentProduct={completeProduct} />
          ) : (
            <>
              {/* Left: Image Carousel */}
              <ImageCarousel images={completeProduct.images} />

              {/* Right: Product Info */}
              <div className="flex flex-col justify-start w-full">
                {/* Artist name above title */}
                <p className="text-sm text-gray-500 mb-1 font-semibold tracking-wide uppercase">
                  {completeProduct.artist}
                </p>

                <h1 className="text-5xl font-light tracking-tight text-gray-900 mb-6">
                  {completeProduct.name}
                </h1>

                <p className="text-2xl text-gray-800 mb-4 font-semibold">
                  {(completeProduct.price / 100).toFixed(2)}{" "}
                  {completeProduct.currency.toUpperCase()}
                </p>

                <div className="border-t border-gray-300 pt-6 mt-4">
                  <h2 className="text-lg text-gray-700 font-medium mb-2">Description</h2>
                  <p className="text-gray-600 text-base leading-relaxed whitespace-pre-wrap">
                    {completeProduct.description || "No description available"}
                  </p>
                </div>

                {/* Buttons aligned and styled identically */}
                <div className="flex flex-row items-center gap-4 mt-6">
                  <CartButton product={completeProduct} />

                  <button
                    className="mt-6 px-6 py-2 bg-gray-900 text-white text-lg font-semibold rounded-lg hover:bg-gray-700 transition duration-300"
                  >
                    <Link href={`?edit=true`}>Edit Product</Link>
                  </button>
                </div>

                <Link
                  href={`/products/${parseInt(id) + 1}`}
                  className="mt-6 text-blue-600 hover:underline text-sm"
                >
                  → Next Product
                </Link>

                <Link href="/products/cart" className="mt-2 text-gray-500 hover:text-gray-700 text-sm">
                  🛒 Go to Cart
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </CartWrapper>
  );
}
