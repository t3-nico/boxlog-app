import Fuse from 'fuse.js'

import type { Tag } from '@/types/common'

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
  matches?: FuseMatch[]
}

/**
 * Fuse.js wrapper for fuzzy search
 * Provides consistent interface and configuration with instance caching
 */
export class FuseSearch {
  /**
   * Default Fuse.js options optimized for Japanese + English search
   */
  private static readonly defaultOptions: Fuse.IFuseOptions<unknown> = {
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
    keys: Fuse.FuseOptionKey<T>[]
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
    keys: Fuse.FuseOptionKey<T>[],
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

    return results as FuseResultWithMatches<T>[]
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

    return commands.map((command) => ({
      id: `command:${command.id}`,
      title: command.title,
      description: command.description,
      type: 'command' as SearchResultType,
      category: command.category,
      icon: command.icon,
      shortcut: command.shortcut,
      action: command.action,
    }))
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

    // Prepare searchable data
    type SearchablePlan = PlanWithTags & { tagNames: string }
    const searchablePlans: SearchablePlan[] = filteredPlans.map((plan) => ({
      ...plan,
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

    return fuseResults.map((result) => ({
      id: `plan:${result.item.id}`,
      title: result.item.title,
      description: result.item.description || undefined,
      type: 'plan' as SearchResultType,
      category: 'plans',
      icon: 'check-square',
      score: FuseSearch.normalizeScore(result.score),
      metadata: {
        status: result.item.status,
        dueDate: result.item.due_date,
        tags: result.item.tags?.map((t) => t.name) || [],
        planNumber: result.item.plan_number,
        matches: result.matches, // Include matches for highlighting
      },
    }))
  }

  /**
   * Search tags from the tag store
   */
  static searchTags(query: string, tags: Tag[], filterTags?: string[]): SearchResult[] {
    if (!tags || tags.length === 0) return []

    // If we have filter tags, prioritize matching those
    let filteredTags = tags
    if (filterTags && filterTags.length > 0) {
      filteredTags = tags.filter((tag) =>
        filterTags.some((filterTag) => tag.name.toLowerCase().includes(filterTag.toLowerCase()))
      )
    }

    // Search with Fuse.js (cached instance)
    const fuseResults = FuseSearch.search(
      filteredTags,
      query,
      [
        { name: 'name', weight: 2 },
        { name: 'description', weight: 1 },
        { name: 'path', weight: 1.5 },
      ],
      20,
      'tags' // Cache key for tags search
    )

    return fuseResults.map((result) => ({
      id: `tag:${result.item.id}`,
      title: result.item.name,
      description: result.item.description || `Level ${result.item.level} tag`,
      type: 'tag' as SearchResultType,
      category: 'tags',
      icon: 'tag',
      score: FuseSearch.normalizeScore(result.score),
      metadata: {
        path: result.item.path ? [result.item.path] : [],
        color: result.item.color,
        tagNumber: result.item.tag_number,
        matches: result.matches, // Include matches for highlighting
      },
    }))
  }
}
