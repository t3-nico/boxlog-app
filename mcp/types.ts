/**
 * MCP Server Types
 *
 * MCPサーバーで使用する型定義
 */

/**
 * 環境変数の型定義
 */
export interface MCPServerConfig {
  /** BoxLog API URL */
  apiUrl: string
  /** OAuth 2.1 Access Token */
  accessToken: string
}

/**
 * プラン（ログエントリ）の型
 */
export interface Plan {
  id: string
  user_id: string
  title: string
  description: string | null
  scheduled_date: string | null
  created_at: string
  updated_at: string
  tag_ids?: string[]
}

/**
 * タグの型
 */
export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
  description: string | null
  is_active: boolean
  group_id: string | null
  created_at: string
  updated_at: string
}

/**
 * 統計情報（サマリー）の型
 */
export interface StatsSummary {
  total_plans: number
  completed_plans: number
  pending_plans: number
  completion_rate: number
  total_time: number
}

/**
 * 日次作業時間の型
 */
export interface DailyHours {
  date: string
  hours: number
}

/**
 * タグ別統計の型
 */
export interface TagStats {
  tag_id: string
  tag_name: string
  plan_count: number
  last_used: string | null
}

/**
 * 通知の型
 */
export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

/**
 * アクティビティログの型
 */
export interface Activity {
  id: string
  plan_id: string
  user_id: string
  action: string
  old_value: string | null
  new_value: string | null
  created_at: string
}

/**
 * エラーレスポンスの型
 */
export interface ErrorResponse {
  error: {
    code: string
    message: string
  }
}
