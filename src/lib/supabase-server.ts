import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Supabase environment variables are missing')
    }
    return createSupabaseClient<Database>('https://placeholder.supabase.co', 'placeholder')
  }

  return createSupabaseClient<Database>(url, key)
}
