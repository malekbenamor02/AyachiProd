# How to Run the Backend
## Step-by-Step Guide

---

## ⚡ Run the full project (one command)

From the **project root** (`Aziz Ayachi` folder):

```bash
npm run dev
```

or:

```bash
npm start
```

This starts **both** the API (backend) and the frontend together. You’ll get:
- **Backend:** http://localhost:3001  
- **Frontend:** http://localhost:5173 (or the port Vite shows)

First time: run `npm install` once at the root, and ensure `api` and `frontend` have their dependencies installed (`npm install` in each folder, or run from root: `npm install --prefix api` and `npm install --prefix frontend`).

---

## 🚀 Quick Start (backend only)

### Method 1: Using Vercel Dev (Recommended)

1. **Open a terminal/command prompt**

2. **Navigate to the api folder:**
   ```bash
   cd "C:\Users\ASUS\Desktop\Aziz Ayachi\api"
   ```

3. **Run the backend:**
   ```bash
   npm run dev
   ```
   
   This will start a local Express server (not Vercel dev) for easier local development.

4. **Wait for it to start:**
   - You should see: `Ready! Available at http://localhost:3001`
   - The backend is now running! ✅

---

## 📋 Prerequisites

Before running, make sure:

- ✅ **Dependencies installed:**
  ```bash
  cd api
  npm install
  ```

- ✅ **Environment file exists:**
  - File: `api/.env`
  - Should contain all credentials (Supabase, R2, JWT, etc.)

- ✅ **Vercel CLI installed (if not already):**
  ```bash
  npm install -g vercel
  ```

---

## 🔍 Verify Backend is Running

### Check the Terminal Output

You should see something like:
```
> aziz-ayachi-api@1.0.0 dev
> vercel dev

Vercel CLI 32.x.x
Ready! Available at http://localhost:3001
```

### Test the API

Open your browser or use curl:
```
http://localhost:3001/api/statistics
```

Or test with a simple request:
```bash
curl http://localhost:3001/api/statistics
```

---

## 🛑 Stop the Backend

Press `Ctrl+C` in the terminal where the backend is running.

---

## 🔧 Troubleshooting

### Error: "vercel: command not found"
**Solution:**
```bash
npm install -g vercel
```

### Error: "Cannot find module"
**Solution:**
```bash
cd api
npm install
```

### Error: "Port 3001 already in use"
**Solution:**
- Find what's using port 3001:
  ```bash
  netstat -ano | findstr :3001
  ```
- Kill the process or use a different port

### Error: "Environment variables not found"
**Solution:**
- Make sure `api/.env` file exists
- Check all required variables are set
- See `api/env-template.txt` for reference

### Backend starts but API returns errors
**Check:**
- ✅ Supabase connection (check `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`)
- ✅ Database tables exist (run migration if not)
- ✅ `.env` file has correct values

---

## 📝 Available API Endpoints

Once running, these endpoints are available:

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user

### Galleries
- `GET /api/galleries` - List galleries
- `POST /api/galleries/create` - Create gallery
- `GET /api/galleries/[id]` - Get gallery
- `PUT /api/galleries/[id]` - Update gallery
- `DELETE /api/galleries/[id]` - Delete gallery
- `POST /api/galleries/[id]/qr` - Generate QR code
- `POST /api/galleries/[id]/upload` - Upload file

### Client
- `POST /api/client/authenticate` - Client login
- `GET /api/client/gallery` - Get client gallery

### Statistics
- `GET /api/statistics` - Get dashboard statistics

---

## 🎯 Running Backend + Frontend Together

### Terminal 1 - Backend:
```bash
cd "C:\Users\ASUS\Desktop\Aziz Ayachi\api"
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd "C:\Users\ASUS\Desktop\Aziz Ayachi\frontend"
npm run dev
```

Both will run simultaneously:
- Backend: http://localhost:3001
- Frontend: http://localhost:3000

---

## ✅ Success Indicators

When backend is running correctly, you should see:

1. ✅ Terminal shows: `Ready! Available at http://localhost:3001`
2. ✅ No error messages in terminal
3. ✅ Can access API endpoints
4. ✅ Frontend can connect to backend

---

## 📚 Additional Resources

- **Environment Setup:** See `QUICK_ENV_SETUP.md`
- **Database Setup:** See `SUPABASE_SETUP_GUIDE.md`
- **Full Setup:** See `NEXT_STEPS.md`

---

**Status:** ✅ **Backend is ready to run!**
