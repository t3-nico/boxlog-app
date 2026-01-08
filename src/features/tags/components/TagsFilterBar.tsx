'use client';

import { Calendar, Clock, FolderTree, Hash, Plus, Tag } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { TableNavigation, type TableNavigationConfig } from '@/features/table';
import { useTagColumnStore } from '@/features/tags/stores/useTagColumnStore';
import { useTagDisplayModeStore } from '@/features/tags/stores/useTagDisplayModeStore';
import { useTagFilterStore } from '@/features/tags/stores/useTagFilterStore';
import { useTagSortStore } from '@/features/tags/stores/useTagSortStore';
import { TagsFilterContent } from './TagsFilterContent';
import { TagsSettingsContent } from './TagsSettingsContent';

interface TagsFilterBarProps {
  onCreateClick?: () => void;
  /** 検索クエリ */
  searchQuery: string;
  /** 検索クエリ変更時のコールバック */
  onSearchChange: (query: string) => void;
  t: (key: string) => string;
}

/**
 * Tags page filter bar with icon navigation
 *
 * Notion風のアイコンナビゲーション（検索・ソート・設定）を提供
 * - TableNavigation を使用してPC・モバイル共通UI
 * - Inboxと同じデザイン・挙動（中身だけ異なる）
 *
 * @example
 * ```tsx
 * <TagsFilterBar
 *   searchQuery={searchQuery}
 *   onSearchChange={setSearchQuery}
 *   onCreateClick={handleCreate}
 *   t={t}
 * />
 * ```
 */
export function TagsFilterBar({
  onCreateClick,
  searchQuery,
  onSearchChange,
  t,
}: TagsFilterBarProps) {
  const displayMode = useTagDisplayModeStore((state) => state.displayMode);
  const setDisplayMode = useTagDisplayModeStore((state) => state.setDisplayMode);

  // ソート関連（タグはソート解除不可: allowClearSort: false）
  const sortField = useTagSortStore((state) => state.sortField);
  const sortDirection = useTagSortStore((state) => state.sortDirection);
  const setSort = useTagSortStore((state) => state.setSort);

  // 列設定（settingsCount計算用）
  const columns = useTagColumnStore((state) => state.columns);
  const resetColumns = useTagColumnStore((state) => state.resetColumns);

  // フィルター
  const usage = useTagFilterStore((state) => state.usage);
  const selectedGroup = useTagFilterStore((state) => state.selectedGroup);
  const createdAt = useTagFilterStore((state) => state.createdAt);
  const resetFilters = useTagFilterStore((state) => state.reset);

  // ソートフィールドオプション（テーブルヘッダーと同じアイコン）
  const sortFieldOptions = useMemo(
    () => [
      { value: 'tag_number', label: t('tags.page.sortFields.tagNumber'), icon: Hash },
      { value: 'name', label: t('tags.page.sortFields.name'), icon: Tag },
      { value: 'group', label: t('tags.page.sortFields.group'), icon: FolderTree },
      { value: 'created_at', label: t('tags.page.sortFields.createdAt'), icon: Calendar },
      { value: 'last_used', label: t('tags.page.sortFields.lastUsed'), icon: Clock },
    ],
    [t],
  );

  // 非表示の列数を計算（selection と name は除外）
  const hiddenColumnCount = columns.filter(
    (col) => col.id !== 'selection' && col.id !== 'name' && !col.visible,
  ).length;

  // 設定がアクティブかどうか（表示モードがgrouped または 非表示列あり）
  const hasActiveSettings = displayMode === 'grouped' || hiddenColumnCount > 0;

  // 設定バッジ数（表示モード変更 + 非表示列数）
  const settingsCount = (displayMode === 'grouped' ? 1 : 0) + hiddenColumnCount;

  // フィルターがアクティブかどうか
  const hasActiveFilters = usage !== 'all' || selectedGroup !== 'all' || createdAt !== 'all';

  // フィルターバッジ数
  const filterCount =
    (usage !== 'all' ? 1 : 0) + (selectedGroup !== 'all' ? 1 : 0) + (createdAt !== 'all' ? 1 : 0);

  // ソートがデフォルトかどうか
  const isDefaultSort = sortField === 'created_at' && sortDirection === 'desc';

  // ソート変更ハンドラー（型を合わせる）
  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    setSort(field as Parameters<typeof setSort>[0], direction);
  };

  // ソートをデフォルトに戻すハンドラー（タグはソート解除不可なのでデフォルトにリセット）
  const handleSortClear = () => {
    setSort('created_at', 'desc');
  };

  // TableNavigation設定
  // デフォルトソートの場合はsortField=nullとして扱い、バッジ・リセットボタンを非表示
  const navigationConfig: TableNavigationConfig = useMemo(
    () => ({
      search: searchQuery,
      onSearchChange,
      sortField: isDefaultSort ? null : sortField,
      sortDirection,
      onSortChange: handleSortChange,
      onSortClear: handleSortClear,
      sortFieldOptions,
      // Filter
      filterContent: <TagsFilterContent />,
      hasActiveFilters,
      ...(filterCount > 0 && { filterCount }),
      onFilterReset: resetFilters,
      // Settings
      settingsContent: <TagsSettingsContent />,
      hasActiveSettings,
      ...(settingsCount > 0 && { settingsCount }),
      onSettingsReset: () => {
        setDisplayMode('flat');
        resetColumns();
        handleSortClear();
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      searchQuery,
      sortField,
      sortDirection,
      sortFieldOptions,
      hasActiveFilters,
      filterCount,
      hasActiveSettings,
      settingsCount,
      isDefaultSort,
    ],
  );

  return (
    <div className="flex items-center gap-2">
      {/* Notion風アイコンナビゲーション（検索・ソート・設定）*/}
      <TableNavigation config={navigationConfig} />

      {/* 作成ボタン: 固定位置（モバイル: アイコンのみ、PC: テキスト付き） */}
      {onCreateClick && (
        <>
          <Button onClick={onCreateClick} size="icon" className="shrink-0 md:hidden">
            <Plus className="size-4" />
          </Button>
          <Button onClick={onCreateClick} className="hidden shrink-0 md:inline-flex">
            <Plus className="size-4" />
            {t('tags.page.createTag')}
          </Button>
        </>
      )}
    </div>
  );
}
