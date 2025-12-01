import { FuzzySearch } from '@/features/search'
import { SmartFolder, Tag, Task } from '@/types/common'

import { SearchOptions, SearchResult } from '../config/command-palette'

import { commandRegistry } from './command-registry'

export class SearchEngine {
  /**
   * Search across all available data sources
   */
  static async search(
    options: SearchOptions,
    stores?: {
      tasks?: Task[]
      tags?: Tag[]
      smartFolders?: SmartFolder[]
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

    const taskResults = FuzzySearch.search(tasks, query).map((task: Task): SearchResult => {
      const result: SearchResult = {
        id: `task:${task.id}`,
        title: task.title,
        category: 'tasks',
        icon: 'check-square',
        type: 'task',
        action: () => {
          // Navigation implementation tracked in Issue #86
          console.log('Navigate to task:', task.id)
        },
      }
      if (task.description) result.description = task.description
      // metadataは条件付きで追加
      if (task.status || task.priority || task.planned_start || task.tags) {
        result.metadata = {}
        if (task.status) result.metadata.status = task.status
        if (task.priority) result.metadata.priority = task.priority
        if (task.planned_start) result.metadata.dueDate = task.planned_start
        if (task.tags) result.metadata.tags = Array.isArray(task.tags) ? task.tags : []
      }
      return result
    })

    return taskResults
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
          // Filtering implementation tracked in Issue #86
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

    const searchableFolders = smartFolders.map((folder) => ({
      title: folder.name,
      description: folder.description || '',
      keywords: [folder.name].filter((keyword): keyword is string => Boolean(keyword)),
      originalFolder: folder,
    }))

    const folderResults = FuzzySearch.search(searchableFolders, query).map(
      (result: { originalFolder: SmartFolder }) => {
        const folder = result.originalFolder
        return {
          id: `smart-folder:${folder.id}`,
          title: folder.name,
          description: folder.description || 'Smart folder',
          category: 'navigation',
          icon: 'folder',
          type: 'smart-folder' as const,
          action: () => {
            // Navigation implementation tracked in Issue #86
            console.log('Navigate to smart folder:', folder.id)
          },
        }
      }
    )

    return folderResults
  }

  /**
   * Get recent items for empty search
   */
  static getRecentItems(): SearchResult[] {
    // Recent items tracking tracked in Issue #86
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
    // Context suggestions tracked in Issue #86
    // Based on current page, time of day, recent actions, etc.
    return []
  }
}
