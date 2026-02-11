import { getSupabaseClient } from './_utils/supabase.js'
import { generateAdminToken } from './_utils/jwt.js'
import { requireAdmin } from './_middleware/auth.js'
import { successResponse, errorResponse, corsHeaders, parseBody } from './_utils/helpers.js'
import { handleCORS } from './_middleware/auth.js'

export default async function handler(req) {
  // Handle CORS preflight
  const corsResponse = handleCORS(req)
  if (corsResponse) return corsResponse

  const url = new URL(req.url)
  let path = url.pathname
  
  // Remove /api/auth prefix if present
  if (path.startsWith('/api/auth')) {
    path = path.replace('/api/auth', '')
  }
  
  // If path is empty, it means we're at /api/auth, set to /
  if (!path || path === '') {
    path = '/'
  }
  
  // Ensure path starts with /
  if (!path.startsWith('/')) {
    path = '/' + path
  }
  
  console.log('🟢 Auth handler - Original URL:', req.url)
  console.log('🟢 Auth handler - URL pathname:', url.pathname)
  console.log('🟢 Auth handler - Extracted path:', path)
  console.log('🟢 Auth handler - Method:', req.method)

  // POST /api/auth/login
  if (path === '/login' && req.method === 'POST') {
    try {
      const body = await parseBody(req)
      console.log('Login attempt - body:', body ? 'received' : 'missing')
      
      const { email, password } = body || {}

      if (!email || !password) {
        console.log('Missing email or password')
        return errorResponse('Email and password are required', 400, 'VALIDATION_ERROR')
      }

      console.log('Attempting Supabase auth for:', email)
      const supabase = getSupabaseClient()

      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error('Supabase auth error:', authError.message)
        return errorResponse(authError.message || 'Invalid credentials', 401, 'INVALID_CREDENTIALS')
      }

      if (!authData || !authData.user) {
        console.error('No user data returned from Supabase')
        return errorResponse('Invalid credentials', 401, 'INVALID_CREDENTIALS')
      }

      console.log('Auth successful, user ID:', authData.user.id)
      console.log('User ID type:', typeof authData.user.id)

      // Get user profile - query by ID (UUID)
      const userId = authData.user.id
      console.log('Querying users table with ID:', userId)
      console.log('ID type:', typeof userId)
      console.log('ID length:', userId.length)
      console.log('ID value (quoted):', `'${userId}'`)
      
      // First, test if we can query the table at all (get first 5 users)
      // Service role key should bypass RLS, but let's try without schema first
      const { data: testUsers, error: testError } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .limit(5)
      
      console.log('🔍 Test query - Can access users table?')
      console.log('   Test result count:', testUsers?.length || 0)
      console.log('   Test error:', testError)
      if (testError) {
        console.error('   Error details:', JSON.stringify(testError, null, 2))
      }
      if (testUsers && testUsers.length > 0) {
        console.log('   Sample user IDs:', testUsers.map(u => u.id))
        console.log('   Sample emails:', testUsers.map(u => u.email))
      } else {
        console.log('   ⚠️ Table appears empty or inaccessible')
        console.log('   Checking if table exists...')
        
        // Try to get table info
        const { data: tableInfo, error: tableError } = await supabase
          .from('users')
          .select('*')
          .limit(0)
        
        console.log('   Table exists check - error:', tableError)
        if (tableError) {
          console.error('   Table error code:', tableError.code)
          console.error('   Table error message:', tableError.message)
          console.error('   Table error details:', tableError.details)
          console.error('   Table error hint:', tableError.hint)
        }
      }
      
      // Try querying by email first to see if user exists
      const { data: emailCheck, error: emailError } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .eq('email', authData.user.email)
        .limit(1)
      
      console.log('🔍 Email check result:', emailCheck)
      console.log('🔍 Email check error:', emailError)
      if (emailError) {
        console.error('   Email error details:', JSON.stringify(emailError, null, 2))
      }
      
      // Now query by ID - try with service role (should bypass RLS)
      // If this still returns 0, RLS might be blocking even service role
      const { data: users, error: userError, count } = await supabase
        .from('users')
        .select('id, email, full_name, role', { count: 'exact' })
        .eq('id', userId)

      console.log('🔍 Query result - count:', count)
      console.log('🔍 Query result - users:', users)
      console.log('🔍 Query result - error:', userError)
      
      // If query by ID fails but email works, there's an ID mismatch
      if (emailCheck && emailCheck.length > 0 && (!users || users.length === 0)) {
        console.error('⚠️ ID MISMATCH DETECTED!')
        console.error('User found by email:', emailCheck[0])
        console.error('Auth user ID:', userId)
        console.error('Database user ID:', emailCheck[0].id)
        console.error('IDs match?', userId === emailCheck[0].id)
      }

      if (userError) {
        console.error('Database error fetching user:', userError.message)
        console.error('Error code:', userError.code)
        console.error('Error details:', userError.details)
        console.error('Error hint:', userError.hint)
        return errorResponse(`Database error: ${userError.message}`, 500, 'DATABASE_ERROR')
      }

      if (!users || users.length === 0) {
        console.error('User not found in users table. User ID:', authData.user.id)
        console.error('Email from auth:', authData.user.email)
        return errorResponse(`User not found in database. Please run this SQL in Supabase to link your user:

INSERT INTO users (id, email, full_name, role)
VALUES (
  '${authData.user.id}',
  '${authData.user.email}',
  'Aziz Ayachi',
  'admin'
);`, 404, 'USER_NOT_FOUND')
      }

      if (users.length > 1) {
        console.warn('Multiple users found with same ID:', users.length)
      }

      const user = users[0]
      console.log('User found:', user.email)

      console.log('User found:', user.email)

      // Generate JWT token
      const token = generateAdminToken({
        id: user.id,
        email: user.email,
        role: user.role,
        type: 'admin',
      })

      return successResponse(
        {
          token,
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
          },
        },
        200,
        corsHeaders()
      )
    } catch (error) {
      console.error('Login error:', error)
      console.error('Error stack:', error.stack)
      return errorResponse(error.message || 'Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  // GET /api/auth/me
  if (path === '/me' && req.method === 'GET') {
    try {
      // Verify admin authentication
      const authResult = requireAdmin(req)
      if (authResult.error) {
        return { ...authResult, headers: corsHeaders() }
      }

      const { user } = authResult
      const supabase = getSupabaseClient()

      // Get user profile
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, created_at, last_login')
        .eq('id', user.id)
        .single()

      if (error || !userProfile) {
        return errorResponse('User not found', 404, 'USER_NOT_FOUND')
      }

      return successResponse(
        {
          user: userProfile,
        },
        200,
        corsHeaders()
      )
    } catch (error) {
      console.error('Get user error:', error)
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }

  return errorResponse('Not found', 404, 'NOT_FOUND')
}
