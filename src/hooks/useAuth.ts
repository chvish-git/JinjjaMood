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
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameAndCreateOrLogin = async (usernameInput: string): Promise<{ success: boolean; error?: string }> => {
    if (!usernameInput || usernameInput.trim().length === 0) {
      return { success: false, error: 'Username cannot be empty' };
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

    try {
      setError(null);
      setLoading(true);

      // Step 1: Query Users where username == usernameInput
      const userDocRef = doc(db, 'users', trimmedUsername);
      const existingUser = await getDoc(userDocRef);
      
      if (existingUser.exists()) {
        // Step 3: User exists - show error
        return { success: false, error: 'Username already exists. Please try another.' };
      } else {
        // Step 2: User doesn't exist - create new user
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
        
        return { success: true };
      }
      
    } catch (err: any) {
      console.error('Username check error:', err);
      const errorMessage = err.message || 'Failed to process username';
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