import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyBT170c-bkUVNadGVWwSFx25uQHtGlQFrI",
    authDomain: "futmaster-35bfe.firebaseapp.com",
    projectId: "futmaster-35bfe",
    storageBucket: "futmaster-35bfe.firebasestorage.app",
    messagingSenderId: "451032100438",
    appId: "1:451032100438:web:073d15f7c26a425b30d5f7",
    measurementId: "G-PQ0MVLH0M1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore (app);
export const auth = getAuth ();
export default app;