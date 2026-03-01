import { z } from 'zod';

/**
 * エントリアクション種別（plan + record のアクションを統合）
 */
export const entryActivityActionTypeSchema = z.enum([
  'created',
  'updated',
  'status_changed', // 旧データ互換
  'title_changed',
  'description_changed',
  'time_changed',
  'tag_added',
  'tag_removed',
  'recurrence_changed',
  'reminder_changed',
  'fulfillment_changed',
  'deleted',
]);

export type EntryActivityActionType = z.infer<typeof entryActivityActionTypeSchema>;

/**
 * エントリアクティビティ作成スキーマ
 */
export const createEntryActivitySchema = z.object({
  entry_id: z.string().uuid(),
  action_type: entryActivityActionTypeSchema,
  field_name: z.string().optional(),
  old_value: z.string().optional(),
  new_value: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreateEntryActivityInput = z.infer<typeof createEntryActivitySchema>;

/**
 * エントリアクティビティ取得スキーマ
 */
export const getEntryActivitiesSchema = z.object({
  entry_id: z.string().uuid(),
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type GetEntryActivitiesInput = z.infer<typeof getEntryActivitiesSchema>;
