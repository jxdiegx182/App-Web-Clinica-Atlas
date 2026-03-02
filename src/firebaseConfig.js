import { getFirestore } from 'firebase/firestore';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA22ZTrYlGThy7nibYGqNBiXjFJzXOzpdk",
  authDomain: "atlas-606a7.firebaseapp.com",
  projectId: "atlas-606a7",
  storageBucket: "atlas-606a7.firebasestorage.app",
  messagingSenderId: "860511503832",
  appId: "1:860511503832:web:3b9265de75c1cdb59a5ead"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);