"use client";

import { useState, useEffect } from "react";
import {
  signInWithPopup,
  onAuthStateChanged,
  getAuth,
  signOut,
} from "firebase/auth";
import { app, provider } from "../../firebase/firebaseConfig";

export function GoogleSignIn({ role }) {
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const firebaseAuth = getAuth(app);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, [firebaseAuth]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage("");
    sessionStorage.setItem("norya_google_profile_setup", "true");
    try {
      const result = await signInWithPopup(firebaseAuth, provider);
      const signedInUser = result.user;
      const idToken = await signedInUser.getIdToken();
      const response = await fetch("/api/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ role: role || "civilian" }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Profilen kunne ikke opprettes.");
      }

      const returnTo = new URLSearchParams(window.location.search).get("returnTo");
      const target =
        returnTo?.startsWith("/") && !returnTo.startsWith("//")
          ? new URL(returnTo, window.location.origin)
          : null;
      const destination =
        target?.origin === window.location.origin
          ? `${target.pathname}${target.search}${target.hash}`
          : "/profile";
      window.location.replace(destination);
    } catch (error) {
      setErrorMessage(error.message || "Google-innloggingen mislyktes.");
      console.error("Google sign-in or profile provisioning failed:", error);
      if (firebaseAuth.currentUser) {
        try {
          await signOut(firebaseAuth);
        } catch (signOutError) {
          console.error("Could not sign out after profile provisioning failed:", signOutError);
        }
      }
    } finally {
      sessionStorage.removeItem("norya_google_profile_setup");
      setIsSigningIn(false);
    }
  };

  return (
    <>
      {!user && (
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
          className="rounded-full border border-slate-300 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white flex items-center justify-center gap-2"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
            className="w-5 h-5"
          />
          {isSigningIn ? "Oppretter profil..." : "Fortsett med Google"}
        </button>
      )}
      {errorMessage && (
        <p className="text-sm text-red-500 text-center">{errorMessage}</p>
      )}
    </>
  );
}