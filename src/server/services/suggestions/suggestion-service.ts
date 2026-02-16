/**
 * Suggestions Service
 *
 * 最近のPlan/Recordエントリからタイトル+タグのサジェストを提供するサービス層
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';

import { ServiceError } from '../errors';

type ServiceSupabaseClient = SupabaseClient<Database>;

interface RecentTitlesOptions {
  userId: string;
  search?: string | undefined;
  limit?: number | undefined;
}

interface RecentEntry {
  title: string;
  tagIds: string[];
  source: 'plan' | 'record';
  lastUsedAt: string;
  count: number;
}

export class SuggestionServiceError extends ServiceError {
  constructor(code: string, message: string) {
    super(code, message);
    this.name = 'SuggestionServiceError';
  }
}

export class SuggestionService {
  constructor(private readonly supabase: ServiceSupabaseClient) {}

  /**
   * 最近のユニークなタイトル+タグ組み合わせを取得
   *
   * Plans と Records の両方から取得し、タイトルでグループ化して
   * 使用頻度と最新日時でソートする
   */
  async recentTitles(options: RecentTitlesOptions): Promise<RecentEntry[]> {
    const { userId, search, limit = 20 } = options;

    // Plans からタイトル+タグを取得
    let plansQuery = this.supabase
      .from('plans')
      .select('title, created_at, plan_tags(tag_id)')
      .eq('user_id', userId)
      .not('title', 'eq', '')
      .order('created_at', { ascending: false })
      .limit(50);

    if (search) {
      plansQuery = plansQuery.ilike('title', `%${search}%`);
    }

    // Records からタイトル+タグを取得
    let recordsQuery = this.supabase
      .from('records')
      .select('title, created_at, record_tags(tag_id)')
      .eq('user_id', userId)
      .not('title', 'eq', '')
      .order('created_at', { ascending: false })
      .limit(50);

    if (search) {
      recordsQuery = recordsQuery.ilike('title', `%${search}%`);
    }

    const [plansResult, recordsResult] = await Promise.all([plansQuery, recordsQuery]);

    if (plansResult.error) {
      throw new SuggestionServiceError('FETCH_FAILED', plansResult.error.message);
    }
    if (recordsResult.error) {
      throw new SuggestionServiceError('FETCH_FAILED', recordsResult.error.message);
    }

    // 統合してタイトルでグループ化
    const titleMap = new Map<
      string,
      {
        tagIds: string[];
        source: 'plan' | 'record';
        lastUsedAt: string;
        count: number;
      }
    >();

    // Plans を処理
    for (const plan of plansResult.data) {
      if (!plan.title || !plan.created_at) continue;
      const existing = titleMap.get(plan.title);
      const tagIds = (plan.plan_tags ?? []).map((t) => t.tag_id);
      const createdAt = plan.created_at;

      if (existing) {
        existing.count += 1;
        if (createdAt > existing.lastUsedAt) {
          existing.lastUsedAt = createdAt;
          existing.tagIds = tagIds;
          existing.source = 'plan';
        }
      } else {
        titleMap.set(plan.title, {
          tagIds,
          source: 'plan',
          lastUsedAt: createdAt,
          count: 1,
        });
      }
    }

    // Records を処理
    for (const record of recordsResult.data) {
      if (!record.title || !record.created_at) continue;
      const existing = titleMap.get(record.title);
      const tagIds = (record.record_tags ?? []).map((t) => t.tag_id);
      const createdAt = record.created_at;

      if (existing) {
        existing.count += 1;
        if (createdAt > existing.lastUsedAt) {
          existing.lastUsedAt = createdAt;
          existing.tagIds = tagIds;
          existing.source = 'record';
        }
      } else {
        titleMap.set(record.title, {
          tagIds,
          source: 'record',
          lastUsedAt: createdAt,
          count: 1,
        });
      }
    }

    // ソート: 最新日時降順
    const entries: RecentEntry[] = Array.from(titleMap.entries())
      .map(([title, data]) => ({ title, ...data }))
      .sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt))
      .slice(0, limit);

    return entries;
  }
}

export function createSuggestionService(supabase: ServiceSupabaseClient): SuggestionService {
  return new SuggestionService(supabase);
}
