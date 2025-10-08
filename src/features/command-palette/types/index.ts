// Command Palette Types

export interface Command {
  id: string
  title: string
  description?: string
  category: string
  action: () => void | Promise<void>
  shortcut?: string[]
  priority?: number
  icon?: string
  disabled?: boolean
}

export interface SearchResult {
  id: string
  title: string
  description?: string
  category: string
  action: () => void | Promise<void>
  shortcut?: string[]
  priority?: number
  icon?: string
  score?: number
  type: 'command' | 'navigation' | 'task' | 'tag' | 'document'
}

export interface SearchOptions {
  maxResults?: number
  categoryFilter?: string[]
  scoreThreshold?: number
}

export interface CommandCategory {
  id: string
  label: string
  icon?: string
  priority: number
}

export interface CommandPaletteConfig {
  maxResults: number
  debounceMs: number
  shortcuts: {
    open: string[]
    close: string[]
    selectNext: string[]
    selectPrev: string[]
    execute: string[]
  }
  categories: CommandCategory[]
}

export interface CommandPaletteContextType {
  open: () => void
  close: () => void
  isOpen: boolean
}

export interface CompassDoc {
  id: string
  title: string
  description?: string
  path: string
  category: string
  content?: string
}
