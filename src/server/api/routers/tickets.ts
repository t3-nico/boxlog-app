/**
 * tRPC Router: Tickets
 * チケット・セッション・タグ管理API
 */

import { TRPCError } from '@trpc/server'
import { z } from 'zod'

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

    // フィルター適用
    if (input?.status) {
      query = query.eq('status', input.status)
    }
    if (input?.priority) {
      query = query.eq('priority', input.priority)
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

    return data
  }),

  update: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: updateTicketSchema }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

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

      return data
    }),

  delete: protectedProcedure.input(ticketIdSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

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

      return data
    }),

  removeTag: protectedProcedure
    .input(z.object({ ticketId: z.string().uuid(), tagId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

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
    const { data: tickets, error } = await supabase.from('tickets').select('id, status, priority').eq('user_id', userId)

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

    // 優先度別カウント
    const byPriority = tickets.reduce(
      (acc, ticket) => {
        if (ticket.priority) {
          acc[ticket.priority] = (acc[ticket.priority] ?? 0) + 1
        }
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total: tickets.length,
      byStatus,
      byPriority,
    }
  }),
})
