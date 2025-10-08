'use client'

import { useCallback } from 'react'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronDown, ChevronRight, Clock, Copy, Trash2 } from 'lucide-react'

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

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateFormData('title', e.target.value)
    },
    [updateFormData]
  )

  return (
    <div className="border-b border-neutral-300 p-6 dark:border-neutral-700">
      {/* Header controls */}
      <div className="mb-4 flex items-start justify-between">
        <button
          type="button"
          onClick={onToggleDetail}
          className="flex items-center gap-2 text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
        >
          {isDetailOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="text-base font-medium text-neutral-900 dark:text-neutral-50">
            {isCreateMode ? 'New Event' : 'Event Details'}
          </span>
        </button>

        {!isCreateMode && (
          <div className="flex items-center gap-2">
            {onDuplicate != null && (
              <button
                type="button"
                onClick={onDuplicate}
                className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
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
          onChange={handleTitleChange}
          placeholder="Event title"
          className="w-full resize-none border-none bg-transparent text-lg font-semibold text-neutral-900 outline-none placeholder:text-neutral-600 dark:text-neutral-50 dark:placeholder:text-neutral-400"
        />
      </div>

      {/* Time & Duration */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          <span className="text-neutral-900 dark:text-neutral-50">
            {format(formData.startDate, 'M月d日(E) HH:mm', { locale: ja })}
            {formData.endDate != null && (
              <>
                <span className="text-neutral-600 dark:text-neutral-400"> - </span>
                {format(formData.endDate, 'HH:mm', { locale: ja })}
              </>
            )}
          </span>
        </div>

        {duration > 0 && (
          <div className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
            {hours > 0 ? `${hours}時間${minutes}分` : `${minutes}分`}
          </div>
        )}

        {/* Status indicators */}
        {isCompleted === true && (
          <div className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-600 dark:bg-green-900/20 dark:text-green-400">
            完了
          </div>
        )}
        {isPast && !isCompleted ? (
          <div className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
            過去
          </div>
        ) : null}
      </div>
    </div>
  )
}
