# Domain Configuration
## ayachiprod.com

---

## Domain Information

**Primary Domain:** `ayachiprod.com`  
**Owner:** Aziz Ayachi  
**Hosting:** Cloudflare

---

## Domain Structure

```
ayachiprod.com              → Frontend (Vercel)
www.ayachiprod.com           → Frontend (Vercel) - redirects to ayachiprod.com
api.ayachiprod.com           → Backend API (Vercel Serverless Functions)
cdn.ayachiprod.com           → Media Files (Cloudflare R2 + CDN)
```

---

## Supabase Configuration

**Project URL:** `https://muhxrtqxhxldfasyffhs.supabase.co`

**Credentials:**
- Service Role Key: (stored in `.env` file)
- Anon Key: (stored in `.env` file)

**Note:** Never commit these keys to Git. Store them in environment variables only.

---

## Environment Variables

### Backend (api/.env)
```env
SUPABASE_URL=https://muhxrtqxhxldfasyffhs.supabase.co
SUPABASE_SERVICE_KEY=[your-service-key]
JWT_SECRET=[your-secret]
R2_BUCKET_NAME=ayachiprod-gallery
R2_CDN_URL=https://cdn.ayachiprod.com
FRONTEND_URL=https://ayachiprod.com
```

### Frontend (frontend/.env.local)
```env
VITE_API_URL=https://api.ayachiprod.com
VITE_SUPABASE_URL=https://muhxrtqxhxldfasyffhs.supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

---

## DNS Configuration (Cloudflare)

### Records to Add:

```
Type    Name    Content                    Proxy
A       @       [Vercel IP]                ✅ Proxied
A       www     [Vercel IP]                ✅ Proxied
CNAME   api     [Vercel domain]            ✅ Proxied
CNAME   cdn     [R2 bucket domain]         ✅ Proxied
```

---

## Cloudflare R2 Configuration

**Bucket Name:** `ayachiprod-gallery`

**Custom Domain:** `cdn.ayachiprod.com`

**CORS Configuration:**
```json
[
  {
    "AllowedOrigins": [
      "https://ayachiprod.com",
      "https://www.ayachiprod.com"
    ],
    "AllowedMethods": ["GET", "HEAD", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## Vercel Configuration

### Frontend Project:
- Domain: `ayachiprod.com`, `www.ayachiprod.com`
- Framework: Vite (React)

### Backend Project:
- Domain: `api.ayachiprod.com`
- Framework: Serverless Functions

---

## Email Configuration

**Contact Email:** `hello@ayachiprod.com`

Update email addresses in:
- Footer component
- SEO meta tags
- Contact forms
- Database records

---

## Social Media Links

Update social media links to use `ayachiprod` handle:
- Instagram: `@ayachiprod`
- LinkedIn: `in/ayachiprod`
- Twitter: `@ayachiprod`
- Behance: `ayachiprod`

---

## Search & Replace Checklist

All instances of `azizayachi.com` have been updated to `ayachiprod.com` in:
- ✅ Frontend components
- ✅ API endpoints
- ✅ Documentation files
- ✅ Environment examples
- ✅ SEO meta tags
- ✅ Structured data

---

**Last Updated:** 2026  
**Domain:** ayachiprod.com
