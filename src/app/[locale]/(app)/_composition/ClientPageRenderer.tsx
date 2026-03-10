'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { useTranslations } from 'next-intl';

import { PageSwitcher } from '@/components/layout/PageSwitcher';
import type { CalendarViewType } from '@/features/calendar';
import { isCalendarViewPath } from '@/features/calendar';
import { StatsPageContent } from '@/features/stats';
import { useClientRouterStore } from '@/stores/useClientRouterStore';

import { CalendarViewClient } from '../calendar/_helpers/CalendarViewClient';
import { renderStatsAsideContent } from '../stats/StatsAsideContent';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPageType(pathname: string): 'calendar' | 'stats' | null {
  const segments = pathname.split('/');
  const pathWithoutLocale =
    segments.length >= 2 && (segments[1] === 'ja' || segments[1] === 'en')
      ? '/' + segments.slice(2).join('/')
      : pathname;

  if (isCalendarViewPath(pathWithoutLocale)) return 'calendar';
  if (pathWithoutLocale.startsWith('/stats')) return 'stats';
  return null;
}

function extractViewFromPathname(pathname: string): CalendarViewType {
  const segments = pathname.split('/');
  const lastSegment = segments[segments.length - 1] ?? '';
  // query string を除去
  const clean = lastSegment.split('?')[0] ?? '';

  if (['day', 'week', 'timesheet'].includes(clean)) {
    return clean as CalendarViewType;
  }
  const match = clean.match(/^(\d+)day$/);
  if (match) {
    const n = parseInt(match[1]!);
    if (n >= 2 && n <= 9) return clean as CalendarViewType;
  }
  return 'day';
}

// ---------------------------------------------------------------------------
// Sub-views (client-side rendered)
// ---------------------------------------------------------------------------

function CalendarClientView({ pathname }: { pathname: string }) {
  const t = useTranslations();
  const view = extractViewFromPathname(pathname);

  const translations = useMemo(
    () => ({
      errorTitle: t('calendar.errors.loadFailed'),
      errorMessage: t('calendar.errors.displayFailed'),
      reloadButton: t('common.reload'),
    }),
    [t],
  );

  return <CalendarViewClient view={view} initialDate={null} translations={translations} />;
}

function StatsClientView() {
  return (
    <StatsPageContent renderAsideContent={renderStatsAsideContent} headerSlot={<PageSwitcher />} />
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface ClientPageRendererProps {
  children: React.ReactNode;
}

/**
 * クライアントサイドページ切り替え
 *
 * 初回ロード / リロード時は Next.js が SSR した {children} をそのまま表示。
 * PageSwitcher が pushState + useClientRouterStore.switchToPage() を呼ぶと、
 * CalendarViewClient / StatsPageContent をクライアントサイドで直接レンダリングする。
 *
 * これにより router.push() のサーバーラウンドトリップを回避し、
 * ChatGPT ライクな「Sidebar 静止 / メインのみ切り替え」体験を実現する。
 */
export function ClientPageRenderer({ children }: ClientPageRendererProps) {
  const pathname = usePathname() ?? '/';
  const clientPage = useClientRouterStore((s) => s.clientPage);
  const switchToPage = useClientRouterStore((s) => s.switchToPage);
  const resetToServer = useClientRouterStore((s) => s.resetToServer);

  // ブラウザ戻る/進む時: pathname と clientPage を同期
  useEffect(() => {
    if (clientPage === null) return;

    const currentPageType = getPageType(pathname);
    if (currentPageType !== clientPage) {
      if (currentPageType === 'calendar' || currentPageType === 'stats') {
        switchToPage(currentPageType);
      } else {
        resetToServer();
      }
    }
  }, [pathname, clientPage, switchToPage, resetToServer]);

  if (clientPage === 'calendar') {
    return <CalendarClientView pathname={pathname} />;
  }

  if (clientPage === 'stats') {
    return <StatsClientView />;
  }

  return <>{children}</>;
}
