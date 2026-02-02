import type { Database } from '@/lib/database.types';
import type { ActivityActionType } from '@/schemas/plans/activity';

// アクション種別を再エクスポート
export type { ActivityActionType };

/**
 * プランアクティビティ（変更履歴）
 * SupabaseのRow型をベースに、action_typeを厳密な型に上書き
 */
export type PlanActivity = Omit<
  Database['public']['Tables']['plan_activities']['Row'],
  'action_type' | 'metadata'
> & {
  action_type: ActivityActionType;
  metadata?: Record<string, unknown> | null;
};

/**
 * アイコン色の種別
 */
export type ActivityIconColor = 'success' | 'info' | 'warning' | 'primary' | 'destructive';

/**
 * アクティビティ表示用の情報
 */
export interface PlanActivityDisplay extends PlanActivity {
  actionLabel: string; // 簡潔なアクション名（例: "ステータスを変更"）
  detail?: string | undefined; // 詳細情報（例: "未完了 → 完了"）※任意
  icon:
    | 'create'
    | 'update'
    | 'status'
    | 'tag'
    | 'delete'
    | 'time'
    | 'due_date'
    | 'recurrence'
    | 'reminder'; // アイコン種別
  iconColor: ActivityIconColor; // アイコン色
}
