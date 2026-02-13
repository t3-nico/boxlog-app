import { useMemo } from 'react';

import { eachDayOfInterval, endOfWeek, format, startOfDay, startOfWeek } from 'date-fns';

import { useCalendarFilterStore } from '@/features/calendar/stores/useCalendarFilterStore';
import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import { useTagsMap } from '@/features/tags/hooks/useTagsMap';

import type { TimesheetData, TimesheetTagGroup } from '../TimesheetView.types';

/**
 * プランをタグ×日のピボットテーブル形式にグルーピングする
 *
 * 表示中のタグのみグループを作成（非表示タグのグループは生成しない）
 */
export function useTimesheetData(plans: CalendarPlan[], currentDate: Date): TimesheetData {
  const { getTagById } = useTagsMap();
  const visibleTagIds = useCalendarFilterStore((state) => state.visibleTagIds);
  const showUntagged = useCalendarFilterStore((state) => state.showUntagged);

  const weekDates = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const result = useMemo(() => {
    // 日付キー生成ヘルパー
    const dateKey = (date: Date) => format(startOfDay(date), 'yyyy-MM-dd');

    // プランを全タグIDでグルーピング（複数タグ → 複数グループに登場）
    const groupMap = new Map<string | null, CalendarPlan[]>();

    for (const plan of plans) {
      // startDate がないプランはスキップ
      if (!plan.startDate) continue;

      const tags = plan.tagIds ?? [];
      if (tags.length === 0) {
        // タグなし（showUntagged が false なら除外）
        if (!showUntagged) continue;
        const existing = groupMap.get(null) ?? [];
        existing.push(plan);
        groupMap.set(null, existing);
      } else {
        // 表示中のタグのみグループに登場させる
        for (const tagId of tags) {
          if (!visibleTagIds.has(tagId)) continue;
          const existing = groupMap.get(tagId) ?? [];
          existing.push(plan);
          groupMap.set(tagId, existing);
        }
      }
    }

    // タググループを構築
    const tagGroups: TimesheetTagGroup[] = [];

    for (const [tagId, groupPlans] of groupMap) {
      const tagInfo = tagId ? getTagById(tagId) : undefined;

      const dailyTotals: Record<string, number> = {};
      let weekTotal = 0;

      for (const plan of groupPlans) {
        if (!plan.displayStartDate) continue;
        const key = dateKey(plan.displayStartDate);
        const duration = plan.duration ?? 0;
        dailyTotals[key] = (dailyTotals[key] ?? 0) + duration;
        weekTotal += duration;
      }

      tagGroups.push({
        tagId,
        tagName: tagInfo?.name ?? '',
        tagColor: tagInfo?.color ?? '#6b7280',
        parentId: tagInfo?.parent_id ?? null,
        plans: groupPlans,
        dailyTotals,
        weekTotal,
      });
    }

    // 親タグ → 子タグ の順にソート（untagged は最後）
    tagGroups.sort((a, b) => {
      if (a.tagId === null) return 1;
      if (b.tagId === null) return -1;
      // 親タグを先に
      if (a.parentId === null && b.parentId !== null) return -1;
      if (a.parentId !== null && b.parentId === null) return 1;
      return a.tagName.localeCompare(b.tagName);
    });

    // 全体合計（重複なし: プラン単位で計算）
    const dailyTotals: Record<string, number> = {};
    let weekTotal = 0;

    for (const plan of plans) {
      if (!plan.displayStartDate) continue;
      const key = dateKey(plan.displayStartDate);
      const duration = plan.duration ?? 0;
      dailyTotals[key] = (dailyTotals[key] ?? 0) + duration;
      weekTotal += duration;
    }

    return { tagGroups, dailyTotals, weekTotal, weekDates };
  }, [plans, weekDates, getTagById, visibleTagIds, showUntagged]);

  return result;
}

/** 分を "Xh Ym" 形式にフォーマット */
export function formatMinutes(minutes: number): string {
  if (minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
