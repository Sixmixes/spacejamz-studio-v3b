import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth, OAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAf-N-8URXsLBmKyXMcleT1LqMLKYOldvw",
  authDomain: "spacejamz-b4e71.firebaseapp.com",
  projectId: "spacejamz-b4e71",
  storageBucket: "spacejamz-b4e71.firebasestorage.app",
  messagingSenderId: "220787262787",
  appId: "1:220787262787:web:94ca5132ef7f4fbbf35bf6",
  measurementId: "G-RKEK172PFF"
};

// Initialize Firebase (Next.js friendly)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
let analytics: any;

if (typeof window !== 'undefined') {
  isSupported().then((isSupported) => {
      if (isSupported) {
          analytics = getAnalytics(app);
      }
  });
}

const db = getFirestore(app);
const auth = getAuth(app);
const rtdb = getDatabase(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Initialize Discord OIDC Provider
const discordProvider = new OAuthProvider('oidc.discord');
discordProvider.addScope('identify');
discordProvider.addScope('email');

export { app, db, auth, rtdb, discordProvider, analytics, storage, functions };
