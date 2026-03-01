import { z } from 'zod';

// Entry 用 Zod スキーマ（plans + records を統合）

export const entryOriginSchema = z.enum(['planned', 'unplanned']);

export const recurrenceTypeSchema = z.enum([
  'none',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'weekdays',
]);

// 充実度スコア（3段階: 1=微妙, 2=普通, 3=良い）
export const fulfillmentScoreSchema = z.number().int().min(1).max(3);

// Entry 作成スキーマ
export const createEntrySchema = z.object({
  title: z.string().max(200, 'validation.title.maxLength'),
  description: z.string().max(10000, 'validation.description.maxLength').optional(),
  origin: entryOriginSchema.optional(), // 省略時はサーバー側で時間位置から判定
  start_time: z.string().datetime().nullable().optional(),
  end_time: z.string().datetime().nullable().optional(),
  duration_minutes: z.number().int().min(1).nullable().optional(),
  fulfillment_score: fulfillmentScoreSchema.nullable().optional(),
  recurrence_type: recurrenceTypeSchema.optional(),
  recurrence_end_date: z.string().optional(),
  recurrence_rule: z.string().nullable().optional(),
  reminder_minutes: z.number().int().min(0).nullable().optional(),
});

// Entry 更新スキーマ
export const updateEntrySchema = createEntrySchema.partial();

// Entry ID スキーマ
export const entryIdSchema = z.object({
  id: z.string().uuid('validation.invalidUuid'),
});

// Entry フィルタスキーマ
export const entryFilterSchema = z.object({
  origin: entryOriginSchema.optional(),
  search: z.string().optional(),
  tagId: z.string().uuid().optional(),
  // 日付範囲フィルタ（start_time基準）
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  // 充実度フィルタ
  fulfillmentScoreMin: z.number().int().min(1).max(3).optional(),
  fulfillmentScoreMax: z.number().int().min(1).max(3).optional(),
  // ソート
  sortBy: z.enum(['created_at', 'updated_at', 'title', 'start_time']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  // ページネーション
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

// リレーション取得オプション
export const entryIncludeSchema = z.object({
  tags: z.boolean().optional(),
});

// getById 用スキーマ
export const getEntryByIdSchema = z.object({
  id: z.string().uuid('validation.invalidUuid'),
  include: entryIncludeSchema.optional(),
});

// 一括操作用スキーマ
export const bulkUpdateEntrySchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  data: updateEntrySchema,
});

export const bulkDeleteEntrySchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
});

// 型エクスポート
export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
export type EntryOrigin = z.infer<typeof entryOriginSchema>;
export type EntryFilter = z.infer<typeof entryFilterSchema>;
export type EntryInclude = z.infer<typeof entryIncludeSchema>;
export type GetEntryByIdInput = z.infer<typeof getEntryByIdSchema>;
export type BulkUpdateEntryInput = z.infer<typeof bulkUpdateEntrySchema>;
export type BulkDeleteEntryInput = z.infer<typeof bulkDeleteEntrySchema>;
