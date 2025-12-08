'use client'

import { useCallback, useState } from 'react'

import { ChevronDown as ChevronDownIcon, Filter as FunnelIcon, Tag as TagIcon, X as XMarkIcon } from 'lucide-react'

import { useTags } from '@/features/tags/hooks/use-tags'
import type { TagWithChildren } from '@/features/tags/types'
import { useTranslations } from 'next-intl'

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
        className={`hover:bg-state-hover flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors`}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleToggle}
          className="border-border text-primary focus:ring-primary rounded"
        />
        <TagIcon className="h-4 w-4 flex-shrink-0" style={{ color: tag.color }} />
        <span className="flex-1 truncate">{tag.name}</span>
        {tag.path && level > 0 ? <span className="text-muted-foreground truncate text-xs">{tag.path}</span> : null}
      </label>

      {/* 子タグ */}
      {tag.children && tag.children.length > 0 ? (
        <div>
          {tag.children.map((child) => (
            <TagFilterItem key={child.id} tag={child} level={level + 1} isSelected={isSelected} onToggle={onToggle} />
          ))}
        </div>
      ) : null}
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
  const t = useTranslations()
  // Use a simple local state for tag filtering for now
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const toggleTag = useCallback((tagId: string) => {
    setSelectedTagIds((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }, [])
  const clearTags = useCallback(() => setSelectedTagIds([]), [])
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

  const createRemoveTagHandler = useCallback(
    (tagId: string) => {
      return (e: React.MouseEvent) => {
        e.stopPropagation()
        toggleTag(tagId)
      }
    },
    [toggleTag]
  )

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
        className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
          hasTagFilters
            ? 'border-primary/30 bg-primary/10 text-primary'
            : 'border-border hover:border-border bg-card text-foreground'
        }`}
      >
        <FunnelIcon className="h-4 w-4" />
        {showTitle ? <span className={compact ? 'hidden sm:inline' : ''}>Tags</span> : null}
        {showSelectedCount && selectedTagIds.length > 0 ? (
          <span className="bg-surface-container text-muted-foreground rounded px-2 py-1 text-xs">
            {selectedTagIds.length}
          </span>
        ) : null}
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 選択されたタグバッジ（コンパクトモードでない場合） */}
      {!compact && selectedTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium"
            >
              <TagIcon className="h-4 w-4" style={{ color: tag.color }} />
              {tag.name}
              <button
                type="button"
                onClick={createRemoveTagHandler(tag.id)}
                className="text-primary/70 hover:text-primary ml-1"
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
            aria-label={t('aria.closeFilterMenu')}
          />

          {/* メニュー */}
          <div className="border-border bg-popover text-popover-foreground absolute z-50 mt-1 max-h-96 w-80 overflow-hidden rounded-md border shadow-lg">
            {/* ヘッダー */}
            <div className="border-border flex items-center justify-between border-b p-3">
              <h3 className="text-foreground text-sm font-medium">Filter by Tags</h3>
              {hasTagFilters === true && (
                <button type="button" onClick={clearTags} className="text-primary hover:text-primary/80 text-xs">
                  Clear all
                </button>
              )}
            </div>

            {/* タグリスト */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2"></div>
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
                <div className="text-muted-foreground flex flex-col items-center justify-center py-8">
                  <TagIcon className="mb-2 h-8 w-8" />
                  <p className="text-sm">No tags available</p>
                </div>
              )}
            </div>

            {/* フッター */}
            {hasTagFilters === true && (
              <div className="border-border bg-surface-container border-t p-3">
                <p className="text-muted-foreground text-xs">
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
          ? 'border-primary/30 bg-primary/10 text-primary border'
          : 'border-border bg-surface-container text-foreground hover:bg-state-hover border'
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
