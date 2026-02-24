import { z } from 'zod';

/**
 * Recordアクション種別
 */
export const activityActionTypeSchema = z.enum([
  'created',
  'updated',
  'time_changed',
  'title_changed',
  'description_changed',
  'fulfillment_changed',
  'tag_added',
  'tag_removed',
  'deleted',
]);

export type ActivityActionType = z.infer<typeof activityActionTypeSchema>;

/**
 * Recordアクティビティ作成スキーマ
 */
export const createRecordActivitySchema = z.object({
  record_id: z.string().uuid(),
  action_type: activityActionTypeSchema,
  field_name: z.string().optional(),
  old_value: z.string().optional(),
  new_value: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreateRecordActivityInput = z.infer<typeof createRecordActivitySchema>;

/**
 * Recordアクティビティ取得スキーマ
 */
export const getRecordActivitiesSchema = z.object({
  record_id: z.string().uuid(),
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type GetRecordActivitiesInput = z.infer<typeof getRecordActivitiesSchema>;
