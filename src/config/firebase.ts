import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate that required config values are present and not placeholder values
const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredConfigKeys.filter(key => {
  const value = firebaseConfig[key as keyof typeof firebaseConfig];
  return !value || 
         value === `your-${key.toLowerCase().replace(/([A-Z])/g, '-$1')}-here` || 
         value?.toString().startsWith('your-') ||
         value?.toString().startsWith('demo-');
});

// Check if we're in development mode with placeholder values
const isUsingPlaceholderConfig = missingKeys.length > 0;

if (isUsingPlaceholderConfig) {
  console.warn('⚠️ Firebase is not configured with real project values.');
  console.warn('To enable Firebase features:');
  console.warn('1. Go to https://console.firebase.google.com/');
  console.warn('2. Create a new project or select an existing one');
  console.warn('3. Go to Project Settings > General > Your apps');
  console.warn('4. Copy the configuration values to your .env file');
  console.warn('5. Restart the development server');
}

// Initialize Firebase with error handling
let app;
let db;
let auth;

try {
  if (!isUsingPlaceholderConfig) {
    // Initialize Firebase only if we have real config values
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } else {
    // Create mock objects for development
    console.warn('Running in demo mode without Firebase connection');
    app = null;
    db = null;
    auth = null;
  }
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  app = null;
  db = null;
  auth = null;
}

export { db, auth };
export default app;