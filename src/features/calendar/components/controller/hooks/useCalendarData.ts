'use client';

import { useEffect, useMemo } from 'react';

import { addDays, format, subDays } from 'date-fns';

import type { EntryWithTags } from '@/core/types/entry';
import { useEntries } from '@/hooks/useEntries';
import { useTags } from '@/hooks/useTagsQuery';
import { expandEntriesToCalendarEvents, type PlanInstanceException } from '@/lib/entry-adapter';
import { isTimePast } from '@/lib/entry-status';
import { logger } from '@/lib/logger';
import { isRecurringPlan } from '@/lib/plan-recurrence';
import { api } from '@/lib/trpc';
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore';
import { useEntryInspectorStore } from '@/stores/useEntryInspectorStore';

import { useCalendarFilterStore } from '@/stores/useCalendarFilterStore';

import { calculateViewDateRange } from '../../../lib/view-helpers';

import type { CalendarPlan, CalendarViewType, ViewDateRange } from '../../../types/calendar.types';

interface UseCalendarDataOptions {
  viewType: CalendarViewType;
  currentDate: Date;
}

interface UseCalendarDataResult {
  viewDateRange: ViewDateRange;
  filteredEvents: CalendarPlan[];
  allCalendarPlans: CalendarPlan[];
  entriesData: ReturnType<typeof useEntries>['data'];
}

export function useCalendarData({
  viewType,
  currentDate,
}: UseCalendarDataOptions): UseCalendarDataResult {
  // 週の開始日設定を取得
  const weekStartsOn = useCalendarSettingsStore((state) => state.weekStartsOn);

  // ビューに応じた期間計算（週の開始日設定を反映）
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

  // entries を取得（plans + records 統合、単一クエリ）
  const { data: entriesData } = useEntries(dateFilter);

  // タグマスタをプリフェッチ（TagsContainerで使用するためキャッシュをwarm up）
  useTags();

  // tRPC utils（プリフェッチ用）
  const utils = api.useUtils();

  // 隣接期間のプリフェッチ（ナビゲーション高速化）
  useEffect(() => {
    const prefetchAdjacentPeriods = () => {
      // 前の期間
      const prevRange = calculateViewDateRange(viewType, subDays(currentDate, 7), weekStartsOn);
      void utils.entries.list.prefetch({
        startDate: prevRange.start.toISOString(),
        endDate: prevRange.end.toISOString(),
      });

      // 次の期間
      const nextRange = calculateViewDateRange(viewType, addDays(currentDate, 7), weekStartsOn);
      void utils.entries.list.prefetch({
        startDate: nextRange.start.toISOString(),
        endDate: nextRange.end.toISOString(),
      });
    };

    prefetchAdjacentPeriods();
  }, [currentDate, viewType, weekStartsOn, utils.entries.list]);

  // フィルター関数と状態を取得（ストアに統一）
  const isPlanVisible = useCalendarFilterStore((state) => state.isPlanVisible);
  const matchesTagFilter = useCalendarFilterStore((state) => state.matchesTagFilter);
  const visibleTypes = useCalendarFilterStore((state) => state.visibleTypes);
  // タグフィルタ変更時に useMemo を再実行させるためのリアクティブ依存
  const visibleTagIds = useCalendarFilterStore((state) => state.visibleTagIds);

  // ドラフトエントリを取得（新規作成・コピー＆ペースト時のプレビュー表示用）
  const draftEntry = useEntryInspectorStore((state) => state.draftEntry);

  // 繰り返しエントリのIDを抽出
  const recurringEntryIds = useMemo(() => {
    if (!entriesData) return [];
    return entriesData.filter((entry) => isRecurringPlan(entry)).map((entry) => entry.id);
  }, [entriesData]);

  // 繰り返しエントリの例外情報を取得（繰り返しエントリがある場合のみ）
  const { data: instancesData } = api.entries.getInstances.useQuery(
    {
      entryIds: recurringEntryIds,
      startDate: format(viewDateRange.start, 'yyyy-MM-dd'),
      endDate: format(viewDateRange.end, 'yyyy-MM-dd'),
    },
    {
      enabled: recurringEntryIds.length > 0,
      staleTime: 30 * 1000,
    },
  );

  // 例外情報をMapに変換
  const exceptionsMap = useMemo(() => {
    const map = new Map<string, PlanInstanceException[]>();
    if (!instancesData) return map;

    for (const inst of instancesData) {
      const entryId = inst.entry_id; // instances テーブルの entry_id
      if (!map.has(entryId)) {
        map.set(entryId, []);
      }
      map.get(entryId)!.push({
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

  // 全エントリをCalendarPlan型に変換（繰り返しエントリを展開）
  const allCalendarPlans = useMemo(() => {
    const calendarPlans: CalendarPlan[] = [];

    // Entries の変換（繰り返し展開含む）
    if (entriesData) {
      // サーバー型 → コア型に正規化（tagId を保証）
      const normalized: EntryWithTags[] = entriesData.map((e) => ({
        ...e,
        tagId: e.tagId ?? null,
      })) as EntryWithTags[];
      const expandedEvents = expandEntriesToCalendarEvents(
        normalized,
        viewDateRange.start,
        viewDateRange.end,
        exceptionsMap,
      );
      calendarPlans.push(...expandedEvents);
    }

    // ドラフトエントリをプレビューとして追加
    if (draftEntry?.start_time && draftEntry?.end_time) {
      const startDate = new Date(draftEntry.start_time);
      const endDate = new Date(draftEntry.end_time);
      const isPast = isTimePast(draftEntry.start_time);
      const draftCalendarPlan: CalendarPlan = {
        id: '__draft__',
        title: draftEntry.title || (isPast ? '新しい記録' : '新しい予定'),
        description: draftEntry.description ?? undefined,
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
        type: isPast ? 'record' : 'plan',
        origin: isPast ? 'unplanned' : 'planned',
        isDraft: true,
      };
      calendarPlans.push(draftCalendarPlan);
    }

    return calendarPlans;
  }, [entriesData, viewDateRange, exceptionsMap, draftEntry]);

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
    // visibleTypes.plan → origin='planned' のエントリ
    // visibleTypes.record → origin='unplanned' のエントリ
    const visibilityFiltered = filtered.filter((event) => {
      // ドラフトは常に表示
      if (event.isDraft) {
        return true;
      }
      // origin ベースのフィルタリング（type フィールドで UX 互換維持）
      if (event.type === 'record') {
        return visibleTypes.record && matchesTagFilter(event.tagId ?? null);
      }
      return visibleTypes.plan && isPlanVisible(event.tagId ?? null);
    });

    logger.log(`[useCalendarData] entriesフィルタリング:`, {
      totalEntries: allCalendarPlans.length,
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
        tagId: e.tagId,
      })),
    });

    return visibilityFiltered;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- visibleTagIds はリアクティブ依存（関数参照は安定のため直接依存不可）
  }, [
    viewDateRange,
    allCalendarPlans,
    isPlanVisible,
    matchesTagFilter,
    visibleTypes,
    visibleTagIds,
  ]);

  return {
    viewDateRange,
    filteredEvents,
    allCalendarPlans,
    entriesData,
  };
}
