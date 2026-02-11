import { requireAdmin } from './_middleware/auth.js'
import { getSupabaseClient } from './_utils/supabase.js'
import { generateQRCodeForSlug, generateAccessSlug } from './_utils/qr.js'
import { uploadFileToR2, generateFilePath } from './_utils/r2.js'
import bcrypt from 'bcryptjs'
import { successResponse, errorResponse, corsHeaders, parseBody } from './_utils/helpers.js'
import { handleCORS } from './_middleware/auth.js'
import { readFileSync, unlinkSync, existsSync } from 'fs'
import { tmpdir } from 'os'

export default async function handler(req, res) {
  const corsResponse = handleCORS(req)
  if (corsResponse) return corsResponse

  const baseUrl = req.headers?.host ? `http://${req.headers.host}` : 'http://localhost:3001'
  const url = (req.url && req.url.startsWith('http')) ? new URL(req.url) : new URL(req.url || '/', baseUrl)
  const path = url.pathname.replace(/^\/api\/galleries\/?/, '') || '/'

  // GET /api/galleries - List galleries
  if (path === '/' && req.method === 'GET') {
    try {
      const authResult = requireAdmin(req)
      if (authResult.error) {
        return { ...authResult, headers: corsHeaders() }
      }

      const supabase = getSupabaseClient()
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '20')
      const search = url.searchParams.get('search') || ''

      // Build query
      let query = supabase
        .from('galleries')
        .select('id, name, client_name, client_email, event_date, created_at, updated_at, access_count, last_accessed', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (search) {
        query = query.or(`name.ilike.%${search}%,client_name.ilike.%${search}%`)
      }

      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data: galleries, error, count } = await query

      if (error) {
        return errorResponse('Failed to fetch galleries', 500, 'DATABASE_ERROR')
      }

      // Get file counts
      const galleriesWithStats = await Promise.all(
        galleries.map(async (gallery) => {
          const { count: fileCount } = await supabase
            .from('media_files')
            .select('*', { count: 'exact', head: true })
            .eq('gallery_id', gallery.id)
            .eq('upload_status', 'completed')

          return {
            ...gallery,
            file_count: fileCount || 0,
          }
        })
      )

      return successResponse(
        {
          data: galleriesWithStats,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
          },
        },
        200,
        corsHeaders()
      )
    } catch (error) {
      console.error('Get galleries error:', error)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  // POST /api/galleries/create - Create gallery
  if (path === '/create' && req.method === 'POST') {
    try {
      const authResult = requireAdmin(req)
      if (authResult.error) {
        return { ...authResult, headers: corsHeaders() }
      }

      const { user } = authResult
      const body = await parseBody(req)
      const { name, client_name, client_email, password, description, event_date } = body

      if (!name || !password) {
        return errorResponse('Name and password are required', 400, 'VALIDATION_ERROR')
      }

      const passwordHash = await bcrypt.hash(password, 10)
      const accessSlug = generateAccessSlug()
      const supabase = getSupabaseClient()

      const { data: gallery, error } = await supabase
        .from('galleries')
        .insert({
          name,
          client_name,
          client_email,
          password_hash: passwordHash,
          description,
          event_date,
          created_by: user.id,
          access_slug: accessSlug,
        })
        .select()
        .single()

      if (error) {
        return errorResponse('Failed to create gallery', 500, 'DATABASE_ERROR')
      }

      return successResponse(
        {
          id: gallery.id,
          name: gallery.name,
          client_name: gallery.client_name,
          client_email: gallery.client_email,
          event_date: gallery.event_date,
          created_at: gallery.created_at,
        },
        201,
        corsHeaders()
      )
    } catch (error) {
      console.error('Create gallery error:', error)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  // Parse gallery ID from path
  const pathParts = path.split('/').filter(Boolean)
  const galleryId = pathParts[0]

  if (!galleryId) {
    return errorResponse('Gallery ID is required', 400, 'VALIDATION_ERROR')
  }

  // GET /api/galleries/[id] - Get gallery
  if (pathParts.length === 1 && req.method === 'GET') {
    try {
      const authResult = requireAdmin(req)
      if (authResult.error) {
        return { ...authResult, headers: corsHeaders() }
      }

      const supabase = getSupabaseClient()
      const { data: gallery, error } = await supabase
        .from('galleries')
        .select('*')
        .eq('id', galleryId)
        .single()

      if (error || !gallery) {
        return errorResponse('Gallery not found', 404, 'NOT_FOUND')
      }

      const { count: fileCount } = await supabase
        .from('media_files')
        .select('*', { count: 'exact', head: true })
        .eq('gallery_id', galleryId)
        .eq('upload_status', 'completed')

      return successResponse(
        {
          ...gallery,
          file_count: fileCount || 0,
        },
        200,
        corsHeaders()
      )
    } catch (error) {
      console.error('Get gallery error:', error)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  // GET /api/galleries/[id]/files - List files (admin)
  if (pathParts.length === 2 && pathParts[1] === 'files' && req.method === 'GET') {
    try {
      const authResult = requireAdmin(req)
      if (!authResult.user) {
        return { ...authResult, headers: { ...corsHeaders(), ...(authResult.headers || {}) } }
      }
      const supabase = getSupabaseClient()
      const { data: files, error } = await supabase
        .from('media_files')
        .select('id, file_name, original_name, file_url, thumbnail_url, file_type, file_size, display_order, uploaded_at')
        .eq('gallery_id', galleryId)
        .eq('upload_status', 'completed')
        .order('display_order', { ascending: true })
        .order('uploaded_at', { ascending: true })
      if (error) return errorResponse('Failed to fetch files', 500, 'DATABASE_ERROR')
      return successResponse(files || [], 200, corsHeaders())
    } catch (err) {
      console.error('Get gallery files error:', err)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  // PUT /api/galleries/[id] - Update gallery
  if (pathParts.length === 1 && req.method === 'PUT') {
    try {
      const authResult = requireAdmin(req)
      if (authResult.error) {
        return { ...authResult, headers: corsHeaders() }
      }

      const supabase = getSupabaseClient()
      const body = await parseBody(req)
      const { name, client_name, client_email, password, description, event_date } = body

      const updateData = {}
      if (name) updateData.name = name
      if (client_name !== undefined) updateData.client_name = client_name
      if (client_email !== undefined) updateData.client_email = client_email
      if (description !== undefined) updateData.description = description
      if (event_date !== undefined) updateData.event_date = event_date
      if (password) {
        updateData.password_hash = await bcrypt.hash(password, 10)
      }

      const { data: gallery, error } = await supabase
        .from('galleries')
        .update(updateData)
        .eq('id', galleryId)
        .select()
        .single()

      if (error) {
        return errorResponse('Failed to update gallery', 500, 'DATABASE_ERROR')
      }

      return successResponse(
        {
          id: gallery.id,
          name: gallery.name,
          updated_at: gallery.updated_at,
        },
        200,
        corsHeaders()
      )
    } catch (error) {
      console.error('Update gallery error:', error)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  // DELETE /api/galleries/[id] - Delete gallery
  if (pathParts.length === 1 && req.method === 'DELETE') {
    try {
      const authResult = requireAdmin(req)
      if (authResult.error) {
        return { ...authResult, headers: corsHeaders() }
      }

      const supabase = getSupabaseClient()
      const { data: files } = await supabase
        .from('media_files')
        .select('file_path')
        .eq('gallery_id', galleryId)

      if (files && files.length > 0) {
        const { deleteFileFromR2 } = await import('./_utils/r2.js')
        await Promise.all(files.map(file => deleteFileFromR2(file.file_path)))
      }

      const { error } = await supabase
        .from('galleries')
        .delete()
        .eq('id', galleryId)

      if (error) {
        return errorResponse('Failed to delete gallery', 500, 'DATABASE_ERROR')
      }

      return successResponse(
        { message: 'Gallery deleted successfully' },
        200,
        corsHeaders()
      )
    } catch (error) {
      console.error('Delete gallery error:', error)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  // GET /api/galleries/[id]/qr - Get the single permanent QR code (no regeneration)
  if (pathParts.length === 2 && pathParts[1] === 'qr' && req.method === 'GET') {
    try {
      const authResult = requireAdmin(req)
      if (authResult.error) {
        return { ...authResult, headers: corsHeaders() }
      }

      const supabase = getSupabaseClient()
      const { data: gallery, error: fetchError } = await supabase
        .from('galleries')
        .select('id, access_slug')
        .eq('id', galleryId)
        .single()

      if (fetchError || !gallery) {
        return errorResponse('Gallery not found', 404, 'NOT_FOUND')
      }

      let slug = gallery.access_slug
      if (!slug) {
        slug = generateAccessSlug()
        await supabase.from('galleries').update({ access_slug: slug }).eq('id', galleryId)
      }

      const qrData = await generateQRCodeForSlug(slug)

      return successResponse(
        {
          qr_code_data: qrData.qrCodeDataUrl,
          gallery_url: qrData.galleryUrl,
        },
        200,
        corsHeaders()
      )
    } catch (error) {
      console.error('QR code error:', error)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  // POST /api/galleries/[id]/upload - Upload file (requires raw req for multipart)
  if (pathParts.length === 2 && pathParts[1] === 'upload' && req.method === 'POST') {
    try {
      const authResult = requireAdmin(req)
      if (!authResult.user) {
        return { ...authResult, headers: { ...corsHeaders(), ...(authResult.headers || {}) } }
      }
      const userId = authResult.user.id

      const contentType = req.headers['content-type'] || ''
      if (!contentType.includes('multipart/form-data')) {
        return errorResponse('Content-Type must be multipart/form-data', 400, 'VALIDATION_ERROR')
      }

      const { formidable } = await import('formidable')
      const uploadDir = tmpdir()
      const [fields, files] = await new Promise((resolve, reject) => {
        const form = formidable({
          uploadDir,
          keepExtensions: true,
          maxFileSize: 200 * 1024 * 1024,
          maxTotalFileSize: 200 * 1024 * 1024,
        })
        form.parse(req, (err, f, files) => {
          if (err) reject(err)
          else resolve([f, files])
        })
      })

      const file = files?.file?.[0] || files?.file
      if (!file || !file.filepath) {
        return errorResponse('Missing file: send as "file" in form', 400, 'VALIDATION_ERROR')
      }

      const supabase = getSupabaseClient()
      const { data: gallery } = await supabase
        .from('galleries')
        .select('id')
        .eq('id', galleryId)
        .single()

      if (!gallery) {
        if (existsSync(file.filepath)) try { unlinkSync(file.filepath) } catch (_) {}
        return errorResponse('Gallery not found', 404, 'NOT_FOUND')
      }

      const buffer = readFileSync(file.filepath)
      const originalName = file.originalFilename || file.newFilename || 'file'
      const mime = file.mimetype || 'application/octet-stream'
      const fileType = (mime.startsWith('image/') ? 'image' : mime.startsWith('video/') ? 'video' : 'image')
      const filePath = generateFilePath(galleryId, originalName)

      let fileUrl
      try {
        const result = await uploadFileToR2(filePath, buffer, mime)
        fileUrl = result.fileUrl
      } catch (r2Err) {
        console.error('Gallery R2 upload error:', r2Err)
        if (existsSync(file.filepath)) try { unlinkSync(file.filepath) } catch (_) {}
        return errorResponse('Storage upload failed', 500, 'UPLOAD_ERROR')
      }

      if (existsSync(file.filepath)) try { unlinkSync(file.filepath) } catch (_) {}

      const { count } = await supabase
        .from('media_files')
        .select('*', { count: 'exact', head: true })
        .eq('gallery_id', galleryId)
      const displayOrder = (count || 0)

      const { data: row, error } = await supabase
        .from('media_files')
        .insert({
          gallery_id: galleryId,
          file_name: filePath.split('/').pop(),
          original_name: originalName,
          file_path: filePath,
          file_url: fileUrl,
          file_type: fileType,
          mime_type: mime,
          file_size: buffer.length,
          upload_status: 'completed',
          uploaded_by: userId,
          display_order: displayOrder,
        })
        .select('id, file_url, original_name, file_type')
        .single()

      if (error) {
        console.error('Gallery media_files insert error:', error.message)
        return errorResponse('Failed to save file record', 500, 'DATABASE_ERROR')
      }

      return successResponse(
        { message: 'File uploaded', file: row },
        201,
        corsHeaders()
      )
    } catch (error) {
      console.error('Upload error:', error)
      return errorResponse(error.message || 'Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  return errorResponse('Not found', 404, 'NOT_FOUND')
}
