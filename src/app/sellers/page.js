'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OnboardingNotice from '../components/OnboardingNotice';

const TEMP_NORWAY_STOCK_PHOTOS = [
  'https://images.pexels.com/photos/3222422/pexels-photo-3222422.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/2050994/pexels-photo-2050994.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/532220/pexels-photo-532220.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1200',
];

const getTempSellerPhoto = (index) => TEMP_NORWAY_STOCK_PHOTOS[index % TEMP_NORWAY_STOCK_PHOTOS.length];

const keyframes = `
@keyframes sellersCardReveal {
  from { opacity: 0; transform: translateY(48px) scale(0.94); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes sellersFadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes sellersShimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.seller-card {
  opacity: 0;
  animation: sellersCardReveal 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  will-change: transform, opacity;
}

.seller-fade-up {
  opacity: 0;
  animation: sellersFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  will-change: transform, opacity;
}

.seller-shimmer {
  background: linear-gradient(90deg, #f2f2f7 25%, #e5e5ea 50%, #f2f2f7 75%);
  background-size: 200% 100%;
  animation: sellersShimmer 1.5s infinite;
}

.animation-delay-100 { animation-delay: 0.1s; }
.animation-delay-200 { animation-delay: 0.2s; }
.animation-delay-300 { animation-delay: 0.3s; }
.animation-delay-400 { animation-delay: 0.4s; }
`;

export default function GetProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const response = await fetch('/api/creator-directory');
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Skaperne kunne ikke lastes.');
        }
        setProfiles(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        console.error('Failed to fetch profiles:', error);
        setLoadError(error.message || 'Skaperne kunne ikke lastes akkurat nå.');
      } finally {
        setIsLoaded(true);
      }
    }

    fetchProfiles();
  }, []);

  const filteredProfiles = profiles.filter((profile) =>
    profile.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <style>{keyframes}</style>
      <div className="min-h-screen bg-white">
        {/* Hero Header - full width breakout */}
        <section className="relative w-full pt-32 pb-16 md:pt-40 md:pb-24">
          <div className="text-center px-6 md:px-12">
            <div className="seller-fade-up inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-[#0076FF]/[0.08]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0076FF]"></span>
              <span className="text-xs font-semibold text-[#0076FF] tracking-[0.2em] uppercase">
                Håndverkerne
              </span>
            </div>
            <h1 className="seller-fade-up animation-delay-100 font-serif text-5xl md:text-7xl lg:text-8xl text-[#1c1c1e] mb-6 font-light tracking-tight leading-[1.1]">
              Møt skaperne
            </h1>
            <p className="seller-fade-up animation-delay-200 max-w-2xl mx-auto text-lg md:text-xl text-[#8E8E93] leading-relaxed font-light px-4">
              Bak hver eneste NORYA-piece står en person — en dedikert håndverker med tiår av erfaring, dyp respekt for materialer, og en ubøyd forpliktelse til perfeksjon.
            </p>
          </div>
        </section>

        {/* Onboarding Notice */}
        <div className="max-w-3xl mx-auto px-6 md:px-12 mb-16 seller-fade-up animation-delay-300">
          <OnboardingNotice
            storageKey="norya_sellers_page_intro_seen"
            title="Vil du selge på NORYA?"
            buttonLabel="Skjønner"
          >
            Opprett eller logg inn på konto, gå til Min Profil, og trykk Nytt Produkt for å publisere dine første varer.
            <div className="mt-3">
              <Link href="/profile" className="font-semibold text-[#0076FF] underline underline-offset-4 hover:text-[#0056b3] transition-colors">
                Gå til Min Profil
              </Link>
            </div>
          </OnboardingNotice>
        </div>

        {/* Creator Grid */}
        <section className="px-6 md:px-12 pb-32">
          <div className="max-w-7xl mx-auto">
            {/* Search - refined Apple style */}
            <div className="mb-12 flex justify-center seller-fade-up animation-delay-400">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Søk etter skaper..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-white border border-[#d1d1d6] text-[#1c1c1e] placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#0076FF]/30 focus:border-[#0076FF] transition-all duration-300 shadow-sm hover:shadow-md text-base"
                />
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E8E93] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Cards Grid - Apple/Netflix style */}
            {isLoaded && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {filteredProfiles.map((profile, index) => (
                  <Link
                    key={profile.id}
                    href={`/profile/${profile.id}`}
                    className="seller-card group block"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="group block">
                      {/* Image Card */}
                      <div className="relative aspect-[4/5] overflow-hidden bg-[#f2f2f7] rounded-[20px]">
                        <img
                          alt={profile.displayName || 'Profile'}
                          src={profile.profileImage || getTempSellerPhoto(index)}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Hover overlay with name */}
                        <div className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                          <span className="text-white font-serif text-lg drop-shadow-md">Se profil</span>
                        </div>
                      </div>

                      {/* Text directly on page - no background, no border */}
                      <div className="mt-3 px-1">
                        <h3 className="font-serif text-xl md:text-2xl text-[#1c1c1e] mb-1 font-medium truncate leading-tight">
                          {profile.displayName || 'Uten navn'}
                        </h3>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#44DB5E]"></span>
                          <span className="text-sm text-[#8E8E93] font-medium">Skaper på NORYA</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {isLoaded && filteredProfiles.length === 0 && (
              <div className="text-center py-24">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0076FF]/[0.08] mb-4">
                  <svg className="w-8 h-8 text-[#0076FF]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-[#8E8E93] text-lg">
                  {loadError
                    ? loadError
                    : searchTerm
                      ? `Ingen skapere funnet for "${searchTerm}"`
                      : 'Våre skapere presenteres her så snart profilene er klare.'}
                </p>
              </div>
            )}

            {!isLoaded && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-[20px] overflow-hidden border border-[#f2f2f7]">
                    <div className="aspect-[4/5] bg-[#f2f2f7] seller-shimmer"></div>
                    <div className="mt-3 px-1">
                      <div className="h-6 bg-[#f2f2f7] rounded-lg mb-1 w-3/4 seller-shimmer"></div>
                      <div className="h-4 bg-[#f2f2f7] rounded-lg w-1/2 seller-shimmer"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
