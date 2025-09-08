// Search Feature Exports

// Types
export * from './types'

// Components
export { SearchBar, CompactSearchBar } from './components/search-bar'
export { GlobalSearchModal } from './components/global-search-modal'

// Hooks
export { 
  useSearch, 
  useSearchHistory, 
  useSearchSuggestions 
} from './hooks/use-search'
export { 
  useGlobalSearch, 
  GlobalSearchProvider 
} from './hooks/use-global-search'

// Search Engine
export { SearchEngine, FuzzySearch } from './lib/search-engine'

// Re-export for convenience
export type { 
  SearchResult,
  SearchOptions,
  SearchResultType,
  SearchFilters,
  SearchContext,
  SearchProvider
} from './types'