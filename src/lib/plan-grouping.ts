import type { GroupedData } from '@/core/types/grouping';
import type { PlanStatus } from '@/core/types/plan';

/** Re-export for backward compatibility */
export type { GroupedData } from '@/core/types/grouping';

/** グループ化フィールド */
export type GroupByField = 'status' | 'tags' | null;

/**
 * グループ化可能なアイテムの最小インターフェース
 */
interface Groupable {
  status: string;
  tagIds?: string[] | undefined;
}

/**
 * ステータスラベルマップ
 */
const STATUS_LABELS: Record<PlanStatus, string> = {
  open: 'Open',
  closed: 'Closed',
};

/**
 * アイテムをグループ化
 *
 * 指定されたフィールドでアイテムをグループ分けする
 *
 * @param items - グループ化するアイテム
 * @param groupBy - グループ化フィールド
 * @returns グループ化されたデータ
 *
 * @example
 * ```typescript
 * const grouped = groupItems(items, 'status')
 * // => [
 * //   { groupKey: 'doing', groupLabel: 'Doing', items: [...], count: 5 },
 * //   { groupKey: 'todo', groupLabel: 'Todo', items: [...], count: 3 }
 * // ]
 * ```
 */
export function groupItems<T extends Groupable>(
  items: T[],
  groupBy: GroupByField,
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

  items.forEach((item) => {
    const groupKey = getGroupKey(item, groupBy);
    const existing = groups.get(groupKey) || [];
    groups.set(groupKey, [...existing, item]);
  });

  // グループをソート順に変換
  const sortedGroups = Array.from(groups.entries())
    .map(([groupKey, groupItems]) => ({
      groupKey,
      groupLabel: getGroupLabel(groupKey, groupBy),
      items: groupItems,
      count: groupItems.length,
    }))
    .sort((a, b) => {
      // グループの並び順を定義
      if (groupBy === 'status') {
        const statusOrder: PlanStatus[] = ['open', 'closed'];
        return (
          statusOrder.indexOf(a.groupKey as PlanStatus) -
          statusOrder.indexOf(b.groupKey as PlanStatus)
        );
      }

      // その他はアルファベット順
      return a.groupLabel.localeCompare(b.groupLabel);
    });

  return sortedGroups;
}

/**
 * アイテムのグループキーを取得
 */
function getGroupKey(item: Groupable, groupBy: GroupByField): string {
  switch (groupBy) {
    case 'status':
      return item.status;

    case 'tags':
      // tagIdsの最初のIDをグループキーとして使用（タグ名の解決はUI側で行う）
      return item.tagIds && item.tagIds.length > 0 ? item.tagIds[0]! : 'タグなし';

    default:
      return 'unknown';
  }
}

/**
 * グループラベルを取得
 */
function getGroupLabel(groupKey: string, groupBy: GroupByField): string {
  switch (groupBy) {
    case 'status':
      return STATUS_LABELS[groupKey as PlanStatus] || groupKey;

    case 'tags':
      return groupKey;

    default:
      return groupKey;
  }
}
