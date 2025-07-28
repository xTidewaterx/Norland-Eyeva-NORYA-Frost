'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Link from 'next/link';

export default function UserRow() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const snapshot = await getDocs(collection(db, 'users'));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div className="pb-12 md:pb-16 lg:pb-20">
      <section className="w-full px-6 py-12 mb-12 overflow-x-auto custom-scrollbar">
        <h2 className="text-3xl mb-10 text-slate-900 tracking-tight leading-tight font-poppins">
          Skapere
        </h2>

        <div className="inline-flex gap-6 pb-6">
          {users.map(user => (
            <div
              key={user.id}
              className="min-w-[260px] flex flex-col items-center shrink-0 gap-3"
            >
              <Link
                href={`/profile/${user.uid}`}
                className="transition-transform duration-300 ease-in-out hover:scale-[1.03]"
              >
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="w-[50vw] sm:w-[180px] md:w-[220px] lg:w-[260px] h-auto rounded-full object-cover shadow-md hover:ring-1 hover:ring-slate-300 transition-all"
                />
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
      </section>
    </div>
  );
}