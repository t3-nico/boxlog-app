'use client'

import { useCallback, useState } from 'react'

import {
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  MoreHorizontal as EllipsisHorizontalIcon,
  Pencil as PencilIcon,
  Plus as PlusIcon,
  Tag as TagIcon,
  Trash2 as TrashIcon,
} from 'lucide-react'

import type { TagWithChildren } from '@/types/tags'
import { useTranslations } from 'next-intl'

interface TagTreeViewProps {
  tags: TagWithChildren[]
  onCreateTag: (parentId?: string) => void
  onEditTag: (tag: TagWithChildren) => void
  onDeleteTag: (tag: TagWithChildren) => void
  onRenameTag: (tag: TagWithChildren, newName: string) => void
  expandedNodes?: Set<string>
  onToggleExpanded?: (tagId: string) => void
  isLoading?: boolean
}

interface TagTreeNodeProps {
  tag: TagWithChildren
  level: number
  isExpanded: boolean
  onToggleExpanded: (tagId: string) => void
  onCreateTag: (parentId?: string) => void
  onEditTag: (tag: TagWithChildren) => void
  onDeleteTag: (tag: TagWithChildren) => void
  onRenameTag: (tag: TagWithChildren, newName: string) => void
}

const TagTreeNode = ({
  tag,
  level,
  isExpanded,
  onToggleExpanded,
  onCreateTag,
  onEditTag,
  onDeleteTag,
  onRenameTag,
}: TagTreeNodeProps) => {
  const t = useTranslations()
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(tag.name)

  const hasChildren = tag.children && tag.children.length > 0
  const isGroup = tag.level === 0 // Level 0 はグループ

  const handleToggleExpanded = useCallback(() => {
    if (hasChildren) {
      onToggleExpanded(tag.id)
    }
  }, [hasChildren, onToggleExpanded, tag.id])

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

  // jsx-no-bind optimization: Create child tag handler
  const handleCreateChildTag = useCallback(() => {
    onCreateTag(tag.id)
  }, [onCreateTag, tag.id])

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

  const indentClass = `ml-${level * 4}`

  return (
    <div className="relative">
      {/* タグノード */}
      <div
        className={`hover:bg-foreground/8 group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${indentClass}`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
      >
        {/* 展開/折りたたみアイコン */}
        <button
          type="button"
          onClick={handleToggleExpanded}
          className={`hover:bg-foreground/8 flex-shrink-0 rounded p-1 transition-colors ${
            hasChildren ? 'visible' : 'invisible'
          }`}
        >
          {hasChildren && isExpanded ? (
            <ChevronDownIcon className="text-muted-foreground h-4 w-4" data-slot="icon" />
          ) : (
            <ChevronRightIcon className="text-muted-foreground h-4 w-4" data-slot="icon" />
          )}
        </button>

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

        {/* パス表示 */}
        <div className="text-muted-foreground flex-shrink-0 text-xs">{tag.path}</div>

        {/* アクションボタン */}
        <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {/* グループ（Level 0）: 子タグ追加ボタンのみ */}
          {isGroup ? (
            <button
              type="button"
              onClick={handleCreateChildTag}
              className="text-muted-foreground hover:bg-foreground/8 hover:text-foreground rounded p-1 transition-colors"
              title="タグを追加"
            >
              <PlusIcon className="h-4 w-4" data-slot="icon" />
            </button>
          ) : (
            /* タグ（Level 1）: 編集・削除メニュー */
            <div className="relative">
              <button
                type="button"
                onClick={handleToggleMenu}
                className="text-muted-foreground hover:bg-foreground/8 hover:text-foreground rounded p-1 transition-colors"
              >
                <EllipsisHorizontalIcon className="h-4 w-4" data-slot="icon" />
              </button>

              {/* コンテキストメニュー */}
              {showMenu != null && (
                <div className="border-border bg-popover text-popover-foreground absolute top-full right-0 z-10 mt-1 min-w-32 rounded-lg border shadow-lg">
                  <button
                    type="button"
                    onClick={handleEditTag}
                    className="text-foreground hover:bg-foreground/8 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" data-slot="icon" />
                    {t('tag.actions.edit')}
                  </button>
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="text-foreground hover:bg-foreground/8 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" data-slot="icon" />
                    {t('tag.actions.rename')}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteTag}
                    className="text-destructive hover:bg-destructive/8 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" data-slot="icon" />
                    {t('tag.actions.delete')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 子タグ */}
      {hasChildren && isExpanded ? (
        <div className="space-y-1">
          {tag.children.map((child) => (
            <TagTreeNode
              key={child.id}
              tag={child}
              level={level + 1}
              isExpanded={false} // 簡略化のため、デフォルトは折りたたみ
              onToggleExpanded={onToggleExpanded}
              onCreateTag={onCreateTag}
              onEditTag={onEditTag}
              onDeleteTag={onDeleteTag}
              onRenameTag={onRenameTag}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export const TagTreeView = ({
  tags,
  onCreateTag,
  onEditTag,
  onDeleteTag,
  onRenameTag,
  expandedNodes = new Set(),
  onToggleExpanded = () => {},
  isLoading = false,
}: TagTreeViewProps) => {
  const t = useTranslations()
  const [localExpandedNodes, setLocalExpandedNodes] = useState<Set<string>>(expandedNodes)

  const handleToggleExpanded = useCallback(
    (tagId: string) => {
      const newExpanded = new Set(localExpandedNodes)
      if (newExpanded.has(tagId)) {
        newExpanded.delete(tagId)
      } else {
        newExpanded.add(tagId)
      }
      setLocalExpandedNodes(newExpanded)
      onToggleExpanded(tagId)
    },
    [localExpandedNodes, onToggleExpanded]
  )

  // jsx-no-bind optimization: Create root tag handler
  const handleCreateRootTag = useCallback(() => {
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
          onClick={handleCreateRootTag}
          className="bg-primary text-primary-foreground hover:bg-primary/92 inline-flex items-center gap-2 rounded-lg px-4 py-2 transition-colors"
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
          onClick={handleCreateRootTag}
          className="text-primary hover:bg-foreground/8 inline-flex items-center gap-1 rounded px-2 py-1 text-sm transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          {t('tag.messages.newTag')}
        </button>
      </div>

      {/* ツリー */}
      <div className="space-y-1">
        {tags.map((tag) => (
          <TagTreeNode
            key={tag.id}
            tag={tag}
            level={0}
            isExpanded={localExpandedNodes.has(tag.id)}
            onToggleExpanded={handleToggleExpanded}
            onCreateTag={onCreateTag}
            onEditTag={onEditTag}
            onDeleteTag={onDeleteTag}
            onRenameTag={onRenameTag}
          />
        ))}
      </div>
    </div>
  )
}
