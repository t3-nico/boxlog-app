'use client'

import React from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronDown, ChevronRight, Clock, Copy, Trash2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { text, colors, border } from '@/config/theme/colors'
import { heading, body } from '@/config/theme/typography'

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
  updateFormData: (field: string, value: any) => void
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
  updateFormData
}: EventDetailHeaderProps) => {
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60

  return (
    <div className={cn('p-6 border-b', border.universal)}>
      {/* Header controls */}
      <div className="flex items-start justify-between mb-4">
        <button
          onClick={onToggleDetail}
          className={cn(
            'flex items-center gap-2 transition-colors',
            colors.button.ghost.DEFAULT,
            'hover:' + colors.button.ghost.hover
          )}
        >
          {isDetailOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <span className={cn(heading.h6, text.primary)}>
            {isCreateMode ? 'New Event' : 'Event Details'}
          </span>
        </button>

        {!isCreateMode && (
          <div className="flex items-center gap-2">
            {onDuplicate && (
              <button
                onClick={onDuplicate}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  colors.button.ghost.DEFAULT,
                  'hover:' + colors.button.ghost.hover
                )}
                title="Duplicate event"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                )}
                title="Delete event"
              >
                <Trash2 className="w-4 h-4" />
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
            'w-full bg-transparent border-none outline-none resize-none',
            heading.h4,
            text.primary,
            'placeholder:' + text.muted
          )}
        />
      </div>

      {/* Time & Duration */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Clock className={cn('w-4 h-4', text.muted)} />
          <span className={text.primary}>
            {format(formData.startDate, 'M月d日(E) HH:mm', { locale: ja })}
            {formData.endDate && (
              <>
                <span className={text.muted}> - </span>
                {format(formData.endDate, 'HH:mm', { locale: ja })}
              </>
            )}
          </span>
        </div>

        {duration > 0 && (
          <div className={cn('text-xs px-2 py-1 rounded-full', colors.background.accent, text.muted)}>
            {hours > 0 ? `${hours}時間${minutes}分` : `${minutes}分`}
          </div>
        )}

        {/* Status indicators */}
        {isCompleted && (
          <div className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
            完了
          </div>
        )}
        {isPast && !isCompleted && (
          <div className="text-xs px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
            過去
          </div>
        )}
      </div>
    </div>
  )
}