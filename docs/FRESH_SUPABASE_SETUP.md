# Fresh Supabase Setup Guide

## Step 1: Create New Supabase Project

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in to your account

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Project name: `jinjjamood-fresh` (or any name you prefer)
   - Database password: Create a strong password (save it!)
   - Region: Choose closest to you
   - Click "Create new project"

3. **Wait for Setup**
   - This takes 2-3 minutes
   - Don't close the browser tab

## Step 2: Get Your New Connection Details

1. **Go to Project Settings**
   - Click the gear icon (Settings) in your project
   - Go to "API" section

2. **Copy These Values**:
   - **Project URL**: `https://[your-project-ref].supabase.co`
   - **Anon Public Key**: `eyJ...` (long string starting with eyJ)

## Step 3: Update Your App Configuration

Replace your `.env` file with the new values:

```env
# Fresh Supabase Configuration
VITE_SUPABASE_URL=https://[your-new-project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ[your-new-anon-key]
```

## Step 4: Set Up Database Schema

1. **Go to SQL Editor**
   - In your Supabase dashboard, click "SQL Editor"

2. **Run Migration 1** - Copy and paste this entire script:

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

3. **Click "Run" to execute**

4. **Run Migration 2** - Copy and paste this script:

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

5. **Click "Run" to execute**

## Step 5: Verify Setup

1. **Check Tables** (Table Editor):
   - You should see `users` and `mood_logs` tables
   - Both should show "RLS enabled"

2. **Check Functions** (Database > Functions):
   - You should see `check_email_exists` and `check_username_exists`

## Step 6: Test Your App

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test signup**:
   - Go to http://localhost:5173/login
   - Try creating a new account
   - Check your Supabase dashboard to see the new user appear

## Step 7: Set Up Edge Function (Optional)

If you want account deletion to work:

1. **Go to Edge Functions** in Supabase dashboard
2. **Create new function** called `delete-account`
3. **Copy the code** from `supabase/functions/delete-account/index.ts`
4. **Deploy the function**

## Troubleshooting

### If signup still fails:
1. Check browser console for specific errors
2. Verify your `.env` file has the correct values
3. Make sure you restarted the dev server after updating `.env`

### If you see "relation does not exist":
1. Double-check you ran both SQL scripts
2. Refresh your Supabase dashboard
3. Verify the tables appear in Table Editor

### If you see RLS policy errors:
1. The policies should allow authenticated users to manage their own data
2. Check that RLS is enabled on both tables

## Success Indicators

✅ **Tables created**: `users` and `mood_logs` visible in dashboard  
✅ **RLS enabled**: Both tables show "RLS enabled"  
✅ **Functions created**: Both check functions visible  
✅ **App connects**: No connection errors in browser console  
✅ **Signup works**: New users appear in `users` table  
✅ **Mood logging works**: New moods appear in `mood_logs` table  

Once you complete these steps, your app will have a fresh, clean Supabase connection with all the database operations working perfectly!