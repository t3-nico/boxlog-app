'use client'

import { Badge } from '@/components/ui/badge'
import { useTags } from '@/features/tags/hooks/use-tags'
import { Plus, Tag, X } from 'lucide-react'

import { PlanTagSelectDialogEnhanced } from './PlanTagSelectDialogEnhanced'

interface PlanTagsSectionProps {
  selectedTagIds: string[]
  onTagsChange: (tagIds: string[]) => void
  onRemoveTag?: (tagId: string) => void
  showBorderTop?: boolean
  popoverAlign?: 'start' | 'center' | 'end'
  popoverSide?: 'top' | 'right' | 'bottom' | 'left'
  popoverAlignOffset?: number
  popoverSideOffset?: number
}

export function PlanTagsSection({
  selectedTagIds,
  onTagsChange,
  onRemoveTag,
  showBorderTop = false,
  popoverAlign,
  popoverSide,
  popoverAlignOffset,
  popoverSideOffset,
}: PlanTagsSectionProps) {
  // データベースからタグを取得
  const { data: allTags = [] } = useTags(true)

  const selectedTags = allTags.filter((tag) => selectedTagIds.includes(tag.id))

  return (
    <div className={`flex h-12 items-center px-6 py-2 ${showBorderTop ? 'border-border/50 border-t' : ''}`}>
      <div className="flex h-8 items-center">
        <Tag className="text-muted-foreground mr-2 h-4 w-4 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="bg-popover dark:bg-popover flex max-h-[5.25rem] flex-wrap items-center gap-2 overflow-y-auto pr-2">
            {/* 選択済みタグを表示 */}
            {selectedTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                style={{
                  borderColor: tag.color,
                }}
                className="group relative gap-0.5 pr-6 text-xs font-normal"
              >
                <span className="font-medium" style={{ color: tag.color }}>
                  #
                </span>
                {tag.name}
                {onRemoveTag && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveTag(tag.id)
                    }}
                    className="hover:bg-state-hover absolute top-1/2 right-1 -translate-y-1/2 rounded-sm opacity-70 transition-opacity hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}

            {/* タグ選択ダイアログ - 常に同じインスタンスを使用 */}
            <PlanTagSelectDialogEnhanced
              selectedTagIds={selectedTagIds}
              onTagsChange={onTagsChange}
              align={popoverAlign}
              side={popoverSide}
              alignOffset={popoverAlignOffset}
              sideOffset={popoverSideOffset}
            >
              {selectedTagIds.length === 0 ? (
                <button
                  type="button"
                  className="text-muted-foreground hover:bg-state-hover h-8 rounded-md px-2 text-sm transition-colors"
                >
                  タグを追加...
                </button>
              ) : (
                <button
                  type="button"
                  className="text-muted-foreground hover:bg-state-hover flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </PlanTagSelectDialogEnhanced>
          </div>
        </div>
      </div>
    </div>
  )
}
