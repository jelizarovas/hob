// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCzT-vmG2JkViH4gznWl5B1E66gpDAqQUU",
  authDomain: "honda-burien.firebaseapp.com",
  databaseURL: "https://honda-burien-default-rtdb.firebaseio.com",
  projectId: "honda-burien",
  storageBucket: "honda-burien.appspot.com",
  messagingSenderId: "200470720144",
  appId: "1:200470720144:web:ca7e3e3ad34bfb09a2f215",
  measurementId: "G-BB0SKWF6GS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
