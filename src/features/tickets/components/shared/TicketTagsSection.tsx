'use client'

import { Badge } from '@/components/ui/badge'
import { useTags } from '@/features/tags/hooks/use-tags'
import { Tag as TagType } from '@/types/unified'
import { Plus, Tag, X } from 'lucide-react'
import { TicketTagSelectPopover } from './TicketTagSelectPopover'

interface TicketTagsSectionProps {
  selectedTagIds: string[]
  onTagsChange: (tagIds: string[]) => void
  onRemoveTag?: (tagId: string) => void
  showBorderTop?: boolean
}

export function TicketTagsSection({
  selectedTagIds,
  onTagsChange,
  onRemoveTag,
  showBorderTop = false,
}: TicketTagsSectionProps) {
  // データベースからタグを取得
  const { data: tagsData } = useTags(true)

  // TagWithChildren[] を Tag[] に変換（階層を平坦化）
  const flattenTags = (tags: typeof tagsData): TagType[] => {
    if (!tags) return []
    const result: TagType[] = []
    const flatten = (tagList: typeof tagsData) => {
      if (!tagList) return
      tagList.forEach((tag) => {
        result.push(tag)
        if (tag.children && tag.children.length > 0) {
          flatten(tag.children)
        }
      })
    }
    flatten(tags)
    return result
  }

  const allTags = flattenTags(tagsData)
  const selectedTags = allTags.filter((tag) => selectedTagIds.includes(tag.id))

  return (
    <div className={`px-6 py-4 ${showBorderTop ? 'border-border/50 border-t' : ''}`}>
      <div className="flex items-start gap-2">
        <Tag className="text-muted-foreground mt-1 h-4 w-4 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div
            className="bg-card dark:bg-card flex max-h-[5.25rem] flex-wrap items-center gap-2 overflow-y-auto pr-2"
            style={{
              scrollbarColor: 'var(--color-muted-foreground) var(--color-card)',
            }}
          >
            {selectedTagIds.length === 0 ? (
              <TicketTagSelectPopover selectedTagIds={selectedTagIds} onTagsChange={onTagsChange}>
                <button type="button" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  タグを追加...
                </button>
              </TicketTagSelectPopover>
            ) : (
              <>
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      borderColor: tag.color,
                      color: tag.color,
                    }}
                    className="group relative pr-6"
                  >
                    {tag.name}
                    {onRemoveTag && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemoveTag(tag.id)
                        }}
                        className="hover:bg-background/20 absolute top-1/2 right-1 -translate-y-1/2 rounded-sm opacity-70 transition-opacity hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
                <TicketTagSelectPopover selectedTagIds={selectedTagIds} onTagsChange={onTagsChange}>
                  <button type="button" className="hover:bg-accent flex h-6 w-6 items-center justify-center rounded">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </TicketTagSelectPopover>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
