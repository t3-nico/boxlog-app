'use client'

import type { CalendarViewType } from '../../../types/calendar.types'

import { DateNavigator } from './DateNavigator'
import { DateRangeDisplay } from './DateRangeDisplay'
import { HeaderActions } from './HeaderActions'
import { ViewSwitcher } from './ViewSwitcher'

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
  // 日付選択機能
  onDateSelect?: (date: Date) => void
  showMiniCalendar?: boolean
  // 現在表示している期間（MiniCalendarでのハイライト用）
  displayRange?: {
    start: Date
    end: Date
  }
}

const viewOptions = [
  { value: 'day' as CalendarViewType, label: 'Day', shortcut: 'D' },
  { value: '3day' as CalendarViewType, label: '3 Days', shortcut: '3' },
  { value: '5day' as CalendarViewType, label: '5 Days', shortcut: '5' },
  { value: 'week' as CalendarViewType, label: 'Week', shortcut: 'W' },
]

/**
 * カレンダーヘッダー
 * 共通コンポーネントを組み合わせたカレンダーヘッダー
 */
export const CalendarHeader = ({
  viewType,
  currentDate,
  onNavigate,
  onViewChange,
  onSettings,
  onExport,
  onImport,
  showActions = false,
  leftSlot,
  onDateSelect,
  showMiniCalendar = false,
  displayRange,
}: CalendarHeaderProps) => {
  return (
    <header className="bg-background relative h-12 px-4 pt-2">
      <div className="flex h-full items-center justify-between">
        {/* 左側: カスタムスロット + ナビゲーションコントロールと日付 */}
        <div className="flex items-center gap-4">
          {/* カスタムスロット（モバイルメニューボタンなど） */}
          {leftSlot}

          {/* 日付ナビゲーション */}
          <DateNavigator onNavigate={onNavigate} arrowSize="lg" />

          {/* 現在の日付表示 */}
          <DateRangeDisplay
            date={currentDate}
            viewType={viewType}
            showWeekNumber={true}
            clickable={showMiniCalendar}
            onDateSelect={onDateSelect ? (date) => date && onDateSelect(date) : undefined}
            displayRange={displayRange}
          />
        </div>

        {/* 右側: ビュー切り替えとアクション */}
        <div className="flex items-center gap-0">
          {/* ビュー切り替え */}
          <ViewSwitcher
            options={viewOptions}
            currentView={viewType}
            onChange={(view) => onViewChange(view as CalendarViewType)}
          />

          {/* アクションボタン */}
          {showActions != null && <HeaderActions onSettings={onSettings} onExport={onExport} onImport={onImport} />}
        </div>
      </div>
    </header>
  )
}
