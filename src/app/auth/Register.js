"use client";

import { useState } from "react";
import Cropper from "react-easy-crop";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import { app } from "../firebaseConfig";
import { getCroppedImg } from "../utils/cropImage";
import { v4 as uuidv4 } from "uuid";
import "../globals.css";
import { GoogleSignIn } from "./GoogleSignIn";

// 👤 Default fallback image
const DEFAULT_AVATAR_URL =
  "https://firebasestorage.googleapis.com/v0/b/norland-a7730.appspot.com/o/profile%2FA%20rectangular%20default%20profile%20edit.png?alt=media&token=f00d3c5c-4d54-4af8-8f89-dba56cefb708";

export const RegisterUser = () => {
  const [authObject, setAuthObject] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showCropper, setShowCropper] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAuthObject((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const onCropComplete = (_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const showCroppedImage = async () => {
    if (imageSrc && croppedAreaPixels) {
      try {
        const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
        const url = URL.createObjectURL(blob);
        setCroppedImage(url);
        setShowCropper(false);
      } catch (err) {
        setError("Image crop failed.");
      }
    }
  };

  const createUserWithEmailAndPasswordFunction = async () => {
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    const { email, password, confirmPassword, fullName, phone } = authObject;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let profileImageUrl = DEFAULT_AVATAR_URL;

      if (croppedImage) {
        const blob = await (await fetch(croppedImage)).blob();
        const imageRef = ref(storage, `profilePics/${user.uid}/${uuidv4()}.jpeg`);
        await uploadBytes(imageRef, blob);
        profileImageUrl = await getDownloadURL(imageRef);
      }

      // 🔁 Update Firebase Auth profile directly
      await updateProfile(user, {
        photoURL: profileImageUrl,
        displayName: fullName,
      });

      // 💾 Store profile info in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        fullName,
        displayName: fullName,
        phone,
        photoURL: profileImageUrl,
        createdAt: new Date(),
      });

      setSuccess(`Welcome, ${fullName || user.email}`);
      setError("");
      console.log("✅ Registered:", user.email);
    } catch (err) {
      setError(err.message);
      setSuccess("");
      console.error("❌ Error:", err.message);
    }
  };

  return (
    <section className="bg-[#F0F4F8] dark:bg-[#001A4A] min-h-screen flex flex-col items-center justify-start px-4 py-10 space-y-6">
      <div className="w-full max-w-md bg-white dark:bg-[#00205B] rounded-lg shadow-lg p-6 space-y-6">
        <div className="text-center">
          {croppedImage ? (
            <img src={croppedImage} className="w-24 h-24 rounded-full object-cover mx-auto" />
          ) : (
            <img
              src={DEFAULT_AVATAR_URL}
              className="w-12 h-12 rounded-full object-cover mx-auto"
              alt="Default Avatar"
            />
          )}
          <h1 className="text-2xl font-bold mt-2 text-[#00205B] dark:text-[#FFD100]">
            Create an account
          </h1>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm text-center">{success}</p>}

        <form className="space-y-4">
          <div className="flex flex-col items-center">
            <label
              htmlFor="profile-pic"
              className="cursor-pointer px-4 py-2 border border-[#FFD100] text-[#00205B] dark:text-[#FFD100] rounded-md hover:bg-[#00205B] hover:text-white transition"
            >
              Choose Profile Picture
            </label>
            <input
              id="profile-pic"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {showCropper && imageSrc && (
            <div className="relative w-full h-64 crop-container">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
              <div className="crop-overlay-circle"></div>
              <button
                type="button"
                className="absolute bottom-2 right-2 bg-[#00205B] text-white px-3 py-1 rounded hover:opacity-90 transition"
                onClick={showCroppedImage}
              >
                Crop
              </button>
            </div>
          )}

          <input name="fullName" value={authObject.fullName} onChange={handleChange} placeholder="Full Name" required className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
          <input name="email" type="email" value={authObject.email} onChange={handleChange} placeholder="Email" required className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
          <input name="phone" type="tel" value={authObject.phone} onChange={handleChange} placeholder="Phone (+47 12345678)" pattern="^\+?[0-9\s\-]{7,15}$" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
          <input name="password" type="password" value={authObject.password} onChange={handleChange} placeholder="Password" minLength={6} required autoComplete="new-password" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
          <input name="confirmPassword" type="password" value={authObject.confirmPassword} onChange={handleChange} placeholder="Confirm Password" minLength={6} required autoComplete="new-password" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />

          <button type="button" onClick={createUserWithEmailAndPasswordFunction} className="w-full bg-[#00205B] hover:bg-[#001A4A] text-white py-2 rounded transition">
            Create Account
          </button>
        </form>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-[#00205B] rounded-lg shadow-lg p-6 space-y-6">
        <GoogleSignIn />
      </div>
    </section>
  );
};