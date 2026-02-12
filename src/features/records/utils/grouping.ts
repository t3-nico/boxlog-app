'use client';

import type { GroupedData } from '@/features/plans/utils/grouping';

import { endOfWeek, format, isToday, isWithinInterval, isYesterday, startOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * Record グルーピングフィールド
 *
 * Plan の GroupByField ('status' | 'due_date' | 'tags') と異なり、
 * Record には status がないため worked_at と tags のみ
 */
export type RecordGroupByField = 'worked_at' | 'tags' | null;

/**
 * Record グルーピング可能なアイテムの最小インターフェース
 */
interface RecordGroupable {
  worked_at: string;
  tagIds?: string[];
}

/**
 * Record アイテムをグループ化
 *
 * @param items - グループ化するアイテム
 * @param groupBy - グループ化フィールド
 * @returns グループ化されたデータ（GroupedData<T>型は Plan と共通）
 */
export function groupRecordItems<T extends RecordGroupable>(
  items: T[],
  groupBy: RecordGroupByField,
): GroupedData<T>[] {
  if (!groupBy) {
    return [
      {
        groupKey: 'all',
        groupLabel: 'すべて',
        items,
        count: items.length,
      },
    ];
  }

  const groups = new Map<string, T[]>();

  for (const item of items) {
    const groupKey = getRecordGroupKey(item, groupBy);
    const existing = groups.get(groupKey) ?? [];
    groups.set(groupKey, [...existing, item]);
  }

  const sortedGroups = Array.from(groups.entries())
    .map(([groupKey, groupItems]) => ({
      groupKey,
      groupLabel: getRecordGroupLabel(groupKey, groupBy),
      items: groupItems,
      count: groupItems.length,
    }))
    .sort((a, b) => {
      if (groupBy === 'worked_at') {
        // 日付グループ: 新しい順（today → yesterday → this_week → older）
        const dateOrder = ['today', 'yesterday', 'this_week', 'older', 'no-date'];
        return dateOrder.indexOf(a.groupKey) - dateOrder.indexOf(b.groupKey);
      }

      // タグ: アルファベット順（「タグなし」は末尾）
      if (a.groupKey === 'タグなし') return 1;
      if (b.groupKey === 'タグなし') return -1;
      return a.groupLabel.localeCompare(b.groupLabel);
    });

  return sortedGroups;
}

/**
 * Record のグループキーを取得
 */
function getRecordGroupKey(item: RecordGroupable, groupBy: RecordGroupByField): string {
  switch (groupBy) {
    case 'worked_at':
      return getWorkedAtGroup(item.worked_at);

    case 'tags':
      return item.tagIds && item.tagIds.length > 0 ? item.tagIds[0]! : 'タグなし';

    default:
      return 'unknown';
  }
}

/**
 * worked_at からグループを判定
 */
function getWorkedAtGroup(workedAt: string): string {
  if (!workedAt) return 'no-date';

  const date = new Date(workedAt);
  const today = new Date();

  if (isToday(date)) return 'today';
  if (isYesterday(date)) return 'yesterday';

  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  if (isWithinInterval(date, { start: weekStart, end: weekEnd })) {
    return 'this_week';
  }

  return 'older';
}

/**
 * グループラベルを取得
 */
function getRecordGroupLabel(groupKey: string, groupBy: RecordGroupByField): string {
  switch (groupBy) {
    case 'worked_at':
      return getWorkedAtLabel(groupKey);

    case 'tags':
      return groupKey;

    default:
      return groupKey;
  }
}

/**
 * worked_at グループのラベルを取得
 */
function getWorkedAtLabel(groupKey: string): string {
  const today = new Date();
  const labels: Record<string, string> = {
    today: `今日 (${format(today, 'M/d', { locale: ja })})`,
    yesterday: '昨日',
    this_week: '今週',
    older: 'それ以前',
    'no-date': '日付なし',
  };

  return labels[groupKey] ?? groupKey;
}
