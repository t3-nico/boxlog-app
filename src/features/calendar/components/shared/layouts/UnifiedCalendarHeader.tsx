'use client'

import React from 'react'
import { format, getWeek } from 'date-fns'
import { ja } from 'date-fns/locale'
import { CalendarHeader } from '../../layout/Header'
import type { CalendarViewType } from '../../../types/calendar.types'

interface UnifiedCalendarHeaderProps {
  /** ビュータイプ */
  viewType: CalendarViewType
  /** 現在の日付 */
  currentDate: Date
  /** 表示する日付配列 */
  dates: Date[]
  /** Plan/Record表示モード */
  planRecordMode?: 'plan' | 'record' | 'both'
  /** ナビゲーション関数 */
  onNavigate: (direction: 'prev' | 'next' | 'today') => void
  /** ビュー変更関数 */
  onViewChange: (view: CalendarViewType) => void
}

/**
 * すべてのカレンダービューで統一されたヘッダーコンポーネント
 * CalendarHeader、期間表示、DateHeaderを組み合わせて一貫性のあるヘッダーを提供
 */
export function UnifiedCalendarHeader({
  viewType,
  currentDate,
  dates,
  planRecordMode,
  onNavigate,
  onViewChange
}: UnifiedCalendarHeaderProps) {
  // ビュータイプに応じた期間表示を生成（July 2025 week30形式）
  const getPeriodDisplay = () => {
    const month = format(currentDate, 'MMMM yyyy')
    const weekNumber = getWeek(currentDate, { weekStartsOn: 1 })
    
    switch (viewType) {
      case 'day':
        return `${month} week${weekNumber}`
      case 'split-day':
        return `${month} week${weekNumber}`
      case '3day':
        return `${month} week${weekNumber}`
      case 'week':
        return `${month} week${weekNumber}`
      case 'week-no-weekend':
        return `${month} week${weekNumber}`
      case '2week':
        return `${month} week${weekNumber}`
      case 'schedule':
        return `${month} week${weekNumber}`
      default:
        return `${month} week${weekNumber}`
    }
  }
  
  return (
    <div className="flex-shrink-0" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      {/* メインヘッダー（ナビゲーション、ビュー切り替え） */}
      <CalendarHeader
        viewType={viewType}
        currentDate={currentDate}
        onNavigate={onNavigate}
        onViewChange={onViewChange}
      />
      
      
      {/* 日付ヘッダー（曜日・日付表示） */}
      <DateHeader 
        dates={dates} 
        planRecordMode={planRecordMode} 
      />
    </div>
  )
}