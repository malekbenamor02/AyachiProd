# Debug User Query Issue

## Problem

User says the user exists in database, but we're getting:
- "Cannot coerce the result to a single JSON object"

This error usually means:
1. Query returned 0 rows (but user says it exists)
2. Query returned multiple rows (duplicate users)
3. Data type mismatch (UUID vs string)

## Fix Applied

Changed the query to:
- Use `.select()` without `.single()` first
- Check how many rows are returned
- Log all the details
- Handle multiple rows if they exist

## Next Steps

1. ✅ Backend restarted with better logging
2. ⏭️ Try login again
3. ⏭️ Check backend logs - you'll see:
   - How many users were found
   - The actual data returned
   - Any error details

## What to Check

### In Supabase SQL Editor, run:

```sql
-- Check if user exists
SELECT * FROM users WHERE id = '536e07de-46da-4de0-8688-3e3dfa055e69';

-- Check for duplicates
SELECT id, email, COUNT(*) as count 
FROM users 
WHERE id = '536e07de-46da-4de0-8688-3e3dfa055e69'
GROUP BY id, email;

-- Check all users
SELECT id, email, full_name, role FROM users;
```

### Possible Issues:

1. **ID Type Mismatch**
   - User ID in Auth: UUID
   - User ID in database: Different type?
   - Check if the ID column is UUID type

2. **Multiple Rows**
   - Same user inserted multiple times
   - Check for duplicates

3. **Case Sensitivity**
   - Email might be different case
   - Check exact email match

---

**Status:** ✅ **Better logging added - try login and check logs!**
