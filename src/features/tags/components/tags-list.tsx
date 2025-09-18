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

import { colors } from '@/config/theme'
import { tagIconMapping, TagIconName } from '@/config/ui/tagIcons'
import { useTagStore } from '@/features/tags/stores/tag-store'
import { useActiveState } from '@/hooks/useActiveState'
import { Tag } from '@/types/tags'

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

  return (
    <div className="space-y-2">
      {/* タグアイテム */}
      <div
        className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 ${colors.ghost.hover} transition-colors duration-150`}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={handleSelectTag}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleSelectTag()
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onContextMenu={(e) => {
          e.preventDefault()
          setShowMenu(!showMenu)
        }}
        role="button"
        tabIndex={0}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* 展開/折りたたみアイコンまたはスペーサー */}
          <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
            {hasChildren && (
              <button
                type="button"
                onClick={handleToggleExpanded}
                className="tag-toggle-button z-10 rounded p-1 transition-colors"
                style={{ '--tag-color': tag.color || 'DEFAULT_TAG_COLOR' } as React.CSSProperties}
              >
                {isExpanded ? (
                  <ChevronDownIcon className={`h-4 w-4 ${colors.text.muted}`} />
                ) : (
                  <ChevronRightIcon className={`h-4 w-4 ${colors.text.muted}`} />
                )}
              </button>
            )}
          </div>

          {/* タグアイコン */}
          {(() => {
            const IconComponent =
              tag.icon && tagIconMapping[tag.icon as TagIconName] ? tagIconMapping[tag.icon as TagIconName] : TagIcon
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
              <span className={`truncate text-sm font-medium ${colors.text.primary}`} title={tag.name}>
                {tag.name}
              </span>
              {/* アクティブドット */}
              {isActive && <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>}
            </div>
          )}
        </div>

        {/* メニュー */}
        {!isCollapsed && (
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className={`tag-menu-button rounded p-2 transition-all ${
                isHovered || showMenu ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ '--tag-color': tag.color || 'DEFAULT_TAG_COLOR' } as React.CSSProperties}
            >
              <EllipsisHorizontalIcon className={`h-4 w-4 ${colors.text.muted}`} />
            </button>

            {/* コンテキストメニュー */}
            {showMenu && (
              <div
                className={`absolute right-0 top-full mt-1 ${colors.background.surface} ${colors.border.DEFAULT} z-50 min-w-[140px] rounded-lg py-1 shadow-lg`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditTag(tag)
                    setShowMenu(false)
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm ${colors.text.secondary} ${colors.ghost.hover} transition-colors`}
                >
                  <PencilIcon className="h-4 w-4" />
                  編集
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteTag(tag)
                    setShowMenu(false)
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm ${colors.semantic.error.text} ${colors.semantic.error.hover} transition-colors`}
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

  if (collapsed) {
    return null
  }

  return (
    <div className="space-y-2">
      {/* セクションヘッダー */}
      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`section-header-toggle mb-2 flex items-center px-2 text-xs/6 font-medium ${colors.text.muted} ${colors.ghost.hover} rounded transition-colors`}
        >
          <span className="peer">Tags</span>
          <span className="ml-1 opacity-0 transition-opacity peer-hover:opacity-100">
            {isExpanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
          </span>
        </button>

        <button
          type="button"
          onClick={() => console.log('Create new tag')}
          className={`section-header-button p-1 ${colors.ghost.hover} rounded transition-colors`}
        >
          <PlusIcon className={`h-4 w-4 ${colors.text.muted}`} />
        </button>
      </div>

      {/* タグリスト */}
      {isExpanded && (
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
              <TagIcon className={`h-6 w-6 ${colors.text.muted} mx-auto mb-2`} />
              <p className={`text-xs ${colors.text.muted} mb-2`}>タグがありません</p>
              <button
                type="button"
                onClick={() => console.log('Create new tag')}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs ${colors.semantic.info.text} ${colors.selection.hover} rounded transition-colors`}
              >
                <PlusIcon className="h-4 w-4" />
                作成
              </button>
            </div>
          )}
        </div>
      )}

      {/* タグ編集ダイアログ */}
      <TagEditDialog tag={editingTag} open={!!editingTag} onClose={() => setEditingTag(null)} onSave={handleSaveTag} />
    </div>
  )
}
