'use client'

import React, { useCallback } from 'react'

import { Plus, ChevronDown } from 'lucide-react'

import { Button } from '@/components/shadcn-ui/button'
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
  source = 'sidebar'
}: CreateEventTriggerProps) => {
  const { openModal } = useCreateModalStore()

  const handleClick = useCallback(() => {
    openModal({
      initialData,
      context: {
        source
      }
    })
  }, [openModal, initialData, source])
  
  // サイドバー用ボタン
  if (variant === 'sidebar') {
    return (
      <Button
        onClick={handleClick}
        className={cn(
          "h-12 w-full bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground font-medium px-4 rounded-md",
          "shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group",
          className
        )}
        title="Create new event"
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <Plus className="w-3 h-3" />
          </div>
          <span className="text-[15px] font-medium">Create</span>
        </div>
        <ChevronDown className="w-4 h-4 opacity-60 group-hover:opacity-80 transition-opacity" />
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
          "fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary hover:bg-primary/90 rounded-full shadow-lg",
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
    <Button
      onClick={handleClick}
      variant="outline"
      className={cn(className)}
    >
      <Plus className="h-4 w-4 mr-2" />
      Create Event
    </Button>
  )
}