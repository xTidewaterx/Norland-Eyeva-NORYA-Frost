"use client";

import { useState } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { app } from "../../firebase/firebaseConfig";
import { ResetPassword } from "../../firebase/resetPassword";
import OnboardingNotice from "../components/OnboardingNotice";

export const SignInUser = ({ defaultRole }) => {
  const [authObject, setAuthObject] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const auth = getAuth(app);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAuthObject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const signInUserFunction = async (event) => {
    event.preventDefault();
    const { email, password } = authObject;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      setSuccessMessage(`Velkommen tilbake, ${user.email}`);
      setErrorMessage("");
      console.log("✅ Signed in:", user.email);
    } catch (error) {
      setErrorMessage(error.message);
      setSuccessMessage("");
      console.error("❌ Sign-in error:", error.code, error.message);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center px-4 py-8 w-full">
        <a
          href="#"
          className="flex items-center mb-8 text-3xl font-semibold text-gray-900 dark:text-white"
        >
          <img
            className="rounded-full w-14 h-14 mr-3"
            src="https://firebasestorage.googleapis.com/v0/b/norland-a7730.appspot.com/o/pictureTest%2Fundefined1729507366480?alt=media&token=81c3abaf-45b5-4dbe-b569-51602b6ee354"
            alt="logo"
          />
          Norya
        </a>

        <div className="w-full bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl dark:border sm:max-w-2xl xl:max-w-3xl p-8 md:p-10 dark:bg-gray-800/70 dark:border-gray-700 transition-all">
          <div className="space-y-6 md:space-y-8">
            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-gray-900 md:text-3xl dark:text-white text-center">
              Logg inn
            </h1>

            <OnboardingNotice
              storageKey="norya_login_intro_seen"
              title="Første gang her?"
              buttonLabel="Forstått"
            >
              Logg inn for å lagre favoritter, følge skapere og administrere profil. Hvis du vil selge senere, kan du publisere produkter fra profilsiden.
            </OnboardingNotice>

            <form className="space-y-6 md:space-y-8" onSubmit={signInUserFunction}>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  E-post
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={authObject.email}
                  onChange={handleChange}
                  required
                  placeholder="navn@firma.no"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-xl block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Passord
                </label>
                <input
                  name="password"
                  type="password"
                  value={authObject.password}
                  onChange={handleChange}
                  placeholder="Passord"
                  minLength={6}
                  required
                  autoComplete="new-password"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-xl block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              {errorMessage && (
                <p className="text-red-500 text-sm">{errorMessage}</p>
              )}
              {successMessage && (
                <p className="text-green-500 text-sm">{successMessage}</p>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-base px-5 py-3 text-center text-white shadow-lg transition"
              >
                Logg inn
              </button>
            </form>

            <ResetPassword authObject={authObject} />
          </div>
        </div>
      </div>
    </section>
  );
};
