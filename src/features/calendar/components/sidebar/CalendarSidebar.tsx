'use client';

import { useMemo } from 'react';

import { addDays, endOfWeek, startOfDay, startOfWeek, subDays } from '@/lib/date';

import { MiniCalendar } from '@/components/common/MiniCalendar';
import { useCalendarNavigation } from '@/features/calendar/contexts/CalendarNavigationContext';
import { SidebarShell } from '@/features/navigation/components/sidebar/SidebarShell';

import { CalendarFilterList } from './tag-filter/CalendarFilterList';
import { ViewSwitcherList } from './ViewSwitcherList';

/**
 * CalendarSidebar - カレンダーページ専用サイドバー
 *
 * シンプルな単一構成:
 * - ミニカレンダー（日付選択・月移動）
 * - ビュー切り替え（モバイルのみ）
 * - カレンダーフィルター
 */
export function CalendarSidebar() {
  const navigation = useCalendarNavigation();

  // ビュータイプに応じた表示範囲を計算
  const displayRange = useMemo(() => {
    if (!navigation?.currentDate || !navigation?.viewType) return undefined;

    const { currentDate, viewType } = navigation;
    // 時刻部分を正規化（00:00:00に統一）してisWithinIntervalの比較を正確にする
    const normalizedDate = startOfDay(currentDate);

    switch (viewType) {
      case 'day':
        // 日表示: 1日のみ
        return { start: normalizedDate, end: normalizedDate };

      case '3day':
        // 3日表示: 当日を中央として前後1日（合計3日間）
        return { start: subDays(normalizedDate, 1), end: addDays(normalizedDate, 1) };

      case '5day':
        // 5日表示: 当日を中央として前後2日（合計5日間）
        return { start: subDays(normalizedDate, 2), end: addDays(normalizedDate, 2) };

      case 'week':
        // 週表示: 月曜から日曜
        return {
          start: startOfWeek(normalizedDate, { weekStartsOn: 1 }),
          end: endOfWeek(normalizedDate, { weekStartsOn: 1 }),
        };

      case 'agenda':
        // アジェンダ表示: 範囲なし（単一日付選択のみ）
        return undefined;

      default:
        return undefined;
    }
  }, [navigation]);

  return (
    <SidebarShell>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* ミニカレンダー（PCのみ - モバイルはヘッダーのポップアップ） */}
        <div className="hidden shrink-0 md:block">
          <MiniCalendar
            selectedDate={navigation?.currentDate}
            displayRange={displayRange}
            onDateSelect={(date) => {
              if (date && navigation) {
                navigation.navigateToDate(date, true);
              }
            }}
            className="w-full bg-transparent"
          />
        </div>

        {/* ビュー切り替え（モバイルのみ） */}
        <ViewSwitcherList />

        {/* カレンダーフィルター */}
        <CalendarFilterList />
      </div>
    </SidebarShell>
  );
}
