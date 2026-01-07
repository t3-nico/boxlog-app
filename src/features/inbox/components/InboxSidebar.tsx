'use client';

import { useState } from 'react';

import { CalendarDays, List } from 'lucide-react';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import { SidebarShell } from '@/features/navigation/components/sidebar/SidebarShell';
import { SidebarTabLayout } from '@/features/navigation/components/sidebar/SidebarTabLayout';
import type { SidebarTab } from '@/features/navigation/components/sidebar/types';
import { useTranslations } from 'next-intl';

import { CompactDayView } from './sidebar/CompactDayView';
import { InboxSidebarList } from './sidebar/InboxSidebarList';

interface InboxSidebarProps {
  isLoading?: boolean;
  /** カレンダー表示用のプラン（start_time/end_timeが設定されているもの） */
  calendarPlans?: CalendarPlan[];
  /** プランのスケジュール更新ハンドラー */
  onSchedulePlan?: (planId: string, date: Date, time: string) => void;
  /** 空き時間クリックでプラン作成 */
  onCreatePlan?: (date: Date, time: string) => void;
}

/**
 * Inbox用サイドバー
 *
 * タブ構成:
 * - Calendar: カレンダーDayView（ドラッグ＆ドロップでスケジュール設定）
 * - List: Plan + Record 一覧表示
 */
export function InboxSidebar({
  isLoading = false,
  calendarPlans = [],
  onSchedulePlan,
  onCreatePlan,
}: InboxSidebarProps) {
  const t = useTranslations();
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const tabs: SidebarTab[] = [
    {
      value: 'list',
      label: t('inbox.sidebar.tabs.list'),
      icon: List,
      content: <InboxSidebarList />,
    },
    {
      value: 'calendar',
      label: t('inbox.sidebar.tabs.calendar'),
      icon: CalendarDays,
      content: (
        <CompactDayView
          date={selectedDate}
          onDateChange={setSelectedDate}
          plans={calendarPlans}
          {...(onSchedulePlan && { onDrop: onSchedulePlan })}
          {...(onCreatePlan && { onEmptyClick: onCreatePlan })}
          className="min-h-0 flex-1"
        />
      ),
    },
  ];

  if (isLoading) {
    return (
      <SidebarShell title={t('sidebar.navigation.inbox')}>
        <div className="flex flex-1 items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      </SidebarShell>
    );
  }

  return (
    <SidebarShell title={t('sidebar.navigation.inbox')}>
      <SidebarTabLayout tabs={tabs} defaultTab="list" />
    </SidebarShell>
  );
}
