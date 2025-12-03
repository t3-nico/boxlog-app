/**
 * プランインスタンス（例外情報）プロシージャ
 * 繰り返しプランの特定日を変更/削除/移動する際に使用
 */

import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { protectedProcedure } from '@/server/api/trpc'

/**
 * プランインスタンス（例外情報）を取得
 */
export const getInstancesProcedure = protectedProcedure
  .input(
    z.object({
      planIds: z.array(z.string().uuid()),
      startDate: z.string().optional(), // YYYY-MM-DD
      endDate: z.string().optional(), // YYYY-MM-DD
    })
  )
  .query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx
    const { planIds, startDate, endDate } = input

    if (planIds.length === 0) {
      return []
    }

    // プランの所有権確認（ユーザーのプランのみ）
    const { data: userPlans, error: plansError } = await supabase
      .from('plans')
      .select('id')
      .eq('user_id', userId)
      .in('id', planIds)

    if (plansError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `プランの取得に失敗しました: ${plansError.message}`,
      })
    }

    const validPlanIds = userPlans.map((p) => p.id)
    if (validPlanIds.length === 0) {
      return []
    }

    // plan_instances から例外情報を取得
    // TODO: plan_instances テーブルはマイグレーション後に型定義に追加予定
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('plan_instances')
      .select('*')
      .in('plan_id', validPlanIds)
      .eq('is_exception', true)

    // 日付範囲フィルタ
    if (startDate) {
      query = query.gte('instance_date', startDate)
    }
    if (endDate) {
      query = query.lte('instance_date', endDate)
    }

    const { data, error } = await query

    if (error) {
      // テーブルが存在しない場合は空配列を返す（マイグレーション未実行時の対応）
      if (error.message.includes('does not exist')) {
        console.warn('[plans.getInstances] plan_instances テーブルが存在しません。マイグレーションを実行してください。')
        return []
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `例外情報の取得に失敗しました: ${error.message}`,
      })
    }

    return data ?? []
  })

/**
 * プランインスタンス（例外）を作成
 * 繰り返しプランの特定日を変更/削除/移動する際に使用
 */
export const createInstanceProcedure = protectedProcedure
  .input(
    z.object({
      planId: z.string().uuid(),
      instanceDate: z.string(), // YYYY-MM-DD
      exceptionType: z.enum(['modified', 'cancelled', 'moved']),
      overrides: z.record(z.unknown()).optional(),
      originalDate: z.string().optional(), // moved時の元日付
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    // プランの所有権確認
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('id')
      .eq('id', input.planId)
      .eq('user_id', userId)
      .single()

    if (planError || !plan) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Plan not found or access denied',
      })
    }

    // upsert: 同じ日付の既存レコードがあれば更新、なければ挿入
    // TODO: plan_instances テーブルはマイグレーション後に型定義に追加予定
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('plan_instances')
      .upsert(
        {
          plan_id: input.planId,
          instance_date: input.instanceDate,
          is_exception: true,
          exception_type: input.exceptionType,
          overrides: input.overrides ?? {},
          original_date: input.originalDate ?? null,
        },
        {
          onConflict: 'plan_id,instance_date',
        }
      )
      .select()
      .single()

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `例外の作成に失敗しました: ${error.message}`,
      })
    }

    return data
  })

/**
 * プランインスタンス（例外）を削除
 * 例外を解除して元の繰り返しパターンに戻す
 */
export const deleteInstanceProcedure = protectedProcedure
  .input(
    z.object({
      planId: z.string().uuid(),
      instanceDate: z.string(), // YYYY-MM-DD
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    // プランの所有権確認
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('id')
      .eq('id', input.planId)
      .eq('user_id', userId)
      .single()

    if (planError || !plan) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Plan not found or access denied',
      })
    }

    // TODO: plan_instances テーブルはマイグレーション後に型定義に追加予定
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('plan_instances')
      .delete()
      .eq('plan_id', input.planId)
      .eq('instance_date', input.instanceDate)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `例外の削除に失敗しました: ${error.message}`,
      })
    }

    return { success: true }
  })
