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
      return await service.list({
        userId: ctx.userId,
        isRead: input?.is_read,
        type: input?.type,
        limit: input?.limit,
        offset: input?.offset,
      })
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
      return await service.create({
        userId: ctx.userId,
        type: input.type,
        priority: input.priority,
        title: input.title,
        message: input.message,
        relatedPlanId: input.related_plan_id,
        relatedTagId: input.related_tag_id,
        actionUrl: input.action_url,
        icon: input.icon,
        data: input.data as Record<string, unknown> | undefined,
        expiresAt: input.expires_at,
      })
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
        return await service.update({
          userId: ctx.userId,
          notificationId: input.id,
          isRead: input.data.is_read,
          readAt: input.data.read_at,
        })
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
      return await service.markAllAsRead({
        userId: ctx.userId,
        type: input?.type,
      })
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
