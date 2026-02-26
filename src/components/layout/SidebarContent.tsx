'use client';

/**
 * サイドバーコンテンツ（Composition Layer）
 *
 * ミニカレンダー + ビュー切り替え + フィルターを組み立てる。
 * features の組み合わせはこの composition layer で行う。
 */

import { MiniCalendar } from '@/components/ui/mini-calendar';
import { CalendarFilterList, useCalendarNavigation, ViewSwitcherList } from '@/features/calendar';

export function SidebarContent() {
  const navigation = useCalendarNavigation();

  return (
    <>
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
    </>
  );
}
