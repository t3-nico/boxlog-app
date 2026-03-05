'use client';

/**
 * CalendarViewClient - Composition Bridge
 *
 * ナビゲーション状態を管理し、useCalendarCompositionを呼び出して
 * CalendarControllerにデータとコールバックを渡すブリッジコンポーネント。
 *
 * CalendarController自体はpure view（@/features/* importゼロ）。
 * cross-feature依存の橋渡しはこのファイルが担当する。
 */

import { useCallback, useMemo } from 'react';

import { usePathname } from 'next/navigation';

import { format } from 'date-fns';

import { FeatureErrorBoundary } from '@/components/error-boundary';
import { PageSwitcher } from '@/components/layout/PageSwitcher';
import type { CalendarViewType } from '@/features/calendar';
import {
  CalendarController,
  CalendarProvider,
  useCalendarLayout,
  useCalendarNavigation,
} from '@/features/calendar';
import { logger } from '@/lib/logger';

import { useCalendarComposition } from '../_composition/useCalendarComposition';

interface CalendarViewClientProps {
  view: CalendarViewType;
  initialDate: Date | null;
  translations: {
    errorTitle: string;
    errorMessage: string;
    reloadButton: string;
  };
}

export function CalendarViewClient({ view, initialDate, translations }: CalendarViewClientProps) {
  const pathname = usePathname();
  const calendarNavigation = useCalendarNavigation();

  // 現在のlocaleを取得（例: /ja/day -> ja）
  const locale = pathname?.split('/')[1] || 'ja';

  const contextAvailable = calendarNavigation !== null;

  // URLを更新する関数
  const updateURL = useCallback(
    (newViewType: CalendarViewType, newDate?: Date) => {
      const dateToUse = newDate || new Date();
      const dateString = format(dateToUse, 'yyyy-MM-dd');
      // 既存のquery paramを保持しつつdateのみ更新
      const params = new URLSearchParams(window.location.search);
      params.set('date', dateString);
      const newURL = `/${locale}/calendar/${newViewType}?${params.toString()}`;
      logger.log('🔗 updateURL called:', { newViewType, dateToUse, newURL });
      window.history.pushState(null, '', newURL);
    },
    [locale],
  );

  // 初期日付をメモ化
  const stableInitialDate = useMemo(() => initialDate || new Date(), [initialDate]);

  // フォールバック: CalendarNavigationContextが利用できない場合
  const layoutHook = useCalendarLayout({
    initialViewType: view,
    initialDate: stableInitialDate,
    onViewChange: contextAvailable ? undefined : (v: CalendarViewType) => updateURL(v),
    onDateChange: contextAvailable ? undefined : (d: Date) => updateURL(view, d),
  });

  // ナビゲーション状態を解決（Context優先、フォールバックはlayoutHook）
  const viewType = contextAvailable ? calendarNavigation.viewType : layoutHook.viewType;
  const currentDate = contextAvailable ? calendarNavigation.currentDate : layoutHook.currentDate;
  const navigateRelative = contextAvailable
    ? calendarNavigation.navigateRelative
    : layoutHook.navigateRelative;
  const changeView = contextAvailable ? calendarNavigation.changeView : layoutHook.changeView;
  const navigateToDate = contextAvailable
    ? calendarNavigation.navigateToDate
    : layoutHook.navigateToDate;

  // Composition: 全cross-featureデータとコールバックを集約
  const composition = useCalendarComposition({
    viewType,
    currentDate,
    navigateRelative,
    navigateToDate,
    changeView,
  });

  // Context value: composition result + navigation state
  const calendarValue = useMemo(
    () => ({
      viewType,
      currentDate,
      ...composition,
    }),
    [viewType, currentDate, composition],
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <FeatureErrorBoundary
        featureName="calendar"
        fallback={
          <div className="flex h-full items-center justify-center p-4">
            <div className="border-destructive max-w-md rounded-2xl border p-6">
              <div className="text-center">
                <div className="mb-4 text-6xl">📅</div>
                <h2 className="text-destructive mb-2 text-2xl font-bold tracking-tight">
                  {translations.errorTitle}
                </h2>
                <p className="text-foreground/80 mb-4 text-sm">{translations.errorMessage}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-primary text-primary-foreground rounded px-4 py-2 transition-opacity hover:opacity-80"
                >
                  {translations.reloadButton}
                </button>
              </div>
            </div>
          </div>
        }
      >
        <CalendarProvider value={calendarValue}>
          <CalendarController rightSlot={<PageSwitcher />} />
        </CalendarProvider>
      </FeatureErrorBoundary>
    </div>
  );
}
