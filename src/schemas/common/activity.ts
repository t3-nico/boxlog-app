import { z } from 'zod';

/**
 * 共通アクション種別
 * Plan/Recordで共有できるアクションタイプ
 */
export const commonActivityActionTypeSchema = z.enum([
  'created',
  'updated',
  'time_changed',
  'tag_added',
  'tag_removed',
  'deleted',
]);

/**
 * Plan専用アクション種別
 */
export const planActivityActionTypeSchema = z.enum([
  'created',
  'updated',
  'status_changed',
  'title_changed',
  'description_changed',
  'due_date_changed',
  'time_changed',
  'tag_added',
  'tag_removed',
  'recurrence_changed',
  'reminder_changed',
  'deleted',
]);

/**
 * Record専用アクション種別
 */
export const recordActivityActionTypeSchema = z.enum([
  'created',
  'updated',
  'time_changed',
  'title_changed',
  'memo_changed',
  'fulfillment_changed',
  'tag_added',
  'tag_removed',
  'deleted',
]);

export type CommonActivityActionType = z.infer<typeof commonActivityActionTypeSchema>;
export type PlanActivityActionType = z.infer<typeof planActivityActionTypeSchema>;
export type RecordActivityActionType = z.infer<typeof recordActivityActionTypeSchema>;

/**
 * アイコン色の種別
 */
export type ActivityIconColor = 'success' | 'info' | 'warning' | 'primary' | 'destructive';

/**
 * アイコン種別
 */
export type ActivityIconType =
  | 'create'
  | 'update'
  | 'status'
  | 'tag'
  | 'delete'
  | 'time'
  | 'due_date'
  | 'recurrence'
  | 'reminder'
  | 'fulfillment'
  | 'memo';

/**
 * 共通アクティビティ基底型
 */
export interface BaseActivity {
  id: string;
  user_id: string;
  action_type: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

/**
 * アクティビティ表示用の情報
 */
export interface ActivityDisplay extends BaseActivity {
  actionLabel: string;
  detail?: string | undefined;
  icon: ActivityIconType;
  iconColor: ActivityIconColor;
}
