'use client';

import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useGlobalSearch } from '@/features/search/hooks/use-global-search';
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';

import type { CalendarViewType } from '../../../types/calendar.types';

import { DateNavigator } from './DateNavigator';
import { DateRangeDisplay } from './DateRangeDisplay';
import { HeaderActions } from './HeaderActions';
import { ViewSwitcher } from './ViewSwitcher';

interface CalendarHeaderProps {
  viewType: CalendarViewType;
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onViewChange: (view: CalendarViewType) => void;
  // オプションのアクション
  onSettings?: (() => void) | undefined;
  onExport?: (() => void) | undefined;
  onImport?: (() => void) | undefined;
  showActions?: boolean | undefined;
  // 左側のカスタムコンテンツ（モバイルメニューボタンなど）
  leftSlot?: React.ReactNode | undefined;
  // 日付選択機能
  onDateSelect?: ((date: Date) => void) | undefined;
  showMiniCalendar?: boolean | undefined;
  // 現在表示している期間（MiniCalendarでのハイライト用）
  displayRange?:
    | {
        start: Date;
        end: Date;
      }
    | undefined;
}

const viewOptions = [
  { value: 'day' as CalendarViewType, label: 'Day', shortcut: 'D' },
  { value: '3day' as CalendarViewType, label: '3 Days', shortcut: '3' },
  { value: '5day' as CalendarViewType, label: '5 Days', shortcut: '5' },
  { value: 'week' as CalendarViewType, label: 'Week', shortcut: 'W' },
  { value: 'agenda' as CalendarViewType, label: 'Agenda', shortcut: 'A' },
];

/**
 * カレンダーヘッダー（ナビゲーション部分）
 * 共通コンポーネントを組み合わせたカレンダーヘッダー
 *
 * **デザイン仕様**:
 * - 全体の高さ: 48px固定（h-12）
 * - 上下パディング: 8px（py-2）
 * - コンテナ: 32px（h-8）
 * - 8pxグリッドシステム準拠
 *
 * **レイアウト（PC）**:
 * - 左側: 日付表示
 * - 右側: ViewSwitcher + Today + ナビゲーション矢印 + アクション
 *
 * **レイアウト（モバイル）**:
 * - 左側: メニュー + 日付表示
 * - 右側: なし（スワイプでナビゲーション、ビュー切り替えはサイドバー）
 */
export const CalendarHeader = ({
  viewType,
  currentDate,
  onNavigate,
  onViewChange,
  onSettings,
  onExport,
  onImport,
  showActions = false,
  leftSlot,
  onDateSelect,
  showMiniCalendar = false,
  displayRange,
}: CalendarHeaderProps) => {
  const { open: openSearch } = useGlobalSearch();
  const showWeekNumbers = useCalendarSettingsStore((state) => state.showWeekNumbers);

  return (
    <header className="bg-background relative h-12 px-4 py-2">
      <div className="flex h-8 items-center justify-between">
        {/* 左側: カスタムスロット + 日付表示 */}
        <div className="flex items-center gap-4">
          {/* カスタムスロット（モバイルメニューボタンなど） */}
          {leftSlot}

          {/* 現在の日付表示 */}
          <DateRangeDisplay
            date={currentDate}
            viewType={viewType}
            showWeekNumber={showWeekNumbers}
            clickable={showMiniCalendar}
            onDateSelect={onDateSelect ? (date) => date && onDateSelect(date) : undefined}
            displayRange={displayRange}
          />
        </div>

        {/* 右側（モバイル）: 検索 + Todayボタン */}
        <div className="flex items-center gap-1 md:hidden">
          {/* 検索ボタン */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground size-8"
            onClick={openSearch}
            aria-label="検索"
          >
            <Search className="size-6" />
          </Button>

          {/* Todayボタン（今日の日付を表示するカレンダーアイコン風） */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground size-8"
            onClick={() => onNavigate('today')}
            aria-label="今日に戻る"
          >
            <div className="relative flex size-6 flex-col">
              <div className="h-1.5 w-full border-b-2 border-current" />
              <div className="flex flex-1 items-center justify-center">
                <span className="text-xs leading-none font-semibold">{new Date().getDate()}</span>
              </div>
            </div>
          </Button>
        </div>

        {/* 右側（PC）: ビュー切り替え + ナビゲーション + アクション */}
        <div className="hidden items-center gap-2 md:flex">
          {/* ビュー切り替え */}
          <ViewSwitcher
            options={viewOptions}
            currentView={viewType}
            onChange={(view) => onViewChange(view as CalendarViewType)}
          />

          {/* 日付ナビゲーション（Today + 矢印） */}
          <DateNavigator onNavigate={onNavigate} arrowSize="md" />

          {/* アクションボタン */}
          {showActions != null && (
            <HeaderActions onSettings={onSettings} onExport={onExport} onImport={onImport} />
          )}
        </div>
      </div>
    </header>
  );
};
