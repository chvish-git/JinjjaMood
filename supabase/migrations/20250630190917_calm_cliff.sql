/*
  # Add User Existence Check Functions

  1. New Functions
    - `check_email_exists` - Securely check if email exists
    - `check_username_exists` - Securely check if username exists

  2. Security
    - Functions use SECURITY DEFINER to bypass RLS
    - Only return boolean values (no sensitive data exposure)
    - Grant EXECUTE permission to anon role for signup checks
*/

-- Function to check if an email already exists in the users table
CREATE OR REPLACE FUNCTION public.check_email_exists(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.users WHERE email = p_email);
END;
$$;

-- Grant execution to anon role for the email check function
GRANT EXECUTE ON FUNCTION public.check_email_exists(text) TO anon;

-- Function to check if a username already exists in the users table
CREATE OR REPLACE FUNCTION public.check_username_exists(p_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.users WHERE username = p_username);
END;
$$;

-- Grant execution to anon role for the username check function
GRANT EXECUTE ON FUNCTION public.check_username_exists(text) TO anon;