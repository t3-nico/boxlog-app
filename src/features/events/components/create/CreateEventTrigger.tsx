'use client'

import { useCallback } from 'react'

import { ChevronDown, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/features/i18n/lib/hooks'
import { cn } from '@/lib/utils'

import { useCreateModalStore } from '../../stores/useCreateModalStore'
import type { CreateEventRequest } from '../../types/events'

interface CreateEventTriggerProps {
  variant?: 'sidebar' | 'floating' | 'inline'
  className?: string
  initialData?: Partial<CreateEventRequest>
  source?: 'sidebar' | 'calendar' | 'table' | 'kanban'
}

export const CreateEventTrigger = ({
  variant = 'sidebar',
  className = '',
  initialData,
  source = 'sidebar',
}: CreateEventTriggerProps) => {
  const { t } = useI18n()
  const { openModal } = useCreateModalStore()

  const handleClick = useCallback(() => {
    openModal({
      initialData,
      context: {
        source,
      },
    })
  }, [openModal, initialData, source])

  // サイドバー用ボタン
  if (variant === 'sidebar') {
    return (
      <Button
        onClick={handleClick}
        className={cn(
          'bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground h-12 w-full rounded-md px-4 font-medium',
          'group flex items-center justify-between shadow-sm transition-all duration-200 hover:shadow-md',
          className
        )}
        title={t('calendar.event.createNewEvent')}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
            <Plus className="h-3 w-3" />
          </div>
          <span className="text-[15px] font-medium">Create</span>
        </div>
        <ChevronDown className="h-4 w-4 opacity-60 transition-opacity group-hover:opacity-80" />
      </Button>
    )
  }

  // フローティングアクションボタン
  if (variant === 'floating') {
    return (
      <Button
        onClick={handleClick}
        size="icon"
        className={cn(
          'bg-primary hover:bg-primary/90 fixed right-6 bottom-6 z-50 h-14 w-14 rounded-full shadow-lg',
          className
        )}
        title="Create new event (⌘N)"
      >
        <Plus className="h-6 w-6" />
      </Button>
    )
  }

  // インライン用ボタン
  return (
    <Button onClick={handleClick} variant="outline" className={cn(className)}>
      <Plus className="mr-2 h-4 w-4" />
      Create Event
    </Button>
  )
}
