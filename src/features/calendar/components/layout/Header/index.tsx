'use client';

import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MobileMenuButton } from '@/features/navigation/components/mobile/MobileMenuButton';
import { NavigationTabs } from '@/features/navigation/components/navigation-tabs/NavigationTabs';
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
        {/* 左側: メニュー + 日付表示 + 日付ナビゲーション */}
        <div className="flex items-center gap-2">
          {/* モバイルメニューボタン */}
          <MobileMenuButton className="md:hidden" />

          {/* 現在の日付表示 */}
          <DateRangeDisplay
            date={currentDate}
            viewType={viewType}
            showWeekNumber={showWeekNumbers}
            clickable={showMiniCalendar}
            onDateSelect={onDateSelect ? (date) => date && onDateSelect(date) : undefined}
            displayRange={displayRange}
          />

          {/* ビュー切り替え - PC */}
          <div className="ml-2 hidden md:block">
            <ViewSwitcher
              options={viewOptions}
              currentView={viewType}
              onChange={(view) => onViewChange(view as CalendarViewType)}
            />
          </div>

          {/* 日付ナビゲーション（Today + 矢印）- PC */}
          <div className="hidden md:block">
            <DateNavigator onNavigate={onNavigate} arrowSize="md" />
          </div>

          {/* カスタムスロット（必要に応じて） */}
          {leftSlot}
        </div>

        {/* 右側: アクション */}
        <div className="flex items-center gap-2">
          {/* モバイル: 検索 + Today + ページ切り替え */}
          <div className="flex items-center gap-1 md:hidden">
            {/* ページ切り替えタブ */}
            <NavigationTabs />
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={openSearch}
              aria-label="検索"
            >
              <Search className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => onNavigate('today')}
              aria-label="今日に戻る"
            >
              <div className="relative flex size-6 flex-col">
                <div className="h-1.5 w-full border-b-2 border-current" />
                <div className="flex flex-1 items-center justify-center">
                  <span className="text-xs leading-none font-bold">{new Date().getDate()}</span>
                </div>
              </div>
            </Button>
          </div>

          {/* PC: ページ切り替え + アクション */}
          <div className="hidden items-center gap-2 md:flex">
            {/* アクションボタン */}
            {showActions != null && (
              <HeaderActions onSettings={onSettings} onExport={onExport} onImport={onImport} />
            )}
            {/* ページ切り替えタブ */}
            <NavigationTabs />
          </div>
        </div>
      </div>
    </header>
  );
};
