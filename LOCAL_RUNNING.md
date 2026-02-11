# Project Running Locally ✅

---

## ✅ Status

- ✅ **Backend dependencies:** Installed
- ✅ **Frontend dependencies:** Installed
- ✅ **Environment files:** Verified (`.env` and `.env.local` exist)
- ✅ **Backend server:** Starting on http://localhost:3001
- ✅ **Frontend server:** Starting on http://localhost:3000

---

## 🌐 Access Your Application

### Frontend (Portfolio + Admin)
**URL:** http://localhost:3000

**Pages:**
- Homepage: http://localhost:3000
- Admin Login: http://localhost:3000/admin/login
- Admin Dashboard: http://localhost:3000/admin/dashboard (after login)

### Backend API
**URL:** http://localhost:3001

**Endpoints:**
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user
- `GET /api/galleries` - List galleries
- `POST /api/galleries/create` - Create gallery
- `GET /api/statistics` - Dashboard statistics
- And more...

---

## 🧪 Test the Application

### 1. Test Portfolio Website
1. Open: http://localhost:3000
2. ✅ Should see Aziz Ayachi portfolio
3. ✅ Check navigation works
4. ✅ Check animations work

### 2. Test Admin Login
1. Go to: http://localhost:3000/admin/login
2. Login with:
   - **Email:** `admin@ayachiprod.com`
   - **Password:** (the password you set in Supabase Auth)
3. ✅ Should redirect to dashboard

### 3. Test Dashboard
1. After login, you should see:
   - ✅ Statistics cards
   - ✅ Gallery list
   - ✅ "Create Gallery" button

### 4. Test Create Gallery
1. Click "Create Gallery"
2. Fill in the form:
   - Gallery Name: "Test Gallery"
   - Client Name: "Test Client"
   - Password: "test123"
   - (Other fields optional)
3. Click "Save Gallery"
4. ✅ Should create successfully

---

## 🛑 Stop the Servers

To stop the servers:

**Option 1: Close the terminal windows**
- Close the terminal windows running the servers

**Option 2: Use Ctrl+C**
- In each terminal, press `Ctrl+C` to stop

**Option 3: Kill processes**
```bash
# Find and kill Node processes
taskkill /F /IM node.exe
```

---

## 🔍 Troubleshooting

### Backend not starting?
- Check if port 3001 is already in use
- Verify `api/.env` file exists and has correct values
- Check terminal for error messages

### Frontend not starting?
- Check if port 3000 is already in use
- Verify `frontend/.env.local` file exists
- Check terminal for error messages

### Can't login?
- Verify admin user exists in Supabase
- Check if user is linked in `users` table
- Verify JWT_SECRET in `api/.env` matches

### API errors?
- Check backend terminal for errors
- Verify Supabase connection in `api/.env`
- Check database tables exist

---

## 📝 Next Steps

Once everything is working locally:

1. ✅ Test all features
2. ✅ Create test galleries
3. ✅ Test file upload (when implemented)
4. ✅ Test QR code generation
5. ✅ Test client gallery access

Then you can proceed to deployment!

---

## 🎯 Current Status

**Backend:** Running on http://localhost:3001  
**Frontend:** Running on http://localhost:3000  
**Database:** Connected to Supabase  
**Storage:** Ready for Cloudflare R2  

**Everything is ready to test!** 🚀

---

**Last Updated:** 2026
