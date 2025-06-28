import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

interface UserProfile {
  username: string;
  createdAt: Date;
  lastLogin: Date;
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
          createdAt: data.createdAt.toDate(),
          lastLogin: data.lastLogin.toDate()
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

  const signInWithUsername = async (username: string): Promise<void> => {
    if (!username || username.trim().length === 0) {
      throw new Error('Username cannot be empty');
    }

    const trimmedUsername = username.trim().toLowerCase();
    
    // Basic username validation
    if (trimmedUsername.length < 2) {
      throw new Error('Username must be at least 2 characters long');
    }
    
    if (trimmedUsername.length > 20) {
      throw new Error('Username must be 20 characters or less');
    }
    
    if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }

    try {
      setError(null);
      setLoading(true);

      const userDocRef = doc(db, 'users', trimmedUsername);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        // User exists, update last login
        const existingData = userDoc.data();
        const updatedProfile = {
          username: trimmedUsername,
          createdAt: existingData.createdAt,
          lastLogin: serverTimestamp()
        };
        
        await setDoc(userDocRef, updatedProfile, { merge: true });
        
        setUserProfile({
          username: trimmedUsername,
          createdAt: existingData.createdAt.toDate(),
          lastLogin: new Date()
        });
      } else {
        // Create new user
        const newUserProfile = {
          username: trimmedUsername,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        };
        
        await setDoc(userDocRef, newUserProfile);
        
        setUserProfile({
          username: trimmedUsername,
          createdAt: new Date(),
          lastLogin: new Date()
        });
      }
      
      // Store username in localStorage for persistence
      localStorage.setItem('jinjjamood_username', trimmedUsername);
      
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in');
      throw err;
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
    signInWithUsername,
    logout,
    isAuthenticated: !!userProfile
  };
};