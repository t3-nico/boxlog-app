/**
 * グループ化されたデータの共通インターフェース
 */
export interface GroupedData<T> {
  groupKey: string;
  groupLabel: string;
  items: T[];
  count: number;
}

/** グループ化フィールド */
export type GroupByField = 'tags' | null;

/**
 * グループ化可能なアイテムの最小インターフェース
 */
interface Groupable {
  id: string;
  tagId?: string | null | undefined;
}

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
 * const grouped = groupItems(items, 'tags')
 * // => [
 * //   { groupKey: 'tag-1', groupLabel: 'tag-1', items: [...], count: 5 },
 * //   { groupKey: 'タグなし', groupLabel: 'タグなし', items: [...], count: 3 }
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
      // アルファベット順
      return a.groupLabel.localeCompare(b.groupLabel);
    });

  return sortedGroups;
}

/**
 * アイテムのグループキーを取得
 */
function getGroupKey(item: Groupable, groupBy: GroupByField): string {
  switch (groupBy) {
    case 'tags':
      // tagIdをグループキーとして使用（タグ名の解決はUI側で行う）
      return item.tagId ?? 'タグなし';

    default:
      return 'unknown';
  }
}

/**
 * グループラベルを取得
 */
function getGroupLabel(groupKey: string, groupBy: GroupByField): string {
  switch (groupBy) {
    case 'tags':
      return groupKey;

    default:
      return groupKey;
  }
}
