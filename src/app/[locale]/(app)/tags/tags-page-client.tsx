'use client';

import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { DataTable, type SortState } from '@/features/table';
import {
  TagRowWrapper,
  TagTableRowCreate,
  type TagTableRowCreateHandle,
} from '@/features/tags/components/table';
import { TagsDialogs } from '@/features/tags/components/TagsDialogs';
import { TagSelectionActions } from '@/features/tags/components/TagSelectionActions';
import { TagsFilterBar } from '@/features/tags/components/TagsFilterBar';
import { TagsSelectionBar } from '@/features/tags/components/TagsSelectionBar';
import { useTagsNavigation } from '@/features/tags/contexts/TagsNavigationContext';
import { useTagsPageContext } from '@/features/tags/contexts/TagsPageContext';
import { useTagOperations } from '@/features/tags/hooks/useTagOperations';
import { useUpdateTag } from '@/features/tags/hooks/useTags';
import { useTagsPageData } from '@/features/tags/hooks/useTagsPageData';
import { useTagTableColumns } from '@/features/tags/hooks/useTagTableColumns';
import { type TagColumnId, useTagColumnStore } from '@/features/tags/stores/useTagColumnStore';
import { useTagPaginationStore } from '@/features/tags/stores/useTagPaginationStore';
import { useTagSearchStore } from '@/features/tags/stores/useTagSearchStore';
import { useTagSelectionStore } from '@/features/tags/stores/useTagSelectionStore';
import { useTagSortStore } from '@/features/tags/stores/useTagSortStore';
import type { Tag } from '@/features/tags/types';
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

  // カスタムフックでデータ処理ロジックを分離
  const {
    fetchedTags,
    groups,
    tagPlanCounts,
    tagLastUsed,
    isFetching,
    activeTagsCount,
    filteredTags,
    sortedTags,
    groupedData,
    displayMode,
    sortField,
    sortDirection,
    searchQuery,
  } = useTagsPageData({
    selectedGroupId,
    isUncategorizedFilter,
    showArchiveOnly,
    t: (key: string) => t(key),
  });

  // Zustand stores
  const { selectedIds, setSelectedIds, clearSelection, getSelectedIds, getSelectedCount } =
    useTagSelectionStore();
  const { setSort } = useTagSortStore();
  const { currentPage, pageSize, setCurrentPage, setPageSize } = useTagPaginationStore();
  const { getVisibleColumns, setColumnWidth } = useTagColumnStore();
  const { setSearchQuery } = useTagSearchStore();

  // コンテキスト
  const { tags, setTags, setIsLoading } = useTagsPageContext();

  // タグ操作
  const updateTagMutation = useUpdateTag();
  const { showCreateModal, handleSaveNewTag, handleDeleteTag, handleCloseModals } =
    useTagOperations(tags);

  // 表示列
  const visibleColumns = getVisibleColumns();
  const selectedTagIds = getSelectedIds();
  const selectedCount = getSelectedCount();

  // グループ番号からグループIDを解決
  const effectiveGroupNumber =
    contextGroupNumber ?? (initialGroupNumber ? Number(initialGroupNumber) : null);
  const initialGroup = useMemo(() => {
    if (!effectiveGroupNumber) return null;
    return groups.find((g) => g.group_number === effectiveGroupNumber) ?? null;
  }, [effectiveGroupNumber, groups]);

  // 選択されたグループ情報
  const selectedGroup = useMemo(() => {
    return selectedGroupId ? groups.find((g) => g.id === selectedGroupId) : null;
  }, [selectedGroupId, groups]);

  // ページタイトル
  const pageTitle = useMemo(() => {
    if (isUncategorizedFilter) return t('tags.sidebar.uncategorized');
    if (isArchiveFilter) return t('tags.sidebar.archive');
    if (selectedGroup) return selectedGroup.name;
    return t('tags.sidebar.allTags');
  }, [isUncategorizedFilter, isArchiveFilter, selectedGroup, t]);

  // フィルター状態に応じてselectedGroupIdを更新
  useEffect(() => {
    if (initialGroup) {
      if (selectedGroupId !== initialGroup.id) {
        setSelectedGroupId(initialGroup.id);
      }
    } else if (['all', 'uncategorized', 'archive'].includes(effectiveFilter)) {
      if (selectedGroupId !== null) {
        setSelectedGroupId(null);
      }
    }
  }, [initialGroup, effectiveFilter, selectedGroupId]);

  // タグデータをContextに同期
  const fetchedTagIds = fetchedTags.map((t) => t.id).join(',');
  useEffect(() => {
    setTags(fetchedTags);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedTagIds]);

  useEffect(() => {
    setIsLoading(isFetching);
  }, [isFetching, setIsLoading]);

  // ページタイトルにタグ数を表示
  useEffect(() => {
    if (!isUncategorizedFilter && !effectiveGroupNumber) {
      document.title = `${t('tags.page.title')} (${activeTagsCount})`;
    }
    return () => {
      document.title = t('tags.page.title');
    };
  }, [activeTagsCount, isUncategorizedFilter, effectiveGroupNumber, t]);

  // ソート変更時にページ1に戻る
  useEffect(() => {
    setCurrentPage(1);
  }, [sortField, sortDirection, pageSize, setCurrentPage]);

  // ハンドラー: グループ折りたたみ
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

  // ハンドラー: グループ移動
  const handleMoveToGroup = useCallback(
    async (tag: Tag, groupId: string | null) => {
      try {
        await updateTagMutation.mutateAsync({
          id: tag.id,
          data: { group_id: groupId },
        });
        const group = groupId ? groups.find((g) => g.id === groupId) : null;
        toast.success(
          t('tags.page.tagMoved', { name: tag.name, group: group?.name ?? t('tags.page.noGroup') }),
        );
      } catch {
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
            await updateTagMutation.mutateAsync({ id: tag.id, data: { is_active: false } });
          }
        }
        toast.success(t('tags.page.bulkArchived', { count: tagIds.length }));
      } catch {
        toast.error(t('tags.page.bulkArchiveFailed'));
      }
    },
    [tags, updateTagMutation, t],
  );

  // ハンドラー: 一括復元
  const handleBulkRestore = useCallback(
    async (tagIds: string[]) => {
      try {
        for (const tagId of tagIds) {
          const tag = tags.find((t) => t.id === tagId);
          if (tag) {
            await updateTagMutation.mutateAsync({ id: tag.id, data: { is_active: true } });
          }
        }
        toast.success(t('tag.archive.restoreSuccess', { name: `${tagIds.length}個のタグ` }));
      } catch {
        toast.error(t('tag.archive.restoreFailed'));
      }
    },
    [tags, updateTagMutation, t],
  );

  // ハンドラー: 一括削除
  const handleOpenBulkDeleteDialog = useCallback(() => {
    if (selectedTagIds.size === 0) return;
    setBulkDeleteDialogOpen(true);
  }, [selectedTagIds]);

  const handleBulkDeleteConfirm = useCallback(async () => {
    if (selectedTagIds.size === 0) return;
    setIsBulkDeleting(true);
    try {
      for (const tagId of selectedTagIds) {
        const tag = sortedTags.find((item) => item.id === tagId);
        if (tag) await handleDeleteTag(tag);
      }
      clearSelection();
    } finally {
      setIsBulkDeleting(false);
      setBulkDeleteDialogOpen(false);
    }
  }, [selectedTagIds, sortedTags, handleDeleteTag, clearSelection]);

  // ハンドラー: 単一タグマージ
  const handleOpenSingleMerge = useCallback((tag: Tag) => setSingleMergeTag(tag), []);
  const handleCloseSingleMerge = useCallback(() => {
    setSingleMergeTag(null);
    clearSelection();
  }, [clearSelection]);

  // ハンドラー: アーカイブ確認
  const handleOpenArchiveConfirm = useCallback((tag: Tag) => setArchiveConfirmTag(tag), []);
  const handleCloseArchiveConfirm = useCallback(() => setArchiveConfirmTag(null), []);
  const handleConfirmArchive = useCallback(async () => {
    if (!archiveConfirmTag) return;
    try {
      await updateTagMutation.mutateAsync({ id: archiveConfirmTag.id, data: { is_active: false } });
      toast.success(t('tags.page.tagArchived', { name: archiveConfirmTag.name }));
      setArchiveConfirmTag(null);
    } catch {
      toast.error(t('tags.page.tagArchiveFailed'));
    }
  }, [archiveConfirmTag, updateTagMutation, t]);

  // ハンドラー: 削除確認
  const handleOpenDeleteConfirm = useCallback((tag: Tag) => setDeleteConfirmTag(tag), []);
  const handleCloseDeleteConfirm = useCallback(() => setDeleteConfirmTag(null), []);
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirmTag) return;
    try {
      await handleDeleteTag(deleteConfirmTag);
      toast.success(t('tags.page.tagDeleted', { name: deleteConfirmTag.name }));
      setDeleteConfirmTag(null);
    } catch {
      toast.error(t('tags.page.tagDeleteFailed'));
    }
  }, [deleteConfirmTag, handleDeleteTag, t]);

  // DataTable用のソート状態
  const sortState: SortState = useMemo(
    () => ({ field: sortField, direction: sortDirection }),
    [sortField, sortDirection],
  );

  const handleSortChange = useCallback(
    (newSortState: SortState) => {
      if (newSortState.field) {
        setSort(newSortState.field as typeof sortField, newSortState.direction);
      }
    },
    [setSort],
  );

  const handleSelectionChange = useCallback(
    (newSelectedIds: Set<string>) => setSelectedIds(Array.from(newSelectedIds)),
    [setSelectedIds],
  );

  const handlePaginationChange = useCallback(
    (state: { currentPage: number; pageSize: number }) => {
      setCurrentPage(state.currentPage);
      setPageSize(state.pageSize);
    },
    [setCurrentPage, setPageSize],
  );

  const handleColumnWidthChange = useCallback(
    (columnId: string, width: number) => setColumnWidth(columnId as TagColumnId, width),
    [setColumnWidth],
  );

  // DataTable用の列定義
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
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
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

      {/* ダイアログ群（分離済み） */}
      <TagsDialogs
        showCreateModal={showCreateModal}
        onCloseCreateModal={handleCloseModals}
        onSaveNewTag={handleSaveNewTag}
        archiveConfirmTag={archiveConfirmTag}
        onCloseArchiveConfirm={handleCloseArchiveConfirm}
        onConfirmArchive={handleConfirmArchive}
        deleteConfirmTag={deleteConfirmTag}
        onCloseDeleteConfirm={handleCloseDeleteConfirm}
        onConfirmDelete={handleConfirmDelete}
        singleMergeTag={singleMergeTag}
        onCloseSingleMerge={handleCloseSingleMerge}
        bulkDeleteDialogOpen={bulkDeleteDialogOpen}
        setBulkDeleteDialogOpen={setBulkDeleteDialogOpen}
        onBulkDeleteConfirm={handleBulkDeleteConfirm}
        selectedCount={selectedTagIds.size}
        isBulkDeleting={isBulkDeleting}
        t={t}
      />
    </div>
  );
}
