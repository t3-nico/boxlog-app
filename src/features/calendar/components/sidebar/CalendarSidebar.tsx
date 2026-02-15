'use client';

import { MiniCalendar } from '@/components/ui/mini-calendar';
import { useCalendarNavigation } from '@/features/calendar/contexts/CalendarNavigationContext';
import { SidebarShell } from '@/features/navigation/components/sidebar/SidebarShell';

import { CalendarFilterList } from './tag-filter/CalendarFilterList';
import { ViewSwitcherList } from './ViewSwitcherList';

/**
 * CalendarSidebar - カレンダーページ専用サイドバー
 *
 * シンプルな単一構成:
 * - ビュー切り替え（モバイルのみ）
 * - カレンダーフィルター
 * - ミニカレンダー（日付選択・月移動）
 */
export function CalendarSidebar() {
  const navigation = useCalendarNavigation();

  return (
    <SidebarShell>
      {/* ビュー切り替え・フィルター */}
      <div className="flex min-w-0 flex-col overflow-hidden">
        {/* ビュー切り替え（モバイルのみ） */}
        <ViewSwitcherList />

        {/* カレンダーフィルター */}
        <CalendarFilterList />
      </div>

      {/* ミニカレンダー（PCのみ）- 最下部に固定 */}
      <div className="mt-auto hidden shrink-0 md:block">
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
    </SidebarShell>
  );
}
