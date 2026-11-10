'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/authContext';
import { auth } from '../../../firebase/firebaseConfig';
import PostProduct from '../../post/PostProduct';
import ProductDetailView from '../../components/productDetailPage/ProductDetailView';
import GetProducts from '../../components/productDetailPage/get/GetProducts';

export default function OwnerProductFallback({ id, isEditing }) {
  const { user, loading } = useAuth();
  const [result, setResult] = useState({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      if (loading) return;
      if (!user?.uid || auth.currentUser?.uid !== user.uid) {
        setResult({ status: 'unavailable' });
        return;
      }

      try {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch(
          `/api/products?id=${encodeURIComponent(id)}&includeUnapproved=true`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 401 || response.status === 403 || response.status === 404) {
          if (!cancelled) setResult({ status: 'unavailable' });
          return;
        }

        if (!response.ok) {
          throw new Error(`Product request failed with status ${response.status}`);
        }

        const product = await response.json();
        if (!cancelled) setResult({ status: 'ready', product });
      } catch (error) {
        console.error('Failed to load owner product:', error);
        if (!cancelled) setResult({ status: 'error' });
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id, loading, user?.uid]);

  const product = result.product;
  const completeProduct = product && {
    id: product.id,
    name: product.name,
    description: product.description,
    story: product.story,
    images: product.images || [],
    stock: product.stock,
    category: product.category,
    dimensions: product.dimensions,
    weight: product.weight,
    specifications: product.specifications || [],
    price: product.price ?? 0,
    currency: product.currency || 'nok',
    creatorId: product.creatorId || product.metadata?.creatorId,
    sellerAccountId: product.sellerAccountId || product.metadata?.sellerAccountId,
    artist: product.creatorName || product.metadata?.creatorName || 'Skaper',
    approved: product.approved === true,
  };

  return (
    <>
      <div className="bg-slate-50 px-4 pt-28 pb-12 sm:pt-32 sm:pb-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="p-5 sm:p-8">
            {result.status === 'ready' ? (
              isEditing ? (
                <PostProduct currentProduct={completeProduct} />
              ) : (
                <ProductDetailView
                  completeProduct={completeProduct}
                  id={id}
                  ownerPreview
                />
              )
            ) : result.status === 'loading' || loading ? (
              <p className="text-sm text-slate-600">Laster produkt …</p>
            ) : result.status === 'error' ? (
              <p role="alert" className="text-sm text-red-700">
                Produktet kunne ikke lastes. Prøv igjen senere.
              </p>
            ) : (
              <p className="text-sm text-slate-600">
                Produktet er ikke tilgjengelig.
              </p>
            )}
          </div>
        </div>
      </div>
      <GetProducts />
    </>
  );
}
