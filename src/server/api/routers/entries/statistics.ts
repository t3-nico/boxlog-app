/**
 * Entries Statistics Subrouter
 * Entry and tag statistics
 *
 * DB側集計関数を使用してパフォーマンスを最適化
 * （マイグレーションで関数内部が entries テーブルを参照するよう更新済み）
 */

import { TRPCError } from '@trpc/server';

import { MS_PER_DAY, MS_PER_MINUTE } from '@/constants/time';
import { endOfWeek, startOfWeek } from '@/lib/date/core';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

import { z } from 'zod';

/** 期間フィルター用の共通入力スキーマ */
const dateRangeInput = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// --------------------------------------------------------
// RPC レスポンス型定義
// --------------------------------------------------------

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

export const statisticsRouter = createTRPCRouter({
  /**
   * Get summary statistics
   * DB側集計関数 get_plan_summary を使用（内部は entries テーブルを参照）
   */
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

    const monthComparison =
      lastMonthHours > 0
        ? Math.round(((thisMonthHours - lastMonthHours) / lastMonthHours) * 100)
        : 0;

    return {
      totalHours,
      thisMonthHours,
      lastMonthHours,
      monthComparison,
      completedTasks,
      thisWeekCompleted,
    };
  }),

  /**
   * Get streak data (consecutive days with activity)
   * DB側集計関数 get_active_dates を使用（内部は entries テーブルを参照）
   */
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

    // Calculate current streak
    let currentStreak = 0;
    const checkDate = new Date();

    if (!hasActivityToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const checkDateStr = checkDate.toISOString().split('T')[0];
      if (checkDateStr && activeDates.has(checkDateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate longest streak
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

    return {
      currentStreak,
      longestStreak,
      hasActivityToday,
      totalActiveDays: activeDates.size,
    };
  }),

  /**
   * Get time spent per tag
   */
  getTimeByTag: protectedProcedure
    .input(dateRangeInput.optional())
    .query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;

      // Get all entries with time and their tags
      let query = supabase
        .from('entries')
        .select('id, start_time, end_time')
        .eq('user_id', userId)
        .not('start_time', 'is', null)
        .not('end_time', 'is', null);

      if (input?.startDate) {
        query = query.gte('start_time', input.startDate);
      }
      if (input?.endDate) {
        query = query.lte('start_time', input.endDate);
      }

      const { data: entries, error: entriesError } = await query;

      if (entriesError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch entries',
        });
      }

      if (entries.length === 0) {
        return [];
      }

      // Get entry-tag relationships
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

      // Get tag details
      const tagIds = [...new Set(entryTags.map((et) => et.tag_id))];
      if (tagIds.length === 0) {
        return [];
      }

      const { data: tags, error: tagDetailsError } = await supabase
        .from('tags')
        .select('id, name, color')
        .in('id', tagIds);

      if (tagDetailsError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch tags',
        });
      }

      // Calculate hours per tag
      const MS_PER_HOUR = 3600000;
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

      // Build result
      const result = tags
        .map((tag) => ({
          tagId: tag.id,
          name: tag.name,
          color: tag.color || '#6366f1',
          hours: tagHours[tag.id] || 0,
        }))
        .filter((t) => t.hours > 0)
        .sort((a, b) => b.hours - a.hours);

      return result;
    }),

  /**
   * Get daily hours for heatmap (yearly view)
   * DB側集計関数 get_daily_hours を使用（内部は entries テーブルを参照）
   */
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

  /**
   * Get hourly distribution (which hours of the day have most activity)
   * DB側集計関数 get_hourly_distribution を使用（内部は entries テーブルを参照）
   */
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

      // Initialize hourly buckets and fill from DB results
      const hourlyHours: number[] = new Array(24).fill(0);
      for (const row of rows) {
        if (row.hour >= 0 && row.hour < 24) {
          hourlyHours[row.hour] = row.hours;
        }
      }

      // Convert to time slots (grouped by 2 hours)
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

  /**
   * Get day of week distribution
   * DB側集計関数 get_dow_distribution を使用（内部は entries テーブルを参照）
   */
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

      // Fill day-of-week buckets
      const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
      const dayHours: number[] = new Array(7).fill(0);
      for (const row of rows) {
        if (row.dow >= 0 && row.dow < 7) {
          dayHours[row.dow] = row.hours;
        }
      }

      // Return in Monday-first order (月火水木金土日)
      const mondayFirst = [1, 2, 3, 4, 5, 6, 0];
      return mondayFirst.map((dayIndex) => ({
        day: dayNames[dayIndex] ?? '',
        hours: dayHours[dayIndex] ?? 0,
      }));
    }),

  /**
   * Get monthly trend (last 12 months)
   * DB側集計関数 get_monthly_hours を使用（内部は entries テーブルを参照）
   */
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

      // Initialize monthly buckets
      const monthlyHours: Record<string, number> = {};
      for (let i = 0; i < monthCount; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1) + i, 1);
        const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        monthlyHours[key] = 0;
      }

      // Fill from DB results
      for (const row of rows) {
        if (monthlyHours[row.month] !== undefined) {
          monthlyHours[row.month] = row.hours;
        }
      }

      return Object.entries(monthlyHours)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, hours]) => {
          const monthPart = month.split('-')[1];
          return {
            month,
            label: `${monthPart ? parseInt(monthPart) : 0}月`,
            hours,
          };
        });
    }),

  /**
   * Get total time from all entries
   * DB側集計関数 get_total_time を使用（内部は entries テーブルを参照）
   */
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
    const avgHoursPerPlan = planCount > 0 ? totalHours / planCount : 0;

    return {
      totalHours,
      planCount,
      avgHoursPerPlan,
    };
  }),

  /**
   * Get this week's time (planned vs unplanned entries)
   * 統合モデル: origin='planned' の時間 vs origin='unplanned' の時間
   */
  getCumulativeTime: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx;
    const now = new Date();
    const weekStart = startOfWeek(now).toISOString();
    const weekEnd = endOfWeek(now).toISOString();

    // Planned entries: origin='planned', this week
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

    // Unplanned entries: origin='unplanned', this week
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

    // Planned entries: sum (end_time - start_time)
    let planTotalMinutes = 0;
    for (const entry of plannedEntries) {
      if (entry.start_time && entry.end_time) {
        const diffMs = new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime();
        if (diffMs > 0) {
          planTotalMinutes += diffMs / MS_PER_MINUTE;
        }
      }
    }

    // Unplanned entries: prefer duration_minutes, fallback to time diff
    let recordTotalMinutes = 0;
    for (const entry of unplannedEntries) {
      if (entry.duration_minutes) {
        recordTotalMinutes += entry.duration_minutes;
      } else if (entry.start_time && entry.end_time) {
        const diffMs = new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime();
        if (diffMs > 0) {
          recordTotalMinutes += diffMs / MS_PER_MINUTE;
        }
      }
    }

    return {
      planTotalMinutes: Math.round(planTotalMinutes),
      recordTotalMinutes: Math.round(recordTotalMinutes),
    };
  }),

  /**
   * Get entry statistics (count by origin)
   */
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

    // Count by origin (replaces old status-based counting)
    const byStatus = entries.reduce(
      (acc, entry) => {
        const key = entry.origin ?? 'planned';
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total: entries.length,
      byStatus,
    };
  }),

  /**
   * Get tag statistics
   * Uses PostgreSQL function `get_tag_stats` for efficient DB-side aggregation
   */
  getTagStats: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx;

    const { data, error } = await supabase.rpc('get_tag_stats', {
      p_user_id: userId,
    });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch tag stats',
      });
    }

    // Transform array result into lookup objects
    const counts: Record<string, number> = {};
    const recordCounts: Record<string, number> = {};
    const lastUsed: Record<string, string> = {};
    let untaggedCount = 0;

    if (data) {
      for (const row of data as Array<{
        tag_id: string | null;
        plan_count: number;
        record_count: number;
        last_used: string | null;
      }>) {
        if (row.tag_id === null) {
          untaggedCount = row.plan_count;
        } else {
          counts[row.tag_id] = row.plan_count;
          recordCounts[row.tag_id] = row.record_count;
          if (row.last_used) {
            lastUsed[row.tag_id] = row.last_used;
          }
        }
      }
    }

    return { counts, recordCounts, lastUsed, untaggedCount };
  }),
});
