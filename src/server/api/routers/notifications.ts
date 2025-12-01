/**
 * tRPC Router: Notifications
 * 通知管理API
 */

import { TRPCError } from '@trpc/server'
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

export const notificationsRouter = createTRPCRouter({
  // ========================================
  // 通知一覧取得
  // ========================================
  list: protectedProcedure.input(listNotificationsSchema.optional()).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx
    const { is_read, type, limit = 50, offset = 0 } = input ?? {}

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // 既読/未読フィルター
    if (is_read !== undefined) {
      query = query.eq('is_read', is_read)
    }

    // タイプフィルター
    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `通知一覧の取得に失敗しました: ${error.message}`,
      })
    }

    return data
  }),

  // ========================================
  // 未読数取得
  // ========================================
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `未読数の取得に失敗しました: ${error.message}`,
      })
    }

    return count ?? 0
  }),

  // ========================================
  // 通知詳細取得
  // ========================================
  getById: protectedProcedure.input(notificationIdSchema).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', input.id)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '通知が見つかりません',
        })
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `通知の取得に失敗しました: ${error.message}`,
      })
    }

    return data
  }),

  // ========================================
  // 通知作成（システム用）
  // ========================================
  create: protectedProcedure.input(createNotificationSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    // undefinedを除外してSupabaseに渡す
    const insertData: Record<string, unknown> = {
      user_id: userId,
      type: input.type,
      priority: input.priority,
      title: input.title,
    }
    if (input.message !== undefined) insertData.message = input.message
    if (input.related_plan_id !== undefined) insertData.related_plan_id = input.related_plan_id
    if (input.related_tag_id !== undefined) insertData.related_tag_id = input.related_tag_id
    if (input.action_url !== undefined) insertData.action_url = input.action_url
    if (input.icon !== undefined) insertData.icon = input.icon
    if (input.data !== undefined) insertData.data = input.data as never
    if (input.expires_at !== undefined) insertData.expires_at = input.expires_at

    const { data, error } = await supabase
      .from('notifications')
      .insert(insertData as never)
      .select()
      .single()

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `通知の作成に失敗しました: ${error.message}`,
      })
    }

    return data
  }),

  // ========================================
  // 通知更新（既読化）
  // ========================================
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateNotificationSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      // undefinedを除外してSupabaseに渡す
      const updateData: Record<string, boolean | string | null> = {}
      if (input.data.is_read !== undefined) updateData.is_read = input.data.is_read
      if (input.data.read_at !== undefined) updateData.read_at = input.data.read_at

      const { data, error } = await supabase
        .from('notifications')
        .update(updateData)
        .eq('id', input.id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '通知が見つかりません',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `通知の更新に失敗しました: ${error.message}`,
        })
      }

      return data
    }),

  // ========================================
  // 既読化（単一）
  // ========================================
  markAsRead: protectedProcedure.input(notificationIdSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', input.id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '通知が見つかりません',
        })
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `通知の既読化に失敗しました: ${error.message}`,
      })
    }

    return data
  }),

  // ========================================
  // 一括既読化
  // ========================================
  markAllAsRead: protectedProcedure.input(markAllAsReadSchema.optional()).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx
    const { type } = input ?? {}

    let query = supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('is_read', false)

    // タイプフィルター（特定タイプのみ既読化）
    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query.select()

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `一括既読化に失敗しました: ${error.message}`,
      })
    }

    return { count: data?.length ?? 0 }
  }),

  // ========================================
  // 通知削除（単一）
  // ========================================
  delete: protectedProcedure.input(notificationIdSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    const { error } = await supabase.from('notifications').delete().eq('id', input.id).eq('user_id', userId)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `通知の削除に失敗しました: ${error.message}`,
      })
    }

    return { success: true }
  }),

  // ========================================
  // 一括削除
  // ========================================
  bulkDelete: protectedProcedure.input(deleteNotificationsSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .in('id', input.ids)
      .eq('user_id', userId)
      .select()

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `通知の一括削除に失敗しました: ${error.message}`,
      })
    }

    return { count: data?.length ?? 0 }
  }),

  // ========================================
  // 既読通知を全削除
  // ========================================
  deleteAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    const { supabase, userId } = ctx

    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('is_read', true)
      .select()

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `既読通知の削除に失敗しました: ${error.message}`,
      })
    }

    return { count: data?.length ?? 0 }
  }),
})
