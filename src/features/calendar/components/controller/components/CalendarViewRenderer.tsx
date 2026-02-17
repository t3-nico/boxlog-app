'use client';

import React, { Suspense, useMemo } from 'react';

import type { CalendarViewType } from '../../../types/calendar.types';
import { getMultiDayCount, isMultiDayView } from '../../../types/calendar.types';
import type { GridViewProps } from '../../views/shared/types/base.types';

import { AgendaViewSkeleton } from './AgendaViewSkeleton';
import { CalendarViewSkeleton } from './CalendarViewSkeleton';

// 遅延ロード: カレンダービューコンポーネントは大きいため、使用時のみロード（絶対パスで指定）
// LCP改善: 個別にSuspenseをネストし、必要なビューのみロード
const DayView = React.lazy(() =>
  import('@/features/calendar/components/views/DayView').then((module) => ({
    default: module.DayView,
  })),
);
const WeekView = React.lazy(() =>
  import('@/features/calendar/components/views/WeekView').then((module) => ({
    default: module.WeekView,
  })),
);
const MultiDayView = React.lazy(() =>
  import('@/features/calendar/components/views/MultiDayView').then((module) => ({
    default: module.MultiDayView,
  })),
);
const AgendaView = React.lazy(() =>
  import('@/features/calendar/components/views/AgendaView').then((module) => ({
    default: module.AgendaView,
  })),
);
const TimesheetView = React.lazy(() =>
  import('@/features/calendar/components/views/TimesheetView').then((module) => ({
    default: module.TimesheetView,
  })),
);
const StatsView = React.lazy(() =>
  import('@/features/calendar/components/views/StatsView').then((module) => ({
    default: module.StatsView,
  })),
);

interface CalendarViewRendererProps {
  viewType: CalendarViewType;
  /** GridViewPropsを渡す（showWeekendsは含まれる） */
  commonProps: GridViewProps;
}

/**
 * CalendarViewRenderer - ビューレンダリング専用コンポーネント
 *
 * LCP改善: 各ビューを個別のSuspenseでラップし、選択されたビューのみロード
 * memo化により、propsが変更されない限り再レンダリングをスキップ
 * これにより、親コンポーネントの他の状態変更時の不要な再描画を防止
 */
export const CalendarViewRenderer = React.memo(function CalendarViewRenderer({
  viewType,
  commonProps,
}: CalendarViewRendererProps) {
  // LCP改善: ビューをメモ化して不要な再生成を防止
  const viewContent = useMemo(() => {
    // AgendaView用のBaseViewPropsを抽出（GridViewPropsの一部）
    const baseProps = {
      plans: commonProps.plans,
      currentDate: commonProps.currentDate,
      className: commonProps.className,
      onPlanClick: commonProps.onPlanClick,
      onPlanContextMenu: commonProps.onPlanContextMenu,
    };

    if (isMultiDayView(viewType)) {
      return (
        <Suspense fallback={<CalendarViewSkeleton />}>
          <MultiDayView dayCount={getMultiDayCount(viewType)} {...commonProps} />
        </Suspense>
      );
    }

    switch (viewType) {
      case 'day':
        return (
          <Suspense fallback={<CalendarViewSkeleton />}>
            <DayView {...commonProps} />
          </Suspense>
        );
      case 'week':
        return (
          <Suspense fallback={<CalendarViewSkeleton />}>
            <WeekView {...commonProps} />
          </Suspense>
        );
      case 'agenda':
        return (
          <Suspense fallback={<AgendaViewSkeleton />}>
            <AgendaView {...baseProps} />
          </Suspense>
        );
      case 'timesheet':
        return (
          <Suspense fallback={<AgendaViewSkeleton />}>
            <TimesheetView {...baseProps} />
          </Suspense>
        );
      case 'stats':
        return (
          <Suspense fallback={<AgendaViewSkeleton />}>
            <StatsView {...baseProps} />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<CalendarViewSkeleton />}>
            <DayView {...commonProps} />
          </Suspense>
        );
    }
  }, [viewType, commonProps]);

  // 外側のSuspenseはフォールバック用（初回ロード時のスケルトン表示）
  return <Suspense fallback={<CalendarViewSkeleton />}>{viewContent}</Suspense>;
});
