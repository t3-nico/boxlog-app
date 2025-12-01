import { z } from 'zod'

// 通知タイプ
export const notificationTypeSchema = z.enum([
  'reminder',
  'plan_created',
  'plan_updated',
  'plan_deleted',
  'plan_completed',
  'trash_warning',
  'system',
])

// 優先度
export const notificationPrioritySchema = z.enum(['urgent', 'high', 'medium', 'low'])

// アイコンタイプ
export const notificationIconSchema = z.enum(['bell', 'calendar', 'trash', 'alert', 'check', 'info'])

// 通知作成
export const createNotificationSchema = z.object({
  type: notificationTypeSchema,
  priority: notificationPrioritySchema.default('medium'),
  title: z.string().min(1, 'タイトルは必須です').max(200),
  message: z.string().max(1000).optional(),
  related_plan_id: z.string().uuid().nullable().optional(),
  related_tag_id: z.string().uuid().nullable().optional(),
  action_url: z.string().max(500).nullable().optional(),
  icon: notificationIconSchema.nullable().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  expires_at: z.string().datetime().nullable().optional(),
})

// 通知更新（既読化など）
export const updateNotificationSchema = z.object({
  is_read: z.boolean().optional(),
  read_at: z.string().datetime().nullable().optional(),
})

// 通知ID
export const notificationIdSchema = z.object({
  id: z.string().uuid('正しいIDを指定してください'),
})

// 通知一覧取得オプション
export const listNotificationsSchema = z.object({
  is_read: z.boolean().optional(), // 既読/未読フィルター
  type: notificationTypeSchema.optional(), // タイプフィルター
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
})

// 一括既読化
export const markAllAsReadSchema = z.object({
  type: notificationTypeSchema.optional(), // 特定タイプのみ既読化（オプション）
})

// 一括削除
export const deleteNotificationsSchema = z.object({
  ids: z.array(z.string().uuid()),
})

// 型エクスポート
export type NotificationType = z.infer<typeof notificationTypeSchema>
export type NotificationPriority = z.infer<typeof notificationPrioritySchema>
export type NotificationIcon = z.infer<typeof notificationIconSchema>
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>
export type ListNotificationsInput = z.infer<typeof listNotificationsSchema>
export type MarkAllAsReadInput = z.infer<typeof markAllAsReadSchema>
export type DeleteNotificationsInput = z.infer<typeof deleteNotificationsSchema>
