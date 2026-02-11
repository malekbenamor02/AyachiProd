import { requireAdmin } from './_middleware/auth.js'
import { getSupabaseClient } from './_utils/supabase.js'
import { successResponse, errorResponse, corsHeaders, parseBody } from './_utils/helpers.js'
import { handleCORS } from './_middleware/auth.js'

function getUrl(req) {
  const base = req.headers?.host ? `http://${req.headers.host}` : 'http://localhost:3001'
  const path = req.originalUrl || req.url || req.pathname || '/api/section-categories'
  const fullPath = path.startsWith('http') ? path : path.startsWith('/') ? path : `/${path}`
  return new URL(fullPath, base)
}

export default async function handler(req) {
  const corsResponse = handleCORS(req)
  if (corsResponse) return corsResponse

  const url = getUrl(req)
  const path = url.pathname.replace(/^\/api\/section-categories\/?/, '') || '/'

  // GET /api/section-categories - List categories (public, for dropdown)
  if (path === '/' && req.method === 'GET') {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('section_categories')
        .select('id, name, display_order')
        .order('display_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        return errorResponse('Failed to fetch categories', 500, 'DATABASE_ERROR')
      }
      return successResponse(data || [], 200, corsHeaders())
    } catch (err) {
      console.error('Section categories GET error:', err)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  // POST /api/section-categories - Create category (admin)
  if (path === '/' && req.method === 'POST') {
    try {
      const authResult = requireAdmin(req)
      if (!authResult.user) {
        return { ...authResult, headers: { ...corsHeaders(), ...(authResult.headers || {}) } }
      }

      const body = await parseBody(req)
      const name = body?.name ? String(body.name).trim() : ''
      if (!name) {
        return errorResponse('Name is required', 400, 'VALIDATION_ERROR')
      }

      const supabase = getSupabaseClient()
      const { count } = await supabase.from('section_categories').select('*', { count: 'exact', head: true })
      const displayOrder = count ?? 0

      const { data: row, error } = await supabase
        .from('section_categories')
        .insert({ name, display_order: displayOrder })
        .select('id, name, display_order')
        .single()

      if (error) {
        if (error.code === '23505') return errorResponse('Category already exists', 409, 'CONFLICT')
        return errorResponse(error.message || 'Failed to create category', 500, 'DATABASE_ERROR')
      }
      return successResponse(row, 201, corsHeaders())
    } catch (err) {
      console.error('Section categories POST error:', err)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  const pathParts = path.split('/').filter(Boolean)
  const id = pathParts[0]

  // DELETE /api/section-categories/:id (admin)
  if (pathParts.length === 1 && id && req.method === 'DELETE') {
    try {
      const authResult = requireAdmin(req)
      if (!authResult.user) {
        return { ...authResult, headers: { ...corsHeaders(), ...(authResult.headers || {}) } }
      }

      const supabase = getSupabaseClient()
      const { error: deleteError } = await supabase.from('section_categories').delete().eq('id', id)
      if (deleteError) {
        return errorResponse(deleteError.message || 'Failed to delete', 500, 'DATABASE_ERROR')
      }
      return successResponse({ message: 'Deleted' }, 200, corsHeaders())
    } catch (err) {
      console.error('Section categories DELETE error:', err)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  return errorResponse('Not found', 404, 'NOT_FOUND')
}
