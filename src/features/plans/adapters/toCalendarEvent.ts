/**
 * Plan → CalendarEvent 変換アダプター
 *
 * Plans featureが所有するデータ変換ロジック。
 * PlanデータをCalendarEvent（コア型）に変換して、
 * composition層（カレンダー等）に提供する。
 */

import { MS_PER_MINUTE } from '@/constants/time';

import { encodeInstanceId } from '../utils/instanceId';
import { expandRecurrence, isRecurringPlan } from '../utils/recurrence';

import type { CalendarEvent } from '@/core/types/calendar-event';
import type { Plan } from '../types/plan';
import type { ExpandedOccurrence, PlanInstanceException } from '../utils/recurrence';

// 型の再エクスポート
export type { ExpandedOccurrence, PlanInstanceException };

/**
 * データベースPlan型のステータスをCalendarEvent型のステータスに変換
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
 * データベースPlan型をCalendarEvent型に変換
 */
export function planToCalendarPlan(plan: PlanWithTagIds): CalendarEvent {
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
  const isRecurring = isRecurringPlan(plan);

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
 * データベースPlan型の配列をCalendarEvent型の配列に変換
 */
export function plansToCalendarPlans(plans: PlanWithTagIds[]): CalendarEvent[] {
  return plans.map(planToCalendarPlan);
}

/**
 * オカレンスをCalendarEventに変換
 *
 * @param basePlan - 親プラン
 * @param occurrence - 展開されたオカレンス
 */
function occurrenceToCalendarPlan(
  basePlan: PlanWithTagIds,
  occurrence: ExpandedOccurrence,
): CalendarEvent {
  const createdAt = basePlan.created_at ? new Date(basePlan.created_at) : new Date();
  const updatedAt = basePlan.updated_at ? new Date(basePlan.updated_at) : new Date();

  // オカレンスの日時を計算
  let startDate: Date;
  let endDate: Date;

  // 時刻オーバーライドがある場合は優先適用
  if (occurrence.overrideStartTime) {
    startDate = new Date(occurrence.overrideStartTime);
  } else if (occurrence.startTime) {
    // 親プランの時刻を使用
    const [startHour, startMin] = occurrence.startTime.split(':').map(Number);
    startDate = new Date(occurrence.date);
    startDate.setHours(startHour ?? 0, startMin ?? 0, 0, 0);
  } else {
    // 時間指定なし（日の先頭に配置）
    startDate = new Date(occurrence.date);
    startDate.setHours(0, 0, 0, 0);
  }

  if (occurrence.overrideEndTime) {
    endDate = new Date(occurrence.overrideEndTime);
  } else if (occurrence.endTime) {
    // 親プランの時刻を使用
    const [endHour, endMin] = occurrence.endTime.split(':').map(Number);
    endDate = new Date(occurrence.date);
    endDate.setHours(endHour ?? 0, endMin ?? 0, 0, 0);
  } else {
    // 時間指定なし（日の終わりに設定）
    endDate = new Date(occurrence.date);
    endDate.setHours(23, 59, 59, 999);
  }

  // タイトル・説明のオーバーライド
  const title = occurrence.overrideTitle ?? basePlan.title;
  const description = occurrence.overrideDescription ?? basePlan.description;

  // 一意のIDを生成（元プランID + 日付）
  const instanceDate = occurrence.date.toISOString().slice(0, 10);
  const instanceId = encodeInstanceId(basePlan.id, instanceDate);

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

/**
 * 繰り返しプランを展開してCalendarEvent配列に変換
 *
 * @param plans - プラン配列（タグID付き）
 * @param rangeStart - 表示範囲の開始日
 * @param rangeEnd - 表示範囲の終了日
 * @param exceptions - DBから取得した例外情報のマップ（planId -> exceptions）
 * @returns 展開されたCalendarEvent配列
 */
export function expandRecurringPlansToCalendarPlans(
  plans: PlanWithTagIds[],
  rangeStart: Date,
  rangeEnd: Date,
  exceptionsMap: Map<string, PlanInstanceException[]> = new Map(),
): CalendarEvent[] {
  const result: CalendarEvent[] = [];

  for (const plan of plans) {
    if (isRecurringPlan(plan)) {
      // 繰り返しプランを展開
      const exceptions = exceptionsMap.get(plan.id) ?? [];
      const occurrences = expandRecurrence(plan, rangeStart, rangeEnd, exceptions);

      for (const occurrence of occurrences) {
        // 各オカレンスをCalendarEventに変換
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
