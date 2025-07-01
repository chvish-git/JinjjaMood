# Quick Database Schema Fix

## The Problem
Your app is showing these errors because the Supabase database is missing required tables and functions:
- `relation "public.users" does not exist`
- `Could not find the function public.check_username_exists`

## The Solution (5 minutes)

### Step 1: Go to Supabase SQL Editor
1. Open your Supabase dashboard: https://supabase.com/dashboard/projects
2. Select your project
3. Click "SQL Editor" in the left sidebar

### Step 2: Run Migration 1 - Create Tables
Copy and paste this entire script, then click "Run":

```sql
/*
  # Initial Schema for JinjjaMood

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

### Step 3: Run Migration 2 - Create Functions
Copy and paste this script, then click "Run":

```sql
/*
  # User Validation Functions
  
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

### Step 4: Verify Setup
After running both scripts:

1. **Check Tables** (Table Editor):
   - You should see `users` and `mood_logs` tables
   - Both should show "RLS enabled"

2. **Check Functions** (Database > Functions):
   - You should see `check_email_exists` and `check_username_exists`

### Step 5: Test Your App
1. Refresh your browser at http://localhost:5173/login
2. Try signing up - the errors should be gone!

## Success ✅
Once you complete these steps, all the signup and authentication errors will be resolved. Your app will be able to:
- Create new user accounts
- Check for existing usernames/emails
- Store user profiles
- Log mood entries

The database is now properly configured and your app should work perfectly!