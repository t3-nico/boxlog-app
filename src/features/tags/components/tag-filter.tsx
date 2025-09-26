'use client'

import { useCallback, useState } from 'react'

import { ChevronDown as ChevronDownIcon, Filter as FunnelIcon, Tag as TagIcon, X as XMarkIcon } from 'lucide-react'

import { useTags } from '@/features/tags/hooks/use-tags'
import type { TagWithChildren } from '@/types/tags'

interface TagFilterProps {
  showTitle?: boolean
  showSelectedCount?: boolean
  compact?: boolean
  className?: string
}

interface TagFilterItemProps {
  tag: TagWithChildren
  level: number
  isSelected: boolean
  onToggle: (tagId: string) => void
}

const TagFilterItem = ({ tag, level, isSelected, onToggle }: TagFilterItemProps) => {
  const paddingLeft = level * 16 + 8

  // jsx-no-bind optimization: Toggle handler
  const handleToggle = useCallback(() => {
    onToggle(tag.id)
  }, [onToggle, tag.id])

  return (
    <div>
      <label
        className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700`}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleToggle}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <TagIcon className="h-4 w-4 flex-shrink-0" style={{ color: tag.color }} />
        <span className="flex-1 truncate">{tag.name}</span>
        {tag.path && level > 0 ? <span className="truncate text-xs text-gray-500 dark:text-gray-400">{tag.path}</span> : null}
      </label>

      {/* 子タグ */}
      {tag.children && tag.children.length > 0 ? <div>
          {tag.children.map((child) => (
            <TagFilterItem key={child.id} tag={child} level={level + 1} isSelected={isSelected} onToggle={onToggle} />
          ))}
        </div> : null}
    </div>
  )
}

export const TagFilter = ({
  showTitle = true,
  showSelectedCount = true,
  compact = false,
  className = '',
}: TagFilterProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { data: allTags = [], isLoading } = useTags(true)
  // Use a simple local state for tag filtering for now
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }
  const clearTags = () => setSelectedTagIds([])
  const hasTagFilters = selectedTagIds.length > 0

  // jsx-no-bind optimization: Event handlers
  const handleToggleOpen = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen])

  const handleCloseModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false)
  }, [])

  const createRemoveTagHandler = useCallback((tagId: string) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation()
      toggleTag(tagId)
    }
  }, [toggleTag])

  // 選択されたタグ
  const selectedTags = allTags.filter((tag) => selectedTagIds.includes(tag.id))

  // トップレベルタグのみ表示
  const topLevelTags = allTags.filter((tag) => tag.level === 0)

  return (
    <div className={`relative ${className}`}>
      {/* フィルターボタン */}
      <button
        type="button"
        onClick={handleToggleOpen}
        className={`flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors dark:border-gray-600 ${
          hasTagFilters
            ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-300'
            : 'bg-white text-gray-700 hover:border-gray-400 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-500'
        }`}
      >
        <FunnelIcon className="h-4 w-4" />
        {showTitle ? <span className={compact ? 'hidden sm:inline' : ''}>Tags</span> : null}
        {showSelectedCount && selectedTagIds.length > 0 ? <span className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            {selectedTagIds.length}
          </span> : null}
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 選択されたタグバッジ（コンパクトモードでない場合） */}
      {!compact && selectedTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            >
              <TagIcon className="h-4 w-4" style={{ color: tag.color }} />
              {tag.name}
              <button
                type="button"
                onClick={createRemoveTagHandler(tag.id)}
                className="ml-1 text-blue-500 hover:text-blue-700 dark:hover:text-blue-200"
                aria-label={`Remove ${tag.name} filter`}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ドロップダウンメニュー */}
      {isOpen === true && (
        <>
          {/* オーバーレイ */}
          <div
            role="button"
            tabIndex={0}
            className="fixed inset-0 z-40"
            onClick={handleCloseModal}
            onKeyDown={handleKeyDown}
            aria-label="フィルターメニューを閉じる"
          />

          {/* メニュー */}
          <div className="absolute z-50 mt-1 max-h-96 w-80 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
            {/* ヘッダー */}
            <div className="flex items-center justify-between border-b border-gray-200 p-3 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Filter by Tags</h3>
              {hasTagFilters === true && (
                <button
                  type="button"
                  onClick={clearTags}
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* タグリスト */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                </div>
              ) : topLevelTags.length > 0 ? (
                <div className="py-2">
                  {topLevelTags.map((tag) => (
                    <TagFilterItem
                      key={tag.id}
                      tag={tag}
                      level={0}
                      isSelected={selectedTagIds.includes(tag.id)}
                      onToggle={toggleTag}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                  <TagIcon className="mb-2 h-8 w-8" />
                  <p className="text-sm">No tags available</p>
                </div>
              )}
            </div>

            {/* フッター */}
            {hasTagFilters === true && (
              <div className="border-t border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {selectedTagIds.length} tag{selectedTagIds.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/**
 * シンプルなタグ選択チップ
 */
interface TagChipProps {
  tag: TagWithChildren
  isSelected: boolean
  onToggle: (tagId: string) => void
}

export const TagChip = ({ tag, isSelected, onToggle }: TagChipProps) => {
  // jsx-no-bind optimization: Toggle handler
  const handleToggle = useCallback(() => {
    onToggle(tag.id)
  }, [onToggle, tag.id])

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
        isSelected
          ? 'border border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
          : 'border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
    >
      <TagIcon className="h-4 w-4" style={{ color: tag.color }} />
      {tag.name}
    </button>
  )
}

/**
 * 横並びタグフィルター（チップ形式）
 */
export const TagFilterChips = ({ className = '' }: { className?: string }) => {
  const { data: allTags = [], isLoading } = useTags(true)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  // 使用頻度が高いタグを表示（最大10個）
  const popularTags = allTags
    .filter((tag) => tag.level === 0) // トップレベルのみ
    .slice(0, 10)

  if (isLoading || popularTags.length === 0) {
    return null
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {popularTags.map((tag) => (
        <TagChip key={tag.id} tag={tag} isSelected={selectedTagIds.includes(tag.id)} onToggle={toggleTag} />
      ))}
    </div>
  )
}
