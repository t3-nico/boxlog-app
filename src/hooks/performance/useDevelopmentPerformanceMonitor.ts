/**
 * 開発環境専用パフォーマンスモニターフック
 */

import { useMemoryMonitor } from './useMemoryMonitor';
import { usePerformanceMonitor } from './usePerformanceMonitor';
import { usePerformanceStats } from './usePerformanceStats';
import { useRenderCount } from './useRenderCount';

/**
 * 開発環境でのみ動作するパフォーマンス計測ラッパー
 *
 * すべてのパフォーマンス計測フックを一括で有効化
 *
 * @param componentName - 計測対象のコンポーネント名
 * @returns パフォーマンス統計
 *
 * @example
 * function MyComponent() {
 *   const stats = useDevelopmentPerformanceMonitor('MyComponent')
 *   // 開発環境でのみコンソールに統計が出力される
 * }
 */
export function useDevelopmentPerformanceMonitor(componentName: string) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  usePerformanceMonitor(componentName, isDevelopment);
  useRenderCount(componentName, isDevelopment);
  useMemoryMonitor(componentName, isDevelopment);

  return usePerformanceStats(componentName, isDevelopment);
}
