import { supabase } from '../config/supabase';

export interface UserSearchResult {
  exists: boolean;
  field?: 'email' | 'username';
  message?: string;
}

/**
 * Check if email exists in the database using Supabase RPC
 */
export const checkEmailExists = async (email: string): Promise<UserSearchResult> => {
  if (!email || email.trim().length === 0) {
    return { exists: false, message: 'Email is required' };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { exists: false, message: 'That email looks sus. Double-check it?' };
  }

  try {
    console.log('🔍 DEBUG: Checking if email exists via RPC:', trimmedEmail);

    // Call the Supabase RPC function
    const { data, error } = await supabase.rpc('check_email_exists', { 
      p_email: trimmedEmail 
    });

    if (error) {
      console.error('❌ DEBUG: Error checking email via RPC:', error);
      throw new Error('Email existence check failed. The servers are being moody.');
    }

    const exists = data as boolean; // The RPC function returns a boolean
    
    console.log('🔍 DEBUG: Email exists result:', exists);

    return {
      exists,
      field: 'email',
      message: exists 
        ? 'This email already joined the vibe. Try logging in.' 
        : 'Email is available'
    };
  } catch (error: any) {
    console.error('❌ DEBUG: Email search error:', error);
    return {
      exists: false,
      message: error.message || 'Unable to check email availability'
    };
  }
};

/**
 * Check if username exists in the database using Supabase RPC
 */
export const checkUsernameExists = async (username: string): Promise<UserSearchResult> => {
  if (!username || username.trim().length === 0) {
    return { exists: false, message: 'Username is required' };
  }

  const trimmedUsername = username.trim().toLowerCase();

  // Basic validation (keep these client-side)
  if (trimmedUsername.length < 2) {
    return { exists: false, message: 'Username needs at least 2 characters. Give it some substance!' };
  }

  if (trimmedUsername.length > 20) {
    return { exists: false, message: 'Username\'s too long. Keep it snappy!' };
  }

  if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
    return { exists: false, message: 'Username can only have letters, numbers, and underscores. Keep it clean!' };
  }

  // Check for reserved usernames (keep these client-side)
  const reservedNames = ['admin', 'null', 'undefined', 'root', 'system', 'api', 'www', 'mail', 'ftp', 'support', 'help', 'info', 'contact'];
  if (reservedNames.includes(trimmedUsername)) {
    return { 
      exists: true, 
      field: 'username',
      message: 'That username\'s off limits. Pick something more creative!' 
    };
  }

  try {
    console.log('🔍 DEBUG: Checking if username exists via RPC:', trimmedUsername);

    // Call the Supabase RPC function
    const { data, error } = await supabase.rpc('check_username_exists', { 
      p_username: trimmedUsername 
    });

    if (error) {
      console.error('❌ DEBUG: Error checking username via RPC:', error);
      throw new Error('Username existence check failed. The servers are being moody.');
    }

    const exists = data as boolean; // The RPC function returns a boolean
    
    console.log('🔍 DEBUG: Username exists result:', exists);

    return {
      exists,
      field: 'username',
      message: exists 
        ? 'That name\'s already vibin\' with someone else. Try another.' 
        : 'Username is available'
    };
  } catch (error: any) {
    console.error('❌ DEBUG: Username search error:', error);
    return {
      exists: false,
      message: error.message || 'Unable to check username availability'
    };
  }
};

/**
 * Comprehensive user search - checks both email and username
 */
export const searchUser = async (identifier: string): Promise<{
  found: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
  };
  searchType?: 'email' | 'username';
  message?: string;
}> => {
  if (!identifier || identifier.trim().length === 0) {
    return { found: false, message: 'Search term is required' };
  }

  const trimmedIdentifier = identifier.trim().toLowerCase();

  // Determine if it's an email or username
  const isEmail = trimmedIdentifier.includes('@');

  if (isEmail) {
    const result = await checkEmailExists(trimmedIdentifier);
    return {
      found: result.exists,
      searchType: 'email',
      message: result.message
    };
  } else {
    const result = await checkUsernameExists(trimmedIdentifier);
    return {
      found: result.exists,
      searchType: 'username',
      message: result.message
    };
  }
};

/**
 * Get user statistics (for admin purposes or analytics)
 */
export const getUserStats = async (): Promise<{
  totalUsers: number;
  recentUsers: number;
  error?: string;
}> => {
  try {
    console.log('🔍 DEBUG: Getting user statistics');

    // Get total user count
    const { count: totalUsers, error: totalError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('❌ DEBUG: Error getting total users:', totalError);
      throw new Error('Unable to get user statistics');
    }

    // Get users from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentUsers, error: recentError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    if (recentError) {
      console.error('❌ DEBUG: Error getting recent users:', recentError);
      throw new Error('Unable to get recent user statistics');
    }

    console.log('✅ DEBUG: User stats retrieved successfully');

    return {
      totalUsers: totalUsers || 0,
      recentUsers: recentUsers || 0
    };
  } catch (error: any) {
    console.error('❌ DEBUG: User stats error:', error);
    return {
      totalUsers: 0,
      recentUsers: 0,
      error: error.message || 'Unable to get user statistics'
    };
  }
};

/**
 * Check if user can update to a new username (excluding their current username)
 * This function is used by authenticated users, so it can query the users table directly
 */
export const checkUsernameAvailableForUpdate = async (
  newUsername: string, 
  currentUserId: string
): Promise<UserSearchResult> => {
  if (!newUsername || newUsername.trim().length === 0) {
    return { exists: false, message: 'Username is required' };
  }

  if (!currentUserId) {
    return { exists: false, message: 'User ID is required' };
  }

  const trimmedUsername = newUsername.trim().toLowerCase();

  // Basic validation
  if (trimmedUsername.length < 2) {
    return { exists: false, message: 'Username needs at least 2 characters' };
  }

  if (trimmedUsername.length > 20) {
    return { exists: false, message: 'Username\'s too long. Keep it snappy!' };
  }

  if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
    return { exists: false, message: 'Username can only have letters, numbers, and underscores' };
  }

  // Check for reserved usernames
  const reservedNames = ['admin', 'null', 'undefined', 'root', 'system', 'api', 'www', 'mail', 'ftp', 'support', 'help', 'info', 'contact'];
  if (reservedNames.includes(trimmedUsername)) {
    return { 
      exists: true, 
      field: 'username',
      message: 'That username\'s off limits. Pick something more creative!' 
    };
  }

  try {
    console.log('🔍 DEBUG: Checking username availability for update:', trimmedUsername);

    // This query works because the user is authenticated and can query their own data
    const { data, error } = await supabase
      .from('users')
      .select('username, id')
      .eq('username', trimmedUsername)
      .neq('id', currentUserId)
      .limit(1);

    if (error) {
      console.error('❌ DEBUG: Error checking username for update:', error);
      throw new Error('Database search failed. The servers are being moody.');
    }

    const exists = data && data.length > 0;
    
    console.log('🔍 DEBUG: Username available for update result:', !exists);

    return {
      exists,
      field: 'username',
      message: exists 
        ? 'Someone\'s already vibing with that name. Pick a new one?' 
        : 'Username is available for update'
    };
  } catch (error: any) {
    console.error('❌ DEBUG: Username update check error:', error);
    return {
      exists: false,
      message: error.message || 'Unable to check username availability'
    };
  }
};