'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { format } from 'date-fns';

import type { CalendarViewType } from '../types/calendar.types';
import { getMultiDayCount, isMultiDayView } from '../types/calendar.types';

interface CalendarNavigationContextValue {
  currentDate: Date;
  viewType: CalendarViewType;
  navigateToDate: (date: Date, updateUrl?: boolean) => void;
  changeView: (view: CalendarViewType) => void;
  navigateRelative: (direction: 'prev' | 'next' | 'today') => void;
}

const CalendarNavigationContext = createContext<CalendarNavigationContextValue | null>(null);

export const CalendarNavigationProvider = ({
  children,
  initialDate = new Date(),
  initialView = 'week' as CalendarViewType,
}: {
  children: React.ReactNode;
  initialDate?: Date;
  initialView?: CalendarViewType;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [viewType, setViewType] = useState<CalendarViewType>(initialView);

  // 現在のlocaleを取得（例: /ja/calendar/day -> ja）
  const locale = pathname?.split('/')[1] || 'ja';

  // 初期値の変更を検知して状態を更新（初回マウント時のみ）
  const initializedRef = React.useRef(false);

  React.useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      // 初期値が現在値と異なる場合のみ更新
      if (initialDate.getTime() !== currentDate.getTime()) {
        setCurrentDate(initialDate);
      }
      if (initialView !== viewType) {
        setViewType(initialView);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 初回マウント時のみ実行
  }, []);

  // 現在のビュータイプをパスから取得（URLと同期）
  const currentViewFromPath = pathname?.split('/').pop() as CalendarViewType | undefined;

  const navigateToDate = useCallback(
    (date: Date, updateUrl = false) => {
      setCurrentDate(date);

      // URLの更新が明示的に要求された場合のみ実行
      if (updateUrl) {
        const dateString = format(date, 'yyyy-MM-dd');
        // URLからの現在のビュータイプを使用（stateよりも信頼性が高い）
        const activeView = currentViewFromPath || viewType;
        const newUrl = `/${locale}/calendar/${activeView}?date=${dateString}`;
        router.push(newUrl, { scroll: false });
      }
    },
    [router, viewType, locale, currentViewFromPath],
  );

  const changeView = useCallback(
    (view: CalendarViewType) => {
      setViewType(view);
      const dateString = format(currentDate, 'yyyy-MM-dd');
      router.push(`/${locale}/calendar/${view}?date=${dateString}`);
    },
    [router, currentDate, locale],
  );

  const navigateRelative = useCallback(
    (direction: 'prev' | 'next' | 'today') => {
      let newDate: Date;

      if (direction === 'today') {
        newDate = new Date();
      } else {
        const multiplier = direction === 'next' ? 1 : -1;
        newDate = new Date(currentDate);

        if (isMultiDayView(viewType)) {
          newDate.setDate(currentDate.getDate() + getMultiDayCount(viewType) * multiplier);
        } else {
          switch (viewType) {
            case 'day':
              newDate.setDate(currentDate.getDate() + 1 * multiplier);
              break;
            case 'week':
              newDate.setDate(currentDate.getDate() + 7 * multiplier);
              break;
            default:
              newDate.setDate(currentDate.getDate() + 7 * multiplier);
          }
        }
      }

      navigateToDate(newDate, true); // URLも更新する
    },
    [currentDate, viewType, navigateToDate],
  );

  return (
    <CalendarNavigationContext.Provider
      value={{
        currentDate,
        viewType,
        navigateToDate,
        changeView,
        navigateRelative,
      }}
    >
      {children}
    </CalendarNavigationContext.Provider>
  );
};

export function useCalendarNavigation() {
  const context = useContext(CalendarNavigationContext);
  if (!context) {
    // カレンダーページ以外ではnullを返す
    return null;
  }
  return context;
}
