'use client'

import { Badge } from '@/components/ui/badge'
import { TableCell } from '@/components/ui/table'
import { TicketTagSelectDialogEnhanced } from '@/features/tickets/components/shared/TicketTagSelectDialogEnhanced'
import { useEffect, useRef, useState } from 'react'

interface Tag {
  id: string
  name: string
  color?: string
}

interface TagsCellProps {
  /** 現在のタグ */
  tags?: Tag[]
  /** 列幅 */
  width?: number
  /** タグ変更時のコールバック */
  onTagsChange: (tagIds: string[]) => void
}

/**
 * タグ表示セル（TicketTagSelectDialogEnhanced使用）
 *
 * クリックでタグ選択ダイアログを開く
 * - 行クリックイベントの伝播を防止
 * - タグのカラー表示に対応
 *
 * @example
 * ```tsx
 * <TagsCell
 *   tags={item.tags}
 *   width={column?.width}
 *   onTagsChange={(tagIds) => updateTags(item.id, tagIds)}
 * />
 * ```
 */
export function TagsCell({ tags = [], width, onTagsChange }: TagsCellProps) {
  const [visibleCount, setVisibleCount] = useState(2)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedTagIds = tags.map((tag) => tag.id)

  // 列幅に応じて表示可能なタグ数を計算
  useEffect(() => {
    if (!width || tags.length === 0) return

    // 列幅から余白を引いた利用可能幅（パディング16px * 2）
    const availableWidth = width - 32

    // タグ1つあたりの平均幅を推定（文字数 * 7px + パディング20px + gap 4px）
    const estimateTagWidth = (tagName: string) => tagName.length * 7 + 24

    // "+N" バッジの幅（約30px）
    const moreTagWidth = 30

    let currentWidth = 0
    let count = 0

    for (let i = 0; i < tags.length; i++) {
      const tagWidth = estimateTagWidth(tags[i].name)
      const needsMoreTag = i < tags.length - 1

      if (currentWidth + tagWidth + (needsMoreTag ? moreTagWidth : 0) <= availableWidth) {
        currentWidth += tagWidth + 4 // gap
        count++
      } else {
        break
      }
    }

    setVisibleCount(Math.max(1, count))
  }, [width, tags])

  const style = width ? { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` } : undefined

  return (
    <TableCell
      onClick={(e) => e.stopPropagation()}
      className="group hover:bg-muted/50 cursor-pointer transition-colors"
      style={style}
    >
      <TicketTagSelectDialogEnhanced selectedTagIds={selectedTagIds} onTagsChange={onTagsChange}>
        <div ref={containerRef} className="flex gap-1 overflow-hidden">
          {tags.slice(0, visibleCount).map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="shrink-0 text-xs font-normal"
              style={
                tag.color
                  ? {
                      backgroundColor: `${tag.color}20`,
                      borderColor: tag.color,
                      color: tag.color,
                    }
                  : undefined
              }
            >
              {tag.name}
            </Badge>
          ))}
          {tags.length > visibleCount && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              +{tags.length - visibleCount}
            </Badge>
          )}
          {tags.length === 0 && <span className="text-muted-foreground text-xs">-</span>}
        </div>
      </TicketTagSelectDialogEnhanced>
    </TableCell>
  )
}
