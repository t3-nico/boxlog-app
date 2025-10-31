import { z } from 'zod'

/**
 * アクション種別
 */
export const activityActionTypeSchema = z.enum([
  'created',
  'updated',
  'status_changed',
  'title_changed',
  'description_changed',
  'due_date_changed',
  'time_changed',
  'tag_added',
  'tag_removed',
  'deleted',
])

export type ActivityActionType = z.infer<typeof activityActionTypeSchema>

/**
 * チケットアクティビティ作成スキーマ
 */
export const createTicketActivitySchema = z.object({
  ticket_id: z.string().uuid(),
  action_type: activityActionTypeSchema,
  field_name: z.string().optional(),
  old_value: z.string().optional(),
  new_value: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

export type CreateTicketActivityInput = z.infer<typeof createTicketActivitySchema>

/**
 * チケットアクティビティ取得スキーマ
 */
export const getTicketActivitiesSchema = z.object({
  ticket_id: z.string().uuid(),
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
  order: z.enum(['asc', 'desc']).optional().default('desc'), // desc=最新順, asc=古い順
})

export type GetTicketActivitiesInput = z.infer<typeof getTicketActivitiesSchema>
