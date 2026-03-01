// Core Entry type definitions
// plans + records を統合した entries テーブルに対応

/**
 * エントリの起源
 * - planned: 未来に予定として作成された
 * - unplanned: 過去に記録として直接追加された
 */
export type EntryOrigin = 'planned' | 'unplanned';

/**
 * 充実度スコア（3段階）
 * 1: 微妙
 * 2: 普通
 * 3: 良い
 */
export type FulfillmentScore = 1 | 2 | 3;

/**
 * 繰り返しタイプ
 */
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays';

/**
 * カスタム繰り返し設定
 */
export interface RecurrenceConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  byWeekday?: number[] | undefined;
  byMonthDay?: number | undefined;
  bySetPos?: number | undefined;
  endType: 'never' | 'until' | 'count';
  endDate?: string;
  count?: number;
}

/**
 * エントリ基本型（entries テーブルに対応）
 *
 * 「Time waits for no one」原則:
 * - 未来の時間帯 = 予定（upcoming）
 * - 現在の時間帯 = 進行中（active）
 * - 過去の時間帯 = 記録（past）
 * ステータスは時間位置から自動判定（getEntryState）
 */
export interface Entry {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  origin: EntryOrigin;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  fulfillment_score: FulfillmentScore | null;
  recurrence_type: RecurrenceType | null;
  recurrence_end_date: string | null;
  recurrence_rule: string | null;
  reminder_minutes: number | null;
  reviewed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * タグID付きエントリ（リレーション取得時）
 */
export interface EntryWithTags extends Entry {
  tagIds: string[];
}

/**
 * エントリ作成入力
 */
export interface CreateEntryInput {
  title: string;
  description?: string;
  origin?: EntryOrigin;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  fulfillment_score?: FulfillmentScore;
  recurrence_type?: RecurrenceType;
  recurrence_end_date?: string;
  recurrence_rule?: string;
  reminder_minutes?: number;
}

/**
 * エントリ更新入力
 */
export interface UpdateEntryInput {
  title?: string;
  description?: string;
  origin?: EntryOrigin;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  fulfillment_score?: FulfillmentScore | null;
  recurrence_type?: RecurrenceType;
  recurrence_end_date?: string;
  recurrence_rule?: string;
  reminder_minutes?: number;
  reviewed_at?: string | null;
}

/**
 * フィルター条件
 */
export interface EntryFilters {
  origin?: EntryOrigin;
  search?: string;
  tagId?: string;
  startDate?: string;
  endDate?: string;
  fulfillmentScoreMin?: FulfillmentScore;
  fulfillmentScoreMax?: FulfillmentScore;
  sortBy?: 'created_at' | 'updated_at' | 'title' | 'start_time';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
