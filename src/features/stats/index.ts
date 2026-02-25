/**
 * Stats Feature - Public API
 *
 * 統計・分析機能のエントリポイント。
 * 内部モジュールへの直接参照（deep import）は避け、ここからのみ import すること。
 */

// =============================================================================
// Components
// =============================================================================
export { StatsPageContent } from './components/StatsPageContent';
export { StatsView } from './components/StatsView';

// =============================================================================
// Stores
// =============================================================================
export { useStatsFilterStore } from './stores/useStatsFilterStore';
export type { StatsPeriod } from './stores/useStatsFilterStore';

// =============================================================================
// Types
// =============================================================================
export type {
  StatsHeroData,
  StatsTagBreakdown,
  StatsViewData,
  StatsViewProps,
} from './types/stats.types';

// =============================================================================
// Lib
// =============================================================================
export { prefetchStatsData } from './lib/prefetch';
