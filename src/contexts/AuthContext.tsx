import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
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
  signup: (email: string, password: string, username: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signupWithOtp: (email: string, username: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
  signInWithOtp: (email: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
  verifyOtp: (email: string, token: string, type: 'signup' | 'magiclink') => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
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

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_email_exists', { 
        p_email: email.toLowerCase().trim() 
      });
      
      if (error) {
        console.error('Error checking email:', error);
        return false;
      }
      
      return data as boolean;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const checkUsernameExists = async (username: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_username_exists', { 
        p_username: username.toLowerCase().trim() 
      });
      
      if (error) {
        console.error('Error checking username:', error);
        return false;
      }
      
      return data as boolean;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  const signupWithOtp = async (email: string, username: string): Promise<{ success: boolean; error?: string; needsVerification?: boolean }> => {
    // Validation
    if (!email || !username) {
      return { success: false, error: 'Don\'t ghost the form. Fill it in, bestie.' };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim().toLowerCase();
    
    // Basic validation
    if (trimmedUsername.length < 2) {
      return { success: false, error: 'Username needs at least 2 characters. Give it some substance!' };
    }
    
    if (trimmedUsername.length > 20) {
      return { success: false, error: 'Username\'s too long. Keep it snappy!' };
    }
    
    if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
      return { success: false, error: 'Username can only have letters, numbers, and underscores. Keep it clean!' };
    }

    try {
      setError(null);
      setLoading(true);
      
      console.log('🔵 DEBUG: Starting OTP signup process for username:', trimmedUsername);

      // Check if email already exists
      const emailExists = await checkEmailExists(trimmedEmail);
      if (emailExists) {
        return { success: false, error: 'You\'ve been here before. Wanna log in instead?' };
      }

      // Check if username is already taken
      const usernameExists = await checkUsernameExists(trimmedUsername);
      if (usernameExists) {
        return { success: false, error: 'That name\'s already vibin\' with someone else. Try another.' };
      }

      // Store username temporarily for after verification
      localStorage.setItem('jinjjamood_pending_username', trimmedUsername);
      localStorage.setItem('jinjjamood_pending_email', trimmedEmail);

      // Send magic link
      console.log('🔵 DEBUG: Sending magic link to:', trimmedEmail);
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/login?verified=true`,
        }
      });

      if (otpError) {
        console.error('❌ DEBUG: OTP signup error:', otpError);
        return { success: false, error: otpError.message || 'Magic link failed. The servers are being moody.' };
      }

      console.log('✅ DEBUG: Magic link sent successfully');
      return { success: true, needsVerification: true };
      
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

  const signInWithOtp = async (email: string): Promise<{ success: boolean; error?: string; needsVerification?: boolean }> => {
    // Validation
    if (!email) {
      return { success: false, error: 'Don\'t ghost the form. Fill it in, bestie.' };
    }

    const trimmedEmail = email.trim().toLowerCase();

    try {
      setError(null);
      setLoading(true);
      
      console.log('🔵 DEBUG: Starting OTP signin process for email:', trimmedEmail);

      // Check if email exists
      const emailExists = await checkEmailExists(trimmedEmail);
      if (!emailExists) {
        return { success: false, error: 'No account with that email. Feeling new? Try signing up.' };
      }

      // Send magic link
      console.log('🔵 DEBUG: Sending magic link to:', trimmedEmail);
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/login?verified=true`,
        }
      });

      if (otpError) {
        console.error('❌ DEBUG: OTP signin error:', otpError);
        return { success: false, error: otpError.message || 'Magic link failed. The servers are being moody.' };
      }

      console.log('✅ DEBUG: Magic link sent successfully');
      return { success: true, needsVerification: true };
      
    } catch (err: any) {
      console.error('❌ DEBUG: Signin error:', err);
      
      let errorMessage = 'Magic link failed. The servers are being moody.';
      
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

  const verifyOtp = async (email: string, token: string, type: 'signup' | 'magiclink'): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('🔵 DEBUG: Verifying OTP for email:', email);

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: type === 'signup' ? 'signup' : 'magiclink'
      });

      if (error) {
        console.error('❌ DEBUG: OTP verification error:', error);
        return { success: false, error: error.message || 'Verification failed. Try again?' };
      }

      if (!data.user) {
        return { success: false, error: 'Verification failed. Try again?' };
      }

      // If this was a signup, create the user profile
      if (type === 'signup') {
        const pendingUsername = localStorage.getItem('jinjjamood_pending_username');
        const pendingEmail = localStorage.getItem('jinjjamood_pending_email');
        
        if (pendingUsername && pendingEmail) {
          console.log('🔵 DEBUG: Creating user profile after OTP verification...');
          
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              username: pendingUsername,
              email: pendingEmail,
            });

          if (profileError) {
            console.error('❌ DEBUG: Error creating user profile:', profileError);
            return { success: false, error: 'Profile creation failed. The servers are being stubborn.' };
          }

          // Clean up temporary storage
          localStorage.removeItem('jinjjamood_pending_username');
          localStorage.removeItem('jinjjamood_pending_email');
          
          console.log('✅ DEBUG: User profile created successfully');
        }
      }

      console.log('✅ DEBUG: OTP verification completed successfully');
      return { success: true };
      
    } catch (err: any) {
      console.error('❌ DEBUG: Verification error:', err);
      return { success: false, error: err.message || 'Verification failed. Try again?' };
    } finally {
      setLoading(false);
    }
  };

  // Keep existing password-based methods for backward compatibility
  const signup = async (email: string, password: string, username: string, rememberMe: boolean = true): Promise<{ success: boolean; error?: string }> => {
    // Validation
    if (!email || !password || !username) {
      return { success: false, error: 'Don\'t ghost the form. Fill it in, bestie.' };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedUsername = username.trim().toLowerCase();
    
    // Basic validation
    if (trimmedUsername.length < 2) {
      return { success: false, error: 'Username needs at least 2 characters. Give it some substance!' };
    }
    
    if (trimmedUsername.length > 20) {
      return { success: false, error: 'Username\'s too long. Keep it snappy!' };
    }
    
    if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
      return { success: false, error: 'Username can only have letters, numbers, and underscores. Keep it clean!' };
    }

    if (trimmedPassword.length < 6) {
      return { success: false, error: 'Password needs at least 6 characters. Make it stronger!' };
    }

    try {
      setError(null);
      setLoading(true);
      
      console.log('🔵 DEBUG: Starting signup process for username:', trimmedUsername);

      // Check if email already exists
      const emailExists = await checkEmailExists(trimmedEmail);
      if (emailExists) {
        return { success: false, error: 'You\'ve been here before. Wanna log in instead?' };
      }

      // Check if username is already taken
      const usernameExists = await checkUsernameExists(trimmedUsername);
      if (usernameExists) {
        return { success: false, error: 'That name\'s already vibin\' with someone else. Try another.' };
      }

      // Create Supabase account
      console.log('🔵 DEBUG: Creating Supabase account...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (authError) {
        console.error('❌ DEBUG: Supabase auth error:', authError);
        
        if (authError.message.includes('already registered')) {
          return { success: false, error: 'You\'ve been here before. Wanna log in instead?' };
        }
        
        return { success: false, error: authError.message || 'Signup failed. The servers are being moody.' };
      }

      if (!authData.user) {
        console.error('❌ DEBUG: No user returned from auth signup');
        return { success: false, error: 'Signup failed. The servers are being moody.' };
      }

      console.log('✅ DEBUG: Supabase account created successfully');

      // Save user profile to users table
      console.log('🔵 DEBUG: Saving user profile to database...');
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          username: trimmedUsername,
          email: trimmedEmail,
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ DEBUG: Error saving user profile:', profileError);
        return { success: false, error: 'Profile creation failed. The servers are being stubborn.' };
      }

      console.log('✅ DEBUG: User profile saved successfully');

      // Configure session persistence
      if (authData.session) {
        console.log('🔵 DEBUG: Configuring session persistence, rememberMe:', rememberMe);
        
        if (rememberMe) {
          localStorage.setItem('jinjjamood_rememberMe', 'true');
        } else {
          localStorage.setItem('jinjjamood_rememberMe', 'false');
        }
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

  const login = async (email: string, password: string, rememberMe: boolean = true): Promise<{ success: boolean; error?: string }> => {
    // Validation
    if (!email || !password) {
      return { success: false, error: 'Don\'t ghost the form. Fill it in, bestie.' };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    try {
      setError(null);
      setLoading(true);
      
      console.log('🔵 DEBUG: Starting login process for email:', trimmedEmail);

      // Attempt Supabase authentication
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
        } else if (error.message.includes('User not found')) {
          errorMessage = 'No account with that email. Feeling new? Try signing up.';
        }
        
        return { success: false, error: errorMessage };
      }

      if (!data.user) {
        return { success: false, error: 'Login failed. The servers are being moody.' };
      }

      // Configure session persistence
      if (data.session) {
        console.log('🔵 DEBUG: Configuring session persistence, rememberMe:', rememberMe);
        
        if (rememberMe) {
          localStorage.setItem('jinjjamood_rememberMe', 'true');
        } else {
          localStorage.setItem('jinjjamood_rememberMe', 'false');
        }
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
      // Check if new username is available
      const usernameExists = await checkUsernameExists(trimmedUsername);
      if (usernameExists) {
        return { success: false, error: 'Someone\'s already vibing with that name. Pick a new one?' };
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
      
      // Clear local state and session data
      setUserProfile(null);
      localStorage.removeItem('jinjjamood_currentUser');
      localStorage.removeItem('jinjjamood_rememberMe');
      
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
      localStorage.removeItem('jinjjamood_rememberMe');
      localStorage.removeItem('jinjjamood_pending_username');
      localStorage.removeItem('jinjjamood_pending_email');
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
      
      // Clear user profile state
      setUserProfile(null);
      setError(null);
      
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
    signupWithOtp,
    signInWithOtp,
    verifyOtp,
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