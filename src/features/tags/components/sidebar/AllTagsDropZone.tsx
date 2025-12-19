'use client'

import { useDroppable } from '@dnd-kit/core'
import { Tags } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface AllTagsDropZoneProps {
  isActive: boolean
  activeTagsCount: number
  onClick: () => void
}

/**
 * すべてのタグへのドロップゾーン（アーカイブから復元用）
 */
export function AllTagsDropZone({ isActive, activeTagsCount, onClick }: AllTagsDropZoneProps) {
  const t = useTranslations()
  const { setNodeRef, isOver } = useDroppable({
    id: 'drop-all-tags',
    data: {
      type: 'restore',
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
            <Tags className="h-4 w-4" />
          </div>
          <span>{t('tags.sidebar.allTags')}</span>
        </div>
        <span className="text-muted-foreground w-4 text-right text-xs tabular-nums">{activeTagsCount}</span>
      </div>
    </div>
  )
}
