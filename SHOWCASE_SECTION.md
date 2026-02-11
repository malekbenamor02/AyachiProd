# Homepage Showcase (Marquee) Section – Admin Editable

The **horizontal image strip** on the homepage (the marquee with rounded-corner photos) is now editable by the admin: you can **add**, **remove**, and reorder images from the dashboard.

---

## What Was Done

1. **Database**  
   - New table `showcase_images` stores: image URL, path, alt text, and order.  
   - Run the migration once (see below).

2. **Backend API**  
   - `GET /api/showcase` – public, returns the list of images.  
   - `POST /api/showcase/upload` – admin only, upload one image (multipart form with `image` and optional `alt_text`).  
   - `DELETE /api/showcase/:id` – admin only, removes an image and its file from storage.

3. **Frontend**  
   - **Homepage:** The marquee section loads images from the API; if none exist or the request fails, it falls back to the previous hardcoded images.  
   - **Admin:** In the dashboard there is an **“Edit homepage showcase (marquee images)”** button. That opens the **Showcase editor** where you can:  
     - See all current images  
     - **Add** images (file picker + optional alt text)  
     - **Remove** images (with confirmation)

4. **Storage**  
   - Uploaded images are stored in your existing R2 bucket under the `showcase/` prefix (same bucket as galleries).

---

## What You Need to Do

### 1. Run the database migration

In **Supabase** (SQL Editor), run the contents of:

- **`supabase-showcase-migration.sql`**

This creates the `showcase_images` table and its policy.

### 2. Install the new API dependency

From the project root:

```bash
cd api
npm install
```

This installs `formidable` (used for multipart file uploads).

### 3. Use the admin UI

1. Log in to the admin dashboard.  
2. Click **“Edit homepage showcase (marquee images)”**.  
3. Use **Add image** to upload; use **Remove** on a thumbnail to delete an image.  
4. Visit the homepage to see the marquee update with your images.

---

## Summary

- **Admin can:** upload images, remove images, and see the list in the Showcase editor.  
- **Homepage:** shows those images in the horizontal strip; if there are none or the API fails, it uses the previous default set of images.
