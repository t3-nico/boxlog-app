/**
 * tRPC Router: UserSettings
 * ユーザー設定管理API（カレンダー設定等）
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import type { Database } from '@/lib/database.types';
import { logger } from '@/lib/logger';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert'];

// バリデーションスキーマ
const userSettingsSchema = z.object({
  // タイムゾーン設定
  timezone: z.string().optional(),
  showUtcOffset: z.boolean().optional(),

  // 時間表示形式
  timeFormat: z.enum(['24h', '12h']).optional(),

  // 日付表示形式
  dateFormat: z.enum(['yyyy/MM/dd', 'MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd']).optional(),

  // 週の設定
  weekStartsOn: z.union([z.literal(0), z.literal(1), z.literal(6)]).optional(),
  showWeekends: z.boolean().optional(),
  showWeekNumbers: z.boolean().optional(),

  // タスク設定
  defaultDuration: z.number().min(5).max(480).optional(),
  snapInterval: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(30)]).optional(),

  // 営業時間
  businessHoursStart: z.number().min(0).max(23).optional(),
  businessHoursEnd: z.number().min(0).max(23).optional(),

  // 表示設定
  showDeclinedEvents: z.boolean().optional(),

  // クロノタイプ設定
  chronotypeEnabled: z.boolean().optional(),
  chronotypeType: z.enum(['bear', 'lion', 'wolf', 'dolphin', 'custom']).optional(),
  chronotypeCustomZones: z.any().optional(),
  chronotypeDisplayMode: z.enum(['border', 'background', 'both']).optional(),
  chronotypeOpacity: z.number().min(0).max(100).optional(),

  // Plan/Record表示設定
  planRecordMode: z.enum(['plan', 'record', 'both']).optional(),

  // テーマ設定
  theme: z.enum(['light', 'dark', 'system']).optional(),
  colorScheme: z.enum(['blue', 'green', 'purple', 'orange', 'red']).optional(),

  // パーソナライゼーション設定（ACT価値評定スケール: 12カテゴリ、重要度1-10）
  personalizationValues: z
    .record(
      z.string(),
      z.object({
        text: z.string().max(500),
        importance: z.number().min(1).max(10),
      }),
    )
    .optional(),
  aiCommunicationStyle: z.enum(['coach', 'analyst', 'friendly', 'custom']).optional(),
  aiCustomStylePrompt: z.string().max(1000).optional(),

  // 価値観キーワードランキング（トップ10）
  rankedValues: z.array(z.string().max(50)).max(10).optional(),
});

export const userSettingsRouter = createTRPCRouter({
  /**
   * 設定取得
   */
  get: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'ユーザーIDが見つかりません',
      });
    }

    const { data, error } = await ctx.supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned（設定がまだない場合）
      logger.error('UserSettings fetch error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `設定の取得に失敗しました: ${error.message}`,
      });
    }

    // 設定がない場合はnullを返す（クライアント側でデフォルト値を使用）
    if (!data) {
      return null;
    }

    // snake_case → camelCase に変換
    return {
      timezone: data.timezone,
      showUtcOffset: data.show_utc_offset,
      timeFormat: data.time_format as '24h' | '12h',
      dateFormat: data.date_format as 'yyyy/MM/dd' | 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd',
      weekStartsOn: data.week_starts_on as 0 | 1 | 6,
      showWeekends: data.show_weekends,
      showWeekNumbers: data.show_week_numbers,
      defaultDuration: data.default_duration,
      snapInterval: data.snap_interval as 5 | 10 | 15 | 30,
      businessHours: {
        start: data.business_hours_start,
        end: data.business_hours_end,
      },
      showDeclinedEvents: data.show_declined_events,
      chronotype: {
        enabled: data.chronotype_enabled,
        type: data.chronotype_type as 'bear' | 'lion' | 'wolf' | 'dolphin' | 'custom',
        customZones: data.chronotype_custom_zones,
        displayMode: data.chronotype_display_mode as 'border' | 'background' | 'both',
        opacity: data.chronotype_opacity,
      },
      planRecordMode: data.plan_record_mode as 'plan' | 'record' | 'both',
      theme: data.theme as 'light' | 'dark' | 'system',
      colorScheme: data.color_scheme as 'blue' | 'green' | 'purple' | 'orange' | 'red',
      personalization: {
        values: (data.personalization_values ?? {}) as Record<
          string,
          { text: string; importance: number }
        >,
        rankedValues: (data.personalization_ranked_values ?? []) as string[],
        aiStyle: (data.ai_communication_style ?? 'coach') as
          | 'coach'
          | 'analyst'
          | 'friendly'
          | 'custom',
        aiCustomStylePrompt: data.ai_custom_style_prompt ?? '',
      },
    };
  }),

  /**
   * 設定更新（upsert）
   */
  update: protectedProcedure.input(userSettingsSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'ユーザーIDが見つかりません',
      });
    }

    // camelCase → snake_case に変換
    const updateData: UserSettingsInsert = {
      user_id: userId,
    };

    if (input.timezone !== undefined) updateData.timezone = input.timezone;
    if (input.showUtcOffset !== undefined) updateData.show_utc_offset = input.showUtcOffset;
    if (input.timeFormat !== undefined) updateData.time_format = input.timeFormat;
    if (input.dateFormat !== undefined) updateData.date_format = input.dateFormat;
    if (input.weekStartsOn !== undefined) updateData.week_starts_on = input.weekStartsOn;
    if (input.showWeekends !== undefined) updateData.show_weekends = input.showWeekends;
    if (input.showWeekNumbers !== undefined) updateData.show_week_numbers = input.showWeekNumbers;
    if (input.defaultDuration !== undefined) updateData.default_duration = input.defaultDuration;
    if (input.snapInterval !== undefined) updateData.snap_interval = input.snapInterval;
    if (input.businessHoursStart !== undefined)
      updateData.business_hours_start = input.businessHoursStart;
    if (input.businessHoursEnd !== undefined)
      updateData.business_hours_end = input.businessHoursEnd;
    if (input.showDeclinedEvents !== undefined)
      updateData.show_declined_events = input.showDeclinedEvents;
    if (input.chronotypeEnabled !== undefined)
      updateData.chronotype_enabled = input.chronotypeEnabled;
    if (input.chronotypeType !== undefined) updateData.chronotype_type = input.chronotypeType;
    if (input.chronotypeCustomZones !== undefined)
      updateData.chronotype_custom_zones = input.chronotypeCustomZones;
    if (input.chronotypeDisplayMode !== undefined)
      updateData.chronotype_display_mode = input.chronotypeDisplayMode;
    if (input.chronotypeOpacity !== undefined)
      updateData.chronotype_opacity = input.chronotypeOpacity;
    if (input.planRecordMode !== undefined) updateData.plan_record_mode = input.planRecordMode;
    if (input.theme !== undefined) updateData.theme = input.theme;
    if (input.colorScheme !== undefined) updateData.color_scheme = input.colorScheme;
    if (input.personalizationValues !== undefined)
      updateData.personalization_values = input.personalizationValues;
    if (input.aiCommunicationStyle !== undefined)
      updateData.ai_communication_style = input.aiCommunicationStyle;
    if (input.aiCustomStylePrompt !== undefined)
      updateData.ai_custom_style_prompt = input.aiCustomStylePrompt;
    if (input.rankedValues !== undefined)
      updateData.personalization_ranked_values = input.rankedValues;

    const { data, error } = await ctx.supabase
      .from('user_settings')
      .upsert(updateData, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) {
      logger.error('UserSettings update error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `設定の更新に失敗しました: ${error.message}`,
      });
    }

    return {
      success: true,
      settings: data,
    };
  }),
});
