'use client'

import { useCallback, useState } from 'react'

import { ChevronDown as ChevronDownIcon, Filter as FunnelIcon, Tag as TagIcon, X as XMarkIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useTags } from '@/features/tags/hooks/use-tags'
import type { Tag } from '@/features/tags/types'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface TagFilterProps {
  showTitle?: boolean
  showSelectedCount?: boolean
  compact?: boolean
  className?: string
}

interface TagFilterItemProps {
  tag: Tag
  isSelected: boolean
  onToggle: (tagId: string) => void
}

const TagFilterItem = ({ tag, isSelected, onToggle }: TagFilterItemProps) => {
  // jsx-no-bind optimization: Toggle handler
  const handleCheckedChange = useCallback(() => {
    onToggle(tag.id)
  }, [onToggle, tag.id])

  return (
    <label className="hover:bg-state-hover flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors">
      <Checkbox checked={isSelected} onCheckedChange={handleCheckedChange} />
      <TagIcon className="h-4 w-4 flex-shrink-0" style={{ color: tag.color }} />
      <span className="flex-1 truncate">{tag.name}</span>
    </label>
  )
}

export const TagFilter = ({
  showTitle = true,
  showSelectedCount = true,
  compact = false,
  className = '',
}: TagFilterProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { data: allTags = [], isPending } = useTags(true)
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

  return (
    <div className={`relative ${className}`}>
      {/* フィルターボタン */}
      <Button
        type="button"
        variant="outline"
        onClick={handleToggleOpen}
        className={cn(hasTagFilters && 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20')}
      >
        <FunnelIcon className="h-4 w-4" />
        {showTitle ? <span className={compact ? 'hidden sm:inline' : ''}>Tags</span> : null}
        {showSelectedCount && selectedTagIds.length > 0 ? (
          <span className="bg-surface-container text-muted-foreground rounded px-2 py-1 text-xs">
            {selectedTagIds.length}
          </span>
        ) : null}
        <ChevronDownIcon className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </Button>

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
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={createRemoveTagHandler(tag.id)}
                className="text-primary/70 hover:text-primary ml-1 size-4 hover:bg-transparent"
                aria-label={`Remove ${tag.name} filter`}
              >
                <XMarkIcon className="h-3 w-3" />
              </Button>
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
                <Button type="button" variant="text" size="sm" onClick={clearTags} className="h-auto p-0 text-xs">
                  Clear all
                </Button>
              )}
            </div>

            {/* タグリスト */}
            <div className="max-h-80 overflow-y-auto">
              {isPending ? (
                <div className="flex items-center justify-center py-8">
                  <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2"></div>
                </div>
              ) : allTags.length > 0 ? (
                <div className="py-2">
                  {allTags.map((tag) => (
                    <TagFilterItem
                      key={tag.id}
                      tag={tag}
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
  tag: Tag
  isSelected: boolean
  onToggle: (tagId: string) => void
}

export const TagChip = ({ tag, isSelected, onToggle }: TagChipProps) => {
  // jsx-no-bind optimization: Toggle handler
  const handleToggle = useCallback(() => {
    onToggle(tag.id)
  }, [onToggle, tag.id])

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className={cn(
        'h-auto px-2 py-1 text-xs font-medium',
        isSelected ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20' : 'bg-surface-container'
      )}
    >
      <TagIcon className="h-4 w-4" style={{ color: tag.color }} />
      {tag.name}
    </Button>
  )
}

/**
 * 横並びタグフィルター（チップ形式）
 */
export const TagFilterChips = ({ className = '' }: { className?: string }) => {
  const { data: allTags = [], isPending } = useTags(true)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  // 使用頻度が高いタグを表示（最大10個）
  const popularTags = allTags.slice(0, 10)

  if (isPending || popularTags.length === 0) {
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
