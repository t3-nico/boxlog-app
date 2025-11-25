'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

import { ErrorBoundary } from '@/components/error-boundary'
import { useTagOperations } from '@/features/tags/hooks/use-tag-operations'
import { useTags } from '@/features/tags/hooks/use-tags'

const TagCreateModal = dynamic(
  () => import('@/features/tags/components/tag-create-modal').then((mod) => ({ default: mod.TagCreateModal })),
  { ssr: false }
)

const TagEditModal = dynamic(
  () => import('@/features/tags/components/tag-edit-modal').then((mod) => ({ default: mod.TagEditModal })),
  { ssr: false }
)

const TagTreeView = dynamic(
  () => import('@/features/tags/components/tag-tree-view').then((mod) => ({ default: mod.TagTreeView })),
  { ssr: false }
)

export function TagsSettings() {
  const [isMounted, setIsMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // クライアントサイドでのみレンダリング
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // データ取得
  const { data: tags = [], isLoading, error } = useTags(true)

  // タグ操作
  const {
    showCreateModal,
    showEditModal,
    selectedTag,
    createParentTag,
    handleCreateTag,
    handleSaveNewTag,
    handleEditTag,
    handleSaveTag,
    handleDeleteTag,
    handleRenameTag,
    handleCloseModals,
  } = useTagOperations(tags)

  // フィルタリング
  const filteredTags = tags.filter((tag) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        tag.name.toLowerCase().includes(query) ||
        tag.path?.toLowerCase().includes(query) ||
        tag.description?.toLowerCase().includes(query)
      )
    }
    return true
  })

  // SSR時は何も表示しない（Hydrationエラー回避）
  if (!isMounted) {
    return null
  }

  // エラー状態
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium">タグ設定</h2>
          <p className="text-muted-foreground text-sm">タグを管理します</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">
            エラー: {error instanceof Error ? error.message : String(error)}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <h2 className="text-lg font-medium">タグ設定</h2>
          <p className="text-muted-foreground text-sm">タグを作成・管理します</p>
        </div>

        {/* ツールバー */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="タグを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-border bg-card flex-1 rounded-lg border px-4 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => handleCreateTag()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            新規タグ
          </button>
        </div>

        {/* タグツリービュー */}
        <div className="border-border bg-card rounded-lg border p-6">
          {isLoading ? (
            <p className="text-muted-foreground text-sm">読み込み中...</p>
          ) : (
            <TagTreeView
              tags={filteredTags}
              onCreateTag={handleCreateTag}
              onEditTag={handleEditTag}
              onDeleteTag={handleDeleteTag}
              onRenameTag={handleRenameTag}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* モーダル */}
        {isMounted && (
          <>
            <TagCreateModal isOpen={showCreateModal} onClose={handleCloseModals} onSave={handleSaveNewTag} />

            <TagEditModal isOpen={showEditModal} tag={selectedTag} onClose={handleCloseModals} onSave={handleSaveTag} />
          </>
        )}
      </div>
    </ErrorBoundary>
  )
}
