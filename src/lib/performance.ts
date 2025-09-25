/**
 * パフォーマンス最適化ユーティリティ
 */

// Web Vitals 用の型定義
interface LayoutShift extends PerformanceEntry {
  hadRecentInput: boolean
  value: number
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number
}

// 遅延実行ユーティリティ
export const debounce = <T extends (..._args: never[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (..._args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(..._args), wait)
  }
}

// スロットリングユーティリティ
export const throttle = <T extends (..._args: never[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean

  return (..._args: Parameters<T>) => {
    if (!inThrottle) {
      func(..._args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Intersection Observer を使用した遅延読み込み
export const createLazyLoader = (
  callback: (_entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '100px',
    threshold: 0.1,
    ...options,
  }

  return new IntersectionObserver(callback, defaultOptions)
}

// メモリリークを防ぐためのクリーンアップ
export const createCleanupManager = () => {
  const cleanupFunctions: (() => void)[] = []

  return {
    add: (cleanup: () => void) => {
      cleanupFunctions.push(cleanup)
    },
    cleanup: () => {
      cleanupFunctions.forEach((fn) => fn())
      cleanupFunctions.length = 0
    },
  }
}

// バーチャルスクロールの計算
export const calculateVirtualScrollItems = (
  totalItems: number,
  containerHeight: number,
  itemHeight: number,
  scrollTop: number,
  overscan: number = 5
) => {
  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.min(visibleStart + Math.ceil(containerHeight / itemHeight), totalItems - 1)

  const start = Math.max(0, visibleStart - overscan)
  const end = Math.min(totalItems - 1, visibleEnd + overscan)

  return {
    start,
    end,
    visibleStart,
    visibleEnd,
    offsetY: start * itemHeight,
  }
}

// 重いタスクを分割して実行
export const scheduleWork = (tasks: (() => void)[], frameTimeLimit: number = 5): Promise<void> => {
  return new Promise((resolve) => {
    let taskIndex = 0

    const runTasks = () => {
      const start = performance.now()

      while (taskIndex < tasks.length && performance.now() - start < frameTimeLimit) {
        if (taskIndex < tasks.length) {
          tasks[taskIndex]()
        }
        taskIndex++
      }

      if (taskIndex < tasks.length) {
        requestIdleCallback(runTasks)
      } else {
        resolve()
      }
    }

    requestIdleCallback(runTasks)
  })
}

// Web Vitals監視
export const measureWebVitals = () => {
  if (typeof window === 'undefined') return

  // CLS (Cumulative Layout Shift)
  let _cls = 0
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as LayoutShift).hadRecentInput) {
        _cls += (entry as LayoutShift).value
      }
    }
  }).observe({ type: 'layout-shift', buffered: true })

  // LCP (Largest Contentful Paint)
  new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const lastEntry = entries[entries.length - 1]
    console.log('LCP:', lastEntry.startTime)
  }).observe({ type: 'largest-contentful-paint', buffered: true })

  // FID (First Input Delay)
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('FID:', (entry as PerformanceEventTiming).processingStart - entry.startTime)
    }
  }).observe({ type: 'first-input', buffered: true })
}
