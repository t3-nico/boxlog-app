import { z } from 'zod'

// Ticket用Zodスキーマ

export const ticketStatusSchema = z.enum(['open', 'in_progress', 'completed', 'cancelled'])
export const ticketPrioritySchema = z.enum(['urgent', 'high', 'normal', 'low'])

export const createTicketSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(200, 'タイトルは200文字以内です'),
  description: z.string().max(2000, '説明は2000文字以内です').optional(),
  status: ticketStatusSchema.default('open'),
  priority: ticketPrioritySchema.default('normal'),
  planned_hours: z.number().positive('予定時間は正の数値を入力してください').optional(),
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
export type TicketPriority = z.infer<typeof ticketPrioritySchema>
export type TicketFilter = z.infer<typeof ticketFilterSchema>
