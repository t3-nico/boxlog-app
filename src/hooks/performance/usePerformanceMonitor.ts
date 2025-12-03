/**
 * レンダリング時間計測フック
 */

// パフォーマンス計測のため、render中にperformance.now()とrefへの書き込みが必要
import { useEffect, useRef } from 'react'

/**
 * コンポーネントのレンダリング時間を計測
 *
 * @param componentName - 計測対象のコンポーネント名
 * @param enabled - 計測を有効にするか
 * @returns レンダリング時間（ミリ秒）
 *
 * @example
 * const renderTime = usePerformanceMonitor('MyComponent', true)
 */
export function usePerformanceMonitor(componentName: string, enabled = false) {
  const renderStartTime = useRef<number | undefined>(undefined)

  // レンダリング開始時間を記録
  renderStartTime.current = performance.now()

  useEffect(() => {
    if (!enabled) return

    const renderEndTime = performance.now()
    const renderDuration = renderEndTime - (renderStartTime.current || renderEndTime)

    // 16ms (60fps) を超える場合は警告
    if (renderDuration > 16) {
      console.warn(`${componentName} render took ${renderDuration.toFixed(2)}ms (> 16ms for 60fps)`)
    } else if (renderDuration > 8) {
      console.info(`${componentName} render took ${renderDuration.toFixed(2)}ms`)
    } else if (renderDuration > 0) {
      console.debug(`${componentName} render took ${renderDuration.toFixed(2)}ms`)
    }
  })

  return renderStartTime.current ? performance.now() - renderStartTime.current : 0
}
