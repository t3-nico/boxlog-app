import { z } from 'zod'

// Session用Zodスキーマ

export const sessionStatusSchema = z.enum(['planned', 'in_progress', 'completed', 'cancelled'])
export const recurrenceTypeSchema = z.enum(['none', 'daily', 'weekly', 'monthly'])

export const createSessionSchema = z.object({
  ticket_id: z.string().uuid('正しいチケットIDを指定してください'),
  title: z.string().min(1, 'タイトルは必須です').max(200, 'タイトルは200文字以内です'),
  planned_start: z.string().datetime('正しい日時形式を入力してください').optional(),
  planned_end: z.string().datetime('正しい日時形式を入力してください').optional(),
  notes: z.string().max(2000, 'メモは2000文字以内です').optional(),
  reminder_minutes: z.number().int().min(0).max(10080).optional(), // 最大7日前（10080分）
  recurrence_type: recurrenceTypeSchema.optional(),
  recurrence_end_date: z.string().datetime().optional(),
})

export const updateSessionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  planned_start: z.string().datetime().optional(),
  planned_end: z.string().datetime().optional(),
  actual_start: z.string().datetime().optional(),
  actual_end: z.string().datetime().optional(),
  status: sessionStatusSchema.optional(),
  notes: z.string().max(2000).optional(),
  reminder_minutes: z.number().int().min(0).max(10080).optional(),
  recurrence_type: recurrenceTypeSchema.optional(),
  recurrence_end_date: z.string().datetime().optional(),
})

export const sessionIdSchema = z.object({
  id: z.string().uuid('正しいIDを指定してください'),
})

export const sessionFilterSchema = z.object({
  ticket_id: z.string().uuid().optional(),
  status: sessionStatusSchema.optional(),
})

// 型エクスポート
export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>
export type SessionStatus = z.infer<typeof sessionStatusSchema>
export type RecurrenceType = z.infer<typeof recurrenceTypeSchema>
export type SessionFilter = z.infer<typeof sessionFilterSchema>
