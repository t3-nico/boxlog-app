'use client';

import { useEffect, useMemo } from 'react';

import { addDays, format, subDays } from 'date-fns';

import { usePlans } from '@/features/plans/hooks/usePlans';
import type { Plan } from '@/features/plans/types/plan';
import { isRecurringPlan } from '@/features/plans/utils/recurrence';
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import { useTags } from '@/features/tags/hooks';
import { logger } from '@/lib/logger';
import { api } from '@/lib/trpc';

import { useCalendarFilterStore } from '../../../stores/useCalendarFilterStore';

import { calculateViewDateRange } from '../../../lib/view-helpers';
import {
  expandRecurringPlansToCalendarPlans,
  type PlanInstanceException,
} from '../../../utils/planDataAdapter';

import type { CalendarPlan, CalendarViewType, ViewDateRange } from '../../../types/calendar.types';

interface UseCalendarDataOptions {
  viewType: CalendarViewType;
  currentDate: Date;
}

// サーバーからはformatPlanWithTagsで変換済みの形式が返る（tagIdsのみ）
interface PlanWithTagIds extends Plan {
  tagIds?: string[];
}

// tRPCから返る型（API定義から推論される）
type PlansApiResult = ReturnType<typeof usePlans>['data'];

interface UseCalendarDataResult {
  viewDateRange: ViewDateRange;
  filteredEvents: CalendarPlan[];
  allCalendarPlans: CalendarPlan[];
  plansData: PlansApiResult;
}

export function useCalendarData({
  viewType,
  currentDate,
}: UseCalendarDataOptions): UseCalendarDataResult {
  // 週の開始日設定を取得（usePlansに渡すため先に取得）
  const weekStartsOn = useCalendarSettingsStore((state) => state.weekStartsOn);

  // ビューに応じた期間計算（週の開始日設定を反映）
  // usePlansに日付範囲を渡すため、先に計算
  const viewDateRange = useMemo(() => {
    return calculateViewDateRange(viewType, currentDate, weekStartsOn);
  }, [viewType, currentDate, weekStartsOn]);

  // 日付範囲をISO 8601形式に変換（サーバーサイドフィルタ用）
  const dateFilter = useMemo(
    () => ({
      startDate: viewDateRange.start.toISOString(),
      endDate: viewDateRange.end.toISOString(),
    }),
    [viewDateRange],
  );

  // plansを取得（日付範囲フィルタで高速化）
  const { data: plansData } = usePlans(dateFilter);

  // タグマスタをプリフェッチ（TagsContainerで使用するためキャッシュをwarm up）
  // これにより、カードがレンダリングされる時点でタグ情報がキャッシュに存在する
  useTags();

  // tRPC utils（プリフェッチ用）
  const utils = api.useUtils();

  // 隣接期間のプリフェッチ（ナビゲーション高速化）
  useEffect(() => {
    const prefetchAdjacentPeriods = () => {
      // 前の期間
      const prevRange = calculateViewDateRange(viewType, subDays(currentDate, 7), weekStartsOn);
      void utils.plans.list.prefetch({
        startDate: prevRange.start.toISOString(),
        endDate: prevRange.end.toISOString(),
      });

      // 次の期間
      const nextRange = calculateViewDateRange(viewType, addDays(currentDate, 7), weekStartsOn);
      void utils.plans.list.prefetch({
        startDate: nextRange.start.toISOString(),
        endDate: nextRange.end.toISOString(),
      });
    };

    prefetchAdjacentPeriods();
  }, [currentDate, viewType, weekStartsOn, utils.plans.list]);

  // フィルター関数を取得（ストアに統一）
  const isPlanVisible = useCalendarFilterStore((state) => state.isPlanVisible);

  // 繰り返しプランのIDを抽出
  const recurringPlanIds = useMemo(() => {
    if (!plansData) return [];
    return plansData.filter((plan) => isRecurringPlan(plan)).map((plan) => plan.id);
  }, [plansData]);

  // 繰り返しプランの例外情報を取得（繰り返しプランがある場合のみ）
  const { data: instancesData } = api.plans.getInstances.useQuery(
    {
      planIds: recurringPlanIds,
      startDate: format(viewDateRange.start, 'yyyy-MM-dd'),
      endDate: format(viewDateRange.end, 'yyyy-MM-dd'),
    },
    {
      enabled: recurringPlanIds.length > 0,
      staleTime: 30 * 1000, // 30秒キャッシュ
    },
  );

  // 例外情報をMapに変換
  const exceptionsMap = useMemo(() => {
    const map = new Map<string, PlanInstanceException[]>();
    if (!instancesData) return map;

    for (const inst of instancesData) {
      const planId = inst.plan_id;
      if (!map.has(planId)) {
        map.set(planId, []);
      }
      map.get(planId)!.push({
        instanceDate: inst.instance_date,
        isException: inst.is_exception,
        exceptionType: inst.exception_type as 'modified' | 'cancelled' | 'moved' | undefined,
        overrides: inst.overrides as Record<string, unknown> | undefined,
        originalDate: inst.original_date ?? undefined,
      });
    }
    return map;
  }, [instancesData]);

  // 全プランをCalendarPlan型に変換（繰り返しプランを展開）
  const allCalendarPlans = useMemo(() => {
    if (!plansData) {
      return [];
    }

    // サーバーからはformatPlanWithTagsで変換済みのtagIds配列が返る
    const plansWithTagIds = plansData as PlanWithTagIds[];

    // start_time/end_timeが設定されているplanのみを抽出
    const plansWithTime = plansWithTagIds.filter((plan) => {
      return plan.start_time && plan.end_time;
    });

    // 繰り返しプランを展開してCalendarPlanに変換
    return expandRecurringPlansToCalendarPlans(
      plansWithTime,
      viewDateRange.start,
      viewDateRange.end,
      exceptionsMap,
    );
  }, [plansData, viewDateRange, exceptionsMap]);

  // 表示範囲のイベントをフィルタリング
  const filteredEvents = useMemo(() => {
    if (allCalendarPlans.length === 0) {
      return [];
    }

    // 表示範囲内のイベントのみをフィルタリング
    const startDateOnly = new Date(
      viewDateRange.start.getFullYear(),
      viewDateRange.start.getMonth(),
      viewDateRange.start.getDate(),
    );
    const endDateOnly = new Date(
      viewDateRange.end.getFullYear(),
      viewDateRange.end.getMonth(),
      viewDateRange.end.getDate(),
    );

    const filtered = allCalendarPlans.filter((event) => {
      // startDate/endDate が null の場合はスキップ
      if (!event.startDate || !event.endDate) {
        return false;
      }
      const eventStartDateOnly = new Date(
        event.startDate.getFullYear(),
        event.startDate.getMonth(),
        event.startDate.getDate(),
      );
      const eventEndDateOnly = new Date(
        event.endDate.getFullYear(),
        event.endDate.getMonth(),
        event.endDate.getDate(),
      );

      return (
        (eventStartDateOnly >= startDateOnly && eventStartDateOnly <= endDateOnly) ||
        (eventEndDateOnly >= startDateOnly && eventEndDateOnly <= endDateOnly) ||
        (eventStartDateOnly <= startDateOnly && eventEndDateOnly >= endDateOnly)
      );
    });

    // サイドバーのフィルター設定を適用（ストアのisPlanVisibleに統一）
    const visibilityFiltered = filtered.filter((event) => isPlanVisible(event.tagIds ?? []));

    logger.log(`[useCalendarData] plansフィルタリング:`, {
      totalPlans: allCalendarPlans.length,
      dateFiltered: filtered.length,
      visibilityFiltered: visibilityFiltered.length,
      dateRange: {
        start: startDateOnly.toDateString(),
        end: endDateOnly.toDateString(),
      },
      sampleEvents: visibilityFiltered.slice(0, 3).map((e) => ({
        title: e.title,
        startDate: e.startDate?.toISOString() ?? null,
        endDate: e.endDate?.toISOString() ?? null,
        tagIds: e.tagIds,
      })),
    });

    return visibilityFiltered;
  }, [viewDateRange, allCalendarPlans, isPlanVisible]);

  return {
    viewDateRange,
    filteredEvents,
    allCalendarPlans,
    plansData,
  };
}
