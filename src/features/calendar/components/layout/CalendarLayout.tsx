'use client';

import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { memo, useCallback } from 'react';

import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

import { AppAside, type AsideType } from '@/components/layout/AppAside';
import { useAppAsideStore } from '@/stores/useAppAsideStore';
import { PlanListPanel } from '../aside/PlanListPanel';
import { RecordListPanel } from '../aside/RecordListPanel';

// tiptap + AI SDK を初期バンドルから除外（LCP改善）
const AIInspectorContent = dynamic(
  () => import('@/features/ai/components/AIInspectorContent').then((mod) => mod.AIInspectorContent),
  { ssr: false },
);

import { useResizeHandle } from '../../hooks/useResizeHandle';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import type { CalendarViewType } from '../../types/calendar.types';

import { CalendarHeader } from './Header';

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

  // Aside
  currentAside?: AsideType | undefined;
  onAsideChange?: ((aside: AsideType) => void) | undefined;
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

    // Aside
    currentAside,
    onAsideChange,
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

    // モバイル判定（md ブレークポイント = 768px 未満）
    const isMobile = useMediaQuery('(max-width: 767px)');

    // アサイドを表示するか
    const showAside = currentAside && currentAside !== 'none';

    // アサイドリサイズ
    const asideSize = useAppAsideStore.use.asideSize();
    const setAsideSize = useAppAsideStore.use.setAsideSize();
    const { percent, isResizing, handleMouseDown, containerRef } = useResizeHandle({
      initialPercent: asideSize,
      onResizeEnd: setAsideSize,
    });

    return (
      <div
        ref={containerRef}
        className={cn('calendar-layout bg-background flex h-full flex-col', className)}
      >
        {/* スクリーンリーダー用のページタイトル */}
        <h1 className="sr-only">{t('title')}</h1>

        {/* 左右カラム分割（ヘッダー行からアサイドが独立） */}
        <div className="flex min-h-0 flex-1">
          {/* 左カラム: ヘッダー + カレンダー */}
          <div className="flex min-h-0 flex-1 flex-col">
            <CalendarHeader
              viewType={viewType}
              currentDate={currentDate}
              onNavigate={onNavigate}
              onViewChange={onViewChange}
              onSettings={onSettings}
              onExport={onExport}
              onImport={onImport}
              showActions={showHeaderActions}
              onDateSelect={onDateSelect}
              showMiniCalendar={true}
              displayRange={displayRange}
              currentAside={currentAside}
              onAsideChange={onAsideChange}
            />

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
          </div>

          {/* リサイズハンドル（デスクトップ、パネルオープン時のみ） */}
          {showAside && (
            <div
              role="separator"
              aria-orientation="vertical"
              className={cn(
                'bg-border hidden w-px shrink-0 cursor-col-resize md:block',
                'hover:bg-primary active:bg-primary',
                'after:absolute after:inset-y-0 after:left-1/2 after:w-2 after:-translate-x-1/2',
                'relative',
                isResizing && 'bg-primary',
              )}
              onMouseDown={handleMouseDown}
            />
          )}

          {/* 右カラム: アサイド（デスクトップのみ） */}
          <aside
            className={cn(
              'hidden shrink-0 overflow-hidden md:block',
              !isResizing && 'transition-all duration-200',
            )}
            style={{
              width: showAside ? `${percent}%` : 0,
              minWidth: showAside ? 288 : 0,
            }}
          >
            {showAside && onAsideChange && (
              <div className="bg-container h-full">
                <AppAside
                  asideType={currentAside}
                  onAsideChange={onAsideChange}
                  renderContent={(type) => {
                    switch (type) {
                      case 'plan':
                        return <PlanListPanel />;
                      case 'record':
                        return <RecordListPanel />;
                      case 'chat':
                        return <AIInspectorContent />;
                      default:
                        return null;
                    }
                  }}
                />
              </div>
            )}
          </aside>
        </div>

        {/* モバイル: アサイドを全画面 Sheet で表示 */}
        {isMobile && onAsideChange && currentAside && (
          <Sheet open={!!showAside} onOpenChange={(open) => !open && onAsideChange('none')}>
            <SheetContent
              side="right"
              className="w-full p-0 sm:max-w-full"
              showCloseButton={false}
              aria-label={t('aside.open')}
            >
              <AppAside
                asideType={currentAside}
                onAsideChange={onAsideChange}
                renderContent={(type) => {
                  switch (type) {
                    case 'plan':
                      return <PlanListPanel />;
                    case 'record':
                      return <RecordListPanel />;
                    case 'chat':
                      return <AIInspectorContent />;
                    default:
                      return null;
                  }
                }}
              />
            </SheetContent>
          </Sheet>
        )}
      </div>
    );
  },
);

CalendarLayout.displayName = 'CalendarLayout';
