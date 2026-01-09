'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { LoadingSpinner } from '@/components/common/Loading/LoadingStates';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type GroupedData, type SortState } from '@/features/table';
import { TagRowWrapper, TagsTableEmptyState } from '@/features/tags/components/table';
import { TagGroupHeader } from '@/features/tags/components/TagGroupHeader';
import { TagsDialogs } from '@/features/tags/components/TagsDialogs';
import { TagSelectionActions } from '@/features/tags/components/TagSelectionActions';
import { TagsFilterBar } from '@/features/tags/components/TagsFilterBar';
import { TagsSelectionBar } from '@/features/tags/components/TagsSelectionBar';
import { TagsStatusTabs } from '@/features/tags/components/TagsStatusTabs';
import { useTagsPageContext } from '@/features/tags/contexts/TagsPageContext';
import { useCreateTagGroup, useDeleteTagGroup } from '@/features/tags/hooks/useTagGroups';
import { useTagOperations } from '@/features/tags/hooks/useTagOperations';
import { useUpdateTag } from '@/features/tags/hooks/useTags';
import { useTagsPageData } from '@/features/tags/hooks/useTagsPageData';
import { useTagTableColumns } from '@/features/tags/hooks/useTagTableColumns';
import { type TagColumnId, useTagColumnStore } from '@/features/tags/stores/useTagColumnStore';
import { useTagInspectorStore } from '@/features/tags/stores/useTagInspectorStore';
import { useTagPaginationStore } from '@/features/tags/stores/useTagPaginationStore';
import { useTagSearchStore } from '@/features/tags/stores/useTagSearchStore';
import { useTagSelectionStore } from '@/features/tags/stores/useTagSelectionStore';
import { useTagSortStore } from '@/features/tags/stores/useTagSortStore';
import type { Tag, TagGroup } from '@/features/tags/types';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

/**
 * タグページクライアントコンポーネント
 *
 * サイドバーレス設計:
 * - All/Archive切り替えはヘッダーのタブで
 * - グループ選択はFilterドロップダウンで
 * - グループ管理はSettingsドロップダウンで
 * - すべてのフィルタリングはZustandストアで管理
 */
export function TagsPageClient() {
  const t = useTranslations();

  // ローカル状態
  const [deleteConfirmTag, setDeleteConfirmTag] = useState<Tag | null>(null);
  const [archiveConfirmTag, setArchiveConfirmTag] = useState<Tag | null>(null);
  const [singleMergeTag, setSingleMergeTag] = useState<Tag | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [deletingGroup, setDeletingGroup] = useState<TagGroup | null>(null);

  // カスタムフックでデータ処理ロジックを分離（フィルター状態はストアから取得）
  const {
    fetchedTags,
    groups,
    tagPlanCounts,
    tagLastUsed,
    isFetching,
    activeTagsCount,
    sortedTags,
    groupedData,
    displayMode,
    sortField,
    sortDirection,
    searchQuery,
    showArchiveOnly,
    selectedGroupId,
  } = useTagsPageData({
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

  // Inspector
  const { openInspector } = useTagInspectorStore();

  // タグ操作
  const updateTagMutation = useUpdateTag();
  const deleteGroupMutation = useDeleteTagGroup();
  const createGroupMutation = useCreateTagGroup();
  const { showCreateModal, handleSaveNewTag, handleDeleteTag, handleCloseModals } =
    useTagOperations(tags);

  // 新規作成ハンドラー（Inspectorを開く）
  const handleOpenCreateInspector = useCallback(() => {
    openInspector(null, { initialData: { groupId: selectedGroupId } });
  }, [openInspector, selectedGroupId]);

  // 表示列
  const visibleColumns = getVisibleColumns();
  const selectedTagIds = getSelectedIds();
  const selectedCount = getSelectedCount();

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
    document.title = `${t('tags.page.title')} (${activeTagsCount})`;
    return () => {
      document.title = t('tags.page.title');
    };
  }, [activeTagsCount, t]);

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

  // ハンドラー: グループ削除
  const handleDeleteGroup = useCallback((group: TagGroup) => {
    setDeletingGroup(group);
  }, []);

  const handleConfirmDeleteGroup = useCallback(async () => {
    if (!deletingGroup) return;
    try {
      await deleteGroupMutation.mutateAsync({ id: deletingGroup.id });
      toast.success(t('tag.toast.groupDeleted', { name: deletingGroup.name }));
      setDeletingGroup(null);
    } catch {
      toast.error(t('tag.toast.groupDeleteFailed'));
    }
  }, [deletingGroup, deleteGroupMutation, t]);

  // カスタムグループヘッダーレンダラー
  const renderGroupHeader = useCallback(
    (group: GroupedData<Tag>, columnCount: number, isCollapsed: boolean) => {
      const tagGroup = groups.find((g) => g.id === group.groupKey);

      return (
        <TagGroupHeader
          key={`group-${group.groupKey}`}
          groupKey={group.groupKey}
          groupLabel={group.groupLabel}
          count={group.count}
          columnCount={columnCount}
          isCollapsed={isCollapsed}
          tagGroup={tagGroup}
          onToggleCollapse={handleToggleGroupCollapse}
          onDeleteGroup={handleDeleteGroup}
        />
      );
    },
    [groups, handleToggleGroupCollapse, handleDeleteGroup],
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
        toast.success(t('tags.page.bulkRestored', { count: tagIds.length }));
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
    for (const tagId of selectedTagIds) {
      const tag = sortedTags.find((item) => item.id === tagId);
      if (tag) await handleDeleteTag(tag);
    }
    clearSelection();
    setBulkDeleteDialogOpen(false);
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

  // ハンドラー: グループ作成（インライン）
  const handleCreateGroup = useCallback(
    async (name: string) => {
      const result = await createGroupMutation.mutateAsync({ name });
      toast.success(t('tag.toast.groupCreated', { name }));
      return result;
    },
    [createGroupMutation, t],
  );

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
    onCreateGroup: handleCreateGroup,
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
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <PageHeader title={t('tags.page.title')} count={activeTagsCount} />

      {/* ツールバー または 選択バー（Inbox風レイアウト） */}
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
      ) : (
        <div className="flex h-12 shrink-0 items-center justify-between gap-2 px-4 py-2">
          {/* 左側: All/Archive切り替えタブ */}
          <TagsStatusTabs />

          {/* 右側: ナビゲーション・作成ボタン */}
          <TagsFilterBar
            {...(!showArchiveOnly && {
              onCreateClick: handleOpenCreateInspector,
            })}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            t={t}
          />
        </div>
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
          columnWidths={columnWidths}
          onColumnWidthChange={handleColumnWidthChange}
          {...(groupedData && {
            groupedData,
            collapsedGroups,
            onToggleGroupCollapse: handleToggleGroupCollapse,
            renderGroupHeader,
          })}
          rowWrapper={rowWrapper}
          onOutsideClick={clearSelection}
          selectAllLabel={t('tags.page.selectAll')}
          getSelectLabel={(tag) => t('tags.page.selectTag', { name: tag.name })}
          emptyState={
            <TagsTableEmptyState
              searchQuery={searchQuery}
              isArchiveView={showArchiveOnly}
              onClearSearch={() => setSearchQuery('')}
              onCreate={handleOpenCreateInspector}
            />
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
        t={t}
      />

      {/* グループ削除確認ダイアログ */}
      <DeleteConfirmDialog
        open={!!deletingGroup}
        onClose={() => setDeletingGroup(null)}
        onConfirm={handleConfirmDeleteGroup}
        title={t('tag.group.deleteTitle', { name: deletingGroup?.name ?? '' })}
        description={t('tag.group.deleteDescription')}
      />
    </div>
  );
}
