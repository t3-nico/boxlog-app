'use client';

import { useCallback } from 'react';

import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import { logger } from '@/lib/logger';

import { useWeekendNavigation } from '../../../hooks/useWeekendNavigation';

import type { CalendarViewType } from '../../../types/calendar.types';

interface UseCalendarNavigationHandlersOptions {
  viewType: CalendarViewType;
  currentDate: Date;
  showWeekends: boolean;
  navigateRelative: (direction: 'prev' | 'next' | 'today') => void;
  navigateToDate: (date: Date) => void;
  changeView: (view: CalendarViewType) => void;
}

export function useCalendarNavigationHandlers({
  viewType,
  currentDate,
  showWeekends,
  navigateRelative,
  navigateToDate,
  changeView,
}: UseCalendarNavigationHandlersOptions) {
  const updateSettings = useCalendarSettingsStore((state) => state.updateSettings);

  // 週末スキップナビゲーション（フック化）
  const { handleTodayWithWeekendSkip, handleWeekendSkipNavigation, adjustWeekendDate } =
    useWeekendNavigation({
      viewType,
      currentDate,
      showWeekends,
      navigateToDate,
    });

  // Navigation handlers using useCalendarLayout
  const handleNavigate = useCallback(
    (direction: 'prev' | 'next' | 'today') => {
      logger.log(
        '🧭 handleNavigate called:',
        direction,
        'current date:',
        currentDate,
        'viewType:',
        viewType,
        'showWeekends:',
        showWeekends,
      );

      // 特別な処理が必要かチェック
      const needsWeekendSkip = (viewType === 'day' || viewType === '3day') && !showWeekends;

      if (!needsWeekendSkip) {
        navigateRelative(direction);
        return;
      }

      // 週末スキップ処理
      if (direction === 'today') {
        if (handleTodayWithWeekendSkip()) {
          return;
        }
        navigateRelative(direction);
        return;
      }

      // prev/nextの週末スキップ処理
      if (handleWeekendSkipNavigation(direction)) {
        return;
      }

      // フォールバックとして通常処理
      navigateRelative(direction);
    },
    // handleTodayWithWeekendSkip, handleWeekendSkipNavigation は
    // advanced-use-latest パターンで安定化済み
    [navigateRelative, currentDate, viewType, showWeekends],
  );

  const handleViewChange = useCallback(
    (newView: CalendarViewType) => {
      changeView(newView);
    },
    [changeView],
  );

  // Navigation callback handlers
  const handleNavigatePrev = useCallback(() => handleNavigate('prev'), [handleNavigate]);
  const handleNavigateNext = useCallback(() => handleNavigate('next'), [handleNavigate]);
  const handleNavigateToday = useCallback(() => handleNavigate('today'), [handleNavigate]);

  // キーボードショートカット用
  const handleToggleWeekends = useCallback(() => {
    updateSettings({ showWeekends: !showWeekends });
  }, [updateSettings, showWeekends]);

  // 日付選択ハンドラー（週末調整フック使用）
  // adjustWeekendDate は advanced-use-latest パターンで安定化済み
  const handleDateSelect = useCallback(
    (date: Date) => {
      const adjustedDate = adjustWeekendDate(date);
      navigateToDate(adjustedDate);
    },
    [navigateToDate],
  );

  return {
    handleNavigate,
    handleViewChange,
    handleNavigatePrev,
    handleNavigateNext,
    handleNavigateToday,
    handleToggleWeekends,
    handleDateSelect,
  };
}
