import type { Database } from '@/lib/database.types';
import type { ActivityActionType } from '@/schemas/records/activity';

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
