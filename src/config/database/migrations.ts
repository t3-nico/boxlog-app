/**
 * データベースマイグレーション設定
 */

export const MIGRATION_CONFIG = {
  migrationsPath: './src/config/database/supabase/migrations',
  schemaPath: './src/config/database/supabase/schema.sql',
  autoApply: false,
} as const

export const MIGRATION_HISTORY = [
  '20250206_calendar_improvements.sql',
  // 新しいマイグレーションをここに追加
] as const