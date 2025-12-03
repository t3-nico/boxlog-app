import type { Command } from '../types'

class CommandRegistry {
  private commands = new Map<string, Command>()
  private categories = new Set<string>()

  /**
   * Register a new command
   */
  register(command: Command): void {
    this.commands.set(command.id, command)
    this.categories.add(command.category)
  }

  /**
   * Register multiple commands
   */
  registerMany(commands: Command[]): void {
    commands.forEach((command) => this.register(command))
  }

  /**
   * Unregister a command
   */
  unregister(commandId: string): void {
    const command = this.commands.get(commandId)
    if (command) {
      this.commands.delete(commandId)
    }
  }

  /**
   * Get a command by ID
   */
  get(commandId: string): Command | undefined {
    return this.commands.get(commandId)
  }

  /**
   * Get all commands, optionally filtered by category
   */
  getAll(categoryFilter?: string[]): Command[] {
    const allCommands = Array.from(this.commands.values())

    if (categoryFilter && categoryFilter.length > 0) {
      return allCommands.filter((command) => categoryFilter.includes(command.category))
    }

    return allCommands
  }

  /**
   * Get available commands (filter by condition)
   */
  getAvailable(categoryFilter?: string[]): Command[] {
    return this.getAll(categoryFilter).filter((command) => {
      if (!command.condition) return true
      try {
        return command.condition()
      } catch {
        return false
      }
    })
  }

  /**
   * Search commands by query
   */
  search(query: string, categoryFilter?: string[]): Command[] {
    if (!query.trim()) {
      return this.getAvailable(categoryFilter)
    }

    const searchTerm = query.toLowerCase()
    const commands = this.getAvailable(categoryFilter)

    return commands
      .filter((command) => {
        // Search in title
        if (command.title.toLowerCase().includes(searchTerm)) return true

        // Search in description
        if (command.description?.toLowerCase().includes(searchTerm)) return true

        // Search in keywords
        if (command.keywords?.some((keyword) => keyword.toLowerCase().includes(searchTerm))) return true

        return false
      })
      .sort((a, b) => {
        // Prioritize exact title matches
        const aExactTitle = a.title.toLowerCase().startsWith(searchTerm)
        const bExactTitle = b.title.toLowerCase().startsWith(searchTerm)

        if (aExactTitle && !bExactTitle) return -1
        if (!aExactTitle && bExactTitle) return 1

        // Fallback to alphabetical
        return a.title.localeCompare(b.title)
      })
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    return Array.from(this.categories)
  }

  /**
   * Clear all commands (useful for testing)
   */
  clear(): void {
    this.commands.clear()
    this.categories.clear()
  }
}

// Export singleton instance
export const commandRegistry = new CommandRegistry()

// Default commands that are always available
export const registerDefaultCommands = (router: { push: (path: string) => void }) => {
  const defaultCommands: Command[] = [
    // Navigation commands
    {
      id: 'nav:calendar',
      title: 'カレンダーを開く',
      description: 'カレンダービューを表示',
      category: 'navigation',
      icon: 'calendar',
      keywords: ['calendar', 'schedule', 'カレンダー', '予定'],
      action: () => router.push('/calendar'),
    },
    {
      id: 'nav:inbox',
      title: 'Inboxを開く',
      description: 'タスク一覧を表示',
      category: 'navigation',
      icon: 'inbox',
      keywords: ['inbox', 'board', 'kanban', 'タスク', '一覧'],
      action: () => router.push('/inbox'),
    },
    {
      id: 'nav:stats',
      title: '統計を開く',
      description: '生産性の統計を表示',
      category: 'navigation',
      icon: 'bar-chart',
      keywords: ['stats', 'analytics', '統計', 'レポート'],
      action: () => router.push('/stats'),
    },
    {
      id: 'nav:tags',
      title: 'タグを開く',
      description: 'タグ一覧を表示',
      category: 'navigation',
      icon: 'tag',
      keywords: ['tags', 'タグ', 'ラベル'],
      action: () => router.push('/tags'),
    },

    // Creation commands
    {
      id: 'create:plan',
      title: '新規プラン作成',
      description: '新しいプランを追加',
      category: 'create',
      icon: 'plus',
      keywords: ['new', 'add', 'create', '新規', '作成', 'プラン'],
      action: () => {
        console.log('Create new plan')
      },
    },
    {
      id: 'create:tag',
      title: '新規タグ作成',
      description: '新しいタグを追加',
      category: 'create',
      icon: 'tag',
      keywords: ['new', 'add', 'create', '新規', '作成', 'タグ'],
      action: () => {
        console.log('Create new tag')
      },
    },
  ]

  commandRegistry.registerMany(defaultCommands)
}
