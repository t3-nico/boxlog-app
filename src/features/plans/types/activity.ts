import type { Database } from '@/lib/database.types'
import type { ActivityActionType } from '@/schemas/plans/activity'

// アクション種別を再エクスポート
export type { ActivityActionType }

/**
 * プランアクティビティ（変更履歴）
 * SupabaseのRow型をベースに、action_typeを厳密な型に上書き
 */
export type PlanActivity = Omit<Database['public']['Tables']['plan_activities']['Row'], 'action_type' | 'metadata'> & {
  action_type: ActivityActionType
  metadata?: Record<string, unknown> | null
}

/**
 * アクティビティ表示用の情報
 */
export interface PlanActivityDisplay extends PlanActivity {
  message: string // 表示用メッセージ（例: "ステータスを「作業中」に変更"）
  icon: 'create' | 'update' | 'status' | 'tag' | 'delete' // アイコン種別
}
