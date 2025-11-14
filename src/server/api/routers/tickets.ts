/**
 * tRPC Router: Tickets
 * チケット・セッション・タグ管理API
 */

import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import type { TicketActivity } from '@/features/tickets/types/activity'
import {
  bulkDeleteTicketSchema,
  bulkUpdateTicketSchema,
  createTagSchema,
  createTicketSchema,
  getTicketByIdSchema,
  tagIdSchema,
  ticketFilterSchema,
  ticketIdSchema,
  updateTagSchema,
  updateTicketSchema,
} from '@/schemas/tickets'
import { createTicketActivitySchema, getTicketActivitiesSchema } from '@/schemas/tickets/activity'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

export const ticketsRouter = createTRPCRouter({
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
  // Tickets CRUD
  // ========================================
  list: protectedProcedure.input(ticketFilterSchema.optional()).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    let query = supabase.from('tickets').select('*').eq('user_id', userId)

    // タグIDでフィルタ（ticket_tags テーブルと JOIN）
    if (input?.tagId) {
      // サブクエリで ticket_tags から該当するチケットIDを取得
      const { data: ticketIdsData, error: ticketIdsError } = await supabase
        .from('ticket_tags')
        .select('ticket_id')
        .eq('tag_id', input.tagId)

      if (ticketIdsError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `タグフィルタの適用に失敗しました: ${ticketIdsError.message}`,
        })
      }

      const ticketIds = ticketIdsData.map((row) => row.ticket_id)
      if (ticketIds.length === 0) {
        // タグに紐づくチケットがない場合は空配列を返す
        return []
      }
      query = query.in('id', ticketIds)
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
        message: `チケット一覧の取得に失敗しました: ${error.message}`,
      })
    }

    return data
  }),

  getById: protectedProcedure.input(getTicketByIdSchema).query(async ({ ctx, input }) => {
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
        message: `チケットが見つかりません: ${error.message}`,
      })
    }

    // タグデータの整形
    if (input.include?.tags && data) {
      const ticketWithTags = data as unknown as {
        ticket_tags?: Array<{ tag_id: string; tags: unknown }>
      }
      const tags = ticketWithTags.ticket_tags?.map((tt) => tt.tags).filter(Boolean) ?? []
      const { ticket_tags, ...ticketData } = ticketWithTags
      return { ...ticketData, tags } as typeof data & { tags: unknown[] }
    }

    return data
  }),

  create: protectedProcedure.input(createTicketSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

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
        message: `チケットの作成に失敗しました: ${error.message}`,
      })
    }

    // アクティビティ記録: チケット作成
    await supabase.from('ticket_activities').insert({
      ticket_id: data.id,
      user_id: userId,
      action_type: 'created',
    })

    return data
  }),

  update: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: updateTicketSchema }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      // 更新前のデータを取得（変更検出用）
      const { data: oldData } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', input.id)
        .eq('user_id', userId)
        .single()

      const { data, error } = await supabase
        .from('tickets')
        .update(input.data)
        .eq('id', input.id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `チケットの更新に失敗しました: ${error.message}`,
        })
      }

      // アクティビティ記録: 変更検出して記録
      if (oldData) {
        const { trackTicketChanges } = await import('@/server/utils/activity-tracker')
        await trackTicketChanges(supabase, input.id, userId, oldData, data)
      }

      return data
    }),

  delete: protectedProcedure.input(ticketIdSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    // チケット情報を取得（アクティビティ記録用）
    const { data: ticket } = await supabase
      .from('tickets')
      .select('title')
      .eq('id', input.id)
      .eq('user_id', userId)
      .single()

    // アクティビティ記録: チケット削除（削除前に記録）
    await supabase.from('ticket_activities').insert({
      ticket_id: input.id,
      user_id: userId,
      action_type: 'deleted',
      field_name: 'title',
      old_value: ticket?.title || '',
    })

    const { error } = await supabase.from('tickets').delete().eq('id', input.id).eq('user_id', userId)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `チケットの削除に失敗しました: ${error.message}`,
      })
    }

    return { success: true }
  }),

  // ========================================
  // Ticket Tags Management
  // ========================================
  addTag: protectedProcedure
    .input(z.object({ ticketId: z.string().uuid(), tagId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      // タグ名を取得
      const { data: tag } = await supabase.from('tags').select('name').eq('id', input.tagId).single()

      const { data, error } = await supabase
        .from('ticket_tags')
        .insert({
          user_id: userId,
          ticket_id: input.ticketId,
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
        ticket_id: input.ticketId,
        user_id: userId,
        action_type: 'tag_added',
        field_name: 'tag',
        new_value: tag?.name || '',
      })

      return data
    }),

  removeTag: protectedProcedure
    .input(z.object({ ticketId: z.string().uuid(), tagId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      // タグ名を取得
      const { data: tag } = await supabase.from('tags').select('name').eq('id', input.tagId).single()

      const { error } = await supabase
        .from('ticket_tags')
        .delete()
        .eq('ticket_id', input.ticketId)
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
        ticket_id: input.ticketId,
        user_id: userId,
        action_type: 'tag_removed',
        field_name: 'tag',
        old_value: tag?.name || '',
      })

      return { success: true }
    }),

  getTags: protectedProcedure.input(z.object({ ticketId: z.string().uuid() })).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    const { data, error } = await supabase
      .from('ticket_tags')
      .select('tag_id, tags(*)')
      .eq('ticket_id', input.ticketId)
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
  bulkUpdate: protectedProcedure.input(bulkUpdateTicketSchema).mutation(async ({ ctx, input }) => {
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
        message: `チケットの一括更新に失敗しました: ${error.message}`,
      })
    }

    return { count: data.length, tickets: data }
  }),

  bulkDelete: protectedProcedure.input(bulkDeleteTicketSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    const { error, count } = await supabase.from('tickets').delete().in('id', input.ids).eq('user_id', userId)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `チケットの一括削除に失敗しました: ${error.message}`,
      })
    }

    return { success: true, count: count ?? 0 }
  }),

  // ========================================
  // Statistics
  // ========================================
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx

    // 全チケット取得（最適化: select で必要なフィールドのみ取得）
    const { data: tickets, error } = await supabase.from('tickets').select('id, status').eq('user_id', userId)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `統計情報の取得に失敗しました: ${error.message}`,
      })
    }

    // ステータス別カウント
    const byStatus = tickets.reduce(
      (acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total: tickets.length,
      byStatus,
    }
  }),

  // ========================================
  // Activities（アクティビティ履歴）
  // ========================================

  /**
   * アクティビティ一覧取得
   */
  activities: protectedProcedure.input(getTicketActivitiesSchema).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx
    const { ticket_id, limit, offset, order } = input

    // チケットの所有権確認
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id')
      .eq('id', ticket_id)
      .eq('user_id', userId)
      .single()

    if (ticketError || !ticket) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Ticket not found or access denied',
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

    // Supabaseの型を厳密なTicketActivity型にキャスト
    return (activities ?? []) as TicketActivity[]
  }),

  /**
   * アクティビティ作成
   */
  createActivity: protectedProcedure.input(createTicketActivitySchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    // チケットの所有権確認
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id')
      .eq('id', input.ticket_id)
      .eq('user_id', userId)
      .single()

    if (ticketError || !ticket) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Ticket not found or access denied',
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

    // Supabaseの型を厳密なTicketActivity型にキャスト
    return activity as TicketActivity
  }),

  // タグごとのチケット数を取得
  getTagTicketCounts: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx

    // ユーザーのチケットIDを取得
    const { data: userTickets, error: ticketsError } = await supabase.from('tickets').select('id').eq('user_id', userId)

    if (ticketsError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `チケットの取得に失敗しました: ${ticketsError.message}`,
      })
    }

    const ticketIds = userTickets.map((t) => t.id)

    if (ticketIds.length === 0) {
      return {}
    }

    // ticket_tags からタグごとのカウントを取得
    const { data: tagCounts, error: countsError } = await supabase
      .from('ticket_tags')
      .select('tag_id')
      .in('ticket_id', ticketIds)

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
