import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyClD0-UrbCLpyGrC7_HECj3E1G9vlyQQ68",
  authDomain: "woyane-36a2f.firebaseapp.com",
  projectId: "woyane-36a2f",
  storageBucket: "woyane-36a2f.firebasestorage.app",
  messagingSenderId: "516037247938",
  appId: "1:516037247938:web:e0d05013905e72c329cc5b",
  measurementId: "G-F13DPF7VXX",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Export Firebase Services
export const auth = getAuth(app); // Ensure this is exported
export const db = getFirestore(app);
// Export Analytics
export const analytics = getAnalytics(app);
export default app;
