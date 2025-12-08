'use client'

import { useMemo, useState } from 'react'

import { endOfWeek, startOfWeek } from 'date-fns'

import { MiniCalendar } from '@/features/calendar/components/common/MiniCalendar'
import { useCalendarNavigation } from '@/features/calendar/contexts/CalendarNavigationContext'
import { SidebarShell } from '@/features/navigation/components/sidebar/SidebarShell'
import { SidebarTabLayout } from '@/features/navigation/components/sidebar/SidebarTabLayout'
import type { SidebarTab } from '@/features/navigation/components/sidebar/types'
import { useTranslations } from 'next-intl'

import { InboxCardList } from './inbox/InboxCardList'
import { InboxNavigation, type InboxFilter, type InboxSort } from './inbox/InboxNavigation'

/**
 * CalendarSidebar - カレンダーページ専用サイドバー
 *
 * SidebarShellを使用して共通の外枠を提供し、
 * SidebarTabLayoutでタブUIを実装。
 *
 * **タブ構成**:
 * - Inbox: フィルターナビゲーション
 * - View: ミニカレンダー（日付選択・月移動）
 */
export function CalendarSidebar() {
  const navigation = useCalendarNavigation()
  const t = useTranslations()

  const [filter, setFilter] = useState<InboxFilter>('all')
  const [sort, setSort] = useState<InboxSort>('due')
  const [showHigh, setShowHigh] = useState(true)
  const [showMedium, setShowMedium] = useState(true)
  const [showLow, setShowLow] = useState(true)

  // 現在表示している週の範囲を計算（週番号のハイライト表示用）
  const displayRange = useMemo(() => {
    if (!navigation?.currentDate || !navigation?.viewType) return undefined

    // 週表示の場合のみハイライト
    const weekViewTypes = ['week', 'week-no-weekend']
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
        <>
          {/* ナビゲーションコンテナ: 高さ48px（内部32px + 上padding 8px + 下padding 8px） */}
          <div className="h-12 shrink-0 px-4 pt-2">
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
          </div>
          {/* カードリストコンテナ */}
          <div className="flex-1 overflow-hidden px-4">
            <InboxCardList filter={filter} sort={sort} showHigh={showHigh} showMedium={showMedium} showLow={showLow} />
          </div>
        </>
      ),
    },
    {
      value: 'view',
      label: 'View',
      content: (
        <div className="px-4 pt-4">
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
            className="border-input w-full rounded-lg border"
          />
        </div>
      ),
    },
  ]

  return (
    <SidebarShell title={t('sidebar.navigation.calendar')}>
      <SidebarTabLayout tabs={tabs} defaultTab="inbox" />
    </SidebarShell>
  )
}
