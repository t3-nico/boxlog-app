// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
'use client'

import React from 'react'

import { Inbox, Calendar, Play, CheckCircle, X } from 'lucide-react'

import { Badge } from '@/components/shadcn-ui/badge'
import { cn } from '@/lib/utils'

import type { EventStatus } from '../../types/events'

interface EventStatusChipProps {
  status: EventStatus
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const statusConfig = {
  inbox: {
    label: 'Inbox',
    icon: Inbox,
    color: '#6b7280',
    textColor: 'text-neutral-600 dark:text-neutral-400',
    bgColor: '#f3f4f6'
  },
  planned: {
    label: 'Planned',
    icon: Calendar,
    color: '#3b82f6',
    textColor: 'text-blue-600 dark:text-blue-400',
    bgColor: '#dbeafe'
  },
  in_progress: {
    label: 'In Progress',
    icon: Play,
    color: '#f59e0b',
    textColor: 'text-amber-600 dark:text-amber-400',
    bgColor: '#fef3c7'
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: '#10b981',
    textColor: 'text-green-600 dark:text-green-400',
    bgColor: '#d1fae5'
  },
  cancelled: {
    label: 'Cancelled',
    icon: X,
    color: '#ef4444',
    textColor: 'text-red-600 dark:text-red-400',
    bgColor: '#fee2e2'
  }
} as const

export const EventStatusChip = ({
  status,
  variant = 'default',
  size = 'md',
  showIcon = true,
  className = ''
}: EventStatusChipProps) => {
  const config = (status in statusConfig) ? statusConfig[status as keyof typeof statusConfig] : statusConfig.inbox
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
        "inline-flex items-center gap-1.5 font-medium capitalize",
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