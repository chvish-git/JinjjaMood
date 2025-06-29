import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

interface UserProfile {
  username: string;
  name: string;
  createdAt: Date;
}

export const useAuth = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in (stored in localStorage)
    const storedUsername = localStorage.getItem('jinjjamood_username');
    if (storedUsername) {
      // Load user profile from Firestore
      loadUserProfile(storedUsername);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserProfile = async (username: string) => {
    try {
      console.log('🔵 DEBUG: Loading user profile for username:', username);
      const userDocRef = doc(db, 'users', username);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile({
          username: data.username,
          name: data.name,
          createdAt: data.createdAt.toDate()
        });
        console.log('✅ DEBUG: User profile loaded successfully');
      } else {
        console.log('⚠️ DEBUG: User document does not exist in Firestore');
        // User doesn't exist in Firestore, clear localStorage
        localStorage.removeItem('jinjjamood_username');
        setUserProfile(null);
      }
    } catch (err: any) {
      console.error('❌ DEBUG: Error loading user profile:', err);
      console.error('❌ DEBUG: Error code:', err.code);
      console.error('❌ DEBUG: Error message:', err.message);
      
      if (err.code === 'permission-denied') {
        const detailedError = `
🔒 FIRESTORE PERMISSIONS ERROR

Your Firestore security rules are blocking access to the 'users' collection.

TO FIX THIS:
1. Go to your Firebase Console (https://console.firebase.google.com)
2. Select your project
3. Navigate to Firestore Database
4. Click on the 'Rules' tab
5. Update your rules to allow read/write access to the 'users' collection

EXAMPLE RULE FOR DEVELOPMENT:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{document=**} {
      allow read, write: if true;
    }
  }
}

⚠️ WARNING: The above rule allows public access. For production, use proper authentication rules.

EXAMPLE RULE FOR PRODUCTION:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
        `;
        
        setError(detailedError);
        console.error(detailedError);
      } else if (err.code === 'unavailable') {
        setError('Firebase is currently unavailable. Please check your internet connection and try again.');
      } else if (err.code === 'not-found') {
        setError('Firebase project not found. Please verify your Firebase configuration in src/config/firebase.ts');
      } else if (err.code === 'invalid-argument') {
        setError('Invalid Firebase configuration. Please check your project settings and API keys.');
      } else {
        setError(`Failed to load user profile: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameAndCreateOrLogin = async (usernameInput: string): Promise<{ success: boolean; error?: string; isNewUser?: boolean }> => {
    // TC-LOGIN-003 & TC-LOGIN-004: Empty and whitespace validation
    if (!usernameInput || usernameInput.trim().length === 0) {
      return { success: false, error: 'Please enter a valid username.' };
    }

    const trimmedUsername = usernameInput.trim().toLowerCase();
    
    // Basic username validation
    if (trimmedUsername.length < 2) {
      return { success: false, error: 'Username must be at least 2 characters long' };
    }
    
    if (trimmedUsername.length > 20) {
      return { success: false, error: 'Username must be 20 characters or less' };
    }
    
    if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
      return { success: false, error: 'Username can only contain letters, numbers, and underscores' };
    }

    // Check for reserved usernames
    const reservedNames = ['admin', 'null', 'undefined', 'root', 'system', 'api', 'www', 'mail', 'ftp'];
    if (reservedNames.includes(trimmedUsername)) {
      return { success: false, error: 'This username is reserved. Please choose another.' };
    }

    // Check network connectivity
    if (!navigator.onLine) {
      return { success: false, error: 'You are offline. Please connect to the internet to continue.' };
    }

    try {
      setError(null);
      setLoading(true);
      
      console.log('🔵 DEBUG: Checking username:', trimmedUsername);

      // Check if user exists in database
      const userDocRef = doc(db, 'users', trimmedUsername);
      const existingUser = await getDoc(userDocRef);
      
      if (existingUser.exists()) {
        // TC-LOGIN-005: Existing user logs in
        console.log('✅ DEBUG: Existing user found');
        const userData = existingUser.data();
        setUserProfile({
          username: userData.username,
          name: userData.name,
          createdAt: userData.createdAt.toDate()
        });
        
        // Store username in localStorage for session tracking
        localStorage.setItem('jinjjamood_username', trimmedUsername);
        
        return { success: true, isNewUser: false };
      } else {
        // TC-LOGIN-001: Create new user with unique username
        console.log('🔵 DEBUG: Creating new user');
        const newUserProfile = {
          username: trimmedUsername,
          name: trimmedUsername, // Using username as display name
          createdAt: serverTimestamp()
        };
        
        await setDoc(userDocRef, newUserProfile);
        console.log('✅ DEBUG: New user created successfully');
        
        // Set user profile
        setUserProfile({
          username: trimmedUsername,
          name: trimmedUsername,
          createdAt: new Date()
        });
        
        // Store username in localStorage for session tracking
        localStorage.setItem('jinjjamood_username', trimmedUsername);
        
        return { success: true, isNewUser: true };
      }
      
    } catch (err: any) {
      console.error('❌ DEBUG: Username check error:', err);
      console.error('❌ DEBUG: Error code:', err.code);
      console.error('❌ DEBUG: Error message:', err.message);
      
      // Provide specific error messages based on Firebase error codes
      let errorMessage = 'Failed to process username';
      
      if (err.code === 'permission-denied') {
        errorMessage = `
🔒 FIRESTORE PERMISSIONS ERROR

Your Firestore security rules are blocking access to the 'users' collection.

TO FIX THIS:
1. Go to Firebase Console → Firestore Database → Rules
2. Update your rules to allow access to the 'users' collection
3. For development, you can use: allow read, write: if true;
4. For production, use proper authentication rules

See the browser console for detailed instructions.
        `;
      } else if (err.code === 'unavailable' || err.message?.includes('offline')) {
        errorMessage = 'Firebase connection failed. Please check your internet connection.';
      } else if (err.code === 'not-found') {
        errorMessage = 'Firebase project not found. Please verify your project configuration.';
      } else if (err.code === 'invalid-argument') {
        errorMessage = 'Invalid Firebase configuration. Please check your project settings.';
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🟡 DEBUG: useAuth logout() function started');
    console.log('🟡 DEBUG: Current userProfile before clearing:', userProfile);
    console.log('🟡 DEBUG: Current localStorage before clearing:', localStorage.getItem('jinjjamood_username'));
    
    // Clear localStorage
    localStorage.removeItem('jinjjamood_username');
    console.log('🟡 DEBUG: localStorage cleared, new value:', localStorage.getItem('jinjjamood_username'));
    
    // Clear user profile state
    setUserProfile(null);
    console.log('🟡 DEBUG: setUserProfile(null) called');
    
    // Clear any errors
    setError(null);
    console.log('🟡 DEBUG: setError(null) called');
    
    console.log('🟡 DEBUG: useAuth logout() function completed');
  };

  const isAuthenticated = !!userProfile;
  console.log('🔵 DEBUG: useAuth hook - isAuthenticated:', isAuthenticated, 'userProfile:', userProfile);

  return {
    userProfile,
    loading,
    error,
    checkUsernameAndCreateOrLogin,
    logout,
    isAuthenticated
  };
};