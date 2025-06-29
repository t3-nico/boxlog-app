import { createServerClient } from '@supabase/ssr'

export function createServerSupabaseClient(cookies: any) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Supabase environment variables are missing')
    }
    return createServerClient('https://placeholder.supabase.co', 'placeholder', { cookies })
  }

  return createServerClient(url, key, {
    cookies,
  })
}
