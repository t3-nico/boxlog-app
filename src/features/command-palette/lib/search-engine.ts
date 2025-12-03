import { FuzzySearch } from '@/features/search'
import type { PlanWithTags } from '@/features/plans/types'
import type { Tag } from '@/types/common'

import { SearchOptions, SearchResult } from '../config/command-palette'

import { commandRegistry } from './command-registry'

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
    const { query, categories, limit = 10 } = options
    const results: SearchResult[] = []

    // Search commands
    const commands = commandRegistry.search(query, categories)
    const commandResults = commands.map((command): SearchResult => {
      const result: SearchResult = {
        id: `command:${command.id}`,
        title: command.title,
        category: command.category,
        type: 'command',
        action: command.action,
      }
      if (command.description) result.description = command.description
      if (command.icon) result.icon = command.icon
      return result
    })

    results.push(...commandResults)

    // Search plans if provided
    if (stores?.plans && (!categories || categories.includes('plans'))) {
      const planResults = SearchEngine.searchPlans(query, stores.plans)
      results.push(...planResults)
    }

    // Search tags if provided
    if (stores?.tags && (!categories || categories.includes('tags'))) {
      const tagResults = SearchEngine.searchTags(query, stores.tags)
      results.push(...tagResults)
    }

    // If no query, show recent/suggested items
    if (!query.trim() && results.length < 5) {
      const recentItems = SearchEngine.getRecentItems()
      results.push(...recentItems)
    }

    // Sort by relevance (commands first, then by score)
    results.sort((a, b) => {
      if (a.type === 'command' && b.type !== 'command') return -1
      if (a.type !== 'command' && b.type === 'command') return 1
      return 0
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
      ...plan,
      title: plan.title,
      description: plan.description || '',
      keywords: plan.tags?.map((t) => t.name) || [],
    }))

    const planResults = FuzzySearch.search(searchablePlans, query).map((plan): SearchResult => {
      const result: SearchResult = {
        id: `plan:${plan.id}`,
        title: plan.title,
        category: 'plans',
        icon: 'check-square',
        type: 'plan',
        action: () => {
          console.log('Navigate to plan:', plan.id)
        },
      }
      if (plan.description) result.description = plan.description
      result.metadata = {
        status: plan.status,
        dueDate: plan.due_date,
        planNumber: plan.plan_number,
        tags: plan.tags?.map((t) => t.name) || [],
      }
      return result
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

    const tagResults = FuzzySearch.search(searchableTags, query).map((result: { originalTag: Tag }) => {
      const tag = result.originalTag
      return {
        id: `tag:${tag.id}`,
        title: tag.name,
        description: tag.description || `Level ${tag.level} tag`,
        category: 'tags',
        icon: 'tag',
        type: 'tag' as const,
        action: () => {
          console.log('Filter by tag:', tag.id)
        },
        metadata: {
          path: tag.path ? [tag.path] : [],
        },
      }
    })

    return tagResults
  }

  /**
   * Get recent items for empty search
   */
  static getRecentItems(): SearchResult[] {
    return [
      {
        id: 'recent:calendar',
        title: 'Calendar View',
        description: 'Recently visited',
        category: 'navigation',
        icon: 'calendar',
        type: 'page',
        action: () => console.log('Navigate to calendar'),
      },
    ]
  }

  /**
   * Get suggested actions based on context
   */
  static getSuggestions(): SearchResult[] {
    return []
  }
}
