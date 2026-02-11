import { requireClient } from './_middleware/auth.js'
import { getSupabaseClient } from './_utils/supabase.js'
import { generateClientToken } from './_utils/jwt.js'
import bcrypt from 'bcryptjs'
import { successResponse, errorResponse, corsHeaders, parseBody } from './_utils/helpers.js'
import { handleCORS } from './_middleware/auth.js'

export default async function handler(req) {
  // Handle CORS preflight
  const corsResponse = handleCORS(req)
  if (corsResponse) return corsResponse

  const url = new URL(req.url)
  const path = url.pathname.replace('/api/client', '')

  // POST /api/client/authenticate - Client login (only the single permanent link/slug works)
  if (path === '/authenticate' && req.method === 'POST') {
    try {
      const body = await parseBody(req)
      if (!body || typeof body !== 'object') {
        return errorResponse('Invalid request body', 400, 'VALIDATION_ERROR')
      }
      const { token, password } = body

      if (!token || !password) {
        return errorResponse('Token and password are required', 400, 'VALIDATION_ERROR')
      }

      const supabase = getSupabaseClient()
      const { data: gallery, error: galleryError } = await supabase
        .from('galleries')
        .select('id, name, client_name, event_date, password_hash, access_count')
        .eq('access_slug', token)
        .eq('is_active', true)
        .single()

      if (galleryError) {
        console.error('Client auth gallery lookup error:', galleryError.message, galleryError.code)
        return errorResponse('Invalid or expired link', 404, 'NOT_FOUND')
      }
      if (!gallery) {
        return errorResponse('Invalid or expired link', 404, 'NOT_FOUND')
      }

      if (!gallery.password_hash) {
        console.error('Client auth: gallery has no password_hash', gallery.id)
        return errorResponse('Gallery not configured', 500, 'CONFIG_ERROR')
      }

      const passwordMatch = await bcrypt.compare(password, gallery.password_hash)
      if (!passwordMatch) {
        return errorResponse('Invalid password', 401, 'INVALID_PASSWORD')
      }

      const accessToken = generateClientToken(gallery.id, '7d')

      const { error: updateError } = await supabase
        .from('galleries')
        .update({
          access_count: (gallery.access_count || 0) + 1,
          last_accessed: new Date().toISOString(),
        })
        .eq('id', gallery.id)

      if (updateError) {
        console.error('Client auth update access_count error:', updateError.message)
      }

      return successResponse(
        {
          access_token: accessToken,
          gallery: {
            id: gallery.id,
            name: gallery.name,
            client_name: gallery.client_name,
            event_date: gallery.event_date,
          },
        },
        200,
        corsHeaders()
      )
    } catch (error) {
      console.error('Client authentication error:', error?.message || error)
      console.error('Client authentication stack:', error?.stack)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  // GET /api/client/download/:fileId - Get download URL (presigned, forces attachment)
  const pathParts = path.split('/').filter(Boolean)
  if (pathParts[0] === 'download' && pathParts.length === 2 && req.method === 'GET') {
    const fileId = pathParts[1]
    try {
      const authResult = requireClient(req)
      if (authResult.error) {
        return { ...authResult.error, headers: corsHeaders() }
      }
      const { galleryId } = authResult
      const supabase = getSupabaseClient()
      const { data: file, error } = await supabase
        .from('media_files')
        .select('id, file_path, original_name, gallery_id')
        .eq('id', fileId)
        .eq('gallery_id', galleryId)
        .eq('upload_status', 'completed')
        .single()
      if (error || !file) {
        return errorResponse('File not found', 404, 'NOT_FOUND')
      }
      const { getPresignedDownloadUrl } = await import('./_utils/r2.js')
      const downloadUrl = await getPresignedDownloadUrl(file.file_path, file.original_name || file.file_name, 300)
      return successResponse({ download_url: downloadUrl }, 200, corsHeaders())
    } catch (err) {
      console.error('Download URL error:', err)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  // GET /api/client/gallery - Get client gallery
  if (path === '/gallery' && req.method === 'GET') {
    try {
      const authResult = requireClient(req)
      if (authResult.error) {
        return { ...authResult.error, headers: corsHeaders() }
      }

      const { galleryId } = authResult
      const supabase = getSupabaseClient()

      const { data: gallery, error: galleryError } = await supabase
        .from('galleries')
        .select('id, name, client_name, event_date, description')
        .eq('id', galleryId)
        .single()

      if (galleryError || !gallery) {
        return errorResponse('Gallery not found', 404, 'NOT_FOUND')
      }

      const { data: files, error: filesError } = await supabase
        .from('media_files')
        .select('id, file_name, original_name, file_url, thumbnail_url, file_type, file_size, width, height, display_order')
        .eq('gallery_id', galleryId)
        .eq('upload_status', 'completed')
        .order('display_order', { ascending: true })
        .order('uploaded_at', { ascending: true })

      if (filesError) {
        return errorResponse('Failed to fetch files', 500, 'DATABASE_ERROR')
      }

      return successResponse(
        {
          gallery: {
            id: gallery.id,
            name: gallery.name,
            client_name: gallery.client_name,
            event_date: gallery.event_date,
            description: gallery.description,
          },
          files: files || [],
        },
        200,
        corsHeaders()
      )
    } catch (error) {
      console.error('Get client gallery error:', error)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  return errorResponse('Not found', 404, 'NOT_FOUND')
}
