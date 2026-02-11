import { requireAdmin } from './_middleware/auth.js'
import { getSupabaseClient } from './_utils/supabase.js'
import { uploadFileToR2, deleteFileFromR2, generateShowcaseFilePath } from './_utils/r2.js'
import { successResponse, errorResponse, corsHeaders } from './_utils/helpers.js'
import { handleCORS } from './_middleware/auth.js'
import { readFileSync } from 'fs'
import { unlinkSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

function getUrl(req) {
  const base = req.headers?.host ? `http://${req.headers.host}` : 'http://localhost:3001'
  const path = req.url?.startsWith('/') ? req.url : req.pathname || req.url || '/api/showcase'
  return new URL(path, base)
}

export default async function handler(req, res) {
  const corsResponse = handleCORS(req)
  if (corsResponse) return corsResponse

  const url = getUrl(req)
  const path = url.pathname.replace(/^\/api\/showcase\/?/, '') || '/'

  // GET /api/showcase - List images (public)
  if (path === '/' && req.method === 'GET') {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('showcase_images')
        .select('id, file_url, alt_text, display_order')
        .order('display_order', { ascending: true })

      if (error) {
        return errorResponse('Failed to fetch showcase images', 500, 'DATABASE_ERROR')
      }
      return successResponse(data || [], 200, corsHeaders())
    } catch (err) {
      console.error('Showcase GET error:', err)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  // POST /api/showcase/upload - Upload image (admin)
  if (path === 'upload' && req.method === 'POST') {
    try {
      const authResult = requireAdmin(req)
      if (!authResult.user) {
        return { ...authResult, headers: { ...corsHeaders(), ...(authResult.headers || {}) } }
      }

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
          maxFileSize: 200 * 1024 * 1024,   // 200MB per file
          maxTotalFileSize: 200 * 1024 * 1024, // 200MB total per request
        })
        form.parse(req, (err, fields, files) => {
          if (err) reject(err)
          else resolve([fields, files])
        })
      })

      const file = files?.image?.[0] || files?.image
      if (!file || !file.filepath) {
        return errorResponse('Missing file: send as "image" in form', 400, 'VALIDATION_ERROR')
      }

      const altText = (fields?.alt_text?.[0] ?? fields?.alt_text ?? '').trim() || 'Showcase image'
      const buffer = readFileSync(file.filepath)
      const originalName = file.originalFilename || file.newFilename || 'image.jpg'
      const mime = file.mimetype || 'image/jpeg'

      const filePath = generateShowcaseFilePath(originalName)
      let fileUrl
      try {
        const result = await uploadFileToR2(filePath, buffer, mime)
        fileUrl = result.fileUrl
      } catch (r2Err) {
        console.error('Showcase R2 upload error:', r2Err)
        if (existsSync(file.filepath)) { try { unlinkSync(file.filepath) } catch (_) {} }
        return errorResponse(
          process.env.R2_BUCKET_NAME ? 'Storage upload failed. Check R2 credentials.' : 'Storage not configured (R2).',
          500,
          'UPLOAD_ERROR'
        )
      }

      if (existsSync(file.filepath)) {
        try { unlinkSync(file.filepath) } catch (_) {}
      }

      const supabase = getSupabaseClient()
      const { count } = await supabase.from('showcase_images').select('*', { count: 'exact', head: true })
      const displayOrder = (count || 0)

      const { data: row, error } = await supabase
        .from('showcase_images')
        .insert({ file_path: filePath, file_url: fileUrl, alt_text: altText, display_order: displayOrder })
        .select('id, file_url, alt_text, display_order')
        .single()

      if (error) {
        console.error('Showcase insert error:', error.message, error.code)
        const msg = error.code === '42P01'
          ? 'Showcase table missing. Run supabase-showcase-migration.sql in Supabase.'
          : (error.message || 'Failed to save showcase image')
        return errorResponse(msg, 500, 'DATABASE_ERROR')
      }
      return successResponse(row, 201, corsHeaders())
    } catch (err) {
      console.error('Showcase upload error:', err)
      return errorResponse(err.message || 'Upload failed', 500, 'INTERNAL_ERROR')
    }
  }

  // DELETE /api/showcase/:id - Remove image (admin)
  const pathParts = path.split('/').filter(Boolean)
  const id = pathParts[0]
  if (pathParts.length === 1 && id && req.method === 'DELETE') {
    try {
      const authResult = requireAdmin(req)
      if (!authResult.user) {
        return { ...authResult, headers: { ...corsHeaders(), ...(authResult.headers || {}) } }
      }

      const supabase = getSupabaseClient()
      const { data: row, error: fetchError } = await supabase
        .from('showcase_images')
        .select('file_path')
        .eq('id', id)
        .single()

      if (fetchError || !row) {
        return errorResponse('Showcase image not found', 404, 'NOT_FOUND')
      }

      await deleteFileFromR2(row.file_path)
      const { error: deleteError } = await supabase.from('showcase_images').delete().eq('id', id)
      if (deleteError) {
        return errorResponse('Failed to delete record', 500, 'DATABASE_ERROR')
      }
      return successResponse({ message: 'Deleted' }, 200, corsHeaders())
    } catch (err) {
      console.error('Showcase DELETE error:', err)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  return errorResponse('Not found', 404, 'NOT_FOUND')
}
