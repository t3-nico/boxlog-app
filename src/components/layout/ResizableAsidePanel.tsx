'use client';

import type { ReactNode } from 'react';

import { useTranslations } from 'next-intl';

import { AppAside, type AsideType } from '@/components/layout/AppAside';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useResizeHandle } from '@/hooks/useResizeHandle';
import { cn } from '@/lib/utils';
import { useLayoutStore } from '@/stores/useLayoutStore';

interface ResizableAsidePanelProps {
  children: ReactNode;
  asideType: AsideType;
  onAsideChange: (type: AsideType) => void;
  renderContent: (type: AsideType) => ReactNode;
  isMobile: boolean;
  sheetAriaLabel?: string;
}

/**
 * リサイズ可能なアサイドパネル付きレイアウト
 *
 * children（メインコンテンツ列）+ リサイズハンドル + アサイド列を
 * flex row で並べる。モバイルでは全画面 Sheet で表示。
 *
 * CalendarLayout と StatsPageContent で共通利用。
 */
export function ResizableAsidePanel({
  children,
  asideType,
  onAsideChange,
  renderContent,
  isMobile,
  sheetAriaLabel,
}: ResizableAsidePanelProps) {
  const t = useTranslations();
  const asideSize = useLayoutStore.use.asideSize();
  const setAsideSize = useLayoutStore.use.setAsideSize();
  const { percent, isResizing, handleMouseDown, containerRef } = useResizeHandle({
    initialPercent: asideSize,
    onResizeEnd: setAsideSize,
  });

  const showAside = asideType && asideType !== 'none';

  return (
    <>
      <div ref={containerRef} className="flex min-h-0 flex-1">
        {/* 左カラム: メインコンテンツ */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>

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
                asideType={asideType}
                onAsideChange={onAsideChange}
                renderContent={renderContent}
              />
            </div>
          )}
        </aside>
      </div>

      {/* モバイル: アサイドを全画面 Sheet で表示 */}
      {isMobile && asideType !== 'none' && (
        <Sheet open={!!showAside} onOpenChange={(open) => !open && onAsideChange('none')}>
          <SheetContent
            side="right"
            className="w-full p-0 sm:max-w-full"
            showCloseButton={false}
            aria-label={sheetAriaLabel ?? t('calendar.aside.open')}
          >
            <AppAside
              asideType={asideType}
              onAsideChange={onAsideChange}
              renderContent={renderContent}
            />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
