import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCJikWrjeUw51bueTnOxlloESKC0kBOCmA",
  authDomain: "epicdle.firebaseapp.com",
  projectId: "epicdle",
  storageBucket: "epicdle.firebasestorage.app",
  messagingSenderId: "432655666173",
  appId: "1:432655666173:web:eb065de436296057a32794",
  measurementId: "G-VSQXB0W85J",
};

export const app = initializeApp(firebaseConfig);
export async function getFirebaseAnalytics() {
  if (typeof window === "undefined") return null; // SSR safety
  const supported = await isSupported();
  return supported ? getAnalytics(app) : null;
}
