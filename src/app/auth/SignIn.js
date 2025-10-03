"use client";

import { useState } from "react";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "../../firebase/firebaseConfig";

import { ResetPassword } from "../../firebase/resetPassword";

export const SignInUser = () => {
  const [authObject, setAuthObject] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAuthObject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const signInUserFunction = async (event) => {
    event.preventDefault();
    const auth = getAuth(app);
    const db = getFirestore(app);
    const { email, password } = authObject;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 🔥 Firestore profile sync
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          createdAt: new Date(),
        });
        console.log("📦 Firestore profile created for:", user.email);
      }

      setSuccessMessage(`Welcome back, ${user.email}`);
      setErrorMessage("");
      console.log("✅ Signed in:", user.email);
    } catch (error) {
      setErrorMessage(error.message);
      setSuccessMessage("");
      console.error("❌ Sign-in error:", error.code, error.message);
    }
  };








  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          <img
            className="rounded-full w-12 h-12 mr-2"
            src="https://firebasestorage.googleapis.com/v0/b/norland-a7730.appspot.com/o/pictureTest%2Fundefined1729507366480?alt=media&token=81c3abaf-45b5-4dbe-b569-51602b6ee354"
            alt="logo"
          />
          Norland
        </a>
        <div className="w-full bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Sign In
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={signInUserFunction}>
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={authObject.email}
                  onChange={handleChange}
                  required
                  placeholder="name@company.com"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={authObject.password}
                  onChange={handleChange}
                  placeholder="Password"
                  minLength={6}
                  required
                  autoComplete="new-password"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
              {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}

              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Sign In
              </button>
            </form>

  


   <ResetPassword authObject={authObject} />
    
          </div>
        </div>
      </div>
    </section>
  );
};
