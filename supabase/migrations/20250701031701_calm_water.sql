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