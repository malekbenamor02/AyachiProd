import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const CLIENT_TOKEN_EXPIRES_IN = process.env.CLIENT_TOKEN_EXPIRES_IN || '365d'

/**
 * Generate JWT token for admin
 */
export function generateAdminToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

/**
 * Generate JWT token for client gallery access
 */
export function generateClientToken(galleryId, expiresIn = CLIENT_TOKEN_EXPIRES_IN) {
  const payload = {
    galleryId,
    type: 'client_access',
    iat: Math.floor(Date.now() / 1000)
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.replace('Bearer ', '')
}
