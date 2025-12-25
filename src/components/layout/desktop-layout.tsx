'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Suspense, useMemo } from 'react';

import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { CalendarSidebar } from '@/features/calendar/components/sidebar/CalendarSidebar';
import { InboxSidebarWrapper } from '@/features/inbox/components/InboxSidebarWrapper';
import { AppBar } from '@/features/navigation/components/appbar';
import { AppSidebar } from '@/features/navigation/components/sidebar/app-sidebar';
import { useSidebarStore } from '@/features/navigation/stores/useSidebarStore';
import { SettingsSidebar } from '@/features/settings/components/sidebar';
import { StatsSidebar } from '@/features/stats';
import { TagsSidebarWrapper } from '@/features/tags/components/TagsSidebarWrapper';

import { MainContentWrapper } from './main-content-wrapper';
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
 * 3カラムレイアウト:
 * - AppBar（64px、常に表示）
 * - Sidebar（240px、開閉可能）← ページごとに動的切り替え
 * - MainContent + Inspector
 */
export function DesktopLayout({ children, locale }: DesktopLayoutProps) {
  // selector化: isOpenのみ監視（toggle変更時の再レンダリングを防止）
  const isOpen = useSidebarStore((state) => state.isOpen);
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = !!user;

  // パフォーマンス最適化: ページ判定をメモ化（pathnameとlocale変更時のみ再計算）
  const currentPage = useMemo(() => {
    if (pathname?.startsWith(`/${locale}/calendar`)) return 'calendar';
    if (pathname?.startsWith(`/${locale}/inbox`)) return 'inbox';
    if (pathname?.startsWith(`/${locale}/tags`)) return 'tags';
    if (pathname?.startsWith(`/${locale}/stats`)) return 'stats';
    if (pathname?.startsWith(`/${locale}/settings`)) return 'settings';
    return 'default';
  }, [pathname, locale]);

  // サイドバーコンポーネントをメモ化（currentPage変更時のみ再計算）
  const SidebarComponent = useMemo(() => {
    switch (currentPage) {
      case 'calendar':
        return CalendarSidebar;
      case 'inbox':
        return InboxSidebarWrapper;
      case 'tags':
        return TagsSidebarWrapper;
      case 'stats':
        return StatsSidebar;
      case 'settings':
        return SettingsSidebar;
      default:
        return AppSidebar;
    }
  }, [currentPage]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* 上部エリア（AppBar + サイドバー + コンテンツ） */}
      <div className="flex min-h-0 flex-1">
        {/* AppBar（56px、固定幅、常に表示） */}
        <div className="w-14 shrink-0">
          <AppBar />
        </div>

        {/* サイドバー + コンテンツ */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1">
            {/* Sidebar（240px固定、開閉可能）← ページごとに動的切り替え */}
            {isOpen && (
              <div className="h-full w-60 shrink-0">
                <SidebarComponent />
              </div>
            )}

            {/* Main Content + Inspector（自動的に残りのスペースを使用） */}
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="relative flex h-full min-h-0 flex-col">
                <MainContentWrapper>{children}</MainContentWrapper>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ステータスバー（全幅、AppBarの下まで伸びる、ログイン後のみ表示） */}
      {isAuthenticated ? (
        <StatusBar>
          <StatusBar.Left>
            <Suspense fallback={<StatusBarItemSkeleton />}>
              <ScheduleStatusItem />
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
