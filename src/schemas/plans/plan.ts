import { z } from 'zod';

// Plan用Zodスキーマ

export const planStatusSchema = z.enum(['open', 'closed']);
export const recurrenceTypeSchema = z.enum([
  'none',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'weekdays',
]);

export const createPlanSchema = z.object({
  // Google Calendar準拠: 空タイトルを許可（表示時に「（タイトルなし）」）
  title: z.string().max(200, 'validation.title.maxLength'),
  description: z.string().max(10000, 'validation.description.maxLength').optional(), // Markdown対応のため拡張
  status: planStatusSchema,
  start_time: z.string().datetime().nullable().optional(), // 開始日時（ISO 8601形式）
  end_time: z.string().datetime().nullable().optional(), // 終了日時（ISO 8601形式）
  recurrence_type: recurrenceTypeSchema.optional(), // 繰り返しタイプ（シンプル版）
  recurrence_end_date: z.string().optional(), // 繰り返し終了日（YYYY-MM-DD形式）
  recurrence_rule: z.string().nullable().optional(), // カスタム繰り返し（RRULE形式）
  reminder_minutes: z.number().int().min(0).nullable().optional(), // 通知タイミング（開始時刻の何分前か）
});

export const updatePlanSchema = createPlanSchema.partial();

export const planIdSchema = z.object({
  id: z.string().uuid('validation.invalidUuid'),
});

export const planFilterSchema = z.object({
  status: planStatusSchema.optional(),
  search: z.string().optional(),
  tagId: z.string().uuid().optional(), // タグIDでフィルタ
  // 日付範囲フィルタ（カレンダー表示高速化用）
  startDate: z.string().datetime().optional(), // 開始日時（ISO 8601形式）
  endDate: z.string().datetime().optional(), // 終了日時（ISO 8601形式）
  // ソート
  sortBy: z.enum(['created_at', 'updated_at', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  // ページネーション
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

// リレーション取得オプション
export const planIncludeSchema = z.object({
  tags: z.boolean().optional(),
});

// getById用のスキーマ
export const getPlanByIdSchema = z.object({
  id: z.string().uuid('validation.invalidUuid'),
  include: planIncludeSchema.optional(),
});

// 一括操作用のスキーマ
export const bulkUpdatePlanSchema = z.object({
  ids: z.array(z.string().uuid()),
  data: updatePlanSchema,
});

export const bulkDeletePlanSchema = z.object({
  ids: z.array(z.string().uuid()),
});

// 型エクスポート
export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type PlanStatus = z.infer<typeof planStatusSchema>;
export type PlanFilter = z.infer<typeof planFilterSchema>;
export type PlanInclude = z.infer<typeof planIncludeSchema>;
export type GetPlanByIdInput = z.infer<typeof getPlanByIdSchema>;
export type BulkUpdatePlanInput = z.infer<typeof bulkUpdatePlanSchema>;
export type BulkDeletePlanInput = z.infer<typeof bulkDeletePlanSchema>;
