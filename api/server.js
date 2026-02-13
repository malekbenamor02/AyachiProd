// Simple Express server for local development
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, readFileSync } from 'fs'

// Get current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env file in api directory
const envPath = join(__dirname, '.env')
console.log(`📁 Loading .env from: ${envPath}`)
console.log(`📁 File exists: ${existsSync(envPath)}`)

// Try to read the file directly first
if (existsSync(envPath)) {
  try {
    const envContent = readFileSync(envPath, 'utf-8')
    console.log(`📄 File size: ${envContent.length} bytes`)
    console.log(`📄 First 100 chars: ${envContent.substring(0, 100)}`)
    
    // Check if SUPABASE_URL is in the content
    if (envContent.includes('SUPABASE_URL')) {
      console.log('✅ SUPABASE_URL found in file content')
    } else {
      console.log('❌ SUPABASE_URL NOT found in file content')
    }
  } catch (error) {
    console.error('❌ Error reading .env file:', error.message)
  }
}

const result = dotenv.config({ path: envPath })

if (result.error) {
  console.error('❌ Error loading .env:', result.error)
} else {
  console.log('✅ .env file loaded successfully')
  console.log(`📋 Found ${Object.keys(result.parsed || {}).length} environment variables`)
}

// Debug: Show what was loaded
console.log(`🔍 SUPABASE_URL loaded: ${!!process.env.SUPABASE_URL}`)
if (process.env.SUPABASE_URL) {
  console.log(`   Value: ${process.env.SUPABASE_URL.substring(0, 30)}...`)
}

// Verify environment variables are loaded
if (!process.env.SUPABASE_URL) {
  console.error('❌ Error: SUPABASE_URL not found in .env file')
  console.error(`   Looking for .env at: ${envPath}`)
  console.error('   Make sure api/.env file exists with all required variables')
  console.error('   Check for:')
  console.error('   - File encoding (should be UTF-8 without BOM)')
  console.error('   - No extra spaces before/after variable names')
  console.error('   - No quotes around values (unless needed)')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Helper to convert Express req to Vercel-style request
function createVercelRequest(req) {
  // Use originalUrl to get the full path including /api/auth/login
  const fullPath = req.originalUrl || req.url
  const baseUrl = `http://${req.headers.host || 'localhost:3001'}`
  const url = new URL(fullPath, baseUrl)
  
  console.log('🔷 createVercelRequest - req.url:', req.url)
  console.log('🔷 createVercelRequest - req.originalUrl:', req.originalUrl)
  console.log('🔷 createVercelRequest - fullPath:', fullPath)
  console.log('🔷 createVercelRequest - url.pathname:', url.pathname)
  
  // Express already parsed the JSON body, so pass it directly
  // parseBody will handle it correctly
  return {
    method: req.method,
    url: url.href,
    pathname: url.pathname,
    headers: req.headers,
    // Pass the parsed body directly - parseBody will detect it
    body: req.body,
  }
}

// Helper to send Vercel-style response
function sendVercelResponse(res, vercelResponse) {
  if (vercelResponse.headers) {
    Object.entries(vercelResponse.headers).forEach(([key, value]) => {
      res.setHeader(key, value)
    })
  }
  const statusCode = vercelResponse.statusCode || 200
  if (vercelResponse.body) {
    try {
      const body = JSON.parse(vercelResponse.body)
      res.status(statusCode).json(body)
    } catch {
      res.status(statusCode).send(vercelResponse.body)
    }
  } else {
    res.status(statusCode).end()
  }
}

// Import API handlers
const authHandler = (await import('./auth.js')).default
const galleriesHandler = (await import('./galleries.js')).default
const clientHandler = (await import('./client.js')).default
const statisticsHandler = (await import('./statistics.js')).default
const showcaseHandler = (await import('./showcase.js')).default
const sectionsHandler = (await import('./sections.js')).default
const sectionCategoriesHandler = (await import('./section-categories.js')).default
const bookingsHandler = (await import('./bookings.js')).default
const settingsHandler = (await import('./settings.js')).default

// API Routes - Auth endpoints
// Direct route matching for /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔵 Auth route matched - Path:', req.path, 'Method:', req.method)
    console.log('🔵 Request URL:', req.url)
    console.log('🔵 Request originalUrl:', req.originalUrl)
    console.log('🔵 Body:', req.body)
    
    const vercelReq = createVercelRequest(req)
    console.log('🔵 Vercel request URL:', vercelReq.url)
    console.log('🔵 Vercel request pathname:', vercelReq.pathname)
    
    const response = await authHandler(vercelReq)
    console.log('🔵 Handler response status:', response.statusCode)
    console.log('🔵 Handler response body:', response.body ? response.body.substring(0, 200) : 'empty')
    
    sendVercelResponse(res, response)
  } catch (error) {
    console.error('❌ Auth error:', error)
    console.error('❌ Error stack:', error.stack)
    res.status(500).json({ 
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// GET /api/auth/me
app.get('/api/auth/me', async (req, res) => {
  try {
    console.log('🔵 GET /api/auth/me')
    const vercelReq = createVercelRequest(req)
    const response = await authHandler(vercelReq)
    sendVercelResponse(res, response)
  } catch (error) {
    console.error('❌ Auth error:', error)
    res.status(500).json({ 
      success: false,
      error: error.message
    })
  }
})

// Galleries: exact path (e.g. GET /api/galleries) and any subpath (e.g. /api/galleries/123)
app.all('/api/galleries', async (req, res) => {
  try {
    const vercelReq = createVercelRequest(req)
    const response = await galleriesHandler(vercelReq)
    sendVercelResponse(res, response)
  } catch (error) {
    console.error('Galleries error:', error)
    res.status(500).json({ error: error.message, success: false })
  }
})
app.all('/api/galleries/*', async (req, res) => {
  try {
    const path = (req.originalUrl || req.url || '').split('?')[0]
    const isMultipartUpload = req.method === 'POST' && path.endsWith('/upload') && !path.includes('upload-url') && !path.includes('upload-complete')
    const request = isMultipartUpload ? req : createVercelRequest(req)
    const response = await galleriesHandler(request, res)
    sendVercelResponse(res, response)
  } catch (error) {
    console.error('Galleries error:', error)
    res.status(500).json({ error: error.message, success: false })
  }
})

// Match all client routes: /api/client, /api/client/authenticate, /api/client/download/:id, etc.
app.use('/api/client', async (req, res, next) => {
  try {
    const vercelReq = createVercelRequest(req)
    const response = await clientHandler(vercelReq)
    sendVercelResponse(res, response)
  } catch (error) {
    console.error('Client error:', error)
    res.status(500).json({ error: error.message, success: false })
  }
})

app.get('/api/statistics', async (req, res) => {
  try {
    const vercelReq = createVercelRequest(req)
    const response = await statisticsHandler(vercelReq)
    sendVercelResponse(res, response)
  } catch (error) {
    console.error('Statistics error:', error)
    res.status(500).json({ error: error.message, success: false })
  }
})

// Showcase / Marquee section (homepage images)
app.all('/api/showcase', async (req, res) => {
  try {
    const vercelReq = createVercelRequest(req)
    const response = await showcaseHandler(vercelReq, res)
    sendVercelResponse(res, response)
  } catch (error) {
    console.error('Showcase error:', error)
    res.status(500).json({ error: error.message, success: false })
  }
})
app.all('/api/showcase/*', async (req, res) => {
  try {
    // Pass raw req for multipart upload so formidable can parse body
    const response = await showcaseHandler(req, res)
    sendVercelResponse(res, response)
  } catch (error) {
    console.error('Showcase error:', error)
    res.status(500).json({ error: error.message, success: false })
  }
})

// Homepage sections (project grid)
app.all('/api/sections', async (req, res) => {
  try {
    const vercelReq = createVercelRequest(req)
    const response = await sectionsHandler(vercelReq, res)
    sendVercelResponse(res, response)
  } catch (error) {
    console.error('Sections error:', error)
    res.status(500).json({ error: error.message, success: false })
  }
})
app.all('/api/sections/*', async (req, res) => {
  try {
    const isUpload = req.method === 'POST' && (req.originalUrl || req.url || '').includes('/upload')
    const request = isUpload ? req : createVercelRequest(req)
    const response = await sectionsHandler(request, res)
    sendVercelResponse(res, response)
  } catch (error) {
    console.error('Sections error:', error)
    res.status(500).json({ error: error.message, success: false })
  }
})

// Section categories (for homepage sections dropdown)
app.use('/api/section-categories', async (req, res, next) => {
  try {
    const vercelReq = createVercelRequest(req)
    const response = await sectionCategoriesHandler(vercelReq)
    sendVercelResponse(res, response)
  } catch (error) {
    console.error('Section categories error:', error)
    res.status(500).json({ error: error.message, success: false })
  }
})

// Bookings (public submit + admin list/update) — use app.use so /api/bookings and /api/bookings/:id both match
app.use('/api/bookings', async (req, res) => {
  try {
    const vercelReq = createVercelRequest(req)
    const response = await bookingsHandler(vercelReq)
    sendVercelResponse(res, response)
  } catch (error) {
    console.error('Bookings error:', error)
    res.status(500).json({ error: error.message, success: false })
  }
})

// Settings - maintenance mode (GET public, PATCH admin)
app.get('/api/settings/maintenance', async (req, res) => {
  try {
    const vercelReq = createVercelRequest(req)
    const response = await settingsHandler(vercelReq)
    sendVercelResponse(res, response)
  } catch (error) {
    console.error('Settings error:', error)
    res.status(500).json({ error: error.message, success: false })
  }
})
app.patch('/api/settings/maintenance', async (req, res) => {
  try {
    const vercelReq = createVercelRequest(req)
    const response = await settingsHandler(vercelReq)
    sendVercelResponse(res, response)
  } catch (error) {
    console.error('Settings error:', error)
    res.status(500).json({ error: error.message, success: false })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Debug endpoint to test auth handler
app.post('/api/auth/debug', async (req, res) => {
  try {
    const vercelReq = createVercelRequest(req)
    res.json({
      express: {
        url: req.url,
        originalUrl: req.originalUrl,
        path: req.path,
        method: req.method,
      },
      vercel: {
        url: vercelReq.url,
        pathname: vercelReq.pathname,
        method: vercelReq.method,
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`)
  console.log(`💚 Health check: http://localhost:${PORT}/health`)
})
