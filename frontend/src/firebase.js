import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "automate-ai-9d1d9.firebaseapp.com",
  projectId: "automate-ai-9d1d9",
  storageBucket: "automate-ai-9d1d9.firebasestorage.app",
  messagingSenderId: "344107576394",
  appId: "1:344107576394:web:63bc549d2656c6ef708ab3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();