'use client'

import { ViewSwitcher } from './ViewSwitcher'
import { DateNavigator } from './DateNavigator'
import { DateRangeDisplay } from './DateRangeDisplay'
import { HeaderActions } from './HeaderActions'
import type { CalendarViewType } from '../../../types/calendar.types'

interface CalendarHeaderProps {
  viewType: CalendarViewType
  currentDate: Date
  onNavigate: (direction: 'prev' | 'next' | 'today') => void
  onViewChange: (view: CalendarViewType) => void
  // オプションのアクション
  onSettings?: () => void
  onExport?: () => void
  onImport?: () => void
  showActions?: boolean
  // 左側のカスタムコンテンツ（モバイルメニューボタンなど）
  leftSlot?: React.ReactNode
}

const viewOptions = [
  { value: 'day' as CalendarViewType, label: 'Day' },
  { value: '3day' as CalendarViewType, label: '3 Days' },
  { value: 'week-no-weekend' as CalendarViewType, label: 'Weekdays' },
  { value: 'week' as CalendarViewType, label: 'Week' },
  { value: '2week' as CalendarViewType, label: '2 Weeks' },
  { value: 'schedule' as CalendarViewType, label: 'Schedule' },
]

/**
 * カレンダーヘッダー
 * 共通コンポーネントを組み合わせたカレンダーヘッダー
 */
export function CalendarHeader({
  viewType,
  currentDate,
  onNavigate,
  onViewChange,
  onSettings,
  onExport,
  onImport,
  showActions = false,
  leftSlot
}: CalendarHeaderProps) {
  return (
    <header className="relative h-16 bg-background px-4">
      <div className="h-full flex items-center justify-between">
        {/* 左側: カスタムスロット + ナビゲーションコントロールと日付 */}
        <div className="flex items-center gap-4">
          {/* カスタムスロット（モバイルメニューボタンなど） */}
          {leftSlot}
          
          {/* 日付ナビゲーション */}
          <DateNavigator 
            onNavigate={onNavigate}
            arrowSize="lg"
          />
          
          {/* 現在の日付表示 */}
          <DateRangeDisplay 
            date={currentDate}
            viewType={viewType}
            showWeekNumber={true}
          />
        </div>
        
        {/* 右側: ビュー切り替えとアクション */}
        <div className="flex items-center gap-2">
          {/* ビュー切り替え */}
          <ViewSwitcher 
            options={viewOptions}
            currentView={viewType}
            onChange={onViewChange}
          />
          
          {/* アクションボタン */}
          {showActions && (
            <HeaderActions
              onSettings={onSettings}
              onExport={onExport}
              onImport={onImport}
            />
          )}
        </div>
      </div>
    </header>
  )
}