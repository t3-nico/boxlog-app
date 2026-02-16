// Plan型定義

/**
 * プランステータス（2段階）
 * - open: 未完了
 * - closed: 完了
 *
 * シンプルな2択。カレンダー配置の有無は start_time で判断。
 */
export type PlanStatus = 'open' | 'closed';

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
  title: string;
  description: string | null;
  status: PlanStatus;
  completed_at: string | null; // TIMESTAMPTZ型（完了時刻、status='closed'時に自動設定）
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
  start_time?: string; // ISO 8601形式
  end_time?: string; // ISO 8601形式
  recurrence_type?: RecurrenceType;
  recurrence_end_date?: string; // YYYY-MM-DD形式
  reminder_minutes?: number; // 通知タイミング（開始時刻の何分前か）
}

/**
 * タグID付きプラン（リレーション取得時）
 *
 * タグの詳細情報（name, color等）はtags.listキャッシュから取得する。
 * これにより、タグマスタの変更が全UIで即時反映される。
 */
export interface PlanWithTags extends Plan {
  tagIds: string[];
}

/**
 * フィルター条件
 */
export interface PlanFilters {
  status?: PlanStatus;
  search?: string;
  tagId?: string; // タグIDでフィルタ
  // 日付範囲フィルタ（カレンダー表示高速化用）
  startDate?: string; // 開始日時（ISO 8601形式）
  endDate?: string; // 終了日時（ISO 8601形式）
  sortBy?: 'created_at' | 'updated_at' | 'title';
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
