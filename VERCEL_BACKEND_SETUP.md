# Vercel Backend Setup Guide
## Serverless Functions for Node.js API

---

## Overview

Since we're hosting both frontend and backend on Vercel, we need to structure the backend as **serverless functions** instead of a traditional Express.js server.

---

## Project Structure for Vercel

```
aziz-ayachi-gallery/
├── frontend/              # React app
│   ├── src/
│   ├── public/
│   └── package.json
│
├── api/                   # Serverless functions
│   ├── auth/
│   │   ├── login.js
│   │   └── me.js
│   ├── galleries/
│   │   ├── index.js       # GET /api/galleries
│   │   ├── [id].js        # GET /api/galleries/:id
│   │   └── create.js      # POST /api/galleries
│   ├── upload/
│   │   └── [galleryId].js  # POST /api/upload/:galleryId
│   └── _utils/            # Shared utilities
│       ├── supabase.js
│       ├── r2.js
│       └── jwt.js
│
├── vercel.json            # Vercel configuration
└── package.json           # Root package.json
```

---

## Vercel Configuration

### `vercel.json`

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
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## Serverless Function Format

### Example: `api/galleries/index.js`

```javascript
// GET /api/galleries
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify admin token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get galleries from Supabase
    const { data, error } = await supabase
      .from('galleries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

### Example: `api/galleries/[id].js`

```javascript
// GET /api/galleries/:id
// PUT /api/galleries/:id
// DELETE /api/galleries/:id

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('galleries')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data
      });
    }

    if (req.method === 'PUT') {
      const { name, client_name, password } = req.body;
      
      const updateData = {};
      if (name) updateData.name = name;
      if (client_name) updateData.client_name = client_name;
      if (password) {
        const bcrypt = require('bcryptjs');
        updateData.password_hash = await bcrypt.hash(password, 10);
      }

      const { data, error } = await supabase
        .from('galleries')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data
      });
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('galleries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Gallery deleted successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

---

## File Upload with Vercel

### For Small Files (< 4.5MB)

```javascript
// api/upload/[galleryId].js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multiparty from 'multiparty';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, use multiparty
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { galleryId } = req.query;
    const form = new multiparty.Form();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: 'Error parsing form' });
      }

      const file = files.file[0];
      const fileName = `${galleryId}/${Date.now()}-${file.originalFilename}`;

      // Upload to R2
      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: require('fs').createReadStream(file.path),
        ContentType: file.headers['content-type'],
      });

      await r2Client.send(uploadCommand);

      // Save metadata to Supabase
      // ... (save file info to database)

      return res.status(200).json({
        success: true,
        data: {
          file_url: `${process.env.R2_CDN_URL}/${fileName}`,
        },
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
```

### For Large Files (Chunked Upload)

For files > 4.5MB, you'll need to:
1. Upload chunks from frontend directly to R2 (using presigned URLs)
2. Or use a service like Cloudflare Workers for chunked uploads

---

## Shared Utilities

### `api/_utils/supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}
```

### `api/_utils/jwt.js`

```javascript
import jwt from 'jsonwebtoken';

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function generateToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}
```

---

## Environment Variables in Vercel

Set these in Vercel Dashboard → Project Settings → Environment Variables:

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

---

## Dependencies

### Root `package.json`

```json
{
  "name": "aziz-ayachi-gallery",
  "version": "1.0.0",
  "scripts": {
    "dev": "vercel dev",
    "build": "cd frontend && npm run build"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "@aws-sdk/client-s3": "^3.400.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "multiparty": "^4.2.5"
  },
  "devDependencies": {
    "vercel": "^32.0.0"
  }
}
```

---

## Deployment

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Setup Vercel backend"
   git push
   ```

2. **Connect to Vercel:**
   - Go to Vercel dashboard
   - Import GitHub repository
   - Vercel auto-detects configuration

3. **Deploy:**
   - Vercel automatically deploys on every push
   - Or manually deploy from dashboard

---

## Testing Locally

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally
vercel dev
```

This starts:
- Frontend on `http://localhost:3000`
- API on `http://localhost:3000/api`

---

## Benefits of Vercel Serverless

✅ **Auto-scaling:** Handles traffic spikes automatically  
✅ **Global edge network:** Fast response times worldwide  
✅ **Pay per use:** Only pay for what you use  
✅ **Easy deployment:** Git-based deployments  
✅ **Free tier:** Generous free tier for development  

---

## Limitations & Considerations

⚠️ **Function timeout:** 10 seconds (hobby), 60 seconds (pro)  
⚠️ **File size limit:** 4.5MB per request (use chunked uploads for larger files)  
⚠️ **Cold starts:** First request may be slower (warmup functions available)  

---

**Last Updated:** 2026  
**Version:** 1.0
