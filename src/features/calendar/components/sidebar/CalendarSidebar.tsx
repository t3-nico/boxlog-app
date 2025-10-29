'use client'

import { useMemo, useState } from 'react'

import { endOfWeek, startOfWeek } from 'date-fns'

import { MiniCalendar } from '@/features/calendar/components/common/MiniCalendar'
import { useCalendarNavigation } from '@/features/calendar/contexts/CalendarNavigationContext'
import { SidebarTabLayout } from '@/features/navigation/components/sidebar/SidebarTabLayout'
import type { SidebarTab } from '@/features/navigation/components/sidebar/types'

import { InboxNavigation, type InboxFilter, type InboxSort } from './inbox/InboxNavigation'

/**
 * CalendarSidebar - カレンダーページ専用サイドバー
 *
 * **タブ構成**:
 * - Inbox: フィルターナビゲーション
 * - View: ミニカレンダー（日付選択・月移動）
 */
export function CalendarSidebar() {
  const navigation = useCalendarNavigation()
  const [filter, setFilter] = useState<InboxFilter>('all')
  const [sort, setSort] = useState<InboxSort>('due')
  const [showHigh, setShowHigh] = useState(true)
  const [showMedium, setShowMedium] = useState(true)
  const [showLow, setShowLow] = useState(true)

  // 現在表示している週の範囲を計算（週番号のハイライト表示用）
  const displayRange = useMemo(() => {
    if (!navigation?.currentDate || !navigation?.viewType) return undefined

    // 週表示の場合のみハイライト
    const weekViewTypes = ['week', 'week-no-weekend', '2week']
    if (!weekViewTypes.includes(navigation.viewType)) return undefined

    const start = startOfWeek(navigation.currentDate, { weekStartsOn: 1 })
    const end = endOfWeek(navigation.currentDate, { weekStartsOn: 1 })

    return { start, end }
  }, [navigation?.currentDate, navigation?.viewType])

  const handlePriorityToggle = (priority: 'high' | 'medium' | 'low') => {
    if (priority === 'high') setShowHigh(!showHigh)
    if (priority === 'medium') setShowMedium(!showMedium)
    if (priority === 'low') setShowLow(!showLow)
  }

  const tabs: SidebarTab[] = [
    {
      value: 'inbox',
      label: 'Inbox',
      content: (
        <div className="flex flex-col">
          <InboxNavigation
            filter={filter}
            onFilterChange={setFilter}
            sort={sort}
            onSortChange={setSort}
            showHigh={showHigh}
            showMedium={showMedium}
            showLow={showLow}
            onPriorityToggle={handlePriorityToggle}
          />
          {/* タスクリストは今後実装 */}
        </div>
      ),
    },
    {
      value: 'view',
      label: 'View',
      content: (
        <div className="flex w-full flex-col">
          <MiniCalendar
            selectedDate={navigation?.currentDate}
            month={navigation?.currentDate}
            onDateSelect={(date) => {
              if (date && navigation) {
                navigation.navigateToDate(date, true)
              }
            }}
            showWeekNumbers={true}
            displayRange={displayRange}
            className="w-full !bg-transparent p-0"
          />
        </div>
      ),
    },
  ]

  return <SidebarTabLayout tabs={tabs} defaultTab="inbox" />
}
