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
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(tag.name)

  const hasChildren = tag.children && tag.children.length > 0
  const canHaveChildren = tag.level < 2 // 最大3階層

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

  const indentClass = `ml-${level * 4}`

  return (
    <div className="relative">
      {/* タグノード */}
      <div
        className={`group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${indentClass}`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
      >
        {/* 展開/折りたたみアイコン */}
        <button
          type="button"
          onClick={handleToggleExpanded}
          className={`flex-shrink-0 rounded p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${
            hasChildren ? 'visible' : 'invisible'
          }`}
        >
          {hasChildren && isExpanded ? (
            <ChevronDownIcon className="h-4 w-4 text-gray-500" data-slot="icon" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 text-gray-500" data-slot="icon" />
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
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyDown}
              className="w-full rounded border border-blue-500 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700"
            />
          ) : (
            <button
              type="button"
              onClick={handleStartEdit}
              className="w-full truncate text-left text-sm font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
              title={tag.name}
            >
              {tag.name}
            </button>
          )}
        </div>

        {/* パス表示 */}
        <div className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">{tag.path}</div>

        {/* アクションボタン */}
        <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {/* 子タグ追加ボタン */}
          {canHaveChildren && (
            <button
              type="button"
              onClick={() => onCreateTag(tag.id)}
              className="rounded p-1 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
              title="子タグを追加"
            >
              <PlusIcon className="h-4 w-4" data-slot="icon" />
            </button>
          )}

          {/* メニューボタン */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <EllipsisHorizontalIcon className="h-4 w-4" data-slot="icon" />
            </button>

            {/* コンテキストメニュー */}
            {showMenu && (
              <div className="absolute right-0 top-full z-10 mt-1 min-w-[120px] rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    onEditTag(tag)
                    setShowMenu(false)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <PencilIcon className="h-4 w-4" data-slot="icon" />
                  編集
                </button>
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <PencilIcon className="h-4 w-4" data-slot="icon" />
                  名前変更
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteTag(tag)
                    setShowMenu(false)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <TrashIcon className="h-4 w-4" data-slot="icon" />
                  削除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 子タグ */}
      {hasChildren && isExpanded && (
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
      )}
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!tags || tags.length === 0) {
    return (
      <div className="py-8 text-center">
        <TagIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" data-slot="icon" />
        <p className="mb-4 text-gray-500 dark:text-gray-400">タグがまだありません</p>
        <button
          type="button"
          onClick={() => onCreateTag()}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4" />
          最初のタグを作成
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">タグ一覧 ({tags.length})</h3>
        <button
          type="button"
          onClick={() => onCreateTag()}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
        >
          <PlusIcon className="h-4 w-4" />
          新規作成
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
