'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Suspense, useMemo } from 'react';

import { PageHeader } from '@/components/common/PageHeader';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { CalendarSidebar } from '@/features/calendar/components/sidebar/CalendarSidebar';
import { OnboardingBanner } from '@/features/onboarding';
import { SettingsSidebar } from '@/features/settings/components/sidebar';

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
 * 2カラムレイアウト:
 * - Sidebar（240px、常に表示）← ページごとに動的切り替え
 * - PageHeader + MainContent + Inspector
 */
export function DesktopLayout({ children, locale }: DesktopLayoutProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = !!user;

  // パフォーマンス最適化: ページ判定をメモ化（pathnameとlocale変更時のみ再計算）
  const currentPage = useMemo(() => {
    if (pathname?.startsWith(`/${locale}/calendar`)) return 'calendar';
    if (pathname?.startsWith(`/${locale}/plan`)) return 'plan';
    if (pathname?.startsWith(`/${locale}/record`)) return 'record';
    if (pathname?.startsWith(`/${locale}/stats`)) return 'stats';
    if (pathname?.startsWith(`/${locale}/settings`)) return 'settings';
    return 'default';
  }, [pathname, locale]);

  // Sidebarを表示するページ（Calendar, Settings のみ）
  const showSidebar = currentPage === 'calendar' || currentPage === 'settings';

  // サイドバーコンポーネントをメモ化（currentPage変更時のみ再計算）
  const SidebarComponent = useMemo(() => {
    switch (currentPage) {
      case 'calendar':
        return CalendarSidebar;
      case 'settings':
        return SettingsSidebar;
      default:
        return null;
    }
  }, [currentPage]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* オンボーディングバナー（クロノタイプ未設定時のみ表示） */}
      {isAuthenticated && <OnboardingBanner />}

      {/* 上部エリア（サイドバー + コンテンツ） */}
      <div className="flex min-h-0 flex-1">
        {/* Sidebar（256px固定）← Calendar/Settingsのみ表示 */}
        {showSidebar && SidebarComponent && (
          <div className="h-full w-64 shrink-0">
            <SidebarComponent />
          </div>
        )}

        {/* PageHeader + Main Content + Inspector */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* PageHeader（Calendar/Statsは独自ヘッダーを持つため非表示） */}
          {currentPage !== 'calendar' && currentPage !== 'stats' && <PageHeader />}

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
