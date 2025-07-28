'use client';

import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';

const fetcher = (url) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Network error');
    return res.json();
  });

export default function GetProducts() {
  const { data, error, isLoading } = useSWR('/api/products', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const products = data?.data || [];

  const placeholderCards = Array.from({ length: 8 }).map((_, idx) => (
    <div
      key={idx}
      style={{ animationDelay: `${idx * 75}ms` }}
      className="bg-gray-200 animate-pulse rounded-xl flex flex-col aspect-[9/16] w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[500px] xl:max-w-[600px] opacity-0 animate-fadeInUp animation-fill-forwards"
    />
  ));

  return (
    <div className="w-full py-10">
      {/* Grid container for heading */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-x-6 gap-y-10 px-4 mb-6">
        <div className="col-span-full px-3 max-w-[600px] mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl text-gray-700 bg-white/80 py-4 rounded-xl text-left">
            Produkter
          </h2>
        </div>
      </div>

      {/* Product card grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-x-6 gap-y-10 px-4">
        {(isLoading ? placeholderCards : products).map((product, index) => (
          <Link key={product.id || index} href={`/products/${product.id}`} prefetch={false}>
            <div
              style={{ animationDelay: `${index * 75}ms` }}
              className="group opacity-0 animate-fadeInUp animation-fill-forwards bg-white/80 rounded-xl overflow-hidden transition-all hover:scale-[1.02] flex flex-col aspect-[9/16]"
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                <Image
                  src={product.images?.[0] || '/placeholder.jpg'}
                  alt="Product preview"
                  fill
                  priority
                  quality={60}
                  loading="eager"
                  placeholder="blur"
                  blurDataURL="/blur-placeholder.jpg"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>

              <div className="flex flex-col justify-between gap-2 text-sm bg-white px-3 py-4 rounded-b-md">
                <div className="flex justify-between items-center">
                  <div className="truncate text-sm">{product.name}</div>
                  <button className="text-pink-500 hover:text-pink-600">❤️</button>
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