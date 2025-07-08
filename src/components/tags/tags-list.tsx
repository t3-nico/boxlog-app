'use client'

import { useState, useCallback } from 'react'
import { 
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
  TagIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { tagIconMapping, TagIconName } from '@/config/tagIcons'
import { useSidebarStore } from '@/stores/sidebarStore'
import { TagEditDialog } from './tag-edit-dialog'
import { useActiveState } from '@/hooks/useActiveState'
import { clsx } from 'clsx'

interface TagsListProps {
  collapsed?: boolean
  onSelectTag?: (tagId: string) => void
  selectedTagIds?: string[]
}

interface TagItemProps {
  tag: any
  level: number
  isExpanded: boolean
  isSelected: boolean
  isCollapsed: boolean
  hasChildren: boolean
  onToggleExpanded: (tagId: string) => void
  onSelectTag: (tagId: string) => void
  onEditTag: (tag: any) => void
  onDeleteTag: (tag: any) => void
}

function TagItem({
  tag,
  level,
  isExpanded,
  isSelected,
  isCollapsed,
  hasChildren,
  onToggleExpanded,
  onSelectTag,
  onEditTag,
  onDeleteTag
}: TagItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { isTagActive } = useActiveState()
  
  const isActive = isTagActive(tag.id)
  const paddingLeft = level === 0 ? 8 : level * 16 + 16 // 階層インデント調整（トップレベルにも8px追加）
  
  const handleToggleExpanded = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (hasChildren) {
      onToggleExpanded(tag.id)
    }
  }, [hasChildren, onToggleExpanded, tag.id])
  
  const handleSelectTag = useCallback(() => {
    onSelectTag(tag.id)
    setShowMenu(false)
  }, [onSelectTag, tag.id])
  
  return (
    <div className="space-y-1">
      {/* タグアイテム */}
      <div 
        className="flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer hover:bg-zinc-950/5 dark:hover:bg-white/5 transition-colors duration-150"
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={handleSelectTag}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onContextMenu={(e) => {
          e.preventDefault()
          setShowMenu(!showMenu)
        }}
      >
        <div className="flex items-center flex-1 min-w-0 gap-3">
          {/* 展開/折りたたみアイコンまたはスペーサー */}
          <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
            {hasChildren && (
              <button
                onClick={handleToggleExpanded}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronRightIcon className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                )}
              </button>
            )}
          </div>
          
          {/* タグアイコン */}
          {(() => {
            const IconComponent = tag.icon && tagIconMapping[tag.icon as TagIconName] 
              ? tagIconMapping[tag.icon as TagIconName] 
              : TagIcon
            return (
              <div className="relative">
                <IconComponent 
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: tag.color || '#6b7280' }}
                />
              </div>
            )
          })()}
          
          {/* タグ名 */}
          {!isCollapsed && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm font-medium truncate text-zinc-950 dark:text-white" title={tag.name}>
                {tag.name}
              </span>
              {/* アクティブドット */}
              {isActive && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </div>
          )}
        </div>
        
        {/* メニュー */}
        {!isCollapsed && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className={`p-1.5 hover:bg-zinc-950/10 dark:hover:bg-white/10 rounded transition-all ${
                isHovered || showMenu ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <EllipsisHorizontalIcon className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />
            </button>
            
            {/* コンテキストメニュー */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[140px] py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditTag(tag)
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  編集
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
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
        )}
      </div>
      
      {/* 子タグは親コンポーネントで管理 */}
    </div>
  )
}

export function TagsList({ 
  collapsed = false, 
  onSelectTag = () => {},
  selectedTagIds = []
}: TagsListProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  // Zustandストアからデータを取得
  const tags = useSidebarStore(state => state.tags)
  const expandedTags = useSidebarStore(state => state.expandedTags)
  const toggleTagExpansion = useSidebarStore(state => state.toggleTagExpansion)
  
  // 表示するタグリストを計算（階層構造）
  const displayTags = useCallback(() => {
    const result: Array<{
      tag: any
      level: number
      hasChildren: boolean
      isExpanded: boolean
    }> = []
    
    const addTagsRecursively = (parentId: string | null, level: number = 0) => {
      const childTags = tags.filter(tag => tag.parentId === parentId)
      
      childTags.forEach(tag => {
        const hasChildren = tags.some(t => t.parentId === tag.id)
        const isExpanded = expandedTags.includes(tag.id)
        
        result.push({
          tag,
          level,
          hasChildren,
          isExpanded
        })
        
        // 展開されている場合のみ子タグを追加
        if (isExpanded) {
          addTagsRecursively(tag.id, level + 1)
        }
      })
    }
    
    addTagsRecursively(null)
    return result
  }, [tags, expandedTags])

  const handleToggleExpanded = useCallback((tagId: string) => {
    toggleTagExpansion(tagId)
  }, [toggleTagExpansion])
  
  const [editingTag, setEditingTag] = useState<any>(null)
  const updateTag = useSidebarStore(state => state.updateTag)
  const deleteTag = useSidebarStore(state => state.deleteTag)

  const handleEditTag = useCallback((tag: any) => {
    setEditingTag(tag)
  }, [])
  
  const handleDeleteTag = useCallback((tag: any) => {
    if (tag.count > 0) {
      alert('このタグは使用中のため削除できません。')
      return
    }
    if (confirm(`タグ「${tag.name}」を削除しますか？`)) {
      deleteTag(tag.id)
    }
  }, [deleteTag])

  const handleSaveTag = useCallback((updatedTag: any) => {
    updateTag(editingTag.id, {
      name: updatedTag.name,
      color: updatedTag.color,
      icon: updatedTag.icon
    })
    setEditingTag(null)
  }, [editingTag, updateTag])
  
  if (collapsed) {
    return null
  }
  
  return (
    <div className="space-y-1">
      {/* セクションヘッダー */}
      <div className="flex items-center justify-between w-full">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center mb-1 px-2 text-xs/6 font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-950/5 dark:hover:bg-white/5 rounded transition-colors"
        >
          <span className="peer">Tags</span>
          <span className="ml-1 opacity-0 peer-hover:opacity-100 transition-opacity">
            {isExpanded ? (
              <ChevronDownIcon className="h-3 w-3" />
            ) : (
              <ChevronRightIcon className="h-3 w-3" />
            )}
          </span>
        </button>
        
        <button
          onClick={() => console.log('Create new tag')}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <PlusIcon className="h-4 w-4 text-gray-400" />
        </button>
      </div>
      
      {/* タグリスト */}
      {isExpanded && (
        <div className="space-y-0.5">
          {displayTags().length > 0 ? (
            <>
              {displayTags().map(({ tag, level, hasChildren, isExpanded }) => (
                <TagItem
                  key={tag.id}
                  tag={tag}
                  level={level}
                  hasChildren={hasChildren}
                  isExpanded={isExpanded}
                  isSelected={selectedTagIds.includes(tag.id)}
                  isCollapsed={collapsed}
                  onToggleExpanded={handleToggleExpanded}
                  onSelectTag={onSelectTag}
                  onEditTag={handleEditTag}
                  onDeleteTag={handleDeleteTag}
                />
              ))}
              
            </>
          ) : (
            <div className="py-4 text-center">
              <TagIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                タグがありません
              </p>
              <button
                onClick={() => console.log('Create new tag')}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              >
                <PlusIcon className="w-3 h-3" />
                作成
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* タグ編集ダイアログ */}
      <TagEditDialog
        tag={editingTag}
        open={!!editingTag}
        onClose={() => setEditingTag(null)}
        onSave={handleSaveTag}
      />
    </div>
  )
}