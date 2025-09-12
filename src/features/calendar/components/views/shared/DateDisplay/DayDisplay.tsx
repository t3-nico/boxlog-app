/**
 * 日付ヘッダーコンポーネント
 */

'use client'

import React, { memo } from 'react'

import { selection } from '@/config/theme/colors'

import type { DayDisplayProps } from '../types/view.types'
import { formatDate } from '../utils/dateHelpers'

export const DayDisplay = memo<DayDisplayProps>(function DayDisplay({
  date,
  isToday = false,
  isWeekend = false,
  isSelected = false,
  format = 'short',
  onClick,
  className = ''
}) {
  const handleClick = () => {
    onClick?.(date)
  }
  
  // ヘッダーのスタイルクラス
  const headerClasses = [
    'flex items-center justify-center py-2 px-1 text-center transition-colors rounded-lg',
    // ホバー効果（当日以外のみ）
    onClick && !isToday ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20' : '',
    // クリック可能だが当日の場合
    onClick && isToday ? 'cursor-pointer' : '',
    // 当日スタイル（ミニカレンダーと同じ）
    isToday 
      ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold' 
      : isSelected 
        ? `${selection.active} ${selection.text}`
        : isWeekend 
          ? 'text-gray-500 dark:text-gray-400' 
          : 'text-gray-900 dark:text-gray-100',
    className
  ].filter(Boolean).join(' ')
  
  // 日付の表示形式
  const dateDisplay = formatDate(date, format)
  
  return (
    <div
      className={headerClasses}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `${dateDisplay}を選択` : undefined}
    >
      <div className="flex flex-col items-center min-w-0">
        {/* 曜日 */}
        <div className={`text-xs ${isToday ? 'text-neutral-900 dark:text-neutral-100 opacity-75' : 'text-gray-500 dark:text-gray-400'}`}>
          {date.toLocaleDateString('ja-JP', { weekday: 'short' })}
        </div>
        
        {/* 日付 */}
        <div className={`text-lg font-semibold ${isToday ? 'text-neutral-900 dark:text-neutral-100' : ''}`}>
          {date.getDate()}
        </div>
        
        {/* 月（異なる月の場合のみ表示） */}
        {format === 'long' && (
          <div className={`text-xs ${isToday ? 'text-neutral-900 dark:text-neutral-100 opacity-75' : 'text-gray-500 dark:text-gray-400'}`}>
            {date.toLocaleDateString('ja-JP', { month: 'short' })}
          </div>
        )}
      </div>
    </div>
  )
})