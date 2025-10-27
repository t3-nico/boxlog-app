import { z } from 'zod'

// Tag用Zodスキーマ

export const createTagSchema = z.object({
  name: z.string().min(1, 'タグ名は必須です').max(50, 'タグ名は50文字以内です'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, '正しいカラーコードを入力してください')
    .default('#3B82F6'),
  description: z.string().max(200, '説明は200文字以内です').optional(),
})

export const updateTagSchema = createTagSchema.partial()

export const tagIdSchema = z.object({
  id: z.string().uuid('正しいIDを指定してください'),
})
