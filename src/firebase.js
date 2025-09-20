import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBxD-ELTkbweIZnsiQQu-T97SrCpNEwi7Y",
  authDomain: "ldd-backend-910d6.firebaseapp.com",
  projectId: "ldd-backend-910d6",
  storageBucket: "ldd-backend-910d6.firebasestorage.app",
  messagingSenderId: "245318789124",
  appId: "1:245318789124:web:f6a04d784a4199a570ad51"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const db = getFirestore(app);

console.log("Firebase initialized:", { auth, db, storage });