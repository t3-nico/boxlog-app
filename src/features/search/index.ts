// Search Feature Exports

// Types
export * from './types'

// Components
export { GlobalSearchModal } from './components/global-search-modal'
export { CompactSearchBar, SearchBar } from './components/search-bar'

// Hooks
export { GlobalSearchProvider, useGlobalSearch } from './hooks/use-global-search'
export { useSearchHistory } from './hooks/use-search'

// Re-export for convenience
export type { SearchResultType } from './types'
