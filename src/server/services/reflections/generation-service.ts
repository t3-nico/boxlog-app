/**
 * Reflection Generation Service
 *
 * AI振り返りレポートの生成パイプライン:
 * 1. 冪等チェック（既存レポートがあれば返す）
 * 2. データ蓄積チェック（コールドスタート対策）
 * 3. AIクォータチェック
 * 4. 統計データ収集
 * 5. パーソナライゼーション取得
 * 6. プロンプト構築 + AI呼び出し（Haiku 4.5）
 * 7. reflectionsテーブルに保存
 */

import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

import { logger } from '@/lib/logger';
import { FREE_TIER_MODEL } from '@/server/services/ai/types';
import { createAIUsageService } from '@/server/services/ai/usage-service';

import { createDataAggregationService } from './data-aggregation-service';
import { buildReflectionPrompt } from './prompt-template';
import { createReflectionService } from './reflection-service';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import type { ReflectionPromptData } from './prompt-template';
import type { ReflectionGenerationResult } from './prompt-template';

type ServiceSupabaseClient = SupabaseClient<Database>;
type ReflectionRow = Database['public']['Tables']['reflections']['Row'];

/** 12カテゴリIDから英語ラベルへのマッピング */
const CATEGORY_LABELS: Record<string, string> = {
  family: 'Family',
  romance: 'Romance / Partner',
  parenting: 'Parenting',
  friends: 'Friends / Social',
  career: 'Career / Work',
  selfGrowth: 'Self-Growth / Education',
  leisure: 'Leisure / Fun',
  spirituality: 'Spirituality',
  community: 'Community / Citizenship',
  health: 'Health / Physical Well-being',
  environment: 'Environment / Nature',
  art: 'Art / Aesthetics',
};

export interface GenerateReflectionOptions {
  userId: string;
  periodType: 'daily' | 'weekly' | 'monthly';
  periodStart: string; // YYYY-MM-DD
}

/**
 * DateをYYYY-MM-DD形式にフォーマット
 */
function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 期間終了日を計算
 */
function calculatePeriodEnd(periodType: string, periodStart: string): string {
  const start = new Date(periodStart);

  switch (periodType) {
    case 'daily':
      return periodStart;
    case 'weekly': {
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return formatDateStr(end);
    }
    case 'monthly': {
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      return formatDateStr(end);
    }
    default:
      return periodStart;
  }
}

/**
 * ReflectionGenerationService
 */
export class ReflectionGenerationService {
  private readonly reflectionService;
  private readonly aggregationService;
  private readonly usageService;

  constructor(private readonly supabase: ServiceSupabaseClient) {
    this.reflectionService = createReflectionService(supabase);
    this.aggregationService = createDataAggregationService(supabase);
    this.usageService = createAIUsageService(supabase);
  }

  /**
   * 振り返りレポートを生成（冪等）
   */
  async generate(options: GenerateReflectionOptions): Promise<ReflectionRow> {
    const { userId, periodType, periodStart } = options;
    const periodEnd = calculatePeriodEnd(periodType, periodStart);

    // 1. 冪等チェック: 既存レポートがあればそれを返す
    const existing = await this.reflectionService.getByPeriod(userId, periodType, periodStart);
    if (existing) {
      logger.info('Reflection already exists, returning existing', {
        reflectionId: existing.id,
        periodType,
        periodStart,
      });
      return existing;
    }

    // 2. AIクォータチェック
    const hasQuota = await this.usageService.hasQuota(userId);
    if (!hasQuota) {
      throw new ReflectionGenerationError(
        'QUOTA_EXCEEDED',
        'Monthly free tier limit reached. Add your own API key in Settings > Integrations for unlimited usage.',
      );
    }

    // 3. 統計データ収集
    const [weeklyData, fulfillmentTrend, energyMap] = await Promise.all([
      this.aggregationService.getWeeklyReflectionData(userId, periodStart),
      this.aggregationService.getFulfillmentTrend(userId, periodStart, periodEnd),
      this.aggregationService.getEnergyMap(userId, periodStart, periodEnd),
    ]);

    // データが不十分な場合
    if (weeklyData.totalEntries === 0) {
      throw new ReflectionGenerationError(
        'INSUFFICIENT_DATA',
        'No entries found for this period. Start recording your activities to generate reflections.',
      );
    }

    // 4. パーソナライゼーション取得
    const { data: settings } = await this.supabase
      .from('user_settings')
      .select('personalization_values, personalization_ranked_values')
      .eq('user_id', userId)
      .single();

    const rankedValues = (settings?.personalization_ranked_values ?? []) as string[];
    const personalizationValues = (settings?.personalization_values ?? {}) as Record<
      string,
      { text: string; importance: number }
    >;

    const lifeCategories = Object.entries(personalizationValues).map(([key, val]) => ({
      key,
      label: CATEGORY_LABELS[key] ?? key,
      importance: val.importance,
      note: val.text,
    }));

    // 5. プロンプト構築
    const promptData: ReflectionPromptData = {
      periodType: periodType as 'daily' | 'weekly' | 'monthly',
      periodStart,
      periodEnd,
      weeklyData,
      fulfillmentTrend,
      energyMap,
      rankedValues,
      lifeCategories,
    };

    const systemPrompt = buildReflectionPrompt(promptData);

    // 6. AI API呼び出し（Haiku 4.5）
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new ReflectionGenerationError(
        'API_KEY_MISSING',
        'AI is not available. Server API key is not configured.',
      );
    }

    const anthropic = createAnthropic({ apiKey });
    const model = anthropic(FREE_TIER_MODEL);

    const result = await generateText({
      model,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Generate a ${periodType} reflection report for the period ${periodStart} to ${periodEnd}.`,
        },
      ],
    });

    // 7. レスポンスをパース
    const generationResult = parseGenerationResult(result.text);

    // 8. AI使用量をインクリメント
    await this.usageService.incrementUsage(userId);

    // 9. reflectionsテーブルに保存
    const reflection = await this.reflectionService.create({
      userId,
      periodType,
      periodStart,
      periodEnd,
      title: generationResult.title,
      activities: generationResult.activities,
      insights: generationResult.insights,
      question: generationResult.question,
      modelUsed: FREE_TIER_MODEL,
      promptTokens: result.usage?.inputTokens,
      completionTokens: result.usage?.outputTokens,
    });

    logger.info('Reflection generated successfully', {
      reflectionId: reflection.id,
      periodType,
      periodStart,
      promptTokens: result.usage?.inputTokens,
      completionTokens: result.usage?.outputTokens,
    });

    return reflection;
  }
}

/**
 * AI生成結果をパース
 */
function parseGenerationResult(text: string): ReflectionGenerationResult {
  try {
    // JSON部分を抽出（マークダウンコードブロックで囲まれている場合も対応）
    let jsonStr = text.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

    return {
      title: String(parsed.title ?? 'Weekly Reflection'),
      insights: String(parsed.insights ?? ''),
      question: String(parsed.question ?? ''),
      activities: Array.isArray(parsed.activities)
        ? (parsed.activities as Array<Record<string, unknown>>).map((a) => ({
            label: String(a.label ?? ''),
            minutes: Number(a.minutes ?? 0),
            highlight: String(a.highlight ?? ''),
          }))
        : [],
    };
  } catch (error) {
    logger.error('Failed to parse reflection generation result', { error, text });

    // パース失敗時のフォールバック
    return {
      title: 'Weekly Reflection',
      insights: text,
      question: '',
      activities: [],
    };
  }
}

/**
 * ReflectionGenerationError
 */
export class ReflectionGenerationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ReflectionGenerationError';
  }
}

/**
 * サービスインスタンスを作成
 */
export function createReflectionGenerationService(
  supabase: ServiceSupabaseClient,
): ReflectionGenerationService {
  return new ReflectionGenerationService(supabase);
}
