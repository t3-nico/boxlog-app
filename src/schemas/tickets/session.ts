import { z } from 'zod'

// Session用Zodスキーマ

export const sessionStatusSchema = z.enum(['planned', 'in_progress', 'completed', 'cancelled'])

export const createSessionSchema = z.object({
  ticket_id: z.string().uuid('正しいチケットIDを指定してください'),
  title: z.string().min(1, 'タイトルは必須です').max(200, 'タイトルは200文字以内です'),
  planned_start: z.string().datetime('正しい日時形式を入力してください').optional(),
  planned_end: z.string().datetime('正しい日時形式を入力してください').optional(),
  notes: z.string().max(2000, 'メモは2000文字以内です').optional(),
})

export const updateSessionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  planned_start: z.string().datetime().optional(),
  planned_end: z.string().datetime().optional(),
  actual_start: z.string().datetime().optional(),
  actual_end: z.string().datetime().optional(),
  status: sessionStatusSchema.optional(),
  notes: z.string().max(2000).optional(),
})

export const sessionIdSchema = z.object({
  id: z.string().uuid('正しいIDを指定してください'),
})

export const sessionFilterSchema = z.object({
  ticket_id: z.string().uuid().optional(),
  status: sessionStatusSchema.optional(),
})
