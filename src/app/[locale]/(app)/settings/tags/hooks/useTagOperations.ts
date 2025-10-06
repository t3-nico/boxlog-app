/**
 * タグ操作のビジネスロジックを管理するカスタムフック
 */

import { useCallback, useState } from 'react'
import {
  useCreateTag,
  useDeleteTag,
  useMoveTag,
  useOptimisticTagUpdate,
  useRenameTag,
  useUpdateTag,
} from '@/features/tags/hooks/use-tags'
import type { CreateTagInput, TagWithChildren, UpdateTagInput } from '@/types/tags'

export function useTagOperations(tags: TagWithChildren[]) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTag, setSelectedTag] = useState<TagWithChildren | null>(null)
  const [createParentTag, setCreateParentTag] = useState<TagWithChildren | null>(null)

  // React Query mutations
  const createTagMutation = useCreateTag()
  const updateTagMutation = useUpdateTag()
  const deleteTagMutation = useDeleteTag()
  const moveTagMutation = useMoveTag()
  const renameTagMutation = useRenameTag()

  // 楽観的更新
  const { updateTagOptimistically, addTagOptimistically, removeTagOptimistically } = useOptimisticTagUpdate()

  // タグ作成
  const handleCreateTag = useCallback(
    (parentId?: string) => {
      const parentTag = parentId
        ? tags.find((t) => t.id === parentId) || tags.flatMap((t) => t.children || []).find((t) => t.id === parentId)
        : null

      setCreateParentTag(parentTag || null)
      setShowCreateModal(true)
    },
    [tags]
  )

  const handleSaveNewTag = useCallback(
    async (data: CreateTagInput) => {
      try {
        // 楽観的更新
        const tempTag: TagWithChildren = {
          id: `temp-${Date.now()}`,
          name: data.name,
          parent_id: data.parent_id || null,
          user_id: 'current-user',
          color: data.color || '#3B82F6',
          level: (createParentTag ? Math.min(createParentTag.level + 1, 2) : 0) as 0 | 1 | 2,
          path: createParentTag ? `${createParentTag.path}/${data.name}` : `#${data.name}`,
          description: data.description || null,
          icon: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          children: [],
          parent: createParentTag,
        }

        addTagOptimistically(tempTag, data.parent_id)

        // 実際の作成
        await createTagMutation.mutateAsync(data)
      } catch (error) {
        console.error('Failed to create tag:', error)
        throw error
      }
    },
    [createTagMutation, addTagOptimistically, createParentTag]
  )

  // タグ編集
  const handleEditTag = useCallback((tag: TagWithChildren) => {
    setSelectedTag(tag)
    setShowEditModal(true)
  }, [])

  const handleSaveTag = useCallback(
    async (data: UpdateTagInput) => {
      if (!selectedTag) return

      try {
        // 楽観的更新
        updateTagOptimistically(selectedTag.id, data)

        // 実際の更新
        await updateTagMutation.mutateAsync({
          id: selectedTag.id,
          data,
        })
      } catch (error) {
        console.error('Failed to update tag:', error)
        throw error
      }
    },
    [selectedTag, updateTagMutation, updateTagOptimistically]
  )

  // タグ削除
  const handleDeleteTag = useCallback(
    async (tag: TagWithChildren) => {
      if (!confirm(`タグ「${tag.name}」を削除しますか？`)) return

      try {
        // 楽観的更新
        removeTagOptimistically(tag.id)

        // 実際の削除
        await deleteTagMutation.mutateAsync(tag.id)
      } catch (error) {
        console.error('Failed to delete tag:', error)
        throw error
      }
    },
    [deleteTagMutation, removeTagOptimistically]
  )

  // タグ移動
  const handleMoveTag = useCallback(
    async (tag: TagWithChildren, newParentId: string | null) => {
      try {
        // 楽観的更新
        updateTagOptimistically(tag.id, { parent_id: newParentId })

        // 実際の移動
        await moveTagMutation.mutateAsync({
          id: tag.id,
          newParentId,
        })
      } catch (error) {
        console.error('Failed to move tag:', error)
        throw error
      }
    },
    [moveTagMutation, updateTagOptimistically]
  )

  // タグリネーム
  const handleRenameTag = useCallback(
    async (tag: TagWithChildren, newName: string) => {
      try {
        // 楽観的更新
        updateTagOptimistically(tag.id, { name: newName })

        // 実際のリネーム
        await renameTagMutation.mutateAsync({
          id: tag.id,
          name: newName,
        })
      } catch (error) {
        console.error('Failed to rename tag:', error)
        throw error
      }
    },
    [renameTagMutation, updateTagOptimistically]
  )

  // モーダルを閉じる
  const handleCloseModals = useCallback(() => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setSelectedTag(null)
    setCreateParentTag(null)
  }, [])

  return {
    // State
    showCreateModal,
    showEditModal,
    selectedTag,
    createParentTag,

    // Handlers
    handleCreateTag,
    handleSaveNewTag,
    handleEditTag,
    handleSaveTag,
    handleDeleteTag,
    handleMoveTag,
    handleRenameTag,
    handleCloseModals,
  }
}
