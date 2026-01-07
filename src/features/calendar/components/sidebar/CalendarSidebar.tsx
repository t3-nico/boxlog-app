'use client';

import { useMemo, useState } from 'react';

import { addDays, endOfWeek, startOfDay, startOfWeek, subDays } from 'date-fns';
import { CalendarDays, ListTodo } from 'lucide-react';

import { MiniCalendar } from '@/components/common/MiniCalendar';
import { useCalendarNavigation } from '@/features/calendar/contexts/CalendarNavigationContext';
import { SidebarShell } from '@/features/navigation/components/sidebar/SidebarShell';
import { SidebarTabLayout } from '@/features/navigation/components/sidebar/SidebarTabLayout';
import type { SidebarTab } from '@/features/navigation/components/sidebar/types';
import { useTranslations } from 'next-intl';

import { CalendarFilterList } from './CalendarFilterList';
import { OpenCardList } from './open/OpenCardList';
import { OpenNavigation, type OpenSort } from './open/OpenNavigation';
import { ViewSwitcherList } from './ViewSwitcherList';

/**
 * CalendarSidebar - カレンダーページ専用サイドバー
 *
 * SidebarShellを使用して共通の外枠を提供し、
 * SidebarTabLayoutでタブUIを実装。
 *
 * **タブ構成**:
 * - Open: 未スケジュールのopenプラン一覧（ソート機能付き）
 * - View: ミニカレンダー（日付選択・月移動）
 */
export function CalendarSidebar() {
  const navigation = useCalendarNavigation();
  const t = useTranslations();

  const [sort, setSort] = useState<OpenSort>('updated');

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

  const tabs: SidebarTab[] = [
    {
      value: 'view',
      label: t('calendar.sidebar.tabs.view'),
      icon: CalendarDays,
      content: (
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
      ),
    },
    {
      value: 'open',
      label: t('calendar.sidebar.tabs.open'),
      icon: ListTodo,
      content: (
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* ナビゲーションコンテナ: 上padding 8pxのみ */}
          <div className="shrink-0 px-4 pt-2">
            <OpenNavigation sort={sort} onSortChange={setSort} />
          </div>
          {/* カードリストコンテナ - パディングはOpenCardList内で管理 */}
          <div className="min-h-0 flex-1 overflow-hidden">
            <OpenCardList sort={sort} />
          </div>
        </div>
      ),
    },
  ];

  return (
    <SidebarShell title={t('sidebar.navigation.calendar')}>
      <SidebarTabLayout tabs={tabs} defaultTab="view" />
    </SidebarShell>
  );
}
