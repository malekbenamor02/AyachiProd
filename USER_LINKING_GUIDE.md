# Link User to Database - Quick Fix

## ✅ Good News!

Your authentication is working! The issue is just that your user needs to be linked to the `users` table.

**Your User ID:** `536e07de-46da-4de0-8688-3e3dfa055e69`  
**Your Email:** `fmalekbenamorf@gmail.com`

---

## 🚀 Quick Fix (2 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** → **"New query"**

### Step 2: Run This SQL

Copy and paste this SQL:

```sql
INSERT INTO users (id, email, full_name, role)
VALUES (
  '536e07de-46da-4de0-8688-3e3dfa055e69',
  'fmalekbenamorf@gmail.com',
  'Aziz Ayachi',
  'admin'
)
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;
```

### Step 3: Click "Run"

You should see: **"Success. No rows returned"** or **"Success. 1 row inserted"**

### Step 4: Verify

Run this to check:
```sql
SELECT * FROM users WHERE id = '536e07de-46da-4de0-8688-3e3dfa055e69';
```

You should see your user!

---

## ✅ Try Login Again

After running the SQL:

1. Go back to: http://localhost:3000/admin/login
2. Enter your credentials:
   - Email: `fmalekbenamorf@gmail.com`
   - Password: `admin123` (or whatever you set)
3. Click "Login"

**It should work now!** 🎉

---

## 📝 What This Does

This SQL:
- Links your Supabase Auth user to the `users` table
- Sets your role as `admin`
- Uses `ON CONFLICT` so it's safe to run multiple times

---

## 🔍 Why This Happened

- ✅ User exists in **Supabase Auth** (authentication works)
- ❌ User doesn't exist in **`users` table** (database lookup fails)

The SQL above links them together!

---

**Status:** ✅ **Just need to run the SQL - then login will work!**
