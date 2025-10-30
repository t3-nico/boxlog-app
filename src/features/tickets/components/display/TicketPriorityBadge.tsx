'use client'

import { Badge } from '@/components/ui/badge'
import type { TicketPriority } from '../../types/ticket'

interface PriorityBadgeProps {
  priority: TicketPriority
  size?: 'sm' | 'md' | 'lg'
}

const PRIORITY_CONFIG: Record<
  TicketPriority,
  {
    label: string
    className: string
  }
> = {
  urgent: {
    label: '緊急',
    className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
  },
  high: {
    label: '高',
    className:
      'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
  },
  normal: {
    label: '通常',
    className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
  },
  low: {
    label: '低',
    className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800',
  },
}

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
}

export function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority]

  return (
    <Badge variant="outline" className={`${config.className} ${SIZE_CLASSES[size]} font-medium`}>
      {config.label}
    </Badge>
  )
}
