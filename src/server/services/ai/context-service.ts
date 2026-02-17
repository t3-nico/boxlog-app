/**
 * AI Context Service
 *
 * ユーザーデータを並列取得してAIチャットのコンテキストを組み立てる。
 * 既存のDBクエリを使い、AIが有用なアドバイスをするために必要な
 * パーソナライゼーション、スケジュール、統計情報を取得する。
 */

import { MS_PER_MINUTE } from '@/constants/time';
import { endOfWeek, startOfWeek } from '@/lib/date/core';
import { formatDateISO } from '@/lib/date/format';
import { logger } from '@/lib/logger';

import type { AIContext, AIContextPlan, AIContextRecord, AISupabaseClient } from './types';

/**
 * AIコンテキストを組み立てる
 *
 * Promise.allで以下を並列取得:
 * - ユーザー設定（パーソナライゼーション、クロノタイプ）
 * - 今日のプラン
 * - 最近のレコード（直近7日）
 * - 今週のプラン時間・レコード時間
 * - タグ一覧
 */
export async function buildAIContext(
  supabase: AISupabaseClient,
  userId: string,
): Promise<AIContext> {
  const now = new Date();
  const todayStr = formatDateISO(now);
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * MS_PER_MINUTE);

  const [settingsResult, plansResult, recordsResult, weeklyPlansResult, tagsResult] =
    await Promise.all([
      // 1. ユーザー設定
      supabase.from('user_settings').select('*').eq('user_id', userId).single(),

      // 2. 今日のプラン
      supabase
        .from('plans')
        .select('id, title, start_time, end_time, status, plan_tags(tag_id)')
        .eq('user_id', userId)
        .gte('start_time', `${todayStr}T00:00:00`)
        .lte('start_time', `${todayStr}T23:59:59`)
        .order('start_time', { ascending: true })
        .limit(20),

      // 3. 最近のレコード（直近7日）
      supabase
        .from('records')
        .select('title, duration_minutes, fulfillment_score, worked_at')
        .eq('user_id', userId)
        .gte('worked_at', sevenDaysAgo.toISOString())
        .order('worked_at', { ascending: false })
        .limit(10),

      // 4. 今週のプラン（時間計算用）
      supabase
        .from('plans')
        .select('start_time, end_time')
        .eq('user_id', userId)
        .not('start_time', 'is', null)
        .not('end_time', 'is', null)
        .gte('start_time', weekStart.toISOString())
        .lte('start_time', weekEnd.toISOString()),

      // 5. タグ一覧
      supabase
        .from('tags')
        .select('id, name, color')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(50),
    ]);

  // エラーハンドリング（致命的でないのでデフォルト値で続行）
  if (settingsResult.error && settingsResult.error.code !== 'PGRST116') {
    logger.warn('AI context: settings fetch failed', { error: settingsResult.error.message });
  }

  const settings = settingsResult.data;
  const plans = plansResult.data ?? [];
  const records = recordsResult.data ?? [];
  const weeklyPlans = weeklyPlansResult.data ?? [];
  const tags = tagsResult.data ?? [];

  // タグIDから名前のマッピング
  const tagMap = new Map(tags.map((t) => [t.id, t.name]));

  // 今日のプラン整形
  const todayPlans: AIContextPlan[] = plans.map((p) => ({
    title: p.title ?? '',
    startTime: p.start_time ?? '',
    endTime: p.end_time ?? '',
    status: p.status ?? 'draft',
    tags: (p.plan_tags as { tag_id: string }[])?.map((pt) => tagMap.get(pt.tag_id) ?? '') ?? [],
  }));

  // 最近のレコード整形
  const recentRecords: AIContextRecord[] = records.map((r) => ({
    title: r.title ?? '',
    durationMinutes: r.duration_minutes ?? 0,
    fulfillmentScore: r.fulfillment_score,
    workedAt: r.worked_at ?? '',
  }));

  // 今週のプラン時間（分）
  let planWeeklyMinutes = 0;
  for (const plan of weeklyPlans) {
    if (plan.start_time && plan.end_time) {
      const start = new Date(plan.start_time);
      const end = new Date(plan.end_time);
      const minutes = (end.getTime() - start.getTime()) / MS_PER_MINUTE;
      if (minutes > 0) {
        planWeeklyMinutes += minutes;
      }
    }
  }

  // 今週のレコード時間（分）- recentRecordsから今週分をフィルター
  let recordWeeklyMinutes = 0;
  for (const record of records) {
    if (record.worked_at) {
      const workedAt = new Date(record.worked_at);
      if (workedAt >= weekStart && workedAt <= weekEnd) {
        recordWeeklyMinutes += record.duration_minutes ?? 0;
      }
    }
  }

  // パーソナライゼーション
  const personalizationValues = (settings?.personalization_values ?? {}) as Record<
    string,
    { text: string; importance: number }
  >;
  const rankedValues = (settings?.personalization_ranked_values ?? []) as string[];
  const aiStyle = (settings?.ai_communication_style ?? 'coach') as AIContext['aiStyle'];
  const aiCustomStylePrompt = (settings?.ai_custom_style_prompt as string) ?? '';

  return {
    values: personalizationValues,
    rankedValues,
    aiStyle,
    aiCustomStylePrompt,
    todayPlans,
    recentRecords,
    weeklyMinutes: {
      plan: Math.round(planWeeklyMinutes),
      record: Math.round(recordWeeklyMinutes),
    },
    timezone: settings?.timezone ?? 'Asia/Tokyo',
    chronotype: {
      type: (settings?.chronotype_type as string) ?? 'bear',
      enabled: settings?.chronotype_enabled ?? false,
    },
    tags: tags.map((t) => ({ name: t.name, color: t.color ?? '#888' })),
  };
}
