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

  // プロパティグリッド: ラベル幅を統一（PlanScheduleSectionと同じ）
  const labelClassName = 'text-muted-foreground flex h-8 w-24 flex-shrink-0 items-center text-sm'
  const valueClassName = 'flex h-8 flex-1 items-center'

  return (
    <div className={`flex min-h-10 items-start px-6 py-1 ${showBorderTop ? 'border-border/50 border-t' : ''}`}>
      <div className={labelClassName}>
        <Tag className="mr-2 h-4 w-4 flex-shrink-0" />
        タグ
      </div>
      <div className={valueClassName}>
        <div className="flex max-h-[5.25rem] flex-wrap items-center gap-1.5 overflow-y-auto">
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

          {/* タグ選択ダイアログ */}
          <PlanTagSelectDialogEnhanced
            selectedTagIds={selectedTagIds}
            onTagsChange={onTagsChange}
            align={popoverAlign}
            side={popoverSide}
            alignOffset={popoverAlignOffset}
            sideOffset={popoverSideOffset}
          >
            {selectedTagIds.length === 0 ? (
              <button type="button" className="text-muted-foreground h-7 rounded-md pr-2 pl-0 text-sm">
                タグを追加...
              </button>
            ) : (
              <button
                type="button"
                className="text-muted-foreground flex h-7 w-7 items-center justify-center rounded-md"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </PlanTagSelectDialogEnhanced>
        </div>
      </div>
    </div>
  )
}
