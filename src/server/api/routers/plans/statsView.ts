/**
 * Stats View Subrouter
 * カレンダーStatsビュー用のデータ集約エンドポイント
 *
 * Plan(予算) vs Record(実績) をタグ別に集計し、
 * 前週との比較データを返す。
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { MS_PER_MINUTE } from '@/constants/time';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

const statsViewInputSchema = z.object({
  startDate: z.string(), // ISO date string (YYYY-MM-DD)
  endDate: z.string(), // ISO date string (YYYY-MM-DD)
  prevStartDate: z.string(), // Previous period start
  prevEndDate: z.string(), // Previous period end
});

interface TagBreakdownItem {
  tagId: string;
  tagName: string;
  tagColor: string;
  parentId: string | null;
  plannedMinutes: number;
  actualMinutes: number;
  previousActualMinutes: number;
}

export const statsViewRouter = createTRPCRouter({
  /**
   * Stats View のメインデータエンドポイント
   *
   * 1回のクエリで Hero カード + テーブルに必要な全データを返す:
   * - Hero: 計画時間合計、実績時間合計、進捗%、前週比
   * - Table: タグ別の Plan/Done/%/vs先週
   */
  getStatsViewData: protectedProcedure
    .input(statsViewInputSchema)
    .query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const { startDate, endDate, prevStartDate, prevEndDate } = input;

      // 並列で4つのデータセットを取得
      const [plansResult, recordsResult, prevRecordsResult, tagsResult] = await Promise.all([
        // 1. 今週の Plans (start_time が期間内)
        supabase
          .from('plans')
          .select('id, start_time, end_time')
          .eq('user_id', userId)
          .not('start_time', 'is', null)
          .not('end_time', 'is', null)
          .gte('start_time', `${startDate}T00:00:00`)
          .lte('start_time', `${endDate}T23:59:59`),

        // 2. 今週の Records (worked_at が期間内)
        supabase
          .from('records')
          .select('id, duration_minutes, worked_at')
          .eq('user_id', userId)
          .gte('worked_at', startDate)
          .lte('worked_at', endDate),

        // 3. 前週の Records (worked_at が前期間内)
        supabase
          .from('records')
          .select('id, duration_minutes, worked_at')
          .eq('user_id', userId)
          .gte('worked_at', prevStartDate)
          .lte('worked_at', prevEndDate),

        // 4. ユーザーのタグ一覧
        supabase
          .from('tags')
          .select('id, name, color, parent_id')
          .eq('user_id', userId),
      ]);

      if (plansResult.error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch plans: ${plansResult.error.message}`,
        });
      }
      if (recordsResult.error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch records: ${recordsResult.error.message}`,
        });
      }
      if (prevRecordsResult.error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch previous records: ${prevRecordsResult.error.message}`,
        });
      }
      if (tagsResult.error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch tags: ${tagsResult.error.message}`,
        });
      }

      const plans = plansResult.data;
      const records = recordsResult.data;
      const prevRecords = prevRecordsResult.data;
      const tags = tagsResult.data;

      // Plan-tag 関連を取得
      const planIds = plans.map((p) => p.id);
      const recordIds = records.map((r) => r.id);
      const prevRecordIds = prevRecords.map((r) => r.id);

      const [planTagsResult, recordTagsResult, prevRecordTagsResult] = await Promise.all([
        planIds.length > 0
          ? supabase.from('plan_tags').select('plan_id, tag_id').in('plan_id', planIds)
          : Promise.resolve({ data: [] as Array<{ plan_id: string; tag_id: string }>, error: null }),
        recordIds.length > 0
          ? supabase.from('record_tags').select('record_id, tag_id').in('record_id', recordIds)
          : Promise.resolve({
              data: [] as Array<{ record_id: string; tag_id: string }>,
              error: null,
            }),
        prevRecordIds.length > 0
          ? supabase
              .from('record_tags')
              .select('record_id, tag_id')
              .in('record_id', prevRecordIds)
          : Promise.resolve({
              data: [] as Array<{ record_id: string; tag_id: string }>,
              error: null,
            }),
      ]);

      if (planTagsResult.error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch plan tags: ${planTagsResult.error.message}`,
        });
      }
      if (recordTagsResult.error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch record tags: ${recordTagsResult.error.message}`,
        });
      }
      if (prevRecordTagsResult.error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch prev record tags: ${prevRecordTagsResult.error.message}`,
        });
      }

      const planTags = planTagsResult.data ?? [];
      const recordTags = recordTagsResult.data ?? [];
      const prevRecordTags = prevRecordTagsResult.data ?? [];

      // タグIDマップ作成
      const tagMap = new Map(tags.map((t) => [t.id, t]));

      // --- Plan 時間をタグ別に集計 ---
      const planMinutesByTag = new Map<string, number>();
      let totalPlannedMinutes = 0;

      for (const plan of plans) {
        if (plan.start_time && plan.end_time) {
          const diffMs = new Date(plan.end_time).getTime() - new Date(plan.start_time).getTime();
          if (diffMs > 0) {
            const minutes = diffMs / MS_PER_MINUTE;
            totalPlannedMinutes += minutes;

            const tagIdsForPlan = planTags
              .filter((pt) => pt.plan_id === plan.id)
              .map((pt) => pt.tag_id);

            if (tagIdsForPlan.length === 0) {
              // タグなし
              planMinutesByTag.set('__untagged__', (planMinutesByTag.get('__untagged__') ?? 0) + minutes);
            } else {
              for (const tagId of tagIdsForPlan) {
                planMinutesByTag.set(tagId, (planMinutesByTag.get(tagId) ?? 0) + minutes);
              }
            }
          }
        }
      }

      // --- Record 時間をタグ別に集計（今週） ---
      const recordMinutesByTag = new Map<string, number>();
      let totalActualMinutes = 0;

      for (const record of records) {
        const minutes = record.duration_minutes ?? 0;
        if (minutes > 0) {
          totalActualMinutes += minutes;

          const tagIdsForRecord = recordTags
            .filter((rt) => rt.record_id === record.id)
            .map((rt) => rt.tag_id);

          if (tagIdsForRecord.length === 0) {
            recordMinutesByTag.set(
              '__untagged__',
              (recordMinutesByTag.get('__untagged__') ?? 0) + minutes,
            );
          } else {
            for (const tagId of tagIdsForRecord) {
              recordMinutesByTag.set(tagId, (recordMinutesByTag.get(tagId) ?? 0) + minutes);
            }
          }
        }
      }

      // --- Record 時間をタグ別に集計（前週） ---
      const prevRecordMinutesByTag = new Map<string, number>();
      let totalPreviousActualMinutes = 0;

      for (const record of prevRecords) {
        const minutes = record.duration_minutes ?? 0;
        if (minutes > 0) {
          totalPreviousActualMinutes += minutes;

          const tagIdsForRecord = prevRecordTags
            .filter((rt) => rt.record_id === record.id)
            .map((rt) => rt.tag_id);

          if (tagIdsForRecord.length === 0) {
            prevRecordMinutesByTag.set(
              '__untagged__',
              (prevRecordMinutesByTag.get('__untagged__') ?? 0) + minutes,
            );
          } else {
            for (const tagId of tagIdsForRecord) {
              prevRecordMinutesByTag.set(
                tagId,
                (prevRecordMinutesByTag.get(tagId) ?? 0) + minutes,
              );
            }
          }
        }
      }

      // --- タグ別ブレイクダウン構築 ---
      const allTagIds = new Set([
        ...planMinutesByTag.keys(),
        ...recordMinutesByTag.keys(),
        ...prevRecordMinutesByTag.keys(),
      ]);

      const tagBreakdown: TagBreakdownItem[] = [];

      for (const tagId of allTagIds) {
        const planned = planMinutesByTag.get(tagId) ?? 0;
        const actual = recordMinutesByTag.get(tagId) ?? 0;
        const prevActual = prevRecordMinutesByTag.get(tagId) ?? 0;

        // 全て0ならスキップ
        if (planned === 0 && actual === 0 && prevActual === 0) continue;

        if (tagId === '__untagged__') {
          tagBreakdown.push({
            tagId: '__untagged__',
            tagName: 'No Tag',
            tagColor: '#94a3b8', // slate-400
            parentId: null,
            plannedMinutes: Math.round(planned),
            actualMinutes: Math.round(actual),
            previousActualMinutes: Math.round(prevActual),
          });
        } else {
          const tag = tagMap.get(tagId);
          if (tag) {
            tagBreakdown.push({
              tagId: tag.id,
              tagName: tag.name,
              tagColor: tag.color ?? '#6366f1',
              parentId: tag.parent_id,
              plannedMinutes: Math.round(planned),
              actualMinutes: Math.round(actual),
              previousActualMinutes: Math.round(prevActual),
            });
          }
        }
      }

      // タグ名でソート（untaggedは最後）
      tagBreakdown.sort((a, b) => {
        if (a.tagId === '__untagged__') return 1;
        if (b.tagId === '__untagged__') return -1;
        return a.tagName.localeCompare(b.tagName);
      });

      // --- Hero データ ---
      const progressPercent =
        totalPlannedMinutes > 0
          ? Math.round((totalActualMinutes / totalPlannedMinutes) * 100)
          : 0;

      const hoursDelta = (totalActualMinutes - totalPreviousActualMinutes) / 60;

      return {
        hero: {
          plannedMinutes: Math.round(totalPlannedMinutes),
          actualMinutes: Math.round(totalActualMinutes),
          progressPercent,
          previousActualMinutes: Math.round(totalPreviousActualMinutes),
          hoursDelta: Math.round(hoursDelta * 10) / 10, // 小数第1位まで
        },
        tagBreakdown,
      };
    }),
});
