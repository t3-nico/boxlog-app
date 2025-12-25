// タグ使用統計とサイドバー表示用のフック

import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import type { Tag, TagUsageStats } from '@/features/tags/types';
import { getCacheStrategy } from '@/lib/tanstack-query/cache-config';

interface TagWithUsage extends Tag {
  usage_count: number;
  task_count: number;
  event_count: number;
  record_count: number;
  last_used_at: Date | null;
}

interface SidebarTagsOptions {
  maxTags?: number;
  minUsageCount?: number;
}

/** API レスポンス型 */
interface TagStatsResponse {
  data: Array<{
    id: string;
    name: string;
    color: string | null;
    plan_count: number;
    total_count: number;
    last_used_at: string | null;
  }>;
  count: number;
}

// タグ使用統計API
const tagStatsAPI = {
  // タグ使用統計取得
  async fetchTagStats(): Promise<TagUsageStats[]> {
    const response = await fetch('/api/tags/stats');
    if (!response.ok) throw new Error('Failed to fetch tag stats');

    const json: TagStatsResponse = await response.json();
    // API レスポンスを TagUsageStats 型に変換
    return json.data.map((item) => ({
      id: item.id,
      name: item.name,
      color: item.color ?? '#3B82F6',
      usage_count: item.total_count,
      task_count: 0, // 現在未実装
      event_count: 0, // 現在未実装
      record_count: 0, // 現在未実装
      last_used_at: item.last_used_at ? new Date(item.last_used_at) : null,
    }));
  },

  // タグ使用数カウント（タグID -> 使用数のマップ）
  async fetchTagUsageCounts(): Promise<Record<string, number>> {
    const response = await fetch('/api/tags/stats');
    if (!response.ok) throw new Error('Failed to fetch tag usage counts');

    const json: TagStatsResponse = await response.json();
    const counts: Record<string, number> = {};
    json.data.forEach((item) => {
      counts[item.id] = item.total_count;
    });
    return counts;
  },
};

// クエリキー
export const tagStatsKeys = {
  all: ['tag-stats'] as const,
  stats: () => [...tagStatsKeys.all, 'stats'] as const,
  counts: () => [...tagStatsKeys.all, 'counts'] as const,
};

// タグ使用統計フック
export function useTagStats() {
  return useQuery({
    queryKey: tagStatsKeys.stats(),
    queryFn: tagStatsAPI.fetchTagStats,
    ...getCacheStrategy('tagStats'),
  });
}

// タグ使用数カウントフック
export function useTagUsageCounts() {
  return useQuery({
    queryKey: tagStatsKeys.counts(),
    queryFn: tagStatsAPI.fetchTagUsageCounts,
    ...getCacheStrategy('tagStats'),
  });
}

// サイドバー表示用タグフック（フラット構造）
export function useSidebarTags(allTags: Tag[], options: SidebarTagsOptions = {}) {
  const { maxTags = 10, minUsageCount = 1 } = options;

  const { data: usageCounts = {}, isLoading } = useTagUsageCounts();

  const sidebarTags = useMemo(() => {
    if (isLoading || !allTags.length) return [];

    // タグに使用数を付与
    const tagsWithUsage: TagWithUsage[] = allTags.map((tag) => ({
      ...tag,
      usage_count: usageCounts[tag.id] || 0,
      task_count: Math.floor((usageCounts[tag.id] || 0) * 0.7), // 仮想的な分散
      event_count: Math.floor((usageCounts[tag.id] || 0) * 0.2),
      record_count: Math.floor((usageCounts[tag.id] || 0) * 0.1),
      last_used_at: usageCounts[tag.id] ? new Date() : null,
    }));

    // 使用頻度でソートしてフィルタリング
    return tagsWithUsage
      .filter((tag) => tag.usage_count >= minUsageCount && tag.is_active)
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, maxTags);
  }, [allTags, usageCounts, isLoading, maxTags, minUsageCount]);

  return {
    tags: sidebarTags,
    isLoading,
    totalTags: allTags.length,
    totalUsage: Object.values(usageCounts).reduce((sum, count) => sum + count, 0),
  };
}

// localStorage管理フック
export function useTagExpandedState() {
  const STORAGE_KEY = 'sidebar-tags-expanded';

  const getExpandedState = (): Set<string> => {
    if (typeof window === 'undefined') return new Set();

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  };

  const setExpandedState = (expandedIds: Set<string>) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(expandedIds)));
    } catch (error) {
      console.error('Failed to save expanded state:', error);
    }
  };

  const toggleExpanded = (tagId: string) => {
    const current = getExpandedState();
    if (current.has(tagId)) {
      current.delete(tagId);
    } else {
      current.add(tagId);
    }
    setExpandedState(current);
    return current;
  };

  return {
    getExpandedState,
    setExpandedState,
    toggleExpanded,
  };
}
