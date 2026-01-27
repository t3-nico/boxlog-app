/**
 * プラン配置計算ユーティリティ
 */

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
