import { SearchResult, SearchOptions } from '@/config/command-palette'
import { commandRegistry } from './command-registry'
import { Task, Tag, SmartFolder } from '@/types/common'

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
  /**
   * Search across all available data sources
   */
  static async search(options: SearchOptions, stores?: {
    tasks?: Task[]
    tags?: Tag[]
    smartFolders?: SmartFolder[]
  }): Promise<SearchResult[]> {
    const { query, categories, limit = 10 } = options
    let results: SearchResult[] = []
    
    // Search commands
    const commands = commandRegistry.search(query, categories)
    const commandResults: SearchResult[] = commands.map(command => ({
      id: `command:${command.id}`,
      title: command.title,
      description: command.description,
      category: command.category,
      icon: command.icon,
      type: 'command' as const,
      action: command.action,
    }))
    
    results.push(...commandResults)
    
    // Search tasks if provided
    if (stores?.tasks && (!categories || categories.includes('tasks'))) {
      const taskResults = SearchEngine.searchTasks(query, stores.tasks)
      results.push(...taskResults)
    }
    
    // Search tags if provided
    if (stores?.tags && (!categories || categories.includes('tags'))) {
      const tagResults = SearchEngine.searchTags(query, stores.tags)
      results.push(...tagResults)
    }
    
    // Search smart folders if provided
    if (stores?.smartFolders && (!categories || categories.includes('navigation'))) {
      const smartFolderResults = SearchEngine.searchSmartFolders(query, stores.smartFolders)
      results.push(...smartFolderResults)
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
   * Search tasks from the task store
   */
  static searchTasks(query: string, tasks: Task[]): SearchResult[] {
    if (!tasks || tasks.length === 0) return []
    
    const taskResults = FuzzySearch.search(tasks, query).map(task => ({
      id: `task:${task.id}`,
      title: task.title,
      description: task.description,
      category: 'tasks',
      icon: 'check-square',
      type: 'task' as const,
      action: () => {
        // TODO: Implement task navigation
        console.log('Navigate to task:', task.id)
      },
      metadata: {
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate?.toISOString(),
        tags: task.tags?.map(tag => tag.name) || [],
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
        category: 'tags',
        icon: 'tag',
        type: 'tag' as const,
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
        category: 'navigation',
        icon: 'folder',
        type: 'smart-folder' as const,
        action: () => {
          // TODO: Implement smart folder navigation
          console.log('Navigate to smart folder:', folder.id)
        },
      }
    })
    
    return folderResults
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
    // TODO: Implement context-aware suggestions
    // Based on current page, time of day, recent actions, etc.
    return []
  }
}