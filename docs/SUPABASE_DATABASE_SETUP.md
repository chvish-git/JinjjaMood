# Supabase Database Setup - Fix Missing Schema

## Quick Fix for Your Errors

Your app is showing these errors because the database tables and functions don't exist yet:
- `relation "public.users" does not exist`
- `Could not find the function public.check_username_exists`

## Step-by-Step Fix (5 minutes)

### 1. Open SQL Editor
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/dtzjybgnjayggeaelbwd
2. Click **"SQL Editor"** in the left sidebar

### 2. Run Migration 1 - Create Tables & Security
Copy this entire script and paste it into the SQL Editor, then click **"Run"**:

```sql
/*
  # Initial Schema for JinjjaMood - Fresh Setup

  1. New Tables
    - `users` table with authentication integration
    - `mood_logs` table with comprehensive mood tracking
  
  2. Security
    - Row Level Security enabled
    - Proper policies for user data isolation
  
  3. Performance
    - Optimized indexes for fast queries
*/

-- Create custom types
CREATE TYPE mood_type AS ENUM ('positive', 'neutral', 'negative', 'bonus');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL CHECK (length(username) >= 2 AND length(username) <= 20),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create mood_logs table
CREATE TABLE IF NOT EXISTS mood_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood text NOT NULL CHECK (mood IN (
    -- Positive moods
    'joyful', 'productive', 'calm', 'grateful', 'energized', 'confident',
    -- Neutral moods
    'meh', 'blank', 'tired', 'chill', 'focused', 'neutral',
    -- Negative moods
    'anxious', 'angry', 'stressed', 'low energy', 'overwhelmed', 'sad',
    -- Bonus moods
    'ungovernable', 'CEO mode', 'fluff cloud', 'main character', 'chaos gremlin', 'soft launch'
  )),
  mood_type mood_type NOT NULL,
  journal_entry text DEFAULT '',
  timestamp timestamptz DEFAULT now(),
  day text NOT NULL, -- Format: YYYY-MM-DD
  hour integer NOT NULL CHECK (hour >= 0 AND hour <= 23),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create own profile"
  ON users FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON users FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- Mood logs policies
CREATE POLICY "Users can read own mood logs"
  ON mood_logs FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own mood logs"
  ON mood_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own mood logs"
  ON mood_logs FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own mood logs"
  ON mood_logs FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_id ON mood_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_logs_day ON mood_logs(user_id, day);
CREATE INDEX IF NOT EXISTS idx_mood_logs_timestamp ON mood_logs(user_id, timestamp DESC);

-- Auto-populate day and hour fields
CREATE OR REPLACE FUNCTION set_mood_log_day()
RETURNS TRIGGER AS $$
BEGIN
  NEW.day = to_char(NEW.timestamp, 'YYYY-MM-DD');
  NEW.hour = EXTRACT(hour FROM NEW.timestamp);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_mood_log_day
  BEFORE INSERT OR UPDATE ON mood_logs
  FOR EACH ROW EXECUTE FUNCTION set_mood_log_day();
```

### 3. Run Migration 2 - Create Validation Functions
Copy this script and paste it into the SQL Editor, then click **"Run"**:

```sql
/*
  # User Validation Functions - Fresh Setup
  
  These functions allow the app to check if usernames/emails exist
  during signup without exposing sensitive data.
*/

-- Function to check if email exists (checks auth.users for accurate results)
CREATE OR REPLACE FUNCTION public.check_email_exists(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM auth.users WHERE email = p_email);
END;
$$;

-- Function to check if username exists
CREATE OR REPLACE FUNCTION public.check_username_exists(p_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.users WHERE username = p_username);
END;
$$;

-- Grant permissions to anonymous users (needed for signup)
GRANT EXECUTE ON FUNCTION public.check_email_exists(text) TO anon;
GRANT EXECUTE ON FUNCTION public.check_username_exists(text) TO anon;
```

### 4. Verify Everything Works
After running both scripts:

1. **Check Tables** (go to Table Editor):
   - You should see `users` and `mood_logs` tables
   - Both should show "RLS enabled"

2. **Check Functions** (go to Database > Functions):
   - You should see `check_email_exists` and `check_username_exists`

3. **Test your app**:
   - Go back to http://localhost:5173/login
   - Try signing up with a new account
   - All the errors should be gone!

## What This Fixes

✅ **Creates the `users` table** - stores user profiles  
✅ **Creates the `mood_logs` table** - stores mood entries  
✅ **Sets up Row Level Security** - users can only see their own data  
✅ **Creates validation functions** - checks if usernames/emails exist  
✅ **Adds proper indexes** - makes queries fast  
✅ **Sets up triggers** - auto-fills date/time fields  

## Success Indicators

After running these scripts, your app should:
- ✅ Allow new user signups
- ✅ Check for existing usernames/emails
- ✅ Save user profiles successfully
- ✅ No more database errors in the console

The database is now properly configured and your JinjjaMood app will work perfectly!