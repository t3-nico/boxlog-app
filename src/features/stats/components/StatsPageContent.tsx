'use client';

import { PanelLeft, PanelRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { FeatureErrorBoundary } from '@/components/error-boundary';
import { AppAside, type AsideType } from '@/components/layout/AppAside';
import { HeaderUtilities } from '@/components/layout/HeaderUtilities';
import { MobileMenuButton } from '@/components/layout/MobileMenuButton';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { HoverTooltip } from '@/components/ui/tooltip';
import { DateNavigator } from '@/core/components/DateNavigator';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useResizeHandle } from '@/hooks/useResizeHandle';
import { cn } from '@/lib/utils';
import { useLayoutStore } from '@/stores/useLayoutStore';

import type { StatsGranularity } from '../stores/useStatsFilterStore';
import { useStatsFilterStore } from '../stores/useStatsFilterStore';
import { StatsDateDisplay } from './layout/StatsDateDisplay';
import { StatsGranularitySelector } from './layout/StatsGranularitySelector';
import { StatsView } from './StatsView';

interface StatsPageContentProps {
  /** アサイドパネルのコンテンツレンダラー（page.tsxから注入） */
  renderAsideContent?: (asideType: AsideType) => React.ReactNode;
  /** ヘッダー右側のカスタムスロット（PageSwitcher など） */
  headerSlot?: React.ReactNode;
}

const TODAY_LABEL_KEYS: Record<StatsGranularity, string> = {
  day: 'common.time.today',
  week: 'common.time.thisWeek',
  month: 'common.time.thisMonth',
  year: 'calendar.stats.thisYear',
};

/**
 * Stats ページのクライアントエントリポイント
 *
 * CalendarController を経由せず、Stats を直接レンダリングする。
 * CalendarLayout と同じヘッダー + Aside 構造を持つ。
 */
export function StatsPageContent({ renderAsideContent, headerSlot }: StatsPageContentProps) {
  const t = useTranslations();
  const isMobile = useMediaQuery('(max-width: 767px)');

  // サイドバー
  const isSidebarOpen = useLayoutStore.use.sidebarOpen();
  const openSidebar = useLayoutStore.use.openSidebar();

  // アサイド状態（Zustand永続化）
  const currentAside = useLayoutStore.use.asideType();
  const setCurrentAside = useLayoutStore.use.setAside();

  const showAside = currentAside && currentAside !== 'none';

  // アサイドリサイズ
  const asideSize = useLayoutStore.use.asideSize();
  const setAsideSize = useLayoutStore.use.setAsideSize();
  const { percent, isResizing, handleMouseDown, containerRef } = useResizeHandle({
    initialPercent: asideSize,
    onResizeEnd: setAsideSize,
  });

  // Stats ナビゲーション
  const granularity = useStatsFilterStore((s) => s.granularity);
  const currentDate = useStatsFilterStore((s) => s.currentDate);
  const setGranularity = useStatsFilterStore((s) => s.setGranularity);
  const navigate = useStatsFilterStore((s) => s.navigate);

  const todayLabel = t(TODAY_LABEL_KEYS[granularity]);

  return (
    <div
      ref={containerRef}
      className="bg-background flex h-full min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="flex min-h-0 flex-1">
        {/* 左カラム: ヘッダー + Stats コンテンツ */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* ヘッダー（CalendarHeader と同じ h-12） */}
          <header className="bg-background relative h-12 px-4 py-2">
            <div className="flex h-8 items-center justify-between">
              {/* 左側: メニュー + 日付表示 + コントロール群 */}
              <div className="flex items-center gap-2">
                {/* サイドバー開くボタン（PCのみ、サイドバーが閉じている時のみ表示） */}
                {!isSidebarOpen && (
                  <HoverTooltip content={t('sidebar.openSidebar')} side="bottom">
                    <Button
                      variant="ghost"
                      icon
                      className="hidden size-8 md:flex"
                      onClick={openSidebar}
                      aria-label={t('sidebar.openSidebar')}
                    >
                      <PanelLeft className="size-4" />
                    </Button>
                  </HoverTooltip>
                )}
                <MobileMenuButton className="md:hidden" />

                {/* 日付コンテキスト表示 */}
                <StatsDateDisplay currentDate={currentDate} granularity={granularity} />

                {/* コントロール群 - PC のみ */}
                <div className="ml-2 hidden items-center md:flex">
                  {/* 日付ナビゲーション（< 今週 >） */}
                  <DateNavigator onNavigate={navigate} todayLabel={todayLabel} arrowSize="md" />

                  {/* 粒度セレクター [日|週|月|年] */}
                  <StatsGranularitySelector
                    className="ml-4"
                    granularity={granularity}
                    onGranularityChange={setGranularity}
                  />
                </div>
              </div>

              {/* 右側: 検索 + ページ切替 + アサイドトグル */}
              <div className="hidden items-center gap-2 md:flex">
                <HeaderUtilities />
                {headerSlot}
                {!showAside && (
                  <HoverTooltip content={t('calendar.aside.open')} side="bottom">
                    <Button
                      variant="ghost"
                      icon
                      className="size-8"
                      onClick={() => setCurrentAside('chat')}
                      aria-label={t('calendar.aside.open')}
                    >
                      <PanelRight className="size-4" />
                    </Button>
                  </HoverTooltip>
                )}
              </div>
            </div>
          </header>

          {/* Stats コンテンツ */}
          <FeatureErrorBoundary featureName="stats">
            <StatsView />
          </FeatureErrorBoundary>
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
          {showAside && (
            <div className="bg-container h-full">
              <AppAside
                asideType={currentAside}
                onAsideChange={setCurrentAside}
                renderContent={renderAsideContent}
              />
            </div>
          )}
        </aside>
      </div>

      {/* モバイル: アサイドを全画面 Sheet で表示 */}
      {isMobile && currentAside && (
        <Sheet open={!!showAside} onOpenChange={(open) => !open && setCurrentAside('none')}>
          <SheetContent
            side="right"
            className="w-full p-0 sm:max-w-full"
            showCloseButton={false}
            aria-label={t('calendar.aside.open')}
          >
            <AppAside
              asideType={currentAside}
              onAsideChange={setCurrentAside}
              renderContent={renderAsideContent}
            />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
