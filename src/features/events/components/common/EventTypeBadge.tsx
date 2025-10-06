// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
'use client'

import React from 'react'

import { Calendar, CheckSquare, Bell } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import type { EventType } from '../../types/events'

interface EventTypeBadgeProps {
  type: EventType
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const typeConfig = {
  event: {
    label: 'Event',
    icon: Calendar,
    color: '#3b82f6',
    textColor: 'text-blue-600 dark:text-blue-400',
    bgColor: '#dbeafe'
  },
  task: {
    label: 'Task',
    icon: CheckSquare,
    color: '#f59e0b',
    textColor: 'text-amber-600 dark:text-amber-400',
    bgColor: '#fef3c7'
  },
  reminder: {
    label: 'Reminder',
    icon: Bell,
    color: '#10b981',
    textColor: 'text-green-600 dark:text-green-400',
    bgColor: '#d1fae5'
  }
} as const

export const EventTypeBadge = ({
  type,
  variant = 'default',
  size = 'md',
  showIcon = true,
  className = ''
}: EventTypeBadgeProps) => {
  const config = (type in typeConfig) ? typeConfig[type as keyof typeof typeConfig] : typeConfig.event
  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <Badge
      variant={variant === 'default' ? 'secondary' : variant}
      className={cn(
        "inline-flex items-center gap-1.5 font-medium",
        sizeClasses[size],
        variant === 'default' && config.textColor,
        variant === 'outline' && `border-current ${config.textColor}`,
        variant === 'ghost' && config.textColor,
        className
      )}
      style={variant === 'default' ? { 
        backgroundColor: config.color,
        color: 'white'
      } : variant === 'outline' ? {
        borderColor: config.color,
        color: config.color
      } : variant === 'ghost' ? {
        color: config.color
      } : undefined}
    >
      {showIcon ? <Icon className={cn(iconSize[size], "shrink-0")} /> : null}
      <span className="truncate">{config.label}</span>
    </Badge>
  )
}