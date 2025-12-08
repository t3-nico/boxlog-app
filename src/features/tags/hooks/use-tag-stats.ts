// タグ使用統計とサイドバー表示用のフック

import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import type { TagUsageStats, TagWithChildren } from '@/features/tags/types'
import { getCacheStrategy } from '@/lib/tanstack-query/cache-config'

interface TagWithUsage extends TagWithChildren {
  usage_count: number
  task_count: number
  event_count: number
  record_count: number
  last_used_at: Date | null
  children_with_usage: TagWithUsage[]
}

interface SidebarTagsOptions {
  maxTopLevel?: number
  maxChildren?: number
  minUsageCount?: number
}

/** API レスポンス型 */
interface TagStatsResponse {
  data: Array<{
    id: string
    name: string
    path: string | null
    level: number
    color: string | null
    plan_count: number
    total_count: number
    last_used_at: string | null
  }>
  count: number
}

// タグ使用統計API
const tagStatsAPI = {
  // タグ使用統計取得
  async fetchTagStats(): Promise<TagUsageStats[]> {
    const response = await fetch('/api/tags/stats')
    if (!response.ok) throw new Error('Failed to fetch tag stats')

    const json: TagStatsResponse = await response.json()
    // API レスポンスを TagUsageStats 型に変換
    return json.data.map((item) => ({
      id: item.id,
      name: item.name,
      path: item.path ?? '',
      level: item.level as 0 | 1 | 2,
      color: item.color ?? '#3B82F6',
      usage_count: item.total_count,
      task_count: 0, // 現在未実装
      event_count: 0, // 現在未実装
      record_count: 0, // 現在未実装
      last_used_at: item.last_used_at ? new Date(item.last_used_at) : null,
    }))
  },

  // タグ使用数カウント（タグID -> 使用数のマップ）
  async fetchTagUsageCounts(): Promise<Record<string, number>> {
    const response = await fetch('/api/tags/stats')
    if (!response.ok) throw new Error('Failed to fetch tag usage counts')

    const json: TagStatsResponse = await response.json()
    const counts: Record<string, number> = {}
    json.data.forEach((item) => {
      counts[item.id] = item.total_count
    })
    return counts
  },
}

// クエリキー
export const tagStatsKeys = {
  all: ['tag-stats'] as const,
  stats: () => [...tagStatsKeys.all, 'stats'] as const,
  usage: () => [...tagStatsKeys.all, 'usage'] as const,
}

// タグ使用統計フック
export function useTagStats() {
  return useQuery({
    queryKey: tagStatsKeys.stats(),
    queryFn: tagStatsAPI.fetchTagStats,
    ...getCacheStrategy('tagStats'),
  })
}

// タグ使用数フック
export function useTagUsageCounts() {
  return useQuery({
    queryKey: tagStatsKeys.usage(),
    queryFn: tagStatsAPI.fetchTagUsageCounts,
    ...getCacheStrategy('tagUsage'),
  })
}

// サイドバー表示用タグフック
export function useSidebarTags(allTags: TagWithChildren[], options: SidebarTagsOptions = {}) {
  const { maxTopLevel = 5, maxChildren = 3, minUsageCount = 1 } = options

  const { data: usageCounts = {}, isLoading } = useTagUsageCounts()

  const sidebarTags = useMemo(() => {
    if (isLoading || !allTags.length) return []

    // タグに使用数を付与
    const addUsageToTags = (tags: TagWithChildren[]): TagWithUsage[] => {
      return tags.map((tag) => {
        const usage_count = usageCounts[tag.id] || 0
        const childrenWithUsage = addUsageToTags(tag.children || [])

        // 子タグの使用数も合計に含める
        const totalUsage = usage_count + childrenWithUsage.reduce((sum, child) => sum + child.usage_count, 0)

        return {
          ...tag,
          usage_count: totalUsage,
          task_count: Math.floor(totalUsage * 0.7), // 仮想的な分散
          event_count: Math.floor(totalUsage * 0.2),
          record_count: Math.floor(totalUsage * 0.1),
          last_used_at: usage_count > 0 ? new Date() : null,
          children_with_usage: childrenWithUsage,
        }
      })
    }

    const tagsWithUsage = addUsageToTags(allTags)

    // 使用頻度でソート
    const sortByUsage = (tags: TagWithUsage[]): TagWithUsage[] => {
      return tags
        .filter((tag) => tag.usage_count >= minUsageCount)
        .sort((a, b) => b.usage_count - a.usage_count)
        .map((tag) => ({
          ...tag,
          children_with_usage: sortByUsage(tag.children_with_usage).slice(0, maxChildren),
        }))
    }

    const sortedTags = sortByUsage(tagsWithUsage)

    // トップレベルを制限
    return sortedTags.slice(0, maxTopLevel)
  }, [allTags, usageCounts, isLoading, maxTopLevel, maxChildren, minUsageCount])

  return {
    tags: sidebarTags,
    isLoading,
    totalTags: allTags.length,
    totalUsage: Object.values(usageCounts).reduce((sum, count) => sum + count, 0),
  }
}

// localStorage管理フック
export function useTagExpandedState() {
  const STORAGE_KEY = 'sidebar-tags-expanded'

  const getExpandedState = (): Set<string> => {
    if (typeof window === 'undefined') return new Set()

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch {
      return new Set()
    }
  }

  const setExpandedState = (expandedIds: Set<string>) => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(expandedIds)))
    } catch (error) {
      console.warn('Failed to save expanded state:', error)
    }
  }

  const toggleExpanded = (tagId: string, currentExpanded: Set<string>): Set<string> => {
    const newExpanded = new Set(currentExpanded)
    if (newExpanded.has(tagId)) {
      newExpanded.delete(tagId)
    } else {
      newExpanded.add(tagId)
    }
    setExpandedState(newExpanded)
    return newExpanded
  }

  return {
    getExpandedState,
    setExpandedState,
    toggleExpanded,
  }
}

// タグアイテムのアニメーション用
export function useTagItemAnimation() {
  const getAnimationClasses = (isExpanded: boolean, hasChildren: boolean) => {
    if (!hasChildren) return ''

    return isExpanded
      ? 'transform transition-transform duration-200 ease-out'
      : 'transform transition-transform duration-200 ease-in'
  }

  const getChevronClasses = (isExpanded: boolean) => {
    return `transform transition-transform duration-200 ease-in-out ${isExpanded ? 'rotate-90' : 'rotate-0'}`
  }

  return {
    getAnimationClasses,
    getChevronClasses,
  }
}

// デバッグ用のタグ統計表示
export function useTagStatsDebug() {
  const { data: usageCounts } = useTagUsageCounts()

  const debugInfo = useMemo(() => {
    if (!usageCounts) return null

    const entries = Object.entries(usageCounts)
    const total = entries.reduce((sum, [, count]) => sum + count, 0)
    const sorted = entries.sort(([, a], [, b]) => b - a)

    return {
      total,
      topTags: sorted.slice(0, 5),
      tagCount: entries.length,
      averageUsage: total / entries.length,
    }
  }, [usageCounts])

  return debugInfo
}
