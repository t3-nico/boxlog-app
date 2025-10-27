/**
 * Supabase ライブラリ エントリーポイント
 * @description Supabase 関連の機能をまとめてエクスポート
 *
 * @see Issue #531 - Supabase × Vercel × Next.js 認証チェックリスト
 *
 * ⚠️ 重要:
 * - server.ts は意図的にここからエクスポートしていません
 * - server.ts を使う場合は直接 '@/lib/supabase/server' からインポートしてください
 * - これにより Pages Router での誤用を防ぎます
 */

// クライアント作成関数（Browser Client のみ）
export { createClient as createBrowserClient, type SupabaseClient } from './client'

// Middleware用（App Routerのみ）
// NOTE: middleware.ts も直接インポートすることを推奨
export { updateSession } from './middleware'

// Client Components用フック
// 注: useTasks は削除済み（src/features/tickets/hooks/useTickets.ts を使用）
export { useAuth, useProfile } from './hooks'

// ユーティリティ
export * from './utils'

// 型定義
export type { Database, Json } from '@/types/supabase'
