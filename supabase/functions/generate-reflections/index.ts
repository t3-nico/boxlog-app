// generate-reflections Edge Function
// pg_cronで週次スケジュール（月曜朝）実行され、
// アクティブユーザーの振り返りレポートを自動生成し、weekly_report通知を作成する。
//
// バッチサイズ制限: 10ユーザー/回（タイムアウト対策）
// 冪等性: reflections テーブルの UNIQUE(user_id, period_type, period_start) で保証

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

const BATCH_SIZE = 10;
const REFLECTION_THRESHOLD_DAYS = 7; // 振り返り解放条件: 7日以上のデータ

interface UserEntry {
  user_id: string;
  entry_count: number;
}

interface ReflectionResult {
  userId: string;
  status: 'generated' | 'skipped' | 'error';
  reflectionId?: string;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 先週の期間を計算（月曜〜日曜）
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
    const daysToLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const lastMonday = new Date(now);
    lastMonday.setDate(now.getDate() - daysToLastMonday - 7);
    const weekStart = formatDate(lastMonday);
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);
    const weekEnd = formatDate(lastSunday);

    // アクティブユーザーを取得（先週エントリがあり、十分なデータ蓄積がある）
    const { data: activeUsers, error: usersError } = await supabase.rpc(
      'get_active_users_for_reflection' as never,
      {
        p_week_start: weekStart,
        p_threshold_days: REFLECTION_THRESHOLD_DAYS,
        p_limit: BATCH_SIZE,
      } as never,
    );

    if (usersError) {
      console.error('Error fetching active users:', usersError);
      throw usersError;
    }

    const users = (activeUsers ?? []) as UserEntry[];

    if (users.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No eligible users found', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      );
    }

    // 各ユーザーの振り返りを生成
    const results: ReflectionResult[] = [];

    for (const user of users) {
      try {
        // 冪等チェック: 既存レポートがあればスキップ
        const { data: existing } = await supabase
          .from('reflections')
          .select('id')
          .eq('user_id', user.user_id)
          .eq('period_type', 'weekly')
          .eq('period_start', weekStart)
          .maybeSingle();

        if (existing) {
          results.push({ userId: user.user_id, status: 'skipped', reflectionId: existing.id });
          continue;
        }

        // 集計データ取得
        const { data: weeklyData, error: dataError } = await supabase.rpc(
          'get_weekly_reflection_data' as never,
          { p_user_id: user.user_id, p_week_start: weekStart } as never,
        );

        if (dataError) {
          console.error(`Error fetching data for user ${user.user_id}:`, dataError);
          results.push({ userId: user.user_id, status: 'error', error: dataError.message });
          continue;
        }

        // AI呼び出し（Haiku 4.5）
        const prompt = buildSimpleReflectionPrompt(weeklyData as Record<string, unknown>, weekStart, weekEnd);

        const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicApiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`AI API error for user ${user.user_id}:`, errorText);
          results.push({ userId: user.user_id, status: 'error', error: `AI API error: ${aiResponse.status}` });
          continue;
        }

        const aiResult = await aiResponse.json() as {
          content: Array<{ type: string; text: string }>;
          usage: { input_tokens: number; output_tokens: number };
        };
        const aiText = aiResult.content[0]?.text ?? '';
        const parsed = parseReflectionJSON(aiText);

        // reflectionsテーブルに保存
        const { data: reflection, error: insertError } = await supabase
          .from('reflections')
          .insert({
            user_id: user.user_id,
            period_type: 'weekly',
            period_start: weekStart,
            period_end: weekEnd,
            title: parsed.title,
            activities: JSON.parse(JSON.stringify(parsed.activities)),
            insights: parsed.insights,
            question: parsed.question,
            model_used: 'claude-haiku-4-5-20251001',
            prompt_tokens: aiResult.usage?.input_tokens ?? null,
            completion_tokens: aiResult.usage?.output_tokens ?? null,
          })
          .select('id')
          .single();

        if (insertError) {
          console.error(`Error saving reflection for user ${user.user_id}:`, insertError);
          results.push({ userId: user.user_id, status: 'error', error: insertError.message });
          continue;
        }

        // weekly_report 通知を作成
        await supabase.from('notifications').insert({
          user_id: user.user_id,
          type: 'weekly_report',
          reflection_id: reflection.id,
          data: { period_start: weekStart, period_end: weekEnd },
          is_read: false,
        });

        // AI使用量をインクリメント
        await supabase.rpc('increment_ai_usage', {
          p_user_id: user.user_id,
          p_month: getCurrentMonth(),
        });

        results.push({ userId: user.user_id, status: 'generated', reflectionId: reflection.id });
      } catch (error) {
        console.error(`Error processing user ${user.user_id}:`, error);
        results.push({
          userId: user.user_id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // === 異常検知 ===
    // 振り返り生成対象ユーザーに対してバーンアウト警告チェック
    const anomalyResults: Array<{ userId: string; alerts: number }> = [];

    for (const user of users) {
      try {
        const anomalies = await checkAnomalies(supabase, user.user_id);
        if (anomalies.length > 0) {
          // burnout_warning 通知を作成
          for (const anomaly of anomalies) {
            await supabase.from('notifications').insert({
              user_id: user.user_id,
              type: 'burnout_warning',
              data: anomaly,
              is_read: false,
            });
          }
          anomalyResults.push({ userId: user.user_id, alerts: anomalies.length });
        }
      } catch (error) {
        console.error(`Anomaly check error for user ${user.user_id}:`, error);
      }
    }

    const generated = results.filter((r) => r.status === 'generated').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;
    const errors = results.filter((r) => r.status === 'error').length;
    const totalAnomalyAlerts = anomalyResults.reduce((sum, r) => sum + r.alerts, 0);

    return new Response(
      JSON.stringify({
        message: 'Reflections generation completed',
        total: results.length,
        generated,
        skipped,
        errors,
        anomalyAlerts: totalAnomalyAlerts,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (error) {
    console.error('Error in generate-reflections function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    );
  }
});

/**
 * 日付をYYYY-MM-DD形式にフォーマット
 */
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 現在の月をYYYY-MM形式で取得
 */
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Edge Function用の簡易振り返りプロンプトを構築
 * （メインアプリのprompt-template.tsの簡略版）
 */
function buildSimpleReflectionPrompt(
  weeklyData: Record<string, unknown>,
  weekStart: string,
  weekEnd: string,
): string {
  const totalEntries = Number(weeklyData.totalEntries ?? weeklyData.total_entries ?? 0);
  const totalMinutes = Number(weeklyData.totalMinutes ?? weeklyData.total_minutes ?? 0);
  const avgFulfillment = Number(weeklyData.avgFulfillment ?? weeklyData.avg_fulfillment ?? 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  return `You are "Dayopt AI", generating a weekly reflection report for ${weekStart} to ${weekEnd}.

## Weekly Data
- Total entries: ${totalEntries}
- Total time: ${totalHours}h
- Average fulfillment: ${avgFulfillment}/3

Generate a JSON object with these fields:
1. "title": Encouraging title for this week (max 60 chars)
2. "insights": 2-3 paragraphs of reflection (max 800 chars). What went well, patterns observed, actionable suggestion.
3. "question": A thought-provoking question (max 200 chars)
4. "activities": Array of top activities [{"label": "name", "minutes": N, "highlight": "brief note"}]

Respond ONLY with the JSON object. No markdown, no explanation.`;
}

/**
 * AI出力からJSONをパース
 */
function parseReflectionJSON(text: string): {
  title: string;
  insights: string;
  question: string;
  activities: Array<{ label: string; minutes: number; highlight: string }>;
} {
  try {
    let jsonStr = text.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }
    const parsed = JSON.parse(jsonStr);
    return {
      title: String(parsed.title ?? 'Weekly Reflection'),
      insights: String(parsed.insights ?? ''),
      question: String(parsed.question ?? ''),
      activities: Array.isArray(parsed.activities)
        ? parsed.activities.map((a: Record<string, unknown>) => ({
            label: String(a.label ?? ''),
            minutes: Number(a.minutes ?? 0),
            highlight: String(a.highlight ?? ''),
          }))
        : [],
    };
  } catch {
    return { title: 'Weekly Reflection', insights: text, question: '', activities: [] };
  }
}

type SupabaseClientType = Record<string, (...args: never[]) => unknown>;

/**
 * 異常検知: 過去4週の平均と今週を比較
 */
async function checkAnomalies(
  supabase: SupabaseClientType,
  userId: string,
): Promise<Array<Record<string, unknown>>> {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - daysToMonday);
  const thisWeekStart = formatDate(thisMonday);

  const fourWeeksAgo = new Date(thisMonday);
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  const baselineStart = formatDate(fourWeeksAgo);
  const today = formatDate(now);

  // 過去4週のデータ
  const { data: baselineEntries } = await supabase
    .from('entries')
    .select('start_time, end_time, duration_minutes, fulfillment_score')
    .eq('user_id', userId)
    .gte('start_time', `${baselineStart}T00:00:00`)
    .lt('start_time', `${thisWeekStart}T00:00:00`)
    .not('start_time', 'is', null);

  // 今週のデータ
  const { data: currentEntries } = await supabase
    .from('entries')
    .select('start_time, end_time, duration_minutes, fulfillment_score')
    .eq('user_id', userId)
    .gte('start_time', `${thisWeekStart}T00:00:00`)
    .lte('start_time', `${today}T23:59:59`)
    .not('start_time', 'is', null);

  const alerts: Array<Record<string, unknown>> = [];
  const baseline = baselineEntries ?? [];
  const current = currentEntries ?? [];

  if (baseline.length === 0) return alerts;

  // ベースライン: 充実度平均
  const baseWithScore = baseline.filter((e: Record<string, unknown>) => e.fulfillment_score != null);
  const baseAvgFulfillment = baseWithScore.length > 0
    ? baseWithScore.reduce((s: number, e: Record<string, unknown>) => s + Number(e.fulfillment_score), 0) / baseWithScore.length
    : 0;

  // ベースライン: 週平均時間（4週で割る）
  let baseTotalMinutes = 0;
  for (const e of baseline) {
    const entry = e as Record<string, unknown>;
    if (entry.duration_minutes) {
      baseTotalMinutes += Number(entry.duration_minutes);
    } else if (entry.start_time && entry.end_time) {
      const diff = new Date(entry.end_time as string).getTime() - new Date(entry.start_time as string).getTime();
      if (diff > 0) baseTotalMinutes += diff / 60000;
    }
  }
  const baseWeeklyMinutes = baseTotalMinutes / 4;

  // 今週: 充実度平均
  const currWithScore = current.filter((e: Record<string, unknown>) => e.fulfillment_score != null);
  const currAvgFulfillment = currWithScore.length > 0
    ? currWithScore.reduce((s: number, e: Record<string, unknown>) => s + Number(e.fulfillment_score), 0) / currWithScore.length
    : 0;

  // 今週: 総時間
  let currTotalMinutes = 0;
  for (const e of current) {
    const entry = e as Record<string, unknown>;
    if (entry.duration_minutes) {
      currTotalMinutes += Number(entry.duration_minutes);
    } else if (entry.start_time && entry.end_time) {
      const diff = new Date(entry.end_time as string).getTime() - new Date(entry.start_time as string).getTime();
      if (diff > 0) currTotalMinutes += diff / 60000;
    }
  }

  // 充実度急落（-1以上）
  if (baseAvgFulfillment > 0 && currAvgFulfillment > 0 && baseAvgFulfillment - currAvgFulfillment >= 1) {
    alerts.push({
      type: 'fulfillment_drop',
      severity: baseAvgFulfillment - currAvgFulfillment >= 1.5 ? 'critical' : 'warning',
      message: `Fulfillment dropped from ${baseAvgFulfillment.toFixed(1)} to ${currAvgFulfillment.toFixed(1)}`,
      baseline: baseAvgFulfillment,
      current: currAvgFulfillment,
    });
  }

  // 記録時間急増（1.5倍以上）
  if (baseWeeklyMinutes > 0 && currTotalMinutes > baseWeeklyMinutes * 1.5) {
    alerts.push({
      type: 'time_surge',
      severity: currTotalMinutes > baseWeeklyMinutes * 2 ? 'critical' : 'warning',
      message: `Time this week (${Math.round(currTotalMinutes / 60)}h) exceeds average (${Math.round(baseWeeklyMinutes / 60)}h/week)`,
      baseline: baseWeeklyMinutes,
      current: currTotalMinutes,
    });
  }

  // 無記録日連続チェック
  const { data: recentEntries } = await supabase
    .from('entries')
    .select('start_time')
    .eq('user_id', userId)
    .gte('start_time', formatDate(new Date(now.getTime() - 14 * 86400000)))
    .not('start_time', 'is', null);

  const entryDates = new Set(
    (recentEntries ?? [])
      .filter((e: Record<string, unknown>) => e.start_time)
      .map((e: Record<string, unknown>) => String(e.start_time).split('T')[0]),
  );

  let streak = 0;
  const checkDate = new Date(now);
  for (let i = 0; i < 14; i++) {
    if (entryDates.has(formatDate(checkDate))) break;
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  if (streak >= 3) {
    alerts.push({
      type: 'no_record_streak',
      severity: streak >= 5 ? 'critical' : 'warning',
      message: `No entries recorded for ${streak} consecutive days`,
      streakDays: streak,
    });
  }

  return alerts;
}
