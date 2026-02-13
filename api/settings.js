import { requireAdmin } from './_middleware/auth.js'
import { getSupabaseClient } from './_utils/supabase.js'
import { successResponse, errorResponse, corsHeaders } from './_utils/helpers.js'
import { handleCORS } from './_middleware/auth.js'
import { parseBody } from './_utils/helpers.js'
import { readFileSync, unlinkSync, existsSync } from 'fs'
import { uploadFileToR2, generateClientAccessBackgroundPath } from './_utils/r2.js'

/**
 * GET /api/settings/maintenance — public, returns { enabled, message }
 * PATCH /api/settings/maintenance — admin only, body: { enabled?, message? }
 * GET /api/settings/client-access — public, returns { background_url }
 * POST /api/settings/client-access-background — admin only, multipart image upload
 */
export default async function handler(req) {
  const corsResponse = handleCORS(req)
  if (corsResponse) return corsResponse

  const path = req.pathname || (req.url && new URL(req.url).pathname) || ''

  // GET /api/settings/client-access — public
  if (path.endsWith('/client-access') && !path.includes('client-access-background') && req.method === 'GET') {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'client_access_background_url')
        .single()
      const backgroundUrl = (data?.value && String(data.value).trim()) || ''
      return successResponse({ background_url: backgroundUrl }, 200, corsHeaders())
    } catch (err) {
      console.error('Client access settings GET error:', err)
      return successResponse({ background_url: '' }, 200, corsHeaders())
    }
  }

  // POST /api/settings/client-access-background — admin upload
  if (path.endsWith('/client-access-background') && req.method === 'POST') {
    try {
      const authResult = requireAdmin(req)
      if (authResult.error) {
        return { ...authResult, headers: corsHeaders() }
      }
      const contentType = req.headers['content-type'] || ''
      if (!contentType.includes('multipart/form-data')) {
        return errorResponse('Content-Type must be multipart/form-data', 400, 'VALIDATION_ERROR')
      }
      const { formidable } = await import('formidable')
      const { tmpdir } = await import('os')
      const uploadDir = tmpdir()
      const [fields, files] = await new Promise((resolve, reject) => {
        const form = formidable({ uploadDir, keepExtensions: true, maxFileSize: 20 * 1024 * 1024 })
        form.parse(req, (err, f, files) => (err ? reject(err) : resolve([f, files])))
      })
      const file = files?.image?.[0] || files?.image
      if (!file || !file.filepath) {
        return errorResponse('Missing file: send as "image" in form', 400, 'VALIDATION_ERROR')
      }
      const buffer = readFileSync(file.filepath)
      const originalName = file.originalFilename || file.newFilename || 'image.jpg'
      const mime = file.mimetype || 'image/jpeg'
      const filePath = generateClientAccessBackgroundPath(originalName)
      let fileUrl
      try {
        const result = await uploadFileToR2(filePath, buffer, mime)
        fileUrl = result.fileUrl
      } catch (r2Err) {
        console.error('Client access background R2 error:', r2Err)
        if (existsSync(file.filepath)) try { unlinkSync(file.filepath) } catch (_) {}
        return errorResponse('Storage upload failed', 500, 'UPLOAD_ERROR')
      }
      if (existsSync(file.filepath)) try { unlinkSync(file.filepath) } catch (_) {}
      const supabase = getSupabaseClient()
      const { error: updateError } = await supabase
        .from('site_settings')
        .upsert({ key: 'client_access_background_url', value: fileUrl, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      if (updateError) {
        console.error('site_settings update error:', updateError.message)
        return errorResponse('Failed to save setting', 500, 'DATABASE_ERROR')
      }
      return successResponse({ background_url: fileUrl }, 200, corsHeaders())
    } catch (err) {
      console.error('Client access background upload error:', err)
      return errorResponse(err.message || 'Upload failed', 500, 'INTERNAL_ERROR')
    }
  }

  if (!path.endsWith('/maintenance')) {
    return errorResponse('Not found', 404, 'NOT_FOUND')
  }

  if (req.method === 'GET') {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('maintenance')
        .select('enabled, message')
        .eq('id', 1)
        .single()

      if (error) {
        console.error('Maintenance GET error:', error)
        return successResponse(
          { enabled: false, message: "We'll be back soon." },
          200,
          corsHeaders()
        )
      }

      return successResponse(
        { enabled: !!data?.enabled, message: data?.message || "We'll be back soon." },
        200,
        corsHeaders()
      )
    } catch (err) {
      console.error('Maintenance GET error:', err)
      return successResponse(
        { enabled: false, message: "We'll be back soon." },
        200,
        corsHeaders()
      )
    }
  }

  if (req.method === 'PATCH') {
    const authResult = requireAdmin(req)
    if (authResult.error) {
      return { ...authResult, headers: corsHeaders() }
    }

    try {
      const body = await parseBody(req) || {}
      const supabase = getSupabaseClient()

      const updates = { updated_at: new Date().toISOString() }
      if (typeof body.enabled === 'boolean') updates.enabled = body.enabled
      if (typeof body.message === 'string') updates.message = body.message.trim() || "We'll be back soon."

      const { data, error } = await supabase
        .from('maintenance')
        .update(updates)
        .eq('id', 1)
        .select('enabled, message')
        .single()

      if (error) {
        console.error('Maintenance PATCH error:', error)
        return errorResponse('Failed to update maintenance settings', 500, 'UPDATE_FAILED')
      }

      return successResponse(
        { enabled: !!data?.enabled, message: data?.message || "We'll be back soon." },
        200,
        corsHeaders()
      )
    } catch (err) {
      console.error('Maintenance PATCH error:', err)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  return errorResponse('Method not allowed', 405, 'METHOD_NOT_ALLOWED')
}
