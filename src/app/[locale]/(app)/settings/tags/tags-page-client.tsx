'use client'

import { useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import { Tag } from 'lucide-react'

import { useI18n } from '@/features/i18n/lib/hooks'
import { ErrorBoundary } from '@/components/error-boundary'
import { SettingsLayout } from '@/features/settings/components'
import { useTags } from '@/features/tags/hooks/use-tags'
import { TagsToolbar } from './components/TagsToolbar'
import { useTagOperations } from './hooks/useTagOperations'

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
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')
  const [showInactive, setShowInactive] = useState(false)

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
    handleMoveTag,
    handleRenameTag,
    handleCloseModals,
  } = useTagOperations(tags)

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

  // イベントハンドラー
  const handleReload = useCallback(() => {
    window.location.reload()
  }, [])

  const handleToggleInactive = useCallback(() => {
    setShowInactive(!showInactive)
  }, [showInactive])

  // エラー状態
  if (error) {
    return (
      <SettingsLayout title={t('settings.tags.title')} description={t('settings.tags.description')}>
        <div className="text-center">
          <div className="mb-4 text-red-600 dark:text-red-400">
            <Tag className="mx-auto mb-2 h-12 w-12" data-slot="icon" />
            <p>{t('settings.tags.loadError')}</p>
          </div>
          <button
            type="button"
            onClick={handleReload}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {t('settings.tags.reload')}
          </button>
        </div>
      </SettingsLayout>
    )
  }

  return (
    <ErrorBoundary>
      <SettingsLayout title={t('settings.tags.title')} description={t('settings.tags.description')}>
        <div className="space-y-6">
          {/* ツールバー */}
          <TagsToolbar
            searchQuery={searchQuery}
            showInactive={showInactive}
            onSearchChange={setSearchQuery}
            onToggleInactive={handleToggleInactive}
            onCreateTag={() => handleCreateTag()}
          />

          {/* タグツリービュー */}
          <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
            <TagTreeView
              tags={filteredTags}
              onCreateTag={handleCreateTag}
              onEditTag={handleEditTag}
              onDeleteTag={handleDeleteTag}
              onRenameTag={handleRenameTag}
              isLoading={isLoading}
            />
          </div>

          {/* モーダル */}
          <TagCreateModal
            isOpen={showCreateModal}
            onClose={handleCloseModals}
            onSave={handleSaveNewTag}
            parentTag={createParentTag}
          />

          <TagEditModal
            isOpen={showEditModal}
            tag={selectedTag}
            onClose={handleCloseModals}
            onSave={handleSaveTag}
          />
        </div>
      </SettingsLayout>
    </ErrorBoundary>
  )
}
