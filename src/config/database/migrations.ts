/**
 * データベースマイグレーション設定
 *
 * タイムスタンプベース（YYYYMMDD_HHMMSS）のマイグレーション管理システム
 * チーム開発での競合を防ぎ、一意性を保証します。
 */

export const MIGRATION_CONFIG = {
  migrationsPath: './src/config/database/supabase/migrations',
  schemaPath: './src/config/database/supabase/schema.sql',
  autoApply: false,

  // タイムスタンプ形式: YYYYMMDD_HHMMSS_description.sql
  timestampFormat: 'YYYYMMDD_HHMMSS',

  // サポートされるマイグレーション種別
  migrationTypes: [
    'create_table',
    'alter_table',
    'drop_table',
    'add_column',
    'drop_column',
    'create_index',
    'drop_index',
    'seed_data',
    'fix_data',
  ] as const,
} as const

/**
 * マイグレーション履歴
 *
 * ⚠️ 注意: この配列の順序を変更しないでください
 * 新しいマイグレーションは常に末尾に追加してください
 */
export const MIGRATION_HISTORY = [
  '20250206_calendar_improvements.sql',
  // 新しいマイグレーションをここに追加
] as const

/**
 * マイグレーション作成用ヘルパー
 */
export const MIGRATION_HELPERS = {
  // 現在時刻のタイムスタンプを生成
  generateTimestamp: (): string => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    const second = String(now.getSeconds()).padStart(2, '0')

    return `${year}${month}${day}_${hour}${minute}${second}`
  },

  // 説明からファイル名を生成
  formatFilename: (description: string): string => {
    return description
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '_')
      .replace(/-+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
  },

  // 完全なマイグレーションファイル名を生成
  generateFilename: (description: string): string => {
    const timestamp = MIGRATION_HELPERS.generateTimestamp()
    const formatted = MIGRATION_HELPERS.formatFilename(description)
    return `${timestamp}_${formatted}.sql`
  },
} as const

// Type definitions
export type MigrationType = (typeof MIGRATION_CONFIG.migrationTypes)[number]
export type MigrationFilename = (typeof MIGRATION_HISTORY)[number]
