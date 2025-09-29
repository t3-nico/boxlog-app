/**
 * 共通APIスキーマ定義
 * 全APIで使用される基本的な型とバリデーション
 */

import { z } from 'zod'

/**
 * 基本的なID型
 */
export const idSchema = z.string().uuid('有効なUUIDを指定してください')

/**
 * 日付関連
 */
export const dateSchema = z.date({
  required_error: '日付は必須です',
  invalid_type_error: '有効な日付を指定してください',
})

export const futureDateSchema = dateSchema.refine(
  (date) => date > new Date(),
  '未来の日付を指定してください'
)

/**
 * 文字列関連
 */
export const requiredStringSchema = z.string({
  required_error: 'この項目は必須です',
  invalid_type_error: '文字列で入力してください',
}).min(1, 'この項目は必須です')

export const trimmedStringSchema = z.string().transform((val) => val.trim())

export const nonEmptyStringSchema = z.string()
  .min(1, 'この項目は必須です')
  .transform((val) => val.trim())

/**
 * タイトル・名前用（1-200文字）
 */
export const titleSchema = z.string()
  .min(1, 'タイトルは必須です')
  .max(200, 'タイトルは200文字以内で入力してください')
  .transform((val) => val.trim())
  .refine(
    (val) => !val.match(/^\s+$/) && !val.includes('\n'),
    'タイトルに改行や空白のみは使用できません'
  )

/**
 * 説明文用（最大2000文字）
 */
export const descriptionSchema = z.string()
  .max(2000, '説明は2000文字以内で入力してください')
  .optional()

/**
 * メールアドレス
 */
export const emailSchema = z.string()
  .email('有効なメールアドレスを入力してください')
  .max(320, 'メールアドレスが長すぎます')

/**
 * パスワード
 */
export const passwordSchema = z.string()
  .min(8, 'パスワードは8文字以上で入力してください')
  .max(128, 'パスワードは128文字以内で入力してください')
  .refine(
    (password) => /[a-z]/.test(password),
    '小文字を含める必要があります'
  )
  .refine(
    (password) => /[A-Z]/.test(password),
    '大文字を含める必要があります'
  )
  .refine(
    (password) => /\d/.test(password),
    '数字を含める必要があります'
  )

/**
 * 優先度
 */
export const prioritySchema = z.enum(['low', 'medium', 'high'], {
  required_error: '優先度を選択してください',
  invalid_type_error: '有効な優先度を選択してください',
})

/**
 * ステータス
 */
export const statusSchema = z.enum(['todo', 'in_progress', 'done', 'archived'], {
  required_error: 'ステータスを選択してください',
  invalid_type_error: '有効なステータスを選択してください',
})

/**
 * 色
 */
export const colorSchema = z.string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, '有効な色コード（#RRGGBB）を指定してください')

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
  page: z.number().int().min(1, 'ページ番号は1以上を指定してください').default(1),
  limit: z.number().int().min(1, '取得件数は1以上を指定してください').max(100, '取得件数は100以下を指定してください').default(20),
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
  query: z.string().max(100, '検索クエリは100文字以内で入力してください').optional(),
  filters: z.record(z.any()).optional(),
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
    details: z.array(z.object({
      field: z.string(),
      message: z.string(),
    })).optional(),
  }),
})

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.union([apiSuccessSchema(dataSchema), apiErrorSchema])

/**
 * ファイルアップロード
 */
export const fileSchema = z.object({
  name: z.string(),
  size: z.number().max(10 * 1024 * 1024, 'ファイルサイズは10MB以下にしてください'),
  type: z.string(),
  url: z.string().url('有効なURLを指定してください'),
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
      throw new Error(`バリデーションエラー: ${result.error.message}`)
    }
    return result.data
  }
}

/**
 * 複数のバリデーションエラーを日本語でフォーマット
 */
export function formatValidationErrors(error: z.ZodError): string[] {
  return error.errors.map((err) => {
    const path = err.path.join('.')
    const pathLabel = path || '入力値'
    return `${pathLabel}: ${err.message}`
  })
}