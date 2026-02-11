# Aziz Ayachi - Professional Photographer Gallery Management System
## Domain: ayachiprod.com

A comprehensive gallery management system for professional photographers, featuring secure client access via QR codes, password protection, and global CDN delivery.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Cloudflare account (R2 + domain)

### Installation

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../api
npm install
```

### Setup

1. **Configure Environment Variables:**
   - Copy `.env.example` to `api/.env`
   - Add your Supabase and Cloudflare credentials

2. **Set Up Database:**
   - Create Supabase project
   - Run migrations from `DATABASE_SCHEMA.md`

3. **Run Development:**
   ```bash
   # Terminal 1 - Frontend
   cd frontend
   npm run dev

   # Terminal 2 - Backend
   cd api
   vercel dev
   ```

---

## 📚 Documentation

- **[SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)** - Complete setup guide
- **[PRD.md](./PRD.md)** - Product Requirements Document
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Database structure
- **[API_SCHEMA.md](./API_SCHEMA.md)** - API endpoints
- **[SEO_PLAN.md](./SEO_PLAN.md)** - SEO strategy
- **[HOSTING_GUIDE.md](./HOSTING_GUIDE.md)** - Deployment guide

---

## ✨ Features

### Admin Dashboard
- ✅ Gallery management (create, edit, delete)
- ✅ File upload with drag & drop
- ✅ QR code generation
- ✅ Statistics dashboard
- ✅ Search & pagination

### Client Gallery
- ✅ Password-protected access
- ✅ Beautiful image gallery
- ✅ Lightbox viewing
- ✅ Download functionality
- ✅ Mobile responsive

### Technical
- ✅ JWT authentication
- ✅ Cloudflare R2 storage
- ✅ CDN delivery
- ✅ SEO optimized
- ✅ Serverless architecture

---

## 🏗️ Tech Stack

- **Frontend:** React 18, Vite, React Router
- **Backend:** Node.js, Vercel Serverless Functions
- **Database:** Supabase (PostgreSQL)
- **Storage:** Cloudflare R2
- **CDN:** Cloudflare CDN
- **Hosting:** Vercel

---

## 📁 Project Structure

```
aziz-ayachi-gallery/
├── frontend/          # React application
├── api/               # Serverless API functions
├── vercel.json        # Deployment config
└── docs/             # Documentation
```

---

## 🎯 Status

**Build Status:** ✅ **COMPLETE**

- ✅ Backend API (100%)
- ✅ Frontend UI (100%)
- ✅ Admin Dashboard (100%)
- ✅ Client Gallery (100%)
- ✅ Documentation (100%)

**Ready for:** Testing & Deployment

---

## 📞 Support

For setup help, see [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)

---

**Developed by:** Malek Ben Amor  
**For:** Aziz Ayachi - Professional Photographer  
**Year:** 2026
