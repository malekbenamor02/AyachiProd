# Cloudflare R2 Credentials Guide
## Where to Find Each Credential

---

## 📍 Quick Answer

**Your R2 endpoint URL format:**
```
https://[ACCOUNT_ID].r2.cloudflarestorage.com
```

**Example:**
```
https://1bd5294030ca17928abb71102d7af9f6.r2.cloudflarestorage.com
```

⚠️ **Note:** The bucket name (`ayachiprod-gallery`) is **NOT** part of the endpoint URL. It's used separately in the S3 commands.

---

## 🔑 Credentials Breakdown

### 1. R2_ACCOUNT_ID

**Where to find:**
1. Go to **Cloudflare Dashboard**
2. Click **R2** in the left sidebar
3. Look at the **top right corner** of the R2 page
4. You'll see: **"Account ID: `1bd5294030ca17928abb71102d7af9f6`"**
5. This is a **32-character hexadecimal string**

**Example:**
```
R2_ACCOUNT_ID=1bd5294030ca17928abb71102d7af9f6
```

**Used for:**
- Building the R2 endpoint URL
- S3 client configuration

---

### 2. R2_ACCESS_KEY_ID

**Where to find:**
1. Go to **Cloudflare Dashboard → R2**
2. Click **"Manage R2 API Tokens"** (top right button)
3. Or go to: **R2 → Manage R2 API Tokens**
4. Click **"Create API Token"**
5. Fill in:
   - **Token Name:** `ayachiprod-api` (or any name)
   - **Permissions:** Select **"Object Read & Write"**
   - **TTL:** Leave empty (no expiration) or set date
6. Click **"Create API Token"**
7. ⚠️ **Copy the Access Key ID immediately** (you can't see it again!)

**Example:**
```
R2_ACCESS_KEY_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Used for:**
- S3 client authentication
- API requests to R2

---

### 3. R2_SECRET_ACCESS_KEY

**Where to find:**
1. Same process as above (when creating API token)
2. After clicking **"Create API Token"**
3. ⚠️ **Copy the Secret Access Key immediately** (you can't see it again!)
4. This is a **long string** (usually 40+ characters)

**Example:**
```
R2_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY1234567890abcdef
```

**Used for:**
- S3 client authentication
- Signing API requests

---

### 4. R2_BUCKET_NAME

**Where to find:**
1. Go to **Cloudflare Dashboard → R2**
2. Look at your bucket list
3. The name you gave your bucket when creating it
4. In our case: `ayachiprod-gallery`

**Example:**
```
R2_BUCKET_NAME=ayachiprod-gallery
```

**Used for:**
- S3 commands (PutObject, GetObject, DeleteObject)
- File path generation

---

### 5. R2_CDN_URL

**Option 1: Custom Domain (Recommended)**
- If you set up `cdn.ayachiprod.com` as custom domain:
  ```
  R2_CDN_URL=https://cdn.ayachiprod.com
  ```

**Option 2: R2 Public URL**
- If you didn't set up custom domain:
  ```
  R2_CDN_URL=https://1bd5294030ca17928abb71102d7af9f6.r2.cloudflarestorage.com/ayachiprod-gallery
  ```
  ⚠️ **Note:** This requires making the bucket public (not recommended for production)

**Where to find:**
1. **Custom Domain:** Go to R2 → Your Bucket → Settings → Custom Domains
2. **Public URL:** Format is `https://[ACCOUNT_ID].r2.cloudflarestorage.com/[BUCKET_NAME]`

---

## 📝 Complete .env Example

```env
# Cloudflare R2
R2_ACCOUNT_ID=1bd5294030ca17928abb71102d7af9f6
R2_ACCESS_KEY_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
R2_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY1234567890abcdef
R2_BUCKET_NAME=ayachiprod-gallery
R2_CDN_URL=https://cdn.ayachiprod.com
```

---

## ✅ Verification Steps

1. **Check Account ID:**
   - Go to R2 dashboard
   - Should see it in top right corner

2. **Check API Token:**
   - Go to R2 → Manage R2 API Tokens
   - Should see your token listed (but not the secret)

3. **Test Connection:**
   - Use the credentials in your `.env` file
   - Try uploading a test file
   - Check if it appears in your R2 bucket

---

## 🔒 Security Notes

1. ⚠️ **Never commit `.env` file to Git**
2. ⚠️ **Never share credentials publicly**
3. ⚠️ **Rotate keys periodically** (delete old, create new)
4. ⚠️ **Use least privilege** (only "Object Read & Write" for this use case)
5. ⚠️ **Store secrets securely** (use password manager)

---

## 🆘 Troubleshooting

### "Invalid credentials" error:
- Check if Access Key ID and Secret Access Key are correct
- Make sure no extra spaces or quotes
- Verify token has correct permissions

### "Bucket not found" error:
- Check bucket name spelling
- Verify bucket exists in R2 dashboard
- Check if bucket name matches exactly

### "Access denied" error:
- Verify API token has "Object Read & Write" permissions
- Check if bucket is accessible
- Verify Account ID is correct

---

**Last Updated:** 2026
