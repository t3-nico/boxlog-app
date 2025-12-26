/**
 * タグ操作のビジネスロジックを管理するカスタムフック
 */

import {
  useCreateTag,
  useDeleteTag,
  useMoveTag,
  useOptimisticTagUpdate,
  useRenameTag,
  useUpdateTag,
} from '@/features/tags/hooks/use-tags';
import type { CreateTagInput, Tag, UpdateTagInput } from '@/features/tags/types';
import { useCallback, useState } from 'react';

export function useTagOperations(tags: Tag[]) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [mergeSourceTag, setMergeSourceTag] = useState<Tag | null>(null);
  const [createGroupId, setCreateGroupId] = useState<string | null>(null);

  // React Query mutations
  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();
  const moveTagMutation = useMoveTag();
  const renameTagMutation = useRenameTag();

  // 楽観的更新
  const { updateTagOptimistically, addTagOptimistically, removeTagOptimistically } =
    useOptimisticTagUpdate();

  // タグ作成（グループを指定して作成）
  const handleCreateTag = useCallback((groupId?: string | null) => {
    setCreateGroupId(groupId ?? null);
    setShowCreateModal(true);
  }, []);

  const handleSaveNewTag = useCallback(
    async (data: CreateTagInput) => {
      try {
        // 楽観的更新
        const tempTag: Tag = {
          id: `temp-${Date.now()}`,
          name: data.name,
          user_id: 'current-user',
          color: data.color || '#3B82F6',
          tag_number: 0, // 仮の値、実際の値はサーバー側で自動採番される
          description: data.description || null,
          icon: null,
          is_active: true,
          group_id: data.group_id ?? createGroupId,
          sort_order: tags.length,
          created_at: new Date(),
          updated_at: new Date(),
        };

        addTagOptimistically(tempTag);

        // 実際の作成
        await createTagMutation.mutateAsync({
          ...data,
          group_id: data.group_id ?? createGroupId,
        });
      } catch (error) {
        console.error('Failed to create tag:', error);
        throw error;
      }
    },
    [createTagMutation, addTagOptimistically, createGroupId, tags.length],
  );

  // タグ編集
  const handleEditTag = useCallback((tag: Tag) => {
    setSelectedTag(tag);
    setShowEditModal(true);
  }, []);

  const handleSaveTag = useCallback(
    async (data: UpdateTagInput) => {
      if (!selectedTag) return;

      try {
        // 楽観的更新
        updateTagOptimistically(selectedTag.id, data as Partial<Tag>);

        // 実際の更新
        await updateTagMutation.mutateAsync({
          id: selectedTag.id,
          data,
        });
      } catch (error) {
        console.error('Failed to update tag:', error);
        throw error;
      }
    },
    [selectedTag, updateTagMutation, updateTagOptimistically],
  );

  // タグ削除（確認は呼び出し元のTagDeleteDialogで実施済み）
  const handleDeleteTag = useCallback(
    async (tag: Tag) => {
      try {
        // 楽観的更新
        removeTagOptimistically(tag.id);

        // 実際の削除
        await deleteTagMutation.mutateAsync(tag.id);
      } catch (error) {
        console.error('Failed to delete tag:', error);
        throw error;
      }
    },
    [deleteTagMutation, removeTagOptimistically],
  );

  // タグのグループ移動
  const handleMoveTagToGroup = useCallback(
    async (tag: Tag, newGroupId: string | null) => {
      try {
        // 楽観的更新
        updateTagOptimistically(tag.id, { group_id: newGroupId });

        // 実際の移動
        await moveTagMutation.mutateAsync({
          id: tag.id,
          newGroupId,
        });
      } catch (error) {
        console.error('Failed to move tag:', error);
        throw error;
      }
    },
    [moveTagMutation, updateTagOptimistically],
  );

  // タグリネーム
  const handleRenameTag = useCallback(
    async (tag: Tag, newName: string) => {
      try {
        // 楽観的更新
        updateTagOptimistically(tag.id, { name: newName });

        // 実際のリネーム
        await renameTagMutation.mutateAsync({
          id: tag.id,
          name: newName,
        });
      } catch (error) {
        console.error('Failed to rename tag:', error);
        throw error;
      }
    },
    [renameTagMutation, updateTagOptimistically],
  );

  // タグマージ
  const handleMergeTag = useCallback((tag: Tag) => {
    setMergeSourceTag(tag);
    setShowMergeModal(true);
  }, []);

  // マージモーダルを閉じる
  const handleCloseMergeModal = useCallback(() => {
    setShowMergeModal(false);
    setMergeSourceTag(null);
  }, []);

  // モーダルを閉じる
  const handleCloseModals = useCallback(() => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowMergeModal(false);
    setSelectedTag(null);
    setMergeSourceTag(null);
    setCreateGroupId(null);
  }, []);

  return {
    // State
    showCreateModal,
    showEditModal,
    showMergeModal,
    selectedTag,
    mergeSourceTag,
    createGroupId,
    // @deprecated - 後方互換性のため残すが、フラット構造では使用しない
    createParentTag: null,

    // Handlers
    handleCreateTag,
    handleSaveNewTag,
    handleEditTag,
    handleSaveTag,
    handleDeleteTag,
    handleMoveTagToGroup,
    // @deprecated - handleMoveTagToGroup を使用してください
    handleMoveTag: handleMoveTagToGroup,
    handleRenameTag,
    handleMergeTag,
    handleCloseMergeModal,
    handleCloseModals,
  };
}
