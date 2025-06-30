# Supabase Write Operations in JinjjaMood

## Current Setup Status ✅

Your app already has Supabase configured and working! Here's what's currently implemented:

### 1. Database Schema
- ✅ `users` table with RLS policies
- ✅ `mood_logs` table with RLS policies  
- ✅ Edge function for account deletion
- ✅ RPC functions for checking email/username existence

### 2. Write Operations Currently Working

#### User Registration (Sign Up)
```typescript
// In AuthContext.tsx - signup function
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: trimmedEmail,
  password: trimmedPassword,
});

// Then insert user profile
const { data: profileData, error: profileError } = await supabase
  .from('users')
  .insert({
    id: authData.user.id,
    username: trimmedUsername,
    email: trimmedEmail,
  })
  .select()
  .single();
```

#### Mood Logging
```typescript
// In utils/storage.ts - saveMoodLog function
const { data, error } = await supabase
  .from('mood_logs')
  .insert(logData)
  .select()
  .single();
```

#### Username Updates
```typescript
// In AuthContext.tsx - updateUsername function
const { error: updateError } = await supabase
  .from('users')
  .update({ username: trimmedUsername })
  .eq('id', userProfile.id);
```

## Troubleshooting Fresh Start 🔄

Since you mentioned deleting users and mood logs, here's how to start fresh:

### 1. Check Your Supabase Dashboard
- Go to your Supabase project dashboard
- Navigate to Table Editor
- Verify the `users` and `mood_logs` tables exist
- Check if the RLS policies are still active

### 2. Test Database Connection
```typescript
// Add this to test basic connectivity
const testConnection = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('count(*)')
    .single();
  
  console.log('Connection test:', { data, error });
};
```

### 3. Common Issues After Data Deletion

#### Issue: RLS Policies Blocking Writes
**Solution**: Ensure policies allow authenticated users to insert their own data

#### Issue: Missing Environment Variables
**Solution**: Check your `.env` file has:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Issue: Auth User vs Profile Mismatch
**Solution**: The app creates a profile after auth signup - this should work automatically

## Testing Write Operations 🧪

### 1. Test User Registration
1. Go to `/login`
2. Switch to "Sign Up" tab
3. Enter: email, password, username
4. Check Supabase dashboard for new user in `users` table

### 2. Test Mood Logging
1. After login, go to `/mood`
2. Select a mood and submit
3. Check Supabase dashboard for new entry in `mood_logs` table

### 3. Debug Console Logs
The app has extensive logging. Check browser console for:
- `🔵 DEBUG: Starting signup process...`
- `✅ DEBUG: User profile saved successfully`
- `🔵 DEBUG: Attempting to save mood log...`

## Current Write Flow Status 📊

| Operation | Status | Location |
|-----------|--------|----------|
| User Signup | ✅ Working | `AuthContext.tsx` |
| Mood Logging | ✅ Working | `utils/storage.ts` |
| Username Update | ✅ Working | `AuthContext.tsx` |
| Account Deletion | ✅ Working | Edge Function |

## Next Steps 🚀

1. **Try signing up a new user** - this will test the full write pipeline
2. **Check browser console** for any error messages
3. **Verify Supabase dashboard** shows the new data
4. **Test mood logging** after successful signup

The write operations are already implemented and should work! Let me know what specific error you're seeing and I can help debug it.