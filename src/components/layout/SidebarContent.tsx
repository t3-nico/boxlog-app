'use client';

/**
 * サイドバーコンテンツ（Composition Layer）
 *
 * ミニカレンダー + ビュー切り替え + フィルターを組み立てる。
 * features の組み合わせはこの composition layer で行う。
 */

import { usePathname } from 'next/navigation';

import { MiniCalendar } from '@/components/ui/mini-calendar';
import { CalendarFilterList, useCalendarNavigation, ViewSwitcherList } from '@/features/calendar';
import { useStatsFilterStore } from '@/features/stats';

export function SidebarContent() {
  const pathname = usePathname();
  const navigation = useCalendarNavigation();

  const isStatsPage = pathname?.includes('/stats') ?? false;
  const statsCurrentDate = useStatsFilterStore((s) => s.currentDate);
  const statsSetCurrentDate = useStatsFilterStore((s) => s.setCurrentDate);

  const miniCalendarDate = isStatsPage ? statsCurrentDate : navigation?.currentDate;
  const handleDateSelect = (date: Date) => {
    if (isStatsPage) {
      statsSetCurrentDate(date);
    } else if (navigation) {
      navigation.navigateToDate(date, true);
    }
  };

  return (
    <>
      {/* ミニカレンダー（PCのみ）- サイドバー上部 */}
      <div className="hidden shrink-0 md:block">
        <MiniCalendar
          selectedDate={miniCalendarDate}
          onDateSelect={(date) => {
            if (date) handleDateSelect(date);
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
