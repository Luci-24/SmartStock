import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCSoOL9MSD72lJG5G0wy7pC-QEzYsc5xT0",
  authDomain: "smartstock-2006.firebaseapp.com",
  projectId: "smartstock-2006",
  storageBucket: "smartstock-2006.firebasestorage.app",
  messagingSenderId: "562651008558",
  appId: "1:562651008558:web:b56c036ba9b9889a7bd9bf",
  measurementId: "G-1L80CT5XVY"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;