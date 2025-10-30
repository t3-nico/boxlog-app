import { z } from 'zod'

// Ticket用Zodスキーマ

export const ticketStatusSchema = z.enum(['backlog', 'ready', 'active', 'wait', 'done', 'cancel'])
export const ticketPrioritySchema = z.enum(['urgent', 'high', 'normal', 'low'])
export const recurrenceTypeSchema = z.enum(['none', 'daily', 'weekly', 'monthly'])

export const createTicketSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(200, 'タイトルは200文字以内です'),
  description: z.string().max(10000, '説明は10000文字以内です').optional(), // Markdown対応のため拡張
  status: ticketStatusSchema,
  priority: ticketPrioritySchema.optional(),
  due_date: z.string().optional(), // 日付（YYYY-MM-DD形式）
  start_time: z.string().datetime().optional(), // 開始日時（ISO 8601形式）
  end_time: z.string().datetime().optional(), // 終了日時（ISO 8601形式）
  recurrence_type: recurrenceTypeSchema.optional(), // 繰り返しタイプ
  recurrence_end_date: z.string().optional(), // 繰り返し終了日（YYYY-MM-DD形式）
})

export const updateTicketSchema = createTicketSchema.partial()

export const ticketIdSchema = z.object({
  id: z.string().uuid('正しいIDを指定してください'),
})

export const ticketFilterSchema = z.object({
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
  search: z.string().optional(),
})

// 型エクスポート
export type CreateTicketInput = z.infer<typeof createTicketSchema>
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>
export type TicketStatus = z.infer<typeof ticketStatusSchema>
export type TicketFilter = z.infer<typeof ticketFilterSchema>
