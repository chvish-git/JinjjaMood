/*
  # User Validation Functions for Magic Link Authentication
  
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