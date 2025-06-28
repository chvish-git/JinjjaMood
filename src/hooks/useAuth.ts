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
      const userDocRef = doc(db, 'users', username);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile({
          username: data.username,
          name: data.name,
          createdAt: data.createdAt.toDate()
        });
      } else {
        // User doesn't exist in Firestore, clear localStorage
        localStorage.removeItem('jinjjamood_username');
        setUserProfile(null);
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Failed to load user profile. Please check your Firebase configuration.');
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameAndCreateOrLogin = async (usernameInput: string, isSignup: boolean = false): Promise<{ success: boolean; error?: string; isNewUser?: boolean }> => {
    // TC-LOGIN-003: Empty username validation
    if (!usernameInput || usernameInput.trim().length === 0) {
      return { success: false, error: 'Please enter a valid username.' };
    }

    // TC-LOGIN-004: Whitespace-only username validation
    if (usernameInput.trim() !== usernameInput || usernameInput.trim().length === 0) {
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

    // Check network connectivity before attempting Firebase operations
    if (!navigator.onLine) {
      return { success: false, error: 'You are offline. Please connect to the internet to log in or create an account.' };
    }

    try {
      setError(null);
      setLoading(true);

      // Check if user exists
      const userDocRef = doc(db, 'users', trimmedUsername);
      const existingUser = await getDoc(userDocRef);
      
      if (existingUser.exists()) {
        // TC-LOGIN-002: Handle duplicate username for signup
        if (isSignup) {
          return { success: false, error: 'Username already exists.' };
        }
        
        // TC-LOGIN-005: Existing user logs in
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
        // TC-LOGIN-001: Create new user
        const newUserProfile = {
          username: trimmedUsername,
          name: trimmedUsername, // Using username as display name
          createdAt: serverTimestamp()
        };
        
        await setDoc(userDocRef, newUserProfile);
        
        // Set currentUser and navigate
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
      console.error('Username check error:', err);
      
      // Provide more specific error messages based on Firebase error codes
      let errorMessage = 'Failed to process username';
      
      if (err.code === 'unavailable' || err.message?.includes('offline')) {
        errorMessage = 'Firebase connection failed. Please check your Firebase configuration in the .env file.';
      } else if (err.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your Firebase security rules.';
      } else if (err.code === 'not-found') {
        errorMessage = 'Firebase project not found. Please verify your project configuration.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('jinjjamood_username');
    setUserProfile(null);
    setError(null);
  };

  return {
    userProfile,
    loading,
    error,
    checkUsernameAndCreateOrLogin,
    logout,
    isAuthenticated: !!userProfile
  };
};