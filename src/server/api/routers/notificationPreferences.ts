/**
 * tRPC Router: NotificationPreferences
 * 通知設定管理API（ChatGPTスタイル: 通知タイプごとに配信方法を選択）
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { logger } from '@/lib/logger';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

// 配信方法の型
const deliveryMethodSchema = z.enum(['browser', 'email', 'push']);
type DeliveryMethod = z.infer<typeof deliveryMethodSchema>;

// 通知タイプの型
const notificationTypeSchema = z.enum(['reminders', 'plan_updates', 'system']);
type NotificationType = z.infer<typeof notificationTypeSchema>;

// 配信設定の型（通知タイプごとの配信方法配列）
type DeliverySettings = Record<NotificationType, DeliveryMethod[]>;

// デフォルトの配信設定
const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  reminders: ['browser'],
  plan_updates: ['browser'],
  system: ['browser'],
};

// 更新用スキーマ
const updateDeliverySettingsSchema = z.object({
  notificationType: notificationTypeSchema,
  deliveryMethods: z.array(deliveryMethodSchema),
});

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
        deliverySettings: DEFAULT_DELIVERY_SETTINGS,
        defaultReminderMinutes: 10,
      };
    }

    // delivery_settingsがない場合はデフォルト値を使用
    const deliverySettings =
      (data as unknown as { delivery_settings?: DeliverySettings }).delivery_settings ??
      DEFAULT_DELIVERY_SETTINGS;

    return {
      deliverySettings: {
        ...DEFAULT_DELIVERY_SETTINGS,
        ...deliverySettings,
      },
      defaultReminderMinutes: data.default_reminder_minutes ?? 10,
    };
  }),

  /**
   * 通知タイプごとの配信方法を更新
   */
  updateDeliverySettings: protectedProcedure
    .input(updateDeliverySettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'ユーザーIDが見つかりません',
        });
      }

      const supabase = ctx.supabase;

      // 現在の設定を取得
      const { data: currentData } = await supabase
        .from('notification_preferences')
        .select('delivery_settings')
        .eq('user_id', userId)
        .single();

      const currentSettings =
        (currentData as { delivery_settings?: DeliverySettings } | null)?.delivery_settings ??
        DEFAULT_DELIVERY_SETTINGS;

      // 新しい設定をマージ
      const newSettings: DeliverySettings = {
        ...DEFAULT_DELIVERY_SETTINGS,
        ...currentSettings,
        [input.notificationType]: input.deliveryMethods,
      };

      // upsert
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert(
          {
            user_id: userId,
            delivery_settings: newSettings,
          },
          { onConflict: 'user_id' },
        )
        .select()
        .single();

      if (error) {
        logger.error('NotificationPreferences update error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `通知設定の更新に失敗しました: ${error.message}`,
        });
      }

      return {
        success: true,
        deliverySettings:
          (data as unknown as { delivery_settings?: DeliverySettings }).delivery_settings ??
          newSettings,
      };
    }),

  /**
   * デフォルトリマインダー時間を更新
   */
  updateDefaultReminderMinutes: protectedProcedure
    .input(z.object({ minutes: z.number().min(1).max(1440) }))
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

// 型エクスポート
export type { DeliveryMethod, DeliverySettings, NotificationType };
