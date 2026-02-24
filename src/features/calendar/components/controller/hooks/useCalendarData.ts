'use client';

import { useEffect, useMemo } from 'react';

import { addDays, format, subDays } from 'date-fns';

import { usePlans } from '@/features/plans/hooks/usePlans';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import type { Plan } from '@/features/plans/types/plan';
import { isRecurringPlan } from '@/features/plans/utils/recurrence';
import { useRecords } from '@/features/records/hooks';
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import { useTags } from '@/features/tags/hooks';
import { logger } from '@/lib/logger';
import { api } from '@/lib/trpc';

import { useCalendarFilterStore } from '../../../stores/useCalendarFilterStore';

import { calculateViewDateRange } from '../../../lib/view-helpers';
import {
  expandRecurringPlansToCalendarPlans,
  recordsToCalendarPlans,
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

  // recordsを取得（日付範囲フィルタ）
  // service.list は常に plan 情報を含めて返す（RecordWithPlan型）
  // Plans と同じキャッシュ戦略・retry設定を適用（リアルタイム性が重要）
  const { data: recordsData } = useRecords({
    worked_at_from: format(viewDateRange.start, 'yyyy-MM-dd'),
    worked_at_to: format(viewDateRange.end, 'yyyy-MM-dd'),
  });

  // タグマスタをプリフェッチ（TagsContainerで使用するためキャッシュをwarm up）
  // これにより、カードがレンダリングされる時点でタグ情報がキャッシュに存在する
  useTags();

  // tRPC utils（プリフェッチ用）
  const utils = api.useUtils();

  // 隣接期間のプリフェッチ（ナビゲーション高速化）
  // Plans と Records 両方をプリフェッチして、週ナビゲーション時の体験を向上
  useEffect(() => {
    const prefetchAdjacentPeriods = () => {
      // 前の期間
      const prevRange = calculateViewDateRange(viewType, subDays(currentDate, 7), weekStartsOn);
      void utils.plans.list.prefetch({
        startDate: prevRange.start.toISOString(),
        endDate: prevRange.end.toISOString(),
      });
      void utils.records.list.prefetch({
        worked_at_from: format(prevRange.start, 'yyyy-MM-dd'),
        worked_at_to: format(prevRange.end, 'yyyy-MM-dd'),
      });

      // 次の期間
      const nextRange = calculateViewDateRange(viewType, addDays(currentDate, 7), weekStartsOn);
      void utils.plans.list.prefetch({
        startDate: nextRange.start.toISOString(),
        endDate: nextRange.end.toISOString(),
      });
      void utils.records.list.prefetch({
        worked_at_from: format(nextRange.start, 'yyyy-MM-dd'),
        worked_at_to: format(nextRange.end, 'yyyy-MM-dd'),
      });
    };

    prefetchAdjacentPeriods();
  }, [currentDate, viewType, weekStartsOn, utils.plans.list, utils.records.list]);

  // フィルター関数と状態を取得（ストアに統一）
  const isPlanVisible = useCalendarFilterStore((state) => state.isPlanVisible);
  const matchesTagFilter = useCalendarFilterStore((state) => state.matchesTagFilter);
  const visibleTypes = useCalendarFilterStore((state) => state.visibleTypes);
  // タグフィルタ変更時に useMemo を再実行させるためのリアクティブ依存
  const visibleTagIds = useCalendarFilterStore((state) => state.visibleTagIds);
  const showUntagged = useCalendarFilterStore((state) => state.showUntagged);

  // ドラフトプランを取得（新規作成・コピー＆ペースト時のプレビュー表示用）
  const draftPlan = usePlanInspectorStore((state) => state.draftPlan);
  const createType = usePlanInspectorStore((state) => state.createType);

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
        exceptionType: inst.exception_type as 'modified' | 'cancelled' | 'moved' | undefined,
        title: inst.title ?? undefined,
        description: inst.description ?? undefined,
        instanceStart: inst.instance_start ?? undefined,
        instanceEnd: inst.instance_end ?? undefined,
        originalDate: inst.original_date ?? undefined,
      });
    }
    return map;
  }, [instancesData]);

  // 全プランをCalendarPlan型に変換（繰り返しプランを展開）
  const allCalendarPlans = useMemo(() => {
    const calendarPlans: CalendarPlan[] = [];

    // Plans の変換
    if (plansData) {
      // サーバーからはformatPlanWithTagsで変換済みのtagIds配列が返る
      const plansWithTagIds = plansData as PlanWithTagIds[];

      // start_time/end_timeが設定されているplanのみを抽出
      const plansWithTime = plansWithTagIds.filter((plan) => {
        return plan.start_time && plan.end_time;
      });

      // 繰り返しプランを展開してCalendarPlanに変換
      const expandedPlans = expandRecurringPlansToCalendarPlans(
        plansWithTime,
        viewDateRange.start,
        viewDateRange.end,
        exceptionsMap,
      );
      calendarPlans.push(...expandedPlans);
    }

    // Records の変換（start_time/end_time がある場合のみ表示）
    if (recordsData) {
      const calendarRecords = recordsToCalendarPlans(recordsData);
      calendarPlans.push(...calendarRecords);
    }

    // ドラフトプランをプレビューとして追加
    // 時間がある場合は表示（新規作成時やペースト時）
    // タイトルがない場合はcreateTypeに応じたデフォルト表示
    if (draftPlan?.start_time && draftPlan?.end_time) {
      const startDate = new Date(draftPlan.start_time);
      const endDate = new Date(draftPlan.end_time);
      const isRecord = createType === 'record';
      const draftCalendarPlan: CalendarPlan = {
        id: '__draft__',
        title: draftPlan.title || (isRecord ? '新しい記録' : '新しい予定'),
        description: draftPlan.description ?? undefined,
        startDate,
        endDate,
        status: 'open',
        color: 'var(--primary)',
        createdAt: new Date(),
        updatedAt: new Date(),
        displayStartDate: startDate,
        displayEndDate: endDate,
        duration: (endDate.getTime() - startDate.getTime()) / 60000,
        isMultiDay: false,
        isRecurring: false,
        type: isRecord ? 'record' : 'plan',
        isDraft: true,
      };
      calendarPlans.push(draftCalendarPlan);
    }

    return calendarPlans;
  }, [plansData, recordsData, viewDateRange, exceptionsMap, draftPlan, createType]);

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

    // サイドバーのフィルター設定を適用
    // 種別フィルター（Plan/Record）とタグフィルターの両方をチェック
    // ドラフトは常に表示（フィルター設定に関係なく）
    const visibilityFiltered = filtered.filter((event) => {
      // ドラフトは常に表示
      if (event.isDraft) {
        return true;
      }
      if (event.type === 'record') {
        return visibleTypes.record && matchesTagFilter(event.tagIds ?? []);
      }
      // Planの場合: 種別表示 AND タグ表示の両方をチェック
      return visibleTypes.plan && isPlanVisible(event.tagIds ?? []);
    });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- visibleTagIds/showUntagged はリアクティブ依存（関数参照は安定のため直接依存不可）
  }, [
    viewDateRange,
    allCalendarPlans,
    isPlanVisible,
    matchesTagFilter,
    visibleTypes,
    visibleTagIds,
    showUntagged,
  ]);

  return {
    viewDateRange,
    filteredEvents,
    allCalendarPlans,
    plansData,
  };
}
