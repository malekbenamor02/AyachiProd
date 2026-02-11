import { requireAdmin } from './_middleware/auth.js'
import { getSupabaseClient } from './_utils/supabase.js'
import { successResponse, errorResponse, corsHeaders } from './_utils/helpers.js'
import { handleCORS } from './_middleware/auth.js'

export default async function handler(req) {
  // Handle CORS preflight
  const corsResponse = handleCORS(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 405, 'METHOD_NOT_ALLOWED')
  }

  try {
    // Verify admin authentication
    const authResult = requireAdmin(req)
    if (authResult.error) {
      return { ...authResult, headers: corsHeaders() }
    }

    const supabase = getSupabaseClient()

    // Get statistics
    const [
      { count: totalGalleries },
      { count: totalFiles },
      { data: galleries },
    ] = await Promise.all([
      supabase
        .from('galleries')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase
        .from('media_files')
        .select('*', { count: 'exact', head: true })
        .eq('upload_status', 'completed'),
      supabase
        .from('galleries')
        .select('access_count')
        .eq('is_active', true),
    ])

    // Calculate total storage (simplified - would need actual file sizes)
    const { data: files } = await supabase
      .from('media_files')
      .select('file_size')
      .eq('upload_status', 'completed')

    const totalStorageBytes = files?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0
    const totalStorageGB = (totalStorageBytes / (1024 * 1024 * 1024)).toFixed(2)

    // Calculate total access count
    const totalAccessCount = galleries?.reduce((sum, g) => sum + (g.access_count || 0), 0) || 0

    return successResponse(
      {
        total_galleries: totalGalleries || 0,
        total_files: totalFiles || 0,
        total_storage_gb: parseFloat(totalStorageGB),
        total_access_count: totalAccessCount,
      },
      200,
      corsHeaders()
    )
  } catch (error) {
    console.error('Statistics error:', error)
    return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
  }
}
