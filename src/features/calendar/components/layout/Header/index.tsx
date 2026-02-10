'use client';

import { PanelLeft, PanelRight, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { HoverTooltip } from '@/components/ui/tooltip';
import { MobileMenuButton } from '@/features/navigation/components/mobile/MobileMenuButton';
import { useSidebarStore } from '@/features/navigation/stores/useSidebarStore';
import { useGlobalSearch } from '@/features/search/hooks/use-global-search';
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';

import type { CalendarViewType } from '../../../types/calendar.types';

import { DateNavigator } from './DateNavigator';
import { DateRangeDisplay } from './DateRangeDisplay';
import { HeaderActions } from './HeaderActions';
import type { PanelType } from './PanelSwitcher';
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
  // サイドパネル
  currentPanel?: PanelType | undefined;
  onPanelChange?: ((panel: PanelType) => void) | undefined;
}

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
  currentPanel = 'none',
  onPanelChange,
}: CalendarHeaderProps) => {
  const t = useTranslations();
  const { open: openSearch } = useGlobalSearch();
  const showWeekNumbers = useCalendarSettingsStore((state) => state.showWeekNumbers);
  const isSidebarOpen = useSidebarStore.use.isOpen();
  const openSidebar = useSidebarStore.use.open();

  return (
    <header className="bg-background relative h-12 px-4 py-2">
      <div className="flex h-8 items-center justify-between">
        {/* 左側: メニュー + 日付表示 + コントロール群 */}
        <div className="flex items-center gap-2">
          {/* サイドバー開くボタン（PCのみ、サイドバーが閉じている時のみ表示） */}
          {!isSidebarOpen && (
            <HoverTooltip content={t('sidebar.openSidebar')} side="bottom">
              <Button
                variant="ghost"
                size="icon"
                className="hidden size-8 md:flex"
                onClick={openSidebar}
                aria-label={t('sidebar.openSidebar')}
              >
                <PanelLeft className="size-4" />
              </Button>
            </HoverTooltip>
          )}

          {/* モバイルメニューボタン */}
          <MobileMenuButton className="md:hidden" />

          {/* 現在の日付表示 */}
          <DateRangeDisplay
            date={currentDate}
            viewType={viewType}
            showWeekNumber={showWeekNumbers}
            clickable={showMiniCalendar}
            onDateSelect={onDateSelect ? (date) => date && onDateSelect(date) : undefined}
          />

          {/* コントロール群 - PC（同グループなのでgap-2） */}
          <div className="ml-2 hidden items-center gap-2 md:flex">
            {/* 日付ナビゲーション（Today + 矢印） */}
            <DateNavigator onNavigate={onNavigate} arrowSize="md" />

            {/* ビュー切り替え */}
            <ViewSwitcher currentView={viewType} onChange={onViewChange} />
          </div>

          {/* カスタムスロット（必要に応じて） */}
          {leftSlot}
        </div>

        {/* 右側: アクション */}
        <div className="flex items-center gap-2">
          {/* モバイル: 検索 + Today */}
          <div className="flex items-center gap-1 md:hidden">
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

          {/* PC: パネルトグル + アクション */}
          <div className="hidden items-center gap-2 md:flex">
            {onPanelChange && currentPanel === 'none' && (
              <HoverTooltip content={t('calendar.panel.open')} side="bottom">
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mr-4 size-8"
                  onClick={() => onPanelChange('plan')}
                  aria-label="Open side panel"
                >
                  <PanelRight className="size-4" />
                </Button>
              </HoverTooltip>
            )}
            {showActions != null && (
              <HeaderActions onSettings={onSettings} onExport={onExport} onImport={onImport} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
