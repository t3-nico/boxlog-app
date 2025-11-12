'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTagStore } from '@/features/tags/stores/useTagStore'
import { Plus, Tag, X } from 'lucide-react'

interface TicketTagsSectionProps {
  selectedTagIds: string[]
  onAddTag?: () => void
  onRemoveTag?: (tagId: string) => void
  showBorderTop?: boolean
}

export function TicketTagsSection({
  selectedTagIds,
  onAddTag,
  onRemoveTag,
  showBorderTop = false,
}: TicketTagsSectionProps) {
  const { getAllTags } = useTagStore()
  const allTags = getAllTags()
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
              <button
                onClick={() => {
                  onAddTag?.()
                }}
                type="button"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                タグを追加...
              </button>
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => {
                    onAddTag?.()
                  }}
                  type="button"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
