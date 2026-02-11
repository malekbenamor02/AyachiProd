# Route Testing Guide

## Current Issue
Getting 404 on `/api/auth/login` even though route is defined.

## What to Check

### 1. Check Backend Terminal
Look at the backend terminal (where `npm run dev` is running) and check:
- Does it show "🚀 Backend server running on http://localhost:3001"?
- Are there any error messages?
- When you make a request, do you see the console.log messages?

### 2. Verify Route is Registered
The route should be at line 122 in `api/server.js`:
```javascript
app.post('/api/auth/login', async (req, res) => {
```

### 3. Test Manually
Open a new PowerShell window and run:
```powershell
$body = @{
    email = 'fmalekbenamorf@gmail.com'
    password = 'admin123'
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing
```

### 4. Check Backend Logs
The backend should log:
- `🔵 Auth route matched - Path: ...`
- `🔵 Request URL: ...`
- `🟢 Auth handler - Extracted path: /login`

If you don't see these logs, the route isn't being hit.

## Possible Issues
1. **Backend not running** - Check if port 3001 is listening
2. **Route not registered** - Check server.js file
3. **Syntax error** - Check for JavaScript errors in console
4. **Caching** - Try restarting the backend

## Next Steps
1. Check the backend terminal for logs
2. Verify the route exists in server.js
3. Try the manual test above
4. Share what you see in the backend terminal
