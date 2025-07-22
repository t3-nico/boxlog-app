'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, isToday } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export type ViewType = 'day' | 'three-day' | 'week' | 'weekday'

interface UnifiedCalendarHeaderProps {
  /** 現在のビュー種別 */
  viewType: ViewType
  /** 表示する日付配列 */
  dates: Date[]
  /** 現在の基準日 */
  currentDate: Date
  /** ビュー切り替え時のハンドラ */
  onViewChange?: (viewType: ViewType) => void
  /** 日付ナビゲーション（前へ） */
  onNavigatePrev?: () => void
  /** 日付ナビゲーション（次へ） */
  onNavigateNext?: () => void
  /** 今日へ移動 */
  onNavigateToday?: () => void
  /** 追加のクラス名 */
  className?: string
}

const VIEW_LABELS: Record<ViewType, string> = {
  day: '日',
  'three-day': '3日',
  week: '週',
  weekday: '平日'
}

export function UnifiedCalendarHeader({
  viewType,
  dates,
  currentDate,
  onViewChange,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday,
  className
}: UnifiedCalendarHeaderProps) {
  
  // ヘッダータイトルの生成
  const getHeaderTitle = () => {
    if (dates.length === 1) {
      // 1日表示
      return format(dates[0], 'yyyy年M月d日（E）', { locale: ja })
    } else if (dates.length <= 7) {
      // 複数日表示
      const firstDate = dates[0]
      const lastDate = dates[dates.length - 1]
      
      if (firstDate.getMonth() === lastDate.getMonth()) {
        // 同月内
        return `${format(firstDate, 'yyyy年M月', { locale: ja })} ${format(firstDate, 'd')}日〜${format(lastDate, 'd')}日`
      } else {
        // 月をまたぐ
        return `${format(firstDate, 'M月d日', { locale: ja })}〜${format(lastDate, 'M月d日', { locale: ja })}`
      }
    }
    return ''
  }

  return (
    <div className={cn(
      "flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800",
      className
    )}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* 左側: ビュー切り替えボタン */}
        <div className="flex items-center space-x-1">
          {Object.entries(VIEW_LABELS).map(([view, label]) => (
            <button
              key={view}
              onClick={() => onViewChange?.(view as ViewType)}
              className={cn(
                "px-3 py-2 text-sm rounded-md transition-colors",
                viewType === view
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 中央: 日付タイトル */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onNavigatePrev}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            disabled={!onNavigatePrev}
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white min-w-0 text-center">
            {getHeaderTitle()}
          </h2>
          
          <button
            onClick={onNavigateNext}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            disabled={!onNavigateNext}
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* 右側: 今日ボタン */}
        <div className="flex items-center">
          <button
            onClick={onNavigateToday}
            className={cn(
              "px-3 py-2 text-sm rounded-md transition-colors",
              dates.some(date => isToday(date))
                ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-default"
                : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
            )}
            disabled={dates.some(date => isToday(date)) || !onNavigateToday}
          >
            今日
          </button>
        </div>
      </div>

      {/* 日付ヘッダー行 */}
      <div className="flex border-t border-gray-200 dark:border-gray-700">
        {/* 時間軸のスペース */}
        <div className="w-16 flex-shrink-0 bg-gray-50 dark:bg-gray-800"></div>
        
        {/* 各日のヘッダー */}
        {dates.map((date, index) => (
          <div
            key={date.toISOString()}
            className={cn(
              "flex-1 px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0 min-w-[200px]",
              isToday(date) && "bg-blue-50 dark:bg-blue-900/20"
            )}
          >
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {format(date, 'E', { locale: ja })}
            </div>
            <div className={cn(
              "text-sm font-medium",
              isToday(date) 
                ? "text-blue-700 dark:text-blue-300" 
                : "text-gray-900 dark:text-white"
            )}>
              {format(date, 'd')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}