/**
 * Entries Statistics Router
 *
 * 統計・分析用のデータ集約エンドポイント
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

// =============================================================================
// Schemas & Types
// =============================================================================

/** 期間フィルター用の共通入力スキーマ */
const dateRangeInput = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// =============================================================================
// Router
// =============================================================================

export const entriesStatisticsRouter = createTRPCRouter({
  // ---------------------------------------------------------------------------
  // General Statistics
  // ---------------------------------------------------------------------------

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
          color: tag.color || 'indigo',
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
});
