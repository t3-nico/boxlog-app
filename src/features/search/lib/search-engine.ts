import type { 
  SearchResult, 
  SearchOptions, 
  SearchResultType,
  SearchProvider,
  FuzzySearchConfig
} from '../types'
import type { Task, Tag, SmartFolder } from '@/types/common'
import type { Event } from '@/features/events'

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
    if (!query.trim()) return items.slice(0, limit).map(item => ({ ...item, score: 1 }))
    
    const results = items.map(item => {
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
      .filter(result => result.score > 0.1) // Filter out very low scores
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, limit)
  }
}

export class SearchEngine {
  private static providers: Map<SearchResultType, SearchProvider> = new Map()

  /**
   * Register a search provider
   */
  static registerProvider(type: SearchResultType, provider: SearchProvider) {
    SearchEngine.providers.set(type, provider)
  }

  /**
   * Search across all available data sources
   */
  static async search(options: SearchOptions, stores?: {
    tasks?: Task[]
    tags?: Tag[]
    smartFolders?: SmartFolder[]
    events?: Event[]
  }): Promise<SearchResult[]> {
    const { query, types, limit = 10 } = options
    let results: SearchResult[] = []
    
    // Search tasks if provided
    if (stores?.tasks && (!types || types.includes('task'))) {
      const taskResults = SearchEngine.searchTasks(query, stores.tasks)
      results.push(...taskResults)
    }
    
    // Search tags if provided
    if (stores?.tags && (!types || types.includes('tag'))) {
      const tagResults = SearchEngine.searchTags(query, stores.tags)
      results.push(...tagResults)
    }
    
    // Search smart folders if provided
    if (stores?.smartFolders && (!types || types.includes('smart-folder'))) {
      const smartFolderResults = SearchEngine.searchSmartFolders(query, stores.smartFolders)
      results.push(...smartFolderResults)
    }
    
    // Search events if provided
    if (stores?.events && (!types || types.includes('event'))) {
      const eventResults = SearchEngine.searchEvents(query, stores.events)
      results.push(...eventResults)
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
   * Search tasks from the task store
   */
  static searchTasks(query: string, tasks: Task[]): SearchResult[] {
    if (!tasks || tasks.length === 0) return []
    
    const taskResults = FuzzySearch.search(tasks, query).map(task => ({
      id: `task:${task.id}`,
      title: task.title,
      description: task.description,
      type: 'task' as SearchResultType,
      icon: 'check-square',
      action: () => {
        // TODO: Implement task navigation
        console.log('Navigate to task:', task.id)
      },
      metadata: {
        status: task.status,
        priority: task.priority,
        dueDate: task.due_date,
        tags: task.tags || [],
      },
    }))
    
    return taskResults
  }

  /**
   * Search tags from the tag store
   */
  static searchTags(query: string, tags: Tag[]): SearchResult[] {
    if (!tags || tags.length === 0) return []
    
    const searchableTags = tags.map(tag => ({
      title: tag.name,
      description: tag.description || '',
      keywords: [tag.name, tag.path].filter((keyword): keyword is string => Boolean(keyword)),
      originalTag: tag
    }))
    
    const tagResults = FuzzySearch.search(searchableTags, query).map(result => {
      const tag = result.originalTag
      return {
        id: `tag:${tag.id}`,
        title: tag.name,
        description: tag.description || `Level ${tag.level} tag`,
        type: 'tag' as SearchResultType,
        icon: 'tag',
        action: () => {
          // TODO: Implement tag filtering
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
   * Search smart folders
   */
  static searchSmartFolders(query: string, smartFolders: SmartFolder[]): SearchResult[] {
    if (!smartFolders || smartFolders.length === 0) return []
    
    const searchableFolders = smartFolders.map(folder => ({
      title: folder.name,
      description: folder.description || '',
      keywords: [folder.name].filter((keyword): keyword is string => Boolean(keyword)),
      originalFolder: folder
    }))
    
    const folderResults = FuzzySearch.search(searchableFolders, query).map(result => {
      const folder = result.originalFolder
      return {
        id: `smart-folder:${folder.id}`,
        title: folder.name,
        description: folder.description || 'Smart folder',
        type: 'smart-folder' as SearchResultType,
        icon: 'folder',
        action: () => {
          // TODO: Implement smart folder navigation
          console.log('Navigate to smart folder:', folder.id)
        },
      }
    })
    
    return folderResults
  }

  /**
   * Search events
   */
  static searchEvents(query: string, events: Event[]): SearchResult[] {
    if (!events || events.length === 0) return []
    
    const searchableEvents = events.map(event => ({
      title: event.title,
      description: event.description || '',
      keywords: [event.title, event.location].filter((keyword): keyword is string => Boolean(keyword)),
      originalEvent: event
    }))
    
    const eventResults = FuzzySearch.search(searchableEvents, query).map(result => {
      const event = result.originalEvent
      return {
        id: `event:${event.id}`,
        title: event.title,
        description: event.description || 'Event',
        type: 'event' as SearchResultType,
        icon: 'calendar',
        action: () => {
          // TODO: Implement event navigation
          console.log('Navigate to event:', event.id)
        },
        metadata: {
          startDate: event.startDate,
          endDate: event.endDate,
          status: event.status,
        },
        score: result.score
      }
    })
    
    return eventResults
  }

  /**
   * Get recent items for empty search
   */
  static getRecentItems(): SearchResult[] {
    // TODO: Implement recent items tracking
    // This could be stored in localStorage or a store
    return [
      {
        id: 'recent:calendar',
        title: 'Calendar View',
        description: 'Recently visited',
        type: 'task' as SearchResultType,
        icon: 'calendar',
        action: () => console.log('Navigate to calendar'),
      },
    ]
  }

  /**
   * Get suggested actions based on context
   */
  static getSuggestions(): SearchResult[] {
    // TODO: Implement context-aware suggestions
    // Based on current page, time of day, recent actions, etc.
    return []
  }
}