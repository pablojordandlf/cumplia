import { createClient } from '@supabase/supabase-js'

/**
 * Admin Supabase client using service_role_key
 * Used ONLY for server-side operations that need to bypass RLS
 * (e.g., user creation, org_members inserts)
 * 
 * ⚠️ NEVER expose this to client-side code
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
