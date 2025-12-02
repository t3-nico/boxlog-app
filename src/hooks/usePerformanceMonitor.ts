/**
 * Performance Hooks - Backward Compatibility
 *
 * このファイルは後方互換性のための re-export です
 * 新規利用は @/hooks/performance を使用してください
 */

export {
  usePerformanceMonitor,
  useRenderCount,
  useMemoryMonitor,
  usePerformanceStats,
  useDevelopmentPerformanceMonitor,
} from './performance'

export type { PerformanceMemory, PerformanceWithMemory, PerformanceStatsResult } from './performance'
