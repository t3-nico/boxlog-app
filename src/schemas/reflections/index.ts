import { z } from 'zod';

/**
 * 振り返り期間種別
 */
export const reflectionPeriodTypeSchema = z.enum(['daily', 'weekly', 'monthly']);
export type ReflectionPeriodType = z.infer<typeof reflectionPeriodTypeSchema>;

/**
 * 振り返り一覧取得スキーマ
 */
export const listReflectionsSchema = z.object({
  periodType: reflectionPeriodTypeSchema.optional(),
  limit: z.number().int().min(1).max(50).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

export type ListReflectionsInput = z.infer<typeof listReflectionsSchema>;

/**
 * 振り返り取得スキーマ
 */
export const getReflectionByIdSchema = z.object({
  id: z.string().uuid(),
});

export type GetReflectionByIdInput = z.infer<typeof getReflectionByIdSchema>;

/**
 * 振り返りノート更新スキーマ
 */
export const updateReflectionNoteSchema = z.object({
  id: z.string().uuid(),
  userNote: z.string().max(10000),
});

export type UpdateReflectionNoteInput = z.infer<typeof updateReflectionNoteSchema>;

/**
 * 振り返り生成リクエストスキーマ
 */
export const generateReflectionSchema = z.object({
  periodType: reflectionPeriodTypeSchema,
  periodStart: z.string(), // YYYY-MM-DD
});

export type GenerateReflectionInput = z.infer<typeof generateReflectionSchema>;

/**
 * 集計データ取得スキーマ
 */
export const getAggregationDataSchema = z.object({
  weekStart: z.string(), // YYYY-MM-DD
});

export type GetAggregationDataInput = z.infer<typeof getAggregationDataSchema>;

/**
 * 充実度トレンド取得スキーマ
 */
export const getFulfillmentTrendSchema = z.object({
  startDate: z.string(), // YYYY-MM-DD
  endDate: z.string(), // YYYY-MM-DD
});

export type GetFulfillmentTrendInput = z.infer<typeof getFulfillmentTrendSchema>;

/**
 * エネルギーマップ取得スキーマ
 */
export const getEnergyMapSchema = z.object({
  startDate: z.string(), // YYYY-MM-DD
  endDate: z.string(), // YYYY-MM-DD
});

export type GetEnergyMapInput = z.infer<typeof getEnergyMapSchema>;
