/**
 * プラン配置計算ユーティリティ
 */

import type { CalendarEvent } from '@/core/types/calendar-event';

import type { PlanColumn, TimedPlan } from '../types/plan.types';

/**
 * プランが時間的に重複しているか判定
 */
export function plansOverlap(plan1: TimedPlan, plan2: TimedPlan): boolean {
  // plan1がplan2より前に終わる、またはplan2がplan1より前に終わる場合は重複しない
  return !(plan1.end <= plan2.start || plan2.end <= plan1.start);
}

/**
 * プラングループを検出（重複するプランをグループ化）
 */
export function detectOverlapGroups(plans: TimedPlan[]): TimedPlan[][] {
  if (plans.length === 0) return [];

  // 開始時刻でソート
  const sortedPlans = [...plans].sort((a, b) => a.start.getTime() - b.start.getTime());
  const groups: TimedPlan[][] = [];

  for (const plan of sortedPlans) {
    // 既存のグループで重複するものを探す
    let added = false;

    for (const group of groups) {
      // グループ内のいずれかのプランと重複する場合、そのグループに追加
      if (group.some((p) => plansOverlap(p, plan))) {
        group.push(plan);
        added = true;
        break;
      }
    }

    // どのグループとも重複しない場合、新しいグループを作成
    if (!added) {
      groups.push([plan]);
    }
  }

  return groups;
}

/**
 * プランの表示位置を計算
 */
export function calculatePlanPosition(
  plan: TimedPlan,
  column: PlanColumn,
  hourHeight: number = 60,
): { top: number; height: number; left: number; width: number } {
  // 時刻から位置を計算
  const startMinutes = plan.start.getHours() * 60 + plan.start.getMinutes();
  const endMinutes = plan.end.getHours() * 60 + plan.end.getMinutes();

  const top = (startMinutes * hourHeight) / 60;
  const height = Math.max(((endMinutes - startMinutes) * hourHeight) / 60, 20); // 最小高さ20px

  // 列配置から横位置を計算（幅は100%、マージンで間隔調整）
  const width = 100 / column.totalColumns;
  const left = width * column.columnIndex;

  return { top, height, left, width };
}

/**
 * プランの表示位置を計算（折りたたみ考慮版）
 */
export function calculatePlanPositionWithCollapse(
  plan: TimedPlan,
  column: PlanColumn,
  timeToPixels: (time: Date) => number,
): { top: number; height: number; left: number; width: number } {
  // 折りたたみ考慮の変換関数を使用
  const top = timeToPixels(plan.start);
  const bottom = timeToPixels(plan.end);
  const height = Math.max(bottom - top, 20); // 最小高さ20px

  // 列配置から横位置を計算（幅は100%、マージンで間隔調整）
  const width = 100 / column.totalColumns;
  const left = width * column.columnIndex;

  return { top, height, left, width };
}

/**
 * 時間指定プランをソート（開始時刻順）
 */
export function sortTimedPlans(plans: TimedPlan[]): TimedPlan[] {
  return [...plans].sort((a, b) => {
    const timeDiff = a.start.getTime() - b.start.getTime();
    if (timeDiff !== 0) return timeDiff;

    // 開始時刻が同じ場合は終了時刻で比較
    return a.end.getTime() - b.end.getTime();
  });
}

/**
 * 特定の日のプランをフィルタリング
 */
export function filterPlansByDate(plans: TimedPlan[], date: Date): TimedPlan[] {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  return plans.filter((plan) => {
    // 時間指定プランは時間範囲で比較
    return plan.start < dayEnd && plan.end > dayStart;
  });
}

// --- 予定 vs 記録 差分オーバーレイ ---

export interface ActualTimeDiffOverlay {
  /** 上部: 開始差分 */
  topKind: 'hatch' | 'none';
  topHeight: number; // px

  /** 下部: 終了差分 */
  bottomKind: 'hatch' | 'none';
  bottomHeight: number; // px

  /** カード位置の調整量 */
  topShift: number; // px（上に伸ばす分。正の値 = top を減算）
  heightDelta: number; // px（全体の追加高さ）
}

const NO_OVERLAY: ActualTimeDiffOverlay = {
  topKind: 'none',
  topHeight: 0,
  bottomKind: 'none',
  bottomHeight: 0,
  topShift: 0,
  heightDelta: 0,
};

function toMinutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * 予定時間と実績時間の差分からオーバーレイ情報を計算
 *
 * 対象: entryState === 'past' && origin === 'planned' で
 * actualStartDate または actualEndDate が1つ以上ある場合
 * 未設定の方は予定通り（差分なし）として扱う
 */
export function computeActualTimeDiffOverlay(
  plan: CalendarEvent,
  hourHeight: number,
): ActualTimeDiffOverlay {
  if (
    plan.entryState !== 'past' ||
    plan.origin !== 'planned' ||
    (!plan.actualStartDate && !plan.actualEndDate) ||
    !plan.startDate ||
    !plan.endDate
  ) {
    return NO_OVERLAY;
  }

  const plannedStartMin = toMinutesOfDay(plan.startDate);
  const plannedEndMin = toMinutesOfDay(plan.endDate);
  // 未設定の実績時間は予定通りとして扱う
  const actualStartMin = plan.actualStartDate
    ? toMinutesOfDay(plan.actualStartDate)
    : plannedStartMin;
  const actualEndMin = plan.actualEndDate ? toMinutesOfDay(plan.actualEndDate) : plannedEndMin;

  const minutesToPx = (minutes: number) => (Math.abs(minutes) * hourHeight) / 60;

  // --- 上部（開始差分） ---
  const startDiffMin = actualStartMin - plannedStartMin;
  let topKind: ActualTimeDiffOverlay['topKind'] = 'none';
  let topHeight = 0;
  let topShift = 0;

  if (startDiffMin > 0) {
    // 実績が遅れて開始 → ハッチング（予定開始〜実績開始）
    topKind = 'hatch';
    topHeight = minutesToPx(startDiffMin);
  } else if (startDiffMin < 0) {
    // 実績が早く開始 → カードを上に拡張 + ハッチング
    topKind = 'hatch';
    topHeight = minutesToPx(startDiffMin);
    topShift = topHeight;
  }

  // --- 下部（終了差分） ---
  const endDiffMin = actualEndMin - plannedEndMin;
  let bottomKind: ActualTimeDiffOverlay['bottomKind'] = 'none';
  let bottomHeight = 0;
  let heightDelta = topShift; // topShift分はすでに高さに追加

  if (endDiffMin < 0) {
    // 実績が早く終了 → ハッチング（実績終了〜予定終了）
    bottomKind = 'hatch';
    bottomHeight = minutesToPx(endDiffMin);
  } else if (endDiffMin > 0) {
    // 実績が超過 → カードを下に拡張 + ハッチング
    bottomKind = 'hatch';
    bottomHeight = minutesToPx(endDiffMin);
    heightDelta += bottomHeight;
  }

  return { topKind, topHeight, bottomKind, bottomHeight, topShift, heightDelta };
}
