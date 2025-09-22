/**
 * Supabase クライアント設定
 * @description Supabase との接続とクライアント設定を管理
 */

import { createClient } from '@supabase/supabase-js'

import { SUPABASE_CONFIG } from '@/config/database/supabase'
import type { Database } from '@/types/supabase'

// 環境変数の検証（開発環境では警告のみ）
if (!SUPABASE_CONFIG.url) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
  }
  console.warn('⚠️ Missing NEXT_PUBLIC_SUPABASE_URL - Supabase features will be disabled')
}

if (!SUPABASE_CONFIG.anonKey) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  console.warn('⚠️ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY - Supabase features will be disabled')
}

/**
 * Supabase クライアント（ブラウザ用）
 * @description 認証とリアルタイム機能を含む標準クライアント
 */
export const supabase = createClient<Database>(
  SUPABASE_CONFIG.url || 'https://placeholder.supabase.co',
  SUPABASE_CONFIG.anonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
)

/**
 * 管理者用 Supabase クライアント（サーバーサイド専用）
 * @description サーバーサイドでのデータ操作用（RLS バイパス）
 */
export const supabaseAdmin = SUPABASE_CONFIG.serviceKey
  ? createClient<Database>(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

/**
 * 認証状態の取得
 */
export const getSession = () => supabase.auth.getSession()

/**
 * 現在のユーザーの取得
 */
export const getUser = () => supabase.auth.getUser()

/**
 * サインアウト
 */
export const signOut = () => supabase.auth.signOut()

/**
 * 型安全なテーブルアクセスヘルパー
 */
export const tables = {
  profiles: () => supabase.from('profiles'),
  tasks: () => supabase.from('tasks'),
  userValues: () => supabase.from('user_values'),
  smartFilters: () => supabase.from('smart_filters'),
} as const

export type SupabaseClient = typeof supabase
export type SupabaseAdminClient = typeof supabaseAdmin
