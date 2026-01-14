/**
 * Plans Recurrence Subrouter
 *
 * 繰り返しプラン関連の操作エンドポイント
 *
 * @description
 * - splitRecurrence: 繰り返しプランを特定日で分割
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { createPlanService } from '@/server/services/plans';

export const recurrenceRouter = createTRPCRouter({
  /**
   * 繰り返しプランを分割
   *
   * 「この日以降」編集/削除時に使用。
   * 1. 親プランのrecurrence_end_dateを前日に設定
   * 2. 新しい繰り返しプランを作成（同じ繰り返しルール、splitDateから開始）
   * 3. overridesがある場合は新プランに適用
   *
   * @returns 新しく作成されたプランのID
   */
  splitRecurrence: protectedProcedure
    .input(
      z.object({
        planId: z.string().uuid(),
        splitDate: z.string(), // YYYY-MM-DD形式
        overrides: z
          .object({
            title: z.string().optional(),
            description: z.string().nullable().optional(),
            start_time: z.string().optional(), // ISO 8601形式
            end_time: z.string().optional(), // ISO 8601形式
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const { planId, splitDate, overrides } = input;

      // 1. 親プランを取得して所有権確認
      const { data: parentPlan, error: fetchError } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !parentPlan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plan not found or access denied',
        });
      }

      // 繰り返しプランでない場合はエラー
      if (!parentPlan.recurrence_type || parentPlan.recurrence_type === 'none') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Plan is not a recurring plan',
        });
      }

      // 2. 親プランのrecurrence_end_dateを前日に更新
      const endDateForParent = new Date(splitDate);
      endDateForParent.setDate(endDateForParent.getDate() - 1);
      const endDateString = endDateForParent.toISOString().slice(0, 10);

      const { error: updateError } = await supabase
        .from('plans')
        .update({
          recurrence_end_date: endDateString,
          updated_at: new Date().toISOString(),
        })
        .eq('id', planId)
        .eq('user_id', userId);

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update parent plan: ${updateError.message}`,
        });
      }

      // 3. 新しい繰り返しプランを作成
      // 元の開始時間から時刻部分を抽出して、新しい日付に適用
      let newStartTime: string | undefined = undefined;
      let newEndTime: string | undefined = undefined;

      if (parentPlan.start_time) {
        const originalStart = new Date(parentPlan.start_time);
        const newStart = new Date(splitDate);
        newStart.setHours(
          originalStart.getHours(),
          originalStart.getMinutes(),
          originalStart.getSeconds(),
          0,
        );
        newStartTime = overrides?.start_time ?? newStart.toISOString();
      }

      if (parentPlan.end_time) {
        const originalEnd = new Date(parentPlan.end_time);
        const newEnd = new Date(splitDate);
        newEnd.setHours(
          originalEnd.getHours(),
          originalEnd.getMinutes(),
          originalEnd.getSeconds(),
          0,
        );
        newEndTime = overrides?.end_time ?? newEnd.toISOString();
      }

      // PlanServiceを使用してプランを作成
      const service = createPlanService(supabase);
      let newPlan;

      try {
        newPlan = await service.create({
          userId,
          input: {
            title: overrides?.title ?? parentPlan.title,
            description:
              overrides?.description !== undefined
                ? (overrides.description ?? undefined)
                : (parentPlan.description ?? undefined),
            status: parentPlan.status as 'open' | 'closed',
            due_date: splitDate,
            start_time: newStartTime,
            end_time: newEndTime,
            recurrence_type: parentPlan.recurrence_type as
              | 'none'
              | 'daily'
              | 'weekly'
              | 'monthly'
              | 'yearly'
              | 'weekdays'
              | undefined,
            recurrence_rule: parentPlan.recurrence_rule ?? undefined,
            recurrence_end_date: parentPlan.recurrence_end_date ?? undefined, // 元の終了日を引き継ぐ
            reminder_minutes: parentPlan.reminder_minutes ?? undefined,
          },
          preventOverlappingPlans: false, // 分割時は重複チェックをスキップ
        });
      } catch (createError) {
        // 失敗した場合、親プランのrecurrence_end_dateを元に戻す
        await supabase
          .from('plans')
          .update({
            recurrence_end_date: parentPlan.recurrence_end_date,
            updated_at: parentPlan.updated_at,
          })
          .eq('id', planId)
          .eq('user_id', userId);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create new plan: ${createError instanceof Error ? createError.message : 'Unknown error'}`,
        });
      }

      // 4. 親プランのタグを新プランにコピー
      const { data: parentTags } = await supabase
        .from('plan_tags')
        .select('tag_id')
        .eq('plan_id', planId);

      if (parentTags && parentTags.length > 0) {
        const tagInserts = parentTags.map((t) => ({
          plan_id: newPlan.id,
          tag_id: t.tag_id,
          user_id: userId,
        }));

        await supabase.from('plan_tags').insert(tagInserts);
      }

      return {
        parentPlanId: planId,
        newPlanId: newPlan.id,
        splitDate,
      };
    }),
});
