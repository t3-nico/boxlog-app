// Search Feature Types

import type { Tag } from '@/types/common'

import type { PlanStatus, PlanWithTags } from '@/features/plans/types'

// Search result types
export type SearchResultType = 'command' | 'plan' | 'tag'

export interface SearchResult {
  id: string
  title: string
  description?: string
  type: SearchResultType
  category?: string
  icon?: string
  shortcut?: string[]
  metadata?: Record<string, unknown>
  score?: number
  action?: () => void | Promise<void>
}

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

// Search options and filters
export interface SearchOptions {
  query: string
  types?: SearchResultType[]
  limit?: number
  offset?: number
  sortBy?: 'relevance' | 'date' | 'title'
  filters?: SearchFilters
}

export interface SearchFilters {
  status?: PlanStatus[]
  tags?: string[]
  dueDate?: 'today' | 'tomorrow' | 'this_week' | 'overdue' | 'no_due_date' | 'all'
}

// Search context for advanced features
export interface SearchContext {
  currentPage?: string
  recentSearches?: string[]
  userPreferences?: SearchPreferences
}

export interface SearchPreferences {
  defaultTypes?: SearchResultType[]
  resultsPerPage?: number
  fuzzyMatchThreshold?: number
}

// Fuzzy search configuration
export interface FuzzySearchConfig {
  threshold?: number
  includeScore?: boolean
  keys?: string[]
  maxPatternLength?: number
}

// Search providers interface
export interface SearchProvider<T = unknown> {
  type: SearchResultType
  search: (query: string, options?: Partial<SearchOptions>) => Promise<SearchResult[]>
  getById?: (id: string) => Promise<T | null>
}

// Search history
export interface SearchHistoryItem {
  query: string
  timestamp: Date
  resultsCount: number
  clickedResults?: string[]
}

// Export data source types
export type { PlanWithTags, Tag }
