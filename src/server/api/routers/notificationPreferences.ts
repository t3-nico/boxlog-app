/**
 * tRPC Router: NotificationPreferences
 * 通知設定管理API（ブラウザ/メール/プッシュ通知ON/OFF + デフォルトリマインダー時間）
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { logger } from '@/lib/logger';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const notificationPreferencesRouter = createTRPCRouter({
  /**
   * 通知設定取得
   */
  get: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'ユーザーIDが見つかりません',
      });
    }

    const supabase = ctx.supabase;

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('NotificationPreferences fetch error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `通知設定の取得に失敗しました: ${error.message}`,
      });
    }

    // 設定がない場合はデフォルト値を返す
    if (!data) {
      return {
        enableBrowserNotifications: true,
        enableEmailNotifications: false,
        enablePushNotifications: false,
        defaultReminderMinutes: 10,
      };
    }

    return {
      enableBrowserNotifications: data.enable_browser_notifications,
      enableEmailNotifications: data.enable_email_notifications,
      enablePushNotifications: data.enable_push_notifications,
      defaultReminderMinutes: data.default_reminder_minutes ?? 10,
    };
  }),

  /**
   * ブラウザ通知のON/OFFを更新
   */
  updateBrowserNotifications: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'ユーザーIDが見つかりません',
        });
      }

      const supabase = ctx.supabase;

      const { error } = await supabase.from('notification_preferences').upsert(
        {
          user_id: userId,
          enable_browser_notifications: input.enabled,
        },
        { onConflict: 'user_id' },
      );

      if (error) {
        logger.error('NotificationPreferences update error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `通知設定の更新に失敗しました: ${error.message}`,
        });
      }

      return { success: true };
    }),

  /**
   * メール通知のON/OFFを更新
   */
  updateEmailNotifications: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'ユーザーIDが見つかりません',
        });
      }

      const supabase = ctx.supabase;

      const { error } = await supabase.from('notification_preferences').upsert(
        {
          user_id: userId,
          enable_email_notifications: input.enabled,
        },
        { onConflict: 'user_id' },
      );

      if (error) {
        logger.error('NotificationPreferences update error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `通知設定の更新に失敗しました: ${error.message}`,
        });
      }

      return { success: true };
    }),

  /**
   * プッシュ通知のON/OFFを更新
   */
  updatePushNotifications: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'ユーザーIDが見つかりません',
        });
      }

      const supabase = ctx.supabase;

      const { error } = await supabase.from('notification_preferences').upsert(
        {
          user_id: userId,
          enable_push_notifications: input.enabled,
        },
        { onConflict: 'user_id' },
      );

      if (error) {
        logger.error('NotificationPreferences update error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `通知設定の更新に失敗しました: ${error.message}`,
        });
      }

      return { success: true };
    }),

  /**
   * デフォルトリマインダー時間を更新
   */
  updateDefaultReminderMinutes: protectedProcedure
    .input(z.object({ minutes: z.number().min(0).max(10080).nullable() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'ユーザーIDが見つかりません',
        });
      }

      const supabase = ctx.supabase;

      const { error } = await supabase.from('notification_preferences').upsert(
        {
          user_id: userId,
          default_reminder_minutes: input.minutes,
        },
        { onConflict: 'user_id' },
      );

      if (error) {
        logger.error('NotificationPreferences update error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `リマインダー設定の更新に失敗しました: ${error.message}`,
        });
      }

      return { success: true };
    }),
});
