'use client'

import { useMemo, useState } from 'react'

import { endOfWeek, startOfWeek } from 'date-fns'
import { usePathname } from 'next/navigation'

import { MiniCalendar } from '@/features/calendar/components/common/MiniCalendar'
import { useCalendarNavigation } from '@/features/calendar/contexts/CalendarNavigationContext'
import { useI18n } from '@/features/i18n/lib/hooks'
import { SidebarHeader } from '@/features/navigation/components/sidebar/SidebarHeader'
import { SidebarTabLayout } from '@/features/navigation/components/sidebar/SidebarTabLayout'
import type { SidebarTab } from '@/features/navigation/components/sidebar/types'

import { CalendarNavigation, type CalendarSortType } from '../navigation/CalendarNavigation'
import { InboxCardList } from './inbox/InboxCardList'
import { type InboxFilter, type InboxSort } from './inbox/InboxNavigation'

/**
 * CalendarSidebar - カレンダーページ専用サイドバー
 *
 * **タブ構成**:
 * - Inbox: フィルターナビゲーション
 * - View: ミニカレンダー（日付選択・月移動）
 */
export function CalendarSidebar() {
  const navigation = useCalendarNavigation()
  const pathname = usePathname()
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'
  const { t } = useI18n(localeFromPath)

  const [filter, setFilter] = useState<InboxFilter>('all')
  const [sort, setSort] = useState<InboxSort>('due')
  const [showHigh, setShowHigh] = useState(true)
  const [showMedium, setShowMedium] = useState(true)
  const [showLow, setShowLow] = useState(true)

  // CalendarNavigation用のstate
  const [calendarSort, setCalendarSort] = useState<CalendarSortType>('updated-desc')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [triggerCreate, setTriggerCreate] = useState(false)

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
        <>
          {/* ナビゲーションコンテナ: コンテナ40px + 上padding 8px = 合計48px */}
          <div className="flex h-12 shrink-0 items-center px-2 pt-2">
            <CalendarNavigation
              sort={calendarSort}
              onSortChange={setCalendarSort}
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              onCreateClick={() => setTriggerCreate(true)}
            />
          </div>
          {/* カードリストコンテナ */}
          <div className="flex-1 overflow-hidden px-2">
            <InboxCardList
              filter={filter}
              sort={sort}
              showHigh={showHigh}
              showMedium={showMedium}
              showLow={showLow}
              calendarSort={calendarSort}
              selectedTags={selectedTags}
              triggerCreate={triggerCreate}
              onCreateFinish={() => setTriggerCreate(false)}
            />
          </div>
        </>
      ),
    },
    {
      value: 'view',
      label: 'View',
      content: (
        <div className="flex w-full flex-col items-center px-2 pt-2">
          <MiniCalendar
            selectedDate={navigation?.currentDate}
            month={navigation?.currentDate}
            onDateSelect={(date) => {
              if (date && navigation) {
                navigation.navigateToDate(date, true)
              }
            }}
            onMonthChange={(date) => {
              if (navigation) {
                navigation.navigateToDate(date, true)
              }
            }}
            showWeekNumbers={false}
            displayRange={displayRange}
            className="w-fit border-none bg-transparent p-0"
          />
        </div>
      ),
    },
  ]

  return (
    <div className="bg-background text-foreground flex h-full w-full flex-col">
      {/* Header - ページタイトル */}
      <SidebarHeader title={t('sidebar.navigation.calendar')} />

      {/* タブレイアウト */}
      <div className="flex-1 overflow-hidden">
        <SidebarTabLayout tabs={tabs} defaultTab="inbox" />
      </div>
    </div>
  )
}
