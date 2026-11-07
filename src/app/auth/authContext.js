'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';

import {
  getFirestore,
  doc,
  getDoc
} from 'firebase/firestore';

import { app } from '../../firebase/firebaseConfig'; // ✅ Make sure this path is correct
import { isFirestoreOfflineError } from '../utils/firestoreErrors';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = typeof window !== 'undefined' ? getAuth(app) : null;
  const db = typeof window !== 'undefined' ? getFirestore(app) : null;

  useEffect(() => {
    if (!auth || !db) return;

    let currentUid = null;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        currentUid = firebaseUser.uid;
        const authenticatedUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        };
        setUser(authenticatedUser);
        setLoading(false);

        try {
          // 🔍 Attempt to fetch Firestore profile document
          const profileRef = doc(db, 'users', firebaseUser.uid);
          const profileSnap = await getDoc(profileRef);

          const profileData = profileSnap.exists() ? profileSnap.data() : {};

          // 🧩 Combine Firebase Auth + Firestore profile
          const combinedUser = {
            ...authenticatedUser,
            ...profileData
          };

          if (currentUid !== firebaseUser.uid || auth.currentUser?.uid !== firebaseUser.uid) {
            return;
          }

          setUser(combinedUser);
          sessionStorage.setItem('currentUser', JSON.stringify(combinedUser));

        } catch (error) {
          if (
            !isFirestoreOfflineError(error) &&
            currentUid === firebaseUser.uid &&
            auth.currentUser?.uid === firebaseUser.uid
          ) {
            console.warn(
              `Firestore profile read failed at users/${firebaseUser.uid}; continuing with Firebase Auth profile:`,
              {
                code: error?.code || 'unknown',
                message: error?.message || String(error),
                error,
              }
            );
          }
        }
      } else {
        currentUid = null;
        // 🔐 User signed out
        setUser(null);
        setLoading(false);
        sessionStorage.removeItem('currentUser');
      }
    });

    return () => unsubscribe();
  }, [auth, db]);

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
    sessionStorage.removeItem('currentUser');
  };

  console.log('✅ user from authContext.js:', user);

  return (
    <AuthContext.Provider value={{ user, loading, handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);