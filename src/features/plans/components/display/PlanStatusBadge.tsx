'use client'

import { Badge } from '@/components/ui/badge'
import type { PlanStatus } from '../../types/plan'

interface PlanStatusBadgeProps {
  status: PlanStatus
  size?: 'sm' | 'md' | 'lg'
}

const STATUS_CONFIG: Record<
  TicketStatus,
  {
    label: string
    className: string
  }
> = {
  backlog: {
    label: '準備中',
    className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800',
  },
  ready: {
    label: '配置済み',
    className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
  },
  active: {
    label: '作業中',
    className:
      'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
  },
  wait: {
    label: '待ち',
    className:
      'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
  },
  done: {
    label: '完了',
    className:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
  },
  cancel: {
    label: '中止',
    className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
  },
}

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
}

export function PlanStatusBadge({ status, size = 'sm' }: PlanStatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <Badge variant="outline" className={`${config.className} ${SIZE_CLASSES[size]} font-medium`}>
      {config.label}
    </Badge>
  )
}

// Backward compatibility alias
export { PlanStatusBadge as TicketStatusBadge }
