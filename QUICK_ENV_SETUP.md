# Quick Environment Setup
## Copy & Paste Guide

---

## 🚀 Quick Setup Steps

### Step 1: Create Backend .env File

**Option A: Copy from template file**
1. Open `api/env-template.txt`
2. Copy ALL the content (Ctrl+A, Ctrl+C)
3. Create a new file in `api/` folder named `.env`
4. Paste the content (Ctrl+V)
5. Save the file

**Option B: Use command line**
```bash
cd api
copy env-template.txt .env
```

---

### Step 2: Create Frontend .env.local File

**Option A: Copy from template file**
1. Open `frontend/env-template.txt`
2. Copy ALL the content (Ctrl+A, Ctrl+C)
3. Create a new file in `frontend/` folder named `.env.local`
4. Paste the content (Ctrl+V)
5. Save the file

**Option B: Use command line**
```bash
cd frontend
copy env-template.txt .env.local
```

---

## ✅ Verification

After creating the files, verify they exist:

```bash
# Check backend .env
dir api\.env

# Check frontend .env.local
dir frontend\.env.local
```

---

## 📝 File Locations

```
aziz-ayachi-gallery/
├── api/
│   ├── env-template.txt  ← Copy this
│   └── .env              ← To this (create new)
│
└── frontend/
    ├── env-template.txt  ← Copy this
    └── .env.local        ← To this (create new)
```

---

## ⚠️ Important Notes

1. **Never commit `.env` files to Git** (they're in `.gitignore`)
2. **Keep credentials secure**
3. **For production, add these to Vercel Environment Variables**

---

## 🎯 Ready to Run!

After creating both files, you can start the project:

```bash
# Terminal 1 - Backend
cd api
vercel dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

**Status:** ✅ **READY TO COPY & PASTE**
