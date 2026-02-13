# Vercel + R2: Upload Problems Summary

This document lists all known issues when uploading work images (homepage sections) with the current stack: **Vercel** (serverless API) + **Cloudflare R2** (S3-compatible storage). Use it to decide on a different hosting approach or fix.

---

## 1. Vercel request body size limit (~4.5 MB)

- **What:** Vercel serverless functions reject request bodies larger than about **4.5 MB** (Hobby) / **5 MB** (Pro). The platform returns **413 Content Too Large** before your code runs.
- **Impact:** You cannot upload a single file larger than ~4.5 MB by sending it through your API (e.g. `POST /api/.../upload` with the file in the body).
- **Current workaround:** Files ≤4 MB use a single multipart `POST` through the API. Larger files use **chunked multipart** (see below). For chunked uploads we avoid sending big bodies through Vercel by using presigned URLs so the browser sends parts **directly to R2**.

---

## 2. S3/R2 minimum part size (5 MB) for multipart uploads

- **What:** For multipart uploads, S3 and R2 require **every part (except the last) to be at least 5 MB**. Parts smaller than 5 MB cause `CompleteMultipartUpload` to fail (e.g. **InvalidPart** or similar), which your API returns as **500**.
- **Impact:** If you send parts through your API, each part must be ≥5 MB. But 5 MB is **above** Vercel’s body limit (~4.5 MB), so you cannot send 5 MB parts through Vercel.
- **Conclusion:** For files &gt; 5 MB you **must not** send part bodies through Vercel. The only viable approach is: **presigned URLs** so the browser uploads each part **directly to R2** (see below).

---

## 3. Presigned “single PUT” (whole file) from browser → R2: didn’t work

- **What:** We tried: API returns a presigned **PUT** URL for the whole file; browser uploads the file in one `PUT` to R2. No file goes through Vercel.
- **Result:** Upload reached 100% in the UI but **nothing appeared in R2 and nothing in the database**. So either:
  - The **PUT from the browser to R2 failed** (e.g. CORS, wrong host, or R2 not accepting browser PUTs on that endpoint), or
  - The **confirm** step (that writes the DB row) never ran or didn’t get the right data (we fixed body parsing later).
- **Likely cause:** The presigned URL points at the **R2 S3 API endpoint** (e.g. `https://<account>.r2.cloudflarestorage.com/...`). That host may not allow browser `PUT` from your frontend origin (CORS), or R2 may handle this endpoint differently for browser uploads.
- **Status:** We reverted to “all uploads through API” for small files and “chunked through API then presigned parts” for large files. So this “single presigned PUT” path is not used for work images anymore.

---

## 4. Chunked upload through API with 4 MB parts → upload-complete 500

- **What:** We implemented: init multipart → send each part as a **4 MB** `POST` to your API → API forwards part to R2 → then `upload-complete`.
- **Result:** **upload-complete** returned **500** repeatedly. Cause: R2/S3 require **≥5 MB per part** (except the last). With 4 MB parts, `CompleteMultipartUpload` fails.
- **Fix applied:** Part size was increased to **5 MB** and part bodies are **no longer sent through the API**. Instead we use **presigned part URLs**: API returns a URL per part, browser `PUT`s that part directly to R2. So we satisfy both: 5 MB minimum part size and no 5 MB body through Vercel.

---

## 5. Presigned “part” URLs (browser PUT per part) – may still hit R2/CORS

- **What:** For large files we now do: **upload-init** → for each part, **upload-part-url** (API returns presigned URL) → browser **PUT** part to that URL → **upload-complete** with part ETags.
- **Risk:** Same as in (3): the presigned URL is for the **R2 S3 API endpoint**. If that endpoint does not allow **PUT** from your frontend origin (CORS), the browser will block the request and the part never reaches R2. Then you get only some images uploaded (e.g. the ones that were small and used the “single request through API” path) and the rest fail.
- **What to check:** In Cloudflare R2, bucket **CORS** must allow:
  - Your frontend origins (e.g. `https://www.ayachiprod.com`, `https://ayachiprod.com`).
  - Method **PUT**.
  - Header **Content-Type** (and any others the browser sends).
- **If CORS is correct and it still fails:** The R2 S3 API host might not support browser uploads the same way; you may need a different strategy (e.g. backend that runs elsewhere with higher limits, or a different storage upload path).

---

## 6. Orphaned “Ongoing multipart uploads” in R2

- **What:** If **upload-init** runs (multipart upload is created in R2) but a later step fails (e.g. a part fails or **upload-complete** is never called), R2 keeps the multipart upload as **“Ongoing multipart upload”**. It is not a real object and is not listed as a normal file.
- **Impact:** R2 dashboard shows many “Ongoing multipart upload” entries; they are useless and can be aborted to free space and avoid confusion.
- **Mitigation:** We added **upload-abort**: when a chunked upload fails, the frontend calls abort so the multipart is cleaned up in R2. That only works when the failure is in our code path and we still have `uploadId` and `filePath`; network or CORS failures before that may still leave orphans.
- **Manual fix:** In Cloudflare R2 → bucket → multipart / ongoing uploads → abort the listed uploads.

---

## 7. API request body parsing (upload-url / confirm / upload-complete)

- **What:** The Vercel/Express router was treating **any** URL containing `/upload` as a “multipart upload” and passing the **raw** request. So **upload-url** and **confirm** (and **upload-complete**) were receiving the raw request instead of parsed JSON. Their handlers expect `req.body` (e.g. `filename`, `filePath`, `uploadId`, `parts`).
- **Result:** Body was missing or wrong → “Missing filePath” or invalid data → no DB row, or **upload-complete** 500 / bad behavior.
- **Fix applied:** Only the **actual** multipart upload route (e.g. `POST .../work-images/upload` with form-data body) gets the raw `req`. All other work-images routes (**upload-url**, **upload-part-url**, **upload-part**, **upload-complete**, **upload-abort**) get the normal parsed request so JSON body is available.

---

## 8. Response shape (upload-init / upload-part)

- **What:** The API returns `{ success: true, data: { ... } }`. The frontend was reading `uploadId` / `filePath` / `etag` from the top level instead of from `data`.
- **Result:** Chunked uploads got `undefined` for `uploadId` or `filePath` or part `etag` → wrong or failed uploads, or **upload-complete** with missing/invalid parts → 500.
- **Fix applied:** Frontend now uses `res.data.data` (or equivalent) for upload-init and for part responses so chunked flow and **upload-complete** get correct values.

---

## Summary table

| # | Problem | Cause | Status / direction |
|---|--------|--------|---------------------|
| 1 | 413 on large uploads | Vercel body limit ~4.5 MB | Avoid sending large bodies through Vercel; use presigned URLs or chunked + presigned parts. |
| 2 | upload-complete 500 (InvalidPart) | R2/S3 minimum part size 5 MB | Use 5 MB parts and do not send part body through Vercel. |
| 3 | Single presigned PUT: nothing in R2/DB | Browser PUT to R2 likely failed (CORS/endpoint) or confirm not reached | Not used anymore; chunked + presigned parts used for large files. |
| 4 | Chunked with 4 MB parts → 500 | Parts &lt; 5 MB | Switched to 5 MB parts and presigned part URLs. |
| 5 | Only 3 images upload, rest don’t | Likely CORS or R2 endpoint not accepting browser PUT for parts | Ensure R2 CORS allows PUT from your domain; if it still fails, consider non-Vercel API or different upload path. |
| 6 | “Ongoing multipart upload” in R2 | Init succeeded, complete/parts failed | upload-abort on failure; manually abort in R2 when needed. |
| 7 | upload-complete/confirm wrong body | Raw req passed for all “upload” URLs | Only real multipart route gets raw req; others get parsed body. |
| 8 | init/part response wrong in frontend | Reading `data` from wrong level | Frontend uses `res.data.data` for API payload. |

---

## Directions you can take

1. **Keep Vercel + R2**
   - Confirm R2 bucket CORS allows **PUT** from your frontend origin for the **same host** the presigned part URLs use (R2 S3 API). Test one large file and check browser Network tab for blocked requests.
   - If CORS is correct and it still fails, consider moving the **upload API** (at least the routes that do init/part-url/complete/abort) to a host with no 4.5 MB limit and/or better control (e.g. Railway, Render, Fly.io, or a small VPS). Then only “small file upload” or non-upload APIs stay on Vercel.

2. **Different hosting for API**
   - Run the Node API on a provider that allows larger request bodies (e.g. 10–50 MB) and/or longer timeouts. Then you can send 5 MB parts through your API to R2 and avoid browser → R2 CORS entirely for parts.

3. **Different storage or upload path**
   - Use a storage or upload service that offers browser SDKs or resumable uploads (e.g. Cloudflare Stream, or a dedicated upload service) and integrate that in the frontend, with your API only handling metadata and DB.

4. **Limit file size in the UI**
   - If you only need small images, cap uploads at 4 MB and use only the “single request through API” path. No multipart, no presigned parts, no R2 CORS for PUT. Simplest but no large files.

---

## R2 CORS checklist (required for presigned part uploads)

For browser `PUT` to R2 (presigned part URLs) to work, the R2 bucket CORS must allow:

1. **Allowed origins:** Your frontend origin(s), e.g.  
   `https://www.ayachiprod.com`, `https://ayachiprod.com`, `http://localhost:3000`
2. **Allowed methods:** `GET`, `HEAD`, **`PUT`**
3. **Allowed headers:** `*` or at least `Content-Type`

Where to set: **Cloudflare Dashboard → R2 → your bucket → Settings → CORS policy.**

Example (add or merge with existing rules):

```json
[
  {
    "AllowedOrigins": [
      "https://www.ayachiprod.com",
      "https://ayachiprod.com",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "HEAD", "PUT"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

If CORS is wrong, part uploads will fail in the browser (blocked by CORS) and you’ll see only small-file uploads (through the API) succeed.

---

## Files involved (for reference)

- **API:** `api/sections.js` (work-images: upload-init, upload-part-url, upload-part, upload-complete, upload-abort), `api/index.js` (which routes get raw vs parsed body), `api/_utils/r2.js` (multipart + presigned part URL).
- **Frontend:** `frontend/src/services/sectionsService.js` (uploadWorkImagesWithProgress: simple vs chunked, presigned part URLs).
- **R2:** Cloudflare dashboard → R2 → your bucket → CORS (and optionally multipart/abort for cleanup).
