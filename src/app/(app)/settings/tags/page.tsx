'use client'

import { useCallback, useState } from 'react'

import dynamic from 'next/dynamic'

import { Filter, Search, Tag } from 'lucide-react'

import { colors, spacing, typography } from '@/config/theme'
import { SettingsLayout } from '@/features/settings/components'
import {
  useCreateTag,
  useDeleteTag,
  useMoveTag,
  useOptimisticTagUpdate,
  useRenameTag,
  useTags,
  useUpdateTag,
} from '@/features/tags/hooks/use-tags'
import type { CreateTagInput, TagWithChildren, UpdateTagInput } from '@/types/tags'

const TagCreateModal = dynamic(
  () => import('@/features/tags/components/tag-create-modal').then((mod) => ({ default: mod.TagCreateModal })),
  {
    ssr: false,
    loading: () => <div className="h-96 animate-pulse rounded bg-gray-200" />,
  }
)

const TagEditModal = dynamic(
  () => import('@/features/tags/components/tag-edit-modal').then((mod) => ({ default: mod.TagEditModal })),
  {
    ssr: false,
    loading: () => <div className="h-96 animate-pulse rounded bg-gray-200" />,
  }
)

const TagTreeView = dynamic(
  () => import('@/features/tags/components/tag-tree-view').then((mod) => ({ default: mod.TagTreeView })),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse rounded bg-gray-200" />,
  }
)

const TagsSettingsPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTag, setSelectedTag] = useState<TagWithChildren | null>(null)
  const [createParentTag, setCreateParentTag] = useState<TagWithChildren | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showInactive, setShowInactive] = useState(false)

  // React Query hooks
  const { data: tags = [], isLoading, error } = useTags(true)
  const createTagMutation = useCreateTag()
  const updateTagMutation = useUpdateTag()
  const deleteTagMutation = useDeleteTag()
  const moveTagMutation = useMoveTag()
  const renameTagMutation = useRenameTag()

  // 楽観的更新
  const { updateTagOptimistically, addTagOptimistically, removeTagOptimistically } = useOptimisticTagUpdate()

  // フィルタリング
  const filteredTags = tags.filter((tag) => {
    if (!showInactive && !tag.is_active) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        tag.name.toLowerCase().includes(query) ||
        tag.path.toLowerCase().includes(query) ||
        tag.description?.toLowerCase().includes(query)
      )
    }
    return true
  })

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
          level: createParentTag ? createParentTag.level + 1 : 0,
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
      const confirmDelete = window.confirm(`「${tag.name}」を削除しますか？この操作は取り消せません。`)

      if (!confirmDelete) return

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

  const handleDeleteSelectedTag = useCallback(async () => {
    if (!selectedTag) return
    await handleDeleteTag(selectedTag)
  }, [selectedTag, handleDeleteTag])

  // タグ移動
  const handleMoveTag = useCallback(
    async (newParentId: string | null) => {
      if (!selectedTag) return

      try {
        await moveTagMutation.mutateAsync({
          id: selectedTag.id,
          newParentId,
        })
      } catch (error) {
        console.error('Failed to move tag:', error)
        throw error
      }
    },
    [selectedTag, moveTagMutation]
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

  // jsx-no-bind optimization handlers
  const handleReload = useCallback(() => {
    window.location.reload()
  }, [])

  const handleCreateTagClick = useCallback(() => {
    handleCreateTag()
  }, [handleCreateTag])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleToggleInactive = useCallback(() => {
    setShowInactive(!showInactive)
  }, [showInactive])

  // モーダルを閉じる
  const handleCloseModals = useCallback(() => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setSelectedTag(null)
    setCreateParentTag(null)
  }, [])

  if (error) {
    return (
      <SettingsLayout title="タグ管理" description="階層構造でタグを整理・管理できます">
        <div className={typography.align.center}>
          <div className={`${colors.semantic.error.text} mb-4`}>
            <Tag className="mx-auto mb-2 h-12 w-12" data-slot="icon" />
            <p>タグの読み込みに失敗しました</p>
          </div>
          <button
            type="button"
            onClick={handleReload}
            className={`${spacing.padding.md} ${colors.primary.DEFAULT} ${colors.text.white} ${colors.rounded.lg} ${colors.hover.primary} ${colors.transition.colors}`}
          >
            再読み込み
          </button>
        </div>
      </SettingsLayout>
    )
  }

  return (
    <SettingsLayout
      title="タグ管理"
      description="階層構造でタグを整理・管理できます"
      actions={
        <button
          type="button"
          onClick={handleCreateTagClick}
          className={`inline-flex items-center gap-2 ${spacing.padding.md} ${colors.primary.DEFAULT} ${colors.hover.primary} ${colors.text.white} ${colors.rounded.lg} ${colors.transition.colors}`}
        >
          <Tag className="h-4 w-4" data-slot="icon" />
          新しいタグ
        </button>
      }
    >
      <div className={spacing.stackGap.lg}>
        {/* 検索・フィルター */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search
              className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform ${colors.text.muted}`}
              data-slot="icon"
            />
            <input
              type="text"
              placeholder="タグを検索..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={`w-full py-2 pl-10 pr-4 ${colors.border.default} ${colors.rounded.lg} ${colors.background.surface} ${colors.text.primary} ${colors.focus.primary}`}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleInactive}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 ${typography.body.small} font-medium transition-colors ${
                showInactive
                  ? `${colors.primary.light} ${colors.primary.text}`
                  : `${colors.background.elevated} ${colors.text.secondary} ${colors.hover.elevated}`
              }`}
            >
              <Filter className="h-4 w-4" data-slot="icon" />
              非アクティブを表示
            </button>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className={`${colors.background.surface} rounded-xl border shadow-sm ${colors.border.alpha}`}>
          <TagTreeView
            tags={filteredTags}
            onCreateTag={handleCreateTag}
            onEditTag={handleEditTag}
            onDeleteTag={handleDeleteTag}
            onRenameTag={handleRenameTag}
            isLoading={isLoading}
          />
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div
            className={`${colors.background.surface} rounded-lg ${spacing.cardVariants.default} border ${colors.border.alpha}`}
          >
            <div className={`${typography.heading.h2} font-bold ${colors.text.primary}`}>{tags.length}</div>
            <div className={`${typography.body.small} ${colors.text.muted}`}>総タグ数</div>
          </div>

          <div
            className={`${colors.background.surface} rounded-lg ${spacing.cardVariants.default} border ${colors.border.alpha}`}
          >
            <div className={`${typography.heading.h2} font-bold ${colors.text.primary}`}>
              {tags.filter((t) => t.level === 0).length}
            </div>
            <div className={`${typography.body.small} ${colors.text.muted}`}>ルートタグ数</div>
          </div>

          <div
            className={`${colors.background.surface} rounded-lg ${spacing.cardVariants.default} border ${colors.border.alpha}`}
          >
            <div className={`${typography.heading.h2} font-bold ${colors.text.primary}`}>
              {tags.filter((t) => !t.is_active).length}
            </div>
            <div className={`${typography.body.small} ${colors.text.muted}`}>非アクティブタグ数</div>
          </div>
        </div>

        {/* モーダル */}
        <TagCreateModal
          isOpen={showCreateModal}
          onClose={handleCloseModals}
          onSave={handleSaveNewTag}
          parentTag={createParentTag}
          allTags={tags}
        />

        <TagEditModal
          isOpen={showEditModal}
          onClose={handleCloseModals}
          onSave={handleSaveTag}
          onDelete={handleDeleteSelectedTag}
          onMove={handleMoveTag}
          tag={selectedTag}
          allTags={tags}
        />
      </div>
    </SettingsLayout>
  )
}

export default TagsSettingsPage
