import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp, deleteDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import toast from 'react-hot-toast';

interface UserProfile {
  uid: string;
  username: string;
  email: string;
  createdAt: Date;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authLoading: boolean;
  error: string | null;
  signup: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
        // User is signed in, load their profile
        await loadUserProfile(user.uid);
      } else {
        // User is signed out
        setUserProfile(null);
        localStorage.removeItem('jinjjamood_currentUser');
      }
      
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (uid: string) => {
    try {
      console.log('🔵 DEBUG: Loading user profile for uid:', uid);
      
      // Get user document using UID
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const profile = {
          uid: uid,
          username: data.username,
          email: data.email,
          createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : new Date()
        };
        setUserProfile(profile);
        
        // Store user profile in localStorage
        localStorage.setItem('jinjjamood_currentUser', JSON.stringify(profile));
        
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

  const signup = async (email: string, password: string, username: string): Promise<{ success: boolean; error?: string }> => {
    // Validation
    if (!email || email.trim().length === 0) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!password || password.trim().length === 0) {
      return { success: false, error: 'Please enter a password.' };
    }

    if (!username || username.trim().length === 0) {
      return { success: false, error: 'Please enter a username.' };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedUsername = username.trim().toLowerCase();
    
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

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    // Basic password validation
    if (trimmedPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // Check network connectivity
    if (!navigator.onLine) {
      return { success: false, error: 'You are offline. Please connect to the internet to continue.' };
    }

    try {
      setError(null);
      setLoading(true);
      
      console.log('🔵 DEBUG: Starting signup process for username:', trimmedUsername);

      // Step 1: Check if username is already taken
      console.log('🔵 DEBUG: Checking if username is available...');
      const usernameQuery = query(
        collection(db, 'usernames'),
        where('username', '==', trimmedUsername)
      );
      const usernameSnapshot = await getDocs(usernameQuery);
      
      if (!usernameSnapshot.empty) {
        console.log('❌ DEBUG: Username already taken:', trimmedUsername);
        return { success: false, error: 'Username already taken. Try logging in instead.' };
      }

      // Step 2: Create Firebase account
      console.log('🔵 DEBUG: Creating Firebase account...');
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      const user = userCredential.user;
      console.log('✅ DEBUG: Firebase account created, uid:', user.uid);

      // Step 3: Save user profile
      console.log('🔵 DEBUG: Saving user profile...');
      await setDoc(doc(db, 'users', user.uid), {
        username: trimmedUsername,
        email: trimmedEmail,
        createdAt: serverTimestamp()
      });

      // Step 4: Reserve the username
      console.log('🔵 DEBUG: Reserving username...');
      await setDoc(doc(db, 'usernames', trimmedUsername), {
        uid: user.uid
      });

      console.log('✅ DEBUG: Signup completed successfully');
      return { success: true };
      
    } catch (err: any) {
      console.error('❌ DEBUG: Signup error:', err);
      
      // Provide specific error messages based on Firebase error codes
      let errorMessage = 'Failed to create account';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already registered. Try logging in instead.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check and try again.';
      } else if (err.code === 'permission-denied') {
        errorMessage = 'Firestore permissions error. Please check your security rules.';
      } else if (err.code === 'unavailable' || err.message?.includes('offline')) {
        errorMessage = 'Firebase connection failed. Please check your internet connection.';
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Validation
    if (!email || email.trim().length === 0) {
      return { success: false, error: 'Please enter your email address.' };
    }

    if (!password || password.trim().length === 0) {
      return { success: false, error: 'Please enter your password.' };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Check network connectivity
    if (!navigator.onLine) {
      return { success: false, error: 'You are offline. Please connect to the internet to continue.' };
    }

    try {
      setError(null);
      setLoading(true);
      
      console.log('🔵 DEBUG: Starting login process for email:', trimmedEmail);

      // Step 1: Sign in with email and password
      console.log('🔵 DEBUG: Signing in with email and password...');
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      const user = userCredential.user;
      console.log('✅ DEBUG: Firebase login successful, uid:', user.uid);

      // Step 2: Fetch username (optional, but good for UX)
      console.log('🔵 DEBUG: Fetching user profile...');
      const userProfile = await getDoc(doc(db, 'users', user.uid));
      if (!userProfile.exists()) {
        console.log('⚠️ DEBUG: User profile not found');
        return { success: false, error: 'Profile not found. Something went wrong.' };
      }

      const username = userProfile.data().username;
      console.log('✅ DEBUG: Login completed successfully for username:', username);
      
      return { success: true };
      
    } catch (err: any) {
      console.error('❌ DEBUG: Login error:', err);
      
      // Provide specific error messages based on Firebase error codes
      let errorMessage = 'Failed to log in';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'Account not found. Sign up?';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Try again.';
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Account not found. Sign up?';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check and try again.';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (err.code === 'permission-denied') {
        errorMessage = 'Firestore permissions error. Please check your security rules.';
      } else if (err.code === 'unavailable' || err.message?.includes('offline')) {
        errorMessage = 'Firebase connection failed. Please check your internet connection.';
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
    if (!userProfile?.uid) {
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
      // Check if new username is already taken
      const usernameQuery = query(
        collection(db, 'usernames'),
        where('username', '==', trimmedUsername)
      );
      const usernameSnapshot = await getDocs(usernameQuery);
      
      if (!usernameSnapshot.empty) {
        return { success: false, error: 'Username already taken. Please choose another one.' };
      }

      // Update user profile
      const userDocRef = doc(db, 'users', userProfile.uid);
      await setDoc(userDocRef, {
        username: trimmedUsername,
        email: userProfile.email,
        createdAt: userProfile.createdAt
      });

      // Delete old username reservation
      const oldUsernameDocRef = doc(db, 'usernames', userProfile.username);
      await deleteDoc(oldUsernameDocRef);

      // Create new username reservation
      await setDoc(doc(db, 'usernames', trimmedUsername), {
        uid: userProfile.uid
      });

      // Update local state
      const updatedProfile = {
        ...userProfile,
        username: trimmedUsername
      };
      setUserProfile(updatedProfile);
      
      // Update localStorage
      localStorage.setItem('jinjjamood_currentUser', JSON.stringify(updatedProfile));

      return { success: true };
    } catch (error: any) {
      console.error('Error updating username:', error);
      return { success: false, error: error.message || 'Failed to update username' };
    }
  };

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (!userProfile?.uid || !currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // Delete all mood logs for this user
      const moodLogsQuery = query(
        collection(db, 'moodLogs'),
        where('uid', '==', userProfile.uid)
      );
      const moodLogsSnapshot = await getDocs(moodLogsQuery);
      
      const deletePromises = moodLogsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete username reservation
      const usernameDocRef = doc(db, 'usernames', userProfile.username);
      await deleteDoc(usernameDocRef);

      // Delete user profile from Firestore
      const userDocRef = doc(db, 'users', userProfile.uid);
      await deleteDoc(userDocRef);
      
      // Clear local state
      setUserProfile(null);
      localStorage.removeItem('jinjjamood_currentUser');
      
      // Delete Firebase Auth account
      await currentUser.delete();
      
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
    signup,
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