/**
 * Search Feature - Public API
 *
 * グローバル検索機能のエントリポイント。
 * 内部モジュールへの直接参照（deep import）は避け、ここからのみ import すること。
 */

// =============================================================================
// Types
// =============================================================================
export type {
  Command,
  SearchContext,
  SearchFilters,
  SearchHistoryItem,
  SearchOptions,
  SearchPreferences,
  SearchProvider,
  SearchResult,
  SearchResultType,
} from './types';

// =============================================================================
// Components
// =============================================================================
export { GlobalSearchModal } from './components/global-search-modal';
export { CompactSearchBar, SearchBar } from './components/search-bar';

// =============================================================================
// Hooks
// =============================================================================
export { GlobalSearchProvider, useGlobalSearch } from './hooks/use-global-search';
export { useSearchHistory } from './hooks/useSearch';

// =============================================================================
// Lib
// =============================================================================
export { commandRegistry, registerDefaultCommands } from './lib/command-registry';
