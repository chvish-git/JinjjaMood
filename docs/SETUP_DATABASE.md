# Fix Missing Supabase Database Schema

## The Problem
Your Supabase database is missing the required tables and RPC functions, causing these errors:
- `relation "public.users" does not exist`
- `Could not find the function public.check_username_exists`

## The Solution

### Step 1: Run the Database Migration

1. **Go to your Supabase project dashboard**
   - URL: https://supabase.com/dashboard/projects
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar

3. **Run the First Migration**
   - Copy the entire contents of `supabase/migrations/20250630075947_old_shadow.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

4. **Run the Second Migration**
   - Copy the entire contents of `supabase/migrations/20250630190917_calm_cliff.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

### Step 2: Verify the Setup

After running both migrations, verify in your Supabase dashboard:

1. **Check Tables** (Table Editor):
   - `users` table should exist with columns: id, username, email, created_at
   - `mood_logs` table should exist with columns: id, user_id, mood, mood_type, journal_entry, timestamp, day, hour, created_at

2. **Check RLS Policies** (Authentication > Policies):
   - Both tables should have RLS enabled
   - Multiple policies should exist for each table

3. **Check Functions** (Database > Functions):
   - `check_email_exists(text)` should exist
   - `check_username_exists(text)` should exist

### Step 3: Test the App

1. Go to your app at `http://localhost:5173/login`
2. Try signing up with a new account
3. The errors should be resolved

## What These Migrations Do

### Migration 1 (`20250630075947_old_shadow.sql`):
- Creates the `users` table
- Creates the `mood_logs` table
- Sets up Row Level Security (RLS) policies
- Creates indexes for performance
- Sets up triggers for automatic field population

### Migration 2 (`20250630190917_calm_cliff.sql`):
- Creates RPC functions for checking email/username existence
- Grants proper permissions to anonymous users for signup validation

## If You Still Have Issues

1. **Check your environment variables** in `.env`:
   ```
   VITE_SUPABASE_URL=https://xyphlnklbresxuwcosmd.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. **Restart your development server**:
   ```bash
   npm run dev
   ```

3. **Clear browser cache** and try again

The database schema is the foundation - once it's set up correctly, all the authentication and mood logging features will work perfectly!