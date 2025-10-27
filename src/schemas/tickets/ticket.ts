import { z } from 'zod'

// Ticket用Zodスキーマ

export const ticketStatusSchema = z.enum(['open', 'in_progress', 'completed', 'cancelled'])

export const createTicketSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(200, 'タイトルは200文字以内です'),
  description: z.string().max(10000, '説明は10000文字以内です').optional(), // Markdown対応のため拡張
  status: ticketStatusSchema,
})

export const updateTicketSchema = createTicketSchema.partial()

export const ticketIdSchema = z.object({
  id: z.string().uuid('正しいIDを指定してください'),
})

export const ticketFilterSchema = z.object({
  status: ticketStatusSchema.optional(),
  search: z.string().optional(),
})

// 型エクスポート
export type CreateTicketInput = z.infer<typeof createTicketSchema>
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>
export type TicketStatus = z.infer<typeof ticketStatusSchema>
export type TicketFilter = z.infer<typeof ticketFilterSchema>
