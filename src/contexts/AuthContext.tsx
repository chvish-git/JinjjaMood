import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp, deleteDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import toast from 'react-hot-toast';

interface UserProfile {
  uid: string;
  username: string;
  password: string; // For demo purposes - plain text (NOT for production)
  createdAt: Date;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; isNewUser?: boolean }>;
  logout: () => Promise<void>;
  updateUsername: (newUsername: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔵 DEBUG: Setting up Firebase Auth listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔵 DEBUG: Auth state changed, user:', user?.uid || 'null');
      setCurrentUser(user);
      
      if (user) {
        // User is signed in, try to load their profile from localStorage first
        const storedProfile = localStorage.getItem('jinjjamood_currentUser');
        if (storedProfile) {
          try {
            const profileData = JSON.parse(storedProfile);
            console.log('🔵 DEBUG: Found stored profile, loading from Firestore:', profileData.username);
            await loadUserProfileByUsername(profileData.username);
          } catch (error) {
            console.error('❌ DEBUG: Error parsing stored profile:', error);
            localStorage.removeItem('jinjjamood_currentUser');
            setUserProfile(null);
          }
        } else {
          console.log('🔵 DEBUG: No stored profile found');
          setUserProfile(null);
        }
      } else {
        // User is signed out
        setUserProfile(null);
        localStorage.removeItem('jinjjamood_currentUser');
      }
      
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfileByUsername = async (username: string) => {
    try {
      console.log('🔵 DEBUG: Loading user profile for username:', username);
      
      // Get user document using username as document ID
      const userDocRef = doc(db, 'users', username);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const profile = {
          uid: data.uid,
          username: data.username || username, // Fallback to document ID
          password: data.password,
          createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : new Date()
        };
        setUserProfile(profile);
        
        // Store user profile in localStorage (excluding password for security)
        const profileForStorage = { ...profile };
        delete profileForStorage.password;
        localStorage.setItem('jinjjamood_currentUser', JSON.stringify(profileForStorage));
        
        console.log('✅ DEBUG: User profile loaded successfully');
      } else {
        console.log('⚠️ DEBUG: User document does not exist in Firestore');
        setUserProfile(null);
        localStorage.removeItem('jinjjamood_currentUser');
      }
    } catch (err: any) {
      console.error('❌ DEBUG: Error loading user profile:', err);
      setError(`Failed to load user profile: ${err.message || 'Unknown error'}`);
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string; isNewUser?: boolean }> => {
    // Validation
    if (!username || username.trim().length === 0) {
      return { success: false, error: 'Please enter a valid username.' };
    }

    if (!password || password.trim().length === 0) {
      return { success: false, error: 'Please enter a password.' };
    }

    const trimmedUsername = username.trim().toLowerCase();
    const trimmedPassword = password.trim();
    
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
      
      console.log('🔵 DEBUG: Starting authentication process for username:', trimmedUsername);

      // Step 1: Sign in anonymously to get Firebase Auth user
      console.log('🔵 DEBUG: Signing in anonymously...');
      const userCredential = await signInAnonymously(auth);
      const firebaseUser = userCredential.user;
      console.log('✅ DEBUG: Firebase Auth successful, uid:', firebaseUser.uid);

      // Ensure Firebase Auth token is established before Firestore operations
      console.log('🔵 DEBUG: Ensuring Firebase Auth token is established...');
      await firebaseUser.getIdToken(true);
      console.log('✅ DEBUG: Firebase Auth token confirmed');

      // Step 2: Check if username exists in Firestore using document ID
      console.log('🔵 DEBUG: Checking if username exists...');
      const userDocRef = doc(db, 'users', trimmedUsername);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        // Username exists - this is a login attempt
        console.log('🔵 DEBUG: Username found, attempting login...');
        const userData = userDoc.data();
        
        // Check password
        if (userData.password !== trimmedPassword) {
          console.log('❌ DEBUG: Incorrect password for username:', trimmedUsername);
          return { success: false, error: 'Incorrect password. Please try again.' };
        }
        
        console.log('✅ DEBUG: Password correct, updating user profile with current Firebase UID...');
        
        // Update the document with current Firebase UID (in case it changed)
        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          username: trimmedUsername,
          password: userData.password,
          createdAt: userData.createdAt
        });
        
        console.log('✅ DEBUG: User profile updated with current Firebase UID');
        
        return { success: true, isNewUser: false };
        
      } else {
        // Username doesn't exist - this is a signup attempt
        console.log('🔵 DEBUG: Username not found, creating new account...');

        // Create new user profile with username as document ID
        console.log('🔵 DEBUG: Creating new user profile with username:', trimmedUsername);
        const newUserProfile = {
          uid: firebaseUser.uid,
          username: trimmedUsername,
          password: trimmedPassword, // Storing plain text for demo (NOT for production)
          createdAt: serverTimestamp()
        };
        
        await setDoc(userDocRef, newUserProfile);
        console.log('✅ DEBUG: New user profile created successfully');
        
        return { success: true, isNewUser: true };
      }
      
    } catch (err: any) {
      console.error('❌ DEBUG: Authentication error:', err);
      
      // Provide specific error messages based on Firebase error codes
      let errorMessage = 'Failed to process login';
      
      if (err.code === 'auth/admin-restricted-operation') {
        errorMessage = 'Anonymous authentication is not enabled in your Firebase project. Please enable it in the Firebase Console.';
      } else if (err.code === 'permission-denied') {
        errorMessage = 'Firestore permissions error. Please check your security rules.';
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

  const updateUsername = async (newUsername: string): Promise<{ success: boolean; error?: string }> => {
    if (!userProfile?.username) {
      return { success: false, error: 'User not authenticated' };
    }

    const trimmedUsername = newUsername.trim().toLowerCase();
    
    // Basic validation
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
      // Ensure Firebase Auth token is established
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true);
      }

      // Check if new username is already taken
      const newUserDocRef = doc(db, 'users', trimmedUsername);
      const newUserDoc = await getDoc(newUserDocRef);
      
      if (newUserDoc.exists()) {
        return { success: false, error: 'Username already taken. Please choose another one.' };
      }

      // Create new document with new username
      await setDoc(newUserDocRef, {
        uid: userProfile.uid,
        username: trimmedUsername,
        password: userProfile.password,
        createdAt: userProfile.createdAt
      });

      // Delete old document
      const oldUserDocRef = doc(db, 'users', userProfile.username);
      await deleteDoc(oldUserDocRef);

      // Update local state
      const updatedProfile = {
        ...userProfile,
        username: trimmedUsername
      };
      setUserProfile(updatedProfile);
      
      // Update localStorage (excluding password)
      const profileForStorage = { ...updatedProfile };
      delete profileForStorage.password;
      localStorage.setItem('jinjjamood_currentUser', JSON.stringify(profileForStorage));

      return { success: true };
    } catch (error: any) {
      console.error('Error updating username:', error);
      return { success: false, error: error.message || 'Failed to update username' };
    }
  };

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (!userProfile?.username || !currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // Ensure Firebase Auth token is established
      await currentUser.getIdToken(true);

      // Delete all mood logs for this user
      const moodLogsQuery = query(
        collection(db, 'moodLogs'),
        where('uid', '==', userProfile.uid)
      );
      const moodLogsSnapshot = await getDocs(moodLogsQuery);
      
      const deletePromises = moodLogsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete user profile from Firestore using username as document ID
      const userDocRef = doc(db, 'users', userProfile.username);
      await deleteDoc(userDocRef);
      
      // Clear local state
      setUserProfile(null);
      localStorage.removeItem('jinjjamood_currentUser');
      
      // Sign out from Firebase Auth
      await signOut(auth);
      
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting account:', error);
      return { success: false, error: error.message || 'Failed to delete account' };
    }
  };

  const logout = async () => {
    console.log('🟡 DEBUG: AuthContext logout() function started');
    
    try {
      // Clear localStorage first
      localStorage.removeItem('jinjjamood_currentUser');
      console.log('🟡 DEBUG: localStorage cleared');
      
      // Sign out from Firebase Auth
      await signOut(auth);
      console.log('✅ DEBUG: Firebase signOut successful');
      
      // Clear user profile state (Firebase auth listener will handle currentUser)
      setUserProfile(null);
      console.log('🟡 DEBUG: setUserProfile(null) called');
      
      // Clear any errors
      setError(null);
      console.log('🟡 DEBUG: setError(null) called');
      
      // Show friendly logout toast
      toast.success('See you again soon! 👋', {
        duration: 3000,
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });
      
      console.log('🟡 DEBUG: AuthContext logout() function completed');
    } catch (error) {
      console.error('❌ DEBUG: Error during logout:', error);
      setError('Failed to sign out. Please try again.');
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const isAuthenticated = !!currentUser && !!userProfile;

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    authLoading,
    error,
    login,
    logout,
    updateUsername,
    deleteAccount,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};