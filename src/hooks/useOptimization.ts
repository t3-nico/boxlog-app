/**
 * パフォーマンス最適化フック
 * メモ化、レンダリング最適化、大量データ処理の最適化
 */

import { 
  useMemo, 
  useCallback, 
  useRef, 
  useEffect, 
  useState,
  DependencyList,
  RefObject
} from 'react'

// === 型定義 ===

interface VirtualizationOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
}

interface VirtualizedItem {
  index: number
  style: React.CSSProperties
}

interface LazyLoadOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

interface ThrottleOptions {
  leading?: boolean
  trailing?: boolean
}

// === 高度なメモ化フック ===

/**
 * 依存配列が深い変更を検知するメモ化フック
 */
export function useDeepMemo<T>(
  fn: () => T,
  deps: DependencyList
): T {
  const ref = useRef<{ deps: DependencyList; value: T }>()

  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = {
      deps: [...deps],
      value: fn()
    }
  }

  return ref.current.value
}

/**
 * 値の変更を検知して処理を実行するフック
 */
export function useOnChange<T>(
  value: T,
  callback: (newValue: T, prevValue: T) => void,
  deps?: DependencyList
) {
  const prevValueRef = useRef<T>(value)

  useEffect(() => {
    if (!deepEqual(prevValueRef.current, value)) {
      callback(value, prevValueRef.current)
      prevValueRef.current = value
    }
  }, deps ? [value, ...deps] : [value])
}

// === レンダリング最適化 ===

/**
 * 条件付きレンダリング最適化フック
 */
export function useConditionalEffect(
  effect: () => void | (() => void),
  deps: DependencyList,
  condition: boolean
) {
  useEffect(() => {
    if (condition) {
      return effect()
    }
  }, [...deps, condition])
}

/**
 * レンダリング数を制限するフック
 */
export function useRenderLimit(maxRenders = 100) {
  const renderCountRef = useRef(0)
  const [isLimited, setIsLimited] = useState(false)

  useEffect(() => {
    renderCountRef.current += 1
    
    if (renderCountRef.current > maxRenders && !isLimited) {
      console.warn(`Component has rendered ${renderCountRef.current} times, which exceeds the limit of ${maxRenders}`)
      setIsLimited(true)
    }
  })

  return {
    renderCount: renderCountRef.current,
    isLimited,
    resetCount: () => {
      renderCountRef.current = 0
      setIsLimited(false)
    }
  }
}

// === 大量データ処理最適化 ===

/**
 * 仮想スクロール用フック
 */
export function useVirtualization<T>(
  items: T[],
  options: VirtualizationOptions
): {
  visibleItems: Array<VirtualizedItem & { data: T }>
  scrollElementProps: {
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void
    style: React.CSSProperties
  }
  totalHeight: number
} {
  const { itemHeight, containerHeight, overscan = 5 } = options
  const [scrollTop, setScrollTop] = useState(0)

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  const visibleItems = useMemo(() => {
    const itemCount = items.length
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    const result = []
    for (let i = startIndex; i <= endIndex; i++) {
      result.push({
        index: i,
        data: items[i],
        style: {
          position: 'absolute' as const,
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
        }
      })
    }

    return result
  }, [items, scrollTop, itemHeight, containerHeight, overscan])

  const totalHeight = items.length * itemHeight

  return {
    visibleItems,
    scrollElementProps: {
      onScroll: handleScroll,
      style: {
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }
    },
    totalHeight
  }
}

/**
 * チャンク処理フック（大量データを分割処理）
 */
export function useChunkedProcessing<T, R>(
  data: T[],
  processor: (chunk: T[]) => R[],
  chunkSize = 100,
  delay = 0
): {
  results: R[]
  isProcessing: boolean
  progress: number
} {
  const [results, setResults] = useState<R[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (data.length === 0) {
      setResults([])
      setProgress(0)
      return
    }

    setIsProcessing(true)
    setResults([])
    setProgress(0)

    const processChunks = async () => {
      const chunks = []
      for (let i = 0; i < data.length; i += chunkSize) {
        chunks.push(data.slice(i, i + chunkSize))
      }

      let allResults: R[] = []

      for (let i = 0; i < chunks.length; i++) {
        const chunkResults = processor(chunks[i])
        allResults = [...allResults, ...chunkResults]
        
        setResults([...allResults])
        setProgress(((i + 1) / chunks.length) * 100)

        if (delay > 0 && i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }

      setIsProcessing(false)
    }

    processChunks()
  }, [data, processor, chunkSize, delay])

  return { results, isProcessing, progress }
}

// === スロットリング・デバウンス ===

/**
 * 高度なスロットリングフック
 */
export function useAdvancedThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options: ThrottleOptions = {}
): T {
  const { leading = true, trailing = true } = options
  const lastRunRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastArgsRef = useRef<Parameters<T>>()

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now()
    lastArgsRef.current = args

    // Leading edge
    if (leading && now - lastRunRef.current >= delay) {
      lastRunRef.current = now
      return callback(...args)
    }

    // Trailing edge
    if (trailing) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        lastRunRef.current = Date.now()
        if (lastArgsRef.current) {
          callback(...lastArgsRef.current)
        }
      }, delay - (now - lastRunRef.current))
    }
  }, [callback, delay, leading, trailing]) as T
}

/**
 * キャンセル可能なデバウンスフック
 */
export function useCancellableDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): [T, () => void] {
  const timeoutRef = useRef<NodeJS.Timeout>()

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay]) as T

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [debouncedCallback, cancel]
}

// === 遅延読み込み ===

/**
 * 遅延読み込みフック
 */
export function useLazyLoad(
  ref: RefObject<Element>,
  options: LazyLoadOptions = {}
): boolean {
  const [isInView, setIsInView] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const { threshold = 0, rootMargin = '0px', triggerOnce = true } = options

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          if (triggerOnce) {
            setHasLoaded(true)
            observer.unobserve(element)
          }
        } else if (!triggerOnce) {
          setIsInView(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [ref, threshold, rootMargin, triggerOnce])

  return triggerOnce ? hasLoaded : isInView
}

// === ユーティリティ関数 ===

/**
 * 深い等価比較
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  
  if (a == null || b == null) return a === b
  
  if (typeof a !== typeof b) return false
  
  if (typeof a !== 'object') return a === b
  
  if (Array.isArray(a) !== Array.isArray(b)) return false
  
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false
    }
    return true
  }
  
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  
  if (keysA.length !== keysB.length) return false
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false
    if (!deepEqual(a[key], b[key])) return false
  }
  
  return true
}

/**
 * メモリ使用量を監視するフック
 */
export function useMemoryMonitor(enabled = process.env.NODE_ENV === 'development') {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedMB: number
    totalMB: number
    percentage: number
  }>({ usedMB: 0, totalMB: 0, percentage: 0 })

  useEffect(() => {
    if (!enabled || !('memory' in performance)) return

    const updateMemoryInfo = () => {
      const memory = (performance as any).memory
      if (memory) {
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576)
        const totalMB = Math.round(memory.totalJSHeapSize / 1048576)
        const percentage = Math.round((usedMB / totalMB) * 100)

        setMemoryInfo({ usedMB, totalMB, percentage })

        if (percentage > 90) {
          console.warn(`High memory usage: ${percentage}% (${usedMB}MB / ${totalMB}MB)`)
        }
      }
    }

    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 5000)

    return () => clearInterval(interval)
  }, [enabled])

  return memoryInfo
}

// === エクスポート ===

export default {
  useDeepMemo,
  useOnChange,
  useConditionalEffect,
  useRenderLimit,
  useVirtualization,
  useChunkedProcessing,
  useAdvancedThrottle,
  useCancellableDebounce,
  useLazyLoad,
  useMemoryMonitor
}