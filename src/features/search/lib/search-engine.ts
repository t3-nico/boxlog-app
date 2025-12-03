import type { Tag } from '@/types/common'

import type { PlanWithTags } from '@/features/plans/types'

import type { SearchOptions, SearchResult, SearchResultType } from '../types'

// Simple fuzzy search implementation
export class FuzzySearch {
  /**
   * Calculate fuzzy match score between query and target
   * Returns 0-1, where 1 is perfect match
   */
  static score(query: string, target: string): number {
    if (!query || !target) return 0

    query = query.toLowerCase()
    target = target.toLowerCase()

    // Exact match gets highest score
    if (target === query) return 1

    // Target contains query gets high score
    if (target.includes(query)) {
      const startMatch = target.startsWith(query)
      const containsScore = query.length / target.length
      return startMatch ? containsScore * 0.9 : containsScore * 0.7
    }

    // Character-by-character fuzzy matching
    let queryIndex = 0
    let targetIndex = 0
    let matches = 0

    while (queryIndex < query.length && targetIndex < target.length) {
      if (query[queryIndex] === target[targetIndex]) {
        matches++
        queryIndex++
      }
      targetIndex++
    }

    if (queryIndex === query.length) {
      return (matches / query.length) * 0.5
    }

    return 0
  }

  /**
   * Search and rank results by relevance
   */
  static search<T extends { title: string; description?: string; keywords?: string[] }>(
    items: T[],
    query: string,
    limit = 10
  ): (T & { score: number })[] {
    if (!query.trim()) return items.slice(0, limit).map((item) => ({ ...item, score: 1 }))

    const results = items.map((item) => {
      let maxScore = 0

      // Score against title (highest weight)
      const titleScore = FuzzySearch.score(query, item.title) * 2
      maxScore = Math.max(maxScore, titleScore)

      // Score against description (medium weight)
      if (item.description) {
        const descScore = FuzzySearch.score(query, item.description) * 1.5
        maxScore = Math.max(maxScore, descScore)
      }

      // Score against keywords (medium weight)
      if (item.keywords) {
        for (const keyword of item.keywords) {
          const keywordScore = FuzzySearch.score(query, keyword) * 1.3
          maxScore = Math.max(maxScore, keywordScore)
        }
      }

      return { ...item, score: maxScore }
    })

    return results
      .filter((result) => result.score > 0.1) // Filter out very low scores
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, limit)
  }
}

export class SearchEngine {
  /**
   * Search across all available data sources
   */
  static async search(
    options: SearchOptions,
    stores?: {
      plans?: PlanWithTags[]
      tags?: Tag[]
    }
  ): Promise<SearchResult[]> {
    const { query, types, limit = 10 } = options
    const results: SearchResult[] = []

    // Search plans if provided
    if (stores?.plans && (!types || types.includes('plan'))) {
      const planResults = SearchEngine.searchPlans(query, stores.plans)
      results.push(...planResults)
    }

    // Search tags if provided
    if (stores?.tags && (!types || types.includes('tag'))) {
      const tagResults = SearchEngine.searchTags(query, stores.tags)
      results.push(...tagResults)
    }

    // If no query, show recent/suggested items
    if (!query.trim() && results.length < 5) {
      const recentItems = SearchEngine.getRecentItems()
      results.push(...recentItems)
    }

    // Sort by relevance score
    results.sort((a, b) => {
      const scoreA = a.score || 0
      const scoreB = b.score || 0
      return scoreB - scoreA
    })

    // Limit results
    return results.slice(0, limit)
  }

  /**
   * Search plans
   */
  static searchPlans(query: string, plans: PlanWithTags[]): SearchResult[] {
    if (!plans || plans.length === 0) return []

    const searchablePlans = plans.map((plan) => ({
      title: plan.title,
      description: plan.description || '',
      keywords: plan.tags?.map((tag) => tag.name) || [],
      originalPlan: plan,
    }))

    const planResults = FuzzySearch.search(searchablePlans, query).map((result) => {
      const plan = result.originalPlan
      return {
        id: `plan:${plan.id}`,
        title: plan.title,
        description: plan.description || undefined,
        type: 'plan' as SearchResultType,
        icon: 'check-square',
        score: result.score,
        metadata: {
          status: plan.status,
          dueDate: plan.due_date,
          tags: plan.tags?.map((t) => t.name) || [],
          planNumber: plan.plan_number,
        },
      }
    })

    return planResults
  }

  /**
   * Search tags from the tag store
   */
  static searchTags(query: string, tags: Tag[]): SearchResult[] {
    if (!tags || tags.length === 0) return []

    const searchableTags = tags.map((tag) => ({
      title: tag.name,
      description: tag.description || '',
      keywords: [tag.name, tag.path].filter((keyword): keyword is string => Boolean(keyword)),
      originalTag: tag,
    }))

    const tagResults = FuzzySearch.search(searchableTags, query).map((result) => {
      const tag = result.originalTag
      return {
        id: `tag:${tag.id}`,
        title: tag.name,
        description: tag.description || `Level ${tag.level} tag`,
        type: 'tag' as SearchResultType,
        icon: 'tag',
        score: result.score,
        metadata: {
          path: tag.path ? [tag.path] : [],
          color: tag.color,
        },
      }
    })

    return tagResults
  }

  /**
   * Get recent items for empty search
   */
  static getRecentItems(): SearchResult[] {
    // TODO: LocalStorage から最近アクセスしたアイテムを取得
    return []
  }

  /**
   * Get suggested actions based on context
   */
  static getSuggestions(): SearchResult[] {
    // TODO: コンテキストに基づくサジェスト
    return []
  }
}
