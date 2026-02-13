/**
 * Single Vercel serverless entry point — all /api/* routes run through this one function
 * to stay within the Hobby plan limit (max 12 functions). Local dev still uses server.js.
 */
import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '.env') })

const app = express()
app.use(cors())
app.use(express.json())

function createVercelRequest(req) {
  const fullPath = req.originalUrl || req.url
  const baseUrl = `http://${req.headers.host || 'localhost:3001'}`
  const url = new URL(fullPath, baseUrl)
  return {
    method: req.method,
    url: url.href,
    pathname: url.pathname,
    headers: req.headers,
    body: req.body,
  }
}

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

const authHandler = (await import('./auth.js')).default
const galleriesHandler = (await import('./galleries.js')).default
const clientHandler = (await import('./client.js')).default
const statisticsHandler = (await import('./statistics.js')).default
const showcaseHandler = (await import('./showcase.js')).default
const sectionsHandler = (await import('./sections.js')).default
const sectionCategoriesHandler = (await import('./section-categories.js')).default
const bookingsHandler = (await import('./bookings.js')).default
const settingsHandler = (await import('./settings.js')).default

app.post('/api/auth/login', async (req, res) => {
  try {
    const vercelReq = createVercelRequest(req)
    const response = await authHandler(vercelReq)
    sendVercelResponse(res, response)
  } catch (error) {
    console.error('Auth error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/api/auth/me', async (req, res) => {
  try {
    const vercelReq = createVercelRequest(req)
    const response = await authHandler(vercelReq)
    sendVercelResponse(res, response)
  } catch (error) {
    console.error('Auth error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

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
    const isUpload = req.method === 'POST' && (req.originalUrl || req.url || '').endsWith('/upload')
    const request = isUpload ? req : createVercelRequest(req)
    const response = await galleriesHandler(request, res)
    sendVercelResponse(res, response)
  } catch (error) {
    console.error('Galleries error:', error)
    res.status(500).json({ error: error.message, success: false })
  }
})

app.use('/api/client', async (req, res) => {
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
    const response = await showcaseHandler(req, res)
    sendVercelResponse(res, response)
  } catch (error) {
    console.error('Showcase error:', error)
    res.status(500).json({ error: error.message, success: false })
  }
})

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
    // Pass raw req for multipart upload and for upload-part (binary body). Other work-images routes need parsed JSON body.
    const path = (req.originalUrl || req.url || '').split('?')[0]
    const isMultipartUpload = req.method === 'POST' && path.endsWith('/work-images/upload') && !path.includes('upload-url') && !path.includes('upload-init') && !path.includes('upload-part') && !path.includes('upload-complete')
    const isUploadPart = req.method === 'POST' && path.includes('/work-images/upload-part')
    const request = isMultipartUpload || isUploadPart ? req : createVercelRequest(req)
    const response = await sectionsHandler(request, res)
    sendVercelResponse(res, response)
  } catch (error) {
    console.error('Sections error:', error)
    res.status(500).json({ error: error.message, success: false })
  }
})

app.use('/api/section-categories', async (req, res) => {
  try {
    const vercelReq = createVercelRequest(req)
    const response = await sectionCategoriesHandler(vercelReq)
    sendVercelResponse(res, response)
  } catch (error) {
    console.error('Section categories error:', error)
    res.status(500).json({ error: error.message, success: false })
  }
})

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default app
