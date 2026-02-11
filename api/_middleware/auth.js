import { extractToken, verifyToken } from '../_utils/jwt.js'
import { errorResponse, corsHeaders } from '../_utils/helpers.js'

/**
 * Middleware to verify admin authentication
 */
export function requireAdmin(req) {
  const token = extractToken(req)
  
  if (!token) {
    return errorResponse('Unauthorized: No token provided', 401, 'UNAUTHORIZED')
  }

  const decoded = verifyToken(token)
  
  if (!decoded || decoded.type !== 'admin') {
    return errorResponse('Unauthorized: Invalid token', 401, 'UNAUTHORIZED')
  }

  return { user: decoded }
}

/**
 * Middleware to verify client authentication
 */
export function requireClient(req) {
  const token = extractToken(req)
  
  if (!token) {
    return { error: errorResponse('Unauthorized: No token provided', 401, 'UNAUTHORIZED') }
  }

  const decoded = verifyToken(token)
  
  if (!decoded || decoded.type !== 'client_access') {
    return { error: errorResponse('Unauthorized: Invalid token', 401, 'UNAUTHORIZED') }
  }

  return { galleryId: decoded.galleryId }
}

/**
 * Handle OPTIONS request for CORS
 */
export function handleCORS(req) {
  if (req.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: '',
    }
  }
  return null
}
