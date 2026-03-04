import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA22ZTrYlGThy7nibYGqNBiXjFJzXOzpdk',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'atlas-606a7.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'atlas-606a7',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'atlas-606a7.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '860511503832',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:860511503832:web:3b9265de75c1cdb59a5ead',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
