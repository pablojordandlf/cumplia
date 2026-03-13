import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const supabaseServerClient = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name, options) {
        return cookies().get(name)?.value
      },
      set(name, value, options) {
        cookies().set(name, value, { ...options, sameSite: 'lax' })
      },
      remove(name, options) {
        cookies().remove(name)
      },
    },
  }
)

export const createClient = () => supabaseServerClient;
