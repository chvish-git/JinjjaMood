import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  lastLogin: Date;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Check if user email is Gmail
        if (!user.email?.endsWith('@gmail.com')) {
          setError('Only Gmail accounts are allowed');
          await signOut(auth);
          setLoading(false);
          return;
        }

        try {
          // Check if user profile exists in Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            // Create new user profile
            const newUserProfile: UserProfile = {
              id: user.uid,
              email: user.email,
              name: user.displayName || 'User',
              createdAt: new Date(),
              lastLogin: new Date()
            };
            
            await setDoc(userDocRef, newUserProfile);
            setUserProfile(newUserProfile);
          } else {
            // Update last login
            const existingProfile = userDoc.data() as UserProfile;
            const updatedProfile = {
              ...existingProfile,
              lastLogin: new Date()
            };
            
            await setDoc(userDocRef, updatedProfile, { merge: true });
            setUserProfile(updatedProfile);
          }
          
          setError(null);
        } catch (err) {
          console.error('Error managing user profile:', err);
          setError('Failed to load user profile');
        }
      } else {
        setUserProfile(null);
        setError(null);
      }
      
      setLoading(false);
    });

    // Check for redirect result on page load
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          // User signed in via redirect
          console.log('User signed in via redirect');
        }
      } catch (err: any) {
        console.error('Redirect result error:', err);
        if (err.message?.includes('Gmail')) {
          setError('Only Gmail accounts are allowed');
        }
      }
    };

    checkRedirectResult();

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // First try popup
      try {
        const result = await signInWithPopup(auth, googleProvider);
        
        // Double-check Gmail domain
        if (!result.user.email?.endsWith('@gmail.com')) {
          await signOut(auth);
          throw new Error('Only Gmail accounts are allowed');
        }
        
        return result;
      } catch (popupError: any) {
        console.log('Popup error:', popupError.code);
        
        // If popup was blocked or closed, try redirect as fallback
        if (popupError.code === 'auth/popup-blocked') {
          console.log('Popup blocked, trying redirect...');
          await signInWithRedirect(auth, googleProvider);
          return; // Redirect will handle the rest
        } else if (popupError.code === 'auth/popup-closed-by-user') {
          throw new Error('Sign in was cancelled');
        } else {
          throw popupError;
        }
      }
      
    } catch (err: any) {
      console.error('Sign in error:', err);
      
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign in was cancelled');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups and try again.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else if (err.message?.includes('Gmail')) {
        setError('Only Gmail accounts are allowed');
      } else {
        setError(err.message || 'Failed to sign in with Google');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Failed to sign out');
    }
  };

  return {
    user,
    userProfile,
    loading,
    error,
    signInWithGoogle,
    logout,
    isAuthenticated: !!user
  };
};