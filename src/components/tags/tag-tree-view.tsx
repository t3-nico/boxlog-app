'use client'

import { useState, useCallback } from 'react'
import { 
  ChevronRight as ChevronRightIcon,
  ChevronDown as ChevronDownIcon,
  Plus as PlusIcon,
  MoreHorizontal as EllipsisHorizontalIcon,
  Tag as TagIcon,
  Pencil as PencilIcon,
  Trash2 as TrashIcon
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

function TagTreeNode({
  tag,
  level,
  isExpanded,
  onToggleExpanded,
  onCreateTag,
  onEditTag,
  onDeleteTag,
  onRenameTag
}: TagTreeNodeProps) {
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
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }, [handleSaveEdit, handleCancelEdit])
  
  const indentClass = `ml-${level * 4}`
  
  return (
    <div className="relative">
      {/* タグノード */}
      <div 
        className={`group flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors ${indentClass}`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
      >
        {/* 展開/折りたたみアイコン */}
        <button
          onClick={handleToggleExpanded}
          className={`flex-shrink-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            hasChildren ? 'visible' : 'invisible'
          }`}
        >
          {hasChildren && isExpanded ? (
            <ChevronDownIcon className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 text-gray-500" />
          )}
        </button>
        
        {/* タグアイコン */}
        <div className="flex-shrink-0">
          <TagIcon 
            className="w-4 h-4" 
            style={{ color: tag.color }}
          />
        </div>
        
        {/* タグ名 */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <button
              onClick={handleStartEdit}
              className="w-full text-left text-sm font-medium text-gray-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400"
              title={tag.name}
            >
              {tag.name}
            </button>
          )}
        </div>
        
        {/* パス表示 */}
        <div className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
          {tag.path}
        </div>
        
        {/* アクションボタン */}
        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* 子タグ追加ボタン */}
          {canHaveChildren && (
            <button
              onClick={() => onCreateTag(tag.id)}
              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              title="子タグを追加"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          )}
          
          {/* メニューボタン */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <EllipsisHorizontalIcon className="w-4 h-4" />
            </button>
            
            {/* コンテキストメニュー */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    onEditTag(tag)
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  編集
                </button>
                <button
                  onClick={handleStartEdit}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  名前変更
                </button>
                <button
                  onClick={() => {
                    onDeleteTag(tag)
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
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

export function TagTreeView({
  tags,
  onCreateTag,
  onEditTag,
  onDeleteTag,
  onRenameTag,
  expandedNodes = new Set(),
  onToggleExpanded = () => {},
  isLoading = false
}: TagTreeViewProps) {
  const [localExpandedNodes, setLocalExpandedNodes] = useState<Set<string>>(expandedNodes)
  
  const handleToggleExpanded = useCallback((tagId: string) => {
    const newExpanded = new Set(localExpandedNodes)
    if (newExpanded.has(tagId)) {
      newExpanded.delete(tagId)
    } else {
      newExpanded.add(tagId)
    }
    setLocalExpandedNodes(newExpanded)
    onToggleExpanded(tagId)
  }, [localExpandedNodes, onToggleExpanded])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!tags || tags.length === 0) {
    return (
      <div className="text-center py-8">
        <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          タグがまだありません
        </p>
        <button
          onClick={() => onCreateTag()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          最初のタグを作成
        </button>
      </div>
    )
  }
  
  return (
    <div className="space-y-1">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          タグ一覧 ({tags.length})
        </h3>
        <button
          onClick={() => onCreateTag()}
          className="inline-flex items-center gap-1 px-2 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
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