import { createClient } from '@supabase/supabase-js'

// Lazy initialization - don't create client until needed
let supabaseClient = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables. Make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env file')
    }

    // Create client with service role key - this should bypass RLS
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    console.log('✅ Supabase client created')
    console.log('   URL:', supabaseUrl)
    console.log('   Service Key (first 20 chars):', supabaseServiceKey.substring(0, 20) + '...')
    console.log('   Service Key role:', supabaseServiceKey.includes('service_role') ? 'service_role ✅' : 'checking...')
    
    // Verify service key by checking the JWT payload
    try {
      const parts = supabaseServiceKey.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
        console.log('   JWT role:', payload.role)
        if (payload.role !== 'service_role') {
          console.error('   ⚠️ WARNING: Key is not a service_role key!')
        }
      }
    } catch (e) {
      console.log('   Could not parse JWT (this is OK)')
    }
  }
  
  return supabaseClient
}
