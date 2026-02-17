'use client';

import { MiniCalendar } from '@/components/ui/mini-calendar';
import { CalendarFilterList } from '@/features/calendar/components/sidebar/tag-filter/CalendarFilterList';
import { ViewSwitcherList } from '@/features/calendar/components/sidebar/ViewSwitcherList';
import { useCalendarNavigation } from '@/features/calendar/contexts/CalendarNavigationContext';

import { SidebarShell } from './SidebarShell';

/**
 * AppSidebar - アプリケーションのメインサイドバー
 *
 * 全ページで常に表示される:
 * - ミニカレンダー（日付選択・月移動、PCのみ）
 * - ビュー切り替え（モバイルのみ）
 * - カレンダーフィルター
 */
export function AppSidebar() {
  const navigation = useCalendarNavigation();

  return (
    <SidebarShell>
      {/* ミニカレンダー（PCのみ）- サイドバー上部 */}
      <div className="hidden shrink-0 md:block">
        <MiniCalendar
          selectedDate={navigation?.currentDate}
          onDateSelect={(date) => {
            if (date && navigation) {
              navigation.navigateToDate(date, true);
            }
          }}
          className="w-full bg-transparent"
        />
      </div>

      {/* ビュー切り替え・フィルター */}
      <div className="flex min-w-0 flex-col overflow-hidden">
        {/* ビュー切り替え（モバイルのみ） */}
        <ViewSwitcherList />

        {/* カレンダーフィルター */}
        <CalendarFilterList />
      </div>
    </SidebarShell>
  );
}
