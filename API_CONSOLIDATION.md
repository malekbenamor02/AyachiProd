# API Consolidation for Vercel Free Plan
## Optimized to Use Only 4 Serverless Functions

---

## ⚠️ Vercel Free Plan Limitation

**Maximum 11 serverless functions** allowed on the free plan.

To stay well under this limit and allow for future expansion, we've consolidated all API endpoints into **4 main files**.

---

## 📁 New API Structure

### Before (10 files):
```
api/
├── auth/
│   ├── login.js
│   └── me.js
├── galleries/
│   ├── index.js
│   ├── create.js
│   ├── [id].js
│   ├── [id]/
│   │   ├── qr.js
│   │   └── upload.js
├── client/
│   ├── authenticate.js
│   └── gallery.js
└── statistics/
    └── index.js
```

### After (4 files):
```
api/
├── auth.js          → Handles /api/auth/login & /api/auth/me
├── galleries.js     → Handles all gallery operations
├── client.js        → Handles client authentication & gallery
└── statistics.js    → Handles statistics
```

---

## 🔄 Route Mapping

### `/api/auth.js`
- `POST /api/auth/login` → Login handler
- `GET /api/auth/me` → Get current user

### `/api/galleries.js`
- `GET /api/galleries` → List galleries
- `POST /api/galleries/create` → Create gallery
- `GET /api/galleries/[id]` → Get gallery
- `PUT /api/galleries/[id]` → Update gallery
- `DELETE /api/galleries/[id]` → Delete gallery
- `POST /api/galleries/[id]/qr` → Generate QR code
- `POST /api/galleries/[id]/upload` → Upload file

### `/api/client.js`
- `POST /api/client/authenticate` → Client login
- `GET /api/client/gallery` → Get client gallery

### `/api/statistics.js`
- `GET /api/statistics` → Get dashboard statistics

---

## ✅ Benefits

1. **Only 4 serverless functions** (well under 11 limit)
2. **Room for 7 more functions** if needed
3. **Same API endpoints** - no frontend changes needed
4. **Better organization** - related endpoints grouped together
5. **Easier maintenance** - fewer files to manage

---

## 🔧 Vercel Configuration

The `vercel.json` has been updated to route requests correctly:

```json
{
  "routes": [
    {
      "src": "/api/auth/(.*)",
      "dest": "/api/auth.js"
    },
    {
      "src": "/api/galleries/(.*)",
      "dest": "/api/galleries.js"
    },
    {
      "src": "/api/client/(.*)",
      "dest": "/api/client.js"
    },
    {
      "src": "/api/statistics",
      "dest": "/api/statistics.js"
    }
  ]
}
```

---

## 📝 Implementation Details

Each consolidated file uses path-based routing:

```javascript
const url = new URL(req.url)
const path = url.pathname.replace('/api/[endpoint]', '')

// Route based on path and method
if (path === '/login' && req.method === 'POST') {
  // Handle login
}
```

---

## 🗑️ Old Files (Can Be Deleted)

The following old files are no longer needed:
- `api/auth/login.js`
- `api/auth/me.js`
- `api/galleries/index.js`
- `api/galleries/create.js`
- `api/galleries/[id].js`
- `api/galleries/[id]/qr.js`
- `api/galleries/[id]/upload.js`
- `api/client/authenticate.js`
- `api/client/gallery.js`
- `api/statistics/index.js`

**Note:** Keep the `_utils/` and `_middleware/` directories as they contain shared code.

---

## ✅ Status

- ✅ All endpoints consolidated
- ✅ Vercel config updated
- ✅ Path-based routing implemented
- ✅ Ready for deployment

**Total Functions:** 4/11 (36% of limit)

---

**Last Updated:** 2026
