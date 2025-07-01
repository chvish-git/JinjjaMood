/*
  # Fix Email Check Function

  Updates the check_email_exists function to query auth.users instead of public.users
  to prevent "User already registered" errors during signup validation.

  1. Function Updates
    - `check_email_exists` now queries auth.users (the authoritative source)
    - This ensures accurate pre-signup validation
    - Prevents unnecessary signup attempts for already registered emails

  2. Security
    - Maintains SECURITY DEFINER for proper access control
    - Keeps anonymous user permissions for signup validation
*/

-- Update email check function to query auth.users instead of public.users
CREATE OR REPLACE FUNCTION public.check_email_exists(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM auth.users WHERE email = p_email);
END;
$$;

-- Ensure proper permissions are maintained
GRANT EXECUTE ON FUNCTION public.check_email_exists(text) TO anon;