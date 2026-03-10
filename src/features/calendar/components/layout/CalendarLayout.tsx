'use client';

import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { memo, useCallback } from 'react';

import { Search } from 'lucide-react';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

import type { AsideType } from '@/components/layout/AppAside';
import { AppHeader } from '@/components/layout/AppHeader';
import { ResizableAsidePanel } from '@/components/layout/ResizableAsidePanel';
import { Button } from '@/components/ui/button';
import { DateNavigator } from '@/core/components/DateNavigator';
import { useGlobalSearch } from '@/hooks/use-global-search';
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import type { CalendarViewType } from '../../types/calendar.types';

// tiptap + AI SDK を初期バンドルから除外（LCP改善）
const AIInspectorContent = dynamic(
  () => import('@/features/ai/components/AIInspectorContent').then((mod) => mod.AIInspectorContent),
  { ssr: false },
);

import { DateRangeDisplay } from './Header/DateRangeDisplay';
import { ViewSwitcher } from './Header/ViewSwitcher';

export interface CalendarLayoutProps {
  children: React.ReactNode;
  className?: string | undefined;

  // Header props
  viewType: CalendarViewType;
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onViewChange: (view: CalendarViewType) => void;

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

  // Aside
  currentAside?: AsideType | undefined;
  onAsideChange?: ((aside: AsideType) => void) | undefined;

  // Header right slot (PageSwitcher など)
  rightSlot?: React.ReactNode | undefined;
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

    // Date selection for mini calendar
    onDateSelect,
    displayRange,

    // Aside
    currentAside,
    onAsideChange,

    // Header right slot
    rightSlot,
  }) => {
    const t = useTranslations('calendar');
    const { open: openSearch } = useGlobalSearch();
    const showWeekNumbers = useCalendarSettingsStore((state) => state.showWeekNumbers);

    // スワイプで前後の期間に移動
    const handleSwipeLeft = useCallback(() => {
      onNavigate('next');
    }, [onNavigate]);

    const handleSwipeRight = useCallback(() => {
      onNavigate('prev');
    }, [onNavigate]);

    // タッチイベントのみで動作（タッチイベントが発生 = タッチデバイス）
    const { handlers, ref } = useSwipeGesture(handleSwipeLeft, handleSwipeRight);

    // モバイル判定（md ブレークポイント = 768px 未満）
    const isMobile = useMediaQuery('(max-width: 767px)');

    const renderAsideContent = useCallback((type: AsideType) => {
      switch (type) {
        case 'chat':
          return <AIInspectorContent />;
        default:
          return null;
      }
    }, []);

    return (
      <div className={cn('calendar-layout bg-background flex h-full flex-col', className)}>
        {/* スクリーンリーダー用のページタイトル */}
        <h1 className="sr-only">{t('title')}</h1>

        <ResizableAsidePanel
          asideType={currentAside ?? 'none'}
          onAsideChange={onAsideChange ?? (() => {})}
          renderContent={renderAsideContent}
          isMobile={isMobile}
          sheetAriaLabel={t('aside.open')}
        >
          <AppHeader
            controls={
              <>
                <DateNavigator onNavigate={onNavigate} arrowSize="md" />
                <ViewSwitcher
                  className="ml-4"
                  currentView={viewType}
                  onChange={(view) => onViewChange(view as CalendarViewType)}
                />
              </>
            }
            rightSlot={rightSlot}
            mobileRightSlot={
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  icon
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={openSearch}
                  aria-label="検索"
                >
                  <Search className="size-5" />
                </Button>
                <Button
                  variant="ghost"
                  icon
                  size="sm"
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
            }
            {...(onAsideChange && {
              aside: { currentAside: currentAside ?? 'none', onAsideChange },
            })}
          >
            <DateRangeDisplay
              date={currentDate}
              viewType={viewType}
              showWeekNumber={showWeekNumbers}
              clickable={true}
              onDateSelect={onDateSelect ? (date) => date && onDateSelect(date) : undefined}
              displayRange={displayRange}
            />
          </AppHeader>

          {/* カレンダーコンテンツ（スワイプ対応） */}
          <div
            ref={ref as React.RefObject<HTMLDivElement>}
            data-calendar-main
            className="flex min-h-0 flex-1 flex-col"
            onTouchStart={handlers.onTouchStart}
            onTouchMove={handlers.onTouchMove}
            onTouchEnd={handlers.onTouchEnd}
          >
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          </div>
        </ResizableAsidePanel>
      </div>
    );
  },
);

CalendarLayout.displayName = 'CalendarLayout';
