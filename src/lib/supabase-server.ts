import { createServerSupabaseClient as createHelperServerClient } from '@supabase/auth-helpers-nextjs'

export function createServerSupabaseClient(cookies: any) {
  return createHelperServerClient({ cookies })
}
