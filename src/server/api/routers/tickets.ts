/**
 * tRPC Router: Tickets
 * チケット・セッション・タグ管理API
 */

import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import {
  createRecordSchema,
  createSessionSchema,
  createTagSchema,
  createTicketSchema,
  recordIdSchema,
  sessionFilterSchema,
  sessionIdSchema,
  tagIdSchema,
  ticketFilterSchema,
  ticketIdSchema,
  updateSessionSchema,
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
        // @ts-expect-error - Supabase型推論の問題（既知の問題）
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
          // @ts-expect-error - Supabase型推論の問題（既知の問題）
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

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `チケット一覧の取得に失敗しました: ${error.message}`,
      })
    }

    return data
  }),

  getById: protectedProcedure.input(ticketIdSchema).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    const { data, error } = await supabase.from('tickets').select('*').eq('id', input.id).eq('user_id', userId).single()

    if (error) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `チケットが見つかりません: ${error.message}`,
      })
    }

    return data
  }),

  create: protectedProcedure.input(createTicketSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    const { data, error } = await supabase
      .from('tickets')
      // @ts-expect-error - Supabase型推論の問題（既知の問題）
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
        // @ts-expect-error - Supabase型推論の問題（既知の問題）
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
  // Sessions CRUD
  // ========================================
  sessions: {
    list: protectedProcedure.input(sessionFilterSchema.optional()).query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      let query = supabase.from('sessions').select('*').eq('user_id', userId)

      // フィルター適用
      if (input?.ticket_id) {
        query = query.eq('ticket_id', input.ticket_id)
      }
      if (input?.status) {
        query = query.eq('status', input.status)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `セッション一覧の取得に失敗しました: ${error.message}`,
        })
      }

      return data
    }),

    getById: protectedProcedure.input(sessionIdSchema).query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', input.id)
        .eq('user_id', userId)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `セッションが見つかりません: ${error.message}`,
        })
      }

      return data
    }),

    create: protectedProcedure.input(createSessionSchema).mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      const { data, error } = await supabase
        .from('sessions')
        // @ts-expect-error - Supabase型推論の問題（既知の問題）
        .insert({
          user_id: userId,
          session_number: '', // トリガーで自動採番
          ...input,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `セッションの作成に失敗しました: ${error.message}`,
        })
      }

      return data
    }),

    update: protectedProcedure
      .input(z.object({ id: z.string().uuid(), data: updateSessionSchema }))
      .mutation(async ({ ctx, input }) => {
        const { supabase, userId } = ctx

        const { data, error } = await supabase
          .from('sessions')
          // @ts-expect-error - Supabase型推論の問題（既知の問題）
          .update(input.data)
          .eq('id', input.id)
          .eq('user_id', userId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `セッションの更新に失敗しました: ${error.message}`,
          })
        }

        return data
      }),

    delete: protectedProcedure.input(sessionIdSchema).mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      const { error } = await supabase.from('sessions').delete().eq('id', input.id).eq('user_id', userId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `セッションの削除に失敗しました: ${error.message}`,
        })
      }

      return { success: true }
    }),
  },

  // ========================================
  // Ticket Tags Management
  // ========================================
  addTag: protectedProcedure
    .input(z.object({ ticketId: z.string().uuid(), tagId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      const { data, error } = await supabase
        .from('ticket_tags')
        // @ts-expect-error - Supabase型推論の問題（既知の問題）
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

    // @ts-expect-error - Supabase型推論の問題（既知の問題）
    return data.map((item) => item.tags).filter(Boolean)
  }),

  // ========================================
  // Session Tags Management
  // ========================================
  addSessionTag: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid(), tagId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      const { data, error } = await supabase
        .from('session_tags')
        // @ts-expect-error - Supabase型推論の問題（既知の問題）
        .insert({
          user_id: userId,
          session_id: input.sessionId,
          tag_id: input.tagId,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `セッションタグの追加に失敗しました: ${error.message}`,
        })
      }

      return data
    }),

  removeSessionTag: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid(), tagId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      const { error } = await supabase
        .from('session_tags')
        .delete()
        .eq('session_id', input.sessionId)
        .eq('tag_id', input.tagId)
        .eq('user_id', userId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `セッションタグの削除に失敗しました: ${error.message}`,
        })
      }

      return { success: true }
    }),

  getSessionTags: protectedProcedure.input(z.object({ sessionId: z.string().uuid() })).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    const { data, error } = await supabase
      .from('session_tags')
      .select('tag_id, tags(*)')
      .eq('session_id', input.sessionId)
      .eq('user_id', userId)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `セッションタグ一覧の取得に失敗しました: ${error.message}`,
      })
    }

    // @ts-expect-error - Supabase型推論の問題（既知の問題）
    return data.map((item) => item.tags).filter(Boolean)
  }),

  // ========================================
  // Records CRUD
  // ========================================
  records: {
    list: protectedProcedure.input(z.object({ session_id: z.string().uuid() })).query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      const { data, error } = await supabase
        .from('records')
        .select('*')
        .eq('user_id', userId)
        .eq('session_id', input.session_id)
        .order('created_at', { ascending: false })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `記録一覧の取得に失敗しました: ${error.message}`,
        })
      }

      return data
    }),

    create: protectedProcedure.input(createRecordSchema).mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      const { data, error } = await supabase
        .from('records')
        // @ts-expect-error - Supabase型推論の問題（既知の問題）
        .insert({
          user_id: userId,
          ...input,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `記録の作成に失敗しました: ${error.message}`,
        })
      }

      return data
    }),

    delete: protectedProcedure.input(recordIdSchema).mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      const { error } = await supabase.from('records').delete().eq('id', input.id).eq('user_id', userId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `記録の削除に失敗しました: ${error.message}`,
        })
      }

      return { success: true }
    }),
  },
})
