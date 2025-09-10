'use client';

import { saveFavourite } from '../../../lib/saveFavourite';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../auth/authContext'

const products = [
  { 
    id: 'prod_001',
    name: 'Arctic Beanie',
    price: 199,
    images: ['https://cdn.booniez.com/i/d/dale-of-norway-valle-sweater-bla-7868-f'],
  },
  {
    id: 'prod_002',
    name: 'Nordic Hoodie',
    price: 499,
    images: ['https://eu.daleofnorway.com/globalassets/dale-of-norway/produktbilder/81951-christiania-womens-jacket/81951_d00_life.jpg?mode=max&width=2000&height=2000'],
  },
  {
    id: 'prod_003',
    name: 'Midnight Jacket',
    price: 1299,
    images: ['https://www.produits-scandinaves.com/20716-large_default/trondheim-men-sweater-dale-of-norway.jpg'],
  },
  {
    id: 'prod_004',
    name: 'Fjord Backpack',
    price: 899,
    images: ['https://lh6.googleusercontent.com/proxy/rWFDLN3670M0-35y9mUM0AsA0MrU0SXYY5WUiCNQsJK7T09cf_XQsSc3G7tg2SWOC1iqIme2xJ_uAEKcM9M94EFa1vStW2Y8fNyVI7j-3HcXUFZP4HmJuAxEfqSjD38DntkJsUzxORNYpc4sNI1nyQrdM2H6FJFAzNPjED5aa5w_mQaM'],
  },
];

export default function GetProducts() {


    const { user } = useAuth();
  const placeholderCards = Array.from({ length: 8 }).map((_, idx) => (
    <div
      key={idx}
      style={{ animationDelay: `${idx * 75}ms` }}
      className="bg-gray-200 animate-pulse rounded-xl flex flex-col aspect-[9/16] w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[500px] xl:max-w-[600px] opacity-0 animate-fadeInUp animation-fill-forwards"
    />
  ));

  return (
    <div className="w-full py-10">
      {/* Grid container for heading aligned with product grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-x-2 gap gap-y-10 pb-2">
        <div className="pt-0 mt-4 bg-white/80 px-3 sm:px-4 lg:px-6 sm:py-2 rounded-xl text-left text-[clamp(1.75rem,3vw,2.5rem)] text-gray-700">
          Produkter
        </div>
      </div>

      {/* Product card grid */}
      <div className="grid justify-center grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(200px,0.4fr))] gap-x-2 sm:gap-x-6 gap-y-10 px-4">
        {products.map((product, index) => (
          <Link key={product.id} href={`/products/${product.id}`} prefetch={false}>
            <div
              style={{ animationDelay: `${index * 75}ms` }}
              className="group opacity-0 animate-fadeInUp animation-fill-forwards bg-white/80 rounded-xl overflow-hidden transition-all hover:scale-[1.02] flex flex-col aspect-[9/16]"
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                <Image
                  src={product.images[0]}
                  alt="Product preview"
                  fill
                  quality={40}
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>

              <div className="flex flex-col justify-between gap-2 text-sm bg-white px-3 py-4 rounded-b-md">
                <div className="flex justify-between items-center">
                  <div className="truncate text-sm">{product.name}</div>
                  <button onClick={() => saveFavourite(product.id, user)} className="text-pink-500 hover:text-pink-600 cursor-pointer">❤️</button>
                </div>
                <div className="flex justify-between items-center text-gray-900 font-semibold text-sm truncate">
                  <span className="text-gray-800 font-medium text-[clamp(0.875rem,2vw,1.125rem)]">
                    {product.price} NOK
                  </span>
                  <div className="text-xs text-gray-500 ml-4 whitespace-nowrap">Johan Myhre</div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}