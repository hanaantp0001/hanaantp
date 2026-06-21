import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import config from "../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp({
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId
});

// Initialize Authentication
const auth = getAuth(app);

// Initialize Firestore with custom databaseId
const db = getFirestore(app, config.firestoreDatabaseId || "(default)");

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account" // Forces Google to display the account selection screen
});

export { app, auth, db, googleProvider };
