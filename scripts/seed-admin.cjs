#!/usr/bin/env node
/**
 * Usage: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY then run:
 * node scripts/seed-admin.cjs admin@example.com
 *
 * This script finds a user by email and ensures a profile row with is_admin=true.
 */
const { createClient } = require('@supabase/supabase-js')

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(url, key)

async function seedAdmin(email) {
  if (!email) {
    console.error('Usage: node scripts/seed-admin.cjs admin@example.com')
    process.exit(1)
  }

  // find user
  const { data: users, error: userErr } = await supabase.rpc('auth_get_user_by_email', { email_param: email }).catch(() => ({}))
  // fallback: query auth.users table (service role key required)
  let user
  if (!users || users.length === 0) {
    const { data, error } = await supabase.from('auth.users').select('*').eq('email', email).limit(1).single().catch(() => ({}))
    if (error || !data) {
      console.error('Could not find user by email. Ensure the user exists in Supabase Auth.', error)
      process.exit(1)
    }
    user = data
  } else {
    user = users[0]
  }

  const profile = {
    id: user.id,
    full_name: user.user_metadata?.full_name || user.email,
    avatar_url: user.user_metadata?.avatar_url || null,
    is_admin: true
  }

  const { data: upserted, error: upsertErr } = await supabase.from('profiles').upsert(profile).select().single()
  if (upsertErr) {
    console.error('Failed to upsert profile:', upsertErr)
    process.exit(1)
  }
  console.log('Upserted admin profile for', email)
}

const email = process.argv[2]
seedAdmin(email)
