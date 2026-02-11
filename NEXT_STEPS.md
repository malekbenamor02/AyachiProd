# Next Steps - Complete Setup Checklist
## What to Do Now

---

## ✅ What's Already Done

- ✅ Project structure created
- ✅ API endpoints consolidated (4 functions)
- ✅ Frontend React app ready
- ✅ Environment variable templates created
- ✅ Database SQL script ready
- ✅ All credentials documented

---

## 🚀 Step-by-Step Setup

### Step 1: Create Environment Files (5 minutes)

**Backend:**
1. Open `api/env-template.txt`
2. Copy all content
3. Create new file: `api/.env`
4. Paste content
5. Save

**Frontend:**
1. Open `frontend/env-template.txt`
2. Copy all content
3. Create new file: `frontend/.env.local`
4. Paste content
5. Save

**Or use command line:**
```bash
cd api
copy env-template.txt .env

cd ../frontend
copy env-template.txt .env.local
```

---

### Step 2: Set Up Database (10 minutes)

1. **Go to Supabase SQL Editor:**
   - https://supabase.com/dashboard
   - Select your project
   - Click "SQL Editor" → "New query"

2. **Run Migration:**
   - Open `supabase-migration.sql`
   - Copy ALL content (Ctrl+A, Ctrl+C)
   - Paste into SQL Editor
   - Click "Run"
   - ✅ Wait for success message

3. **Verify Tables:**
   - Go to "Table Editor"
   - Check that all 6 tables exist

4. **Create Admin User:**
   - Go to "Authentication → Users"
   - Click "Add user" → "Create new user"
   - Email: `admin@ayachiprod.com`
   - Password: (create strong password)
   - ✅ Check "Auto Confirm User"
   - Click "Create user"
   - **Copy the User ID (UUID)**

5. **Link User to Database:**
   - Go back to SQL Editor
   - Run this (replace YOUR_USER_ID):
   ```sql
   INSERT INTO users (id, email, full_name, role)
   VALUES (
     'YOUR_USER_ID_HERE',
     'admin@ayachiprod.com',
     'Aziz Ayachi',
     'admin'
   );
   ```

---

### Step 3: Install Dependencies (5 minutes)

**Backend:**
```bash
cd api
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

---

### Step 4: Test Locally (10 minutes)

**Terminal 1 - Backend:**
```bash
cd api
vercel dev
```
- Should start on: http://localhost:3001
- ✅ Check for "Ready" message

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
- Should start on: http://localhost:3000
- ✅ Check browser opens automatically

---

### Step 5: Test the Application (15 minutes)

1. **Test Portfolio:**
   - Open http://localhost:3000
   - ✅ Should see portfolio website

2. **Test Admin Login:**
   - Go to http://localhost:3000/admin/login
   - Login with: `admin@ayachiprod.com` + your password
   - ✅ Should redirect to dashboard

3. **Test Dashboard:**
   - ✅ Should see statistics
   - ✅ Should see "Create Gallery" button

4. **Test Create Gallery:**
   - Click "Create Gallery"
   - Fill in form
   - ✅ Should create successfully

---

### Step 6: Deploy to Vercel (20 minutes)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repo
   - Vercel will auto-detect settings

3. **Add Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add ALL variables from `api/.env`:
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_KEY`
     - `JWT_SECRET`
     - `CLIENT_TOKEN_EXPIRES_IN`
     - `R2_ACCOUNT_ID`
     - `R2_ACCESS_KEY_ID`
     - `R2_SECRET_ACCESS_KEY`
     - `R2_BUCKET_NAME`
     - `R2_CDN_URL`
     - `FRONTEND_URL`
   - Add ALL variables from `frontend/.env.local`:
     - `VITE_API_URL` (set to `https://api.ayachiprod.com`)
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

4. **Deploy:**
   - Click "Deploy"
   - ✅ Wait for deployment to complete

5. **Configure Domains:**
   - Go to Project Settings → Domains
   - Add: `ayachiprod.com`
   - Add: `www.ayachiprod.com`
   - Add: `api.ayachiprod.com` (for backend)

---

### Step 7: Configure Cloudflare DNS (10 minutes)

1. **Go to Cloudflare Dashboard:**
   - Select your domain
   - Go to DNS → Records

2. **Add DNS Records:**
   ```
   Type    Name    Content                    Proxy
   A       @       [Vercel IP]                ✅ Proxied
   A       www     [Vercel IP]                ✅ Proxied
   CNAME   api     [Vercel domain]            ✅ Proxied
   CNAME   cdn     [R2 bucket domain]         ✅ Proxied
   ```

3. **Wait for DNS Propagation:**
   - Usually takes 5-15 minutes
   - Check with: `ping ayachiprod.com`

---

## ✅ Final Checklist

- [ ] Environment files created (`.env` and `.env.local`)
- [ ] Database migration run successfully
- [ ] Admin user created and linked
- [ ] Dependencies installed (backend + frontend)
- [ ] Local testing successful
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added to Vercel
- [ ] Deployment successful
- [ ] DNS configured
- [ ] Production site working

---

## 🎯 Current Status

**You are here:** Ready to start Step 1 (Create Environment Files)

**Next action:** Create `api/.env` and `frontend/.env.local` from templates

---

## 🆘 Need Help?

- **Environment setup:** See `QUICK_ENV_SETUP.md`
- **Database setup:** See `SUPABASE_SETUP_GUIDE.md`
- **Deployment:** See `HOSTING_GUIDE.md`
- **Troubleshooting:** Check error messages and documentation

---

**Ready to start?** Begin with Step 1 above! 🚀
