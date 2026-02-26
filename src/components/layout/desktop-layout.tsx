'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Suspense, useMemo } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { isCalendarViewPath } from '@/features/calendar';
import { AppSidebar } from '@/features/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSidebarStore } from '@/stores/useSidebarStore';

import { MainContentWrapper } from './main-content-wrapper';
import { SidebarContent } from './SidebarContent';
import { StatusBar } from './status-bar';

// LCP改善: StatusBarアイテムを遅延ロード（APIコール・ストア参照を含むため初回レンダリングをブロックしない）
const ScheduleStatusItem = dynamic(
  () =>
    import('./status-bar/items/ScheduleStatusItem').then((mod) => ({
      default: mod.ScheduleStatusItem,
    })),
  { ssr: false },
);
const ChronotypeStatusItem = dynamic(
  () =>
    import('./status-bar/items/ChronotypeStatusItem').then((mod) => ({
      default: mod.ChronotypeStatusItem,
    })),
  { ssr: false },
);
const TotalTimeStatusItem = dynamic(
  () =>
    import('./status-bar/items/TotalTimeStatusItem').then((mod) => ({
      default: mod.TotalTimeStatusItem,
    })),
  { ssr: false },
);

interface DesktopLayoutProps {
  children: React.ReactNode;
  locale: 'ja' | 'en';
}

// StatusBarアイテムのスケルトン（遅延ロード中の表示）
function StatusBarItemSkeleton() {
  return <div className="bg-surface-container h-3 w-20 animate-pulse rounded" />;
}

/**
 * デスクトップ用レイアウト
 *
 * 2カラムレイアウト:
 * - Sidebar（256px、開閉可能）← 全ページ共通 AppSidebar
 * - PageHeader + MainContent + Inspector
 */
export function DesktopLayout({ children, locale }: DesktopLayoutProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = !!user;
  const isSidebarOpen = useSidebarStore.use.isOpen();

  // ページ判定: 独自ヘッダーを持つページかどうか（PageHeader表示制御用）
  const hasOwnHeader = useMemo(() => {
    const pathWithoutLocale = pathname?.replace(new RegExp(`^/${locale}`), '') ?? '';
    return isCalendarViewPath(pathWithoutLocale) || pathWithoutLocale === '/stats';
  }, [pathname, locale]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* 上部エリア（サイドバー + コンテンツ） */}
      <div className="flex min-h-0 flex-1">
        {/* Sidebar（固定幅256px、開閉可能） */}
        <div
          className={cn(
            'h-full shrink-0 overflow-hidden transition-all duration-200',
            isSidebarOpen ? 'w-64' : 'w-0',
          )}
        >
          <div className="h-full w-64">
            <AppSidebar>
              <SidebarContent />
            </AppSidebar>
          </div>
        </div>

        {/* PageHeader + Main Content + Inspector */}
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* PageHeader（Calendar/Statsは独自ヘッダーを持つため非表示） */}
          {!hasOwnHeader && <PageHeader />}

          {/* Main Content + Inspector（自動的に残りのスペースを使用） */}
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="relative flex h-full min-h-0 flex-col">
              <MainContentWrapper>{children}</MainContentWrapper>
            </div>
          </div>
        </div>
      </div>

      {/* ステータスバー（全幅、ログイン後のみ表示） */}
      {isAuthenticated ? (
        <StatusBar>
          <StatusBar.Left>
            <Suspense fallback={<StatusBarItemSkeleton />}>
              <ScheduleStatusItem />
            </Suspense>
            <Suspense fallback={<StatusBarItemSkeleton />}>
              <TotalTimeStatusItem />
            </Suspense>
          </StatusBar.Left>
          <StatusBar.Right>
            <Suspense fallback={<StatusBarItemSkeleton />}>
              <ChronotypeStatusItem />
            </Suspense>
          </StatusBar.Right>
        </StatusBar>
      ) : null}
    </div>
  );
}
