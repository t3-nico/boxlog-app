import { Command } from '../config/command-palette'

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
    commands.forEach(command => this.register(command))
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
      return allCommands.filter(command => categoryFilter.includes(command.category))
    }
    
    return allCommands
  }

  /**
   * Get available commands (filter by condition)
   */
  getAvailable(categoryFilter?: string[]): Command[] {
    return this.getAll(categoryFilter).filter(command => {
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

    return commands.filter(command => {
      // Search in title
      if (command.title.toLowerCase().includes(searchTerm)) return true
      
      // Search in description
      if (command.description?.toLowerCase().includes(searchTerm)) return true
      
      // Search in keywords
      if (command.keywords?.some(keyword => 
        keyword.toLowerCase().includes(searchTerm)
      )) return true
      
      return false
    }).sort((a, b) => {
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
export const registerDefaultCommands = (router: any) => {
  const defaultCommands: Command[] = [
    // Navigation commands
    {
      id: 'nav:calendar',
      title: 'Go to Calendar',
      description: 'View tasks in calendar layout',
      category: 'navigation',
      icon: 'calendar',
      keywords: ['calendar', 'schedule', 'time', 'date'],
      action: () => router.push('/calendar'),
    },
    {
      id: 'nav:board',
      title: 'Go to Board',
      description: 'View tasks in kanban board',
      category: 'navigation',
      icon: 'layout-board',
      keywords: ['board', 'kanban', 'columns'],
      action: () => router.push('/board'),
    },
    {
      id: 'nav:table',
      title: 'Go to Table',
      description: 'View tasks in table layout',
      category: 'navigation',
      icon: 'table',
      keywords: ['table', 'list', 'grid'],
      action: () => router.push('/table'),
    },
    {
      id: 'nav:stats',
      title: 'Go to Stats',
      description: 'View productivity statistics',
      category: 'navigation',
      icon: 'chart-bar',
      keywords: ['stats', 'analytics', 'metrics', 'reports'],
      action: () => router.push('/stats'),
    },

    // Creation commands
    {
      id: 'create:task',
      title: 'Create New Task',
      description: 'Add a new task to your list',
      category: 'create',
      icon: 'plus',
      shortcut: ['cmd+n', 'ctrl+n'],
      keywords: ['new', 'add', 'create', 'task', 'todo'],
      action: () => {
        // This will be implemented with the task creation modal
        console.log('Create new task')
      },
    },
    {
      id: 'create:tag',
      title: 'Create New Tag',
      description: 'Add a new tag for organization',
      category: 'create',
      icon: 'tag',
      keywords: ['new', 'add', 'create', 'tag', 'label'],
      action: () => {
        // This will be implemented with the tag creation modal
        console.log('Create new tag')
      },
    },
    {
      id: 'create:smart-folder',
      title: 'Create Smart Folder',
      description: 'Create a filtered view of tasks',
      category: 'create',
      icon: 'folder-plus',
      keywords: ['new', 'add', 'create', 'smart', 'folder', 'filter'],
      action: () => {
        // This will be implemented with the smart folder creation modal
        console.log('Create smart folder')
      },
    },

    // Settings commands
    {
      id: 'nav:settings',
      title: 'Open Settings',
      description: 'Configure application preferences',
      category: 'navigation',
      icon: 'cog',
      keywords: ['settings', 'preferences', 'config', 'options'],
      action: () => router.push('/settings'),
    },

    // Theme commands
    {
      id: 'action:toggle-theme',
      title: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      category: 'actions',
      icon: 'moon',
      keywords: ['theme', 'dark', 'light', 'mode'],
      action: () => {
        // This will be implemented with theme toggle
        console.log('Toggle theme')
      },
    },
  ]

  commandRegistry.registerMany(defaultCommands)
}