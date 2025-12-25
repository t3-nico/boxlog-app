import { useMemo } from 'react';

import type { CalendarViewType } from '../types/calendar.types';

interface CalendarProviderProps {
  initialDate: Date;
  initialView: CalendarViewType;
}

interface UseCalendarProviderPropsReturn {
  isCalendarPage: boolean;
  calendarProviderProps: CalendarProviderProps | null;
}

/**
 * カレンダーページ判定とProvider設定を提供するフック
 *
 * パフォーマンス最適化:
 * - useMemoで結果をメモ化
 * - pathname/searchParamsが変わらなければ再計算しない
 *
 * @param pathname - 現在のパス
 * @param searchParams - URLSearchParams
 * @returns カレンダーページ判定とProvider設定
 */
export function useCalendarProviderProps(
  pathname: string,
  searchParams: URLSearchParams,
): UseCalendarProviderPropsReturn {
  // searchParamsからdate値を取得（useMemoの依存配列用）
  const dateParam = searchParams.get('date');

  return useMemo(() => {
    // ロケールプレフィックス対応: /ja/calendar, /en/calendar 等
    const isCalendarPage = pathname.includes('/calendar');

    if (!isCalendarPage) {
      return { isCalendarPage, calendarProviderProps: null };
    }

    const pathSegments = pathname.split('/');
    const view = pathSegments[pathSegments.length - 1] as CalendarViewType;

    let initialDate: Date | undefined;
    if (dateParam) {
      const parsedDate = new Date(dateParam);
      if (!isNaN(parsedDate.getTime())) {
        initialDate = parsedDate;
      }
    }

    return {
      isCalendarPage,
      calendarProviderProps: {
        initialDate: initialDate || new Date(),
        initialView: view || ('week' as CalendarViewType),
      },
    };
  }, [pathname, dateParam]);
}
