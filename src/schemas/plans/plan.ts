import { z } from 'zod'

// Plan用Zodスキーマ

export const planStatusSchema = z.enum(['backlog', 'ready', 'active', 'wait', 'done', 'cancel'])
export const recurrenceTypeSchema = z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly', 'weekdays'])

export const createPlanSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(200, 'タイトルは200文字以内です'),
  description: z.string().max(10000, '説明は10000文字以内です').optional(), // Markdown対応のため拡張
  status: planStatusSchema,
  due_date: z.string().optional(), // 日付（YYYY-MM-DD形式）
  start_time: z.string().datetime().nullable().optional(), // 開始日時（ISO 8601形式）
  end_time: z.string().datetime().nullable().optional(), // 終了日時（ISO 8601形式）
  recurrence_type: recurrenceTypeSchema.optional(), // 繰り返しタイプ（シンプル版）
  recurrence_end_date: z.string().optional(), // 繰り返し終了日（YYYY-MM-DD形式）
  recurrence_rule: z.string().nullable().optional(), // カスタム繰り返し（RRULE形式）
  reminder_minutes: z.number().int().min(0).nullable().optional(), // 通知タイミング（開始時刻の何分前か）
})

export const updatePlanSchema = createPlanSchema.partial()

export const planIdSchema = z.object({
  id: z.string().uuid('正しいIDを指定してください'),
})

export const planFilterSchema = z.object({
  status: planStatusSchema.optional(),
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
export const planIncludeSchema = z.object({
  tags: z.boolean().optional(),
})

// getById用のスキーマ
export const getPlanByIdSchema = z.object({
  id: z.string().uuid('正しいIDを指定してください'),
  include: planIncludeSchema.optional(),
})

// 一括操作用のスキーマ
export const bulkUpdatePlanSchema = z.object({
  ids: z.array(z.string().uuid()),
  data: updatePlanSchema,
})

export const bulkDeletePlanSchema = z.object({
  ids: z.array(z.string().uuid()),
})

// 型エクスポート
export type CreatePlanInput = z.infer<typeof createPlanSchema>
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>
export type PlanStatus = z.infer<typeof planStatusSchema>
export type PlanFilter = z.infer<typeof planFilterSchema>
export type PlanInclude = z.infer<typeof planIncludeSchema>
export type GetPlanByIdInput = z.infer<typeof getPlanByIdSchema>
export type BulkUpdatePlanInput = z.infer<typeof bulkUpdatePlanSchema>
export type BulkDeletePlanInput = z.infer<typeof bulkDeletePlanSchema>

// 互換性のためのエイリアス（段階的移行用）
export const TicketStatusSchema = planStatusSchema
export const createTicketSchema = createPlanSchema
export const updateTicketSchema = updatePlanSchema
export const TicketIdSchema = planIdSchema
export const TicketFilterSchema = planFilterSchema
export const TicketIncludeSchema = planIncludeSchema
export const getTicketByIdSchema = getPlanByIdSchema
export const bulkUpdateTicketSchema = bulkUpdatePlanSchema
export const bulkDeleteTicketSchema = bulkDeletePlanSchema

export type CreateTicketInput = CreatePlanInput
export type UpdateTicketInput = UpdatePlanInput
export type TicketStatus = PlanStatus
export type TicketFilter = PlanFilter
export type TicketInclude = PlanInclude
export type GetTicketByIdInput = GetPlanByIdInput
export type BulkUpdateTicketInput = BulkUpdatePlanInput
export type BulkDeleteTicketInput = BulkDeletePlanInput
