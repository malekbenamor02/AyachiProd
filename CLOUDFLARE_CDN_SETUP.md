# Cloudflare CDN Setup Guide
## Aziz Ayachi Gallery Management System

---

## Overview

Since you own a domain from Cloudflare and are using Cloudflare R2 for storage, you can leverage Cloudflare's CDN for:
1. **Frontend/Backend** - Via Cloudflare proxy (free)
2. **Media Files** - Via R2 custom domain with CDN (free)

---

## CDN Architecture

```
┌─────────────────────────────────────┐
│     Cloudflare CDN (Global Edge)    │
│  • 300+ data centers worldwide      │
│  • Automatic caching                │
│  • DDoS protection                  │
│  • Free SSL certificates            │
└─────────────────────────────────────┘
         │
         ├──→ Frontend (azizayachi.com)
         │    • Cached static assets
         │    • Fast page loads
         │
         ├──→ Backend API (api.azizayachi.com)
         │    • Cached API responses (if configured)
         │    • Edge caching
         │
         └──→ Media Files (cdn.azizayachi.com)
              • Images and videos
              • Global content delivery
              • Automatic caching
```

---

## Part 1: CDN for Frontend & Backend (Vercel)

### Setup Steps

1. **In Cloudflare Dashboard:**

   - Go to your domain → DNS
   - Add DNS records:

   ```
   Type    Name    Content                    Proxy Status
   A       @       [Vercel IP]                ✅ Proxied (Orange Cloud)
   A       www     [Vercel IP]                ✅ Proxied (Orange Cloud)
   CNAME   api     [Vercel domain]            ✅ Proxied (Orange Cloud)
   ```

2. **Enable Proxy (Orange Cloud):**
   - The **orange cloud** icon means Cloudflare is proxying traffic
   - This enables:
     - ✅ DDoS protection
     - ✅ SSL/TLS encryption
     - ✅ CDN caching
     - ✅ Global edge network

3. **SSL/TLS Settings:**
   - Go to SSL/TLS → Overview
   - Set to: **Full (strict)**
   - Cloudflare will handle SSL automatically

4. **Caching Rules (Optional):**
   - Go to Rules → Page Rules
   - Create rule for static assets:
     ```
     URL Pattern: azizayachi.com/static/*
     Settings:
     - Cache Level: Cache Everything
     - Edge Cache TTL: 1 month
     ```

---

## Part 2: CDN for Media Files (R2 + Custom Domain)

### Setup Steps

1. **Create R2 Bucket:**
   - Go to Cloudflare Dashboard → R2
   - Create bucket: `aziz-ayachi-gallery`
   - Note the bucket name

2. **Configure R2 Custom Domain:**
   - Go to R2 → Your Bucket → Settings
   - Scroll to "Custom Domains"
   - Click "Connect Domain"
   - Enter: `cdn.azizayachi.com`
   - Cloudflare will automatically:
     - ✅ Create DNS record
     - ✅ Configure SSL certificate
     - ✅ Enable CDN caching
     - ✅ Set up edge network

3. **Verify DNS Record:**
   - Go to DNS settings
   - You should see:
     ```
     Type    Name    Content                    Proxy
     CNAME   cdn     [R2 bucket domain]         ✅ Proxied
     ```

4. **CDN Settings for R2:**
   - Go to R2 → Your Bucket → Settings → Custom Domain
   - Enable:
     - ✅ **CDN Caching** (enabled by default)
     - ✅ **Public Access** (for media files)

---

## Part 3: CDN Caching Configuration

### Cache Rules for Media Files

1. **Go to Rules → Page Rules:**
   - Create rule for media files:

   ```
   URL Pattern: cdn.ayachiprod.com/*
   
   Settings:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 year
   - Browser Cache TTL: 1 year
   - Cache by Device: Off
   - Cache Deception Armor: On
   ```

2. **Cache Rules for API (Optional):**
   ```
   URL Pattern: api.ayachiprod.com/api/statistics
   
   Settings:
   - Cache Level: Standard
   - Edge Cache TTL: 5 minutes
   ```
   
   **Note:** Don't cache POST/PUT/DELETE requests, only GET requests for static data.

---

## Part 4: Performance Optimization

### 1. Enable Auto Minify
- Go to Speed → Optimization
- Enable:
  - ✅ JavaScript
  - ✅ CSS
  - ✅ HTML

### 2. Enable Brotli Compression
- Go to Speed → Optimization
- Enable: **Brotli**

### 3. Enable HTTP/2 and HTTP/3
- Go to Network
- Enable:
  - ✅ HTTP/2
  - ✅ HTTP/3 (with QUIC)

### 4. Image Optimization (Optional)
- Go to Speed → Optimization → Image Resizing
- Enable: **Cloudflare Images** (paid feature) or
- Use: **Polish** (free, basic optimization)

---

## Part 5: Cache Purging

### When to Purge Cache

You may need to purge cache when:
- Uploading new files
- Updating existing files
- Changing frontend code

### How to Purge

1. **Via Cloudflare Dashboard:**
   - Go to Caching → Configuration → Purge Cache
   - Options:
     - Purge Everything
     - Purge by URL
     - Purge by Hostname
     - Purge by Tag

2. **Via API (Programmatic):**
   ```javascript
   // In your backend
   const purgeCache = async (urls) => {
     const response = await fetch(
       `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`,
       {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           files: urls, // Array of URLs to purge
         }),
       }
     );
     return response.json();
   };
   ```

3. **Automatic Purge on Upload:**
   - When uploading new files, automatically purge cache for that file
   - Or use cache tags for selective purging

---

## Part 6: CDN Headers Configuration

### Custom Headers for Media Files

1. **Go to Rules → Transform Rules → Modify Response Header:**

   Create rule:
   ```
   Rule Name: Media Cache Headers
   
   When:
   - URI Path starts with: /galleries/
   
   Then:
   - Set header: Cache-Control = public, max-age=31536000, immutable
   - Set header: X-Content-Type-Options = nosniff
   ```

### CORS Headers for R2

Configure in R2 bucket CORS settings:

```json
[
  {
    "AllowedOrigins": [
      "https://ayachiprod.com",
      "https://www.ayachiprod.com"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## Part 7: Monitoring CDN Performance

### Cloudflare Analytics

1. **Go to Analytics → Web Traffic:**
   - View:
     - Total requests
     - Bandwidth usage
     - Cache hit ratio
     - Response times

2. **Go to Analytics → Performance:**
   - View:
     - Time to First Byte (TTFB)
     - Cache hit rate
     - Bandwidth savings

3. **Set up Alerts:**
   - Go to Notifications
   - Set alerts for:
     - High bandwidth usage
     - Low cache hit ratio
     - DDoS attacks

---

## Complete DNS Configuration

### Final DNS Records

```
Type    Name    Content                    Proxy    Purpose
A       @       [Vercel IP]                ✅       Frontend (ayachiprod.com)
A       www     [Vercel IP]                ✅       Frontend (www.ayachiprod.com)
CNAME   api     [Vercel domain]            ✅       Backend API (api.ayachiprod.com)
CNAME   cdn     [R2 bucket domain]         ✅       Media CDN (cdn.ayachiprod.com)
```

All with **orange cloud** (proxied) enabled.

---

## CDN Benefits You Get

### Free Tier Includes:
- ✅ Global CDN (300+ locations)
- ✅ DDoS protection
- ✅ SSL/TLS certificates
- ✅ Basic caching
- ✅ HTTP/2 and HTTP/3
- ✅ Auto minify
- ✅ Brotli compression

### Performance Improvements:
- **Page Load Time:** 50-70% faster
- **Bandwidth Savings:** 60-80% reduction
- **Global Latency:** < 50ms from edge locations
- **Cache Hit Ratio:** 80-95% for static assets

---

## Cost

**CDN is FREE** with Cloudflare!

- ✅ No egress fees for CDN
- ✅ Unlimited bandwidth
- ✅ Free SSL certificates
- ✅ Free DDoS protection

**You only pay for:**
- R2 storage: ~$0.015/GB/month
- Domain: Already owned

---

## Testing CDN

### 1. Check CDN is Active:
```bash
curl -I https://cdn.ayachiprod.com/test-image.jpg

# Should see:
# CF-Cache-Status: HIT (or MISS)
# CF-Ray: [unique-id]
```

### 2. Check Cache Headers:
```bash
curl -I https://ayachiprod.com

# Should see:
# CF-Cache-Status: HIT
# Server: cloudflare
```

### 3. Test from Different Locations:
- Use tools like:
  - https://www.dotcom-tools.com/web-speed-test.aspx
  - https://www.webpagetest.org/

---

## Troubleshooting

### Issue: Files not caching
**Solution:**
- Check cache rules are configured
- Verify cache headers are set correctly
- Check if files are too large (>100MB may not cache)

### Issue: Stale content showing
**Solution:**
- Purge cache for specific URLs
- Check cache TTL settings
- Verify cache tags

### Issue: CORS errors
**Solution:**
- Configure CORS in R2 bucket settings
- Add proper headers in Transform Rules

---

## Best Practices

1. ✅ **Always use HTTPS** (Cloudflare provides free SSL)
2. ✅ **Enable proxy (orange cloud)** for all domains
3. ✅ **Set appropriate cache TTL** (long for static, short for dynamic)
4. ✅ **Purge cache** when updating files
5. ✅ **Monitor cache hit ratio** (aim for >80%)
6. ✅ **Use cache tags** for selective purging
7. ✅ **Enable compression** (Brotli/Gzip)

---

## Summary

With Cloudflare CDN, you get:
- ✅ **Free global CDN** for all your content
- ✅ **Fast delivery** from 300+ edge locations
- ✅ **Automatic caching** of static assets
- ✅ **DDoS protection** included
- ✅ **Free SSL** certificates
- ✅ **Easy setup** via Cloudflare dashboard

**No additional cost** - CDN is included with your Cloudflare domain!

---

**Last Updated:** 2026  
**Version:** 1.0
