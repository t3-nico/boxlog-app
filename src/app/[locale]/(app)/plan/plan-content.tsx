'use client';

import { useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';

import { useLocale } from 'next-intl';

import { Spinner } from '@/components/ui/spinner';
import { MEDIA_QUERIES } from '@/config/ui/breakpoints';
import { useCalendarPanelStore } from '@/features/calendar/stores/useCalendarPanelStore';
import { PlanTableView } from '@/features/plans/components/PlanTableView';
import { useMediaQuery } from '@/hooks/useMediaQuery';

/**
 * Planコンテンツ with Suspense
 *
 * PC: カレンダー + サイドパネルにリダイレクト
 * モバイル: 従来通りフルページ表示
 */
export function PlanContent() {
  const isDesktop = useMediaQuery(MEDIA_QUERIES.desktop);
  const router = useRouter();
  const locale = useLocale();
  const openPanel = useCalendarPanelStore.use.openPanel();

  useEffect(() => {
    if (isDesktop) {
      openPanel('plan');
      router.replace(`/${locale}/calendar`);
    }
  }, [isDesktop, router, locale, openPanel]);

  // PC: リダイレクト中は Spinner を表示
  if (isDesktop) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // モバイル: 従来通り PlanTableView を表示
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Spinner size="lg" />
              <p className="text-muted-foreground text-sm">読み込み中...</p>
            </div>
          </div>
        }
      >
        <PlanTableView />
      </Suspense>
    </div>
  );
}
