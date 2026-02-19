import type { Database } from '@/lib/database.types';
import type { ActivityActionType } from '@/schemas/records/activity';

// アクション種別を再エクスポート
export type { ActivityActionType };

/**
 * Recordアクティビティ（変更履歴）
 * SupabaseのRow型をベースに、action_typeを厳密な型に上書き
 */
export type RecordActivity = Omit<
  Database['public']['Tables']['record_activities']['Row'],
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
export interface RecordActivityDisplay extends RecordActivity {
  actionLabelKey: string;
  detail?: string | undefined;
  icon: 'create' | 'tag' | 'delete' | 'time' | 'fulfillment';
  iconColor: ActivityIconColor;
}
