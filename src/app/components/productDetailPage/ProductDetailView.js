'use client';

import Link from 'next/link';
import { useAuth } from '../../auth/authContext';
import CartButton from '../../utils/cartButton';
import ImageCarousel from './ImageCarousel';

export default function ProductDetailView({ completeProduct, id, ownerPreview = false }) {
  const { user } = useAuth();
  const canEditProduct = Boolean(user?.uid && completeProduct?.creatorId && user.uid === completeProduct.creatorId);
  const priceInNok = Number(completeProduct.price ?? 0);
  const price = Number.isFinite(priceInNok) ? priceInNok.toFixed(2) : "0.00";
  const cartProduct = {
    ...completeProduct,
    price: Number.isFinite(priceInNok) ? Math.round(priceInNok * 100) : 0,
  };
  const currency = completeProduct.currency ? completeProduct.currency.toUpperCase() : "NOK";
  const colors = ["#4B2C20", "#E4C5B6"];
  const creator = completeProduct.artist || "Leonora Stensheim";

  return (
    <div className="grid grid-cols-1 gap-8 items-start lg:grid-cols-[1.6fr_1fr]">
      <div className="flex w-full flex-col gap-4 lg:max-w-[560px] xl:max-w-[600px]">
        <ImageCarousel images={completeProduct.images} productName={completeProduct.name} />
      </div>

      <div className="flex flex-col justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 leading-tight mb-4">
            {completeProduct.name || 'Produktnavn'}
          </h1>
          
          {completeProduct.story && (
            <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm font-medium text-amber-900 mb-1">Historikk</p>
              <p className="text-base leading-relaxed text-amber-800 whitespace-pre-wrap">
                {completeProduct.story}
              </p>
            </div>
          )}

          {completeProduct.description ? (
            <p className="text-base leading-relaxed text-slate-600 whitespace-pre-wrap mb-4">
              {completeProduct.description}
            </p>
          ) : (
            <p className="text-sm text-slate-500 mb-4">Ingen beskrivelse er tilgjengelig for dette produktet.</p>
          )}

          <p className="text-2xl font-semibold text-emerald-800 mb-4">
            {price} {currency}
          </p>

          {/* Product specifications */}
          <div className="mb-6 space-y-3">
            {completeProduct.category && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="font-medium text-slate-900">Kategori:</span>
                <span>{completeProduct.category}</span>
              </div>
            )}
            {completeProduct.stock !== undefined && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="font-medium text-slate-900">Lagerstatus:</span>
                <span className={completeProduct.stock > 0 ? 'text-green-700' : 'text-red-700'}>
                  {completeProduct.stock > 0 ? `På lager (${completeProduct.stock})` : 'Utsolgt'}
                </span>
              </div>
            )}
            {completeProduct.dimensions && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="font-medium text-slate-900">Mål:</span>
                <span>{typeof completeProduct.dimensions === 'object' 
                  ? `${completeProduct.dimensions.length || ''} x ${completeProduct.dimensions.width || ''} x ${completeProduct.dimensions.height || ''} cm`
                  : completeProduct.dimensions}</span>
              </div>
            )}
            {completeProduct.weight && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="font-medium text-slate-900">Vekt:</span>
                <span>{completeProduct.weight} kg</span>
              </div>
            )}
          </div>

          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-600">Farge:</div>
            <div className="flex items-center gap-2">
              {colors.map((color, idx) => (
                <span
                  key={idx}
                  className="w-8 h-8 rounded-full border border-slate-300/50"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="text-sm font-semibold text-slate-700 uppercase tracking-[0.12em] mb-2">Skaper</div>
          <div className="text-base text-slate-800 font-medium mb-6">{creator}</div>
        </div>

        <div className="space-y-3">
          {ownerPreview && (
            <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Dette produktet er ikke publisert ennå og kan bare vises av deg.
            </p>
          )}
          {!ownerPreview && <CartButton product={cartProduct} className="w-full" />}
          {canEditProduct && (
            <Link
              href={`?edit=true`}
              className="block w-full rounded-xl border border-slate-200 bg-slate-100/60 px-4 py-2.5 text-center text-sm font-medium text-slate-800 transition hover:bg-slate-200/60"
            >
              Rediger produkt
            </Link>
          )}
          <Link
            href="/products/cart"
            className="block w-full rounded-xl border border-slate-200 bg-slate-100/60 px-4 py-2.5 text-center text-sm font-medium text-slate-800 transition hover:bg-slate-200/60"
          >
            Gå til handlekurv
          </Link>
          <div className="text-xs text-slate-500">
            Spesifikasjoner (klikk for utvidelse)
          </div>
        </div>
      </div>
    </div>
  );
}