/**
 * AI Context Service
 *
 * ユーザーデータを並列取得してAIチャットのコンテキストを組み立てる。
 * entries テーブルからデータを取得する。
 */

import { MS_PER_MINUTE } from '@/lib/date';
import { endOfWeek, startOfWeek } from '@/lib/date/core';
import { formatDateISO } from '@/lib/date/format';
import { logger } from '@/lib/logger';

import type { ChronotypeType } from '@/features/chronotype';
import type { AIContext, AIContextPlan, AIContextRecord, AISupabaseClient } from './types';

/**
 * AIコンテキストを組み立てる
 *
 * Promise.allで以下を並列取得:
 * - ユーザー設定（パーソナライゼーション、クロノタイプ）
 * - 今日のエントリ
 * - 最近の過去エントリ（直近7日）
 * - 今週の合計時間
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

  const [settingsResult, todayEntriesResult, recentEntriesResult, weeklyEntriesResult, tagsResult] =
    await Promise.all([
      // 1. ユーザー設定
      supabase.from('user_settings').select('*').eq('user_id', userId).single(),

      // 2. 今日のエントリ
      supabase
        .from('entries')
        .select('id, title, start_time, end_time, entry_tags(tag_id)')
        .eq('user_id', userId)
        .gte('start_time', `${todayStr}T00:00:00`)
        .lte('start_time', `${todayStr}T23:59:59`)
        .order('start_time', { ascending: true })
        .limit(20),

      // 3. 最近のエントリ（直近7日、充実度・時間集計用）
      supabase
        .from('entries')
        .select('title, duration_minutes, fulfillment_score, start_time')
        .eq('user_id', userId)
        .gte('start_time', sevenDaysAgo.toISOString())
        .lte('start_time', now.toISOString())
        .order('start_time', { ascending: false })
        .limit(10),

      // 4. 今週のエントリ（時間計算用）
      supabase
        .from('entries')
        .select('start_time, end_time, duration_minutes')
        .eq('user_id', userId)
        .not('start_time', 'is', null)
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
  const todayEntries = todayEntriesResult.data ?? [];
  const recentEntries = recentEntriesResult.data ?? [];
  const weeklyEntries = weeklyEntriesResult.data ?? [];
  const tags = tagsResult.data ?? [];

  // タグIDから名前のマッピング
  const tagMap = new Map(tags.map((t) => [t.id, t.name]));

  // 今日のプラン整形（AIContextPlan 形式を維持して後方互換性を保つ）
  const todayPlans: AIContextPlan[] = todayEntries.map((e) => ({
    title: e.title ?? '',
    startTime: e.start_time ?? '',
    endTime: e.end_time ?? '',
    status: 'planned',
    tags:
      (e.entry_tags as unknown as { tag_id: string }[])?.map((et) => tagMap.get(et.tag_id) ?? '') ??
      [],
  }));

  // 最近のレコード整形（AIContextRecord 形式を維持して後方互換性を保つ）
  const recentRecords: AIContextRecord[] = recentEntries.map((e) => ({
    title: e.title ?? '',
    durationMinutes: e.duration_minutes ?? 0,
    fulfillmentScore: e.fulfillment_score,
    workedAt: e.start_time ? (e.start_time.split('T')[0] ?? '') : '',
  }));

  // 今週の合計時間（分）— 予定時間と記録時間を統合
  let weeklyTotalMinutes = 0;
  for (const entry of weeklyEntries) {
    if (entry.duration_minutes) {
      weeklyTotalMinutes += entry.duration_minutes;
    } else if (entry.start_time && entry.end_time) {
      const diffMs = new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime();
      if (diffMs > 0) {
        weeklyTotalMinutes += diffMs / MS_PER_MINUTE;
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
      plan: Math.round(weeklyTotalMinutes),
      record: Math.round(weeklyTotalMinutes),
    },
    timezone: settings?.timezone ?? 'Asia/Tokyo',
    chronotype: {
      type: (settings?.chronotype_type as ChronotypeType) ?? 'bear',
      enabled: settings?.chronotype_enabled ?? false,
    },
    tags: tags.map((t) => ({ name: t.name, color: t.color ?? '#888' })),
  };
}
