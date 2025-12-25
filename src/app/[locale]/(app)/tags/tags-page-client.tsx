'use client';

import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { PageHeader } from '@/components/common/PageHeader';
import { AlertDialogConfirm } from '@/components/ui/alert-dialog-confirm';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableGroupedData, type SortState } from '@/features/table';
import {
  TagRowWrapper,
  TagTableRowCreate,
  type TagTableRowCreateHandle,
} from '@/features/tags/components/table';
import { TagCreateModal } from '@/features/tags/components/tag-create-modal';
import { TagArchiveDialog } from '@/features/tags/components/TagArchiveDialog';
import { TagDeleteDialog } from '@/features/tags/components/TagDeleteDialog';
import { TagMergeDialog } from '@/features/tags/components/TagMergeDialog';
import { TagSelectionActions } from '@/features/tags/components/TagSelectionActions';
import { TagsFilterBar } from '@/features/tags/components/TagsFilterBar';
import { TagsSelectionBar } from '@/features/tags/components/TagsSelectionBar';
import { useTagsNavigation } from '@/features/tags/contexts/TagsNavigationContext';
import { useTagsPageContext } from '@/features/tags/contexts/TagsPageContext';
import { useTagGroups } from '@/features/tags/hooks/use-tag-groups';
import { useTagOperations } from '@/features/tags/hooks/use-tag-operations';
import { useTags, useUpdateTag } from '@/features/tags/hooks/use-tags';
import { useTagTableColumns } from '@/features/tags/hooks/useTagTableColumns';
import { type TagColumnId, useTagColumnStore } from '@/features/tags/stores/useTagColumnStore';
import { useTagDisplayModeStore } from '@/features/tags/stores/useTagDisplayModeStore';
import { useTagPaginationStore } from '@/features/tags/stores/useTagPaginationStore';
import { useTagSearchStore } from '@/features/tags/stores/useTagSearchStore';
import { useTagSelectionStore } from '@/features/tags/stores/useTagSelectionStore';
import { useTagSortStore } from '@/features/tags/stores/useTagSortStore';
import type { Tag, TagGroup } from '@/features/tags/types';
import { api } from '@/lib/trpc';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

interface TagsPageClientProps {
  initialGroupNumber?: string;
  showUncategorizedOnly?: boolean;
  showArchiveOnly?: boolean;
}

export function TagsPageClient({
  initialGroupNumber,
  showUncategorizedOnly = false,
  showArchiveOnly = false,
}: TagsPageClientProps = {}) {
  const t = useTranslations();
  const pathname = usePathname();
  const tagsNav = useTagsNavigation();

  // データ取得
  const { data: fetchedTags = [], isLoading: isFetching } = useTags(true);
  const { data: groups = [] as TagGroup[] } = useTagGroups();
  // 最適化: 2つのクエリを1つに統合（DB側でGROUP BY集計）
  const { data: tagStats } = api.plans.getTagStats.useQuery();
  const tagPlanCounts = useMemo(() => tagStats?.counts ?? {}, [tagStats?.counts]);
  const tagLastUsed = useMemo(() => tagStats?.lastUsed ?? {}, [tagStats?.lastUsed]);

  // コンテキスト
  const { tags, setTags, setIsLoading } = useTagsPageContext();

  // Zustand stores
  const { selectedIds, setSelectedIds, clearSelection, getSelectedIds, getSelectedCount } =
    useTagSelectionStore();
  const { sortField, sortDirection, setSort } = useTagSortStore();
  const { currentPage, pageSize, setCurrentPage, setPageSize } = useTagPaginationStore();
  const { getVisibleColumns, setColumnWidth } = useTagColumnStore();
  const { searchQuery, setSearchQuery } = useTagSearchStore();
  const { displayMode } = useTagDisplayModeStore();

  // タグ操作
  const updateTagMutation = useUpdateTag();
  const { showCreateModal, handleSaveNewTag, handleDeleteTag, handleCloseModals } =
    useTagOperations(tags);

  // Contextからフィルター状態を導出（propsはフォールバック）
  const effectiveFilter = tagsNav?.filter ?? (showUncategorizedOnly ? 'uncategorized' : 'all');
  const isUncategorizedFilter = effectiveFilter === 'uncategorized';
  const isArchiveFilter = effectiveFilter === 'archive' || pathname?.includes('/archive');
  const contextGroupNumber = effectiveFilter.startsWith('group-')
    ? parseInt(effectiveFilter.replace('group-', ''), 10)
    : null;

  // ローカル状態
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [deleteConfirmTag, setDeleteConfirmTag] = useState<Tag | null>(null);
  const [archiveConfirmTag, setArchiveConfirmTag] = useState<Tag | null>(null);
  const [singleMergeTag, setSingleMergeTag] = useState<Tag | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const createRowRef = useRef<TagTableRowCreateHandle>(null);

  // 表示列
  const visibleColumns = getVisibleColumns();
  const selectedTagIds = getSelectedIds();
  const selectedCount = getSelectedCount();

  // グループ番号からグループIDを解決（Context優先、propsがフォールバック）
  const effectiveGroupNumber =
    contextGroupNumber ?? (initialGroupNumber ? Number(initialGroupNumber) : null);
  const initialGroup = useMemo(() => {
    if (!effectiveGroupNumber) return null;
    return groups.find((g) => g.group_number === effectiveGroupNumber) ?? null;
  }, [effectiveGroupNumber, groups]);

  // 選択されたグループ情報を取得
  const selectedGroup = useMemo(() => {
    return selectedGroupId ? groups.find((g) => g.id === selectedGroupId) : null;
  }, [selectedGroupId, groups]);

  // ページタイトルを決定
  const pageTitle = useMemo(() => {
    if (isUncategorizedFilter) {
      return t('tags.sidebar.uncategorized');
    }
    if (isArchiveFilter) {
      return t('tags.sidebar.archive');
    }
    if (selectedGroup) {
      return selectedGroup.name;
    }
    return t('tags.sidebar.allTags');
  }, [isUncategorizedFilter, isArchiveFilter, selectedGroup, t]);

  // フィルター状態に応じて selectedGroupId を更新
  useEffect(() => {
    if (initialGroup) {
      // グループフィルターの場合はグループIDを設定
      if (selectedGroupId !== initialGroup.id) {
        setSelectedGroupId(initialGroup.id);
      }
    } else if (
      effectiveFilter === 'all' ||
      effectiveFilter === 'uncategorized' ||
      effectiveFilter === 'archive'
    ) {
      // グループ以外のフィルターの場合はクリア
      if (selectedGroupId !== null) {
        setSelectedGroupId(null);
      }
    }
  }, [initialGroup, effectiveFilter, selectedGroupId]);

  // タグデータをContextに同期（ID配列のjoinで軽量な変更検知）
  const fetchedTagIds = fetchedTags.map((t) => t.id).join(',');
  useEffect(() => {
    setTags(fetchedTags);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedTagIds]);

  useEffect(() => {
    setIsLoading(isFetching);
  }, [isFetching, setIsLoading]);

  // アクティブなタグ数を計算
  const activeTagsCount = useMemo(() => {
    return tags.filter((tag) => tag.is_active).length;
  }, [tags]);

  // ページタイトルにタグ数を表示
  useEffect(() => {
    if (!isUncategorizedFilter && !effectiveGroupNumber) {
      document.title = `${t('tags.page.title')} (${activeTagsCount})`;
    }
    return () => {
      document.title = t('tags.page.title');
    };
  }, [activeTagsCount, isUncategorizedFilter, effectiveGroupNumber, t]);

  // すべてのタグを取得（アーカイブモードによって切り替え）
  const baseTags = useMemo(() => {
    if (showArchiveOnly) {
      return tags.filter((tag) => !tag.is_active);
    }
    return tags.filter((tag) => tag.is_active);
  }, [tags, showArchiveOnly]);

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

  // グループ折りたたみトグル
  const handleToggleGroupCollapse = useCallback((groupKey: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  }, []);

  // ソート変更時にページ1に戻る
  useEffect(() => {
    setCurrentPage(1);
  }, [sortField, sortDirection, pageSize, setCurrentPage]);

  // DataTable用のソート状態
  const sortState: SortState = useMemo(
    () => ({
      field: sortField,
      direction: sortDirection,
    }),
    [sortField, sortDirection],
  );

  // DataTable用のソート変更ハンドラー
  const handleSortChange = useCallback(
    (newSortState: SortState) => {
      if (newSortState.field) {
        setSort(newSortState.field as typeof sortField, newSortState.direction);
      }
    },
    [setSort],
  );

  // DataTable用の選択変更ハンドラー
  const handleSelectionChange = useCallback(
    (newSelectedIds: Set<string>) => {
      setSelectedIds(Array.from(newSelectedIds));
    },
    [setSelectedIds],
  );

  // DataTable用のページネーション変更ハンドラー
  const handlePaginationChange = useCallback(
    (state: { currentPage: number; pageSize: number }) => {
      setCurrentPage(state.currentPage);
      setPageSize(state.pageSize);
    },
    [setCurrentPage, setPageSize],
  );

  // ハンドラー: グループ移動
  const handleMoveToGroup = useCallback(
    async (tag: Tag, groupId: string | null) => {
      try {
        await updateTagMutation.mutateAsync({
          id: tag.id,
          data: { group_id: groupId },
        });
        const group = groupId ? groups.find((g) => g.id === groupId) : null;
        const groupName = group?.name ?? t('tags.page.noGroup');
        toast.success(t('tags.page.tagMoved', { name: tag.name, group: groupName }));
      } catch (error) {
        console.error('Failed to move tag to group:', error);
        toast.error(t('tags.page.tagMoveFailed'));
      }
    },
    [updateTagMutation, groups, t],
  );

  // ハンドラー: 一括アーカイブ
  const handleBulkArchive = useCallback(
    async (tagIds: string[]) => {
      try {
        for (const tagId of tagIds) {
          const tag = tags.find((t) => t.id === tagId);
          if (tag) {
            await updateTagMutation.mutateAsync({
              id: tag.id,
              data: { is_active: false },
            });
          }
        }
        toast.success(t('tags.page.bulkArchived', { count: tagIds.length }));
      } catch (error) {
        console.error('Failed to archive tags:', error);
        toast.error(t('tags.page.bulkArchiveFailed'));
      }
    },
    [tags, updateTagMutation, t],
  );

  // ハンドラー: 一括復元（アーカイブモード用）
  const handleBulkRestore = useCallback(
    async (tagIds: string[]) => {
      try {
        for (const tagId of tagIds) {
          const tag = tags.find((t) => t.id === tagId);
          if (tag) {
            await updateTagMutation.mutateAsync({
              id: tag.id,
              data: { is_active: true },
            });
          }
        }
        toast.success(t('tag.archive.restoreSuccess', { name: `${tagIds.length}個のタグ` }));
      } catch (error) {
        console.error('Failed to restore tags:', error);
        toast.error(t('tag.archive.restoreFailed'));
      }
    },
    [tags, updateTagMutation, t],
  );

  // ハンドラー: 一括削除ダイアログを開く
  const handleOpenBulkDeleteDialog = useCallback(() => {
    const ids = selectedTagIds;
    if (ids.size === 0) return;
    setBulkDeleteDialogOpen(true);
  }, [selectedTagIds]);

  // ハンドラー: 一括削除確認
  const handleBulkDeleteConfirm = useCallback(async () => {
    const ids = selectedTagIds;
    if (ids.size === 0) return;

    setIsBulkDeleting(true);
    try {
      for (const tagId of ids) {
        const tag = sortedTags.find((item) => item.id === tagId);
        if (tag) {
          await handleDeleteTag(tag);
        }
      }
      clearSelection();
    } finally {
      setIsBulkDeleting(false);
      setBulkDeleteDialogOpen(false);
    }
  }, [selectedTagIds, sortedTags, handleDeleteTag, clearSelection]);

  // ハンドラー: 単一タグマージダイアログを開く
  const handleOpenSingleMerge = useCallback((tag: Tag) => {
    setSingleMergeTag(tag);
  }, []);

  // ハンドラー: 単一タグマージダイアログを閉じる
  const handleCloseSingleMerge = useCallback(() => {
    setSingleMergeTag(null);
    clearSelection();
  }, [clearSelection]);

  // ハンドラー: アーカイブ確認ダイアログ
  const handleOpenArchiveConfirm = useCallback((tag: Tag) => {
    setArchiveConfirmTag(tag);
  }, []);

  const handleCloseArchiveConfirm = useCallback(() => {
    setArchiveConfirmTag(null);
  }, []);

  const handleConfirmArchive = useCallback(async () => {
    if (!archiveConfirmTag) return;
    try {
      await updateTagMutation.mutateAsync({
        id: archiveConfirmTag.id,
        data: { is_active: false },
      });
      toast.success(t('tags.page.tagArchived', { name: archiveConfirmTag.name }));
      setArchiveConfirmTag(null);
    } catch (error) {
      console.error('Failed to archive tag:', error);
      toast.error(t('tags.page.tagArchiveFailed'));
    }
  }, [archiveConfirmTag, updateTagMutation, t]);

  // ハンドラー: 削除確認ダイアログ
  const handleOpenDeleteConfirm = useCallback((tag: Tag) => {
    setDeleteConfirmTag(tag);
  }, []);

  const handleCloseDeleteConfirm = useCallback(() => {
    setDeleteConfirmTag(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirmTag) return;
    try {
      await handleDeleteTag(deleteConfirmTag);
      toast.success(t('tags.page.tagDeleted', { name: deleteConfirmTag.name }));
      setDeleteConfirmTag(null);
    } catch (error) {
      console.error('Failed to delete tag:', error);
      toast.error(t('tags.page.tagDeleteFailed'));
    }
  }, [deleteConfirmTag, handleDeleteTag, t]);

  // ハンドラー: 列幅変更（stringをTagColumnIdにキャスト）
  const handleColumnWidthChange = useCallback(
    (columnId: string, width: number) => {
      setColumnWidth(columnId as TagColumnId, width);
    },
    [setColumnWidth],
  );

  // DataTable用の列定義 (extracted to hook)
  const columns = useTagTableColumns({
    groups,
    allTags: tags,
    planCounts: tagPlanCounts,
    lastUsed: tagLastUsed,
    visibleColumns,
    t,
  });

  // DataTable用の列幅マップ
  const columnWidths = useMemo(() => {
    const widths: Record<string, number> = {};
    visibleColumns.forEach((col) => {
      widths[col.id] = col.width;
    });
    return widths;
  }, [visibleColumns]);

  // 行ラッパー
  const rowWrapper = useCallback(
    ({ item, children, isSelected }: { item: Tag; children: ReactNode; isSelected: boolean }) => (
      <TagRowWrapper
        key={item.id}
        tag={item}
        isSelected={isSelected}
        groups={groups}
        onMoveToGroup={handleMoveToGroup}
        onArchiveConfirm={handleOpenArchiveConfirm}
        onDeleteConfirm={handleOpenDeleteConfirm}
      >
        {children}
      </TagRowWrapper>
    ),
    [groups, handleMoveToGroup, handleOpenArchiveConfirm, handleOpenDeleteConfirm],
  );

  // ローディング表示
  if (isFetching) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <PageHeader title={pageTitle} count={filteredTags.length} />

      {/* フィルターバー または 選択バー */}
      {selectedCount > 0 ? (
        <TagsSelectionBar
          selectedCount={selectedCount}
          onClearSelection={clearSelection}
          actions={
            showArchiveOnly ? (
              <TagSelectionActions
                selectedTagIds={Array.from(selectedTagIds)}
                tags={tags}
                groups={[]}
                onMoveToGroup={handleMoveToGroup}
                onRestore={handleBulkRestore}
                onDelete={handleOpenBulkDeleteDialog}
                onClearSelection={clearSelection}
                t={t}
              />
            ) : (
              <TagSelectionActions
                selectedTagIds={Array.from(selectedTagIds)}
                tags={tags}
                groups={groups}
                onMoveToGroup={handleMoveToGroup}
                onArchive={handleBulkArchive}
                onDelete={handleOpenBulkDeleteDialog}
                onSingleMerge={handleOpenSingleMerge}
                onClearSelection={clearSelection}
                t={t}
              />
            )
          }
        />
      ) : showArchiveOnly ? (
        <TagsFilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} t={t} />
      ) : (
        <TagsFilterBar
          onCreateClick={() => createRowRef.current?.startCreate()}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          t={t}
        />
      )}

      {/* テーブル */}
      <div className="flex flex-1 flex-col overflow-auto px-4">
        <DataTable
          data={sortedTags}
          columns={columns}
          getRowKey={(tag) => tag.id}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          sortState={sortState}
          onSortChange={handleSortChange}
          showPagination={displayMode === 'flat'}
          paginationState={{ currentPage, pageSize }}
          onPaginationChange={handlePaginationChange}
          pageSizeOptions={[10, 25, 50, 100]}
          columnWidths={columnWidths}
          onColumnWidthChange={handleColumnWidthChange}
          {...(groupedData && {
            groupedData,
            collapsedGroups,
            onToggleGroupCollapse: handleToggleGroupCollapse,
          })}
          rowWrapper={rowWrapper}
          onOutsideClick={clearSelection}
          selectAllLabel={t('tags.page.selectAll')}
          getSelectLabel={(tag) => t('tags.page.selectTag', { name: tag.name })}
          extraRows={
            showArchiveOnly || displayMode === 'grouped' ? undefined : (
              <TagTableRowCreate
                ref={createRowRef}
                selectedGroupId={selectedGroupId}
                groups={groups}
                allTags={tags}
              />
            )
          }
          emptyState={
            <div className="border-border flex h-64 items-center justify-center rounded-xl border-2 border-dashed">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  {showArchiveOnly ? t('tag.archive.noArchivedTags') : t('tags.page.noTags')}
                </p>
                {!showArchiveOnly && (
                  <Button onClick={() => createRowRef.current?.startCreate()}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('tags.page.addFirstTag')}
                  </Button>
                )}
              </div>
            </div>
          }
        />
      </div>

      {/* モーダル */}
      <TagCreateModal
        isOpen={showCreateModal}
        onClose={handleCloseModals}
        onSave={handleSaveNewTag}
      />

      {/* アーカイブ確認ダイアログ */}
      <TagArchiveDialog
        tag={archiveConfirmTag}
        onClose={handleCloseArchiveConfirm}
        onConfirm={handleConfirmArchive}
      />

      {/* 削除確認ダイアログ */}
      <TagDeleteDialog
        tag={deleteConfirmTag}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
      />

      {/* 単一タグマージダイアログ */}
      <TagMergeDialog tag={singleMergeTag} onClose={handleCloseSingleMerge} />

      {/* 一括削除確認ダイアログ */}
      <AlertDialogConfirm
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        onConfirm={handleBulkDeleteConfirm}
        title={t('tags.page.bulkDeleteConfirmTitle', { count: selectedTagIds.size })}
        description={t('tags.page.bulkDeleteConfirmDescription', { count: selectedTagIds.size })}
        confirmText={
          isBulkDeleting ? t('common.plan.delete.deleting') : t('common.plan.delete.confirm')
        }
        cancelText={t('actions.cancel')}
        isLoading={isBulkDeleting}
        variant="destructive"
      />
    </div>
  );
}
