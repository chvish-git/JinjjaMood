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

-- Create custom types (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE mood_type AS ENUM ('positive', 'neutral', 'negative', 'bonus');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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
  day text NOT NULL, -- Format: YYYY-MM-DD for efficient querying
  hour integer NOT NULL CHECK (hour >= 0 AND hour <= 23),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON users
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Mood logs policies
CREATE POLICY "Users can read own mood logs"
  ON mood_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own mood logs"
  ON mood_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own mood logs"
  ON mood_logs
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own mood logs"
  ON mood_logs
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_mood_logs_user_id ON mood_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_logs_day ON mood_logs(user_id, day);
CREATE INDEX IF NOT EXISTS idx_mood_logs_timestamp ON mood_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_mood_logs_mood_type ON mood_logs(user_id, mood_type, timestamp DESC);

-- Create function to automatically set day field
CREATE OR REPLACE FUNCTION set_mood_log_day()
RETURNS TRIGGER AS $$
BEGIN
  NEW.day = to_char(NEW.timestamp, 'YYYY-MM-DD');
  NEW.hour = EXTRACT(hour FROM NEW.timestamp);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set day and hour
CREATE TRIGGER trigger_set_mood_log_day
  BEFORE INSERT OR UPDATE ON mood_logs
  FOR EACH ROW
  EXECUTE FUNCTION set_mood_log_day();