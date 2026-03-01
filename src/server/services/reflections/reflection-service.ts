/**
 * Reflections Service
 *
 * 振り返りレポートの CRUD 操作
 */

import { logger } from '@/lib/logger';

import type { Database } from '@/lib/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

type ServiceSupabaseClient = SupabaseClient<Database>;
type ReflectionRow = Database['public']['Tables']['reflections']['Row'];

export interface ListReflectionsOptions {
  userId: string;
  periodType?: string | undefined;
  limit?: number;
  offset?: number;
}

export interface GetReflectionByIdOptions {
  userId: string;
  reflectionId: string;
}

export interface CreateReflectionOptions {
  userId: string;
  periodType: string;
  periodStart: string;
  periodEnd: string;
  title: string;
  activities: unknown[];
  insights: string;
  question: string;
  modelUsed?: string | undefined;
  promptTokens?: number | undefined;
  completionTokens?: number | undefined;
}

export interface UpdateReflectionNoteOptions {
  userId: string;
  reflectionId: string;
  userNote: string;
}

/**
 * ReflectionService
 */
export class ReflectionService {
  constructor(private readonly supabase: ServiceSupabaseClient) {}

  /**
   * 振り返り一覧を取得
   */
  async list(options: ListReflectionsOptions): Promise<ReflectionRow[]> {
    const { userId, periodType, limit = 20, offset = 0 } = options;

    let query = this.supabase
      .from('reflections')
      .select('*')
      .eq('user_id', userId)
      .order('period_start', { ascending: false });

    if (periodType) {
      query = query.eq('period_type', periodType);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      throw new ReflectionServiceError(
        'FETCH_FAILED',
        `Failed to fetch reflections: ${error.message}`,
      );
    }

    return data;
  }

  /**
   * 振り返りをIDで取得
   */
  async getById(options: GetReflectionByIdOptions): Promise<ReflectionRow> {
    const { userId, reflectionId } = options;

    const { data, error } = await this.supabase
      .from('reflections')
      .select('*')
      .eq('id', reflectionId)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new ReflectionServiceError('NOT_FOUND', `Reflection not found: ${error.message}`);
    }

    return data;
  }

  /**
   * 振り返りを作成（冪等: 同一期間の既存レポートがあればそれを返す）
   */
  async create(options: CreateReflectionOptions): Promise<ReflectionRow> {
    const {
      userId,
      periodType,
      periodStart,
      periodEnd,
      title,
      activities,
      insights,
      question,
      modelUsed,
      promptTokens,
      completionTokens,
    } = options;

    // 既存チェック（冪等性）
    const { data: existing } = await this.supabase
      .from('reflections')
      .select('*')
      .eq('user_id', userId)
      .eq('period_type', periodType)
      .eq('period_start', periodStart)
      .maybeSingle();

    if (existing) {
      logger.info('Reflection already exists, returning existing', {
        reflectionId: existing.id,
        periodType,
        periodStart,
      });
      return existing;
    }

    const { data, error } = await this.supabase
      .from('reflections')
      .insert({
        user_id: userId,
        period_type: periodType,
        period_start: periodStart,
        period_end: periodEnd,
        title,
        activities: JSON.parse(JSON.stringify(activities)),
        insights,
        question,
        model_used: modelUsed ?? null,
        prompt_tokens: promptTokens ?? null,
        completion_tokens: completionTokens ?? null,
      })
      .select()
      .single();

    if (error) {
      throw new ReflectionServiceError(
        'CREATE_FAILED',
        `Failed to create reflection: ${error.message}`,
      );
    }

    return data;
  }

  /**
   * 振り返りのユーザーメモを更新
   */
  async updateNote(options: UpdateReflectionNoteOptions): Promise<ReflectionRow> {
    const { userId, reflectionId, userNote } = options;

    const { data, error } = await this.supabase
      .from('reflections')
      .update({ user_note: userNote })
      .eq('id', reflectionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new ReflectionServiceError(
        'UPDATE_FAILED',
        `Failed to update reflection note: ${error.message}`,
      );
    }

    return data;
  }

  /**
   * 期間に該当する既存の振り返りを取得
   */
  async getByPeriod(
    userId: string,
    periodType: string,
    periodStart: string,
  ): Promise<ReflectionRow | null> {
    const { data } = await this.supabase
      .from('reflections')
      .select('*')
      .eq('user_id', userId)
      .eq('period_type', periodType)
      .eq('period_start', periodStart)
      .maybeSingle();

    return data;
  }
}

/**
 * ReflectionServiceError
 */
export class ReflectionServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ReflectionServiceError';
  }
}

/**
 * サービスインスタンスを作成
 */
export function createReflectionService(supabase: ServiceSupabaseClient): ReflectionService {
  return new ReflectionService(supabase);
}
