/**
 * Suggestions Service
 *
 * 最近のエントリからタイトル+タグのサジェストを提供するサービス層
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';

import { ServiceError } from '@/platform/trpc/errors';

type ServiceSupabaseClient = SupabaseClient<Database>;

interface RecentTitlesOptions {
  userId: string;
  search?: string | undefined;
  limit?: number | undefined;
}

interface RecentEntry {
  title: string;
  tagIds: string[];
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
   * entries テーブルからタイトルでグループ化して
   * 使用頻度と最新日時でソートする
   */
  async recentTitles(options: RecentTitlesOptions): Promise<RecentEntry[]> {
    const { userId, search, limit = 20 } = options;

    let query = this.supabase
      .from('entries')
      .select('title, created_at, entry_tags(tag_id)')
      .eq('user_id', userId)
      .not('title', 'eq', '')
      .order('created_at', { ascending: false })
      .limit(100);

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data: entriesData, error } = await query;

    if (error) {
      throw new SuggestionServiceError('FETCH_FAILED', error.message);
    }

    // タイトルでグループ化
    const titleMap = new Map<
      string,
      {
        tagIds: string[];
        lastUsedAt: string;
        count: number;
      }
    >();

    for (const entry of entriesData ?? []) {
      if (!entry.title || !entry.created_at) continue;
      const existing = titleMap.get(entry.title);
      const tagIds = ((entry.entry_tags as unknown as { tag_id: string }[]) ?? []).map(
        (t) => t.tag_id,
      );
      const createdAt = entry.created_at;

      if (existing) {
        existing.count += 1;
        if (createdAt > existing.lastUsedAt) {
          existing.lastUsedAt = createdAt;
          existing.tagIds = tagIds;
        }
      } else {
        titleMap.set(entry.title, {
          tagIds,
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
