/**
 * Performance Hooks - Backward Compatibility
 *
 * このファイルは後方互換性のための re-export です
 * 新規利用は @/hooks/performance を使用してください
 */

export {
  useDevelopmentPerformanceMonitor,
  useMemoryMonitor,
  usePerformanceMonitor,
  usePerformanceStats,
  useRenderCount,
} from './performance';

export type {
  PerformanceMemory,
  PerformanceStatsResult,
  PerformanceWithMemory,
} from './performance';
