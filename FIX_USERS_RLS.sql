-- Fix RLS for users table
-- The service role key should bypass RLS, but if RLS is enabled without policies,
-- it might still block queries. This policy ensures service role can access users.

-- Check if RLS is enabled on users table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- Option 1: Disable RLS on users table (if you want no RLS)
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Option 2: Create a policy that allows service role access (RECOMMENDED)
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Service role can access users" ON users;

-- Create policy for service role (service role key bypasses this, but it's good to have)
CREATE POLICY "Service role can access users"
  ON users FOR ALL
  USING (true)
  WITH CHECK (true);

-- Also create a policy that allows users to read their own data
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Verify the policies
SELECT * FROM pg_policies WHERE tablename = 'users';
