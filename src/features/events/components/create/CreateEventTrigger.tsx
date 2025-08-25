'use client'

import React from 'react'
import { Plus, Calendar } from 'lucide-react'
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
          w-full h-14
          ${primary.DEFAULT} ${primary.hover}
          px-4 py-2
          ${rounded.component.button.md}
          flex items-center justify-start
          ${className}
        `}
        title="Create new event (⌘N)"
      >
        <div className="flex items-center gap-2">
          <Plus className={`${icon.size.md} shrink-0`} />
          <span className={`${body.large} font-medium`}>Create</span>
        </div>
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