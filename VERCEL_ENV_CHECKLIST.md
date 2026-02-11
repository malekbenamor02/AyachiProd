# Vercel deployment – why data/images don't load

## 1. Frontend API URL (fixed in code)

The app was defaulting to `http://localhost:3001` when `VITE_API_URL` was not set, so in production all API calls failed.

**Fix applied:** In production, the frontend now uses the **same origin** (your Vercel domain) for API calls when `VITE_API_URL` is not set. Redeploy so the new build is used.

You do **not** need to set `VITE_API_URL` in Vercel for the frontend unless your API is on a different domain.

---

## 2. API environment variables (Vercel → Project → Settings → Environment Variables)

Add these for **Production** (and Preview if you use it). Values must match your `api/.env` (never commit real values).

| Variable | Required for |
|----------|----------------|
| `SUPABASE_URL` | Database (sections, showcase, galleries, bookings) |
| `SUPABASE_SERVICE_KEY` | Database (service role, not anon key) |
| `R2_ACCOUNT_ID` | R2 uploads |
| `R2_ACCESS_KEY_ID` | R2 uploads |
| `R2_SECRET_ACCESS_KEY` | R2 uploads |
| `R2_BUCKET_NAME` | R2 uploads |
| `R2_CDN_URL` | **Image URLs** – e.g. `https://your-r2-public-domain.com` or R2 public URL |
| `JWT_SECRET` or your auth secret | Admin login |

If **data** still doesn’t load: check `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`.  
If **images** don’t load: check `R2_CDN_URL`. Image URLs in the DB are built from this when uploading; they must be publicly reachable (no CORS blocking from your frontend domain if needed).

---

## 3. Redeploy

After changing env vars or merging the frontend fix, trigger a new deployment (e.g. push to `main` or “Redeploy” in Vercel).
