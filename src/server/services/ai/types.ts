/**
 * AI Service Types
 *
 * AIチャットのコンテキスト組み立てに使用する型定義
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';

export type AISupabaseClient = SupabaseClient<Database>;

/** AI プロバイダー識別子 */
export type AIProviderId = 'anthropic' | 'openai';

/** サポートするモデル名 */
export const SUPPORTED_MODELS: Record<AIProviderId, string[]> = {
  anthropic: ['claude-sonnet-4-5-20250929', 'claude-haiku-4-5-20251001'],
  openai: ['gpt-4o', 'gpt-4o-mini'],
};

/** デフォルトモデル */
export const DEFAULT_MODELS: Record<AIProviderId, string> = {
  anthropic: 'claude-sonnet-4-5-20250929',
  openai: 'gpt-4o-mini',
};

/** 今日のプラン情報（AI向け簡略化） */
export interface AIContextPlan {
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  tags: string[];
}

/** 最近のレコード情報（AI向け簡略化） */
export interface AIContextRecord {
  title: string;
  durationMinutes: number;
  fulfillmentScore: number | null;
  workedAt: string;
}

/** AIコンテキスト全体 */
export interface AIContext {
  /** パーソナライゼーション */
  values: Record<string, { text: string; importance: number }>;
  rankedValues: string[];
  aiStyle: 'coach' | 'analyst' | 'friendly' | 'custom';
  aiCustomStylePrompt: string;

  /** 今日のスケジュール */
  todayPlans: AIContextPlan[];

  /** 最近のレコード（直近7日） */
  recentRecords: AIContextRecord[];

  /** 今週の時間（分） */
  weeklyMinutes: {
    plan: number;
    record: number;
  };

  /** コンテキスト情報 */
  timezone: string;
  chronotype: {
    type: string;
    enabled: boolean;
  };
  tags: { name: string; color: string }[];
}
