// @ts-nocheck TODO(#389): 型エラー5件を段階的に修正する
'use client'

import { useCallback, useState } from 'react'

import {
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  MoreHorizontal as EllipsisHorizontalIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Pencil as PencilIcon,
  Plus as PlusIcon,
  Tag as TagIcon,
  Trash2 as TrashIcon,
} from 'lucide-react'

import { useTagStore } from '@/features/tags/stores/useTagStore'
import { useActiveState } from '@/hooks/useActiveState'
import { Tag } from '@/types/tags'
import { tagIconMapping, TagIconName } from '../constants/icons'

import { TagEditDialog } from './tag-edit-dialog'

interface TagsListProps {
  collapsed?: boolean
  onSelectTag?: (tagId: string) => void
  selectedTagIds?: string[]
}

interface TagItemProps {
  tag: Tag
  level: number
  isExpanded: boolean
  isSelected: boolean
  isCollapsed: boolean
  hasChildren: boolean
  onToggleExpanded: (tagId: string) => void
  onSelectTag: (tagId: string) => void
  onEditTag: (tag: Tag) => void
  onDeleteTag: (tag: Tag) => void
}

const TagItem = ({
  tag,
  level,
  isExpanded,
  isSelected: _isSelected,
  isCollapsed,
  hasChildren,
  onToggleExpanded,
  onSelectTag,
  onEditTag,
  onDeleteTag,
}: TagItemProps) => {
  const [showMenu, setShowMenu] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { isTagActive } = useActiveState()

  const isActive = isTagActive(tag.id)
  const paddingLeft = level === 0 ? 8 : level * 16 + 16 // 階層インデント調整（トップレベルにも8px追加）

  const handleToggleExpanded = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (hasChildren) {
        onToggleExpanded(tag.id)
      }
    },
    [hasChildren, onToggleExpanded, tag.id]
  )

  const handleSelectTag = useCallback(() => {
    onSelectTag(tag.id)
    setShowMenu(false)
  }, [onSelectTag, tag.id])

  // jsx-no-bind optimization handlers
  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleSelectTag()
      }
    },
    [handleSelectTag]
  )

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setShowMenu(!showMenu)
    },
    [showMenu]
  )

  const handleMenuButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setShowMenu(!showMenu)
    },
    [showMenu]
  )

  const handleEditTag = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onEditTag(tag)
      setShowMenu(false)
    },
    [onEditTag, tag]
  )

  const handleDeleteTag = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDeleteTag(tag)
      setShowMenu(false)
    },
    [onDeleteTag, tag]
  )

  return (
    <div className="space-y-2">
      {/* タグアイテム */}
      <div
        className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 transition-colors duration-150 hover:bg-neutral-100 dark:hover:bg-neutral-700"
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={handleSelectTag}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
        role="button"
        tabIndex={0}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* 展開/折りたたみアイコンまたはスペーサー */}
          <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
            {hasChildren === true && (
              <button
                type="button"
                onClick={handleToggleExpanded}
                className="tag-toggle-button z-10 rounded p-1 transition-colors"
                style={{ '--tag-color': tag.color || 'DEFAULT_TAG_COLOR' } as React.CSSProperties}
              >
                {isExpanded ? (
                  <ChevronDownIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                )}
              </button>
            )}
          </div>

          {/* タグアイコン */}
          {(() => {
            // 子タグを持つ場合はフォルダアイコン、それ以外は通常のタグアイコン
            const IconComponent = hasChildren
              ? isExpanded
                ? FolderOpenIcon
                : FolderIcon
              : tag.icon && tagIconMapping[tag.icon as TagIconName]
                ? tagIconMapping[tag.icon as TagIconName]
                : TagIcon
            return (
              <div
                className="relative"
                style={{ '--tag-color': tag.color || 'DEFAULT_TAG_COLOR' } as React.CSSProperties}
              >
                <IconComponent
                  className="tag-icon h-4 w-4 flex-shrink-0"
                  style={
                    {
                      color: tag.color || 'DEFAULT_TAG_COLOR',
                      '--tag-color': tag.color || 'DEFAULT_TAG_COLOR',
                    } as React.CSSProperties
                  }
                />
              </div>
            )
          })()}

          {/* タグ名 */}
          {!isCollapsed && (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100" title={tag.name}>
                {tag.name}
              </span>
              {/* アクティブドット */}
              {isActive ? <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div> : null}
            </div>
          )}
        </div>

        {/* メニュー */}
        {!isCollapsed && (
          <div className="relative">
            <button
              type="button"
              onClick={handleMenuButtonClick}
              className={`tag-menu-button rounded p-2 transition-all ${
                isHovered || showMenu ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ '--tag-color': tag.color || 'DEFAULT_TAG_COLOR' } as React.CSSProperties}
            >
              <EllipsisHorizontalIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </button>

            {/* コンテキストメニュー */}
            {showMenu != null && (
              <div className="absolute top-full right-0 z-50 mt-1 min-w-[140px] rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                <button
                  type="button"
                  onClick={handleEditTag}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  <PencilIcon className="h-4 w-4" />
                  編集
                </button>
                <button
                  type="button"
                  onClick={handleDeleteTag}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                >
                  <TrashIcon className="h-4 w-4" />
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

export const TagsList = ({ collapsed = false, onSelectTag = () => {}, selectedTagIds = [] }: TagsListProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Zustandストアからデータを取得
  const tags = useTagStore((state) => state.tags)
  // State management tracked in Issue #89
  const [expandedTags, setExpandedTags] = useState<string[]>([])
  const toggleTagExpansion = useCallback((tagId: string) => {
    setExpandedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }, [])

  // 表示するタグリストを計算（階層構造）
  const displayTags = useCallback(() => {
    const result: Array<{
      tag: Tag
      level: number
      hasChildren: boolean
      isExpanded: boolean
    }> = []

    const addTagsRecursively = (parentId: string | null, level: number = 0) => {
      const childTags = tags.filter((tag) => tag.parentId === parentId)

      childTags.forEach((tag) => {
        const hasChildren = tags.some((t) => t.parentId === tag.id)
        const isExpanded = expandedTags.includes(tag.id)

        result.push({
          tag,
          level,
          hasChildren,
          isExpanded,
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

  const handleToggleExpanded = useCallback(
    (tagId: string) => {
      toggleTagExpansion(tagId)
    },
    [toggleTagExpansion]
  )

  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const updateTag = useTagStore((state) => state.updateTag)
  const deleteTag = useTagStore((state) => state.deleteTag)

  const handleEditTag = useCallback((tag: Tag) => {
    setEditingTag(tag)
  }, [])

  const handleDeleteTag = useCallback(
    (tag: Tag) => {
      if (tag.count > 0) {
        alert('このタグは使用中のため削除できません。')
        return
      }
      if (confirm(`タグ「${tag.name}」を削除しますか？`)) {
        deleteTag(tag.id)
      }
    },
    [deleteTag]
  )

  const handleSaveTag = useCallback(
    (updatedTag: Partial<Tag>) => {
      updateTag(editingTag.id, {
        name: updatedTag.name,
        color: updatedTag.color,
        icon: updatedTag.icon,
      })
      setEditingTag(null)
    },
    [editingTag, updateTag]
  )

  // jsx-no-bind optimization handlers
  const handleToggleExpansion = useCallback(() => {
    setIsExpanded(!isExpanded)
  }, [isExpanded])

  const handleCreateNewTag = useCallback(() => {
    console.log('Create new tag')
  }, [])

  const handleCreateNewTagCollapsed = useCallback(() => {
    console.log('Create new tag')
  }, [])

  const handleCloseEditDialog = useCallback(() => {
    setEditingTag(null)
  }, [])

  if (collapsed) {
    return null
  }

  return (
    <div className="space-y-2">
      {/* セクションヘッダー */}
      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          onClick={handleToggleExpansion}
          className="section-header-toggle mb-2 flex items-center gap-1 rounded px-2 text-xs/6 font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
        >
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          )}
          {isExpanded ? (
            <FolderOpenIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          ) : (
            <FolderIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          )}
          <span>Tags</span>
        </button>

        <button
          type="button"
          onClick={handleCreateNewTag}
          className="section-header-button rounded p-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700"
        >
          <PlusIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
        </button>
      </div>

      {/* タグリスト */}
      {isExpanded === true && (
        <div className="space-y-2">
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
              <TagIcon className="mx-auto mb-2 h-6 w-6 text-neutral-600 dark:text-neutral-400" />
              <p className="mb-2 text-xs text-neutral-600 dark:text-neutral-400">タグがありません</p>
              <button
                type="button"
                onClick={handleCreateNewTagCollapsed}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-blue-700 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
              >
                <PlusIcon className="h-4 w-4" />
                作成
              </button>
            </div>
          )}
        </div>
      )}

      {/* タグ編集ダイアログ */}
      <TagEditDialog tag={editingTag} open={!!editingTag} onClose={handleCloseEditDialog} onSave={handleSaveTag} />
    </div>
  )
}
