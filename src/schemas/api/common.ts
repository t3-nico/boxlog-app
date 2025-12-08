/**
 * 共通APIスキーマ定義
 * 全APIで使用される基本的な型とバリデーション
 */

import { z } from 'zod'

/**
 * 基本的なID型
 */
export const idSchema = z.string().uuid('validation.invalidUuid')

/**
 * 日付関連
 */
export const dateSchema = z.date()

export const futureDateSchema = dateSchema.refine((date) => date > new Date(), 'validation.futureDate')

/**
 * 文字列関連
 */
export const requiredStringSchema = z.string().min(1, 'validation.required')

export const trimmedStringSchema = z.string().transform((val) => val.trim())

export const nonEmptyStringSchema = z
  .string()
  .min(1, 'validation.required')
  .transform((val) => val.trim())

/**
 * タイトル・名前用（1-200文字）
 */
export const titleSchema = z
  .string()
  .min(1, 'validation.title.required')
  .max(200, 'validation.title.maxLength')
  .transform((val) => val.trim())
  .refine((val) => !val.match(/^\s+$/) && !val.includes('\n'), 'validation.title.noNewlines')

/**
 * 説明文用（最大2000文字）
 */
export const descriptionSchema = z.string().max(2000, 'validation.description.maxLength').optional()

/**
 * メールアドレス
 */
export const emailSchema = z
  .string()
  .email('validation.invalidEmail')
  .max(320, 'validation.email.maxLength')

/**
 * パスワード
 */
export const passwordSchema = z
  .string()
  .min(8, 'validation.password.minLength')
  .max(128, 'validation.password.maxLength')
  .refine((password) => /[a-z]/.test(password), 'validation.password.lowercase')
  .refine((password) => /[A-Z]/.test(password), 'validation.password.uppercase')
  .refine((password) => /\d/.test(password), 'validation.password.number')

/**
 * 優先度
 */
export const prioritySchema = z.enum(['low', 'medium', 'high'])

/**
 * ステータス
 */
export const statusSchema = z.enum(['todo', 'in_progress', 'done', 'archived'])

/**
 * 色
 */
export const colorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'validation.invalidColorCode')

/**
 * タグ
 */
export const tagSchema = z.object({
  id: idSchema,
  name: titleSchema,
  color: colorSchema,
  createdAt: dateSchema,
  updatedAt: dateSchema,
})

/**
 * ページネーション
 */
export const paginationInputSchema = z.object({
  page: z.number().int().min(1, 'validation.pagination.pageMin').default(1),
  limit: z
    .number()
    .int()
    .min(1, 'validation.pagination.limitMin')
    .max(100, 'validation.pagination.limitMax')
    .default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const paginationOutputSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
})

/**
 * 検索
 */
export const searchInputSchema = z.object({
  query: z.string().max(100, 'validation.search.maxLength').optional(),
  filters: z.record(z.string(), z.any()).optional(),
  ...paginationInputSchema.shape,
})

/**
 * API応答の基本型
 */
export const apiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
  })

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.number(),
    message: z.string(),
    details: z
      .array(
        z.object({
          field: z.string(),
          message: z.string(),
        })
      )
      .optional(),
  }),
})

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.union([apiSuccessSchema(dataSchema), apiErrorSchema])

/**
 * ファイルアップロード
 */
export const fileSchema = z.object({
  name: z.string(),
  size: z.number().max(10 * 1024 * 1024, 'validation.file.maxSize'),
  type: z.string(),
  url: z.string().url('validation.invalidUrl'),
})

/**
 * メタデータ
 */
export const metadataSchema = z.object({
  createdAt: dateSchema,
  updatedAt: dateSchema,
  createdBy: idSchema.optional(),
  updatedBy: idSchema.optional(),
  version: z.number().int().min(1).default(1),
})

/**
 * 型ヘルパー
 */
export type ID = z.infer<typeof idSchema>
export type Priority = z.infer<typeof prioritySchema>
export type Status = z.infer<typeof statusSchema>
export type Tag = z.infer<typeof tagSchema>
export type PaginationInput = z.infer<typeof paginationInputSchema>
export type PaginationOutput = z.infer<typeof paginationOutputSchema>
export type SearchInput = z.infer<typeof searchInputSchema>
export type FileData = z.infer<typeof fileSchema>
export type Metadata = z.infer<typeof metadataSchema>

/**
 * バリデーションヘルパー関数
 */
export function createValidatedInput<T extends z.ZodSchema>(schema: T) {
  return (input: unknown): z.infer<T> => {
    const result = schema.safeParse(input)
    if (!result.success) {
      throw new Error(`Validation error: ${result.error.message}`)
    }
    return result.data
  }
}

/**
 * 複数のバリデーションエラーをフォーマット
 * Note: エラーメッセージは翻訳キーとして返されるため、表示時に翻訳が必要
 */
export function formatValidationErrors(error: z.ZodError): string[] {
  return error.issues.map((err) => {
    const path = err.path.join('.')
    return path ? `${path}: ${err.message}` : err.message
  })
}
