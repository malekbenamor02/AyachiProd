# Setup Instructions
## Aziz Ayachi Gallery Management System

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase account
- Cloudflare account (R2 + domain)

---

## Step 1: Clone & Install

```bash
# Navigate to project directory
cd "C:\Users\ASUS\Desktop\Aziz Ayachi"

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../api
npm install
```

---

## Step 2: Set Up Supabase

1. **Create Supabase Project:**
   - Go to https://supabase.com
   - Create new project
   - Note your project URL and service key

2. **Run Database Migrations:**
   - Go to SQL Editor in Supabase dashboard
   - Run the SQL from `DATABASE_SCHEMA.md`:
     - Create `users` table
     - Create `galleries` table
     - Create `media_files` table
     - Create `gallery_access_tokens` table
     - Create indexes
     - Enable RLS (Row Level Security)

3. **Create First Admin User:**
   - Go to Authentication → Users
   - Create user with email/password
   - Or use SQL:
   ```sql
   INSERT INTO users (email, full_name, role)
   VALUES ('admin@ayachiprod.com', 'Aziz Ayachi', 'admin');
   ```

---

## Step 3: Set Up Cloudflare R2

1. **Create R2 Bucket:**
   - Go to Cloudflare Dashboard → R2
   - Click "Create bucket"
   - Name: `ayachiprod-gallery`
   - Click "Create bucket"
   - ✅ **Bucket name:** `ayachiprod-gallery` (save this)

2. **Get Account ID:**
   - In Cloudflare Dashboard, go to **R2** (left sidebar)
   - Look at the top right corner or in the R2 overview page
   - You'll see: **Account ID: `1bd5294030ca17928abb71102d7af9f6`** (example)
   - ✅ **Copy this Account ID** - this is your `R2_ACCOUNT_ID`

3. **Create API Token (Access Keys):**
   - In R2 dashboard, click **"Manage R2 API Tokens"** (top right)
   - Or go to: **R2 → Manage R2 API Tokens**
   - Click **"Create API Token"**
   - **Token Name:** `ayachiprod-api` (or any name)
   - **Permissions:** Select **"Object Read & Write"**
   - **TTL:** Leave empty (no expiration) or set expiration date
   - Click **"Create API Token"**
   - ⚠️ **IMPORTANT:** Copy both values immediately (you can't see them again!)
     - ✅ **Access Key ID:** (starts with something like `a1b2c3d4...`)
     - ✅ **Secret Access Key:** (long string, save securely)
   - Save these in a secure place - you'll need them for `.env`

4. **Configure Custom Domain (Optional but Recommended):**
   - Go to R2 → Your Bucket (`ayachiprod-gallery`) → **Settings**
   - Scroll to **"Custom Domains"** section
   - Click **"Connect Domain"**
   - Enter: `cdn.ayachiprod.com`
   - Cloudflare will automatically:
     - ✅ Create DNS record
     - ✅ Configure SSL certificate
     - ✅ Enable CDN caching
   - ✅ **CDN URL:** `https://cdn.ayachiprod.com` (save this)

---

## Step 4: Environment Variables

### Frontend (.env.local)

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:3001
```

### Backend (.env)

Create `api/.env`:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CLIENT_TOKEN_EXPIRES_IN=365d

# Cloudflare R2
# Get Account ID from: R2 Dashboard → Top right corner or R2 overview
R2_ACCOUNT_ID=1bd5294030ca17928abb71102d7af9f6

# Get from: R2 → Manage R2 API Tokens → Create API Token
R2_ACCESS_KEY_ID=your-access-key-id-from-cloudflare
R2_SECRET_ACCESS_KEY=your-secret-access-key-from-cloudflare

# Bucket name (what you named your bucket)
R2_BUCKET_NAME=ayachiprod-gallery

# CDN URL (if you set up custom domain, otherwise use R2 public URL)
# Option 1: Custom domain (recommended): https://cdn.ayachiprod.com
# Option 2: R2 public URL: https://1bd5294030ca17928abb71102d7af9f6.r2.cloudflarestorage.com/ayachiprod-gallery
R2_CDN_URL=https://cdn.ayachiprod.com

# Frontend
FRONTEND_URL=http://localhost:3000
```

---

## Step 5: Run Development Servers

### Terminal 1 - Frontend:
```bash
cd frontend
npm run dev
```
Runs on: http://localhost:3000

### Terminal 2 - Backend (Vercel Dev):
```bash
cd api
npm install -g vercel
vercel dev
```
Runs on: http://localhost:3001

**Note:** For local development, you may need to use a different approach since Vercel serverless functions work best when deployed. Consider using Express.js for local development.

---

## Step 6: Test the Application

1. **Portfolio Website:**
   - Open http://localhost:3000
   - Should see your portfolio

2. **Admin Login:**
   - Go to http://localhost:3000/admin/login
   - Login with your Supabase admin credentials

3. **Admin Dashboard:**
   - After login, you'll see the dashboard
   - Create a gallery
   - Upload files
   - Generate QR code

4. **Client Gallery:**
   - Use the QR code or gallery URL
   - Enter password
   - View gallery

---

## Troubleshooting

### Frontend won't start:
- Check Node.js version: `node --version` (should be 18+)
- Delete `node_modules` and `package-lock.json`, then `npm install`

### Backend API errors:
- Check environment variables are set
- Verify Supabase credentials
- Check R2 credentials

### Database errors:
- Verify migrations ran successfully
- Check RLS policies are set correctly
- Verify user has correct permissions

### File upload fails:
- Check R2 credentials
- Verify bucket name matches
- Check file size limits

---

## Production Deployment

### Frontend (Vercel):
1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables
4. Deploy

### Backend (Vercel):
1. Same repo, Vercel auto-detects API routes
2. Add environment variables
3. Deploy

### Database:
- Supabase handles production automatically
- No additional setup needed

### Storage:
- R2 is already production-ready
- Configure custom domain for CDN

---

## Next Steps After Setup

1. ✅ Test admin login
2. ✅ Create first gallery
3. ✅ Upload test files
4. ✅ Generate QR code
5. ✅ Test client access
6. ✅ Customize branding
7. ✅ Add your content

---

**Last Updated:** 2026
