import { requireAdmin } from './_middleware/auth.js'
import { getSupabaseClient } from './_utils/supabase.js'
import {
  uploadFileToR2,
  deleteFileFromR2,
  generateSectionFilePath,
  generateSectionWorkImageFilePath,
  getPresignedPutUrl,
  createMultipartUpload,
  uploadPart,
  completeMultipartUpload,
  abortMultipartUpload,
  getPresignedUploadPartUrl,
} from './_utils/r2.js'
import { successResponse, errorResponse, corsHeaders, parseBody } from './_utils/helpers.js'
import { handleCORS } from './_middleware/auth.js'
import { readFileSync, unlinkSync, existsSync } from 'fs'
import { tmpdir } from 'os'

function getUrl(req) {
  const base = req.headers?.host ? `http://${req.headers.host}` : 'http://localhost:3001'
  const path = req.originalUrl || req.url || req.pathname || '/api/sections'
  const fullPath = path.startsWith('http') ? path : path.startsWith('/') ? path : `/${path}`
  return new URL(fullPath, base)
}

export default async function handler(req, res) {
  const corsResponse = handleCORS(req)
  if (corsResponse) return corsResponse

  const url = getUrl(req)
  const path = url.pathname.replace(/^\/api\/sections\/?/, '') || '/'

  const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  function withDisplay(sections, categories = []) {
    const catMap = Object.fromEntries((categories || []).map((c) => [c.id, c.name]))
    return (sections || []).map((s) => {
      const categoryName = s.category_id ? catMap[s.category_id] : s.category
      const monthYear = s.section_month && s.section_year
        ? `${MONTH_NAMES[s.section_month]} ${s.section_year}`
        : (s.year || '')
      return {
        ...s,
        category: categoryName || s.category || '',
        year: monthYear || s.year || '',
        date_display: monthYear || s.year || '',
      }
    })
  }

  // GET /api/sections - List sections (public)
  if (path === '/' && req.method === 'GET') {
    try {
      const supabase = getSupabaseClient()
      const { data: sections, error } = await supabase
        .from('homepage_sections')
        .select('id, title, category, year, category_id, section_month, section_year, file_url, alt_text, display_order')
        .order('display_order', { ascending: true })

      if (error) {
        return errorResponse('Failed to fetch sections', 500, 'DATABASE_ERROR')
      }

      const categoryIds = [...new Set((sections || []).map((s) => s.category_id).filter(Boolean))]
      let categories = []
      if (categoryIds.length > 0) {
        const { data: cats } = await supabase.from('section_categories').select('id, name').in('id', categoryIds)
        categories = cats || []
      }
      const out = withDisplay(sections, categories)
      return successResponse(out, 200, corsHeaders())
    } catch (err) {
      console.error('Sections GET error:', err)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  // POST /api/sections/upload - Add section (admin)
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
          maxFileSize: 200 * 1024 * 1024,
          maxTotalFileSize: 200 * 1024 * 1024,
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

      const getField = (name) => {
        const v = fields?.[name]
        return (Array.isArray(v) ? v[0] : v) ?? ''
      }
      const title = String(getField('title') || '').trim() || 'Untitled'
      const categoryId = String(getField('category_id') || '').trim() || null
      const sectionMonth = parseInt(getField('section_month'), 10)
      const sectionYear = parseInt(getField('section_year'), 10)
      const altText = String(getField('alt_text') || '').trim() || title

      const buffer = readFileSync(file.filepath)
      const originalName = file.originalFilename || file.newFilename || 'image.jpg'
      const mime = file.mimetype || 'image/jpeg'

      const filePath = generateSectionFilePath(originalName)
      let fileUrl
      try {
        const result = await uploadFileToR2(filePath, buffer, mime)
        fileUrl = result.fileUrl
      } catch (r2Err) {
        console.error('Section R2 upload error:', r2Err)
        if (existsSync(file.filepath)) { try { unlinkSync(file.filepath) } catch (_) {} }
        return errorResponse(
          process.env.R2_BUCKET_NAME ? 'Storage upload failed.' : 'Storage not configured (R2).',
          500,
          'UPLOAD_ERROR'
        )
      }

      if (existsSync(file.filepath)) {
        try { unlinkSync(file.filepath) } catch (_) {}
      }

      const supabase = getSupabaseClient()
      const { count } = await supabase.from('homepage_sections').select('*', { count: 'exact', head: true })
      const displayOrder = count ?? 0

      let categoryName = ''
      if (categoryId) {
        const { data: cat } = await supabase.from('section_categories').select('name').eq('id', categoryId).single()
        categoryName = cat?.name || ''
      }

      const { data: row, error } = await supabase
        .from('homepage_sections')
        .insert({
          title,
          category: categoryName,
          year: sectionYear ? `${sectionYear}` : '',
          category_id: categoryId || null,
          section_month: (sectionMonth >= 1 && sectionMonth <= 12) ? sectionMonth : null,
          section_year: sectionYear || null,
          file_path: filePath,
          file_url: fileUrl,
          alt_text: altText,
          display_order: displayOrder,
        })
        .select('id, title, category, year, category_id, section_month, section_year, file_url, alt_text, display_order')
        .single()

      if (error) {
        console.error('Section insert error:', error.message, error.code)
        const msg = error.code === '42P01'
          ? 'Table homepage_sections missing. Run supabase-homepage-sections-migration.sql.'
          : (error.message || 'Failed to save section')
        return errorResponse(msg, 500, 'DATABASE_ERROR')
      }
      return successResponse(row, 201, corsHeaders())
    } catch (err) {
      console.error('Section upload error:', err)
      return errorResponse(err.message || 'Upload failed', 500, 'INTERNAL_ERROR')
    }
  }

  // PATCH /api/sections/reorder - Reorder sections (admin)
  if (path === 'reorder' && req.method === 'PATCH') {
    try {
      const authResult = requireAdmin(req)
      if (!authResult.user) {
        return { ...authResult, headers: { ...corsHeaders(), ...(authResult.headers || {}) } }
      }

      const body = await parseBody(req)
      const order = body?.order
      if (!Array.isArray(order) || order.length === 0) {
        return errorResponse('Body must include { "order": [id, ...] }', 400, 'VALIDATION_ERROR')
      }

      const supabase = getSupabaseClient()
      for (let i = 0; i < order.length; i++) {
        await supabase.from('homepage_sections').update({ display_order: i }).eq('id', order[i])
      }
      return successResponse({ message: 'Reordered' }, 200, corsHeaders())
    } catch (err) {
      console.error('Sections reorder error:', err)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  const pathParts = path.split('/').filter(Boolean)
  const id = pathParts[0]

  // GET /api/sections/:id - Single section (public, for work detail page)
  if (pathParts.length === 1 && id && req.method === 'GET') {
    try {
      const supabase = getSupabaseClient()
      const { data: section, error } = await supabase
        .from('homepage_sections')
        .select('id, title, category, year, category_id, section_month, section_year, file_url, alt_text, display_order')
        .eq('id', id)
        .single()

      if (error || !section) {
        return errorResponse('Section not found', 404, 'NOT_FOUND')
      }

      let categoryName = section.category
      if (section.category_id) {
        const { data: cat } = await supabase.from('section_categories').select('name').eq('id', section.category_id).single()
        categoryName = cat?.name || section.category
      }
      const monthYear = section.section_month && section.section_year
        ? `${MONTH_NAMES[section.section_month]} ${section.section_year}`
        : (section.year || '')
      const out = {
        ...section,
        category: categoryName || '',
        year: monthYear,
        date_display: monthYear,
      }
      return successResponse(out, 200, corsHeaders())
    } catch (err) {
      console.error('Section GET by id error:', err)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  // PUT /api/sections/:id - Update section (admin)
  if (pathParts.length === 1 && id && req.method === 'PUT') {
    try {
      const authResult = requireAdmin(req)
      if (!authResult.user) {
        return { ...authResult, headers: { ...corsHeaders(), ...(authResult.headers || {}) } }
      }

      const body = await parseBody(req)
      if (!body || typeof body !== 'object') {
        return errorResponse('Invalid body', 400, 'VALIDATION_ERROR')
      }

      const supabase = getSupabaseClient()
      const updateData = {}
      if (body.title !== undefined) updateData.title = String(body.title).trim() || 'Untitled'
      if (body.alt_text !== undefined) updateData.alt_text = String(body.alt_text).trim()
      if (body.category_id !== undefined) updateData.category_id = body.category_id || null
      if (body.section_month !== undefined) {
        const m = parseInt(body.section_month, 10)
        updateData.section_month = (m >= 1 && m <= 12) ? m : null
      }
      if (body.section_year !== undefined) {
        const y = parseInt(body.section_year, 10)
        updateData.section_year = y || null
        updateData.year = y ? String(y) : ''
      }
      if (body.category_id !== undefined) {
        const cid = body.category_id || null
        updateData.category_id = cid
        if (cid) {
          const { data: cat } = await supabase.from('section_categories').select('name').eq('id', cid).single()
          updateData.category = cat?.name || ''
        } else {
          updateData.category = ''
        }
      }

      const { data: row, error } = await supabase
        .from('homepage_sections')
        .update(updateData)
        .eq('id', id)
        .select('id, title, category, year, category_id, section_month, section_year, file_url, alt_text, display_order')
        .single()

      if (error || !row) {
        return errorResponse('Section not found', 404, 'NOT_FOUND')
      }
      const out = withDisplay([row])[0]
      return successResponse(out, 200, corsHeaders())
    } catch (err) {
      console.error('Section update error:', err)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  // DELETE /api/sections/:id - Remove section (admin)
  if (pathParts.length === 1 && id && req.method === 'DELETE') {
    try {
      const authResult = requireAdmin(req)
      if (!authResult.user) {
        return { ...authResult, headers: { ...corsHeaders(), ...(authResult.headers || {}) } }
      }

      const supabase = getSupabaseClient()
      const { data: row, error: fetchError } = await supabase
        .from('homepage_sections')
        .select('file_path')
        .eq('id', id)
        .single()

      if (fetchError || !row) {
        return errorResponse('Section not found', 404, 'NOT_FOUND')
      }

      try {
        await deleteFileFromR2(row.file_path)
      } catch (_) {}
      const { error: deleteError } = await supabase.from('homepage_sections').delete().eq('id', id)
      if (deleteError) {
        return errorResponse('Failed to delete record', 500, 'DATABASE_ERROR')
      }
      return successResponse({ message: 'Deleted' }, 200, corsHeaders())
    } catch (err) {
      console.error('Section DELETE error:', err)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  // Work images under a section (below poster on work detail page)
  const sectionId = pathParts[0]
  const isWorkImages = pathParts[1] === 'work-images'

  // GET /api/sections/:sectionId/work-images - List work media (public)
  if (pathParts.length === 2 && isWorkImages && req.method === 'GET') {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('section_work_images')
        .select('id, file_url, alt_text, display_order, file_type')
        .eq('section_id', sectionId)
        .order('display_order', { ascending: true })

      if (error) {
        return errorResponse('Failed to fetch work images', 500, 'DATABASE_ERROR')
      }
      return successResponse(data || [], 200, corsHeaders())
    } catch (err) {
      console.error('Work images GET error:', err)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  const CHUNK_SIZE = 5 * 1024 * 1024 // 5 MB min part size (S3/R2); parts use presigned URLs (no large body through Vercel)

  // POST /api/sections/:sectionId/work-images/upload-init - Start chunked upload (large files)
  if (pathParts.length === 3 && pathParts[2] === 'upload-init' && isWorkImages && req.method === 'POST') {
    try {
      const authResult = requireAdmin(req)
      if (!authResult.user) {
        return { ...authResult, headers: { ...corsHeaders(), ...(authResult.headers || {}) } }
      }
      const body = await parseBody(req)
      const filename = (body?.filename && String(body.filename).trim()) || 'file'
      const contentType = (body?.content_type && String(body.content_type).trim()) || 'application/octet-stream'
      const supabase = getSupabaseClient()
      const { data: section } = await supabase.from('homepage_sections').select('id').eq('id', sectionId).single()
      if (!section) {
        return errorResponse('Section not found', 404, 'NOT_FOUND')
      }
      const filePath = generateSectionWorkImageFilePath(sectionId, filename)
      const { uploadId } = await createMultipartUpload(filePath, contentType)
      return successResponse({ uploadId, filePath, partSize: CHUNK_SIZE }, 200, corsHeaders())
    } catch (err) {
      console.error('Work images upload-init error:', err)
      return errorResponse(err.message || 'Failed to init upload', 500, 'INTERNAL_ERROR')
    }
  }

  // POST /api/sections/:sectionId/work-images/upload-part-url - Get presigned URL to upload one part (client PUTs part to R2; 5MB min part size)
  if (pathParts.length === 3 && pathParts[2] === 'upload-part-url' && isWorkImages && req.method === 'POST') {
    try {
      const authResult = requireAdmin(req)
      if (!authResult.user) {
        return { ...authResult, headers: { ...corsHeaders(), ...(authResult.headers || {}) } }
      }
      const body = await parseBody(req)
      const uploadId = body?.uploadId && String(body.uploadId).trim()
      const filePath = body?.filePath && String(body.filePath).trim()
      const partNumber = parseInt(body?.partNumber, 10)
      if (!uploadId || !filePath || !partNumber || partNumber < 1) {
        return errorResponse('Missing uploadId, filePath, or partNumber', 400, 'VALIDATION_ERROR')
      }
      const putUrl = await getPresignedUploadPartUrl(uploadId, filePath, partNumber, 900)
      return successResponse({ putUrl }, 200, corsHeaders())
    } catch (err) {
      console.error('Work images upload-part-url error:', err)
      return errorResponse(err.message || 'Failed to get part URL', 500, 'INTERNAL_ERROR')
    }
  }

  // POST /api/sections/:sectionId/work-images/upload-part - Upload one chunk (body = raw bytes)
  if (pathParts.length === 3 && pathParts[2] === 'upload-part' && isWorkImages && req.method === 'POST') {
    try {
      const authResult = requireAdmin(req)
      if (!authResult.user) {
        return { ...authResult, headers: { ...corsHeaders(), ...(authResult.headers || {}) } }
      }
      const uploadId = req.headers['x-upload-id'] && String(req.headers['x-upload-id']).trim()
      const filePath = req.headers['x-file-path'] && String(req.headers['x-file-path']).trim()
      const partNumber = parseInt(req.headers['x-part-number'], 10)
      if (!uploadId || !filePath || !partNumber || partNumber < 1) {
        return errorResponse('Missing X-Upload-Id, X-File-Path, or X-Part-Number', 400, 'VALIDATION_ERROR')
      }
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      const body = Buffer.concat(chunks)
      if (body.length === 0) {
        return errorResponse('Empty part body', 400, 'VALIDATION_ERROR')
      }
      const { etag } = await uploadPart(uploadId, filePath, partNumber, body)
      return successResponse({ etag: etag.replace(/"/g, '') }, 200, corsHeaders())
    } catch (err) {
      console.error('Work images upload-part error:', err)
      return errorResponse(err.message || 'Failed to upload part', 500, 'INTERNAL_ERROR')
    }
  }

  // POST /api/sections/:sectionId/work-images/upload-abort - Abort chunked upload (clean up orphaned multipart)
  if (pathParts.length === 3 && pathParts[2] === 'upload-abort' && isWorkImages && req.method === 'POST') {
    try {
      const authResult = requireAdmin(req)
      if (!authResult.user) {
        return { ...authResult, headers: { ...corsHeaders(), ...(authResult.headers || {}) } }
      }
      const body = await parseBody(req)
      const uploadId = body?.uploadId && String(body.uploadId).trim()
      const filePath = body?.filePath && String(body.filePath).trim()
      if (!uploadId || !filePath) {
        return errorResponse('Missing uploadId or filePath', 400, 'VALIDATION_ERROR')
      }
      await abortMultipartUpload(uploadId, filePath)
      return successResponse({ ok: true }, 200, corsHeaders())
    } catch (err) {
      console.error('Work images upload-abort error:', err)
      return errorResponse(err.message || 'Failed to abort', 500, 'INTERNAL_ERROR')
    }
  }

  // POST /api/sections/:sectionId/work-images/upload-complete - Finish chunked upload, insert DB row
  if (pathParts.length === 3 && pathParts[2] === 'upload-complete' && isWorkImages && req.method === 'POST') {
    try {
      const authResult = requireAdmin(req)
      if (!authResult.user) {
        return { ...authResult, headers: { ...corsHeaders(), ...(authResult.headers || {}) } }
      }
      const body = await parseBody(req)
      const uploadId = body?.uploadId && String(body.uploadId).trim()
      const filePath = body?.filePath && String(body.filePath).trim()
      const parts = body?.parts && Array.isArray(body.parts) ? body.parts : []
      if (!uploadId || !filePath || parts.length === 0) {
        return errorResponse('Missing uploadId, filePath, or parts', 400, 'VALIDATION_ERROR')
      }
      const CDN_URL = process.env.R2_CDN_URL || ''
      if (!CDN_URL) {
        return errorResponse('R2_CDN_URL is not set', 500, 'CONFIG_ERROR')
      }
      const sortedParts = parts
        .filter((p) => p.partNumber >= 1 && p.etag)
        .sort((a, b) => a.partNumber - b.partNumber)
      if (sortedParts.length === 0) {
        return errorResponse('Invalid parts array', 400, 'VALIDATION_ERROR')
      }
      const { fileUrl } = await completeMultipartUpload(
        uploadId,
        filePath,
        sortedParts.map((p) => ({ PartNumber: p.partNumber, ETag: `"${p.etag.replace(/"/g, '')}"` }))
      )
      function mimeToFileType(mime) {
        if (!mime) return 'file'
        if (mime.startsWith('image/')) return 'image'
        if (mime.startsWith('video/')) return 'video'
        return 'file'
      }
      const fileType = body?.file_type ? String(body.file_type).trim() : 'file'
      const altText = (body?.alt_text && String(body.alt_text).trim()) || ''
      const supabase = getSupabaseClient()
      const { count: existingCount } = await supabase.from('section_work_images').select('*', { count: 'exact', head: true }).eq('section_id', sectionId)
      const displayOrder = existingCount ?? 0
      const { data: row, error } = await supabase
        .from('section_work_images')
        .insert({
          section_id: sectionId,
          file_path: filePath,
          file_url: fileUrl,
          alt_text: altText,
          display_order: displayOrder,
          file_type: mimeToFileType(fileType),
        })
        .select('id, file_url, alt_text, display_order, file_type')
        .single()
      if (error) {
        return errorResponse(error.message || 'Failed to save record', 500, 'DATABASE_ERROR')
      }
      return successResponse(row, 201, corsHeaders())
    } catch (err) {
      console.error('Work images upload-complete error:', err)
      return errorResponse(err.message || 'Failed to complete upload', 500, 'INTERNAL_ERROR')
    }
  }

  // POST /api/sections/:sectionId/work-images/upload-url - Get presigned URL for direct upload (avoids 413, large files)
  if (pathParts.length === 3 && pathParts[2] === 'upload-url' && isWorkImages && req.method === 'POST') {
    try {
      const authResult = requireAdmin(req)
      if (!authResult.user) {
        return { ...authResult, headers: { ...corsHeaders(), ...(authResult.headers || {}) } }
      }
      const body = await parseBody(req)
      const filename = (body?.filename && String(body.filename).trim()) || 'file'
      const contentType = (body?.content_type && String(body.content_type).trim()) || 'application/octet-stream'
      const supabase = getSupabaseClient()
      const { data: section } = await supabase.from('homepage_sections').select('id').eq('id', sectionId).single()
      if (!section) {
        return errorResponse('Section not found', 404, 'NOT_FOUND')
      }
      const filePath = generateSectionWorkImageFilePath(sectionId, filename)
      const putUrl = await getPresignedPutUrl(filePath, contentType, 900)
      const CDN_URL = process.env.R2_CDN_URL || ''
      const fileUrl = CDN_URL ? `${CDN_URL.replace(/\/$/, '')}/${filePath}` : putUrl
      return successResponse({ putUrl, filePath, fileUrl }, 200, corsHeaders())
    } catch (err) {
      console.error('Work images upload-url error:', err)
      return errorResponse(err.message || 'Failed to get upload URL', 500, 'INTERNAL_ERROR')
    }
  }

  // POST /api/sections/:sectionId/work-images/confirm - Register file after direct upload to R2
  if (pathParts.length === 3 && pathParts[2] === 'confirm' && isWorkImages && req.method === 'POST') {
    try {
      const authResult = requireAdmin(req)
      if (!authResult.user) {
        return { ...authResult, headers: { ...corsHeaders(), ...(authResult.headers || {}) } }
      }
      const body = await parseBody(req)
      const filePath = body?.filePath && String(body.filePath).trim()
      if (!filePath) {
        return errorResponse('Missing filePath', 400, 'VALIDATION_ERROR')
      }
      const CDN_URL = process.env.R2_CDN_URL || ''
      if (!CDN_URL) {
        return errorResponse('R2_CDN_URL is not set; image URLs cannot be built', 500, 'CONFIG_ERROR')
      }
      function mimeToFileType(mime) {
        if (!mime) return 'file'
        if (mime.startsWith('image/')) return 'image'
        if (mime.startsWith('video/')) return 'video'
        return 'file'
      }
      const fileType = body?.file_type ? String(body.file_type).trim() : 'file'
      const altText = (body?.alt_text && String(body.alt_text).trim()) || ''
      const fileUrl = `${CDN_URL.replace(/\/$/, '')}/${filePath}`
      const supabase = getSupabaseClient()
      const { count: existingCount } = await supabase.from('section_work_images').select('*', { count: 'exact', head: true }).eq('section_id', sectionId)
      const displayOrder = existingCount ?? 0
      const { data: row, error } = await supabase
        .from('section_work_images')
        .insert({
          section_id: sectionId,
          file_path: filePath,
          file_url: fileUrl,
          alt_text: altText,
          display_order: displayOrder,
          file_type: mimeToFileType(fileType),
        })
        .select('id, file_url, alt_text, display_order, file_type')
        .single()
      if (error) {
        return errorResponse(error.message || 'Failed to save record', 500, 'DATABASE_ERROR')
      }
      return successResponse(row, 201, corsHeaders())
    } catch (err) {
      console.error('Work images confirm error:', err)
      return errorResponse(err.message || 'Failed to confirm upload', 500, 'INTERNAL_ERROR')
    }
  }

  // POST /api/sections/:sectionId/work-images/upload - Add work media: one or many files (admin, small files only; use upload-url for large)
  if (pathParts.length === 3 && pathParts[2] === 'upload' && isWorkImages && req.method === 'POST') {
    try {
      const authResult = requireAdmin(req)
      if (!authResult.user) {
        return { ...authResult, headers: { ...corsHeaders(), ...(authResult.headers || {}) } }
      }

      const contentType = req.headers['content-type'] || ''
      if (!contentType.includes('multipart/form-data')) {
        return errorResponse('Content-Type must be multipart/form-data', 400, 'VALIDATION_ERROR')
      }

      const supabase = getSupabaseClient()
      const { data: section } = await supabase.from('homepage_sections').select('id').eq('id', sectionId).single()
      if (!section) {
        return errorResponse('Section not found', 404, 'NOT_FOUND')
      }

      const { formidable } = await import('formidable')
      const uploadDir = tmpdir()
      const [fields, files] = await new Promise((resolve, reject) => {
        const form = formidable({
          uploadDir,
          keepExtensions: true,
          maxFileSize: 200 * 1024 * 1024,
          maxTotalFileSize: 500 * 1024 * 1024,
        })
        form.parse(req, (err, fields, files) => {
          if (err) reject(err)
          else resolve([fields, files])
        })
      })

      const getField = (name) => {
        const v = fields?.[name]
        return (Array.isArray(v) ? v[0] : v) ?? ''
      }
      const altText = String(getField('alt_text') || '').trim() || ''

      const fileList = Array.isArray(files?.image)
        ? files.image
        : (files?.image ? [files.image] : [])
      const normalizedList = fileList.flat().filter((f) => f && f.filepath)

      if (normalizedList.length === 0) {
        return errorResponse('Missing file(s): send as "image" (or multiple "image") in form', 400, 'VALIDATION_ERROR')
      }

      function mimeToFileType(mime) {
        if (!mime) return 'file'
        if (mime.startsWith('image/')) return 'image'
        if (mime.startsWith('video/')) return 'video'
        return 'file'
      }

      const inserted = []
      const { count: existingCount } = await supabase.from('section_work_images').select('*', { count: 'exact', head: true }).eq('section_id', sectionId)
      let displayOrder = existingCount ?? 0

      for (const file of normalizedList) {
        const buffer = readFileSync(file.filepath)
        const originalName = file.originalFilename || file.newFilename || 'file'
        const mime = file.mimetype || 'application/octet-stream'
        const fileType = mimeToFileType(mime)

        const filePath = generateSectionWorkImageFilePath(sectionId, originalName)
        let fileUrl
        try {
          const result = await uploadFileToR2(filePath, buffer, mime)
          fileUrl = result.fileUrl
        } catch (r2Err) {
          console.error('Work media R2 upload error:', r2Err)
          if (existsSync(file.filepath)) { try { unlinkSync(file.filepath) } catch (_) {} }
          continue
        }

        if (existsSync(file.filepath)) {
          try { unlinkSync(file.filepath) } catch (_) {}
        }

        const { data: row, error } = await supabase
          .from('section_work_images')
          .insert({
            section_id: sectionId,
            file_path: filePath,
            file_url: fileUrl,
            alt_text: altText,
            display_order: displayOrder,
            file_type: fileType,
          })
          .select('id, file_url, alt_text, display_order, file_type')
          .single()

        if (!error && row) {
          inserted.push(row)
          displayOrder += 1
        }
      }

      if (inserted.length === 0) {
        return errorResponse('Upload failed or no files saved', 500, 'UPLOAD_ERROR')
      }
      return successResponse(inserted.length === 1 ? inserted[0] : inserted, 201, corsHeaders())
    } catch (err) {
      console.error('Work media upload error:', err)
      return errorResponse(err.message || 'Upload failed', 500, 'INTERNAL_ERROR')
    }
  }

  // PATCH /api/sections/:sectionId/work-images/reorder - Reorder work images (admin)
  if (pathParts.length === 3 && pathParts[2] === 'reorder' && isWorkImages && req.method === 'PATCH') {
    try {
      const authResult = requireAdmin(req)
      if (!authResult.user) {
        return { ...authResult, headers: { ...corsHeaders(), ...(authResult.headers || {}) } }
      }

      const body = await parseBody(req)
      const order = body?.order
      if (!Array.isArray(order) || order.length === 0) {
        return errorResponse('Body must include { "order": [id, ...] }', 400, 'VALIDATION_ERROR')
      }

      const supabase = getSupabaseClient()
      for (let i = 0; i < order.length; i++) {
        await supabase.from('section_work_images').update({ display_order: i }).eq('id', order[i]).eq('section_id', sectionId)
      }
      return successResponse({ message: 'Reordered' }, 200, corsHeaders())
    } catch (err) {
      console.error('Work images reorder error:', err)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  // DELETE /api/sections/:sectionId/work-images/:imageId - Remove work image (admin)
  if (pathParts.length === 3 && isWorkImages && req.method === 'DELETE') {
    const imageId = pathParts[2]
    if (imageId === 'upload' || imageId === 'reorder') {
      return errorResponse('Not found', 404, 'NOT_FOUND')
    }
    try {
      const authResult = requireAdmin(req)
      if (!authResult.user) {
        return { ...authResult, headers: { ...corsHeaders(), ...(authResult.headers || {}) } }
      }

      const supabase = getSupabaseClient()
      const { data: row, error: fetchError } = await supabase
        .from('section_work_images')
        .select('file_path')
        .eq('id', imageId)
        .eq('section_id', sectionId)
        .single()

      if (fetchError || !row) {
        return errorResponse('Work image not found', 404, 'NOT_FOUND')
      }

      try {
        await deleteFileFromR2(row.file_path)
      } catch (_) {}
      const { error: deleteError } = await supabase.from('section_work_images').delete().eq('id', imageId).eq('section_id', sectionId)
      if (deleteError) {
        return errorResponse('Failed to delete', 500, 'DATABASE_ERROR')
      }
      return successResponse({ message: 'Deleted' }, 200, corsHeaders())
    } catch (err) {
      console.error('Work image DELETE error:', err)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  return errorResponse('Not found', 404, 'NOT_FOUND')
}
