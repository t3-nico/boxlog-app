'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Tag } from 'lucide-react'

interface TicketTagsSectionProps {
  selectedTagIds: string[]
  onAddTag?: () => void
  showBorderTop?: boolean
}

export function TicketTagsSection({ selectedTagIds, onAddTag, showBorderTop = false }: TicketTagsSectionProps) {
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
                {selectedTagIds.map((tagId) => (
                  <Badge key={tagId} variant="outline">
                    {tagId}
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
