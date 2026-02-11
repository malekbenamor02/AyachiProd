# Project Structure & Setup Guide
## Aziz Ayachi Gallery Management System

---

## Project Structure

```
aziz-ayachi-gallery/
├── frontend/                    # React Frontend Application
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Loading.jsx
│   │   │   │   └── QRCode.jsx
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── GalleryList.jsx
│   │   │   │   ├── GalleryForm.jsx
│   │   │   │   ├── FileUpload.jsx
│   │   │   │   ├── FileManager.jsx
│   │   │   │   ├── Statistics.jsx
│   │   │   │   └── QRCodeGenerator.jsx
│   │   │   └── client/
│   │   │       ├── GalleryView.jsx
│   │   │       ├── MediaGrid.jsx
│   │   │       ├── Lightbox.jsx
│   │   │       └── DownloadButton.jsx
│   │   ├── pages/               # Page components
│   │   │   ├── admin/
│   │   │   │   ├── AdminLogin.jsx
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── GalleryManagement.jsx
│   │   │   │   └── UploadFiles.jsx
│   │   │   └── client/
│   │   │       ├── ClientGallery.jsx
│   │   │       └── PasswordPrompt.jsx
│   │   ├── context/             # React Context for state
│   │   │   ├── AuthContext.jsx
│   │   │   └── GalleryContext.jsx
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useUpload.js
│   │   │   └── useGallery.js
│   │   ├── services/            # API service functions
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── galleryService.js
│   │   │   ├── uploadService.js
│   │   │   └── qrService.js
│   │   ├── utils/               # Utility functions
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   └── validators.js
│   │   ├── styles/             # CSS/Tailwind styles
│   │   │   ├── index.css
│   │   │   ├── components.css
│   │   │   └── admin.css
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.local
│
├── backend/                     # Node.js Backend Application
│   ├── src/
│   │   ├── controllers/         # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── galleryController.js
│   │   │   ├── fileController.js
│   │   │   ├── uploadController.js
│   │   │   ├── qrController.js
│   │   │   └── statsController.js
│   │   ├── routes/              # Express routes
│   │   │   ├── index.js
│   │   │   ├── adminRoutes.js
│   │   │   ├── clientRoutes.js
│   │   │   └── uploadRoutes.js
│   │   ├── middleware/          # Express middleware
│   │   │   ├── auth.js
│   │   │   ├── validation.js
│   │   │   ├── errorHandler.js
│   │   │   └── upload.js
│   │   ├── services/           # Business logic
│   │   │   ├── cloudflareR2.js
│   │   │   ├── supabaseService.js
│   │   │   ├── jwtService.js
│   │   │   ├── qrService.js
│   │   │   └── fileService.js
│   │   ├── utils/              # Utility functions
│   │   │   ├── logger.js
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── config/             # Configuration
│   │   │   ├── database.js
│   │   │   ├── cloudflare.js
│   │   │   └── supabase.js
│   │   ├── models/             # Data models (optional)
│   │   │   ├── Gallery.js
│   │   │   └── MediaFile.js
│   │   └── app.js              # Express app setup
│   ├── uploads/                # Temporary upload directory
│   ├── package.json
│   ├── .env
│   └── server.js              # Server entry point
│
├── database/                    # Database scripts
│   ├── migrations/
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_galleries.sql
│   │   ├── 003_create_media_files.sql
│   │   └── 004_create_tokens.sql
│   ├── seeds/
│   │   └── seed_data.sql
│   └── functions/
│       └── database_functions.sql
│
├── docs/                       # Documentation
│   ├── PRD.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_SCHEMA.md
│   └── PROJECT_STRUCTURE.md
│
├── .gitignore
├── README.md
└── package.json                 # Root package.json (for monorepo, optional)
```

---

## Setup Instructions

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Supabase** account and project
- **Cloudflare** account with R2 bucket
- **Git** for version control

---

### 1. Clone and Initialize Project

```bash
# Create project directory
mkdir aziz-ayachi-gallery
cd aziz-ayachi-gallery

# Initialize git
git init
git add .
git commit -m "Initial commit"
```

---

### 2. Backend Setup

```bash
# Create backend directory
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express cors dotenv
npm install jsonwebtoken bcryptjs
npm install @supabase/supabase-js
npm install @aws-sdk/client-s3  # For Cloudflare R2 (S3-compatible)
npm install multer
npm install qrcode
npm install joi express-validator
npm install winston  # For logging

# Install dev dependencies
npm install --save-dev nodemon
```

**Backend `.env` file:**
```env
# Server
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
CLIENT_TOKEN_EXPIRES_IN=365d

# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=aziz-ayachi-gallery
R2_PUBLIC_URL=https://your-bucket.r2.dev
R2_CDN_URL=https://cdn.azizayachi.com

# CORS
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5368709120  # 5GB in bytes
CHUNK_SIZE=10485760  # 10MB chunks
```

---

### 3. Frontend Setup

```bash
# Create frontend directory (from project root)
cd ..
mkdir frontend
cd frontend

# Create React app with Vite (recommended) or Create React App
npm create vite@latest . -- --template react
# OR
npx create-react-app .

# Install dependencies
npm install react-router-dom
npm install axios
npm install formik yup
npm install react-dropzone
npm install react-qr-code
npm install react-image-gallery
npm install tailwindcss postcss autoprefixer
npm install @headlessui/react  # For UI components

# Install Tailwind CSS
npx tailwindcss init -p
```

**Frontend `.env.local` file:**
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

**Tailwind Config (`tailwind.config.js`):**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Match existing design
        primary: '#000000',
        secondary: '#525252',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

---

### 4. Supabase Setup

1. **Create Supabase Project:**
   - Go to https://supabase.com
   - Create new project
   - Note your project URL and API keys

2. **Run Database Migrations:**
   - Go to SQL Editor in Supabase dashboard
   - Run migration scripts from `database/migrations/` in order

3. **Configure Authentication:**
   - Enable Email/Password auth in Supabase dashboard
   - Create first admin user manually or via SQL

4. **Set up Row Level Security (RLS):**
   - Enable RLS on all tables
   - Create policies as defined in DATABASE_SCHEMA.md

---

### 5. Cloudflare R2 Setup

1. **Create R2 Bucket:**
   - Go to Cloudflare Dashboard → R2
   - Create bucket: `aziz-ayachi-gallery`
   - Note bucket name and region

2. **Create API Token:**
   - Go to R2 → Manage R2 API Tokens
   - Create token with read/write permissions
   - Save Access Key ID and Secret Access Key

3. **Configure Custom Domain (Optional):**
   - Add custom domain for CDN
   - Configure DNS records
   - Enable CDN caching

4. **CORS Configuration:**
   - Set CORS rules in R2 bucket settings
   - Allow your frontend domain

---

### 6. Development Scripts

**Backend `package.json` scripts:**
```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "test": "jest"
  }
}
```

**Frontend `package.json` scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "vite"
  }
}
```

---

### 7. Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

---

### 8. Environment Variables Checklist

**Backend:**
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_KEY`
- [ ] `JWT_SECRET`
- [ ] `R2_ACCOUNT_ID`
- [ ] `R2_ACCESS_KEY_ID`
- [ ] `R2_SECRET_ACCESS_KEY`
- [ ] `R2_BUCKET_NAME`
- [ ] `R2_CDN_URL`

**Frontend:**
- [ ] `REACT_APP_API_URL`
- [ ] `REACT_APP_SUPABASE_URL`
- [ ] `REACT_APP_SUPABASE_ANON_KEY`

---

## Development Workflow

### 1. Feature Development
1. Create feature branch: `git checkout -b feature/gallery-upload`
2. Develop feature
3. Test locally
4. Commit changes
5. Push and create PR

### 2. Database Changes
1. Create migration file in `database/migrations/`
2. Test migration locally
3. Document changes
4. Apply to production

### 3. API Development
1. Define endpoint in `API_SCHEMA.md`
2. Implement controller
3. Add route
4. Write tests
5. Update documentation

---

## Deployment

### Frontend (Vercel/Netlify)

```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel or Netlify
```

**Environment Variables in Vercel/Netlify:**
- Add all `REACT_APP_*` variables

### Backend (Railway/Render)

```bash
cd backend
# Push to GitHub
# Connect repository to Railway/Render
# Add environment variables
# Deploy
```

---

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## Security Checklist

- [ ] All passwords hashed with bcrypt
- [ ] JWT tokens have expiration
- [ ] CORS configured correctly
- [ ] Input validation on all endpoints
- [ ] File upload size limits enforced
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitize user input)
- [ ] HTTPS enabled in production
- [ ] Environment variables secured
- [ ] Rate limiting implemented

---

## Troubleshooting

### Common Issues

**1. CORS Errors:**
- Check backend CORS configuration
- Verify frontend URL in backend `.env`

**2. File Upload Fails:**
- Check R2 credentials
- Verify bucket permissions
- Check file size limits

**3. Database Connection Issues:**
- Verify Supabase credentials
- Check network connectivity
- Verify RLS policies

**4. JWT Token Errors:**
- Check JWT_SECRET matches
- Verify token expiration
- Check token format

---

## Next Steps

1. ✅ Set up project structure
2. ✅ Configure Supabase
3. ✅ Configure Cloudflare R2
4. ⏭️ Implement authentication
5. ⏭️ Build admin dashboard
6. ⏭️ Implement file upload
7. ⏭️ Build client gallery
8. ⏭️ Add QR code generation
9. ⏭️ Testing and deployment

---

**Last Updated:** 2026  
**Version:** 1.0
