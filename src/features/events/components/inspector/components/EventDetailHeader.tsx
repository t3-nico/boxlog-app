'use client'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronDown, ChevronRight, Clock, Copy, Trash2 } from 'lucide-react'

import { border, colors, text } from '@/config/theme/colors'
import { heading } from '@/config/theme/typography'
import { cn } from '@/lib/utils'

import type { EventDetailInspectorData } from '../hooks/useEventDetailInspector'

interface EventDetailHeaderProps {
  formData: {
    title: string
    startDate: Date
    endDate?: Date | null
  }
  duration: number
  isDetailOpen: boolean
  isCreateMode: boolean
  isCompleted: boolean
  isPast: boolean
  onToggleDetail: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  updateFormData: <K extends keyof EventDetailInspectorData>(field: K, value: EventDetailInspectorData[K]) => void
}

export const EventDetailHeader = ({
  formData,
  duration,
  isDetailOpen,
  isCreateMode,
  isCompleted,
  isPast,
  onToggleDetail,
  onDuplicate,
  onDelete,
  updateFormData,
}: EventDetailHeaderProps) => {
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60

  return (
    <div className={cn('border-b p-6', border.universal)}>
      {/* Header controls */}
      <div className="mb-4 flex items-start justify-between">
        <button
          type="button"
          onClick={onToggleDetail}
          className={cn(
            'flex items-center gap-2 transition-colors',
            colors.button.ghost.DEFAULT,
            'hover:' + colors.button.ghost.hover
          )}
        >
          {isDetailOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className={cn(heading.h6, text.primary)}>{isCreateMode ? 'New Event' : 'Event Details'}</span>
        </button>

        {!isCreateMode && (
          <div className="flex items-center gap-2">
            {onDuplicate != null && (
              <button
                type="button"
                onClick={onDuplicate}
                className={cn(
                  'rounded-lg p-2 transition-colors',
                  colors.button.ghost.DEFAULT,
                  'hover:' + colors.button.ghost.hover
                )}
                title="Duplicate event"
              >
                <Copy className="h-4 w-4" />
              </button>
            )}
            {onDelete != null && (
              <button
                type="button"
                onClick={onDelete}
                className={cn(
                  'rounded-lg p-2 transition-colors',
                  'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                )}
                title="Delete event"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <div className="mb-4">
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          placeholder="Event title"
          className={cn(
            'w-full resize-none border-none bg-transparent outline-none',
            heading.h4,
            text.primary,
            'placeholder:' + text.muted
          )}
        />
      </div>

      {/* Time & Duration */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Clock className={cn('h-4 w-4', text.muted)} />
          <span className={text.primary}>
            {format(formData.startDate, 'M月d日(E) HH:mm', { locale: ja })}
            {formData.endDate != null && (
              <>
                <span className={text.muted}> - </span>
                {format(formData.endDate, 'HH:mm', { locale: ja })}
              </>
            )}
          </span>
        </div>

        {duration > 0 && (
          <div className={cn('rounded-full px-2 py-1 text-xs', colors.background.accent, text.muted)}>
            {hours > 0 ? `${hours}時間${minutes}分` : `${minutes}分`}
          </div>
        )}

        {/* Status indicators */}
        {isCompleted === true && (
          <div className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-600 dark:bg-green-900/20 dark:text-green-400">
            完了
          </div>
        )}
        {isPast && !isCompleted && (
          <div className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
            過去
          </div>
        )}
      </div>
    </div>
  )
}
