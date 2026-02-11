import { requireAdmin } from './_middleware/auth.js'
import { getSupabaseClient } from './_utils/supabase.js'
import { successResponse, errorResponse, corsHeaders, parseBody } from './_utils/helpers.js'
import { handleCORS } from './_middleware/auth.js'

function getUrl(req) {
  const base = req.headers?.host ? `http://${req.headers.host}` : 'http://localhost:3001'
  const path = req.originalUrl || req.url || req.pathname || '/api/bookings'
  const fullPath = path.startsWith('http') ? path : path.startsWith('/') ? path : `/${path}`
  return new URL(fullPath, base)
}

export default async function handler(req) {
  const corsResponse = handleCORS(req)
  if (corsResponse) return corsResponse

  const url = getUrl(req)
  const path = url.pathname.replace(/^\/api\/bookings\/?/, '') || '/'
  const pathParts = path.split('/').filter(Boolean)
  const id = pathParts[0]

  // POST /api/bookings — create (public)
  if (path === '/' && req.method === 'POST') {
    try {
      const body = await parseBody(req)
      const full_name = body?.full_name ? String(body.full_name).trim() : ''
      const phone = body?.phone ? String(body.phone).trim() : ''
      const email = body?.email ? String(body.email).trim() : ''
      const category_id = body?.category_id || null
      const session_date = body?.session_date ? String(body.session_date).trim() : ''
      const session_time = body?.session_time ? String(body.session_time).trim() : null
      const description = body?.description ? String(body.description).trim() : ''

      if (!full_name || !phone || !email || !session_date || !description) {
        return errorResponse('Full name, phone, email, date and description are required', 400, 'VALIDATION_ERROR')
      }
      const dateObj = new Date(session_date)
      if (isNaN(dateObj.getTime())) {
        return errorResponse('Invalid session date', 400, 'VALIDATION_ERROR')
      }

      const supabase = getSupabaseClient()
      const { data: row, error } = await supabase
        .from('book_sessions')
        .insert({
          full_name,
          phone,
          email,
          category_id: category_id || null,
          session_date: session_date,
          session_time: session_time || null,
          description,
          status: 'pending',
        })
        .select('id, full_name, session_date, status, created_at')
        .single()

      if (error) {
        return errorResponse(error.message || 'Failed to create booking', 500, 'DATABASE_ERROR')
      }
      return successResponse({ message: 'Booking submitted successfully', booking: row }, 201, corsHeaders())
    } catch (err) {
      console.error('Bookings POST error:', err)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  // GET /api/bookings — list all (admin only)
  if (path === '/' && req.method === 'GET') {
    try {
      const authResult = requireAdmin(req)
      if (!authResult.user) {
        return { ...authResult, headers: { ...corsHeaders(), ...(authResult.headers || {}) } }
      }

      const supabase = getSupabaseClient()
      const { data: rows, error } = await supabase
        .from('book_sessions')
        .select(`
          id,
          full_name,
          phone,
          email,
          category_id,
          session_date,
          session_time,
          description,
          status,
          admin_notes,
          created_at,
          updated_at,
          section_categories ( id, name )
        `)
        .order('session_date', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) {
        return errorResponse(error.message || 'Failed to fetch bookings', 500, 'DATABASE_ERROR')
      }
      return successResponse(rows || [], 200, corsHeaders())
    } catch (err) {
      console.error('Bookings GET error:', err)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  // PATCH /api/bookings/:id — update status or edit (admin only)
  if (pathParts.length === 1 && id && req.method === 'PATCH') {
    try {
      const authResult = requireAdmin(req)
      if (!authResult.user) {
        return { ...authResult, headers: { ...corsHeaders(), ...(authResult.headers || {}) } }
      }

      const body = await parseBody(req)
      const updates = {}
      if (['pending', 'approved', 'declined'].includes(body?.status)) {
        updates.status = body.status
      }
      if (body?.session_date !== undefined) {
        const d = String(body.session_date).trim()
        if (d && !isNaN(new Date(d).getTime())) updates.session_date = d
      }
      if (body?.session_time !== undefined) updates.session_time = body.session_time ? String(body.session_time).trim() : null
      if (body?.description !== undefined) updates.description = String(body.description || '').trim()
      if (body?.admin_notes !== undefined) updates.admin_notes = String(body.admin_notes || '').trim()
      if (body?.full_name !== undefined) updates.full_name = String(body.full_name || '').trim()
      if (body?.phone !== undefined) updates.phone = String(body.phone || '').trim()
      if (body?.email !== undefined) updates.email = String(body.email || '').trim()
      if (body?.category_id !== undefined) updates.category_id = body.category_id || null

      updates.updated_at = new Date().toISOString()

      if (Object.keys(updates).length <= 1) {
        return errorResponse('No valid fields to update', 400, 'VALIDATION_ERROR')
      }

      const supabase = getSupabaseClient()
      const { data: row, error } = await supabase
        .from('book_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return errorResponse(error.message || 'Failed to update booking', 500, 'DATABASE_ERROR')
      }
      return successResponse(row, 200, corsHeaders())
    } catch (err) {
      console.error('Bookings PATCH error:', err)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  return errorResponse('Not found', 404, 'NOT_FOUND')
}
