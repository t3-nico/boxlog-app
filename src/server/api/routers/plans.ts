/**
 * tRPC Router: Plans
 * プラン・セッション・タグ管理API
 */

import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import type { PlanActivity } from '@/features/plans/types/activity'
import {
  bulkDeletePlanSchema,
  bulkUpdatePlanSchema,
  createPlanSchema,
  createTagSchema,
  getPlanByIdSchema,
  planFilterSchema,
  planIdSchema,
  tagIdSchema,
  updatePlanSchema,
  updateTagSchema,
} from '@/schemas/plans'
import { createPlanActivitySchema, getPlanActivitiesSchema } from '@/schemas/plans/activity'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

/**
 * プランの日付整合性を保証する
 *
 * ルール:
 * 1. start_time と end_time の日付部分は必ず同じ
 * 2. due_date は start_time の日付と同じ
 * 3. end_time が start_time より前の場合、start_time と同じ日の同じ時刻に修正
 */
function normalizeDateTimeConsistency(data: {
  due_date?: string
  start_time?: string | null
  end_time?: string | null
}): void {
  // start_time と end_time が両方存在する場合のみ処理
  if (!data.start_time || !data.end_time) {
    return
  }

  const startDate = new Date(data.start_time)
  const endDate = new Date(data.end_time)

  // 日付部分を取得（ローカルタイムゾーン基準）
  const startYear = startDate.getFullYear()
  const startMonth = startDate.getMonth()
  const startDay = startDate.getDate()

  const endYear = endDate.getFullYear()
  const endMonth = endDate.getMonth()
  const endDay = endDate.getDate()

  // 期待されるdue_date
  const expectedDueDate = `${startYear}-${String(startMonth + 1).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`

  // 整合性チェック: 既に一致している場合はスキップ
  const datesMatch = startYear === endYear && startMonth === endMonth && startDay === endDay
  const dueDateMatches = data.due_date === expectedDueDate
  const endAfterStart = endDate.getTime() >= startDate.getTime()

  console.log('[normalizeDateTimeConsistency] チェック:', {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    startLocalDate: `${startYear}-${String(startMonth + 1).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`,
    endLocalDate: `${endYear}-${String(endMonth + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`,
    datesMatch,
    dueDateMatches,
    endAfterStart,
    current_due_date: data.due_date,
    expected_due_date: expectedDueDate,
  })

  if (datesMatch && dueDateMatches && endAfterStart) {
    console.log('[normalizeDateTimeConsistency] 既に整合性が取れているため、スキップ')
    return
  }

  console.log('[normalizeDateTimeConsistency] 整合性の問題を検出 - 正規化を実行')

  // 1. due_date を start_time の日付に合わせる
  data.due_date = expectedDueDate

  // 2. end_time の日付を start_time と同じにする（時刻は維持）
  if (!datesMatch) {
    const newEndDate = new Date(endDate)
    newEndDate.setFullYear(startYear)
    newEndDate.setMonth(startMonth)
    newEndDate.setDate(startDay)
    data.end_time = newEndDate.toISOString()
  }

  // 3. end_time が start_time より前の場合、start_time と同じ時刻にする
  const finalEndDate = new Date(data.end_time)
  if (finalEndDate.getTime() < startDate.getTime()) {
    const fixedEndDate = new Date(startDate)
    data.end_time = fixedEndDate.toISOString()
  }

  console.log('[normalizeDateTimeConsistency] 正規化完了:', {
    due_date: data.due_date,
    start_time: data.start_time,
    end_time: data.end_time,
  })
}

export const plansRouter = createTRPCRouter({
  // ========================================
  // Tags CRUD
  // ========================================
  tags: {
    list: protectedProcedure.query(async ({ ctx }) => {
      const { supabase, userId } = ctx

      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `タグ一覧の取得に失敗しました: ${error.message}`,
        })
      }

      return data
    }),

    create: protectedProcedure.input(createTagSchema).mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      const { data, error } = await supabase
        .from('tags')
        .insert({
          user_id: userId,
          ...input,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `タグの作成に失敗しました: ${error.message}`,
        })
      }

      return data
    }),

    update: protectedProcedure
      .input(z.object({ id: z.string().uuid(), data: updateTagSchema }))
      .mutation(async ({ ctx, input }) => {
        const { supabase, userId } = ctx

        const { data, error } = await supabase
          .from('tags')
          .update(input.data)
          .eq('id', input.id)
          .eq('user_id', userId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `タグの更新に失敗しました: ${error.message}`,
          })
        }

        return data
      }),

    delete: protectedProcedure.input(tagIdSchema).mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      const { error } = await supabase.from('tags').delete().eq('id', input.id).eq('user_id', userId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `タグの削除に失敗しました: ${error.message}`,
        })
      }

      return { success: true }
    }),
  },

  // ========================================
  // Plans CRUD
  // ========================================
  list: protectedProcedure.input(planFilterSchema.optional()).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    let query = supabase
      .from('tickets')
      .select(
        `
        *,
        ticket_tags (
          tag_id,
          tags (
            id,
            name,
            color
          )
        )
      `
      )
      .eq('user_id', userId)

    // タグIDでフィルタ（ticket_tags テーブルと JOIN）
    if (input?.tagId) {
      // サブクエリで ticket_tags から該当するプランIDを取得
      const { data: planIdsData, error: planIdsError } = await supabase
        .from('ticket_tags')
        .select('ticket_id')
        .eq('tag_id', input.tagId)

      if (planIdsError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `タグフィルタの適用に失敗しました: ${planIdsError.message}`,
        })
      }

      const planIds = planIdsData.map((row) => row.ticket_id)
      if (planIds.length === 0) {
        // タグに紐づくプランがない場合は空配列を返す
        return []
      }
      query = query.in('id', planIds)
    }

    // フィルター適用
    if (input?.status) {
      query = query.eq('status', input.status)
    }
    if (input?.search) {
      query = query.or(`title.ilike.%${input.search}%,description.ilike.%${input.search}%`)
    }

    // ソート適用
    const sortBy = input?.sortBy ?? 'created_at'
    const sortOrder = input?.sortOrder ?? 'desc'
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // ページネーション適用
    if (input?.limit) {
      query = query.limit(input.limit)
    }
    if (input?.offset) {
      query = query.range(input.offset, input.offset + (input.limit ?? 100) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `プラン一覧の取得に失敗しました: ${error.message}`,
      })
    }

    return data
  }),

  getById: protectedProcedure.input(getPlanByIdSchema).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    // リレーション取得の設定
    let selectQuery = '*'
    if (input.include?.tags) {
      selectQuery = '*, ticket_tags(tag_id, tags(*))'
    }

    const { data, error } = await supabase
      .from('tickets')
      .select(selectQuery)
      .eq('id', input.id)
      .eq('user_id', userId)
      .single()

    if (error) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `プランが見つかりません: ${error.message}`,
      })
    }

    // タグデータの整形
    if (input.include?.tags && data) {
      const planWithTags = data as unknown as {
        ticket_tags?: Array<{ tag_id: string; tags: unknown }>
      }
      const tags = planWithTags.ticket_tags?.map((tt) => tt.tags).filter(Boolean) ?? []
      const { ticket_tags, ...planData } = planWithTags
      return { ...planData, tags } as typeof data & { tags: unknown[] }
    }

    return data
  }),

  create: protectedProcedure.input(createPlanSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    // 日付整合性を保証
    normalizeDateTimeConsistency(input)

    const { data, error } = await supabase
      .from('tickets')
      .insert({
        user_id: userId,
        ticket_number: '', // トリガーで自動採番
        ...input,
      })
      .select()
      .single()

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `プランの作成に失敗しました: ${error.message}`,
      })
    }

    // アクティビティ記録: プラン作成
    await supabase.from('ticket_activities').insert({
      ticket_id: data.id,
      user_id: userId,
      action_type: 'created',
    })

    return data
  }),

  update: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: updatePlanSchema }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      console.log('[plans.update] 更新リクエスト:', {
        id: input.id,
        data: input.data,
        userId,
      })

      // 更新前のデータを取得（変更検出用）
      const { data: oldData } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', input.id)
        .eq('user_id', userId)
        .single()

      console.log('[plans.update] 更新前データ:', oldData)

      // 日付整合性を保証（日付/時刻フィールドが更新される場合のみ）
      const hasDateTimeUpdate = !!(input.data.due_date || input.data.start_time || input.data.end_time)
      if (hasDateTimeUpdate && oldData) {
        // 既存データと新データをマージ
        const mergedData = {
          due_date: input.data.due_date ?? oldData.due_date ?? undefined,
          start_time: input.data.start_time ?? oldData.start_time ?? undefined,
          end_time: input.data.end_time ?? oldData.end_time ?? undefined,
        }

        // 整合性を保証
        normalizeDateTimeConsistency(mergedData)

        // 変更されたフィールドのみ input.data に反映
        // （ユーザーが明示的に変更したフィールド + 整合性のために調整が必要なフィールド）
        if (input.data.start_time !== undefined || input.data.end_time !== undefined) {
          // 時刻が変更された場合、due_date も同期
          input.data.due_date = mergedData.due_date ?? undefined
          input.data.start_time = mergedData.start_time ?? undefined
          input.data.end_time = mergedData.end_time ?? undefined
        } else if (input.data.due_date !== undefined) {
          // due_date だけ変更された場合は、due_date のみ更新
          input.data.due_date = mergedData.due_date ?? undefined
        }
      }

      const { data, error } = await supabase
        .from('tickets')
        .update(input.data)
        .eq('id', input.id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('[plans.update] エラー:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `プランの更新に失敗しました: ${error.message}`,
        })
      }

      console.log('[plans.update] 更新後データ:', data)

      // アクティビティ記録: 変更検出して記録
      if (oldData) {
        const { trackPlanChanges } = await import('@/server/utils/activity-tracker')
        await trackPlanChanges(supabase, input.id, userId, oldData, data)
      }

      return data
    }),

  delete: protectedProcedure.input(planIdSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    // プラン情報を取得（アクティビティ記録用）
    const { data: plan } = await supabase
      .from('tickets')
      .select('title')
      .eq('id', input.id)
      .eq('user_id', userId)
      .single()

    // アクティビティ記録: プラン削除（削除前に記録）
    await supabase.from('ticket_activities').insert({
      ticket_id: input.id,
      user_id: userId,
      action_type: 'deleted',
      field_name: 'title',
      old_value: plan?.title || '',
    })

    const { error } = await supabase.from('tickets').delete().eq('id', input.id).eq('user_id', userId)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `プランの削除に失敗しました: ${error.message}`,
      })
    }

    return { success: true }
  }),

  // ========================================
  // Plan Tags Management
  // ========================================
  addTag: protectedProcedure
    .input(z.object({ planId: z.string().uuid(), tagId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      // タグ名を取得
      const { data: tag } = await supabase.from('tags').select('name').eq('id', input.tagId).single()

      const { data, error } = await supabase
        .from('ticket_tags')
        .insert({
          user_id: userId,
          ticket_id: input.planId,
          tag_id: input.tagId,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `タグの追加に失敗しました: ${error.message}`,
        })
      }

      // アクティビティ記録: タグ追加
      await supabase.from('ticket_activities').insert({
        ticket_id: input.planId,
        user_id: userId,
        action_type: 'tag_added',
        field_name: 'tag',
        new_value: tag?.name || '',
      })

      return data
    }),

  removeTag: protectedProcedure
    .input(z.object({ planId: z.string().uuid(), tagId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      // タグ名を取得
      const { data: tag } = await supabase.from('tags').select('name').eq('id', input.tagId).single()

      const { error } = await supabase
        .from('ticket_tags')
        .delete()
        .eq('ticket_id', input.planId)
        .eq('tag_id', input.tagId)
        .eq('user_id', userId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `タグの削除に失敗しました: ${error.message}`,
        })
      }

      // アクティビティ記録: タグ削除
      await supabase.from('ticket_activities').insert({
        ticket_id: input.planId,
        user_id: userId,
        action_type: 'tag_removed',
        field_name: 'tag',
        old_value: tag?.name || '',
      })

      return { success: true }
    }),

  getTags: protectedProcedure.input(z.object({ planId: z.string().uuid() })).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    const { data, error } = await supabase
      .from('ticket_tags')
      .select('tag_id, tags(*)')
      .eq('ticket_id', input.planId)
      .eq('user_id', userId)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `タグ一覧の取得に失敗しました: ${error.message}`,
      })
    }

    return data.map((item) => item.tags).filter(Boolean)
  }),

  // ========================================
  // Bulk Operations
  // ========================================
  bulkUpdate: protectedProcedure.input(bulkUpdatePlanSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    const { data, error } = await supabase
      .from('tickets')
      .update(input.data)
      .in('id', input.ids)
      .eq('user_id', userId)
      .select()

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `プランの一括更新に失敗しました: ${error.message}`,
      })
    }

    return { count: data.length, plans: data }
  }),

  bulkDelete: protectedProcedure.input(bulkDeletePlanSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    const { error, count } = await supabase.from('tickets').delete().in('id', input.ids).eq('user_id', userId)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `プランの一括削除に失敗しました: ${error.message}`,
      })
    }

    return { success: true, count: count ?? 0 }
  }),

  // ========================================
  // Statistics
  // ========================================
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx

    // 全プラン取得（最適化: select で必要なフィールドのみ取得）
    const { data: plans, error } = await supabase.from('tickets').select('id, status').eq('user_id', userId)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `統計情報の取得に失敗しました: ${error.message}`,
      })
    }

    // ステータス別カウント
    const byStatus = plans.reduce(
      (acc, plan) => {
        acc[plan.status] = (acc[plan.status] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total: plans.length,
      byStatus,
    }
  }),

  // ========================================
  // Activities（アクティビティ履歴）
  // ========================================

  /**
   * アクティビティ一覧取得
   */
  activities: protectedProcedure.input(getPlanActivitiesSchema).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx
    const { ticket_id, limit, offset, order } = input

    // プランの所有権確認
    const { data: plan, error: planError } = await supabase
      .from('tickets')
      .select('id')
      .eq('id', ticket_id)
      .eq('user_id', userId)
      .single()

    if (planError || !plan) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Plan not found or access denied',
      })
    }

    // アクティビティ取得（order: desc=最新順, asc=古い順）
    const { data: activities, error } = await supabase
      .from('ticket_activities')
      .select('*')
      .eq('ticket_id', ticket_id)
      .order('created_at', { ascending: order === 'asc' })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch activities: ${error.message}`,
      })
    }

    // Supabaseの型を厳密なPlanActivity型にキャスト
    return (activities ?? []) as PlanActivity[]
  }),

  /**
   * アクティビティ作成
   */
  createActivity: protectedProcedure.input(createPlanActivitySchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    // プランの所有権確認
    const { data: plan, error: planError } = await supabase
      .from('tickets')
      .select('id')
      .eq('id', input.ticket_id)
      .eq('user_id', userId)
      .single()

    if (planError || !plan) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Plan not found or access denied',
      })
    }

    // アクティビティ作成
    const { data: activity, error } = await supabase
      .from('ticket_activities')
      .insert({
        ticket_id: input.ticket_id,
        user_id: userId,
        action_type: input.action_type,
        field_name: input.field_name,
        old_value: input.old_value,
        new_value: input.new_value,
        metadata: (input.metadata ?? {}) as never, // Supabaseの Json 型にキャスト
      })
      .select()
      .single()

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to create activity: ${error.message}`,
      })
    }

    // Supabaseの型を厳密なPlanActivity型にキャスト
    return activity as PlanActivity
  }),

  // タグごとのプラン数を取得
  getTagPlanCounts: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx

    // ユーザーのプランIDを取得
    const { data: userPlans, error: plansError } = await supabase.from('tickets').select('id').eq('user_id', userId)

    if (plansError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `プランの取得に失敗しました: ${plansError.message}`,
      })
    }

    const planIds = userPlans.map((t) => t.id)

    if (planIds.length === 0) {
      return {}
    }

    // ticket_tags からタグごとのカウントを取得
    const { data: tagCounts, error: countsError } = await supabase
      .from('ticket_tags')
      .select('tag_id')
      .in('ticket_id', planIds)

    if (countsError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `タグカウントの取得に失敗しました: ${countsError.message}`,
      })
    }

    // タグIDごとにカウント
    const counts: Record<string, number> = {}
    tagCounts.forEach((item) => {
      counts[item.tag_id] = (counts[item.tag_id] || 0) + 1
    })

    return counts
  }),
})
