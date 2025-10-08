/**
 * 日付ヘッダーコンポーネント
 */

'use client'

import { memo } from 'react'

import { cn } from '@/lib/utils'

import type { DayDisplayProps } from '../types/view.types'
import { formatDate } from '../utils/dateHelpers'

// ヘルパー関数: ヘッダークラスを生成
const generateHeaderClasses = (
  isToday: boolean,
  isSelected: boolean,
  isWeekend: boolean,
  onClick?: (date: Date) => void,
  className?: string
): string => {
  const baseClasses = 'flex items-center justify-center py-2 px-1 text-center transition-colors rounded-lg'

  const hoverClasses =
    onClick && !isToday
      ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20'
      : onClick && isToday
        ? 'cursor-pointer'
        : ''

  const statusClasses = isToday
    ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
    : isSelected
      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      : isWeekend
        ? 'text-gray-500 dark:text-gray-400'
        : 'text-gray-900 dark:text-gray-100'

  return [baseClasses, hoverClasses, statusClasses, className].filter(Boolean).join(' ')
}

// ヘルパー関数: テキストクラスを生成
const getTextClasses = (isToday: boolean, isBase: boolean = false): string => {
  if (isToday) {
    return isBase ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-900 dark:text-neutral-100 opacity-75'
  }
  return 'text-gray-500 dark:text-gray-400'
}

export const DayDisplay = memo<DayDisplayProps>(function DayDisplay({
  date,
  isToday = false,
  isWeekend = false,
  isSelected = false,
  format = 'short',
  onClick,
  className = '',
}) {
  const handleClick = () => {
    onClick?.(date)
  }

  // ヘッダーのスタイルクラス
  const headerClasses = generateHeaderClasses(isToday, isSelected, isWeekend, onClick, className)

  // 日付の表示形式
  const dateDisplay = formatDate(date, format)

  return onClick ? (
    <button className={headerClasses} onClick={handleClick} aria-label={`${dateDisplay}を選択`} type="button">
      <div className="flex min-w-0 flex-col items-center">
        {/* 曜日 */}
        <div className={cn('text-xs', getTextClasses(isToday))}>
          {date.toLocaleDateString('ja-JP', { weekday: 'short' })}
        </div>

        {/* 日付 */}
        <div className={cn('text-lg font-semibold', getTextClasses(isToday, true))}>{date.getDate()}</div>

        {/* 月（異なる月の場合のみ表示） */}
        {format === 'long' && (
          <div className={cn('text-xs', getTextClasses(isToday))}>
            {date.toLocaleDateString('ja-JP', { month: 'short' })}
          </div>
        )}
      </div>
    </button>
  ) : (
    <div className={headerClasses}>
      <div className="flex min-w-0 flex-col items-center">
        {/* 曜日 */}
        <div className={`text-xs ${getTextClasses(isToday)}`}>
          {date.toLocaleDateString('ja-JP', { weekday: 'short' })}
        </div>

        {/* 日付 */}
        <div className={`text-lg font-semibold ${getTextClasses(isToday, true)}`}>{date.getDate()}</div>

        {/* 月（異なる月の場合のみ表示） */}
        {format === 'long' && (
          <div className={`text-xs ${getTextClasses(isToday)}`}>
            {date.toLocaleDateString('ja-JP', { month: 'short' })}
          </div>
        )}
      </div>
    </div>
  )
})
