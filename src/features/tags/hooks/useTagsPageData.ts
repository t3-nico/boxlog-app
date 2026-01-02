/**
 * タグページのデータ処理ロジックを集約したカスタムフック
 *
 * TagsPageClientから抽出してパフォーマンスを最適化:
 * - データ取得
 * - フィルタリング
 * - ソート
 * - グループ化
 */
import { useMemo } from 'react';

import type { DataTableGroupedData } from '@/features/table';
import { useTagGroups } from '@/features/tags/hooks/useTagGroups';
import { useTags } from '@/features/tags/hooks/useTags';
import { useTagDisplayModeStore } from '@/features/tags/stores/useTagDisplayModeStore';
import { useTagSearchStore } from '@/features/tags/stores/useTagSearchStore';
import { useTagSortStore } from '@/features/tags/stores/useTagSortStore';
import type { Tag, TagGroup } from '@/features/tags/types';
import { api } from '@/lib/trpc';

interface UseTagsPageDataOptions {
  selectedGroupId: string | null;
  isUncategorizedFilter: boolean;
  showArchiveOnly: boolean;
  t: (key: string) => string;
}

export function useTagsPageData({
  selectedGroupId,
  isUncategorizedFilter,
  showArchiveOnly,
  t,
}: UseTagsPageDataOptions) {
  // データ取得
  const { data: fetchedTags = [], isLoading: isFetching } = useTags();
  const { data: groups = [] as TagGroup[] } = useTagGroups();

  // 最適化: 2つのクエリを1つに統合（DB側でGROUP BY集計）
  const { data: tagStats } = api.plans.getTagStats.useQuery();
  const tagPlanCounts = useMemo(() => tagStats?.counts ?? {}, [tagStats?.counts]);
  const tagLastUsed = useMemo(() => tagStats?.lastUsed ?? {}, [tagStats?.lastUsed]);

  // Zustand stores
  const { sortField, sortDirection } = useTagSortStore();
  const { searchQuery } = useTagSearchStore();
  const { displayMode } = useTagDisplayModeStore();

  // アクティブなタグ数
  const activeTagsCount = useMemo(() => {
    return fetchedTags.filter((tag) => tag.is_active).length;
  }, [fetchedTags]);

  // ベースタグ（アーカイブモードによって切り替え）
  const baseTags = useMemo(() => {
    if (showArchiveOnly) {
      return fetchedTags.filter((tag) => !tag.is_active);
    }
    return fetchedTags.filter((tag) => tag.is_active);
  }, [fetchedTags, showArchiveOnly]);

  // 検索とグループフィルタ適用
  const filteredTags = useMemo(() => {
    let filtered = baseTags;

    // グループフィルタ
    if (isUncategorizedFilter) {
      filtered = filtered.filter((tag) => !tag.group_id);
    } else if (selectedGroupId) {
      filtered = filtered.filter((tag) => tag.group_id === selectedGroupId);
    }

    // 検索フィルタ
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (tag) =>
          tag.name.toLowerCase().includes(query) || tag.description?.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [baseTags, selectedGroupId, isUncategorizedFilter, searchQuery]);

  // ソート適用
  const sortedTags = useMemo(() => {
    const sorted = [...filteredTags].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'tag_number':
          comparison = a.tag_number - b.tag_number;
          break;
        case 'group': {
          const groupA = a.group_id ? groups.find((g) => g.id === a.group_id)?.name || '' : '';
          const groupB = b.group_id ? groups.find((g) => g.id === b.group_id)?.name || '' : '';
          if (!groupA && groupB) return 1;
          if (groupA && !groupB) return -1;
          comparison = groupA.localeCompare(groupB);
          break;
        }
        case 'last_used': {
          const lastUsedStrA = tagLastUsed[a.id];
          const lastUsedStrB = tagLastUsed[b.id];
          const lastUsedA = lastUsedStrA ? new Date(lastUsedStrA).getTime() : 0;
          const lastUsedB = lastUsedStrB ? new Date(lastUsedStrB).getTime() : 0;
          if (!lastUsedA && lastUsedB) return 1;
          if (lastUsedA && !lastUsedB) return -1;
          comparison = lastUsedA - lastUsedB;
          break;
        }
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredTags, sortField, sortDirection, groups, tagLastUsed]);

  // グループ別表示用のデータを生成
  const groupedData = useMemo((): DataTableGroupedData<Tag>[] | undefined => {
    if (displayMode !== 'grouped') return undefined;

    // グループごとにタグを分類
    const groupMap = new Map<string, Tag[]>();
    const uncategorized: Tag[] = [];

    for (const tag of sortedTags) {
      if (tag.group_id) {
        const existing = groupMap.get(tag.group_id) ?? [];
        existing.push(tag);
        groupMap.set(tag.group_id, existing);
      } else {
        uncategorized.push(tag);
      }
    }

    const result: DataTableGroupedData<Tag>[] = [];

    // グループを group_number でソートして追加
    const sortedGroups = [...groups].sort((a, b) => a.group_number - b.group_number);
    for (const group of sortedGroups) {
      const items = groupMap.get(group.id) ?? [];
      if (items.length > 0) {
        result.push({
          groupKey: group.id,
          groupLabel: group.name,
          items,
          count: items.length,
        });
      }
    }

    // 未分類を最後に追加
    if (uncategorized.length > 0) {
      result.push({
        groupKey: '__uncategorized__',
        groupLabel: t('tags.page.noGroup'),
        items: uncategorized,
        count: uncategorized.length,
      });
    }

    return result;
  }, [displayMode, sortedTags, groups, t]);

  return {
    // 生データ
    fetchedTags,
    groups,
    tagPlanCounts,
    tagLastUsed,
    // 状態
    isFetching,
    activeTagsCount,
    // 派生データ
    filteredTags,
    sortedTags,
    groupedData,
    // ストア値
    displayMode,
    sortField,
    sortDirection,
    searchQuery,
  };
}
