import { z } from 'zod'

// Ticket用Zodスキーマ

export const ticketStatusSchema = z.enum(['backlog', 'ready', 'active', 'wait', 'done', 'cancel'])
export const recurrenceTypeSchema = z.enum(['none', 'daily', 'weekly', 'monthly'])

export const createTicketSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(200, 'タイトルは200文字以内です'),
  description: z.string().max(10000, '説明は10000文字以内です').optional(), // Markdown対応のため拡張
  status: ticketStatusSchema,
  due_date: z.string().optional(), // 日付（YYYY-MM-DD形式）
  start_time: z.string().datetime().optional(), // 開始日時（ISO 8601形式）
  end_time: z.string().datetime().optional(), // 終了日時（ISO 8601形式）
  recurrence_type: recurrenceTypeSchema.optional(), // 繰り返しタイプ（シンプル版）
  recurrence_end_date: z.string().optional(), // 繰り返し終了日（YYYY-MM-DD形式）
  recurrence_rule: z.string().nullable().optional(), // カスタム繰り返し（RRULE形式）
})

export const updateTicketSchema = createTicketSchema.partial()

export const ticketIdSchema = z.object({
  id: z.string().uuid('正しいIDを指定してください'),
})

export const ticketFilterSchema = z.object({
  status: ticketStatusSchema.optional(),
  search: z.string().optional(),
  tagId: z.string().uuid().optional(), // タグIDでフィルタ
  // ソート
  sortBy: z.enum(['created_at', 'updated_at', 'due_date', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  // ページネーション
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
})

// リレーション取得オプション
export const ticketIncludeSchema = z.object({
  tags: z.boolean().optional(),
})

// getById用のスキーマ
export const getTicketByIdSchema = z.object({
  id: z.string().uuid('正しいIDを指定してください'),
  include: ticketIncludeSchema.optional(),
})

// 一括操作用のスキーマ
export const bulkUpdateTicketSchema = z.object({
  ids: z.array(z.string().uuid()),
  data: updateTicketSchema,
})

export const bulkDeleteTicketSchema = z.object({
  ids: z.array(z.string().uuid()),
})

// 型エクスポート
export type CreateTicketInput = z.infer<typeof createTicketSchema>
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>
export type TicketStatus = z.infer<typeof ticketStatusSchema>
export type TicketFilter = z.infer<typeof ticketFilterSchema>
export type TicketInclude = z.infer<typeof ticketIncludeSchema>
export type GetTicketByIdInput = z.infer<typeof getTicketByIdSchema>
export type BulkUpdateTicketInput = z.infer<typeof bulkUpdateTicketSchema>
export type BulkDeleteTicketInput = z.infer<typeof bulkDeleteTicketSchema>
