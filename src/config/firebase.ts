import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// Note: These are public configuration values, not secret keys
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
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