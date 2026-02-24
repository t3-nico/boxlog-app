import { z } from 'zod';

// Record 用 Zod スキーマ

// 充実度スコア（1-5）
export const fulfillmentScoreSchema = z.number().int().min(1).max(5);

// Record 作成スキーマ
export const createRecordSchema = z.object({
  plan_id: z.string().uuid('validation.invalidUuid').nullable().optional(), // Planなしでも作成可能
  title: z.string().max(200, 'validation.title.maxLength').nullable().optional(), // 作業タイトル（任意）
  worked_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'validation.invalidDateFormat'), // YYYY-MM-DD
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/)
    .nullable()
    .optional(), // HH:MM or HH:MM:SS
  end_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/)
    .nullable()
    .optional(), // HH:MM or HH:MM:SS
  duration_minutes: z.number().int().min(1, 'validation.durationMin'), // 1分以上
  fulfillment_score: fulfillmentScoreSchema.nullable().optional(),
  description: z.string().max(5000, 'validation.description.maxLength').nullable().optional(),
  tagIds: z.array(z.string().uuid()).optional(), // 紐付けるタグID（任意）
});

// Record 更新スキーマ（plan_id変更も許可）
export const updateRecordSchema = createRecordSchema.partial();

// Record ID スキーマ
export const recordIdSchema = z.object({
  id: z.string().uuid('validation.invalidUuid'),
});

// Record フィルタスキーマ
export const recordFilterSchema = z.object({
  // Plan でフィルタ
  plan_id: z.string().uuid().optional(),
  // 日付範囲フィルタ（worked_at基準）
  worked_at_from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(), // YYYY-MM-DD
  worked_at_to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(), // YYYY-MM-DD
  // 充実度フィルタ
  fulfillment_score_min: z.number().int().min(1).max(5).optional(),
  fulfillment_score_max: z.number().int().min(1).max(5).optional(),
  // ソート
  sortBy: z.enum(['worked_at', 'created_at', 'updated_at', 'duration_minutes']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  // ページネーション
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

// リレーション取得オプション
export const recordIncludeSchema = z.object({
  plan: z.boolean().optional(), // 紐づく Plan を含める
});

// getById 用スキーマ
export const getRecordByIdSchema = z.object({
  id: z.string().uuid('validation.invalidUuid'),
  include: recordIncludeSchema.optional(),
});

// 一括削除スキーマ
export const bulkDeleteRecordSchema = z.object({
  ids: z.array(z.string().uuid()),
});

// 複製スキーマ（最近のエントリ複製用）
export const duplicateRecordSchema = z.object({
  id: z.string().uuid('validation.invalidUuid'),
  worked_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(), // 新しい作業日（デフォルト: 今日）
});

// 型エクスポート
export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
export type RecordFilter = z.infer<typeof recordFilterSchema>;
export type RecordInclude = z.infer<typeof recordIncludeSchema>;
export type GetRecordByIdInput = z.infer<typeof getRecordByIdSchema>;
export type BulkDeleteRecordInput = z.infer<typeof bulkDeleteRecordSchema>;
export type DuplicateRecordInput = z.infer<typeof duplicateRecordSchema>;
