"use client";

import { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { app } from "../firebase/firebaseConfig"; // adjust path if needed

export const ResetPassword = ({ authObject }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handlePasswordReset = async () => {
    const auth = getAuth(app);

    if (!authObject.email) {
      setErrorMessage("Please enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, authObject.email);
      setSuccessMessage("Password reset email sent. Check your inbox.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
      setSuccessMessage("");
    }
  };

  return (
    <div className="text-center mt-4">
      <button
        onClick={handlePasswordReset}
        className="text-sm text-primary-600 hover:underline dark:text-primary-400"
      >
        Forgot your password?
      </button>
      {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
      {successMessage && <p className="text-green-500 text-sm mt-2">{successMessage}</p>}
    </div>
  );
};
