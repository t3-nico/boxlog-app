/**
 * Records Service Types
 *
 * サービス層で使用する型定義
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';
import type { CreateRecordInput, RecordFilter, UpdateRecordInput } from '@/schemas/records';

/**
 * サービス関数で使用するSupabaseクライアント型
 */
export type ServiceSupabaseClient = SupabaseClient<Database>;

/**
 * Record のデータベース行型
 * Note: database.types.ts に records テーブルが追加されるまでの暫定型
 */
export interface RecordRow {
  id: string;
  plan_id: string;
  user_id: string;
  title?: string | null; // マイグレーション適用前はoptional
  worked_at: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number;
  fulfillment_score: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Plan 情報付き Record
 */
export interface RecordWithPlan extends RecordRow {
  plan?: {
    id: string;
    title: string;
    status: string;
  } | null;
}

/**
 * Record 一覧取得のオプション
 */
export interface ListRecordsOptions extends RecordFilter {
  userId: string;
}

/**
 * Record 作成のオプション
 */
export interface CreateRecordOptions {
  userId: string;
  input: CreateRecordInput;
}

/**
 * Record 更新のオプション
 */
export interface UpdateRecordOptions {
  userId: string;
  recordId: string;
  input: UpdateRecordInput;
}

/**
 * Record 削除のオプション
 */
export interface DeleteRecordOptions {
  userId: string;
  recordId: string;
}

/**
 * Record 取得のオプション
 */
export interface GetRecordByIdOptions {
  userId: string;
  recordId: string;
  includePlan?: boolean;
}

/**
 * Record 複製のオプション
 */
export interface DuplicateRecordOptions {
  userId: string;
  recordId: string;
  workedAt?: string | undefined; // 新しい作業日（デフォルト: 今日）
}

/**
 * Record 一括削除のオプション
 */
export interface BulkDeleteRecordsOptions {
  userId: string;
  recordIds: string[];
}

/**
 * Plan の Record 一覧取得オプション
 */
export interface ListRecordsByPlanOptions {
  userId: string;
  planId: string;
  sortBy?: 'worked_at' | 'created_at' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
  limit?: number | undefined;
}
