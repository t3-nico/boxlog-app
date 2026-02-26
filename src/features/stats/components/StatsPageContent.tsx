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
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useResizeHandle } from '@/hooks/useResizeHandle';
import { cn } from '@/lib/utils';
import { useAppAsideStore } from '@/stores/useAppAsideStore';
import { useSidebarStore } from '@/stores/useSidebarStore';

import { StatsView } from './StatsView';

interface StatsPageContentProps {
  /** アサイドパネルのコンテンツレンダラー（page.tsxから注入） */
  renderAsideContent?: (asideType: AsideType) => React.ReactNode;
}

/**
 * Stats ページのクライアントエントリポイント
 *
 * CalendarController を経由せず、Stats を直接レンダリングする。
 * CalendarLayout と同じヘッダー + Aside 構造を持つ。
 */
export function StatsPageContent({ renderAsideContent }: StatsPageContentProps) {
  const t = useTranslations();
  const isMobile = useMediaQuery('(max-width: 767px)');

  // サイドバー
  const isSidebarOpen = useSidebarStore.use.isOpen();
  const openSidebar = useSidebarStore.use.open();

  // アサイド状態（Zustand永続化）
  const currentAside = useAppAsideStore.use.asideType();
  const setCurrentAside = useAppAsideStore.use.setAside();

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
      className="bg-background flex h-full min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="flex min-h-0 flex-1">
        {/* 左カラム: ヘッダー + Stats コンテンツ */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* ヘッダー（CalendarHeader と同じ h-12） */}
          <header className="relative flex h-12 shrink-0 items-center justify-between px-4 py-2">
            {/* 左側 */}
            <div className="flex items-center gap-2">
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
              <h1 className="text-lg leading-8 font-bold">{t('calendar.views.stats')}</h1>
            </div>

            {/* 右側: 通知 + 検索 + アサイドトグル */}
            <div className="hidden items-center gap-2 md:flex">
              <HeaderUtilities />
              {!showAside && (
                <HoverTooltip content={t('calendar.aside.open')} side="bottom">
                  <Button
                    variant="ghost"
                    icon
                    className="size-8"
                    onClick={() => setCurrentAside('plan')}
                    aria-label={t('calendar.aside.open')}
                  >
                    <PanelRight className="size-4" />
                  </Button>
                </HoverTooltip>
              )}
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
