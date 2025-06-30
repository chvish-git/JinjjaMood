import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { checkEmailExists, checkUsernameExists, checkUsernameAvailableForUpdate } from '../utils/userSearch';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  created_at: Date;
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
    console.log('🔵 DEBUG: Setting up Supabase Auth listener');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔵 DEBUG: Initial session:', session?.user?.id || 'null');
      setCurrentUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setAuthLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔵 DEBUG: Auth state changed, event:', event, 'user:', session?.user?.id || 'null');
      setCurrentUser(session?.user ?? null);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        localStorage.removeItem('jinjjamood_currentUser');
      }
      
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('🔵 DEBUG: Loading user profile for userId:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .limit(1);
      
      if (error) {
        console.error('❌ DEBUG: Error loading user profile:', error);
        setUserProfile(null);
        return;
      }

      if (data && data.length > 0) {
        const profile = {
          id: data[0].id,
          username: data[0].username,
          email: data[0].email,
          created_at: new Date(data[0].created_at)
        };
        setUserProfile(profile);
        
        // Store user profile in localStorage
        localStorage.setItem('jinjjamood_currentUser', JSON.stringify(profile));
        
        console.log('✅ DEBUG: User profile loaded successfully');
      } else {
        console.log('⚠️ DEBUG: User profile not found');
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

      // Step 1: Check if email already exists
      console.log('🔍 DEBUG: Checking if email exists...');
      const emailCheck = await checkEmailExists(trimmedEmail);
      if (emailCheck.exists) {
        console.log('❌ DEBUG: Email already exists:', trimmedEmail);
        return { success: false, error: emailCheck.message || 'You\'ve been here before. Wanna log in instead?' };
      }

      // Step 2: Check if username is already taken
      console.log('🔍 DEBUG: Checking if username is available...');
      const usernameCheck = await checkUsernameExists(trimmedUsername);
      if (usernameCheck.exists) {
        console.log('❌ DEBUG: Username already taken:', trimmedUsername);
        return { success: false, error: usernameCheck.message || 'That name\'s already vibin\' with someone else. Try another.' };
      }

      // Step 3: Create Supabase account
      console.log('🔵 DEBUG: Creating Supabase account...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (authError) {
        // Only log error if it's not the expected "already registered" scenario
        if (!authError.message.includes('already registered')) {
          console.error('❌ DEBUG: Supabase auth error:', authError);
        }
        
        if (authError.message.includes('already registered')) {
          return { success: false, error: 'You\'ve been here before. Wanna log in instead?' };
        }
        
        return { success: false, error: authError.message || 'Signup failed. The servers are being moody.' };
      }

      if (!authData.user) {
        return { success: false, error: 'Signup failed. The servers are being moody.' };
      }

      console.log('✅ DEBUG: Supabase account created, userId:', authData.user.id);

      // Step 4: Save user profile
      console.log('🔵 DEBUG: Saving user profile...');
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          username: trimmedUsername,
          email: trimmedEmail,
        });

      if (profileError) {
        console.error('❌ DEBUG: Error saving user profile:', profileError);
        return { success: false, error: 'Profile creation failed. The servers are being stubborn.' };
      }

      console.log('✅ DEBUG: Signup completed successfully');
      return { success: true };
      
    } catch (err: any) {
      console.error('❌ DEBUG: Signup error:', err);
      
      let errorMessage = 'Something went sideways. Try again?';
      
      if (err.message?.includes('offline')) {
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
      return { success: false, error: 'Mood radar\'s down. Try again in a sec?' };
    }

    try {
      setError(null);
      setLoading(true);
      
      console.log('🔵 DEBUG: Starting login process for email:', trimmedEmail);

      // Directly attempt Supabase authentication without pre-checking user existence
      console.log('🔵 DEBUG: Attempting Supabase authentication...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error) {
        console.error('❌ DEBUG: Login error:', error);
        
        let errorMessage = 'Login failed. The servers are being moody.';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'That ain\'t the one. Try again?';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Check your email and confirm your account first, bestie.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many tries. Chill for a bit and come back.';
        }
        
        return { success: false, error: errorMessage };
      }

      if (!data.user) {
        return { success: false, error: 'Login failed. The servers are being moody.' };
      }

      console.log('✅ DEBUG: Login completed successfully for userId:', data.user.id);
      return { success: true };
      
    } catch (err: any) {
      console.error('❌ DEBUG: Login error:', err);
      
      let errorMessage = 'Login failed. The servers are being moody.';
      
      if (err.message?.includes('offline')) {
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

  const updateUsername = async (newUsername: string): Promise<{ success: boolean; error?: string }> => {
    if (!userProfile?.id) {
      return { success: false, error: 'You\'re not logged in. That\'s a problem.' };
    }

    const trimmedUsername = newUsername.trim().toLowerCase();
    
    try {
      // Check if new username is available for this user
      console.log('🔍 DEBUG: Checking username availability for update...');
      const availabilityCheck = await checkUsernameAvailableForUpdate(trimmedUsername, userProfile.id);
      
      if (availabilityCheck.exists) {
        console.log('❌ DEBUG: Username not available for update:', trimmedUsername);
        return { success: false, error: availabilityCheck.message || 'Someone\'s already vibing with that name. Pick a new one?' };
      }

      // Update user profile
      console.log('🔵 DEBUG: Updating username in database...');
      const { error: updateError } = await supabase
        .from('users')
        .update({ username: trimmedUsername })
        .eq('id', userProfile.id);

      if (updateError) {
        console.error('Error updating username:', updateError);
        return { success: false, error: 'Username update failed. The servers are being moody.' };
      }

      // Update local state
      const updatedProfile = {
        ...userProfile,
        username: trimmedUsername
      };
      setUserProfile(updatedProfile);
      
      // Update localStorage
      localStorage.setItem('jinjjamood_currentUser', JSON.stringify(updatedProfile));

      console.log('✅ DEBUG: Username updated successfully');
      return { success: true };
    } catch (error: any) {
      console.error('Error updating username:', error);
      return { success: false, error: 'Username update failed. The servers are being moody.' };
    }
  };

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (!userProfile?.id || !currentUser) {
      return { success: false, error: 'You\'re not logged in. Can\'t delete what doesn\'t exist.' };
    }

    try {
      console.log('🔵 DEBUG: Calling delete account edge function...');
      
      // Get the current session to get the access token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        return { success: false, error: 'No valid session found' };
      }

      // Call the edge function to delete the account
      const { data, error } = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error calling delete account function:', error);
        return { success: false, error: 'Account deletion failed. The servers are being stubborn.' };
      }

      if (!data?.success) {
        console.error('Delete account function returned error:', data?.error);
        return { success: false, error: data?.error || 'Account deletion failed. The servers are being stubborn.' };
      }
      
      // Clear local state
      setUserProfile(null);
      localStorage.removeItem('jinjjamood_currentUser');
      
      // The auth state will be updated automatically by the auth listener
      console.log('✅ DEBUG: Account deleted successfully');
      
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
      
      // Sign out from Supabase Auth
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ DEBUG: Error during logout:', error);
        setError('Logout failed. The servers are being clingy.');
        toast.error('Logout failed. The servers are being clingy.');
        return;
      }
      
      console.log('✅ DEBUG: Supabase signOut successful');
      
      // Clear user profile state (auth listener will handle currentUser)
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