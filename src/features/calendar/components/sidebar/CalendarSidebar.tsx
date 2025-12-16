'use client'

import { useMemo, useState } from 'react'

import { addDays, endOfWeek, startOfDay, startOfWeek, subDays } from 'date-fns'
import { CalendarDays, ListTodo } from 'lucide-react'

import { MiniCalendar } from '@/components/common/MiniCalendar'
import { useCalendarNavigation } from '@/features/calendar/contexts/CalendarNavigationContext'
import { SidebarShell } from '@/features/navigation/components/sidebar/SidebarShell'
import { SidebarTabLayout } from '@/features/navigation/components/sidebar/SidebarTabLayout'
import type { SidebarTab } from '@/features/navigation/components/sidebar/types'
import { useTranslations } from 'next-intl'

import { CalendarFilterList } from './CalendarFilterList'
import { TodoCardList } from './todo/TodoCardList'
import { TodoNavigation, type TodoFilter, type TodoSort } from './todo/TodoNavigation'

/**
 * CalendarSidebar - カレンダーページ専用サイドバー
 *
 * SidebarShellを使用して共通の外枠を提供し、
 * SidebarTabLayoutでタブUIを実装。
 *
 * **タブ構成**:
 * - Todo: フィルターナビゲーション（ステータス: todo のプラン一覧）
 * - View: ミニカレンダー（日付選択・月移動）
 */
export function CalendarSidebar() {
  const navigation = useCalendarNavigation()
  const t = useTranslations()

  const [filter, setFilter] = useState<TodoFilter>('all')
  const [sort, setSort] = useState<TodoSort>('due')

  // ビュータイプに応じた表示範囲を計算
  const displayRange = useMemo(() => {
    if (!navigation?.currentDate || !navigation?.viewType) return undefined

    const { currentDate, viewType } = navigation
    // 時刻部分を正規化（00:00:00に統一）してisWithinIntervalの比較を正確にする
    const normalizedDate = startOfDay(currentDate)

    switch (viewType) {
      case 'day':
        // 日表示: 1日のみ
        return { start: normalizedDate, end: normalizedDate }

      case '3day':
        // 3日表示: 当日を中央として前後1日（合計3日間）
        return { start: subDays(normalizedDate, 1), end: addDays(normalizedDate, 1) }

      case '5day':
        // 5日表示: 当日を中央として前後2日（合計5日間）
        return { start: subDays(normalizedDate, 2), end: addDays(normalizedDate, 2) }

      case 'week':
        // 週表示: 月曜から日曜
        return {
          start: startOfWeek(normalizedDate, { weekStartsOn: 1 }),
          end: endOfWeek(normalizedDate, { weekStartsOn: 1 }),
        }

      case 'agenda':
        // アジェンダ表示: 範囲なし（単一日付選択のみ）
        return undefined

      default:
        return undefined
    }
  }, [navigation?.currentDate, navigation?.viewType])

  const tabs: SidebarTab[] = [
    {
      value: 'todo',
      label: t('calendar.sidebar.tabs.todo'),
      icon: ListTodo,
      content: (
        <div>
          {/* ナビゲーションコンテナ: 上padding 8pxのみ */}
          <div className="shrink-0 px-4 pt-2">
            <TodoNavigation filter={filter} onFilterChange={setFilter} sort={sort} onSortChange={setSort} />
          </div>
          {/* カードリストコンテナ - パディングはTodoCardList内で管理 */}
          <div className="flex-1 overflow-hidden">
            <TodoCardList filter={filter} sort={sort} />
          </div>
        </div>
      ),
    },
    {
      value: 'view',
      label: t('calendar.sidebar.tabs.view'),
      icon: CalendarDays,
      content: (
        <div>
          {/* ミニカレンダー */}
          <MiniCalendar
            selectedDate={navigation?.currentDate}
            displayRange={displayRange}
            onDateSelect={(date) => {
              if (date && navigation) {
                navigation.navigateToDate(date, true)
              }
            }}
            className="w-full bg-transparent"
          />
          {/* カレンダーフィルター */}
          <CalendarFilterList />
        </div>
      ),
    },
  ]

  return (
    <SidebarShell title={t('sidebar.navigation.calendar')}>
      <SidebarTabLayout tabs={tabs} defaultTab="todo" />
    </SidebarShell>
  )
}
