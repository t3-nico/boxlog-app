'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { isCalendarViewPath } from '@/features/calendar';
import { AppSidebar } from '@/features/navigation';
import { NotificationDropdown } from '@/features/notifications';
import { cn } from '@/lib/utils';
import { useLayoutStore } from '@/stores/useLayoutStore';

import { MainContentWrapper } from './main-content-wrapper';
import { SidebarContent } from './SidebarContent';

interface DesktopLayoutProps {
  children: React.ReactNode;
  locale: 'ja' | 'en';
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
  const isSidebarOpen = useLayoutStore.use.sidebarOpen();

  // ページ判定: 独自ヘッダーを持つページかどうか（PageHeader表示制御用）
  const hasOwnHeader = useMemo(() => {
    const pathWithoutLocale = pathname?.replace(new RegExp(`^/${locale}`), '') ?? '';
    return isCalendarViewPath(pathWithoutLocale) || pathWithoutLocale === '/stats';
  }, [pathname, locale]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1">
        {/* Sidebar（固定幅256px、開閉可能） */}
        <div
          className={cn(
            'h-full shrink-0 overflow-hidden transition-all duration-200',
            isSidebarOpen ? 'w-64' : 'w-0',
          )}
        >
          <div className="h-full w-64">
            <AppSidebar headerActions={<NotificationDropdown size="sm" />}>
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
    </div>
  );
}
