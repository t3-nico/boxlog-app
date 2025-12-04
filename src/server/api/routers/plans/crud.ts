/**
 * Plans Router - Plans CRUD Procedures
 */

import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createPlanSchema, getPlanByIdSchema, planFilterSchema, planIdSchema, updatePlanSchema } from '@/schemas/plans'
import { protectedProcedure } from '@/server/api/trpc'

import { normalizeDateTimeConsistency, removeUndefinedFields } from './utils'

export const listProcedure = protectedProcedure.input(planFilterSchema.optional()).query(async ({ ctx, input }) => {
  const { supabase, userId } = ctx

  let query = supabase
    .from('plans')
    .select(
      `
      *,
      plan_tags (
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

  // タグIDでフィルタ（plan_tags テーブルと JOIN）
  if (input?.tagId) {
    const { data: planIdsData, error: planIdsError } = await supabase
      .from('plan_tags')
      .select('plan_id')
      .eq('tag_id', input.tagId)

    if (planIdsError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `タグフィルタの適用に失敗しました: ${planIdsError.message}`,
      })
    }

    const planIds = planIdsData.map((row) => row.plan_id)
    if (planIds.length === 0) {
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
})

export const getByIdProcedure = protectedProcedure.input(getPlanByIdSchema).query(async ({ ctx, input }) => {
  const { supabase, userId } = ctx

  let selectQuery = '*'
  if (input.include?.tags) {
    selectQuery = '*, plan_tags(tag_id, tags(*))'
  }

  const { data, error } = await supabase
    .from('plans')
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

  if (input.include?.tags && data) {
    const planWithTags = data as unknown as {
      plan_tags?: Array<{ tag_id: string; tags: unknown }>
    }
    const tags = planWithTags.plan_tags?.map((tt) => tt.tags).filter(Boolean) ?? []
    const { plan_tags, ...planData } = planWithTags
    return { ...planData, tags } as typeof data & { tags: unknown[] }
  }

  return data
})

export const createProcedure = protectedProcedure.input(createPlanSchema).mutation(async ({ ctx, input }) => {
  const { supabase, userId } = ctx

  const dateTimeData: {
    due_date?: string | null
    start_time?: string | null
    end_time?: string | null
  } = {}
  if (input.due_date !== undefined) dateTimeData.due_date = input.due_date
  if (input.start_time !== undefined) dateTimeData.start_time = input.start_time
  if (input.end_time !== undefined) dateTimeData.end_time = input.end_time

  normalizeDateTimeConsistency(dateTimeData)

  if (dateTimeData.due_date !== undefined) input.due_date = dateTimeData.due_date
  if (dateTimeData.start_time !== undefined) input.start_time = dateTimeData.start_time
  if (dateTimeData.end_time !== undefined) input.end_time = dateTimeData.end_time

  const insertData = {
    user_id: userId,
    plan_number: '',
    ...removeUndefinedFields(input),
  }

  const { data, error } = await supabase
    .from('plans')
    .insert(insertData as never)
    .select()
    .single()

  if (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `プランの作成に失敗しました: ${error.message}`,
    })
  }

  await supabase.from('plan_activities').insert({
    plan_id: data.id,
    user_id: userId,
    action_type: 'created',
  })

  return data
})

export const updateProcedure = protectedProcedure
  .input(z.object({ id: z.string().uuid(), data: updatePlanSchema }))
  .mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    console.debug('[plans.update] 更新リクエスト:', { id: input.id, data: input.data, userId })

    const { data: oldData } = await supabase.from('plans').select('*').eq('id', input.id).eq('user_id', userId).single()

    console.debug('[plans.update] 更新前データ:', oldData)

    const hasDateTimeUpdate = !!(input.data.due_date || input.data.start_time || input.data.end_time)
    if (hasDateTimeUpdate && oldData) {
      const mergedData: {
        due_date?: string
        start_time?: string | null
        end_time?: string | null
      } = {}

      const dueDateValue = input.data.due_date ?? oldData.due_date
      if (dueDateValue) mergedData.due_date = dueDateValue

      const startTimeValue = input.data.start_time ?? oldData.start_time
      if (startTimeValue !== undefined) mergedData.start_time = startTimeValue

      const endTimeValue = input.data.end_time ?? oldData.end_time
      if (endTimeValue !== undefined) mergedData.end_time = endTimeValue

      normalizeDateTimeConsistency(mergedData)

      if (input.data.start_time !== undefined || input.data.end_time !== undefined) {
        if (mergedData.due_date !== undefined) input.data.due_date = mergedData.due_date
        if (mergedData.start_time !== undefined) input.data.start_time = mergedData.start_time
        if (mergedData.end_time !== undefined) input.data.end_time = mergedData.end_time
      } else if (input.data.due_date !== undefined) {
        if (mergedData.due_date !== undefined) input.data.due_date = mergedData.due_date
      }
    }

    const updateData = removeUndefinedFields(input.data) as Record<string, unknown>

    const { data, error } = await supabase
      .from('plans')
      .update(updateData)
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

    console.debug('[plans.update] 更新後データ:', data)

    if (oldData) {
      const { trackPlanChanges } = await import('@/server/utils/activity-tracker')
      await trackPlanChanges(supabase, input.id, userId, oldData, data)
    }

    return data
  })

export const deleteProcedure = protectedProcedure.input(planIdSchema).mutation(async ({ ctx, input }) => {
  const { supabase, userId } = ctx

  const { data: plan } = await supabase.from('plans').select('title').eq('id', input.id).eq('user_id', userId).single()

  await supabase.from('plan_activities').insert({
    plan_id: input.id,
    user_id: userId,
    action_type: 'deleted',
    field_name: 'title',
    old_value: plan?.title || '',
  })

  const { error } = await supabase.from('plans').delete().eq('id', input.id).eq('user_id', userId)

  if (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `プランの削除に失敗しました: ${error.message}`,
    })
  }

  return { success: true }
})
