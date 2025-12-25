import type { PlanStatus } from '../types/plan';

/**
 * プランステータス定数
 */
export const PLAN_STATUSES = {
  TODO: 'todo',
  DOING: 'doing',
  DONE: 'done',
} as const;

/**
 * ステータス表示名マップ
 */
export const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  todo: 'Todo',
  doing: 'Doing',
  done: 'Done',
};

/**
 * ステータス色マップ（Tailwind classes）
 */
export const PLAN_STATUS_COLORS: Record<
  PlanStatus,
  {
    bg: string;
    text: string;
    border: string;
    darkBg: string;
    darkText: string;
    darkBorder: string;
  }
> = {
  todo: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    darkBg: 'dark:bg-gray-900/20',
    darkText: 'dark:text-gray-300',
    darkBorder: 'dark:border-gray-800',
  },
  doing: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    darkBg: 'dark:bg-blue-900/20',
    darkText: 'dark:text-blue-300',
    darkBorder: 'dark:border-blue-800',
  },
  done: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    darkBg: 'dark:bg-green-900/20',
    darkText: 'dark:text-green-300',
    darkBorder: 'dark:border-green-800',
  },
};
