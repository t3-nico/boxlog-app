// Search Feature Exports

// Types
export * from './types'

// Components
export { GlobalSearchModal } from './components/global-search-modal'
export { CompactSearchBar, SearchBar } from './components/search-bar'

// Hooks
export { GlobalSearchProvider, useGlobalSearch } from './hooks/use-global-search'
export { useSearch, useSearchHistory, useSearchSuggestions } from './hooks/use-search'

// Search Engine
export { FuzzySearch, SearchEngine } from './lib/search-engine'

// Re-export for convenience
export type {
  SearchContext,
  SearchFilters,
  SearchOptions,
  SearchProvider,
  SearchResult,
  SearchResultType,
} from './types'
