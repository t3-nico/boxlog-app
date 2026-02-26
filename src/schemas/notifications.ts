import { z } from 'zod';

// 通知タイプ（リマインダー専用）
export const notificationTypeSchema = z.enum(['reminder', 'overdue']);

// 通知作成
export const createNotificationSchema = z.object({
  type: notificationTypeSchema,
  plan_id: z.string().uuid(),
});

// 通知更新（既読化など）
export const updateNotificationSchema = z.object({
  is_read: z.boolean().optional(),
  read_at: z.string().datetime().nullable().optional(),
});

// 通知ID
export const notificationIdSchema = z.object({
  id: z.string().uuid('validation.invalidUuid'),
});

// 通知一覧取得オプション
export const listNotificationsSchema = z.object({
  is_read: z.boolean().optional(),
  type: notificationTypeSchema.optional(),
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
});

// 一括既読化
export const markAllAsReadSchema = z.object({
  type: notificationTypeSchema.optional(),
});

// 一括削除
export const deleteNotificationsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
});

// 型エクスポート
export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;
export type ListNotificationsInput = z.infer<typeof listNotificationsSchema>;
export type MarkAllAsReadInput = z.infer<typeof markAllAsReadSchema>;
export type DeleteNotificationsInput = z.infer<typeof deleteNotificationsSchema>;
