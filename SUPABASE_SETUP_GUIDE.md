# Supabase Database Setup Guide
## Step-by-Step Instructions

---

## 🚀 Quick Setup

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project: `muhxrtqxhxldfasyffhs`
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

---

### Step 2: Run the Migration Script

1. Open the file: `supabase-migration.sql`
2. **Copy the ENTIRE content** (Ctrl+A, Ctrl+C)
3. **Paste it into Supabase SQL Editor** (Ctrl+V)
4. Click **"Run"** button (or press Ctrl+Enter)

✅ **Wait for success message:** "Success. No rows returned"

---

### Step 3: Verify Tables Were Created

1. In Supabase dashboard, go to **"Table Editor"**
2. You should see these tables:
   - ✅ `users`
   - ✅ `galleries`
   - ✅ `media_files`
   - ✅ `gallery_access_tokens`
   - ✅ `upload_sessions`
   - ✅ `activity_logs`

---

### Step 4: Create Admin User

**Option A: Using Supabase Auth (Recommended)**

1. Go to **Authentication → Users**
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - **Email:** `admin@ayachiprod.com` (or your email)
   - **Password:** (create a strong password)
   - **Auto Confirm User:** ✅ Check this
4. Click **"Create user"**
5. **Copy the User ID** (UUID)

**Option B: Link Existing User**

If you already have a user in Supabase Auth:

1. Go to **Authentication → Users**
2. Find your user and **copy the User ID** (UUID)
3. Go to **SQL Editor** and run:

```sql
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from Supabase Auth
INSERT INTO users (id, email, full_name, role)
VALUES (
  'YOUR_USER_ID_HERE',
  'admin@ayachiprod.com',
  'Aziz Ayachi',
  'admin'
);
```

---

### Step 5: Test Database Connection

1. Go to **Table Editor**
2. Click on `users` table
3. You should see your admin user
4. Try creating a test gallery via API (after starting backend)

---

## ✅ Verification Checklist

- [ ] All 6 tables created successfully
- [ ] All indexes created
- [ ] Functions created (increment_gallery_access, get_gallery_stats)
- [ ] Views created (gallery_statistics)
- [ ] RLS enabled on tables
- [ ] Admin user created and linked

---

## 🔍 Troubleshooting

### Error: "relation already exists"
- Tables already exist, that's okay
- The script uses `IF NOT EXISTS` so it's safe to run again

### Error: "permission denied"
- Make sure you're using the SQL Editor (not restricted)
- Check you have admin access to the project

### Error: "function already exists"
- Functions already exist, that's okay
- The script uses `CREATE OR REPLACE` so it's safe

### Can't see tables in Table Editor
- Refresh the page
- Check if you're in the correct project
- Verify the migration ran successfully

---

## 📝 Next Steps After Database Setup

1. ✅ Database is ready
2. ✅ Create `.env` files (from templates)
3. ✅ Start backend: `cd api && vercel dev`
4. ✅ Start frontend: `cd frontend && npm run dev`
5. ✅ Test admin login
6. ✅ Create your first gallery!

---

## 🎯 Database Structure Summary

```
users (Admin users)
  └── galleries (Client galleries)
       ├── media_files (Images/Videos)
       ├── gallery_access_tokens (QR codes)
       └── upload_sessions (Chunked uploads)

activity_logs (Tracking)
```

---

**Status:** ✅ **READY TO RUN**  
**File:** `supabase-migration.sql`  
**Last Updated:** 2026
