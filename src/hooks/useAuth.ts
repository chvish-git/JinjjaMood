import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
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

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await signInWithPopup(auth, googleProvider);
      
      // Double-check Gmail domain
      if (!result.user.email?.endsWith('@gmail.com')) {
        await signOut(auth);
        throw new Error('Only Gmail accounts are allowed');
      }
      
    } catch (err: any) {
      console.error('Sign in error:', err);
      
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign in was cancelled');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups and try again.');
      } else {
        setError(err.message || 'Failed to sign in with Google');
      }
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