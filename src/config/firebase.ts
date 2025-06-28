import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBp_36FRxKJOQLwI3nb1xyV_QvwGmGwE0Q",
  authDomain: "jinjjamood.firebaseapp.com",
  projectId: "jinjjamood",
  storageBucket: "jinjjamood.firebasestorage.app",
  messagingSenderId: "839609257734",
  appId: "1:839609257734:web:ee4b1cb64a8de8471b5887",
  measurementId: "G-M6GVPB2471"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and set up Google provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Force account selection and restrict to Gmail domains
googleProvider.setCustomParameters({
  prompt: 'select_account',
  hd: 'gmail.com' // Restrict to Gmail domains only
});

// Initialize Firestore
export const db = getFirestore(app);

export default app;