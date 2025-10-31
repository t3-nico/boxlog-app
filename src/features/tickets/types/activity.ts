import type { ActivityActionType } from '@/schemas/tickets/activity'
import type { Database } from '@/types/supabase'

// アクション種別を再エクスポート
export type { ActivityActionType }

/**
 * チケットアクティビティ（変更履歴）
 * SupabaseのRow型をベースに、action_typeを厳密な型に上書き
 */
export type TicketActivity = Omit<
  Database['public']['Tables']['ticket_activities']['Row'],
  'action_type' | 'metadata'
> & {
  action_type: ActivityActionType
  metadata?: Record<string, unknown> | null
}

/**
 * アクティビティ表示用の情報
 */
export interface TicketActivityDisplay extends TicketActivity {
  message: string // 表示用メッセージ（例: "ステータスを「作業中」に変更"）
  icon: 'create' | 'update' | 'status' | 'tag' | 'delete' // アイコン種別
}
