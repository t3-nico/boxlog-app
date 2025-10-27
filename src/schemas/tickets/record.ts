import { z } from 'zod'

// Record用Zodスキーマ

export const createRecordSchema = z.object({
  session_id: z.string().uuid('正しいセッションIDを指定してください'),
  record_type: z.string().min(1, 'レコードタイプは必須です').max(50),
  content: z.string().min(1, 'コンテンツは必須です').max(5000, 'コンテンツは5000文字以内です'),
  metadata: z.record(z.unknown()).optional(),
})

export const updateRecordSchema = createRecordSchema.partial().omit({ session_id: true })

export const recordIdSchema = z.object({
  id: z.string().uuid('正しいIDを指定してください'),
})
