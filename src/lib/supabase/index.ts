/**
 * Supabase ライブラリ エントリーポイント
 * @description Supabase 関連の機能をまとめてエクスポート
 */

// クライアント
export {
  getSession,
  getUser,
  signOut,
  supabase,
  supabaseAdmin,
  tables,
  type SupabaseAdminClient,
  type SupabaseClient,
} from './client'

// フック
export { useAuth, useProfile, useTasks } from './hooks'

// ユーティリティ
export * from './utils'

// 型定義
export type { Database, Json } from '@/types/supabase'
