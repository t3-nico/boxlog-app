/**
 * 日付ヘッダーコンポーネント
 */

'use client'

import React, { memo } from 'react'
import { formatDate } from '../../utils/dateHelpers'
import type { DayHeaderProps } from '../../types/view.types'

export const DayHeader = memo<DayHeaderProps>(function DayHeader({
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
    'flex items-center justify-center py-2 px-1 text-center transition-colors',
    onClick ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : '',
    isToday 
      ? 'bg-blue-500 text-white font-semibold' 
      : isSelected 
        ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
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
        <div className={`text-xs ${isToday ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
          {date.toLocaleDateString('ja-JP', { weekday: 'short' })}
        </div>
        
        {/* 日付 */}
        <div className={`text-lg font-semibold ${isToday ? 'text-white' : ''}`}>
          {date.getDate()}
        </div>
        
        {/* 月（異なる月の場合のみ表示） */}
        {format === 'long' && (
          <div className={`text-xs ${isToday ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
            {date.toLocaleDateString('ja-JP', { month: 'short' })}
          </div>
        )}
      </div>
    </div>
  )
})