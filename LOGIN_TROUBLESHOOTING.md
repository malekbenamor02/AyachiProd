# Login 500 Error - Troubleshooting Guide

## Common Causes

### 1. User Not in Supabase Auth
**Problem:** User doesn't exist in Supabase Authentication

**Solution:**
1. Go to Supabase Dashboard → Authentication → Users
2. Create a new user with email/password
3. Or use the user you already created
4. **Copy the User ID (UUID)**

### 2. User Not Linked in Database
**Problem:** User exists in Supabase Auth but not in `users` table

**Solution:**
1. Go to Supabase SQL Editor
2. Run this SQL (replace with your actual User ID and email):
```sql
INSERT INTO users (id, email, full_name, role)
VALUES (
  'YOUR_SUPABASE_AUTH_USER_ID_HERE',
  'admin@ayachiprod.com',
  'Aziz Ayachi',
  'admin'
);
```

### 3. Wrong Credentials
**Problem:** Email or password is incorrect

**Solution:**
- Verify email matches exactly (case-sensitive)
- Reset password in Supabase if needed

### 4. Database Connection Issue
**Problem:** Can't connect to Supabase

**Solution:**
- Check `SUPABASE_URL` in `api/.env`
- Check `SUPABASE_SERVICE_KEY` in `api/.env`
- Verify Supabase project is active

---

## Debug Steps

### Step 1: Check Backend Logs
Look at the terminal where backend is running. You should see:
- `Login attempt - body: received`
- `Attempting Supabase auth for: [email]`
- Error messages if something fails

### Step 2: Test Supabase Connection
```sql
-- In Supabase SQL Editor, check if users table has data:
SELECT * FROM users;
```

### Step 3: Verify User in Auth
1. Go to Supabase Dashboard
2. Authentication → Users
3. Check if your user exists
4. Note the User ID

### Step 4: Link User to Database
If user exists in Auth but not in `users` table, run:
```sql
INSERT INTO users (id, email, full_name, role)
VALUES (
  '[USER_ID_FROM_AUTH]',
  '[YOUR_EMAIL]',
  'Aziz Ayachi',
  'admin'
);
```

---

## Quick Fix Checklist

- [ ] User exists in Supabase Authentication
- [ ] User is linked in `users` table (same UUID)
- [ ] Email/password are correct
- [ ] `SUPABASE_URL` is correct in `.env`
- [ ] `SUPABASE_SERVICE_KEY` is correct in `.env`
- [ ] Backend logs show detailed error messages

---

## Expected Flow

1. ✅ Frontend sends email/password to `/api/auth/login`
2. ✅ Backend authenticates with Supabase Auth
3. ✅ Backend fetches user from `users` table
4. ✅ Backend generates JWT token
5. ✅ Backend returns token and user data

If any step fails, check the backend logs for the specific error.

---

**Status:** Enhanced error logging added - check backend terminal for details!
