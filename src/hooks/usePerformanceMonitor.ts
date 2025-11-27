import { useEffect, useRef } from 'react'

// Chrome固有のperformance.memory API用の型定義
interface PerformanceMemory {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory
}

export const usePerformanceMonitor = (componentName: string, enabled = false) => {
  const renderStartTime = useRef<number | undefined>(undefined)

  // レンダリング開始時間を記録
  renderStartTime.current = performance.now()

  useEffect(() => {
    if (!enabled) return

    const renderEndTime = performance.now()
    const renderDuration = renderEndTime - (renderStartTime.current || renderEndTime)

    // 16ms (60fps) を超える場合は警告
    if (renderDuration > 16) {
      console.warn(`🐌 ${componentName} render took ${renderDuration.toFixed(2)}ms (> 16ms for 60fps)`)
    } else if (renderDuration > 8) {
      console.info(`⚠️ ${componentName} render took ${renderDuration.toFixed(2)}ms`)
    } else if (renderDuration > 0) {
      console.log(`✅ ${componentName} render took ${renderDuration.toFixed(2)}ms`)
    }
  })

  return renderStartTime.current ? performance.now() - renderStartTime.current : 0
}

// レンダリング回数を追跡するフック
export const useRenderCount = (componentName: string, enabled = false) => {
  const renderCount = useRef(0)
  renderCount.current++

  useEffect(() => {
    if (enabled) {
      console.log(`🔄 ${componentName} rendered ${renderCount.current} times`)
    }
  })

  return renderCount.current
}

// メモリ使用量を追跡するフック
export const useMemoryMonitor = (componentName: string, enabled = false) => {
  useEffect(() => {
    if (!enabled || !('memory' in performance)) return

    const perfWithMemory = performance as PerformanceWithMemory
    if (perfWithMemory.memory) {
      console.log(`💾 ${componentName} memory usage:`, {
        used: `${(perfWithMemory.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        total: `${(perfWithMemory.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(perfWithMemory.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
      })
    }
  })
}

// パフォーマンス統計を追跡するフック
export const usePerformanceStats = (componentName: string, enabled = false) => {
  const renderTimes = useRef<number[]>([])
  const renderStartTime = useRef<number | undefined>(undefined)

  renderStartTime.current = performance.now()

  useEffect(() => {
    if (!enabled) return

    const renderEndTime = performance.now()
    const renderDuration = renderEndTime - (renderStartTime.current || renderEndTime)

    // 最近の10回のレンダリング時間を保持
    renderTimes.current.push(renderDuration)
    if (renderTimes.current.length > 10) {
      renderTimes.current.shift()
    }

    // 統計情報を計算
    const times = renderTimes.current
    const average = times.reduce((sum, time) => sum + time, 0) / times.length
    const max = Math.max(...times)
    const min = Math.min(...times)

    // 5回に1回統計を出力
    if (times.length % 5 === 0) {
      console.group(`📊 ${componentName} Performance Stats`)
      console.log(`Average: ${average.toFixed(2)}ms`)
      console.log(`Max: ${max.toFixed(2)}ms`)
      console.log(`Min: ${min.toFixed(2)}ms`)
      console.log(`Recent renders: ${times.map((t) => t.toFixed(1)).join(', ')}ms`)
      console.groupEnd()
    }
  })

  return {
    currentRenderTime: renderStartTime.current ? performance.now() - renderStartTime.current : 0,
    averageRenderTime:
      renderTimes.current.length > 0
        ? renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length
        : 0,
    renderCount: renderTimes.current.length,
  }
}

// 開発環境でのみ動作するラッパー
export const useDevelopmentPerformanceMonitor = (componentName: string) => {
  const isDevelopment = process.env.NODE_ENV === 'development'

  usePerformanceMonitor(componentName, isDevelopment)
  useRenderCount(componentName, isDevelopment)
  useMemoryMonitor(componentName, isDevelopment)

  return usePerformanceStats(componentName, isDevelopment)
}
