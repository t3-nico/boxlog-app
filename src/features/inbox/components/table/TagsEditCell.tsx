import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TableCell } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'
import { useState } from 'react'

interface Tag {
  id: string
  name: string
}

interface TagsEditCellProps {
  /** 現在のタグ */
  tags?: Tag[]
  /** 列幅 */
  width?: number
  /** タグ変更時のコールバック */
  onTagsChange: (tags: Tag[]) => void
  /** 利用可能なタグ一覧 */
  availableTags?: Tag[]
}

/**
 * タグ編集可能セル
 *
 * クリックでポップオーバーを開き、タグを追加・削除可能
 * - ホバーで編集可能であることを示す
 * - クリックでタグ選択UI表示
 * - 行クリックイベントの伝播を防止
 *
 * @example
 * ```tsx
 * <TagsEditCell
 *   tags={item.tags}
 *   width={column?.width}
 *   availableTags={allTags}
 *   onTagsChange={(newTags) => updateTags(item.id, newTags)}
 * />
 * ```
 */
export function TagsEditCell({ tags = [], width, onTagsChange, availableTags = [] }: TagsEditCellProps) {
  const [open, setOpen] = useState(false)

  const handleTagToggle = (tag: Tag) => {
    const isSelected = tags.some((t) => t.id === tag.id)
    if (isSelected) {
      onTagsChange(tags.filter((t) => t.id !== tag.id))
    } else {
      onTagsChange([...tags, tag])
    }
  }

  const handleRemoveTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onTagsChange(tags.filter((t) => t.id !== tagId))
  }

  const style = width ? { width: `${width}px` } : undefined

  return (
    <TableCell
      onClick={(e) => e.stopPropagation()}
      className="group hover:bg-muted/50 cursor-pointer transition-colors"
      style={style}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="flex gap-1">
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{tags.length - 2}
              </Badge>
            )}
            {tags.length === 0 && <span className="text-muted-foreground text-xs">-</span>}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            {/* 選択中のタグ */}
            {tags.length > 0 && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-medium">選択中</p>
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="gap-1 text-xs">
                      {tag.name}
                      <button
                        type="button"
                        onClick={(e) => handleRemoveTag(tag.id, e)}
                        className="hover:bg-muted ml-1 rounded-full"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 利用可能なタグ */}
            {availableTags.length > 0 && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-medium">タグを追加</p>
                <div className="space-y-1">
                  {availableTags.map((tag) => {
                    const isSelected = tags.some((t) => t.id === tag.id)
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={cn(
                          'hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors',
                          isSelected && 'bg-accent'
                        )}
                      >
                        <div className="flex size-4 items-center justify-center">
                          {isSelected && <Check className="size-4" />}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {tag.name}
                        </Badge>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {availableTags.length === 0 && (
              <p className="text-muted-foreground text-center text-xs">タグがありません</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </TableCell>
  )
}
