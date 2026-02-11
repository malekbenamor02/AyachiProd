import { requireAdmin } from './_middleware/auth.js'
import { getSupabaseClient } from './_utils/supabase.js'
import { successResponse, errorResponse, corsHeaders } from './_utils/helpers.js'
import { handleCORS } from './_middleware/auth.js'
import { parseBody } from './_utils/helpers.js'

/**
 * GET /api/settings/maintenance — public, returns { enabled, message }
 * PATCH /api/settings/maintenance — admin only, body: { enabled?, message? }
 */
export default async function handler(req) {
  const corsResponse = handleCORS(req)
  if (corsResponse) return corsResponse

  const path = req.pathname || (req.url && new URL(req.url).pathname) || ''
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
