// Plan型定義

/**
 * プランステータス（3段階）
 * - todo: 未着手
 * - doing: 作業中（自動判定: カレンダー配置 or Log紐づけ）
 * - done: 完了（手動）
 *
 * 注意: DBには 'done' かどうかのみ保存。
 * 'doing' は start_time / log_id から計算で導出。
 * 詳細は getEffectiveStatus() を参照。
 */
export type PlanStatus = 'todo' | 'doing' | 'done';

/**
 * 繰り返しタイプ（シンプル版）
 */
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

/**
 * カスタム繰り返し設定
 */
export interface RecurrenceConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // 1-365（1 = 毎日/毎週、2 = 2日ごと/2週間ごと）

  // 週次のみ
  byWeekday?: number[] | undefined; // 0-6（日曜-土曜）

  // 月次のみ
  byMonthDay?: number | undefined; // 1-31（毎月X日形式）
  bySetPos?: number | undefined; // 1-5（第1-第5週、-1=最終週）※ byWeekday と併用

  // 終了条件（いずれか1つ）
  endType: 'never' | 'until' | 'count';
  endDate?: string; // YYYY-MM-DD
  count?: number;
}

/**
 * プラン基本型（データベーススキーマに対応）
 */
export interface Plan {
  id: string;
  user_id: string;
  plan_number: string;
  title: string;
  description: string | null;
  status: PlanStatus;
  due_date: string | null; // DATE型（YYYY-MM-DD）
  start_time: string | null; // TIMESTAMPTZ型（ISO 8601）
  end_time: string | null; // TIMESTAMPTZ型（ISO 8601）
  recurrence_type: RecurrenceType | null;
  recurrence_end_date: string | null; // DATE型（YYYY-MM-DD）
  recurrence_rule: string | null; // RRULE形式（カスタム繰り返し）
  reminder_minutes: number | null; // 通知タイミング（開始時刻の何分前か、null = 通知なし）
  created_at: string | null;
  updated_at: string | null;
}

/**
 * プラン作成入力（schemas/plans/plan.ts の CreatePlanInput と一致）
 */
export interface CreatePlanInput {
  title: string;
  description?: string;
  status: PlanStatus;
  due_date?: string; // YYYY-MM-DD形式
  start_time?: string; // ISO 8601形式
  end_time?: string; // ISO 8601形式
  recurrence_type?: RecurrenceType;
  recurrence_end_date?: string; // YYYY-MM-DD形式
  reminder_minutes?: number; // 通知タイミング（開始時刻の何分前か）
}

/**
 * プラン更新入力（schemas/plans/plan.ts の UpdatePlanInput と一致）
 */
export interface UpdatePlanInput {
  title?: string;
  description?: string;
  status?: PlanStatus;
  due_date?: string; // YYYY-MM-DD形式
  start_time?: string; // ISO 8601形式
  end_time?: string; // ISO 8601形式
  recurrence_type?: RecurrenceType;
  recurrence_end_date?: string; // YYYY-MM-DD形式
  reminder_minutes?: number; // 通知タイミング（開始時刻の何分前か）
}

/**
 * タグ付きプラン（リレーション取得時）
 */
export interface PlanWithTags extends Plan {
  tags: Array<{ id: string; name: string; color: string; description?: string }>;
}

/**
 * フィルター条件
 */
export interface PlanFilters {
  status?: PlanStatus;
  search?: string;
  tagId?: string; // タグIDでフィルタ
  sortBy?: 'created_at' | 'updated_at' | 'due_date' | 'title';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * 統計情報
 */
export interface PlanStats {
  total: number;
  byStatus: Record<string, number>;
}

// 互換性のためのエイリアス（段階的移行用）
/** @deprecated Use Plan instead */
export type plan = Plan;
/** @deprecated Use PlanStatus instead */
export type planStatus = PlanStatus;
/** @deprecated Use CreatePlanInput instead */
/** @deprecated Use UpdatePlanInput instead */
export type UpdateplanInput = UpdatePlanInput;
/** @deprecated Use PlanWithTags instead */
export type planWithTags = PlanWithTags;
/** @deprecated Use PlanFilters instead */
export type planFilters = PlanFilters;
/** @deprecated Use PlanStats instead */
export type planStats = PlanStats;
