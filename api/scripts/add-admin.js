/**
 * Script to add a new admin user.
 * Creates the user in Supabase Auth and in the public.users table.
 *
 * Usage (from project root):
 *   node api/scripts/add-admin.js email password "full name"
 *
 * Or from api folder:
 *   node scripts/add-admin.js email password "full name"
 *
 * Example (do NOT type angle brackets; they are placeholders):
 *   node api/scripts/add-admin.js admin@example.com SecurePass123 "John Doe"
 *
 * PowerShell: pass values directly, no < > around arguments.
 *
 * Requires api/.env with SUPABASE_URL and SUPABASE_SERVICE_KEY.
 */

import dotenv from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env from api folder
dotenv.config({ path: join(__dirname, '..', '.env') })

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

function usage() {
  console.log(`
Add new admin user.

Usage:
  node api/scripts/add-admin.js email password "full name"

Arguments (do not wrap in < > — pass values directly):
  email      Admin email (used to log in)
  password   Admin password (min 6 characters)
  full name  Display name (use quotes if it contains spaces)

Example:
  node api/scripts/add-admin.js admin@example.com MySecurePass "Jane Smith"

Environment:
  Loads api/.env — must contain SUPABASE_URL and SUPABASE_SERVICE_KEY.
`)
}

async function main() {
  const args = process.argv.slice(2)
  if (args.length < 3) {
    usage()
    process.exit(1)
  }

  const [email, password, fullName] = args
  if (!email || !password || !fullName) {
    console.error('Error: email, password, and full name are required.')
    usage()
    process.exit(1)
  }

  if (password.length < 6) {
    console.error('Error: password must be at least 6 characters.')
    process.exit(1)
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in api/.env')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log('Creating admin user...')
  console.log('  Email:', email)
  console.log('  Full name:', fullName)

  // 1. Create user in Supabase Auth (service role can do this)
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (authError) {
    console.error('Failed to create auth user:', authError.message)
    if (authError.message?.includes('already been registered')) {
      console.error('This email is already in use. Use a different email or link the existing auth user to the users table via SQL.')
    }
    process.exit(1)
  }

  const userId = authUser.user.id
  console.log('  Auth user created with ID:', userId)

  // 2. Insert into public.users so the app recognizes them as admin
  const { error: dbError } = await supabase.from('users').insert({
    id: userId,
    email,
    full_name: fullName,
    role: 'admin',
  })

  if (dbError) {
    console.error('Auth user was created but failed to add to users table:', dbError.message)
    const isDuplicateEmail = dbError.message?.includes('users_email_key') || dbError.message?.includes('duplicate key')
    if (isDuplicateEmail) {
      console.error('This email already exists in users. Run the following in Supabase SQL Editor to replace it:')
      console.error(`
DELETE FROM users WHERE email = '${email.replace(/'/g, "''")}';
INSERT INTO users (id, email, full_name, role)
VALUES (
  '${userId}',
  '${email.replace(/'/g, "''")}',
  '${fullName.replace(/'/g, "''")}',
  'admin'
);
`)
    } else {
      console.error('Run this in Supabase SQL Editor:')
      console.error(`
INSERT INTO users (id, email, full_name, role)
VALUES (
  '${userId}',
  '${email.replace(/'/g, "''")}',
  '${fullName.replace(/'/g, "''")}',
  'admin'
);
`)
    }
    process.exit(1)
  }

  console.log('Done. Admin user created successfully.')
  console.log('They can log in at your admin login page with the email and password above.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
