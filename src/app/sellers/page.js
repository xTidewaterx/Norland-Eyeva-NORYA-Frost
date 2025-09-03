'use client';

import { Merriweather, Montserrat } from 'next/font/google';
const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400'],
});
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'], // Choose weights you need
});




import { Quicksand } from 'next/font/google';

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'], // Choose weights that suit your vibe
});

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { app } from '../../firebase/firebaseConfig';
import { getFirestore, collection, getDocs } from "firebase/firestore";

const db = getFirestore(app);

export default function GetProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchProfiles() {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProfiles(users);
    }

    fetchProfiles();
  }, []);

  const filteredProfiles = profiles.filter(profile =>
    profile.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 bg-white">
      <h2 className={`${montserrat.className} text-4xl font-semibold text-center text-gray-900 mb-12`}>
        Selgere
      </h2>

<div className="mb-10 flex justify-center">
<input
  type="text"
  placeholder="Søk etter navn..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className={`${quicksand.className} w-full sm:w-1/2 px-4 py-2 rounded-xl border-[3px] border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500`}
  />

</div>

  <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
  {filteredProfiles.map((profile) => (
    <li key={profile.id}>
      <Link href={`/profile/${profile.id}`} className="block group">
        <div className="flex flex-col items-center space-y-4">
<img
  alt={profile.displayName || "Profile"}
  src={profile.photoURL || "/default-avatar.png"}
  className="w-[60vw] sm:w-[200px] md:w-[240px] lg:w-[280px] h-auto rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
/>     <p className={`${quicksand.className} text-lg font-medium text-gray-900 text-center`}>
            {profile.displayName || "Unnamed User"}
          </p>
        </div>
      </Link>
    </li>
  ))}
</ul>
    </div>
  );
}


