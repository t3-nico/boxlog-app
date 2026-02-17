/**
 * Statistics Subrouter
 * Plan and tag statistics
 */

import { TRPCError } from '@trpc/server';

import { MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE } from '@/constants/time';
import { endOfWeek, startOfWeek } from '@/lib/date/core';
import { formatDateISO } from '@/lib/date/format';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

import { z } from 'zod';

/** 期間フィルター用の共通入力スキーマ */
const dateRangeInput = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const statisticsRouter = createTRPCRouter({
  /**
   * Get summary statistics (completed tasks, monthly hours, total hours)
   */
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx;

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);

    // Get all plans with time data
    const { data: plans, error } = await supabase
      .from('plans')
      .select('start_time, end_time, status, updated_at')
      .eq('user_id', userId);

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch plans: ${error.message}`,
      });
    }

    let totalHours = 0;
    let thisMonthHours = 0;
    let lastMonthHours = 0;
    let completedTasks = 0;
    let thisWeekCompleted = 0;

    for (const plan of plans) {
      // Count completed tasks
      if (plan.status === 'closed') {
        completedTasks++;
        if (plan.updated_at) {
          const updatedAt = new Date(plan.updated_at);
          if (updatedAt >= thisWeekStart) {
            thisWeekCompleted++;
          }
        }
      }

      // Calculate hours
      if (plan.start_time && plan.end_time) {
        const start = new Date(plan.start_time);
        const end = new Date(plan.end_time);
        const hours = (end.getTime() - start.getTime()) / MS_PER_HOUR;

        if (hours > 0) {
          totalHours += hours;

          // This month
          if (start >= thisMonthStart) {
            thisMonthHours += hours;
          }

          // Last month
          if (start >= lastMonthStart && start <= lastMonthEnd) {
            lastMonthHours += hours;
          }
        }
      }
    }

    // Calculate month comparison percentage
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
   */
  getStreak: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx;

    // Get all plans with start_time in the last year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const { data: plans, error } = await supabase
      .from('plans')
      .select('start_time')
      .eq('user_id', userId)
      .not('start_time', 'is', null)
      .gte('start_time', oneYearAgo.toISOString());

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch plans: ${error.message}`,
      });
    }

    // Get unique dates with activity
    const activeDates = new Set<string>();
    for (const plan of plans) {
      if (plan.start_time) {
        const datePart = new Date(plan.start_time).toISOString().split('T')[0];
        if (datePart) {
          activeDates.add(datePart);
        }
      }
    }

    const sortedDates = Array.from(activeDates).sort();
    const todayPart = new Date().toISOString().split('T')[0];
    const today = todayPart ?? '';
    const hasActivityToday = activeDates.has(today);

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date();

    // If no activity today, start from yesterday
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

      // Get all plans with time and their tags
      let query = supabase
        .from('plans')
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

      const { data: plans, error: plansError } = await query;

      if (plansError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch plans: ${plansError.message}`,
        });
      }

      if (plans.length === 0) {
        return [];
      }

      // Get plan-tag relationships
      const planIds = plans.map((p) => p.id);
      const { data: planTags, error: tagsError } = await supabase
        .from('plan_tags')
        .select('plan_id, tag_id')
        .in('plan_id', planIds);

      if (tagsError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch plan tags: ${tagsError.message}`,
        });
      }

      // Get tag details
      const tagIds = [...new Set(planTags.map((pt) => pt.tag_id))];
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
          message: `Failed to fetch tags: ${tagDetailsError.message}`,
        });
      }

      // Calculate hours per tag
      const tagHours: Record<string, number> = {};
      for (const plan of plans) {
        if (plan.start_time && plan.end_time) {
          const hours =
            (new Date(plan.end_time).getTime() - new Date(plan.start_time).getTime()) / MS_PER_HOUR;
          if (hours > 0) {
            const tagIdsForPlan = planTags
              .filter((pt) => pt.plan_id === plan.id)
              .map((pt) => pt.tag_id);
            for (const tagId of tagIdsForPlan) {
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
   */
  getDailyHours: protectedProcedure
    .input(z.object({ year: z.number() }))
    .query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const { year } = input;

      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);

      const { data: plans, error } = await supabase
        .from('plans')
        .select('start_time, end_time')
        .eq('user_id', userId)
        .not('start_time', 'is', null)
        .not('end_time', 'is', null)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString());

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch plans: ${error.message}`,
        });
      }

      // Aggregate hours by date
      const dailyHours: Record<string, number> = {};
      for (const plan of plans) {
        if (plan.start_time && plan.end_time) {
          const datePart = new Date(plan.start_time).toISOString().split('T')[0];
          if (datePart) {
            const hours =
              (new Date(plan.end_time).getTime() - new Date(plan.start_time).getTime()) /
              MS_PER_HOUR;
            if (hours > 0) {
              dailyHours[datePart] = (dailyHours[datePart] || 0) + hours;
            }
          }
        }
      }

      return Object.entries(dailyHours).map(([date, hours]) => ({ date, hours }));
    }),

  /**
   * Get hourly distribution (which hours of the day have most activity)
   */
  getHourlyDistribution: protectedProcedure
    .input(dateRangeInput.optional())
    .query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;

      let query = supabase
        .from('plans')
        .select('start_time, end_time')
        .eq('user_id', userId)
        .not('start_time', 'is', null)
        .not('end_time', 'is', null);

      if (input?.startDate) {
        query = query.gte('start_time', input.startDate);
      }
      if (input?.endDate) {
        query = query.lte('start_time', input.endDate);
      }

      const { data: plans, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch plans: ${error.message}`,
        });
      }

      // Initialize hourly buckets
      const hourlyHours: number[] = new Array(24).fill(0);

      for (const plan of plans) {
        if (plan.start_time && plan.end_time) {
          const start = new Date(plan.start_time);
          const end = new Date(plan.end_time);

          // Simple approach: assign to start hour
          const hour = start.getHours();
          const hours = (end.getTime() - start.getTime()) / MS_PER_HOUR;
          if (hours > 0) {
            const currentHours = hourlyHours[hour];
            if (currentHours !== undefined) {
              hourlyHours[hour] = currentHours + hours;
            }
          }
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
   */
  getDayOfWeekDistribution: protectedProcedure
    .input(dateRangeInput.optional())
    .query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;

      let query = supabase
        .from('plans')
        .select('start_time, end_time')
        .eq('user_id', userId)
        .not('start_time', 'is', null)
        .not('end_time', 'is', null);

      if (input?.startDate) {
        query = query.gte('start_time', input.startDate);
      }
      if (input?.endDate) {
        query = query.lte('start_time', input.endDate);
      }

      const { data: plans, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch plans: ${error.message}`,
        });
      }

      const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
      const dayHours: number[] = new Array(7).fill(0);

      for (const plan of plans) {
        if (plan.start_time && plan.end_time) {
          const start = new Date(plan.start_time);
          const end = new Date(plan.end_time);
          const dayOfWeek = start.getDay();
          const hours = (end.getTime() - start.getTime()) / MS_PER_HOUR;
          if (hours > 0) {
            const currentHours = dayHours[dayOfWeek];
            if (currentHours !== undefined) {
              dayHours[dayOfWeek] = currentHours + hours;
            }
          }
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
   */
  getMonthlyTrend: protectedProcedure
    .input(z.object({ months: z.number().min(1).max(120).optional() }).optional())
    .query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;

      const monthCount = input?.months ?? 12;
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1), 1);

      const { data: plans, error } = await supabase
        .from('plans')
        .select('start_time, end_time')
        .eq('user_id', userId)
        .not('start_time', 'is', null)
        .not('end_time', 'is', null)
        .gte('start_time', startDate.toISOString());

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch plans: ${error.message}`,
        });
      }

      // Initialize monthly buckets
      const monthlyHours: Record<string, number> = {};
      for (let i = 0; i < monthCount; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1) + i, 1);
        const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        monthlyHours[key] = 0;
      }

      for (const plan of plans) {
        if (plan.start_time && plan.end_time) {
          const start = new Date(plan.start_time);
          const key = `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}`;
          const hours = (new Date(plan.end_time).getTime() - start.getTime()) / MS_PER_HOUR;
          if (hours > 0 && monthlyHours[key] !== undefined) {
            monthlyHours[key] += hours;
          }
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
   * Get total time from all plans
   */
  getTotalTime: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx;

    // Get all plans with start_time and end_time
    const { data: plans, error } = await supabase
      .from('plans')
      .select('start_time, end_time')
      .eq('user_id', userId)
      .not('start_time', 'is', null)
      .not('end_time', 'is', null);

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch plans: ${error.message}`,
      });
    }

    // Calculate total hours
    let totalMinutes = 0;
    let planCount = 0;

    for (const plan of plans) {
      if (plan.start_time && plan.end_time) {
        const start = new Date(plan.start_time);
        const end = new Date(plan.end_time);
        const diffMs = end.getTime() - start.getTime();
        if (diffMs > 0) {
          totalMinutes += diffMs / MS_PER_MINUTE;
          planCount++;
        }
      }
    }

    const totalHours = totalMinutes / 60;
    const avgHoursPerPlan = planCount > 0 ? totalHours / planCount : 0;

    return {
      totalHours,
      planCount,
      avgHoursPerPlan,
    };
  }),

  /**
   * Get this week's time for Plans and Records
   * Only includes plans and records for the current week (Mon-Sun)
   */
  getCumulativeTime: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx;
    const now = new Date();
    const weekStart = startOfWeek(now).toISOString();
    const weekEnd = endOfWeek(now).toISOString();
    const weekStartStr = formatDateISO(startOfWeek(now));
    const weekEndStr = formatDateISO(endOfWeek(now));

    // Plans: 今週のPlanのみ（start_time が今週の範囲内）
    const { data: plans, error: plansError } = await supabase
      .from('plans')
      .select('start_time, end_time')
      .eq('user_id', userId)
      .not('start_time', 'is', null)
      .not('end_time', 'is', null)
      .gte('start_time', weekStart)
      .lte('start_time', weekEnd);

    if (plansError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch plans: ${plansError.message}`,
      });
    }

    // Records: 今週のRecordのみ
    const { data: records, error: recordsError } = await supabase
      .from('records')
      .select('duration_minutes')
      .eq('user_id', userId)
      .gte('worked_at', weekStartStr)
      .lte('worked_at', weekEndStr);

    if (recordsError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch records: ${recordsError.message}`,
      });
    }

    // Plan集計: (end_time - start_time) の合計
    let planTotalMinutes = 0;
    for (const plan of plans) {
      if (plan.start_time && plan.end_time) {
        const diffMs = new Date(plan.end_time).getTime() - new Date(plan.start_time).getTime();
        if (diffMs > 0) {
          planTotalMinutes += diffMs / MS_PER_MINUTE;
        }
      }
    }

    // Record集計: duration_minutes の合計
    const recordTotalMinutes = (records ?? []).reduce(
      (sum, r) => sum + (r.duration_minutes ?? 0),
      0,
    );

    return {
      planTotalMinutes: Math.round(planTotalMinutes),
      recordTotalMinutes,
    };
  }),

  /**
   * Get plan statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx;

    // Get all plans (optimized: select only needed fields)
    const { data: plans, error } = await supabase
      .from('plans')
      .select('id, status')
      .eq('user_id', userId);

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch statistics: ${error.message}`,
      });
    }

    // Count by status
    const byStatus = plans.reduce(
      (acc, plan) => {
        acc[plan.status] = (acc[plan.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total: plans.length,
      byStatus,
    };
  }),

  /**
   * Get tag statistics (plan count and last used date) in a single optimized query
   *
   * Uses PostgreSQL function `get_tag_stats` for efficient DB-side aggregation
   * Instead of fetching all plan_tags records and aggregating in JS
   *
   * Performance improvement: ~1000-2000ms → ~50-100ms
   */
  getTagStats: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx;

    // Call PostgreSQL function for efficient aggregation
    const { data, error } = await supabase.rpc('get_tag_stats', {
      p_user_id: userId,
    });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch tag stats: ${error.message}`,
      });
    }

    // Transform array result into lookup objects
    const counts: Record<string, number> = {};
    const lastUsed: Record<string, string> = {};
    let untaggedCount = 0;

    if (data) {
      for (const row of data as Array<{
        tag_id: string | null;
        plan_count: number;
        last_used: string | null;
      }>) {
        if (row.tag_id === null) {
          // タグなしプランの件数
          untaggedCount = row.plan_count;
        } else {
          counts[row.tag_id] = row.plan_count;
          if (row.last_used) {
            lastUsed[row.tag_id] = row.last_used;
          }
        }
      }
    }

    return { counts, lastUsed, untaggedCount };
  }),
});
