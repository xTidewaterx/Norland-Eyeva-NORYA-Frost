// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getAuth,  GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { getStorage, ref, listAll, getDownloadURL  } from "firebase/storage";
import { getFirestore } from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkobx9fcpBvrp0H2ZhtnaclKF7VhiM5D8",
  authDomain: "norland-a7730.firebaseapp.com",
  projectId: "norland-a7730",
  storageBucket: "norland-a7730.appspot.com",
  messagingSenderId: "482065642535",
  appId: "1:482065642535:web:86b38b0602b8c929698a02",
  measurementId: "G-VF3NMZ0F3D"
};

// Initialize Firebase


 

 const app = initializeApp(firebaseConfig);
 export const auth = getAuth(app);
 const provider = new GoogleAuthProvider();
 const storage = getStorage(app);
export const db = getFirestore(app);

 
 export {provider, signInWithRedirect, getRedirectResult, storage, app, ref, listAll, getDownloadURL };
 

// Prevent Analytics from running on the server
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
