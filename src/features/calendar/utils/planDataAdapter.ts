/**
 * プランデータ変換ユーティリティ
 * PlanStore形式 ↔ CalendarView形式の相互変換
 */

import { MS_PER_MINUTE } from '@/constants/time';
import type { Plan } from '@/features/plans/types/plan';
import {
  expandRecurrence,
  isRecurringPlan,
  type ExpandedOccurrence,
  type PlanInstanceException,
} from '@/features/plans/utils/recurrence';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';

import type { TimedPlan } from '../components/views/shared/types/plan.types';

/**
 * データベースPlan型のステータスをCalendarPlan型のステータスに変換
 * 2段階ステータス: open, done
 */
function mapPlanStatusToCalendarStatus(status: string): 'open' | 'closed' {
  return status === 'closed' ? 'closed' : 'open';
}

// タグID付きPlan型
type PlanWithTagIds = Plan & {
  tagIds?: string[];
};

/**
 * データベースPlan型をCalendarPlan型に変換
 */
export function planToCalendarPlan(plan: PlanWithTagIds): CalendarPlan {
  const startDate = plan.start_time ? new Date(plan.start_time) : new Date();
  const endDate = plan.end_time ? new Date(plan.end_time) : new Date();
  const createdAt = plan.created_at ? new Date(plan.created_at) : new Date();
  const updatedAt = plan.updated_at ? new Date(plan.updated_at) : new Date();

  // 複数日にまたがるかチェック
  const isMultiDay = (() => {
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    return endDay.getTime() > startDay.getTime();
  })();

  // 繰り返し設定があるかチェック
  const isRecurring = !!(plan.recurrence_type && plan.recurrence_type !== 'none');

  return {
    id: plan.id,
    title: plan.title,
    description: plan.description || undefined,
    startDate,
    endDate,
    status: mapPlanStatusToCalendarStatus(plan.status),
    color: '#3b82f6', // デフォルトカラー
    reminder_minutes: plan.reminder_minutes,
    tagIds: plan.tagIds ?? [], // タグIDを引き継ぐ
    createdAt,
    updatedAt,
    displayStartDate: startDate,
    displayEndDate: endDate,
    duration: Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_MINUTE), // minutes
    isMultiDay,
    isRecurring,
    type: 'plan', // 明示的にPlan型を設定（Record と区別するため）
  };
}

/**
 * データベースPlan型の配列をCalendarPlan型の配列に変換
 */
export function plansToCalendarPlans(plans: PlanWithTagIds[]): CalendarPlan[] {
  return plans.map(planToCalendarPlan);
}

/**
 * Plan形式のプランをCalendarView形式に変換
 */
export function planToTimedPlan(plan: CalendarPlan): TimedPlan {
  return {
    ...plan,
    start: plan.startDate || new Date(),
    end: plan.endDate || new Date(),
    isReadOnly: plan.status === 'closed',
  };
}

/**
 * 複数のPlan形式プランをCalendarView形式に変換
 */
export function plansToTimedPlans(plans: CalendarPlan[]): TimedPlan[] {
  return plans.map(planToTimedPlan);
}

/**
 * CalendarView形式のプランをPlan形式に変換（部分的）
 */
export function timedPlanToPlanUpdate(timedPlan: TimedPlan): Partial<CalendarPlan> {
  return {
    id: timedPlan.id,
    title: timedPlan.title,
    description: timedPlan.description,
    startDate: timedPlan.start,
    endDate: timedPlan.end,
    color: timedPlan.color,
  };
}

/**
 * カレンダービューで使用するための安全な変換
 * undefinedやnullの場合のフォールバック付き
 */
export function safePlanToTimedPlan(plan: Partial<CalendarPlan>): TimedPlan | null {
  if (!plan.id || !plan.title) {
    return null;
  }

  const now = new Date();
  const defaultEnd = new Date(now.getTime() + 60 * 60 * 1000); // 1時間後

  return {
    ...plan,
    id: plan.id,
    title: plan.title,
    description: plan.description || '',
    color: plan.color || '#3b82f6',
    start: plan.startDate || now,
    end: plan.endDate || defaultEnd,
    isReadOnly: plan.status === 'closed',
  } as TimedPlan;
}

/**
 * プランリストの安全な変換（nullを除外）
 */
export function safePlansToTimedPlans(
  plans: (CalendarPlan | Partial<CalendarPlan>)[],
): TimedPlan[] {
  return plans.map(safePlanToTimedPlan).filter((plan): plan is TimedPlan => plan !== null);
}

/**
 * 繰り返しプランを展開してCalendarPlan配列に変換
 *
 * @param plans - プラン配列（タグID付き）
 * @param rangeStart - 表示範囲の開始日
 * @param rangeEnd - 表示範囲の終了日
 * @param exceptions - DBから取得した例外情報のマップ（planId -> exceptions）
 * @returns 展開されたCalendarPlan配列
 */
export function expandRecurringPlansToCalendarPlans(
  plans: PlanWithTagIds[],
  rangeStart: Date,
  rangeEnd: Date,
  exceptionsMap: Map<string, PlanInstanceException[]> = new Map(),
): CalendarPlan[] {
  const result: CalendarPlan[] = [];

  for (const plan of plans) {
    if (isRecurringPlan(plan)) {
      // 繰り返しプランを展開
      const exceptions = exceptionsMap.get(plan.id) ?? [];
      const occurrences = expandRecurrence(plan, rangeStart, rangeEnd, exceptions);

      for (const occurrence of occurrences) {
        // 各オカレンスをCalendarPlanに変換
        const calendarPlan = occurrenceToCalendarPlan(plan, occurrence);
        result.push(calendarPlan);
      }
    } else {
      // 通常プランはそのまま変換
      result.push(planToCalendarPlan(plan));
    }
  }

  return result;
}

/**
 * オカレンスをCalendarPlanに変換
 *
 * @param basePlan - 親プラン
 * @param occurrence - 展開されたオカレンス
 */
function occurrenceToCalendarPlan(
  basePlan: PlanWithTagIds,
  occurrence: ExpandedOccurrence,
): CalendarPlan {
  const createdAt = basePlan.created_at ? new Date(basePlan.created_at) : new Date();
  const updatedAt = basePlan.updated_at ? new Date(basePlan.updated_at) : new Date();

  // オーバーライドを取得
  const overrides = occurrence.overrides ?? {};

  // オカレンスの日時を計算
  let startDate: Date;
  let endDate: Date;

  // 時刻オーバーライドがある場合は優先適用
  if (overrides.start_time && typeof overrides.start_time === 'string') {
    startDate = new Date(overrides.start_time);
  } else if (occurrence.startTime) {
    // 親プランの時刻を使用
    const [startHour, startMin] = occurrence.startTime.split(':').map(Number);
    startDate = new Date(occurrence.date);
    startDate.setHours(startHour ?? 0, startMin ?? 0, 0, 0);
  } else {
    // 終日イベント
    startDate = new Date(occurrence.date);
    startDate.setHours(0, 0, 0, 0);
  }

  if (overrides.end_time && typeof overrides.end_time === 'string') {
    endDate = new Date(overrides.end_time);
  } else if (occurrence.endTime) {
    // 親プランの時刻を使用
    const [endHour, endMin] = occurrence.endTime.split(':').map(Number);
    endDate = new Date(occurrence.date);
    endDate.setHours(endHour ?? 0, endMin ?? 0, 0, 0);
  } else {
    // 終日イベント
    endDate = new Date(occurrence.date);
    endDate.setHours(23, 59, 59, 999);
  }

  // タイトル・説明のオーバーライド
  const title = (overrides.title as string) ?? basePlan.title;
  const description = (overrides.description as string) ?? basePlan.description;

  // 一意のIDを生成（元プランID + 日付）
  const instanceDate = occurrence.date.toISOString().slice(0, 10);
  const instanceId = `${basePlan.id}_${instanceDate}`;

  return {
    id: instanceId,
    title,
    description: description || undefined,
    startDate,
    endDate,
    status: mapPlanStatusToCalendarStatus(basePlan.status),
    color: '#3b82f6',
    reminder_minutes: basePlan.reminder_minutes,
    tagIds: basePlan.tagIds ?? [], // 親プランのタグIDを引き継ぐ
    createdAt,
    updatedAt,
    displayStartDate: startDate,
    displayEndDate: endDate,
    duration: Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_MINUTE),
    isMultiDay: false,
    isRecurring: true,
    type: 'plan', // 明示的にPlan型を設定（Record と区別するため）
    // 繰り返し用の追加プロパティ
    calendarId: basePlan.id, // 元プランIDを保持（後方互換性）
    originalPlanId: basePlan.id, // 親プランID
    instanceDate, // インスタンス日付
    isException: occurrence.isException,
    exceptionType: occurrence.exceptionType,
  };
}

// 型をエクスポート
export type { ExpandedOccurrence, PlanInstanceException };

// ========================================
// Record → CalendarPlan 変換
// ========================================

/**
 * Record + Plan情報の型
 * records.list から返される形式に合わせる
 */
interface RecordWithPlanInfo {
  id: string;
  plan_id: string | null; // Planなしでも作成可能
  title?: string | null; // マイグレーション適用前はoptional
  worked_at: string; // YYYY-MM-DD
  start_time: string | null; // HH:MM:SS or HH:MM
  end_time: string | null; // HH:MM:SS or HH:MM
  duration_minutes: number;
  fulfillment_score: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  tagIds?: string[]; // Recordに紐づくタグID
  plan?: {
    id: string;
    title: string;
    status: string;
  } | null;
}

/**
 * RecordをCalendarPlan型に変換
 * Records はカレンダー上で視覚的に区別される（type: 'record'）
 */
export function recordToCalendarPlan(record: RecordWithPlanInfo): CalendarPlan | null {
  // start_time/end_time がない場合はカレンダー表示をスキップ
  if (!record.start_time || !record.end_time) {
    return null;
  }

  // worked_at (YYYY-MM-DD) と start_time/end_time (HH:MM:SS) を組み合わせて Date を作成
  const parseTime = (dateStr: string, timeStr: string): Date => {
    // timeStrが HH:MM 形式の場合は :00 を追加
    const normalizedTime =
      timeStr.includes(':') && timeStr.split(':').length === 2 ? `${timeStr}:00` : timeStr;
    return new Date(`${dateStr}T${normalizedTime}`);
  };

  const startDate = parseTime(record.worked_at, record.start_time);
  const endDate = parseTime(record.worked_at, record.end_time);
  const createdAt = new Date(record.created_at);
  const updatedAt = new Date(record.updated_at);

  return {
    id: `record-${record.id}`, // PlanのIDと区別するためにプレフィックスを付ける
    title: record.title ?? record.plan?.title ?? 'Record',
    description: record.note ?? undefined,
    startDate,
    endDate,
    status: 'closed', // Records は完了済みの作業ログなので常に closed
    color: '', // デフォルト色（タグ色はTagsContainerで表示）
    tagIds: record.tagIds ?? [], // タグIDを引き継ぐ（Planと同様に表示）
    createdAt,
    updatedAt,
    displayStartDate: startDate,
    displayEndDate: endDate,
    duration: record.duration_minutes,
    isMultiDay: false,
    isRecurring: false,
    // Record固有フィールド
    type: 'record',
    recordId: record.id,
    fulfillmentScore: record.fulfillment_score,
    linkedPlanId: record.plan_id ?? undefined,
    linkedPlanTitle: record.plan?.title,
  };
}

/**
 * 複数のRecordをCalendarPlan型に変換
 * start_time/end_time がないRecordはスキップされる
 */
export function recordsToCalendarPlans(records: RecordWithPlanInfo[]): CalendarPlan[] {
  return records.map(recordToCalendarPlan).filter((plan): plan is CalendarPlan => plan !== null);
}
