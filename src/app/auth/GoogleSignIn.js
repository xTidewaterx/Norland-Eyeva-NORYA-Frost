"use client";

import { useState, useEffect } from "react";
import { auth, provider } from "../../firebase/firebaseConfig";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "../../firebase/firebaseConfig";

export function GoogleSignIn() {
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // 🔥 Firestore profile sync
        const db = getFirestore(app);
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || "",
            photoURL: firebaseUser.photoURL || "",
            createdAt: new Date(),
          });
          console.log("📦 Firestore profile created for:", firebaseUser.email);
        }
      } else {
        setUser(null);
      }
    });

    

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setErrorMessage("");
      console.log("✅ Signed in:", result.user);
    } catch (error) {
      setErrorMessage(error.message);
      console.error("❌ Sign-in error:", error.message);
    }
  };

  return (
    <section className="flex flex-col items-center justify-center  dark:bg-gray-900 px-4">
      <div className="max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
        {user ? (
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Welcome, {user.displayName}
            </h2>
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-16 h-16 rounded-full mx-auto"
            />
            <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
          </div>
        ) : (
  <button
  onClick={handleGoogleSignIn}
  className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg shadow-sm transition duration-200"
>
  <img
    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
    alt="Google logo"
    className="w-5 h-5"
  />
  <span>Sign in with Google</span>
</button>
        )}
        {errorMessage && (
          <p className="text-sm text-red-500 text-center">{errorMessage}</p>
        )}
      </div>
    </section>
  );
}