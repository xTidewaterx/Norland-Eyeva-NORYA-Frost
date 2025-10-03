'use client';

import Link from 'next/link';

const users = [
  {
    id: 'user_001',
    uid: 'johan001',
    displayName: 'Johan Myhre',
    title: 'Designer & Explorer',
    photoURL: 'https://cdn.booniez.com/i/d/dale-of-norway-valle-sweater-bla-7868-f',
  },
  {
    id: 'user_002',
    uid: 'ilia002',
    displayName: 'Ilia Lind',
    title: 'Creative Strategist',
    photoURL: 'https://eu.daleofnorway.com/globalassets/dale-of-norway/produktbilder/81951-christiania-womens-jacket/81951_d00_life.jpg?mode=max&width=2000&height=2000',
  },
  {
    id: 'user_003',
    uid: 'siri003',
    displayName: 'Siri Stoltenberg',
    title: 'Visual Artist',
    photoURL: 'https://www.produits-scandinaves.com/20716-large_default/trondheim-men-sweater-dale-of-norway.jpg',
  },
  {
    id: 'user_004',
    uid: 'nora004',
    displayName: 'Nora Lyvia',
    title: 'Brand Architect',
    photoURL: 'https://lh6.googleusercontent.com/proxy/rWFDLN3670M0-35y9mUM0AsA0MrU0SXYY5WUiCNQsJK7T09cf_XQsSc3G7tg2SWOC1iqIme2xJ_uAEKcM9M94EFa1vStW2Y8fNyVI7j-3HcXUFZP4HmJuAxEfqSjD38DntkJsUzxORNYpc4sNI1nyQrdM2H6FJFAzNPjED5aa5w_mQaM',
  },
  {
    id: 'user_005',
    uid: 'johan005',
    displayName: 'Johan Myhre',
    title: 'Outdoor Stylist',
    photoURL: 'https://cdn.booniez.com/i/d/dale-of-norway-valle-sweater-bla-7868-f',
  },
  {
    id: 'user_006',
    uid: 'ilia006',
    displayName: 'Ilia Lind',
    title: 'Content Curator',
    photoURL: 'https://eu.daleofnorway.com/globalassets/dale-of-norway/produktbilder/81951-christiania-womens-jacket/81951_d00_life.jpg?mode=max&width=2000&height=2000',
  },
  {
    id: 'user_007',
    uid: 'siri007',
    displayName: 'Siri Stoltenberg',
    title: 'Fashion Technologist',
    photoURL: 'https://www.produits-scandinaves.com/20716-large_default/trondheim-men-sweater-dale-of-norway.jpg',
  },
  {
    id: 'user_008',
    uid: 'nora008',
    displayName: 'Nora Lyvia',
    title: 'Cultural Designer',
    photoURL: 'https://lh6.googleusercontent.com/proxy/rWFDLN3670M0-35y9mUM0AsA0MrU0SXYY5WUiCNQsJK7T09cf_XQsSc3G7tg2SWOC1iqIme2xJ_uAEKcM9M94EFa1vStW2Y8fNyVI7j-3HcXUFZP4HmJuAxEfqSjD38DntkJsUzxORNYpc4sNI1nyQrdM2H6FJFAzNPjED5aa5w_mQaM',
  },
];

export default function UserRow2() {
  return (
    <div className="pb-12 md:pb-16 lg:pb-20">
      <section className="w-full py-12 mb-12 overflow-x-auto custom-scrollbar">
        <h2 className="text-3xl mb-10 text-slate-900 tracking-tight leading-tight font-poppins pl-4">
          Skapere
        </h2>

        <div className="inline-flex gap-6 pb-6 pl-4">
          {users.map(user => (
            <div
              key={user.id}
              className="min-w-[260px] flex flex-col items-center shrink-0 gap-3"
            >
              <Link
                href={`/profile/${user.uid}`}
                className="transition-transform duration-300 ease-in-out hover:scale-[1.03]"
              >
                <div className="avatar-wrapper  min-w-76 w-[50vw] sm:w-[180px] md:w-[220px] lg:w-[400px] aspect-square overflow-hidden shadow-md hover:ring-1 hover:ring-slate-300 transition-all">
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
              <h3 className="text-base font-medium text-slate-800 text-center tracking-tight font-poppins">
                {user.displayName}
              </h3>
              <p className="text-sm text-slate-600 text-center leading-relaxed font-poppins">
                {user.title}
              </p>
            </div>
          ))}
        </div>

        {/* SVG Superellipse Definition */}
        <svg width="0" height="0">
          <defs>
            <clipPath id="superellipse" clipPathUnits="objectBoundingBox">
              <path
                d="
                  M0.5,0
                  C0.85,0,1,0.15,1,0.5
                  C1,0.85,0.85,1,0.5,1
                  C0.15,1,0,0.85,0,0.5
                  C0,0.15,0.15,0,0.5,0
                  Z
                "
              />
            </clipPath>
          </defs>
        </svg>
      </section>

      <style jsx>{`
        .avatar-wrapper {
          clip-path: url(#superellipse);
        }
      `}</style>
    </div>
  );
}