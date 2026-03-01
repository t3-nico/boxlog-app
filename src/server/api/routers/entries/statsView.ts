/**
 * Stats View Subrouter
 * カレンダーStatsビュー用のデータ集約エンドポイント
 *
 * entries テーブルのみを使用（plans+records統合済み）
 * origin='planned' → 予算時間, origin='unplanned' → 実績時間
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
  todayDate: z.string(), // ISO date string (YYYY-MM-DD) for "Today" card
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
   * 統合モデル: entries テーブルのみを使用
   * - planned (origin='planned') → 計画時間（start_time/end_time の差分）
   * - actual (origin='unplanned') → 実績時間（duration_minutes or start_time/end_time の差分）
   */
  getStatsViewData: protectedProcedure.input(statsViewInputSchema).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const { startDate, endDate, prevStartDate, prevEndDate } = input;

    // 並列で3つのデータセットを取得（統合テーブルなので records は不要）
    const [plannedResult, actualResult, prevActualResult, tagsResult] = await Promise.all([
      // 1. 今週の planned entries (start_time が期間内)
      supabase
        .from('entries')
        .select('id, start_time, end_time')
        .eq('user_id', userId)
        .eq('origin', 'planned')
        .not('start_time', 'is', null)
        .not('end_time', 'is', null)
        .gte('start_time', `${startDate}T00:00:00`)
        .lte('start_time', `${endDate}T23:59:59`),

      // 2. 今週の unplanned entries (start_time が期間内)
      supabase
        .from('entries')
        .select('id, start_time, end_time, duration_minutes')
        .eq('user_id', userId)
        .eq('origin', 'unplanned')
        .not('start_time', 'is', null)
        .gte('start_time', `${startDate}T00:00:00`)
        .lte('start_time', `${endDate}T23:59:59`),

      // 3. 前週の unplanned entries
      supabase
        .from('entries')
        .select('id, start_time, end_time, duration_minutes')
        .eq('user_id', userId)
        .eq('origin', 'unplanned')
        .not('start_time', 'is', null)
        .gte('start_time', `${prevStartDate}T00:00:00`)
        .lte('start_time', `${prevEndDate}T23:59:59`),

      // 4. ユーザーのタグ一覧
      supabase.from('tags').select('id, name, color, parent_id').eq('user_id', userId),
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
        : Promise.resolve({ data: [] as Array<{ entry_id: string; tag_id: string }>, error: null }),
      actualIds.length > 0
        ? supabase.from('entry_tags').select('entry_id, tag_id').in('entry_id', actualIds)
        : Promise.resolve({ data: [] as Array<{ entry_id: string; tag_id: string }>, error: null }),
      prevActualIds.length > 0
        ? supabase.from('entry_tags').select('entry_id, tag_id').in('entry_id', prevActualIds)
        : Promise.resolve({ data: [] as Array<{ entry_id: string; tag_id: string }>, error: null }),
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

    // タグIDマップ作成
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
        if (diffMs > 0) {
          minutes = diffMs / MS_PER_MINUTE;
        }
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
        if (diffMs > 0) {
          minutes = diffMs / MS_PER_MINUTE;
        }
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

    // --- タグ別ブレイクダウン構築 ---
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
          parentId: null,
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
            parentId: tag.parent_id,
            plannedMinutes: Math.round(plannedMins),
            actualMinutes: Math.round(actualMins),
            previousActualMinutes: Math.round(prevActualMins),
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

    // --- Today データ ---
    let todayPlannedMinutes = 0;
    for (const entry of planned) {
      if (entry.start_time?.startsWith(input.todayDate)) {
        const diffMs =
          new Date(entry.end_time!).getTime() - new Date(entry.start_time).getTime();
        if (diffMs > 0) todayPlannedMinutes += diffMs / MS_PER_MINUTE;
      }
    }
    let todayActualMinutes = 0;
    for (const entry of actual) {
      if (entry.start_time?.startsWith(input.todayDate)) {
        if (entry.duration_minutes) {
          todayActualMinutes += entry.duration_minutes;
        } else if (entry.start_time && entry.end_time) {
          const diffMs =
            new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime();
          if (diffMs > 0) todayActualMinutes += diffMs / MS_PER_MINUTE;
        }
      }
    }

    // --- Hero データ ---
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
