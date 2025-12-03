// Command Palette Configuration
export const COMMAND_PALETTE_CONFIG = {
  // Performance settings
  maxResults: 10,
  debounceMs: 300,

  // Keyboard shortcuts
  shortcuts: {
    open: ['cmd+k', 'ctrl+k'],
    close: ['escape'],
    selectNext: ['arrowdown'],
    selectPrev: ['arrowup'],
    execute: ['enter'],
  },

  // Search categories
  categories: [
    {
      id: 'navigation',
      label: 'Navigation',
      icon: 'compass',
      priority: 1,
    },
    {
      id: 'create',
      label: 'Create',
      icon: 'plus',
      priority: 2,
    },
    {
      id: 'plans',
      label: 'Plans',
      icon: 'check-square',
      priority: 3,
    },
    {
      id: 'tags',
      label: 'Tags',
      icon: 'tag',
      priority: 4,
    },
    {
      id: 'actions',
      label: 'Actions',
      icon: 'zap',
      priority: 5,
    },
    {
      id: 'ai',
      label: 'AI Assistant',
      icon: 'sparkles',
      priority: 6,
    },
    {
      id: 'compass',
      label: 'Compass Docs',
      icon: 'book-open',
      priority: 7,
    },
  ],

  // Animation settings
  animations: {
    overlayDuration: 200,
    contentDuration: 150,
    stagger: 50,
  },
} as const

// Command interface
export interface Command {
  id: string
  title: string
  description?: string
  category: string
  icon?: string
  shortcut?: string[]
  keywords?: string[]
  action: () => void | Promise<void>
  condition?: () => boolean
}

// Search result interface
export interface SearchResult {
  id: string
  title: string
  description?: string
  category: string
  icon?: string
  type: 'command' | 'plan' | 'tag' | 'page'
  action: () => void | Promise<void>
  metadata?: {
    tags?: string[]
    status?: string
    dueDate?: string | null
    planNumber?: string
    path?: string[]
  }
}

// Search options
export interface SearchOptions {
  query: string
  categories?: string[]
  limit?: number
  includeMetadata?: boolean
}
