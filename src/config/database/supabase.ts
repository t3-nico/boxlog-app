/**
 * Supabase データベース設定
 */

export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
} as const;

export const DATABASE_TABLES = {
  plans: 'plans',
  tags: 'tags',
  tag_groups: 'tag_groups',
  profiles: 'profiles',
  notifications: 'notifications',
} as const;

export const RLS_POLICIES = {
  enableRLS: true,
  userIsolation: true,
} as const;
