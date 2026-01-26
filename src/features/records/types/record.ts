// Record 型定義

/**
 * 充実度スコア（1-5）
 * 1: 低い
 * 2: やや低い
 * 3: 普通
 * 4: やや高い
 * 5: 高い
 */
export type FulfillmentScore = 1 | 2 | 3 | 4 | 5;

/**
 * Record 基本型（データベーススキーマに対応）
 */
export interface Record {
  id: string;
  plan_id: string;
  user_id: string;
  worked_at: string; // DATE型（YYYY-MM-DD）
  start_time: string | null; // TIME型（HH:MM:SS）
  end_time: string | null; // TIME型（HH:MM:SS）
  duration_minutes: number; // 作業時間（分）
  fulfillment_score: FulfillmentScore | null; // 充実度（1-5）
  note: string | null; // メモ
  created_at: string;
  updated_at: string;
}

/**
 * Record 作成入力
 */
export interface CreateRecordInput {
  plan_id: string;
  worked_at: string; // YYYY-MM-DD
  start_time?: string | null; // HH:MM or HH:MM:SS
  end_time?: string | null; // HH:MM or HH:MM:SS
  duration_minutes: number;
  fulfillment_score?: FulfillmentScore | null;
  note?: string | null;
}

/**
 * Record 更新入力
 */
export interface UpdateRecordInput {
  worked_at?: string;
  start_time?: string | null;
  end_time?: string | null;
  duration_minutes?: number;
  fulfillment_score?: FulfillmentScore | null;
  note?: string | null;
}

/**
 * Plan 情報付き Record（リレーション取得時）
 */
export interface RecordWithPlan extends Record {
  plan: {
    id: string;
    title: string;
    status: 'open' | 'closed';
  };
}

/**
 * フィルター条件
 */
export interface RecordFilters {
  planId?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  minFulfillment?: FulfillmentScore;
  maxFulfillment?: FulfillmentScore;
  search?: string;
  sortBy?: 'worked_at' | 'created_at' | 'updated_at' | 'duration_minutes';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * 統計情報
 */
export interface RecordStats {
  total: number;
  totalDurationMinutes: number;
  averageDurationMinutes: number;
  averageFulfillment: number | null;
  byDate: Array<{
    date: string;
    count: number;
    totalMinutes: number;
  }>;
}
