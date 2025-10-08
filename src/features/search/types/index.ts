// Search Feature Types

import type { SmartFolder, Tag, Task } from '@/types/common'

// Search result types
export type SearchResultType = 'task' | 'tag' | 'smart-folder' | 'event' | 'note' | 'file'

export interface SearchResult {
  id: string
  title: string
  description?: string
  type: SearchResultType
  icon?: string
  metadata?: Record<string, unknown>
  score?: number
  action?: () => void
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
  startDate?: Date
  endDate?: Date
  tags?: string[]
  status?: string[]
  priority?: string[]
  [key: string]: unknown
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

// Export data source types from common
export type { SmartFolder, Tag, Task }
