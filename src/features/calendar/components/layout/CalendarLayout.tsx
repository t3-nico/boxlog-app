'use client';

import { useTranslations } from 'next-intl';
import { memo, useCallback } from 'react';

import { MobileMenuButton } from '@/features/navigation/components/mobile/MobileMenuButton';
import { cn } from '@/lib/utils';

import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import type { CalendarViewType } from '../../types/calendar.types';

import { CalendarSidePanel } from '../panels/CalendarSidePanel';
import { CalendarHeader } from './Header';
import type { PanelType } from './Header/PanelSwitcher';

export interface CalendarLayoutProps {
  children: React.ReactNode;
  className?: string | undefined;

  // Header props
  viewType: CalendarViewType;
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onViewChange: (view: CalendarViewType) => void;

  // Header actions
  onSettings?: (() => void) | undefined;
  onExport?: (() => void) | undefined;
  onImport?: (() => void) | undefined;
  showHeaderActions?: boolean | undefined;

  // Date selection for mini calendar
  selectedDate?: Date | undefined;
  onDateSelect?: ((date: Date) => void) | undefined;

  // Display range for mini calendar highlight
  displayRange?:
    | {
        start: Date;
        end: Date;
      }
    | undefined;

  // Side panel
  currentPanel?: PanelType | undefined;
  onPanelChange?: ((panel: PanelType) => void) | undefined;
}

/**
 * カレンダー最上位レイアウトコンポーネント
 * ヘッダーとメインコンテンツを管理
 * モバイルでは左右スワイプで期間移動が可能
 */
export const CalendarLayout = memo<CalendarLayoutProps>(
  ({
    children,
    className,

    // Header
    viewType,
    currentDate,
    onNavigate,
    onViewChange,
    onSettings,
    onExport,
    onImport,
    showHeaderActions = false,

    // Date selection for mini calendar
    onDateSelect,
    displayRange,

    // Side panel
    currentPanel,
    onPanelChange,
  }) => {
    const t = useTranslations('calendar');

    // スワイプで前後の期間に移動
    const handleSwipeLeft = useCallback(() => {
      onNavigate('next');
    }, [onNavigate]);

    const handleSwipeRight = useCallback(() => {
      onNavigate('prev');
    }, [onNavigate]);

    // タッチイベントのみで動作（タッチイベントが発生 = タッチデバイス）
    const { handlers, ref } = useSwipeGesture(handleSwipeLeft, handleSwipeRight);

    // サイドパネルを表示するか
    const showSidePanel = currentPanel && currentPanel !== 'none';

    return (
      <div className={cn('calendar-layout bg-background flex h-full flex-col', className)}>
        {/* スクリーンリーダー用のページタイトル */}
        <h1 className="sr-only">{t('title')}</h1>
        {/* ヘッダー */}
        <CalendarHeader
          viewType={viewType}
          currentDate={currentDate}
          onNavigate={onNavigate}
          onViewChange={onViewChange}
          onSettings={onSettings}
          onExport={onExport}
          onImport={onImport}
          showActions={showHeaderActions}
          leftSlot={<MobileMenuButton className="md:hidden" />}
          onDateSelect={onDateSelect}
          showMiniCalendar={true}
          displayRange={displayRange}
          currentPanel={currentPanel}
          onPanelChange={onPanelChange}
        />

        {/* メインコンテンツ */}
        <div className="flex min-h-0 flex-1">
          {/* カレンダーコンテンツ（スワイプ対応） */}
          <main
            ref={ref as React.RefObject<HTMLElement>}
            data-calendar-main
            className="flex min-h-0 flex-1 flex-col"
            onTouchStart={handlers.onTouchStart}
            onTouchMove={handlers.onTouchMove}
            onTouchEnd={handlers.onTouchEnd}
          >
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          </main>

          {/* サイドパネル（デスクトップのみ、固定幅） */}
          {showSidePanel && (
            <aside className="border-border hidden h-full w-80 shrink-0 border-l md:block">
              <CalendarSidePanel panelType={currentPanel} />
            </aside>
          )}
        </div>
      </div>
    );
  },
);

CalendarLayout.displayName = 'CalendarLayout';
