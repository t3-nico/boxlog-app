'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { LoadingSpinner } from '@/components/common/Loading/LoadingStates';
import { usePageTitle } from '@/features/navigation/hooks/usePageTitle';
import {
  TagList,
  TagListGroupCreateRow,
  type TagListGroupCreateRowHandle,
} from '@/features/tags/components/list';
import { TagsTableEmptyState } from '@/features/tags/components/table';
import { TagsDialogs } from '@/features/tags/components/TagsDialogs';
import { TagSelectionActions } from '@/features/tags/components/TagSelectionActions';
import { TagsFilterBar } from '@/features/tags/components/TagsFilterBar';
import { TagsSelectionBar } from '@/features/tags/components/TagsSelectionBar';
import { TagsStatusTabs } from '@/features/tags/components/TagsStatusTabs';
import { useTagsPageContext } from '@/features/tags/contexts/TagsPageContext';
import { useDeleteTagGroup } from '@/features/tags/hooks/useTagGroups';
import { useTagOperations } from '@/features/tags/hooks/useTagOperations';
import { useUpdateTag } from '@/features/tags/hooks/useTags';
import { useTagsPageData } from '@/features/tags/hooks/useTagsPageData';
import { useTagCreateModalStore } from '@/features/tags/stores/useTagCreateModalStore';
import { useTagSearchStore } from '@/features/tags/stores/useTagSearchStore';
import { useTagSelectionStore } from '@/features/tags/stores/useTagSelectionStore';
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

  // タイトルをZustand Storeにセット（PageHeaderはレイアウト層でレンダリング）
  usePageTitle(t('tags.page.title'));

  // ローカル状態
  const [deleteConfirmTag, setDeleteConfirmTag] = useState<Tag | null>(null);
  const [archiveConfirmTag, setArchiveConfirmTag] = useState<Tag | null>(null);
  const [singleMergeTag, setSingleMergeTag] = useState<Tag | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [deletingGroup, setDeletingGroup] = useState<TagGroup | null>(null);

  // グループ作成行のref
  const groupCreateRowRef = useRef<TagListGroupCreateRowHandle>(null);

  // カスタムフックでデータ処理ロジックを分離（フィルター状態はストアから取得）
  const {
    fetchedTags,
    groups,
    tagPlanCounts,
    isFetching,
    activeTagsCount,
    sortedTags,
    groupedData,
    displayMode,
    searchQuery,
    showArchiveOnly,
  } = useTagsPageData({
    t: (key: string) => t(key),
  });

  // Zustand stores
  const { selectedIds, clearSelection, getSelectedIds, getSelectedCount } = useTagSelectionStore();
  const { setSearchQuery } = useTagSearchStore();

  // コンテキスト
  const { tags, setTags, setIsLoading } = useTagsPageContext();

  // モーダル
  const openModal = useTagCreateModalStore((state) => state.openModal);

  // タグ操作
  const updateTagMutation = useUpdateTag();
  const deleteGroupMutation = useDeleteTagGroup();
  const { showCreateModal, handleSaveNewTag, handleDeleteTag, handleCloseModals } =
    useTagOperations(tags);

  // 新規作成ハンドラー（モーダルを開く）
  const handleOpenCreateModal = useCallback(() => {
    openModal();
  }, [openModal]);

  // グループ作成行を開くハンドラー
  const handleOpenGroupCreate = useCallback(() => {
    groupCreateRowRef.current?.startCreate();
  }, []);

  // 選択状態
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
      toast.success(t('tags.toast.groupDeleted', { name: deletingGroup.name }));
      setDeletingGroup(null);
    } catch {
      toast.error(t('tags.toast.groupDeleteFailed'));
    }
  }, [deletingGroup, deleteGroupMutation, t]);

  // ハンドラー: グループ移動
  const handleMoveToGroup = useCallback(
    async (tag: Tag, groupId: string | null) => {
      try {
        await updateTagMutation.mutateAsync({
          id: tag.id,
          data: { parentId: groupId },
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
        toast.error(t('tags.archive.restoreFailed'));
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
              onCreateClick: handleOpenCreateModal,
              onCreateGroupClick: handleOpenGroupCreate,
            })}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            t={t}
          />
        </div>
      )}

      {/* タグリスト */}
      <div className="flex flex-1 flex-col overflow-auto px-4">
        <TagList
          tags={sortedTags}
          groupedData={groupedData}
          groups={groups}
          planCounts={tagPlanCounts}
          collapsedGroups={collapsedGroups}
          onToggleGroupCollapse={handleToggleGroupCollapse}
          selectedIds={selectedIds}
          onMoveToGroup={handleMoveToGroup}
          onArchiveConfirm={handleOpenArchiveConfirm}
          onDeleteConfirm={handleOpenDeleteConfirm}
          onDeleteGroup={handleDeleteGroup}
          emptyState={
            <TagsTableEmptyState
              searchQuery={searchQuery}
              isArchiveView={showArchiveOnly}
              onClearSearch={() => setSearchQuery('')}
              onCreate={handleOpenCreateModal}
            />
          }
        />
        {/* グループ作成行（グループ表示モード時のみ） */}
        {displayMode === 'grouped' && !showArchiveOnly && (
          <TagListGroupCreateRow ref={groupCreateRowRef} />
        )}
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
        title={t('tags.group.deleteTitle', { name: deletingGroup?.name ?? '' })}
        description={t('tags.group.deleteDescription')}
      />
    </div>
  );
}
