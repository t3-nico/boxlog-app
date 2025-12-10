import Fuse, { type FuseOptionKey, type FuseResult, type IFuseOptions } from 'fuse.js'

import type { Tag } from '@/features/tags/types'

import type { PlanWithTags } from '@/features/plans/types'

import type { SearchFilters, SearchOptions, SearchResult, SearchResultType } from '../types'

import { commandRegistry } from './command-registry'
import { parseSearchQuery } from './query-parser'

// Fuse.js match interface
export interface FuseMatch {
  indices: readonly [number, number][]
  key?: string
  value?: string
}

export interface FuseResultWithMatches<T> {
  item: T
  score?: number
  matches?: readonly FuseMatch[]
}

/**
 * Fuse.js wrapper for fuzzy search
 * Provides consistent interface and configuration with instance caching
 */
/**
 * FuzzySearch - simplified interface for quick searches
 * Uses FuseSearch internally
 */
export class FuzzySearch {
  /**
   * Simple fuzzy search helper for basic use cases
   */
  static search<T extends Record<string, unknown>>(items: T[], query: string, limit = 10): T[] {
    if (!query.trim()) {
      return items.slice(0, limit)
    }

    const results = FuseSearch.search(
      items,
      query,
      [
        { name: 'title', weight: 2 },
        { name: 'description', weight: 1 },
        { name: 'keywords', weight: 1.5 },
      ],
      limit
    )

    return results.map((r) => r.item)
  }
}

export class FuseSearch {
  /**
   * Default Fuse.js options optimized for Japanese + English search
   */
  private static readonly defaultOptions: IFuseOptions<unknown> = {
    threshold: 0.4, // 0 = exact match, 1 = match anything
    distance: 100, // How far to search for match
    minMatchCharLength: 1,
    includeScore: true,
    includeMatches: true, // For highlighting
    useExtendedSearch: false,
    ignoreLocation: true, // Don't prioritize matches at start
    findAllMatches: true,
  }

  // Instance cache for reusing Fuse instances
  private static instanceCache = new Map<string, { fuse: Fuse<unknown>; itemsHash: number }>()

  /**
   * Generate a simple hash for cache invalidation
   */
  private static hashItems(items: unknown[]): number {
    return items.length
  }

  /**
   * Get or create a cached Fuse instance
   */
  private static getOrCreateInstance<T extends Record<string, unknown>>(
    cacheKey: string,
    items: T[],
    keys: FuseOptionKey<T>[]
  ): Fuse<T> {
    const itemsHash = FuseSearch.hashItems(items)
    const cached = FuseSearch.instanceCache.get(cacheKey)

    if (cached && cached.itemsHash === itemsHash) {
      return cached.fuse as Fuse<T>
    }

    const fuse = new Fuse(items, {
      ...FuseSearch.defaultOptions,
      keys,
    })

    FuseSearch.instanceCache.set(cacheKey, { fuse: fuse as Fuse<unknown>, itemsHash })

    return fuse
  }

  /**
   * Search items with Fuse.js (with instance caching)
   */
  static search<T extends Record<string, unknown>>(
    items: T[],
    query: string,
    keys: FuseOptionKey<T>[],
    limit = 10,
    cacheKey?: string
  ): FuseResultWithMatches<T>[] {
    if (!query.trim()) {
      // Return all items with default score when no query
      return items.slice(0, limit).map((item) => ({
        item,
        score: 0,
        matches: [],
      }))
    }

    const fuse = cacheKey
      ? FuseSearch.getOrCreateInstance(cacheKey, items, keys)
      : new Fuse(items, { ...FuseSearch.defaultOptions, keys })

    const results = fuse.search(query, { limit })

    // Convert Fuse results to our interface
    return results.map(
      (result: FuseResult<T>): FuseResultWithMatches<T> => ({
        item: result.item,
        score: result.score ?? 0,
        matches: (result.matches as readonly FuseMatch[] | undefined) ?? [],
      })
    )
  }

  /**
   * Clear the instance cache (useful for testing or memory cleanup)
   */
  static clearCache(): void {
    FuseSearch.instanceCache.clear()
  }

  /**
   * Convert Fuse.js score (0 = best) to our score (1 = best)
   */
  static normalizeScore(fuseScore: number | undefined): number {
    if (fuseScore === undefined) return 1
    return 1 - fuseScore
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

    // Parse query for quick filters
    const parsed = parseSearchQuery(query)

    // Search commands if included (only when no filters applied)
    if (!parsed.hasFilters && (!types || types.includes('command'))) {
      const commandResults = SearchEngine.searchCommands(parsed.text)
      results.push(...commandResults)
    }

    // Search plans if provided
    if (stores?.plans && (!types || types.includes('plan'))) {
      const planResults = SearchEngine.searchPlans(parsed.text, stores.plans, parsed.filters)
      results.push(...planResults)
    }

    // Search tags if provided
    if (stores?.tags && (!types || types.includes('tag'))) {
      // If filtering by tag, search in tags as well
      const tagResults = SearchEngine.searchTags(parsed.text, stores.tags, parsed.filters.tags)
      results.push(...tagResults)
    }

    // Sort by type priority (commands first) and then by score
    results.sort((a, b) => {
      // Commands first
      if (a.type === 'command' && b.type !== 'command') return -1
      if (a.type !== 'command' && b.type === 'command') return 1

      // Then by score
      const scoreA = a.score || 0
      const scoreB = b.score || 0
      return scoreB - scoreA
    })

    // Limit results
    return results.slice(0, limit)
  }

  /**
   * Search commands
   */
  static searchCommands(query: string): SearchResult[] {
    const commands = commandRegistry.search(query)

    return commands.map((command) => {
      const result: SearchResult = {
        id: `command:${command.id}`,
        title: command.title,
        type: 'command' as SearchResultType,
        category: command.category,
        action: command.action,
      }
      if (command.description) {
        result.description = command.description
      }
      if (command.icon) {
        result.icon = command.icon
      }
      if (command.shortcut) {
        result.shortcut = command.shortcut
      }
      return result
    })
  }

  /**
   * Search plans
   */
  static searchPlans(query: string, plans: PlanWithTags[], filters?: SearchFilters): SearchResult[] {
    if (!plans || plans.length === 0) return []

    // Apply filters first
    let filteredPlans = plans

    if (filters?.status && filters.status.length > 0) {
      filteredPlans = filteredPlans.filter((plan) => filters.status!.includes(plan.status))
    }

    if (filters?.tags && filters.tags.length > 0) {
      filteredPlans = filteredPlans.filter((plan) =>
        filters.tags!.some((filterTag) =>
          plan.tags?.some((planTag) => planTag.name.toLowerCase().includes(filterTag.toLowerCase()))
        )
      )
    }

    if (filters?.dueDate) {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const weekEnd = new Date(today)
      weekEnd.setDate(weekEnd.getDate() + 7)

      filteredPlans = filteredPlans.filter((plan) => {
        if (!plan.due_date) {
          return filters.dueDate === 'no_due_date'
        }

        const dueDate = new Date(plan.due_date)

        switch (filters.dueDate) {
          case 'today':
            return dueDate >= today && dueDate < tomorrow
          case 'tomorrow':
            return dueDate >= tomorrow && dueDate < new Date(tomorrow.getTime() + 86400000)
          case 'this_week':
            return dueDate >= today && dueDate < weekEnd
          case 'overdue':
            return dueDate < today && plan.status !== 'done'
          case 'no_due_date':
            return false
          default:
            return true
        }
      })
    }

    // Prepare searchable data with index signature for Fuse.js
    interface SearchablePlan {
      [key: string]: unknown
      id: string
      title: string
      description: string | null
      tagNames: string
      status: string
      due_date: string | null
      plan_number: string
      tags?: Array<{ id: string; name: string; color: string; description?: string }>
    }
    const searchablePlans: SearchablePlan[] = filteredPlans.map((plan) => ({
      id: plan.id,
      title: plan.title,
      description: plan.description,
      status: plan.status,
      due_date: plan.due_date,
      plan_number: plan.plan_number,
      tags: plan.tags,
      tagNames: plan.tags?.map((t) => t.name).join(' ') || '',
    }))

    // Search with Fuse.js (cached instance)
    const fuseResults = FuseSearch.search(
      searchablePlans,
      query,
      [
        { name: 'title', weight: 2 },
        { name: 'description', weight: 1 },
        { name: 'tagNames', weight: 1.5 },
      ],
      20,
      'plans' // Cache key for plans search
    )

    const results: SearchResult[] = fuseResults.map((result) => {
      const searchResult: SearchResult = {
        id: `plan:${result.item.id}`,
        title: String(result.item.title),
        type: 'plan' as SearchResultType,
        category: 'plans',
        icon: 'check-square',
        score: FuseSearch.normalizeScore(result.score),
        metadata: {
          status: result.item.status,
          dueDate: result.item.due_date,
          tags: result.item.tags?.map((t) => t.name) || [],
          planNumber: result.item.plan_number,
          matches: result.matches,
        },
      }
      if (result.item.description) {
        searchResult.description = String(result.item.description)
      }
      return searchResult
    })

    return results
  }

  /**
   * Search tags from the tag store
   */
  static searchTags(query: string, tags: Tag[], filterTags?: string[]): SearchResult[] {
    if (!tags || tags.length === 0) return []

    // If we have filter tags, prioritize matching those
    let filteredTagsList = tags
    if (filterTags && filterTags.length > 0) {
      filteredTagsList = tags.filter((tag) =>
        filterTags.some((filterTag) => tag.name.toLowerCase().includes(filterTag.toLowerCase()))
      )
    }

    // Prepare searchable data with index signature for Fuse.js
    interface SearchableTag {
      [key: string]: unknown
      id: string
      name: string
      description: string | null
      color: string
      tag_number: number
    }
    const searchableTags: SearchableTag[] = filteredTagsList.map((tag) => ({
      id: tag.id,
      name: tag.name,
      description: tag.description,
      color: tag.color,
      tag_number: tag.tag_number,
    }))

    // Search with Fuse.js (cached instance)
    const fuseResults = FuseSearch.search(
      searchableTags,
      query,
      [
        { name: 'name', weight: 2 },
        { name: 'description', weight: 1 },
      ],
      20,
      'tags' // Cache key for tags search
    )

    return fuseResults.map((result) => ({
      id: `tag:${result.item.id}`,
      title: String(result.item.name),
      description: result.item.description ? String(result.item.description) : 'Tag',
      type: 'tag' as SearchResultType,
      category: 'tags',
      icon: 'tag',
      score: FuseSearch.normalizeScore(result.score),
      metadata: {
        color: result.item.color,
        tagNumber: result.item.tag_number,
        matches: result.matches, // Include matches for highlighting
      },
    }))
  }
}
