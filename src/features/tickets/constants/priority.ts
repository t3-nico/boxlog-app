import type { TicketPriority } from '../types/ticket'

/**
 * チケット優先度定数
 */
export const TICKET_PRIORITIES = {
  URGENT: 'urgent',
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low',
} as const

/**
 * 優先度表示名マップ
 */
export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  urgent: '緊急',
  high: '高',
  normal: '通常',
  low: '低',
}

/**
 * 優先度色マップ（Tailwind classes）
 */
export const TICKET_PRIORITY_COLORS: Record<
  TicketPriority,
  {
    bg: string
    text: string
    border: string
  }
> = {
  urgent: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
  },
  high: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
  },
  normal: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  low: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
  },
}
