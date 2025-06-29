import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp, query, collection, where, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import toast from 'react-hot-toast';

interface UserProfile {
  uid: string;
  username: string;
  name: string;
  createdAt: Date;
}

export const useAuth = () => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔵 DEBUG: Setting up Firebase Auth listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔵 DEBUG: Auth state changed, user:', user?.uid || 'null');
      setFirebaseUser(user);
      
      if (user) {
        // User is signed in, load their profile
        await loadUserProfile(user.uid);
      } else {
        // User is signed out, check for auto-login
        const storedUser = localStorage.getItem('jinjjamood_currentUser');
        if (storedUser) {
          console.log('🔵 DEBUG: Found stored user, attempting auto-login');
          try {
            const userData = JSON.parse(storedUser);
            // Attempt to sign in anonymously and restore session
            const userCredential = await signInAnonymously(auth);
            if (userCredential.user) {
              // Try to load the stored profile
              await loadUserProfile(userCredential.user.uid);
            }
          } catch (error) {
            console.error('❌ DEBUG: Auto-login failed:', error);
            localStorage.removeItem('jinjjamood_currentUser');
            setUserProfile(null);
            setLoading(false);
          }
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (uid: string) => {
    try {
      console.log('🔵 DEBUG: Loading user profile for uid:', uid);
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const profile = {
          uid: uid,
          username: data.username,
          name: data.name,
          createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : new Date()
        };
        setUserProfile(profile);
        
        // Store user profile in localStorage for auto-login
        localStorage.setItem('jinjjamood_currentUser', JSON.stringify(profile));
        
        console.log('✅ DEBUG: User profile loaded successfully');
      } else {
        console.log('⚠️ DEBUG: User document does not exist in Firestore');
        setUserProfile(null);
        localStorage.removeItem('jinjjamood_currentUser');
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
      allow read: if true;
      allow write: if request.auth != null && 
                   request.auth.uid == userId &&
                   request.resource.data.username is string &&
                   request.resource.data.username.size() > 1;
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
    // Validation
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
      
      console.log('🔵 DEBUG: Starting authentication process for username:', trimmedUsername);

      // Step 1: Check if username is already taken BEFORE creating Firebase user
      console.log('🔵 DEBUG: Checking username uniqueness...');
      const usernameQuery = query(
        collection(db, 'users'),
        where('username', '==', trimmedUsername)
      );
      const usernameSnapshot = await getDocs(usernameQuery);
      
      if (!usernameSnapshot.empty) {
        // Username is already taken
        console.log('❌ DEBUG: Username already taken:', trimmedUsername);
        return { success: false, error: 'Username already taken. Please choose another one.' };
      }
      
      console.log('✅ DEBUG: Username is available:', trimmedUsername);

      // Step 2: Sign in anonymously with Firebase Auth
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      console.log('✅ DEBUG: Firebase Auth successful, uid:', user.uid);

      // Step 3: Create new user profile with unique username
      console.log('🔵 DEBUG: Creating new user profile');
      const newUserProfile = {
        username: trimmedUsername,
        name: trimmedUsername, // Using username as display name
        createdAt: serverTimestamp()
      };
      
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, newUserProfile);
      console.log('✅ DEBUG: New user profile created successfully');
      
      // Set user profile
      const profile = {
        uid: user.uid,
        username: trimmedUsername,
        name: trimmedUsername,
        createdAt: new Date()
      };
      setUserProfile(profile);
      
      // Store user profile in localStorage for auto-login
      localStorage.setItem('jinjjamood_currentUser', JSON.stringify(profile));
      
      return { success: true, isNewUser: true };
      
    } catch (err: any) {
      console.error('❌ DEBUG: Authentication error:', err);
      console.error('❌ DEBUG: Error code:', err.code);
      console.error('❌ DEBUG: Error message:', err.message);
      
      // Provide specific error messages based on Firebase error codes
      let errorMessage = 'Failed to process username';
      
      if (err.code === 'auth/admin-restricted-operation') {
        errorMessage = `
🔒 FIREBASE AUTHENTICATION SETUP REQUIRED

Anonymous authentication is not enabled in your Firebase project.

TO FIX THIS:
1. Go to Firebase Console (https://console.firebase.google.com)
2. Select your project
3. Navigate to Authentication → Sign-in method
4. Find "Anonymous" in the list of providers
5. Click on "Anonymous" and toggle "Enable"
6. Click "Save"

This will allow users to sign in anonymously and create accounts.

ALTERNATIVE: If you prefer email/password authentication instead of anonymous:
- Enable "Email/Password" provider in Firebase Console
- Update the authentication code to use createUserWithEmailAndPassword()

For now, please enable Anonymous authentication to use the current setup.
        `;
      } else if (err.code === 'permission-denied') {
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
        collection(db, 'users'),
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
        name: trimmedUsername,
        createdAt: userProfile.createdAt
      });

      // Update local state
      const updatedProfile = {
        ...userProfile,
        username: trimmedUsername,
        name: trimmedUsername
      };
      setUserProfile(updatedProfile);
      localStorage.setItem('jinjjamood_currentUser', JSON.stringify(updatedProfile));

      return { success: true };
    } catch (error: any) {
      console.error('Error updating username:', error);
      return { success: false, error: error.message || 'Failed to update username' };
    }
  };

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (!userProfile?.uid || !firebaseUser) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // Delete user profile from Firestore
      const userDocRef = doc(db, 'users', userProfile.uid);
      await setDoc(userDocRef, {}, { merge: false }); // This effectively deletes the document
      
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
    console.log('🟡 DEBUG: useAuth logout() function started');
    console.log('🟡 DEBUG: Current userProfile before clearing:', userProfile);
    console.log('🟡 DEBUG: Current firebaseUser before clearing:', firebaseUser?.uid);
    
    try {
      // Clear localStorage first
      localStorage.removeItem('jinjjamood_currentUser');
      console.log('🟡 DEBUG: localStorage cleared');
      
      // Sign out from Firebase Auth
      await signOut(auth);
      console.log('✅ DEBUG: Firebase signOut successful');
      
      // Clear user profile state (Firebase auth listener will handle firebaseUser)
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
      
      console.log('🟡 DEBUG: useAuth logout() function completed');
    } catch (error) {
      console.error('❌ DEBUG: Error during logout:', error);
      setError('Failed to sign out. Please try again.');
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const isAuthenticated = !!firebaseUser && !!userProfile;
  console.log('🔵 DEBUG: useAuth hook - isAuthenticated:', isAuthenticated, 'firebaseUser:', !!firebaseUser, 'userProfile:', !!userProfile);

  return {
    userProfile,
    loading,
    error,
    checkUsernameAndCreateOrLogin,
    updateUsername,
    deleteAccount,
    logout,
    isAuthenticated
  };
};