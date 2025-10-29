'use client'

import { useMemo } from 'react'

import { endOfWeek, startOfWeek } from 'date-fns'

import { MiniCalendar } from '@/features/calendar/components/common/MiniCalendar'
import { useCalendarNavigation } from '@/features/calendar/contexts/CalendarNavigationContext'
import { SidebarTabLayout } from '@/features/navigation/components/sidebar/SidebarTabLayout'
import type { SidebarTab } from '@/features/navigation/components/sidebar/types'

/**
 * CalendarSidebar - カレンダーページ専用サイドバー
 *
 * **タブ構成**:
 * - Inbox: Inboxタスク一覧
 * - Calendar: ミニカレンダー（日付選択・月移動）
 * - Events: イベント一覧（時系列）
 *
 * **TODO**:
 * - EventsList コンポーネント実装
 * - InboxList コンポーネント実装
 */
export function CalendarSidebar() {
  const navigation = useCalendarNavigation()

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

  const tabs: SidebarTab[] = [
    {
      value: 'inbox',
      label: 'Inbox',
      content: <div className="flex flex-col gap-4">{/* Inbox content will be implemented */}</div>,
    },
    {
      value: 'calendar',
      label: 'Calendar',
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
    {
      value: 'events',
      label: 'Events',
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex h-10 items-center">
            <h3 className="text-sm font-semibold">View Tab</h3>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground text-sm">表示設定がここに表示されます</p>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-xs">DatePicker</p>
              <p className="text-muted-foreground mt-2 text-xs">カレンダーの月選択ウィジェット</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-xs">Filters</p>
              <p className="text-muted-foreground mt-2 text-xs">タグ・カレンダーフィルター</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-xs">View Options</p>
              <p className="text-muted-foreground mt-2 text-xs">Day / Week / Month 切り替え</p>
            </div>
          </div>
        </div>
      ),
    },
  ]

  return <SidebarTabLayout tabs={tabs} defaultTab="inbox" />
}
