'use client'

import { useState } from 'react'

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'
import { SidebarShell } from '@/features/navigation/components/sidebar/SidebarShell'
import { useTranslations } from 'next-intl'

import { CompactDayView } from './sidebar/CompactDayView'

interface InboxSidebarProps {
  isLoading?: boolean
  /** カレンダー表示用のプラン（start_time/end_timeが設定されているもの） */
  calendarPlans?: CalendarPlan[]
  /** プランのスケジュール更新ハンドラー */
  onSchedulePlan?: (planId: string, date: Date, time: string) => void
  /** 空き時間クリックでプラン作成 */
  onCreatePlan?: (date: Date, time: string) => void
}

/**
 * Inbox用サイドバー
 *
 * カレンダーDayViewを表示し、ドラッグ＆ドロップでスケジュール設定
 */
export function InboxSidebar({
  isLoading = false,
  calendarPlans = [],
  onSchedulePlan,
  onCreatePlan,
}: InboxSidebarProps) {
  const t = useTranslations()
  const [selectedDate, setSelectedDate] = useState(() => new Date())

  if (isLoading) {
    return (
      <SidebarShell title={t('sidebar.navigation.inbox')}>
        <div className="flex flex-1 items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      </SidebarShell>
    )
  }

  return (
    <SidebarShell title={t('sidebar.navigation.inbox')}>
      <CompactDayView
        date={selectedDate}
        onDateChange={setSelectedDate}
        plans={calendarPlans}
        {...(onSchedulePlan && { onDrop: onSchedulePlan })}
        {...(onCreatePlan && { onEmptyClick: onCreatePlan })}
        className="min-h-0 flex-1"
      />
    </SidebarShell>
  )
}
