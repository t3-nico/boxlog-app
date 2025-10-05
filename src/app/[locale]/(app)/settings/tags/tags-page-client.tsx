'use client'

import { useCallback, useState } from 'react'

import dynamic from 'next/dynamic'

import { Filter, Search, Tag } from 'lucide-react'

import { ErrorBoundary } from '@/components/error-boundary'
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

export const TagsPageClient = () => {
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
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <Tag className="mx-auto mb-2 h-12 w-12" data-slot="icon" />
            <p>タグの読み込みに失敗しました</p>
          </div>
          <button
            type="button"
            onClick={handleReload}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Tag className="h-4 w-4" data-slot="icon" />
          新しいタグ
        </button>
      }
    >
      <div className="space-y-6">
        {/* 検索・フィルター */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-neutral-500 dark:text-neutral-400"
              data-slot="icon"
            />
            <input
              type="text"
              placeholder="タグを検索..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full py-2 pl-10 pr-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleInactive}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                showInactive
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              <Filter className="h-4 w-4" data-slot="icon" />
              非アクティブを表示
            </button>
          </div>
        </div>

        {/* メインコンテンツ */}
        <ErrorBoundary
          fallback={
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 shadow-sm p-8">
              <div className="text-center">
                <Tag className="mx-auto mb-4 h-12 w-12 text-red-600 dark:text-red-400" />
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                  タグツリーの表示に失敗しました
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  ページをリロードしてください。
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  リロード
                </button>
              </div>
            </div>
          }
        >
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 shadow-sm">
            <TagTreeView
              tags={filteredTags}
              onCreateTag={handleCreateTag}
              onEditTag={handleEditTag}
              onDeleteTag={handleDeleteTag}
              onRenameTag={handleRenameTag}
              isLoading={isLoading}
            />
          </div>
        </ErrorBoundary>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200/50 dark:border-neutral-700/50">
            <div className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {tags.length}
            </div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">総タグ数</div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200/50 dark:border-neutral-700/50">
            <div className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {tags.filter((t) => t.level === 0).length}
            </div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">ルートタグ数</div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200/50 dark:border-neutral-700/50">
            <div className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {tags.filter((t) => !t.is_active).length}
            </div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">非アクティブタグ数</div>
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
