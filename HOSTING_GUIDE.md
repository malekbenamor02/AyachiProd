# Hosting & Infrastructure Guide
## Aziz Ayachi Gallery Management System

---

## Architecture Overview

### ✅ Correct Architecture (Already Implemented)

```
┌─────────────────┐
│   Frontend      │  → Hosted on Vercel/Netlify
│   (React App)   │
└─────────────────┘
         │
         │ API Calls
         ▼
┌─────────────────┐
│   Backend API   │  → Hosted on Railway/Render
│   (Node.js)     │
└─────────────────┘
         │
         ├──→ Supabase (PostgreSQL) - Metadata ONLY
         │    • Gallery info
         │    • File metadata (names, sizes, URLs)
         │    • User data
         │    • NO images/videos stored here
         │
         └──→ Cloudflare R2 - File Storage
              • Actual image/video files
              • Large files (up to 5GB)
              • Direct upload from backend
              │
              └──→ Cloudflare CDN - Content Delivery
                   • Fast global delivery
                   • Cached content
                   • Your custom domain
```

### ❌ What We DON'T Do
- **NO** storing images/videos in database (PostgreSQL)
- **NO** storing files on backend server
- **NO** storing files on frontend

### ✅ What We DO
- **Database (Supabase):** Only metadata (file names, URLs, sizes, gallery info)
- **Cloudflare R2:** Actual file storage (images/videos)
- **Cloudflare CDN:** Fast delivery via your custom domain

---

## Hosting Strategy

### 1. Frontend Hosting (React App)

**Recommended: Vercel** (Best for React)

**Why Vercel:**
- ✅ Optimized for React/Next.js
- ✅ Automatic deployments from Git
- ✅ Free SSL certificates
- ✅ Global CDN included
- ✅ Easy custom domain setup
- ✅ Free tier available

**Alternative: Netlify**
- Similar features to Vercel
- Good for React apps
- Free tier available

**Setup:**
```bash
# Connect your GitHub repo
# Vercel auto-detects React
# Add environment variables
# Deploy!
```

**Domain Setup:**
- Add your Cloudflare domain in Vercel dashboard
- Point DNS records to Vercel (or use Cloudflare proxy)

---

### 2. Backend API Hosting (Node.js)

**Recommended: Vercel** (Same as Frontend)

**Why Vercel for Backend:**
- ✅ Same platform as frontend (easier management)
- ✅ Serverless functions (auto-scaling)
- ✅ Automatic deployments from Git
- ✅ Free tier available
- ✅ Global edge network
- ✅ Easy custom domain setup
- ✅ Built-in API routes support

**Note:** Vercel works best with serverless functions. We'll structure the backend as Vercel serverless functions.

**Setup:**
```bash
# Create api/ directory in your project
# Use Vercel's serverless function format
# Deploy same repo as frontend
```

**Domain Setup:**
- Add subdomain: `api.azizayachi.com`
- Configure in Vercel dashboard

---

### 3. Database Hosting

**Supabase (Already Chosen)**
- ✅ Managed PostgreSQL
- ✅ Built-in authentication
- ✅ Free tier: 500MB database
- ✅ Auto-scaling
- ✅ Backups included

**No additional hosting needed** - Supabase handles everything.

---

### 4. File Storage & CDN

**Cloudflare R2 + CDN (Already Chosen)**

**R2 Storage:**
- ✅ Object storage (like S3)
- ✅ Pay for storage only (no egress fees!)
- ✅ S3-compatible API
- ✅ Perfect for large files

**Cloudflare CDN:**
- ✅ Global content delivery (300+ edge locations worldwide)
- ✅ Your custom domain
- ✅ Automatic caching
- ✅ DDoS protection included
- ✅ **FREE** with your Cloudflare domain
- ✅ Fast global delivery (<50ms latency from edge)
- ✅ Free SSL certificates
- ✅ HTTP/2 and HTTP/3 support

**Setup:**
1. Create R2 bucket in Cloudflare dashboard
2. Upload files via backend API
3. Configure custom domain for CDN (`cdn.azizayachi.com`)
4. Enable proxy (orange cloud) for CDN caching
5. Files accessible via: `https://cdn.azizayachi.com/...`

**See `CLOUDFLARE_CDN_SETUP.md` for detailed CDN configuration.**

---

## Complete Hosting Setup

### Option A: Recommended Setup (Best Performance)

```
Domain: ayachiprod.com (from Cloudflare)

Frontend:  Vercel
  → www.ayachiprod.com
  → ayachiprod.com (redirect)

Backend:   Vercel (Serverless Functions)
  → api.ayachiprod.com

Database:  Supabase
  → Managed by Supabase

Storage:   Cloudflare R2
  → cdn.ayachiprod.com
  → media.ayachiprod.com (optional)
```

### Option B: Budget Setup (Free Tier)

```
Frontend:  Vercel (Free)
Backend:   Vercel (Free tier - serverless functions)
Database:  Supabase (Free tier)
Storage:   Cloudflare R2 (Pay per GB stored)
```

---

## Step-by-Step Hosting Setup

### Step 1: Frontend on Vercel

1. **Create Vercel Account:**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Deploy Frontend:**
   ```bash
   # In your frontend directory
   npm run build
   
   # Or connect GitHub repo in Vercel dashboard
   # Vercel will auto-detect and deploy
   ```

3. **Add Environment Variables in Vercel:**
   ```
   REACT_APP_API_URL=https://api.azizayachi.com
   REACT_APP_SUPABASE_URL=your-supabase-url
   REACT_APP_SUPABASE_ANON_KEY=your-key
   ```

4. **Add Custom Domain:**
   - In Vercel dashboard → Settings → Domains
   - Add: `www.ayachiprod.com`
   - Add: `ayachiprod.com` (redirect to www)

---

### Step 2: Backend on Vercel (Serverless Functions)

1. **Structure Backend as Serverless Functions:**
   
   Create `api/` directory in your project root:
   ```
   project-root/
   ├── frontend/          # React app
   ├── api/               # Serverless functions
   │   ├── auth/
   │   ├── galleries/
   │   ├── upload/
   │   └── ...
   └── vercel.json        # Vercel configuration
   ```

2. **Create `vercel.json` Configuration:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "frontend/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "build"
         }
       },
       {
         "src": "api/**/*.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/api/$1"
       },
       {
         "src": "/(.*)",
         "dest": "/frontend/$1"
       }
     ]
   }
   ```

3. **Configure Environment Variables in Vercel:**
   - Go to Vercel dashboard → Project Settings → Environment Variables
   - Add all backend variables:
   ```
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_KEY=your-service-key
   JWT_SECRET=your-secret
   R2_ACCOUNT_ID=your-r2-account-id
   R2_ACCESS_KEY_ID=your-r2-access-key
   R2_SECRET_ACCESS_KEY=your-r2-secret
   R2_BUCKET_NAME=aziz-ayachi-gallery
   R2_CDN_URL=https://cdn.azizayachi.com
   FRONTEND_URL=https://azizayachi.com
   ```

4. **Add Custom Domain for API:**
   - In Vercel dashboard → Settings → Domains
   - Add: `api.azizayachi.com`
   - Vercel provides DNS records

---

### Step 3: Cloudflare Domain Configuration

Since you bought the domain from Cloudflare:

1. **DNS Records Setup:**

   In Cloudflare DNS dashboard, add:

   ```
   Type    Name    Content                    Proxy
   A       www     [Vercel IP]                ✅ Proxied
   CNAME   api     [Vercel domain]            ✅ Proxied
   CNAME   cdn     [R2 bucket domain]         ✅ Proxied
   ```
   
   **For ayachiprod.com:**
   - www.ayachiprod.com → Frontend
   - api.ayachiprod.com → Backend API
   - cdn.ayachiprod.com → Media files

2. **SSL/TLS Settings:**
   - Set to "Full" or "Full (strict)"
   - Cloudflare auto-generates SSL certificates

3. **R2 Custom Domain:**
   - Go to R2 → Your Bucket → Settings
   - Add custom domain: `cdn.azizayachi.com`
   - Cloudflare will configure DNS automatically

---

### Step 4: Supabase Setup

1. **Create Supabase Project:**
   - Go to https://supabase.com
   - Create new project
   - Note: Project URL and API keys

2. **Run Migrations:**
   - Use SQL Editor in Supabase dashboard
   - Run scripts from `database/migrations/`

3. **No domain needed** - Supabase provides URL:
   - `https://your-project.supabase.co`

---

## Complete Domain Structure

```
azizayachi.com              → Frontend (Vercel)
www.azizayachi.com           → Frontend (Vercel)
api.azizayachi.com           → Backend API (Railway)
cdn.azizayachi.com           → Media files (Cloudflare R2/CDN)
```

---

## Cost Estimation

### Free Tier (Starting Out)
- **Vercel:** Free (hobby plan) - includes frontend + backend
- **Supabase:** Free tier (500MB database)
- **Cloudflare R2:** ~$0.015 per GB stored/month
- **Cloudflare CDN:** Free (included with domain)

**Estimated Monthly Cost:** $0-5 (depending on storage)

### Production (Growing)
- **Vercel:** $20/month (Pro plan) - includes frontend + backend
- **Supabase:** $25/month (Pro plan)
- **Cloudflare R2:** ~$0.015/GB stored + $0.01/GB egress
- **Cloudflare CDN:** Free

**Estimated Monthly Cost:** $45-80 (depending on traffic/storage)

**Note:** Vercel serverless functions have generous free tier (100GB-hours/month)

---

## File Flow Example

### Upload Flow:
```
1. Admin uploads file via Frontend
   ↓
2. Frontend sends to Backend API (api.azizayachi.com)
   ↓
3. Backend uploads to Cloudflare R2
   ↓
4. Backend saves metadata to Supabase
   ↓
5. Backend returns file URL (cdn.azizayachi.com/...)
```

### View Flow:
```
1. Client accesses gallery
   ↓
2. Frontend requests files from Backend API
   ↓
3. Backend queries Supabase for metadata
   ↓
4. Backend returns file URLs (cdn.azizayachi.com/...)
   ↓
5. Frontend displays images from CDN
   ↓
6. CDN serves files globally (fast!)
```

---

## Security Considerations

1. **CORS Configuration:**
   - Backend: Allow only `azizayachi.com` and `www.azizayachi.com`
   - R2: Configure CORS for your domains

2. **Environment Variables:**
   - Never commit `.env` files
   - Use hosting platform's environment variable management
   - Rotate secrets regularly

3. **SSL/TLS:**
   - All domains use HTTPS
   - Cloudflare provides free SSL
   - Vercel/Railway provide free SSL

4. **Rate Limiting:**
   - Implement in backend
   - Cloudflare provides DDoS protection

---

## Monitoring & Analytics

1. **Vercel Analytics:**
   - Built-in analytics for frontend
   - Track page views, performance

2. **Railway Metrics:**
   - Monitor backend performance
   - Track API response times

3. **Cloudflare Analytics:**
   - CDN performance
   - Bandwidth usage
   - Cache hit rates

4. **Supabase Dashboard:**
   - Database performance
   - Query analytics

---

## Backup Strategy

1. **Database:**
   - Supabase handles automatic backups
   - Daily backups included

2. **Files (R2):**
   - Cloudflare R2 has built-in redundancy
   - Consider versioning for critical files

3. **Code:**
   - Git repository (GitHub/GitLab)
   - Multiple deployment environments

---

## Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] Supabase project created and migrations run
- [ ] Cloudflare R2 bucket created
- [ ] Custom domains configured
- [ ] SSL certificates active
- [ ] Environment variables set
- [ ] CORS configured
- [ ] DNS records pointing correctly
- [ ] Test file upload
- [ ] Test file access via CDN
- [ ] Monitor performance

---

## Quick Reference

**Frontend URL:** `https://azizayachi.com`  
**Backend API:** `https://api.azizayachi.com`  
**CDN/Media:** `https://cdn.azizayachi.com`  
**Database:** Managed by Supabase

---

**Last Updated:** 2026  
**Version:** 1.0
