'use client'

import { useCallback, useState } from 'react'

import {
  MoreHorizontal as EllipsisHorizontalIcon,
  Pencil as PencilIcon,
  Plus as PlusIcon,
  Tag as TagIcon,
  Trash2 as TrashIcon,
} from 'lucide-react'

import type { Tag } from '@/features/tags/types'
import { useTranslations } from 'next-intl'

interface TagTreeViewProps {
  tags: Tag[]
  onCreateTag: () => void
  onEditTag: (tag: Tag) => void
  onDeleteTag: (tag: Tag) => void
  onRenameTag: (tag: Tag, newName: string) => void
  isLoading?: boolean
}

interface TagTreeNodeProps {
  tag: Tag
  onEditTag: (tag: Tag) => void
  onDeleteTag: (tag: Tag) => void
  onRenameTag: (tag: Tag, newName: string) => void
}

const TagTreeNode = ({ tag, onEditTag, onDeleteTag, onRenameTag }: TagTreeNodeProps) => {
  const t = useTranslations()
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(tag.name)

  const handleStartEdit = useCallback(() => {
    setIsEditing(true)
    setEditName(tag.name)
    setShowMenu(false)
  }, [tag.name])

  const handleSaveEdit = useCallback(() => {
    if (editName.trim() && editName !== tag.name) {
      onRenameTag(tag, editName.trim())
    }
    setIsEditing(false)
  }, [editName, tag, onRenameTag])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    setEditName(tag.name)
  }, [tag.name])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSaveEdit()
      } else if (e.key === 'Escape') {
        handleCancelEdit()
      }
    },
    [handleSaveEdit, handleCancelEdit]
  )

  // jsx-no-bind optimization: Edit name change handler
  const handleEditNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditName(e.target.value)
  }, [])

  // jsx-no-bind optimization: Toggle menu handler
  const handleToggleMenu = useCallback(() => {
    setShowMenu(!showMenu)
  }, [showMenu])

  // jsx-no-bind optimization: Edit tag handler
  const handleEditTag = useCallback(() => {
    onEditTag(tag)
    setShowMenu(false)
  }, [onEditTag, tag])

  // jsx-no-bind optimization: Delete tag handler
  const handleDeleteTag = useCallback(() => {
    onDeleteTag(tag)
    setShowMenu(false)
  }, [onDeleteTag, tag])

  return (
    <div className="relative">
      {/* タグノード */}
      <div className="hover:bg-state-hover group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors">
        {/* タグアイコン */}
        <div className="flex-shrink-0">
          <TagIcon className="h-4 w-4" style={{ color: tag.color }} data-slot="icon" />
        </div>

        {/* タグ名 */}
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={handleEditNameChange}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyDown}
              className="border-primary bg-card focus:ring-ring w-full rounded border px-2 py-1 text-sm focus:ring-1 focus:outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={handleStartEdit}
              className="text-foreground hover:text-primary w-full truncate text-left text-sm font-medium"
              title={tag.name}
            >
              {tag.name}
            </button>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="relative">
            <button
              type="button"
              onClick={handleToggleMenu}
              className="text-muted-foreground hover:bg-state-hover hover:text-foreground rounded p-1 transition-colors"
            >
              <EllipsisHorizontalIcon className="h-4 w-4" data-slot="icon" />
            </button>

            {/* コンテキストメニュー */}
            {showMenu && (
              <div className="border-border bg-popover text-popover-foreground absolute top-full right-0 z-10 mt-1 min-w-32 rounded-lg border shadow-lg">
                <button
                  type="button"
                  onClick={handleEditTag}
                  className="text-foreground hover:bg-state-hover flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                >
                  <PencilIcon className="h-4 w-4" data-slot="icon" />
                  {t('tag.actions.edit')}
                </button>
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="text-foreground hover:bg-state-hover flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                >
                  <PencilIcon className="h-4 w-4" data-slot="icon" />
                  {t('tag.actions.rename')}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteTag}
                  className="text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                >
                  <TrashIcon className="h-4 w-4" data-slot="icon" />
                  {t('tag.actions.delete')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const TagTreeView = ({
  tags,
  onCreateTag,
  onEditTag,
  onDeleteTag,
  onRenameTag,
  isLoading = false,
}: TagTreeViewProps) => {
  const t = useTranslations()

  // jsx-no-bind optimization: Create tag handler
  const handleCreateTag = useCallback(() => {
    onCreateTag()
  }, [onCreateTag])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    )
  }

  if (!tags || tags.length === 0) {
    return (
      <div className="py-8 text-center">
        <TagIcon className="text-muted-foreground mx-auto mb-4 h-12 w-12" data-slot="icon" />
        <p className="text-muted-foreground mb-4">{t('tag.messages.noTagsYet')}</p>
        <button
          type="button"
          onClick={handleCreateTag}
          className="bg-primary text-primary-foreground hover:bg-primary-hover inline-flex items-center gap-2 rounded-lg px-4 py-2 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          {t('tag.actions.createFirst')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* ヘッダー */}
      <div className="border-border flex items-center justify-between border-b px-3 py-2">
        <h3 className="text-foreground text-sm font-medium">
          {t('tag.messages.tagList')} ({tags.length})
        </h3>
        <button
          type="button"
          onClick={handleCreateTag}
          className="text-primary hover:bg-state-hover inline-flex items-center gap-1 rounded px-2 py-1 text-sm transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          {t('tag.messages.newTag')}
        </button>
      </div>

      {/* タグリスト（フラット） */}
      <div className="space-y-1">
        {tags.map((tag) => (
          <TagTreeNode
            key={tag.id}
            tag={tag}
            onEditTag={onEditTag}
            onDeleteTag={onDeleteTag}
            onRenameTag={onRenameTag}
          />
        ))}
      </div>
    </div>
  )
}
