import type { PlanStatus } from '../types/plan'

/**
 * チケットステータス定数
 */
export const TICKET_STATUSES = {
  BACKLOG: 'backlog',
  READY: 'ready',
  ACTIVE: 'active',
  WAIT: 'wait',
  DONE: 'done',
  CANCEL: 'cancel',
} as const

/**
 * ステータス表示名マップ
 */
export const TICKET_STATUS_LABELS: Record<PlanStatus, string> = {
  backlog: '準備中',
  ready: '配置済み',
  active: '作業中',
  wait: '待ち',
  done: '完了',
  cancel: '中止',
}

/**
 * ステータス色マップ（Tailwind classes）
 */
export const TICKET_STATUS_COLORS: Record<
  PlanStatus,
  {
    bg: string
    text: string
    border: string
    darkBg: string
    darkText: string
    darkBorder: string
  }
> = {
  backlog: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    darkBg: 'dark:bg-gray-900/20',
    darkText: 'dark:text-gray-300',
    darkBorder: 'dark:border-gray-800',
  },
  ready: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    darkBg: 'dark:bg-blue-900/20',
    darkText: 'dark:text-blue-300',
    darkBorder: 'dark:border-blue-800',
  },
  active: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    darkBg: 'dark:bg-yellow-900/20',
    darkText: 'dark:text-yellow-300',
    darkBorder: 'dark:border-yellow-800',
  },
  wait: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
    darkBg: 'dark:bg-orange-900/20',
    darkText: 'dark:text-orange-300',
    darkBorder: 'dark:border-orange-800',
  },
  done: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    darkBg: 'dark:bg-green-900/20',
    darkText: 'dark:text-green-300',
    darkBorder: 'dark:border-green-800',
  },
  cancel: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    darkBg: 'dark:bg-red-900/20',
    darkText: 'dark:text-red-300',
    darkBorder: 'dark:border-red-800',
  },
}
