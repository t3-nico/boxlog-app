'use client'

import React from 'react'

import { Calendar, CheckSquare, Bell } from 'lucide-react'

import { Badge } from '@/components/shadcn-ui/badge'
import { semantic } from '@/config/theme/colors'
import { icon } from '@/config/theme/icons'
import { body } from '@/config/theme/typography'

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
    color: semantic.info.DEFAULT,
    textColor: semantic.info.text,
    bgColor: semantic.info.bg
  },
  task: {
    label: 'Task',
    icon: CheckSquare,
    color: semantic.warning.DEFAULT,
    textColor: semantic.warning.text,
    bgColor: semantic.warning.bg
  },
  reminder: {
    label: 'Reminder',
    icon: Bell,
    color: semantic.success.DEFAULT,
    textColor: semantic.success.text,
    bgColor: semantic.success.bg
  }
} as const

export const EventTypeBadge = ({
  type,
  variant = 'default',
  size = 'md',
  showIcon = true,
  className = ''
}: EventTypeBadgeProps) => {
  const config = typeConfig[type]
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
        inline-flex items-center gap-1.5 font-medium
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