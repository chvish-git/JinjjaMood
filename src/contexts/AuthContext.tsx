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
    // Validation with witty messages
    if (!email || email.trim().length === 0) {
      return { success: false, error: 'Don\'t ghost the form. Fill it in, bestie.' };
    }

    if (!password || password.trim().length === 0) {
      return { success: false, error: 'Don\'t ghost the form. Fill it in, bestie.' };
    }

    if (!username || username.trim().length === 0) {
      return { success: false, error: 'Don\'t ghost the form. Fill it in, bestie.' };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedUsername = username.trim().toLowerCase();
    
    // Basic username validation
    if (trimmedUsername.length < 2) {
      return { success: false, error: 'Username needs at least 2 characters. Give it some substance!' };
    }
    
    if (trimmedUsername.length > 20) {
      return { success: false, error: 'Username\'s too long. Keep it snappy!' };
    }
    
    if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
      return { success: false, error: 'Username can only have letters, numbers, and underscores. Keep it clean!' };
    }

    // Check for reserved usernames
    const reservedNames = ['admin', 'null', 'undefined', 'root', 'system', 'api', 'www', 'mail', 'ftp'];
    if (reservedNames.includes(trimmedUsername)) {
      return { success: false, error: 'That username\'s off limits. Pick something more creative!' };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, error: 'That email looks sus. Double-check it?' };
    }

    // Basic password validation
    if (trimmedPassword.length < 6) {
      return { success: false, error: 'Password needs at least 6 characters. Make it stronger!' };
    }

    // Check network connectivity
    if (!navigator.onLine) {
      return { success: false, error: 'You\'re offline. Connect to the internet to join the vibe!' };
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
        return { success: false, error: 'That name\'s already vibin\' with someone else. Try another.' };
      }

      // Step 2: Create Firebase account
      console.log('🔵 DEBUG: Creating Firebase account...');
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      const user = userCredential.user;
      console.log('✅ DEBUG: Firebase account created, uid:', user.uid);

      // Step 2.5: Force refresh the auth token to ensure Firestore has the latest auth state
      console.log('🔵 DEBUG: Refreshing auth token...');
      await user.getIdToken(true);
      console.log('✅ DEBUG: Auth token refreshed');

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
      
      // Witty error messages based on Firebase error codes
      let errorMessage = 'Something went sideways. Try again?';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email already joined the vibe. Try logging in.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'That password\'s weaker than decaf coffee. Beef it up!';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'That email looks fake. Give us a real one!';
      } else if (err.code === 'permission-denied') {
        errorMessage = 'Permission denied. The vibes are off today.';
      } else if (err.code === 'unavailable' || err.message?.includes('offline')) {
        errorMessage = 'Mood radar\'s down. Try again in a sec?';
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
    // Validation with witty messages
    if (!email || email.trim().length === 0) {
      return { success: false, error: 'Don\'t ghost the form. Fill it in, bestie.' };
    }

    if (!password || password.trim().length === 0) {
      return { success: false, error: 'Don\'t ghost the form. Fill it in, bestie.' };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Check network connectivity
    if (!navigator.onLine) {
      return { success: false, error: 'Firestore offline. The vibes are off today.' };
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
        return { success: false, error: 'Profile went missing. Something\'s broken.' };
      }

      const username = userProfile.data().username;
      console.log('✅ DEBUG: Login completed successfully for username:', username);
      
      return { success: true };
      
    } catch (err: any) {
      console.error('❌ DEBUG: Login error:', err);
      
      // Witty error messages based on Firebase error codes
      let errorMessage = 'Login failed. Try again?';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account with that email. Feeling new? Try signing up.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'That ain\'t the one. Try again?';
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = 'No account with that email. Feeling new? Try signing up.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'That email looks sus. Double-check it?';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'Account\'s been disabled. Contact support if you think this is wrong.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many tries. Chill for a bit and come back.';
      } else if (err.code === 'permission-denied') {
        errorMessage = 'Permission denied. The vibes are off today.';
      } else if (err.code === 'unavailable' || err.message?.includes('offline')) {
        errorMessage = 'Firestore offline. The vibes are off today.';
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
      return { success: false, error: 'You\'re not logged in. That\'s a problem.' };
    }

    const trimmedUsername = newUsername.trim().toLowerCase();
    
    // Basic validation with witty messages
    if (trimmedUsername.length < 2) {
      return { success: false, error: 'Username needs at least 2 characters. Give it some substance!' };
    }
    
    if (trimmedUsername.length > 20) {
      return { success: false, error: 'Username\'s too long. Keep it snappy!' };
    }
    
    if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
      return { success: false, error: 'Username can only have letters, numbers, and underscores. Keep it clean!' };
    }

    // Check for reserved usernames
    const reservedNames = ['admin', 'null', 'undefined', 'root', 'system', 'api', 'www', 'mail', 'ftp'];
    if (reservedNames.includes(trimmedUsername)) {
      return { success: false, error: 'That username\'s off limits. Pick something more creative!' };
    }

    try {
      // Check if new username is already taken
      const usernameQuery = query(
        collection(db, 'usernames'),
        where('username', '==', trimmedUsername)
      );
      const usernameSnapshot = await getDocs(usernameQuery);
      
      if (!usernameSnapshot.empty) {
        return { success: false, error: 'Someone\'s already vibing with that name. Pick a new one?' };
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
      return { success: false, error: 'Username update failed. The servers are being moody.' };
    }
  };

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (!userProfile?.uid || !currentUser) {
      return { success: false, error: 'You\'re not logged in. Can\'t delete what doesn\'t exist.' };
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
      return { success: false, error: 'Account deletion failed. The servers are being stubborn.' };
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
      toast.success('See you soon, vibe rider.', {
        duration: 3000,
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: '600',
        },
      });
      
      console.log('🟡 DEBUG: AuthContext logout() function completed');
    } catch (error) {
      console.error('❌ DEBUG: Error during logout:', error);
      setError('Logout failed. The servers are being clingy.');
      toast.error('Logout failed. The servers are being clingy.');
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