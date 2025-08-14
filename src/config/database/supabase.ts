/**
 * Supabase データベース設定
 */

export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
} as const

export const DATABASE_TABLES = {
  tasks: 'tasks',
  events: 'events', 
  tags: 'tags',
  smart_folders: 'smart_folders',
  user_profiles: 'user_profiles',
} as const

export const RLS_POLICIES = {
  enableRLS: true,
  userIsolation: true,
} as const