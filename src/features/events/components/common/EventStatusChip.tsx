'use client'

import React from 'react'
import { Inbox, Calendar, Play, CheckCircle, X } from 'lucide-react'
import { Badge } from '@/components/shadcn-ui/badge'
import { semantic, text, secondary } from '@/config/theme/colors'
import { body } from '@/config/theme/typography'
import { icon } from '@/config/theme/icons'
import { spacing } from '@/config/theme/spacing'
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
    color: '#6b7280', // gray-500 equivalent
    textColor: text.muted,
    bgColor: '#f3f4f6' // gray-100 equivalent
  },
  planned: {
    label: 'Planned',
    icon: Calendar,
    color: semantic.info.DEFAULT,
    textColor: semantic.info.text,
    bgColor: semantic.info.bg
  },
  in_progress: {
    label: 'In Progress',
    icon: Play,
    color: semantic.warning.DEFAULT,
    textColor: semantic.warning.text,
    bgColor: semantic.warning.bg
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: semantic.success.DEFAULT,
    textColor: semantic.success.text,
    bgColor: semantic.success.bg
  },
  cancelled: {
    label: 'Cancelled',
    icon: X,
    color: semantic.error.DEFAULT,
    textColor: semantic.error.text,
    bgColor: semantic.error.bg
  }
} as const

export function EventStatusChip({
  status,
  variant = 'default',
  size = 'md',
  showIcon = true,
  className = ''
}: EventStatusChipProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  const sizeClasses = {
    sm: `px-2 py-1 ${body.small}`,
    md: `px-3 py-1.5 ${body.medium}`, 
    lg: `px-4 py-2 ${body.large}`
  }

  const iconSize = {
    sm: icon.size.xs,
    md: icon.size.sm,
    lg: icon.size.md
  }

  return (
    <Badge
      variant={variant === 'default' ? 'secondary' : variant}
      className={`
        inline-flex items-center gap-1.5 font-medium capitalize
        ${sizeClasses[size]}
        ${variant === 'default' ? `${config.bgColor} ${config.textColor}` : ''}
        ${variant === 'outline' ? `border-current ${config.textColor}` : ''}
        ${variant === 'ghost' ? `${config.textColor}` : ''}
        ${className}
      `}
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
      {showIcon && <Icon className={`${iconSize[size]} shrink-0`} />}
      <span className="truncate">{config.label}</span>
    </Badge>
  )
}