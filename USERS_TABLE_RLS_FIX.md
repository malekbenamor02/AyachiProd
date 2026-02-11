# Users Table RLS Fix

## Problem Found!
The migration file shows that RLS is enabled on other tables, but the `users` table has a comment saying "RLS is handled by Supabase" with **NO policies created**.

If RLS is enabled on the `users` table without any policies, even the service role key might be blocked!

## Solution

### Step 1: Check RLS Status
Run this in Supabase SQL Editor:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';
```

If `rowsecurity = true`, RLS is enabled.

### Step 2: Fix RLS
You have two options:

#### Option A: Disable RLS (Simplest)
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

#### Option B: Create Policy (Recommended for security)
Run the SQL in `FIX_USERS_RLS.sql`:
- Creates a policy that allows service role access
- Creates a policy that allows users to read their own data
- Keeps RLS enabled for security

### Step 3: Test
After running the fix, try login again. The queries should now work!

## Why This Happened
The migration file enabled RLS on other tables but didn't create policies for the `users` table. If RLS was enabled manually or automatically, it would block all queries without policies.

---

**Run the SQL fix and try login again!**
