# Aziz Ayachi Gallery Management System

A comprehensive gallery management system for professional photographer Aziz Ayachi, allowing secure client gallery access via QR codes with password protection.

## 📋 Project Documentation

This project includes comprehensive documentation:

1. **[PRD.md](./PRD.md)** - Product Requirements Document
   - Project overview and objectives
   - Functional and non-functional requirements
   - User personas and user stories
   - Technical requirements and timeline

2. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Database Schema
   - Complete table definitions
   - Relationships and indexes
   - Row Level Security policies
   - Database functions and views

3. **[API_SCHEMA.md](./API_SCHEMA.md)** - API Documentation
   - All API endpoints
   - Request/response formats
   - Authentication methods
   - Error handling

4. **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Setup Guide
   - Complete project structure
   - Step-by-step setup instructions
   - Environment configuration
   - Deployment guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Cloudflare R2 account

### Setup Steps

1. **Read the documentation:**
   - Start with [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for setup
   - Review [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for database setup
   - Check [API_SCHEMA.md](./API_SCHEMA.md) for API reference

2. **Follow the setup guide:**
   ```bash
   # See PROJECT_STRUCTURE.md for detailed instructions
   ```

3. **Configure services:**
   - Set up Supabase project
   - Configure Cloudflare R2 bucket
   - Add environment variables

## 🏗️ Architecture

- **Frontend:** React 18+ with TailwindCSS
- **Backend:** Node.js + Express.js
- **Database:** Supabase (PostgreSQL)
- **Storage:** Cloudflare R2
- **CDN:** Cloudflare CDN
- **Authentication:** JWT + Supabase Auth

## 📁 Project Structure

```
aziz-ayachi-gallery/
├── frontend/          # React application
├── backend/           # Node.js API
├── database/          # Migration scripts
└── docs/             # Documentation
```

## 🔑 Key Features

- ✅ Admin dashboard for gallery management
- ✅ Secure file upload to Cloudflare R2
- ✅ QR code generation for client access
- ✅ Password-protected client galleries
- ✅ Fast CDN delivery
- ✅ Download functionality
- ✅ Statistics and analytics

## 📝 Development Phases

1. **Phase 1:** Setup & Database ✅
2. **Phase 2:** Frontend Development
3. **Phase 3:** Backend Development
4. **Phase 4:** Authentication & Security
5. **Phase 5:** Testing & Deployment

## 📚 Documentation Files

- `PRD.md` - Product Requirements Document
- `DATABASE_SCHEMA.md` - Database schema and migrations
- `API_SCHEMA.md` - API endpoints and specifications
- `PROJECT_STRUCTURE.md` - Project setup and structure guide
- `project.md` - Original project requirements

## 🛠️ Tech Stack

**Frontend:**
- React 18+
- React Router
- TailwindCSS
- Axios
- Formik + Yup

**Backend:**
- Node.js 18+
- Express.js
- JWT
- Cloudflare R2 SDK
- Supabase Client

**Infrastructure:**
- Supabase (PostgreSQL)
- Cloudflare R2
- Cloudflare CDN

## 📞 Support

For questions or issues, refer to the documentation files or contact the development team.

---

**Project Status:** Planning & Documentation Complete ✅  
**Next Step:** Begin Phase 1 - Setup & Database
