'use client'

import { useDroppable } from '@dnd-kit/core'
import { Archive } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ArchiveDropZoneProps {
  isActive: boolean
  archivedTagsCount: number
  onClick: () => void
}

/**
 * アーカイブへのドロップゾーン
 */
export function ArchiveDropZone({ isActive, archivedTagsCount, onClick }: ArchiveDropZoneProps) {
  const t = useTranslations()
  const { setNodeRef, isOver } = useDroppable({
    id: 'drop-archive',
    data: {
      type: 'archive',
    },
  })

  return (
    <div
      ref={setNodeRef}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className={`hover:bg-state-hover flex w-full cursor-pointer items-center rounded-md px-2 py-2 text-sm transition-colors ${
        isActive ? 'bg-state-selected text-foreground' : 'text-muted-foreground'
      } ${isOver ? 'bg-primary-state-hover' : ''}`}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center">
            <Archive className="h-4 w-4" />
          </div>
          <span>{t('tags.sidebar.archive')}</span>
        </div>
        <span className="text-muted-foreground w-4 text-right text-xs tabular-nums">{archivedTagsCount}</span>
      </div>
    </div>
  )
}
