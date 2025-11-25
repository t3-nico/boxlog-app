/**
 * Supabase ユーティリティ関数
 * @description Supabase 操作のヘルパー関数集
 */

import type { PostgrestError } from '@supabase/supabase-js'

/**
 * Supabase エラーハンドリング
 */
export function handleSupabaseError(error: PostgrestError | null): string | null {
  if (!error) return null

  // よくあるエラーのユーザーフレンドリーなメッセージ
  const errorMessages: Record<string, string> = {
    '23505': 'この項目は既に存在します',
    '23503': '関連するデータが見つかりません',
    '42501': 'この操作を実行する権限がありません',
    PGRST116: 'データが見つかりません',
  }

  return errorMessages[error.code] || error.message || 'エラーが発生しました'
}

/**
 * RLS ポリシー確認のユーティリティ
 */
export function isRLSEnabled(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * ページネーション用の LIMIT/OFFSET 計算
 */
export function getPagination(page: number, size: number = 20) {
  const limit = size
  const from = page * limit
  const to = from + size - 1

  return { from, to, limit }
}

/**
 * Supabase クエリビルダーのタイプガード
 */
export function isSupabaseError(error: unknown): error is PostgrestError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error &&
    typeof (error as PostgrestError).code === 'string' &&
    typeof (error as PostgrestError).message === 'string'
  )
}

/**
 * テーブル名の検証
 */
export function validateTableName(tableName: string): boolean {
  const validTables = ['profiles', 'tasks', 'user_values', 'smart_filters']
  return validTables.includes(tableName)
}

/**
 * JSON 安全な変換
 */
export function safeJsonParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback

  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

/**
 * UUID バリデーション
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * タスクステータスのバリデーション
 */
export function isValidTaskStatus(status: string): boolean {
  const validStatuses = ['backlog', 'scheduled', 'completed', 'rescheduled', 'stopped', 'delegated']
  return validStatuses.includes(status)
}

/**
 * 日付フォーマット（Supabase用）
 */
export function formatDateForSupabase(date: Date): string {
  return date.toISOString()
}

/**
 * 日付パース（Supabaseから）
 */
export function parseDateFromSupabase(dateString: string): Date {
  return new Date(dateString)
}

/**
 * タグ配列の正規化
 */
export function normalizeTags(tags: string[] | null): string[] {
  if (!tags || !Array.isArray(tags)) return []
  return tags.filter((tag) => typeof tag === 'string' && tag.trim().length > 0)
}

/**
 * リアルタイム購読の設定
 */
interface RealtimeConfig {
  event: '*' | 'INSERT' | 'UPDATE' | 'DELETE'
  schema: string
  table: string
  filter?: string
}

export function createRealtimeConfig(table: string, userId?: string): RealtimeConfig {
  const config: RealtimeConfig = {
    event: '*',
    schema: 'public',
    table,
  }

  if (userId) {
    config.filter = `user_id=eq.${userId}`
  }

  return config
}

/**
 * バッチ操作のヘルパー
 */
export function createBatch<T>(items: T[], batchSize: number = 100): T[][] {
  const batches: T[][] = []
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }
  return batches
}

/**
 * ソート条件の作成
 */
export function createSortConfig(field: string, ascending: boolean = true) {
  return { column: field, ascending }
}
