# How to Start the Project

## Quick Start

### Option 1: Using the Batch File (Windows)
Double-click `frontend/start-dev.bat`

### Option 2: Using Command Line

1. **Open Terminal/PowerShell in the project root**

2. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

3. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - The server will start at `http://localhost:3000`
   - Vite will show you the exact URL in the terminal

## Troubleshooting

### If you get "package.json not found" error:
- Make sure you're in the `frontend` directory
- Check that `frontend/package.json` exists

### If port 3000 is already in use:
- Vite will automatically try the next available port (3001, 3002, etc.)
- Check the terminal output for the actual URL

### If you see module errors:
- Run `npm install` again in the frontend directory
- Delete `node_modules` and `package-lock.json`, then run `npm install`

## Project Structure

```
aziz-ayachi-gallery/
├── frontend/          ← You need to be HERE
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── [other files]
```

## Development Server

Once running, you'll see:
- ✅ Local: http://localhost:3000
- ✅ Network: (your local IP)

The page will automatically reload when you make changes!
