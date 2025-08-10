'use client';

import dynamic from 'next/dynamic';
const ChatUI = dynamic(() => import('../components/ChatUI'), { ssr: false });

import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { getAuth, updateProfile } from 'firebase/auth';
import { getCroppedImg } from '../utils/cropImage';
import { useAuth } from '../auth/authContext';
import { GoogleSignIn } from '../auth/GoogleSignIn';
import { RegisterUser } from '../auth/Register';
import { SignInUser } from '../auth/SignIn';

const uid = 'user1'; // Replace with dynamic Firebase UID later

const ImageCropUploader = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState(false);
  const [showHalo, setShowHalo] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;
  const { user: contextUser } = useAuth();

  console.log('current user page profile:', user);

  const effectiveName =
    user?.displayName || contextUser?.fullName || user?.email || 'Your Profile';
  const profilePic = user?.photoURL;

  useEffect(() => {
    setShowHalo(true);
    const timer = setTimeout(() => setShowHalo(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const onCropComplete = useCallback((_, croppedArea) => {
    setCroppedAreaPixels(croppedArea);
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels || !user) return;

    const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
    const storage = getStorage();
    const storageRef = ref(storage, `profilePics/${user.uid}.jpg`);

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    await updateProfile(user, {
      displayName: newName || user.displayName,
      photoURL: downloadURL, // ✅ Fixed: now reflects in auth.currentUser.photoURL
    });

    alert('Profile updated successfully!');
    setEditing(false);
  };

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
        <div className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-md space-y-6">
          {!editing ? (
            <>
              {profilePic && (
                <div className="relative w-32 h-32 mx-auto">
                  {showHalo && (
                    <div className="animate-glow bg-yellow-300 blur-2xl opacity-50"></div>
                  )}
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover shadow-md relative z-10"
                  />
                </div>
              )}
              {user ? (
                <h1 className="text-center text-2xl font-light text-blue-800">
                  Welcome, <span className="font-semibold">{effectiveName}</span>
                </h1>
              ) : (
                ''
              )}

              {user ? (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="cursor-pointer w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow transition"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await auth.signOut();
                        alert('You have been signed out.');
                      } catch (error) {
                        console.error('Sign out failed:', error);
                      }
                    }}
                    className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium shadow transition"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <SignInUser />
              )}
            </>
          ) : (
            <>
              <h1 className="text-center text-2xl font-light text-blue-800">
                Editing <span className="font-semibold">{effectiveName}</span>
              </h1>

              <div>
                <label className="block text-gray-700 mb-1">Display Name</label>
                <input
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter new name"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Profile Picture</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition"
                />
              </div>

              {imageSrc && (
                <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    cropShape="round"
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleUpload}
                  className="cursor-pointer flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 shadow transition"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>

        <style jsx>{`
          @keyframes glow {
            0% {
              transform: scale(0.8);
              box-shadow: 0 0 0px rgba(255, 215, 0, 0);
              opacity: 0;
            }
            20% {
              transform: scale(1.05);
              box-shadow: 0 0 20px 10px rgba(255, 215, 0, 0.4);
              opacity: 1;
            }
            50% {
              transform: scale(1.2);
              box-shadow: 0 0 45px 20px rgba(255, 215, 0, 0.5);
              opacity: 0.8;
            }
            100% {
              transform: scale(1.5);
              box-shadow: 0 0 60px 30px rgba(255, 215, 0, 0);
              opacity: 0;
            }
          }

          .animate-glow {
            animation: glow 2.7s ease-out;
            border-radius: 9999px;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 0;
          }
        `}</style>
      </div>

      <RegisterUser />
    </div>
  );
};

export default ImageCropUploader;