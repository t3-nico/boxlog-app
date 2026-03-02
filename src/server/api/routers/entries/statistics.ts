/**
 * Entries Statistics Router
 *
 * 統計・分析・StatsView 用のデータ集約エンドポイント
 *
 * 旧2サブルーター (statistics, statsView) を統合。
 * DB 側集計関数を使用してパフォーマンスを最適化。
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { MS_PER_DAY, MS_PER_MINUTE } from '@/constants/time';
import { endOfWeek, startOfWeek } from '@/lib/date/core';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

// =============================================================================
// Schemas & Types
// =============================================================================

/** 期間フィルター用の共通入力スキーマ */
const dateRangeInput = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const statsViewInputSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  prevStartDate: z.string(),
  prevEndDate: z.string(),
  todayDate: z.string(),
});

interface PlanSummaryResult {
  totalHours: number;
  thisMonthHours: number;
  lastMonthHours: number;
  completedTasks: number;
  thisWeekCompleted: number;
}

interface TotalTimeResult {
  totalMinutes: number;
  planCount: number;
}

interface TagBreakdownItem {
  tagId: string;
  tagName: string;
  tagColor: string;
  plannedMinutes: number;
  actualMinutes: number;
  previousActualMinutes: number;
}

// =============================================================================
// Router
// =============================================================================

export const entriesStatisticsRouter = createTRPCRouter({
  // ---------------------------------------------------------------------------
  // General Statistics
  // ---------------------------------------------------------------------------

  /** Get entry statistics (count by origin) */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx;

    const { data: entries, error } = await supabase
      .from('entries')
      .select('id, origin')
      .eq('user_id', userId);

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch statistics',
      });
    }

    const byStatus = entries.reduce(
      (acc, entry) => {
        const key = entry.origin ?? 'planned';
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return { total: entries.length, byStatus };
  }),

  /** Get tag statistics (entry count and last used date) */
  getTagStats: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx;

    const { data, error } = await supabase.rpc('get_tag_stats', { p_user_id: userId });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch tag stats',
      });
    }

    const counts: Record<string, number> = {};
    const lastUsed: Record<string, string> = {};

    if (data) {
      for (const row of data) {
        counts[row.tag_id] = row.entry_count;
        if (row.last_used) {
          lastUsed[row.tag_id] = row.last_used;
        }
      }
    }

    return { counts, lastUsed };
  }),

  /** Get total time from all entries (DB function) */
  getTotalTime: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx;

    const { data, error } = await supabase.rpc(
      'get_total_time' as never,
      {
        p_user_id: userId,
      } as never,
    );

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch total time',
      });
    }

    const result = data as TotalTimeResult | null;
    const totalMinutes = result?.totalMinutes ?? 0;
    const planCount = result?.planCount ?? 0;
    const totalHours = totalMinutes / 60;

    return {
      totalHours,
      planCount,
      avgHoursPerPlan: planCount > 0 ? totalHours / planCount : 0,
    };
  }),

  /** Get this week's time (planned vs unplanned entries) */
  getCumulativeTime: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx;
    const now = new Date();
    const weekStart = startOfWeek(now).toISOString();
    const weekEnd = endOfWeek(now).toISOString();

    const { data: plannedEntries, error: plannedError } = await supabase
      .from('entries')
      .select('start_time, end_time')
      .eq('user_id', userId)
      .eq('origin', 'planned')
      .not('start_time', 'is', null)
      .not('end_time', 'is', null)
      .gte('start_time', weekStart)
      .lte('start_time', weekEnd);

    if (plannedError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch planned entries',
      });
    }

    const { data: unplannedEntries, error: unplannedError } = await supabase
      .from('entries')
      .select('duration_minutes, start_time, end_time')
      .eq('user_id', userId)
      .eq('origin', 'unplanned')
      .not('start_time', 'is', null)
      .gte('start_time', weekStart)
      .lte('start_time', weekEnd);

    if (unplannedError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch unplanned entries',
      });
    }

    let planTotalMinutes = 0;
    for (const entry of plannedEntries) {
      if (entry.start_time && entry.end_time) {
        const diffMs = new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime();
        if (diffMs > 0) planTotalMinutes += diffMs / MS_PER_MINUTE;
      }
    }

    let recordTotalMinutes = 0;
    for (const entry of unplannedEntries) {
      if (entry.duration_minutes) {
        recordTotalMinutes += entry.duration_minutes;
      } else if (entry.start_time && entry.end_time) {
        const diffMs = new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime();
        if (diffMs > 0) recordTotalMinutes += diffMs / MS_PER_MINUTE;
      }
    }

    return {
      planTotalMinutes: Math.round(planTotalMinutes),
      recordTotalMinutes: Math.round(recordTotalMinutes),
    };
  }),

  /** Get summary statistics (DB function) */
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx;

    const { data, error } = await supabase.rpc(
      'get_plan_summary' as never,
      {
        p_user_id: userId,
      } as never,
    );

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch entry summary',
      });
    }

    const summary = data as PlanSummaryResult | null;
    const totalHours = summary?.totalHours ?? 0;
    const thisMonthHours = summary?.thisMonthHours ?? 0;
    const lastMonthHours = summary?.lastMonthHours ?? 0;
    const completedTasks = summary?.completedTasks ?? 0;
    const thisWeekCompleted = summary?.thisWeekCompleted ?? 0;

    return {
      totalHours,
      thisMonthHours,
      lastMonthHours,
      monthComparison:
        lastMonthHours > 0
          ? Math.round(((thisMonthHours - lastMonthHours) / lastMonthHours) * 100)
          : 0,
      completedTasks,
      thisWeekCompleted,
    };
  }),

  /** Get streak data — consecutive days with activity (DB function) */
  getStreak: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx;

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const { data, error } = await supabase.rpc(
      'get_active_dates' as never,
      {
        p_user_id: userId,
        p_since: oneYearAgo.toISOString(),
      } as never,
    );

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch active dates',
      });
    }

    const rows = (data ?? []) as Array<{ active_date: string }>;
    const activeDates = new Set(rows.map((r) => r.active_date));
    const sortedDates = Array.from(activeDates).sort();
    const todayPart = new Date().toISOString().split('T')[0];
    const today = todayPart ?? '';
    const hasActivityToday = activeDates.has(today);

    // Current streak
    let currentStreak = 0;
    const checkDate = new Date();
    if (!hasActivityToday) checkDate.setDate(checkDate.getDate() - 1);

    while (true) {
      const checkDateStr = checkDate.toISOString().split('T')[0];
      if (checkDateStr && activeDates.has(checkDateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dateStr of sortedDates) {
      const currentDate = new Date(dateStr);
      if (prevDate) {
        const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / MS_PER_DAY);
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      prevDate = currentDate;
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak, hasActivityToday, totalActiveDays: activeDates.size };
  }),

  /** Get time spent per tag */
  getTimeByTag: protectedProcedure
    .input(dateRangeInput.optional())
    .query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const MS_PER_HOUR = 3600000;

      let query = supabase
        .from('entries')
        .select('id, start_time, end_time')
        .eq('user_id', userId)
        .not('start_time', 'is', null)
        .not('end_time', 'is', null);

      if (input?.startDate) query = query.gte('start_time', input.startDate);
      if (input?.endDate) query = query.lte('start_time', input.endDate);

      const { data: entries, error: entriesError } = await query;

      if (entriesError) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch entries' });
      }
      if (entries.length === 0) return [];

      const entryIds = entries.map((e) => e.id);
      const { data: entryTags, error: tagsError } = await supabase
        .from('entry_tags')
        .select('entry_id, tag_id')
        .in('entry_id', entryIds);

      if (tagsError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch entry tags',
        });
      }

      const tagIds = [...new Set(entryTags.map((et) => et.tag_id))];
      if (tagIds.length === 0) return [];

      const { data: tags, error: tagDetailsError } = await supabase
        .from('tags')
        .select('id, name, color')
        .in('id', tagIds);

      if (tagDetailsError) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch tags' });
      }

      const tagHours: Record<string, number> = {};
      for (const entry of entries) {
        if (entry.start_time && entry.end_time) {
          const hours =
            (new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) /
            MS_PER_HOUR;
          if (hours > 0) {
            const tagIdsForEntry = entryTags
              .filter((et) => et.entry_id === entry.id)
              .map((et) => et.tag_id);
            for (const tagId of tagIdsForEntry) {
              tagHours[tagId] = (tagHours[tagId] || 0) + hours;
            }
          }
        }
      }

      return tags
        .map((tag) => ({
          tagId: tag.id,
          name: tag.name,
          color: tag.color || '#6366f1',
          hours: tagHours[tag.id] || 0,
        }))
        .filter((t) => t.hours > 0)
        .sort((a, b) => b.hours - a.hours);
    }),

  /** Get daily hours for heatmap (DB function) */
  getDailyHours: protectedProcedure
    .input(z.object({ year: z.number() }))
    .query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const { year } = input;

      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);

      const { data, error } = await supabase.rpc(
        'get_daily_hours' as never,
        {
          p_user_id: userId,
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString(),
        } as never,
      );

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch daily hours',
        });
      }

      return (data ?? []) as Array<{ date: string; hours: number }>;
    }),

  /** Get hourly distribution (DB function) */
  getHourlyDistribution: protectedProcedure
    .input(dateRangeInput.optional())
    .query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;

      const { data, error } = await supabase.rpc(
        'get_hourly_distribution' as never,
        {
          p_user_id: userId,
          p_start_date: input?.startDate ?? null,
          p_end_date: input?.endDate ?? null,
        } as never,
      );

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch hourly distribution',
        });
      }

      const rows = (data ?? []) as Array<{ hour: number; hours: number }>;
      const hourlyHours: number[] = new Array(24).fill(0);
      for (const row of rows) {
        if (row.hour >= 0 && row.hour < 24) hourlyHours[row.hour] = row.hours;
      }

      const timeSlots = [];
      for (let i = 0; i < 24; i += 2) {
        const hourA = hourlyHours[i] ?? 0;
        const hourB = hourlyHours[i + 1] ?? 0;
        timeSlots.push({
          timeSlot: `${i.toString().padStart(2, '0')}:00`,
          hours: hourA + hourB,
        });
      }
      return timeSlots;
    }),

  /** Get day of week distribution (DB function) */
  getDayOfWeekDistribution: protectedProcedure
    .input(dateRangeInput.optional())
    .query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;

      const { data, error } = await supabase.rpc(
        'get_dow_distribution' as never,
        {
          p_user_id: userId,
          p_start_date: input?.startDate ?? null,
          p_end_date: input?.endDate ?? null,
        } as never,
      );

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch day of week distribution',
        });
      }

      const rows = (data ?? []) as Array<{ dow: number; hours: number }>;
      const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
      const dayHours: number[] = new Array(7).fill(0);
      for (const row of rows) {
        if (row.dow >= 0 && row.dow < 7) dayHours[row.dow] = row.hours;
      }

      const mondayFirst = [1, 2, 3, 4, 5, 6, 0];
      return mondayFirst.map((dayIndex) => ({
        day: dayNames[dayIndex] ?? '',
        hours: dayHours[dayIndex] ?? 0,
      }));
    }),

  /** Get monthly trend (DB function) */
  getMonthlyTrend: protectedProcedure
    .input(z.object({ months: z.number().min(1).max(120).optional() }).optional())
    .query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const monthCount = input?.months ?? 12;
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1), 1);

      const { data, error } = await supabase.rpc(
        'get_monthly_hours' as never,
        {
          p_user_id: userId,
          p_start_date: startDate.toISOString(),
        } as never,
      );

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch monthly trend',
        });
      }

      const rows = (data ?? []) as Array<{ month: string; hours: number }>;
      const monthlyHours: Record<string, number> = {};
      for (let i = 0; i < monthCount; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1) + i, 1);
        const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        monthlyHours[key] = 0;
      }
      for (const row of rows) {
        if (monthlyHours[row.month] !== undefined) monthlyHours[row.month] = row.hours;
      }

      return Object.entries(monthlyHours)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, hours]) => {
          const monthPart = month.split('-')[1];
          return { month, label: `${monthPart ? parseInt(monthPart) : 0}月`, hours };
        });
    }),

  // ---------------------------------------------------------------------------
  // Stats View (カレンダー Stats ビュー用集約データ)
  // ---------------------------------------------------------------------------

  /**
   * Stats View のメインデータエンドポイント
   *
   * entries テーブルのみを使用:
   * - origin='planned' → 計画時間（start_time/end_time の差分）
   * - origin='unplanned' → 実績時間（duration_minutes or 差分）
   */
  getStatsViewData: protectedProcedure.input(statsViewInputSchema).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const { startDate, endDate, prevStartDate, prevEndDate } = input;

    // 並列で4つのデータセットを取得
    const [plannedResult, actualResult, prevActualResult, tagsResult] = await Promise.all([
      supabase
        .from('entries')
        .select('id, start_time, end_time')
        .eq('user_id', userId)
        .eq('origin', 'planned')
        .not('start_time', 'is', null)
        .not('end_time', 'is', null)
        .gte('start_time', `${startDate}T00:00:00`)
        .lte('start_time', `${endDate}T23:59:59`),
      supabase
        .from('entries')
        .select('id, start_time, end_time, duration_minutes')
        .eq('user_id', userId)
        .eq('origin', 'unplanned')
        .not('start_time', 'is', null)
        .gte('start_time', `${startDate}T00:00:00`)
        .lte('start_time', `${endDate}T23:59:59`),
      supabase
        .from('entries')
        .select('id, start_time, end_time, duration_minutes')
        .eq('user_id', userId)
        .eq('origin', 'unplanned')
        .not('start_time', 'is', null)
        .gte('start_time', `${prevStartDate}T00:00:00`)
        .lte('start_time', `${prevEndDate}T23:59:59`),
      supabase.from('tags').select('id, name, color').eq('user_id', userId),
    ]);

    if (plannedResult.error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch planned entries: ${plannedResult.error.message}`,
      });
    }
    if (actualResult.error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch actual entries: ${actualResult.error.message}`,
      });
    }
    if (prevActualResult.error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch previous entries: ${prevActualResult.error.message}`,
      });
    }
    if (tagsResult.error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch tags: ${tagsResult.error.message}`,
      });
    }

    const planned = plannedResult.data;
    const actual = actualResult.data;
    const prevActual = prevActualResult.data;
    const tags = tagsResult.data;

    // entry_tags 関連を取得
    const plannedIds = planned.map((e) => e.id);
    const actualIds = actual.map((e) => e.id);
    const prevActualIds = prevActual.map((e) => e.id);

    const [plannedTagsResult, actualTagsResult, prevActualTagsResult] = await Promise.all([
      plannedIds.length > 0
        ? supabase.from('entry_tags').select('entry_id, tag_id').in('entry_id', plannedIds)
        : Promise.resolve({
            data: [] as Array<{ entry_id: string; tag_id: string }>,
            error: null,
          }),
      actualIds.length > 0
        ? supabase.from('entry_tags').select('entry_id, tag_id').in('entry_id', actualIds)
        : Promise.resolve({
            data: [] as Array<{ entry_id: string; tag_id: string }>,
            error: null,
          }),
      prevActualIds.length > 0
        ? supabase.from('entry_tags').select('entry_id, tag_id').in('entry_id', prevActualIds)
        : Promise.resolve({
            data: [] as Array<{ entry_id: string; tag_id: string }>,
            error: null,
          }),
    ]);

    if (plannedTagsResult.error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch planned entry tags: ${plannedTagsResult.error.message}`,
      });
    }
    if (actualTagsResult.error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch actual entry tags: ${actualTagsResult.error.message}`,
      });
    }
    if (prevActualTagsResult.error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch prev entry tags: ${prevActualTagsResult.error.message}`,
      });
    }

    const plannedTags = plannedTagsResult.data ?? [];
    const actualTags = actualTagsResult.data ?? [];
    const prevActualTags = prevActualTagsResult.data ?? [];
    const tagMap = new Map(tags.map((t) => [t.id, t]));

    // --- Planned time をタグ別に集計 ---
    const planMinutesByTag = new Map<string, number>();
    let totalPlannedMinutes = 0;

    for (const entry of planned) {
      if (entry.start_time && entry.end_time) {
        const diffMs = new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime();
        if (diffMs > 0) {
          const minutes = diffMs / MS_PER_MINUTE;
          totalPlannedMinutes += minutes;

          const tagIdsForEntry = plannedTags
            .filter((et) => et.entry_id === entry.id)
            .map((et) => et.tag_id);

          if (tagIdsForEntry.length === 0) {
            planMinutesByTag.set(
              '__untagged__',
              (planMinutesByTag.get('__untagged__') ?? 0) + minutes,
            );
          } else {
            for (const tagId of tagIdsForEntry) {
              planMinutesByTag.set(tagId, (planMinutesByTag.get(tagId) ?? 0) + minutes);
            }
          }
        }
      }
    }

    // --- Actual time をタグ別に集計（今週） ---
    const recordMinutesByTag = new Map<string, number>();
    let totalActualMinutes = 0;

    for (const entry of actual) {
      let minutes = 0;
      if (entry.duration_minutes) {
        minutes = entry.duration_minutes;
      } else if (entry.start_time && entry.end_time) {
        const diffMs = new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime();
        if (diffMs > 0) minutes = diffMs / MS_PER_MINUTE;
      }

      if (minutes > 0) {
        totalActualMinutes += minutes;
        const tagIdsForEntry = actualTags
          .filter((et) => et.entry_id === entry.id)
          .map((et) => et.tag_id);

        if (tagIdsForEntry.length === 0) {
          recordMinutesByTag.set(
            '__untagged__',
            (recordMinutesByTag.get('__untagged__') ?? 0) + minutes,
          );
        } else {
          for (const tagId of tagIdsForEntry) {
            recordMinutesByTag.set(tagId, (recordMinutesByTag.get(tagId) ?? 0) + minutes);
          }
        }
      }
    }

    // --- Actual time をタグ別に集計（前週） ---
    const prevRecordMinutesByTag = new Map<string, number>();
    let totalPreviousActualMinutes = 0;

    for (const entry of prevActual) {
      let minutes = 0;
      if (entry.duration_minutes) {
        minutes = entry.duration_minutes;
      } else if (entry.start_time && entry.end_time) {
        const diffMs = new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime();
        if (diffMs > 0) minutes = diffMs / MS_PER_MINUTE;
      }

      if (minutes > 0) {
        totalPreviousActualMinutes += minutes;
        const tagIdsForEntry = prevActualTags
          .filter((et) => et.entry_id === entry.id)
          .map((et) => et.tag_id);

        if (tagIdsForEntry.length === 0) {
          prevRecordMinutesByTag.set(
            '__untagged__',
            (prevRecordMinutesByTag.get('__untagged__') ?? 0) + minutes,
          );
        } else {
          for (const tagId of tagIdsForEntry) {
            prevRecordMinutesByTag.set(tagId, (prevRecordMinutesByTag.get(tagId) ?? 0) + minutes);
          }
        }
      }
    }

    // --- タグ別ブレイクダウン ---
    const allTagIds = new Set([
      ...planMinutesByTag.keys(),
      ...recordMinutesByTag.keys(),
      ...prevRecordMinutesByTag.keys(),
    ]);

    const tagBreakdown: TagBreakdownItem[] = [];

    for (const tagId of allTagIds) {
      const plannedMins = planMinutesByTag.get(tagId) ?? 0;
      const actualMins = recordMinutesByTag.get(tagId) ?? 0;
      const prevActualMins = prevRecordMinutesByTag.get(tagId) ?? 0;

      if (plannedMins === 0 && actualMins === 0 && prevActualMins === 0) continue;

      if (tagId === '__untagged__') {
        tagBreakdown.push({
          tagId: '__untagged__',
          tagName: 'No Tag',
          tagColor: '#94a3b8',
          plannedMinutes: Math.round(plannedMins),
          actualMinutes: Math.round(actualMins),
          previousActualMinutes: Math.round(prevActualMins),
        });
      } else {
        const tag = tagMap.get(tagId);
        if (tag) {
          tagBreakdown.push({
            tagId: tag.id,
            tagName: tag.name,
            tagColor: tag.color ?? '#6366f1',
            plannedMinutes: Math.round(plannedMins),
            actualMinutes: Math.round(actualMins),
            previousActualMinutes: Math.round(prevActualMins),
          });
        }
      }
    }

    tagBreakdown.sort((a, b) => {
      if (a.tagId === '__untagged__') return 1;
      if (b.tagId === '__untagged__') return -1;
      return a.tagName.localeCompare(b.tagName);
    });

    // --- Today データ ---
    let todayPlannedMinutes = 0;
    for (const entry of planned) {
      if (entry.start_time?.startsWith(input.todayDate)) {
        const diffMs = new Date(entry.end_time!).getTime() - new Date(entry.start_time).getTime();
        if (diffMs > 0) todayPlannedMinutes += diffMs / MS_PER_MINUTE;
      }
    }
    let todayActualMinutes = 0;
    for (const entry of actual) {
      if (entry.start_time?.startsWith(input.todayDate)) {
        if (entry.duration_minutes) {
          todayActualMinutes += entry.duration_minutes;
        } else if (entry.start_time && entry.end_time) {
          const diffMs = new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime();
          if (diffMs > 0) todayActualMinutes += diffMs / MS_PER_MINUTE;
        }
      }
    }

    const progressPercent =
      totalPlannedMinutes > 0 ? Math.round((totalActualMinutes / totalPlannedMinutes) * 100) : 0;

    return {
      hero: {
        plannedMinutes: Math.round(totalPlannedMinutes),
        actualMinutes: Math.round(totalActualMinutes),
        progressPercent,
        todayPlannedMinutes: Math.round(todayPlannedMinutes),
        todayActualMinutes: Math.round(todayActualMinutes),
      },
      tagBreakdown,
    };
  }),
});
