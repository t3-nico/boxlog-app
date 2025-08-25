'use client'

import React from 'react'
import { Plus, Calendar, ChevronDown } from 'lucide-react'
import { Button } from '@/components/shadcn-ui/button'
import { useCreateModalStore } from '../../stores/useCreateModalStore'
import { primary, text } from '@/config/theme/colors'
import { body } from '@/config/theme/typography'
import { icon } from '@/config/theme/icons'
import { rounded } from '@/config/theme/rounded'
import { elevation } from '@/config/theme/elevation'
import type { CreateEventRequest } from '../../types/events'

interface CreateEventTriggerProps {
  variant?: 'sidebar' | 'floating' | 'inline'
  className?: string
  initialData?: Partial<CreateEventRequest>
  source?: 'sidebar' | 'calendar' | 'table' | 'kanban'
}

export function CreateEventTrigger({
  variant = 'sidebar',
  className = '',
  initialData,
  source = 'sidebar'
}: CreateEventTriggerProps) {
  const { openModal } = useCreateModalStore()
  
  const handleClick = () => {
    openModal({
      initialData,
      context: {
        source
      }
    })
  }
  
  // サイドバー用ボタン
  if (variant === 'sidebar') {
    return (
      <Button
        onClick={handleClick}
        className={`
          h-12 w-full
          ${primary.DEFAULT} ${primary.hover} ${primary.active}
          ${primary.text} font-medium
          px-4
          ${rounded.component.button.md}
          shadow-sm hover:shadow-md
          transition-all duration-200
          flex items-center justify-between
          group
          ${className}
        `}
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
        className={`
          fixed bottom-6 right-6 z-50
          w-14 h-14
          ${primary.DEFAULT} ${primary.hover}
          ${rounded.radius.full}
          ${elevation.lg}
          ${className}
        `}
        title="Create new event (⌘N)"
      >
        <Plus className={`${icon.size.lg}`} />
      </Button>
    )
  }
  
  // インライン用ボタン
  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className={`${className}`}
    >
      <Plus className={`${icon.size.sm} mr-2`} />
      Create Event
    </Button>
  )
}