/**
 * メモリ使用量追跡フック
 */

import { useEffect } from 'react'

import type { PerformanceWithMemory } from './types'

/**
 * コンポーネントのメモリ使用量を追跡（Chrome限定）
 *
 * @param componentName - 追跡対象のコンポーネント名
 * @param enabled - 追跡を有効にするか
 */
export function useMemoryMonitor(componentName: string, enabled = false) {
  useEffect(() => {
    if (!enabled || !('memory' in performance)) return

    const perfWithMemory = performance as PerformanceWithMemory
    if (perfWithMemory.memory) {
      console.debug(`${componentName} memory usage:`, {
        used: `${(perfWithMemory.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        total: `${(perfWithMemory.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(perfWithMemory.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
      })
    }
  })
}
