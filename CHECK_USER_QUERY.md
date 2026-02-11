# Check User in Database

## Since User Exists, Let's Verify the Query

Since you confirmed the user exists in the database, the issue might be:

1. **Multiple rows** with the same ID (duplicate)
2. **ID format mismatch** (UUID with/without dashes)
3. **Query not matching** correctly

## Run These Queries in Supabase SQL Editor

### 1. Check if user exists:
```sql
SELECT * FROM users WHERE id = '536e07de-46da-4de0-8688-3e3dfa055e69';
```

### 2. Check for duplicates:
```sql
SELECT id, email, COUNT(*) as count 
FROM users 
WHERE id = '536e07de-46da-4de0-8688-3e3dfa055e69'
GROUP BY id, email;
```

### 3. Check all users (to see the actual ID format):
```sql
SELECT id, email, full_name, role FROM users;
```

### 4. Try querying by email instead:
```sql
SELECT * FROM users WHERE email = 'fmalekbenamorf@gmail.com';
```

## What to Look For

1. **If query returns 0 rows:**
   - User doesn't exist (despite what you think)
   - ID might be different format

2. **If query returns multiple rows:**
   - Duplicate users - need to delete duplicates
   - This causes "Cannot coerce to single JSON object" error

3. **If query returns 1 row:**
   - User exists correctly
   - Issue is in the code query logic

## After Checking

Once you run the queries, try login again. The backend now has better logging that will show:
- How many users were found
- The actual data returned
- Any errors

This will help us identify the exact issue!

---

**Status:** ✅ **Backend restarted - try login and check logs!**
