/**
 * AI Tool Definitions
 *
 * Vercel AI SDK v6 の tool() でツールを定義。
 * 既存のサービス層（PlanService, RecordService, TagService）をラップし、
 * AIが過去データをオンデマンドで検索できるようにする。
 *
 * セキュリティ: userId はクロージャ経由で注入。AIモデルには公開しない。
 */

import { tool } from 'ai';
import { z } from 'zod';

import { MS_PER_HOUR } from '@/constants/time';
import { logger } from '@/lib/logger';
import { PlanService } from '@/server/services/plans/plan-service';
import { RecordService } from '@/server/services/records/record-service';
import { TagService } from '@/server/services/tags/tag-service';

import type { ToolSet } from 'ai';
import type { AISupabaseClient } from './types';

/**
 * AIツールセットを作成
 *
 * リクエストごとに呼ばれ、認証済みsupabaseクライアントとuserIdをクロージャでキャプチャ。
 */
export function createAITools(supabase: AISupabaseClient, userId: string): ToolSet {
  const planService = new PlanService(supabase);
  const recordService = new RecordService(supabase);
  const tagService = new TagService(supabase);

  return {
    searchPlans: tool({
      description:
        'Search user plans (tasks/events) by date range, status, or text. Use when the user asks about their past or future plans, schedule, or tasks.',
      inputSchema: z.object({
        startDate: z
          .string()
          .optional()
          .describe('Start of date range (ISO 8601 datetime, e.g. 2026-01-01T00:00:00)'),
        endDate: z
          .string()
          .optional()
          .describe('End of date range (ISO 8601 datetime, e.g. 2026-01-31T23:59:59)'),
        status: z.enum(['open', 'closed']).optional().describe('Filter by plan status'),
        search: z.string().optional().describe('Search text to match in title or description'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe('Maximum number of results (default 20)'),
      }),
      execute: async (input) => {
        try {
          const plans = await planService.list({
            userId,
            startDate: input.startDate,
            endDate: input.endDate,
            status: input.status,
            search: input.search,
            limit: input.limit ?? 20,
            sortBy: 'created_at',
            sortOrder: 'desc',
          });

          // タグ名を解決
          const tags = await tagService.list({ userId });
          const tagMap = new Map(tags.map((t) => [t.id, t.name]));

          const simplified = plans.map((p) => ({
            title: p.title ?? '(Untitled)',
            startTime: p.start_time ?? null,
            endTime: p.end_time ?? null,
            status: p.status,
            tags: (p.plan_tags ?? []).map((pt) => tagMap.get(pt.tag_id) ?? '').filter(Boolean),
          }));

          return { count: simplified.length, plans: simplified };
        } catch (error) {
          logger.error('AI tool searchPlans failed:', error);
          return { error: 'Failed to search plans' };
        }
      },
    }),

    searchRecords: tool({
      description:
        'Search user time records (work log entries) by date range or fulfillment score. Use when the user asks about their past activities, time spent, or work history.',
      inputSchema: z.object({
        workedAtFrom: z
          .string()
          .optional()
          .describe('Start date (YYYY-MM-DD format, e.g. 2026-01-01)'),
        workedAtTo: z.string().optional().describe('End date (YYYY-MM-DD format, e.g. 2026-01-31)'),
        fulfillmentScoreMin: z
          .number()
          .int()
          .min(1)
          .max(5)
          .optional()
          .describe('Minimum fulfillment score (1-5)'),
        fulfillmentScoreMax: z
          .number()
          .int()
          .min(1)
          .max(5)
          .optional()
          .describe('Maximum fulfillment score (1-5)'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe('Maximum number of results (default 20)'),
      }),
      execute: async (input) => {
        try {
          const records = await recordService.list({
            userId,
            worked_at_from: input.workedAtFrom,
            worked_at_to: input.workedAtTo,
            fulfillment_score_min: input.fulfillmentScoreMin,
            fulfillment_score_max: input.fulfillmentScoreMax,
            limit: input.limit ?? 20,
            sortBy: 'worked_at',
            sortOrder: 'desc',
          });

          const totalMinutes = records.reduce((sum, r) => sum + (r.duration_minutes ?? 0), 0);

          const simplified = records.map((r) => ({
            title: r.title ?? r.plan?.title ?? '(Untitled)',
            workedAt: r.worked_at,
            durationMinutes: r.duration_minutes,
            fulfillmentScore: r.fulfillment_score,
            planTitle: r.plan?.title ?? null,
          }));

          return {
            count: simplified.length,
            totalMinutes,
            totalHours: Math.round((totalMinutes / 60) * 10) / 10,
            records: simplified,
          };
        } catch (error) {
          logger.error('AI tool searchRecords failed:', error);
          return { error: 'Failed to search records' };
        }
      },
    }),

    getStatistics: tool({
      description:
        'Get summary statistics: total hours, completed tasks, monthly comparison, streaks. Use when the user asks about their progress, productivity stats, or trends.',
      inputSchema: z.object({
        period: z
          .enum(['week', 'month', 'year', 'all'])
          .optional()
          .describe('Time period for stats (default: month)'),
      }),
      execute: async (input) => {
        try {
          const period = input.period ?? 'month';
          const now = new Date();

          let startDate: Date;
          switch (period) {
            case 'week':
              startDate = new Date(now);
              startDate.setDate(now.getDate() - 7);
              break;
            case 'month':
              startDate = new Date(now.getFullYear(), now.getMonth(), 1);
              break;
            case 'year':
              startDate = new Date(now.getFullYear(), 0, 1);
              break;
            case 'all':
              startDate = new Date(2020, 0, 1);
              break;
          }

          // プラン統計
          const { data: plans, error: plansError } = await supabase
            .from('plans')
            .select('start_time, end_time, status')
            .eq('user_id', userId)
            .gte('start_time', startDate.toISOString());

          if (plansError) {
            return { error: 'Failed to fetch plan statistics' };
          }

          let totalHours = 0;
          let completedTasks = 0;

          for (const plan of plans ?? []) {
            if (plan.status === 'closed') completedTasks++;
            if (plan.start_time && plan.end_time) {
              const hours =
                (new Date(plan.end_time).getTime() - new Date(plan.start_time).getTime()) /
                MS_PER_HOUR;
              if (hours > 0) totalHours += hours;
            }
          }

          // レコード統計
          const { data: records, error: recordsError } = await supabase
            .from('records')
            .select('duration_minutes, fulfillment_score')
            .eq('user_id', userId)
            .gte('worked_at', startDate.toISOString().split('T')[0]);

          if (recordsError) {
            return { error: 'Failed to fetch record statistics' };
          }

          const recordMinutes = (records ?? []).reduce(
            (sum, r) => sum + (r.duration_minutes ?? 0),
            0,
          );
          const scores = (records ?? [])
            .map((r) => r.fulfillment_score)
            .filter((s): s is number => s !== null);
          const avgFulfillment =
            scores.length > 0
              ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
              : null;

          return {
            period,
            plannedHours: Math.round(totalHours * 10) / 10,
            recordedHours: Math.round((recordMinutes / 60) * 10) / 10,
            completedTasks,
            totalPlans: (plans ?? []).length,
            avgFulfillmentScore: avgFulfillment,
          };
        } catch (error) {
          logger.error('AI tool getStatistics failed:', error);
          return { error: 'Failed to get statistics' };
        }
      },
    }),

    getTagStats: tool({
      description:
        'Get tag usage statistics: how many plans and records use each tag. Use when the user asks about their tag usage, category breakdown, or how they spend time across different areas.',
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const stats = await tagService.getStats({ userId });

          return {
            tags: stats.map((s) => ({
              name: s.name,
              planCount: s.plan_count,
              recordCount: s.record_count,
              totalCount: s.total_count,
              lastUsedAt: s.last_used_at,
            })),
          };
        } catch (error) {
          logger.error('AI tool getTagStats failed:', error);
          return { error: 'Failed to get tag statistics' };
        }
      },
    }),
  } satisfies ToolSet;
}
