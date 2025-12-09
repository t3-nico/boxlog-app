/**
 * tRPC Router: Notifications
 *
 * 通知管理API
 *
 * @description
 * このルーターはサービス層（NotificationService）を使用してビジネスロジックを実行します。
 * ルーターの責務は入力バリデーションとエラーハンドリングのみです。
 */

import { z } from 'zod'

import {
  createNotificationSchema,
  deleteNotificationsSchema,
  listNotificationsSchema,
  markAllAsReadSchema,
  notificationIdSchema,
  updateNotificationSchema,
} from '@/schemas/notifications'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { handleServiceError } from '@/server/services/errors'
import { createNotificationService } from '@/server/services/notifications'

export const notificationsRouter = createTRPCRouter({
  /**
   * 通知一覧取得
   */
  list: protectedProcedure.input(listNotificationsSchema.optional()).query(async ({ ctx, input }) => {
    const service = createNotificationService(ctx.supabase)

    try {
      const options: Parameters<typeof service.list>[0] = {
        userId: ctx.userId,
      }
      if (input?.is_read !== undefined) options.isRead = input.is_read
      if (input?.type !== undefined) options.type = input.type
      if (input?.limit !== undefined) options.limit = input.limit
      if (input?.offset !== undefined) options.offset = input.offset

      return await service.list(options)
    } catch (error) {
      handleServiceError(error)
    }
  }),

  /**
   * 未読数取得
   */
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const service = createNotificationService(ctx.supabase)

    try {
      return await service.getUnreadCount(ctx.userId)
    } catch (error) {
      handleServiceError(error)
    }
  }),

  /**
   * 通知詳細取得
   */
  getById: protectedProcedure.input(notificationIdSchema).query(async ({ ctx, input }) => {
    const service = createNotificationService(ctx.supabase)

    try {
      return await service.getById(ctx.userId, input.id)
    } catch (error) {
      handleServiceError(error)
    }
  }),

  /**
   * 通知作成（システム用）
   */
  create: protectedProcedure.input(createNotificationSchema).mutation(async ({ ctx, input }) => {
    const service = createNotificationService(ctx.supabase)

    try {
      const options: Parameters<typeof service.create>[0] = {
        userId: ctx.userId,
        type: input.type,
        priority: input.priority,
        title: input.title,
      }
      if (input.message !== undefined && input.message !== null) options.message = input.message
      if (input.related_plan_id !== undefined && input.related_plan_id !== null)
        options.relatedPlanId = input.related_plan_id
      if (input.related_tag_id !== undefined && input.related_tag_id !== null)
        options.relatedTagId = input.related_tag_id
      if (input.action_url !== undefined && input.action_url !== null) options.actionUrl = input.action_url
      if (input.icon !== undefined && input.icon !== null) options.icon = input.icon
      if (input.data !== undefined) options.data = input.data as Record<string, unknown>
      if (input.expires_at !== undefined && input.expires_at !== null) options.expiresAt = input.expires_at

      return await service.create(options)
    } catch (error) {
      handleServiceError(error)
    }
  }),

  /**
   * 通知更新（既読化）
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateNotificationSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const service = createNotificationService(ctx.supabase)

      try {
        const options: Parameters<typeof service.update>[0] = {
          userId: ctx.userId,
          notificationId: input.id,
        }
        if (input.data.is_read !== undefined) options.isRead = input.data.is_read
        if (input.data.read_at !== undefined) options.readAt = input.data.read_at

        return await service.update(options)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  /**
   * 既読化（単一）
   */
  markAsRead: protectedProcedure.input(notificationIdSchema).mutation(async ({ ctx, input }) => {
    const service = createNotificationService(ctx.supabase)

    try {
      return await service.markAsRead(ctx.userId, input.id)
    } catch (error) {
      handleServiceError(error)
    }
  }),

  /**
   * 一括既読化
   */
  markAllAsRead: protectedProcedure.input(markAllAsReadSchema.optional()).mutation(async ({ ctx, input }) => {
    const service = createNotificationService(ctx.supabase)

    try {
      const options: Parameters<typeof service.markAllAsRead>[0] = {
        userId: ctx.userId,
      }
      if (input?.type !== undefined) options.type = input.type

      return await service.markAllAsRead(options)
    } catch (error) {
      handleServiceError(error)
    }
  }),

  /**
   * 通知削除（単一）
   */
  delete: protectedProcedure.input(notificationIdSchema).mutation(async ({ ctx, input }) => {
    const service = createNotificationService(ctx.supabase)

    try {
      return await service.delete(ctx.userId, input.id)
    } catch (error) {
      handleServiceError(error)
    }
  }),

  /**
   * 一括削除
   */
  bulkDelete: protectedProcedure.input(deleteNotificationsSchema).mutation(async ({ ctx, input }) => {
    const service = createNotificationService(ctx.supabase)

    try {
      return await service.bulkDelete({
        userId: ctx.userId,
        ids: input.ids,
      })
    } catch (error) {
      handleServiceError(error)
    }
  }),

  /**
   * 既読通知を全削除
   */
  deleteAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    const service = createNotificationService(ctx.supabase)

    try {
      return await service.deleteAllRead(ctx.userId)
    } catch (error) {
      handleServiceError(error)
    }
  }),
})
