/**
 * CORS headers
 */
export function corsHeaders(origin = '*') {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

/**
 * JSON response helper
 */
export function jsonResponse(data, statusCode = 200, headers = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(data),
  }
}

/**
 * Error response helper
 */
export function errorResponse(message, statusCode = 400, code = 'ERROR') {
  return jsonResponse(
    {
      success: false,
      error: message,
      code,
    },
    statusCode
  )
}

/**
 * Success response helper
 */
export function successResponse(data, statusCode = 200) {
  return jsonResponse(
    {
      success: true,
      data,
    },
    statusCode
  )
}

/**
 * Parse request body
 */
export async function parseBody(req) {
  try {
    // If req has a body property (Express already parsed it), use it
    if (req && typeof req === 'object' && 'body' in req && req.body !== undefined) {
      // If body is already an object, return it
      if (typeof req.body === 'object' && req.body !== null) {
        return req.body
      }
      // If body is a string, parse it
      if (typeof req.body === 'string') {
        return JSON.parse(req.body)
      }
      return req.body
    }
    
    // If req itself is the body (Express middleware parsed it)
    if (req && typeof req === 'object' && !req.url && !req.method) {
      return req
    }
    
    // If it's a string (already parsed JSON string), parse it
    if (typeof req === 'string') {
      return JSON.parse(req)
    }
    
    // Otherwise, try to read from stream (Vercel-style)
    if (req && typeof req[Symbol.asyncIterator] === 'function') {
      const chunks = []
      for await (const chunk of req) {
        chunks.push(chunk)
      }
      const body = Buffer.concat(chunks).toString()
      return body ? JSON.parse(body) : null
    }
    
    // Last resort: return null
    console.warn('parseBody: Could not parse body, req type:', typeof req)
    return null
  } catch (error) {
    console.error('parseBody error:', error.message)
    console.error('parseBody req:', typeof req, req)
    return null
  }
}
