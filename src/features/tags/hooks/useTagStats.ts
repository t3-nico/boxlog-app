// タグ使用統計とサイドバー表示用のフック

import { useMemo } from 'react';

import type { Tag, TagUsageStats } from '@/features/tags/types';
import { getCacheStrategy } from '@/lib/tanstack-query/cache-config';
import { trpc } from '@/lib/trpc/client';

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

// クエリキー
export const tagStatsKeys = {
  all: ['tag-stats'] as const,
  stats: () => [...tagStatsKeys.all, 'stats'] as const,
  counts: () => [...tagStatsKeys.all, 'counts'] as const,
};

// タグ使用統計フック
export function useTagStats() {
  return trpc.tags.getStats.useQuery(undefined, {
    ...getCacheStrategy('tagStats'),
    select: (data) => {
      // tRPCレスポンスをTagUsageStats型に変換
      return data.data.map((item) => ({
        id: item.id,
        name: item.name,
        color: item.color ?? '#3B82F6',
        usage_count: item.total_count,
        task_count: 0, // 現在未実装
        event_count: 0, // 現在未実装
        record_count: 0, // 現在未実装
        last_used_at: item.last_used_at ? new Date(item.last_used_at) : null,
      })) as TagUsageStats[];
    },
  });
}

// タグ使用数カウントフック
export function useTagUsageCounts() {
  return trpc.tags.getStats.useQuery(undefined, {
    ...getCacheStrategy('tagStats'),
    select: (data) => {
      // タグID -> 使用数のマップに変換
      const counts: Record<string, number> = {};
      data.data.forEach((item) => {
        counts[item.id] = item.total_count;
      });
      return counts;
    },
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
